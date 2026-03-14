/**
 * Exhibition Data Sync - Upserts collected exhibitions into Supabase
 *
 * Matches the ACTUAL deployed exhibitions table schema:
 * id, title_en, title_local, venue_name, venue_city, venue_country,
 * venue_address, start_date, end_date, status, description, artists,
 * admission_fee, source, source_url, tags, metadata, ...
 */

const { getSupabaseAdmin } = require('../../config/supabase');
const { log } = require('../../config/logger');

class ExhibitionSync {
  constructor() {
    this.stats = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      statusUpdated: 0
    };
  }

  /**
   * Sync exhibitions to Supabase
   * @param {Array} exhibitions - Normalized exhibition objects from collectors
   */
  async sync(exhibitions) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      log.error('[Sync] Supabase admin client not available');
      return this.stats;
    }

    this.stats = { inserted: 0, updated: 0, skipped: 0, errors: 0, statusUpdated: 0 };

    log.info(`[Sync] Starting sync of ${exhibitions.length} exhibitions...`);

    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < exhibitions.length; i += batchSize) {
      const batch = exhibitions.slice(i, i + batchSize);
      await this._syncBatch(supabase, batch);
      log.info(`[Sync] Progress: ${Math.min(i + batchSize, exhibitions.length)}/${exhibitions.length}`);
    }

    // Update status of expired exhibitions
    await this._updateExpiredStatuses(supabase);

    log.info(`[Sync] Complete: ${this.stats.inserted} inserted, ${this.stats.updated} updated, ${this.stats.skipped} skipped, ${this.stats.errors} errors, ${this.stats.statusUpdated} status updated`);

    return this.stats;
  }

  /**
   * Map collector output to actual DB schema
   */
  _toDbRow(exhibition) {
    return {
      title_en: exhibition.title || null,
      title_local: exhibition.title || null,
      venue_name: exhibition.venue || 'Unknown Venue',
      venue_address: exhibition.venue_address || null,
      venue_city: exhibition.metadata?.venue_city || this._guessCity(exhibition.venue, exhibition.venue_address),
      venue_country: exhibition.metadata?.venue_country || this._guessCountry(exhibition.source),
      start_date: exhibition.start_date || null,
      end_date: exhibition.end_date || null,
      status: exhibition.status || 'upcoming',
      description: exhibition.description || null,
      artists: exhibition.metadata?.artists || null,
      admission_fee: exhibition.admission_fee || null,
      source: exhibition.source || null,
      source_url: exhibition.source_url || null,
      image_url: exhibition.image_url || null,
      tags: exhibition.tags || [],
      content_type: 'exhibition',
      metadata: {
        ...(exhibition.metadata || {}),
        external_id: exhibition.external_id
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async _syncBatch(supabase, batch) {
    for (const exhibition of batch) {
      try {
        // Validate required fields
        if (!exhibition.title || !exhibition.venue) {
          this.stats.skipped++;
          continue;
        }

        const dbRow = this._toDbRow(exhibition);

        // Check if already exists: same source + same external_id in metadata
        const existing = await this._findExisting(supabase, exhibition);

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('exhibitions')
            .update(dbRow)
            .eq('id', existing.id);

          if (error) {
            log.error(`[Sync] Update failed for "${exhibition.title}": ${error.message}`);
            this.stats.errors++;
          } else {
            this.stats.updated++;
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('exhibitions')
            .insert(dbRow);

          if (error) {
            log.error(`[Sync] Insert failed for "${exhibition.title}": ${error.message}`);
            this.stats.errors++;
          } else {
            this.stats.inserted++;
          }
        }
      } catch (error) {
        log.error(`[Sync] Error processing "${exhibition.title}": ${error.message}`);
        this.stats.errors++;
      }
    }
  }

  /**
   * Find existing exhibition by source + external_id (stored in metadata)
   * or by title + venue + date match
   */
  async _findExisting(supabase, exhibition) {
    try {
      // First try: match by external_id in metadata
      if (exhibition.external_id) {
        const { data } = await supabase
          .from('exhibitions')
          .select('id')
          .eq('source', exhibition.source)
          .contains('metadata', { external_id: exhibition.external_id })
          .maybeSingle();

        if (data) return data;
      }

      // Second try: match by title + start_date
      if (exhibition.title && exhibition.start_date) {
        const { data } = await supabase
          .from('exhibitions')
          .select('id')
          .or(`title_en.eq.${exhibition.title},title_local.eq.${exhibition.title}`)
          .eq('start_date', exhibition.start_date)
          .maybeSingle();

        if (data) return data;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Auto-update status for exhibitions that have ended
   */
  async _updateExpiredStatuses(supabase) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: ended } = await supabase
        .from('exhibitions')
        .update({ status: 'ended', updated_at: new Date().toISOString() })
        .lt('end_date', today)
        .neq('status', 'ended')
        .not('end_date', 'is', null)
        .select('id');

      const { data: ongoing } = await supabase
        .from('exhibitions')
        .update({ status: 'ongoing', updated_at: new Date().toISOString() })
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('status', 'upcoming')
        .select('id');

      const endedCount = ended?.length || 0;
      const ongoingCount = ongoing?.length || 0;
      this.stats.statusUpdated = endedCount + ongoingCount;

      if (endedCount > 0 || ongoingCount > 0) {
        log.info(`[Sync] Status updated: ${endedCount} ended, ${ongoingCount} now ongoing`);
      }
    } catch (error) {
      log.error(`[Sync] Status update failed: ${error.message}`);
    }
  }

  _guessCity(venue, address) {
    const combined = `${venue || ''} ${address || ''}`;
    // Korean cities (standardized to English)
    if (combined.includes('서울') || combined.includes('Seoul')) return 'Seoul';
    if (combined.includes('과천') || combined.includes('Gwacheon')) return 'Gwacheon';
    if (combined.includes('청주') || combined.includes('Cheongju')) return 'Cheongju';
    if (combined.includes('부산') || combined.includes('Busan')) return 'Busan';
    if (combined.includes('대전') || combined.includes('Daejeon')) return 'Daejeon';
    if (combined.includes('대구') || combined.includes('Daegu')) return 'Daegu';
    if (combined.includes('광주') || combined.includes('Gwangju')) return 'Gwangju';
    if (combined.includes('인천') || combined.includes('Incheon')) return 'Incheon';
    if (combined.includes('제주') || combined.includes('Jeju')) return 'Jeju';
    if (combined.includes('수원') || combined.includes('Suwon')) return 'Suwon';
    if (combined.includes('성남') || combined.includes('Seongnam')) return 'Seongnam';
    if (combined.includes('고양') || combined.includes('Goyang')) return 'Goyang';
    if (combined.includes('춘천') || combined.includes('Chuncheon')) return 'Chuncheon';
    // International
    if (combined.includes('Chicago')) return 'Chicago';
    if (combined.includes('Cleveland')) return 'Cleveland';
    if (combined.includes('New York')) return 'New York';
    return null;
  }

  _guessCountry(source) {
    if (['mmca', 'korea_culture', 'seoul_opendata'].includes(source)) return 'KR';
    if (source === 'aic') return 'US';
    return null;
  }
}

module.exports = ExhibitionSync;

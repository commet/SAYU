/**
 * SAYU Art Counselor - Supabase integration layer
 * Provides mood-atlas artworks and lightweight journal/collection scaffolding.
 */

const { createClient } = require('@supabase/supabase-js');

const DEFAULT_DURATION_MINUTES = 6;
const MOOD_ATLAS_TABLE = 'mood_atlas_artworks';

class SupabaseArtService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('[SupabaseArtService] SUPABASE_URL is not configured.');
      this.supabase = null;
    } else {
      this.supabase = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
      );
    }
  }

  getClient() {
    if (!this.supabase) {
      throw new Error('Supabase client is not configured in SupabaseArtService.');
    }
    return this.supabase;
  }

  transformArtwork(record) {
    if (!record) return null;
    return {
      id: record.id,
      title: record.title,
      artist: record.artist,
      year: record.year,
      region: record.region,
      imageUrl: record.image_url || record.hero_image_url,
      thumbnailUrl: record.thumbnail_url || record.preview_image_url,
      width: record.width,
      height: record.height,
      emotions: record.emotions,
      story: record.story,
      funFact: record.fun_fact,
      tags: record.tags,
      matchScore: record.match_score,
      durationMinutes: record.duration_minutes || DEFAULT_DURATION_MINUTES,
    };
  }

  async fetchAllMoodAtlasArtworks() {
    const client = this.getClient();
    const { data, error } = await client
      .from(MOOD_ATLAS_TABLE)
      .select(
        'id, title, artist, year, region, image_url, thumbnail_url, width, height, emotions, story, fun_fact, tags, match_score, duration_minutes',
      )
      .order('title', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map((record) => this.transformArtwork(record)).filter(Boolean);
  }

  /**
   * Select daily artwork using deterministic hash of user + day.
   */
  async selectDailyArtwork(userId) {
    try {
      const artworks = await this.fetchAllMoodAtlasArtworks();
      if (!artworks.length) {
        return await this.getFallbackArtwork();
      }

      const userSeed = parseInt(userId.replace(/-/g, '').slice(0, 8), 16) || 1;
      const yearStart = new Date(new Date().getFullYear(), 0, 0).valueOf();
      const dayOfYear = Math.floor((Date.now() - yearStart) / 86400000);
      const index = (userSeed + dayOfYear) % artworks.length;
      const selected = artworks[index];

      return {
        artworkId: selected.id,
        artwork: selected,
      };
    } catch (error) {
      console.error('[SupabaseArtService] selectDailyArtwork failed:', error);
      return await this.getFallbackArtwork();
    }
  }

  /**
   * Generate lightweight presentation data for a given artwork.
   */
  async generatePresentation(artworkId, userId) {
    const client = this.getClient();
    const { data, error } = await client
      .from(MOOD_ATLAS_TABLE)
      .select(
        'id, title, artist, year, region, image_url, thumbnail_url, width, height, emotions, story, fun_fact, tags',
      )
      .eq('id', artworkId)
      .single();

    if (error || !data) {
      throw new Error(
        `Artwork ${artworkId} not found in ${MOOD_ATLAS_TABLE} for user ${userId}`,
      );
    }

    return {
      hero: {
        imageUrl: data.image_url || data.thumbnail_url,
        title: data.title,
        artist: data.artist,
        year: data.year,
        region: data.region,
      },
      content: {
        description: data.story || '이 작품에 대한 스토리가 준비 중입니다.',
        funFact: data.fun_fact,
        emotions: data.emotions,
        tags: data.tags,
      },
    };
  }

  async getAllArtworks() {
    const artworks = await this.fetchAllMoodAtlasArtworks();
    return {
      total: artworks.length,
      records: artworks,
    };
  }

  async getFallbackArtwork() {
    if (!this.supabase) {
      return {
        artworkId: 'fallback-water-lilies',
        artwork: {
          id: 'fallback-water-lilies',
          title: 'Water Lilies (Fallback)',
          artist: 'Claude Monet',
          summary: 'Supabase 연결 전용 임시 작품입니다.',
        },
      };
    }

    const client = this.getClient();
    const { data } = await client
      .from(MOOD_ATLAS_TABLE)
      .select(
        'id, title, artist, year, region, image_url, thumbnail_url, width, height, emotions, story, fun_fact, tags, match_score, duration_minutes',
      )
      .limit(1)
      .single();

    const artwork =
      this.transformArtwork(data) || {
        id: 'fallback-water-lilies',
        title: 'Water Lilies (Fallback)',
        artist: 'Claude Monet',
      };

    return {
      artworkId: artwork.id,
      artwork,
    };
  }

  async saveJournalEntry() {
    return { id: 'pending', message: 'Journal persistence coming soon.' };
  }

  async getUserCollection(userId, limit = 20) {
    try {
      const client = this.getClient();
      const { data, error, count } = await client
        .from(MOOD_ATLAS_TABLE)
        .select(
          'id, title, artist, year, region, image_url, thumbnail_url, emotions, story, fun_fact, tags, duration_minutes',
          { count: 'exact' },
        )
        .limit(limit);

      if (error) {
        throw error;
      }

      const entries = (data || []).map((item) => ({
        ...this.transformArtwork(item),
        source: 'mood_atlas',
        addedAt: new Date().toISOString(),
      }));

      return {
        entries,
        stats: {
          totalEntries: count ?? entries.length,
          userId,
          lastSync: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('[SupabaseArtService] getUserCollection failed:', error);
      return { entries: [], stats: { totalEntries: 0, userId, lastSync: null } };
    }
  }
}

module.exports = new SupabaseArtService();

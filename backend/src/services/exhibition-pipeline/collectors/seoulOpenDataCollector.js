/**
 * Seoul Open Data Collector (서울열린데이터광장)
 *
 * Source: data.seoul.go.kr - Cultural Events API
 * Updated daily by Seoul Metropolitan Government
 * License: CC-BY (commercial use allowed)
 */

const http = require('http');
const https = require('https');
const { log } = require('../../../config/logger');

class SeoulOpenDataCollector {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.SEOUL_OPENDATA_API_KEY || process.env.SEOUL_API_KEY;
    this.name = 'seoul_opendata';
  }

  /**
   * Collect cultural events from Seoul Open Data
   */
  async collect(options = {}) {
    if (!this.apiKey) {
      log.warn('[SeoulOpenData] No API key configured. Set SEOUL_OPENDATA_API_KEY env var.');
      return [];
    }

    log.info('[SeoulOpenData] Collecting Seoul cultural events...');

    const allExhibitions = [];

    try {
      // Fetch in batches of 1000 (API max)
      let start = 1;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const end = start + batchSize - 1;
        const url = `http://openapi.seoul.go.kr:8088/${this.apiKey}/json/culturalEventInfo/${start}/${end}/`;

        const data = await this._fetch(url);
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        const eventInfo = parsed?.culturalEventInfo;
        if (!eventInfo) {
          // Check for error
          const errorInfo = parsed?.RESULT;
          if (errorInfo) {
            log.warn(`[SeoulOpenData] API error: ${errorInfo.CODE} - ${errorInfo.MESSAGE}`);
          }
          hasMore = false;
          break;
        }

        const totalCount = eventInfo.list_total_count || 0;
        const rows = eventInfo.row || [];

        const exhibitions = rows
          .filter(row => this._isExhibition(row))
          .map(row => this._normalize(row));

        allExhibitions.push(...exhibitions);

        log.info(`[SeoulOpenData] Batch ${start}-${end}: ${exhibitions.length} exhibitions from ${rows.length} events`);

        start += batchSize;
        if (start > totalCount) hasMore = false;

        // Safety: max 10 batches (10000 events) - Seoul API has ~4000 events
        if (start > 10000) hasMore = false;

        await this._delay(500);
      }

      log.info(`[SeoulOpenData] Total collected: ${allExhibitions.length} exhibitions`);
      return allExhibitions;
    } catch (error) {
      log.error(`[SeoulOpenData] Collection failed: ${error.message}`);
      return [];
    }
  }

  _isExhibition(row) {
    const codename = (row.CODENAME || '').toLowerCase();
    const title = (row.TITLE || '').toLowerCase();
    const combined = `${codename} ${title}`;

    const exhibitionCodes = ['전시', '미술', '전시/미술'];
    const exhibitionKeywords = [
      '전시', '미술', '갤러리', '아트', '회화', '조각',
      '사진전', '특별전', '기획전', '설치', 'exhibition', 'art'
    ];

    // Check codename first (most reliable)
    if (exhibitionCodes.some(code => codename.includes(code))) return true;

    // Fall back to keyword matching
    return exhibitionKeywords.some(kw => combined.includes(kw));
  }

  _normalize(row) {
    const startDate = this._parseDate(row.STRTDATE);
    const endDate = this._parseDate(row.END_DATE);

    return {
      external_id: `seoul_${this._hash(row.TITLE + row.ORG_NAME + (row.STRTDATE || ''))}`,
      title: (row.TITLE || '').trim(),
      venue: (row.ORG_NAME || row.PLACE || 'Unknown Venue').trim(),
      venue_address: (row.ORG_LINK || '').trim(), // Seoul API sometimes puts address in ORG_LINK
      start_date: startDate,
      end_date: endDate,
      description: (row.PROGRAM || row.ETC_DESC || '').replace(/<[^>]*>/g, '').trim(),
      image_url: (row.MAIN_IMG || '').trim(),
      ticket_url: (row.ORG_LINK || row.HMPG_ADDR || '').trim(),
      admission_fee: this._parseAdmission(row),
      category: (row.CODENAME || '').trim(),
      source: this.name,
      source_url: row.HMPG_ADDR || '',
      tags: this._extractTags(row),
      status: this._calculateStatus(startDate, endDate),
      metadata: {
        guname: row.GUNAME || '', // district
        use_trgt: row.USE_TRGT || '', // target audience
        use_fee: row.USE_FEE || '',
        player: row.PLAYER || '', // artist/performer
        lat: row.LAT || '',
        lot: row.LOT || '', // longitude
        is_free: row.IS_FREE || '',
        collected_at: new Date().toISOString()
      }
    };
  }

  _parseDate(dateStr) {
    if (!dateStr) return null;
    // Seoul API format: "2026-01-15 00:00:00.0" or "2026-01-15"
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return null;
  }

  _parseAdmission(row) {
    if (row.IS_FREE === '무료') return '무료';
    if (row.USE_FEE) return row.USE_FEE.replace(/<[^>]*>/g, '').trim();
    return '';
  }

  _calculateStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'upcoming';
    const now = new Date().toISOString().split('T')[0];
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  _extractTags(row) {
    const tags = [];
    if (row.CODENAME) tags.push(row.CODENAME);
    if (row.GUNAME) tags.push(row.GUNAME);
    return tags;
  }

  _hash(str) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  _fetch(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, { timeout: 15000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
        });
      });
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timed out'));
      });
    });
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SeoulOpenDataCollector;

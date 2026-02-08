/**
 * MMCA (National Museum of Modern and Contemporary Art) Collector
 * 국립현대미술관 전시정보 API
 *
 * Endpoint: https://api.kcisa.kr/openapi/service/rest/moca/docMeta
 * Total: ~2,080 exhibitions
 * Rate limit: 10 req/sec, 1,000 req/day
 */

const https = require('https');
const { log } = require('../../../config/logger');

const BASE_URL = 'https://api.kcisa.kr/openapi/service/rest/moca/docMeta';

class MMCACollector {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.KCISA_API_KEY;
    this.name = 'mmca';
  }

  /**
   * Collect all MMCA exhibitions
   * @param {Object} options
   * @param {boolean} options.currentOnly - Only collect exhibitions with dates (skip undated entries)
   * @param {number} options.maxPages - Max pages to fetch (default: all)
   */
  async collect(options = {}) {
    if (!this.apiKey) {
      log.warn('[MMCA] No API key configured. Set KCISA_API_KEY env var.');
      return [];
    }

    log.info('[MMCA] Collecting exhibitions from National Museum of Modern and Contemporary Art...');

    const allExhibitions = [];
    let page = 1;
    const pageSize = 100;
    let totalCount = null;
    const maxPages = options.maxPages || 100; // Safety limit

    while (true) {
      try {
        const encodedKey = encodeURIComponent(this.apiKey);
        const url = `${BASE_URL}?serviceKey=${encodedKey}&numOfRows=${pageSize}&pageNo=${page}`;

        const data = await this._fetchWithRetry(url, 3);
        const items = this._parseXML(data);

        if (page === 1) {
          totalCount = this._extractTotalCount(data);
          log.info(`[MMCA] Total exhibitions available: ${totalCount}`);
        }

        if (items.length === 0) break;

        for (const item of items) {
          const normalized = this._normalize(item);
          if (!normalized) continue;

          // Skip entries without dates if currentOnly
          if (options.currentOnly && !normalized.start_date) continue;

          allExhibitions.push(normalized);
        }

        log.info(`[MMCA] Page ${page}: ${items.length} items, ${allExhibitions.length} valid exhibitions so far`);

        // Check if we've fetched all
        if (page * pageSize >= (totalCount || 0)) break;
        if (page >= maxPages) break;

        page++;
        await this._delay(500); // Respect rate limit (10 req/sec, but be conservative)
      } catch (error) {
        log.error(`[MMCA] Page ${page} failed: ${error.message}`);
        break;
      }
    }

    log.info(`[MMCA] Collection complete: ${allExhibitions.length} exhibitions from ${page} pages`);
    return allExhibitions;
  }

  _parseXML(xml) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const item = {};

      const fields = [
        'creator', 'collectionDb', 'publisher', 'title',
        'subjectCategory', 'rights', 'charge', 'venue',
        'eventPeriod', 'subDescription', 'person'
      ];

      for (const field of fields) {
        const fieldRegex = new RegExp(`<${field}>([\\s\\S]*?)</${field}>`, 'i');
        const fieldMatch = fieldRegex.exec(itemXml);
        if (fieldMatch) {
          item[field] = fieldMatch[1]
            .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
            .trim();
        }
      }

      if (item.title) {
        items.push(item);
      }
    }

    return items;
  }

  _extractTotalCount(xml) {
    const match = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
    return match ? parseInt(match[1], 10) : 0;
  }

  _normalize(item) {
    // Skip non-exhibition entries (e.g. announcements, reservations)
    if (!item.title) return null;
    const title = this._decodeHtml(item.title.trim());

    // Skip obviously non-exhibition entries
    const skipPatterns = ['사전예약', '온라인 예약', '휴관', '무료관람일', '할인'];
    if (skipPatterns.some(p => title.includes(p)) && !item.eventPeriod) return null;

    // Parse dates from eventPeriod: "2020-12-17 ~ 2021-04-11"
    const dates = this._parsePeriod(item.eventPeriod);

    // Determine venue location
    const venueInfo = this._parseVenue(item.venue, item.rights);

    return {
      external_id: `mmca_${item.publisher || this._hash(title)}`,
      title: title,
      venue: venueInfo.fullName,
      venue_address: venueInfo.address,
      start_date: dates.start,
      end_date: dates.end,
      description: this._decodeHtml((item.subDescription || '').replace(/<[^>]*>/g, '').trim()),
      image_url: '', // MMCA API doesn't provide image URLs directly
      ticket_url: 'https://www.mmca.go.kr',
      admission_fee: (item.charge || '').trim(),
      category: (item.subjectCategory || '').trim() || '전시',
      source: this.name,
      source_url: 'https://www.mmca.go.kr',
      tags: this._extractTags(item),
      status: this._calculateStatus(dates.start, dates.end),
      metadata: {
        publisher_id: item.publisher || '',
        artists: (item.person || '').trim(),
        organizer: (item.rights || '').trim(),
        venue_room: (item.venue || '').trim(),
        collection_db: item.collectionDb || '',
        collected_at: new Date().toISOString()
      }
    };
  }

  _parsePeriod(period) {
    if (!period) return { start: null, end: null };

    // Format: "2020-12-17 ~ 2021-04-11" or "2020.12.17~2021.04.11"
    const match = period.match(/(\d{4}[-./]\d{2}[-./]\d{2})\s*[~\-]\s*(\d{4}[-./]\d{2}[-./]\d{2})/);
    if (match) {
      return {
        start: match[1].replace(/[./]/g, '-'),
        end: match[2].replace(/[./]/g, '-')
      };
    }

    // Try single date
    const single = period.match(/(\d{4}[-./]\d{2}[-./]\d{2})/);
    if (single) {
      return { start: single[1].replace(/[./]/g, '-'), end: null };
    }

    return { start: null, end: null };
  }

  _parseVenue(venueRoom, rights) {
    // MMCA has 4 locations
    const locations = {
      '과천': { name: '국립현대미술관 과천', address: '경기도 과천시 광명로 313' },
      '서울': { name: '국립현대미술관 서울', address: '서울특별시 종로구 삼청로 30' },
      '덕수궁': { name: '국립현대미술관 덕수궁', address: '서울특별시 중구 세종대로 99' },
      '청주': { name: '국립현대미술관 청주', address: '충청북도 청주시 청원구 상당로 314' }
    };

    const combined = `${venueRoom || ''} ${rights || ''}`;

    for (const [key, info] of Object.entries(locations)) {
      if (combined.includes(key)) {
        return { fullName: info.name, address: info.address };
      }
    }

    // Default to Seoul
    return { fullName: '국립현대미술관', address: '서울특별시 종로구 삼청로 30' };
  }

  _calculateStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'upcoming';
    const now = new Date().toISOString().split('T')[0];
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  _extractTags(item) {
    const tags = ['국립현대미술관', 'MMCA'];
    if (item.subjectCategory) {
      if (item.subjectCategory.includes('국내')) tags.push('국내전시');
      if (item.subjectCategory.includes('국외') || item.subjectCategory.includes('해외')) tags.push('해외전시');
    }
    return tags;
  }

  _decodeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'");
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

  async _fetchWithRetry(url, maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this._fetch(url);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        const wait = attempt * 3000; // 3s, 6s, 9s
        log.warn(`[MMCA] Attempt ${attempt} failed (${error.message}), retrying in ${wait/1000}s...`);
        await this._delay(wait);
      }
    }
  }

  _fetch(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: 30000 }, (res) => {
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

module.exports = MMCACollector;

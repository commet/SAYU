/**
 * 한눈에보는문화정보조회서비스 Collector
 *
 * NEW API (since April 2025) replacing the discontinued culture.go.kr endpoint.
 * Endpoint: https://apis.data.go.kr/B553457/cultureinfo
 * Docs: https://www.data.go.kr/data/15138937/openapi.do
 */

const https = require('https');
const http = require('http');
const { log } = require('../../../config/logger');

const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo';

// Exhibition-related keywords for filtering
const EXHIBITION_KEYWORDS = [
  '전시', '미술', '갤러리', '아트', '회화', '조각', '설치',
  '사진전', '특별전', '기획전', '상설전', '초대전', '개인전',
  '그룹전', '단체전', 'exhibition', 'art', 'gallery',
  '뮤지엄', '박물관', '미술관', '아트센터'
];

// Category codes that are exhibition-related
const EXHIBITION_REALMS = ['A000', 'B000']; // A=전시, B=미술관/박물관

class KoreaCultureCollector {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.KOREA_CULTURE_API_KEY || process.env.CULTURE_API_KEY;
    this.name = 'korea_culture';
  }

  /**
   * Collect exhibitions for a date range
   */
  async collect(options = {}) {
    if (!this.apiKey) {
      log.warn('[KoreaCulture] No API key configured. Set KOREA_CULTURE_API_KEY env var.');
      return [];
    }

    const now = new Date();
    const from = options.from || this._formatDate(now);
    const to = options.to || this._formatDate(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)); // 90 days ahead

    log.info(`[KoreaCulture] Collecting exhibitions from ${from} to ${to}`);

    const allExhibitions = [];

    try {
      // Collect from period2 endpoint (date range search)
      const periodResults = await this._collectByPeriod(from, to);
      allExhibitions.push(...periodResults);

      // Collect from realm2 endpoint (category search) for art-specific
      const realmResults = await this._collectByRealm(from, to);
      allExhibitions.push(...realmResults);

      // Deduplicate by external_id
      const seen = new Set();
      const unique = allExhibitions.filter(ex => {
        if (seen.has(ex.external_id)) return false;
        seen.add(ex.external_id);
        return true;
      });

      log.info(`[KoreaCulture] Collected ${unique.length} unique exhibitions (${allExhibitions.length} total before dedup)`);
      return unique;
    } catch (error) {
      log.error(`[KoreaCulture] Collection failed: ${error.message}`);
      return [];
    }
  }

  async _collectByPeriod(from, to) {
    const results = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const params = new URLSearchParams({
          serviceKey: this.apiKey,
          PageNo: page.toString(),
          numOfrows: pageSize.toString(),
          from: from,
          to: to
        });

        const data = await this._fetch(`${BASE_URL}/period2?${params}`);
        const items = this._parseResponse(data);

        if (items.length === 0) {
          hasMore = false;
        } else {
          const exhibitions = items
            .filter(item => this._isExhibition(item))
            .map(item => this._normalize(item));
          results.push(...exhibitions);
          page++;

          // Safety: don't fetch more than 10 pages
          if (page > 10) hasMore = false;

          // Respect rate limits
          await this._delay(300);
        }
      } catch (error) {
        log.error(`[KoreaCulture] Period page ${page} failed: ${error.message}`);
        hasMore = false;
      }
    }

    return results;
  }

  async _collectByRealm(from, to) {
    const results = [];

    for (const realm of EXHIBITION_REALMS) {
      try {
        const params = new URLSearchParams({
          serviceKey: this.apiKey,
          PageNo: '1',
          numOfrows: '100',
          from: from,
          to: to,
          realm: realm
        });

        const data = await this._fetch(`${BASE_URL}/realm2?${params}`);
        const items = this._parseResponse(data);
        const exhibitions = items.map(item => this._normalize(item));
        results.push(...exhibitions);

        await this._delay(300);
      } catch (error) {
        log.error(`[KoreaCulture] Realm ${realm} failed: ${error.message}`);
      }
    }

    return results;
  }

  _parseResponse(data) {
    try {
      // Try JSON first
      if (typeof data === 'string') {
        // Check if XML
        if (data.trim().startsWith('<?xml') || data.trim().startsWith('<')) {
          return this._parseXML(data);
        }
        data = JSON.parse(data);
      }

      // Navigate the response structure
      const response = data?.response;
      if (!response) return [];

      const header = response.header || response.msgHeader;
      const resultCode = header?.resultCode || header?.result_code;

      if (resultCode && resultCode !== '00' && resultCode !== '0000') {
        log.warn(`[KoreaCulture] API returned code: ${resultCode} - ${header?.resultMsg || ''}`);
        return [];
      }

      const body = response.body || response.msgBody;
      if (!body) return [];

      const items = body.items?.item || body.perforList || [];
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      log.error(`[KoreaCulture] Parse error: ${error.message}`);
      return [];
    }
  }

  _parseXML(xml) {
    // Simple XML parser for the known structure
    // Extract items between <item> tags
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const item = {};

      // Extract common fields
      const fields = [
        'seq', 'title', 'startDate', 'endDate', 'place', 'realmName',
        'area', 'subTitle', 'price', 'contents1', 'contents2',
        'url', 'phone', 'imgUrl', 'gpsX', 'gpsY', 'placeAddr',
        'placeUrl', 'thumbnail'
      ];

      for (const field of fields) {
        const fieldRegex = new RegExp(`<${field}>(.*?)</${field}>`, 'is');
        const fieldMatch = fieldRegex.exec(itemXml);
        if (fieldMatch) {
          item[field] = fieldMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        }
      }

      if (item.title) {
        items.push(item);
      }
    }

    return items;
  }

  _isExhibition(item) {
    const title = (item.title || '').toLowerCase();
    const realm = (item.realmName || '').toLowerCase();
    const contents = (item.contents1 || item.contents2 || '').toLowerCase();
    const combined = `${title} ${realm} ${contents}`;

    return EXHIBITION_KEYWORDS.some(keyword => combined.includes(keyword.toLowerCase()));
  }

  _normalize(item) {
    const startDate = this._parseDate(item.startDate);
    const endDate = this._parseDate(item.endDate);

    return {
      external_id: `kculture_${item.seq || this._hash(item.title + item.place)}`,
      title: this._cleanText(item.title),
      venue: this._cleanText(item.place) || 'Unknown Venue',
      venue_address: this._cleanText(item.placeAddr) || '',
      start_date: startDate,
      end_date: endDate,
      description: this._cleanText(item.contents1 || item.contents2 || item.subTitle || ''),
      image_url: item.imgUrl || item.thumbnail || '',
      ticket_url: item.url || item.placeUrl || '',
      admission_fee: this._cleanText(item.price) || '',
      category: this._cleanText(item.realmName) || '',
      source: this.name,
      source_url: item.url || '',
      tags: this._extractTags(item),
      status: this._calculateStatus(startDate, endDate),
      metadata: {
        area: item.area || '',
        gps_x: item.gpsX || '',
        gps_y: item.gpsY || '',
        phone: item.phone || '',
        collected_at: new Date().toISOString()
      }
    };
  }

  _cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // strip HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  }

  _parseDate(dateStr) {
    if (!dateStr) return null;
    // Handle formats: YYYYMMDD, YYYY-MM-DD, YYYY.MM.DD
    const cleaned = dateStr.replace(/[.\-\/]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    // Try direct parse
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return null;
  }

  _formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  _calculateStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'upcoming';
    const now = new Date().toISOString().split('T')[0];
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  _extractTags(item) {
    const tags = [];
    if (item.realmName) tags.push(item.realmName);
    if (item.area) tags.push(item.area);
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

module.exports = KoreaCultureCollector;

/**
 * Art Institute of Chicago Exhibition Collector
 *
 * The ONLY major museum API that provides exhibition data with dates.
 * No API key required. Rate limit: 60 req/min.
 * Docs: https://api.artic.edu/docs/
 */

const https = require('https');
const { log } = require('../../../config/logger');

const BASE_URL = 'https://api.artic.edu/api/v1';

class AICExhibitionCollector {
  constructor() {
    this.name = 'aic';
  }

  /**
   * Collect current and upcoming exhibitions from AIC
   * Uses the search endpoint with date range filtering
   */
  async collect(options = {}) {
    log.info('[AIC] Collecting exhibitions from Art Institute of Chicago...');

    try {
      const results = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      const today = new Date().toISOString().split('T')[0];
      const fields = 'id,title,short_description,description,image_url,aic_start_at,aic_end_at,gallery_title,web_url,artwork_ids,artist_ids,status';

      while (hasMore) {
        // Search for exhibitions ending after today (current + upcoming)
        const url = `${BASE_URL}/exhibitions/search?fields=${fields}&limit=${limit}&page=${page}&query[range][aic_end_at][gte]=${today}`;

        const data = await this._fetch(url);
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        const items = parsed?.data || [];
        if (items.length === 0) {
          hasMore = false;
        } else {
          const exhibitions = items
            .filter(item => item.title && item.aic_end_at)
            .map(item => this._normalize(item, parsed?.config));
          results.push(...exhibitions);
          page++;

          if (page > 5) hasMore = false;
          await this._delay(1000);
        }
      }

      log.info(`[AIC] Collected ${results.length} exhibitions`);
      return results;
    } catch (error) {
      log.error(`[AIC] Collection failed: ${error.message}`);
      return [];
    }
  }

  _normalize(item, config) {
    const startDate = this._parseDate(item.aic_start_at);
    const endDate = this._parseDate(item.aic_end_at);
    const imageUrl = item.image_url
      ? `${config?.iiif_url || 'https://www.artic.edu/iiif/2'}/${item.image_url}/full/843,/0/default.jpg`
      : '';

    return {
      external_id: `aic_${item.id}`,
      title: (item.title || '').trim(),
      venue: item.gallery_title || 'Art Institute of Chicago',
      venue_address: '111 S Michigan Ave, Chicago, IL 60603, USA',
      start_date: startDate,
      end_date: endDate,
      description: this._cleanDescription(item.short_description || item.description || ''),
      image_url: imageUrl,
      ticket_url: item.web_url || 'https://www.artic.edu/visit',
      admission_fee: '', // AIC has various pricing
      category: 'Visual Arts',
      source: this.name,
      source_url: item.web_url || '',
      tags: ['Art Institute of Chicago', 'Chicago', 'International'],
      status: this._calculateStatus(startDate, endDate),
      metadata: {
        artwork_count: (item.artwork_ids || []).length,
        artist_count: (item.artist_ids || []).length,
        aic_status: item.status || '',
        collected_at: new Date().toISOString()
      }
    };
  }

  _cleanDescription(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000); // Limit description length
  }

  _parseDate(dateStr) {
    if (!dateStr) return null;
    // AIC format: "2026-01-15T00:00:00-06:00" or "2026-01-15"
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return null;
  }

  _calculateStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'upcoming';
    const now = new Date().toISOString().split('T')[0];
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  _fetch(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'SAYU Art Platform (sayu.my)',
          'AIC-User-Agent': 'SAYU Art Platform (sayu.my)',
          'Accept': 'application/json'
        }
      }, (res) => {
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

module.exports = AICExhibitionCollector;

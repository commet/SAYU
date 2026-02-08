/**
 * Exhibition Pipeline - Automated Cron
 *
 * Pattern: Raw API → source_* tables → exhibitions mapping
 * Uses the same logic as standalone sync scripts (proven to work)
 *
 * Schedule:
 * - Korean sources (MMCA + Culture Events): Daily at 4:00 AM KST
 * - International (AIC): Weekly Monday at 3:00 AM KST
 * - Exhibitions mapping + status update: Daily at 5:00 AM KST (after collection)
 */

const cron = require('node-cron');
const https = require('https');
const { getSupabaseAdmin } = require('../../config/supabase');
const { log } = require('../../config/logger');

// ===== Shared helpers =====

function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000, ...options }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => res.statusCode < 300 ? resolve(data) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchRetry(url, retries = 3, options = {}) {
  for (let i = 1; i <= retries; i++) {
    try { return await httpGet(url, options); }
    catch (e) {
      if (i === retries) throw e;
      await delay(i * 3000);
    }
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function decodeHtml(t) {
  return (t || '').replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

function calcStatus(start, end) {
  if (!start || !end) return 'upcoming';
  const today = new Date().toISOString().split('T')[0];
  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'ongoing';
}

function isKorean(text) { return /[가-힣]/.test(text || ''); }

async function fetchAll(supabase, table, filters = []) {
  const pageSize = 1000;
  let all = [], from = 0;
  while (true) {
    let q = supabase.from(table).select('*').range(from, from + pageSize - 1);
    for (const f of filters) q = f(q);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

// ===== MMCA Raw Collector =====

async function collectMMCA(supabase) {
  const API_KEY = process.env.KCISA_API_KEY;
  if (!API_KEY) { log.warn('[Cron:MMCA] No KCISA_API_KEY'); return 0; }

  log.info('[Cron:MMCA] Collecting...');
  const BASE = 'https://api.kcisa.kr/openapi/service/rest/moca/docMeta';
  let page = 1, total = 0, allItems = [];

  while (true) {
    try {
      const url = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=100&pageNo=${page}`;
      const xml = await fetchRetry(url);
      const items = parseMMCAXML(xml);
      if (page === 1) { total = extractTotal(xml); log.info(`[Cron:MMCA] Total: ${total}`); }
      if (items.length === 0) break;
      allItems.push(...items);
      if (page * 100 >= total) break;
      page++;
      await delay(500);
    } catch (e) { log.error(`[Cron:MMCA] Page ${page} failed: ${e.message}`); break; }
  }

  // Dedup
  const seen = new Map();
  for (const item of allItems) {
    const key = `${item.title}_${item.eventPeriod || ''}_${item.venue || ''}`;
    item._pid = `mmca_${hash(key)}`;
    if (!seen.has(item._pid)) seen.set(item._pid, item);
  }
  const unique = [...seen.values()];

  // Upsert
  let upserted = 0;
  for (let i = 0; i < unique.length; i += 30) {
    const rows = unique.slice(i, i + 30).map(item => {
      const dates = parsePeriod(item.eventPeriod);
      return {
        publisher_id: item._pid, title: item.title, title_decoded: decodeHtml(item.title),
        category: item.subjectCategory || null, organizer: item.rights || null,
        charge: item.charge || null, venue_room: item.venue || null,
        event_period: item.eventPeriod || null, start_date: dates.start, end_date: dates.end,
        description: decodeHtml(item.subDescription || ''), artists: item.person || null,
        creator: item.creator || null, collection_db: item.collectionDb || null,
        raw_data: item, collected_at: new Date().toISOString()
      };
    });
    const { data, error } = await supabase.from('source_mmca').upsert(rows, { onConflict: 'publisher_id', ignoreDuplicates: false }).select('id');
    if (!error) upserted += (data?.length || 0);
  }

  log.info(`[Cron:MMCA] Done: ${upserted} upserted from ${unique.length} unique`);
  return upserted;
}

function parseMMCAXML(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const item = {};
    for (const f of ['creator','collectionDb','publisher','title','subjectCategory','rights','charge','venue','eventPeriod','subDescription','person']) {
      const fm = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(m[1]);
      if (fm) item[f] = fm[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    if (item.title) items.push(item);
  }
  return items;
}

function extractTotal(xml) { const m = /<totalCount>(\d+)<\/totalCount>/i.exec(xml); return m ? parseInt(m[1]) : 0; }

function parsePeriod(p) {
  if (!p) return { start: null, end: null };
  const m = p.match(/(\d{4})[-./]?(\d{2})[-./]?(\d{2})\s*[~\-]\s*(\d{4})[-./]?(\d{2})[-./]?(\d{2})/);
  if (m) return { start: `${m[1]}-${m[2]}-${m[3]}`, end: `${m[4]}-${m[5]}-${m[6]}` };
  return { start: null, end: null };
}

// ===== Culture Events Raw Collector =====

async function collectCultureEvents(supabase) {
  const API_KEY = process.env.KCISA_CULTURE_API_KEY;
  if (!API_KEY) { log.warn('[Cron:Culture] No KCISA_CULTURE_API_KEY'); return 0; }

  log.info('[Cron:Culture] Collecting...');
  const BASE = 'https://api.kcisa.kr/openapi/CNV_060/request';
  const KEYWORDS = ['전시','미술','갤러리','아트','기획전','특별전','사진','회화','조각','설치','현대','작품','작가','초대','개인전','그룹','소장','컬렉션','뮤지엄','박물관'];
  const allItems = new Map();

  for (const keyword of KEYWORDS) {
    let page = 1, keyTotal = 0;
    while (true) {
      try {
        const url = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=100&pageNo=${page}&dtype=${encodeURIComponent('전시')}&title=${encodeURIComponent(keyword)}`;
        const xml = await fetchRetry(url);
        const { items, total } = parseCultureXML(xml);
        if (page === 1) keyTotal = total;
        if (items.length === 0) break;
        for (const item of items) {
          const key = `${item.title}_${item.eventPeriod || ''}`;
          if (!allItems.has(key)) allItems.set(key, item);
        }
        if (page * 100 >= keyTotal) break;
        page++;
        await delay(500);
      } catch (e) { log.warn(`[Cron:Culture] "${keyword}" p${page} failed: ${e.message}`); break; }
    }
    await delay(300);
  }

  const items = [...allItems.values()];
  log.info(`[Cron:Culture] Collected ${items.length} unique`);

  let upserted = 0;
  for (let i = 0; i < items.length; i += 30) {
    const rows = items.slice(i, i + 30).map(item => {
      const dates = parsePeriod(item.eventPeriod);
      return {
        ext_id: `culture_${hash(item.title + (item.eventPeriod || '') + (item.eventSite || ''))}`,
        title: item.title, title_clean: decodeHtml(item.title), dtype: item.type || '전시',
        period: item.period || null, event_period: item.eventPeriod || null,
        start_date: dates.start, end_date: dates.end, event_site: item.eventSite || null,
        charge: item.charge || null, contact_point: item.contactPoint || null,
        url: item.url || null, image_url: item.imageObject || null,
        description: decodeHtml(item.description), view_count: parseInt(item.viewCount) || 0,
        raw_data: item, collected_at: new Date().toISOString()
      };
    });
    const { data, error } = await supabase.from('source_culture_events').upsert(rows, { onConflict: 'ext_id', ignoreDuplicates: false }).select('id');
    if (!error) upserted += (data?.length || 0);
  }

  log.info(`[Cron:Culture] Done: ${upserted} upserted`);
  return upserted;
}

function parseCultureXML(xml) {
  const items = [];
  const totalMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const item = {};
    for (const f of ['title','type','period','eventPeriod','eventSite','charge','contactPoint','url','imageObject','description','viewCount']) {
      const fm = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(m[1]);
      if (fm) item[f] = fm[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    if (item.title) items.push(item);
  }
  return { items, total };
}

// ===== AIC Raw Collector =====

async function collectAIC(supabase) {
  log.info('[Cron:AIC] Collecting...');
  const BASE = 'https://api.artic.edu/api/v1';
  const fields = 'id,title,short_description,description,image_url,aic_start_at,aic_end_at,gallery_title,web_url,artwork_ids,artist_ids,status';
  let page = 1, allItems = [];

  while (page <= 10) {
    try {
      const url = `${BASE}/exhibitions/search?fields=${fields}&limit=100&page=${page}&query[range][aic_end_at][gte]=2020-01-01`;
      const raw = await fetchRetry(url, 3, { headers: { 'User-Agent': 'SAYU Art Platform', 'Accept': 'application/json' } });
      const data = JSON.parse(raw);
      const items = data?.data || [];
      if (items.length === 0) break;
      allItems.push(...items);
      if (page * 100 >= (data.pagination?.total || 0)) break;
      page++;
      await delay(1000);
    } catch (e) { log.error(`[Cron:AIC] Page ${page} error: ${e.message}`); break; }
  }

  log.info(`[Cron:AIC] Collected ${allItems.length} items`);

  let upserted = 0;
  const iiif = 'https://www.artic.edu/iiif/2';
  for (let i = 0; i < allItems.length; i += 30) {
    const rows = allItems.slice(i, i + 30).filter(it => it.id && it.title).map(item => {
      const startMatch = (item.aic_start_at || '').match(/(\d{4}-\d{2}-\d{2})/);
      const endMatch = (item.aic_end_at || '').match(/(\d{4}-\d{2}-\d{2})/);
      return {
        aic_id: item.id, title: item.title,
        short_description: decodeHtml(item.short_description),
        description: decodeHtml(item.description)?.slice(0, 5000),
        image_url: item.image_url || null,
        image_full_url: item.image_url ? `${iiif}/${item.image_url}/full/843,/0/default.jpg` : null,
        aic_start_at: item.aic_start_at || null, aic_end_at: item.aic_end_at || null,
        start_date: startMatch ? startMatch[1] : null, end_date: endMatch ? endMatch[1] : null,
        gallery_title: item.gallery_title || null, web_url: item.web_url || null,
        aic_status: item.status || null,
        artwork_count: (item.artwork_ids || []).length, artist_count: (item.artist_ids || []).length,
        raw_data: item, collected_at: new Date().toISOString()
      };
    });
    const { data, error } = await supabase.from('source_aic').upsert(rows, { onConflict: 'aic_id', ignoreDuplicates: false }).select('id');
    if (!error) upserted += (data?.length || 0);
  }

  log.info(`[Cron:AIC] Done: ${upserted} upserted`);
  return upserted;
}

// ===== Exhibitions Mapping =====

const MMCA_VENUES = {
  '과천': { name: '국립현대미술관 과천', city: '과천', address: '경기도 과천시 광명로 313' },
  '서울': { name: '국립현대미술관 서울', city: '서울', address: '서울특별시 종로구 삼청로 30' },
  '덕수궁': { name: '국립현대미술관 덕수궁', city: '서울', address: '서울특별시 중구 세종대로 99' },
  '청주': { name: '국립현대미술관 청주', city: '청주', address: '충청북도 청주시 청원구 상당로 314' }
};

async function mapToExhibitions(supabase) {
  log.info('[Cron:Map] Mapping source tables → exhibitions...');
  let totalInserted = 0, totalUpdated = 0;

  // Map MMCA
  const mmcaItems = await fetchAll(supabase, 'source_mmca', [q => q.not('start_date','is',null), q => q.not('end_date','is',null)]);
  let ins = 0, upd = 0;
  for (const item of mmcaItems) {
    let venue = { name: '국립현대미술관', city: '서울', address: '서울특별시 종로구 삼청로 30' };
    const combined = `${item.venue_room || ''} ${item.organizer || ''}`;
    for (const [key, v] of Object.entries(MMCA_VENUES)) { if (combined.includes(key)) { venue = v; break; } }
    const row = {
      title_en: isKorean(item.title_decoded) ? null : item.title_decoded,
      title_local: item.title_decoded, venue_name: venue.name, venue_city: venue.city,
      venue_country: 'KR', venue_address: venue.address,
      start_date: item.start_date, end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      artists: item.artists ? item.artists.split(/[,，、]/).map(s => s.trim()).filter(Boolean) : null,
      admission_fee: item.charge || null, source: 'mmca', source_url: 'https://www.mmca.go.kr',
      tags: ['국립현대미술관', 'MMCA', item.category || ''].filter(Boolean),
      metadata: { source_table: 'source_mmca', source_id: item.id, publisher_id: item.publisher_id, venue_room: item.venue_room, organizer: item.organizer },
      collected_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    const { data: existing } = await supabase.from('exhibitions').select('id').eq('source','mmca').contains('metadata',{publisher_id:item.publisher_id}).maybeSingle();
    if (existing) { const { error } = await supabase.from('exhibitions').update(row).eq('id',existing.id); if (!error) upd++; }
    else { const { error } = await supabase.from('exhibitions').insert(row); if (!error) ins++; }
  }
  log.info(`[Cron:Map] MMCA: ${ins} inserted, ${upd} updated`);
  totalInserted += ins; totalUpdated += upd;

  // Map AIC
  const aicItems = await fetchAll(supabase, 'source_aic');
  ins = 0; upd = 0;
  for (const item of aicItems) {
    const row = {
      title_en: item.title, title_local: item.title,
      venue_name: item.gallery_title || 'Art Institute of Chicago',
      venue_city: 'Chicago', venue_country: 'US',
      venue_address: '111 S Michigan Ave, Chicago, IL 60603, USA',
      start_date: item.start_date, end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.short_description || item.description || null,
      source: 'aic', source_url: item.web_url || 'https://www.artic.edu',
      website_url: item.web_url || null,
      tags: ['Art Institute of Chicago', 'Chicago', 'International'],
      metadata: { source_table: 'source_aic', source_id: item.id, aic_id: item.aic_id, image_url: item.image_full_url, artwork_count: item.artwork_count, artist_count: item.artist_count, aic_status: item.aic_status },
      collected_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    const { data: existing } = await supabase.from('exhibitions').select('id').eq('source','aic').contains('metadata',{aic_id:item.aic_id}).maybeSingle();
    if (existing) { const { error } = await supabase.from('exhibitions').update(row).eq('id',existing.id); if (!error) upd++; }
    else { const { error } = await supabase.from('exhibitions').insert(row); if (!error) ins++; }
  }
  log.info(`[Cron:Map] AIC: ${ins} inserted, ${upd} updated`);
  totalInserted += ins; totalUpdated += upd;

  // Map Culture Events
  const cultureItems = await fetchAll(supabase, 'source_culture_events', [q => q.not('start_date','is',null), q => q.not('end_date','is',null)]);
  ins = 0; upd = 0;
  for (const item of cultureItems) {
    const row = {
      title_en: isKorean(item.title_clean) ? null : item.title_clean,
      title_local: item.title_clean, venue_name: item.event_site || null,
      venue_country: 'KR', start_date: item.start_date, end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null, admission_fee: item.charge || null,
      source: 'culture_events', source_url: item.url || null, website_url: item.url || null,
      tags: ['문화체육관광부', item.dtype || '전시'].filter(Boolean),
      metadata: { source_table: 'source_culture_events', source_id: item.id, ext_id: item.ext_id, contact_point: item.contact_point, view_count: item.view_count, image_url: item.image_url },
      collected_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    const { data: existing } = await supabase.from('exhibitions').select('id').eq('source','culture_events').contains('metadata',{ext_id:item.ext_id}).maybeSingle();
    if (existing) { const { error } = await supabase.from('exhibitions').update(row).eq('id',existing.id); if (!error) upd++; }
    else { const { error } = await supabase.from('exhibitions').insert(row); if (!error) ins++; }
  }
  log.info(`[Cron:Map] Culture Events: ${ins} inserted, ${upd} updated`);
  totalInserted += ins; totalUpdated += upd;

  // Update statuses
  const today = new Date().toISOString().split('T')[0];
  const { data: ended } = await supabase.from('exhibitions').update({ status: 'ended', updated_at: new Date().toISOString() }).lt('end_date', today).neq('status', 'ended').not('end_date', 'is', null).select('id');
  const { data: ongoing } = await supabase.from('exhibitions').update({ status: 'ongoing', updated_at: new Date().toISOString() }).lte('start_date', today).gte('end_date', today).eq('status', 'upcoming').select('id');
  log.info(`[Cron:Map] Status: ${ended?.length || 0} ended, ${ongoing?.length || 0} ongoing`);

  log.info(`[Cron:Map] Done: ${totalInserted} inserted, ${totalUpdated} updated`);
  return { inserted: totalInserted, updated: totalUpdated };
}

// ===== Pipeline Class =====

class ExhibitionPipeline {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastResults = null;
    this.cronJobs = [];
  }

  async runFull() {
    if (this.isRunning) return { status: 'skipped', reason: 'already_running' };
    this.isRunning = true;
    const start = Date.now();
    const results = { timestamp: new Date().toISOString(), sources: {}, mapping: null, errors: [] };

    try {
      const supabase = getSupabaseAdmin();
      results.sources.mmca = await collectMMCA(supabase);
      results.sources.culture_events = await collectCultureEvents(supabase);
      results.sources.aic = await collectAIC(supabase);
      results.mapping = await mapToExhibitions(supabase);
    } catch (e) {
      log.error(`[Pipeline] Fatal: ${e.message}`);
      results.errors.push(e.message);
    } finally {
      this.isRunning = false;
      results.duration = Date.now() - start;
      this.lastRun = results.timestamp;
      this.lastResults = results;
      log.info(`[Pipeline] Full run complete in ${results.duration}ms`);
    }
    return results;
  }

  async runSource(name) {
    if (this.isRunning) return { status: 'skipped', reason: 'pipeline_busy' };
    this.isRunning = true;
    try {
      const supabase = getSupabaseAdmin();
      const collectors = { mmca: collectMMCA, culture_events: collectCultureEvents, aic: collectAIC };
      if (!collectors[name]) return { status: 'error', error: `Unknown source: ${name}` };
      const count = await collectors[name](supabase);
      const mapping = await mapToExhibitions(supabase);
      return { source: name, collected: count, mapping };
    } finally { this.isRunning = false; }
  }

  startCron() {
    // Korean sources: Daily 4AM KST = 19:00 UTC prev day
    const koreanJob = cron.schedule('0 19 * * *', async () => {
      log.info('[Cron] Korean sources starting...');
      try {
        const supabase = getSupabaseAdmin();
        await collectMMCA(supabase);
        await collectCultureEvents(supabase);
        await mapToExhibitions(supabase);
        log.info('[Cron] Korean sources done');
      } catch (e) { log.error(`[Cron] Korean error: ${e.message}`); }
    }, { timezone: 'UTC' });

    // International: Weekly Monday 3AM KST = 18:00 UTC Sunday
    const intlJob = cron.schedule('0 18 * * 0', async () => {
      log.info('[Cron] International sources starting...');
      try {
        const supabase = getSupabaseAdmin();
        await collectAIC(supabase);
        await mapToExhibitions(supabase);
        log.info('[Cron] International sources done');
      } catch (e) { log.error(`[Cron] International error: ${e.message}`); }
    }, { timezone: 'UTC' });

    // Status update: Every 6 hours
    const statusJob = cron.schedule('0 */6 * * *', async () => {
      log.info('[Cron] Status update starting...');
      try {
        const supabase = getSupabaseAdmin();
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('exhibitions').update({ status: 'ended', updated_at: new Date().toISOString() }).lt('end_date', today).neq('status', 'ended').not('end_date', 'is', null);
        await supabase.from('exhibitions').update({ status: 'ongoing', updated_at: new Date().toISOString() }).lte('start_date', today).gte('end_date', today).eq('status', 'upcoming');
        log.info('[Cron] Status update done');
      } catch (e) { log.error(`[Cron] Status error: ${e.message}`); }
    }, { timezone: 'UTC' });

    this.cronJobs = [koreanJob, intlJob, statusJob];
    log.info('[Pipeline] Cron started: Korean daily 4AM KST, International weekly Mon 3AM KST, Status every 6h');
  }

  stopCron() {
    this.cronJobs.forEach(j => j.stop());
    this.cronJobs = [];
    log.info('[Pipeline] Cron stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastResults: this.lastResults,
      cronActive: this.cronJobs.length > 0,
      sources: ['mmca', 'culture_events', 'aic']
    };
  }
}

let instance = null;
function getExhibitionPipeline() {
  if (!instance) instance = new ExhibitionPipeline();
  return instance;
}

module.exports = { ExhibitionPipeline, getExhibitionPipeline };

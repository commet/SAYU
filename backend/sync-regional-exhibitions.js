/**
 * 지역/공공 전시정보 수집 (data.go.kr / culture.go.kr)
 * -> source_regional_exhibitions table
 *
 * APIs:
 * 1. culture.go.kr 공연전시정보조회서비스 (publicperformancedisplays/period)
 *    - 문화체육관광부 전국 공연/전시 통합 DB (biggest dataset)
 *    - Params: from, to, cPage, rows, keyword
 *
 * 2. KCISA 한눈에보는문화정보 (cultureinfo/categoryEvent)
 *    - api.kcisa.kr 카테고리별 문화행사
 *    - Params: serviceKey, numOfRows, pageNo, keyword
 *
 * Usage: node sync-regional-exhibitions.js
 */
require('dotenv').config();

const http = require('http');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_KEY = process.env.KCISA_EXHIBITION_API_KEY;

// ── HTTP helpers ──

function fetchUrl(url) {
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.get(url, { timeout: 60000 }, (res) => {
      // Follow redirects (301/302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`HTTP ${res.statusCode}: ${d.slice(0, 200)}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchRetry(url, retries = 4) {
  for (let i = 1; i <= retries; i++) {
    try { return await fetchUrl(url); }
    catch (e) {
      if (i === retries) throw e;
      console.log(`  retry ${i}/${retries} (${e.message})...`);
      await new Promise(r => setTimeout(r, i * 5000));
    }
  }
}

// ── XML parsing ──

function decodeHtml(t) {
  return (t || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'")
    .replace(/&middot;/g, '\u00b7').replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '\u201c').replace(/&rdquo;/g, '\u201d')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ').trim();
}

function extractTag(xml, tagName) {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
  const m = re.exec(xml);
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

function parseDateStr(s) {
  if (!s) return null;
  // "20250301" -> "2025-03-01"
  const m8 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m8) return `${m8[1]}-${m8[2]}-${m8[3]}`;
  // "2025-03-01" already formatted
  const mDash = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (mDash) return mDash[1];
  // "2025.03.01"
  const mDot = s.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (mDot) return `${mDot[1]}-${mDot[2]}-${mDot[3]}`;
  return null;
}

function parsePeriodString(p) {
  if (!p) return { start: null, end: null };
  // "20250101 ~ 20250301" or "2025-01-01 ~ 2025-03-01" or "2025.01.01~2025.03.01"
  const m = p.match(/(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})\s*[~\-]\s*(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})/);
  if (m) return { start: `${m[1]}-${m[2]}-${m[3]}`, end: `${m[4]}-${m[5]}-${m[6]}` };
  const single = p.match(/(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})/);
  if (single) return { start: `${single[1]}-${single[2]}-${single[3]}`, end: null };
  return { start: null, end: null };
}


// ── API 1: culture.go.kr 공연전시정보조회서비스 ──

function parseCultureItems(xml) {
  const items = [];
  const totalMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  // Also check msgBody > totalCount pattern
  if (!total) {
    const altMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  }

  const itemRegex = /<perforList>([\s\S]*?)<\/perforList>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const item = {};
    // culture.go.kr field names
    const fields = [
      'seq', 'title', 'startDate', 'endDate', 'place', 'realmName',
      'area', 'subTitle', 'price', 'contents1', 'contents2',
      'url', 'phone', 'imgUrl', 'gpsX', 'gpsY', 'placeUrl',
      'placeAddr', 'placeSeq'
    ];
    for (const f of fields) {
      const val = extractTag(block, f);
      if (val) item[f] = val;
    }
    if (item.title || item.seq) items.push(item);
  }

  // Alternative: <item> wrapper (some endpoints)
  if (items.length === 0) {
    const itemRegex2 = /<item>([\s\S]*?)<\/item>/gi;
    while ((match = itemRegex2.exec(xml)) !== null) {
      const block = match[1];
      const item = {};
      const fields = [
        'seq', 'title', 'startDate', 'endDate', 'place', 'realmName',
        'area', 'subTitle', 'price', 'contents1', 'contents2',
        'url', 'phone', 'imgUrl', 'gpsX', 'gpsY', 'placeUrl',
        'placeAddr', 'placeSeq'
      ];
      for (const f of fields) {
        const val = extractTag(block, f);
        if (val) item[f] = val;
      }
      if (item.title || item.seq) items.push(item);
    }
  }

  return { items, total };
}

async function collectCultureGo() {
  console.log('\n--- API 1: culture.go.kr 공연전시정보조회서비스 ---');
  const BASE = 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/period';

  // Date range: 2024-01-01 to today + 1 year
  const fromDate = '20240101';
  const now = new Date();
  const futureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const toDate = `${futureDate.getFullYear()}${String(futureDate.getMonth()+1).padStart(2,'0')}${String(futureDate.getDate()).padStart(2,'0')}`;

  console.log(`  Date range: ${fromDate} ~ ${toDate}`);

  const allItems = new Map();
  let page = 1;
  let total = 0;
  const PAGE_SIZE = 100;

  while (true) {
    try {
      const url = `${BASE}?serviceKey=${API_KEY}&from=${fromDate}&to=${toDate}&cPage=${page}&rows=${PAGE_SIZE}&keyword=${encodeURIComponent('전시')}`;
      console.log(`  Fetching page ${page}...`);
      const xml = await fetchRetry(url);

      // Check for error response
      const errCode = extractTag(xml, 'returnCode') || extractTag(xml, 'resultCode');
      const errMsg = extractTag(xml, 'returnMessage') || extractTag(xml, 'resultMsg');
      if (errCode && errCode !== '0000' && errCode !== '00') {
        console.log(`  API error: [${errCode}] ${errMsg}`);
        // If auth error, try without keyword
        if (errCode === '30' || errMsg?.includes('SERVICE_KEY')) {
          console.log('  Service key issue - stopping this API');
          break;
        }
      }

      const { items, total: t } = parseCultureItems(xml);

      if (page === 1) {
        total = t;
        console.log(`  Total available: ${total}`);
        if (total === 0 && items.length === 0) {
          // Try without keyword filter to get all including exhibitions
          console.log('  No results with keyword filter, trying without keyword...');
          const url2 = `${BASE}?serviceKey=${API_KEY}&from=${fromDate}&to=${toDate}&cPage=1&rows=${PAGE_SIZE}`;
          const xml2 = await fetchRetry(url2);
          const result2 = parseCultureItems(xml2);
          if (result2.total > 0) {
            console.log(`  Without keyword: ${result2.total} total items found`);
            // Re-run the whole loop without keyword
            return collectCultureGoNoKeyword(BASE, fromDate, toDate, PAGE_SIZE);
          }
        }
      }

      if (items.length === 0) break;

      for (const item of items) {
        const key = item.seq || `${item.title}_${item.startDate || ''}`;
        if (!allItems.has(key)) allItems.set(key, item);
      }

      console.log(`  Page ${page}: +${items.length} (unique: ${allItems.size}/${total})`);

      if (allItems.size >= total || page * PAGE_SIZE >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`  Page ${page} failed: ${e.message}`);
      if (page === 1) break; // First page fail = likely auth issue
      if (page * PAGE_SIZE >= total && total > 0) break;
      page++;
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`  culture.go.kr collected: ${allItems.size} unique items`);
  return [...allItems.values()].map(item => ({
    api_source: 'culture_go_kr',
    ext_id: item.seq || hash(item.title + (item.startDate || '') + (item.place || '')),
    title: decodeHtml(item.title),
    period: item.startDate && item.endDate ? `${item.startDate} ~ ${item.endDate}` : null,
    start_date: parseDateStr(item.startDate),
    end_date: parseDateStr(item.endDate),
    venue: decodeHtml(item.place),
    venue_address: decodeHtml(item.placeAddr),
    area: decodeHtml(item.area),
    charge: decodeHtml(item.price),
    image_url: item.imgUrl || null,
    url: item.url || item.placeUrl || null,
    description: decodeHtml(item.contents1 || item.contents2),
    raw_data: item
  }));
}

async function collectCultureGoNoKeyword(BASE, fromDate, toDate, PAGE_SIZE) {
  const allItems = new Map();
  let page = 1;
  let total = 0;

  while (true) {
    try {
      const url = `${BASE}?serviceKey=${API_KEY}&from=${fromDate}&to=${toDate}&cPage=${page}&rows=${PAGE_SIZE}`;
      const xml = await fetchRetry(url);
      const { items, total: t } = parseCultureItems(xml);

      if (page === 1) {
        total = t;
        console.log(`  Total (no keyword): ${total}`);
      }

      if (items.length === 0) break;

      // Filter for exhibition-related items by realmName
      for (const item of items) {
        const realm = (item.realmName || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const isExhibition = realm.includes('전시') || realm.includes('미술') ||
          title.includes('전시') || title.includes('갤러리') || title.includes('아트') ||
          title.includes('미술') || title.includes('기획전') || title.includes('특별전') ||
          title.includes('초대전') || title.includes('사진전') || title.includes('개인전') ||
          title.includes('회화') || title.includes('설치') || title.includes('조각');

        if (isExhibition) {
          const key = item.seq || `${item.title}_${item.startDate || ''}`;
          if (!allItems.has(key)) allItems.set(key, item);
        }
      }

      console.log(`  Page ${page}: +${items.length} raw, ${allItems.size} exhibitions so far`);

      if (page * PAGE_SIZE >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`  Page ${page} failed: ${e.message}`);
      if (page * PAGE_SIZE >= total && total > 0) break;
      page++;
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`  culture.go.kr (filtered) collected: ${allItems.size} exhibitions`);
  return [...allItems.values()].map(item => ({
    api_source: 'culture_go_kr',
    ext_id: item.seq || hash(item.title + (item.startDate || '') + (item.place || '')),
    title: decodeHtml(item.title),
    period: item.startDate && item.endDate ? `${item.startDate} ~ ${item.endDate}` : null,
    start_date: parseDateStr(item.startDate),
    end_date: parseDateStr(item.endDate),
    venue: decodeHtml(item.place),
    venue_address: decodeHtml(item.placeAddr),
    area: decodeHtml(item.area),
    charge: decodeHtml(item.price),
    image_url: item.imgUrl || null,
    url: item.url || item.placeUrl || null,
    description: decodeHtml(item.contents1 || item.contents2),
    raw_data: item
  }));
}


// ── API 2: KCISA 한눈에보는문화정보 ──

function parseKcisaItems(xml) {
  const items = [];
  const totalMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const item = {};
    const fields = [
      'TITLE', 'CNTC_INSTT_NM', 'COLLECTED_DATE', 'ISSUED_DATE',
      'DESCRIPTION', 'IMAGE_OBJECT', 'LOCAL_ID', 'URL', 'VIEW_COUNT',
      'SUB_DESCRIPTION', 'SPATIAL_COVERAGE', 'EVENT_SITE', 'GENRE',
      'DURATION', 'PERIOD', 'EVENT_PERIOD', 'CHARGE', 'CONTACT_POINT',
      'AUDIENCE', 'AUTHOR', 'CONTRIBUTOR'
    ];
    for (const f of fields) {
      const val = extractTag(block, f);
      if (val) item[f] = val;
    }
    if (item.TITLE) items.push(item);
  }
  return { items, total };
}

async function collectKcisaCultureInfo() {
  console.log('\n--- API 2: KCISA 한눈에보는문화정보 ---');
  const BASE = 'https://api.kcisa.kr/openapi/service/rest/meta13/getCategoryEvent1';

  const allItems = new Map();
  let page = 1;
  let total = 0;
  const PAGE_SIZE = 100;

  while (true) {
    try {
      const url = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=${PAGE_SIZE}&pageNo=${page}`;
      console.log(`  Fetching page ${page}...`);
      const xml = await fetchRetry(url);

      const errCode = extractTag(xml, 'returnCode') || extractTag(xml, 'resultCode');
      const errMsg = extractTag(xml, 'returnMessage') || extractTag(xml, 'resultMsg');
      if (errCode && errCode !== '0000' && errCode !== '00') {
        console.log(`  API error: [${errCode}] ${errMsg}`);
        break;
      }

      const { items, total: t } = parseKcisaItems(xml);

      if (page === 1) {
        total = t;
        console.log(`  Total available: ${total}`);
      }

      if (items.length === 0) break;

      for (const item of items) {
        const key = item.LOCAL_ID || `${item.TITLE}_${item.PERIOD || ''}`;
        if (!allItems.has(key)) allItems.set(key, item);
      }

      console.log(`  Page ${page}: +${items.length} (unique: ${allItems.size}/${total})`);

      if (page * PAGE_SIZE >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`  Page ${page} failed: ${e.message}`);
      if (page === 1) break;
      if (page * PAGE_SIZE >= total && total > 0) break;
      page++;
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`  KCISA cultureinfo collected: ${allItems.size} unique items`);
  return [...allItems.values()].map(item => {
    const dates = parsePeriodString(item.PERIOD || item.EVENT_PERIOD);
    return {
      api_source: 'kcisa_cultureinfo',
      ext_id: item.LOCAL_ID || hash(item.TITLE + (item.PERIOD || '') + (item.EVENT_SITE || '')),
      title: decodeHtml(item.TITLE),
      period: item.PERIOD || item.EVENT_PERIOD || null,
      start_date: dates.start,
      end_date: dates.end,
      venue: decodeHtml(item.EVENT_SITE),
      venue_address: decodeHtml(item.SPATIAL_COVERAGE),
      area: null, // Not provided in this API
      charge: decodeHtml(item.CHARGE),
      image_url: item.IMAGE_OBJECT || null,
      url: item.URL || null,
      description: decodeHtml(item.DESCRIPTION || item.SUB_DESCRIPTION),
      raw_data: item
    };
  });
}


// ── Main ──

async function run() {
  console.log('=== 지역/공공 전시정보 수집 (data.go.kr / culture.go.kr) ===');
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log(`  API Key: ${API_KEY ? API_KEY.slice(0, 10) + '...' : 'NOT SET'}\n`);

  if (!API_KEY) {
    console.log('ERROR: KCISA_EXHIBITION_API_KEY not set in .env');
    console.log('Get your key from https://www.data.go.kr or https://api.kcisa.kr');
    return;
  }

  // 1. Check table
  console.log('1. Checking source_regional_exhibitions table...');
  const { error: testErr } = await supabase.from('source_regional_exhibitions').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL:\n');
    console.log(`CREATE TABLE source_regional_exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  ext_id TEXT NOT NULL,
  title TEXT NOT NULL,
  period TEXT,
  start_date DATE,
  end_date DATE,
  venue TEXT,
  venue_address TEXT,
  area TEXT,
  charge TEXT,
  image_url TEXT,
  url TEXT,
  description TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_source, ext_id)
);
CREATE INDEX idx_src_regional_dates ON source_regional_exhibitions(start_date, end_date);
CREATE INDEX idx_src_regional_area ON source_regional_exhibitions(area);
CREATE INDEX idx_src_regional_source ON source_regional_exhibitions(api_source);`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect from all APIs
  console.log('\n2. Collecting from APIs...');
  let allRows = [];

  // API 1: culture.go.kr
  try {
    const cultureItems = await collectCultureGo();
    console.log(`  => culture.go.kr: ${cultureItems.length} items`);
    allRows.push(...cultureItems);
  } catch (e) {
    console.log(`  => culture.go.kr FAILED: ${e.message}`);
    console.log('  Continuing to next API...');
  }

  // API 2: KCISA cultureinfo
  try {
    const kcisaItems = await collectKcisaCultureInfo();
    console.log(`  => KCISA cultureinfo: ${kcisaItems.length} items`);
    allRows.push(...kcisaItems);
  } catch (e) {
    console.log(`  => KCISA cultureinfo FAILED: ${e.message}`);
    console.log('  Continuing...');
  }

  // Dedup across APIs by title + start_date
  const seen = new Map();
  const deduped = [];
  for (const row of allRows) {
    const dedupKey = `${row.title}_${row.start_date || ''}_${row.venue || ''}`;
    if (!seen.has(dedupKey)) {
      seen.set(dedupKey, true);
      deduped.push(row);
    }
  }
  console.log(`\n  Total collected: ${allRows.length}, After cross-API dedup: ${deduped.length}`);

  if (deduped.length === 0) {
    console.log('\n  No items collected. Check API key and network.');
    return;
  }

  // 3. Sync to Supabase
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < deduped.length; i += batchSize) {
    const batch = deduped.slice(i, i + batchSize);
    const rows = batch.map(item => ({
      api_source: item.api_source,
      ext_id: item.ext_id,
      title: item.title,
      period: item.period,
      start_date: item.start_date,
      end_date: item.end_date,
      venue: item.venue,
      venue_address: item.venue_address,
      area: item.area,
      charge: item.charge,
      image_url: item.image_url,
      url: item.url,
      description: item.description?.slice(0, 5000) || null,
      raw_data: item.raw_data,
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_regional_exhibitions')
      .upsert(rows, { onConflict: 'api_source,ext_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 4. Verify
  const { count } = await supabase.from('source_regional_exhibitions').select('id', { count: 'exact', head: true });

  const { data: bySrc } = await supabase.from('source_regional_exhibitions').select('api_source');
  const srcCounts = {};
  (bySrc || []).forEach(r => { srcCounts[r.api_source || '?'] = (srcCounts[r.api_source || '?'] || 0) + 1; });

  const { data: byArea } = await supabase.from('source_regional_exhibitions').select('area').not('area', 'is', null);
  const areaCounts = {};
  (byArea || []).forEach(r => { areaCounts[r.area || '?'] = (areaCounts[r.area || '?'] || 0) + 1; });

  const { data: sample } = await supabase
    .from('source_regional_exhibitions')
    .select('title, venue, area, start_date, end_date, image_url, api_source')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(10);

  console.log(`\n4. Verification: ${count} total records`);
  console.log('  By source:', JSON.stringify(srcCounts, null, 2));
  if (Object.keys(areaCounts).length > 0) {
    console.log('  By area:', JSON.stringify(areaCounts, null, 2));
  }
  if (sample && sample.length > 0) {
    console.log('\n  Recent exhibitions:');
    sample.forEach(e => console.log(`  - [${e.api_source}] ${e.title} @ ${e.venue || '?'} (${e.area || '?'}) ${e.start_date}~${e.end_date} img:${e.image_url ? 'Y' : 'N'}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

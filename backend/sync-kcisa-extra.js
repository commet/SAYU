/**
 * KCISA Extra APIs - Additional exhibition/event data collection
 *
 * Targets these KCISA endpoints (all use same XML response format):
 *   API_CCA_149 - Seoul Arts Center exhibitions
 *   API_CCA_167 - Asia Culture Center Gwangju events
 *   API_CNV_066 - Museum/Gallery events nationwide (with coordinates)
 *   API_CCA_144 - Integrated Performance Info (27 institutions)
 *
 * All results go into source_kcisa_extra table with api_source discriminator.
 *
 * Usage: node sync-kcisa-extra.js
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Try multiple KCISA keys - they may share the same key
const API_KEYS = [
  process.env.KCISA_EXHIBITION_API_KEY,
  process.env.KCISA_API_KEY,
  process.env.KCISA_CULTURE_API_KEY,
].filter(Boolean);

const ENDPOINTS = [
  {
    id: 'API_CCA_149',
    name: 'Seoul Arts Center exhibitions',
    url: 'https://api.kcisa.kr/openapi/API_CCA_149/request',
    needsKeyword: false,
    useDtype: false,
  },
  {
    id: 'API_CCA_167',
    name: 'Asia Culture Center Gwangju events',
    url: 'https://api.kcisa.kr/openapi/API_CCA_167/request',
    needsKeyword: false,
    useDtype: false,
  },
  {
    id: 'API_CNV_066',
    name: 'Museum/Gallery events nationwide (with coords)',
    url: 'https://api.kcisa.kr/openapi/API_CNV_066/request',
    needsKeyword: false,
    useDtype: true, // supports dtype=전시
  },
  {
    id: 'API_CCA_144',
    name: 'Integrated Performance Info (27 institutions)',
    url: 'https://api.kcisa.kr/openapi/API_CCA_144/request',
    needsKeyword: false,
    useDtype: false,
  },
];

const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const DELAY_MS = 500;

// ---------- HTTP ----------

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 60000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchRetry(url, retries = 4) {
  for (let i = 1; i <= retries; i++) {
    try { return await httpGet(url); }
    catch (e) {
      if (i === retries) throw e;
      console.log(`    retry ${i}/${retries} (${e.message})...`);
      await new Promise(r => setTimeout(r, i * 5000));
    }
  }
}

// ---------- XML parsing ----------

// All KCISA APIs share the same XML envelope; field names vary between
// UPPER_CASE (CCA-style) and camelCase (CNV-style). We extract both.
const ALL_FIELDS = [
  // CCA-style (uppercase)
  'TITLE', 'CNTC_INSTT_NM', 'COLLECTED_DATE', 'ISSUED_DATE',
  'DESCRIPTION', 'IMAGE_OBJECT', 'LOCAL_ID', 'URL', 'VIEW_COUNT',
  'SUB_DESCRIPTION', 'SPATIAL_COVERAGE', 'EVENT_SITE', 'GENRE',
  'DURATION', 'NUMBER_PAGES', 'TABLE_OF_CONTENTS', 'AUTHOR',
  'CONTACT_POINT', 'ACTOR', 'CONTRIBUTOR', 'AUDIENCE', 'CHARGE',
  'PERIOD', 'EVENT_PERIOD',
  // CNV-style (camelCase)
  'title', 'type', 'period', 'eventPeriod', 'eventSite', 'charge',
  'contactPoint', 'url', 'imageObject', 'description', 'viewCount',
  'subDescription', 'spatialCoverage', 'localId',
  // coordinate fields (CNV_066)
  'gpsX', 'gpsY', 'GPS_X', 'GPS_Y',
];

function parseXML(xml) {
  const items = [];
  const totalMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = {};
    for (const f of ALL_FIELDS) {
      const m = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(match[1]);
      if (m) item[f] = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    // At least need a title
    if (item.TITLE || item.title) items.push(item);
  }
  return { items, total };
}

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

function parsePeriod(p) {
  if (!p) return { start: null, end: null };
  // "20260107 ~ 20260214" or "2026-01-07 ~ 2026-02-14" or "2026.01.07~2026.02.14"
  const m = p.match(/(\d{4})[-.\/]?(\d{2})[-.\/]?(\d{2})\s*[~\-]\s*(\d{4})[-.\/]?(\d{2})[-.\/]?(\d{2})/);
  if (m) return { start: `${m[1]}-${m[2]}-${m[3]}`, end: `${m[4]}-${m[5]}-${m[6]}` };
  const single = p.match(/(\d{4})[-.\/]?(\d{2})[-.\/]?(\d{2})/);
  if (single) return { start: `${single[1]}-${single[2]}-${single[3]}`, end: null };
  return { start: null, end: null };
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

// Normalize an item (which may have UPPER or camelCase fields) into a row
function itemToRow(item, apiSource) {
  const title = item.TITLE || item.title || '';
  const localId = item.LOCAL_ID || item.localId || '';
  const period = item.PERIOD || item.period || item.EVENT_PERIOD || item.eventPeriod || '';
  const eventSite = item.EVENT_SITE || item.eventSite || '';
  const spatialCoverage = item.SPATIAL_COVERAGE || item.spatialCoverage || '';
  const charge = item.CHARGE || item.charge || '';
  const description = item.DESCRIPTION || item.description || item.SUB_DESCRIPTION || item.subDescription || '';
  const imageUrl = item.IMAGE_OBJECT || item.imageObject || '';
  const url = item.URL || item.url || '';
  const contact = item.CONTACT_POINT || item.contactPoint || '';
  const institution = item.CNTC_INSTT_NM || '';

  // Generate a stable ext_id from localId or hash of title+period+venue
  const extId = localId || `${apiSource}_${hash(title + period + eventSite)}`;

  const dates = parsePeriod(period);

  // Coordinates (CNV_066 may provide these)
  const lat = parseFloat(item.gpsY || item.GPS_Y) || null;
  const lng = parseFloat(item.gpsX || item.GPS_X) || null;

  return {
    api_source: apiSource,
    ext_id: extId,
    title: title,
    title_clean: decodeHtml(title),
    period: period || null,
    start_date: dates.start,
    end_date: dates.end,
    venue: eventSite || institution || null,
    venue_address: spatialCoverage || null,
    charge: charge || null,
    description: decodeHtml(description),
    image_url: imageUrl || null,
    url: url || null,
    contact: contact || null,
    latitude: lat,
    longitude: lng,
    raw_data: item,
    collected_at: new Date().toISOString(),
  };
}

// ---------- Per-endpoint collection ----------

async function collectEndpoint(endpoint, apiKey) {
  console.log(`\n  --- ${endpoint.id}: ${endpoint.name} ---`);
  const allItems = [];
  let page = 1;
  let total = 0;

  while (page <= MAX_PAGES) {
    try {
      let reqUrl = `${endpoint.url}?serviceKey=${encodeURIComponent(apiKey)}&numOfRows=${PAGE_SIZE}&pageNo=${page}`;
      if (endpoint.useDtype) {
        reqUrl += `&dtype=${encodeURIComponent('\uc804\uc2dc')}`; // 전시
      }

      const xml = await fetchRetry(reqUrl);

      // Check for error responses
      if (xml.includes('<errMsg>') || xml.includes('<returnAuthMsg>')) {
        const errMsg = (/<errMsg>([^<]*)<\/errMsg>/i.exec(xml) || [])[1] || '';
        const authMsg = (/<returnAuthMsg>([^<]*)<\/returnAuthMsg>/i.exec(xml) || [])[1] || '';
        console.log(`    API error: ${errMsg || authMsg}`);
        return { items: [], error: errMsg || authMsg };
      }

      const { items, total: t } = parseXML(xml);

      if (page === 1) {
        total = t;
        console.log(`    Total available: ${total}`);
        if (total === 0 && items.length === 0) {
          console.log('    No data from this endpoint');
          return { items: [], error: null };
        }
      }

      if (items.length === 0) break;
      allItems.push(...items);
      console.log(`    Page ${page}: +${items.length} (collected: ${allItems.length}/${total})`);

      if (page * PAGE_SIZE >= total) break;
      page++;
      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (e) {
      console.log(`    Page ${page} failed: ${e.message}`);
      if (page * PAGE_SIZE >= total && total > 0) break;
      page++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`    Collected: ${allItems.length} items`);
  return { items: allItems, error: null };
}

// ---------- Main ----------

async function run() {
  console.log('=== KCISA Extra APIs - Exhibition Data Collection ===');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`API keys available: ${API_KEYS.length}\n`);

  if (API_KEYS.length === 0) {
    console.log('ERROR: No KCISA API keys found in env. Need at least one of:');
    console.log('  KCISA_EXHIBITION_API_KEY, KCISA_API_KEY, KCISA_CULTURE_API_KEY');
    process.exit(1);
  }

  // 1. Check/create table
  console.log('1. Checking source_kcisa_extra table...');
  const { error: testErr } = await supabase.from('source_kcisa_extra').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_kcisa_extra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  ext_id TEXT NOT NULL,
  title TEXT NOT NULL,
  title_clean TEXT,
  period TEXT,
  start_date DATE,
  end_date DATE,
  venue TEXT,
  venue_address TEXT,
  charge TEXT,
  description TEXT,
  image_url TEXT,
  url TEXT,
  contact TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_source, ext_id)
);
CREATE INDEX idx_source_kcisa_extra_dates ON source_kcisa_extra(start_date, end_date);
CREATE INDEX idx_source_kcisa_extra_source ON source_kcisa_extra(api_source);`);
    return;
  }
  if (testErr) {
    console.log(`  Table check error: ${testErr.message}`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect from each endpoint
  console.log('\n2. Collecting from endpoints...');
  const summary = [];

  for (const endpoint of ENDPOINTS) {
    let collected = null;

    // Try each API key until one works
    for (let ki = 0; ki < API_KEYS.length; ki++) {
      const key = API_KEYS[ki];
      const keyLabel = ['KCISA_EXHIBITION_API_KEY', 'KCISA_API_KEY', 'KCISA_CULTURE_API_KEY'][ki] || `key_${ki}`;

      const result = await collectEndpoint(endpoint, key);

      if (result.error && (result.error.includes('SERVICE_KEY') || result.error.includes('Unauthorized') || result.error.includes('key'))) {
        console.log(`    Key ${keyLabel} rejected, trying next...`);
        continue;
      }

      collected = result;
      if (result.items.length > 0) {
        console.log(`    Worked with ${keyLabel}`);
      }
      break;
    }

    if (!collected || collected.items.length === 0) {
      summary.push({ endpoint: endpoint.id, name: endpoint.name, count: 0, upserted: 0, note: collected?.error || 'no data' });
      continue;
    }

    // Dedup within this endpoint by ext_id
    const deduped = new Map();
    for (const item of collected.items) {
      const row = itemToRow(item, endpoint.id);
      if (!deduped.has(row.ext_id)) {
        deduped.set(row.ext_id, row);
      }
    }
    const rows = [...deduped.values()];
    console.log(`    After dedup: ${rows.length} unique items`);

    // Upsert to Supabase in batches
    let upserted = 0;
    let errors = 0;
    const batchSize = 30;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('source_kcisa_extra')
        .upsert(batch, { onConflict: 'api_source,ext_id', ignoreDuplicates: false })
        .select('id');

      if (error) {
        console.log(`    Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
        errors += batch.length;
      } else {
        upserted += (data?.length || 0);
      }
    }

    console.log(`    Upserted: ${upserted}, Errors: ${errors}`);
    summary.push({ endpoint: endpoint.id, name: endpoint.name, count: rows.length, upserted, errors, note: null });
  }

  // 3. Summary
  console.log('\n\n3. === SUMMARY ===');
  console.log('  ' + '-'.repeat(80));
  console.log('  ' + 'API'.padEnd(16) + 'Name'.padEnd(50) + 'Found'.padStart(8) + 'Saved'.padStart(8));
  console.log('  ' + '-'.repeat(80));

  let grandTotal = 0;
  let grandSaved = 0;
  for (const s of summary) {
    const note = s.note ? ` (${s.note})` : '';
    console.log('  ' + s.endpoint.padEnd(16) + s.name.padEnd(50) + String(s.count).padStart(8) + String(s.upserted).padStart(8) + note);
    grandTotal += s.count;
    grandSaved += s.upserted;
  }
  console.log('  ' + '-'.repeat(80));
  console.log('  ' + 'TOTAL'.padEnd(66) + String(grandTotal).padStart(8) + String(grandSaved).padStart(8));

  // 4. Verify table contents
  const { count } = await supabase.from('source_kcisa_extra').select('id', { count: 'exact', head: true });
  console.log(`\n4. Verification: ${count} total records in source_kcisa_extra`);

  // Breakdown by api_source
  const { data: allRows } = await supabase.from('source_kcisa_extra').select('api_source');
  if (allRows) {
    const sourceCounts = {};
    allRows.forEach(r => { sourceCounts[r.api_source] = (sourceCounts[r.api_source] || 0) + 1; });
    console.log('  By source:', JSON.stringify(sourceCounts));
  }

  // Sample recent entries
  const { data: sample } = await supabase
    .from('source_kcisa_extra')
    .select('api_source, title_clean, venue, start_date, end_date, image_url, latitude, longitude')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(10);

  if (sample && sample.length > 0) {
    console.log('\n  Recent entries:');
    sample.forEach(e => {
      const coords = (e.latitude && e.longitude) ? ` [${e.latitude},${e.longitude}]` : '';
      console.log(`  - [${e.api_source}] ${e.title_clean} @ ${e.venue} (${e.start_date}~${e.end_date}) img:${e.image_url ? 'Y' : 'N'}${coords}`);
    });
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

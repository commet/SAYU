/**
 * 전시정보(통합) API → source_exhibition_integrated table
 * Endpoint: https://api.kcisa.kr/openapi/API_CCA_145/request
 *
 * 23개 기관 통합 전시 데이터:
 * 국립중앙박물관, 국립현대미술관, 예술의전당, 국립아시아문화전당,
 * 국립경주/광주/부여/대구/청주/김해/제주/춘천/진주/공주/익산박물관,
 * 한국예술종합학교, 한국영상자료원, 태권도진흥재단, 국립박물관문화재단 등
 *
 * No search keyword required - just paginate through all data
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_KEY = process.env.KCISA_EXHIBITION_API_KEY;
const BASE_URL = 'https://api.kcisa.kr/openapi/API_CCA_145/request';

function fetch(url) {
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
    try { return await fetch(url); }
    catch (e) {
      if (i === retries) throw e;
      console.log(`  retry ${i}/${retries} (${e.message})...`);
      await new Promise(r => setTimeout(r, i * 5000));
    }
  }
}

function parseXML(xml) {
  const items = [];
  const totalMatch = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = {};
    const fields = [
      'TITLE', 'CNTC_INSTT_NM', 'COLLECTED_DATE', 'ISSUED_DATE',
      'DESCRIPTION', 'IMAGE_OBJECT', 'LOCAL_ID', 'URL', 'VIEW_COUNT',
      'SUB_DESCRIPTION', 'SPATIAL_COVERAGE', 'EVENT_SITE', 'GENRE',
      'DURATION', 'NUMBER_PAGES', 'TABLE_OF_CONTENTS', 'AUTHOR',
      'CONTACT_POINT', 'ACTOR', 'CONTRIBUTOR', 'AUDIENCE', 'CHARGE',
      'PERIOD', 'EVENT_PERIOD'
    ];
    for (const f of fields) {
      const m = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(match[1]);
      if (m) item[f] = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    if (item.TITLE) items.push(item);
  }
  return { items, total };
}

function decodeHtml(t) {
  return (t || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'")
    .replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ').trim();
}

function parsePeriod(p) {
  if (!p) return { start: null, end: null };
  const m = p.match(/(\d{4})-?(\d{2})-?(\d{2})\s*[~\-]\s*(\d{4})-?(\d{2})-?(\d{2})/);
  if (m) return { start: `${m[1]}-${m[2]}-${m[3]}`, end: `${m[4]}-${m[5]}-${m[6]}` };
  const single = p.match(/(\d{4})-?(\d{2})-?(\d{2})/);
  if (single) return { start: `${single[1]}-${single[2]}-${single[3]}`, end: null };
  return { start: null, end: null };
}

async function run() {
  console.log('=== 전시정보(통합) API 수집 ===\n');

  // 1. Check table
  console.log('1. Checking source_exhibition_integrated table...');
  const { error: testErr } = await supabase.from('source_exhibition_integrated').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL:\n');
    console.log(`CREATE TABLE source_exhibition_integrated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_clean TEXT,
  institution TEXT,
  genre TEXT,
  period TEXT,
  event_period TEXT,
  start_date DATE,
  end_date DATE,
  event_site TEXT,
  charge TEXT,
  contact_point TEXT,
  url TEXT,
  image_url TEXT,
  description TEXT,
  author TEXT,
  contributor TEXT,
  audience TEXT,
  duration TEXT,
  view_count INTEGER DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_exh_int_dates ON source_exhibition_integrated(start_date, end_date);
CREATE INDEX idx_source_exh_int_inst ON source_exhibition_integrated(institution);`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect all pages
  console.log('\n2. Collecting...');
  let page = 1;
  let total = 0;
  let allItems = [];
  const PAGE_SIZE = 100; // KCISA is slow but 100 usually works with 60s timeout

  while (true) {
    try {
      const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=${PAGE_SIZE}&pageNo=${page}`;
      const xml = await fetchRetry(url);
      const { items, total: t } = parseXML(xml);

      if (page === 1) {
        total = t;
        console.log(`  Total available: ${total}`);
      }

      if (items.length === 0) break;

      // Dedup by LOCAL_ID
      for (const item of items) {
        if (item.LOCAL_ID) {
          allItems.push(item);
        }
      }

      console.log(`  Page ${page}: +${items.length} (total: ${allItems.length}/${total})`);

      if (page * PAGE_SIZE >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 1000)); // Be gentle with KCISA
    } catch (e) {
      console.log(`  Page ${page} failed: ${e.message}`);
      // Try to continue from next page
      if (page * PAGE_SIZE >= total && total > 0) break;
      page++;
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Dedup
  const seen = new Map();
  for (const item of allItems) {
    if (!seen.has(item.LOCAL_ID)) seen.set(item.LOCAL_ID, item);
  }
  const unique = [...seen.values()];
  console.log(`\n  Collected: ${allItems.length}, Unique: ${unique.length}`);

  // 3. Sync to Supabase
  console.log('\n3. Syncing...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    const rows = batch.map(item => {
      const dates = parsePeriod(item.PERIOD);
      return {
        local_id: item.LOCAL_ID,
        title: item.TITLE,
        title_clean: decodeHtml(item.TITLE),
        institution: item.CNTC_INSTT_NM || null,
        genre: item.GENRE || null,
        period: item.PERIOD || null,
        event_period: item.EVENT_PERIOD || null,
        start_date: dates.start,
        end_date: dates.end,
        event_site: item.EVENT_SITE || null,
        charge: item.CHARGE || null,
        contact_point: item.CONTACT_POINT || null,
        url: item.URL || null,
        image_url: item.IMAGE_OBJECT || null,
        description: decodeHtml(item.DESCRIPTION),
        author: item.AUTHOR || null,
        contributor: item.CONTRIBUTOR || null,
        audience: item.AUDIENCE || null,
        duration: item.DURATION || null,
        view_count: parseInt(item.VIEW_COUNT) || 0,
        raw_data: item,
        collected_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('source_exhibition_integrated')
      .upsert(rows, { onConflict: 'local_id', ignoreDuplicates: false })
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
  const { count } = await supabase.from('source_exhibition_integrated').select('id', { count: 'exact', head: true });
  const { data: byInst } = await supabase.from('source_exhibition_integrated').select('institution');
  const instCounts = {};
  (byInst || []).forEach(r => { instCounts[r.institution || '?'] = (instCounts[r.institution || '?'] || 0) + 1; });

  const { data: sample } = await supabase
    .from('source_exhibition_integrated')
    .select('title_clean, institution, start_date, end_date, image_url')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n4. Verification: ${count} total records`);
  console.log('  By institution:', JSON.stringify(instCounts, null, 2));
  if (sample) {
    console.log('\n  Recent:');
    sample.forEach(e => console.log(`  - ${e.title_clean} @ ${e.institution} (${e.start_date}~${e.end_date}) img:${e.image_url ? 'Y' : 'N'}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

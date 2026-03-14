/**
 * 문화체육관광부 문화예술공연(통합) API → source_culture_events table
 * Endpoint: https://api.kcisa.kr/openapi/CNV_060/request
 * dtype=전시 로 전시 정보만 수집
 * 이미지 썸네일, 상세 설명, 장소, 연락처 포함
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_KEY = process.env.KCISA_CULTURE_API_KEY;
const BASE_URL = 'https://api.kcisa.kr/openapi/CNV_060/request';

// Search keywords to maximize coverage (title is required, min 2 chars)
const SEARCH_KEYWORDS = [
  '전시', '미술', '갤러리', '아트', '기획전', '특별전', '사진',
  '회화', '조각', '설치', '현대', '작품', '작가', '초대',
  '개인전', '그룹', '소장', '컬렉션', '뮤지엄', '박물관'
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchRetry(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try { return await fetch(url); }
    catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, i * 3000));
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
    const fields = ['title','type','period','eventPeriod','eventSite','charge','contactPoint','url','imageObject','description','viewCount'];
    for (const f of fields) {
      const m = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(match[1]);
      if (m) item[f] = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    if (item.title) items.push(item);
  }
  return { items, total };
}

function decodeHtml(t) {
  return (t || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ').trim();
}

function parsePeriod(p) {
  if (!p) return { start: null, end: null };
  // Format: "20260107 ~ 20260214" or "2026-01-07 ~ 2026-02-14"
  const m = p.match(/(\d{4})-?(\d{2})-?(\d{2})\s*[~\-]\s*(\d{4})-?(\d{2})-?(\d{2})/);
  if (m) return { start: `${m[1]}-${m[2]}-${m[3]}`, end: `${m[4]}-${m[5]}-${m[6]}` };
  return { start: null, end: null };
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

async function run() {
  console.log('=== 문화예술공연(통합) - 전시 데이터 수집 ===\n');

  // 1. Check table
  console.log('1. Checking source_culture_events table...');
  const { error: testErr } = await supabase.from('source_culture_events').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL:\n');
    console.log(`CREATE TABLE source_culture_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_clean TEXT,
  dtype TEXT,
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
  view_count INTEGER DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_culture_dates ON source_culture_events(start_date, end_date);
CREATE INDEX idx_source_culture_dtype ON source_culture_events(dtype);`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect using multiple keywords
  console.log('\n2. Collecting (dtype=전시)...');
  const allItems = new Map(); // keyed by title+period for dedup

  for (const keyword of SEARCH_KEYWORDS) {
    let page = 1;
    let keywordTotal = 0;

    while (true) {
      try {
        const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=100&pageNo=${page}&dtype=${encodeURIComponent('전시')}&title=${encodeURIComponent(keyword)}`;
        const xml = await fetchRetry(url);
        const { items, total } = parseXML(xml);

        if (page === 1) keywordTotal = total;
        if (items.length === 0) break;

        for (const item of items) {
          const key = `${item.title}_${item.eventPeriod || ''}`;
          if (!allItems.has(key)) allItems.set(key, item);
        }

        if (page * 100 >= keywordTotal) break;
        page++;
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.log(`  "${keyword}" p${page} failed: ${e.message}`);
        break;
      }
    }

    console.log(`  "${keyword}": ${keywordTotal} total, ${allItems.size} unique so far`);
    await new Promise(r => setTimeout(r, 300));
  }

  const items = [...allItems.values()];
  console.log(`\n  Total unique: ${items.length}`);

  // 3. Sync to Supabase
  console.log('\n3. Syncing...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const rows = batch.map(item => {
      const dates = parsePeriod(item.eventPeriod);
      return {
        ext_id: `culture_${hash(item.title + (item.eventPeriod || '') + (item.eventSite || ''))}`,
        title: item.title,
        title_clean: decodeHtml(item.title),
        dtype: item.type || '전시',
        period: item.period || null,
        event_period: item.eventPeriod || null,
        start_date: dates.start,
        end_date: dates.end,
        event_site: item.eventSite || null,
        charge: item.charge || null,
        contact_point: item.contactPoint || null,
        url: item.url || null,
        image_url: item.imageObject || null,
        description: decodeHtml(item.description),
        view_count: parseInt(item.viewCount) || 0,
        raw_data: item,
        collected_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('source_culture_events')
      .upsert(rows, { onConflict: 'ext_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch ${Math.floor(i/batchSize)+1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 4. Verify
  const { count } = await supabase.from('source_culture_events').select('id', { count: 'exact', head: true });
  const { data: sample } = await supabase
    .from('source_culture_events')
    .select('title_clean, event_site, start_date, end_date, image_url')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n4. Verification: ${count} total records`);
  if (sample) {
    console.log('  Recent:');
    sample.forEach(e => console.log(`  - ${e.title_clean} @ ${e.event_site} (${e.start_date}~${e.end_date}) img:${e.image_url ? 'Y' : 'N'}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

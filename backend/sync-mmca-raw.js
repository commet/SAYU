/**
 * MMCA raw data → Supabase source_mmca table
 * 모든 원본 데이터 손실 없이 저장
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_KEY = process.env.KCISA_API_KEY;
const BASE_URL = 'https://api.kcisa.kr/openapi/service/rest/moca/docMeta';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => res.statusCode < 300 ? resolve(data) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try { return await fetch(url); }
    catch (e) {
      if (i === retries) throw e;
      console.log(`  retry ${i}/${retries} (${e.message})...`);
      await new Promise(r => setTimeout(r, i * 3000));
    }
  }
}

function parseXML(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = {};
    const fields = ['creator','collectionDb','publisher','title','subjectCategory','rights','charge','venue','eventPeriod','subDescription','person'];
    for (const f of fields) {
      const m = new RegExp(`<${f}>([\\s\\S]*?)</${f}>`, 'i').exec(match[1]);
      if (m) item[f] = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    }
    if (item.title) items.push(item);
  }
  return items;
}

function decodeHtml(t) {
  return (t || '')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"').replace(/&#039;/g,"'")
    .replace(/<[^>]*>/g, '');
}

function parsePeriod(p) {
  if (!p) return { start: null, end: null };
  const m = p.match(/(\d{4}[-./]\d{2}[-./]\d{2})\s*[~\-]\s*(\d{4}[-./]\d{2}[-./]\d{2})/);
  if (m) return { start: m[1].replace(/[./]/g,'-'), end: m[2].replace(/[./]/g,'-') };
  const s = p.match(/(\d{4}[-./]\d{2}[-./]\d{2})/);
  if (s) return { start: s[1].replace(/[./]/g,'-'), end: null };
  return { start: null, end: null };
}

async function run() {
  console.log('=== MMCA Raw Data Sync ===\n');

  // 1. Create table if not exists
  console.log('1. Creating source_mmca table...');
  const { error: sqlErr } = await supabase.rpc('exec_sql', { query: `
    CREATE TABLE IF NOT EXISTS source_mmca (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      publisher_id TEXT,
      title TEXT NOT NULL,
      title_decoded TEXT,
      category TEXT,
      organizer TEXT,
      charge TEXT,
      venue_room TEXT,
      event_period TEXT,
      start_date DATE,
      end_date DATE,
      description TEXT,
      artists TEXT,
      creator TEXT,
      collection_db TEXT,
      raw_data JSONB NOT NULL,
      collected_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(publisher_id)
    );
    CREATE INDEX IF NOT EXISTS idx_source_mmca_dates ON source_mmca(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_source_mmca_title ON source_mmca USING gin(to_tsvector('simple', title));
  `});

  if (sqlErr) {
    console.log('  RPC not available, creating via direct SQL...');
    // Try direct insert approach - table might already exist
    const { error: testErr } = await supabase.from('source_mmca').select('id').limit(1);
    if (testErr && testErr.message.includes('does not exist')) {
      console.log('  ERROR: Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
      console.log(`  CREATE TABLE source_mmca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id TEXT UNIQUE,
    title TEXT NOT NULL,
    title_decoded TEXT,
    category TEXT,
    organizer TEXT,
    charge TEXT,
    venue_room TEXT,
    event_period TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT,
    artists TEXT,
    creator TEXT,
    collection_db TEXT,
    raw_data JSONB NOT NULL DEFAULT '{}',
    collected_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_source_mmca_dates ON source_mmca(start_date, end_date);`);
      return;
    }
    console.log('  Table exists, continuing...');
  } else {
    console.log('  Table ready');
  }

  // 2. Collect all pages
  console.log('\n2. Collecting from MMCA API...');
  let page = 1;
  let total = 0;
  let allItems = [];

  while (true) {
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=100&pageNo=${page}`;
    try {
      const xml = await fetchWithRetry(url);
      const items = parseXML(xml);

      if (page === 1) {
        const tc = /<totalCount>(\d+)<\/totalCount>/i.exec(xml);
        total = tc ? parseInt(tc[1]) : 0;
        console.log(`  Total available: ${total}`);
      }

      if (items.length === 0) break;
      allItems.push(...items);
      console.log(`  Page ${page}: +${items.length} (total: ${allItems.length})`);

      if (page * 100 >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`  Page ${page} failed after retries: ${e.message}`);
      break;
    }
  }

  console.log(`\n  Collected: ${allItems.length} items`);

  // 3. Deduplicate - publisher is institution ID (same for all), so use title+period as key
  const seen = new Map();
  for (const item of allItems) {
    const key = `${item.title}_${item.eventPeriod || ''}_${item.venue || ''}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash) + key.charCodeAt(i); hash |= 0; }
    item._pid = `mmca_${Math.abs(hash).toString(36)}`;
    if (!seen.has(item._pid)) seen.set(item._pid, item);
  }
  const uniqueItems = [...seen.values()];
  console.log(`  After dedup: ${uniqueItems.length} unique items`);

  // 4. Upsert to Supabase
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < uniqueItems.length; i += batchSize) {
    const batch = uniqueItems.slice(i, i + batchSize);
    const rows = batch.map(item => {
      const dates = parsePeriod(item.eventPeriod);
      return {
        publisher_id: item._pid,
        title: item.title,
        title_decoded: decodeHtml(item.title),
        category: item.subjectCategory || null,
        organizer: item.rights || null,
        charge: item.charge || null,
        venue_room: item.venue || null,
        event_period: item.eventPeriod || null,
        start_date: dates.start,
        end_date: dates.end,
        description: decodeHtml(item.subDescription || ''),
        artists: item.person || null,
        creator: item.creator || null,
        collection_db: item.collectionDb || null,
        raw_data: item,
        collected_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('source_mmca')
      .upsert(rows, { onConflict: 'publisher_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch ${Math.floor(i/batchSize)+1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
      if ((i / batchSize) % 10 === 0) process.stdout.write(`  ${inserted}...`);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 4. Verify
  const { count } = await supabase.from('source_mmca').select('id', { count: 'exact', head: true });
  const { data: sample } = await supabase
    .from('source_mmca')
    .select('title_decoded, venue_room, start_date, end_date, charge, artists')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n4. Verification: ${count} total records in source_mmca`);
  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => console.log(`  - ${e.title_decoded} (${e.start_date}~${e.end_date}) ${e.charge || ''}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

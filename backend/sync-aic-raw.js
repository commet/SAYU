/**
 * AIC raw data → Supabase source_aic table
 * Art Institute of Chicago - 모든 원본 데이터 손실 없이 저장
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BASE_URL = 'https://api.artic.edu/api/v1';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 20000,
      headers: { 'User-Agent': 'SAYU Art Platform (sayu.my)', 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => res.statusCode < 300 ? resolve(JSON.parse(data)) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function cleanHtml(t) {
  return (t || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

async function run() {
  console.log('=== AIC Raw Data Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_aic table...');
  const { error: testErr } = await supabase.from('source_aic').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_aic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aic_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  image_full_url TEXT,
  aic_start_at TEXT,
  aic_end_at TEXT,
  start_date DATE,
  end_date DATE,
  gallery_title TEXT,
  web_url TEXT,
  aic_status TEXT,
  artwork_count INTEGER DEFAULT 0,
  artist_count INTEGER DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_aic_dates ON source_aic(start_date, end_date);
CREATE INDEX idx_source_aic_status ON source_aic(aic_status);`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect from AIC - all exhibitions with end date after 2020
  console.log('\n2. Collecting from AIC API...');
  const fields = 'id,title,short_description,description,image_url,aic_start_at,aic_end_at,gallery_title,web_url,artwork_ids,artist_ids,status';
  let page = 1;
  let allItems = [];

  // Get current/future exhibitions
  while (page <= 10) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${BASE_URL}/exhibitions/search?fields=${fields}&limit=100&page=${page}&query[range][aic_end_at][gte]=2020-01-01`;
      const data = await fetch(url);
      const items = data?.data || [];

      if (items.length === 0) break;

      allItems.push(...items);
      console.log(`  Page ${page}: +${items.length} (total: ${allItems.length}) of ${data.pagination?.total || '?'}`);

      if (page * 100 >= (data.pagination?.total || 0)) break;
      page++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`  Page ${page} error: ${e.message}`);
      break;
    }
  }

  console.log(`\n  Collected: ${allItems.length} items`);

  // 3. Sync to Supabase
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < allItems.length; i += batchSize) {
    const batch = allItems.slice(i, i + batchSize);
    const rows = batch.filter(item => item.id && item.title).map(item => {
      const startMatch = (item.aic_start_at || '').match(/(\d{4}-\d{2}-\d{2})/);
      const endMatch = (item.aic_end_at || '').match(/(\d{4}-\d{2}-\d{2})/);
      const iiif = 'https://www.artic.edu/iiif/2';

      return {
        aic_id: item.id,
        title: item.title,
        short_description: cleanHtml(item.short_description),
        description: cleanHtml(item.description)?.slice(0, 5000),
        image_url: item.image_url || null,
        image_full_url: item.image_url ? `${iiif}/${item.image_url}/full/843,/0/default.jpg` : null,
        aic_start_at: item.aic_start_at || null,
        aic_end_at: item.aic_end_at || null,
        start_date: startMatch ? startMatch[1] : null,
        end_date: endMatch ? endMatch[1] : null,
        gallery_title: item.gallery_title || null,
        web_url: item.web_url || null,
        aic_status: item.status || null,
        artwork_count: (item.artwork_ids || []).length,
        artist_count: (item.artist_ids || []).length,
        raw_data: item,
        collected_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('source_aic')
      .upsert(rows, { onConflict: 'aic_id', ignoreDuplicates: false })
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
  const { count } = await supabase.from('source_aic').select('id', { count: 'exact', head: true });
  const { data: sample } = await supabase
    .from('source_aic')
    .select('title, gallery_title, start_date, end_date, aic_status, image_full_url')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n4. Verification: ${count} total records in source_aic`);
  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => console.log(`  - ${e.title} @ ${e.gallery_title || 'AIC'} (${e.start_date}~${e.end_date}) [${e.aic_status}] img:${e.image_full_url ? 'Y' : 'N'}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

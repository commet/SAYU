/**
 * Harvard Art Museums raw data → Supabase source_harvard table
 * Harvard Art Museums API - 모든 원본 데이터 손실 없이 저장
 */
require('dotenv').config();

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_KEY = process.env.HARVARD_API_KEY;
const BASE_URL = 'https://api.harvardartmuseums.org';

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
  console.log('=== Harvard Art Museums Raw Data Sync ===\n');

  if (!API_KEY) {
    console.log('ERROR: HARVARD_API_KEY not set. Register at https://harvardartmuseums.org/collections/api');
    return;
  }

  // 1. Check table
  console.log('1. Checking source_harvard table...');
  const { error: testErr } = await supabase.from('source_harvard').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run the migration first:');
    console.log('  supabase/migrations/20260210000000_source_harvard.sql');
    return;
  }
  console.log('  Table ready');

  // 2. Collect from Harvard API
  console.log('\n2. Collecting from Harvard Art Museums API...');
  let page = 1;
  let allItems = [];

  while (page <= 20) {
    try {
      const url = `${BASE_URL}/exhibition?apikey=${API_KEY}&size=100&page=${page}&sort=begindate&sortorder=desc`;
      const data = await fetch(url);
      const items = data?.records || [];

      if (items.length === 0) break;

      allItems.push(...items);
      console.log(`  Page ${page}: +${items.length} (total: ${allItems.length}) of ${data.info?.totalrecords || '?'}`);

      if (!data.info?.next || allItems.length >= (data.info?.totalrecords || 0)) break;
      page++;
      await new Promise(r => setTimeout(r, 500));
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
    const rows = batch.filter(item => item.exhibitionid && item.title).map(item => {
      const startMatch = (item.begindate || '').match(/(\d{4}-\d{2}-\d{2})/);
      const endMatch = (item.enddate || '').match(/(\d{4}-\d{2}-\d{2})/);

      return {
        harvard_id: item.exhibitionid,
        title: item.title,
        short_description: cleanHtml(item.shortdescription),
        description: cleanHtml(item.description)?.slice(0, 5000),
        begin_date: item.begindate || null,
        end_date: item.enddate || null,
        start_date: startMatch ? startMatch[1] : null,
        end_date_parsed: endMatch ? endMatch[1] : null,
        primary_image_url: item.primaryimageurl || null,
        exhibition_url: item.url || null,
        venues: item.venues || [],
        people: item.people || [],
        images: item.images || [],
        raw_data: item,
        collected_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('source_harvard')
      .upsert(rows, { onConflict: 'harvard_id', ignoreDuplicates: false })
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
  const { count } = await supabase.from('source_harvard').select('id', { count: 'exact', head: true });
  const { data: sample } = await supabase
    .from('source_harvard')
    .select('title, start_date, end_date_parsed, primary_image_url, venues')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n4. Verification: ${count} total records in source_harvard`);
  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => {
      const venue = (e.venues && e.venues[0]?.name) || 'Harvard Art Museums';
      console.log(`  - ${e.title} @ ${venue} (${e.start_date}~${e.end_date_parsed}) img:${e.primary_image_url ? 'Y' : 'N'}`);
    });
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

/**
 * Whitney Museum of American Art exhibitions → Supabase source_whitney table
 * API: https://whitney.org/api/exhibitions (JSON API spec, no auth)
 */
require('dotenv').config();

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_BASE = 'https://whitney.org/api/exhibitions';

async function fetchExhibitions() {
  console.log('\n--- Fetching Whitney Museum exhibitions ---');
  const results = [];
  let page = 1;
  const perPage = 30;

  while (true) {
    console.log(`  Fetching page ${page}...`);
    try {
      const resp = await axios.get(API_BASE, {
        params: { 'page[number]': page, 'page[size]': perPage },
        headers: { 'Accept': 'application/json' },
        timeout: 30000
      });

      const { data, meta } = resp.data;
      if (!data || data.length === 0) break;

      for (const ex of data) {
        const attrs = ex.attributes || {};
        const startDate = attrs.start_time ? attrs.start_time.split('T')[0] : null;
        const endDate = attrs.end_time ? attrs.end_time.split('T')[0] : null;

        results.push({
          external_id: String(ex.id),
          title: attrs.title || '',
          start_date: startDate,
          end_date: endDate,
          description: attrs.primary_text ? attrs.primary_text.replace(/<[^>]*>/g, '').substring(0, 5000) : null,
          date_override: attrs.date_override || null,
          url_slug: attrs.url || null,
          raw_data: ex
        });
      }

      console.log(`  Got ${data.length} exhibitions (total: ${results.length})`);

      // Check if more pages
      const totalPages = meta?.total_pages || Math.ceil((meta?.total || 0) / perPage);
      if (page >= totalPages || data.length < perPage) break;

      page++;
      await new Promise(r => setTimeout(r, 1000)); // Be respectful
    } catch (e) {
      console.log(`  Page ${page} error: ${e.message}`);
      break;
    }
  }

  console.log(`  Total fetched: ${results.length}`);
  return results;
}

async function run() {
  console.log('=== Whitney Museum Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_whitney table...');
  const { error: testErr } = await supabase.from('source_whitney').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_whitney (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  date_override TEXT,
  url_slug TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_whitney_dates ON source_whitney(start_date, end_date);`);
    return;
  }
  console.log('  Table ready');

  // 2. Fetch
  const exhibitions = await fetchExhibitions();
  if (exhibitions.length === 0) {
    console.log('\n  No exhibitions fetched. Done.');
    return;
  }

  // 3. Dedup by external_id (API returns duplicates across pages)
  const dedupMap = new Map();
  for (const ex of exhibitions) {
    dedupMap.set(ex.external_id, ex);
  }
  const deduped = [...dedupMap.values()];
  console.log(`\n  Deduped: ${exhibitions.length} → ${deduped.length} unique`);

  // 4. Upsert
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;
  const batchSize = 50;

  for (let i = 0; i < deduped.length; i += batchSize) {
    const batch = deduped.slice(i, i + batchSize).map(ex => ({
      ...ex,
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_whitney')
      .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 4. Verify
  const { count } = await supabase.from('source_whitney').select('id', { count: 'exact', head: true });
  console.log(`\n4. Total records in source_whitney: ${count}`);

  const { data: sample } = await supabase
    .from('source_whitney')
    .select('title, start_date, end_date')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => console.log(`  - ${e.title} (${e.start_date}~${e.end_date})`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

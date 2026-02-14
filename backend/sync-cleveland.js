/**
 * Cleveland Museum of Art exhibitions → Supabase source_cleveland table
 * API: https://openaccess-api.clevelandart.org/api/exhibitions/
 * No API key needed, CC0 license
 */
require('dotenv').config();

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_BASE = 'https://openaccess-api.clevelandart.org/api/exhibitions/';

async function fetchExhibitions() {
  console.log('\n--- Fetching Cleveland Museum exhibitions ---');
  const results = [];
  const limit = 100;
  let skip = 0;

  while (true) {
    console.log(`  Fetching skip=${skip}...`);
    const resp = await axios.get(API_BASE, {
      params: { limit, skip, opened_after: '2020-01-01' },
      timeout: 30000
    });

    const { data, info } = resp.data;
    if (!data || data.length === 0) break;

    for (const ex of data) {
      const openDate = ex.opening_date ? ex.opening_date.split('T')[0] : null;
      const closeDate = ex.closing_date ? ex.closing_date.split('T')[0] : null;

      // Get venue info from venues array
      let venueName = 'Cleveland Museum of Art';
      let venueCity = 'Cleveland';
      let venueCountry = 'US';
      if (ex.venues && ex.venues.length > 0) {
        const v = ex.venues[0];
        venueName = v.name || venueName;
        // Try to extract city from venue name
        if (v.name && !v.name.includes('Cleveland')) {
          venueCity = null; // Will be extracted later
        }
      }

      results.push({
        external_id: String(ex.id),
        title: ex.title,
        organizer: ex.organizer || null,
        venue_name: venueName,
        venue_city: venueCity,
        venue_country: venueCountry,
        start_date: openDate,
        end_date: closeDate,
        venues: ex.venues || [],
        gallery_views_urls: ex.gallery_views_urls || [],
        is_venue_cma: ex.is_venue_cma || false,
        raw_data: ex
      });
    }

    console.log(`  Got ${data.length} exhibitions (total: ${results.length} of ${info.total})`);
    skip += limit;
    if (data.length < limit) break;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`  Total fetched: ${results.length}`);
  return results;
}

async function run() {
  console.log('=== Cleveland Museum of Art Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_cleveland table...');
  const { error: testErr } = await supabase.from('source_cleveland').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_cleveland (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  organizer TEXT,
  venue_name TEXT,
  venue_city TEXT,
  venue_country TEXT DEFAULT 'US',
  start_date DATE,
  end_date DATE,
  venues JSONB DEFAULT '[]',
  gallery_views_urls TEXT[] DEFAULT '{}',
  is_venue_cma BOOLEAN DEFAULT false,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_cleveland_dates ON source_cleveland(start_date, end_date);`);
    return;
  }
  console.log('  Table ready');

  // 2. Fetch
  const exhibitions = await fetchExhibitions();
  if (exhibitions.length === 0) {
    console.log('\n  No exhibitions fetched. Done.');
    return;
  }

  // 3. Upsert
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;
  const batchSize = 50;

  for (let i = 0; i < exhibitions.length; i += batchSize) {
    const batch = exhibitions.slice(i, i + batchSize).map(ex => ({
      ...ex,
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_cleveland')
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
  const { count } = await supabase.from('source_cleveland').select('id', { count: 'exact', head: true });
  console.log(`\n4. Total records in source_cleveland: ${count}`);

  const { data: sample } = await supabase
    .from('source_cleveland')
    .select('title, venue_name, start_date, end_date')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => console.log(`  - ${e.title} @ ${e.venue_name} (${e.start_date}~${e.end_date})`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

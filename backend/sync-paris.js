/**
 * Paris "Que Faire a Paris" exhibitions → Supabase source_paris table
 * API: https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records
 * No API key needed, government open data
 */
require('dotenv').config();

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_BASE = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records';

// Tags that indicate exhibition-related events
const EXHIBITION_TAGS = ['Expo', 'exposition', 'Expos', 'expositions', 'art', 'musée', 'galerie'];

async function fetchExhibitions() {
  console.log('\n--- Fetching Paris "Que Faire" exhibitions ---');
  const results = [];
  const limit = 100;
  let offset = 0;

  // Build where clause to filter exhibition-related content
  // Use title and tags to find exhibitions
  const where = EXHIBITION_TAGS.map(t => `title like "*${t}*" OR lead_text like "*${t}*"`).join(' OR ');

  while (true) {
    console.log(`  Fetching offset=${offset}...`);
    try {
      const resp = await axios.get(API_BASE, {
        params: {
          limit,
          offset,
          select: 'id,event_id,url,title,lead_text,description,date_start,date_end,date_description,cover_url,cover_alt,address_name,address_street,address_zipcode,address_city,lat_lon,price_type,price_detail,qfap_tags,updated_at'
        },
        timeout: 30000
      });

      const { results: records, total_count } = resp.data;
      if (!records || records.length === 0) break;

      if (offset === 0) console.log(`  Total available: ${total_count}`);

      for (const rec of records) {
        // Skip non-exhibition events unless they're in a museum/gallery
        const combinedText = `${rec.title || ''} ${rec.lead_text || ''} ${rec.address_name || ''} ${rec.qfap_tags || ''}`.toLowerCase();
        const isExhibition = EXHIBITION_TAGS.some(t => combinedText.includes(t.toLowerCase())) ||
          combinedText.includes('musée') || combinedText.includes('galerie') ||
          combinedText.includes('museum') || combinedText.includes('gallery') ||
          combinedText.includes('vernissage') || combinedText.includes('biennale');

        if (!isExhibition) continue;

        const startDate = rec.date_start ? rec.date_start.split('T')[0] : null;
        const endDate = rec.date_end ? rec.date_end.split('T')[0] : null;

        results.push({
          external_id: String(rec.id || rec.event_id),
          title: rec.title || '',
          venue_name: rec.address_name || null,
          venue_address: rec.address_street ? `${rec.address_street}, ${rec.address_zipcode || ''} ${rec.address_city || 'Paris'}`.trim() : null,
          start_date: startDate,
          end_date: endDate,
          description: rec.lead_text || (rec.description ? rec.description.replace(/<[^>]*>/g, '').substring(0, 5000) : null),
          image_url: rec.cover_url || null,
          lat: rec.lat_lon?.lat || null,
          lng: rec.lat_lon?.lon || null,
          price_type: rec.price_type || null,
          price_detail: rec.price_detail || null,
          tags: rec.qfap_tags || null,
          source_url: rec.url || null,
          raw_data: rec
        });
      }

      console.log(`  Processed ${records.length} records, ${results.length} exhibitions so far`);
      offset += limit;
      if (records.length < limit || offset >= total_count) break;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.log(`  Offset ${offset} error: ${e.message}`);
      break;
    }
  }

  console.log(`  Total exhibition records: ${results.length}`);
  return results;
}

async function run() {
  console.log('=== Paris "Que Faire a Paris" Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_paris table...');
  const { error: testErr } = await supabase.from('source_paris').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_paris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  image_url TEXT,
  lat FLOAT,
  lng FLOAT,
  price_type TEXT,
  price_detail TEXT,
  tags TEXT,
  source_url TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_paris_dates ON source_paris(start_date, end_date);`);
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
      .from('source_paris')
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
  const { count } = await supabase.from('source_paris').select('id', { count: 'exact', head: true });
  console.log(`\n4. Total records in source_paris: ${count}`);
  console.log('\n=== Done ===');
}

run().catch(console.error);

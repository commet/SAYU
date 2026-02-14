/**
 * Berlin kulturdaten.berlin exhibitions → Supabase source_berlin table
 * API: https://api-v2.kulturdaten.berlin/api/events
 * No API key needed, MIT license, government-funded
 */
require('dotenv').config();

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const API_BASE = 'https://api-v2.kulturdaten.berlin/api/events';

async function fetchExhibitions() {
  console.log('\n--- Fetching Berlin kulturdaten events ---');
  const results = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    console.log(`  Fetching page ${page}...`);
    try {
      const resp = await axios.get(API_BASE, {
        params: { page, pageSize },
        timeout: 30000
      });

      const { data } = resp.data;
      const events = data.events;
      if (!events || events.length === 0) break;

      if (page === 1) console.log(`  Total events: ${data.totalCount}`);

      for (const ev of events) {
        // Extract location name
        let venueName = null;
        if (ev.locations && ev.locations.length > 0) {
          const loc = ev.locations[0];
          venueName = loc.referenceLabel?.de || loc.referenceLabel?.en || null;
        }

        // Extract attraction/event title
        let title = null;
        if (ev.attractions && ev.attractions.length > 0) {
          const attr = ev.attractions[0];
          title = attr.referenceLabel?.de || attr.referenceLabel?.en || null;
        }

        if (!title) continue;

        const startDate = ev.schedule?.startDate || null;
        const endDate = ev.schedule?.endDate || null;

        // Determine if this is exhibition-like
        const titleLower = (title || '').toLowerCase();
        const isExhibition = titleLower.includes('ausstellung') || titleLower.includes('exhibition') ||
          titleLower.includes('expo') || titleLower.includes('galerie') ||
          titleLower.includes('kunst') || titleLower.includes('art') ||
          ev.type === 'type.Exhibition';

        results.push({
          external_id: ev.identifier,
          title,
          venue_name: venueName,
          start_date: startDate,
          end_date: endDate,
          admission_type: ev.admission?.ticketType || null,
          event_type: ev.type || null,
          status: ev.status || null,
          is_exhibition: isExhibition,
          raw_data: ev
        });
      }

      console.log(`  Processed page ${page}: ${events.length} events, ${results.length} total`);

      const totalPages = Math.ceil(data.totalCount / pageSize);
      if (page >= totalPages || events.length < pageSize) break;
      page++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.log(`  Page ${page} error: ${e.message}`);
      break;
    }
  }

  // Filter to exhibition-likely events
  const exhibitions = results.filter(r => r.is_exhibition);
  console.log(`  Total events: ${results.length}, exhibitions: ${exhibitions.length}`);
  return results; // Store all events, filter in mapping
}

async function run() {
  console.log('=== Berlin kulturdaten Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_berlin table...');
  const { error: testErr } = await supabase.from('source_berlin').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_berlin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  venue_name TEXT,
  start_date DATE,
  end_date DATE,
  admission_type TEXT,
  event_type TEXT,
  status TEXT,
  is_exhibition BOOLEAN DEFAULT false,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_source_berlin_dates ON source_berlin(start_date, end_date);
CREATE INDEX idx_source_berlin_exhibition ON source_berlin(is_exhibition);`);
    return;
  }
  console.log('  Table ready');

  // 2. Fetch
  const events = await fetchExhibitions();
  if (events.length === 0) {
    console.log('\n  No events fetched. Done.');
    return;
  }

  // 3. Upsert
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;
  const batchSize = 50;

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize).map(ev => ({
      ...ev,
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_berlin')
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
  const { count: total } = await supabase.from('source_berlin').select('id', { count: 'exact', head: true });
  const { count: exhibCount } = await supabase.from('source_berlin').select('id', { count: 'exact', head: true }).eq('is_exhibition', true);
  console.log(`\n4. Total records: ${total}, exhibitions: ${exhibCount}`);
  console.log('\n=== Done ===');
}

run().catch(console.error);

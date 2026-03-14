#!/usr/bin/env node
/**
 * One-time sync: Seoul Open Data → exhibitions table
 * Usage: node sync-seoul-opendata.js
 */

require('dotenv').config();
const SeoulOpenDataCollector = require('./src/services/exhibition-pipeline/collectors/seoulOpenDataCollector');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function main() {
  console.log('=== Seoul Open Data Sync ===\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Collect
  const collector = new SeoulOpenDataCollector(process.env.SEOUL_OPENDATA_API_KEY);
  const exhibitions = await collector.collect();
  console.log(`\nCollected: ${exhibitions.length} exhibitions\n`);

  if (exhibitions.length === 0) {
    console.log('No exhibitions collected. Check API key.');
    return;
  }

  // 2. Map to DB schema and upsert
  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  for (const ex of exhibitions) {
    try {
      if (!ex.title) { skipped++; continue; }

      // Seoul Open Data is always Seoul
      const guname = ex.metadata?.guname || '';

      const dbRow = {
        title_local: ex.title,
        title_en: null,
        venue_name: ex.venue || null,
        venue_city: 'Seoul',
        venue_country: 'KR',
        start_date: ex.start_date || null,
        end_date: ex.end_date || null,
        status: ex.status || 'upcoming',
        description: ex.description || null,
        image_url: ex.image_url || null,
        admission_fee: ex.admission_fee || null,
        source: 'seoul_opendata',
        source_url: ex.source_url || null,
        tags: ex.tags || [],
        content_type: 'exhibition',
        metadata: {
          external_id: ex.external_id,
          guname: guname,
          use_trgt: ex.metadata?.use_trgt || '',
          lat: ex.metadata?.lat || '',
          lot: ex.metadata?.lot || '',
          collected_at: new Date().toISOString()
        }
      };

      // Check if exists by source + external_id in metadata
      const { data: existing } = await supabase
        .from('exhibitions')
        .select('id')
        .eq('source', 'seoul_opendata')
        .contains('metadata', { external_id: ex.external_id })
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('exhibitions')
          .update(dbRow)
          .eq('id', existing.id);
        if (error) { errors++; console.error(`  Update error: ${error.message}`); }
        else { updated++; }
      } else {
        const { error } = await supabase
          .from('exhibitions')
          .insert(dbRow);
        if (error) { errors++; console.error(`  Insert error: ${error.message} | ${ex.title}`); }
        else { inserted++; }
      }
    } catch (e) {
      errors++;
      console.error(`  Error: ${e.message}`);
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated:  ${updated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  console.log(`Total:    ${exhibitions.length}`);
}

main().catch(console.error);

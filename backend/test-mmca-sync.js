/**
 * Full MMCA collection + Supabase sync
 */
require('dotenv').config();

const MMCACollector = require('./src/services/exhibition-pipeline/collectors/mmcaCollector');
const ExhibitionSync = require('./src/services/exhibition-pipeline/sync');
const { getSupabaseAdmin } = require('./src/config/supabase');

async function run() {
  console.log('=== MMCA Full Collection + Supabase Sync ===\n');

  // 1. Check Supabase
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('ERROR: Supabase not configured');
    return;
  }
  console.log('1. Supabase connected');

  // 2. Collect all MMCA exhibitions
  console.log('\n2. Collecting MMCA exhibitions (2,080 total, this will take a few minutes)...\n');
  const mmca = new MMCACollector();
  const exhibitions = await mmca.collect(); // all pages

  console.log(`\n   Collected: ${exhibitions.length} exhibitions`);

  const withDates = exhibitions.filter(e => e.start_date && e.end_date);
  const withoutDates = exhibitions.length - withDates.length;
  console.log(`   With dates: ${withDates.length}`);
  console.log(`   Without dates: ${withoutDates} (will still be saved)`);

  // 3. Sync to Supabase
  console.log('\n3. Syncing to Supabase...\n');
  const sync = new ExhibitionSync();
  const stats = await sync.sync(exhibitions);

  console.log('\n   Results:');
  console.log(`   - Inserted: ${stats.inserted}`);
  console.log(`   - Updated: ${stats.updated}`);
  console.log(`   - Skipped: ${stats.skipped}`);
  console.log(`   - Errors: ${stats.errors}`);
  console.log(`   - Status updated: ${stats.statusUpdated}`);

  // 4. Verify
  console.log('\n4. Verifying...');
  const { data: count } = await supabase
    .from('exhibitions')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'mmca');

  const { data: sample } = await supabase
    .from('exhibitions')
    .select('title, venue, start_date, end_date, status, admission_fee')
    .eq('source', 'mmca')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  console.log(`\n   MMCA exhibitions in DB: checking...`);
  if (sample) {
    console.log('   Recent exhibitions:');
    sample.forEach(ex => {
      console.log(`   - ${ex.title} (${ex.start_date} ~ ${ex.end_date}) [${ex.status}] ${ex.admission_fee || ''}`);
    });
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

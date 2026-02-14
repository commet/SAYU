/**
 * Exhibition data cleanup:
 * 1. Normalize Korean city names to English
 * 2. Remove cross-source duplicates (same title + dates)
 * Run: node cleanup-exhibitions.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const CITY_NORMALIZE = {
  '과천': 'Gwacheon',
  '서울': 'Seoul',
  '청주': 'Cheongju',
  '대구': 'Daegu',
  '부산': 'Busan',
  '광주': 'Gwangju',
  '대전': 'Daejeon',
  '인천': 'Incheon',
  '울산': 'Ulsan',
  '제주': 'Jeju',
  '수원': 'Suwon',
  '성남': 'Seongnam',
  '고양': 'Goyang',
  '용인': 'Yongin',
  '안양': 'Anyang',
  '안산': 'Ansan',
  '파주': 'Paju',
  '양평': 'Yangpyeong',
  '경주': 'Gyeongju',
  '천안': 'Cheonan',
  '포항': 'Pohang',
  '창원': 'Changwon',
  '춘천': 'Chuncheon',
  '원주': 'Wonju',
  '김해': 'Gimhae',
  '세종': 'Sejong',
  '전주': 'Jeonju',
  // Case variants
  'GWACHEON': 'Gwacheon',
  'SEOUL': 'Seoul',
  'CHEONGJU': 'Cheongju',
};

async function fetchAll(table, columns = '*') {
  const all = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) { console.error('Fetch error:', error.message); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function normalizeCities() {
  console.log('=== Step 1: Normalize city names ===\n');

  const all = await fetchAll('exhibitions', 'id,venue_city');
  console.log(`  Total exhibitions: ${all.length}`);

  const updates = [];
  for (const ex of all) {
    if (!ex.venue_city) continue;
    const normalized = CITY_NORMALIZE[ex.venue_city];
    if (normalized && normalized !== ex.venue_city) {
      updates.push({ id: ex.id, venue_city: normalized });
    }
  }

  console.log(`  Need to normalize: ${updates.length} records`);

  if (updates.length === 0) {
    console.log('  All city names already normalized.\n');
    return;
  }

  // Show distribution
  const dist = {};
  for (const u of updates) {
    dist[u.venue_city] = (dist[u.venue_city] || 0) + 1;
  }
  for (const [city, count] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${city}: ${count}`);
  }

  // Apply
  let updated = 0, errors = 0;
  for (const u of updates) {
    const { error } = await supabase
      .from('exhibitions')
      .update({ venue_city: u.venue_city })
      .eq('id', u.id);
    if (error) errors++;
    else updated++;
  }

  console.log(`\n  Updated: ${updated}, Errors: ${errors}\n`);
}

async function removeDuplicates() {
  console.log('=== Step 2: Remove cross-source duplicates ===\n');

  const all = await fetchAll('exhibitions', 'id,title_local,title_en,venue_name,start_date,end_date,source,image_url,created_at');
  console.log(`  Total exhibitions: ${all.length}`);

  // Group by normalized title + start_date + end_date
  const groups = new Map();
  for (const ex of all) {
    const title = (ex.title_local || ex.title_en || '').trim().toLowerCase();
    if (!title || title.length < 3) continue;
    const key = `${title}|${ex.start_date || ''}|${ex.end_date || ''}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ex);
  }

  // Find groups with duplicates
  const duplicateGroups = [...groups.entries()].filter(([, g]) => g.length > 1);
  console.log(`  Duplicate groups found: ${duplicateGroups.length}`);

  if (duplicateGroups.length === 0) {
    console.log('  No duplicates found.\n');
    return;
  }

  const toDelete = [];
  for (const [key, group] of duplicateGroups) {
    // Keep the one with the best data (has image, most recent)
    group.sort((a, b) => {
      // Prefer one with image
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
      // Prefer earlier created (original)
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    });

    const keep = group[0];
    const remove = group.slice(1);

    if (remove.length > 0) {
      const title = (keep.title_local || keep.title_en || '').substring(0, 40);
      console.log(`  "${title}" - keep ${keep.source}, remove ${remove.map(r => r.source).join(', ')}`);
      toDelete.push(...remove.map(r => r.id));
    }
  }

  console.log(`\n  Total to delete: ${toDelete.length}`);

  // Delete in batches
  let deleted = 0, errors = 0;
  const batchSize = 50;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .in('id', batch);
    if (error) {
      console.log(`  Delete error: ${error.message}`);
      errors += batch.length;
    } else {
      deleted += batch.length;
    }
  }

  console.log(`  Deleted: ${deleted}, Errors: ${errors}\n`);
}

async function fixPerrotinUrls() {
  console.log('=== Step 3: Fix Perrotin malformed URLs ===\n');

  const { data, error } = await supabase
    .from('exhibitions')
    .select('id,source_url,source')
    .like('source', 'gallery_perrotin');

  if (error) {
    console.log(`  Error: ${error.message}`);
    return;
  }

  console.log(`  Perrotin exhibitions: ${data?.length || 0}`);

  let fixed = 0;
  for (const ex of (data || [])) {
    if (!ex.source_url) continue;
    // Fix URLs like "https://www.perrotin.comhttps//..." or missing protocol
    let url = ex.source_url;
    let needsFix = false;

    if (url.includes('perrotin.com') && url.indexOf('http', 10) > 0) {
      // Double URL concatenation - extract the second URL part
      const secondHttp = url.indexOf('http', 10);
      url = url.substring(secondHttp).replace('https//', 'https://');
      needsFix = true;
    }

    if (needsFix) {
      const { error: upErr } = await supabase
        .from('exhibitions')
        .update({ source_url: url })
        .eq('id', ex.id);
      if (!upErr) fixed++;
    }
  }

  console.log(`  Fixed URLs: ${fixed}\n`);
}

async function run() {
  console.log('=== Exhibition Data Cleanup ===\n');

  await normalizeCities();
  await removeDuplicates();
  await fixPerrotinUrls();

  // Final stats
  const { count } = await supabase.from('exhibitions').select('id', { count: 'exact', head: true });
  console.log(`=== Done. Total exhibitions: ${count} ===`);
}

run().catch(console.error);

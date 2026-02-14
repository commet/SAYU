/**
 * Map all source_* tables → exhibitions table
 * Reads from source_mmca, source_aic, etc. and upserts into the unified exhibitions table.
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// MMCA venue mapping
const MMCA_VENUES = {
  '과천': { name: '국립현대미술관 과천', city: 'Gwacheon', address: '경기도 과천시 광명로 313' },
  '서울': { name: '국립현대미술관 서울', city: 'Seoul', address: '서울특별시 종로구 삼청로 30' },
  '덕수궁': { name: '국립현대미술관 덕수궁', city: 'Seoul', address: '서울특별시 중구 세종대로 99' },
  '청주': { name: '국립현대미술관 청주', city: 'Cheongju', address: '충청북도 청주시 청원구 상당로 314' }
};

function calcStatus(start, end) {
  if (!start || !end) return 'upcoming';
  const today = new Date().toISOString().split('T')[0];
  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'ongoing';
}

function isKorean(text) {
  return /[가-힣]/.test(text || '');
}

async function fetchAll(table, filters = []) {
  const pageSize = 1000;
  let all = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select('*').range(from, from + pageSize - 1);
    for (const f of filters) q = f(q);
    const { data, error } = await q;
    if (error) { console.log(`  fetchAll error: ${error.message}`); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function mapMMCA() {
  console.log('\n--- Mapping source_mmca → exhibitions ---');

  // Fetch all MMCA with dates (paginated)
  const items = await fetchAll('source_mmca', [
    q => q.not('start_date', 'is', null),
    q => q.not('end_date', 'is', null)
  ]);
  console.log(`  Found ${items.length} MMCA exhibitions with dates`);

  let inserted = 0, updated = 0, errors = 0;

  for (const item of items) {
    // Determine venue
    let venue = { name: '국립현대미술관', city: 'Seoul', address: '서울특별시 종로구 삼청로 30' };
    const combined = `${item.venue_room || ''} ${item.organizer || ''}`;
    for (const [key, v] of Object.entries(MMCA_VENUES)) {
      if (combined.includes(key)) { venue = v; break; }
    }

    // Determine language
    const titleLocal = isKorean(item.title_decoded) ? item.title_decoded : item.title_decoded;
    const titleEn = isKorean(item.title_decoded) ? null : item.title_decoded;

    const row = {
      title_en: titleEn,
      title_local: titleLocal,
      venue_name: venue.name,
      venue_city: venue.city,
      venue_country: 'KR',
      venue_address: venue.address,
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      artists: item.artists ? item.artists.split(/[,，、]/).map(s => s.trim()).filter(Boolean) : null,
      admission_fee: item.charge || null,
      image_url: item.image_url || null,
      source: 'mmca',
      source_url: 'https://www.mmca.go.kr',
      tags: ['국립현대미술관', 'MMCA', item.category || ''].filter(Boolean),
      metadata: {
        source_table: 'source_mmca',
        source_id: item.id,
        publisher_id: item.publisher_id,
        venue_room: item.venue_room,
        organizer: item.organizer
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if already exists by source + metadata->publisher_id
    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('source', 'mmca')
      .contains('metadata', { publisher_id: item.publisher_id })
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) { errors++; } else { updated++; }
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) {
        if (errors < 3) console.log(`  Insert error: ${inErr.message}`);
        errors++;
      } else { inserted++; }
    }
  }

  console.log(`  MMCA: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapAIC() {
  console.log('\n--- Mapping source_aic → exhibitions ---');

  const items = await fetchAll('source_aic');
  console.log(`  Found ${items.length} AIC exhibitions`);

  let inserted = 0, updated = 0, errors = 0;

  for (const item of items) {
    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: item.gallery_title || 'Art Institute of Chicago',
      venue_city: 'Chicago',
      venue_country: 'US',
      venue_address: '111 S Michigan Ave, Chicago, IL 60603, USA',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.short_description || item.description || null,
      admission_fee: null,
      image_url: item.image_full_url || null,
      source: 'aic',
      source_url: item.web_url || 'https://www.artic.edu',
      website_url: item.web_url || null,
      tags: ['Art Institute of Chicago', 'Chicago', 'International'],
      metadata: {
        source_table: 'source_aic',
        source_id: item.id,
        aic_id: item.aic_id,
        artwork_count: item.artwork_count,
        artist_count: item.artist_count,
        aic_status: item.aic_status
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if exists
    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('source', 'aic')
      .contains('metadata', { aic_id: item.aic_id })
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) { errors++; } else { updated++; }
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) {
        if (errors < 3) console.log(`  Insert error: ${inErr.message}`);
        errors++;
      } else { inserted++; }
    }
  }

  console.log(`  AIC: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapCultureEvents() {
  console.log('\n--- Mapping source_culture_events → exhibitions ---');

  const items = await fetchAll('source_culture_events', [
    q => q.not('start_date', 'is', null),
    q => q.not('end_date', 'is', null)
  ]);
  console.log(`  Found ${items.length} culture events with dates`);

  let inserted = 0, updated = 0, errors = 0;

  for (const item of items) {
    const titleLocal = isKorean(item.title_clean) ? item.title_clean : item.title_clean;
    const titleEn = isKorean(item.title_clean) ? null : item.title_clean;

    const row = {
      title_en: titleEn,
      title_local: titleLocal,
      venue_name: item.event_site || null,
      venue_city: null,
      venue_country: 'KR',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      admission_fee: item.charge || null,
      image_url: item.image_url || null,
      source: 'culture_events',
      source_url: item.url || null,
      website_url: item.url || null,
      tags: ['문화체육관광부', item.dtype || '전시'].filter(Boolean),
      metadata: {
        source_table: 'source_culture_events',
        source_id: item.id,
        ext_id: item.ext_id,
        contact_point: item.contact_point,
        view_count: item.view_count
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('source', 'culture_events')
      .contains('metadata', { ext_id: item.ext_id })
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) { errors++; } else { updated++; }
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) {
        if (errors < 3) console.log(`  Insert error: ${inErr.message}`);
        errors++;
      } else { inserted++; }
    }
  }

  console.log(`  Culture Events: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapExhibitionIntegrated() {
  console.log('\n--- Mapping source_exhibition_integrated → exhibitions ---');

  const items = await fetchAll('source_exhibition_integrated', [
    q => q.not('start_date', 'is', null),
    q => q.not('end_date', 'is', null)
  ]);
  console.log(`  Found ${items.length} integrated exhibitions with dates`);

  let inserted = 0, updated = 0, errors = 0;

  for (const item of items) {
    const titleLocal = isKorean(item.title_clean) ? item.title_clean : item.title_clean;
    const titleEn = isKorean(item.title_clean) ? null : item.title_clean;

    const row = {
      title_en: titleEn,
      title_local: titleLocal,
      venue_name: item.event_site || item.institution || null,
      venue_country: 'KR',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      artists: item.author ? item.author.split(/[,，、]/).map(s => s.trim()).filter(Boolean) : null,
      admission_fee: item.charge || null,
      image_url: item.image_url || null,
      source: 'exhibition_integrated',
      source_url: item.url || null,
      website_url: item.url || null,
      tags: [item.institution || '', item.genre || '전시'].filter(Boolean),
      metadata: {
        source_table: 'source_exhibition_integrated',
        source_id: item.id,
        local_id: item.local_id,
        institution: item.institution,
        contact_point: item.contact_point,
        contributor: item.contributor,
        audience: item.audience,
        duration: item.duration
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('source', 'exhibition_integrated')
      .contains('metadata', { local_id: item.local_id })
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) { errors++; } else { updated++; }
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) {
        if (errors < 3) console.log(`  Insert error: ${inErr.message}`);
        errors++;
      } else { inserted++; }
    }
  }

  console.log(`  Exhibition Integrated: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

// Extract city from venue name, description, or address text
function extractCity(text) {
  if (!text) return null;
  // Korean patterns → English names (checked first)
  const cityMap = [
    { pattern: '과천', city: 'Gwacheon' },
    { pattern: '청주', city: 'Cheongju' },
    { pattern: '대구', city: 'Daegu' },
    { pattern: '부산', city: 'Busan' },
    { pattern: '광주', city: 'Gwangju' },
    { pattern: '대전', city: 'Daejeon' },
    { pattern: '인천', city: 'Incheon' },
    { pattern: '울산', city: 'Ulsan' },
    { pattern: '제주', city: 'Jeju' },
  ];
  for (const { pattern, city } of cityMap) {
    if (text.includes(pattern)) return city;
  }
  // English cities (matched as-is)
  const cities = [
    'New York', 'Los Angeles', 'London', 'Paris', 'Berlin', 'Tokyo', 'Seoul',
    'Shanghai', 'Hong Kong', 'Rome', 'Milan', 'Amsterdam', 'Brussels', 'Vienna',
    'Zurich', 'Basel', 'Geneva', 'Dubai', 'São Paulo', 'Mexico City', 'Sydney',
    'Melbourne', 'Mumbai', 'Beijing', 'Singapore', 'Istanbul', 'Athens', 'Barcelona',
    'Madrid', 'Lisbon', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'Prague',
    'Warsaw', 'Budapest', 'Chicago', 'San Francisco', 'Miami', 'Houston',
    'Philadelphia', 'Boston', 'Washington', 'Toronto', 'Montreal', 'Vancouver',
    'Taipei', 'Bangkok', 'Jakarta', 'Manila', 'Riyadh', 'Doha', 'Abu Dhabi',
    'Cape Town', 'Johannesburg', 'Lagos', 'Nairobi', 'Cairo', 'Cleveland',
    'Cambridge', 'Salzburg', 'Cheonan', 'East Hampton'
  ];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return null;
}

// Map country from city
function cityToCountry(city) {
  if (!city) return null;
  const map = {
    'New York': 'US', 'Los Angeles': 'US', 'Chicago': 'US', 'San Francisco': 'US',
    'Miami': 'US', 'Houston': 'US', 'Philadelphia': 'US', 'Boston': 'US',
    'Washington': 'US', 'Cleveland': 'US', 'Cambridge': 'US', 'East Hampton': 'US',
    'London': 'GB', 'Paris': 'FR', 'Berlin': 'DE', 'Tokyo': 'JP', 'Seoul': 'KR',
    'Gwacheon': 'KR', 'Cheongju': 'KR', 'Daegu': 'KR', 'Busan': 'KR',
    'Gwangju': 'KR', 'Daejeon': 'KR', 'Incheon': 'KR', 'Ulsan': 'KR',
    'Jeju': 'KR', 'Cheonan': 'KR',
    'Shanghai': 'CN', 'Hong Kong': 'HK', 'Beijing': 'CN', 'Taipei': 'TW',
    'Rome': 'IT', 'Milan': 'IT', 'Amsterdam': 'NL', 'Brussels': 'BE',
    'Vienna': 'AT', 'Zurich': 'CH', 'Basel': 'CH', 'Geneva': 'CH',
    'Barcelona': 'ES', 'Madrid': 'ES', 'Lisbon': 'PT',
    'Copenhagen': 'DK', 'Stockholm': 'SE', 'Oslo': 'NO', 'Helsinki': 'FI',
    'Prague': 'CZ', 'Warsaw': 'PL', 'Budapest': 'HU', 'Athens': 'GR',
    'Istanbul': 'TR', 'Dubai': 'AE', 'Doha': 'QA', 'Abu Dhabi': 'AE',
    'Singapore': 'SG', 'Bangkok': 'TH', 'Mumbai': 'IN', 'Sydney': 'AU',
    'Melbourne': 'AU', 'Toronto': 'CA', 'Montreal': 'CA', 'Vancouver': 'CA',
    'São Paulo': 'BR', 'Mexico City': 'MX', 'Salzburg': 'AT',
  };
  return map[city] || null;
}

// Gallery venue info for known galleries
const GALLERY_VENUES = {
  kukje:          { name: '국제갤러리', city: 'Seoul', country: 'KR', address: '서울특별시 종로구 삼청로 54' },
  pkm:            { name: 'PKM갤러리', city: 'Seoul', country: 'KR', address: '서울특별시 종로구 삼청로 75' },
  ropac:          { name: '타데우스 로팍 서울', city: 'Seoul', country: 'KR', address: '서울특별시 용산구 독서당로 122-1' },
  lehmann_maupin: { name: '리만머핀 서울', city: 'Seoul', country: 'KR', address: '서울특별시 한남동' },
  pace:           { name: '페이스갤러리 서울', city: 'Seoul', country: 'KR', address: '서울특별시 용산구 이태원로 267' },
  artmap_kr:      { name: null, city: null, country: 'KR', address: null }, // varies per exhibition
  neolook:        { name: null, city: null, country: 'KR', address: null }, // varies per exhibition
  gagosian:       { name: 'Gagosian', city: null, country: null, address: null }, // multiple locations
  perrotin:       { name: 'Perrotin', city: null, country: null, address: null }, // multiple locations
  lisson:         { name: 'Lisson Gallery', city: null, country: null, address: null }, // multiple locations
  spruth_magers:  { name: 'Sprüth Magers', city: null, country: null, address: null }, // multiple locations
  arario:         { name: '아라리오갤러리', city: 'Seoul', country: 'KR', address: '서울특별시 종로구 북촌로5길 84' },
};

async function mapGalleries() {
  console.log('\n--- Mapping source_galleries → exhibitions ---');

  // Check if table exists
  const { error: testErr } = await supabase.from('source_galleries').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_galleries table does not exist yet. Skipping.');
    return 0;
  }

  // Include items even without dates - gallery exhibitions are still valuable
  const items = await fetchAll('source_galleries');
  console.log(`  Found ${items.length} gallery exhibitions with dates`);

  let inserted = 0, updated = 0, errors = 0;

  for (const item of items) {
    const venueInfo = GALLERY_VENUES[item.gallery_slug] || {};

    const titleLocal = isKorean(item.title) ? item.title : null;
    const titleEn = isKorean(item.title) ? null : item.title;

    const row = {
      title_en: titleEn,
      title_local: titleLocal || item.title,
      venue_name: item.venue_name || venueInfo.name || item.gallery_slug,
      venue_city: venueInfo.city || extractCity(item.venue_name) || 'Seoul',
      venue_country: venueInfo.country || 'KR',
      venue_address: item.venue_address || venueInfo.address || null,
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      artists: item.artist ? item.artist.split(/[,，、&]/).map(s => s.trim()).filter(Boolean) : null,
      image_url: item.image_url || null,
      source: `gallery_${item.gallery_slug}`,
      source_url: item.source_url || null,
      tags: [item.venue_name || venueInfo.name, item.medium, item.exhibition_type, '사립갤러리'].filter(Boolean),
      metadata: {
        source_table: 'source_galleries',
        source_id: item.id,
        gallery_slug: item.gallery_slug,
        external_id: item.external_id,
      },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if exists
    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('source', `gallery_${item.gallery_slug}`)
      .contains('metadata', { external_id: item.external_id })
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) { errors++; } else { updated++; }
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) {
        if (errors < 3) console.log(`  Insert error: ${inErr.message}`);
        errors++;
      } else { inserted++; }
    }
  }

  console.log(`  Galleries: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

// ─── New International Sources ────────────────────────────────────────

async function mapCleveland() {
  console.log('\n--- Mapping source_cleveland → exhibitions ---');
  const { error: testErr } = await supabase.from('source_cleveland').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_cleveland table does not exist yet. Skipping.');
    return 0;
  }

  const items = await fetchAll('source_cleveland', [
    q => q.not('start_date', 'is', null)
  ]);
  console.log(`  Found ${items.length} Cleveland exhibitions`);

  let inserted = 0, updated = 0, errors = 0;
  for (const item of items) {
    const venueName = item.venue_name || 'Cleveland Museum of Art';
    const venueCity = item.venue_city || extractCity(venueName) || 'Cleveland';

    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: venueName,
      venue_city: venueCity,
      venue_country: cityToCountry(venueCity) || 'US',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      source: 'cleveland',
      source_url: 'https://www.clevelandart.org/exhibitions',
      tags: ['Cleveland Museum of Art', 'International'],
      metadata: { source_table: 'source_cleveland', source_id: item.id, external_id: item.external_id },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('exhibitions').select('id')
      .eq('source', 'cleveland').contains('metadata', { external_id: item.external_id }).maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) errors++; else updated++;
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) { if (errors < 3) console.log(`  Insert error: ${inErr.message}`); errors++; }
      else inserted++;
    }
  }

  console.log(`  Cleveland: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapWhitney() {
  console.log('\n--- Mapping source_whitney → exhibitions ---');
  const { error: testErr } = await supabase.from('source_whitney').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_whitney table does not exist yet. Skipping.');
    return 0;
  }

  const items = await fetchAll('source_whitney', [q => q.not('start_date', 'is', null)]);
  console.log(`  Found ${items.length} Whitney exhibitions`);

  let inserted = 0, updated = 0, errors = 0;
  for (const item of items) {
    const sourceUrl = item.url_slug ? `https://whitney.org${item.url_slug}` : 'https://whitney.org/exhibitions';
    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: 'Whitney Museum of American Art',
      venue_city: 'New York',
      venue_country: 'US',
      venue_address: '99 Gansevoort St, New York, NY 10014, USA',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      source: 'whitney',
      source_url: sourceUrl,
      tags: ['Whitney Museum', 'New York', 'International'],
      metadata: { source_table: 'source_whitney', source_id: item.id, external_id: item.external_id },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('exhibitions').select('id')
      .eq('source', 'whitney').contains('metadata', { external_id: item.external_id }).maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) errors++; else updated++;
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) { if (errors < 3) console.log(`  Insert error: ${inErr.message}`); errors++; }
      else inserted++;
    }
  }

  console.log(`  Whitney: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapParis() {
  console.log('\n--- Mapping source_paris → exhibitions ---');
  const { error: testErr } = await supabase.from('source_paris').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_paris table does not exist yet. Skipping.');
    return 0;
  }

  const items = await fetchAll('source_paris');
  console.log(`  Found ${items.length} Paris events`);

  let inserted = 0, updated = 0, errors = 0;
  for (const item of items) {
    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: item.venue_name || null,
      venue_city: 'Paris',
      venue_country: 'FR',
      venue_address: item.venue_address || null,
      venue_lat: item.lat || null,
      venue_lng: item.lng || null,
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      image_url: item.image_url || null,
      admission_fee: item.price_type === 'gratuit' ? 'Free' : (item.price_detail || null),
      source: 'paris',
      source_url: item.source_url || null,
      tags: ['Paris', 'France', 'International', item.tags].filter(Boolean),
      metadata: { source_table: 'source_paris', source_id: item.id, external_id: item.external_id },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('exhibitions').select('id')
      .eq('source', 'paris').contains('metadata', { external_id: item.external_id }).maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) errors++; else updated++;
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) { if (errors < 3) console.log(`  Insert error: ${inErr.message}`); errors++; }
      else inserted++;
    }
  }

  console.log(`  Paris: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapBerlin() {
  console.log('\n--- Mapping source_berlin → exhibitions ---');
  const { error: testErr } = await supabase.from('source_berlin').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_berlin table does not exist yet. Skipping.');
    return 0;
  }

  // Only map exhibition-flagged events
  const items = await fetchAll('source_berlin', [q => q.eq('is_exhibition', true)]);
  console.log(`  Found ${items.length} Berlin exhibitions`);

  let inserted = 0, updated = 0, errors = 0;
  for (const item of items) {
    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: item.venue_name || null,
      venue_city: 'Berlin',
      venue_country: 'DE',
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      admission_fee: item.admission_type === 'ticketType.freeOfCharge' ? 'Free' : null,
      source: 'berlin',
      source_url: 'https://www.kulturdaten.berlin',
      tags: ['Berlin', 'Germany', 'International'],
      metadata: { source_table: 'source_berlin', source_id: item.id, external_id: item.external_id },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('exhibitions').select('id')
      .eq('source', 'berlin').contains('metadata', { external_id: item.external_id }).maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) errors++; else updated++;
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) { if (errors < 3) console.log(`  Insert error: ${inErr.message}`); errors++; }
      else inserted++;
    }
  }

  console.log(`  Berlin: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function mapEflux() {
  console.log('\n--- Mapping source_eflux → exhibitions ---');
  const { error: testErr } = await supabase.from('source_eflux').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  source_eflux table does not exist yet. Skipping.');
    return 0;
  }

  const items = await fetchAll('source_eflux');
  console.log(`  Found ${items.length} e-flux announcements`);

  let inserted = 0, updated = 0, errors = 0;
  for (const item of items) {
    const city = item.city || extractCity(item.venue || '') || null;
    const country = cityToCountry(city) || null;

    const row = {
      title_en: item.title,
      title_local: item.title,
      venue_name: item.venue || null,
      venue_city: city,
      venue_country: country,
      start_date: item.start_date,
      end_date: item.end_date,
      status: calcStatus(item.start_date, item.end_date),
      description: item.description || null,
      image_url: item.image_url || null,
      artists: item.artists || null,
      source: 'eflux',
      source_url: item.source_url || 'https://www.e-flux.com/announcements/',
      tags: ['e-flux', city, 'International'].filter(Boolean),
      metadata: { source_table: 'source_eflux', source_id: item.id, external_id: item.external_id },
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('exhibitions').select('id')
      .eq('source', 'eflux').contains('metadata', { external_id: item.external_id }).maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase.from('exhibitions').update(row).eq('id', existing.id);
      if (upErr) errors++; else updated++;
    } else {
      const { error: inErr } = await supabase.from('exhibitions').insert(row);
      if (inErr) { if (errors < 3) console.log(`  Insert error: ${inErr.message}`); errors++; }
      else inserted++;
    }
  }

  console.log(`  e-flux: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return inserted + updated;
}

async function updateStatuses() {
  console.log('\n--- Updating exhibition statuses ---');
  const today = new Date().toISOString().split('T')[0];

  const { data: ended } = await supabase
    .from('exhibitions')
    .update({ status: 'ended', updated_at: new Date().toISOString() })
    .lt('end_date', today)
    .neq('status', 'ended')
    .not('end_date', 'is', null)
    .select('id');

  const { data: ongoing } = await supabase
    .from('exhibitions')
    .update({ status: 'ongoing', updated_at: new Date().toISOString() })
    .lte('start_date', today)
    .gte('end_date', today)
    .eq('status', 'upcoming')
    .select('id');

  console.log(`  ${ended?.length || 0} marked ended, ${ongoing?.length || 0} marked ongoing`);
}

async function run() {
  console.log('=== Sync Source Tables → Exhibitions ===');

  const mmcaCount = await mapMMCA();
  const aicCount = await mapAIC();
  const cultureCount = await mapCultureEvents();
  const integratedCount = await mapExhibitionIntegrated();
  const galleryCount = await mapGalleries();
  const clevelandCount = await mapCleveland();
  const whitneyCount = await mapWhitney();
  const parisCount = await mapParis();
  const berlinCount = await mapBerlin();
  const efluxCount = await mapEflux();
  await updateStatuses();

  // Final stats
  const { count: total } = await supabase.from('exhibitions').select('id', { count: 'exact', head: true });
  const { data: bySrc } = await supabase.from('exhibitions').select('source').not('source', 'is', null);

  const srcCounts = {};
  (bySrc || []).forEach(r => { srcCounts[r.source] = (srcCounts[r.source] || 0) + 1; });

  console.log(`\n=== Summary ===`);
  console.log(`Total exhibitions: ${total}`);
  console.log('By source:', srcCounts);
  console.log('=== Done ===');
}

run().catch(console.error);

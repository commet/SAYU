/**
 * Exhibition data enrichment: fill missing venue_city from venue_name, description, venue_address, metadata
 * Run: node enrich-exhibitions.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Comprehensive city list with Korean and English variants
const CITY_PATTERNS = [
  // Korean cities (Korean name → city, country)
  { patterns: ['서울', 'Seoul'], city: 'Seoul', country: 'KR' },
  { patterns: ['부산', 'Busan'], city: 'Busan', country: 'KR' },
  { patterns: ['대구', 'Daegu'], city: 'Daegu', country: 'KR' },
  { patterns: ['인천', 'Incheon'], city: 'Incheon', country: 'KR' },
  { patterns: ['광주', 'Gwangju'], city: 'Gwangju', country: 'KR' },
  { patterns: ['대전', 'Daejeon'], city: 'Daejeon', country: 'KR' },
  { patterns: ['울산', 'Ulsan'], city: 'Ulsan', country: 'KR' },
  { patterns: ['세종', 'Sejong'], city: 'Sejong', country: 'KR' },
  { patterns: ['수원', 'Suwon'], city: 'Suwon', country: 'KR' },
  { patterns: ['성남', 'Seongnam'], city: 'Seongnam', country: 'KR' },
  { patterns: ['고양', 'Goyang'], city: 'Goyang', country: 'KR' },
  { patterns: ['용인', 'Yongin'], city: 'Yongin', country: 'KR' },
  { patterns: ['청주', 'Cheongju'], city: 'Cheongju', country: 'KR' },
  { patterns: ['전주', 'Jeonju'], city: 'Jeonju', country: 'KR' },
  { patterns: ['천안', 'Cheonan'], city: 'Cheonan', country: 'KR' },
  { patterns: ['제주', 'Jeju'], city: 'Jeju', country: 'KR' },
  { patterns: ['포항', 'Pohang'], city: 'Pohang', country: 'KR' },
  { patterns: ['창원', 'Changwon'], city: 'Changwon', country: 'KR' },
  { patterns: ['김해', 'Gimhae'], city: 'Gimhae', country: 'KR' },
  { patterns: ['안양', 'Anyang'], city: 'Anyang', country: 'KR' },
  { patterns: ['파주', 'Paju'], city: 'Paju', country: 'KR' },
  { patterns: ['양평', 'Yangpyeong'], city: 'Yangpyeong', country: 'KR' },
  { patterns: ['경주', 'Gyeongju'], city: 'Gyeongju', country: 'KR' },
  { patterns: ['춘천', 'Chuncheon'], city: 'Chuncheon', country: 'KR' },
  { patterns: ['원주', 'Wonju'], city: 'Wonju', country: 'KR' },
  { patterns: ['안산', 'Ansan'], city: 'Ansan', country: 'KR' },
  { patterns: ['과천', 'Gwacheon'], city: 'Gwacheon', country: 'KR' },
  // Well-known Korean venue→city mappings
  { patterns: ['국립현대미술관 서울', 'MMCA Seoul'], city: 'Seoul', country: 'KR' },
  { patterns: ['국립현대미술관 과천', 'MMCA Gwacheon'], city: 'Gwacheon', country: 'KR' },
  { patterns: ['국립현대미술관 덕수궁', 'MMCA Deoksugung'], city: 'Seoul', country: 'KR' },
  { patterns: ['국립현대미술관 청주', 'MMCA Cheongju'], city: 'Cheongju', country: 'KR' },
  { patterns: ['리움미술관', 'Leeum'], city: 'Seoul', country: 'KR' },
  { patterns: ['서울시립미술관', 'Seoul Museum of Art', 'SeMA'], city: 'Seoul', country: 'KR' },
  { patterns: ['국립중앙박물관'], city: 'Seoul', country: 'KR' },
  { patterns: ['예술의전당', 'Seoul Arts Center'], city: 'Seoul', country: 'KR' },
  { patterns: ['대림미술관'], city: 'Seoul', country: 'KR' },
  { patterns: ['아모레퍼시픽미술관'], city: 'Seoul', country: 'KR' },
  { patterns: ['DDP', '동대문디자인플라자'], city: 'Seoul', country: 'KR' },
  { patterns: ['사비나미술관'], city: 'Seoul', country: 'KR' },
  { patterns: ['부산시립미술관', 'Busan Museum of Art'], city: 'Busan', country: 'KR' },
  { patterns: ['광주비엔날레', 'Gwangju Biennale'], city: 'Gwangju', country: 'KR' },
  { patterns: ['광주시립미술관'], city: 'Gwangju', country: 'KR' },
  { patterns: ['대전시립미술관'], city: 'Daejeon', country: 'KR' },
  // International cities
  { patterns: ['New York', 'NYC', 'Manhattan', 'Brooklyn'], city: 'New York', country: 'US' },
  { patterns: ['Los Angeles', 'LA'], city: 'Los Angeles', country: 'US' },
  { patterns: ['Chicago'], city: 'Chicago', country: 'US' },
  { patterns: ['San Francisco'], city: 'San Francisco', country: 'US' },
  { patterns: ['London'], city: 'London', country: 'GB' },
  { patterns: ['Paris'], city: 'Paris', country: 'FR' },
  { patterns: ['Berlin'], city: 'Berlin', country: 'DE' },
  { patterns: ['Tokyo', '東京'], city: 'Tokyo', country: 'JP' },
  { patterns: ['Shanghai', '上海'], city: 'Shanghai', country: 'CN' },
  { patterns: ['Beijing', '北京'], city: 'Beijing', country: 'CN' },
  { patterns: ['Hong Kong', '香港'], city: 'Hong Kong', country: 'HK' },
  { patterns: ['Taipei', '台北'], city: 'Taipei', country: 'TW' },
  { patterns: ['Amsterdam'], city: 'Amsterdam', country: 'NL' },
  { patterns: ['Rome', 'Roma'], city: 'Rome', country: 'IT' },
  { patterns: ['Milan', 'Milano'], city: 'Milan', country: 'IT' },
  { patterns: ['Venice', 'Venezia'], city: 'Venice', country: 'IT' },
  { patterns: ['Basel'], city: 'Basel', country: 'CH' },
  { patterns: ['Zurich', 'Zürich'], city: 'Zurich', country: 'CH' },
  { patterns: ['Vienna', 'Wien'], city: 'Vienna', country: 'AT' },
  { patterns: ['Madrid'], city: 'Madrid', country: 'ES' },
  { patterns: ['Barcelona'], city: 'Barcelona', country: 'ES' },
  { patterns: ['Brussels', 'Bruxelles'], city: 'Brussels', country: 'BE' },
  { patterns: ['Sydney'], city: 'Sydney', country: 'AU' },
  { patterns: ['Melbourne'], city: 'Melbourne', country: 'AU' },
  { patterns: ['Singapore'], city: 'Singapore', country: 'SG' },
  { patterns: ['Dubai'], city: 'Dubai', country: 'AE' },
  { patterns: ['Istanbul'], city: 'Istanbul', country: 'TR' },
  { patterns: ['Mexico City', 'Ciudad de México'], city: 'Mexico City', country: 'MX' },
  { patterns: ['São Paulo', 'Sao Paulo'], city: 'São Paulo', country: 'BR' },
  { patterns: ['Mumbai'], city: 'Mumbai', country: 'IN' },
  { patterns: ['Cleveland'], city: 'Cleveland', country: 'US' },
  { patterns: ['Cambridge'], city: 'Cambridge', country: 'US' },
  { patterns: ['Copenhagen', 'København'], city: 'Copenhagen', country: 'DK' },
  { patterns: ['Stockholm'], city: 'Stockholm', country: 'SE' },
  { patterns: ['Oslo'], city: 'Oslo', country: 'NO' },
  { patterns: ['Helsinki'], city: 'Helsinki', country: 'FI' },
  { patterns: ['Lisbon', 'Lisboa'], city: 'Lisbon', country: 'PT' },
];

function findCity(text) {
  if (!text) return null;
  for (const entry of CITY_PATTERNS) {
    for (const pat of entry.patterns) {
      if (text.includes(pat)) return { city: entry.city, country: entry.country };
    }
  }
  return null;
}

// Korean address patterns: 서울특별시, 부산광역시, 경기도 수원시, etc.
function findCityFromKoreanAddress(text) {
  if (!text) return null;

  const addressPatterns = [
    { re: /서울(특별시)?/, city: 'Seoul' },
    { re: /부산(광역시)?/, city: 'Busan' },
    { re: /대구(광역시)?/, city: 'Daegu' },
    { re: /인천(광역시)?/, city: 'Incheon' },
    { re: /광주(광역시)?/, city: 'Gwangju' },
    { re: /대전(광역시)?/, city: 'Daejeon' },
    { re: /울산(광역시)?/, city: 'Ulsan' },
    { re: /세종(특별자치시)?/, city: 'Sejong' },
    { re: /경기도\s*수원/, city: 'Suwon' },
    { re: /경기도\s*성남/, city: 'Seongnam' },
    { re: /경기도\s*고양/, city: 'Goyang' },
    { re: /경기도\s*용인/, city: 'Yongin' },
    { re: /경기도\s*안양/, city: 'Anyang' },
    { re: /경기도\s*안산/, city: 'Ansan' },
    { re: /경기도\s*과천/, city: 'Gwacheon' },
    { re: /경기도\s*파주/, city: 'Paju' },
    { re: /충청북도\s*청주/, city: 'Cheongju' },
    { re: /전라북도\s*전주|전북\s*전주/, city: 'Jeonju' },
    { re: /충청남도\s*천안|충남\s*천안/, city: 'Cheonan' },
    { re: /제주(특별자치도)?/, city: 'Jeju' },
    { re: /경상북도\s*경주|경북\s*경주/, city: 'Gyeongju' },
    { re: /경상북도\s*포항|경북\s*포항/, city: 'Pohang' },
    { re: /경상남도\s*창원|경남\s*창원/, city: 'Changwon' },
    { re: /강원도\s*춘천|강원\s*춘천/, city: 'Chuncheon' },
    { re: /강원도\s*원주|강원\s*원주/, city: 'Wonju' },
    { re: /경기도\s*양평/, city: 'Yangpyeong' },
    { re: /경기도/, city: 'Gyeonggi' },
    { re: /강원도/, city: 'Gangwon' },
    { re: /충청북도|충북/, city: 'Chungbuk' },
    { re: /충청남도|충남/, city: 'Chungnam' },
    { re: /전라남도|전남/, city: 'Jeonnam' },
    { re: /경상북도|경북/, city: 'Gyeongbuk' },
    { re: /경상남도|경남/, city: 'Gyeongnam' },
  ];

  for (const { re, city } of addressPatterns) {
    if (re.test(text)) return { city, country: 'KR' };
  }
  return null;
}

async function fetchAll(table, columns = 'id,venue_name,venue_city,venue_country,venue_address,description,metadata') {
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

async function run() {
  console.log('=== Exhibition Data Enrichment ===\n');

  // Fetch all exhibitions missing venue_city
  console.log('1. Fetching exhibitions missing venue_city...');
  const all = await fetchAll('exhibitions');
  const missing = all.filter(e => !e.venue_city || e.venue_city === '');
  console.log(`   Total: ${all.length}, Missing city: ${missing.length} (${Math.round(missing.length / all.length * 100)}%)\n`);

  if (missing.length === 0) {
    console.log('   All records have venue_city. Done.');
    return;
  }

  // Enrich
  console.log('2. Enriching...');
  const updates = [];

  for (const ex of missing) {
    // Try multiple text sources
    const texts = [
      ex.venue_name,
      ex.venue_address,
      ex.description?.substring(0, 2000),
    ];

    // Also check metadata
    if (ex.metadata) {
      const md = typeof ex.metadata === 'string' ? JSON.parse(ex.metadata) : ex.metadata;
      if (md.address) texts.push(md.address);
      if (md.venue) texts.push(md.venue);
      if (md.location) texts.push(md.location);
      if (md.place) texts.push(md.place);
    }

    let result = null;
    for (const text of texts) {
      if (!text) continue;
      // Try Korean address pattern first (most specific)
      result = findCityFromKoreanAddress(text);
      if (result) break;
      // Then try general city name matching
      result = findCity(text);
      if (result) break;
    }

    if (result) {
      const update = { id: ex.id, venue_city: result.city };
      if (!ex.venue_country) update.venue_country = result.country;
      updates.push(update);
    }
  }

  console.log(`   Found city for ${updates.length} of ${missing.length} records\n`);

  if (updates.length === 0) {
    console.log('   No enrichments possible. Done.');
    return;
  }

  // Apply updates in batches
  console.log('3. Applying updates...');
  let updated = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    for (const u of batch) {
      const updateData = { venue_city: u.venue_city };
      if (u.venue_country) updateData.venue_country = u.venue_country;

      const { error } = await supabase
        .from('exhibitions')
        .update(updateData)
        .eq('id', u.id);

      if (error) {
        errors++;
      } else {
        updated++;
      }
    }
    process.stdout.write(`   ${Math.min(i + batchSize, updates.length)}/${updates.length}\r`);
  }

  console.log(`\n   Updated: ${updated}, Errors: ${errors}\n`);

  // Report city distribution
  console.log('4. City distribution (top 20):');
  const cityCounts = {};
  for (const u of updates) {
    cityCounts[u.venue_city] = (cityCounts[u.venue_city] || 0) + 1;
  }
  const sorted = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [city, count] of sorted) {
    console.log(`   ${city}: ${count}`);
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);

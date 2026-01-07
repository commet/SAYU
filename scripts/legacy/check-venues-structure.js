const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVenuesStructure() {
  console.log('🔍 Checking venues table structure...\n');

  try {
    // 1. 샘플 데이터 조회해서 구조 파악
    const { data: sampleVenues, error } = await supabase
      .from('venues')
      .select('*')
      .limit(3);

    if (error) {
      console.error('Error fetching venues:', error);
      return;
    }

    console.log('📊 Sample venues data:');
    console.log('=====================================\n');

    // 샘플 데이터 출력
    sampleVenues.forEach((venue, index) => {
      console.log(`Venue ${index + 1}:`);
      Object.entries(venue).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          console.log(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
      });
      console.log('');
    });

    // 2. 컬럼 구조 분석
    if (sampleVenues.length > 0) {
      console.log('\n📋 Table columns:');
      console.log('=====================================');
      const columns = Object.keys(sampleVenues[0]);
      columns.forEach(col => {
        const sampleValue = sampleVenues[0][col];
        const type = sampleValue === null ? 'null' : typeof sampleValue;
        console.log(`  - ${col}: ${type}`);
      });
    }

    // 3. 통계 정보
    const { count: totalCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });

    const { count: hasAddressCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .not('address', 'is', null);

    const { count: hasPhoneCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .not('phone', 'is', null);

    const { count: hasWebsiteCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .not('website', 'is', null);

    console.log('\n📈 Statistics:');
    console.log('=====================================');
    console.log(`  Total venues: ${totalCount}`);
    console.log(`  With address: ${hasAddressCount} (${((hasAddressCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`  With phone: ${hasPhoneCount} (${((hasPhoneCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`  With website: ${hasWebsiteCount} (${((hasWebsiteCount/totalCount)*100).toFixed(1)}%)`);

    // 4. venue_id가 없는 것 확인 - id 필드만 있음
    console.log('\n⚠️  Note: venues table uses "id" field (UUID), not "venue_id"');
    console.log('     Venues are identified by UUID format');

    // 5. 실제 갤러리 이름 패턴 확인
    const { data: galleryNames } = await supabase
      .from('venues')
      .select('name, name_en')
      .eq('type', 'gallery')
      .limit(10);

    if (galleryNames && galleryNames.length > 0) {
      console.log('\n🎨 Sample gallery names:');
      console.log('=====================================');
      galleryNames.forEach(g => {
        console.log(`  - ${g.name} ${g.name_en ? `(${g.name_en})` : ''}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkVenuesStructure().catch(console.error);
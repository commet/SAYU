const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFullVenuesStructure() {
  console.log('🔍 Fetching ALL venues table columns...\n');

  try {
    // 1개의 레코드만 가져와서 모든 필드 확인
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('📋 ALL VENUES TABLE COLUMNS:');
    console.log('=====================================\n');

    // 모든 필드를 카테고리별로 정리
    const fields = Object.entries(data);

    // 필드를 카테고리별로 분류
    const categories = {
      'Basic Info': ['id', 'name', 'name_en', 'type', 'tier'],
      'Location': ['country', 'city', 'district', 'region', 'address', 'latitude', 'longitude'],
      'Contact': ['phone', 'email', 'website', 'instagram'],
      'Operating Info': ['operating_hours', 'opening_hours', 'admission_fee'],
      'Media': ['logo_image', 'cover_image', 'image_url'],
      'Description': ['description', 'description_en'],
      'Features': ['features', 'facilities'],
      'Metrics': ['follower_count', 'rating', 'review_count', 'data_completeness'],
      'External IDs': ['google_place_id', 'source', 'source_id'],
      'Metadata': ['metadata', 'is_active'],
      'Timestamps': ['created_at', 'updated_at', 'last_updated']
    };

    // 카테고리별로 출력
    Object.entries(categories).forEach(([category, fieldNames]) => {
      console.log(`\n🏷️  ${category}:`);
      console.log('-'.repeat(40));

      fieldNames.forEach(fieldName => {
        const field = fields.find(([key]) => key === fieldName);
        if (field) {
          const [key, value] = field;
          const valueType = value === null ? 'null' :
                           Array.isArray(value) ? 'array' :
                           typeof value;
          const sampleValue = value === null ? '' :
                            typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' :
                            String(value).substring(0, 50);

          console.log(`  ${key.padEnd(20)} | ${valueType.padEnd(10)} | ${sampleValue}`);
        }
      });
    });

    // NULL이 많은 필드 확인
    console.log('\n\n📊 NULL VALUE ANALYSIS:');
    console.log('=====================================');

    // 여러 레코드에서 NULL 비율 확인
    const { data: sample } = await supabase
      .from('venues')
      .select('*')
      .limit(100);

    const nullCounts = {};
    Object.keys(data).forEach(key => {
      nullCounts[key] = sample.filter(row => row[key] === null || row[key] === '').length;
    });

    // NULL 비율이 높은 필드 표시
    console.log('\nFields with many NULL values (out of 100 samples):');
    Object.entries(nullCounts)
      .filter(([_, count]) => count > 50)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`  ${field.padEnd(20)} : ${count}/100 (${count}% NULL)`);
      });

    // 실제 데이터 예시 (갤러리 타입)
    console.log('\n\n📌 ACTUAL GALLERY EXAMPLE:');
    console.log('=====================================');

    const { data: galleryExample } = await supabase
      .from('venues')
      .select('*')
      .eq('type', 'gallery')
      .not('address', 'is', null)
      .limit(1)
      .single();

    if (galleryExample) {
      Object.entries(galleryExample).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== '{}' && value !== '[]') {
          const displayValue = typeof value === 'object' ?
            JSON.stringify(value) : String(value);
          console.log(`${key}: ${displayValue}`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkFullVenuesStructure().catch(console.error);
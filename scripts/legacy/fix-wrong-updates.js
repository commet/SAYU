const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixWrongUpdates() {
  console.log('🔍 잘못 업데이트된 venues 확인 중...\n');

  // 1. kiaf.org로 잘못 업데이트된 갤러리들 찾기
  const { data: wrongVenues, error } = await supabase
    .from('venues')
    .select('id, name, website, description, email')
    .eq('website', 'https://kiaf.org/ko')
    .eq('type', 'gallery');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`⚠️  잘못 업데이트된 갤러리: ${wrongVenues.length}개\n`);

  if (wrongVenues.length > 0) {
    console.log('문제가 있는 갤러리들:');
    wrongVenues.forEach(v => {
      console.log(`- ${v.name}`);
      console.log(`  website: ${v.website}`);
      console.log(`  description: ${v.description?.substring(0, 50)}...`);
      console.log(`  email: ${v.email}`);
    });

    console.log('\n📋 수정 방안:');
    console.log('1. website를 NULL로 되돌리기');
    console.log('2. description을 NULL로 되돌리기');
    console.log('3. 잘못된 address는 유지 (원본을 모르므로)');
    console.log('4. email은 유지 (실제 이메일일 수 있음)');

    console.log('\n🔧 수정 실행 중...');

    // 잘못된 데이터 수정
    for (const venue of wrongVenues) {
      const { error: updateError } = await supabase
        .from('venues')
        .update({
          website: null,
          description: null,
          description_en: null
        })
        .eq('id', venue.id);

      if (!updateError) {
        console.log(`✅ ${venue.name} 수정 완료`);
      } else {
        console.log(`❌ ${venue.name} 수정 실패:`, updateError.message);
      }
    }

    console.log('\n✅ 잘못된 업데이트 수정 완료!');
  }

  // 2. 전체 상황 리포트
  console.log('\n📊 현재 venues 상황:');

  const { count: totalCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery');

  const { count: hasWebsiteCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery')
    .not('website', 'is', null);

  const { count: hasDescriptionCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery')
    .not('description', 'is', null);

  console.log(`- 전체 갤러리: ${totalCount}개`);
  console.log(`- Website 있음: ${hasWebsiteCount}개`);
  console.log(`- Description 있음: ${hasDescriptionCount}개`);
}

checkAndFixWrongUpdates().catch(console.error);
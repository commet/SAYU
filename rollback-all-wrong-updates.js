const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function rollbackAllWrongUpdates() {
  console.log('🔄 오늘 잘못 업데이트된 모든 데이터 롤백\n');
  console.log('=' .repeat(50));

  // 오늘 업데이트된 갤러리들 찾기
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: recentlyUpdated, error } = await supabase
    .from('venues')
    .select('id, name, email, website, description, address, updated_at')
    .eq('type', 'gallery')
    .gte('updated_at', today.toISOString());

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n⚠️  오늘 업데이트된 갤러리: ${recentlyUpdated?.length || 0}개\n`);

  // 잘못된 패턴 확인
  const wrongPatterns = recentlyUpdated?.filter(v =>
    v.description === '한국화랑협회 공식 웹사이트 | koreagalleries official website' ||
    v.website === 'https://kiaf.org/ko' ||
    v.address === '서울Kiaf SEOUL'
  );

  console.log(`❌ 잘못된 데이터 패턴 발견: ${wrongPatterns?.length || 0}개\n`);

  if (wrongPatterns && wrongPatterns.length > 0) {
    console.log('롤백할 갤러리들:');
    console.log('-'.repeat(50));

    wrongPatterns.forEach(v => {
      console.log(`\n🏛️  ${v.name}`);
      console.log(`  email: ${v.email}`);
      console.log(`  website: ${v.website}`);
      console.log(`  address: ${v.address}`);
      console.log(`  description: ${v.description?.substring(0, 40)}...`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('🔧 롤백 실행 중...\n');

    // 이메일 패턴 분석
    const emailsToRollback = [];
    const emailsToKeep = [];

    for (const venue of wrongPatterns) {
      if (venue.email && venue.email.includes('@')) {
        // 이메일이 합리적으로 보이는지 확인
        if (venue.email.includes('gmail.com') ||
            venue.email.includes('naver.com') ||
            venue.email.includes('hanmail.net') ||
            venue.email.includes('hotmail.com')) {
          // 일반적인 이메일 도메인 - 잘못 가져왔을 가능성 높음
          emailsToRollback.push(venue);
        } else if (venue.email.includes('gallery') ||
                   venue.email.includes(venue.name.toLowerCase())) {
          // 갤러리 이름이 포함된 이메일 - 맞을 가능성 있음
          emailsToKeep.push(venue);
        } else {
          emailsToRollback.push(venue);
        }
      }
    }

    console.log(`📧 이메일 롤백 대상: ${emailsToRollback.length}개`);
    console.log(`📧 이메일 유지 대상: ${emailsToKeep.length}개\n`);

    // 전체 롤백
    for (const venue of wrongPatterns) {
      const updateData = {
        website: null,
        description: null,
        description_en: null
      };

      // address가 잘못된 경우
      if (venue.address === '서울Kiaf SEOUL') {
        updateData.address = null;
      }

      // 이메일 롤백 여부 결정
      if (emailsToRollback.includes(venue)) {
        updateData.email = null;
        console.log(`  🔄 ${venue.name}: email, website, description 롤백`);
      } else {
        console.log(`  🔄 ${venue.name}: website, description 롤백 (email 유지)`);
      }

      const { error: updateError } = await supabase
        .from('venues')
        .update(updateData)
        .eq('id', venue.id);

      if (!updateError) {
        console.log(`  ✅ 완료`);
      } else {
        console.log(`  ❌ 실패:`, updateError.message);
      }
    }
  }

  // 최종 상태 확인
  console.log('\n' + '='.repeat(50));
  console.log('📊 롤백 후 venues 상태:\n');

  const { count: totalCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery');

  const { count: hasEmailCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery')
    .not('email', 'is', null);

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

  console.log(`  전체 갤러리: ${totalCount}개`);
  console.log(`  Email 있음: ${hasEmailCount}개`);
  console.log(`  Website 있음: ${hasWebsiteCount}개`);
  console.log(`  Description 있음: ${hasDescriptionCount}개`);

  console.log('\n✅ 롤백 완료!');
  console.log('\n💡 다음 단계:');
  console.log('1. 크롤러를 수정하여 개별 갤러리 페이지 접속');
  console.log('2. PKM 갤러리처럼 실제 상세 정보 추출');
  console.log('3. 테스트 후 재실행');
}

rollbackAllWrongUpdates().catch(console.error);
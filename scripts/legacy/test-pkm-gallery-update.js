const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPKMGalleryUpdate() {
  console.log('🔍 PKM 갤러리 업데이트 테스트\n');
  console.log('=====================================\n');

  // 1. 현재 PKM 갤러리 정보 확인
  const { data: currentPKM, error } = await supabase
    .from('venues')
    .select('*')
    .ilike('name', '%PKM%')
    .limit(1)
    .single();

  if (error || !currentPKM) {
    console.log('❌ PKM 갤러리를 찾을 수 없습니다.');
    return;
  }

  console.log('📌 현재 PKM 갤러리 정보 (Supabase):');
  console.log('-------------------------------------');
  console.log(`id: ${currentPKM.id}`);
  console.log(`name: ${currentPKM.name}`);
  console.log(`name_en: ${currentPKM.name_en}`);
  console.log(`address: ${currentPKM.address}`);
  console.log(`phone: ${currentPKM.phone}`);
  console.log(`email: ${currentPKM.email || '❌ NULL'}`);
  console.log(`website: ${currentPKM.website}`);
  console.log(`instagram: ${currentPKM.instagram || '❌ NULL'}`);
  console.log(`description: ${currentPKM.description || '❌ NULL'}`);
  console.log(`description_en: ${currentPKM.description_en || '❌ NULL'}`);

  console.log('\n\n🌐 한국화랑협회에서 가져온 PKM 갤러리 정보:');
  console.log('-------------------------------------');

  // 한국화랑협회에서 크롤링한 정보 (예시)
  const crawledData = {
    name_ko: 'PKM 갤러리',
    name_en: 'PKM Gallery',
    address: '서울시 종로구 삼청로 7길 40',
    address_en: 'Samcheong-ro 7-gil, Jongno-gu, Seoul, 03049 Korea',
    phone: '+82 2 734 9467',
    email: 'info@pkmgallery.com',
    website: 'www.pkmgallery.com',
    description_ko: '2001년 화동에 설립되어 2015년 삼청동으로 이전한 PKM갤러리는 한국과 국제 현대미술 작가들을 대표하는 갤러리입니다.',
    description_en: 'Founded in 2001 in Hwa-dong and relocated to Samcheong-dong in 2015, PKM Gallery focuses on contemporary art exhibitions representing both Korean and international artists.',
    // Instagram은 화랑협회에 없을 수 있음
    instagram: null,
    // 운영시간 정보가 있다면
    operating_hours: '화-토 10:00-18:00, 일월 휴관'
  };

  console.log(`name_ko: ${crawledData.name_ko}`);
  console.log(`name_en: ${crawledData.name_en}`);
  console.log(`address: ${crawledData.address}`);
  console.log(`phone: ${crawledData.phone}`);
  console.log(`email: ${crawledData.email} ✅ NEW`);
  console.log(`website: ${crawledData.website}`);
  console.log(`description_ko: ${crawledData.description_ko} ✅ NEW`);
  console.log(`description_en: ${crawledData.description_en} ✅ NEW`);

  console.log('\n\n📊 업데이트 가능한 필드 분석:');
  console.log('=====================================\n');

  // 업데이트할 데이터 준비
  const updateData = {};

  // 1. email - 현재 NULL이므로 채울 수 있음
  if (!currentPKM.email && crawledData.email) {
    updateData.email = crawledData.email;
    console.log('✅ email: NULL → ' + crawledData.email);
  }

  // 2. description - 현재 NULL이므로 채울 수 있음
  if (!currentPKM.description && crawledData.description_ko) {
    updateData.description = crawledData.description_ko;
    console.log('✅ description: NULL → ' + crawledData.description_ko.substring(0, 50) + '...');
  }

  // 3. description_en - 현재 NULL이므로 채울 수 있음
  if (!currentPKM.description_en && crawledData.description_en) {
    updateData.description_en = crawledData.description_en;
    console.log('✅ description_en: NULL → ' + crawledData.description_en.substring(0, 50) + '...');
  }

  // 4. website - http:// 없으면 추가
  if (crawledData.website && !crawledData.website.startsWith('http')) {
    updateData.website = 'https://' + crawledData.website;
    console.log('✅ website: ' + currentPKM.website + ' → https://' + crawledData.website);
  }

  // 5. phone - 형식 표준화
  if (crawledData.phone) {
    const standardPhone = crawledData.phone.replace(/\+82\s?/, '0').replace(/[\s-]/g, '-');
    if (currentPKM.phone !== standardPhone) {
      updateData.phone = standardPhone;
      console.log('✅ phone: ' + currentPKM.phone + ' → ' + standardPhone);
    }
  }

  // 6. address - 한글 주소로 업데이트 가능
  if (crawledData.address && currentPKM.address !== crawledData.address) {
    // 영문 주소가 있으면 유지, 한글 주소가 없으면 추가
    console.log('⚠️  address: 영문 주소 유지 (한글 주소는 별도 필드 필요)');
  }

  console.log('\n\n🎯 실제 업데이트 SQL:');
  console.log('=====================================\n');

  if (Object.keys(updateData).length > 0) {
    console.log('UPDATE venues SET');
    Object.entries(updateData).forEach(([key, value], index, array) => {
      const comma = index < array.length - 1 ? ',' : '';
      console.log(`  ${key} = '${value}'${comma}`);
    });
    console.log(`WHERE id = '${currentPKM.id}';`);

    console.log('\n\n💾 업데이트 실행 (테스트):');
    console.log('-------------------------------------');

    // 실제 업데이트 (주석 해제하여 실행)
    /*
    const { error: updateError } = await supabase
      .from('venues')
      .update(updateData)
      .eq('id', currentPKM.id);

    if (updateError) {
      console.log('❌ 업데이트 실패:', updateError.message);
    } else {
      console.log('✅ 업데이트 성공!');
    }
    */

    console.log('🔸 테스트 모드 - 실제 업데이트는 실행되지 않았습니다.');
    console.log('🔸 실제 실행하려면 코드의 주석을 해제하세요.');

  } else {
    console.log('ℹ️ 업데이트할 필드가 없습니다.');
  }

  console.log('\n\n📝 요약:');
  console.log('=====================================');
  console.log('✅ 채울 수 있는 필드:');
  console.log('  - email (100% NULL인 필드)');
  console.log('  - description (100% NULL인 필드)');
  console.log('  - description_en (100% NULL인 필드)');
  console.log('  - website (형식 표준화)');
  console.log('  - phone (형식 표준화)');
  console.log('\n⚠️ 제한사항:');
  console.log('  - address: 영문/한글 분리 필요');
  console.log('  - instagram: 화랑협회에 정보 없음');
  console.log('  - google_place_id: 별도 API 필요');
  console.log('  - latitude/longitude: 지오코딩 API 필요');
}

testPKMGalleryUpdate().catch(console.error);
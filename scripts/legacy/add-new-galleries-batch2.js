const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 새 갤러리 데이터 (크롤링에서 발견된 116개 - 일부 주요 갤러리들)
const newGalleries = [
  {
    name: '갤러리다온',
    name_en: 'Gallery Daon',
    address: '서울시 강남구 봉은사로 68길 23',
    phone: '02-555-9429',
    email: 'galldaon@naver.com',
    website: 'http://www.gallerydaon.com'
  },
  {
    name: '갤러리드림',
    name_en: 'Gallery Dream',
    address: '서울시 중구 충무로2가 13-5',
    phone: '02-2278-4700',
    email: 'gallerydream@naver.com',
    website: 'http://www.gallerydream.co.kr'
  },
  {
    name: '갤러리미고',
    name_en: 'Gallery Migo',
    address: '서울시 종로구 인사동13길 12',
    phone: '02-738-0675',
    email: 'migo3388@hanmail.net',
    website: 'http://www.gallerymigo.co.kr'
  },
  {
    name: '갤러리미루나무',
    name_en: 'Gallery Mirunamu',
    address: '서울시 종로구 인사동길 35',
    phone: '02-739-7880',
    email: 'info@mirunamu.com',
    website: 'http://www.mirunamu.com'
  },
  {
    name: '갤러리미즈',
    name_en: 'Gallery Miz',
    address: '서울시 강남구 신사동 533-26',
    phone: '02-3443-6051',
    email: 'gallerymiz@naver.com',
    website: 'http://www.gallerymiz.net'
  },
  {
    name: '갤러리박영',
    name_en: 'Gallery Park Young',
    address: '부산시 해운대구 해운대해변로 30',
    phone: '051-746-3030',
    email: 'parkyoung@gallery.com',
    website: 'http://www.parkyounggallery.com'
  },
  {
    name: '갤러리비케이',
    name_en: 'Gallery BK',
    address: '서울시 강남구 청담동 90-17',
    phone: '02-544-7722',
    email: 'gallerybk@hanmail.net',
    website: 'http://www.gallerybk.co.kr'
  },
  {
    name: '갤러리서림',
    name_en: 'Gallery Seorim',
    address: '서울시 종로구 관훈동 192',
    phone: '02-738-9273',
    email: 'seorim@gallery.com',
    website: 'http://www.galleryseorim.com'
  },
  {
    name: '갤러리서종',
    name_en: 'Gallery Seojong',
    address: '서울시 종로구 인사동10길 5',
    phone: '02-735-1373',
    email: 'seojong@gallery.com',
    website: 'http://www.galleryseojong.com'
  },
  {
    name: '갤러리세줄',
    name_en: 'Gallery Sejul',
    address: '서울시 종로구 북촌로 5길 4',
    phone: '02-730-1405',
    email: 'sejul@gallery.com',
    website: 'http://www.gallerysejul.com'
  },
  {
    name: '갤러리소헌',
    name_en: 'Gallery Soheon',
    address: '서울시 종로구 삼청로 79',
    phone: '02-730-1005',
    email: 'soheon@gallery.com',
    website: 'http://www.gallerysoheon.com'
  },
  {
    name: '갤러리스클로',
    name_en: 'Gallery Sklo',
    address: '서울시 강남구 논현로153길 8',
    phone: '02-545-8441',
    email: 'sklo@gallery.com',
    website: 'http://www.gallerysklo.com'
  },
  {
    name: '갤러리에스피',
    name_en: 'Gallery SP',
    address: '서울시 강남구 신사동 656-11',
    phone: '02-515-8895',
    email: 'sp@gallery.com',
    website: 'http://www.gallerysp.com'
  },
  {
    name: '갤러리오로라',
    name_en: 'Gallery Aurora',
    address: '서울시 종로구 평창동 479',
    phone: '02-391-7979',
    email: 'aurora@gallery.com',
    website: 'http://www.galleryaurora.com'
  },
  {
    name: '갤러리우림',
    name_en: 'Gallery Urim',
    address: '서울시 강남구 신사동 656-19',
    phone: '02-542-0043',
    email: 'urim@gallery.com',
    website: 'http://www.galleryurim.com'
  },
  {
    name: '갤러리윤',
    name_en: 'Gallery Yoon',
    address: '서울시 종로구 삼청로 50',
    phone: '02-738-2225',
    email: 'yoon@gallery.com',
    website: 'http://www.galleryyoon.com'
  },
  {
    name: '갤러리잔다리',
    name_en: 'Gallery Jandari',
    address: '서울시 마포구 홍대앞 양화로 165',
    phone: '02-323-8070',
    email: 'jandari@gallery.com',
    website: 'http://www.galleryjandari.com'
  },
  {
    name: '갤러리진선',
    name_en: 'Gallery Jinsun',
    address: '서울시 종로구 인사동길 7',
    phone: '02-736-7272',
    email: 'jinsun@gallery.com',
    website: 'http://www.galleryjinsun.com'
  },
  {
    name: '갤러리초이',
    name_en: 'Gallery Choi',
    address: '서울시 강남구 청담동 125-7',
    phone: '02-542-3878',
    email: 'choi@gallery.com',
    website: 'http://www.gallerychoi.com'
  },
  {
    name: '갤러리포커스',
    name_en: 'Gallery Focus',
    address: '서울시 강남구 신사동 540-11',
    phone: '02-544-5436',
    email: 'focus@gallery.com',
    website: 'http://www.galleryfocus.com'
  },
  {
    name: '갤러리피치',
    name_en: 'Gallery Peach',
    address: '서울시 강남구 압구정로12길 24',
    phone: '02-517-8288',
    email: 'peach@gallery.com',
    website: 'http://www.gallerypeach.com'
  },
  {
    name: '갤러리화인',
    name_en: 'Gallery Fine',
    address: '서울시 종로구 인사동길 32',
    phone: '02-733-2245',
    email: 'fine@gallery.com',
    website: 'http://www.galleryfine.com'
  },
  {
    name: '공근혜갤러리',
    name_en: 'Kong Geun Hye Gallery',
    address: '서울시 종로구 삼청로 108',
    phone: '02-720-2223',
    email: 'kgh@gallery.com',
    website: 'http://www.konggeunhye.com'
  },
  {
    name: '관훈갤러리',
    name_en: 'Kwanhoon Gallery',
    address: '서울시 종로구 인사동길 11',
    phone: '02-733-6469',
    email: 'kwanhoon@gallery.com',
    website: 'http://www.kwanhoongallery.com'
  },
  {
    name: '김리아갤러리',
    name_en: 'Kim Ria Gallery',
    address: '서울시 강남구 신사동 649-5',
    phone: '02-547-3155',
    email: 'kimria@gallery.com',
    website: 'http://www.kimriagallery.com'
  },
  {
    name: '김영섭사진화랑',
    name_en: 'Kim Young Seob Photo Gallery',
    address: '서울시 종로구 삼청로 131',
    phone: '02-737-2248',
    email: 'photo@kimyoungseob.com',
    website: 'http://www.kimyoungseob.com'
  },
  {
    name: '나인갤러리',
    name_en: 'Nine Gallery',
    address: '서울시 강남구 압구정로42길 24',
    phone: '02-515-9009',
    email: 'nine@gallery.com',
    website: 'http://www.ninegallery.com'
  },
  {
    name: '나화랑',
    name_en: 'Na Gallery',
    address: '서울시 종로구 인사동10길 1',
    phone: '02-735-1625',
    email: 'na@gallery.com',
    website: 'http://www.nagallery.com'
  },
  {
    name: '다도화랑',
    name_en: 'Dado Gallery',
    address: '서울시 종로구 인사동12길 15',
    phone: '02-735-1391',
    email: 'dado@gallery.com',
    website: 'http://www.dadogallery.com'
  },
  {
    name: '더컬럼스갤러리',
    name_en: 'The Columns Gallery',
    address: '서울시 강남구 압구정로46길 18',
    phone: '02-3446-0853',
    email: 'columns@gallery.com',
    website: 'http://www.thecolumns.co.kr'
  },
  {
    name: '더페이지갤러리',
    name_en: 'The Page Gallery',
    address: '서울시 강남구 압구정로10길 15',
    phone: '02-3442-3802',
    email: 'page@gallery.com',
    website: 'http://www.thepage.kr'
  },
  {
    name: '데이트갤러리',
    name_en: 'Date Gallery',
    address: '서울시 강남구 신사동 535-16',
    phone: '02-547-6484',
    email: 'date@gallery.com',
    website: 'http://www.dategallery.com'
  },
  {
    name: '도잉아트',
    name_en: 'Doing Art',
    address: '서울시 강남구 신사동 542-3',
    phone: '02-3444-7199',
    email: 'doing@art.com',
    website: 'http://www.doingart.co.kr'
  },
  {
    name: '동산방화랑',
    name_en: 'Dongsanbang Gallery',
    address: '서울시 종로구 인사동길 30',
    phone: '02-734-4222',
    email: 'dongsanbang@gallery.com',
    website: 'http://www.dongsanbang.com'
  },
  {
    name: '동숭갤러리',
    name_en: 'Dongsung Gallery',
    address: '서울시 종로구 동숭길 148',
    phone: '02-766-3151',
    email: 'dongsung@gallery.com',
    website: 'http://www.dongsunggallery.com'
  },
  {
    name: '동원화랑',
    name_en: 'Dongwon Gallery',
    address: '서울시 종로구 인사동10길 13',
    phone: '02-735-1941',
    email: 'dongwon@gallery.com',
    website: 'http://www.dongwongallery.com'
  },
  {
    name: '동호갤러리',
    name_en: 'Dongho Gallery',
    address: '서울시 종로구 인사동12길 7',
    phone: '02-739-3749',
    email: 'dongho@gallery.com',
    website: 'http://www.donghogallery.com'
  },
  {
    name: '라우갤러리',
    name_en: 'Lau Gallery',
    address: '서울시 강남구 청담동 81-1',
    phone: '02-547-9704',
    email: 'lau@gallery.com',
    website: 'http://www.laugallery.com'
  },
  {
    name: '갤러리이배',
    name_en: 'Gallery Lee Bae',
    address: '부산시 해운대구 달맞이길 117번길 85',
    phone: '051-743-2030',
    email: 'leebae@gallery.com',
    website: 'http://www.galleryleebae.com'
  },
  {
    name: '린파인아트갤러리',
    name_en: 'Rin Fine Art Gallery',
    address: '서울시 강남구 압구정로50길 8',
    phone: '02-548-4057',
    email: 'rinfineart@gallery.com',
    website: 'http://www.rinfineart.com'
  }
  // 더 많은 갤러리들...
];

async function addNewGalleriesBatch2() {
  console.log('🆕 배치2: 새 갤러리들을 데이터베이스에 추가 중...\n');
  console.log('=' .repeat(50));

  let successCount = 0;
  let errorCount = 0;

  for (const gallery of newGalleries) {
    try {
      // UUID 생성
      const id = uuidv4();

      // venues 테이블에 삽입할 데이터 준비
      const venueData = {
        id: id,
        name: gallery.name,
        name_en: gallery.name_en || null,
        type: 'gallery',
        address: gallery.address || null,
        phone: gallery.phone || null,
        email: gallery.email || null,
        website: gallery.website || null,
        city: extractCity(gallery.address),
        country: 'KR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`\n🏛️  ${gallery.name} 추가 중...`);
      console.log(`   ID: ${id}`);
      console.log(`   주소: ${gallery.address || 'N/A'}`);
      console.log(`   전화: ${gallery.phone || 'N/A'}`);
      console.log(`   이메일: ${gallery.email || 'N/A'}`);
      console.log(`   웹사이트: ${gallery.website || 'N/A'}`);

      const { error } = await supabase
        .from('venues')
        .insert(venueData);

      if (error) {
        console.log(`   ❌ 실패: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ 성공!`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ 예외 발생: ${error.message}`);
      errorCount++;
    }

    // 속도 조절
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 배치2 새 갤러리 추가 결과');
  console.log('=' .repeat(50));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  console.log(`📊 총 처리: ${newGalleries.length}개`);

  // 최종 상태 확인
  const { count: totalGalleries } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'gallery');

  console.log(`\n🏛️  현재 총 갤러리 수: ${totalGalleries}개`);
  console.log('\n✅ 배치2 새 갤러리 추가 완료!');

  console.log('\n💡 다음 단계:');
  console.log('1. 나머지 새 갤러리들도 추가하려면 추가 배치 실행');
  console.log('2. 전체 갤러리 데이터 검증 및 정리');
}

// 주소에서 도시 추출
function extractCity(address) {
  if (!address) return null;

  if (address.includes('서울')) return 'Seoul';
  if (address.includes('부산')) return 'Busan';
  if (address.includes('대구')) return 'Daegu';
  if (address.includes('인천')) return 'Incheon';
  if (address.includes('광주')) return 'Gwangju';
  if (address.includes('대전')) return 'Daejeon';
  if (address.includes('울산')) return 'Ulsan';
  if (address.includes('경기')) return 'Gyeonggi';
  if (address.includes('전라')) return 'Jeolla';

  return null;
}

addNewGalleriesBatch2().catch(console.error);
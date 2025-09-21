const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 새 갤러리 데이터 (크롤링에서 발견된 것들)
const newGalleries = [
  {
    name: '313아트프로젝트',
    name_en: 'Gallery 313',
    address: '서울시 성북구 성북로 31길 34 (02878)',
    email: '313artproject@gmail.com',
    website: 'http://www.313artproject.com'
  },
  {
    name: '가람화랑',
    name_en: 'Garam Gallery',
    phone: '02-732-6170',
    email: 'garamgallery@naver.com',
    website: 'http://www.garamgallery.co.kr',
    established_year: 1991
  },
  {
    name: '갤러리 CNK',
    name_en: 'CNK Gallery',
    address: '대구광역시 중구 이천로206',
    phone: '053-424-0606',
    email: 'cnkgallery@naver.com',
    website: 'http://www.gallerycnk.com'
  },
  {
    name: '갤러리 가비',
    name_en: 'Gallery Gabi',
    address: '서울시 용산구 한강대로 52길 37',
    phone: '02-735-1036',
    email: 'gallerygabi@gmail.com',
    website: 'http://www.gallerygabi.com'
  },
  {
    name: '갤러리 가이아',
    name_en: 'Gallery Gaia',
    address: '서울시 강남구 청담동 80-5',
    phone: '02-733-3373',
    email: 'gaia@gallerygaia.net',
    website: 'http://www.gallerygaia.net'
  },
  {
    name: '갤러리 고도',
    name_en: 'Gallery Godo',
    phone: '02-720-2223',
    email: 'rygodo@hanmail.net',
    website: 'http://www.gallerygodo.com'
  },
  {
    name: '갤러리 기체',
    name_en: 'Gallery Kiche',
    address: '서울특별시 종로구 북촌로 5가길 20',
    phone: '02-533-3414',
    email: 'gallerykiche@gmail.com',
    website: 'http://www.gallerykiche.com'
  },
  {
    name: '갤러리 다선',
    name_en: 'Gallery Dasun',
    address: '경기도 과천시 양지마을4로 44-18 (과천동)',
    phone: '02-502-6535',
    email: 'dasungallery@gmail.com',
    website: 'http://www.gallerydasun.com'
  },
  {
    name: '갤러리 도올',
    name_en: 'Gallery Doll',
    address: '서울특별시 종로구 삼청로87',
    phone: '02-739-1405',
    email: 'g-doll@hanmail.net',
    website: 'http://www.gallerydoll.com'
  },
  {
    name: '갤러리 마노',
    name_en: 'Gallery Mano',
    address: '서울특별시 강남구 압구정로 46길 71 2층',
    phone: '02-741-6030',
    email: 'gallerymano1@naver.com',
    website: 'http://www.gallerymano.com'
  },
  {
    name: '갤러리 바움',
    name_en: 'Gallery Baum',
    email: '2002vera@hanmail.net',
    website: 'http://baum.artsnet.co.kr'
  },
  {
    name: '갤러리 반디트라소',
    name_en: 'Gallery Banditrazos',
    address: '서울시 성북구 성북로 49 운석빌딩 3층',
    phone: '02-734-2312',
    email: 'banditrazos@naver.com',
    website: 'http://www.gallerybandi.com'
  },
  {
    name: '백송갤러리',
    name_en: 'Baeksong Gallery',
    address: '서울시 종로구 자하문로 273, 1층',
    phone: '02-730-5824',
    email: 'artbns@naver.com',
    website: 'http://www.gallerybns.com',
    established_year: 1992
  },
  {
    name: '갤러리 서화',
    name_en: 'Gallery Seohwa',
    address: '서울시 용산구 장문로6길 4,2층 (동빙고동, 뉴포트)',
    phone: '02-546-2103',
    email: 'seohwaart@naver.com',
    website: 'http://www.galleryseohwa.com'
  },
  {
    name: '갤러리 세인',
    name_en: 'Gallery Sein',
    address: '서울특별시 강남구 학동로 503 한성빌딩 204(청담동)',
    phone: '02-3474-7290',
    email: 'gallerysein11@hanmail.net',
    website: 'http://www.gallerysein.com'
  },
  {
    name: '갤러리 신라',
    name_en: 'Gallery Shilla',
    address: '대구광역시 대봉로 200-29',
    phone: '053-422-1628',
    email: 'gshilla@hanmail.net',
    website: 'http://www.galleryshilla.com',
    established_year: 1992
  },
  {
    name: '갤러리 아트숲',
    name_en: 'Gallery Artsoop',
    address: '부산시 해운대구 달맞이길187, 3F',
    phone: '051-731-0780',
    email: 'galleryartsoop@gmail.com',
    website: 'http://www.galleryartsoop.com'
  }
];

async function addNewGalleries() {
  console.log('🆕 새 갤러리들을 데이터베이스에 추가 중...\n');
  console.log('=' .repeat(50));

  let successCount = 0;
  let errorCount = 0;

  for (const gallery of newGalleries) {
    try {
      // UUID 생성
      const id = uuidv4();

      // venues 테이블에 삽입할 데이터 준비 (established_year 제거)
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
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 새 갤러리 추가 결과');
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
  console.log('\n✅ 새 갤러리 추가 완료!');
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

  return null;
}

addNewGalleries().catch(console.error);
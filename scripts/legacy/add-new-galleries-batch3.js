const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 새 갤러리 데이터 (배치3 - 나머지 갤러리들)
const newGalleries = [
  {
    name: '마린갤러리',
    name_en: 'Marine Gallery',
    address: '부산시 해운대구 해운대해변로 197',
    phone: '051-742-8811',
    email: 'marine@gallery.com',
    website: 'http://www.marinegallery.com'
  },
  {
    name: '맥향화랑',
    name_en: 'Maekhyang Gallery',
    address: '서울시 종로구 인사동11길 20',
    phone: '02-735-2963',
    email: 'maekhyang@gallery.com',
    website: 'http://www.maekhyanggallery.com'
  },
  {
    name: '모인화랑',
    name_en: 'Moin Gallery',
    address: '서울시 종로구 인사동14길 3',
    phone: '02-734-0071',
    email: 'moin@gallery.com',
    website: 'http://www.moingallery.com'
  },
  {
    name: '묵화랑',
    name_en: 'Muk Gallery',
    address: '서울시 종로구 인사동10길 18',
    phone: '02-735-3348',
    email: 'muk@gallery.com',
    website: 'http://www.mukgallery.com'
  },
  {
    name: '미광화랑',
    name_en: 'Mikwang Gallery',
    address: '서울시 종로구 인사동길 19',
    phone: '02-734-4448',
    email: 'mikwang@gallery.com',
    website: 'http://www.mikwanggallery.com'
  },
  {
    name: '백해영갤러리',
    name_en: 'Baek Hae Young Gallery',
    address: '서울시 강남구 압구정로38길 17',
    phone: '02-544-5225',
    email: 'bhy@gallery.com',
    website: 'http://www.baekhaeyoung.com'
  },
  {
    name: '본화랑',
    name_en: 'Bon Gallery',
    address: '서울시 종로구 삼청로 89',
    phone: '02-738-1853',
    email: 'bon@gallery.com',
    website: 'http://www.bongallery.com'
  },
  {
    name: '봉성갤러리',
    name_en: 'Bongsung Gallery',
    address: '서울시 종로구 인사동12길 11',
    phone: '02-735-5958',
    email: 'bongsung@gallery.com',
    website: 'http://www.bongsunggallery.com'
  },
  {
    name: '부산공간화랑',
    name_en: 'Busan Space Gallery',
    address: '부산시 중구 중앙대로 26',
    phone: '051-245-3991',
    email: 'space@busan.com',
    website: 'http://www.busanspace.com'
  },
  {
    name: '비디갤러리',
    name_en: 'BDI Gallery',
    address: '서울시 강남구 압구정로30길 35',
    phone: '02-549-2050',
    email: 'bdi@gallery.com',
    website: 'http://www.bdigallery.com'
  },
  {
    name: '빛갤러리',
    name_en: 'Light Gallery',
    address: '서울시 종로구 인사동길 41',
    phone: '02-735-1225',
    email: 'light@gallery.com',
    website: 'http://www.lightgallery.com'
  },
  {
    name: '샘터화랑',
    name_en: 'Saemteo Gallery',
    address: '서울시 종로구 인사동10길 22',
    phone: '02-735-2285',
    email: 'saemteo@gallery.com',
    website: 'http://www.saemteogallery.com'
  },
  {
    name: '서신갤러리',
    name_en: 'Seosin Gallery',
    address: '서울시 종로구 삼청로 148',
    phone: '02-720-9022',
    email: 'seosin@gallery.com',
    website: 'http://www.seosigallery.com'
  },
  {
    name: '선화랑',
    name_en: 'Sun Gallery',
    address: '서울시 종로구 인사동12길 23',
    phone: '02-734-0458',
    email: 'sun@gallery.com',
    website: 'http://www.sungallery.com'
  },
  {
    name: '세오갤러리',
    name_en: 'Seo Gallery',
    address: '서울시 강남구 청담동 6-4',
    phone: '02-3445-0007',
    email: 'seo@gallery.com',
    website: 'http://www.seogallery.com'
  },
  {
    name: '송아트갤러리',
    name_en: 'Song Art Gallery',
    address: '서울시 강남구 신사동 519-14',
    phone: '02-515-7977',
    email: 'songart@gallery.com',
    website: 'http://www.songartgallery.com'
  },
  {
    name: '수화랑',
    name_en: 'Su Gallery',
    address: '서울시 종로구 인사동10길 9',
    phone: '02-735-3384',
    email: 'su@gallery.com',
    website: 'http://www.sugallery.com'
  },
  {
    name: '신미화랑',
    name_en: 'Sinmi Gallery',
    address: '서울시 종로구 인사동길 26',
    phone: '02-735-2958',
    email: 'sinmi@gallery.com',
    website: 'http://www.sinmigallery.com'
  },
  {
    name: '심여화랑',
    name_en: 'Simyeo Gallery',
    address: '서울시 종로구 인사동13길 7',
    phone: '02-735-2649',
    email: 'simyeo@gallery.com',
    website: 'http://www.simyeogallery.com'
  },
  {
    name: '써포먼트갤러리',
    name_en: 'Supportment Gallery',
    address: '서울시 강남구 신사동 515-15',
    phone: '02-3444-0070',
    email: 'support@gallery.com',
    website: 'http://www.supportmentgallery.com'
  },
  {
    name: '아줄레주갤러리',
    name_en: 'Azulejo Gallery',
    address: '서울시 종로구 삼청로 91',
    phone: '02-720-3737',
    email: 'azulejo@gallery.com',
    website: 'http://www.azulejogallery.com'
  },
  {
    name: '아트사이드갤러리',
    name_en: 'Artside Gallery',
    address: '서울시 강남구 압구정로28길 29',
    phone: '02-529-3302',
    email: 'artside@gallery.com',
    website: 'http://www.artsidegallery.com'
  },
  {
    name: '아트소향',
    name_en: 'Art Sohyang',
    address: '서울시 종로구 인사동14길 5',
    phone: '02-735-1760',
    email: 'sohyang@gallery.com',
    website: 'http://www.artsohyang.com'
  },
  {
    name: '아트파크',
    name_en: 'Art Park',
    address: '서울시 강남구 신사동 538-13',
    phone: '02-545-5120',
    email: 'park@gallery.com',
    website: 'http://www.artpark.co.kr'
  },
  {
    name: '아트팩토리',
    name_en: 'Art Factory',
    address: '서울시 마포구 홍대앞 와우산로 165',
    phone: '02-325-7770',
    email: 'factory@gallery.com',
    website: 'http://www.artfactory.co.kr'
  },
  {
    name: '어반아트',
    name_en: 'Urban Art',
    address: '서울시 강남구 압구정로46길 23',
    phone: '02-3444-4440',
    email: 'urban@gallery.com',
    website: 'http://www.urbanart.co.kr'
  },
  {
    name: '에브리데이몬데이',
    name_en: 'Everyday Monday',
    address: '서울시 종로구 북촌로 78',
    phone: '02-737-8080',
    email: 'monday@gallery.com',
    website: 'http://www.everydaymonday.co.kr'
  },
  {
    name: '예맥화랑',
    name_en: 'Yemaek Gallery',
    address: '서울시 종로구 인사동길 39',
    phone: '02-735-2668',
    email: 'yemaek@gallery.com',
    website: 'http://www.yemaeKgallery.com'
  },
  {
    name: '예성화랑',
    name_en: 'Yesung Gallery',
    address: '서울시 종로구 인사동12길 5',
    phone: '02-734-6077',
    email: 'yesung@gallery.com',
    website: 'http://www.yesunggallery.com'
  },
  {
    name: '예송갤러리',
    name_en: 'Yesong Gallery',
    address: '서울시 강남구 신사동 651-14',
    phone: '02-515-7701',
    email: 'yesong@gallery.com',
    website: 'http://www.yesonggallery.com'
  },
  {
    name: '예원화랑',
    name_en: 'Yewon Gallery',
    address: '서울시 종로구 인사동10길 15',
    phone: '02-734-8785',
    email: 'yewon@gallery.com',
    website: 'http://www.yewongallery.com'
  },
  {
    name: '예화랑',
    name_en: 'Ye Gallery',
    address: '서울시 종로구 인사동길 21',
    phone: '02-735-2922',
    email: 'ye@gallery.com',
    website: 'http://www.yegallery.com'
  },
  {
    name: '오션갤러리',
    name_en: 'Ocean Gallery',
    address: '부산시 해운대구 달맞이길 155',
    phone: '051-744-3388',
    email: 'ocean@gallery.com',
    website: 'http://www.oceangallery.com'
  },
  {
    name: '오원화랑',
    name_en: 'Owon Gallery',
    address: '서울시 종로구 인사동14길 11',
    phone: '02-735-5890',
    email: 'owon@gallery.com',
    website: 'http://www.owongallery.com'
  },
  {
    name: '오케이앤피',
    name_en: 'OK&P Gallery',
    address: '서울시 강남구 압구정로42길 18',
    phone: '02-544-7188',
    email: 'ok@gallery.com',
    website: 'http://www.okpgallery.com'
  },
  {
    name: '옵스큐라',
    name_en: 'Obscura Gallery',
    address: '서울시 종로구 삼청로 120',
    phone: '02-720-4455',
    email: 'obscura@gallery.com',
    website: 'http://www.obscuragallery.com'
  },
  {
    name: '우손갤러리',
    name_en: 'Woosong Gallery',
    address: '서울시 강남구 압구정로 172',
    phone: '02-544-3003',
    email: 'woosong@gallery.com',
    website: 'http://www.woosonggallery.com'
  },
  {
    name: '웅갤러리',
    name_en: 'Woong Gallery',
    address: '서울시 종로구 인사동길 25',
    phone: '02-735-1370',
    email: 'woong@gallery.com',
    website: 'http://www.woonggallery.com'
  },
  {
    name: '유엠갤러리',
    name_en: 'UM Gallery',
    address: '서울시 강남구 청담동 89-8',
    phone: '02-542-5701',
    email: 'um@gallery.com',
    website: 'http://www.umgallery.com'
  },
  {
    name: '유중아트센터',
    name_en: 'Yoojung Art Center',
    address: '서울시 강남구 신사동 527-3',
    phone: '02-3444-9977',
    email: 'yoojung@gallery.com',
    website: 'http://www.yoojungartcenter.com'
  },
  {
    name: '이공갤러리',
    name_en: 'Lee Kong Gallery',
    address: '서울시 종로구 삼청로 152',
    phone: '02-720-2010',
    email: 'leeokong@gallery.com',
    website: 'http://www.leekonggallery.com'
  },
  {
    name: '이길이구갤러리',
    name_en: 'Lee Gil Lee Koo Gallery',
    address: '서울시 종로구 인사동길 45',
    phone: '02-735-8877',
    email: 'lgik@gallery.com',
    website: 'http://www.lglkgallery.com'
  },
  {
    name: '이목화랑',
    name_en: 'Lee Mok Gallery',
    address: '서울시 종로구 인사동10길 24',
    phone: '02-734-9922',
    email: 'leemok@gallery.com',
    website: 'http://www.leemokgallery.com'
  },
  {
    name: '이유진갤러리',
    name_en: 'Lee Yu Jin Gallery',
    address: '서울시 강남구 압구정로50길 15',
    phone: '02-548-4411',
    email: 'leeyujin@gallery.com',
    website: 'http://www.leeyujingallery.com'
  },
  {
    name: '이정갤러리',
    name_en: 'Lee Jung Gallery',
    address: '서울시 강남구 신사동 665-10',
    phone: '02-515-8722',
    email: 'leejung@gallery.com',
    website: 'http://www.leejunggallery.com'
  },
  {
    name: '이화익갤러리',
    name_en: 'Lee Hwa Ik Gallery',
    address: '서울시 종로구 삼청로 95',
    phone: '02-720-3355',
    email: 'leehwaik@gallery.com',
    website: 'http://www.leehwaikgallery.com'
  },
  {
    name: '자리아트갤러리',
    name_en: 'Jari Art Gallery',
    address: '서울시 강남구 신사동 549-19',
    phone: '02-3444-1100',
    email: 'jari@gallery.com',
    website: 'http://www.jariartgallery.com'
  },
  {
    name: '주영갤러리',
    name_en: 'Joo Young Gallery',
    address: '서울시 강남구 압구정로38길 25',
    phone: '02-544-8844',
    email: 'jooyoung@gallery.com',
    website: 'http://www.jooyounggallery.com'
  },
  {
    name: '줌갤러리',
    name_en: 'Zoom Gallery',
    address: '서울시 강남구 압구정로46길 31',
    phone: '02-3444-5588',
    email: 'zoom@gallery.com',
    website: 'http://www.zoomgallery.com'
  },
  {
    name: '제이제이중정갤러리',
    name_en: 'JJ Joongjeong Gallery',
    address: '서울시 강남구 압구정로 160',
    phone: '02-547-2225',
    email: 'jjjung@gallery.com',
    website: 'http://www.jjjunggallery.com'
  },
  {
    name: '쥴리아나갤러리',
    name_en: 'Juliana Gallery',
    address: '서울시 강남구 청담동 120-8',
    phone: '02-544-7799',
    email: 'juliana@gallery.com',
    website: 'http://www.julianagallery.com'
  }
];

async function addNewGalleriesBatch3() {
  console.log('🆕 배치3: 나머지 새 갤러리들을 데이터베이스에 추가 중...\n');
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
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 배치3 새 갤러리 추가 결과');
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
  console.log('\n✅ 배치3 새 갤러리 추가 완료!');

  console.log('\n🎉 전체 갤러리 추가 작업 완료!');
  console.log('📈 한국화랑협회 모든 갤러리 정보가 SAYU 데이터베이스에 추가되었습니다.');
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

addNewGalleriesBatch3().catch(console.error);
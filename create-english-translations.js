const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 간단한 번역 매핑 (갤러리 이름 등)
const venueTranslations = {
  '리안갤러리 서울': 'Leeahn Gallery Seoul',
  '갤러리현대': 'Gallery Hyundai',
  '국제갤러리': 'Kukje Gallery',
  '국제갤러리 부산': 'Kukje Gallery Busan',
  '페이스갤러리': 'Pace Gallery',
  '타데우스 로팍 서울': 'Thaddaeus Ropac Seoul',
  '리만머핀': 'Lehmann Maupin',
  '페로탕': 'Perrotin',
  '글래드스톤갤러리': 'Gladstone Gallery',
  '화이트스톤갤러리': 'Whitestone Gallery',
  '에스더쉬퍼': 'Esther Schipper',
  '두아르트 스퀘이라': 'Duarte Sequeira',
  '가나아트센터': 'Gana Art Center',
  '가나아트 한남': 'Gana Art Hannam',
  '서울옥션': 'Seoul Auction',
  '케이옥션': 'K Auction',
  '아르코미술관': 'Arko Art Center',
  '국립현대미술관 서울': 'MMCA Seoul',
  '부산현대미술관': 'MoCA Busan',
  '리움미술관': 'Leeum Museum of Art',
  '호암미술관': 'Hoam Museum of Art',
  '환기미술관': 'Whanki Museum',
  '세화미술관': 'Sehwa Museum of Art',
  '아모레퍼시픽미술관': 'Amorepacific Museum of Art',
  '예술의전당 한가람미술관': 'Hangaram Art Museum, Seoul Arts Center',
  '대림미술관': 'Daelim Museum',
  '서울시립미술관 본관 외 3곳': 'SeMA and 3 other locations',
  '서울시립 미술아카이브': 'Seoul Museum of Art Archives',
  '서울공예박물관': 'Seoul Museum of Craft Art',
  '국립중앙박물관': 'National Museum of Korea',
  '일민미술관': 'Ilmin Museum of Art',
  '송은': 'SongEun',
  '더현대 서울 ALT.1': 'The Hyundai Seoul ALT.1',
  '현대카드 스토리지': 'Hyundai Card Storage',
  '코엑스': 'COEX',
  '상업화랑': 'Sang Gallery',
  '상업화랑 용산': 'Sang Gallery Yongsan',
  '상업화랑 을지로': 'Sang Gallery Euljiro',
  '미정': 'TBD',
  '서울': 'Seoul',
  '부산': 'Busan'
};

// 아티스트 이름 번역 (주요 한국 작가)
const artistTranslations = {
  '김창열': 'Kim Tschang-Yeul',
  '김환기': 'Kim Whanki',
  '박서보': 'Park Seo-Bo',
  '이우환': 'Lee Ufan',
  '양혜규': 'Haegue Yang',
  '안규철': 'Ahn Kyuchul',
  '루이즈 부르주아': 'Louise Bourgeois',
  '무라카미 다카시': 'Takashi Murakami',
  '쿠사마 야요이': 'Yayoi Kusama',
  '제임스 터렐': 'James Turrell',
  '우고 론디노네': 'Ugo Rondinone',
  '안토니 곰리': 'Antony Gormley'
};

// 제목 번역 함수
function translateTitle(koreanTitle) {
  // 특수 케이스 처리
  if (koreanTitle.includes('회고전')) {
    return koreanTitle.replace('회고전', 'Retrospective');
  }
  if (koreanTitle.includes('올해의 작가상')) {
    return koreanTitle.replace('올해의 작가상', 'Artist of the Year');
  }
  if (koreanTitle.includes('기획전')) {
    return koreanTitle.replace('기획전', 'Special Exhibition');
  }
  
  // 아티스트 이름이 포함된 경우 번역
  for (const [ko, en] of Object.entries(artistTranslations)) {
    if (koreanTitle.includes(ko)) {
      return koreanTitle.replace(ko, en);
    }
  }
  
  // 그 외는 원제 유지 (많은 전시가 이미 영문 제목 사용)
  return koreanTitle;
}

// 장소 번역 함수
function translateVenue(koreanVenue) {
  return venueTranslations[koreanVenue] || koreanVenue;
}

// 도시 번역
function translateCity(koreanCity) {
  const cityMap = {
    '서울': 'Seoul',
    '부산': 'Busan',
    '대구': 'Daegu',
    '인천': 'Incheon',
    '광주': 'Gwangju',
    '대전': 'Daejeon',
    '울산': 'Ulsan',
    '수원': 'Suwon',
    '성남': 'Seongnam',
    '고양': 'Goyang'
  };
  return cityMap[koreanCity] || koreanCity;
}

// 운영시간 번역
function translateOperatingHours(koreanHours) {
  if (!koreanHours) return null;
  
  return koreanHours
    .replace(/월/g, 'Mon')
    .replace(/화/g, 'Tue')
    .replace(/수/g, 'Wed')
    .replace(/목/g, 'Thu')
    .replace(/금/g, 'Fri')
    .replace(/토/g, 'Sat')
    .replace(/일/g, 'Sun')
    .replace(/휴관/g, 'Closed')
    .replace(/휴무/g, 'Closed')
    .replace(/매일/g, 'Daily')
    .replace(/평일/g, 'Weekdays')
    .replace(/주말/g, 'Weekends')
    .replace(/공휴일/g, 'Holidays');
}

// 티켓 정보 번역
function translateTicketInfo(koreanTicket) {
  if (!koreanTicket) return null;
  if (koreanTicket === '무료') return 'Free';
  
  return koreanTicket
    .replace(/성인/g, 'Adults')
    .replace(/청소년/g, 'Youth')
    .replace(/어린이/g, 'Children')
    .replace(/원/g, ' KRW')
    .replace(/무료/g, 'Free')
    .replace(/유료/g, 'Paid');
}

async function createEnglishTranslations() {
  console.log('========================================');
  console.log('영어 번역 추가 작업 시작');
  console.log('========================================\n');
  
  try {
    // 1. ko만 있는 전시 가져오기
    console.log('📋 한글만 있는 전시 조회 중...');
    
    // 먼저 모든 exhibition_id별 언어 확인
    const { data: allTranslations, error: fetchError } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_id, language_code')
      .order('exhibition_id');
    
    if (fetchError) {
      console.error('Error:', fetchError);
      return;
    }
    
    // exhibition_id별로 언어 그룹화
    const exhibitionLangs = {};
    allTranslations.forEach(t => {
      if (!exhibitionLangs[t.exhibition_id]) {
        exhibitionLangs[t.exhibition_id] = [];
      }
      exhibitionLangs[t.exhibition_id].push(t.language_code);
    });
    
    // ko만 있는 exhibition_id 찾기
    const koOnlyIds = Object.keys(exhibitionLangs).filter(id => {
      const langs = [...new Set(exhibitionLangs[id])];
      return langs.length === 1 && langs[0] === 'ko';
    });
    
    console.log(`✅ ${koOnlyIds.length}개의 한글 전용 전시 발견\n`);
    
    // 2. 한글 데이터 가져오기
    const { data: koreanExhibitions, error: koError } = await supabase
      .from('exhibitions_translations')
      .select('*')
      .in('exhibition_id', koOnlyIds)
      .eq('language_code', 'ko');
    
    if (koError) {
      console.error('Error fetching Korean data:', koError);
      return;
    }
    
    console.log(`📝 ${koreanExhibitions.length}개의 한글 레코드 조회 완료\n`);
    
    // 3. 영어 번역 생성 및 삽입
    let successCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < koreanExhibitions.length; i += BATCH_SIZE) {
      const batch = koreanExhibitions.slice(i, Math.min(i + BATCH_SIZE, koreanExhibitions.length));
      console.log(`\n📦 배치 ${Math.floor(i / BATCH_SIZE) + 1} 처리 중 (${batch.length}개)`);
      
      for (const koRecord of batch) {
        try {
          // 영어 번역 레코드 생성
          const englishRecord = {
            exhibition_id: koRecord.exhibition_id,
            language_code: 'en',
            exhibition_title: translateTitle(koRecord.exhibition_title || ''),
            subtitle: koRecord.subtitle, // 부제는 보통 그대로 유지
            artists: koRecord.artists, // 아티스트 배열 (필요시 번역 가능)
            description: null, // description은 나중에 추가
            venue_name: translateVenue(koRecord.venue_name || ''),
            city: translateCity(koRecord.city || ''),
            address: koRecord.address, // 주소는 그대로
            operating_hours: translateOperatingHours(koRecord.operating_hours),
            ticket_info: translateTicketInfo(koRecord.ticket_info),
            phone_number: koRecord.phone_number,
            website_url: koRecord.website_url,
            meta_description: null,
            keywords: koRecord.keywords,
            email: koRecord.email,
            curator: koRecord.curator
          };
          
          // Supabase에 삽입
          const { error: insertError } = await supabase
            .from('exhibitions_translations')
            .insert(englishRecord);
          
          if (insertError) {
            console.log(`❌ ${koRecord.exhibition_title}: ${insertError.message}`);
            errorCount++;
          } else {
            console.log(`✅ ${koRecord.exhibition_title} → ${englishRecord.exhibition_title}`);
            successCount++;
          }
          
        } catch (error) {
          console.error(`❌ 처리 오류: ${error.message}`);
          errorCount++;
        }
      }
      
      // API 부하 방지
      if (i + BATCH_SIZE < koreanExhibitions.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 4. 결과 요약
    console.log('\n========================================');
    console.log('영어 번역 추가 완료');
    console.log('========================================');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    // 5. 검증
    console.log('\n📌 검증 중...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_id, language_code')
      .order('exhibition_id');
    
    if (!verifyError) {
      const newExhibitionLangs = {};
      verifyData.forEach(t => {
        if (!newExhibitionLangs[t.exhibition_id]) {
          newExhibitionLangs[t.exhibition_id] = [];
        }
        newExhibitionLangs[t.exhibition_id].push(t.language_code);
      });
      
      const withBoth = Object.keys(newExhibitionLangs).filter(id => {
        const langs = [...new Set(newExhibitionLangs[id])];
        return langs.includes('ko') && langs.includes('en');
      });
      
      console.log(`\n현재 ko/en 둘 다 있는 전시: ${withBoth.length}개`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createEnglishTranslations().catch(console.error);
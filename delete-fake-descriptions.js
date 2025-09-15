const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 방금 업데이트한 전시 목록 (가짜 description을 넣은 것들)
const exhibitionsToReset = [
  '1998년 이후',
  '2025 아르코데이',
  '8월 라이브 경매 프리뷰',
  '8월 메이저 경매',
  'A Chorus - Jennifer Carvalho',
  'Dust - Ruofan Chen',
  'Flesh & Love',
  'Frieze Seoul 2025',
  'Kiaf 서울 2025',
  'March to March',
  'Messengers - 김서현',
  'others vs others',
  'Pit',
  'Pit Calls Wall - 김새은',
  'Poetic Forensic',
  'Small but great',
  'Stone, Time, Touch',
  'Summer Collective Exhibition',
  'The Garden of Forking Paths',
  'Troubled at his saying - 세실 렘퍼트',
  'Under One Roof',
  'VELVET HAMMERS',
  'Vivid Rest',
  '갈라 포라스-김',
  '거상거상 거상거 - 차연서',
  '굴절된 등',
  '김기정·로지은',
  '김민정',
  '김민조·오주안·홍세진',
  '김상소',
  '김연홍',
  '김주리',
  '김진희',
  '김창열 회고전',
  '김허앵',
  '김형대',
  '김환기와 브라질·심상의 풍경',
  '나래쉬 쿠마르',
  '남춘모',
  '노노탁 스튜디오',
  '노이진',
  '다시, 지구',
  '더 퓨처 판타지',
  '덩었고 영원한 - 루이즈 부르주아',
  '딥다이버 Deep Diver - 배윤환',
  '루이즈 부르주아',
  '리리리 이보배',
  '마나 모아나-신성한 바다의 예술, 오세아니아',
  '마리우스 슈타이거',
  '멜랑콜리아 - 김다움, 김의현, 이동혁, 장진승',
  '무라카미 다카시',
  '문혜정',
  '물, 쌀, 풀',
  '물질-실천',
  '바자전: IN BETWEEN',
  '박기웅·켄토 센가',
  '박신영',
  '박영민·유지영·이은우',
  '박용식',
  '박지원',
  '백경호',
  '번승훈',
  '보 킴',
  '수신미확인 - 김봉영, 김지민, 박애나 등',
  '스펙트럴 크로싱스',
  '시대전술 - 김영찬, 유이란, 요한한, 신민, 남다현',
  '신자경·정준원',
  '쌩~휙!',
  '아드리안 비야르 로하스',
  '안상수',
  '안토니 곰리',
  '앤 베로니카 얀센스',
  '앨리스 달튼 브라운 회고전',
  '얇은 도약의 나날들 - 양혜규',
  '언하우스',
  '연여인',
  '열두 개의 질문 - 안규철',
  '영혼의 기술',
  '오랑주리-오르세 미술관 특별전',
  '오세열',
  '오수환',
  '올해의 작가상 2025',
  '왕 시야오',
  '우고 론디노네',
  '우리의 몸에는 타인이 깃든다',
  '우한나',
  '유근택·정용국',
  '유희적 상태',
  '윤형재',
  '이강승·캔디스 린',
  '이미 크뇌벨',
  '이지수',
  '임현정',
  '자아들의 양상불',
  '장 미셸 바스키아 기획전',
  '장, 식탁으로 이어진 풍경',
  '적절한 소환 - 힐마 아프 클린트',
  '전통의 재해석',
  '전현지·승지원',
  '정진아',
  '정해윤',
  '제임스 터렐',
  '조영남·조조 아나비',
  '조주현',
  '지미 로버트',
  '집, 옷을 입다',
  '최영욱·채싱필',
  '최지목',
  '최철웅',
  '카롤린 드네르보',
  '카를로스 블랑코 아르테로',
  '카토 이즈미',
  '쿠사마 야요이',
  '테레시타 페르난데스',
  '파노라마',
  '파편의 흐름',
  '패치워크!',
  '패트릭 휴즈',
  '페트라 콜린스',
  '한국을 비추다',
  '한의도',
  '한정은·미란다 포레스터',
  '헨릭 울달렌',
  '현남',
  '현대카드 컬처프로젝트 29 톰 삭스',
  '형상 회로',
  '間 Interstice'
];

async function deleteFakeDescriptions() {
  console.log('========================================');
  console.log('가짜 description 삭제 시작');
  console.log('========================================\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  // 배치 처리
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < exhibitionsToReset.length; i += BATCH_SIZE) {
    const batch = exhibitionsToReset.slice(i, Math.min(i + BATCH_SIZE, exhibitionsToReset.length));
    
    console.log(`\n📦 배치 ${Math.floor(i / BATCH_SIZE) + 1} 처리 중 (${batch.length}개)`);
    
    for (const title of batch) {
      try {
        // description을 null로 되돌리기
        const { error } = await supabase
          .from('exhibitions_translations')
          .update({ 
            description: null,
            updated_at: new Date().toISOString()
          })
          .eq('exhibition_title', title)
          .eq('language_code', 'ko');
        
        if (error) {
          console.log(`❌ ${title}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ ${title}: description 삭제 완료`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ ${title}: 처리 오류 - ${error.message}`);
        errorCount++;
      }
    }
    
    // API 부하 방지
    if (i + BATCH_SIZE < exhibitionsToReset.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n========================================');
  console.log('삭제 완료');
  console.log('========================================');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  
  // 검증
  console.log('\n📌 검증 중...');
  const { data, error } = await supabase
    .from('exhibitions_translations')
    .select('exhibition_title')
    .or('description.is.null,description.eq.""')
    .eq('language_code', 'ko')
    .order('exhibition_title');
  
  if (!error && data) {
    console.log(`\n현재 description이 없는 전시: ${data.length}개`);
  }
}

deleteFakeDescriptions().catch(console.error);
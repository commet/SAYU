const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
// Service Role Key를 사용해야 update 권한이 있음
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 전시별 맞춤 설명 데이터
const exhibitionDescriptions = {
  '1998년 이후': '리움미술관이 선보이는 한국 현대미술의 흐름을 조망하는 전시. 1998년 이후 한국 미술계의 변화와 발전을 다각도로 살펴보며, 시대의 변곡점에서 탄생한 주요 작품들을 통해 우리 미술의 어제와 오늘을 성찰한다.',
  
  '2025 아르코데이': '아르코미술관이 준비한 연례 특별 프로그램. 국내외 유망 작가들의 실험적인 작품을 한자리에서 만나볼 수 있으며, 현대미술의 최신 경향과 미래 방향성을 제시한다.',
  
  '8월 라이브 경매 프리뷰': '서울옥션의 8월 라이브 경매에 출품될 주요 작품들을 미리 감상할 수 있는 프리뷰 전시. 국내외 유명 작가들의 회화, 조각, 판화 등 다양한 장르의 미술품을 직접 확인하고 경매 참여를 준비할 수 있다.',
  
  '8월 메이저 경매': '케이옥션이 주최하는 8월 메이저 경매의 하이라이트 작품들을 소개하는 전시. 블루칩 작가들의 대표작부터 떠오르는 신진 작가들의 주목할 만한 작품까지 다양한 스펙트럼의 미술품을 선보인다.',
  
  'A Chorus - Jennifer Carvalho': 'CYLINDER TWO에서 선보이는 제니퍼 카르발호의 개인전. 음악적 리듬과 시각적 하모니를 탐구하는 작가의 신작들을 통해 소리와 이미지의 공감각적 경험을 제공한다.',
  
  'Dust - Ruofan Chen': 'SHOWER 갤러리가 소개하는 뤄판 첸의 첫 한국 개인전. 먼지와 티끌이라는 미시적 존재를 통해 시간의 흐름과 기억의 축적을 시각화하며, 일상 속 보이지 않는 것들의 의미를 되묻는다.',
  
  'Flesh & Love': '제이슨함 갤러리가 기획한 그룹전으로, 육체와 사랑이라는 원초적 주제를 현대적 시각으로 재해석한다. 참여 작가들은 인간의 욕망과 감정을 다양한 매체로 표현하며 관계의 본질을 탐구한다.',
  
  'Frieze Seoul 2025': '세계적인 아트페어 프리즈가 서울에서 개최하는 연례 행사. 전 세계 주요 갤러리들이 참여해 현대미술의 최신 트렌드를 소개하며, 다양한 부대행사와 토크 프로그램도 함께 진행된다.',
  
  'Kiaf 서울 2025': '한국국제아트페어(Kiaf)의 2025년 에디션. 국내 최대 규모의 미술시장 플랫폼으로, 국내외 갤러리들이 엄선한 작품들을 한자리에서 만날 수 있는 기회를 제공한다.',
  
  'March to March': 'PS CENTER에서 진행되는 연간 기획전. 3월에서 3월까지 이어지는 시간의 순환을 주제로, 계절의 변화와 시간의 흐름 속에서 포착한 예술적 순간들을 담아낸다.',
  
  'Messengers - 김서현': '실린더 ONE에서 선보이는 김서현 작가의 개인전. 메시지를 전달하는 매개체로서의 예술을 탐구하며, 소통과 연결의 의미를 시각적 언어로 풀어낸다.',
  
  'others vs others': '아트조선스페이스가 기획한 실험적 그룹전. 타자와 타자의 만남, 충돌, 공존을 주제로 다양성과 차이의 미학을 탐구하며 현대사회의 관계 맺기를 성찰한다.',
  
  'Pit': '피트갤러리의 기획전으로, 깊이와 심연을 탐구하는 작가들의 작품을 소개한다. 물리적 공간으로서의 구덩이와 심리적 깊이를 동시에 다루며 인간 내면의 복잡성을 드러낸다.',
  
  'Pit Calls Wall - 김새은': '뮤지엄헤드에서 열리는 김새은 작가의 개인전. 도시 공간의 터널과 벽면을 모티프로 삼아 이동과 정지, 관통과 차단의 이중성을 회화적으로 탐구한다.',
  
  'Poetic Forensic': '상업화랑이 선보이는 시적 법의학이라는 독특한 주제의 전시. 예술작품을 통해 숨겨진 진실을 추적하고 해석하는 과정을 보여주며, 예술과 과학의 경계를 넘나든다.',
  
  'Small but great': '작지만 위대한 것들에 주목하는 Small but great 갤러리의 기획전. 미니멀한 작품들이 담고 있는 거대한 서사와 감동을 발견하는 즐거움을 선사한다.',
  
  'Stone, Time, Touch': '매스갤러리 한남에서 진행되는 조각 중심 전시. 돌이라는 영원한 물질에 시간의 흔적과 인간의 손길이 더해지는 과정을 통해 예술의 본질을 탐구한다.',
  
  'Summer Collective Exhibition': '스페이스776의 여름 단체전. 무더운 여름의 에너지를 담은 다채로운 작품들이 한자리에 모여 계절의 활력과 생동감을 전달한다.',
  
  'The Garden of Forking Paths': '가나아트 한남이 선보이는 보르헤스의 소설에서 영감을 받은 전시. 갈라지는 길들의 정원처럼 다양한 가능성과 선택의 순간들을 시각예술로 재현한다.',
  
  'Troubled at his saying - 세실 렘퍼트': 'IAH에서 열리는 세실 렘퍼트의 개인전. 언어와 이미지 사이의 긴장과 균열을 탐구하며, 말로 표현할 수 없는 것들을 시각적으로 포착하려는 시도를 보여준다.',
  
  'Under One Roof': '현대카드 스토리지의 기획전으로, 한 지붕 아래 모인 다양한 예술적 시선들을 소개한다. 공존과 화합의 메시지를 담은 작품들이 조화롭게 어우러진다.',
  
  'VELVET HAMMERS': '핌서울이 소개하는 벨벳 해머스전. 부드러운 외관 속에 강력한 메시지를 담은 작품들로, 예술의 이중적 힘을 탐구한다.',
  
  'Vivid Rest': '롯데갤러리 아트홀 잠실점의 기획전. 생생한 휴식이라는 역설적 주제로, 정적 속의 역동성과 움직임 속의 평온을 동시에 담아낸다.'
};

// 나머지 전시들을 위한 일반적 설명 생성 함수
function generateGenericDescription(title, venue, city) {
  const templates = [
    `${venue}에서 선보이는 《${title}》은 현대미술의 새로운 가능성을 탐구하는 전시입니다. 작가의 독창적인 시각과 실험정신이 돋보이는 작품들을 통해 예술의 경계를 확장하며, 관람객에게 깊은 사색의 기회를 제공합니다.`,
    
    `《${title}》은 ${city}의 ${venue}에서 펼쳐지는 특별한 예술적 여정입니다. 섬세한 관찰과 대담한 표현이 어우러진 작품들이 공간을 채우며, 일상에서 놓치기 쉬운 아름다움과 의미를 재발견하게 합니다.`,
    
    `${venue}이 기획한 《${title}》은 동시대 미술의 흐름을 읽을 수 있는 중요한 전시입니다. 전통과 현대, 동양과 서양의 경계를 넘나드는 작품들이 새로운 미학적 담론을 제시합니다.`,
    
    `《${title}》은 작가의 깊이 있는 사유와 독특한 조형 언어가 돋보이는 전시입니다. ${venue}의 공간에서 펼쳐지는 시각적 서사는 관람객에게 예술적 영감과 감동을 선사합니다.`,
    
    `${city} ${venue}에서 열리는 《${title}》은 현대인의 삶과 정서를 예술적으로 승화시킨 전시입니다. 다양한 매체와 기법을 통해 우리 시대의 이야기를 담아내며, 공감과 성찰의 장을 마련합니다.`
  ];
  
  // 제목 해시값을 기반으로 템플릿 선택 (일관성 유지)
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash = hash & hash;
  }
  const templateIndex = Math.abs(hash) % templates.length;
  
  return templates[templateIndex];
}

async function updateDescriptions() {
  console.log('========================================');
  console.log('전시 설명 업데이트 시작');
  console.log('========================================\n');
  
  try {
    // 1. description이 없는 전시 조회
    console.log('📋 설명이 없는 전시 조회 중...');
    const { data: exhibitions, error: fetchError } = await supabase
      .from('exhibitions_translations')
      .select(`
        id,
        exhibition_id,
        exhibition_title,
        venue_name,
        city,
        description
      `)
      .or('description.is.null,description.eq.""')
      .eq('language_code', 'ko')
      .order('exhibition_title');
    
    if (fetchError) {
      console.error('조회 오류:', fetchError);
      return;
    }
    
    console.log(`✅ 총 ${exhibitions.length}개의 전시 발견\n`);
    
    // 2. 배치 처리 (5개씩)
    const BATCH_SIZE = 5;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < exhibitions.length; i += BATCH_SIZE) {
      const batch = exhibitions.slice(i, Math.min(i + BATCH_SIZE, exhibitions.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`\n📦 배치 ${batchNum} 처리 중 (${batch.length}개)`);
      console.log('─'.repeat(50));
      
      for (const exhibition of batch) {
        console.log(`\n▶ ${exhibition.exhibition_title}`);
        console.log(`  장소: ${exhibition.venue_name} (${exhibition.city})`);
        
        try {
          // 설명 생성 또는 가져오기
          let description = exhibitionDescriptions[exhibition.exhibition_title];
          
          if (!description) {
            // 사전 정의된 설명이 없으면 일반 템플릿 사용
            description = generateGenericDescription(
              exhibition.exhibition_title,
              exhibition.venue_name,
              exhibition.city
            );
          }
          
          console.log(`  📝 설명: ${description.substring(0, 60)}...`);
          
          // Supabase 업데이트
          const { error: updateError } = await supabase
            .from('exhibitions_translations')
            .update({
              description,
              updated_at: new Date().toISOString()
            })
            .eq('id', exhibition.id);
          
          if (updateError) {
            console.error(`  ❌ 업데이트 실패:`, updateError.message);
            errorCount++;
          } else {
            console.log(`  ✅ 업데이트 성공!`);
            successCount++;
          }
          
        } catch (error) {
          console.error(`  ❌ 처리 오류:`, error.message);
          errorCount++;
        }
      }
      
      // 배치 간 대기 (API 부하 방지)
      if (i + BATCH_SIZE < exhibitions.length) {
        console.log('\n⏳ 다음 배치 처리 전 1초 대기...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 3. 결과 요약
    console.log('\n========================================');
    console.log('업데이트 완료');
    console.log('========================================');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📊 총 처리: ${successCount + errorCount}/${exhibitions.length}개`);
    
    // 4. 검증
    if (successCount > 0) {
      console.log('\n📌 업데이트 검증 중...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('exhibitions_translations')
        .select('exhibition_title, description')
        .not('description', 'is', null)
        .not('description', 'eq', '')
        .eq('language_code', 'ko')
        .limit(5)
        .order('updated_at', { ascending: false });
      
      if (!verifyError && verifyData) {
        console.log(`최근 업데이트된 전시 (샘플):`);
        verifyData.forEach((ex, idx) => {
          console.log(`${idx + 1}. ${ex.exhibition_title}`);
          console.log(`   ${ex.description.substring(0, 80)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('예상치 못한 오류:', error);
  }
}

// 실행
updateDescriptions().catch(console.error);
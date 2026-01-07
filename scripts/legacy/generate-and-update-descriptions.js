const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 전시 descriptions 배치 업데이트 함수
async function updateDescriptions(descriptionData) {
  console.log('========================================');
  console.log('전시 Description 업데이트 시작');
  console.log('========================================\n');

  let successCount = 0;
  let errorCount = 0;

  for (const item of descriptionData) {
    try {
      // 한글 버전 업데이트
      const { error: koError } = await supabase
        .from('exhibitions_translations')
        .update({ 
          description: item.description,
          updated_at: new Date().toISOString()
        })
        .eq('exhibition_id', item.exhibition_id)
        .eq('language_code', 'ko');

      if (koError) {
        console.error(`❌ ${item.exhibition_id} (ko) 업데이트 실패:`, koError.message);
        errorCount++;
      } else {
        console.log(`✅ ${item.exhibition_id} (ko) 업데이트 성공`);
        successCount++;
      }

      // 영어 버전이 있다면 번역해서 업데이트
      if (item.description_en) {
        const { error: enError } = await supabase
          .from('exhibitions_translations')
          .update({ 
            description: item.description_en,
            updated_at: new Date().toISOString()
          })
          .eq('exhibition_id', item.exhibition_id)
          .eq('language_code', 'en');

        if (enError) {
          console.error(`❌ ${item.exhibition_id} (en) 업데이트 실패:`, enError.message);
        } else {
          console.log(`✅ ${item.exhibition_id} (en) 업데이트 성공`);
        }
      }

    } catch (err) {
      console.error(`❌ ${item.exhibition_id} 처리 중 오류:`, err.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
  console.log('========================================');
}

// 샘플 데이터 - 실제 데이터로 교체 필요
const sampleDescriptions = [
  {
    exhibition_id: "ffaeef4c-e8b7-4337-b4d8-9a7e3f6d07d2",
    description: "민성홍 작가의 '파편의 흐름'은 현대 사회의 단절과 연결을 시각적으로 탐구하는 전시입니다. 작가는 일상의 파편들을 재구성하여 새로운 서사를 만들어내며, 관람객에게 현실과 환상의 경계를 넘나드는 독특한 경험을 선사합니다.",
    description_en: "Min Sung-hong's 'Flow of Fragments' is an exhibition that visually explores disconnection and connection in contemporary society. The artist reconstructs fragments of daily life to create new narratives, offering viewers a unique experience that crosses the boundaries between reality and fantasy."
  }
];

// 사용자가 제공한 데이터로 실행
// updateDescriptions(sampleDescriptions).catch(console.error);

// 실제 사용 시 아래와 같이 호출
module.exports = { updateDescriptions };
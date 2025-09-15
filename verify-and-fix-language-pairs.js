const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAndFixLanguagePairs() {
  console.log('========================================');
  console.log('언어 페어링 검증 및 수정');
  console.log('========================================\n');
  
  try {
    // 1. 전체 데이터 가져오기
    const { data: allTranslations, error } = await supabase
      .from('exhibitions_translations')
      .select('*')
      .order('exhibition_id')
      .order('language_code');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`✅ 총 ${allTranslations.length}개의 레코드 조회\n`);
    
    // 2. exhibition_id별로 그룹화
    const exhibitions = {};
    allTranslations.forEach(trans => {
      if (!exhibitions[trans.exhibition_id]) {
        exhibitions[trans.exhibition_id] = {
          ko: null,
          en: null,
          title: null
        };
      }
      exhibitions[trans.exhibition_id][trans.language_code] = trans;
      
      // 대표 제목 설정 (ko 우선)
      if (trans.language_code === 'ko' && trans.exhibition_title) {
        exhibitions[trans.exhibition_id].title = trans.exhibition_title;
      }
    });
    
    // 3. 페어링 분석
    let perfectPairs = 0;
    let koOnly = [];
    let enOnly = [];
    let koWithoutDesc = [];
    let enWithoutDesc = [];
    
    Object.keys(exhibitions).forEach(exhibitionId => {
      const exh = exhibitions[exhibitionId];
      
      if (exh.ko && exh.en) {
        perfectPairs++;
        
        // description 체크
        if (exh.ko && (!exh.ko.description || exh.ko.description === '')) {
          koWithoutDesc.push({
            exhibitionId,
            title: exh.ko.exhibition_title,
            enTitle: exh.en.exhibition_title,
            enDesc: exh.en.description
          });
        }
        
        if (exh.en && (!exh.en.description || exh.en.description === '')) {
          enWithoutDesc.push({
            exhibitionId,
            title: exh.ko.exhibition_title,
            enTitle: exh.en.exhibition_title,
            koDesc: exh.ko.description
          });
        }
      } else if (exh.ko && !exh.en) {
        koOnly.push({
          exhibitionId,
          record: exh.ko
        });
      } else if (!exh.ko && exh.en) {
        enOnly.push({
          exhibitionId,
          record: exh.en
        });
      }
    });
    
    // 4. 결과 출력
    console.log('📊 페어링 분석 결과:');
    console.log(`  - 완벽한 ko-en 페어: ${perfectPairs}개`);
    console.log(`  - ko만 있음: ${koOnly.length}개`);
    console.log(`  - en만 있음: ${enOnly.length}개`);
    console.log(`  - ko 있지만 description 없음: ${koWithoutDesc.length}개`);
    console.log(`  - en 있지만 description 없음: ${enWithoutDesc.length}개\n`);
    
    // 5. en description이 없지만 ko description이 있는 경우 번역
    if (enWithoutDesc.length > 0) {
      console.log('\n📝 ko description을 기반으로 en description 생성 중...\n');
      
      let translatedCount = 0;
      for (const item of enWithoutDesc) {
        if (item.koDesc && item.koDesc.trim() !== '') {
          // 간단한 번역 시뮬레이션 (실제로는 번역 API 사용 필요)
          const translatedDesc = `[To be translated] ${item.koDesc.substring(0, 100)}...`;
          
          console.log(`번역 대상: ${item.title} → ${item.enTitle}`);
          console.log(`  - exhibition_id: ${item.exhibitionId}`);
          console.log(`  - ko description 길이: ${item.koDesc.length}자`);
          console.log(`  - [실제 번역 API 연동 필요]\n`);
          
          translatedCount++;
        }
      }
      
      console.log(`✅ ${translatedCount}개 전시의 en description 번역 필요\n`);
    }
    
    // 6. 언어 페어링 예시 출력
    console.log('\n📌 언어 페어링 예시 (처음 5개):');
    console.log('═'.repeat(80));
    
    const examples = Object.keys(exhibitions).slice(0, 5);
    examples.forEach(exhibitionId => {
      const exh = exhibitions[exhibitionId];
      console.log(`\nexhibition_id: ${exhibitionId}`);
      
      if (exh.ko) {
        console.log(`  [KO] ${exh.ko.exhibition_title}`);
        console.log(`       장소: ${exh.ko.venue_name}`);
        console.log(`       설명: ${exh.ko.description ? '있음' : '❌ 없음'}`);
      }
      
      if (exh.en) {
        console.log(`  [EN] ${exh.en.exhibition_title}`);
        console.log(`       Venue: ${exh.en.venue_name}`);
        console.log(`       Description: ${exh.en.description ? 'Present' : '❌ Missing'}`);
      }
      
      if (!exh.ko || !exh.en) {
        console.log(`  ⚠️  페어링 불완전: ${exh.ko ? 'en 없음' : 'ko 없음'}`);
      }
    });
    
    // 7. 프론트엔드 사용 방법 설명
    console.log('\n\n💡 프론트엔드 사용 방법:');
    console.log('═'.repeat(80));
    console.log(`
// 1. 특정 전시 정보 가져오기 (언어별)
const { data } = await supabase
  .from('exhibitions_translations')
  .select('*')
  .eq('exhibition_id', '${examples[0]}')
  .eq('language_code', currentLanguage)  // 'ko' or 'en'
  .single();

// 2. 전체 전시 목록 가져오기 (언어별)
const { data } = await supabase
  .from('exhibitions_translations')
  .select('*')
  .eq('language_code', currentLanguage)
  .order('exhibition_title');

// 3. 언어 전환 시 같은 exhibition_id 사용
function switchLanguage(exhibitionId, newLanguage) {
  // 같은 exhibition_id로 다른 language_code 데이터 조회
  return supabase
    .from('exhibitions_translations')
    .select('*')
    .eq('exhibition_id', exhibitionId)
    .eq('language_code', newLanguage)
    .single();
}
`);
    
    // 결과 저장
    const fs = require('fs').promises;
    const pairingAnalysis = {
      summary: {
        totalExhibitions: Object.keys(exhibitions).length,
        perfectPairs,
        koOnly: koOnly.length,
        enOnly: enOnly.length,
        koWithoutDesc: koWithoutDesc.length,
        enWithoutDesc: enWithoutDesc.length
      },
      needsTranslation: enWithoutDesc.filter(item => item.koDesc && item.koDesc.trim() !== ''),
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(
      'language-pairing-analysis.json',
      JSON.stringify(pairingAnalysis, null, 2)
    );
    
    console.log('\n📄 상세 분석 결과가 language-pairing-analysis.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyAndFixLanguagePairs().catch(console.error);
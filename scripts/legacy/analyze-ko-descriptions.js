const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeKoDescriptions() {
  console.log('========================================');
  console.log('한글(KO) Description 분석');
  console.log('========================================\n');
  
  try {
    // 1. 모든 ko 레코드 가져오기
    const { data: koTranslations, error } = await supabase
      .from('exhibitions_translations')
      .select('*')
      .eq('language_code', 'ko')
      .order('exhibition_title');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`✅ 총 ${koTranslations.length}개의 한글 레코드 조회\n`);
    
    // 2. description 상태 분석
    let withDescription = [];
    let withoutDescription = [];
    
    koTranslations.forEach(trans => {
      if (trans.description && trans.description.trim() !== '') {
        withDescription.push({
          exhibition_id: trans.exhibition_id,
          title: trans.exhibition_title,
          venue: trans.venue_name,
          descLength: trans.description.length
        });
      } else {
        withoutDescription.push({
          exhibition_id: trans.exhibition_id,
          title: trans.exhibition_title,
          venue: trans.venue_name
        });
      }
    });
    
    // 3. 결과 출력
    console.log('📊 한글 Description 분석 결과:');
    console.log('═'.repeat(80));
    console.log(`  ✅ Description 있음: ${withDescription.length}개 전시`);
    console.log(`  ❌ Description 없음: ${withoutDescription.length}개 전시`);
    console.log(`  📈 완성률: ${((withDescription.length / koTranslations.length) * 100).toFixed(1)}%\n`);
    
    // 4. Description이 있는 전시 예시
    if (withDescription.length > 0) {
      console.log('\n📝 Description이 있는 전시 (처음 10개):');
      console.log('─'.repeat(80));
      withDescription.slice(0, 10).forEach((exh, idx) => {
        console.log(`${idx + 1}. ${exh.title}`);
        console.log(`   장소: ${exh.venue}`);
        console.log(`   설명 길이: ${exh.descLength}자`);
      });
      
      if (withDescription.length > 10) {
        console.log(`\n... 외 ${withDescription.length - 10}개 전시`);
      }
    }
    
    // 5. Description이 없는 전시 목록
    if (withoutDescription.length > 0) {
      console.log('\n\n❌ Description이 없는 전시 목록:');
      console.log('─'.repeat(80));
      withoutDescription.forEach((exh, idx) => {
        console.log(`${idx + 1}. ${exh.title} - ${exh.venue}`);
      });
    }
    
    // 6. 통계 정보
    if (withDescription.length > 0) {
      const descLengths = withDescription.map(e => e.descLength);
      const avgLength = Math.round(descLengths.reduce((a, b) => a + b, 0) / descLengths.length);
      const maxLength = Math.max(...descLengths);
      const minLength = Math.min(...descLengths);
      
      console.log('\n\n📈 Description 길이 통계:');
      console.log('─'.repeat(80));
      console.log(`  평균: ${avgLength}자`);
      console.log(`  최대: ${maxLength}자`);
      console.log(`  최소: ${minLength}자`);
      
      // 가장 긴 설명을 가진 전시
      const longest = withDescription.find(e => e.descLength === maxLength);
      console.log(`\n  가장 긴 설명: ${longest.title} (${maxLength}자)`);
      
      // 가장 짧은 설명을 가진 전시
      const shortest = withDescription.find(e => e.descLength === minLength);
      console.log(`  가장 짧은 설명: ${shortest.title} (${minLength}자)`);
    }
    
    // 7. 결과 저장
    const fs = require('fs').promises;
    const analysisResult = {
      summary: {
        totalKoRecords: koTranslations.length,
        withDescription: withDescription.length,
        withoutDescription: withoutDescription.length,
        completionRate: ((withDescription.length / koTranslations.length) * 100).toFixed(1) + '%'
      },
      withDescription: withDescription,
      withoutDescription: withoutDescription,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(
      'ko-description-analysis.json',
      JSON.stringify(analysisResult, null, 2)
    );
    
    console.log('\n\n📄 상세 분석 결과가 ko-description-analysis.json에 저장되었습니다.');
    
    // 8. 요약
    console.log('\n\n========================================');
    console.log('요약');
    console.log('========================================');
    console.log(`✅ 한글 전시 총 ${koTranslations.length}개 중:`);
    console.log(`   - Description 완성: ${withDescription.length}개 (${((withDescription.length / koTranslations.length) * 100).toFixed(1)}%)`);
    console.log(`   - Description 필요: ${withoutDescription.length}개 (${((withoutDescription.length / koTranslations.length) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeKoDescriptions().catch(console.error);
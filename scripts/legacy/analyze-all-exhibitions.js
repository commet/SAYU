const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeAllExhibitions() {
  console.log('========================================');
  console.log('전체 exhibitions_translations 분석');
  console.log('========================================\n');
  
  try {
    // 1. 전체 데이터 가져오기
    console.log('📋 전체 translations 데이터 조회 중...');
    const { data: allTranslations, error } = await supabase
      .from('exhibitions_translations')
      .select(`
        id,
        exhibition_id,
        language_code,
        exhibition_title,
        venue_name,
        description
      `)
      .order('exhibition_id')
      .order('language_code');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`✅ 총 ${allTranslations.length}개의 레코드 발견\n`);
    
    // 2. exhibition_id별로 그룹화
    const exhibitionGroups = {};
    allTranslations.forEach(trans => {
      if (!exhibitionGroups[trans.exhibition_id]) {
        exhibitionGroups[trans.exhibition_id] = {
          title: null,
          languages: [],
          records: []
        };
      }
      
      exhibitionGroups[trans.exhibition_id].records.push(trans);
      exhibitionGroups[trans.exhibition_id].languages.push(trans.language_code);
      
      // 한글 제목 우선 저장
      if (trans.language_code === 'ko' && trans.exhibition_title) {
        exhibitionGroups[trans.exhibition_id].title = trans.exhibition_title;
      } else if (!exhibitionGroups[trans.exhibition_id].title && trans.exhibition_title) {
        exhibitionGroups[trans.exhibition_id].title = trans.exhibition_title;
      }
    });
    
    // 3. 분석 결과
    const exhibitionIds = Object.keys(exhibitionGroups);
    console.log(`📊 분석 결과:`);
    console.log(`  - 고유한 exhibition_id 수: ${exhibitionIds.length}개`);
    console.log(`  - 총 translation 레코드 수: ${allTranslations.length}개\n`);
    
    // 4. 언어별 통계
    let koOnlyCount = 0;
    let enOnlyCount = 0;
    let bothCount = 0;
    let duplicateCount = 0;
    
    const problems = {
      duplicates: [],     // 같은 exhibition_id + language_code 중복
      koOnly: [],         // 한글만 있는 전시
      enOnly: [],         // 영어만 있는 전시
      noDescription: []   // description이 없는 전시
    };
    
    exhibitionIds.forEach(exhibitionId => {
      const group = exhibitionGroups[exhibitionId];
      const uniqueLangs = [...new Set(group.languages)];
      
      // 중복 체크 (같은 언어가 여러 개)
      if (group.languages.length !== uniqueLangs.length) {
        duplicateCount++;
        const duplicateLangs = group.languages.filter((lang, idx) => 
          group.languages.indexOf(lang) !== idx
        );
        problems.duplicates.push({
          exhibitionId,
          title: group.title,
          duplicatedLanguages: [...new Set(duplicateLangs)],
          records: group.records.map(r => ({
            id: r.id,
            lang: r.language_code,
            title: r.exhibition_title
          }))
        });
      }
      
      // 언어 쌍 체크
      const hasKo = uniqueLangs.includes('ko');
      const hasEn = uniqueLangs.includes('en');
      
      if (hasKo && hasEn) {
        bothCount++;
      } else if (hasKo) {
        koOnlyCount++;
        problems.koOnly.push({
          exhibitionId,
          title: group.title,
          venue: group.records[0].venue_name
        });
      } else if (hasEn) {
        enOnlyCount++;
        problems.enOnly.push({
          exhibitionId,
          title: group.title,
          venue: group.records[0].venue_name
        });
      }
      
      // description 체크
      const noDesc = group.records.filter(r => !r.description || r.description === '');
      if (noDesc.length > 0) {
        problems.noDescription.push({
          exhibitionId,
          title: group.title,
          missingDescLanguages: noDesc.map(r => r.language_code)
        });
      }
    });
    
    console.log('📈 언어 쌍 통계:');
    console.log(`  - ko/en 둘 다 있음: ${bothCount}개`);
    console.log(`  - ko만 있음: ${koOnlyCount}개`);
    console.log(`  - en만 있음: ${enOnlyCount}개`);
    console.log(`  - 중복 레코드 있는 전시: ${duplicateCount}개\n`);
    
    // 5. 문제 상세 출력
    if (problems.duplicates.length > 0) {
      console.log('\n❗ 중복 레코드가 있는 전시:');
      console.log('─'.repeat(50));
      problems.duplicates.forEach(dup => {
        console.log(`\n전시: ${dup.title} (ID: ${dup.exhibitionId})`);
        console.log(`중복된 언어: ${dup.duplicatedLanguages.join(', ')}`);
        console.log('레코드 상세:');
        dup.records.forEach(r => {
          console.log(`  - [${r.lang}] ${r.title} (record_id: ${r.id})`);
        });
      });
    }
    
    if (problems.koOnly.length > 0) {
      console.log('\n📝 한글(ko)만 있는 전시 (영어 번역 필요):');
      console.log('─'.repeat(50));
      problems.koOnly.slice(0, 10).forEach((ex, idx) => {
        console.log(`${idx + 1}. ${ex.title} - ${ex.venue}`);
      });
      if (problems.koOnly.length > 10) {
        console.log(`... 외 ${problems.koOnly.length - 10}개`);
      }
    }
    
    if (problems.enOnly.length > 0) {
      console.log('\n📝 영어(en)만 있는 전시 (한글 번역 필요):');
      console.log('─'.repeat(50));
      problems.enOnly.forEach((ex, idx) => {
        console.log(`${idx + 1}. ${ex.title} - ${ex.venue}`);
      });
    }
    
    // 6. description 없는 전시 요약
    const noDescKo = problems.noDescription.filter(p => p.missingDescLanguages.includes('ko'));
    const noDescEn = problems.noDescription.filter(p => p.missingDescLanguages.includes('en'));
    
    console.log('\n📄 Description 통계:');
    console.log(`  - ko description 없음: ${noDescKo.length}개`);
    console.log(`  - en description 없음: ${noDescEn.length}개`);
    
    // 7. 권장 작업
    console.log('\n\n🔧 권장 작업:');
    console.log('═'.repeat(50));
    
    if (problems.duplicates.length > 0) {
      console.log(`1. 중복 레코드 정리: ${problems.duplicates.length}개 전시의 중복 제거 필요`);
    }
    
    if (koOnlyCount > 0) {
      console.log(`2. 영어 번역 추가: ${koOnlyCount}개 전시`);
    }
    
    if (enOnlyCount > 0) {
      console.log(`3. 한글 번역 추가: ${enOnlyCount}개 전시`);
    }
    
    const totalMissingDesc = problems.noDescription.length;
    if (totalMissingDesc > 0) {
      console.log(`4. Description 추가: ${totalMissingDesc}개 전시`);
    }
    
    // 결과를 파일로 저장
    const fs = require('fs').promises;
    const analysisResult = {
      summary: {
        totalRecords: allTranslations.length,
        uniqueExhibitions: exhibitionIds.length,
        withBothLanguages: bothCount,
        koOnly: koOnlyCount,
        enOnly: enOnlyCount,
        withDuplicates: duplicateCount
      },
      problems,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(
      'exhibition-analysis.json', 
      JSON.stringify(analysisResult, null, 2)
    );
    console.log('\n📄 상세 분석 결과가 exhibition-analysis.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeAllExhibitions().catch(console.error);
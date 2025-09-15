const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listExhibitionsWithoutDescription() {
  console.log('========================================');
  console.log('Description 없는 전시 최종 확인');
  console.log('========================================\n');
  
  try {
    // 1. 전체 데이터 가져오기
    const { data: allTranslations, error } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        language_code,
        exhibition_title,
        venue_name,
        city,
        description
      `)
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
          en: null
        };
      }
      exhibitions[trans.exhibition_id][trans.language_code] = trans;
    });
    
    // 3. description 없는 전시 찾기
    const noDescriptionExhibitions = [];
    
    Object.keys(exhibitions).forEach(exhibitionId => {
      const exh = exhibitions[exhibitionId];
      const koHasDesc = exh.ko && exh.ko.description && exh.ko.description.trim() !== '';
      const enHasDesc = exh.en && exh.en.description && exh.en.description.trim() !== '';
      
      if (!koHasDesc || !enHasDesc) {
        noDescriptionExhibitions.push({
          exhibitionId,
          title: exh.ko?.exhibition_title || exh.en?.exhibition_title || 'Unknown',
          venue: exh.ko?.venue_name || exh.en?.venue_name || 'Unknown',
          city: exh.ko?.city || exh.en?.city || 'Unknown',
          missingKoDesc: !koHasDesc,
          missingEnDesc: !enHasDesc
        });
      }
    });
    
    // 4. 결과 출력
    console.log(`📊 분석 결과:`);
    console.log(`  - 총 전시 수: ${Object.keys(exhibitions).length}개`);
    console.log(`  - Description 없는 전시: ${noDescriptionExhibitions.length}개\n`);
    
    if (noDescriptionExhibitions.length > 0) {
      // 정렬
      noDescriptionExhibitions.sort((a, b) => a.title.localeCompare(b.title));
      
      console.log('📝 Description이 필요한 전시 목록:');
      console.log('═'.repeat(80));
      
      noDescriptionExhibitions.forEach((exh, idx) => {
        console.log(`\n${idx + 1}. ${exh.title}`);
        console.log(`   장소: ${exh.venue} (${exh.city})`);
        console.log(`   ID: ${exh.exhibitionId}`);
        
        const missing = [];
        if (exh.missingKoDesc) missing.push('ko');
        if (exh.missingEnDesc) missing.push('en');
        console.log(`   ❌ Description 없음: [${missing.join(', ')}]`);
      });
      
      // 통계
      const bothMissing = noDescriptionExhibitions.filter(e => e.missingKoDesc && e.missingEnDesc).length;
      const koOnlyMissing = noDescriptionExhibitions.filter(e => e.missingKoDesc && !e.missingEnDesc).length;
      const enOnlyMissing = noDescriptionExhibitions.filter(e => !e.missingKoDesc && e.missingEnDesc).length;
      
      console.log('\n' + '═'.repeat(80));
      console.log('📈 요약:');
      console.log(`  - ko/en 둘 다 없음: ${bothMissing}개`);
      console.log(`  - ko만 없음: ${koOnlyMissing}개`);
      console.log(`  - en만 없음: ${enOnlyMissing}개`);
      
      // 파일로 저장
      const fs = require('fs').promises;
      const result = {
        total: noDescriptionExhibitions.length,
        exhibitions: noDescriptionExhibitions,
        statistics: {
          bothMissing,
          koOnlyMissing,
          enOnlyMissing
        },
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(
        'exhibitions-without-description.json',
        JSON.stringify(result, null, 2)
      );
      console.log('\n📄 상세 목록이 exhibitions-without-description.json에 저장되었습니다.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listExhibitionsWithoutDescription().catch(console.error);
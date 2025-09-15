const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listExhibitionsWithoutDescription() {
  console.log('========================================');
  console.log('Description이 없는 전시 목록');
  console.log('========================================\n');

  // Description이 없는 한글 전시 조회
  const { data: exhibitions, error } = await supabase
    .from('exhibitions_translations')
    .select('*')
    .eq('language_code', 'ko')
    .or('description.is.null,description.eq.""')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`총 ${exhibitions.length}개 전시가 description이 필요합니다.\n`);

  // 배치 단위로 그룹핑 (10개씩)
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < exhibitions.length; i += batchSize) {
    batches.push(exhibitions.slice(i, i + batchSize));
  }

  // 각 배치별로 출력
  batches.forEach((batch, batchIndex) => {
    console.log(`\n========== Batch ${batchIndex + 1} (${batch.length}개) ==========`);
    
    batch.forEach((exhibition, index) => {
      const globalIndex = batchIndex * batchSize + index + 1;
      console.log(`\n${globalIndex}. ${exhibition.title}`);
      console.log(`   - Exhibition ID: ${exhibition.exhibition_id}`);
      console.log(`   - Artist: ${exhibition.artist_name || 'Unknown'}`);
      console.log(`   - Venue: ${exhibition.venue_name || 'Unknown'}`);
      console.log(`   - Period: ${exhibition.start_date} ~ ${exhibition.end_date}`);
      
      // 영어 버전 확인
      console.log(`   - 영어 제목: ${exhibition.title_en || 'N/A'}`);
    });
  });

  // 작업용 JSON 파일 생성
  const fs = require('fs').promises;
  const exportData = exhibitions.map(ex => ({
    exhibition_id: ex.exhibition_id,
    title: ex.title_ko || ex.title,
    artist_name: ex.artist_name,
    venue_name: ex.venue_name,
    start_date: ex.start_date,
    end_date: ex.end_date
  }));

  await fs.writeFile(
    'exhibitions-without-description.json',
    JSON.stringify(exportData, null, 2)
  );

  console.log('\n\n✅ exhibitions-without-description.json 파일로 저장되었습니다.');
  console.log('이 파일을 참고하여 description을 작성해주세요.');
}

listExhibitionsWithoutDescription().catch(console.error);
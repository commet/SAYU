const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateBatchList() {
  console.log('========================================');
  console.log('Description 필요 전시 - 배치 리스트');
  console.log('========================================\n');

  // Description이 없는 한글 전시 전체 조회
  const { data: exhibitions, error } = await supabase
    .from('exhibitions_translations')
    .select('*')
    .eq('language_code', 'ko')
    .or('description.is.null,description.eq.""')
    .order('venue_name', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`총 ${exhibitions.length}개 전시가 description이 필요합니다.\n`);

  // 10개씩 배치로 나누기
  const batchSize = 10;
  const totalBatches = Math.ceil(exhibitions.length / batchSize);
  
  // 첫 3개 배치만 상세히 출력
  for (let i = 0; i < Math.min(3, totalBatches); i++) {
    const batchStart = i * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, exhibitions.length);
    const batch = exhibitions.slice(batchStart, batchEnd);
    
    console.log(`\n========== BATCH ${i + 1} (${batch.length}개 전시) ==========\n`);
    
    batch.forEach((ex, index) => {
      const num = batchStart + index + 1;
      console.log(`${num}. ${ex.exhibition_title || 'No title'}`);
      console.log(`   - ID: ${ex.exhibition_id}`);
      console.log(`   - 작가: ${ex.artists ? ex.artists.join(', ') : '미정'}`);
      console.log(`   - 장소: ${ex.venue_name}`);
      console.log(`   - 기간: ${ex.start_date || '미정'} ~ ${ex.end_date || '미정'}`);
      console.log('');
    });
  }

  // JSON 파일로 첫 번째 배치 저장
  const fs = require('fs').promises;
  const firstBatch = exhibitions.slice(0, 10).map(ex => ({
    exhibition_id: ex.exhibition_id,
    title: ex.exhibition_title,
    artists: ex.artists ? ex.artists.join(', ') : '미정',
    venue: ex.venue_name,
    period: `${ex.start_date || '미정'} ~ ${ex.end_date || '미정'}`
  }));

  await fs.writeFile(
    'batch1-exhibitions.json',
    JSON.stringify(firstBatch, null, 2)
  );

  console.log('\n========================================');
  console.log('작업 방식 제안:');
  console.log('1. 10개씩 배치로 나눠서 작업 (총 15개 배치)');
  console.log('2. 장소별로 그룹핑해서 작업');
  console.log('3. 주요 갤러리/미술관부터 우선 작업');
  console.log('\nbatch1-exhibitions.json 파일에 첫 번째 배치 저장됨');
  console.log('========================================');
  
  // 장소별 통계
  const venueStats = {};
  exhibitions.forEach(ex => {
    const venue = ex.venue_name || 'Unknown';
    venueStats[venue] = (venueStats[venue] || 0) + 1;
  });
  
  console.log('\n주요 장소별 필요 개수:');
  const sortedVenues = Object.entries(venueStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedVenues.forEach(([venue, count]) => {
    console.log(`  - ${venue}: ${count}개`);
  });
}

generateBatchList().catch(console.error);
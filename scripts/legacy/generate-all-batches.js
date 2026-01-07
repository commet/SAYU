const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateAllBatches() {
  console.log('========================================');
  console.log('모든 배치 파일 생성');
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
  
  // 모든 배치 파일 생성
  for (let i = 0; i < totalBatches; i++) {
    const batchStart = i * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, exhibitions.length);
    const batch = exhibitions.slice(batchStart, batchEnd);
    
    const batchData = batch.map(ex => ({
      exhibition_id: ex.exhibition_id,
      title: ex.exhibition_title || 'No title',
      artists: ex.artists ? ex.artists.join(', ') : '',
      venue: ex.venue_name,
      period: `${ex.start_date || '미정'} ~ ${ex.end_date || '미정'}`
    }));

    // JSON 파일로 저장
    const fileName = `batch${i + 1}-exhibitions.json`;
    await fs.writeFile(fileName, JSON.stringify(batchData, null, 2));
    
    console.log(`✅ ${fileName} 생성 (${batchData.length}개 전시)`);
  }

  console.log('\n========================================');
  console.log('배치 파일 생성 완료!');
  console.log('========================================\n');
  console.log('사용 방법:');
  console.log('1. 각 배치 파일(batch1-exhibitions.json ~ batch15-exhibitions.json)을 확인');
  console.log('2. batch1-descriptions.js를 복사해서 batch2-descriptions.js 등으로 만들기');
  console.log('3. 각 배치별로 전시 정보를 수집해서 descriptions 추가');
  console.log('4. node batch[N]-descriptions.js로 실행해서 DB 업데이트\n');
  
  // 현재 진행 상황 표시
  const { data: withDesc } = await supabase
    .from('exhibitions_translations')
    .select('exhibition_id')
    .eq('language_code', 'ko')
    .not('description', 'is', null)
    .not('description', 'eq', '');
    
  console.log('현재 진행 상황:');
  console.log(`- Description 있음: ${withDesc?.length || 0}개`);
  console.log(`- Description 필요: ${exhibitions.length}개`);
  console.log(`- 완료된 배치: 배치 1 (9개 전시)`);
  console.log(`- 남은 배치: 배치 2-${totalBatches} (${exhibitions.length - 9}개 전시)`);
}

generateAllBatches().catch(console.error);
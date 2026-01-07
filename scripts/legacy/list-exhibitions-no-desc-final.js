const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listExhibitionsNoDesc() {
  console.log('========================================');
  console.log('Description이 없는 전시 목록 (작업용)');
  console.log('========================================\n');

  // Description이 없는 한글 전시 조회 (전체 필드 확인)
  const { data: exhibitions, error } = await supabase
    .from('exhibitions_translations')
    .select('*')
    .eq('language_code', 'ko')
    .or('description.is.null,description.eq.""')
    .order('created_at', { ascending: false })
    .limit(5);  // 먼저 5개만 확인

  if (error) {
    console.error('Error:', error);
    return;
  }

  // 필드 구조 확인
  if (exhibitions.length > 0) {
    console.log('샘플 데이터 구조:');
    console.log(Object.keys(exhibitions[0]));
    console.log('\n첫 번째 전시 데이터:');
    console.log(exhibitions[0]);
  }

  // 전체 데이터 다시 조회
  const { data: allExhibitions, error: allError } = await supabase
    .from('exhibitions_translations')
    .select('*')
    .eq('language_code', 'ko')
    .or('description.is.null,description.eq.""')
    .order('venue_name', { ascending: true });

  if (allError) {
    console.error('Error:', allError);
    return;
  }

  console.log(`\n총 ${allExhibitions.length}개 전시가 description이 필요합니다.\n`);

  // 장소별로 그룹핑
  const byVenue = {};
  allExhibitions.forEach(ex => {
    const venue = ex.venue_name || 'Unknown';
    if (!byVenue[venue]) {
      byVenue[venue] = [];
    }
    byVenue[venue].push(ex);
  });

  // 장소별로 출력 (처음 10개 장소만)
  const venues = Object.keys(byVenue).slice(0, 10);
  
  venues.forEach(venue => {
    console.log(`\n=== ${venue} (${byVenue[venue].length}개) ===`);
    byVenue[venue].forEach((ex, idx) => {
      console.log(`  ${idx + 1}. Title: ${ex.exhibition_title || 'No title'}`);
      console.log(`     ID: ${ex.exhibition_id}`);
      console.log(`     Artists: ${ex.artists ? ex.artists.join(', ') : 'Unknown'}`);
      console.log(`     Period: ${ex.start_date || '?'} ~ ${ex.end_date || '?'}`);
    });
  });

  console.log('\n\n전시 정보를 제공해주시면 배치 처리하겠습니다.');
  console.log('형식: { exhibition_id: "...", description: "..." }');
}

listExhibitionsNoDesc().catch(console.error);
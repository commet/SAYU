const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findExhibitionsNeedingDetails() {
  console.log('🔍 9월 이후 계속되는 전시 중 상세 정보가 없는 전시 찾기...\n');
  
  // 9월 이후 종료되는 전시들 찾기
  const { data: exhibitions, error } = await supabase
    .from('exhibitions_master')
    .select(`
      id,
      venue_id,
      start_date,
      end_date,
      source_url,
      venues!inner(name)
    `)
    .gte('end_date', '2025-09-01')
    .order('start_date', { ascending: true });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`총 ${exhibitions.length}개 전시가 9월 이후 종료됩니다.\n`);
  
  // source_url이 없는 전시들
  const noUrl = exhibitions.filter(e => !e.source_url);
  console.log(`📌 source_url이 없는 전시: ${noUrl.length}개`);
  
  // 상세 정보 확인을 위해 translations 체크
  const needsDetails = [];
  
  for (const ex of noUrl.slice(0, 30)) { // 처음 30개만
    const { data: trans } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_title, artists, description')
      .eq('exhibition_id', ex.id)
      .eq('language_code', 'ko')
      .single();
      
    if (trans) {
      needsDetails.push({
        ...ex,
        title: trans.exhibition_title,
        artists: trans.artists,
        description: trans.description,
        venue: ex.venues?.name
      });
    }
  }
  
  console.log(`\n🎨 상세 정보 업데이트가 필요한 전시 목록:\n`);
  console.log('='.repeat(60));
  
  // Batch 2 (6-10번)
  console.log('\n📦 BATCH 2 (6-10번 전시):');
  console.log('-'.repeat(40));
  needsDetails.slice(0, 5).forEach((ex, idx) => {
    console.log(`\n${idx + 6}. ${ex.title || 'No Title'}`);
    console.log(`   작가: ${ex.artists?.join(', ') || 'Unknown'}`);
    console.log(`   장소: ${ex.venue || 'Unknown'}`);
    console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
    console.log(`   설명: ${ex.description ? '있음' : '❌ 없음'}`);
    console.log(`   URL: ${ex.source_url ? '있음' : '❌ 없음'}`);
  });
  
  // Batch 3 (11-15번)
  console.log('\n📦 BATCH 3 (11-15번 전시):');
  console.log('-'.repeat(40));
  needsDetails.slice(5, 10).forEach((ex, idx) => {
    console.log(`\n${idx + 11}. ${ex.title || 'No Title'}`);
    console.log(`   작가: ${ex.artists?.join(', ') || 'Unknown'}`);
    console.log(`   장소: ${ex.venue || 'Unknown'}`);
    console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
  });
  
  // Batch 4 (16-20번)
  console.log('\n📦 BATCH 4 (16-20번 전시):');
  console.log('-'.repeat(40));
  needsDetails.slice(10, 15).forEach((ex, idx) => {
    console.log(`\n${idx + 16}. ${ex.title || 'No Title'}`);
    console.log(`   작가: ${ex.artists?.join(', ') || 'Unknown'}`);
    console.log(`   장소: ${ex.venue || 'Unknown'}`);
    console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n💡 총 ${needsDetails.length}개 전시의 상세 정보 업데이트가 필요합니다.`);
}

findExhibitionsNeedingDetails();
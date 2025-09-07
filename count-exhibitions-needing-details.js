const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAllExhibitionsNeedingDetails() {
  console.log('🔍 상세 정보가 없는 전시 전체 조사...\n');
  
  const { data: exhibitions, error } = await supabase
    .from('exhibitions_master')
    .select(`
      id,
      venue_id,
      start_date,
      end_date,
      source_url,
      instagram_url,
      venues!inner(name)
    `)
    .gte('end_date', '2025-09-01')
    .is('source_url', null)
    .order('start_date', { ascending: true });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`📊 전체 상세 정보 없는 전시: ${exhibitions.length}개\n`);
  
  // Get titles for first 60
  const exhibitionsWithTitles = [];
  
  for (let i = 0; i < Math.min(60, exhibitions.length); i++) {
    const ex = exhibitions[i];
    const { data: trans } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_title, artists')
      .eq('exhibition_id', ex.id)
      .eq('language_code', 'ko')
      .single();
      
    if (trans) {
      exhibitionsWithTitles.push({
        ...ex,
        title: trans.exhibition_title,
        artists: trans.artists,
        venue: ex.venues?.name
      });
    }
  }
  
  // Print by batch
  for (let i = 0; i < exhibitionsWithTitles.length; i++) {
    const batchNum = Math.floor(i / 5) + 1;
    const itemNum = (i % 5) + 1;
    const ex = exhibitionsWithTitles[i];
    
    if (itemNum === 1) {
      console.log(`\n=== BATCH ${batchNum} (전시 ${i+1}-${Math.min(i+5, exhibitionsWithTitles.length)}번) ===`);
    }
    
    console.log(`${i+1}. ${ex.title || 'No Title'} (${ex.venue}) - ${ex.start_date}~${ex.end_date}`);
    if (ex.artists && ex.artists.length > 0) {
      console.log(`   작가: ${ex.artists.join(', ')}`);
    }
  }
  
  console.log(`\n📌 총 ${Math.ceil(exhibitions.length / 5)}개의 batch 파일이 필요합니다.`);
  console.log(`📝 현재 표시된 전시: ${exhibitionsWithTitles.length}개 (Batch 1-${Math.ceil(exhibitionsWithTitles.length / 5)})`);
  
  // Status summary
  console.log('\n📊 작업 현황:');
  console.log('✅ Batch 1-4 (1-20번): 완료');
  console.log(`⏳ Batch 5-${Math.ceil(exhibitions.length / 5)} (21-${exhibitions.length}번): 대기중`);
}

findAllExhibitionsNeedingDetails();
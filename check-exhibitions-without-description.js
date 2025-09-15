const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

// Supabase URL과 Service Role Key 직접 설정
const SUPABASE_URL = 'https://hgltvdshuyfffskvjmst.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

async function checkExhibitionsWithoutDescription() {
  try {
    console.log('🔍 Checking exhibitions without descriptions...\n');
    
    // exhibitions_translations 테이블에서 description이 null이거나 빈 문자열인 전시 조회
    const { data: exhibitionsWithoutDesc, error } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        title,
        subtitle,
        description,
        venue_name,
        venue_district,
        exhibitions_master!inner(
          id,
          start_date,
          end_date,
          status
        )
      `)
      .or('description.is.null,description.eq.')
      .eq('locale', 'ko')
      .order('exhibitions_master(start_date)', { ascending: false });

    if (error) {
      console.error('Error fetching exhibitions:', error);
      return;
    }

    console.log(`총 ${exhibitionsWithoutDesc.length}개의 전시가 description이 없습니다:\n`);
    
    exhibitionsWithoutDesc.forEach((exhibition, index) => {
      const master = exhibition.exhibitions_master;
      console.log(`${index + 1}. ${exhibition.title}`);
      if (exhibition.subtitle) {
        console.log(`   부제: ${exhibition.subtitle}`);
      }
      console.log(`   장소: ${exhibition.venue_name} (${exhibition.venue_district})`);
      console.log(`   기간: ${master.start_date} ~ ${master.end_date}`);
      console.log(`   상태: ${master.status}`);
      console.log(`   ID: ${exhibition.exhibition_id}`);
      console.log('');
    });

    // 상태별 집계
    const statusCount = {};
    exhibitionsWithoutDesc.forEach(ex => {
      const status = ex.exhibitions_master.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    console.log('\n📊 상태별 집계:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}개`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkExhibitionsWithoutDescription();
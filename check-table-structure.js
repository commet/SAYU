const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hgltvdshuyfffskvjmst.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructure() {
  try {
    // exhibitions_translations 테이블의 컬럼 구조 확인
    const { data, error } = await supabase
      .from('exhibitions_translations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Sample record from exhibitions_translations:');
    console.log(JSON.stringify(data, null, 2));

    // 빈 description 개수 확인 
    const { count: nullCount, error: countError } = await supabase
      .from('exhibitions_translations')
      .select('*', { count: 'exact', head: true })
      .or('description.is.null,description.eq.""');

    if (!countError) {
      console.log(`\nRecords with null or empty description: ${nullCount}`);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTableStructure();
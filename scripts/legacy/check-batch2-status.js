const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBatch2() {
  const batch2Ids = [
    '5ac404b8-4f02-4824-9f66-2d563f588283',
    '85e02234-2857-4980-9103-f25866ab3b0b',
    'a4b23d9c-8bdd-4816-8c28-b6f9ccdc2a42',
    '0ca2cce0-0b4e-4053-9089-5198ee8b750a',
    '284f9c11-7566-4946-a9ad-53f1ae417f6b',
    '167c8cd5-8bc1-406a-b05c-35f7faa0441c',
    '2701718d-24d6-42d3-876c-0d33015b1175',
    '4e68e19d-a6e2-482c-81cd-04af47a1fb5c',
    '05e60ff1-46f6-4559-b5f3-2a953c342f73'
  ];

  const { data, error } = await supabase
    .from('exhibitions_translations')
    .select('exhibition_id, exhibition_title, description')
    .eq('language_code', 'ko')
    .in('exhibition_id', batch2Ids);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('배치 2 업데이트 상태:');
  console.log('=====================================');
  data.forEach(d => {
    console.log(`✅ ${d.exhibition_title}: ${d.description ? 'Description 있음' : 'Description 없음'}`);
  });
  console.log(`\n총 ${data.length}개 중 ${data.filter(d => d.description).length}개 업데이트됨`);
}

checkBatch2().catch(console.error);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBatch1() {
  const batch1Ids = [
    '52103c1c-dbf3-40eb-9885-83ac47fa8aeb',
    'c480657f-6613-4aec-b9cd-ae49b2188f4c',
    '3fe55353-f6dc-4400-8902-46892cbc8fcf',
    '5ffaa6e8-4510-4859-b57a-abc8e76f7744',
    '8cb3c6e7-b5c5-4e1d-98cc-6f57c82b238d',
    '72594414-63d2-49d2-8611-c167f8ee0267',
    '7930ec6f-8767-43c7-9bfd-ba7dc5546314',
    '3237bda2-05cf-4e4b-a289-22069ab08b42',
    'be9337eb-7ab5-439e-b984-1b9662fa52d0'
  ];

  const { data, error } = await supabase
    .from('exhibitions_translations')
    .select('exhibition_id, exhibition_title, description')
    .eq('language_code', 'ko')
    .in('exhibition_id', batch1Ids);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('배치 1 업데이트 상태:');
  console.log('=====================================');
  data.forEach(d => {
    console.log(`✅ ${d.exhibition_title}: ${d.description ? 'Description 있음' : 'Description 없음'}`);
  });
  console.log(`\n총 ${data.length}개 중 ${data.filter(d => d.description).length}개 업데이트됨`);
}

checkBatch1().catch(console.error);
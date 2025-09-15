const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hgltvdshuyfffskvjmst.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listExhibitionsWithoutDescription() {
  try {
    // description이 없는 전시 조회
    const { data, error } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        exhibition_title,
        subtitle,
        venue_name,
        city,
        language_code,
        description
      `)
      .or('description.is.null,description.eq.""')
      .order('exhibition_title');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`\n=== Description이 없는 전시 목록 (총 ${data.length}건) ===\n`);
    
    // 언어별로 그룹화
    const byLanguage = {};
    data.forEach(item => {
      if (!byLanguage[item.language_code]) {
        byLanguage[item.language_code] = [];
      }
      byLanguage[item.language_code].push(item);
    });

    // 언어별 출력
    Object.entries(byLanguage).forEach(([lang, exhibitions]) => {
      console.log(`\n📌 ${lang.toUpperCase()} (${exhibitions.length}건):`);
      console.log('─'.repeat(80));
      
      exhibitions.forEach((ex, idx) => {
        console.log(`${idx + 1}. ${ex.exhibition_title || '(제목 없음)'}`);
        if (ex.subtitle) console.log(`   부제: ${ex.subtitle}`);
        console.log(`   장소: ${ex.venue_name} (${ex.city})`);
        console.log(`   ID: ${ex.exhibition_id}`);
        console.log('');
      });
    });

    // 전시 ID별로 유니크한 개수 확인
    const uniqueExhibitionIds = [...new Set(data.map(d => d.exhibition_id))];
    console.log(`\n=== 요약 ===`);
    console.log(`총 ${uniqueExhibitionIds.length}개의 고유한 전시`);
    console.log(`총 ${data.length}개의 번역 레코드`);
    
    // 언어별 요약
    Object.entries(byLanguage).forEach(([lang, exhibitions]) => {
      console.log(`  - ${lang}: ${exhibitions.length}건`);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listExhibitionsWithoutDescription();
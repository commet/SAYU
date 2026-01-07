const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRemainingExhibitions() {
  console.log('========================================');
  console.log('FIXING REMAINING BATCH 5 EXHIBITIONS');
  console.log('========================================\n');
  
  // 1. First, create 더현대서울 venue if it doesn't exist
  console.log('1. Creating 더현대서울 venue...');
  
  const { data: existingVenue } = await supabase
    .from('venues')
    .select('id')
    .eq('name', '더현대서울')
    .single();
  
  let theHyundaiVenueId;
  
  if (existingVenue) {
    console.log('   ✓ 더현대서울 venue already exists');
    theHyundaiVenueId = existingVenue.id;
  } else {
    const { data: newVenue, error: venueError } = await supabase
      .from('venues')
      .insert({
        name: '더현대서울'
      })
      .select()
      .single();
    
    if (venueError) {
      console.error('   ❌ Error creating venue:', venueError.message);
      return;
    }
    
    console.log(`   ✓ Created 더현대서울 venue with ID: ${newVenue.id}`);
    theHyundaiVenueId = newVenue.id;
  }
  
  // 2. Insert 마나 모아나 exhibition (with 'contemporary' genre instead of 'historical')
  console.log('\n2. Inserting 마나 모아나 exhibition...');
  
  const manaExhibition = {
    venue_id: '490cec4a-ee5c-489e-b2a0-1e52848d4d78', // 국립중앙박물관 ID from previous run
    start_date: '2025-04-30',
    end_date: '2025-09-14',
    status: 'ongoing',
    ticket_price_adult: 0,
    ticket_price_student: 0,
    genre: 'contemporary', // Changed from 'historical'
    exhibition_type: 'group',
    source_url: 'https://www.museum.go.kr/',
    instagram_url: null
  };
  
  const { data: manaData, error: manaError } = await supabase
    .from('exhibitions_master')
    .insert(manaExhibition)
    .select()
    .single();
  
  if (manaError) {
    console.error('   ❌ Error inserting 마나 모아나:', manaError.message);
  } else {
    console.log(`   ✓ Created exhibition ID: ${manaData.id}`);
    
    // Add translations
    const manaTranslations = [
      {
        exhibition_id: manaData.id,
        language_code: 'ko',
        exhibition_title: '마나 모아나-신성한 바다의 예술, 오세아니아',
        artists: ['오세아니아 예술가들'],
        description: '오세아니아 예술과 문화를 깊이 있게 조망하는 국내 최초 전시. 프랑스 케브랑리-자크시라크박물관의 18~20세기 오세아니아 소장품 180여 건을 소개한다. 대형 카누, 조각, 석상, 악기, 장신구, 직물 등을 통해 오세아니아 사람들의 삶과 철학을 생생히 전달한다.',
        venue_name: '국립중앙박물관',
        city: '서울',
        operating_hours: '월,화,목,금,일 10:00-18:00, 수,토 10:00-21:00',
        ticket_info: '관람료 정보는 홈페이지 참조',
        phone_number: '1588-7890',
        address: '서울시 용산구 서빙고로 137'
      },
      {
        exhibition_id: manaData.id,
        language_code: 'en',
        exhibition_title: 'Mana Moana: Art of the Sacred Ocean, Oceania',
        artists: ['Oceanian Artists'],
        description: 'First major exhibition in Korea exploring Oceanian art and culture. Features 180 pieces from the 18th-20th centuries from the Musée du quai Branly-Jacques Chirac collection.',
        venue_name: 'National Museum of Korea',
        city: 'Seoul',
        operating_hours: 'Mon,Tue,Thu,Fri,Sun 10:00-18:00, Wed,Sat 10:00-21:00',
        ticket_info: 'Check website for ticket info'
      }
    ];
    
    for (const trans of manaTranslations) {
      const { error } = await supabase
        .from('exhibitions_translations')
        .insert(trans);
      
      if (error) {
        console.error(`   ❌ Error adding ${trans.language_code} translation:`, error.message);
      } else {
        console.log(`   ✓ Added ${trans.language_code} translation`);
      }
    }
  }
  
  // 3. Insert 앨리스 달튼 브라운 exhibition
  console.log('\n3. Inserting 앨리스 달튼 브라운 exhibition...');
  
  const aliceExhibition = {
    venue_id: theHyundaiVenueId,
    start_date: '2025-06-13',
    end_date: '2025-09-20',
    status: 'ongoing',
    ticket_price_adult: 20000,
    ticket_price_student: 15000,
    genre: 'contemporary',
    exhibition_type: 'solo',
    source_url: 'https://www.thehyundai.com/',
    instagram_url: 'https://www.instagram.com/ccoc_inc'
  };
  
  const { data: aliceData, error: aliceError } = await supabase
    .from('exhibitions_master')
    .insert(aliceExhibition)
    .select()
    .single();
  
  if (aliceError) {
    console.error('   ❌ Error inserting 앨리스 달튼 브라운:', aliceError.message);
  } else {
    console.log(`   ✓ Created exhibition ID: ${aliceData.id}`);
    
    // Add translations
    const aliceTranslations = [
      {
        exhibition_id: aliceData.id,
        language_code: 'ko',
        exhibition_title: '앨리스 달튼 브라운 회고전: 잠시, 그리고 영원히',
        artists: ['앨리스 달튼 브라운'],
        description: '미국 현대미술 작가 앨리스 달튼 브라운의 국내 최대 규모 회고전. 1961년 수채화부터 2025년 신작까지 약 70여 년간의 작업 세계를 총망라한다.',
        venue_name: '더현대서울 ALT.1',
        city: '서울',
        operating_hours: '평일(월-목) 10:30-20:00, 주말(금-일) 10:30-20:30',
        ticket_info: '성인 20,000원, 청소년 15,000원, 어린이 12,000원',
        phone_number: '02-836-6611',
        address: '서울시 영등포구 여의대로 108 더현대서울 6층'
      },
      {
        exhibition_id: aliceData.id,
        language_code: 'en',
        exhibition_title: 'Alice Dalton Brown Retrospective: In a Moment, Forever',
        artists: ['Alice Dalton Brown'],
        description: 'Major retrospective of American contemporary artist Alice Dalton Brown, spanning 70 years from 1961 watercolors to 2025 new works.',
        venue_name: 'The Hyundai Seoul ALT.1',
        city: 'Seoul',
        operating_hours: 'Weekdays(Mon-Thu) 10:30-20:00, Weekends(Fri-Sun) 10:30-20:30',
        ticket_info: 'Adults 20,000 KRW, Youth 15,000 KRW, Children 12,000 KRW'
      }
    ];
    
    for (const trans of aliceTranslations) {
      const { error } = await supabase
        .from('exhibitions_translations')
        .insert(trans);
      
      if (error) {
        console.error(`   ❌ Error adding ${trans.language_code} translation:`, error.message);
      } else {
        console.log(`   ✓ Added ${trans.language_code} translation`);
      }
    }
  }
  
  // 4. Final verification
  console.log('\n========================================');
  console.log('VERIFICATION');
  console.log('========================================');
  
  const { data: allBatch5, error: verifyError } = await supabase
    .from('exhibitions_master')
    .select(`
      id,
      start_date,
      end_date,
      exhibitions_translations!inner(
        exhibition_title,
        language_code
      )
    `)
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
  
  if (!verifyError && allBatch5) {
    const koExhibitions = allBatch5.filter(ex => 
      ex.exhibitions_translations.some(t => t.language_code === 'ko')
    );
    
    console.log(`\nAll Batch 5 exhibitions (${koExhibitions.length} total):`);
    koExhibitions.forEach((ex, idx) => {
      const koTitle = ex.exhibitions_translations.find(t => t.language_code === 'ko')?.exhibition_title;
      console.log(`${idx + 1}. ${koTitle}`);
      console.log(`   Period: ${ex.start_date} ~ ${ex.end_date}`);
    });
  }
  
  console.log('\n✅ Batch 5 complete!');
}

fixRemainingExhibitions().catch(console.error);
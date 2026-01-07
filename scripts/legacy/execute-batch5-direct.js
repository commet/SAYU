const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Exhibition data for batch 5
const exhibitions = [
  {
    // 1. David Salle: Under One Roof
    master: {
      start_date: '2025-05-10',
      end_date: '2025-09-07',
      status: 'ongoing',
      ticket_price_adult: 5000,
      ticket_price_student: 4000,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://storage.hyundaicard.com/',
      instagram_url: null
    },
    venue_name: '현대카드 스토리지',
    translations: {
      ko: {
        exhibition_title: 'David Salle: Under One Roof',
        artists: ['데이비드 살레'],
        description: '국내 최초로 공개하는 데이비드 살레의 회고전. 신작 <Windows> 시리즈 20여 점을 포함해 총 40여 점의 회화와 미디어 작품을 선보이며 그의 작품 세계 전반을 아우른다. 이미지의 차용과 결합을 통해 끝없이 새로운 이야기를 창조하는 살레의 예술적 서사를 담았다.',
        venue_name: '현대카드 스토리지',
        city: '서울',
        operating_hours: '화-토 12:00-19:00, 일 12:00-18:00, 월 휴관',
        ticket_info: '유료 4,000-5,000원',
        phone_number: '02-2014-7850',
        address: '서울시 용산구 이태원로 248 지하2층'
      },
      en: {
        exhibition_title: 'David Salle: Under One Roof',
        artists: ['David Salle'],
        description: 'First retrospective of David Salle in Korea, featuring over 40 paintings and media works including 20 pieces from the new Windows series. The exhibition explores Salle\'s artistic narrative through appropriation and combination of images.',
        venue_name: 'Hyundai Card Storage',
        city: 'Seoul',
        operating_hours: 'Tue-Sat 12:00-19:00, Sun 12:00-18:00, Mon closed',
        ticket_info: '4,000-5,000 KRW'
      }
    }
  },
  {
    // 2. 마나 모아나
    master: {
      start_date: '2025-04-30',
      end_date: '2025-09-14',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'historical',
      exhibition_type: 'group',
      source_url: 'https://www.museum.go.kr/',
      instagram_url: null
    },
    venue_name: '국립중앙박물관',
    translations: {
      ko: {
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
      en: {
        exhibition_title: 'Mana Moana: Art of the Sacred Ocean, Oceania',
        artists: ['Oceanian Artists'],
        description: 'First major exhibition in Korea exploring Oceanian art and culture. Features 180 pieces from the 18th-20th centuries from the Musée du quai Branly-Jacques Chirac collection, including large canoes, sculptures, stone statues, instruments, ornaments, and textiles.',
        venue_name: 'National Museum of Korea',
        city: 'Seoul',
        operating_hours: 'Mon,Tue,Thu,Fri,Sun 10:00-18:00, Wed,Sat 10:00-21:00',
        ticket_info: 'Check website for ticket info'
      }
    }
  },
  {
    // 3. 앨리스 달튼 브라운
    master: {
      start_date: '2025-06-13',
      end_date: '2025-09-20',
      status: 'ongoing',
      ticket_price_adult: 20000,
      ticket_price_student: 15000,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.thehyundai.com/',
      instagram_url: 'https://www.instagram.com/ccoc_inc'
    },
    venue_name: '더현대 서울',
    translations: {
      ko: {
        exhibition_title: '앨리스 달튼 브라운 회고전: 잠시, 그리고 영원히',
        artists: ['앨리스 달튼 브라운'],
        description: '미국 현대미술 작가 앨리스 달튼 브라운의 국내 최대 규모 회고전. 1961년 수채화부터 2025년 신작까지 약 70여 년간의 작업 세계를 총망라한다. 원화 100여 점과 드로잉·소품 40여 점을 통해 창문, 커튼, 바다, 빛과 그림자 등 일상적 소재로 그려낸 서정적이고 명상적인 풍경을 선보인다.',
        venue_name: '더현대 서울 ALT.1',
        city: '서울',
        operating_hours: '평일(월-목) 10:30-20:00, 주말(금-일) 10:30-20:30',
        ticket_info: '성인 20,000원, 청소년 15,000원, 어린이 12,000원',
        phone_number: '02-836-6611',
        address: '서울시 영등포구 여의대로 108 더현대서울 6층'
      },
      en: {
        exhibition_title: 'Alice Dalton Brown Retrospective: In a Moment, Forever',
        artists: ['Alice Dalton Brown'],
        description: 'Major retrospective of American contemporary artist Alice Dalton Brown, spanning 70 years from 1961 watercolors to 2025 new works. Features over 100 paintings and 40 drawings exploring light, space, and nature through poetic and meditative landscapes.',
        venue_name: 'The Hyundai Seoul ALT.1',
        city: 'Seoul',
        operating_hours: 'Weekdays(Mon-Thu) 10:30-20:00, Weekends(Fri-Sun) 10:30-20:30',
        ticket_info: 'Adults 20,000 KRW, Youth 15,000 KRW, Children 12,000 KRW'
      }
    }
  },
  {
    // 4. James Turrell
    master: {
      start_date: '2025-06-14',
      end_date: '2025-09-27',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.pacegallery.com/exhibitions/james-turrell-the-return/',
      instagram_url: 'https://www.instagram.com/p/DOPI9umijFK/'
    },
    venue_name: '페이스갤러리',
    translations: {
      ko: {
        exhibition_title: 'James Turrell: The Return',
        artists: ['제임스 터렐'],
        description: '2008년 이후 서울에서의 첫 개인전. 페이스갤러리 65주년 기념 전시로, 신작 Wedgework을 포함한 5개의 설치작품과 Glassworks 시리즈, Roden Crater 프로젝트 관련 작품들을 선보인다. 빛과 공간의 물질성을 다루며 "자신이 보는 것을 보는" 경험을 제공하는 몰입형 설치 작품들을 만날 수 있다.',
        venue_name: '페이스갤러리',
        city: '서울',
        operating_hours: '화-토 10:00-18:00, 일월 휴관',
        ticket_info: '예약제 운영 (네이버 예약)',
        phone_number: '02-790-9388',
        address: '서울시 용산구 이태원로 267'
      },
      en: {
        exhibition_title: 'James Turrell: The Return',
        artists: ['James Turrell'],
        description: 'First solo exhibition in Seoul since 2008, featuring five installations including a new site-specific Wedgework. Part of Pace\'s 65th anniversary celebration, showcasing the California Light and Space movement artist\'s immersive installations that require "seeing yourself seeing".',
        venue_name: 'Pace Gallery',
        city: 'Seoul',
        operating_hours: 'Tue-Sat 10:00-18:00, Sun-Mon closed',
        ticket_info: 'By advance reservation only (Naver Booking)'
      }
    }
  },
  {
    // 5. Pit Calls Wall
    master: {
      start_date: '2025-07-16',
      end_date: '2025-09-06',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'http://museumhead.com/타면-나타나는-굴-pit-calls-wall/',
      instagram_url: 'https://www.instagram.com/museumhead_/'
    },
    venue_name: '뮤지엄헤드',
    translations: {
      ko: {
        exhibition_title: 'Pit Calls Wall - 타면 나타나는 굴',
        artists: ['김세은'],
        description: '도시 공간의 감각적 밀도를 포착하는 김세은 개인전. 터널을 주요 모티프로 도시의 복합적 성질과 시지각의 층위를 회화적으로 구성한다. 이동과 관통, 전이와 움직임을 통해 고정된 시각성을 재탐색하며, 도시에서 반복되는 눈과 몸의 경험을 회화적 표면으로 시각화한다.',
        venue_name: '뮤지엄헤드',
        city: '서울',
        operating_hours: '12:00-19:00, 일월 휴관',
        ticket_info: '무료',
        phone_number: null,
        address: '서울시 종로구 계동길 84-3, 1층'
      },
      en: {
        exhibition_title: 'Pit Calls Wall',
        artists: ['Seeun Kim'],
        description: 'Solo exhibition exploring the sensory density of urban space. Using tunnel as focal point to reflect on city\'s complexity and organize layers of perception through painterly means. Visualizes the repeated experiences of eye and body in the city through painting surfaces.',
        venue_name: 'Museumhead',
        city: 'Seoul',
        operating_hours: '12:00-19:00, Closed Sun-Mon',
        ticket_info: 'Free'
      }
    }
  }
];

async function insertExhibitions() {
  console.log('========================================');
  console.log('STARTING BATCH 5 EXHIBITION INSERTION');
  console.log('========================================\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < exhibitions.length; i++) {
    const exhibition = exhibitions[i];
    console.log(`\n[${i + 1}/5] Processing: ${exhibition.translations.ko.exhibition_title}`);
    console.log(`  Venue: ${exhibition.venue_name}`);
    
    try {
      // 1. Find venue ID
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id')
        .eq('name', exhibition.venue_name)
        .single();
      
      if (venueError || !venue) {
        console.error(`  ❌ Venue not found: ${exhibition.venue_name}`);
        errorCount++;
        continue;
      }
      
      console.log(`  ✓ Found venue ID: ${venue.id}`);
      
      // 2. Insert into exhibitions_master
      const masterData = {
        ...exhibition.master,
        venue_id: venue.id
      };
      
      const { data: newExhibition, error: masterError } = await supabase
        .from('exhibitions_master')
        .insert(masterData)
        .select()
        .single();
      
      if (masterError) {
        console.error(`  ❌ Error inserting master: ${masterError.message}`);
        errorCount++;
        continue;
      }
      
      console.log(`  ✓ Created exhibition ID: ${newExhibition.id}`);
      
      // 3. Insert Korean translation
      const koTranslation = {
        exhibition_id: newExhibition.id,
        language_code: 'ko',
        ...exhibition.translations.ko
      };
      
      const { error: koError } = await supabase
        .from('exhibitions_translations')
        .insert(koTranslation);
      
      if (koError) {
        console.error(`  ❌ Error inserting Korean translation: ${koError.message}`);
      } else {
        console.log(`  ✓ Added Korean translation`);
      }
      
      // 4. Insert English translation
      const enTranslation = {
        exhibition_id: newExhibition.id,
        language_code: 'en',
        ...exhibition.translations.en
      };
      
      const { error: enError } = await supabase
        .from('exhibitions_translations')
        .insert(enTranslation);
      
      if (enError) {
        console.error(`  ❌ Error inserting English translation: ${enError.message}`);
      } else {
        console.log(`  ✓ Added English translation`);
      }
      
      successCount++;
      console.log(`  ✅ Exhibition successfully added!`);
      
    } catch (error) {
      console.error(`  ❌ Unexpected error: ${error.message}`);
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n========================================');
  console.log('INSERTION COMPLETE');
  console.log('========================================');
  console.log(`✅ Successfully added: ${successCount} exhibitions`);
  console.log(`❌ Failed: ${errorCount} exhibitions`);
  
  // Verify
  if (successCount > 0) {
    console.log('\nVerifying inserted exhibitions...');
    const { data: verifyData, error: verifyError } = await supabase
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
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (!verifyError && verifyData) {
      console.log(`\nFound ${verifyData.length} recently added exhibitions:`);
      const koExhibitions = verifyData.filter(ex => 
        ex.exhibitions_translations.some(t => t.language_code === 'ko')
      );
      
      koExhibitions.forEach((ex, idx) => {
        const koTitle = ex.exhibitions_translations.find(t => t.language_code === 'ko')?.exhibition_title;
        console.log(`${idx + 1}. ${koTitle}`);
        console.log(`   ID: ${ex.id}`);
        console.log(`   Period: ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
  }
}

insertExhibitions().catch(console.error);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Batch 7 exhibitions data
const batch7Exhibitions = [
  {
    // 1. 딥다이버 Deep Diver - 배윤환 (스페이스K 서울)
    master: {
      start_date: '2025-08-14',
      end_date: '2025-11-09',
      status: 'ongoing',
      ticket_price_adult: 8000,
      ticket_price_student: 5000,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.spacek.co.kr/concert/view.do?eco_idx=237',
      instagram_url: 'https://www.instagram.com/spacek_korea/'
    },
    venue_name: '스페이스K 서울',
    translations: {
      ko: {
        exhibition_title: '딥다이버',
        artists: ['배윤환'],
        description: '배윤환은 익숙한 빛의 층을 걷어내고 검정이라는 무채색의 세계로 우리를 안내한다. 그 어둠은 공허가 아닌 농밀한 사유의 공간이다. 창작 과정에서 마주한 개인의 고뇌와 공동체의 해체, 재난과 전쟁 같은 시대의 징후들을 우화적 기법으로 풀어내며, 회화, 드로잉, 설치, 영상 등 다양한 장르로 서사를 넓고 깊게 펼쳐 보인다.',
        venue_name: '스페이스K 서울',
        city: '서울',
        operating_hours: '화-일 10:00-18:00, 월 휴관',
        ticket_info: '성인 8,000원, 청소년 5,000원, 미취학 3,000원',
        phone_number: '02-3665-8918',
        address: '서울시 강서구 마곡중앙8로 32'
      },
      en: {
        exhibition_title: 'Deep Diver',
        artists: ['Bae Yoon Hwan'],
        description: 'Bae Yoon Hwan strips away familiar layers of light and guides us into the achromatic world of black. This darkness is not a void but a space of profound contemplation. The artist channels personal creative struggles and symptoms of our era such as dissolution of communities, disasters, and war into his allegorical language through paintings, drawings, installations, and videos.',
        venue_name: 'Space K Seoul',
        city: 'Seoul',
        operating_hours: 'Tue-Sun 10:00-18:00, Closed Mon',
        ticket_info: 'Adults 8,000 KRW, Youth 5,000 KRW, Children 3,000 KRW'
      }
    }
  },
  {
    // 2. 얇은 도약의 나날들 - 양혜규 (도도빌딩)
    master: {
      start_date: '2025-08-15',
      end_date: '2025-09-07',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.instagram.com/studiohaegueyang/',
      instagram_url: 'https://www.instagram.com/studiohaegueyang/'
    },
    venue_name: '도도빌딩',
    translations: {
      ko: {
        exhibition_title: '얇은 도약의 나날들',
        artists: ['양혜규'],
        description: '양혜규 스튜디오는 지난 십여년 간 작가의 스튜디오였던 이 곳에서 복합적인 서사와 모티브를 압축하며 납작한 표면의 무한한 공간성을 탐구해왔다. 작품 제작과 생활의 공간이었던 스튜디오는 집약적 진화를 거듭해온 <황홀망> 연작을 반추하는 전시라는 소임을 잠시 부여받는다.',
        venue_name: '토토빌딩 3층',
        city: '서울',
        operating_hours: '금요일/9월1일 14:00-20:00, 토일 12:00-18:00',
        ticket_info: '무료',
        phone_number: null,
        address: '서울시 종로구 율곡로 187 토토빌딩 3층'
      },
      en: {
        exhibition_title: 'Lean Leap Days',
        artists: ['Haegue Yang'],
        description: 'Studio Haegue Yang initiated Lean Leap Days in a former studio for the last decade that once explored the infinite depth of the spatiality of flat surfaces, where numerous narratives and motifs have been compressed. The space temporarily becomes a gallery contemplating the intense evolution of Mesmerizing Mesh series.',
        venue_name: 'Toto building 3F',
        city: 'Seoul',
        operating_hours: 'Fri & Sep 1st 14:00-20:00, Sat-Sun 12:00-18:00',
        ticket_info: 'Free'
      }
    }
  },
  {
    // 3. 파편의 흐름 - 민성홍 (갤러리조선)
    master: {
      start_date: '2025-08-16',
      end_date: '2025-10-26',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.gallerychosun.com/exhibitions/207-flow-of-debris/',
      instagram_url: 'https://www.instagram.com/gallerychosun/'
    },
    venue_name: '갤러리조선',
    translations: {
      ko: {
        exhibition_title: '파편의 흐름',
        artists: ['민성홍'],
        description: '전시 제목 Flow of Debris에서 Debris(파편/부스러기)는 잘게 잘려 나간 또는 물건에서 떨어져 나간 조각이라는 의미를 가지며, 외부적 힘이나 흐름에 영향하여 구조적 변형을 가지거나 새로운 위치를 잡아 나가는 토석류의 지질학적 현상들로 해석된다. 민성홍은 오래된 가구, 버려진 풍경화, 부서진 경치 벽화, 산산조각난 물건들을 수집하고 재배열하며 분산과 중첩, 연결과 중단이라는 모순적 이미지의 풍경을 탐구한다. 물리적으로 파쇄된 오브제들은 더 작은 조각으로 환원되어 지하와 지상의 분할된 공간을 유기적으로 연결한다.',
        venue_name: '갤러리조선',
        city: '서울',
        operating_hours: '화-일 10:30-18:30, 월/공휴일 휴관',
        ticket_info: '무료',
        phone_number: '02-723-7133',
        address: '서울시 종로구 북촌로5길 64'
      },
      en: {
        exhibition_title: 'Flow of Debris',
        artists: ['Seonghong Min'],
        description: 'Flow of Debris speaks of transient objects that refuse to stay still or drift but soon become accumulated. Min collects and rearranges old furniture, discarded landscaping paintings, fractured scenic murals, and shattered objects exploring a landscape of contradictory imagery: dispersion and overlap, connection and suspension. Objects physically broken down by a woodchipper are reduced into smaller pieces and organically link the divided space.',
        venue_name: 'Gallery Chosun',
        city: 'Seoul',
        operating_hours: 'Tue-Sun 10:30-18:30, Closed Mon/Holidays',
        ticket_info: 'Free'
      }
    }
  },
  {
    // 4. Dust - Ruofan Chen (SHOWER)
    master: {
      start_date: '2025-08-22',
      end_date: '2025-09-14',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.shower.gallery/exhibitions/dust',
      instagram_url: 'https://www.instagram.com/p/DNagdF5N2eY/'
    },
    venue_name: 'SHOWER',
    translations: {
      ko: {
        exhibition_title: 'Dust',
        artists: ['루오판 첸'],
        description: '루오판 첸은 생태적·신체적·정서적 차원의 만성적인 보이지 않는 취약성을 탐구한다. 우한의 가구 공장에서 수집한 산업 잔여물을 통해 체계적 침식을 드러내는 물질적 증거를 제시한다. 갤러리를 가로지르는 기울어진 나무 벽 속에 양면 회화가 삽입되어 있으며, 공장에서 수집한 먼지와 유화를 섞어 그린 작품은 방치된 노동의 흔적을 비춘다. 샴푸(Shampoo) 집단과의 협업으로 기획된 전시.',
        venue_name: 'SHOWER',
        city: '서울',
        operating_hours: '화-토 13:00-19:00',
        ticket_info: '무료',
        phone_number: null,
        address: '서울'
      },
      en: {
        exhibition_title: 'Dust',
        artists: ['Ruofan Chen'],
        description: 'Chen explores chronic invisible vulnerabilities - ecological, physical, emotional - that accumulate silently until crisis. Collecting industrial detritus from Wuhan furniture factories, she transforms neglected residues into tangible evidence of systemic erosion. A tilted wooden partition cleaves the gallery with embedded double-sided paintings mixing oil with factory dust, their particulate surfaces mirroring neglected labor. Conceived through collaboration with Shampoo collective.',
        venue_name: 'SHOWER',
        city: 'Seoul',
        operating_hours: 'Tue-Sat 13:00-19:00',
        ticket_info: 'Free'
      }
    }
  }
];

async function createVenuesIfNeeded() {
  const venuesToCreate = [
    { name: '스페이스K 서울' },
    { name: '도도빌딩' },
    { name: '갤러리조선' },
    { name: 'SHOWER' }
  ];
  
  console.log('Checking and creating venues...\n');
  
  for (const venue of venuesToCreate) {
    const { data: existing } = await supabase
      .from('venues')
      .select('id, name')
      .eq('name', venue.name)
      .single();
    
    if (existing) {
      console.log(`✓ ${venue.name} already exists (ID: ${existing.id})`);
    } else {
      const { data: newVenue, error } = await supabase
        .from('venues')
        .insert({ name: venue.name })
        .select()
        .single();
      
      if (error) {
        console.error(`✗ Error creating ${venue.name}: ${error.message}`);
      } else {
        console.log(`✓ Created ${venue.name} (ID: ${newVenue.id})`);
      }
    }
  }
  console.log();
}

async function insertBatch7() {
  console.log('========================================');
  console.log('BATCH 7 EXHIBITION INSERTION');
  console.log('========================================\n');
  
  // First create venues if needed
  await createVenuesIfNeeded();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batch7Exhibitions.length; i++) {
    const exhibition = batch7Exhibitions[i];
    console.log(`[${i + 1}/${batch7Exhibitions.length}] Processing: ${exhibition.translations.ko.exhibition_title}`);
    console.log(`  Venue: ${exhibition.venue_name}`);
    
    try {
      // 1. Find venue ID
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id')
        .eq('name', exhibition.venue_name)
        .single();
      
      if (venueError || !venue) {
        console.error(`  ✗ Venue not found: ${exhibition.venue_name}`);
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
        console.error(`  ✗ Error inserting master: ${masterError.message}`);
        errorCount++;
        continue;
      }
      
      console.log(`  ✓ Created exhibition ID: ${newExhibition.id}`);
      
      // 3. Insert translations
      for (const lang of ['ko', 'en']) {
        const translation = {
          exhibition_id: newExhibition.id,
          language_code: lang,
          ...exhibition.translations[lang]
        };
        
        const { error: transError } = await supabase
          .from('exhibitions_translations')
          .insert(translation);
        
        if (transError) {
          console.error(`  ✗ Error inserting ${lang} translation: ${transError.message}`);
        } else {
          console.log(`  ✓ Added ${lang} translation`);
        }
      }
      
      successCount++;
      console.log(`  ✅ Exhibition successfully added!\n`);
      
    } catch (error) {
      console.error(`  ✗ Unexpected error: ${error.message}\n`);
      errorCount++;
    }
  }
  
  console.log('========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`✅ Successfully added: ${successCount} exhibitions`);
  console.log(`✗ Failed: ${errorCount} exhibitions`);
  console.log('\n📝 Note: Add remaining exhibitions when information is provided');
  console.log('   - VELVET HAMMERS already completed in Batch 4');
  console.log('   - Need info for: 양혜규, 파편의 흐름, Ruofan Chen');
}

insertBatch7().catch(console.error);
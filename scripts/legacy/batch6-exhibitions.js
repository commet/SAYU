const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Batch 6 exhibitions data
const batch6Exhibitions = [
  {
    // 1. 김주리 - 물 ∴ 산 Matter Ridge (MO BY CAN)
    master: {
      start_date: '2025-08-20',
      end_date: '2025-09-20',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'http://can-foundation.org/archives/exhibition/물-∴-산-matter-ridge',
      instagram_url: null
    },
    venue_name: 'MO BY CAN',
    translations: {
      ko: {
        exhibition_title: '물 ∴ 산 Matter Ridge',
        artists: ['김주리'],
        description: '김주리 개인전에서 흙은 감각, 시간, 기억의 정치학이 교차하는 물질로 자리한다. 전시장의 흙덩어리들은 사라진 것의 증거이자 여전히 생성 중인 장면으로, 무엇을 기억하고 어떻게 퇴적할 것인가의 질문으로 다가온다. 도시개발의 면면을 경유한 작가의 작업과 연결되며 전 지구적 보편성을 드러낸다.',
        venue_name: 'MO BY CAN',
        city: '서울',
        operating_hours: '월-토 10:00-18:00, 일요일/공휴일 휴관',
        ticket_info: '무료',
        phone_number: '02-766-7660',
        address: '서울특별시 용산구 한남동 733-70, 1층'
      },
      en: {
        exhibition_title: 'Matter Ridge',
        artists: ['Kim Juri'],
        description: 'In Kim Juri\'s solo exhibition, soil becomes material where sensory, temporal, and political memory intersect. Earth mounds in the gallery serve as evidence of the disappeared and scenes still generating, questioning what to remember and how to sediment.',
        venue_name: 'MO BY CAN',
        city: 'Seoul',
        operating_hours: 'Mon-Sat 10:00-18:00, Closed Sun/Holidays',
        ticket_info: 'Free'
      }
    }
  },
  {
    // 2. 박용식 - 은밀하게... 그러나 (상업화랑 용산)
    master: {
      start_date: '2025-08-23',
      end_date: '2025-09-20',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://sahngupgallery.com/242',
      instagram_url: 'https://www.instagram.com/p/DNphCYeg9AP/'
    },
    venue_name: '상업화랑 용산',
    translations: {
      ko: {
        exhibition_title: '은밀하게... 그러나',
        artists: ['박용식'],
        description: '박용식은 동시대 다양한 매체 환경이 야기하는 사회적 현상에 꾸준한 관심을 가지고 작품을 통해 반영해 왔다. 특히 매체 속 이미지(짤, 밈 등)에 내포된 숨겨진 의미와 이를 활용한 소통 방식에 내재된 폭력성에 주목한다. 이번 전시에서는 동물 짤을 소재로 다룬 작업의 연장선상에 있는 새로운 시리즈와 다양한 매체가 은밀하게 구축한 프레이밍이 초래하는 폭력의 양상을 상징적으로 표현한 신작 디오라마들을 선보인다.',
        venue_name: '상업화랑 용산',
        city: '서울',
        operating_hours: '화-금 11:00-19:00, 토 13:00-18:00, 일월 휴관',
        ticket_info: '무료',
        phone_number: null,
        address: '서울시 용산구 원효로97길 26'
      },
      en: {
        exhibition_title: 'secretly... but',
        artists: ['Park Yongsik'],
        description: 'Park Yongsik has consistently shown interest in social phenomena caused by contemporary media environments. He particularly focuses on hidden meanings in media images (memes, etc.) and the violence inherent in communication methods using such images. This exhibition presents new series extending his previous work with animal memes and new dioramas symbolically expressing violence caused by framing secretly constructed by various media.',
        venue_name: 'SAHNG-UP GALLERY Yongsan',
        city: 'Seoul',
        operating_hours: 'Tue-Fri 11:00-19:00, Sat 13:00-18:00, Closed Sun-Mon',
        ticket_info: 'Free'
      }
    }
  },
  {
    // 3. 노이진 - 감각하는 존재, 사물과 나의 얽힘 (뉴스프링프로젝트)
    master: {
      start_date: '2025-08-21',
      end_date: '2025-09-21',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://www.instagram.com/newspringproject',
      instagram_url: 'https://www.instagram.com/newspringproject'
    },
    venue_name: '뉴스프링프로젝트',
    translations: {
      ko: {
        exhibition_title: '감각하는 존재, 사물과 나의 얽힘',
        artists: ['노이진'],
        description: '그리는 행위와 그림은 무언가를 설명하거나 의미하기 위한 것이 아니라, 사물들로부터 출발해 감각을 거쳐 새로운 모습을 도출하는 것 자체를 보여준다. 타인의 사물 시리즈는 타인과의 관계와 기억을 공유하게 하며, 경계가 흐린 그림 속 사물은 머물고 사라지는 존재에 대한 사유를 가능하게 한다. 작가의 감각으로 풀어낸 존재의 흔적은 시간과 기억을 상기시키는 장치가 된다.',
        venue_name: '뉴스프링프로젝트',
        city: '서울',
        operating_hours: '화 11:00-18:00, 수-일 11:00-19:00, 월/공휴일 휴관',
        ticket_info: '무료',
        phone_number: '070-5057-0222',
        address: '서울시 용산구 이태원로 45길 22'
      },
      en: {
        exhibition_title: 'Sensing Being, Entanglement of Objects and I',
        artists: ['Roh Lee Jin'],
        description: 'The act of drawing and its resulting paintings are not meant to explain or signify something, but to show the process of deriving new forms through sensation starting from objects. The series explores relationships and memories with others, where blurred boundaries in paintings enable contemplation on beings that stay and disappear.',
        venue_name: 'New Spring Project',
        city: 'Seoul',
        operating_hours: 'Tue 11:00-18:00, Wed-Sun 11:00-19:00, Closed Mon/Holidays',
        ticket_info: 'Free'
      }
    }
  },
  {
    // 4. 보킴 - 생명선: Lifelines (BHAK)
    master: {
      start_date: '2025-08-23',
      end_date: '2025-09-27',
      status: 'ongoing',
      ticket_price_adult: 0,
      ticket_price_student: 0,
      genre: 'contemporary',
      exhibition_type: 'solo',
      source_url: 'https://galeriebhak.com/?p=exhibition-detail&eh=570',
      instagram_url: 'https://www.instagram.com/p/DNUgk1iT5Ze/'
    },
    venue_name: 'BHAK',
    translations: {
      ko: {
        exhibition_title: '생명선: Lifelines',
        artists: ['보킴'],
        description: '보킴의 추상 회화는 한지를 여러 겹 사용하여 투과적인 질감의 유기적 지형을 만들어낸다. 나무와 피라는 상징적 기표를 통해 가족의 계보와 세대 간 유대, 부모의 노화와 시간의 흐름을 담아낸다. 물감은 여러 단계에서 사용되어 층위 안에 색상의 영역을 남기며, 희미한 윤곽과 잔존하는 형태는 볼 수 있는 세계를 넘어 깊이를 암시한다.',
        venue_name: 'BHAK',
        city: '서울',
        operating_hours: '정보 확인 필요',
        ticket_info: '무료',
        phone_number: null,
        address: '서울시 용산구 한남대로 40길 19'
      },
      en: {
        exhibition_title: 'Lifelines',
        artists: ['Bo Kim'],
        description: 'Bo Kim\'s abstract paintings use layers of hanji (Korean mulberry paper) to create organic topographies with diaphanous translucence. Through symbolic signifiers of trees and blood, the works explore family lineage, intergenerational bonds, and the aging of parents. Paint applied at various stages leaves fields of color suspended within layered strata, with faint contours implying depth beyond the visible realm.',
        venue_name: 'BHAK',
        city: 'Seoul',
        operating_hours: 'Check venue for hours',
        ticket_info: 'Free'
      }
    }
  }
];

async function createVenuesIfNeeded() {
  const venuesToCreate = [
    { name: 'MO BY CAN' },
    { name: '상업화랑 용산' },
    { name: '캔파운데이션' },
    { name: '뉴스프링프로젝트' },
    { name: 'BHAK' }
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

async function insertBatch6() {
  console.log('========================================');
  console.log('BATCH 6 EXHIBITION INSERTION');
  console.log('========================================\n');
  
  // First create venues if needed
  await createVenuesIfNeeded();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batch6Exhibitions.length; i++) {
    const exhibition = batch6Exhibitions[i];
    console.log(`[${i + 1}/${batch6Exhibitions.length}] Processing: ${exhibition.translations.ko.exhibition_title}`);
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
  console.log('\n📝 Note: Add remaining 4 exhibitions when information is provided');
}

insertBatch6().catch(console.error);
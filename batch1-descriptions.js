const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// BATCH 1 전시 설명 데이터
const batch1Descriptions = [
  {
    // 1. 보 킴 - 생명선: Lifelines
    exhibition_id: "52103c1c-dbf3-40eb-9885-83ac47fa8aeb",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "생명선",
      title_en: "Lifelines",
      artist_name: "보킴",
      artist_name_en: "Bo Kim",
      start_date: "2025-08-23",
      end_date: "2025-09-27",
      venue_id: "BHAK",  // venues 테이블과 연결
      source_url: "https://galeriebhak.com/?p=exhibition-detail&eh=570",
      instagram_url: "https://www.instagram.com/p/DNrhPTvZqZc/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "생명선",
        artists: ["보킴"],
        description: "보킴의 '생명선'은 한지를 여러 겹 사용한 추상 회화로, 부모님의 노화를 목도하며 느낀 복잡한 감정을 나무와 피의 은유로 표현한다. 투명한 층위와 깊이감 있는 색채를 통해 세대 간 유대감과 가족의 끊임없는 연결고리를 시각화하며, 물리적 구조를 넘어 정서적 공명을 불러일으키는 작품이다.",
        curator: "앤디 세인트루이스",
        website_url: "https://galeriebhak.com/?p=exhibition-detail&eh=570"
      },
      en: {
        exhibition_title: "Lifelines",
        artists: ["Bo Kim"],
        description: "Bo Kim's 'Lifelines' features abstract paintings using multiple layers of hanji paper, expressing complex emotions about parental aging through metaphors of trees and blood. Through translucent layers and depth of color, the work visualizes intergenerational bonds and family connections, evoking emotional resonance beyond physical structure.",
        curator: "Andy St. Louis",
        website_url: "https://galeriebhak.com/?p=exhibition-detail&eh=570"
      }
    },
    
    // venues 업데이트 정보 (필요시)
    venue: {
      venue_id: "BHAK",
      name_ko: "BHAK",
      name_en: "BHAK",
      address: "서울시 용산구 한남대로 40길 19",
      website: "https://galeriebhak.com",
      instagram: "https://www.instagram.com/galeriebhak/",
      phone: "02-794-5114"
    }
  },
  {
    // 2. A Chorus - Jennifer Carvalho
    exhibition_id: "c480657f-6613-4aec-b9cd-ae49b2188f4c",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "A Chorus",
      title_en: "A Chorus",
      artist_name: "제니퍼 카르발호",
      artist_name_en: "Jennifer Carvalho",
      start_date: "2025-08-30",
      end_date: "2025-09-28",
      venue_id: "CYLINDER_TWO",
      source_url: "https://www.cylinderseoul.com/exhibitions",
      instagram_url: "https://www.instagram.com/p/DOh8iHbE_Dm/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "A Chorus",
        artists: ["제니퍼 카르발호"],
        description: "캐나다 작가 제니퍼 카르발호의 아시아 첫 개인전. 르네상스 거장들의 작품에서 영감을 받아 과거의 유령들이 현재와 어떻게 공존하는지 탐구한다. 작가는 그리스 합창단처럼 역사적 순간을 목격하고 논평하는 여성들의 얼굴, 손, 보석 등을 고립시켜 살아있는 폐허로서의 예술사를 고고학적으로 재조명한다.",
        curator: "두용 노",
        operating_hours: "목-일 1-7pm",
        ticket_info: "무료"
      },
      en: {
        exhibition_title: "A Chorus",
        artists: ["Jennifer Carvalho"],
        description: "Canadian artist Jennifer Carvalho's Asian solo debut explores how ghosts of the past mingle with the present through Renaissance-inspired paintings. Like a Greek chorus witnessing unfolding events, her works isolate elements—jewels, hands, tear-stained cheeks—to reveal art history as living ruins that continue to haunt and shape our contemporary moment.",
        curator: "Dooyong Ro",
        operating_hours: "Thu-Sun 1-7pm",
        ticket_info: "Free"
      }
    },
    
    // venues 업데이트 정보
    venue: {
      venue_id: "CYLINDER_TWO",
      name_ko: "실린더 투",
      name_en: "CYLINDER TWO",
      address: "서울시 용산구 한강대로48길 24",
      address_en: "24, Hangang-daero 48-gil, Yongsan-gu, Seoul",
      website: "https://www.cylinderseoul.com",
      instagram: "https://www.instagram.com/cylinderseoul/",
      phone: "010-8777-8570",
      email: "info@cylinderseoul.com"
    }
  },
  {
    // 3. 스펙트럴 크로싱스 - 더 스웨이
    exhibition_id: "3fe55353-f6dc-4400-8902-46892cbc8fcf",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "스펙트럴 크로싱스",
      title_en: "Spectral Crossings",
      artist_name: "더 스웨이",
      artist_name_en: "THE SWAY",
      start_date: "2025-08-14",
      end_date: "2025-11-16",
      venue_id: "DDP",
      source_url: "https://ddp.or.kr/index.html?menuno=239&siteno=2&bbsno=564&boardno=15&bbstopno=564&act=view&subno=",
      instagram_url: "https://www.instagram.com/thesway.official/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "스펙트럴 크로싱스",
        artists: ["더 스웨이"],
        description: "AI가 만든 얼굴과 감정의 흐름이 빛을 따라 움직이는 몰입형 미디어아트 전시. 144개의 크리스탈을 통해 감정의 빛이 물리적 공간에 드러나며, AI가 생성한 '존재하지 않는 얼굴'들이 보편적 감정을 형상화한다. 관객은 타인의 감정 속에서 자신의 내면을 비추며 감정이 개인을 넘어 서로 연결되는 순간을 경험한다.",
        operating_hours: "10:00~20:00",
        ticket_info: "무료",
        venue_name: "DDP 디자인랩 3층"
      },
      en: {
        exhibition_title: "Spectral Crossings",
        artists: ["THE SWAY"],
        description: "An immersive media art exhibition where AI-generated faces and formless emotions flow with light, intersecting with viewers. Through 144 crystals, emotional light manifests in physical space as 'non-existent faces' created by AI embody universal emotions. Viewers discover their inner selves reflected in others' emotions, experiencing moments where emotions transcend individuals to connect with one another.",
        operating_hours: "10:00~20:00",
        ticket_info: "Free",
        venue_name: "DDP Design Lab 3F"
      }
    },
    
    // venues 업데이트 정보
    venue: {
      venue_id: "DDP",
      name_ko: "DDP (동대문디자인플라자)",
      name_en: "DDP (Dongdaemun Design Plaza)",
      address: "서울시 중구 을지로 281",
      address_en: "281, Eulji-ro, Jung-gu, Seoul",
      website: "https://ddp.or.kr",
      instagram: "https://www.instagram.com/ddp_seoul/"
    }
  },
  {
    // 4. 현대카드 컬처프로젝트 29 톰 삭스
    exhibition_id: "5ffaa6e8-4510-4859-b57a-abc8e76f7744",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "현대카드 컬처프로젝트 29 톰 삭스: 스페이스 프로그램: 무한대",
      title_en: "Hyundai Card Culture Project 29 Tom Sachs: Space Program: Infinite",
      artist_name: "톰 삭스",
      artist_name_en: "Tom Sachs",
      start_date: "2025-04-25",
      end_date: "2025-09-07",
      venue_id: "DDP",
      source_url: "https://ddp.or.kr/index.html?menuno=230&siteno=2&bbsno=551&boardno=15&bbstopno=551&act=view&subno=",
      instagram_url: "https://www.instagram.com/reel/DL9p_70pggS/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "현대카드 컬처프로젝트 29 톰 삭스: 스페이스 프로그램: 무한대",
        artists: ["톰 삭스"],
        description: "세계적 조각가 톰 삭스의 스페이스 프로그램 시리즈 200여점과 신작 10여점을 선보이는 역대 최대 규모 전시. 2007년부터 시작된 브리콜라주 우주 탐험 프로젝트로, 아폴로 달 착륙선부터 화성, 유로파, 소행성 베스타까지의 여정을 기록한다. 이번 '무한대' 미션은 외계 생명체와의 만남과 우주 탐사의 위험과 보상을 탐구한다.",
        operating_hours: "10:00 – 20:00 (관람 종료 1시간 전 입장 마감)",
        ticket_info: "성인 20,000원 / 청소년 15,000원 / 어린이 13,000원",
        venue_name: "DDP 뮤지엄 전시1관 (B2F)",
        phone_number: "02-325-1077"
      },
      en: {
        exhibition_title: "Hyundai Card Culture Project 29 Tom Sachs: Space Program: Infinite",
        artists: ["Tom Sachs"],
        description: "The largest-ever exhibition featuring over 200 works from Tom Sachs' Space Program series plus 10 new pieces. Starting in 2007 with a bricolage Apollo lunar module, this project documents journeys from Mars to Europa to asteroid Vesta. The 'Infinite' mission explores encounters with extraterrestrial life and the risks and rewards of space exploration.",
        operating_hours: "10:00 – 20:00 (Last entry 1 hour before closing)",
        ticket_info: "Adults 20,000 KRW / Youth 15,000 KRW / Children 13,000 KRW",
        venue_name: "DDP Museum Exhibition Hall 1 (B2F)",
        phone_number: "02-325-1077"
      }
    },
    
    // DDP 정보는 이미 앞에서 추가됨
    venue: null
  },
  {
    // 5. 헤리티지: 더 퓨처 판타지
    exhibition_id: "8cb3c6e7-b5c5-4e1d-98cc-6f57c82b238d",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "헤리티지: 더 퓨처 판타지",
      title_en: "Heritage: The Future Fantasy",
      artist_name: "헤리티지",
      artist_name_en: "Heritage",
      start_date: "2025-08-23",
      end_date: "2025-09-17",
      venue_id: "DDP",
      source_url: "https://ddp.or.kr/index.html?menuno=240&siteno=2&bbsno=570&boardno=15&bbstopno=570&act=view&subno=1"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "헤리티지: 더 퓨처 판타지",
        artists: ["헤리티지"],
        description: "국가유산 디지털 콘텐츠를 선보이는 이머시브 전시. 조선왕실 의궤, 한국 산수, 장인 정신, 문화유산을 현대 기술로 재해석하여 4개 섹션으로 구성했다. 유형과 무형, 물질과 비물질, 테크놀로지와 수공예가 융합되어 국가유산의 미래 활용 가능성을 탐구하며, 전통 문화의 역사적 가치와 미감을 현대적으로 전달한다.",
        operating_hours: "10:00~20:00 (입장마감 19:00) ※ 월요일 휴관",
        ticket_info: "무료",
        venue_name: "DDP 뮤지엄 전시2관 및 디자인둘레길B"
      },
      en: {
        exhibition_title: "Heritage: The Future Fantasy",
        artists: ["Heritage"],
        description: "An immersive exhibition showcasing digital content of national heritage. Four sections reinterpret Joseon royal protocols, Korean landscapes, craftsman spirit, and cultural heritage through modern technology. Merging tangible and intangible, material and immaterial, technology and craftsmanship, it explores future possibilities for heritage while conveying traditional cultural values and aesthetics in contemporary ways.",
        operating_hours: "10:00~20:00 (Last entry 19:00) ※ Closed on Mondays",
        ticket_info: "Free",
        venue_name: "DDP Museum Exhibition Hall 2 & Design Dulle-gil B"
      }
    },
    
    // DDP 정보는 이미 앞에서 추가됨
    venue: null
  },
  {
    // 6. 스펙트럴 크로싱스 (중복 - 삭제 예정)
    exhibition_id: "2a5a0ae8-c3cc-48fb-beb4-0bcdc93e7b97",
    // 이 전시는 3번과 중복이므로 나중에 DB에서 삭제 필요
    master: null,
    translations: null,
    venue: null
  },
  {
    // 7. 장 미셸 바스키아: 과거와 미래를 잇는 상징적 기호들
    exhibition_id: "72594414-63d2-49d2-8611-c167f8ee0267",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "장 미셸 바스키아: 과거와 미래를 잇는 상징적 기호들",
      title_en: "Jean-Michel Basquiat: SIGNS, Connecting Past and Future",
      artist_name: "장 미셸 바스키아",
      artist_name_en: "Jean-Michel Basquiat",
      start_date: "2025-09-23",
      end_date: "2026-01-31",
      venue_id: "DDP",
      source_url: "https://ddp.or.kr/index.html?menuno=230&siteno=2&bbsno=574&boardno=15&bbstopno=574&act=view&subno="
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "장 미셸 바스키아: 과거와 미래를 잇는 상징적 기호들",
        artists: ["장 미셸 바스키아"],
        description: "그라피티를 예술로 승화한 바스키아의 국내 최대 규모 전시. 회화 33점, 노트 페이지 155점 등 총 220여점을 선보이며, 국내 최초로 작가의 창작 노트 8권을 공개한다. 한국 문화유산과의 연관성을 탐구하는 특별 큐레이션으로 반구대암각화, 훈민정음, 추사 서체, 백남준 작품 등과 함께 기호와 상징의 보편적 소통을 조망한다.",
        curator: "이지윤, 디터 부흐하르트, 안나 카리나 호프바우어",
        operating_hours: "10:00~19:00 (관람 종료 1시간 전 입장 마감)",
        ticket_info: "성인 24,000원 / 청소년 및 어린이 17,000원",
        venue_name: "DDP 뮤지엄 전시1관",
        phone_number: "02-585-5022",
        email: "info@suumproject.com"
      },
      en: {
        exhibition_title: "Jean-Michel Basquiat: SIGNS, Connecting Past and Future",
        artists: ["Jean-Michel Basquiat"],
        description: "The largest Basquiat exhibition in Korea featuring 220 works including 33 paintings and 155 notebook pages. Showcasing 8 creative notebooks for the first time in Korea, with special curation exploring connections to Korean cultural heritage including Bangudae Petroglyphs, Hunminjeongeum, Chusa calligraphy, and Nam June Paik's video art, examining universal communication through signs and symbols.",
        curator: "Jiyoon Lee, Dieter Buchhart, Anna Karina Hofbauer",
        operating_hours: "10:00~19:00 (Last entry 1 hour before closing)",
        ticket_info: "Adults 24,000 KRW / Youth & Children 17,000 KRW",
        venue_name: "DDP Museum Exhibition Hall 1",
        phone_number: "02-585-5022",
        email: "info@suumproject.com"
      }
    },
    
    venue: null
  },
  {
    // 8. 한국을 비추다 (Illuminated: A Spotlight on Korean Design)
    exhibition_id: "7930ec6f-8767-43c7-9bfd-ba7dc5546314",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "한국을 비추다",
      title_en: "Illuminated: A Spotlight on Korean Design",
      artist_name: "창작의 빛",
      artist_name_en: "Design Miami",
      start_date: "2025-09-01",
      end_date: "2025-09-14",
      venue_id: "DDP_IGANSUMUN",
      source_url: "https://ddp.or.kr/?menuno=240&siteno=1&boardno=15&act=view&bbsno=566"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "한국을 비추다",
        subtitle: "디자인 마이애미 인 서울",
        artists: ["창작의 빛"],
        description: "디자인 마이애미가 아시아 최초로 선보이는 전시. 12개 해외 갤러리, 4개 국내 갤러리, 20명 독립 디자이너가 170점 이상 작품을 출품했다. 전통 나전칠장부터 말총 같은 이색 재료까지, 한국 디자인의 독특한 정신을 조명하며 전통과 혁신의 조화, 역사적 맥락 속 재료의 새로운 해석을 통해 동시대 디자인의 역동적 관점을 제시한다.",
        operating_hours: "10:00-20:00",
        ticket_info: "무료 (사전등록 필요)",
        venue_name: "DDP 이간수문 전시장"
      },
      en: {
        exhibition_title: "Illuminated: A Spotlight on Korean Design",
        subtitle: "Design Miami in Seoul",
        artists: ["Design Miami"],
        description: "Design Miami's first exhibition in Asia featuring over 170 works from 12 international galleries, 4 Korean galleries, and 20 independent designers. From traditional nacre lacquerware to innovative use of horsehair, it illuminates Korean design's unique spirit, presenting dynamic perspectives on contemporary design through harmony of tradition and innovation, and reinterpretation of materials within historical context.",
        operating_hours: "10:00-20:00",
        ticket_info: "Free (Pre-registration required)",
        venue_name: "DDP Igansumun Exhibition Hall"
      }
    },
    
    // venues 업데이트 정보
    venue: {
      venue_id: "DDP_IGANSUMUN",
      name_ko: "DDP 이간수문",
      name_en: "DDP Igansumun",
      address: "서울시 중구 을지로 281",
      address_en: "281, Eulji-ro, Jung-gu, Seoul",
      website: "https://ddp.or.kr"
    }
  },
  {
    // 9. 카를로스 블랑코 아르테로 - IN THE OPEN SILENCE
    exhibition_id: "3237bda2-05cf-4e4b-a289-22069ab08b42",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "열린 침묵 속에서",
      title_en: "In the Open Silence",
      artist_name: "카를로스 블랑코 아르테로",
      artist_name_en: "Carlos Blanco Artero",
      start_date: "2025-08-08",
      end_date: "2025-08-29",
      venue_id: "ELIGERE",
      source_url: "https://eligeregallery.com/exhibitions/",
      instagram_url: "https://www.instagram.com/p/DNKxVD6x5Hc/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "열린 침묵 속에서",
        artists: ["카를로스 블랑코 아르테로"],
        description: "스페인 출생 카나리아 제도 기반 작가의 국내 두 번째 개인전. 콘도, 피카소, 피카비아 등의 영향을 받아 구상과 추상, 회화와 드로잉을 융합한 작품을 선보인다. 마드리드, 런던, 베를린의 밤 문화를 반영한 Afterhours 시리즈와 함께 음악과 회화를 결합한 독특한 작업 방식으로 신구상주의와 신조형주의를 아우른다.",
        operating_hours: "사전 예약제",
        ticket_info: "무료"
      },
      en: {
        exhibition_title: "In the Open Silence",
        artists: ["Carlos Blanco Artero"],
        description: "Second solo exhibition in Korea by the Spanish-born, Canary Islands-based artist. Influenced by Condo, Picasso, and Picabia, his work fuses figuration and abstraction, painting and drawing. His Afterhours series reflects nightlife experiences in Madrid, London, and Berlin, while combining music and painting in a unique approach spanning neo-figuration and neo-plasticism.",
        operating_hours: "By appointment only",
        ticket_info: "Free"
      }
    },
    
    // venues 업데이트 정보
    venue: {
      venue_id: "ELIGERE",
      name_ko: "엘리제레 갤러리",
      name_en: "ELIGERE GALLERY",
      address: "서울시 강남구 압구정로79길 55 B1",
      address_en: "B1, 55 Apgujeong-ro 79-gil, Gangnam-gu, Seoul",
      website: "https://eligeregallery.com",
      instagram: "https://www.instagram.com/eligeregallery/"
    }
  },
  {
    // 10. 우한나 - POOMSAE 품새
    exhibition_id: "be9337eb-7ab5-439e-b984-1b9662fa52d0",
    
    // exhibitions_master 업데이트 정보
    master: {
      title_ko: "품새",
      title_en: "POOMSAE",
      artist_name: "우한나",
      artist_name_en: "Woo Hannah",
      start_date: "2025-08-27",
      end_date: "2025-09-27",
      venue_id: "G_GALLERY",
      source_url: "https://ggallery.kr/exhibitions/poomsae",
      instagram_url: "https://www.instagram.com/p/DOKzBeUEor8/"
    },
    
    // exhibitions_translations 업데이트 정보
    translations: {
      ko: {
        exhibition_title: "품새",
        artists: ["우한나"],
        description: "작가의 생애적 전환기를 담은 전시. Bleeding과 Milk and Honey 연작을 통해 감정의 분출과 신체 변형을 탐구한다. '책임감 없는 모양'과 '직립한 조각의 독립'이라는 상반된 개념을 발레의 신체 감각과 조형 언어로 구현하며, 무너지기 쉬운 상태에서도 계속 일어서는 생존의 자세를 조형한다.",
        curator: "박가희",
        operating_hours: "월-토 10:00-18:00",
        ticket_info: "무료",
        venue_name: "G Gallery",
        phone_number: "02-790-4921",
        email: "info@ggallery.kr"
      },
      en: {
        exhibition_title: "POOMSAE",
        artists: ["Woo Hannah"],
        description: "An exhibition capturing the artist's transformative life period. Through Bleeding and Milk and Honey series, it explores emotional eruption and bodily transformation. Implementing contrasting concepts of 'irresponsible forms' and 'independence of upright sculpture' through ballet's bodily awareness and sculptural language, it sculpts a stance of survival that continues to rise even in fragile states.",
        curator: "Park Gahee",
        operating_hours: "Mon-Sat 10:00-18:00",
        ticket_info: "Free",
        venue_name: "G Gallery",
        phone_number: "02-790-4921",
        email: "info@ggallery.kr"
      }
    },
    
    // venues 업데이트 정보
    venue: {
      venue_id: "G_GALLERY",
      name_ko: "G갤러리",
      name_en: "G Gallery",
      address: "서울시 강남구 삼성로 748 지하 1층",
      address_en: "B1, 748 Samseong-ro, Gangnam-gu, Seoul",
      website: "https://ggallery.kr",
      instagram: "https://www.instagram.com/ggalleryseoul/",
      phone: "02-790-4921",
      email: "info@ggallery.kr"
    }
  }
];

// 업데이트 실행 함수
async function updateBatch1() {
  console.log('========================================');
  console.log('BATCH 1 전체 테이블 업데이트 시작');
  console.log('========================================\n');

  let successCount = 0;
  let errorCount = 0;

  for (const item of batch1Descriptions) {
    try {
      console.log(`\n처리 중: ${item.master.title_ko} (${item.exhibition_id})`);
      
      // 1. exhibitions_master 업데이트
      const { error: masterError } = await supabase
        .from('exhibitions_master')
        .upsert({
          exhibition_id: item.exhibition_id,
          ...item.master,
          updated_at: new Date().toISOString()
        });

      if (masterError) {
        console.error(`  ❌ exhibitions_master 업데이트 실패:`, masterError.message);
        errorCount++;
      } else {
        console.log(`  ✅ exhibitions_master 업데이트 성공`);
      }

      // 2. exhibitions_translations 한글 버전 업데이트
      const { error: koError } = await supabase
        .from('exhibitions_translations')
        .update({ 
          ...item.translations.ko,
          updated_at: new Date().toISOString()
        })
        .eq('exhibition_id', item.exhibition_id)
        .eq('language_code', 'ko');

      if (koError) {
        console.error(`  ❌ exhibitions_translations (ko) 업데이트 실패:`, koError.message);
        errorCount++;
      } else {
        console.log(`  ✅ exhibitions_translations (ko) 업데이트 성공`);
        successCount++;
      }

      // 3. exhibitions_translations 영어 버전 업데이트
      const { error: enError } = await supabase
        .from('exhibitions_translations')
        .update({ 
          ...item.translations.en,
          updated_at: new Date().toISOString()
        })
        .eq('exhibition_id', item.exhibition_id)
        .eq('language_code', 'en');

      if (enError) {
        console.error(`  ❌ exhibitions_translations (en) 업데이트 실패:`, enError.message);
      } else {
        console.log(`  ✅ exhibitions_translations (en) 업데이트 성공`);
      }

      // 4. venues 테이블 업데이트 (필요시)
      if (item.venue) {
        const { error: venueError } = await supabase
          .from('venues')
          .upsert({
            ...item.venue,
            updated_at: new Date().toISOString()
          });

        if (venueError) {
          console.error(`  ❌ venues 업데이트 실패:`, venueError.message);
        } else {
          console.log(`  ✅ venues 업데이트 성공`);
        }
      }

    } catch (err) {
      console.error(`❌ ${item.exhibition_id} 처리 중 오류:`, err.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
  console.log('========================================');
}

// 실행
updateBatch1().catch(console.error);

module.exports = { batch1Descriptions, updateBatch1 };
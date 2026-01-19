-- ========================================
-- SAYU 9월 전시 추가 - Batch 5 (21-25)
-- 실행일: 2025-09-XX
-- ========================================

-- ========================================
-- 21. David Salle: Under One Roof (현대카드 스토리지) - 5/10~9/7
-- ========================================

-- David Salle: Under One Roof (현대카드 스토리지)
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '현대카드 스토리지' LIMIT 1),
  '2025-05-10', '2025-09-07', 'ongoing',
  5000, 4000,
  'contemporary', 'solo',
  'https://storage.hyundaicard.com/',
  NULL,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) RETURNING id;

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://storage.hyundaicard.com/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'David Salle: Under One Roof',
  ARRAY['데이비드 살레'],
  '국내 최초로 공개하는 데이비드 살레의 회고전. 신작 <Windows> 시리즈 20여 점을 포함해 총 40여 점의 회화와 미디어 작품을 선보이며 그의 작품 세계 전반을 아우른다. 이미지의 차용과 결합을 통해 끝없이 새로운 이야기를 창조하는 살레의 예술적 서사를 담았다.',
  '현대카드 스토리지', '서울',
  '화-토 12:00-19:00, 일 12:00-18:00, 월 휴관',
  '유료 4,000-5,000원',
  '02-2014-7850',
  '서울시 용산구 이태원로 248 지하2층'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://storage.hyundaicard.com/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'David Salle: Under One Roof',
  ARRAY['David Salle'],
  'First retrospective of David Salle in Korea, featuring over 40 paintings and media works including 20 pieces from the new Windows series. The exhibition explores Salle''s artistic narrative through appropriation and combination of images.',
  'Hyundai Card Storage', 'Seoul',
  'Tue-Sat 12:00-19:00, Sun 12:00-18:00, Mon closed',
  '4,000-5,000 KRW'
);

-- ========================================
-- 22. 마나 모아나-신성한 바다의 예술, 오세아니아 (국립중앙박물관) - 4/30~9/14
-- ========================================

-- 마나 모아나-신성한 바다의 예술, 오세아니아 (국립중앙박물관)
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '국립중앙박물관' LIMIT 1),
  '2025-04-30', '2025-09-14', 'ongoing',
  0, 0,
  'historical', 'group',
  'https://www.museum.go.kr/',
  NULL,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) RETURNING id;

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.museum.go.kr/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '마나 모아나-신성한 바다의 예술, 오세아니아',
  ARRAY['오세아니아 예술가들'],
  '오세아니아 예술과 문화를 깊이 있게 조망하는 국내 최초 전시. 프랑스 케브랑리-자크시라크박물관의 18~20세기 오세아니아 소장품 180여 건을 소개한다. 대형 카누, 조각, 석상, 악기, 장신구, 직물 등을 통해 오세아니아 사람들의 삶과 철학을 생생히 전달한다.',
  '국립중앙박물관', '서울',
  '월,화,목,금,일 10:00-18:00, 수,토 10:00-21:00',
  '관람료 정보는 홈페이지 참조',
  '1588-7890',
  '서울시 용산구 서빙고로 137'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.museum.go.kr/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Mana Moana: Art of the Sacred Ocean, Oceania',
  ARRAY['Oceanian Artists'],
  'First major exhibition in Korea exploring Oceanian art and culture. Features 180 pieces from the 18th-20th centuries from the Musée du quai Branly-Jacques Chirac collection, including large canoes, sculptures, stone statues, instruments, ornaments, and textiles.',
  'National Museum of Korea', 'Seoul',
  'Mon,Tue,Thu,Fri,Sun 10:00-18:00, Wed,Sat 10:00-21:00',
  'Check website for ticket info'
);

-- ========================================
-- 23. 앨리스 달튼 브라운 회고전: 잠시, 그리고 영원히 (더현대 서울 ALT.1) - 6/13~9/20
-- ========================================

-- 앨리스 달튼 브라운 회고전: 잠시, 그리고 영원히 (더현대 서울 ALT.1)
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '더현대 서울' LIMIT 1),
  '2025-06-13', '2025-09-20', 'ongoing',
  20000, 15000,
  'contemporary', 'solo',
  'https://www.thehyundai.com/',
  'https://www.instagram.com/ccoc_inc',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) RETURNING id;

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE instagram_url = 'https://www.instagram.com/ccoc_inc' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '앨리스 달튼 브라운 회고전: 잠시, 그리고 영원히',
  ARRAY['앨리스 달튼 브라운'],
  '미국 현대미술 작가 앨리스 달튼 브라운의 국내 최대 규모 회고전. 1961년 수채화부터 2025년 신작까지 약 70여 년간의 작업 세계를 총망라한다. 원화 100여 점과 드로잉·소품 40여 점을 통해 창문, 커튼, 바다, 빛과 그림자 등 일상적 소재로 그려낸 서정적이고 명상적인 풍경을 선보인다.',
  '더현대 서울 ALT.1', '서울',
  '평일(월-목) 10:30-20:00, 주말(금-일) 10:30-20:30',
  '성인 20,000원, 청소년 15,000원, 어린이 12,000원',
  '02-836-6611',
  '서울시 영등포구 여의대로 108 더현대서울 6층'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE instagram_url = 'https://www.instagram.com/ccoc_inc' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Alice Dalton Brown Retrospective: In a Moment, Forever',
  ARRAY['Alice Dalton Brown'],
  'Major retrospective of American contemporary artist Alice Dalton Brown, spanning 70 years from 1961 watercolors to 2025 new works. Features over 100 paintings and 40 drawings exploring light, space, and nature through poetic and meditative landscapes.',
  'The Hyundai Seoul ALT.1', 'Seoul',
  'Weekdays(Mon-Thu) 10:30-20:00, Weekends(Fri-Sun) 10:30-20:30',
  'Adults 20,000 KRW, Youth 15,000 KRW, Children 12,000 KRW'
);

-- ========================================
-- 24. James Turrell: The Return (페이스갤러리) - 6/14~9/27
-- ========================================

-- James Turrell: The Return (페이스갤러리)
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '페이스갤러리' LIMIT 1),
  '2025-06-14', '2025-09-27', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'https://www.pacegallery.com/exhibitions/james-turrell-the-return/',
  'https://www.instagram.com/p/DOPI9umijFK/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) RETURNING id;

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.pacegallery.com/exhibitions/james-turrell-the-return/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'James Turrell: The Return',
  ARRAY['제임스 터렐'],
  '2008년 이후 서울에서의 첫 개인전. 페이스갤러리 65주년 기념 전시로, 신작 Wedgework을 포함한 5개의 설치작품과 Glassworks 시리즈, Roden Crater 프로젝트 관련 작품들을 선보인다. 빛과 공간의 물질성을 다루며 "자신이 보는 것을 보는" 경험을 제공하는 몰입형 설치 작품들을 만날 수 있다.',
  '페이스갤러리', '서울',
  '화-토 10:00-18:00, 일월 휴관',
  '예약제 운영 (네이버 예약)',
  '02-790-9388',
  '서울시 용산구 이태원로 267'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.pacegallery.com/exhibitions/james-turrell-the-return/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'James Turrell: The Return',
  ARRAY['James Turrell'],
  'First solo exhibition in Seoul since 2008, featuring five installations including a new site-specific Wedgework. Part of Pace''s 65th anniversary celebration, showcasing the California Light and Space movement artist''s immersive installations that require "seeing yourself seeing".',
  'Pace Gallery', 'Seoul',
  'Tue-Sat 10:00-18:00, Sun-Mon closed',
  'By advance reservation only (Naver Booking)'
);

-- ========================================
-- 25. Pit Calls Wall - 타면 나타나는 굴 (뮤지엄헤드) - 7/16~9/6
-- ========================================

-- Pit Calls Wall - 타면 나타나는 굴 (뮤지엄헤드)
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '뮤지엄헤드' LIMIT 1),
  '2025-07-16', '2025-09-06', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'http://museumhead.com/타면-나타나는-굴-pit-calls-wall/',
  'https://www.instagram.com/museumhead_/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) RETURNING id;

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'http://museumhead.com/타면-나타나는-굴-pit-calls-wall/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Pit Calls Wall - 타면 나타나는 굴',
  ARRAY['김세은'],
  '도시 공간의 감각적 밀도를 포착하는 김세은 개인전. 터널을 주요 모티프로 도시의 복합적 성질과 시지각의 층위를 회화적으로 구성한다. 이동과 관통, 전이와 움직임을 통해 고정된 시각성을 재탐색하며, 도시에서 반복되는 눈과 몸의 경험을 회화적 표면으로 시각화한다.',
  '뮤지엄헤드', '서울',
  '12:00-19:00, 일월 휴관',
  '무료',
  NULL,
  '서울시 종로구 계동길 84-3, 1층'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'http://museumhead.com/타면-나타나는-굴-pit-calls-wall/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Pit Calls Wall',
  ARRAY['Seeun Kim'],
  'Solo exhibition exploring the sensory density of urban space. Using tunnel as focal point to reflect on city''s complexity and organize layers of perception through painterly means. Visualizes the repeated experiences of eye and body in the city through painting surfaces.',
  'Museumhead', 'Seoul',
  '12:00-19:00, Closed Sun-Mon',
  'Free'
);
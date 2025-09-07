-- ========================================
-- SAYU 9월 전시 추가 - Batch 4 (16-20)
-- 실행일: 2025-09-07
-- ========================================

-- ========================================
-- 16. VELVET HAMMERS (핌서울) - 8/22~9/27
-- ========================================

-- exhibitions_master 업데이트
UPDATE exhibitions_master
SET 
  source_url = 'https://www.galleryfim.com/',
  instagram_url = 'https://www.instagram.com/p/DNVDnXDSFDx/',
  genre = 'contemporary',
  exhibition_type = 'group',
  ticket_price_adult = 0,
  ticket_price_student = 0
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title LIKE '%Velvet Hammers%'
  AND et.language_code = 'ko'
);

-- exhibitions_translations 업데이트 (한국어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'Velvet Hammers',
  artists = ARRAY['이승희', '장예빈', '전다화', '최유정'],
  description = '1990년대에 태어나 동시대를 살아가는 네 명의 여성 작가—이승희, 장예빈, 전다화, 최유정—이 참여하는 이번 전시는 날카롭고 밀도 있는 시각 언어를 통해 동시대 회화와 조형이 만들어내는 새로운 층위를 제시합니다. 전시 제목인 ''Velvet Hammers''는 이러한 태도를 포착한 상징적 표현으로, 유연함과 강인함이 교차하는 순간을 시각적으로 구현합니다.',
  venue_name = '핌 FIM',
  operating_hours = '11:00 – 18:00 (화-토)',
  ticket_info = '무료 입장',
  phone_number = NULL,
  address = '서울특별시 용산구 유엔빌리지길 11, 2F'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%Velvet Hammers%'
  AND et2.language_code = 'ko'
) AND language_code = 'ko';

-- exhibitions_translations 업데이트 (영어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'Velvet Hammers',
  artists = ARRAY['Seounghee Lee', 'Yebin Chang', 'Dawha Jeon', 'Yoojung Ellie Choi'],
  description = 'Featuring four female artists born in the 1990s— Seounghee Lee, Yebin Chang, Dawha Jeon, and Yoojung Ellie Choi—this exhibition offers new layers of meaning shaped by contemporary paintings and sculptures through a sharp and densely textured visual language. The title ''Velvet Hammers'' serves as a symbolic expression that captures this attitude, visually embodying the moments where both flexibility and strength intersect.',
  venue_name = 'FIM',
  operating_hours = '11:00 – 18:00 (Tue – Sat)',
  ticket_info = 'Free admission',
  phone_number = NULL,
  address = '2F, 11 UN village-gil, Yongsan-gu, Seoul'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%Velvet Hammers%'
  AND et2.language_code = 'ko'
) AND language_code = 'en';

-- ========================================
-- 17. 엘리자베스 랭그리터 (MUSEUM209) - 5/1~9/28
-- ========================================

-- exhibitions_master 업데이트
UPDATE exhibitions_master
SET 
  source_url = 'https://linktr.ee/M209_ElizabethLangreiter',
  instagram_url = 'https://www.instagram.com/m209_elizabethlangreiter/',
  genre = 'contemporary',
  exhibition_type = 'solo',
  ticket_price_adult = 18000,
  ticket_price_student = 15000
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title LIKE '%엘리자베스 랭그리터%'
  AND et.language_code = 'ko'
);

-- exhibitions_translations 업데이트 (한국어)
UPDATE exhibitions_translations
SET 
  exhibition_title = '엘리자베스 랭그리터 : 매일이 휴가',
  artists = ARRAY['엘리자베스 랭그리터'],
  description = '호주 시드니에서 활동하는 예술가 엘리자베스 랭그리터의 작품은 입체적이고 생동감 있는 3D 혼합 매체-항공 샷 스타일로 유명합니다. 유쾌하고 즐거움이 가득한 회화를 통해 관람객들이 행복했던 기억을 되새기고, 아름다운 장소에 대한 꿈을 펼치도록 초대합니다. 작품은 모두 위에서 내려다본 시점으로 구성되어 삶을 다른 각도로 바라보는 작가의 통찰과 감정을 담아냅니다.',
  venue_name = 'MUSEUM 209',
  operating_hours = '10:00 - 19:00 (월요일 휴관)',
  ticket_info = '성인 18,000원, 20세 미만 15,000원',
  phone_number = NULL,
  address = '소피텔 앰배서더 호텔 3층, 잠실'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%엘리자베스 랭그리터%'
  AND et2.language_code = 'ko'
) AND language_code = 'ko';

-- exhibitions_translations 업데이트 (영어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'Elizabeth Langreiter : EVERYDAY CAN BE HOLIDAYS!',
  artists = ARRAY['Elizabeth Langreiter'],
  description = 'Australian artist Elizabeth Langreiter, based in Sydney, is renowned for her three-dimensional and vibrant 3D mixed media aerial shot style. Through her joyful and delightful paintings, she invites viewers to reminisce about happy memories and dream of beautiful places. All works are composed from a top-view perspective, capturing the artist''s insights and emotions from a different angle of life.',
  venue_name = 'MUSEUM 209',
  operating_hours = '10:00 - 19:00 (Closed on Mondays)',
  ticket_info = 'Adults 18,000 KRW, Under 20 15,000 KRW',
  phone_number = NULL,
  address = 'Sofitel Ambassador Hotel 3F, Jamsil'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%엘리자베스 랭그리터%'
  AND et2.language_code = 'ko'
) AND language_code = 'en';

-- ========================================
-- 18. Prototype - 옥승철 (롯데뮤지엄) - 8/15~10/26
-- ========================================

-- exhibitions_master 업데이트
UPDATE exhibitions_master
SET 
  source_url = 'https://www.lottemuseum.com/Mobile/ko/exhibitionDetail/58',
  instagram_url = 'https://www.instagram.com/p/DMyw3oSSJ9o/',
  genre = 'contemporary',
  exhibition_type = 'solo',
  ticket_price_adult = 20000,
  ticket_price_student = 13000
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE (et.exhibition_title LIKE '%Prototype%' OR et.exhibition_title LIKE '%옥승철%')
  AND et.language_code = 'ko'
);

-- exhibitions_translations 업데이트 (한국어)
UPDATE exhibitions_translations
SET 
  exhibition_title = '옥승철: 프로토타입',
  artists = ARRAY['옥승철'],
  description = '디지털 이미지 환경에서 감각이 어떻게 구성되는지를 회화와 입체 작업을 통해 탐색해 온 작가 옥승철의 대규모 개인전. 복제, 변형, 유통, 삭제라는 이미지의 네 가지 작동 방식에 주목하며, 이미지가 더 이상 고정된 원본으로 작동하지 않는 환경 속에서 계열적으로 파생되며 소멸과 재생성을 반복하는 과정을 시각화합니다. 회화와 조형 작업을 아우르는 구·신작 80여 점을 선보입니다.',
  venue_name = '롯데뮤지엄',
  operating_hours = '10:30 - 19:00 (입장 마감 18:30)',
  ticket_info = '성인 20,000원, 청소년 13,000원, 어린이 13,000원, 만3세 미만 무료',
  phone_number = NULL,
  address = '서울시 송파구 올림픽로 300 롯데월드타워 7층'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE (et2.exhibition_title LIKE '%Prototype%' OR et2.exhibition_title LIKE '%옥승철%')
  AND et2.language_code = 'ko'
) AND language_code = 'ko';

-- exhibitions_translations 업데이트 (영어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'OK SEUNGCHEOL: PROTOTYPE',
  artists = ARRAY['Ok Seungcheol'],
  description = 'A major solo exhibition by Ok Seungcheol, who has been exploring how senses are constructed in digital image environments through painting and sculptural works. Focusing on four operational modes of images—replication, transformation, distribution, and deletion—the exhibition visualizes how images no longer function as fixed originals but instead proliferate systematically while repeating cycles of extinction and regeneration. Features approximately 80 old and new works spanning painting and sculpture.',
  venue_name = 'LOTTE MUSEUM',
  operating_hours = '10:30 - 19:00 (Last entry 18:30)',
  ticket_info = 'Adults 20,000 KRW, Youth 13,000 KRW, Children 13,000 KRW, Under 3 Free',
  phone_number = NULL,
  address = '7F Lotte World Tower, 300 Olympic-ro, Songpa-gu, Seoul'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE (et2.exhibition_title LIKE '%Prototype%' OR et2.exhibition_title LIKE '%옥승철%')
  AND et2.language_code = 'ko'
) AND language_code = 'en';

-- ========================================
-- 19. UNDO DMZ - 양혜규, 원성원, 홍영인 등 (파주 임진각 평화누리) - 8/11~11/5
-- ========================================

-- exhibitions_master 업데이트
UPDATE exhibitions_master
SET 
  source_url = 'https://www.gg.go.kr/dmzopen/usr/wap/detail.do?app=11221&seq=11747&ctgryCodeSearch=EXHIBITION',
  instagram_url = NULL,
  genre = 'contemporary',
  exhibition_type = 'group',
  ticket_price_adult = 0,
  ticket_price_student = 0
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title LIKE '%UNDO DMZ%'
  AND et.language_code = 'ko'
);

-- exhibitions_translations 업데이트 (한국어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'DMZ OPEN 전시: UNDO DMZ (언두 디엠지)',
  artists = ARRAY['양혜규', '원성원', '홍영인', '외 7명'],
  description = '지구상 유일한 분단지역 DMZ에서 펼쳐지는 현대미술 전시. 70여 년간 인간의 발길이 끊기자 생물 다양성이 되살아난 거대한 동식물의 서식지로 변모한 DMZ의 역설에 주목합니다. 방탄복 원사로 만든 버섯 설치작업, 낙하산을 재활용한 의상 등 군수 자원을 재해석한 작품들과 DMZ의 생태를 예술적으로 풀어낸 사진, 사운드 설치 등 총 26점의 작품이 전시됩니다.',
  venue_name = '파주 통일촌 마을, 갤러리그리브스, 파주 임진각 평화누리',
  operating_hours = '갤러리그리브스 10:00-17:00 (월 휴관), 통일촌 11:00-16:00 (월,공휴일 휴관), 임진각 평화누리 상시개방',
  ticket_info = '무료 입장',
  phone_number = NULL,
  address = '파주 통일촌 마을, 갤러리그리브스, 파주 임진각 평화누리'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%UNDO DMZ%'
  AND et2.language_code = 'ko'
) AND language_code = 'ko';

-- exhibitions_translations 업데이트 (영어)
UPDATE exhibitions_translations
SET 
  exhibition_title = 'DMZ OPEN Exhibition: UNDO DMZ',
  artists = ARRAY['Yang Haegue', 'Won Sungwon', 'Hong Youngin', 'and 7 others'],
  description = 'A contemporary art exhibition in the world''s only divided zone, the DMZ. After 70 years of human absence, the DMZ has transformed into a vast habitat for flora and fauna with revived biodiversity. Features 26 works including mushroom installations made from bulletproof vest materials, costumes repurposed from parachutes, and photographs and sound installations artistically interpreting the DMZ ecosystem.',
  venue_name = 'Paju Unification Village, Gallery Greves, Paju Imjingak Peace Nuri',
  operating_hours = 'Gallery Greves 10:00-17:00 (Closed Mon), Unification Village 11:00-16:00 (Closed Mon & Holidays), Imjingak Peace Nuri Always Open',
  ticket_info = 'Free admission',
  phone_number = NULL,
  address = 'Paju Unification Village, Gallery Greves, Paju Imjingak Peace Nuri'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%UNDO DMZ%'
  AND et2.language_code = 'ko'
) AND language_code = 'en';

-- ========================================
-- 20. 2025 타이틀 매치 - 장영혜중공업 & 홍진훤 (서울시립 북서울미술관) - 8/14~11/2
-- ========================================

-- exhibitions_master 업데이트
UPDATE exhibitions_master
SET 
  source_url = 'http://sema.seoul.go.kr/kr/whatson/exhibition/detail?exNo=1430989',
  instagram_url = 'https://www.instagram.com/p/DOHvJSDgXUw/',
  genre = 'contemporary',
  exhibition_type = 'group',
  ticket_price_adult = 0,
  ticket_price_student = 0
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title LIKE '%타이틀 매치%'
  AND et.language_code = 'ko'
);

-- exhibitions_translations 업데이트 (한국어)
UPDATE exhibitions_translations
SET 
  exhibition_title = '2025 타이틀 매치: 장영혜중공업 vs. 홍진훤 - 중간 지대는 없다',
  artists = ARRAY['장영혜중공업', '홍진훤'],
  description = '서울시립 북서울미술관의 대표 연례전인 타이틀 매치 12회. 사회가 끊임없이 하나의 공동체라는 이상을 설파하지만, 현실은 복잡한 이해관계들이 충돌하며 분열된 채 작동한다는 문제의식으로부터 시작합니다. 장영혜중공업은 가상의 시나리오나 문학적 발언을 통해 현대 사회의 모순을 지적하고, 홍진훤은 과거의 사건을 현재 시점에 재맥락화하면서 사진 이미지에 내재한 현실 추동의 힘을 일깨웁니다.',
  venue_name = '서울시립 북서울미술관',
  operating_hours = '화-금 10:00-20:00, 토일공휴일 10:00-19:00 (11-2월 18:00까지), 월 휴관',
  ticket_info = '무료 입장',
  phone_number = '02-2124-5248',
  address = '서울시립 북서울미술관'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%타이틀 매치%'
  AND et2.language_code = 'ko'
) AND language_code = 'ko';

-- exhibitions_translations 업데이트 (영어)
UPDATE exhibitions_translations
SET 
  exhibition_title = '2025 Title Match: Young-Hae Chang Heavy Industries vs. Hong Jinhwon - There Is No Middle Ground',
  artists = ARRAY['Young-Hae Chang Heavy Industries', 'Hong Jinhwon'],
  description = 'The 12th edition of Seoul Museum of Art Buk Seoul''s signature annual exhibition Title Match. Starting from the critical awareness that while society constantly preaches the ideal of one community, reality operates in a divided state with complex conflicting interests. Young-Hae Chang Heavy Industries points out contradictions in modern society through fictional scenarios and literary statements, while Hong Jinhwon recontextualizes past events in the present to awaken the reality-driving power inherent in photographic images.',
  venue_name = 'Seoul Museum of Art Buk Seoul',
  operating_hours = 'Tue-Fri 10:00-20:00, Sat-Sun-Holidays 10:00-19:00 (until 18:00 Nov-Feb), Closed Mon',
  ticket_info = 'Free admission',
  phone_number = '02-2124-5248',
  address = 'Seoul Museum of Art Buk Seoul'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title LIKE '%타이틀 매치%'
  AND et2.language_code = 'ko'
) AND language_code = 'en';
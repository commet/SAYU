-- ========================================
-- SAYU 9월 전시 추가 - Batch 3 (11-15)
-- 실행일: 2025-09-07
-- ========================================

-- ========================================
-- 11. Nam June Paik: Humanity in the Circuits (우양미술관)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://wooyangmuseum.org/current_board/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&bmode=view&idx=166782605&t=board',
  instagram_url = 'https://www.instagram.com/p/DMFT3spT2pM/',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = 'Humanity in the Circuits - 백남준'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Nam June Paik: Humanity in the Circuits',
  artists = ARRAY['백남준'],
  description = '2025년 재개관과 APEC 경주 개최 기념 특별전. 1980년대 후반-1990년대 백남준 예술의 전환기를 조망. 국내 최초 공개 비디오 설치 연작 나의 파우스트 중 경제학과 영원성, 2년 반 복원 끝에 선보이는 전자초고속도로-1929 포드, 1991년 우양미술관 설립 기념 고대기마인상, 비디오·오브제·사운드가 융합된 음악 심과 푸가의 예술 등을 통해 기술-예술-인간의 유기적 회로를 탐구.',
  venue_name = '우양미술관',
  city = '경주',
  operating_hours = '화-일 10:00-18:00',
  ticket_info = '별도 문의',
  phone_number = NULL,
  address = '경북 경주시 보문로 484-7'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Humanity in the Circuits - 백남준'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Nam June Paik: Humanity in the Circuits',
  artists = ARRAY['Nam June Paik'],
  description = 'Special exhibition celebrating 2025 reopening and APEC Gyeongju. Explores transformative period of Nam June Paik from late 1980s to 1990s. Features My Faust series shown in Korea for first time, Electronic Superhighway-1929 Ford after 2.5 year restoration, Ancient Rider from 1991, and media works Music Sim and The Art of Fugue fusing video, objects, and sound. Traverses organic circuits between technology, art, and humanity.',
  venue_name = 'Wooyang Art Museum',
  city = 'Gyeongju',
  operating_hours = 'Tue-Sun 10:00-18:00',
  ticket_info = 'Contact for details'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Humanity in the Circuits - 백남준'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
)
AND language_code = 'en';

-- ========================================
-- 12. Amoako Boafo: I Have Been Here Before (우양미술관)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://wooyangmuseum.org/current_board/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&bmode=view&idx=166784842&t=board',
  instagram_url = 'https://www.instagram.com/p/DLFHWUXzQcs/',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = 'I Have Been Here Before - 아모아코 보아포'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Amoako Boafo: I Have Been Here Before',
  artists = ARRAY['아모아코 보아포'],
  description = '가나 출신 작가 아모아코 보아포의 아시아 최초 개인전. 네 개의 주제별 공간에 걸쳐 정체성과 가시성, 자기 재현의 섬세한 층위를 탐색. 한국 전통 한옥 구조에서 영감을 받아 글렌 드로슈가 디자인한 장소 특정적 공간 설치물 안에 신작 회화 공개. 내면 성찰과 취약함, 대담한 자기 표현 사이를 오가며 다양한 삶의 경험이 지닌 깊이와 복합성을 포착.',
  venue_name = '우양미술관',
  city = '경주',
  operating_hours = '화-일 10:00-18:00',
  ticket_info = '별도 문의',
  phone_number = NULL,
  address = '경북 경주시 보문로 484-7'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'I Have Been Here Before - 아모아코 보아포'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Amoako Boafo: I Have Been Here Before',
  artists = ARRAY['Amoako Boafo'],
  description = 'Asia''s first institutional solo exhibition of Ghanaian artist Amoako Boafo. Explores identity, visibility, and self-representation across four themed sections. Features new paintings in architectural installation inspired by Korean hanok courtyard, designed by Glenn DeRoche. Portraiture navigates between introspection, vulnerability, and bold self-expression, capturing depth and complexity of diverse life experiences.',
  venue_name = 'Wooyang Art Museum',
  city = 'Gyeongju',
  operating_hours = 'Tue-Sun 10:00-18:00',
  ticket_info = 'Contact for details'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'I Have Been Here Before - 아모아코 보아포'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-20'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '우양미술관')
)
AND language_code = 'en';

-- ========================================
-- 13. Heun - 이안 하·스벤 토이퍼 (파이프갤러리)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://pipegallery.com/exhibition/heun/',
  instagram_url = 'https://www.instagram.com/pipe_gallery/',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'group',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '이안 하·스벤 토이퍼'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '파이프갤러리')
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Heun',
  artists = ARRAY['이안 하', '스벤 토이퍼'],
  description = '흔(痕)은 존재나 사물이 남긴 자취로 감각과 기억, 사유의 여지를 품은 흔적. 이안 하는 흐릿해진 기억과 시간의 잔향, 유년의 장소성과 현재의 시차를 반복과 중첩으로 표현하며 지워진 것들로부터 피어나는 감각의 여운을 그림. 스벤 토이퍼는 감응적인 종이 위 단 한 번의 붓질과 공백을 통해 최소한의 제스처 속에 감각적 밀도와 보이지 않는 힘의 흔적을 응축. 덜어냄과 비움 이후 드러나는 자취를 회화로 풀어냄.',
  venue_name = '파이프갤러리',
  city = '서울',
  operating_hours = '화-토 10:00-18:00',
  ticket_info = '무료',
  phone_number = NULL,
  address = '서울특별시 용산구 대사관로 21 2-3F'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '이안 하·스벤 토이퍼'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '파이프갤러리')
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Heun',
  artists = ARRAY['Ian Ha', 'Sven Teufer'],
  description = 'Heun (traces) refers to marks left by beings or objects carrying potential for memory, sensation, and reflection. Ian Ha visualizes faded memories and temporal echoes through repetition and layering, evoking sensory impressions from erasure. Sven Teufer captures immaterial traces through single brushstrokes and intentional blank space on sensitive paper, distilling unseen forces within minimal gestures. Together exploring traces as starting points for new interpretations through absence.',
  venue_name = 'Pipe Gallery',
  city = 'Seoul',
  operating_hours = 'Tue-Sat 10:00-18:00',
  ticket_info = 'Free'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '이안 하·스벤 토이퍼'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '파이프갤러리')
)
AND language_code = 'en';

-- ========================================
-- 14. Cast - 강동주 (아마도예술공간)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://amadoart.org',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '강동주'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '아마도예술공간')
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Cast',
  artists = ARRAY['강동주'],
  description = '제2회 아마도작가상 수상자 강동주의 개인전. 빛과 어둠을 거푸집 삼아 흑백의 면으로 옮기는 작업. 달 표면, 유성우, 은하 등 먼 시공간의 장면을 시아노타입(청사진) 기법으로 전사. 감광액 도포면에 자외선 노출로 청-백 이미지를 만들며, 각 조각은 하루씩 빛과 어둠에 노출되어 한 달에 걸쳐 완성. 날씨와 계절 변화가 푸르거나 흰 흔적으로 남는 과정을 통해 시간과 공간을 현재화하는 수행적 작업.',
  venue_name = '아마도예술공간',
  city = '서울',
  operating_hours = '화-일 11:00-18:00',
  ticket_info = '무료',
  phone_number = '02-790-1178',
  address = '서울시 용산구 이태원로 54길 8'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '강동주'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '아마도예술공간')
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Cast',
  artists = ARRAY['Dongju Kang'],
  description = 'Solo exhibition by 2nd Amado Artist Award winner Dongju Kang. Captures fleeting scenes using light and shadow as molds, transposing them into black-and-white surfaces. Features moon surface, meteors, galaxies through cyanotype technique. UV exposure on sensitized surfaces creates blue-white imprints, each fragment exposed to daily light changes over a month. Weather and seasonal variations leave blue or white traces, creating performative work that brings space-time into the present.',
  venue_name = 'Amado Art Space',
  city = 'Seoul',
  operating_hours = 'Tue-Sun 11:00-18:00',
  ticket_info = 'Free'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '강동주'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '아마도예술공간')
)
AND language_code = 'en';

-- ========================================
-- 15. A Hundred Suns - 최지목 (갤러리바톤)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://gallerybaton.com/ko/exhibitions/122-jimok-choi-a-hundred-suns/',
  instagram_url = 'https://www.instagram.com/p/DN01LXF5kxZ/',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  start_date = '2025-08-20',  -- 실제 시작일로 수정
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '최지목'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '갤러리바톤')
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'A Hundred Suns (백 개의 태양)',
  artists = ARRAY['최지목'],
  description = '잔상 시리즈를 통해 지각적 회화를 탐구하는 최지목의 개인전. 괴테 색채론에 기반한 보색 잔상 개념을 회화로 구현. 태양을 응시한 후 망막에 형성되는 시각적 반응과 보색 잔상을 회화적으로 아카이빙. 에어브러쉬로 경계 없는 중첩과 부유하는 색 덩어리를 표현하며, 맺히고 사라지는 이미지의 속성을 시뮬레이션. 관객 참여형 퍼포먼스 당신의 망막은 나의 캔버스 포함.',
  venue_name = '갤러리바톤',
  city = '서울',
  operating_hours = '화-토 10:00-18:00',
  ticket_info = '무료',
  phone_number = '02-597-5701',
  address = '서울특별시 용산구 독서당로 116'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '최지목'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '갤러리바톤')
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'A Hundred Suns',
  artists = ARRAY['Jimok Choi'],
  description = 'Solo exhibition exploring perceptual painting through afterimage series. Based on Goethe''s color theory and complementary afterimage concept. Archives visual reactions and afterimages formed on retina after gazing at sun. Uses airbrush to express boundless overlapping and floating color masses, simulating properties of images forming and disappearing. Includes participatory performance Your Retina is My Canvas.',
  venue_name = 'Gallery Baton',
  city = 'Seoul',
  operating_hours = 'Tue-Sat 10:00-18:00',
  ticket_info = 'Free'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '최지목'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-08-01'
  AND em.venue_id IN (SELECT id FROM venues WHERE name = '갤러리바톤')
)
AND language_code = 'en';

-- ========================================
-- Batch 3 완료 (11-15번 전시)
-- ========================================
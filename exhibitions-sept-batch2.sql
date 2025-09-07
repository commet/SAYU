-- ========================================
-- SAYU 9월 전시 추가 - Batch 2 (6-10)
-- 실행일: 2025-09-07
-- ========================================

-- ========================================
-- 6. 마르크 샤갈 특별전: BEYOND TIME (예술의전당 한가람미술관)
-- ========================================

-- exhibitions_master UPDATE (이미 존재하는 전시 업데이트)
UPDATE exhibitions_master
SET 
  source_url = 'https://www.sac.or.kr/site/main/show/show_view?SN=70073',
  ticket_price_adult = 25000,
  ticket_price_student = 18000,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '마르크 샤갈 특별전'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-05-15'
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = '마르크 샤갈 특별전: BEYOND TIME',
  artists = ARRAY['마르크 샤갈'],
  description = '전 세계 최초로 공개되는 미공개 유화 7점을 포함해 총 170여 점을 선보이는 대규모 특별전. 색채의 마술사 샤갈의 회화, 드로잉, 석판화, 스테인드글라스 등을 기억, 파리, 영성, 지중해, 꽃 등 7가지 주제로 조명. 파리 오페라 가르니에 천장화와 예루살렘 하다사 의료 센터 스테인드글라스를 몰입형 미디어아트로 재현.',
  operating_hours = '화-일 10:00-19:00 (입장마감 18:00)',
  ticket_info = '성인 25,000원 / 청소년·어린이 18,000원 / 36개월 미만 무료',
  phone_number = '1668-1352',
  address = '서울특별시 서초구 남부순환로 2406 예술의전당'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '마르크 샤갈 특별전'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-05-15'
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Marc Chagall Special Exhibition: BEYOND TIME',
  artists = ARRAY['Marc Chagall'],
  description = 'Large-scale special exhibition featuring 170 works including 7 oil paintings unveiled for the first time worldwide. Explores the Magician of Color through seven themes: Memories, Paris, Spirituality, Mediterranean, and Flowers. Features immersive media art recreations of Paris Opera Garnier ceiling and Jerusalem Hadassah Medical Center stained glass windows.',
  operating_hours = 'Tue-Sun 10:00-19:00 (Last entry 18:00)',
  ticket_info = 'Adult 25,000 KRW / Youth·Children 18,000 KRW / Under 36 months Free'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '마르크 샤갈 특별전'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-05-15'
)
AND language_code = 'en';

-- ========================================
-- 7. 앤서니 브라운展: 마스터 오브 스토리텔링 (예술의전당 한가람미술관)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://www.sac.or.kr/site/main/show/show_view',
  ticket_price_adult = 22000,
  ticket_price_student = 16000,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '앤서니 브라운'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-06-20'
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = '앤서니 브라운展: 마스터 오브 스토리텔링',
  artists = ARRAY['앤서니 브라운'],
  description = '고릴라 할아버지로 사랑받는 세계적 그림책 작가 앤서니 브라운의 초기 데뷔작부터 최근작까지 약 250여 점의 원화를 총망라한 회고전. 그림책 페이지를 넘기는 듯한 동선과 작품 속 상징적 요소들을 곳곳에 배치한 참여형 전시. 대형 미디어 아트와 놀이형 설치 작품, 연극 등으로 그림책 속 마법 같은 순간을 생생하게 재현.',
  operating_hours = '화-일 10:00-19:00 (입장마감 18:10)',
  ticket_info = '성인 22,000원 / 어린이·청소년 16,000원 / 3인권 45,000원 / 4인권 59,000원',
  phone_number = '02-730-4368',
  address = '서울특별시 서초구 남부순환로 2406 예술의전당'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '앤서니 브라운'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-06-20'
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Anthony Browne: Master of Storytelling',
  artists = ARRAY['Anthony Browne'],
  description = 'Retrospective exhibition featuring 250 original artworks from the world-renowned picture book artist Anthony Browne, from early debut works to recent pieces. Interactive exhibition designed like turning pages of a picture book, with symbolic elements placed throughout. Features large-scale media art, playful installations, and theatrical interpretations bringing magical moments from picture books to life.',
  operating_hours = 'Tue-Sun 10:00-19:00 (Last entry 18:10)',
  ticket_info = 'Adult 22,000 KRW / Children·Youth 16,000 KRW / 3-person 45,000 KRW / 4-person 59,000 KRW'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '앤서니 브라운'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-06-20'
)
AND language_code = 'en';

-- ========================================
-- 8. Drawing on Space - 안토니 곰리 (뮤지엄 산)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://www.museumsan.org/museumsan/display/artgallery_now.jsp?m=2&s=1',
  instagram_url = 'https://www.instagram.com/p/DLHl7UBPI_l/',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = 'Drawing on Space - 안토니 곰리'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-06-20'
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Drawing on Space',
  artists = ARRAY['안토니 곰리'],
  description = '영국을 대표하는 작가 안토니 곰리의 국내 최대 규모 개인전. 기포처럼 섬세한 Liminal Field 시리즈 조각들, 나선형 소우주를 제시하는 Orbit Field II, 빛과 어둠을 담은 드로잉까지 40여 년 예술 여정을 담은 전시. 작품들은 단순히 공간을 채우는 오브제가 아니라 건축과 관객의 몸과 반응하며 감각적 경험을 생성하는 촉매로 기능한다.',
  venue_name = '뮤지엄 산',
  city = '원주',
  operating_hours = '화-일 10:00-18:00',
  ticket_info = '별도 문의',
  phone_number = '033-730-9000',
  address = '강원도 원주시 지정면 오크밸리 2길 260'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Drawing on Space - 안토니 곰리'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-06-20'
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Drawing on Space',
  artists = ARRAY['Antony Gormley'],
  description = 'The largest exhibition of British artist Antony Gormley in Korea. Features elusive bodies of Liminal Field series, spiralling microcosm of Orbit Field II, and drawings capturing light and darkness, tracing 40 years of artistic journey. Works act as catalysts that activate rather than occupy space, exploring the enclosures of architecture and the body as sensate.',
  venue_name = 'Museum SAN',
  city = 'Wonju',
  operating_hours = 'Tue-Sun 10:00-18:00',
  ticket_info = 'Contact for details'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Drawing on Space - 안토니 곰리'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-06-20'
)
AND language_code = 'en';

-- ========================================
-- 9. 영원히, 화가 - 미셸 들라크루아 (현대백화점 무역센터점)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://www.ehyundai.com/newCulture/CT/CT010100_V.do?stCd=480&sqCd=&flrCd=&genrCd=001',
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'contemporary',
  exhibition_type = 'solo',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = '영원히, 화가'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-07-01'
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = '미셸 들라크루아: 영원히, 화가',
  artists = ARRAY['미셸 들라크루아'],
  description = '1933년 파리 태생 화가 미셸 들라크루아의 전시. 1930-40년대 전쟁 이전 평화로운 파리의 건축물과 사람들을 그려온 작가의 50-80세(1982-2012) 초기 희귀 판화와 90세 이후 현재까지의 작품을 선보임. 인생을 교향곡에 비유하여 네 가지 악장으로 구성된 전시로 작가가 현재 집중하는 세 가지 테마를 소개.',
  venue_name = '현대백화점 무역센터점',
  city = '서울',
  operating_hours = '월-목 10:30-20:00, 금-일 10:30-20:30',
  ticket_info = '무료',
  phone_number = '02-3467-8338',
  address = '서울특별시 강남구 테헤란로 517'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '영원히, 화가'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-01'
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Michel Delacroix: Forever, A Painter',
  artists = ARRAY['Michel Delacroix'],
  description = 'Exhibition of Paris-born painter Michel Delacroix (1933). Features rare early prints from ages 50-80 (1982-2012) depicting peaceful pre-war Paris architecture and people of 1930-40s, plus works from age 90 to present. Organized as a symphony with four movements introducing three themes the artist currently focuses on.',
  venue_name = 'Hyundai Department Store Trade Center',
  city = 'Seoul',
  operating_hours = 'Mon-Thu 10:30-20:00, Fri-Sun 10:30-20:30',
  ticket_info = 'Free'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = '영원히, 화가'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-01'
)
AND language_code = 'en';

-- ========================================
-- 10. Works 1972-2020 - 안소니 맥콜 (푸투라서울)
-- ========================================

-- exhibitions_master UPDATE
UPDATE exhibitions_master
SET 
  source_url = 'https://futuraseoul.org/78',
  instagram_url = 'https://www.instagram.com/p/DNj7NCMTBtm/',
  ticket_price_adult = 18000,
  ticket_price_student = 12000,
  genre = 'contemporary',
  exhibition_type = 'solo',
  end_date = '2025-09-28',  -- 연장됨
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.exhibition_title = 'Works 1972-2020'
  AND et.language_code = 'ko'
  AND em.start_date = '2025-07-01'
);

-- 한글 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = '안소니 맥콜: Works 1972-2020',
  artists = ARRAY['안소니 맥콜'],
  description = '빛, 시간, 공간과 관객 상호작용을 탐구해온 안소니 맥콜의 아시아 첫 개인전. 1973년 Line Describing a Cone부터 솔리드 라이트 시리즈, 2000년대 이후 디지털 설치작업까지 반세기 예술적 실험을 조망. 스크린을 제거하고 물리적 공간에 빛을 투사해 관객이 3차원 작품 속으로 들어가 경험하는 확장 시네마. 시간을 경험하는 조각으로서 빛의 구조물을 제시.',
  venue_name = '푸투라서울',
  city = '서울',
  operating_hours = '수-일 11:00-19:00',
  ticket_info = '일반 18,000원 / 대학생 12,000원 / 네이버 예약 20% 할인',
  phone_number = NULL,
  address = '서울특별시 종로구 북촌로5나길 86'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Works 1972-2020'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-01'
)
AND language_code = 'ko';

-- 영문 번역 UPDATE
UPDATE exhibitions_translations
SET
  exhibition_title = 'Anthony McCall: Works 1972-2020',
  artists = ARRAY['Anthony McCall'],
  description = 'First solo exhibition in Asia of Anthony McCall exploring light, time, space and audience interaction. Spanning half a century from Line Describing a Cone (1973) through Solid Light series to digital installations post-2000s. Expanded Cinema removing screens and projecting light into physical space, allowing audiences to enter 3D works. Presents light structures as sculptures that experience time.',
  venue_name = 'Futura Seoul',
  city = 'Seoul',
  operating_hours = 'Wed-Sun 11:00-19:00',
  ticket_info = 'General 18,000 KRW / University 12,000 KRW / 20% Naver discount'
WHERE exhibition_id IN (
  SELECT em.id 
  FROM exhibitions_master em
  JOIN exhibitions_translations et2 ON em.id = et2.exhibition_id
  WHERE et2.exhibition_title = 'Works 1972-2020'
  AND et2.language_code = 'ko'
  AND em.start_date = '2025-07-01'
)
AND language_code = 'en';

-- ========================================
-- Batch 2 완료 (6-10번 전시)
-- ========================================
-- ========================================
-- SAYU 9월 전시 추가 - Batch 1 (1-5)
-- 실행일: 2025-09-05
-- ========================================

-- 먼저 instagram_url 컬럼 추가 (이미 있으면 무시)
ALTER TABLE exhibitions_master 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- ========================================
-- 1. 오수환: 천 개의 대화 (가나아트센터)
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '가나아트센터' LIMIT 1),
  '2025-08-29', '2025-09-21', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'https://www.ganaart.com/exhibition/oh-sufan-2/',
  'https://www.instagram.com/p/DNpoeQJB5FN/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.ganaart.com/exhibition/oh-sufan-2/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '오수환: 천 개의 대화',
  ARRAY['오수환'],
  '이번 전시는 <곡신>, <적막>, <변화>, <대화>로 이어지는 오수환의 연작 중 <대화> 시리즈 드로잉 40여점을 선보인다. 2000년대 후반 시작해 현재까지 지속하는 <대화>는 자연, 과거의 문명, 인간과의 교감을 주제로 하며, 먹, 과슈, 오일파스텔 등 다양한 재료로 자유롭고 경쾌한 필치가 특징이다.',
  '가나아트센터', '서울',
  '화-일 10:00-19:00',
  '무료',
  '02-720-1020',
  '서울특별시 종로구 평창30길 28'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.ganaart.com/exhibition/oh-sufan-2/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Oh Sufan: A Thousand Dialogues',
  ARRAY['Oh Sufan'],
  'This exhibition presents around 40 drawings from Oh Sufan''s ongoing Dialogue series. Begun in the late 2000s, the series explores themes of communication with nature, ancient civilizations, and humanity through liberated strokes using ink, gouache, and oil pastels.',
  'Gana Art Center', 'Seoul',
  'Tue-Sun 10:00-19:00',
  'Free'
);

-- ========================================
-- 2. 조주현: 공존을 향하는 일 (페이토 갤러리) - 8/29~9/27
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '페이토갤러리' OR name = '페이토 갤러리' LIMIT 1),
  '2025-08-29', '2025-09-27', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'https://www.peytogallery.com/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&bmode=view&idx=167399102&t=board',
  'https://www.instagram.com/p/DNuXbZt5GpE/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.peytogallery.com' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '공존을 향하는 일',
  ARRAY['조주현'],
  '베를린을 중심으로 활동 중인 조주현 작가의 개인전으로, 진채화의 섬세한 감성과 드로잉의 자유로움을 바탕으로 공존을 향한 여정을 담고 있습니다. 마음풍경화 Mindscape, 미완성을 향하는 일 시리즈 신작과 개인 서사에서 출발한 드로잉 신작을 선보입니다. 한국화를 기반으로 장지와 진채화 등 전통 재료와 채색 기법으로 내면적 경험과 사회적 감수성을 결합한 작품들입니다.',
  '페이토갤러리', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-2233-8981',
  '서울특별시 중구 동호로 220, 4F'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.peytogallery.com' ORDER BY created_at DESC LIMIT 1),
  'en',
  'A Work Towards Coexistence',
  ARRAY['Juheon Cho'],
  'Solo exhibition by Berlin-based Juheon Cho, reflecting a journey toward coexistence through the delicate sensibility of traditional Korean painting (jinchae) and expressive freedom found in drawing. Features new works from the Mindscape and A Work Towards Incomplete series, combining inner experiences with social sensitivity using traditional materials and coloring techniques.',
  'PEYTO Gallery', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 3. 백경호: 느끼고 요구를 듣는다 (눈 컨템포러리) - 8/29~10/2
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '눈 컨템포러리' OR name = 'Noon Contemporary' LIMIT 1),
  '2025-08-29', '2025-10-02', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'https://www.nooncontemporary.com/current',
  'https://www.instagram.com/p/DNsX2KaUnby/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.nooncontemporary.com/current' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '느끼고 요구를 듣는다',
  ARRAY['백경호'],
  '백경호의 회화는 물질성과 시간성, 회화의 자율성에 대한 질문을 품고 있다. 붓, 나이프, 긁개로 물감을 밀고 쌓으며 표면의 텍스처를 응시하다 회화가 자율적 생명으로 전환되는 인식점에 도달한다. 최근 사각 화면에서 물감이 만드는 조형적 완결성을 탐구하며, 표면·형식·물질이 얽히는 회화의 가능성을 묻는다. 우연과 직관, 관찰과 기억이 교차하며 형성된 시간성의 흔적이다.',
  '눈 컨템포러리', '서울',
  '화-토 12:00-18:00',
  '무료',
  NULL,
  '서울특별시 용산구 소월로 72'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.nooncontemporary.com/current' ORDER BY created_at DESC LIMIT 1),
  'en',
  'TO FEEL and TO HEAR THE CALL',
  ARRAY['Baek Kyungho'],
  'Baek Kyungho''s paintings continuously question materiality, temporality, and the autonomy of painting. Using brushes, knives, and scrapers to push and layer paint, he reaches a recognition point where painting transforms into autonomous life. Recently exploring compositional completeness within rectangular frames, examining possibilities where surface, form, and material intertwine. Traces formed through the intersection of chance and intuition, observation and memory.',
  'Noon Contemporary', 'Seoul',
  'Tue-Sat 12:00-18:00',
  'Free'
);

-- ========================================
-- 4. 김형대: HALO - Divine Radiance (금산갤러리) - 8/29~9/30
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '금산갤러리' OR name = 'Keumsan Gallery' LIMIT 1),
  '2025-08-29', '2025-09-30', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'http://www.keumsangallery.com/exhibitions/read.php?no=363',
  'https://www.instagram.com/p/DN0Hkaqwo0v/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'http://www.keumsangallery.com/exhibitions/read.php?no=363' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'HALO: Divine Radiance',
  ARRAY['김형대'],
  '1961년 앵포르멜 계열 작품으로 국전 국가재건최고회의 의장상을 수상한 한국 추상미술의 선구자 김형대의 개인전. 40여 년간 이어온 HALO 시리즈를 중심으로 한국 고유의 미감과 전통 색채, 자연의 리듬이 서양의 추상 언어와 어우러진 회화 세계를 선보인다. 한국 전통미의 또 다른 단층을 현대적 맥락의 추상 화법으로 간접 표현하며 색을 탐구함으로써 독자적 영역을 구축했다.',
  '금산갤러리', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-3789-6317',
  '서울특별시 중구 소공로 46 남산플래티넘 B103'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'http://www.keumsangallery.com/exhibitions/read.php?no=363' ORDER BY created_at DESC LIMIT 1),
  'en',
  'HALO: Divine Radiance',
  ARRAY['KIM Hyungdae'],
  'Solo exhibition by KIM Hyungdae, pioneer of Korean abstract art who won the Chairman''s Award at the National Art Exhibition in 1961 with his Informel-style work. Features the HALO series developed over 40 years, where Korean aesthetics, traditional colors, and natural rhythms harmonize with Western abstract language. Explores color to create an independent realm by indirectly expressing another layer of Korean traditional beauty through modern abstract techniques.',
  'Keumsan Gallery', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 5. Nude, Flesh, and Love (제이슨함) - 8/30~10/25
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '제이슨함' OR name = 'Jason Haam' LIMIT 1),
  '2025-08-30', '2025-10-25', 'ongoing',
  0, 0,
  'contemporary', 'group',
  'https://www.jasonhaam.com/ko/exhibitions/36/',
  NULL,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.jasonhaam.com/ko/exhibitions/36/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Nude, Flesh, and Love',
  ARRAY['김정욱', 'Cindy Ji Hye Kim', '이목하', '이승애', '최혜경', '한지형', 'Amanda Baldwin', 'John Currin', 'Urs Fischer', 'Jonathan Gardner', 'Mike Lee', 'Sarah Lucas', 'Nora Maité Nieves', 'Emily Mae Smith', 'Daniel Sinsel', 'Issy Wood'],
  '다양한 세대와 문화적 배경을 지닌 16명의 작가가 누드를 주제로 한 그룹전. 욕망과 성애의 대상으로서의 육체, 시선의 구조와 권력 관계를 드러내는 장치, 정체성의 표현 수단이자 은폐 도구로서의 신체를 탐구한다. 각 작가는 소재와 재료를 다루는 기술적 완성도를 기반으로 이상적 아름다움을 추구하며, 인간 신체의 본질적 아름다움과 감정의 층위를 탐구한다.',
  '제이슨함', '서울',
  '화-토 10:00-18:00',
  '무료',
  '070-4477-7880',
  '서울특별시 성북구 성북로 31길 73'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.jasonhaam.com/ko/exhibitions/36/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Nude, Flesh, and Love',
  ARRAY['Kim Jungwook', 'Cindy Ji Hye Kim', 'Moka Lee', 'SeungAe Lee', 'HyeGyeong Choi', 'HAN Jihyoung', 'Amanda Baldwin', 'John Currin', 'Urs Fischer', 'Jonathan Gardner', 'Mike Lee', 'Sarah Lucas', 'Nora Maité Nieves', 'Emily Mae Smith', 'Daniel Sinsel', 'Issy Wood'],
  'Group exhibition featuring 16 artists from diverse generations and cultural backgrounds exploring the nude. Artists approach the body as object of desire and eroticism, device revealing gaze structures and power dynamics, and means of expressing or concealing identity. Through refined mastery of material and technique, each artist articulates their vision of ideal beauty, exploring fundamental beauty of human form and emotional depth.',
  'Jason Haam', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- Batch 1 완료 (1-5번 전시)
-- ========================================
-- ============================================================================
-- Mood Atlas 지역 데이터 삽입
-- ============================================================================
-- 생성일: 2025-01-07
-- 설명: 7개 예술 대륙/지역 초기 데이터
-- ============================================================================

-- 기존 데이터 삭제 (재실행 가능하도록)
DELETE FROM mood_atlas_regions;

-- ----------------------------------------------------------------------------
-- 1. 🏛️ 르네상스 중심 (Renaissance Plaza)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  1, 10, 10,
  '🏛️',
  'gold',
  ARRAY['#D4AF37', '#F5F5DC', '#8B4513'],
  '웅장한 고전 예술의 시작점. 레오나르도 다 빈치, 미켈란젤로 같은 거장들의 걸작을 만나보세요.',
  'The magnificent starting point of classical art. Meet masterpieces by Leonardo da Vinci and Michelangelo.',
  ARRAY['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'],
  ARRAY['yellow', 'green'],
  '{"points": 500, "badge": "renaissance-scholar", "title": "르네상스인"}'::jsonb,
  NULL,
  NULL
);

-- ----------------------------------------------------------------------------
-- 2. 🌊 인상주의 해안 (Impressionist Coast)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  11, 25, 15,
  '🌊',
  'blue',
  ARRAY['#87CEEB', '#FFB6C1', '#E6E6FA'],
  '부드럽고 평화로운 인상주의의 세계. 빛과 색채의 조화를 느껴보세요.',
  'The soft and peaceful world of Impressionism. Feel the harmony of light and color.',
  ARRAY['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Camille Pissarro'],
  ARRAY['blue', 'green', 'yellow'],
  '{"points": 800, "badge": "impressionist-master", "title": "인상주의 마스터"}'::jsonb,
  'renaissance',
  1
);

-- ----------------------------------------------------------------------------
-- 3. 🌋 표현주의 협곡 (Expressionist Canyon)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  11, 30, 20,
  '🌋',
  'red',
  ARRAY['#0000FF', '#FFA500', '#000000', '#FFFF00'],
  '격렬하고 감정적인 표현의 세계. 내면의 격정을 예술로 만나보세요.',
  'The intense and emotional world of Expressionism. Meet the inner passion through art.',
  ARRAY['Vincent van Gogh', 'Edvard Munch', 'Egon Schiele', 'Oskar Kokoschka'],
  ARRAY['red', 'blue', 'gray'],
  '{"points": 1000, "badge": "expression-master", "title": "감정의 대가"}'::jsonb,
  'renaissance',
  1
);

-- ----------------------------------------------------------------------------
-- 4. 🏝️ 팝아트 섬 (Pop Art Island)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'pop_art',
  '팝아트 섬',
  'Pop Art Island',
  31, 50, 20,
  '🏝️',
  'red',
  ARRAY['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'],
  '유쾌하고 경쾌한 팝아트의 섬. 밝은 색채와 대중문화의 만남.',
  'The cheerful and lively Pop Art Island. The meeting of bright colors and pop culture.',
  ARRAY['Andy Warhol', 'Roy Lichtenstein', 'Keith Haring', 'David Hockney'],
  ARRAY['red', 'yellow'],
  '{"points": 1200, "badge": "pop-icon", "title": "팝 아이콘"}'::jsonb,
  'impressionist',
  2
);

-- ----------------------------------------------------------------------------
-- 5. 🌈 현대미술 군도 (Contemporary Archipelago)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'contemporary',
  '현대미술 군도',
  'Contemporary Archipelago',
  51, 80, 30,
  '🌈',
  'purple',
  ARRAY['#9D84B7', '#E76F51', '#F4A261', '#2A9D8F'],
  '실험적이고 다양한 현대미술의 세계. 새로운 예술적 시도를 경험하세요.',
  'The experimental and diverse world of contemporary art. Experience new artistic attempts.',
  ARRAY['Yayoi Kusama', 'Jeff Koons', 'Damien Hirst', 'Takashi Murakami', 'Lee Ufan'],
  ARRAY['purple', 'red'],
  '{"points": 1500, "badge": "contemporary-explorer", "title": "현대의 탐험가"}'::jsonb,
  'expressionist',
  2
);

-- ----------------------------------------------------------------------------
-- 6. 🏔️ 추상의 고원 (Abstract Highlands)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'abstract',
  '추상의 고원',
  'Abstract Highlands',
  81, 120, 40,
  '🏔️',
  'blue',
  ARRAY['#4169E1', '#FFD700', '#DC143C', '#000000'],
  '사색적이고 초월적인 추상의 세계. 순수한 형태와 색채를 탐험하세요.',
  'The contemplative and transcendent world of abstract art. Explore pure forms and colors.',
  ARRAY['Wassily Kandinsky', 'Piet Mondrian', 'Mark Rothko', 'Kazimir Malevich'],
  ARRAY['blue', 'green'],
  '{"points": 2000, "badge": "abstract-sage", "title": "추상의 현자"}'::jsonb,
  'pop_art',
  3
);

-- ----------------------------------------------------------------------------
-- 7. 🌌 초현실 심연 (Surreal Abyss)
-- ----------------------------------------------------------------------------
INSERT INTO mood_atlas_regions (
  id, name_ko, name_en, day_start, day_end, total_tiles,
  icon, primary_color, theme_colors,
  description_ko, description_en,
  featured_artists, emotion_affinity, completion_reward,
  prerequisite, branch_group
) VALUES (
  'surreal',
  '초현실 심연',
  'Surreal Abyss',
  121, 180, 60,
  '🌌',
  'purple',
  ARRAY['#4B0082', '#8B008B', '#191970', '#FFD700'],
  '몽환적이고 기이한 초현실의 세계. 꿈과 현실의 경계를 넘어서세요.',
  'The dreamlike and mysterious world of Surrealism. Cross the boundary between dream and reality.',
  ARRAY['Salvador Dalí', 'René Magritte', 'Joan Miró', 'Max Ernst', 'Frida Kahlo'],
  ARRAY['purple', 'gray'],
  '{"points": 3000, "badge": "dream-interpreter", "title": "꿈의 해석자"}'::jsonb,
  'abstract',
  NULL
);

-- ----------------------------------------------------------------------------
-- 검증 쿼리
-- ----------------------------------------------------------------------------
-- 총 지역 수 확인
SELECT COUNT(*) as total_regions FROM mood_atlas_regions;
-- 예상 결과: 7

-- 총 타일 수 확인 (195개 타일 = 약 6개월)
SELECT SUM(total_tiles) as total_tiles FROM mood_atlas_regions;
-- 예상 결과: 195

-- 지역별 정보 확인
SELECT
  icon,
  name_ko,
  day_start || '-' || day_end as days,
  total_tiles as tiles,
  prerequisite,
  branch_group
FROM mood_atlas_regions
ORDER BY day_start;

-- ----------------------------------------------------------------------------
-- 완료
-- ----------------------------------------------------------------------------
-- ✅ 7개 지역 데이터 삽입 완료
-- ✅ 총 195 타일 (약 6개월 완주)
-- ✅ 분기 시스템 설정 완료
--
-- 다음 단계:
-- 003_insert_mood_atlas_artworks.sql (작품 데이터 삽입)
-- ----------------------------------------------------------------------------

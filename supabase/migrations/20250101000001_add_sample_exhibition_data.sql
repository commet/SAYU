-- ====================================================================
-- 테스트용 샘플 전시 및 작품 데이터 추가
-- Phase 1: MVP 테스트 데이터
-- ====================================================================

-- 1. 샘플 전시 추가 (exhibitions 테이블이 이미 존재한다고 가정)
INSERT INTO exhibitions (
  id,
  title,
  title_en,
  venue_name,
  start_date,
  end_date,
  description,
  poster_url,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '테스트 전시: 인상주의의 빛',
  'Test Exhibition: Light of Impressionism',
  '테스트 미술관',
  '2025-01-01',
  '2025-12-31',
  '전시 관람 기록 시스템 테스트를 위한 샘플 전시입니다.',
  'https://via.placeholder.com/800x600.png?text=Test+Exhibition',
  'ongoing'
) ON CONFLICT (id) DO NOTHING;

-- 2. 샘플 작품 10개 추가 (exhibition_artworks 테이블)
INSERT INTO exhibition_artworks (
  exhibition_id,
  title,
  title_en,
  artist,
  artist_en,
  year,
  medium,
  dimensions,
  description,
  display_order
) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '별이 빛나는 밤',
    'The Starry Night',
    '빈센트 반 고흐',
    'Vincent van Gogh',
    '1889',
    '캔버스에 유채',
    '73.7 × 92.1 cm',
    '반 고흐의 가장 유명한 작품 중 하나로, 생레미의 정신병원 창문에서 본 풍경을 그렸습니다.',
    1
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '수련',
    'Water Lilies',
    '클로드 모네',
    'Claude Monet',
    '1906',
    '캔버스에 유채',
    '89.9 × 94.1 cm',
    '모네의 지베르니 정원 연못을 그린 연작 중 하나입니다.',
    2
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '절규',
    'The Scream',
    '에드바르 뭉크',
    'Edvard Munch',
    '1893',
    '캔버스에 유채, 템페라, 파스텔',
    '91 × 73.5 cm',
    '실존적 불안을 표현한 표현주의의 대표작입니다.',
    3
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '기억의 지속',
    'The Persistence of Memory',
    '살바도르 달리',
    'Salvador Dalí',
    '1931',
    '캔버스에 유채',
    '24 × 33 cm',
    '녹아내리는 시계로 유명한 초현실주의 작품입니다.',
    4
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '키스',
    'The Kiss',
    '구스타프 클림트',
    'Gustav Klimt',
    '1908',
    '캔버스에 유채와 금박',
    '180 × 180 cm',
    '황금빛 장식이 돋보이는 클림트의 대표작입니다.',
    5
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '진주 귀걸이를 한 소녀',
    'Girl with a Pearl Earring',
    '요하네스 베르메르',
    'Johannes Vermeer',
    '1665',
    '캔버스에 유채',
    '44.5 × 39 cm',
    '신비로운 표정의 소녀를 그린 17세기 네덜란드 회화의 걸작입니다.',
    6
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '게르니카',
    'Guernica',
    '파블로 피카소',
    'Pablo Picasso',
    '1937',
    '캔버스에 유채',
    '349.3 × 776.6 cm',
    '스페인 내전 중 게르니카 폭격을 주제로 한 반전 작품입니다.',
    7
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '두 명의 프리다',
    'The Two Fridas',
    '프리다 칼로',
    'Frida Kahlo',
    '1939',
    '캔버스에 유채',
    '173.5 × 173 cm',
    '프리다 칼로의 이중 자화상으로 정체성과 고통을 표현했습니다.',
    8
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '모나리자',
    'Mona Lisa',
    '레오나르도 다 빈치',
    'Leonardo da Vinci',
    '1503',
    '포플러 나무판에 유채',
    '77 × 53 cm',
    '세계에서 가장 유명한 초상화로, 신비로운 미소로 유명합니다.',
    9
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '마릴린 먼로',
    'Marilyn Diptych',
    '앤디 워홀',
    'Andy Warhol',
    '1962',
    '실크스크린',
    '205.4 × 289.6 cm',
    '팝아트의 대표작으로 마릴린 먼로를 반복적으로 표현했습니다.',
    10
  )
ON CONFLICT (exhibition_id, title, artist) DO NOTHING;

-- 검증
DO $$
DECLARE
  exhibition_count INTEGER;
  artwork_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exhibition_count
  FROM exhibitions
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

  SELECT COUNT(*) INTO artwork_count
  FROM exhibition_artworks
  WHERE exhibition_id = '00000000-0000-0000-0000-000000000001'::uuid;

  RAISE NOTICE '✅ 샘플 데이터 추가 완료';
  RAISE NOTICE '   - 전시: % 개', exhibition_count;
  RAISE NOTICE '   - 작품: % 개', artwork_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 테스트 전시 ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '📝 이 ID를 사용해서 관람을 시작하세요!';
END $$;

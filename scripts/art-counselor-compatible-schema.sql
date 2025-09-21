-- SAYU Art Counselor Schema (기존 DB 구조 호환)
-- 기존: users(UUID), exhibitions_master(UUID), exhibitions_translations

-- 1. artworks 테이블 (기존 exhibitions_master와 유사한 구조)
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  artist TEXT NOT NULL,
  artist_en TEXT,
  year INTEGER,
  medium TEXT,
  dimensions TEXT,
  location TEXT,
  style TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. art_journals 테이블 (사용자 감상 기록)
CREATE TABLE IF NOT EXISTS art_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,

  -- 사용자 입력 내용
  first_impression TEXT,
  personal_connection TEXT,
  new_discovery TEXT,
  question_to_artist TEXT,

  -- 빠른 반응
  mood_tags TEXT[],
  color_selections TEXT[],

  -- 메타데이터
  weather_data JSONB,
  time_of_day TEXT,
  session_number INTEGER DEFAULT 1,

  -- AI 분석 결과
  emotion_vector TEXT, -- pgvector 확장시 vector(768)로 변경 가능
  writing_style JSONB,
  growth_indicators JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_art_journeys 테이블 (사용자별 예술 여정)
CREATE TABLE IF NOT EXISTS user_art_journeys (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_artworks INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  favorite_artists TEXT[],
  emotional_evolution JSONB DEFAULT '{}',
  preference_patterns JSONB DEFAULT '{}',
  special_moments JSONB[],
  last_viewed_artworks UUID[], -- artwork UUIDs
  last_journal_entry TIMESTAMPTZ,
  next_recommendations UUID[], -- artwork UUIDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. daily_art_presentations 테이블 (일일 작품 제공 기록)
CREATE TABLE IF NOT EXISTS daily_art_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  presented_at TIMESTAMPTZ DEFAULT NOW(),
  selection_reason TEXT,
  engagement_level TEXT,
  journal_created BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_year ON artworks(year);

CREATE INDEX IF NOT EXISTS idx_art_journals_user ON art_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_artwork ON art_journals(artwork_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_created ON art_journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_art_journals_mood ON art_journals USING GIN(mood_tags);

CREATE INDEX IF NOT EXISTS idx_daily_art_user ON daily_art_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_art_date ON daily_art_presentations(presented_at);
CREATE INDEX IF NOT EXISTS idx_daily_art_user_date ON daily_art_presentations(user_id, DATE(presented_at));

-- RLS 정책 설정 (기존 패턴 따라감)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_art_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_art_presentations ENABLE ROW LEVEL SECURITY;

-- artworks 정책: 모두 읽기 가능
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON artworks;
CREATE POLICY "Artworks are viewable by everyone" ON artworks
  FOR SELECT USING (true);

-- art_journals 정책: 자신의 기록만
DROP POLICY IF EXISTS "Users can view own journals" ON art_journals;
CREATE POLICY "Users can view own journals" ON art_journals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own journals" ON art_journals;
CREATE POLICY "Users can create own journals" ON art_journals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journals" ON art_journals;
CREATE POLICY "Users can update own journals" ON art_journals
  FOR UPDATE USING (auth.uid() = user_id);

-- user_art_journeys 정책
DROP POLICY IF EXISTS "Users can view own journey" ON user_art_journeys;
CREATE POLICY "Users can view own journey" ON user_art_journeys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journey" ON user_art_journeys;
CREATE POLICY "Users can manage own journey" ON user_art_journeys
  FOR ALL USING (auth.uid() = user_id);

-- daily_art_presentations 정책
DROP POLICY IF EXISTS "Users can view own presentations" ON daily_art_presentations;
CREATE POLICY "Users can view own presentations" ON daily_art_presentations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create presentations" ON daily_art_presentations;
CREATE POLICY "System can create presentations" ON daily_art_presentations
  FOR INSERT WITH CHECK (true);

-- 초기 작품 데이터 삽입
INSERT INTO artworks (id, title, title_en, artist, artist_en, medium, dimensions, location, style, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440000', '별이 빛나는 밤', 'The Starry Night', '빈센트 반 고흐', 'Vincent van Gogh', '유화', '73.7 × 92.1 cm', '뉴욕 현대미술관', '포스트 인상주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'),
('550e8400-e29b-41d4-a716-446655440001', '수련', 'Water Lilies', '클로드 모네', 'Claude Monet', '유화', '89.9 × 94.1 cm', '시카고 미술관', '인상주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'),
('550e8400-e29b-41d4-a716-446655440002', '키스', 'The Kiss', '구스타프 클림트', 'Gustav Klimt', '유화, 금박', '180 × 180 cm', '벨베데레 궁전', '아르누보', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg/1280px-Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg'),
('550e8400-e29b-41d4-a716-446655440003', '절규', 'The Scream', '에드바르 뭉크', 'Edvard Munch', '유화, 템페라, 파스텔', '91 × 73.5 cm', '노르웨이 국립미술관', '표현주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'),
('550e8400-e29b-41d4-a716-446655440004', '진주 귀걸이를 한 소녀', 'Girl with a Pearl Earring', '요하네스 페르메이르', 'Johannes Vermeer', '유화', '44.5 × 39 cm', '마우리츠하위스 미술관', '바로크', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg')
ON CONFLICT (id) DO NOTHING;

-- 완료 확인
DO $$
BEGIN
  RAISE NOTICE '✅ SAYU Art Counselor 호환 스키마 생성 완료!';
  RAISE NOTICE '📊 생성된 테이블:';
  RAISE NOTICE '  - artworks (UUID 기반)';
  RAISE NOTICE '  - art_journals (사용자 감상 기록)';
  RAISE NOTICE '  - user_art_journeys (사용자 여정)';
  RAISE NOTICE '  - daily_art_presentations (일일 작품)';
  RAISE NOTICE '🔗 기존 users 테이블과 호환';
END $$;
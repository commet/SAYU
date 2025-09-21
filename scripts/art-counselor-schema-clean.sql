-- SAYU Art Counselor Database Schema (Clean Version)
-- Supabase SQL Editor에서 실행해주세요

-- 1. artworks 테이블 생성
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
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
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. art_journals 테이블 생성
CREATE TABLE IF NOT EXISTS art_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id TEXT REFERENCES artworks(id),
  first_impression TEXT,
  personal_connection TEXT,
  new_discovery TEXT,
  question_to_artist TEXT,
  mood_tags TEXT[],
  color_selections TEXT[],
  weather_data JSONB,
  time_of_day TEXT,
  session_number INTEGER DEFAULT 1,
  emotion_vector TEXT,
  writing_style JSONB,
  growth_indicators JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_art_journeys 테이블 생성
CREATE TABLE IF NOT EXISTS user_art_journeys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_artworks INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  favorite_artists TEXT[],
  emotional_evolution JSONB DEFAULT '{}',
  preference_patterns JSONB DEFAULT '{}',
  special_moments JSONB[],
  last_viewed_artworks TEXT[],
  last_journal_entry TIMESTAMPTZ,
  next_recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. daily_art_presentations 테이블 생성
CREATE TABLE IF NOT EXISTS daily_art_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id TEXT REFERENCES artworks(id),
  presented_at TIMESTAMPTZ DEFAULT NOW(),
  selection_reason TEXT,
  engagement_level TEXT,
  journal_created BOOLEAN DEFAULT FALSE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_art_journals_user ON art_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_artwork ON art_journals(artwork_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_created ON art_journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_art_user ON daily_art_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_art_date ON daily_art_presentations(presented_at);

-- RLS 정책 설정
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_art_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_art_presentations ENABLE ROW LEVEL SECURITY;

-- artworks 정책
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON artworks;
CREATE POLICY "Artworks are viewable by everyone" ON artworks
  FOR SELECT USING (true);

-- art_journals 정책
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
INSERT INTO artworks (id, title, title_en, artist, artist_en, year, medium, dimensions, location, style, image_url) VALUES
('starry-night', '별이 빛나는 밤', 'The Starry Night', '빈센트 반 고흐', 'Vincent van Gogh', 1889, '유화', '73.7 × 92.1 cm', '뉴욕 현대미술관', '포스트 인상주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'),
('water-lilies', '수련', 'Water Lilies', '클로드 모네', 'Claude Monet', 1906, '유화', '89.9 × 94.1 cm', '시카고 미술관', '인상주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'),
('the-kiss', '키스', 'The Kiss', '구스타프 클림트', 'Gustav Klimt', 1908, '유화, 금박', '180 × 180 cm', '벨베데레 궁전', '아르누보', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg/1280px-Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg'),
('the-scream', '절규', 'The Scream', '에드바르 뭉크', 'Edvard Munch', 1893, '유화, 템페라, 파스텔', '91 × 73.5 cm', '노르웨이 국립미술관', '표현주의', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'),
('girl-with-pearl', '진주 귀걸이를 한 소녀', 'Girl with a Pearl Earring', '요하네스 페르메이르', 'Johannes Vermeer', 1665, '유화', '44.5 × 39 cm', '마우리츠하위스 미술관', '바로크', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg')
ON CONFLICT (id) DO NOTHING;

-- 완료 알림
SELECT
  'Art Counselor 테이블 생성 완료!' as message,
  (SELECT COUNT(*) FROM artworks) as artworks_count;
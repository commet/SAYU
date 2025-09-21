-- SAYU Art Counselor Minimal Schema
-- 테이블만 생성, 데이터는 나중에 추가

-- 1. artworks 테이블
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  artist TEXT NOT NULL,
  artist_en TEXT,
  medium TEXT,
  dimensions TEXT,
  location TEXT,
  style TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. art_journals 테이블
CREATE TABLE IF NOT EXISTS art_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
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

-- 3. user_art_journeys 테이블
CREATE TABLE IF NOT EXISTS user_art_journeys (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_artworks INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  favorite_artists TEXT[],
  emotional_evolution JSONB DEFAULT '{}',
  preference_patterns JSONB DEFAULT '{}',
  special_moments JSONB[],
  last_viewed_artworks UUID[],
  last_journal_entry TIMESTAMPTZ,
  next_recommendations UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. daily_art_presentations 테이블
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
CREATE INDEX IF NOT EXISTS idx_art_journals_user ON art_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_artwork ON art_journals(artwork_id);
CREATE INDEX IF NOT EXISTS idx_art_journals_created ON art_journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_art_user ON daily_art_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_art_date ON daily_art_presentations(presented_at);

-- RLS 정책
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_art_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_art_presentations ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON artworks;
CREATE POLICY "Artworks are viewable by everyone" ON artworks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own journals" ON art_journals;
CREATE POLICY "Users can view own journals" ON art_journals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own journals" ON art_journals;
CREATE POLICY "Users can create own journals" ON art_journals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journals" ON art_journals;
CREATE POLICY "Users can update own journals" ON art_journals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own journey" ON user_art_journeys;
CREATE POLICY "Users can view own journey" ON user_art_journeys FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journey" ON user_art_journeys;
CREATE POLICY "Users can manage own journey" ON user_art_journeys FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own presentations" ON daily_art_presentations;
CREATE POLICY "Users can view own presentations" ON daily_art_presentations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create presentations" ON daily_art_presentations;
CREATE POLICY "System can create presentations" ON daily_art_presentations FOR INSERT WITH CHECK (true);

-- 완료 메시지
SELECT 'SAYU Art Counselor 테이블 생성 완료!' as message;
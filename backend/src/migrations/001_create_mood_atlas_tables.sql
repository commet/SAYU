-- ============================================================================
-- Mood Atlas 데이터베이스 스키마
-- ============================================================================
-- 생성일: 2025-01-07
-- 설명: 일일 감정 기록 및 예술 작품 추천 시스템
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. mood_atlas_regions (예술 대륙/지역 정의)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mood_atlas_regions (
  id VARCHAR(50) PRIMARY KEY,
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,

  -- 순서 및 잠금 조건
  day_start INT NOT NULL,
  day_end INT NOT NULL,
  total_tiles INT NOT NULL,

  -- 비주얼
  icon TEXT,
  primary_color VARCHAR(20),
  theme_colors TEXT[],

  -- 설명
  description_ko TEXT,
  description_en TEXT,

  -- 대표 작가/작품
  featured_artists TEXT[],

  -- 감정 연결
  emotion_affinity TEXT[], -- ['blue', 'green']

  -- 보상
  completion_reward JSONB,

  -- 분기 정보
  prerequisite VARCHAR(50),
  branch_group INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_regions_day_range ON mood_atlas_regions(day_start, day_end);
CREATE INDEX IF NOT EXISTS idx_regions_prerequisite ON mood_atlas_regions(prerequisite);

COMMENT ON TABLE mood_atlas_regions IS '7개 예술 대륙/지역 정의';
COMMENT ON COLUMN mood_atlas_regions.day_start IS '지역 시작 일수 (예: 1)';
COMMENT ON COLUMN mood_atlas_regions.day_end IS '지역 종료 일수 (예: 10)';
COMMENT ON COLUMN mood_atlas_regions.total_tiles IS '지역 내 총 타일 수';
COMMENT ON COLUMN mood_atlas_regions.emotion_affinity IS '이 지역과 어울리는 감정 색상 배열';

-- ----------------------------------------------------------------------------
-- 2. mood_atlas_artworks (작품 데이터)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mood_atlas_artworks (
  id TEXT PRIMARY KEY,

  -- 기본 정보
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(100) NOT NULL,
  year VARCHAR(20),

  -- 이미지
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INT,
  height INT,

  -- 분류
  region VARCHAR(50) REFERENCES mood_atlas_regions(id) ON DELETE CASCADE,
  art_movement VARCHAR(100),

  -- 감정 매칭 (18가지 감정별 메시지)
  emotions JSONB NOT NULL,

  -- 스토리텔링
  story TEXT,
  fun_fact TEXT,

  -- 메타
  tags TEXT[],
  match_score INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_region ON mood_atlas_artworks(region);
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON mood_atlas_artworks(artist);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON mood_atlas_artworks USING GIN(tags);

COMMENT ON TABLE mood_atlas_artworks IS '감정별 추천 작품 데이터';
COMMENT ON COLUMN mood_atlas_artworks.emotions IS '18가지 감정별 추천 메시지 (blue-light, blue-medium, blue-deep, red-light, ...)';
COMMENT ON COLUMN mood_atlas_artworks.story IS '작가/작품 스토리 (사용자 몰입)';
COMMENT ON COLUMN mood_atlas_artworks.fun_fact IS '재미있는 사실 (흥미 유발)';

-- ----------------------------------------------------------------------------
-- 3. mood_atlas_entries (일일 감정 기록)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mood_atlas_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 감정 데이터
  emotion_color VARCHAR(20) NOT NULL, -- 'blue', 'red', 'yellow', 'purple', 'green', 'gray'
  emotion_intensity INT NOT NULL CHECK (emotion_intensity >= 0 AND emotion_intensity <= 100),
  emotion_label TEXT, -- "연한 파랑", "진한 빨강"

  -- 복합 감정 (고급 기능, 7일+ 사용자)
  is_complex BOOLEAN DEFAULT false,
  color_secondary VARCHAR(20),

  -- AI 추천 작품
  recommended_artworks JSONB, -- [{ artworkId, title, artist, reason }]
  selected_artwork_id TEXT NOT NULL REFERENCES mood_atlas_artworks(id),
  selected_artwork_data JSONB, -- 작품 전체 정보 스냅샷

  -- 사용자 메모
  user_memo TEXT,

  -- 위치 정보 (어느 대륙)
  region VARCHAR(50) NOT NULL REFERENCES mood_atlas_regions(id),
  tile_number INT, -- 해당 지역 내 타일 번호

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE NOT NULL,

  UNIQUE(user_id, date) -- 하루 1회만 기록
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON mood_atlas_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_region ON mood_atlas_entries(region);
CREATE INDEX IF NOT EXISTS idx_entries_emotion ON mood_atlas_entries(emotion_color);
CREATE INDEX IF NOT EXISTS idx_entries_created ON mood_atlas_entries(created_at DESC);

COMMENT ON TABLE mood_atlas_entries IS '사용자별 일일 감정 기록';
COMMENT ON COLUMN mood_atlas_entries.emotion_intensity IS '감정 강도 (0-100): 0-30 연한, 40-60 중간, 70-100 진한';
COMMENT ON COLUMN mood_atlas_entries.is_complex IS '7일+ 사용자 복합 감정 해금 여부';
COMMENT ON COLUMN mood_atlas_entries.recommended_artworks IS 'AI가 추천한 3개 작품 목록';

-- ----------------------------------------------------------------------------
-- 4. mood_atlas_progress (사용자별 진행 상황)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mood_atlas_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 현재 위치
  current_region VARCHAR(50) NOT NULL DEFAULT 'renaissance' REFERENCES mood_atlas_regions(id),
  current_day INT DEFAULT 0,

  -- 완료한 지역들
  completed_regions TEXT[] DEFAULT '{}',

  -- 스트릭 (연속 기록)
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_entries INT DEFAULT 0,
  last_entry_date DATE,

  -- 획득한 뱃지/칭호
  badges_earned JSONB DEFAULT '[]',
  titles_earned TEXT[] DEFAULT '{}',

  -- 통계
  total_tiles_filled INT DEFAULT 0,
  color_distribution JSONB DEFAULT '{}', -- { "blue": 15, "red": 8, ... }

  -- 고급 기능 해금
  complex_emotion_unlocked BOOLEAN DEFAULT false, -- 7일+
  triple_emotion_unlocked BOOLEAN DEFAULT false,  -- 30일+

  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_progress_region ON mood_atlas_progress(current_region);
CREATE INDEX IF NOT EXISTS idx_progress_streak ON mood_atlas_progress(current_streak DESC);

COMMENT ON TABLE mood_atlas_progress IS '사용자별 Mood Atlas 진행 상황 및 통계';
COMMENT ON COLUMN mood_atlas_progress.current_streak IS '현재 연속 기록 일수';
COMMENT ON COLUMN mood_atlas_progress.color_distribution IS '감정 색상별 기록 횟수 통계';

-- ----------------------------------------------------------------------------
-- RLS (Row Level Security) 정책
-- ----------------------------------------------------------------------------

-- mood_atlas_entries RLS
ALTER TABLE mood_atlas_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own entries" ON mood_atlas_entries;
CREATE POLICY "Users can view own entries" ON mood_atlas_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON mood_atlas_entries;
CREATE POLICY "Users can insert own entries" ON mood_atlas_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON mood_atlas_entries;
CREATE POLICY "Users can update own entries" ON mood_atlas_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- mood_atlas_progress RLS
ALTER TABLE mood_atlas_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON mood_atlas_progress;
CREATE POLICY "Users can view own progress" ON mood_atlas_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON mood_atlas_progress;
CREATE POLICY "Users can insert own progress" ON mood_atlas_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON mood_atlas_progress;
CREATE POLICY "Users can update own progress" ON mood_atlas_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- mood_atlas_regions & mood_atlas_artworks는 모두 읽기 가능
ALTER TABLE mood_atlas_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view regions" ON mood_atlas_regions;
CREATE POLICY "Anyone can view regions" ON mood_atlas_regions
  FOR SELECT USING (true);

ALTER TABLE mood_atlas_artworks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view artworks" ON mood_atlas_artworks;
CREATE POLICY "Anyone can view artworks" ON mood_atlas_artworks
  FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 완료
-- ----------------------------------------------------------------------------
-- ✅ 4개 테이블 생성 완료
-- ✅ 인덱스 최적화 완료
-- ✅ RLS 정책 설정 완료
--
-- 다음 단계:
-- 1. 002_insert_mood_atlas_regions.sql (7개 지역 데이터)
-- 2. 003_insert_mood_atlas_artworks.sql (작품 데이터)
-- ----------------------------------------------------------------------------

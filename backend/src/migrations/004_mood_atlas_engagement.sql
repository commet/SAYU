-- ============================================================================
-- SAYU Mood Atlas Engagement Schema (artwork interactions & counseling data)
-- ============================================================================
-- Run with: psql $DATABASE_URL -f backend/src/migrations/004_mood_atlas_engagement.sql
-- ============================================================================

-- 1) Artwork interaction logs -------------------------------------------------
CREATE TABLE IF NOT EXISTS artwork_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL,
  visual_touches JSONB NOT NULL DEFAULT '[]'::jsonb,
  color_selections TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  feeling_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  dominant_area TEXT,
  dominant_colors TEXT[],
  interaction_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artwork_interactions_user
  ON artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_artwork
  ON artwork_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_created
  ON artwork_interactions(created_at DESC);

CREATE OR REPLACE FUNCTION touch_artwork_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artwork_interactions_updated_at ON artwork_interactions;
CREATE TRIGGER trg_artwork_interactions_updated_at
BEFORE UPDATE ON artwork_interactions
FOR EACH ROW EXECUTE FUNCTION touch_artwork_interactions_updated_at();

-- 2) Counselor conversation history ------------------------------------------
CREATE TABLE IF NOT EXISTS counselor_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES artwork_interactions(id) ON DELETE SET NULL,
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('opening', 'connection', 'complete')),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  insights TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counselor_conversations_entry
  ON counselor_conversations(entry_id);
CREATE INDEX IF NOT EXISTS idx_counselor_conversations_stage
  ON counselor_conversations(stage);

-- 3) Information layer views --------------------------------------------------
CREATE TABLE IF NOT EXISTS info_layer_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES mood_atlas_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  layer_name VARCHAR(50) NOT NULL CHECK (
    layer_name IN ('basic', 'artist_story', 'historical_context', 'technique', 'symbolism')
  ),
  highlighted_sections JSONB DEFAULT '[]'::jsonb,
  time_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_info_layer_views_entry
  ON info_layer_views(entry_id);
CREATE INDEX IF NOT EXISTS idx_info_layer_views_user
  ON info_layer_views(user_id);

-- 4) Memo suggestions ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS memo_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  questions JSONB,
  related_entries UUID[],
  connection_reason TEXT,
  used_questions TEXT[],
  used_connections BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memo_suggestions_entry
  ON memo_suggestions(entry_id);

-- 5) User characters (Phase 2 ready) -----------------------------------------
CREATE TABLE IF NOT EXISTS user_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  region_id VARCHAR(50) REFERENCES mood_atlas_regions(id),
  character_name VARCHAR(100),
  character_name_ko VARCHAR(100),
  character_type VARCHAR(50),
  space TEXT,
  time TEXT,
  character_entity TEXT,
  character_icon TEXT,
  character_image_url TEXT,
  description TEXT,
  birth_story TEXT,
  personality_traits TEXT[],
  favorite_things TEXT[],
  speaking_style TEXT,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  creation_data JSONB,
  is_representative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, region_id)
);

CREATE INDEX IF NOT EXISTS idx_user_characters_user
  ON user_characters(user_id);

-- 6) Emotion capsules (P2P) ---------------------------------------------------
CREATE TABLE IF NOT EXISTS emotion_capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entry_id UUID REFERENCES mood_atlas_entries(id) ON DELETE SET NULL,
  emotion_color VARCHAR(20),
  emotion_label TEXT,
  artwork_id TEXT,
  artwork_title TEXT,
  artwork_artist TEXT,
  message TEXT CHECK (char_length(message) <= 120),
  is_public BOOLEAN DEFAULT true,
  delivery_delay_days INT DEFAULT 3,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_character_id UUID REFERENCES user_characters(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotion_capsules_sender
  ON emotion_capsules(sender_id);
CREATE INDEX IF NOT EXISTS idx_emotion_capsules_recipient
  ON emotion_capsules(recipient_id);
CREATE INDEX IF NOT EXISTS idx_emotion_capsules_status
  ON emotion_capsules(status);

CREATE TABLE IF NOT EXISTS capsule_delivery_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES emotion_capsules(id) ON DELETE CASCADE,
  scheduled_delivery TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capsule_delivery_schedule
  ON capsule_delivery_queue(scheduled_delivery);
CREATE INDEX IF NOT EXISTS idx_capsule_delivery_status
  ON capsule_delivery_queue(status);

-- 7) Extend mood_atlas_entries ------------------------------------------------
ALTER TABLE mood_atlas_entries
  ADD COLUMN IF NOT EXISTS interaction_id UUID REFERENCES artwork_interactions(id),
  ADD COLUMN IF NOT EXISTS interaction_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS counselor_insights TEXT[],
  ADD COLUMN IF NOT EXISTS info_layers_viewed TEXT[],
  ADD COLUMN IF NOT EXISTS info_exploration_time INT,
  ADD COLUMN IF NOT EXISTS memo_word_count INT,
  ADD COLUMN IF NOT EXISTS memo_used_suggestions BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS memo_connected_to_past BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS point_breakdown JSONB;

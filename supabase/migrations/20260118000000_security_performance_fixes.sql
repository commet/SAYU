-- Security & Performance Migration
-- Date: 2026-01-18
-- Purpose: Enable RLS on sensitive tables, add missing indexes, fix Worldcup RLS

-- ============================================
-- SECTION 1: ENABLE RLS ON SENSITIVE TABLES
-- ============================================

-- Enable RLS on artworks (allow public read)
ALTER TABLE IF EXISTS artworks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read artworks" ON artworks;
CREATE POLICY "Public read artworks" ON artworks FOR SELECT USING (true);

-- Enable RLS on exhibitions (allow public read)
ALTER TABLE IF EXISTS exhibitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read exhibitions" ON exhibitions;
CREATE POLICY "Public read exhibitions" ON exhibitions FOR SELECT USING (true);

-- Enable RLS on venues (allow public read)
ALTER TABLE IF EXISTS venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read venues" ON venues;
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);

-- Enable RLS on emotion_vectors (owner only)
ALTER TABLE IF EXISTS emotion_vectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own emotion vectors" ON emotion_vectors;
CREATE POLICY "Users view own emotion vectors" ON emotion_vectors
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own emotion vectors" ON emotion_vectors;
CREATE POLICY "Users insert own emotion vectors" ON emotion_vectors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable RLS on art_profile_generations (owner only)
ALTER TABLE IF EXISTS art_profile_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own generations" ON art_profile_generations;
CREATE POLICY "Users view own generations" ON art_profile_generations
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own generations" ON art_profile_generations;
CREATE POLICY "Users insert own generations" ON art_profile_generations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable RLS on artwork_interactions (owner only)
ALTER TABLE IF EXISTS artwork_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own interactions" ON artwork_interactions;
CREATE POLICY "Users view own interactions" ON artwork_interactions
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own interactions" ON artwork_interactions;
CREATE POLICY "Users manage own interactions" ON artwork_interactions
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- SECTION 2: FIX WORLDCUP RLS (Prevent Cheating)
-- ============================================

-- Remove dangerous UPDATE policy on matches
DROP POLICY IF EXISTS "Users can update their matches" ON exhibition_worldcup_matches;

-- Create restricted UPDATE policy (only winner_id can be set, not changed)
DROP POLICY IF EXISTS "Session owner can record match winner" ON exhibition_worldcup_matches;
CREATE POLICY "Session owner can record match winner" ON exhibition_worldcup_matches
  FOR UPDATE USING (
    -- Only allow if user owns the session
    EXISTS (
      SELECT 1 FROM exhibition_worldcup_sessions s
      WHERE s.id = session_id
      AND (s.user_id IS NULL OR s.user_id = auth.uid())
    )
    -- And winner hasn't been set yet (prevent changing results)
    AND winner_id IS NULL
  )
  WITH CHECK (
    -- Can only set winner_id, not modify other fields
    winner_id IS NOT NULL
  );

-- ============================================
-- SECTION 3: ADD MISSING INDEXES
-- ============================================

-- User Activities Timeline (HIGH PRIORITY)
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created
  ON user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type_created
  ON user_activities(activity_type, created_at DESC);

-- Gamification Leaderboards (HIGH PRIORITY)
CREATE INDEX IF NOT EXISTS idx_gamification_points_user_action
  ON gamification_points(user_id, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gamification_points_user_sum
  ON gamification_points(user_id);

-- Exhibition Discovery (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_exhibitions_status_dates
  ON exhibitions(status, start_date DESC, end_date);

-- Chat Performance (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
  ON chat_messages(conversation_id, created_at DESC);

-- Art Collections (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_art_collections_user_created
  ON art_collections(user_id, created_at DESC);

-- Exhibition Visits (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_status
  ON exhibition_visits(status, started_at DESC);

-- Quiz Results (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_quiz_results_personality_type
  ON quiz_results(personality_type, created_at DESC);

-- Art Memories (LOW PRIORITY)
CREATE INDEX IF NOT EXISTS idx_art_memories_exhibition_id
  ON art_memories(exhibition_id);

-- Perception Exchange Sessions (MEDIUM PRIORITY)
CREATE INDEX IF NOT EXISTS idx_perception_exchange_status
  ON perception_exchange_sessions(status, updated_at DESC);

-- Worldcup Matches Results (LOW PRIORITY)
CREATE INDEX IF NOT EXISTS idx_worldcup_matches_winner
  ON exhibition_worldcup_matches(winner_id) WHERE winner_id IS NOT NULL;

-- ============================================
-- SECTION 4: COMMENTS
-- ============================================
COMMENT ON POLICY "Session owner can record match winner" ON exhibition_worldcup_matches
  IS 'Prevents cheating by only allowing winner to be set once per match';

-- =============================================================================
-- Exhibition Worldcup Mode Extension
-- 전시 월드컵 모드 추가: 작품 vs 전시 이상형 월드컵
-- =============================================================================

-- 1. 세션에 mode 컬럼 추가 (artwork: 기존 작품 월드컵, exhibition: 전시 월드컵)
ALTER TABLE exhibition_worldcup_sessions
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'artwork'
  CHECK (mode IN ('artwork', 'exhibition'));

-- 2. 참가자 source_type에 'exhibition' 추가
-- 기존 CHECK 제약조건 제거 후 새로 추가
ALTER TABLE exhibition_worldcup_participants
  DROP CONSTRAINT IF EXISTS exhibition_worldcup_participants_source_type_check;

ALTER TABLE exhibition_worldcup_participants
  ADD CONSTRAINT exhibition_worldcup_participants_source_type_check
  CHECK (source_type IN ('uploaded', 'artwork', 'manual', 'exhibition'));

-- 3. 참가자에 전시 참조 컬럼 추가
ALTER TABLE exhibition_worldcup_participants
  ADD COLUMN IF NOT EXISTS exhibition_ref_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL;

ALTER TABLE exhibition_worldcup_participants
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. 전시 참가자 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_participants_exhibition_ref
  ON exhibition_worldcup_participants(exhibition_ref_id)
  WHERE exhibition_ref_id IS NOT NULL;

-- 5. 세션 mode 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_sessions_mode
  ON exhibition_worldcup_sessions(mode);

DO $$
BEGIN
  RAISE NOTICE '=== EXHIBITION WORLDCUP MODE MIGRATION COMPLETE ===';
  RAISE NOTICE 'Added: sessions.mode, participants.exhibition_ref_id, participants.description';
END $$;

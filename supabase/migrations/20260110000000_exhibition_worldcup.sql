-- =============================================================================
-- SAYU Exhibition Worldcup System
-- 전시 월드컵 - 내가 가장 좋아하는 작품 토너먼트
-- MVP Phase 1: 업로드/검색, 토너먼트 진행, 결과 공유
-- =============================================================================

-- 1. 월드컵 세션 테이블
CREATE TABLE IF NOT EXISTS exhibition_worldcup_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 사용자 (NULL 허용 - 비로그인 사용자도 가능)
    user_id UUID,

    -- 전시 연동 (선택)
    exhibition_visit_id UUID REFERENCES exhibition_visits(id) ON DELETE SET NULL,
    exhibition_id UUID,

    -- 설정
    round_type INTEGER NOT NULL CHECK (round_type IN (8, 16, 32, 64)),

    -- 상태
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'completed', 'abandoned')),
    current_match_index INTEGER DEFAULT 0,
    total_matches INTEGER,

    -- 결과
    winner_participant_id UUID,

    -- 타이밍
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 참가 작품 테이블
CREATE TABLE IF NOT EXISTS exhibition_worldcup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

    -- 작품 소스
    source_type TEXT NOT NULL CHECK (source_type IN ('uploaded', 'artwork', 'manual')),

    -- DB 작품 참조 (artwork 타입)
    artwork_id UUID REFERENCES exhibition_artworks(id) ON DELETE SET NULL,

    -- 업로드 이미지 (uploaded 타입)
    temp_image_url TEXT,
    temp_image_path TEXT,

    -- 작품 정보 (manual 또는 uploaded 타입)
    title TEXT,
    artist TEXT,
    image_url TEXT, -- artwork_id가 있으면 artwork의 image_url 사용

    -- 토너먼트 상태
    seed_position INTEGER NOT NULL,
    eliminated_round INTEGER, -- 탈락한 라운드 (NULL = 아직 진행 중 또는 우승)
    final_rank INTEGER, -- 최종 순위 (1, 2, 3, 4 등)

    -- 통계
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 매치 기록 테이블
CREATE TABLE IF NOT EXISTS exhibition_worldcup_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

    -- 매치 정보
    match_index INTEGER NOT NULL, -- 전체 매치 순서 (0부터 시작)
    round INTEGER NOT NULL, -- 라운드 번호 (1=결승, 2=4강, 3=8강...)
    round_match_index INTEGER NOT NULL, -- 해당 라운드 내 매치 순서

    -- 참가자
    participant_a_id UUID NOT NULL REFERENCES exhibition_worldcup_participants(id) ON DELETE CASCADE,
    participant_b_id UUID NOT NULL REFERENCES exhibition_worldcup_participants(id) ON DELETE CASCADE,

    -- 결과
    winner_id UUID REFERENCES exhibition_worldcup_participants(id),

    -- 선택 정보
    decision_time_ms INTEGER, -- 결정까지 걸린 시간 (밀리초)

    -- 타임스탬프
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 임시 이미지 테이블 (24시간 자동 삭제)
CREATE TABLE IF NOT EXISTS temp_worldcup_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

    -- 이미지 정보
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    original_filename TEXT,
    file_size_bytes INTEGER,

    -- 저장 동의
    user_consented BOOLEAN DEFAULT false,

    -- 만료
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 공유된 결과 테이블
CREATE TABLE IF NOT EXISTS exhibition_worldcup_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

    -- 공유 정보
    share_code TEXT UNIQUE NOT NULL, -- 짧은 공유 코드
    share_type TEXT NOT NULL CHECK (share_type IN ('link', 'image')),

    -- 조회수
    view_count INTEGER DEFAULT 0,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 인덱스
-- =============================================================================

-- 세션 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_sessions_user
    ON exhibition_worldcup_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worldcup_sessions_status
    ON exhibition_worldcup_sessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worldcup_sessions_exhibition_visit
    ON exhibition_worldcup_sessions(exhibition_visit_id) WHERE exhibition_visit_id IS NOT NULL;

-- 참가자 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_participants_session
    ON exhibition_worldcup_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_worldcup_participants_seed
    ON exhibition_worldcup_participants(session_id, seed_position);
CREATE INDEX IF NOT EXISTS idx_worldcup_participants_artwork
    ON exhibition_worldcup_participants(artwork_id) WHERE artwork_id IS NOT NULL;

-- 매치 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_matches_session
    ON exhibition_worldcup_matches(session_id, match_index);
CREATE INDEX IF NOT EXISTS idx_worldcup_matches_round
    ON exhibition_worldcup_matches(session_id, round);

-- 임시 이미지 인덱스
CREATE INDEX IF NOT EXISTS idx_temp_worldcup_images_session
    ON temp_worldcup_images(session_id);
CREATE INDEX IF NOT EXISTS idx_temp_worldcup_images_expires
    ON temp_worldcup_images(expires_at) WHERE expires_at > NOW();

-- 공유 인덱스
CREATE INDEX IF NOT EXISTS idx_worldcup_shares_code
    ON exhibition_worldcup_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_worldcup_shares_session
    ON exhibition_worldcup_shares(session_id);

-- =============================================================================
-- 트리거
-- =============================================================================

-- updated_at 자동 업데이트
CREATE TRIGGER update_worldcup_sessions_updated_at
    BEFORE UPDATE ON exhibition_worldcup_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RLS (Row Level Security)
-- =============================================================================

ALTER TABLE exhibition_worldcup_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_worldcup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_worldcup_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_worldcup_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_worldcup_shares ENABLE ROW LEVEL SECURITY;

-- 세션: 비로그인도 생성 가능, 로그인 사용자는 자신의 세션만 수정 가능
CREATE POLICY "Anyone can create worldcup sessions"
    ON exhibition_worldcup_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read worldcup sessions"
    ON exhibition_worldcup_sessions FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own sessions"
    ON exhibition_worldcup_sessions FOR UPDATE
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own sessions"
    ON exhibition_worldcup_sessions FOR DELETE
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

-- 참가자: 세션의 소유자만 관리
CREATE POLICY "Anyone can read participants"
    ON exhibition_worldcup_participants FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create participants"
    ON exhibition_worldcup_participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exhibition_worldcup_sessions s
            WHERE s.id = session_id
            AND (s.user_id IS NULL OR auth.uid()::text = s.user_id::text)
        )
    );

CREATE POLICY "Users can update their participants"
    ON exhibition_worldcup_participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM exhibition_worldcup_sessions s
            WHERE s.id = session_id
            AND (s.user_id IS NULL OR auth.uid()::text = s.user_id::text)
        )
    );

-- 매치: 세션의 소유자만 관리
CREATE POLICY "Anyone can read matches"
    ON exhibition_worldcup_matches FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create matches"
    ON exhibition_worldcup_matches FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exhibition_worldcup_sessions s
            WHERE s.id = session_id
            AND (s.user_id IS NULL OR auth.uid()::text = s.user_id::text)
        )
    );

CREATE POLICY "Users can update their matches"
    ON exhibition_worldcup_matches FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM exhibition_worldcup_sessions s
            WHERE s.id = session_id
            AND (s.user_id IS NULL OR auth.uid()::text = s.user_id::text)
        )
    );

-- 임시 이미지
CREATE POLICY "Anyone can manage temp images"
    ON temp_worldcup_images FOR ALL
    USING (true)
    WITH CHECK (true);

-- 공유
CREATE POLICY "Anyone can read shares"
    ON exhibition_worldcup_shares FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create shares"
    ON exhibition_worldcup_shares FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exhibition_worldcup_sessions s
            WHERE s.id = session_id
        )
    );

CREATE POLICY "Anyone can update share view count"
    ON exhibition_worldcup_shares FOR UPDATE
    USING (true);

-- =============================================================================
-- 유틸리티 함수
-- =============================================================================

-- 공유 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 총 매치 수 계산 함수
CREATE OR REPLACE FUNCTION calculate_total_matches(round_type INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 8강: 7매치 (4+2+1), 16강: 15매치, 32강: 31매치, 64강: 63매치
    RETURN round_type - 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 토너먼트 브래킷 생성 함수
CREATE OR REPLACE FUNCTION create_worldcup_bracket(p_session_id UUID)
RETURNS void AS $$
DECLARE
    v_round_type INTEGER;
    v_participants UUID[];
    v_participant_count INTEGER;
    v_round INTEGER;
    v_match_index INTEGER := 0;
    v_round_match_index INTEGER;
    v_i INTEGER;
BEGIN
    -- 세션 정보 가져오기
    SELECT round_type INTO v_round_type
    FROM exhibition_worldcup_sessions
    WHERE id = p_session_id;

    -- 참가자 목록 (seed_position 순서로)
    SELECT ARRAY_AGG(id ORDER BY seed_position)
    INTO v_participants
    FROM exhibition_worldcup_participants
    WHERE session_id = p_session_id;

    v_participant_count := array_length(v_participants, 1);

    -- 참가자 수 검증
    IF v_participant_count != v_round_type THEN
        RAISE EXCEPTION 'Participant count (%) does not match round type (%)', v_participant_count, v_round_type;
    END IF;

    -- 첫 번째 라운드 매치 생성 (예: 32강이면 round = 5, 즉 log2(32))
    v_round := log(2, v_round_type)::INTEGER;
    v_round_match_index := 0;

    FOR v_i IN 1..(v_participant_count / 2) LOOP
        INSERT INTO exhibition_worldcup_matches (
            session_id, match_index, round, round_match_index,
            participant_a_id, participant_b_id
        ) VALUES (
            p_session_id,
            v_match_index,
            v_round,
            v_round_match_index,
            v_participants[(v_i - 1) * 2 + 1],
            v_participants[(v_i - 1) * 2 + 2]
        );

        v_match_index := v_match_index + 1;
        v_round_match_index := v_round_match_index + 1;
    END LOOP;

    -- 세션 업데이트
    UPDATE exhibition_worldcup_sessions
    SET
        status = 'in_progress',
        total_matches = calculate_total_matches(v_round_type),
        started_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- 매치 결과 처리 및 다음 라운드 생성 함수
CREATE OR REPLACE FUNCTION process_match_result(
    p_match_id UUID,
    p_winner_id UUID,
    p_decision_time_ms INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_match exhibition_worldcup_matches%ROWTYPE;
    v_session exhibition_worldcup_sessions%ROWTYPE;
    v_loser_id UUID;
    v_next_round INTEGER;
    v_next_round_match_index INTEGER;
    v_existing_next_match UUID;
    v_result JSONB;
BEGIN
    -- 매치 정보 가져오기
    SELECT * INTO v_match FROM exhibition_worldcup_matches WHERE id = p_match_id;

    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;

    -- 세션 정보 가져오기
    SELECT * INTO v_session FROM exhibition_worldcup_sessions WHERE id = v_match.session_id;

    -- 패자 결정
    IF p_winner_id = v_match.participant_a_id THEN
        v_loser_id := v_match.participant_b_id;
    ELSE
        v_loser_id := v_match.participant_a_id;
    END IF;

    -- 매치 업데이트
    UPDATE exhibition_worldcup_matches
    SET
        winner_id = p_winner_id,
        decision_time_ms = p_decision_time_ms,
        completed_at = NOW()
    WHERE id = p_match_id;

    -- 참가자 통계 업데이트
    UPDATE exhibition_worldcup_participants
    SET
        total_matches = total_matches + 1,
        wins = wins + 1
    WHERE id = p_winner_id;

    UPDATE exhibition_worldcup_participants
    SET
        total_matches = total_matches + 1,
        eliminated_round = v_match.round
    WHERE id = v_loser_id;

    -- 세션 현재 매치 업데이트
    UPDATE exhibition_worldcup_sessions
    SET current_match_index = current_match_index + 1
    WHERE id = v_match.session_id;

    -- 다음 라운드 처리
    v_next_round := v_match.round - 1;

    -- 결승이었으면 토너먼트 종료
    IF v_next_round = 0 THEN
        -- 최종 순위 설정
        UPDATE exhibition_worldcup_participants
        SET final_rank = 1
        WHERE id = p_winner_id;

        UPDATE exhibition_worldcup_participants
        SET final_rank = 2
        WHERE id = v_loser_id;

        -- 4강 패자들에게 공동 3위 부여
        UPDATE exhibition_worldcup_participants
        SET final_rank = 3
        WHERE session_id = v_match.session_id
        AND eliminated_round = 2;

        -- 세션 완료
        UPDATE exhibition_worldcup_sessions
        SET
            status = 'completed',
            winner_participant_id = p_winner_id,
            completed_at = NOW(),
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
        WHERE id = v_match.session_id;

        v_result := jsonb_build_object(
            'completed', true,
            'winner_id', p_winner_id
        );
    ELSE
        -- 다음 라운드 매치 확인/생성
        v_next_round_match_index := v_match.round_match_index / 2;

        -- 같은 라운드의 짝 매치가 완료되었는지 확인
        SELECT id INTO v_existing_next_match
        FROM exhibition_worldcup_matches
        WHERE session_id = v_match.session_id
        AND round = v_next_round
        AND round_match_index = v_next_round_match_index;

        IF v_existing_next_match IS NOT NULL THEN
            -- 이미 다음 라운드 매치가 있으면 업데이트
            IF v_match.round_match_index % 2 = 0 THEN
                UPDATE exhibition_worldcup_matches
                SET participant_a_id = p_winner_id
                WHERE id = v_existing_next_match;
            ELSE
                UPDATE exhibition_worldcup_matches
                SET participant_b_id = p_winner_id
                WHERE id = v_existing_next_match;
            END IF;
        ELSE
            -- 새 매치 생성 (첫 번째 승자)
            INSERT INTO exhibition_worldcup_matches (
                session_id,
                match_index,
                round,
                round_match_index,
                participant_a_id,
                participant_b_id
            ) VALUES (
                v_match.session_id,
                (SELECT COALESCE(MAX(match_index), -1) + 1 FROM exhibition_worldcup_matches WHERE session_id = v_match.session_id),
                v_next_round,
                v_next_round_match_index,
                CASE WHEN v_match.round_match_index % 2 = 0 THEN p_winner_id ELSE NULL END,
                CASE WHEN v_match.round_match_index % 2 = 1 THEN p_winner_id ELSE NULL END
            );
        END IF;

        v_result := jsonb_build_object(
            'completed', false,
            'next_round', v_next_round
        );
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 세션 랭킹 조회 함수
CREATE OR REPLACE FUNCTION get_worldcup_rankings(p_session_id UUID)
RETURNS TABLE (
    rank INTEGER,
    participant_id UUID,
    title TEXT,
    artist TEXT,
    image_url TEXT,
    source_type TEXT,
    wins INTEGER,
    total_matches INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.final_rank as rank,
        p.id as participant_id,
        COALESCE(p.title, ea.title) as title,
        COALESCE(p.artist, ea.artist) as artist,
        COALESCE(p.image_url, p.temp_image_url, ea.image_url) as image_url,
        p.source_type,
        p.wins,
        p.total_matches
    FROM exhibition_worldcup_participants p
    LEFT JOIN exhibition_artworks ea ON p.artwork_id = ea.id
    WHERE p.session_id = p_session_id
    AND p.final_rank IS NOT NULL
    ORDER BY p.final_rank ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- 만료된 임시 이미지 정리 함수 (Cron job용)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_worldcup_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM temp_worldcup_images
        WHERE expires_at < NOW()
        AND user_consented = false
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 마이그레이션 완료 확인
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== EXHIBITION WORLDCUP SYSTEM MIGRATION COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - exhibition_worldcup_sessions';
    RAISE NOTICE '  - exhibition_worldcup_participants';
    RAISE NOTICE '  - exhibition_worldcup_matches';
    RAISE NOTICE '  - temp_worldcup_images';
    RAISE NOTICE '  - exhibition_worldcup_shares';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - generate_share_code()';
    RAISE NOTICE '  - calculate_total_matches()';
    RAISE NOTICE '  - create_worldcup_bracket()';
    RAISE NOTICE '  - process_match_result()';
    RAISE NOTICE '  - get_worldcup_rankings()';
    RAISE NOTICE '  - cleanup_expired_worldcup_images()';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for Exhibition Worldcup MVP!';
END $$;

COMMIT;

-- =============================================================================
-- SAYU Exhibition Recording System
-- 전시 관람 및 작품 기록 시스템
-- MVP Phase 1: 관람 타이머, 작품 검색/기록, 감정 선택
-- =============================================================================

-- 1. 전시 내 작품 목록 테이블
CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 전시 연결 (unified system 사용)
    exhibition_id UUID NOT NULL,

    -- 작품 기본 정보
    title TEXT NOT NULL,
    title_en TEXT,
    artist TEXT NOT NULL,
    artist_en TEXT,
    year TEXT,
    medium TEXT,
    dimensions TEXT,
    description TEXT,
    description_en TEXT,

    -- 이미지
    image_url TEXT,
    thumbnail_url TEXT,

    -- Phase 2용 (사진 인식)
    image_hash TEXT, -- Perceptual hash for image recognition

    -- 전시 내 위치
    location_in_exhibition TEXT, -- "1층", "2층 중앙", "Room A" 등
    display_order INTEGER,

    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,

    -- 통계
    view_count INTEGER DEFAULT 0,
    record_count INTEGER DEFAULT 0, -- 이 작품을 기록한 사용자 수

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 사용자 전시 방문 기록 테이블
CREATE TABLE IF NOT EXISTS exhibition_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 사용자 및 전시
    user_id UUID NOT NULL,
    exhibition_id UUID NOT NULL,

    -- 타이밍
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN ended_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER / 60
            ELSE NULL
        END
    ) STORED,

    -- 상태
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'

    -- 메타데이터
    device_info JSONB DEFAULT '{}',
    notes TEXT,

    -- 오프라인 지원
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,

    -- 통계 (캐시)
    total_artworks_recorded INTEGER DEFAULT 0,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 개별 작품 기록 테이블
CREATE TABLE IF NOT EXISTS artwork_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 방문 및 작품 연결
    visit_id UUID NOT NULL REFERENCES exhibition_visits(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES exhibition_artworks(id) ON DELETE CASCADE,

    -- 타이밍
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sequence_number INTEGER, -- 이 방문에서 몇 번째 기록인지

    -- 감정 기록
    emotions TEXT[] NOT NULL, -- ['평온', '몽환', '강렬']
    emotion_text TEXT, -- 직접 입력한 감정 표현
    emotion_intensity INTEGER CHECK (emotion_intensity >= 1 AND emotion_intensity <= 10), -- 1-10

    -- 추가 메모 (선택사항)
    note TEXT,
    photo_url TEXT, -- 사용자가 찍은 사진 URL

    -- 인식 방법
    recognition_method TEXT DEFAULT 'search', -- 'photo', 'search', 'manual'
    recognition_confidence FLOAT, -- 사진 인식 신뢰도 (0-100)

    -- 오프라인 지원
    is_offline_record BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 유니크 제약조건 추가 (별도로 생성)
-- exhibition_artworks: 같은 전시에서 같은 작품(제목+작가)은 한 번만
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_artwork_per_exhibition
    ON exhibition_artworks(exhibition_id, title, artist);

-- exhibition_visits: 진행 중인 방문은 사용자당 전시당 1개만
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_visit
    ON exhibition_visits(user_id, exhibition_id)
    WHERE status = 'in_progress';

-- artwork_records: 같은 visit에서 같은 작품은 한 번만 기록
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_artwork_per_visit
    ON artwork_records(visit_id, artwork_id);

-- 5. 인덱스 생성 (성능 최적화)

-- exhibition_artworks 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_exhibition_id
    ON exhibition_artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_artist
    ON exhibition_artworks(artist);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_title
    ON exhibition_artworks USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_title_en
    ON exhibition_artworks USING gin(to_tsvector('simple', COALESCE(title_en, '')));
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_display_order
    ON exhibition_artworks(exhibition_id, display_order);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_image_hash
    ON exhibition_artworks(image_hash) WHERE image_hash IS NOT NULL;

-- exhibition_visits 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_id
    ON exhibition_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_exhibition_id
    ON exhibition_visits(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_status
    ON exhibition_visits(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_exhibition
    ON exhibition_visits(user_id, exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_started_at
    ON exhibition_visits(started_at DESC);

-- artwork_records 인덱스
CREATE INDEX IF NOT EXISTS idx_artwork_records_visit_id
    ON artwork_records(visit_id);
CREATE INDEX IF NOT EXISTS idx_artwork_records_artwork_id
    ON artwork_records(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_records_visit_sequence
    ON artwork_records(visit_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_artwork_records_recorded_at
    ON artwork_records(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_records_emotions
    ON artwork_records USING gin(emotions);

-- 6. 트리거 생성

-- updated_at 자동 업데이트 (함수는 이미 존재)
CREATE TRIGGER update_exhibition_artworks_updated_at
    BEFORE UPDATE ON exhibition_artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibition_visits_updated_at
    BEFORE UPDATE ON exhibition_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_records_updated_at
    BEFORE UPDATE ON artwork_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- artwork_records 추가 시 visit의 total_artworks_recorded 업데이트
CREATE OR REPLACE FUNCTION update_visit_artwork_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE exhibition_visits
        SET total_artworks_recorded = (
            SELECT COUNT(*)
            FROM artwork_records
            WHERE visit_id = NEW.visit_id
        )
        WHERE id = NEW.visit_id;

        -- sequence_number 자동 할당
        IF NEW.sequence_number IS NULL THEN
            NEW.sequence_number := (
                SELECT COALESCE(MAX(sequence_number), 0) + 1
                FROM artwork_records
                WHERE visit_id = NEW.visit_id
            );
        END IF;

        -- artwork의 record_count 증가
        UPDATE exhibition_artworks
        SET record_count = record_count + 1
        WHERE id = NEW.artwork_id;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE exhibition_visits
        SET total_artworks_recorded = (
            SELECT COUNT(*)
            FROM artwork_records
            WHERE visit_id = OLD.visit_id
        )
        WHERE id = OLD.visit_id;

        -- artwork의 record_count 감소
        UPDATE exhibition_artworks
        SET record_count = GREATEST(record_count - 1, 0)
        WHERE id = OLD.artwork_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visit_artwork_count_trigger
    AFTER INSERT OR DELETE ON artwork_records
    FOR EACH ROW EXECUTE FUNCTION update_visit_artwork_count();

-- 7. RLS (Row Level Security) 정책 설정 (옵션)
-- Supabase를 사용하는 경우 RLS 활성화
ALTER TABLE exhibition_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 작품 정보는 읽을 수 있음
CREATE POLICY "Anyone can read exhibition artworks"
    ON exhibition_artworks FOR SELECT
    USING (true);

-- 사용자는 자신의 방문 기록만 읽고 쓸 수 있음
CREATE POLICY "Users can read their own visits"
    ON exhibition_visits FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own visits"
    ON exhibition_visits FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own visits"
    ON exhibition_visits FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- 사용자는 자신의 작품 기록만 읽고 쓸 수 있음
CREATE POLICY "Users can read their own artwork records"
    ON artwork_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM exhibition_visits
            WHERE id = artwork_records.visit_id
            AND auth.uid()::text = user_id::text
        )
    );

CREATE POLICY "Users can create their own artwork records"
    ON artwork_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exhibition_visits
            WHERE id = artwork_records.visit_id
            AND auth.uid()::text = user_id::text
        )
    );

-- 8. 샘플 데이터 삽입 함수 (테스트용)
CREATE OR REPLACE FUNCTION insert_sample_exhibition_artworks(
    p_exhibition_id UUID,
    p_count INTEGER DEFAULT 10
)
RETURNS void AS $$
DECLARE
    i INTEGER;
    sample_artists TEXT[] := ARRAY[
        '빈센트 반 고흐', '클로드 모네', '파블로 피카소',
        '프리다 칼로', '레오나르도 다 빈치', '구스타프 클림트',
        '에드바르 뭉크', '살바도르 달리', '앤디 워홀', '요하네스 베르메르'
    ];
    sample_titles TEXT[] := ARRAY[
        '별이 빛나는 밤', '수련', '게르니카',
        '두 명의 프리다', '모나리자', '키스',
        '절규', '기억의 지속', '마릴린 먼로', '진주 귀걸이를 한 소녀'
    ];
BEGIN
    FOR i IN 1..LEAST(p_count, array_length(sample_artists, 1)) LOOP
        INSERT INTO exhibition_artworks (
            exhibition_id, title, artist, year, medium,
            description, display_order
        ) VALUES (
            p_exhibition_id,
            sample_titles[i],
            sample_artists[i],
            (1850 + (i * 10))::TEXT,
            CASE i % 3
                WHEN 0 THEN '캔버스에 유채'
                WHEN 1 THEN '종이에 수채'
                ELSE '혼합 매체'
            END,
            '테스트용 샘플 작품입니다.',
            i
        ) ON CONFLICT (exhibition_id, title, artist) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. 통계 뷰 생성 (대시보드용)
-- exhibition_visits 테이블만 사용하는 간단한 뷰 (exhibitions 테이블 의존성 제거)
CREATE OR REPLACE VIEW exhibition_visit_stats AS
SELECT
    ev.exhibition_id,
    COUNT(DISTINCT ev.user_id) as unique_visitors,
    COUNT(ev.id) as total_visits,
    AVG(ev.duration_minutes) as avg_duration_minutes,
    SUM(ev.total_artworks_recorded) as total_artworks_recorded,
    COUNT(ev.id) FILTER (WHERE ev.status = 'completed') as completed_visits,
    COUNT(ev.id) FILTER (WHERE ev.status = 'in_progress') as ongoing_visits
FROM exhibition_visits ev
GROUP BY ev.exhibition_id;

-- artwork_popularity 뷰
CREATE OR REPLACE VIEW artwork_popularity AS
SELECT
    ea.id as artwork_id,
    ea.title,
    ea.artist,
    ea.exhibition_id,
    ea.record_count,
    COUNT(ar.id) as total_records,
    -- 모든 감정을 배열로 수집 (중복 포함)
    ARRAY(
        SELECT DISTINCT e
        FROM artwork_records ar2
        CROSS JOIN LATERAL unnest(ar2.emotions) AS e
        WHERE ar2.artwork_id = ea.id
    ) as all_emotions,
    -- 가장 많이 선택된 감정 (단순화)
    (
        SELECT e
        FROM artwork_records ar2
        CROSS JOIN LATERAL unnest(ar2.emotions) AS e
        WHERE ar2.artwork_id = ea.id
        GROUP BY e
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) as most_common_emotion,
    AVG(ar.emotion_intensity) as avg_emotion_intensity
FROM exhibition_artworks ea
LEFT JOIN artwork_records ar ON ea.id = ar.artwork_id
GROUP BY ea.id, ea.title, ea.artist, ea.exhibition_id, ea.record_count;

-- 10. 유틸리티 함수

-- 진행 중인 방문 찾기
CREATE OR REPLACE FUNCTION get_active_visit(p_user_id UUID, p_exhibition_id UUID)
RETURNS UUID AS $$
    SELECT id
    FROM exhibition_visits
    WHERE user_id = p_user_id
    AND exhibition_id = p_exhibition_id
    AND status = 'in_progress'
    ORDER BY started_at DESC
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 작품 검색 함수 (자동완성용)
CREATE OR REPLACE FUNCTION search_exhibition_artworks(
    p_exhibition_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    artist TEXT,
    year TEXT,
    match_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ea.id,
        ea.title,
        ea.artist,
        ea.year,
        ts_rank(
            to_tsvector('simple', ea.title || ' ' || COALESCE(ea.title_en, '') || ' ' || ea.artist),
            plainto_tsquery('simple', p_query)
        ) as match_score
    FROM exhibition_artworks ea
    WHERE ea.exhibition_id = p_exhibition_id
    AND (
        ea.title ILIKE '%' || p_query || '%'
        OR ea.title_en ILIKE '%' || p_query || '%'
        OR ea.artist ILIKE '%' || p_query || '%'
        OR ea.artist_en ILIKE '%' || p_query || '%'
    )
    ORDER BY match_score DESC, ea.display_order ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 11. 초기 통계 및 검증
DO $$
DECLARE
    artworks_count INTEGER;
    visits_count INTEGER;
    records_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO artworks_count FROM exhibition_artworks;
    SELECT COUNT(*) INTO visits_count FROM exhibition_visits;
    SELECT COUNT(*) INTO records_count FROM artwork_records;

    RAISE NOTICE '=== EXHIBITION RECORDING SYSTEM MIGRATION COMPLETE ===';
    RAISE NOTICE 'Exhibition artworks: %', artworks_count;
    RAISE NOTICE 'Exhibition visits: %', visits_count;
    RAISE NOTICE 'Artwork records: %', records_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to start Phase 1 MVP development!';
    RAISE NOTICE '- Start/End visit timer';
    RAISE NOTICE '- Search artworks with autocomplete';
    RAISE NOTICE '- Record emotions with 1-tap';
END $$;

COMMIT;

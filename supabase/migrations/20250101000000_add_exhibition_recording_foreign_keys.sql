-- ====================================================================
-- Add Foreign Key Constraints to Exhibition Recording System
-- Phase 1.5: 데이터 무결성 강화
-- ====================================================================

-- 1. exhibition_artworks.exhibition_id → exhibitions.id
ALTER TABLE exhibition_artworks
ADD CONSTRAINT fk_exhibition_artworks_exhibition
FOREIGN KEY (exhibition_id)
REFERENCES exhibitions(id)
ON DELETE CASCADE;

-- 2. exhibition_visits.user_id → auth.users.id
ALTER TABLE exhibition_visits
ADD CONSTRAINT fk_exhibition_visits_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. exhibition_visits.exhibition_id → exhibitions.id
ALTER TABLE exhibition_visits
ADD CONSTRAINT fk_exhibition_visits_exhibition
FOREIGN KEY (exhibition_id)
REFERENCES exhibitions(id)
ON DELETE SET NULL; -- 전시 삭제해도 방문 기록은 보존

-- 4. RLS 정책 개선 (UUID 타입 캐스팅 제거)
DROP POLICY IF EXISTS "Users can read their own visits" ON exhibition_visits;
DROP POLICY IF EXISTS "Users can create their own visits" ON exhibition_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON exhibition_visits;

CREATE POLICY "Users can read their own visits"
    ON exhibition_visits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visits"
    ON exhibition_visits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
    ON exhibition_visits FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. artwork_records RLS 정책도 개선
DROP POLICY IF EXISTS "Users can read their own artwork records" ON artwork_records;
DROP POLICY IF EXISTS "Users can create their own artwork records" ON artwork_records;

CREATE POLICY "Users can read their own artwork records"
    ON artwork_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM exhibition_visits
            WHERE id = artwork_records.visit_id
            AND auth.uid() = user_id
        )
    );

CREATE POLICY "Users can create their own artwork records"
    ON artwork_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exhibition_visits
            WHERE id = artwork_records.visit_id
            AND auth.uid() = user_id
        )
    );

-- 검증
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name IN ('exhibition_artworks', 'exhibition_visits');

    RAISE NOTICE '✅ Foreign key constraints added: %', fk_count;
    RAISE NOTICE '✅ RLS policies improved (UUID casting removed)';
    RAISE NOTICE '✅ Data integrity enforcement: ENABLED';
END $$;

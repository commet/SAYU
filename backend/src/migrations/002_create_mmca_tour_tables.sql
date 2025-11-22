-- MMCA Tour Tables
-- 국립현대미술관 투어 기능을 위한 테이블

-- ==================== 투어 테이블 ====================
CREATE TABLE IF NOT EXISTS mmca_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_ids UUID[] DEFAULT '{}',
    exhibition_ids TEXT[] DEFAULT '{}',
    visit_date DATE,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 감상 기록 테이블 ====================
CREATE TABLE IF NOT EXISTS mmca_tour_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES mmca_tours(id) ON DELETE SET NULL,
    artwork_id VARCHAR(100) NOT NULL,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('love', 'like', 'neutral', 'dislike')),
    emotion_tags TEXT[] DEFAULT '{}',
    memo TEXT,
    photo_url TEXT,
    is_best_pick BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tour_id, artwork_id)
);

-- ==================== 인덱스 ====================
CREATE INDEX IF NOT EXISTS idx_mmca_tours_created_by ON mmca_tours(created_by);
CREATE INDEX IF NOT EXISTS idx_mmca_tours_visit_date ON mmca_tours(visit_date);
CREATE INDEX IF NOT EXISTS idx_mmca_tour_impressions_user_id ON mmca_tour_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_mmca_tour_impressions_tour_id ON mmca_tour_impressions(tour_id);
CREATE INDEX IF NOT EXISTS idx_mmca_tour_impressions_artwork_id ON mmca_tour_impressions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_mmca_tour_impressions_created_at ON mmca_tour_impressions(created_at DESC);

-- ==================== RLS (Row Level Security) ====================
ALTER TABLE mmca_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmca_tour_impressions ENABLE ROW LEVEL SECURITY;

-- Tours: 생성자 및 멤버만 조회/수정 가능
CREATE POLICY "Users can view their tours"
    ON mmca_tours FOR SELECT
    USING (
        created_by = auth.uid() OR
        auth.uid() = ANY(member_ids)
    );

CREATE POLICY "Users can create tours"
    ON mmca_tours FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Tour creators can update"
    ON mmca_tours FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Tour creators can delete"
    ON mmca_tours FOR DELETE
    USING (created_by = auth.uid());

-- Impressions: 본인 기록만 수정, 같은 투어 멤버는 조회 가능
CREATE POLICY "Users can view impressions in their tours"
    ON mmca_tour_impressions FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM mmca_tours
            WHERE mmca_tours.id = mmca_tour_impressions.tour_id
            AND (mmca_tours.created_by = auth.uid() OR auth.uid() = ANY(mmca_tours.member_ids))
        )
    );

CREATE POLICY "Users can create own impressions"
    ON mmca_tour_impressions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own impressions"
    ON mmca_tour_impressions FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own impressions"
    ON mmca_tour_impressions FOR DELETE
    USING (user_id = auth.uid());

-- ==================== 트리거 함수: updated_at 자동 업데이트 ====================
CREATE OR REPLACE FUNCTION update_mmca_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mmca_tours_updated_at
    BEFORE UPDATE ON mmca_tours
    FOR EACH ROW
    EXECUTE FUNCTION update_mmca_tour_updated_at();

CREATE TRIGGER trigger_mmca_tour_impressions_updated_at
    BEFORE UPDATE ON mmca_tour_impressions
    FOR EACH ROW
    EXECUTE FUNCTION update_mmca_tour_updated_at();

-- ==================== 코멘트 ====================
COMMENT ON TABLE mmca_tours IS 'MMCA 투어 세션 정보';
COMMENT ON TABLE mmca_tour_impressions IS '사용자 작품 감상 기록';
COMMENT ON COLUMN mmca_tour_impressions.artwork_id IS 'mmca-tour-data.ts의 작품 ID와 매핑';
COMMENT ON COLUMN mmca_tour_impressions.emotion_tags IS 'EMOTION_TAG_PRESETS의 id 배열';

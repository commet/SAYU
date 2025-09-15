-- SAYU 전시 데이터 보강을 위한 스키마 확장
-- 기존 테이블에 새로운 필드 및 관계 테이블 추가

-- 1. exhibition_keywords 테이블 생성
CREATE TABLE IF NOT EXISTS exhibition_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  weight FLOAT DEFAULT 1.0, -- 키워드 중요도 (0.0-1.0)
  source VARCHAR(50) DEFAULT 'ai_extraction', -- 'ai_extraction', 'manual', 'api'
  language_code CHAR(2) DEFAULT 'ko',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(exhibition_id, keyword, language_code)
);

-- 2. exhibition_categories 테이블 생성
CREATE TABLE IF NOT EXISTS exhibition_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'painting', 'sculpture', 'installation', 'media', etc.
  subcategory VARCHAR(50), -- 세부 카테고리
  confidence FLOAT DEFAULT 0.8, -- 분류 신뢰도 (0.0-1.0)
  source VARCHAR(50) DEFAULT 'ai_classification', -- 'ai_classification', 'manual', 'api'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(exhibition_id, category)
);

-- 3. apt_exhibition_scores 테이블 생성 (사전 계산된 매칭 점수)
CREATE TABLE IF NOT EXISTS apt_exhibition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  apt_type CHAR(4) NOT NULL, -- 'LAEF', 'LAEC', 'LAMF', etc.
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100), -- 0-100점
  
  -- 세부 점수 구성
  keyword_score FLOAT DEFAULT 0, -- 키워드 매칭 점수
  category_score FLOAT DEFAULT 0, -- 카테고리 점수
  venue_score FLOAT DEFAULT 0, -- 장소 점수
  emotion_score FLOAT DEFAULT 0, -- 감정 점수
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  algorithm_version VARCHAR(20) DEFAULT 'v2.0',
  
  UNIQUE(exhibition_id, apt_type)
);

-- 4. exhibition_enrichment_logs 테이블 생성
CREATE TABLE IF NOT EXISTS exhibition_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  
  -- 보강 작업 정보
  enrichment_type VARCHAR(50) NOT NULL, -- 'description', 'keywords', 'category', 'apt_scores'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- 보강 결과
  original_data JSONB, -- 원본 데이터
  enriched_data JSONB, -- 보강된 데이터
  quality_score INTEGER, -- 데이터 품질 점수 (0-100)
  
  -- 보강 메타데이터
  source VARCHAR(50), -- 'ai_gemini', 'api_nmma', 'api_seoul_museum', 'manual'
  processing_time_ms INTEGER, -- 처리 시간 (밀리초)
  api_cost_credits FLOAT, -- API 사용 비용
  
  -- 오류 정보
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. exhibition_data_quality 테이블 생성
CREATE TABLE IF NOT EXISTS exhibition_data_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  
  -- 품질 점수 (0-100)
  overall_score INTEGER DEFAULT 0,
  completeness_score INTEGER DEFAULT 0, -- 필수 필드 완성도
  accuracy_score INTEGER DEFAULT 0, -- 데이터 정확성
  freshness_score INTEGER DEFAULT 0, -- 데이터 최신성
  relevance_score INTEGER DEFAULT 0, -- 관련성
  
  -- 세부 품질 지표
  has_description BOOLEAN DEFAULT FALSE,
  has_keywords BOOLEAN DEFAULT FALSE,
  has_category BOOLEAN DEFAULT FALSE,
  has_apt_scores BOOLEAN DEFAULT FALSE,
  has_images BOOLEAN DEFAULT FALSE,
  
  description_length INTEGER DEFAULT 0,
  keywords_count INTEGER DEFAULT 0,
  apt_coverage_count INTEGER DEFAULT 0, -- 60점 이상 APT 유형 수
  
  -- 품질 개선 제안
  improvement_suggestions TEXT[],
  priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  evaluator VARCHAR(50) DEFAULT 'system'
);

-- 6. apt_type_preferences 테이블 생성 (APT 유형별 선호도 매핑)
CREATE TABLE IF NOT EXISTS apt_type_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apt_type CHAR(4) NOT NULL, -- 'LAEF', 'LAEC', etc.
  
  -- 기본 정보
  animal_type VARCHAR(20) NOT NULL, -- 'fox', 'cat', 'owl', etc.
  type_name VARCHAR(50) NOT NULL, -- '몽환적 방랑자', '감성 큐레이터', etc.
  
  -- 선호 카테고리 가중치
  category_weights JSONB DEFAULT '{}', -- {"painting": 0.8, "installation": 0.9}
  
  -- 감정 키워드 매핑
  emotion_keywords TEXT[],
  avoidance_keywords TEXT[],
  
  -- 장소 선호도
  preferred_venues TEXT[],
  venue_types JSONB DEFAULT '{}', -- {"gallery": 0.8, "museum": 0.6}
  
  -- 체험 선호도
  interaction_level FLOAT DEFAULT 0.5, -- 인터랙션 선호도 (0.0-1.0)
  social_level FLOAT DEFAULT 0.5, -- 사회적 체험 선호도
  learning_level FLOAT DEFAULT 0.5, -- 학습 지향성
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(apt_type)
);

-- 7. exhibition_recommendation_cache 테이블 생성
CREATE TABLE IF NOT EXISTS exhibition_recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apt_type CHAR(4) NOT NULL,
  
  -- 추천 데이터
  recommended_exhibitions JSONB NOT NULL, -- 추천 전시 ID 배열과 점수
  total_exhibitions INTEGER DEFAULT 0,
  avg_match_score FLOAT DEFAULT 0,
  
  -- 캐시 메타데이터
  cache_key VARCHAR(100) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- 필터 조건
  filters JSONB DEFAULT '{}', -- 지역, 기간, 카테고리 등
  
  UNIQUE(apt_type, cache_key)
);

-- 8. data_enrichment_batches 테이블 생성
CREATE TABLE IF NOT EXISTS data_enrichment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 배치 정보
  batch_name VARCHAR(100) NOT NULL,
  batch_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'scheduled'
  
  -- 처리 통계
  total_exhibitions INTEGER DEFAULT 0,
  processed_exhibitions INTEGER DEFAULT 0,
  successful_exhibitions INTEGER DEFAULT 0,
  failed_exhibitions INTEGER DEFAULT 0,
  
  -- 처리 시간
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  
  -- 배치 설정
  batch_size INTEGER DEFAULT 10,
  max_retries INTEGER DEFAULT 3,
  processing_config JSONB DEFAULT '{}',
  
  -- 상태
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  progress_percentage FLOAT DEFAULT 0,
  current_exhibition_id UUID,
  
  -- 결과 요약
  quality_improvement JSONB, -- 품질 개선 통계
  cost_summary JSONB, -- 비용 요약
  
  created_by VARCHAR(50) DEFAULT 'system',
  error_summary TEXT
);

-- 인덱스 생성
CREATE INDEX idx_exhibition_keywords_exhibition_id ON exhibition_keywords(exhibition_id);
CREATE INDEX idx_exhibition_keywords_keyword ON exhibition_keywords(keyword);
CREATE INDEX idx_exhibition_keywords_weight ON exhibition_keywords(weight DESC);

CREATE INDEX idx_exhibition_categories_exhibition_id ON exhibition_categories(exhibition_id);
CREATE INDEX idx_exhibition_categories_category ON exhibition_categories(category);
CREATE INDEX idx_exhibition_categories_confidence ON exhibition_categories(confidence DESC);

CREATE INDEX idx_apt_exhibition_scores_exhibition_id ON apt_exhibition_scores(exhibition_id);
CREATE INDEX idx_apt_exhibition_scores_apt_type ON apt_exhibition_scores(apt_type);
CREATE INDEX idx_apt_exhibition_scores_score ON apt_exhibition_scores(score DESC);
CREATE INDEX idx_apt_exhibition_scores_calculated_at ON apt_exhibition_scores(calculated_at DESC);

CREATE INDEX idx_enrichment_logs_exhibition_id ON exhibition_enrichment_logs(exhibition_id);
CREATE INDEX idx_enrichment_logs_status ON exhibition_enrichment_logs(status);
CREATE INDEX idx_enrichment_logs_type ON exhibition_enrichment_logs(enrichment_type);
CREATE INDEX idx_enrichment_logs_created_at ON exhibition_enrichment_logs(created_at DESC);

CREATE INDEX idx_data_quality_exhibition_id ON exhibition_data_quality(exhibition_id);
CREATE INDEX idx_data_quality_overall_score ON exhibition_data_quality(overall_score DESC);
CREATE INDEX idx_data_quality_priority ON exhibition_data_quality(priority_level);

CREATE INDEX idx_recommendation_cache_apt_type ON exhibition_recommendation_cache(apt_type);
CREATE INDEX idx_recommendation_cache_expires_at ON exhibition_recommendation_cache(expires_at);

CREATE INDEX idx_enrichment_batches_status ON data_enrichment_batches(status);
CREATE INDEX idx_enrichment_batches_started_at ON data_enrichment_batches(started_at DESC);

-- 함수: 전시 품질 점수 자동 계산
CREATE OR REPLACE FUNCTION calculate_exhibition_quality(exhibition_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    quality_score INTEGER := 0;
    description_length INTEGER := 0;
    keywords_count INTEGER := 0;
    apt_coverage INTEGER := 0;
    category_count INTEGER := 0;
BEGIN
    -- 설명 품질 점수 (30점)
    SELECT COALESCE(LENGTH(description), 0) INTO description_length
    FROM exhibitions_translations 
    WHERE exhibition_id = exhibition_id_param AND language_code = 'ko';
    
    IF description_length > 200 THEN quality_score := quality_score + 30;
    ELSIF description_length > 100 THEN quality_score := quality_score + 20;
    ELSIF description_length > 50 THEN quality_score := quality_score + 10;
    END IF;
    
    -- 키워드 품질 점수 (25점)
    SELECT COUNT(*) INTO keywords_count
    FROM exhibition_keywords 
    WHERE exhibition_id = exhibition_id_param;
    
    IF keywords_count >= 5 THEN quality_score := quality_score + 25;
    ELSIF keywords_count >= 3 THEN quality_score := quality_score + 15;
    ELSIF keywords_count > 0 THEN quality_score := quality_score + 5;
    END IF;
    
    -- APT 커버리지 점수 (25점)
    SELECT COUNT(*) INTO apt_coverage
    FROM apt_exhibition_scores 
    WHERE exhibition_id = exhibition_id_param AND score >= 60;
    
    IF apt_coverage >= 8 THEN quality_score := quality_score + 25;
    ELSIF apt_coverage >= 4 THEN quality_score := quality_score + 15;
    ELSIF apt_coverage > 0 THEN quality_score := quality_score + 5;
    END IF;
    
    -- 카테고리 점수 (10점)
    SELECT COUNT(*) INTO category_count
    FROM exhibition_categories 
    WHERE exhibition_id = exhibition_id_param;
    
    IF category_count > 0 THEN quality_score := quality_score + 10; END IF;
    
    -- 이미지 점수 (10점) - poster_url이나 thumbnail_url이 있으면
    IF EXISTS(
        SELECT 1 FROM exhibitions_master 
        WHERE id = exhibition_id_param 
        AND (poster_url IS NOT NULL OR thumbnail_url IS NOT NULL)
    ) THEN
        quality_score := quality_score + 10;
    END IF;
    
    -- 품질 데이터 저장
    INSERT INTO exhibition_data_quality (
        exhibition_id, overall_score, completeness_score, 
        has_description, has_keywords, has_category, has_apt_scores,
        description_length, keywords_count, apt_coverage_count
    ) VALUES (
        exhibition_id_param, quality_score, quality_score,
        description_length > 0, keywords_count > 0, category_count > 0, apt_coverage > 0,
        description_length, keywords_count, apt_coverage
    ) ON CONFLICT (exhibition_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        completeness_score = EXCLUDED.completeness_score,
        has_description = EXCLUDED.has_description,
        has_keywords = EXCLUDED.has_keywords,
        has_category = EXCLUDED.has_category,
        has_apt_scores = EXCLUDED.has_apt_scores,
        description_length = EXCLUDED.description_length,
        keywords_count = EXCLUDED.keywords_count,
        apt_coverage_count = EXCLUDED.apt_coverage_count,
        evaluated_at = NOW();
    
    RETURN quality_score;
END;
$$ LANGUAGE plpgsql;

-- 함수: APT 유형별 추천 캐시 생성
CREATE OR REPLACE FUNCTION generate_apt_recommendations(apt_type_param CHAR(4))
RETURNS VOID AS $$
DECLARE
    recommendations JSONB;
    total_count INTEGER;
    avg_score FLOAT;
BEGIN
    -- 해당 APT 유형의 추천 데이터 조회
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'exhibition_id', exhibition_id,
                'score', score,
                'rank', ROW_NUMBER() OVER (ORDER BY score DESC)
            )
        ),
        COUNT(*),
        AVG(score)
    INTO recommendations, total_count, avg_score
    FROM apt_exhibition_scores
    WHERE apt_type = apt_type_param 
      AND score >= 40
    ORDER BY score DESC
    LIMIT 50;
    
    -- 캐시 저장
    INSERT INTO exhibition_recommendation_cache (
        apt_type, recommended_exhibitions, total_exhibitions, 
        avg_match_score, cache_key
    ) VALUES (
        apt_type_param, 
        COALESCE(recommendations, '[]'::jsonb), 
        COALESCE(total_count, 0),
        COALESCE(avg_score, 0),
        CONCAT(apt_type_param, '_', EXTRACT(EPOCH FROM NOW())::TEXT)
    ) ON CONFLICT (apt_type, cache_key) DO UPDATE SET
        recommended_exhibitions = EXCLUDED.recommended_exhibitions,
        total_exhibitions = EXCLUDED.total_exhibitions,
        avg_match_score = EXCLUDED.avg_match_score,
        generated_at = NOW(),
        expires_at = NOW() + INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 트리거: 타임스탬프 자동 업데이트
CREATE TRIGGER update_exhibition_keywords_updated_at
    BEFORE UPDATE ON exhibition_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibition_categories_updated_at
    BEFORE UPDATE ON exhibition_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apt_type_preferences_updated_at
    BEFORE UPDATE ON apt_type_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 뷰: 전시 보강 현황 대시보드
CREATE OR REPLACE VIEW exhibition_enrichment_dashboard AS
SELECT 
    em.id,
    et.exhibition_title,
    et.venue_name,
    CASE 
        WHEN et.description IS NOT NULL AND LENGTH(et.description) > 50 THEN '✅'
        ELSE '❌'
    END as has_description,
    CASE 
        WHEN ek.keywords_count > 0 THEN CONCAT('✅ (', ek.keywords_count, ')')
        ELSE '❌'
    END as has_keywords,
    CASE 
        WHEN ec.category IS NOT NULL THEN CONCAT('✅ (', ec.category, ')')
        ELSE '❌'
    END as has_category,
    CASE 
        WHEN aes.apt_coverage > 0 THEN CONCAT('✅ (', aes.apt_coverage, '/16)')
        ELSE '❌'
    END as has_apt_scores,
    COALESCE(edq.overall_score, 0) as quality_score,
    em.created_at
FROM exhibitions_master em
JOIN exhibitions_translations et ON em.id = et.exhibition_id AND et.language_code = 'ko'
LEFT JOIN (
    SELECT exhibition_id, COUNT(*) as keywords_count 
    FROM exhibition_keywords 
    GROUP BY exhibition_id
) ek ON em.id = ek.exhibition_id
LEFT JOIN exhibition_categories ec ON em.id = ec.exhibition_id
LEFT JOIN (
    SELECT exhibition_id, COUNT(*) as apt_coverage 
    FROM apt_exhibition_scores 
    WHERE score >= 60 
    GROUP BY exhibition_id
) aes ON em.id = aes.exhibition_id
LEFT JOIN exhibition_data_quality edq ON em.id = edq.exhibition_id
ORDER BY edq.overall_score ASC NULLS FIRST, em.created_at DESC;

-- APT 유형별 선호도 기본 데이터 삽입
INSERT INTO apt_type_preferences (apt_type, animal_type, type_name, emotion_keywords, category_weights) VALUES
('LAEF', 'fox', '몽환적 방랑자', 
 ARRAY['몽환', '초현실', '자유', '탐험', '신비', '여행', '상상', '꿈'],
 '{"installation": 0.9, "contemporary": 0.8, "media": 0.7}'::jsonb),
('LAEC', 'cat', '감성 큐레이터',
 ARRAY['감성', '큐레이션', '세련', '우아', '조화', '미적', '섬세', '품격'],
 '{"painting": 0.9, "design": 0.8, "photography": 0.7}'::jsonb),
('LAMF', 'owl', '직관적 탐구자',
 ARRAY['철학', '사고', '개념', '깊이', '성찰', '지혜', '탐구', '직관'],
 '{"installation": 0.9, "media": 0.8, "contemporary": 0.8}'::jsonb),
('LAMC', 'turtle', '철학적 수집가',
 ARRAY['수집', '체계', '연구', '학문', '기록', '보존', '전통', '역사'],
 '{"traditional": 0.9, "educational": 0.8, "international": 0.7}'::jsonb),
('LREF', 'chameleon', '고독한 관찰자',
 ARRAY['관찰', '사실', '자연', '정적', '고독', '명상', '침묵', '평화'],
 '{"painting": 0.9, "photography": 0.8, "traditional": 0.7}'::jsonb),
('LREC', 'hedgehog', '섬세한 감정가',
 ARRAY['감정', '따뜻함', '섬세함', '공감', '이야기', '인간적', '친밀', '감동'],
 '{"painting": 0.9, "photography": 0.8, "design": 0.7}'::jsonb),
('LRMF', 'octopus', '디지털 탐험가',
 ARRAY['디지털', '기술', '혁신', '미래', '실험', '가상', '인터랙티브', '진화'],
 '{"media": 1.0, "installation": 0.9, "contemporary": 0.7}'::jsonb),
('LRMC', 'beaver', '학구적 연구자',
 ARRAY['학술', '연구', '이론', '분석', '체계적', '엄밀', '전문', '깊이'],
 '{"traditional": 0.9, "educational": 0.8, "sculpture": 0.7}'::jsonb),
('SAEF', 'butterfly', '감성 나누미',
 ARRAY['공유', '나눔', '친근', '밝음', '긍정', '활기', '즐거움', '사랑'],
 '{"installation": 0.9, "contemporary": 0.8, "media": 0.8}'::jsonb),
('SAEC', 'penguin', '예술 네트워커',
 ARRAY['네트워크', '커뮤니티', '소통', '연결', '협력', '상호작용', '사교', '문화'],
 '{"international": 0.9, "contemporary": 0.8, "design": 0.7}'::jsonb),
('SAMF', 'parrot', '영감 전도사',
 ARRAY['영감', '전달', '메시지', '변화', '운동', '사회', '의미', '영향'],
 '{"installation": 0.9, "media": 0.8, "contemporary": 0.8}'::jsonb),
('SAMC', 'deer', '문화 기획자',
 ARRAY['기획', '조직', '체계', '문화', '교육', '프로그램', '참여', '포용'],
 '{"educational": 1.0, "international": 0.8, "design": 0.7}'::jsonb),
('SREF', 'dog', '열정적 관람자',
 ARRAY['열정', '에너지', '활동', '참여', '체험', '재미', '흥미', '즐거움'],
 '{"contemporary": 0.9, "media": 0.8, "installation": 0.8}'::jsonb),
('SREC', 'duck', '따뜻한 안내자',
 ARRAY['따뜻함', '안내', '친절', '보살핌', '포용', '가족', '친근', '편안'],
 '{"educational": 1.0, "traditional": 0.8, "photography": 0.7}'::jsonb),
('SRMF', 'elephant', '지식 멘토',
 ARRAY['지식', '학습', '교육', '멘토링', '가르침', '경험', '지혜', '성장'],
 '{"educational": 1.0, "traditional": 0.8, "international": 0.7}'::jsonb),
('SRMC', 'eagle', '체계적 교육자',
 ARRAY['교육', '체계', '구조', '계획', '조직', '리더십', '전문성', '완성'],
 '{"educational": 1.0, "traditional": 0.9, "sculpture": 0.7}'::jsonb)
ON CONFLICT (apt_type) DO NOTHING;

COMMENT ON TABLE exhibition_keywords IS '전시별 키워드 추출 및 매핑';
COMMENT ON TABLE exhibition_categories IS '전시 카테고리 자동 분류';
COMMENT ON TABLE apt_exhibition_scores IS '16가지 APT 유형별 전시 매칭 점수';
COMMENT ON TABLE exhibition_enrichment_logs IS '데이터 보강 작업 로그';
COMMENT ON TABLE exhibition_data_quality IS '전시 데이터 품질 평가';
COMMENT ON TABLE apt_type_preferences IS 'APT 유형별 선호도 설정';
COMMENT ON TABLE exhibition_recommendation_cache IS '추천 결과 캐시';
COMMENT ON TABLE data_enrichment_batches IS '데이터 보강 배치 작업 관리';
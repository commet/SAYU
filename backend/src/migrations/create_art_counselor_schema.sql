-- Art Counselor System Database Schema
-- RAG-powered AI counselor with emotional memory and personalized art recommendations

-- Enable pgvector extension for vector similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================
-- ART COUNSELOR CORE TABLES
-- ====================================

-- User emotional profiles for counselor context
CREATE TABLE IF NOT EXISTS user_emotional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Current emotional state
    current_emotions JSONB DEFAULT '{}', -- {"joy": 0.7, "sadness": 0.2, "anxiety": 0.1}
    dominant_emotion VARCHAR(50),
    emotion_intensity FLOAT DEFAULT 0.5,

    -- Emotional patterns over time
    emotional_patterns JSONB DEFAULT '{}', -- Weekly/monthly patterns
    stress_triggers TEXT[],
    comfort_sources TEXT[],

    -- Art therapy preferences
    preferred_art_styles TEXT[],
    therapeutic_goals TEXT[],
    session_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, biweekly, monthly

    -- Counselor interaction preferences
    conversation_style VARCHAR(30) DEFAULT 'supportive', -- supportive, analytical, creative, gentle
    communication_pace VARCHAR(20) DEFAULT 'moderate', -- slow, moderate, fast

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Art therapy sessions with memory persistence
CREATE TABLE IF NOT EXISTS art_counselor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session metadata
    session_type VARCHAR(30) DEFAULT 'general', -- general, crisis, celebration, reflection
    session_goal TEXT,
    session_length_minutes INTEGER DEFAULT 15,

    -- Emotional context at session start/end
    initial_emotion_state JSONB DEFAULT '{}',
    final_emotion_state JSONB DEFAULT '{}',
    emotional_progress FLOAT, -- -1 to 1, improvement during session

    -- AI counselor memory context
    conversation_summary TEXT,
    key_insights TEXT[],
    recommended_actions TEXT[],
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_reason TEXT,

    -- Session quality metrics
    user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
    session_feedback TEXT,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation memory with vector embeddings for RAG
CREATE TABLE IF NOT EXISTS counselor_conversation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES art_counselor_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Message content
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'counselor', 'system')),
    content TEXT NOT NULL,
    emotion_detected JSONB, -- Detected emotions in user messages

    -- Vector embedding for similarity search (1536 dimensions for OpenAI)
    content_embedding vector(1536),

    -- Context and metadata
    artwork_context_id VARCHAR(255), -- If discussing specific artwork
    therapeutic_theme VARCHAR(50), -- anxiety, grief, joy, identity, etc.
    counselor_technique VARCHAR(50), -- active_listening, reframing, art_interpretation

    -- Memory importance (0-1, higher = more important to remember)
    memory_importance FLOAT DEFAULT 0.5,
    memory_tags TEXT[],

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emotional responses to artworks with encrypted sensitive data
CREATE TABLE IF NOT EXISTS artwork_emotional_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Artwork identification
    artwork_id VARCHAR(255) NOT NULL,
    artwork_title VARCHAR(500),
    artwork_artist VARCHAR(255),
    artwork_year INTEGER,
    artwork_source VARCHAR(100), -- 'artvee', 'met', 'user_upload'

    -- Emotional response data (encrypted for privacy)
    emotional_response JSONB NOT NULL, -- {"initial": {...}, "after_reflection": {...}}
    response_intensity FLOAT NOT NULL CHECK (response_intensity BETWEEN 0 AND 1),
    personal_meaning TEXT, -- User's personal interpretation

    -- Therapy context
    session_id UUID REFERENCES art_counselor_sessions(id),
    therapeutic_insight TEXT, -- AI counselor's insight about this response
    growth_indicator VARCHAR(50), -- healing, breakthrough, processing, etc.

    -- Privacy and sharing
    is_private BOOLEAN DEFAULT true,
    shared_with_community BOOLEAN DEFAULT false,
    anonymized_for_research BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community interpretations archive for shared healing
CREATE TABLE IF NOT EXISTS community_interpretation_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Artwork reference
    artwork_id VARCHAR(255) NOT NULL,
    artwork_metadata JSONB,

    -- Aggregated community insights (anonymized)
    common_emotions JSONB, -- Most frequent emotional responses
    interpretation_themes TEXT[], -- Common interpretation patterns
    therapeutic_benefits TEXT[], -- How this artwork helps people

    -- Counselor AI insights
    ai_therapeutic_analysis TEXT,
    recommended_for_conditions TEXT[], -- depression, anxiety, grief, etc.
    healing_potential_score FLOAT CHECK (healing_potential_score BETWEEN 0 AND 1),

    -- Community stats
    total_interactions INTEGER DEFAULT 0,
    positive_impact_count INTEGER DEFAULT 0,
    negative_trigger_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily personalized art recommendations
CREATE TABLE IF NOT EXISTS daily_art_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Recommendation metadata
    recommendation_date DATE NOT NULL,
    recommendation_reason TEXT NOT NULL,
    therapeutic_goal VARCHAR(100),

    -- Recommended artwork
    artwork_id VARCHAR(255) NOT NULL,
    artwork_data JSONB, -- Cached artwork information

    -- Personalization context
    user_emotional_state JSONB, -- User's state when recommendation made
    apt_personality_factor JSONB, -- How personality influenced selection
    past_preferences_weight FLOAT DEFAULT 0.3,
    novelty_factor FLOAT DEFAULT 0.2,

    -- Engagement tracking
    viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMP,
    interaction_time_seconds INTEGER,
    emotional_response_recorded BOOLEAN DEFAULT false,

    -- Effectiveness measurement
    helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
    emotional_impact VARCHAR(20), -- positive, negative, neutral, mixed
    follow_up_engagement BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User counselor preferences and boundaries
CREATE TABLE IF NOT EXISTS counselor_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Communication preferences
    preferred_counselor_persona VARCHAR(50) DEFAULT 'empathetic_guide',
    communication_formality VARCHAR(20) DEFAULT 'casual', -- formal, casual, friendly
    crisis_support_enabled BOOLEAN DEFAULT true,

    -- Content boundaries
    trigger_warnings_enabled BOOLEAN DEFAULT true,
    sensitive_topics_to_avoid TEXT[],
    preferred_therapeutic_approaches TEXT[], -- CBT, art_therapy, mindfulness

    -- Privacy settings
    session_recording_consent BOOLEAN DEFAULT false,
    research_participation_consent BOOLEAN DEFAULT false,
    community_sharing_default BOOLEAN DEFAULT false,

    -- Emergency contacts and safety
    emergency_contact_email VARCHAR(255),
    crisis_resources_region VARCHAR(50),
    safety_plan_keywords TEXT[],

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_emotional_profiles_user_id ON user_emotional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_sessions_user_id ON art_counselor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_sessions_date ON art_counselor_sessions(started_at);

-- Memory and conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversation_memory_session_id ON counselor_conversation_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_id ON counselor_conversation_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_theme ON counselor_conversation_memory(therapeutic_theme);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_importance ON counselor_conversation_memory(memory_importance);

-- Vector similarity index for RAG
CREATE INDEX IF NOT EXISTS idx_conversation_memory_embedding ON counselor_conversation_memory
USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

-- Artwork response indexes
CREATE INDEX IF NOT EXISTS idx_artwork_responses_user_id ON artwork_emotional_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_responses_artwork_id ON artwork_emotional_responses(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_responses_session_id ON artwork_emotional_responses(session_id);

-- Community archive indexes
CREATE INDEX IF NOT EXISTS idx_community_archive_artwork_id ON community_interpretation_archive(artwork_id);
CREATE INDEX IF NOT EXISTS idx_community_archive_healing_score ON community_interpretation_archive(healing_potential_score);

-- Daily recommendations indexes
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_user_id ON daily_art_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_date ON daily_art_recommendations(recommendation_date);
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_viewed ON daily_art_recommendations(viewed);

-- ====================================
-- SECURITY AND PRIVACY
-- ====================================

-- Row Level Security for sensitive data
ALTER TABLE user_emotional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_counselor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_emotional_responses ENABLE ROW LEVEL SECURITY;

-- Policies to ensure users can only access their own data
CREATE POLICY user_emotional_profiles_policy ON user_emotional_profiles
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY counselor_sessions_policy ON art_counselor_sessions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY conversation_memory_policy ON counselor_conversation_memory
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY artwork_responses_policy ON artwork_emotional_responses
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- ====================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ====================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_user_emotional_profiles_updated_at
    BEFORE UPDATE ON user_emotional_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_artwork_responses_updated_at
    BEFORE UPDATE ON artwork_emotional_responses
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_community_archive_updated_at
    BEFORE UPDATE ON community_interpretation_archive
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_counselor_preferences_updated_at
    BEFORE UPDATE ON counselor_user_preferences
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Art Counselor System schema created successfully!';
    RAISE NOTICE 'Tables created: 7 core tables with full RAG support';
    RAISE NOTICE 'Security: Row-level security enabled for sensitive data';
    RAISE NOTICE 'Performance: Vector indexes for embeddings and similarity search';
END
$$;
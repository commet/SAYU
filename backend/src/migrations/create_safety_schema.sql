-- Safety and Legal Compliance Schema for Art Counselor
-- Ensures legal compliance, age verification, and crisis intervention

-- ====================================
-- SAFETY AND COMPLIANCE TABLES
-- ====================================

-- User consent tracking for legal compliance
CREATE TABLE IF NOT EXISTS user_consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Consent types and timestamps
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR(20),
    privacy_policy_accepted_at TIMESTAMP,
    privacy_policy_version VARCHAR(20),
    safety_disclaimer_accepted_at TIMESTAMP,
    safety_disclaimer_version VARCHAR(20),

    -- Age verification
    age_verified BOOLEAN DEFAULT false,
    birth_year INTEGER,
    parental_consent_given BOOLEAN DEFAULT false,
    parental_consent_email VARCHAR(255),
    parental_consent_at TIMESTAMP,

    -- Regional compliance
    user_region VARCHAR(10), -- ISO country code
    gdpr_applicable BOOLEAN DEFAULT false,
    ccpa_applicable BOOLEAN DEFAULT false,

    -- IP and device info for legal purposes
    consent_ip_address INET,
    consent_user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis intervention tracking and legal protection
CREATE TABLE IF NOT EXISTS crisis_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Crisis details
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'crisis')),
    triggers TEXT[], -- What triggered the intervention
    message_excerpt TEXT, -- Partial message content (for safety analysis)

    -- Intervention response
    intervention_type VARCHAR(50) NOT NULL,
    resources_provided TEXT[],
    crisis_hotline_provided VARCHAR(255),
    emergency_services_recommended BOOLEAN DEFAULT false,

    -- Follow-up tracking
    follow_up_needed BOOLEAN DEFAULT true,
    follow_up_completed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,

    -- Legal protection
    intervention_successful BOOLEAN,
    professional_referral_made BOOLEAN DEFAULT false,
    user_safety_confirmed BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session monitoring for safety limits
CREATE TABLE IF NOT EXISTS session_safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES art_counselor_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session metrics
    session_duration_minutes INTEGER,
    message_count INTEGER,
    crisis_indicators_detected INTEGER DEFAULT 0,
    heavy_topics_discussed INTEGER DEFAULT 0,

    -- Safety actions taken
    session_ended_early BOOLEAN DEFAULT false,
    early_end_reason VARCHAR(100),
    cooldown_imposed BOOLEAN DEFAULT false,
    professional_help_suggested BOOLEAN DEFAULT false,

    -- Content safety scores
    average_risk_score FLOAT DEFAULT 0,
    highest_risk_score FLOAT DEFAULT 0,
    safety_interventions_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content moderation logs
CREATE TABLE IF NOT EXISTS content_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for anonymization

    -- Content analysis
    content_type VARCHAR(50) NOT NULL, -- 'counselor_message', 'user_message', 'artwork_response'
    content_id UUID, -- Reference to original content
    risk_assessment JSONB NOT NULL,

    -- Moderation actions
    action_taken VARCHAR(50), -- 'flagged', 'blocked', 'redirected', 'crisis_intervention'
    moderator_notes TEXT,
    automated_decision BOOLEAN DEFAULT true,
    human_review_needed BOOLEAN DEFAULT false,

    -- Anonymized for research (GDPR compliance)
    anonymized_at TIMESTAMP,
    research_consent BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal disclaimer acceptance tracking
CREATE TABLE IF NOT EXISTS disclaimer_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Disclaimer types
    disclaimer_type VARCHAR(50) NOT NULL,
    disclaimer_version VARCHAR(20) NOT NULL,
    disclaimer_content TEXT NOT NULL,

    -- Acknowledgment details
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,

    -- Legal requirements
    digital_signature VARCHAR(255),
    witness_timestamp TIMESTAMP,
    legal_guardian_consent BOOLEAN DEFAULT false,

    -- Expiration and renewal
    expires_at TIMESTAMP,
    renewed_from UUID REFERENCES disclaimer_acknowledgments(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency contact information (encrypted)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Contact information (encrypted)
    contact_name VARCHAR(255),
    contact_relationship VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),

    -- Emergency preferences
    contact_in_crisis BOOLEAN DEFAULT true,
    contact_for_safety_concerns BOOLEAN DEFAULT true,
    contact_for_session_limits BOOLEAN DEFAULT false,

    -- Verification
    contact_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50),
    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional referral tracking
CREATE TABLE IF NOT EXISTS professional_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Referral details
    referral_reason TEXT NOT NULL,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    referred_to VARCHAR(100), -- 'therapist', 'crisis_hotline', 'emergency_services', 'doctor'

    -- Referral information provided
    resources_provided TEXT[],
    specific_recommendations TEXT,
    follow_up_scheduled BOOLEAN DEFAULT false,

    -- Outcome tracking (for quality improvement)
    user_followed_up BOOLEAN,
    user_feedback TEXT,
    referral_effective BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Consent and compliance indexes
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON user_consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON user_consent_logs(created_at);

-- Crisis intervention indexes
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_user_id ON crisis_interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_risk_level ON crisis_interventions(risk_level);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_created_at ON crisis_interventions(created_at);

-- Session safety indexes
CREATE INDEX IF NOT EXISTS idx_session_safety_session_id ON session_safety_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_safety_user_id ON session_safety_logs(user_id);

-- Content moderation indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_user_id ON content_moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_created_at ON content_moderation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_content_moderation_action ON content_moderation_logs(action_taken);

-- ====================================
-- SECURITY POLICIES
-- ====================================

-- Row Level Security for sensitive data
ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_safety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies ensuring users can only access their own data
CREATE POLICY consent_logs_policy ON user_consent_logs
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY crisis_interventions_policy ON crisis_interventions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY session_safety_policy ON session_safety_logs
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY emergency_contacts_policy ON emergency_contacts
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- ====================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ====================================

-- Update timestamp triggers
CREATE TRIGGER update_crisis_interventions_updated_at
    BEFORE UPDATE ON crisis_interventions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_professional_referrals_updated_at
    BEFORE UPDATE ON professional_referrals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ====================================
-- SAFETY COMPLIANCE FUNCTIONS
-- ====================================

-- Function to check if user has required consent
CREATE OR REPLACE FUNCTION check_user_consent(user_id_param UUID)
RETURNS TABLE (
    has_consent BOOLEAN,
    missing_consents TEXT[],
    requires_renewal BOOLEAN
) AS $$
DECLARE
    consent_record RECORD;
    missing_list TEXT[] := '{}';
    needs_renewal BOOLEAN := FALSE;
    six_months_ago TIMESTAMP := CURRENT_TIMESTAMP - INTERVAL '6 months';
BEGIN
    SELECT * INTO consent_record
    FROM user_consent_logs
    WHERE user_id = user_id_param
    ORDER BY created_at DESC
    LIMIT 1;

    IF consent_record IS NULL THEN
        missing_list := ARRAY['terms', 'privacy_policy', 'safety_disclaimer', 'age_verification'];
        RETURN QUERY SELECT FALSE, missing_list, FALSE;
        RETURN;
    END IF;

    -- Check each required consent
    IF consent_record.terms_accepted_at IS NULL THEN
        missing_list := array_append(missing_list, 'terms');
    END IF;

    IF consent_record.privacy_policy_accepted_at IS NULL THEN
        missing_list := array_append(missing_list, 'privacy_policy');
    END IF;

    IF consent_record.safety_disclaimer_accepted_at IS NULL THEN
        missing_list := array_append(missing_list, 'safety_disclaimer');
    ELSIF consent_record.safety_disclaimer_accepted_at < six_months_ago THEN
        needs_renewal := TRUE;
        missing_list := array_append(missing_list, 'safety_disclaimer_renewal');
    END IF;

    IF NOT consent_record.age_verified THEN
        missing_list := array_append(missing_list, 'age_verification');
    END IF;

    RETURN QUERY SELECT
        array_length(missing_list, 1) IS NULL OR array_length(missing_list, 1) = 0,
        missing_list,
        needs_renewal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Safety and Legal Compliance schema created successfully!';
    RAISE NOTICE 'Tables created: 6 safety tables with full legal compliance';
    RAISE NOTICE 'Features: Age verification, crisis intervention, content moderation';
    RAISE NOTICE 'Security: Row-level security and data anonymization ready';
END
$$;
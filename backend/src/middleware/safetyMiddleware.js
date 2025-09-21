const safetyService = require('../services/safetyService');
const { logger } = require('../utils/logger');
const { pool } = require('../config/database');

/**
 * Safety middleware for Art Counselor endpoints
 */

/**
 * Validate user consent and age compliance
 */
const validateConsent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const client = await pool.connect();

        // Check if user has accepted terms and safety disclaimers
        const consentQuery = `
            SELECT
                terms_accepted_at,
                safety_disclaimer_accepted_at,
                age_verified,
                birth_year,
                parental_consent_given
            FROM user_consent_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const consentResult = await client.query(consentQuery, [userId]);
        client.release();

        if (consentResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Safety disclaimers and terms must be accepted before using the counselor',
                requiresConsent: true,
                consentTypes: ['terms', 'safety_disclaimer', 'age_verification']
            });
        }

        const consent = consentResult.rows[0];

        // Validate age compliance
        if (consent.birth_year) {
            const ageValidation = safetyService.validateAgeCompliance(consent.birth_year);
            if (!ageValidation.isCompliant) {
                return res.status(403).json({
                    success: false,
                    message: 'Age requirement not met (13+ required)',
                    requiresParentalConsent: true
                });
            }

            if (ageValidation.requiresParentalConsent && !consent.parental_consent_given) {
                return res.status(403).json({
                    success: false,
                    message: 'Parental consent required for users under 18',
                    requiresParentalConsent: true
                });
            }
        }

        // Check if disclaimers are recent (require re-acceptance every 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (!consent.safety_disclaimer_accepted_at ||
            new Date(consent.safety_disclaimer_accepted_at) < sixMonthsAgo) {
            return res.status(403).json({
                success: false,
                message: 'Safety disclaimers must be re-accepted',
                requiresConsent: true,
                consentTypes: ['safety_disclaimer']
            });
        }

        req.userConsent = consent;
        next();

    } catch (error) {
        logger.error('Error validating consent:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating safety requirements'
        });
    }
};

/**
 * Check session limits and safety
 */
const checkSessionLimits = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const client = await pool.connect();

        // Get current active sessions
        const sessionQuery = `
            SELECT
                id,
                started_at,
                session_type,
                (
                    SELECT COUNT(*)
                    FROM counselor_conversation_memory
                    WHERE session_id = art_counselor_sessions.id
                ) as message_count
            FROM art_counselor_sessions
            WHERE user_id = $1
                AND ended_at IS NULL
            ORDER BY started_at DESC
            LIMIT 1
        `;

        const sessionResult = await client.query(sessionQuery, [userId]);

        if (sessionResult.rows.length > 0) {
            const session = sessionResult.rows[0];
            const limits = safetyService.checkSessionLimits({
                started_at: session.started_at,
                messageCount: parseInt(session.message_count)
            });

            if (limits.exceedsTimeLimit || limits.exceedsMessageLimit) {
                // End the session
                await client.query(
                    'UPDATE art_counselor_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = $1',
                    [session.id]
                );

                client.release();

                return res.status(429).json({
                    success: false,
                    message: 'Session limit reached for your safety and wellbeing',
                    sessionEnded: true,
                    cooldownMinutes: safetyService.sessionLimits.cooldownMinutes,
                    limitWarning: safetyService.generateSessionLimitWarning(limits)
                });
            }

            req.sessionLimits = limits;
            req.currentSession = session;
        }

        client.release();
        next();

    } catch (error) {
        logger.error('Error checking session limits:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating session safety'
        });
    }
};

/**
 * Analyze message content for safety concerns
 */
const analyzeMessageSafety = async (req, res, next) => {
    try {
        const userMessage = req.body.message;
        const userId = req.user.id;

        if (!userMessage) {
            return next();
        }

        // Analyze message safety
        const safetyAnalysis = await safetyService.analyzeMessageSafety(userMessage, userId);

        // Log high-risk content
        if (safetyAnalysis.riskLevel === 'crisis' || safetyAnalysis.riskLevel === 'high') {
            const client = await pool.connect();

            await client.query(`
                INSERT INTO crisis_interventions (
                    user_id, risk_level, triggers, message_excerpt,
                    intervention_type, resources_provided
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                userId,
                safetyAnalysis.riskLevel,
                safetyAnalysis.triggers,
                userMessage.substring(0, 200) + '...', // Store excerpt only
                safetyAnalysis.isCrisis ? 'crisis_response' : 'risk_mitigation',
                safetyAnalysis.recommendations
            ]);

            client.release();
        }

        // Handle crisis immediately
        if (safetyAnalysis.isCrisis) {
            const crisisResponse = safetyService.generateCrisisResponse(
                safetyAnalysis,
                req.headers['accept-language'] || 'en-US'
            );

            return res.status(200).json({
                success: true,
                isCrisisIntervention: true,
                response: crisisResponse.message,
                crisisResources: safetyService.getCrisisResources(
                    req.headers['accept-language'] || 'en-US'
                ),
                sessionEnded: crisisResponse.shouldEndSession
            });
        }

        // Handle content that should be redirected
        if (safetyAnalysis.shouldRedirect) {
            const redirectResponse = safetyService.generateCrisisResponse(safetyAnalysis);

            return res.status(200).json({
                success: true,
                isRedirection: true,
                response: redirectResponse.message,
                shouldLimitResponse: true,
                professionalHelpSuggested: true
            });
        }

        req.safetyAnalysis = safetyAnalysis;
        next();

    } catch (error) {
        logger.error('Error analyzing message safety:', error);
        // Don't block the request if safety analysis fails
        next();
    }
};

/**
 * Add safety disclaimers to AI responses
 */
const addSafetyDisclaimers = (req, res, next) => {
    // Override res.json to add safety disclaimers
    const originalJson = res.json;

    res.json = function(data) {
        if (data && data.response && !data.isCrisisIntervention) {
            // Add safety disclaimer to AI responses
            data.safetyDisclaimer = "I'm an AI companion, not a replacement for professional therapy. If you're experiencing a mental health crisis, please contact a professional immediately.";

            // Add session time warning if needed
            if (req.sessionLimits) {
                const warning = safetyService.generateSessionLimitWarning(req.sessionLimits);
                if (warning) {
                    data.sessionWarning = warning;
                }
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

module.exports = {
    validateConsent,
    checkSessionLimits,
    analyzeMessageSafety,
    addSafetyDisclaimers
};
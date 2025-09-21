const { pool } = require('../config/database');
const { logger } = require('../utils/logger');
const safetyService = require('../services/safetyService');

class ConsentController {
    /**
     * Submit user consent for safety disclaimers and terms
     */
    async submitConsent(req, res) {
        try {
            const userId = req.user.id;
            const {
                termsAccepted,
                safetyDisclaimerAccepted,
                ageVerified,
                birthYear,
                parentalConsentGiven,
                consentTimestamp
            } = req.body;

            // Validate required consents
            if (!termsAccepted || !safetyDisclaimerAccepted || !ageVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'All required consents must be accepted',
                    required: ['terms', 'safety_disclaimer', 'age_verification']
                });
            }

            // Validate age compliance
            if (birthYear) {
                const ageValidation = safetyService.validateAgeCompliance(birthYear);
                if (!ageValidation.isCompliant) {
                    return res.status(403).json({
                        success: false,
                        message: 'Age requirement not met (13+ required)'
                    });
                }

                if (ageValidation.requiresParentalConsent && !parentalConsentGiven) {
                    return res.status(403).json({
                        success: false,
                        message: 'Parental consent required for users under 18'
                    });
                }
            }

            const client = await pool.connect();

            // Store consent record
            const consentQuery = `
                INSERT INTO user_consent_logs (
                    user_id,
                    terms_accepted_at,
                    terms_version,
                    privacy_policy_accepted_at,
                    privacy_policy_version,
                    safety_disclaimer_accepted_at,
                    safety_disclaimer_version,
                    age_verified,
                    birth_year,
                    parental_consent_given,
                    parental_consent_at,
                    consent_ip_address,
                    consent_user_agent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            `;

            const consentValues = [
                userId,
                termsAccepted ? new Date(consentTimestamp) : null,
                'v1.0',
                termsAccepted ? new Date(consentTimestamp) : null, // Same time as terms
                'v1.0',
                safetyDisclaimerAccepted ? new Date(consentTimestamp) : null,
                'v1.0',
                ageVerified,
                birthYear || null,
                parentalConsentGiven || false,
                parentalConsentGiven ? new Date(consentTimestamp) : null,
                req.ip,
                req.get('User-Agent')
            ];

            const consentResult = await client.query(consentQuery, consentValues);

            // Store disclaimer acknowledgments for legal compliance
            const disclaimerTypes = [
                { type: 'safety_disclaimer', content: 'AI companion safety disclaimer v1.0' },
                { type: 'terms_of_service', content: 'Terms of service v1.0' },
                { type: 'privacy_policy', content: 'Privacy policy v1.0' }
            ];

            for (const disclaimer of disclaimerTypes) {
                await client.query(`
                    INSERT INTO disclaimer_acknowledgments (
                        user_id, disclaimer_type, disclaimer_version, disclaimer_content,
                        acknowledged_at, ip_address, user_agent, legal_guardian_consent,
                        expires_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    userId,
                    disclaimer.type,
                    'v1.0',
                    disclaimer.content,
                    new Date(consentTimestamp),
                    req.ip,
                    req.get('User-Agent'),
                    parentalConsentGiven || false,
                    new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months expiry
                ]);
            }

            client.release();

            logger.info('User consent recorded', {
                userId,
                consentId: consentResult.rows[0].id,
                ageVerified,
                parentalConsent: parentalConsentGiven
            });

            res.json({
                success: true,
                message: 'Consent recorded successfully',
                data: {
                    consentId: consentResult.rows[0].id,
                    timestamp: consentTimestamp
                }
            });

        } catch (error) {
            logger.error('Error recording consent:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record consent'
            });
        }
    }

    /**
     * Check user's current consent status
     */
    async getConsentStatus(req, res) {
        try {
            const userId = req.user.id;
            const client = await pool.connect();

            // Use the safety compliance function
            const consentCheck = await client.query(
                'SELECT * FROM check_user_consent($1)',
                [userId]
            );

            const consentData = consentCheck.rows[0];

            client.release();

            res.json({
                success: true,
                hasConsent: consentData.has_consent,
                missingConsents: consentData.missing_consents || [],
                requiresRenewal: consentData.requires_renewal
            });

        } catch (error) {
            logger.error('Error checking consent status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check consent status'
            });
        }
    }

    /**
     * Update user consent preferences
     */
    async updatePreferences(req, res) {
        try {
            const userId = req.user.id;
            const {
                crisisSupportEnabled,
                triggerWarningsEnabled,
                communitySharing,
                emergencyContactEmail,
                researchParticipation
            } = req.body;

            const client = await pool.connect();

            // Update or insert preferences
            const preferencesQuery = `
                INSERT INTO counselor_user_preferences (
                    user_id,
                    crisis_support_enabled,
                    trigger_warnings_enabled,
                    community_sharing_default,
                    emergency_contact_email,
                    research_participation_consent
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id) DO UPDATE SET
                    crisis_support_enabled = EXCLUDED.crisis_support_enabled,
                    trigger_warnings_enabled = EXCLUDED.trigger_warnings_enabled,
                    community_sharing_default = EXCLUDED.community_sharing_default,
                    emergency_contact_email = EXCLUDED.emergency_contact_email,
                    research_participation_consent = EXCLUDED.research_participation_consent,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;

            await client.query(preferencesQuery, [
                userId,
                crisisSupportEnabled !== undefined ? crisisSupportEnabled : true,
                triggerWarningsEnabled !== undefined ? triggerWarningsEnabled : true,
                communitySharing !== undefined ? communitySharing : false,
                emergencyContactEmail || null,
                researchParticipation !== undefined ? researchParticipation : false
            ]);

            client.release();

            res.json({
                success: true,
                message: 'Preferences updated successfully'
            });

        } catch (error) {
            logger.error('Error updating preferences:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update preferences'
            });
        }
    }

    /**
     * Get crisis resources for user's region
     */
    async getCrisisResources(req, res) {
        try {
            const locale = req.query.locale || req.headers['accept-language'] || 'en-US';
            const resources = safetyService.getCrisisResources(locale);

            res.json({
                success: true,
                data: resources,
                locale: locale
            });

        } catch (error) {
            logger.error('Error getting crisis resources:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get crisis resources'
            });
        }
    }

    /**
     * Report a safety concern
     */
    async reportConcern(req, res) {
        try {
            const userId = req.user.id;
            const { concernType, description, urgencyLevel } = req.body;

            const client = await pool.connect();

            // Log the concern
            await client.query(`
                INSERT INTO content_moderation_logs (
                    user_id, content_type, risk_assessment, action_taken,
                    moderator_notes, human_review_needed
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                userId,
                'user_concern_report',
                { concernType, urgencyLevel },
                'flagged_for_review',
                description,
                urgencyLevel === 'high'
            ]);

            client.release();

            res.json({
                success: true,
                message: 'Concern reported successfully. Thank you for helping keep our community safe.',
                supportResources: safetyService.getCrisisResources('en-US')
            });

        } catch (error) {
            logger.error('Error reporting concern:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to report concern'
            });
        }
    }
}

module.exports = new ConsentController();
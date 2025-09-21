const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const consentController = require('../controllers/consentController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const rateLimiter = require('../middleware/rateLimiter');

// Apply authentication to all consent routes
router.use(authMiddleware);

// Rate limiting for consent actions
const consentLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many consent requests. Please try again later.'
});

// Validation rules
const consentValidation = [
  body('termsAccepted')
    .isBoolean()
    .withMessage('Terms acceptance must be boolean'),
  body('safetyDisclaimerAccepted')
    .isBoolean()
    .withMessage('Safety disclaimer acceptance must be boolean'),
  body('ageVerified')
    .isBoolean()
    .withMessage('Age verification must be boolean'),
  body('birthYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Valid birth year required'),
  body('parentalConsentGiven')
    .optional()
    .isBoolean()
    .withMessage('Parental consent must be boolean'),
  body('consentTimestamp')
    .isISO8601()
    .withMessage('Valid consent timestamp required')
];

const preferencesValidation = [
  body('crisisSupportEnabled')
    .optional()
    .isBoolean()
    .withMessage('Crisis support setting must be boolean'),
  body('triggerWarningsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Trigger warnings setting must be boolean'),
  body('communitySharing')
    .optional()
    .isBoolean()
    .withMessage('Community sharing setting must be boolean'),
  body('emergencyContactEmail')
    .optional()
    .isEmail()
    .withMessage('Valid email required for emergency contact'),
  body('researchParticipation')
    .optional()
    .isBoolean()
    .withMessage('Research participation must be boolean')
];

const concernValidation = [
  body('concernType')
    .isIn(['safety', 'inappropriate_content', 'technical_issue', 'privacy', 'other'])
    .withMessage('Valid concern type required'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('urgencyLevel')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Valid urgency level required')
];

// ====================================
// CONSENT MANAGEMENT ROUTES
// ====================================

/**
 * POST /api/consent
 * Submit user consent for safety disclaimers and terms
 */
router.post('/',
  consentLimiter,
  consentValidation,
  validateRequest,
  consentController.submitConsent
);

/**
 * GET /api/consent/status
 * Check user's current consent status
 */
router.get('/status',
  consentController.getConsentStatus
);

/**
 * PUT /api/consent/preferences
 * Update user consent preferences
 */
router.put('/preferences',
  consentLimiter,
  preferencesValidation,
  validateRequest,
  consentController.updatePreferences
);

/**
 * GET /api/consent/crisis-resources
 * Get crisis resources for user's region
 */
router.get('/crisis-resources',
  [
    query('locale')
      .optional()
      .isString()
      .isLength({ min: 2, max: 10 })
      .withMessage('Valid locale required')
  ],
  validateRequest,
  consentController.getCrisisResources
);

/**
 * POST /api/consent/report-concern
 * Report a safety concern
 */
router.post('/report-concern',
  consentLimiter,
  concernValidation,
  validateRequest,
  consentController.reportConcern
);

module.exports = router;
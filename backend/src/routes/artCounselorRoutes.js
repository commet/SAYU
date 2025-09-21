const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const artCounselorController = require('../controllers/artCounselorController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const rateLimiter = require('../middleware/rateLimiter');
const {
  validateConsent,
  checkSessionLimits,
  analyzeMessageSafety,
  addSafetyDisclaimers
} = require('../middleware/safetyMiddleware');

// Apply authentication and safety to all art counselor routes
router.use(authMiddleware);
router.use(validateConsent);
router.use(addSafetyDisclaimers);

// Rate limiting for counselor interactions
const counselorLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute (more lenient for therapy)
  message: '치료 세션 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
});

// Validation rules
const sessionValidation = [
  body('sessionType')
    .optional()
    .isIn(['general', 'crisis', 'celebration', 'reflection'])
    .withMessage('유효하지 않은 세션 타입입니다'),
  body('initialEmotion')
    .optional()
    .isObject()
    .withMessage('초기 감정 상태는 객체여야 합니다')
];

const messageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('메시지를 입력해주세요')
    .isLength({ max: 2000 }).withMessage('메시지는 2000자 이내로 입력해주세요')
    .matches(/^[^<>]*$/).withMessage('특수문자 < >는 사용할 수 없습니다'),
  body('artworkContext')
    .optional()
    .isObject()
    .withMessage('작품 컨텍스트는 객체여야 합니다'),
  body('artworkContext.id')
    .optional()
    .isString()
    .withMessage('작품 ID는 문자열이어야 합니다'),
  body('artworkContext.title')
    .optional()
    .isString()
    .withMessage('작품 제목은 문자열이어야 합니다')
];

const responseValidation = [
  body('emotionalResponse')
    .isObject()
    .withMessage('감정 응답은 객체여야 합니다'),
  body('responseIntensity')
    .isFloat({ min: 0, max: 1 })
    .withMessage('응답 강도는 0과 1 사이여야 합니다'),
  body('personalMeaning')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('개인적 의미는 1000자 이내여야 합니다')
];

const feedbackValidation = [
  body('sessionId')
    .isUUID()
    .withMessage('유효한 세션 ID가 필요합니다'),
  body('userSatisfaction')
    .isInt({ min: 1, max: 5 })
    .withMessage('만족도는 1-5 사이여야 합니다'),
  body('helpfulnessRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('도움 정도는 1-5 사이여야 합니다'),
  body('feedback')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('피드백은 1000자 이내여야 합니다')
];

// ====================================
// SESSION MANAGEMENT ROUTES
// ====================================

/**
 * POST /api/art-counselor/session
 * Start a new art therapy session or continue existing one
 */
router.post('/session',
  counselorLimiter,
  checkSessionLimits,
  sessionValidation,
  validateRequest,
  artCounselorController.startSession
);

/**
 * GET /api/art-counselor/session/:sessionId
 * Get session details and conversation history
 */
router.get('/session/:sessionId',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID가 필요합니다')
  ],
  validateRequest,
  artCounselorController.getSession
);

/**
 * POST /api/art-counselor/session/:sessionId/message
 * Send message to counselor in specific session
 */
router.post('/session/:sessionId/message',
  counselorLimiter,
  checkSessionLimits,
  [
    param('sessionId')
      .isUUID()
      .withMessage('Valid session ID required'),
    ...messageValidation
  ],
  validateRequest,
  analyzeMessageSafety,
  artCounselorController.sendMessage
);

/**
 * PUT /api/art-counselor/session/:sessionId/end
 * End therapy session and save summary
 */
router.put('/session/:sessionId/end',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID가 필요합니다'),
    body('finalEmotionalState')
      .optional()
      .isObject()
      .withMessage('최종 감정 상태는 객체여야 합니다'),
    body('sessionSummary')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('세션 요약은 2000자 이내여야 합니다')
  ],
  validateRequest,
  artCounselorController.endSession
);

// ====================================
// DAILY ART RECOMMENDATIONS (Legacy)
// ====================================

/**
 * GET /api/art-counselor/daily-art
 * Get today's personalized artwork recommendation (Legacy)
 */
router.get('/daily-art',
  artCounselorController.getDailyArtRecommendation
);

// ====================================
// SUPABASE-BASED ART COUNSELOR ROUTES
// ====================================

/**
 * GET /api/art-counselor/today
 * Get today's artwork recommendation (Supabase-based)
 */
router.get('/today',
  artCounselorController.getTodaysArtwork
);

/**
 * GET /api/art-counselor/artwork/:artworkId/presentation
 * Generate artwork presentation for specific artwork
 */
router.get('/artwork/:artworkId/presentation',
  [
    param('artworkId')
      .isUUID()
      .withMessage('유효한 작품 ID가 필요합니다')
  ],
  validateRequest,
  artCounselorController.getArtworkPresentation
);

/**
 * POST /api/art-counselor/journal
 * Save journal entry for artwork
 */
router.post('/journal',
  counselorLimiter,
  [
    body('artworkId')
      .isUUID()
      .withMessage('유효한 작품 ID가 필요합니다'),
    body('entry')
      .isObject()
      .withMessage('감상 기록은 객체여야 합니다'),
    body('entry.firstImpression')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('첫인상은 500자 이내여야 합니다'),
    body('entry.personalConnection')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('개인적 연결은 500자 이내여야 합니다'),
    body('entry.newDiscovery')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('새로운 발견은 500자 이내여야 합니다'),
    body('entry.questionToArtist')
      .optional()
      .isString()
      .isLength({ max: 300 })
      .withMessage('작가에게 하고 싶은 말은 300자 이내여야 합니다'),
    body('entry.moodTags')
      .optional()
      .isArray()
      .withMessage('기분 태그는 배열이어야 합니다'),
    body('entry.colorSelections')
      .optional()
      .isArray()
      .withMessage('색상 선택은 배열이어야 합니다')
  ],
  validateRequest,
  artCounselorController.saveJournalEntry
);

/**
 * GET /api/art-counselor/collection
 * Get user's artwork collection and journal entries
 */
router.get('/collection',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('제한값은 1-50 사이여야 합니다')
  ],
  validateRequest,
  artCounselorController.getUserCollection
);

/**
 * GET /api/art-counselor/artworks
 * Get all available artworks
 */
router.get('/artworks',
  artCounselorController.getAllArtworks
);

/**
 * POST /api/art-counselor/daily-art/:recommendationId/view
 * Mark daily recommendation as viewed
 */
router.post('/daily-art/:recommendationId/view',
  [
    param('recommendationId')
      .isUUID()
      .withMessage('유효한 추천 ID가 필요합니다'),
    body('interactionTimeSeconds')
      .optional()
      .isInt({ min: 0 })
      .withMessage('상호작용 시간은 양의 정수여야 합니다')
  ],
  validateRequest,
  artCounselorController.markRecommendationViewed
);

/**
 * POST /api/art-counselor/daily-art/:recommendationId/feedback
 * Provide feedback on daily art recommendation
 */
router.post('/daily-art/:recommendationId/feedback',
  [
    param('recommendationId')
      .isUUID()
      .withMessage('유효한 추천 ID가 필요합니다'),
    body('helpfulnessRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('도움 정도는 1-5 사이여야 합니다'),
    body('emotionalImpact')
      .isIn(['positive', 'negative', 'neutral', 'mixed'])
      .withMessage('유효하지 않은 감정적 영향입니다')
  ],
  validateRequest,
  artCounselorController.provideDailyArtFeedback
);

// ====================================
// EMOTIONAL RESPONSE RECORDING
// ====================================

/**
 * POST /api/art-counselor/response
 * Record emotional response to artwork
 */
router.post('/response',
  counselorLimiter,
  [
    body('artworkId')
      .notEmpty()
      .withMessage('작품 ID가 필요합니다'),
    body('artworkTitle')
      .optional()
      .isString(),
    body('artworkArtist')
      .optional()
      .isString(),
    ...responseValidation
  ],
  validateRequest,
  artCounselorController.recordEmotionalResponse
);

/**
 * GET /api/art-counselor/response/history
 * Get user's emotional response history
 */
router.get('/response/history',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('제한값은 1-100 사이여야 합니다'),
    query('artworkId')
      .optional()
      .isString(),
    query('therapeuticTheme')
      .optional()
      .isString()
  ],
  validateRequest,
  artCounselorController.getResponseHistory
);

// ====================================
// MEMORY AND CONVERSATION HISTORY
// ====================================

/**
 * GET /api/art-counselor/memory
 * Retrieve conversation history and memories
 */
router.get('/memory',
  [
    query('sessionId')
      .optional()
      .isUUID()
      .withMessage('유효한 세션 ID여야 합니다'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('제한값은 1-50 사이여야 합니다'),
    query('theme')
      .optional()
      .isString()
  ],
  validateRequest,
  artCounselorController.getConversationMemory
);

/**
 * POST /api/art-counselor/memory/search
 * Search conversation memory using semantic similarity
 */
router.post('/memory/search',
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('검색 쿼리가 필요합니다')
      .isLength({ max: 500 })
      .withMessage('쿼리는 500자 이내여야 합니다'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('제한값은 1-20 사이여야 합니다')
  ],
  validateRequest,
  artCounselorController.searchMemory
);

// ====================================
// USER PREFERENCES AND PROFILE
// ====================================

/**
 * GET /api/art-counselor/profile
 * Get user's emotional profile and counselor preferences
 */
router.get('/profile',
  artCounselorController.getEmotionalProfile
);

/**
 * PUT /api/art-counselor/profile
 * Update emotional profile and preferences
 */
router.put('/profile',
  [
    body('therapeuticGoals')
      .optional()
      .isArray()
      .withMessage('치료 목표는 배열이어야 합니다'),
    body('conversationStyle')
      .optional()
      .isIn(['supportive', 'analytical', 'creative', 'gentle'])
      .withMessage('유효하지 않은 대화 스타일입니다'),
    body('communicationPace')
      .optional()
      .isIn(['slow', 'moderate', 'fast'])
      .withMessage('유효하지 않은 대화 속도입니다'),
    body('preferredTherapeuticApproaches')
      .optional()
      .isArray()
      .withMessage('선호 치료 접근법은 배열이어야 합니다')
  ],
  validateRequest,
  artCounselorController.updateEmotionalProfile
);

/**
 * PUT /api/art-counselor/preferences
 * Update counselor interaction preferences
 */
router.put('/preferences',
  [
    body('preferredCounselorPersona')
      .optional()
      .isString(),
    body('communicationFormality')
      .optional()
      .isIn(['formal', 'casual', 'friendly'])
      .withMessage('유효하지 않은 격식 수준입니다'),
    body('crisisSupportEnabled')
      .optional()
      .isBoolean(),
    body('triggerWarningsEnabled')
      .optional()
      .isBoolean(),
    body('communitySharing')
      .optional()
      .isBoolean()
  ],
  validateRequest,
  artCounselorController.updatePreferences
);

// ====================================
// SESSION FEEDBACK AND ANALYTICS
// ====================================

/**
 * POST /api/art-counselor/feedback
 * Provide feedback on counselor session
 */
router.post('/feedback',
  feedbackValidation,
  validateRequest,
  artCounselorController.provideFeedback
);

/**
 * GET /api/art-counselor/insights
 * Get personal therapeutic insights and progress
 */
router.get('/insights',
  [
    query('timeframe')
      .optional()
      .isIn(['week', 'month', 'quarter', 'year'])
      .withMessage('유효하지 않은 시간 범위입니다')
  ],
  validateRequest,
  artCounselorController.getTherapeuticInsights
);

/**
 * GET /api/art-counselor/progress
 * Get emotional progress tracking
 */
router.get('/progress',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('유효한 시작 날짜가 필요합니다'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('유효한 종료 날짜가 필요합니다')
  ],
  validateRequest,
  artCounselorController.getEmotionalProgress
);

// ====================================
// EMERGENCY AND CRISIS SUPPORT
// ====================================

/**
 * POST /api/art-counselor/crisis
 * Access crisis support resources (higher priority, no rate limit)
 */
router.post('/crisis',
  [
    body('immediateNeed')
      .isBoolean()
      .withMessage('즉시 도움 필요 여부를 명시해야 합니다'),
    body('safetyLevel')
      .isIn(['safe', 'at_risk', 'immediate_danger'])
      .withMessage('유효하지 않은 안전 수준입니다'),
    body('message')
      .optional()
      .isString()
      .isLength({ max: 1000 })
  ],
  validateRequest,
  artCounselorController.provideCrisisSupport
);

// ====================================
// HEALTH AND MONITORING
// ====================================

/**
 * GET /api/art-counselor/health
 * Health check for art counselor service
 */
router.get('/health',
  artCounselorController.healthCheck
);

/**
 * GET /api/art-counselor/stats
 * Get service usage statistics (admin only)
 */
router.get('/stats',
  authMiddleware.adminMiddleware,
  artCounselorController.getServiceStats
);

module.exports = router;
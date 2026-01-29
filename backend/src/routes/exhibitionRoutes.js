const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionControllerPG');
const authMiddleware = require('../middleware/auth');
const CultureAPIService = require('../services/cultureAPIService');

// Import rate limiters
const {
  exhibitionLimiter,
  museumApiLimiter,
  realtimeLimiter
} = require('../middleware/rateLimiter');

// Import enhanced security middleware
const {
  queryComplexityLimit,
  anomalyDetection
} = require('../middleware/securityEnhanced');

const cultureAPI = new CultureAPIService();

// Enhanced validation middleware
const {
  exhibitionValidation,
  exhibitionSubmissionValidation,
  exhibitionQueryValidation,
  exhibitionIdValidation,
  exhibitionInteractionValidation,
  handleExhibitionValidationResult,
  sanitizeExhibitionInput,
  submissionRateLimit
} = require('../middleware/exhibitionValidation');

// Security middleware
const {
  securityHeaders,
  requestSizeValidator,
  securityAuditLogger
} = require('../middleware/securityEnhancements');

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(securityAuditLogger);
router.use(sanitizeExhibitionInput);
router.use(anomalyDetection);

// 전시 목록 조회 (필터링, 페이지네이션 지원)
router.get('/exhibitions',
  exhibitionLimiter,
  queryComplexityLimit(500),
  exhibitionQueryValidation,
  handleExhibitionValidationResult,
  exhibitionController.getExhibitions
);

// 특정 전시 조회
router.get('/exhibitions/:id',
  exhibitionLimiter,
  exhibitionIdValidation,
  handleExhibitionValidationResult,
  exhibitionController.getExhibition
);

// 전시 좋아요/좋아요 취소 (인증 필요)
router.post('/exhibitions/:id/like',
  authMiddleware,
  exhibitionInteractionValidation,
  handleExhibitionValidationResult,
  exhibitionController.likeExhibition
);

// 전시 제출 (사용자 제출) - 레이트 리미팅 적용
router.post('/exhibitions/submit',
  submissionRateLimit,
  exhibitionSubmissionValidation,
  handleExhibitionValidationResult,
  exhibitionController.submitExhibition
);

// TODO: These routes need exhibitionController.js functions (currently using exhibitionControllerPG.js)
// Temporarily disabled until controller unification

// // 도시별 전시 통계
// router.get('/exhibitions/stats/cities',
//   exhibitionLimiter,
//   exhibitionController.getCityStats
// );

// // 인기 전시 조회
// router.get('/exhibitions/popular',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getPopularExhibitions
// );

// // 진행중인 전시 조회
// router.get('/exhibitions/ongoing',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getOngoingExhibitions
// );

// // 다가오는 전시 조회
// router.get('/exhibitions/upcoming',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getUpcomingExhibitions
// );

// // 트렌딩 전시 조회
// router.get('/exhibitions/trending',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getTrendingExhibitions
// );

// // SAYU 개성별 추천 전시
// router.get('/exhibitions/personality-recommendations',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getPersonalityRecommendations
// );

// // 장소(venue) 목록 조회
// router.get('/venues',
//   exhibitionLimiter,
//   exhibitionQueryValidation,
//   handleExhibitionValidationResult,
//   exhibitionController.getVenues
// );

// =========================
// 새로운 실시간 전시 정보 API
// =========================

/**
 * GET /api/exhibitions/live
 * 실시간 전시 정보 수집 및 반환
 */
router.get('/live',
  realtimeLimiter,
  museumApiLimiter, // Double protection for expensive operations
  async (req, res) => {
    try {
      console.log('📡 실시간 전시 정보 요청 받음');

      const result = await cultureAPI.collectAllExhibitions();

      if (result.success) {
        res.json({
          success: true,
          exhibitions: result.data,
          meta: result.meta,
          message: `${result.data.length}개의 전시 정보를 수집했습니다.`
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          exhibitions: [],
          meta: result.meta
        });
      }
    } catch (error) {
      console.error('전시 정보 API 오류:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        exhibitions: []
      });
    }
  });

/**
 * GET /api/exhibitions/culture-api
 * 문화데이터광장 API만 사용
 */
router.get('/culture-api',
  museumApiLimiter,
  async (req, res) => {
    try {
      const exhibitions = await cultureAPI.getExhibitionsFromAPI(req.query);

      res.json({
        success: true,
        exhibitions,
        count: exhibitions.length,
        source: 'culture_api'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

/**
 * GET /api/exhibitions/api-status
 * API 키 상태 및 시스템 상태 확인
 */
router.get('/api-status',
  exhibitionLimiter,
  async (req, res) => {
    try {
      const keyValidation = cultureAPI.validateAPIKeys();

      res.json({
        success: true,
        apiKeys: keyValidation,
        system: {
          puppeteerAvailable: true,
          cheerioAvailable: true,
          axiosAvailable: true
        },
        endpoints: [
          'GET /api/exhibitions/live - 통합 전시 정보',
          'GET /api/exhibitions/culture-api - 문화데이터광장 API',
          'GET /api/exhibitions/api-status - 시스템 상태'
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

module.exports = router;

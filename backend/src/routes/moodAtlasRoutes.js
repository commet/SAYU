const express = require('express');
const router = express.Router();
const moodAtlasController = require('../controllers/moodAtlasController');
const { authenticateToken } = require('../middleware/auth');

// All Mood Atlas routes require authentication
router.use(authenticateToken);

// ============================================================================
// 1. Emotion journal & recommendations
// ============================================================================
router.post('/recommend', moodAtlasController.recommendArtworks);
router.post('/entry', moodAtlasController.createEntry);
router.get('/entry/today', moodAtlasController.getTodayEntry);
router.get('/entry/:date', moodAtlasController.getDateEntry);
router.post('/entries/:entryId/complete', moodAtlasController.completeEntry);
router.post('/capsules', moodAtlasController.createCapsule);
router.get('/capsules', moodAtlasController.listCapsules);
router.patch('/capsules/:capsuleId/status', moodAtlasController.updateCapsuleStatus);

// ============================================================================
// 2. Progress & region roadmap
// ============================================================================
router.get('/progress', moodAtlasController.getProgress);
router.get('/map', moodAtlasController.getMapData);
router.get('/regions', moodAtlasController.getRegions);
router.get('/regions/:regionId', moodAtlasController.getRegionDetail);
router.post('/regions/select', moodAtlasController.selectRegion);

// ============================================================================
// 3. History & statistics
// ============================================================================
router.get('/history', moodAtlasController.getHistory);
router.get('/calendar/:year/:month', moodAtlasController.getMonthlyCalendar);
router.get('/statistics', moodAtlasController.getStatistics);

// ============================================================================
// 4. Artwork details
// ============================================================================
router.get('/artworks/:artworkId', moodAtlasController.getArtworkDetail);
router.get('/regions/:regionId/artworks', moodAtlasController.getRegionArtworks);

// ============================================================================
// 5. Interactive engagement & counselor bridge
// ============================================================================
router.post('/interactions', moodAtlasController.saveInteraction);
router.post('/counselor/message', moodAtlasController.counselorMessage);
router.get('/artworks/:artworkId/personalized', moodAtlasController.getPersonalizedInfo);
router.post('/info-layer-view', moodAtlasController.recordInfoView);
router.post('/memo-suggestions', moodAtlasController.generateMemoSuggestions);

module.exports = router;

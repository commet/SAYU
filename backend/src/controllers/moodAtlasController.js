const moodAtlasService = require('../services/moodAtlasService');

class MoodAtlasController {
  // ============================================================================
  // 1. 감정 기록 & 추천
  // ============================================================================

  /**
   * AI 작품 추천
   * POST /api/mood-atlas/recommend
   * Body: { emotionColor, emotionIntensity }
   */
  async recommendArtworks(req, res, next) {
    try {
      const { userId } = req.user;
      const { emotionColor, emotionIntensity } = req.body;

      if (!emotionColor || emotionIntensity === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: emotionColor, emotionIntensity'
        });
      }

      // AI 작품 추천 (Groq)
      const recommendations = await moodAtlasService.getArtworkRecommendations(
        userId,
        emotionColor,
        emotionIntensity
      );

      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 일일 감정 기록
   * POST /api/mood-atlas/entry
   * Body: { emotionColor, emotionIntensity, selectedArtworkId, userMemo }
   */
  async createEntry(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        emotionColor,
        emotionIntensity,
        isComplex,
        colorSecondary,
        selectedArtworkId,
        recommendedArtworks,
        userMemo
      } = req.body;

      if (!emotionColor || emotionIntensity === undefined || !selectedArtworkId) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      // 감정 기록 생성 + 진행 상황 업데이트
      const result = await moodAtlasService.createDailyEntry(userId, {
        emotionColor,
        emotionIntensity,
        isComplex,
        colorSecondary,
        selectedArtworkId,
        recommendedArtworks,
        userMemo
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 오늘의 기록 조회
   * GET /api/mood-atlas/entry/today
   */
  async getTodayEntry(req, res, next) {
    try {
      const { userId } = req.user;
      const today = new Date().toISOString().split('T')[0];

      const entry = await moodAtlasService.getDailyEntry(userId, today);
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 특정 날짜 기록 조회
   * GET /api/mood-atlas/entry/:date
   */
  async getDateEntry(req, res, next) {
    try {
      const { userId } = req.user;
      const { date } = req.params;

      const entry = await moodAtlasService.getDailyEntry(userId, date);
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 2. 진행 상황 & 지도
  // ============================================================================

  /**
   * 사용자 진행 상황
   * GET /api/mood-atlas/progress
   */
  async getProgress(req, res, next) {
    try {
      const { userId } = req.user;

      const progress = await moodAtlasService.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 지도 데이터
   * GET /api/mood-atlas/map
   */
  async getMapData(req, res, next) {
    try {
      const { userId } = req.user;

      const mapData = await moodAtlasService.getFullMapData(userId);
      res.json(mapData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 지역 목록
   * GET /api/mood-atlas/regions
   */
  async getRegions(req, res, next) {
    try {
      const regions = await moodAtlasService.getAllRegions();
      res.json(regions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 특정 지역 상세 정보
   * GET /api/mood-atlas/regions/:regionId
   */
  async getRegionDetail(req, res, next) {
    try {
      const { regionId } = req.params;

      const region = await moodAtlasService.getRegionById(regionId);

      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }

      res.json(region);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 지역 선택 (분기점)
   * POST /api/mood-atlas/regions/select
   * Body: { regionId }
   */
  async selectRegion(req, res, next) {
    try {
      const { userId } = req.user;
      const { regionId } = req.body;

      if (!regionId) {
        return res.status(400).json({ error: 'Missing regionId' });
      }

      const result = await moodAtlasService.selectNextRegion(userId, regionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 3. 히스토리 & 통계
  // ============================================================================

  /**
   * 감정 기록 히스토리
   * GET /api/mood-atlas/history?limit=30&offset=0
   */
  async getHistory(req, res, next) {
    try {
      const { userId } = req.user;
      const { limit = 30, offset = 0 } = req.query;

      const history = await moodAtlasService.getUserHistory(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 월별 캘린더
   * GET /api/mood-atlas/calendar/:year/:month
   */
  async getMonthlyCalendar(req, res, next) {
    try {
      const { userId } = req.user;
      const { year, month } = req.params;

      const calendar = await moodAtlasService.getMonthlyCalendar(
        userId,
        parseInt(year),
        parseInt(month)
      );

      res.json(calendar);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 감정 통계
   * GET /api/mood-atlas/statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { userId } = req.user;

      const stats = await moodAtlasService.getUserStatistics(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 4. 작품 정보
  // ============================================================================

  /**
   * 작품 상세 정보
   * GET /api/mood-atlas/artworks/:artworkId
   */
  async getArtworkDetail(req, res, next) {
    try {
      const { artworkId } = req.params;

      const artwork = await moodAtlasService.getArtworkById(artworkId);

      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      res.json(artwork);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 지역별 작품 목록
   * GET /api/mood-atlas/regions/:regionId/artworks
   */
  async getRegionArtworks(req, res, next) {
    try {
      const { regionId } = req.params;

      const artworks = await moodAtlasService.getArtworksByRegion(regionId);
      res.json(artworks);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 5. Interactive engagement & counselor bridge
  // ============================================================================

  /**
   * Save artwork interaction data
   * POST /api/mood-atlas/interactions
   */
  async saveInteraction(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { artworkId, visualTouches = [], colorSelections = [], feelingTags = [] } = req.body;
      if (!artworkId || !Array.isArray(visualTouches) || visualTouches.length === 0) {
        return res.status(400).json({ error: 'artworkId and visualTouches are required.' });
      }

      const result = await moodAtlasService.saveInteraction(userId, {
        artworkId,
        visualTouches,
        colorSelections,
        feelingTags,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Counselor chat entry (Opening/Connection)
   * POST /api/mood-atlas/counselor/message
   */
  async counselorMessage(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId, interactionId, stage = 'opening', message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'message is required.' });
      }

      const response = await moodAtlasService.saveCounselorMessage(userId, {
        entryId,
        interactionId,
        stage,
        message,
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Personalized information layers for artwork
   * GET /api/mood-atlas/artworks/:artworkId/personalized
   */
  async getPersonalizedInfo(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { artworkId } = req.params;
      const info = await moodAtlasService.getPersonalizedArtworkInfo(userId, artworkId);

      if (!info) {
        return res.status(404).json({ error: 'Artwork not found.' });
      }

      res.json(info);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record info layer view
   * POST /api/mood-atlas/info-layer-view
   */
  async recordInfoView(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId, layerName, highlightedSections, timeSpent } = req.body;
      if (!entryId || !layerName) {
        return res.status(400).json({ error: 'entryId and layerName are required.' });
      }

      const view = await moodAtlasService.recordInfoLayerView(userId, {
        entryId,
        layerName,
        highlightedSections,
        timeSpent,
      });

      res.json(view);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate memo suggestions based on entry
   * POST /api/mood-atlas/memo-suggestions
   */
  async generateMemoSuggestions(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId } = req.body;
      if (!entryId) {
        return res.status(400).json({ error: 'entryId is required.' });
      }

      const suggestions = await moodAtlasService.generateMemoSuggestions(userId, entryId);
      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete a daily entry with engagement metrics
   * POST /api/mood-atlas/entries/:entryId/complete
   */
  async completeEntry(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId } = req.params;
      if (!entryId) {
        return res.status(400).json({ error: 'entryId is required.' });
      }

      const result = await moodAtlasService.completeEntry(userId, entryId, req.body || {});
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create an emotion capsule (P2P)
   * POST /api/mood-atlas/capsules
   */
  async createCapsule(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const capsule = await moodAtlasService.sendCapsule(userId, req.body || {});
      res.json(capsule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List capsules (inbox/outbox)
   * GET /api/mood-atlas/capsules?box=inbox|outbox
   */
  async listCapsules(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const box = req.query.box === 'outbox' ? 'outbox' : 'inbox';
      const capsules = await moodAtlasService.listCapsules(userId, box);
      res.json(capsules);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update capsule status
   * PATCH /api/mood-atlas/capsules/:capsuleId/status
   */
  async updateCapsuleStatus(req, res, next) {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { capsuleId } = req.params;
      const { status } = req.body || {};
      if (!capsuleId || !status) {
        return res.status(400).json({ error: 'capsuleId and status are required.' });
      }

      const capsule = await moodAtlasService.updateCapsuleStatus(userId, capsuleId, status);
      res.json(capsule);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MoodAtlasController();

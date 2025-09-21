/**
 * SAYU Daily Art Presentation Service
 * 매일 개인 맞춤형 예술 작품을 제공하는 엔진
 */

const { artworks, getRecommendedArtworks, getArtworkByEmotion } = require('../data/artworkDatabase');
const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

class DailyArtService {
  constructor() {
    this.artworkRotation = Object.keys(artworks);
    this.presentationCache = new Map();
  }

  /**
   * 오늘의 작품 선정 알고리즘
   */
  async selectDailyArtwork(userId) {
    try {
      const client = await pool.connect();

      // 1. 사용자 프로필 가져오기
      const userQuery = `
        SELECT
          u.personality_type,
          uep.current_emotions,
          uep.dominant_emotion,
          ujh.last_viewed_artworks,
          ujh.favorite_artists,
          ujh.emotional_journey
        FROM users u
        LEFT JOIN user_emotional_profiles uep ON u.id = uep.user_id
        LEFT JOIN user_art_journeys ujh ON u.id = ujh.user_id
        WHERE u.id = $1
      `;

      const userResult = await client.query(userQuery, [userId]);
      const userProfile = userResult.rows[0];

      // 2. 최근 본 작품 제외
      const recentArtworks = userProfile?.last_viewed_artworks || [];
      const availableArtworks = this.artworkRotation.filter(
        id => !recentArtworks.includes(id)
      );

      // 3. 선정 기준 적용
      let selectedArtworkId;

      if (userProfile?.personality_type) {
        // 성격 유형 기반 추천
        const recommended = getRecommendedArtworks(userProfile.personality_type);
        selectedArtworkId = recommended.find(id => availableArtworks.includes(id));
      }

      if (!selectedArtworkId && userProfile?.dominant_emotion) {
        // 감정 기반 추천
        const emotionalMatches = getArtworkByEmotion(userProfile.dominant_emotion);
        selectedArtworkId = emotionalMatches.find(id => availableArtworks.includes(id));
      }

      if (!selectedArtworkId) {
        // 기본 로테이션
        selectedArtworkId = this.getNextInRotation(userId, availableArtworks);
      }

      // 4. 선정 기록
      await this.recordArtworkSelection(userId, selectedArtworkId, client);

      client.release();
      return selectedArtworkId;

    } catch (error) {
      logger.error('Error selecting daily artwork:', error);
      return this.getFallbackArtwork();
    }
  }

  /**
   * 성격 유형에 맞춘 프레젠테이션 생성
   */
  async generatePresentation(artworkId, userId) {
    try {
      const artwork = artworks[artworkId];
      if (!artwork) {
        throw new Error(`Artwork ${artworkId} not found`);
      }

      // 사용자 성격 유형 조회
      const client = await pool.connect();
      const userQuery = `
        SELECT personality_type, preferred_depth, language_preference
        FROM users
        WHERE id = $1
      `;
      const userResult = await client.query(userQuery, [userId]);
      const user = userResult.rows[0];
      client.release();

      const personalityType = user?.personality_type || 'LAEF';
      const approach = artwork.personalityApproaches[personalityType];

      // 프레젠테이션 구성
      const presentation = {
        // 1. Visual First - 이미지와 기본 정보
        visual: {
          imageUrl: artwork.metadata.imageUrl,
          title: artwork.metadata.title,
          artist: artwork.metadata.artist,
          year: artwork.metadata.year,
          zoomPoints: this.generateZoomPoints(artworkId)
        },

        // 2. Progressive Information Layers
        layers: [
          {
            level: 1,
            type: "hook",
            content: artwork.basePresentation.hook,
            readTime: "30초"
          },
          {
            level: 2,
            type: "personality",
            content: approach.opening,
            readTime: "1분"
          },
          {
            level: 3,
            type: "funFacts",
            content: artwork.basePresentation.funFacts,
            readTime: "2분"
          },
          {
            level: 4,
            type: "interpretation",
            content: approach.interpretation,
            readTime: "3분"
          },
          {
            level: 5,
            type: "technique",
            content: artwork.basePresentation.technique,
            readTime: "2분"
          }
        ],

        // 3. Engagement Options
        engagement: {
          questions: approach.questions,
          journalPrompt: approach.journalPrompt,
          focus: approach.focus,
          suggestedActions: [
            { icon: "💭", text: "나의 감상 기록하기", action: "journal" },
            { icon: "💬", text: "더 깊은 이야기", action: "chat" },
            { icon: "👥", text: "다른 감상 보기", action: "community" },
            { icon: "🔍", text: "디테일 탐험", action: "explore" }
          ]
        },

        // 4. Emotional Journey Map
        emotionalPath: artwork.emotionalJourney,

        // 5. Related Content
        related: {
          sameArtist: this.getArtworksByArtist(artwork.metadata.artist),
          sameStyle: this.getArtworksByStyle(artwork.metadata.style),
          sameEmotion: this.getArtworksByEmotion(artwork.emotionalJourney.entry[0])
        }
      };

      return presentation;

    } catch (error) {
      logger.error('Error generating presentation:', error);
      throw error;
    }
  }

  /**
   * 작품의 주요 관찰 포인트 생성
   */
  generateZoomPoints(artworkId) {
    const zoomMap = {
      "starry-night": [
        { x: 30, y: 20, label: "소용돌이의 중심", description: "11개의 회전이 만드는 우주적 리듬" },
        { x: 60, y: 70, label: "마을의 불빛", description: "각기 다른 색온도의 창문들" },
        { x: 15, y: 50, label: "사이프러스 나무", description: "불꽃처럼 타오르는 생명력" }
      ],
      "water-lilies": [
        { x: 50, y: 40, label: "수면의 반사", description: "물과 하늘이 만나는 경계" },
        { x: 70, y: 60, label: "수련의 붓터치", description: "짧고 빠른 터치가 만드는 빛" },
        { x: 20, y: 30, label: "깊이의 환상", description: "전경과 후경의 구분이 사라지는 지점" }
      ]
      // ... 각 작품별 zoom points
    };

    return zoomMap[artworkId] || [];
  }

  /**
   * 일일 작품 기록
   */
  async recordArtworkSelection(userId, artworkId, client) {
    try {
      // 1. daily_art_presentations 테이블에 기록
      const insertQuery = `
        INSERT INTO daily_art_presentations (
          user_id, artwork_id, presented_at, selection_reason
        ) VALUES ($1, $2, $3, $4)
      `;

      await client.query(insertQuery, [
        userId,
        artworkId,
        new Date(),
        'personality_match' // or 'emotion_match', 'rotation'
      ]);

      // 2. user_art_journeys 업데이트
      const updateQuery = `
        UPDATE user_art_journeys
        SET last_viewed_artworks =
          CASE
            WHEN array_length(last_viewed_artworks, 1) >= 7
            THEN array_append(last_viewed_artworks[2:], $2)
            ELSE array_append(COALESCE(last_viewed_artworks, '{}'), $2)
          END,
          total_artworks = COALESCE(total_artworks, 0) + 1
        WHERE user_id = $1
      `;

      await client.query(updateQuery, [userId, artworkId]);

    } catch (error) {
      logger.error('Error recording artwork selection:', error);
    }
  }

  /**
   * 관련 작품 찾기 헬퍼 함수들
   */
  getArtworksByArtist(artist) {
    return Object.entries(artworks)
      .filter(([_, artwork]) => artwork.metadata.artist === artist)
      .map(([id, _]) => id)
      .slice(0, 3);
  }

  getArtworksByStyle(style) {
    return Object.entries(artworks)
      .filter(([_, artwork]) => artwork.metadata.style === style)
      .map(([id, _]) => id)
      .slice(0, 3);
  }

  getArtworksByEmotion(emotion) {
    return getArtworkByEmotion(emotion).slice(0, 3);
  }

  /**
   * 기본 로테이션 알고리즘
   */
  getNextInRotation(userId, availableArtworks) {
    // 사용자 ID 기반 의사 난수로 일관된 순서 생성
    const userSeed = parseInt(userId.replace(/-/g, '').slice(0, 8), 16);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const index = (userSeed + dayOfYear) % availableArtworks.length;
    return availableArtworks[index];
  }

  /**
   * 폴백 작품 (에러 시)
   */
  getFallbackArtwork() {
    return "water-lilies"; // 모네의 수련은 universally calming
  }
}

module.exports = new DailyArtService();
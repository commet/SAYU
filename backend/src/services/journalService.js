/**
 * SAYU Personal Art Journal Service
 * 사용자의 예술 감상 기록을 관리하고 성장을 추적하는 시스템
 */

const { pool } = require('../config/database');
const { logger } = require('../utils/logger');
const OpenAI = require('openai');

class JournalService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * 저널 엔트리 생성
   */
  async createJournalEntry(userId, artworkId, entry) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. 기본 메타데이터 생성
      const metadata = await this.generateMetadata(userId, artworkId);

      // 2. 감정 분석 (사용자 입력 기반)
      const emotionAnalysis = await this.analyzeEmotions(entry);

      // 3. 저널 엔트리 저장
      const journalQuery = `
        INSERT INTO art_journals (
          id,
          user_id,
          artwork_id,

          -- User Content
          first_impression,
          personal_connection,
          new_discovery,
          question_to_artist,

          -- Quick Reactions
          mood_tags,
          color_selections,

          -- Metadata
          created_at,
          weather_data,
          time_of_day,
          session_number,

          -- AI Enrichment
          emotion_vector,
          writing_style,
          growth_indicators
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15
        ) RETURNING id
      `;

      const values = [
        userId,
        artworkId,
        entry.firstImpression || null,
        entry.personalConnection || null,
        entry.newDiscovery || null,
        entry.questionToArtist || null,
        entry.moodTags || [],
        entry.colorSelections || [],
        new Date(),
        metadata.weather,
        metadata.timeOfDay,
        metadata.sessionNumber,
        emotionAnalysis.vector,
        emotionAnalysis.writingStyle,
        emotionAnalysis.growthIndicators
      ];

      const result = await client.query(journalQuery, values);
      const journalId = result.rows[0].id;

      // 4. 사용자 여정 업데이트
      await this.updateUserJourney(userId, artworkId, emotionAnalysis, client);

      // 5. 패턴 인식 및 성장 추적
      await this.trackGrowthPatterns(userId, entry, client);

      await client.query('COMMIT');

      // 6. 풍부한 응답 생성
      const enrichedResponse = await this.generateEnrichedResponse(
        userId,
        journalId,
        entry,
        emotionAnalysis
      );

      return enrichedResponse;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating journal entry:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 감정 분석 및 벡터화
   */
  async analyzeEmotions(entry) {
    try {
      const textContent = [
        entry.firstImpression,
        entry.personalConnection,
        entry.newDiscovery,
        entry.questionToArtist
      ].filter(Boolean).join(' ');

      if (!textContent) {
        // 텍스트 없이 무드 태그만 있는 경우
        return this.analyzeFromMoodTags(entry.moodTags);
      }

      // OpenAI를 사용한 감정 분석
      const analysisPrompt = `
        Analyze the emotional content and writing style of this art journal entry:
        "${textContent}"

        Return a JSON with:
        1. emotions: object with scores (0-1) for: joy, sadness, surprise, fear, anger, contemplation, peace, inspiration
        2. writingStyle: {complexity: low/medium/high, tone: descriptive keywords, length: brief/moderate/detailed}
        3. growthIndicators: {emotionalDepth: 0-1, vocabularyRichness: 0-1, personalInsight: 0-1, artisticUnderstanding: 0-1}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      // 감정 벡터 생성 (임베딩)
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textContent
      });

      return {
        ...analysis,
        vector: JSON.stringify(embeddingResponse.data[0].embedding)
      };

    } catch (error) {
      logger.error('Error analyzing emotions:', error);
      return this.getDefaultEmotionAnalysis();
    }
  }

  /**
   * 사용자 여정 업데이트
   */
  async updateUserJourney(userId, artworkId, emotionAnalysis, client) {
    try {
      // 기존 여정 데이터 조회
      const journeyQuery = `
        SELECT * FROM user_art_journeys
        WHERE user_id = $1
      `;
      const journeyResult = await client.query(journeyQuery, [userId]);
      let journey = journeyResult.rows[0];

      if (!journey) {
        // 첫 저널 엔트리 - 여정 시작
        await this.initializeUserJourney(userId, client);
        journey = { emotional_evolution: {}, preference_patterns: {} };
      }

      // 감정 진화 추적
      const emotionalEvolution = journey.emotional_evolution || {};
      const currentMonth = new Date().toISOString().slice(0, 7);

      if (!emotionalEvolution[currentMonth]) {
        emotionalEvolution[currentMonth] = {
          dominantEmotions: {},
          averageDepth: 0,
          entryCount: 0
        };
      }

      // 감정 스코어 누적
      for (const [emotion, score] of Object.entries(emotionAnalysis.emotions || {})) {
        emotionalEvolution[currentMonth].dominantEmotions[emotion] =
          (emotionalEvolution[currentMonth].dominantEmotions[emotion] || 0) + score;
      }

      emotionalEvolution[currentMonth].entryCount++;
      emotionalEvolution[currentMonth].averageDepth =
        ((emotionalEvolution[currentMonth].averageDepth * (emotionalEvolution[currentMonth].entryCount - 1)) +
          emotionAnalysis.growthIndicators.emotionalDepth) / emotionalEvolution[currentMonth].entryCount;

      // 업데이트 쿼리
      const updateQuery = `
        UPDATE user_art_journeys
        SET
          emotional_evolution = $2,
          last_journal_entry = $3,
          total_entries = COALESCE(total_entries, 0) + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;

      await client.query(updateQuery, [
        userId,
        JSON.stringify(emotionalEvolution),
        new Date()
      ]);

    } catch (error) {
      logger.error('Error updating user journey:', error);
    }
  }

  /**
   * 성장 패턴 추적
   */
  async trackGrowthPatterns(userId, entry, client) {
    try {
      // 최근 10개 엔트리와 비교
      const recentQuery = `
        SELECT
          writing_style,
          growth_indicators,
          created_at
        FROM art_journals
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const recentResult = await client.query(recentQuery, [userId]);
      const recentEntries = recentResult.rows;

      if (recentEntries.length < 3) {
        return; // 패턴 분석을 위한 충분한 데이터 없음
      }

      // 성장 지표 계산
      const patterns = {
        vocabularyGrowth: this.calculateVocabularyGrowth(recentEntries),
        emotionalRangeExpansion: this.calculateEmotionalRange(recentEntries),
        insightDepth: this.calculateInsightDepth(recentEntries),
        consistencyScore: this.calculateConsistency(recentEntries)
      };

      // 특별한 순간 감지
      if (patterns.vocabularyGrowth > 0.3) {
        await this.recordSpecialMoment(userId, 'vocabulary_breakthrough', client);
      }

      if (patterns.emotionalRangeExpansion > 0.4) {
        await this.recordSpecialMoment(userId, 'emotional_expansion', client);
      }

    } catch (error) {
      logger.error('Error tracking growth patterns:', error);
    }
  }

  /**
   * 풍부한 응답 생성
   */
  async generateEnrichedResponse(userId, journalId, entry, emotionAnalysis) {
    try {
      // 개인화된 피드백 생성
      const feedback = await this.generatePersonalizedFeedback(entry, emotionAnalysis);

      // 관련 기억 검색
      const relatedMemories = await this.findRelatedMemories(userId, emotionAnalysis);

      // 다음 작품 추천
      const nextRecommendations = await this.generateNextRecommendations(userId, emotionAnalysis);

      return {
        journalId,
        feedback,
        insights: {
          emotionalTone: this.interpretEmotionalTone(emotionAnalysis),
          writingEvolution: this.assessWritingEvolution(emotionAnalysis),
          connectionStrength: this.measureConnectionStrength(entry)
        },
        memories: relatedMemories,
        recommendations: nextRecommendations,
        encouragement: this.generateEncouragement(emotionAnalysis)
      };

    } catch (error) {
      logger.error('Error generating enriched response:', error);
      return { journalId, message: "감상이 기록되었습니다." };
    }
  }

  /**
   * 개인화된 피드백 생성
   */
  async generatePersonalizedFeedback(entry, emotionAnalysis) {
    const depth = emotionAnalysis.growthIndicators?.emotionalDepth || 0.5;

    if (depth < 0.3) {
      return "짧지만 진솔한 감상이네요. 다음엔 어떤 색이 가장 마음에 드셨는지도 적어보세요.";
    } else if (depth < 0.7) {
      return "작품과의 개인적인 연결점을 찾으셨네요. 이런 발견이 쌓이면 나만의 미술관이 됩니다.";
    } else {
      return "깊이 있는 성찰이 인상적입니다. 당신의 시선이 작품에 새로운 의미를 더하고 있어요.";
    }
  }

  /**
   * 관련 기억 검색
   */
  async findRelatedMemories(userId, emotionAnalysis) {
    const client = await pool.connect();

    try {
      // 벡터 유사도 검색
      const query = `
        SELECT
          aj.artwork_id,
          aj.first_impression,
          aj.created_at,
          a.title,
          a.artist,
          1 - (aj.emotion_vector <=> $2::vector) as similarity
        FROM art_journals aj
        JOIN artworks a ON aj.artwork_id = a.id
        WHERE aj.user_id = $1
          AND aj.emotion_vector IS NOT NULL
        ORDER BY aj.emotion_vector <=> $2::vector
        LIMIT 3
      `;

      const result = await client.query(query, [userId, emotionAnalysis.vector]);
      return result.rows.filter(r => r.similarity > 0.7);

    } catch (error) {
      logger.error('Error finding related memories:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * 나의 컬렉션 조회
   */
  async getMyCollection(userId, filter = {}) {
    const client = await pool.connect();

    try {
      let query = `
        SELECT
          aj.*,
          a.title,
          a.artist,
          a.year,
          a.image_url
        FROM art_journals aj
        JOIN artworks a ON aj.artwork_id = a.id
        WHERE aj.user_id = $1
      `;

      const params = [userId];
      let paramIndex = 2;

      // 필터 적용
      if (filter.emotion) {
        query += ` AND $${paramIndex}::text = ANY(aj.mood_tags)`;
        params.push(filter.emotion);
        paramIndex++;
      }

      if (filter.dateFrom) {
        query += ` AND aj.created_at >= $${paramIndex}`;
        params.push(filter.dateFrom);
        paramIndex++;
      }

      if (filter.dateTo) {
        query += ` AND aj.created_at <= $${paramIndex}`;
        params.push(filter.dateTo);
        paramIndex++;
      }

      query += ` ORDER BY aj.created_at DESC`;

      const result = await client.query(query, params);

      // 통계 생성
      const stats = await this.generateCollectionStats(userId, client);

      return {
        entries: result.rows,
        total: result.rows.length,
        stats
      };

    } catch (error) {
      logger.error('Error getting collection:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 컬렉션 통계
   */
  async generateCollectionStats(userId, client) {
    const statsQuery = `
      SELECT
        COUNT(*) as total_entries,
        COUNT(DISTINCT artwork_id) as unique_artworks,
        array_agg(DISTINCT unnest(mood_tags)) as all_moods,
        AVG((growth_indicators->>'emotionalDepth')::float) as avg_depth
      FROM art_journals
      WHERE user_id = $1
    `;

    const result = await client.query(statsQuery, [userId]);
    return result.rows[0];
  }

  /**
   * 헬퍼 함수들
   */
  async generateMetadata(userId, artworkId) {
    // 날씨 API 연동 (OpenWeatherMap 등)
    const weather = await this.getWeatherData();

    // 시간대 판단
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour < 6) timeOfDay = 'dawn';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // 세션 번호 계산
    const sessionNumber = await this.getSessionNumber(userId, artworkId);

    return {
      weather,
      timeOfDay,
      sessionNumber
    };
  }

  async getWeatherData() {
    // 실제 구현시 OpenWeatherMap API 사용
    return {
      condition: 'sunny',
      temperature: 22,
      description: '맑음'
    };
  }

  async getSessionNumber(userId, artworkId) {
    // 같은 작품을 본 횟수
    const client = await pool.connect();
    const query = `
      SELECT COUNT(*) + 1 as session_number
      FROM art_journals
      WHERE user_id = $1 AND artwork_id = $2
    `;
    const result = await client.query(query, [userId, artworkId]);
    client.release();
    return result.rows[0].session_number;
  }

  analyzeFromMoodTags(moodTags = []) {
    // 무드 태그만으로 기본 분석
    const moodEmotionMap = {
      '평온': { peace: 0.8, contemplation: 0.5 },
      '설렘': { joy: 0.7, inspiration: 0.6 },
      '그리움': { sadness: 0.4, contemplation: 0.6 },
      '영감': { inspiration: 0.9, joy: 0.5 }
    };

    let emotions = {};
    moodTags.forEach(mood => {
      const mapped = moodEmotionMap[mood];
      if (mapped) {
        Object.entries(mapped).forEach(([emotion, score]) => {
          emotions[emotion] = (emotions[emotion] || 0) + score;
        });
      }
    });

    return {
      emotions,
      writingStyle: { complexity: 'low', tone: 'minimal' },
      growthIndicators: { emotionalDepth: 0.3 },
      vector: null
    };
  }

  getDefaultEmotionAnalysis() {
    return {
      emotions: { contemplation: 0.5 },
      writingStyle: { complexity: 'medium' },
      growthIndicators: { emotionalDepth: 0.5 },
      vector: null
    };
  }

  calculateVocabularyGrowth(entries) {
    // 어휘 다양성 증가율 계산
    return 0.2; // 실제 구현 필요
  }

  calculateEmotionalRange(entries) {
    // 감정 표현 범위 확장 계산
    return 0.3; // 실제 구현 필요
  }

  calculateInsightDepth(entries) {
    // 통찰 깊이 성장 계산
    return 0.25; // 실제 구현 필요
  }

  calculateConsistency(entries) {
    // 기록 일관성 점수
    return 0.8; // 실제 구현 필요
  }

  async recordSpecialMoment(userId, type, client) {
    // 특별한 성장 순간 기록
    const query = `
      UPDATE user_art_journeys
      SET special_moments = array_append(
        COALESCE(special_moments, '{}'),
        jsonb_build_object(
          'type', $2,
          'timestamp', $3
        )
      )
      WHERE user_id = $1
    `;

    await client.query(query, [userId, type, new Date()]);
  }

  interpretEmotionalTone(analysis) {
    const dominant = Object.entries(analysis.emotions || {})
      .sort(([, a], [, b]) => b - a)[0];
    return dominant ? dominant[0] : 'neutral';
  }

  assessWritingEvolution(analysis) {
    return analysis.writingStyle?.complexity || 'developing';
  }

  measureConnectionStrength(entry) {
    const hasPersonal = !!entry.personalConnection;
    const hasDiscovery = !!entry.newDiscovery;
    const hasQuestion = !!entry.questionToArtist;

    const score = [hasPersonal, hasDiscovery, hasQuestion].filter(Boolean).length;
    return ['weak', 'moderate', 'strong', 'deep'][score];
  }

  async generateNextRecommendations(userId, emotionAnalysis) {
    // 감정 분석 기반 다음 작품 추천
    return ['water-lilies', 'the-kiss', 'wanderer'];
  }

  generateEncouragement(analysis) {
    const depth = analysis.growthIndicators?.emotionalDepth || 0.5;

    if (depth > 0.7) {
      return "당신의 감상이 작품에 새로운 생명을 불어넣고 있어요.";
    } else if (depth > 0.4) {
      return "점점 더 깊어지는 당신의 시선이 아름답습니다.";
    } else {
      return "모든 감상은 소중해요. 계속 기록해보세요.";
    }
  }

  async initializeUserJourney(userId, client) {
    const query = `
      INSERT INTO user_art_journeys (
        user_id,
        total_artworks,
        total_entries,
        emotional_evolution,
        preference_patterns,
        created_at
      ) VALUES ($1, 0, 0, '{}', '{}', CURRENT_TIMESTAMP)
    `;

    await client.query(query, [userId]);
  }
}

module.exports = new JournalService();
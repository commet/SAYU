const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class MoodAtlasService {
  constructor() {
    // Groq AI 클라이언트
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = 'llama-3.1-70b-versatile'; // 또는 'mixtral-8x7b-32768'
  }

  // ============================================================================
  // 1. AI 작품 추천
  // ============================================================================

  /**
   * 감정 기반 AI 작품 추천
   */
  async getArtworkRecommendations(userId, emotionColor, emotionIntensity) {
    // 1. 현재 사용자 진행 상황 확인
    const progress = await this.getUserProgress(userId);
    const currentRegion = progress.current_region;

    // 2. 현재 지역의 작품 가져오기
    const { data: artworks, error } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('region', currentRegion);

    if (error) throw error;

    // 3. 감정 레벨 결정 (light, medium, deep)
    const emotionLevel = this.getEmotionLevel(emotionIntensity);
    const emotionKey = `${emotionColor}-${emotionLevel}`;

    // 4. 각 작품에 대해 AI 점수 계산
    const scoredArtworks = await Promise.all(
      artworks.map(async (artwork) => {
        const score = await this.calculateArtworkScore(
          artwork,
          emotionColor,
          emotionIntensity,
          emotionKey
        );
        return { ...artwork, aiScore: score };
      })
    );

    // 5. 점수 순으로 정렬하고 상위 3개 선택
    const topArtworks = scoredArtworks
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);

    // 6. 각 작품에 대한 AI 추천 이유 생성
    const recommendations = await Promise.all(
      topArtworks.map(async (artwork) => {
        const reason = await this.generateRecommendationReason(
          artwork,
          emotionColor,
          emotionIntensity
        );

        return {
          artworkId: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          imageUrl: artwork.image_url,
          thumbnailUrl: artwork.thumbnail_url,
          emotionMessage: artwork.emotions[emotionKey],
          aiReason: reason,
          score: artwork.aiScore
        };
      })
    );

    return recommendations;
  }

  /**
   * 감정 강도 → 레벨 변환
   */
  getEmotionLevel(intensity) {
    if (intensity <= 30) return 'light';
    if (intensity <= 60) return 'medium';
    return 'deep';
  }

  /**
   * AI로 작품 점수 계산
   */
  async calculateArtworkScore(artwork, emotionColor, emotionIntensity, emotionKey) {
    try {
      const prompt = `
당신은 감정과 예술 작품을 매칭하는 전문가입니다.

사용자 감정:
- 색상: ${emotionColor}
- 강도: ${emotionIntensity}%

작품 정보:
- 제목: ${artwork.title}
- 작가: ${artwork.artist}
- 태그: ${artwork.tags?.join(', ')}

작품이 이 감정에 얼마나 잘 어울리는지 0-100 점수로 평가하세요.
숫자만 답하세요.`.trim();

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.3,
        max_tokens: 10
      });

      const scoreText = completion.choices[0]?.message?.content?.trim();
      const score = parseInt(scoreText) || 50;

      return Math.min(Math.max(score, 0), 100);
    } catch (error) {
      console.error('AI 점수 계산 실패:', error);
      return 50; // 기본 점수
    }
  }

  /**
   * AI 추천 이유 생성
   */
  async generateRecommendationReason(artwork, emotionColor, emotionIntensity) {
    try {
      const emotionDescriptions = {
        blue: '평온하고 차분한 마음',
        red: '열정적이고 활기찬 에너지',
        yellow: '밝고 희망찬 기분',
        purple: '신비롭고 몽환적인 감정',
        green: '생동하고 조화로운 느낌',
        gray: '쓸쓸하고 고요한 마음'
      };

      const prompt = `
당신은 감정과 예술을 연결하는 친근한 큐레이터입니다.

사용자 상태:
- 감정: ${emotionDescriptions[emotionColor]}
- 강도: ${emotionIntensity}%

추천 작품:
- 제목: ${artwork.title}
- 작가: ${artwork.artist}

이 작품이 사용자의 감정에 어울리는 이유를 1-2문장으로 따뜻하게 설명해주세요.
"~할 거예요", "~해줄 거예요" 같은 친근한 말투를 사용하세요.`.trim();

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.7,
        max_tokens: 100
      });

      return completion.choices[0]?.message?.content?.trim() ||
             artwork.emotions[`${emotionColor}-${this.getEmotionLevel(emotionIntensity)}`];
    } catch (error) {
      console.error('AI 이유 생성 실패:', error);
      return artwork.emotions[`${emotionColor}-${this.getEmotionLevel(emotionIntensity)}`];
    }
  }

  // ============================================================================
  // 2. 일일 감정 기록
  // ============================================================================

  /**
   * 일일 감정 기록 생성
   */
  async createDailyEntry(userId, entryData) {
    const {
      emotionColor,
      emotionIntensity,
      isComplex = false,
      colorSecondary = null,
      selectedArtworkId,
      recommendedArtworks = [],
      userMemo = null
    } = entryData;

    // 1. 진행 상황 가져오기
    const progress = await this.getUserProgress(userId);
    const currentRegion = progress.current_region;

    // 2. 감정 레이블 생성
    const emotionLabel = this.getEmotionLabel(emotionColor, emotionIntensity);

    // 3. 선택한 작품 정보 가져오기
    const { data: artwork } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('id', selectedArtworkId)
      .single();

    // 4. 감정 기록 저장
    const { data: entry, error: entryError } = await supabase
      .from('mood_atlas_entries')
      .insert({
        user_id: userId,
        emotion_color: emotionColor,
        emotion_intensity: emotionIntensity,
        emotion_label: emotionLabel,
        is_complex: isComplex,
        color_secondary: colorSecondary,
        recommended_artworks: recommendedArtworks,
        selected_artwork_id: selectedArtworkId,
        selected_artwork_data: artwork,
        user_memo: userMemo,
        region: currentRegion,
        tile_number: progress.total_tiles_filled + 1,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // 5. 진행 상황 업데이트
    const updatedProgress = await this.updateProgress(userId, emotionColor);

    // 6. 보상 확인
    const rewards = await this.checkRewards(userId, updatedProgress);

    return {
      entry,
      progress: updatedProgress,
      rewards
    };
  }

  /**
   * 감정 레이블 생성
   */
  getEmotionLabel(color, intensity) {
    const colorLabels = {
      blue: '파랑',
      red: '빨강',
      yellow: '노랑',
      purple: '보라',
      green: '초록',
      gray: '회색'
    };

    const levelLabels = {
      light: '연한',
      medium: '중간',
      deep: '진한'
    };

    const level = this.getEmotionLevel(intensity);
    return `${levelLabels[level]} ${colorLabels[color]}`;
  }

  /**
   * 진행 상황 업데이트
   */
  async updateProgress(userId, emotionColor) {
    const progress = await this.getUserProgress(userId);

    // 스트릭 계산
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;
    if (progress.last_entry_date === yesterday) {
      newStreak = (progress.current_streak || 0) + 1;
    }

    // 색상 분포 업데이트
    const colorDist = progress.color_distribution || {};
    colorDist[emotionColor] = (colorDist[emotionColor] || 0) + 1;

    // 복합 감정 해금 체크 (7일+)
    const complexUnlocked = progress.total_entries >= 6;
    const tripleUnlocked = progress.total_entries >= 29;

    const { data, error } = await supabase
      .from('mood_atlas_progress')
      .update({
        total_entries: (progress.total_entries || 0) + 1,
        total_tiles_filled: (progress.total_tiles_filled || 0) + 1,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak || 0),
        last_entry_date: today,
        color_distribution: colorDist,
        complex_emotion_unlocked: complexUnlocked,
        triple_emotion_unlocked: tripleUnlocked,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 보상 확인
   */
  async checkRewards(userId, progress) {
    const rewards = [];

    // 연속 기록 보상
    if (progress.current_streak === 3) {
      rewards.push({ type: 'streak', name: '3일 연속', points: 50 });
    } else if (progress.current_streak === 7) {
      rewards.push({ type: 'streak', name: '7일 연속', points: 200, badge: 'consistent-recorder' });
    } else if (progress.current_streak === 30) {
      rewards.push({ type: 'streak', name: '30일 연속', points: 1000, badge: 'mood-explorer' });
    } else if (progress.current_streak === 100) {
      rewards.push({ type: 'streak', name: '100일 연속', points: 3000, badge: 'mood-master' });
    }

    // 복합 감정 해금
    if (progress.total_entries === 7 && progress.complex_emotion_unlocked) {
      rewards.push({ type: 'unlock', name: '복합 감정 해금', feature: 'complex_emotion' });
    }

    // 지역 완료 체크
    const regionComplete = await this.checkRegionCompletion(userId, progress);
    if (regionComplete) {
      rewards.push(regionComplete);
    }

    return rewards;
  }

  /**
   * 지역 완료 체크
   */
  async checkRegionCompletion(userId, progress) {
    const { data: region } = await supabase
      .from('mood_atlas_regions')
      .select('*')
      .eq('id', progress.current_region)
      .single();

    if (!region) return null;

    // 현재 지역의 타일 수 확인
    const { data: entries } = await supabase
      .from('mood_atlas_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('region', progress.current_region);

    if (entries?.length >= region.total_tiles) {
      // 지역 완료!
      const reward = region.completion_reward;

      // completed_regions 업데이트
      const completedRegions = [...(progress.completed_regions || []), region.id];

      await supabase
        .from('mood_atlas_progress')
        .update({ completed_regions: completedRegions })
        .eq('user_id', userId);

      return {
        type: 'region_complete',
        region: region.name_ko,
        points: reward.points,
        badge: reward.badge,
        title: reward.title
      };
    }

    return null;
  }

  // ============================================================================
  // 3. 조회 함수들
  // ============================================================================

  /**
   * 사용자 진행 상황 조회
   */
  async getUserProgress(userId) {
    let { data: progress, error } = await supabase
      .from('mood_atlas_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 진행 상황이 없으면 생성
    if (!progress) {
      const { data: newProgress } = await supabase
        .from('mood_atlas_progress')
        .insert({
          user_id: userId,
          current_region: 'renaissance',
          current_day: 0
        })
        .select()
        .single();

      progress = newProgress;
    }

    return progress;
  }

  /**
   * 일일 감정 기록 조회
   */
  async getDailyEntry(userId, date) {
    const { data, error } = await supabase
      .from('mood_atlas_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = 결과 없음
    return data;
  }

  /**
   * 전체 지도 데이터
   */
  async getFullMapData(userId) {
    const progress = await this.getUserProgress(userId);
    const { data: regions } = await supabase
      .from('mood_atlas_regions')
      .select('*')
      .order('day_start', { ascending: true });

    const { data: entries } = await supabase
      .from('mood_atlas_entries')
      .select('id, region, tile_number, emotion_color, date')
      .eq('user_id', userId);

    return {
      progress,
      regions,
      entries: entries || []
    };
  }

  /**
   * 모든 지역 조회
   */
  async getAllRegions() {
    const { data, error } = await supabase
      .from('mood_atlas_regions')
      .select('*')
      .order('day_start', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * 지역 ID로 조회
   */
  async getRegionById(regionId) {
    const { data, error } = await supabase
      .from('mood_atlas_regions')
      .select('*')
      .eq('id', regionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 다음 지역 선택
   */
  async selectNextRegion(userId, regionId) {
    const { data, error } = await supabase
      .from('mood_atlas_progress')
      .update({ current_region: regionId })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 히스토리 조회
   */
  async getUserHistory(userId, limit = 30, offset = 0) {
    const { data, error } = await supabase
      .from('mood_atlas_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * 월별 캘린더
   */
  async getMonthlyCalendar(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mood_atlas_entries')
      .select('date, emotion_color, emotion_intensity, emotion_label')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * 통계 조회
   */
  async getUserStatistics(userId) {
    const progress = await this.getUserProgress(userId);
    const { data: entries } = await supabase
      .from('mood_atlas_entries')
      .select('emotion_color, region')
      .eq('user_id', userId);

    return {
      totalEntries: progress.total_entries || 0,
      currentStreak: progress.current_streak || 0,
      longestStreak: progress.longest_streak || 0,
      totalTilesFilled: progress.total_tiles_filled || 0,
      colorDistribution: progress.color_distribution || {},
      completedRegions: progress.completed_regions || [],
      currentRegion: progress.current_region
    };
  }

  /**
   * 작품 ID로 조회
   */
  async getArtworkById(artworkId) {
    const { data, error } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 지역별 작품 목록
   */
  async getArtworksByRegion(regionId) {
    const { data, error } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('region', regionId);

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // 5. Interactive engagement helpers
  // ============================================================================

  async saveInteraction(userId, { artworkId, visualTouches, colorSelections, feelingTags }) {
    const totalTouches = visualTouches.reduce((sum, touch) => sum + (touch.count || 0), 0);
    const normalizedTouches =
      totalTouches > 0
        ? visualTouches.map((touch) => ({
            ...touch,
            percentage: (touch.count || 0) / totalTouches,
          }))
        : visualTouches;

    const insights = this.buildInteractionInsights(
      normalizedTouches,
      colorSelections,
      feelingTags,
    );

    const { data, error } = await supabase
      .from('artwork_interactions')
      .insert({
        user_id: userId,
        artwork_id: artworkId,
        visual_touches: normalizedTouches,
        color_selections: colorSelections,
        feeling_tags: feelingTags,
        dominant_area: insights.dominantArea,
        dominant_colors: insights.dominantColors,
        interaction_summary: insights.summary,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      interactionId: data.id,
      summary: insights.summary,
      dominantArea: insights.dominantArea,
      dominantColors: insights.dominantColors,
    };
  }

  buildInteractionInsights(visualTouches, colorSelections, feelingTags) {
    const dominantArea = [...visualTouches].sort(
      (a, b) => (b.percentage || 0) - (a.percentage || 0),
    )[0]?.area;
    const dominantColors = (colorSelections || []).slice(0, 2);
    const summaryParts = [];

    if (dominantArea) summaryParts.push(`이 작품에서 ${dominantArea} 영역을 오래 바라봤어요.`);
    if (dominantColors.length)
      summaryParts.push(`특히 ${dominantColors.join(', ')} 색감에 끌렸습니다.`);
    if (feelingTags?.length) summaryParts.push(`느껴진 감정은 ${feelingTags.join(', ')} 입니다.`);

    return {
      dominantArea: dominantArea || null,
      dominantColors,
      summary: summaryParts.join(' ') || '작품 곳곳을 자유롭게 탐색하고 있습니다.',
    };
  }

  async saveCounselorMessage(userId, { entryId, interactionId, stage, message }) {
    const normalizedStage = ['opening', 'connection', 'complete'].includes(stage)
      ? stage
      : 'opening';
    const response = this.generateCounselorResponse(normalizedStage, message);

    const { data, error } = await supabase
      .from('counselor_conversations')
      .insert({
        entry_id: entryId || null,
        interaction_id: interactionId || null,
        stage: normalizedStage,
        user_message: message,
        ai_response: response.reply,
        insights: response.insights,
      })
      .select()
      .single();

    if (error) throw error;

    if (entryId && response.insights.length) {
      await this.appendEntryInsights(entryId, response.insights);
    }

    return {
      stage: normalizedStage,
      response: response.reply,
      followUp: response.followUp,
      insights: response.insights,
      conversationId: data.id,
    };
  }

  generateCounselorResponse(stage, message) {
    const trimmed = (message || '').trim();
    const insights = [];
    if (trimmed.length > 0) {
      insights.push(`"${trimmed.slice(0, 80)}"`);
    }

    if (stage === 'opening') {
      return {
        reply: `방금 느낀 감정을 이렇게 표현해줘서 고마워요. 조금 더 자세히 들려줄 수 있을까요?`,
        followUp: '어떤 부분이 가장 기억에 남나요?',
        insights,
      };
    }

    return {
      reply: '이 감정이 앞으로의 하루에 어떤 의미가 될지 잠시 떠올려 보세요.',
      followUp: '이 감정을 간직하고 싶은 순간이 있다면 어디에 남겨볼까요?',
      insights,
    };
  }

  async appendEntryInsights(entryId, newInsights) {
    const { data, error } = await supabase
      .from('mood_atlas_entries')
      .select('counselor_insights')
      .eq('id', entryId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return;

    const existing = data.counselor_insights || [];
    const merged = Array.from(new Set([...existing, ...newInsights]));

    await supabase
      .from('mood_atlas_entries')
      .update({ counselor_insights: merged })
      .eq('id', entryId);
  }

  async recordInfoLayerView(userId, { entryId, layerName, highlightedSections, timeSpent }) {
    const { data, error } = await supabase
      .from('info_layer_views')
      .insert({
        entry_id: entryId,
        user_id: userId,
        layer_name: layerName,
        highlighted_sections: highlightedSections || [],
        time_spent: timeSpent || 0,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: entry, error: entryError } = await supabase
      .from('mood_atlas_entries')
      .select('info_layers_viewed, info_exploration_time')
      .eq('id', entryId)
      .single();

    if (!entryError && entry) {
      const viewedLayers = entry.info_layers_viewed || [];
      if (!viewedLayers.includes(layerName)) {
        viewedLayers.push(layerName);
      }

      await supabase
        .from('mood_atlas_entries')
        .update({
          info_layers_viewed: viewedLayers,
          info_exploration_time: (entry.info_exploration_time || 0) + (timeSpent || 0),
        })
        .eq('id', entryId);
    }

    return data;
  }

  async getPersonalizedArtworkInfo(userId, artworkId) {
    const { data: artwork, error } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!artwork) return null;

    const { data: interactions } = await supabase
      .from('artwork_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('artwork_id', artworkId)
      .order('created_at', { ascending: false })
      .limit(5);

    const latest = interactions?.[0];

    const layers = [
      {
        id: 'basic',
        title: '기본 정보',
        summary: `${artwork.title} · ${artwork.artist} · ${artwork.year || '연도 미상'}`,
      },
      {
        id: 'artist_story',
        title: '작가 스토리',
        summary: artwork.artist_story || artwork.story || '이 작품에 얽힌 작가의 이야기를 정리 중입니다.',
      },
      {
        id: 'historical_context',
        title: '역사적 맥락',
        summary:
          artwork.historical_context ||
          '당시 예술 흐름 속에서 이 작품이 어떤 의미였는지 곧 추가됩니다.',
      },
      {
        id: 'technique',
        title: '기법 & 디테일',
        summary: artwork.technique || '화가가 사용한 기법을 정리하는 중입니다.',
      },
      {
        id: 'symbolism',
        title: '상징과 해석',
        summary: artwork.symbolism || artwork.fun_fact || '감춰진 상징에 대한 해석을 준비 중이에요.',
      },
    ];

    return {
      artwork: {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        region: artwork.region,
        imageUrl: artwork.image_url,
      },
      layers,
      highlights: {
        touches: latest?.visual_touches || [],
        colors: latest?.color_selections || [],
        feelings: latest?.feeling_tags || [],
      },
    };
  }

  async generateMemoSuggestions(userId, entryId) {
    const { data: entry, error } = await supabase
      .from('mood_atlas_entries')
      .select('id, user_id, emotion_color, emotion_intensity, selected_artwork_id, interaction_id')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const questions = [
      {
        q: `오늘 선택한 ${entry.emotion_color} 감정이 가장 진하게 느껴진 순간은 언제였나요?`,
        type: 'emotion',
      },
      {
        q: '방금 터치했던 작품의 디테일 중 다시 떠올리고 싶은 장면이 있나요?',
        type: 'interaction',
      },
      {
        q: '이 감정을 내일의 나와 공유한다면 어떤 말을 전해주고 싶나요?',
        type: 'future-self',
      },
    ];

    const { data: suggestion, error: insertError } = await supabase
      .from('memo_suggestions')
      .insert({
        entry_id: entryId,
        user_id: userId,
        questions,
        related_entries: [],
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return suggestion;
  }
}

module.exports = new MoodAtlasService();

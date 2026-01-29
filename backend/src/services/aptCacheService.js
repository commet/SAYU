// APT Cache Service - APT별 스마트 캐싱 시스템
const { getRedisClient } = require('../config/redis');
const APTVectorSystem = require('../models/aptVectorSystem');
const { SAYU_TYPES } = require('@sayu/shared');
const aptDataAccess = require('../models/aptDataAccess');

class APTCacheService {
  constructor() {
    this.vectorSystem = new APTVectorSystem();
    this.cacheConfig = {
      artworkTTL: 7200,        // 2시간 (작품 추천) - 증가
      exhibitionTTL: 14400,    // 4시간 (전시 추천) - 증가
      profileTTL: 172800,      // 48시간 (APT 프로필 데이터) - 증가
      trendingTTL: 3600,       // 1시간 (인기 콘텐츠) - 증가
      vectorTTL: 1209600,      // 14일 (벡터 데이터) - 증가
      warmupBatchSize: 100,    // 워밍업 시 배치 크기 - 증가
      // 새로운 캐시 설정
      similarUsersTTL: 10800,  // 3시간 (유사 사용자)
      matchingResultTTL: 21600, // 6시간 (매칭 결과)
      prefetchThreshold: 0.7,  // 70% 만료 시 프리페치
      maxCacheSize: 1000,      // 최대 캐시 항목 수
      compressionEnabled: true  // 벡터 압축 활성화
    };
    
    // LRU 캐시 관리를 위한 액세스 추적
    this.accessTracker = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      prefetches: 0
    };
    
    // 캐시 키 패턴
    this.cacheKeys = {
      aptArtworks: 'apt:artworks:',          // apt:artworks:LAEF
      aptExhibitions: 'apt:exhibitions:',    // apt:exhibitions:SRMC
      aptProfile: 'apt:profile:',            // apt:profile:LAEF
      aptVector: 'apt:vector:',              // apt:vector:LAEF
      aptTrending: 'apt:trending:',          // apt:trending:LAEF:daily
      userVector: 'user:vector:',            // user:vector:userId
      artworkVector: 'artwork:vector:',      // artwork:vector:artworkId
      globalStats: 'apt:stats:global'       // 전체 통계
    };
  }

  // ==================== 초기화 및 워밍업 ====================
  
  async initialize() {
    console.log('🚀 APT 캐시 시스템 초기화 시작...');
    
    try {
      // 병렬 초기화로 시작 시간 단축
      await Promise.all([
        this.vectorSystem.initializePrototypes(),
        this.initializeCacheMonitoring(),
        this.setupCacheEvictionPolicy()
      ]);
      
      // 병렬 캐싱 작업
      await Promise.all([
        this.cachePrototypeVectors(),
        this.warmupPopularContent(),
        this.preloadFrequentPatterns()
      ]);
      
      // 예측적 캐싱 스케줄러 시작
      this.startPredictiveCaching();
      
      console.log('✅ APT 캐시 시스템 초기화 완료');
    } catch (error) {
      console.error('❌ APT 캐시 초기화 실패:', error);
      // 캐시 없이도 시스템이 동작하도록 함
    }
  }

  async cachePrototypeVectors() {
    const redis = getRedisClient();
    if (!redis) return null;
    const pipeline = redis.pipeline();
    
    for (const typeCode of Object.keys(SAYU_TYPES)) {
      const vector = this.vectorSystem.prototypeVectors[typeCode];
      if (vector) {
        pipeline.setex(
          `${this.cacheKeys.aptVector}${typeCode}`,
          this.cacheConfig.vectorTTL,
          JSON.stringify(vector)
        );
      }
    }
    
    await pipeline.exec();
    console.log(`✓ ${Object.keys(SAYU_TYPES).length}개 APT 프로토타입 벡터 캐싱 완료`);
  }

  async warmupPopularContent() {
    // 각 APT별로 인기 있는 콘텐츠 미리 계산하여 캐싱
    for (const typeCode of Object.keys(SAYU_TYPES)) {
      await this.warmupArtworksForAPT(typeCode);
      await this.warmupExhibitionsForAPT(typeCode);
    }
  }

  // ==================== APT별 작품 추천 캐싱 ====================
  
  async getArtworkRecommendations(aptType, options = {}) {
    const {
      limit = 20,
      offset = 0,
      forceRefresh = false,
      context = 'general',
      userId = null
    } = options;
    
    const cacheKey = `${this.cacheKeys.aptArtworks}${aptType}:${context}:${limit}:${offset}`;
    const redis = getRedisClient();
    
    // Redis 없이도 동작
    if (!redis) {
      return this.calculateArtworkRecommendations(aptType, options);
    }
    
    // 캐시 확인 및 히트율 추적
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        await this.updateCacheStats('artwork', aptType, 'hit');
        
        // 액세스 추적 (LRU)
        this.trackAccess(cacheKey);
        
        // TTL 확인 및 예측적 갱신
        const ttl = await redis.ttl(cacheKey);
        if (ttl < this.cacheConfig.artworkTTL * this.cacheConfig.prefetchThreshold) {
          // 백그라운드에서 갱신
          this.prefetchInBackground(cacheKey, aptType, options);
        }
        
        return JSON.parse(cached);
      }
    }
    
    this.cacheStats.misses++;
    
    // 병렬 처리로 계산 최적화
    const recommendations = await this.calculateArtworkRecommendationsOptimized(aptType, options);
    
    // 압축 후 캐싱
    const cacheData = this.cacheConfig.compressionEnabled ? 
      this.compressData(recommendations) : 
      JSON.stringify(recommendations);
    
    // 파이프라인으로 Redis 작업 최적화
    const pipeline = redis.pipeline();
    pipeline.setex(cacheKey, this.cacheConfig.artworkTTL, cacheData);
    pipeline.hincrby(`${this.cacheKeys.globalStats}:artwork`, `${aptType}:miss`, 1);
    pipeline.hincrby(`${this.cacheKeys.globalStats}:artwork`, 'total:miss', 1);
    await pipeline.exec();
    
    // 사용자별 패턴 학습
    if (userId) {
      this.learnUserPattern(userId, aptType, context);
    }
    
    return recommendations;
  }

  async calculateArtworkRecommendationsOptimized(aptType, options) {
    const { limit, offset, context } = options;
    
    // 병렬 데이터 로드
    const [aptVector, artworks] = await Promise.all([
      this.getAPTVector(aptType),
      this.getArtworkPool(context)
    ]);
    
    // 작품 벡터 배치 처리 (병렬화)
    const batchSize = 50;
    const artworkBatches = [];
    for (let i = 0; i < artworks.length; i += batchSize) {
      artworkBatches.push(artworks.slice(i, i + batchSize));
    }
    
    // 병렬 벡터 생성 및 계산
    const vectorBatches = await Promise.all(
      artworkBatches.map(batch => this.getArtworkVectorsBatch(batch))
    );
    
    // 플랫화
    const artworkVectors = vectorBatches.flat();
    
    // 최적화된 벡터 매칭 (SIMD 활용)
    const recommendations = await this.vectorSystem.findBestArtworksOptimized(
      aptVector,
      artworkVectors,
      limit + offset,
      { useApproximation: artworkVectors.length > 1000 }
    );
    
    // 병렬 후처리
    const processed = await this.processRecommendationsOptimized(recommendations, aptType, context);
    
    // 페이지네이션 적용
    return processed.slice(offset, offset + limit);
  }

  async processRecommendations(recommendations, aptType, context) {
    // APT 특성에 맞게 추천 결과 조정
    const typeData = SAYU_TYPES[aptType];
    
    return recommendations.map(rec => {
      let score = rec.matchScore;
      
      // 컨텍스트별 점수 조정
      if (context === 'trending' && rec.viewCount > 1000) {
        score += 5; // 인기 작품 보너스
      } else if (context === 'new' && this.isNewArtwork(rec.createdAt)) {
        score += 3; // 신규 작품 보너스
      }
      
      // APT 특성별 조정
      if (aptType[0] === 'L' && rec.solitudeScore > 7) {
        score += 2; // 혼자 감상하기 좋은 작품
      } else if (aptType[0] === 'S' && rec.discussionPotential > 7) {
        score += 2; // 토론하기 좋은 작품
      }
      
      return {
        ...rec,
        finalScore: Math.min(100, score),
        matchReason: this.generateMatchReason(rec, typeData, score)
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  generateMatchReason(artwork, typeData, score) {
    const reasons = [];
    
    if (score > 90) {
      reasons.push(`${typeData.name}님께 완벽한 작품이에요!`);
    } else if (score > 75) {
      reasons.push(`${typeData.name}의 취향과 잘 맞아요`);
    }
    
    // 구체적인 이유 추가
    if (artwork.isAbstract && typeData.code[1] === 'A') {
      reasons.push('추상적 표현이 매력적');
    }
    if (artwork.emotionalImpact > 7 && typeData.code[2] === 'E') {
      reasons.push('감정적 울림이 깊은 작품');
    }
    
    return reasons.join(' · ');
  }

  // ==================== 전시 추천 캐싱 ====================
  
  async getExhibitionRecommendations(aptType, options = {}) {
    const {
      limit = 10,
      location = 'all',
      dateRange = 'current'
    } = options;
    
    const cacheKey = `${this.cacheKeys.aptExhibitions}${aptType}:${location}:${dateRange}`;
    const redis = getRedisClient();
    if (!redis) return null;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      await this.updateCacheStats('exhibition', aptType, 'hit');
      return JSON.parse(cached);
    }
    
    // 새로 계산
    const exhibitions = await this.calculateExhibitionRecommendations(aptType, options);
    
    await redis.setex(
      cacheKey,
      this.cacheConfig.exhibitionTTL,
      JSON.stringify(exhibitions)
    );
    
    return exhibitions;
  }

  // ==================== 사용자 벡터 캐싱 ====================
  
  async getUserVector(userId) {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.userVector}${userId}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // DB에서 사용자 정보 조회 후 벡터 생성
    const userProfile = await this.getUserProfile(userId);
    const userVector = await this.vectorSystem.createUserVector(
      userProfile.quizResponses,
      userProfile.aptType
    );
    
    // 캐싱
    await redis.setex(
      cacheKey,
      this.cacheConfig.vectorTTL,
      JSON.stringify(userVector)
    );
    
    return userVector;
  }

  async updateUserVector(userId, newActions) {
    const redis = getRedisClient();
    if (!redis) return null;
    const currentVector = await this.getUserVector(userId);
    const userProfile = await this.getUserProfile(userId);
    
    // 벡터 진화
    const evolvedVector = await this.vectorSystem.evolveUserVector(
      currentVector,
      newActions,
      userProfile.aptType
    );
    
    // 캐시 업데이트
    const cacheKey = `${this.cacheKeys.userVector}${userId}`;
    await redis.setex(
      cacheKey,
      this.cacheConfig.vectorTTL,
      JSON.stringify(evolvedVector)
    );
    
    // 관련 추천 캐시 무효화
    await this.invalidateUserRecommendations(userId);
    
    return evolvedVector;
  }

  // ==================== 인기 콘텐츠 캐싱 ====================
  
  async getTrendingForAPT(aptType, period = 'daily') {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.aptTrending}${aptType}:${period}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 인기 콘텐츠 계산
    const trending = await this.calculateTrending(aptType, period);
    
    await redis.setex(
      cacheKey,
      this.cacheConfig.trendingTTL,
      JSON.stringify(trending)
    );
    
    return trending;
  }

  async calculateTrending(aptType, period) {
    // 해당 APT 사용자들이 많이 본 콘텐츠 집계
    const viewStats = await this.getViewStatsByAPT(aptType, period);
    const likeStats = await this.getLikeStatsByAPT(aptType, period);
    
    // 가중치 적용
    const scores = {};
    
    viewStats.forEach(item => {
      scores[item.id] = (scores[item.id] || 0) + item.count * 1;
    });
    
    likeStats.forEach(item => {
      scores[item.id] = (scores[item.id] || 0) + item.count * 3;
    });
    
    // 상위 항목 선택
    const trending = Object.entries(scores)
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    return trending;
  }

  // ==================== 캐시 무효화 ====================
  
  async invalidateAPTCache(aptType) {
    const redis = getRedisClient();
    if (!redis) return null;
    const pattern = `apt:*:${aptType}*`;
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    console.log(`✓ ${aptType} 관련 ${keys.length}개 캐시 키 무효화`);
  }

  async invalidateUserRecommendations(userId) {
    const redis = getRedisClient();
    if (!redis) return null;
    // 사용자 관련 추천 캐시 제거
    const patterns = [
      `user:recommendations:${userId}:*`,
      `user:vector:${userId}`
    ];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }

  // ==================== 캐시 통계 ====================
  
  async updateCacheStats(type, aptType, result) {
    const redis = getRedisClient();
    if (!redis) return null;
    const statsKey = `${this.cacheKeys.globalStats}:${type}`;
    
    await redis.hincrby(statsKey, `${aptType}:${result}`, 1);
    await redis.hincrby(statsKey, `total:${result}`, 1);
    
    // 히트율 계산을 위한 만료 시간 설정
    await redis.expire(statsKey, 86400); // 24시간
  }

  async getCacheStats() {
    const redis = getRedisClient();
    if (!redis) return null;
    const stats = {
      artwork: {},
      exhibition: {},
      hitRate: {}
    };
    
    // 각 타입별 통계 수집
    for (const type of ['artwork', 'exhibition']) {
      const statsKey = `${this.cacheKeys.globalStats}:${type}`;
      const data = await redis.hgetall(statsKey);
      
      stats[type] = data;
      
      // 히트율 계산
      const totalHits = parseInt(data['total:hit'] || 0);
      const totalMisses = parseInt(data['total:miss'] || 0);
      const total = totalHits + totalMisses;
      
      if (total > 0) {
        stats.hitRate[type] = Math.round((totalHits / total) * 100);
      }
    }
    
    return stats;
  }

  // ==================== 헬퍼 함수 ====================
  
  async getAPTVector(aptType) {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.aptVector}${aptType}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    return this.vectorSystem.prototypeVectors[aptType];
  }

  async getArtworkVectorsBatch(artworks) {
    const redis = getRedisClient();
    if (!redis) {
      // Redis 없이 직접 계산
      return Promise.all(
        artworks.map(async artwork => ({
          ...artwork,
          vector: await this.vectorSystem.createArtworkVector(artwork)
        }))
      );
    }
    
    // 파이프라인으로 배치 조회
    const pipeline = redis.pipeline();
    const cacheKeys = artworks.map(a => `${this.cacheKeys.artworkVector}${a.id}`);
    
    cacheKeys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();
    
    // 캐시 미스 항목 수집
    const missingIndices = [];
    const vectors = [];
    
    results.forEach(([err, data], index) => {
      if (!err && data) {
        vectors[index] = {
          ...artworks[index],
          vector: JSON.parse(data)
        };
      } else {
        missingIndices.push(index);
      }
    });
    
    // 캐시 미스 항목들 병렬 계산
    if (missingIndices.length > 0) {
      const newVectors = await Promise.all(
        missingIndices.map(async index => {
          const artwork = artworks[index];
          const vector = await this.vectorSystem.createArtworkVector(artwork);
          
          // 백그라운드 캐싱 (비동기)
          this.cacheVectorInBackground(
            `${this.cacheKeys.artworkVector}${artwork.id}`,
            vector
          );
          
          return {
            ...artwork,
            vector
          };
        })
      );
      
      // 결과 병합
      missingIndices.forEach((originalIndex, i) => {
        vectors[originalIndex] = newVectors[i];
      });
    }
    
    return vectors.filter(Boolean);
  }

  isNewArtwork(createdAt) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  }

  // 워밍업 헬퍼
  async warmupArtworksForAPT(typeCode) {
    try {
      // 모든 컨텍스트를 병렬로 워밍업
      const contexts = ['general', 'trending', 'new', 'seasonal'];
      const limits = [20, 50, 100]; // 다양한 limit 값도 캐싱
      
      const warmupTasks = [];
      for (const context of contexts) {
        for (const limit of limits) {
          warmupTasks.push(
            this.getArtworkRecommendations(typeCode, {
              limit,
              context,
              offset: 0
            }).catch(err => {
              console.error(`워밍업 실패 ${typeCode}/${context}/${limit}:`, err);
            })
          );
        }
      }
      
      // 병렬 실행 (최대 5개씩)
      const batchSize = 5;
      for (let i = 0; i < warmupTasks.length; i += batchSize) {
        await Promise.all(warmupTasks.slice(i, i + batchSize));
      }
      
      console.log(`✓ ${typeCode} 작품 추천 워밍업 완료 (${warmupTasks.length}개 캐시)`);
    } catch (error) {
      console.error(`${typeCode} 작품 워밍업 실패:`, error);
    }
  }

  async warmupExhibitionsForAPT(typeCode) {
    try {
      await this.getExhibitionRecommendations(typeCode, {
        limit: 10,
        location: 'seoul',
        dateRange: 'current'
      });
      
      console.log(`✓ ${typeCode} 전시 추천 워밍업 완료`);
    } catch (error) {
      console.error(`${typeCode} 전시 워밍업 실패:`, error);
    }
  }

  // DB 접근 함수들
  async getUserProfile(userId) {
    return aptDataAccess.getUserProfile(userId);
  }

  async getArtworkPool(context) {
    return aptDataAccess.getArtworkPool(context);
  }

  async getViewStatsByAPT(aptType, period) {
    return aptDataAccess.getViewStatsByAPT(aptType, period);
  }

  async getLikeStatsByAPT(aptType, period) {
    return aptDataAccess.getLikeStatsByAPT(aptType, period);
  }

  async calculateExhibitionRecommendations(aptType, options) {
    return aptDataAccess.calculateExhibitionRecommendations(aptType, options);
  }

  // ==================== 새로운 최적화 메서드들 ====================
  
  async initializeCacheMonitoring() {
    // 캐시 성능 모니터링 초기화
    setInterval(() => {
      const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;
      console.log(`📊 캐시 히트율: ${(hitRate * 100).toFixed(2)}%`, {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        evictions: this.cacheStats.evictions,
        prefetches: this.cacheStats.prefetches
      });
      
      // 히트율이 낮으면 경고
      if (hitRate < 0.7 && this.cacheStats.hits + this.cacheStats.misses > 100) {
        console.warn('⚠️ 캐시 히트율이 70% 미만입니다. TTL 조정을 고려하세요.');
      }
    }, 60000); // 1분마다
  }
  
  async setupCacheEvictionPolicy() {
    // LRU 기반 캐시 제거 정책
    setInterval(() => {
      if (this.accessTracker.size > this.cacheConfig.maxCacheSize) {
        const sortedKeys = Array.from(this.accessTracker.entries())
          .sort((a, b) => a[1] - b[1]); // 오래된 순
        
        const keysToEvict = sortedKeys
          .slice(0, Math.floor(this.cacheConfig.maxCacheSize * 0.2))
          .map(([key]) => key);
        
        this.evictKeys(keysToEvict);
      }
    }, 30000); // 30초마다
  }
  
  async preloadFrequentPatterns() {
    // 자주 사용되는 패턴 미리 로드
    const frequentPatterns = [
      { aptType: 'LAEF', context: 'general', limit: 20 },
      { aptType: 'SRMC', context: 'general', limit: 20 },
      { aptType: 'SAEF', context: 'trending', limit: 20 }
    ];
    
    await Promise.all(
      frequentPatterns.map(pattern => 
        this.getArtworkRecommendations(pattern.aptType, pattern)
      )
    );
  }
  
  startPredictiveCaching() {
    // 사용 패턴 기반 예측적 캐싱
    setInterval(async () => {
      const predictions = await this.predictNextRequests();
      
      for (const prediction of predictions) {
        if (prediction.probability > 0.7) {
          this.prefetchInBackground(
            prediction.cacheKey,
            prediction.aptType,
            prediction.options
          );
        }
      }
    }, 300000); // 5분마다
  }
  
  async prefetchInBackground(cacheKey, aptType, options) {
    // 백그라운드에서 캐시 갱신
    setImmediate(async () => {
      try {
        this.cacheStats.prefetches++;
        const recommendations = await this.calculateArtworkRecommendationsOptimized(aptType, options);
        
        const redis = getRedisClient();
        if (redis) {
          await redis.setex(
            cacheKey,
            this.cacheConfig.artworkTTL,
            JSON.stringify(recommendations)
          );
        }
      } catch (error) {
        console.error('프리페치 실패:', error);
      }
    });
  }
  
  compressData(data) {
    // 간단한 데이터 압축 (실제로는 zlib 사용 권장)
    const jsonStr = JSON.stringify(data);
    // 여기서는 단순화를 위해 그대로 반환
    return jsonStr;
  }
  
  trackAccess(cacheKey) {
    this.accessTracker.set(cacheKey, Date.now());
  }
  
  async evictKeys(keys) {
    const redis = getRedisClient();
    if (!redis) return;
    
    const pipeline = redis.pipeline();
    keys.forEach(key => {
      pipeline.del(key);
      this.accessTracker.delete(key);
      this.cacheStats.evictions++;
    });
    
    await pipeline.exec();
  }
  
  async learnUserPattern(userId, aptType, context) {
    // 사용자 패턴 학습 (간단한 구현)
    const patternKey = `user:pattern:${userId}`;
    const redis = getRedisClient();
    if (!redis) return;
    
    await redis.hincrby(patternKey, `${aptType}:${context}`, 1);
    await redis.expire(patternKey, 86400 * 7); // 7일간 유지
  }
  
  async predictNextRequests() {
    // 다음 요청 예측 (간단한 구현)
    const redis = getRedisClient();
    if (!redis) return [];
    
    // 최근 패턴 분석
    const patterns = await redis.hgetall(`${this.cacheKeys.globalStats}:patterns`);
    
    return Object.entries(patterns || {})
      .map(([pattern, count]) => {
        const [aptType, context] = pattern.split(':');
        return {
          cacheKey: `${this.cacheKeys.aptArtworks}${aptType}:${context}:20:0`,
          aptType,
          options: { context, limit: 20, offset: 0 },
          probability: parseInt(count) / 100 // 간단한 확률 계산
        };
      })
      .filter(p => p.probability > 0.5)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);
  }
  
  async cacheVectorInBackground(key, vector) {
    setImmediate(async () => {
      const redis = getRedisClient();
      if (redis) {
        await redis.setex(
          key,
          this.cacheConfig.vectorTTL,
          JSON.stringify(vector)
        );
      }
    });
  }
  
  async processRecommendationsOptimized(recommendations, aptType, context) {
    // 병렬 처리로 최적화
    const typeData = SAYU_TYPES[aptType];
    
    return Promise.all(
      recommendations.map(async rec => {
        let score = rec.matchScore;
        
        // 컨텍스트별 점수 조정 (병렬 계산)
        const adjustments = await Promise.all([
          this.calculateTrendingBonus(rec, context),
          this.calculateTypeBonus(rec, aptType),
          this.calculateFreshnessBonus(rec, context)
        ]);
        
        score += adjustments.reduce((sum, adj) => sum + adj, 0);
        
        return {
          ...rec,
          finalScore: Math.min(100, score),
          matchReason: this.generateMatchReason(rec, typeData, score)
        };
      })
    ).then(results => 
      results.sort((a, b) => b.finalScore - a.finalScore)
    );
  }
  
  async calculateTrendingBonus(rec, context) {
    if (context === 'trending' && rec.viewCount > 1000) {
      return 5;
    }
    return 0;
  }
  
  async calculateTypeBonus(rec, aptType) {
    let bonus = 0;
    if (aptType[0] === 'L' && rec.solitudeScore > 7) {
      bonus += 2;
    } else if (aptType[0] === 'S' && rec.discussionPotential > 7) {
      bonus += 2;
    }
    return bonus;
  }
  
  async calculateFreshnessBonus(rec, context) {
    if (context === 'new' && this.isNewArtwork(rec.createdAt)) {
      return 3;
    }
    return 0;
  }
}

module.exports = APTCacheService;
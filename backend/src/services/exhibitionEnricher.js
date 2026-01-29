const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cheerio = require('cheerio');
require('dotenv').config();

// Supabase 및 AI 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 전시 데이터 보강 시스템
 * - 주요 미술관 API 연동 
 * - AI 기반 전시 설명 자동 생성
 * - 키워드 자동 추출 
 * - 전시 카테고리 자동 분류
 * - 16가지 APT 유형별 매칭 점수 계산
 */
class ExhibitionEnricher {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 16가지 APT 유형 정의 (SAYU_TYPE_DEFINITIONS.md 기반)
    this.aptTypes = {
      LAEF: { animal: 'fox', name: '몽환적 방랑자' },
      LAEC: { animal: 'cat', name: '감성 큐레이터' },
      LAMF: { animal: 'owl', name: '직관적 탐구자' },
      LAMC: { animal: 'turtle', name: '철학적 수집가' },
      LREF: { animal: 'chameleon', name: '고독한 관찰자' },
      LREC: { animal: 'hedgehog', name: '섬세한 감정가' },
      LRMF: { animal: 'octopus', name: '디지털 탐험가' },
      LRMC: { animal: 'beaver', name: '학구적 연구자' },
      SAEF: { animal: 'butterfly', name: '감성 나누미' },
      SAEC: { animal: 'penguin', name: '예술 네트워커' },
      SAMF: { animal: 'parrot', name: '영감 전도사' },
      SAMC: { animal: 'deer', name: '문화 기획자' },
      SREF: { animal: 'dog', name: '열정적 관람자' },
      SREC: { animal: 'duck', name: '따뜻한 안내자' },
      SRMF: { animal: 'elephant', name: '지식 멘토' },
      SRMC: { animal: 'eagle', name: '체계적 교육자' }
    };

    // 주요 미술관 API 설정
    this.apiConfigs = {
      nmma: {
        name: '국립현대미술관',
        baseUrl: 'https://www.mmca.go.kr/research/researchOpenApiL.do',
        apiKey: process.env.NMMA_API_KEY
      },
      seoulmuseum: {
        name: '서울시립미술관',
        baseUrl: 'http://sema.seoul.go.kr/api/exhibition',
        apiKey: process.env.SEOUL_MUSEUM_API_KEY
      }
    };

    // 전시 카테고리 정의
    this.categories = {
      painting: '회화',
      sculpture: '조각',
      installation: '설치미술',
      media: '미디어아트',
      photography: '사진',
      design: '디자인',
      contemporary: '현대미술',
      traditional: '전통미술',
      international: '국제교류',
      educational: '교육전시'
    };

    // 감정 키워드 매핑 (16가지 APT 유형별)
    this.emotionKeywords = {
      LAEF: ['몽환', '초현실', '자유', '탐험', '신비', '여행', '상상', '꿈'],
      LAEC: ['감성', '큐레이션', '세련', '우아', '조화', '미적', '섬세', '품격'],
      LAMF: ['철학', '사고', '개념', '깊이', '성찰', '지혜', '탐구', '직관'],
      LAMC: ['수집', '체계', '연구', '학문', '기록', '보존', '전통', '역사'],
      LREF: ['관찰', '사실', '자연', '정적', '고독', '명상', '침묵', '평화'],
      LREC: ['감정', '따뜻함', '섬세함', '공감', '이야기', '인간적', '친밀', '감동'],
      LRMF: ['디지털', '기술', '혁신', '미래', '실험', '가상', '인터랙티브', '진화'],
      LRMC: ['학술', '연구', '이론', '분석', '체계적', '엄밀', '전문', '깊이'],
      SAEF: ['공유', '나눔', '친근', '밝음', '긍정', '활기', '즐거움', '사랑'],
      SAEC: ['네트워크', '커뮤니티', '소통', '연결', '협력', '상호작용', '사교', '문화'],
      SAMF: ['영감', '전달', '메시지', '변화', '운동', '사회', '의미', '영향'],
      SAMC: ['기획', '조직', '체계', '문화', '교육', '프로그램', '참여', '포용'],
      SREF: ['열정', '에너지', '활동', '참여', '체험', '재미', '흥미', '즐거움'],
      SREC: ['따뜻함', '안내', '친절', '보살핌', '포용', '가족', '친근', '편안'],
      SRMF: ['지식', '학습', '교육', '멘토링', '가르침', '경험', '지혜', '성장'],
      SRMC: ['교육', '체계', '구조', '계획', '조직', '리더십', '전문성', '완성']
    };
  }

  /**
   * 설명이 없는 전시 찾기
   */
  async findExhibitionsNeedingEnrichment(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('exhibitions_master')
        .select(`
          id,
          start_date,
          end_date,
          poster_url,
          venue_id,
          genre,
          exhibitions_translations!inner (
            exhibition_title,
            description,
            language_code,
            venue_name
          ),
          venues!venue_id (
            name,
            type,
            district
          )
        `)
        .eq('exhibitions_translations.language_code', 'ko')
        .or('exhibitions_translations.description.is.null,exhibitions_translations.description.eq.')
        .limit(limit);

      if (error) throw error;
      
      console.log(`📊 설명이 부족한 전시 ${data.length}개 발견`);
      return data;
    } catch (error) {
      console.error('전시 데이터 조회 실패:', error);
      return [];
    }
  }

  /**
   * 주요 미술관 API에서 전시 정보 가져오기
   */
  async fetchFromMuseumAPI(exhibitionTitle, venue) {
    const searchResults = [];

    // 국립현대미술관 API 조회
    try {
      if (this.apiConfigs.nmma.apiKey && venue.includes('국립현대미술관')) {
        const response = await axios.get(this.apiConfigs.nmma.baseUrl, {
          params: {
            serviceKey: this.apiConfigs.nmma.apiKey,
            keyword: exhibitionTitle.slice(0, 20), // 제목 일부만 검색
            rows: 5
          },
          timeout: 10000
        });

        if (response.data?.response?.body?.items) {
          searchResults.push(...response.data.response.body.items);
        }
      }
    } catch (error) {
      console.warn('국립현대미술관 API 조회 실패:', error.message);
    }

    // 서울시립미술관 API 조회
    try {
      if (this.apiConfigs.seoulmuseum.apiKey && venue.includes('서울시립')) {
        const response = await axios.get(this.apiConfigs.seoulmuseum.baseUrl, {
          params: {
            key: this.apiConfigs.seoulmuseum.apiKey,
            title: exhibitionTitle.slice(0, 20)
          },
          timeout: 10000
        });

        if (response.data?.items) {
          searchResults.push(...response.data.items);
        }
      }
    } catch (error) {
      console.warn('서울시립미술관 API 조회 실패:', error.message);
    }

    return searchResults;
  }

  /**
   * AI를 활용한 전시 설명 생성
   */
  async generateExhibitionDescription(exhibition) {
    try {
      const title = exhibition.exhibitions_translations?.[0]?.exhibition_title || '';
      const venue = exhibition.exhibitions_translations?.[0]?.venue_name || exhibition.venues?.name || '';
      const genre = exhibition.genre || '미술전시';
      const venueType = exhibition.venues?.type || '';

      const prompt = `
다음 전시 정보를 바탕으로 방문자들에게 도움이 되는 전시 설명을 작성해주세요:

전시명: ${title}
장소: ${venue}
장르: ${genre}
장소 유형: ${venueType}

요구사항:
1. 200-300자 내외의 한국어 설명
2. 전시의 주요 특징과 감상 포인트 포함
3. 방문자가 기대할 수 있는 경험 언급
4. 감정적 어조로 작성 (딱딱하지 않게)
5. 전시 제목에서 유추할 수 있는 주제와 의미 해석

전시 설명만 출력해주세요:`;

      const result = await this.model.generateContent(prompt);
      const description = result.response.text().trim();
      
      console.log(`✅ AI 설명 생성 완료: ${title.slice(0, 30)}...`);
      return description;
      
    } catch (error) {
      console.error('AI 설명 생성 실패:', error);
      return null;
    }
  }

  /**
   * 키워드 자동 추출
   */
  async extractKeywords(title, description, venue) {
    try {
      const fullText = `${title} ${description} ${venue}`;
      
      const prompt = `
다음 전시 정보에서 핵심 키워드 5-8개를 추출해주세요:

텍스트: ${fullText}

요구사항:
1. 전시의 주요 특성을 나타내는 키워드
2. 감정이나 분위기를 나타내는 형용사 포함
3. 장르나 매체 관련 키워드 포함
4. 쉼표로 구분하여 나열
5. 한국어로 작성

키워드만 출력해주세요:`;

      const result = await this.model.generateContent(prompt);
      const keywordText = result.response.text().trim();
      
      // 키워드 배열로 변환
      const keywords = keywordText
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 1)
        .slice(0, 8);
      
      return keywords;
      
    } catch (error) {
      console.error('키워드 추출 실패:', error);
      return [];
    }
  }

  /**
   * 전시 카테고리 자동 분류
   */
  async categorizeExhibition(title, description, genre) {
    try {
      const fullText = `${title} ${description} ${genre}`.toLowerCase();
      
      // 규칙 기반 분류
      const categoryScores = {};
      
      // 키워드 기반 점수 계산
      const categoryKeywords = {
        painting: ['회화', '그림', '유화', '수채화', '페인팅'],
        sculpture: ['조각', 'sculpture', '설치', '입체', '부조'],
        installation: ['설치', '공간', '환경', '체험', 'installation'],
        media: ['미디어', '비디오', '영상', '디지털', '인터랙티브'],
        photography: ['사진', '포토', 'photography', '이미지'],
        design: ['디자인', '그래픽', '포스터', '타이포'],
        contemporary: ['현대', '컨템포러리', '실험', '신진'],
        traditional: ['전통', '한국화', '서예', '민화', '고미술'],
        international: ['국제', '해외', '교류', 'international'],
        educational: ['교육', '체험', '워크샵', '키즈', '가족']
      };

      Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        categoryScores[category] = keywords.reduce((score, keyword) => {
          return fullText.includes(keyword) ? score + 1 : score;
        }, 0);
      });

      // 가장 높은 점수의 카테고리 선택
      const topCategory = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)[0];
      
      return topCategory ? topCategory[0] : 'contemporary';
      
    } catch (error) {
      console.error('카테고리 분류 실패:', error);
      return 'contemporary';
    }
  }

  /**
   * APT 유형별 매칭 점수 계산
   */
  calculateAPTScores(title, description, keywords, category, venue) {
    const scores = {};
    const fullText = `${title} ${description} ${keywords.join(' ')} ${category} ${venue}`.toLowerCase();

    Object.entries(this.aptTypes).forEach(([aptType, typeInfo]) => {
      const emotionKeywords = this.emotionKeywords[aptType] || [];
      
      let score = 0;
      
      // 감정 키워드 매칭 (40점)
      const keywordMatches = emotionKeywords.filter(keyword => 
        fullText.includes(keyword.toLowerCase())
      ).length;
      score += Math.min(40, keywordMatches * 8);
      
      // 카테고리 보너스 (20점)
      const categoryBonus = this.getCategoryBonus(aptType, category);
      score += categoryBonus;
      
      // 장소 유형 보너스 (20점)
      const venueBonus = this.getVenueBonus(aptType, venue);
      score += venueBonus;
      
      // 기본 점수 (20점) - 모든 전시가 최소한의 점수를 가지도록
      score += 20;
      
      scores[aptType] = Math.min(100, Math.max(0, score));
    });

    return scores;
  }

  /**
   * APT 유형별 카테고리 보너스 계산
   */
  getCategoryBonus(aptType, category) {
    const categoryPreferences = {
      LAEF: { installation: 15, contemporary: 10, media: 5 },
      LAEC: { painting: 15, design: 10, photography: 5 },
      LAMF: { installation: 15, media: 10, contemporary: 10 },
      LAMC: { traditional: 15, educational: 10, international: 5 },
      LREF: { painting: 15, photography: 10, traditional: 5 },
      LREC: { painting: 15, photography: 10, design: 5 },
      LRMF: { media: 20, installation: 15, contemporary: 5 },
      LRMC: { traditional: 15, educational: 10, sculpture: 5 },
      SAEF: { installation: 15, contemporary: 10, media: 10 },
      SAEC: { international: 15, contemporary: 10, design: 5 },
      SAMF: { installation: 15, media: 10, contemporary: 10 },
      SAMC: { educational: 20, international: 10, design: 5 },
      SREF: { contemporary: 15, media: 10, installation: 10 },
      SREC: { educational: 20, traditional: 10, photography: 5 },
      SRMF: { educational: 20, traditional: 10, international: 5 },
      SRMC: { educational: 20, traditional: 15, sculpture: 5 }
    };

    const preferences = categoryPreferences[aptType] || {};
    return preferences[category] || 0;
  }

  /**
   * APT 유형별 장소 보너스 계산
   */
  getVenueBonus(aptType, venue) {
    const venuePreferences = {
      LAEF: ['대림미술관', '아뜰리에', '갤러리'],
      LAEC: ['리움', '송은', 'PKM'],
      LAMF: ['아트선재', '일민미술관', '백남준'],
      LAMC: ['국립현대미술관', '서울시립미술관'],
      LREF: ['국립중앙박물관', '환기미술관'],
      LREC: ['사비나미술관', '예술의전당'],
      LRMF: ['아르떼뮤지엄', '팀랩', '문화역서울284'],
      LRMC: ['국립박물관', '서울대미술관'],
      SAEF: ['디뮤지엄', '그라운드시소'],
      SAEC: ['코엑스', '세종문화회관'],
      SAMF: ['플랫폼엘', '아라리오'],
      SAMC: ['DDP', '문화비축기지'],
      SREF: ['롯데뮤지엄', '트릭아이'],
      SREC: ['북서울미술관', '어린이박물관'],
      SRMF: ['전쟁기념관', '역사박물관'],
      SRMC: ['예술의전당', '국립박물관']
    };

    const preferences = venuePreferences[aptType] || [];
    const hasMatch = preferences.some(pref => venue.toLowerCase().includes(pref.toLowerCase()));
    
    return hasMatch ? 20 : 0;
  }

  /**
   * 전시 데이터 보강 실행
   */
  async enrichExhibition(exhibition) {
    try {
      console.log(`🎨 보강 시작: ${exhibition.exhibitions_translations?.[0]?.exhibition_title}`);
      
      const title = exhibition.exhibitions_translations?.[0]?.exhibition_title || '';
      const venue = exhibition.exhibitions_translations?.[0]?.venue_name || '';
      
      // 1. 외부 API에서 정보 수집
      const apiData = await this.fetchFromMuseumAPI(title, venue);
      
      // 2. AI 설명 생성
      let description = exhibition.exhibitions_translations?.[0]?.description;
      if (!description || description.trim().length < 50) {
        description = await this.generateExhibitionDescription(exhibition);
      }
      
      // 3. 키워드 추출
      const keywords = await this.extractKeywords(title, description, venue);
      
      // 4. 카테고리 분류
      const category = await this.categorizeExhibition(title, description, exhibition.genre);
      
      // 5. APT 점수 계산
      const aptScores = this.calculateAPTScores(title, description, keywords, category, venue);
      
      return {
        exhibition_id: exhibition.id,
        enriched_data: {
          description,
          keywords,
          category,
          apt_scores: aptScores,
          api_data: apiData.slice(0, 2), // 최대 2개까지만 저장
          enrichment_date: new Date().toISOString(),
          quality_score: this.calculateQualityScore(description, keywords, aptScores)
        }
      };
      
    } catch (error) {
      console.error(`전시 보강 실패: ${exhibition.id}`, error);
      return null;
    }
  }

  /**
   * 데이터 품질 점수 계산
   */
  calculateQualityScore(description, keywords, aptScores) {
    let score = 0;
    
    // 설명 품질 (40점)
    if (description && description.length > 100) score += 40;
    else if (description && description.length > 50) score += 25;
    else if (description) score += 15;
    
    // 키워드 품질 (30점)
    if (keywords.length >= 5) score += 30;
    else if (keywords.length >= 3) score += 20;
    else if (keywords.length > 0) score += 10;
    
    // APT 점수 품질 (30점)
    const avgAptScore = Object.values(aptScores).reduce((sum, s) => sum + s, 0) / 16;
    if (avgAptScore > 60) score += 30;
    else if (avgAptScore > 40) score += 20;
    else if (avgAptScore > 20) score += 10;
    
    return score;
  }

  /**
   * 보강된 데이터를 데이터베이스에 저장
   */
  async saveEnrichedData(enrichedData) {
    try {
      const { exhibition_id, enriched_data } = enrichedData;
      
      // exhibitions_translations 테이블 업데이트
      if (enriched_data.description) {
        const { error: descError } = await supabase
          .from('exhibitions_translations')
          .update({ 
            description: enriched_data.description,
            updated_at: new Date().toISOString()
          })
          .eq('exhibition_id', exhibition_id)
          .eq('language_code', 'ko');
          
        if (descError) console.warn('설명 업데이트 실패:', descError);
      }

      // exhibition_keywords 테이블에 키워드 저장
      if (enriched_data.keywords.length > 0) {
        const keywordInserts = enriched_data.keywords.map(keyword => ({
          exhibition_id,
          keyword,
          weight: 1.0,
          source: 'ai_extraction'
        }));

        const { error: keywordError } = await supabase
          .from('exhibition_keywords')
          .upsert(keywordInserts, { 
            onConflict: 'exhibition_id,keyword',
            ignoreDuplicates: false 
          });
          
        if (keywordError) console.warn('키워드 저장 실패:', keywordError);
      }

      // exhibition_categories 테이블에 카테고리 저장
      const { error: categoryError } = await supabase
        .from('exhibition_categories')
        .upsert({
          exhibition_id,
          category: enriched_data.category,
          confidence: 0.8,
          source: 'ai_classification'
        }, { onConflict: 'exhibition_id' });
        
      if (categoryError) console.warn('카테고리 저장 실패:', categoryError);

      // apt_exhibition_scores 테이블에 APT 점수 저장
      const aptScoreInserts = Object.entries(enriched_data.apt_scores).map(([apt_type, score]) => ({
        exhibition_id,
        apt_type,
        score,
        calculated_at: new Date().toISOString(),
        algorithm_version: 'v2.0'
      }));

      const { error: aptError } = await supabase
        .from('apt_exhibition_scores')
        .upsert(aptScoreInserts, { 
          onConflict: 'exhibition_id,apt_type',
          ignoreDuplicates: false 
        });
        
      if (aptError) console.warn('APT 점수 저장 실패:', aptError);

      console.log(`✅ 데이터 저장 완료: ${exhibition_id}`);
      return true;
      
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      return false;
    }
  }

  /**
   * 배치 처리 실행
   */
  async runBatchEnrichment(batchSize = 10, maxBatches = 5) {
    console.log('🚀 전시 데이터 보강 배치 처리 시작\n');
    
    let processedCount = 0;
    let successCount = 0;
    let batchCount = 0;
    
    while (batchCount < maxBatches) {
      const exhibitions = await this.findExhibitionsNeedingEnrichment(batchSize);
      
      if (exhibitions.length === 0) {
        console.log('✅ 보강이 필요한 전시가 더 이상 없습니다.');
        break;
      }

      console.log(`📦 배치 ${batchCount + 1}: ${exhibitions.length}개 전시 처리 중...`);
      
      const enrichmentPromises = exhibitions.map(exhibition => 
        this.enrichExhibition(exhibition)
      );
      
      const enrichedResults = await Promise.all(enrichmentPromises);
      
      // 성공한 결과만 저장
      const validResults = enrichedResults.filter(result => result !== null);
      
      for (const result of validResults) {
        const saved = await this.saveEnrichedData(result);
        if (saved) successCount++;
      }
      
      processedCount += exhibitions.length;
      batchCount++;
      
      console.log(`📊 배치 ${batchCount} 완료: ${validResults.length}/${exhibitions.length} 성공\n`);
      
      // API 레이트 리미트 고려하여 대기
      if (batchCount < maxBatches) {
        console.log('⏳ 5초 대기 중...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log(`🎉 배치 처리 완료!`);
    console.log(`   - 처리된 전시: ${processedCount}개`);
    console.log(`   - 성공: ${successCount}개`);
    console.log(`   - 실패: ${processedCount - successCount}개`);
    console.log(`   - 성공률: ${(successCount / processedCount * 100).toFixed(1)}%`);
    
    return {
      processed: processedCount,
      success: successCount,
      failed: processedCount - successCount,
      successRate: successCount / processedCount * 100
    };
  }

  /**
   * 데이터 품질 리포트 생성
   */
  async generateQualityReport() {
    try {
      console.log('📊 데이터 품질 리포트 생성 중...\n');
      
      // 전체 전시 수
      const { count: totalExhibitions } = await supabase
        .from('exhibitions_master')
        .select('*', { count: 'exact', head: true });
      
      // 설명이 있는 전시 수
      const { count: withDescription } = await supabase
        .from('exhibitions_translations')
        .select('*', { count: 'exact', head: true })
        .not('description', 'is', null)
        .neq('description', '');
      
      // 키워드가 있는 전시 수
      const { count: withKeywords } = await supabase
        .from('exhibition_keywords')
        .select('exhibition_id', { count: 'exact', head: true });
      
      // APT 점수가 있는 전시 수
      const { count: withAptScores } = await supabase
        .from('apt_exhibition_scores')
        .select('exhibition_id', { count: 'exact', head: true });

      // APT 유형별 매칭률 계산
      const aptMatchingStats = {};
      for (const aptType of Object.keys(this.aptTypes)) {
        const { count } = await supabase
          .from('apt_exhibition_scores')
          .select('*', { count: 'exact', head: true })
          .eq('apt_type', aptType)
          .gte('score', 60);
        
        aptMatchingStats[aptType] = {
          count,
          percentage: totalExhibitions > 0 ? (count / totalExhibitions * 100).toFixed(1) : 0
        };
      }
      
      const report = {
        totalExhibitions,
        withDescription,
        withKeywords,
        withAptScores,
        completionRates: {
          description: (withDescription / totalExhibitions * 100).toFixed(1),
          keywords: (withKeywords / totalExhibitions * 100).toFixed(1),
          aptScores: (withAptScores / totalExhibitions * 100).toFixed(1)
        },
        aptMatchingStats,
        generatedAt: new Date().toISOString()
      };
      
      console.log('=== 📊 SAYU 전시 데이터 품질 리포트 ===\n');
      console.log(`전체 전시 수: ${totalExhibitions}개`);
      console.log(`설명 보유율: ${report.completionRates.description}% (${withDescription}개)`);
      console.log(`키워드 보유율: ${report.completionRates.keywords}% (${withKeywords}개)`);
      console.log(`APT 점수 보유율: ${report.completionRates.aptScores}% (${withAptScores}개)\n`);
      
      console.log('=== APT 유형별 고득점(60점+) 매칭 현황 ===');
      Object.entries(aptMatchingStats).forEach(([aptType, stats]) => {
        const typeName = this.aptTypes[aptType].name;
        console.log(`${aptType} (${typeName}): ${stats.count}개 (${stats.percentage}%)`);
      });
      
      return report;
      
    } catch (error) {
      console.error('품질 리포트 생성 실패:', error);
      return null;
    }
  }
}

module.exports = ExhibitionEnricher;

// 직접 실행 시 배치 처리 시작
if (require.main === module) {
  const enricher = new ExhibitionEnricher();
  
  async function main() {
    // 품질 리포트 먼저 생성
    await enricher.generateQualityReport();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 배치 보강 실행
    await enricher.runBatchEnrichment(5, 3); // 5개씩 3배치
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 작업 후 품질 리포트 재생성
    await enricher.generateQualityReport();
  }
  
  main().catch(console.error);
}
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * APT 타입별 전시 추천을 위한 전시 분석 시스템
 */
class APTExhibitionAnalyzer {
  constructor() {
    // 16개 APT 타입별 프로파일 정의
    this.typeProfiles = {
      // 몽상가 부족 (Dreamers) - LA군
      LAEF: {
        name: '몽환적 방랑자',
        preferences: {
          abstraction: 0.9,
          solitude: 0.8,
          emotional_depth: 0.85,
          freedom: 0.9,
          mystery: 0.8,
          color_intensity: 0.7,
          interactive: 0.3
        },
        avoidance: {
          crowded: 0.8,
          structured_tour: 0.7,
          realistic: 0.6
        },
        keywords: ['추상', '초현실', '미니멀', '몽환', '감성', '자유'],
        ideal_venues: ['대림미술관', '피크닉', 'MMCA', '아뜰리에 에르메스']
      },

      LAEC: {
        name: '감성 큐레이터',
        preferences: {
          abstraction: 0.8,
          solitude: 0.7,
          emotional_depth: 0.9,
          systematic: 0.8,
          color_harmony: 0.85,
          curation_quality: 0.9,
          detail_description: 0.8
        },
        avoidance: {
          chaotic: 0.8,
          loud: 0.7,
          unorganized: 0.9
        },
        keywords: ['색면', '서정', '감성', '큐레이션', '아카이브'],
        ideal_venues: ['리움', '송은', '플라토', 'PKM갤러리']
      },

      LAMF: {
        name: '직관적 탐구자',
        preferences: {
          abstraction: 0.85,
          solitude: 0.75,
          philosophical: 0.9,
          conceptual: 0.95,
          freedom: 0.8,
          intellectual: 0.85,
          experimental: 0.8
        },
        avoidance: {
          superficial: 0.8,
          commercial: 0.7,
          conventional: 0.6
        },
        keywords: ['개념', '철학', '실험', '미디어', '설치', '현대'],
        ideal_venues: ['아트선재', '일민미술관', '백남준아트센터', '두산갤러리']
      },

      LAMC: {
        name: '철학적 수집가',
        preferences: {
          abstraction: 0.75,
          solitude: 0.8,
          philosophical: 0.95,
          systematic: 0.9,
          documentation: 0.85,
          historical_context: 0.8,
          archive_quality: 0.9
        },
        avoidance: {
          ephemeral: 0.7,
          trendy: 0.8,
          incomplete_info: 0.9
        },
        keywords: ['아카이브', '회고', '문헌', '역사', '체계', '연구'],
        ideal_venues: ['국립현대미술관', '서울시립미술관', '호암미술관']
      },

      // 관찰자 부족 (Observers) - LR군
      LREF: {
        name: '고독한 관찰자',
        preferences: {
          realism: 0.9,
          solitude: 0.85,
          emotional_depth: 0.8,
          detail_richness: 0.9,
          quiet_space: 0.85,
          natural_light: 0.7,
          contemplative: 0.8
        },
        avoidance: {
          abstract_extreme: 0.7,
          noisy: 0.8,
          rushed_viewing: 0.9
        },
        keywords: ['사실', '인상', '풍경', '초상', '세밀', '관찰'],
        ideal_venues: ['국립중앙박물관', '간송미술관', '환기미술관']
      },

      LREC: {
        name: '섬세한 감정가',
        preferences: {
          realism: 0.85,
          solitude: 0.7,
          emotional_depth: 0.95,
          systematic: 0.8,
          delicate_expression: 0.9,
          warm_colors: 0.8,
          human_stories: 0.85
        },
        avoidance: {
          harsh_themes: 0.7,
          cold_abstraction: 0.8,
          impersonal: 0.7
        },
        keywords: ['세밀화', '정물', '일상', '감성', '따뜻한', '이야기'],
        ideal_venues: ['사비나미술관', '대림미술관', '예술의전당']
      },

      LRMF: {
        name: '디지털 탐험가',
        preferences: {
          realism: 0.7,
          solitude: 0.75,
          technology: 0.95,
          innovation: 0.9,
          multimedia: 0.85,
          information_rich: 0.8,
          digital_tools: 0.9
        },
        avoidance: {
          analog_only: 0.6,
          traditional_only: 0.7,
          tech_free: 0.8
        },
        keywords: ['디지털', 'VR', '인터랙티브', '미디어', '혁신', '기술'],
        ideal_venues: ['아르떼뮤지엄', '팀랩', '문화역서울284', 'UAA']
      },

      LRMC: {
        name: '학구적 연구자',
        preferences: {
          realism: 0.8,
          solitude: 0.8,
          academic: 0.95,
          systematic: 0.9,
          historical: 0.9,
          technique_focus: 0.85,
          documentation: 0.9
        },
        avoidance: {
          superficial: 0.9,
          trendy: 0.7,
          poorly_researched: 0.95
        },
        keywords: ['고전', '미술사', '기법', '복원', '학술', '연구'],
        ideal_venues: ['국립중앙박물관', '서울대미술관', '이화여대박물관']
      },

      // 연결자 부족 (Connectors) - SA군
      SAEF: {
        name: '감성 나누미',
        preferences: {
          abstraction: 0.8,
          social: 0.9,
          emotional_depth: 0.85,
          shareability: 0.95,
          colorful: 0.8,
          instagram_worthy: 0.7,
          group_friendly: 0.9
        },
        avoidance: {
          solo_only: 0.8,
          dark_themes: 0.6,
          no_photo: 0.7
        },
        keywords: ['팝아트', '설치', '컬러풀', '참여', '공유', 'SNS'],
        ideal_venues: ['디뮤지엄', '대림미술관', '그라운드시소', '스페이스K']
      },

      SAEC: {
        name: '예술 네트워커',
        preferences: {
          abstraction: 0.75,
          social: 0.85,
          emotional_depth: 0.8,
          systematic: 0.85,
          networking: 0.9,
          opening_events: 0.85,
          community: 0.9
        },
        avoidance: {
          isolated: 0.7,
          no_events: 0.8,
          anonymous: 0.6
        },
        keywords: ['그룹전', '아트페어', '비엔날레', '커뮤니티', '네트워킹'],
        ideal_venues: ['코엑스', '서울시립미술관', '세종문화회관', '킨텍스']
      },

      SAMF: {
        name: '영감 전도사',
        preferences: {
          abstraction: 0.8,
          social: 0.85,
          inspirational: 0.95,
          energetic: 0.9,
          innovative: 0.85,
          message_driven: 0.8,
          transformative: 0.85
        },
        avoidance: {
          pessimistic: 0.7,
          static: 0.8,
          conventional: 0.7
        },
        keywords: ['현대', '실험', '액션', '거리', '영감', '혁신'],
        ideal_venues: ['플랫폼엘', '아라리오', '페이스갤러리', '원앤제이']
      },

      SAMC: {
        name: '문화 기획자',
        preferences: {
          abstraction: 0.7,
          social: 0.8,
          cultural: 0.95,
          systematic: 0.9,
          educational: 0.85,
          program_quality: 0.9,
          accessibility: 0.85
        },
        avoidance: {
          elitist: 0.8,
          disorganized: 0.9,
          limited_access: 0.7
        },
        keywords: ['기획', '교육', '공공', '문화', '프로그램', '워크샵'],
        ideal_venues: ['서울시립미술관', 'DDP', '문화비축기지', '마포문화재단']
      },

      // 전달자 부족 (Messengers) - SR군
      SREF: {
        name: '열정적 관람자',
        preferences: {
          realism: 0.8,
          social: 0.95,
          emotional_depth: 0.8,
          enthusiasm: 0.95,
          fun_factor: 0.9,
          accessible: 0.85,
          vibrant: 0.8
        },
        avoidance: {
          boring: 0.9,
          too_serious: 0.7,
          isolated: 0.8
        },
        keywords: ['대중', '인터랙티브', '체험', '팝컬처', '즐거운', '활기'],
        ideal_venues: ['롯데뮤지엄', '코엑스아쿠아리움', '트릭아이뮤지엄']
      },

      SREC: {
        name: '따뜻한 안내자',
        preferences: {
          realism: 0.85,
          social: 0.8,
          emotional_depth: 0.9,
          systematic: 0.8,
          warmth: 0.95,
          family_friendly: 0.9,
          guidance: 0.85
        },
        avoidance: {
          harsh: 0.8,
          adult_only: 0.7,
          confusing: 0.8
        },
        keywords: ['가족', '동화', '따뜻한', '계절', '친화적', '안내'],
        ideal_venues: ['북서울미술관', '국립어린이미술관', '헬로우뮤지움']
      },

      SRMF: {
        name: '지식 멘토',
        preferences: {
          realism: 0.75,
          social: 0.8,
          knowledge: 0.95,
          teaching: 0.9,
          historical: 0.85,
          discussion: 0.8,
          depth: 0.85
        },
        avoidance: {
          shallow: 0.9,
          no_context: 0.8,
          pure_entertainment: 0.6
        },
        keywords: ['역사', '문명', '거장', '학술', '토론', '강연'],
        ideal_venues: ['국립중앙박물관', '전쟁기념관', '대한민국역사박물관']
      },

      SRMC: {
        name: '체계적 교육자',
        preferences: {
          realism: 0.8,
          social: 0.75,
          educational: 0.95,
          systematic: 0.95,
          structured: 0.9,
          comprehensive: 0.85,
          authoritative: 0.8
        },
        avoidance: {
          chaotic: 0.9,
          incomplete: 0.85,
          amateur: 0.7
        },
        keywords: ['교육', '순회', '국립', '학술', '체계', '도슨트'],
        ideal_venues: ['국립현대미술관', '예술의전당', '국립박물관']
      }
    };
  }

  /**
   * Supabase에서 전시 데이터 가져오기
   */
  async fetchExhibitions(limit = 200) {
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .eq('status', 'ongoing')
        .limit(limit);

      if (error) throw error;
      
      console.log(`✅ ${data.length}개의 전시 데이터를 가져왔습니다.`);
      return data;
    } catch (error) {
      console.error('전시 데이터 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 전시 특성 분석
   */
  analyzeExhibitionCharacteristics(exhibition) {
    const text = `${exhibition.title || ''} ${exhibition.title_ko || ''} ${exhibition.description || ''} ${exhibition.category || ''}`.toLowerCase();
    const venue = exhibition.venue_name || '';

    const characteristics = {
      // 기본 특성
      abstraction: this.calculateAbstraction(text),
      realism: this.calculateRealism(text),
      
      // 감정/지적 특성
      emotional_depth: this.calculateEmotionalDepth(text),
      philosophical: this.calculatePhilosophical(text),
      intellectual: this.calculateIntellectual(text),
      
      // 환경 특성
      solitude: this.calculateSolitude(venue, exhibition),
      social: this.calculateSocial(venue, exhibition),
      crowded: this.calculateCrowdLevel(venue, exhibition),
      
      // 체계성
      systematic: this.calculateSystematic(text, venue),
      freedom: this.calculateFreedom(text, venue),
      
      // 기술/혁신
      technology: this.calculateTechnology(text),
      innovation: this.calculateInnovation(text),
      
      // 교육/문화
      educational: this.calculateEducational(text, venue),
      cultural: this.calculateCultural(text, venue),
      
      // 접근성/공유
      accessibility: this.calculateAccessibility(venue),
      shareability: this.calculateShareability(text, venue),
      family_friendly: this.calculateFamilyFriendly(text),
      
      // 추가 특성
      instagram_worthy: this.calculateInstagramWorthy(text, venue),
      warmth: this.calculateWarmth(text),
      colorful: this.calculateColorfulness(text)
    };

    return characteristics;
  }

  // 특성 계산 메서드들
  calculateAbstraction(text) {
    const keywords = ['추상', '개념', 'abstract', 'conceptual', '미니멀', '색면', '기하'];
    return this.keywordScore(text, keywords);
  }

  calculateRealism(text) {
    const keywords = ['사실', '구상', '인물', '풍경', '정물', 'realistic', '초상'];
    return this.keywordScore(text, keywords);
  }

  calculateEmotionalDepth(text) {
    const keywords = ['감성', '감정', '정서', '마음', '영혼', '느낌', '감동'];
    return this.keywordScore(text, keywords);
  }

  calculatePhilosophical(text) {
    const keywords = ['철학', '사상', '개념', '존재', '본질', '의미', '성찰'];
    return this.keywordScore(text, keywords);
  }

  calculateIntellectual(text) {
    const keywords = ['지적', '학술', '연구', '이론', '비평', '담론', '분석'];
    return this.keywordScore(text, keywords);
  }

  calculateSolitude(venue, exhibition) {
    const quietVenues = ['간송', '환기', '리움', '호암'];
    const score = quietVenues.some(v => venue.includes(v)) ? 0.8 : 0.5;
    return score;
  }

  calculateSocial(venue, exhibition) {
    const socialVenues = ['코엑스', '롯데', 'DDP', '아트페어'];
    const score = socialVenues.some(v => venue.includes(v)) ? 0.8 : 0.5;
    return score;
  }

  calculateCrowdLevel(venue, exhibition) {
    const popularVenues = ['국립', '서울시립', '예술의전당', '롯데'];
    const score = popularVenues.some(v => venue.includes(v)) ? 0.7 : 0.4;
    return score;
  }

  calculateSystematic(text, venue) {
    const keywords = ['체계', '구성', '순서', '구조', '기획', '큐레이션'];
    const majorVenues = ['국립', '리움', '서울시립'];
    const textScore = this.keywordScore(text, keywords);
    const venueScore = majorVenues.some(v => venue.includes(v)) ? 0.7 : 0.4;
    return (textScore + venueScore) / 2;
  }

  calculateFreedom(text, venue) {
    const keywords = ['자유', '실험', '설치', '참여', '인터랙티브'];
    return this.keywordScore(text, keywords);
  }

  calculateTechnology(text) {
    const keywords = ['디지털', '미디어', 'VR', 'AR', '인터랙티브', '가상', '기술'];
    return this.keywordScore(text, keywords);
  }

  calculateInnovation(text) {
    const keywords = ['혁신', '실험', '새로운', '최초', '현대', '미래', '선구'];
    return this.keywordScore(text, keywords);
  }

  calculateEducational(text, venue) {
    const keywords = ['교육', '학습', '워크샵', '강연', '프로그램', '도슨트'];
    const educationalVenues = ['국립', '서울시립', '어린이'];
    const textScore = this.keywordScore(text, keywords);
    const venueScore = educationalVenues.some(v => venue.includes(v)) ? 0.6 : 0.3;
    return (textScore + venueScore) / 2;
  }

  calculateCultural(text, venue) {
    const keywords = ['문화', '전통', '역사', '유산', '민족', '국제'];
    return this.keywordScore(text, keywords);
  }

  calculateAccessibility(venue) {
    const accessibleVenues = ['국립', '서울시립', 'DDP', '예술의전당', '코엑스'];
    return accessibleVenues.some(v => venue.includes(v)) ? 0.8 : 0.5;
  }

  calculateShareability(text, venue) {
    const keywords = ['인스타', 'SNS', '포토', '체험', '참여', '인터랙티브'];
    const shareableVenues = ['대림', '디뮤지엄', '아르떼', '팀랩'];
    const textScore = this.keywordScore(text, keywords);
    const venueScore = shareableVenues.some(v => venue.includes(v)) ? 0.8 : 0.4;
    return (textScore + venueScore) / 2;
  }

  calculateFamilyFriendly(text) {
    const keywords = ['가족', '어린이', '키즈', '체험', '동화', '교육'];
    return this.keywordScore(text, keywords);
  }

  calculateInstagramWorthy(text, venue) {
    const keywords = ['포토', '사진', '인스타', '체험', '미디어', '설치'];
    const instagramVenues = ['대림', '디뮤지엄', '팀랩', '아르떼'];
    const textScore = this.keywordScore(text, keywords);
    const venueScore = instagramVenues.some(v => venue.includes(v)) ? 0.8 : 0.3;
    return (textScore + venueScore) / 2;
  }

  calculateWarmth(text) {
    const keywords = ['따뜻', '온화', '평화', '행복', '사랑', '가족', '희망'];
    return this.keywordScore(text, keywords);
  }

  calculateColorfulness(text) {
    const keywords = ['컬러', '색채', '화려', '다채', '비비드', '팝아트'];
    return this.keywordScore(text, keywords);
  }

  /**
   * 키워드 점수 계산 헬퍼
   */
  keywordScore(text, keywords) {
    let matches = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) matches++;
    });
    return Math.min(1, matches / Math.max(1, keywords.length) * 2);
  }

  /**
   * APT 타입별 전시 매칭 점수 계산
   */
  calculateMatchScore(exhibition, aptType) {
    const profile = this.typeProfiles[aptType];
    if (!profile) return 0;

    const characteristics = this.analyzeExhibitionCharacteristics(exhibition);
    let score = 0;
    let weightSum = 0;

    // 선호 요소 점수 계산
    for (const [key, weight] of Object.entries(profile.preferences)) {
      if (characteristics[key] !== undefined) {
        score += characteristics[key] * weight;
        weightSum += weight;
      }
    }

    // 회피 요소 감점
    for (const [key, weight] of Object.entries(profile.avoidance)) {
      if (characteristics[key] !== undefined) {
        score -= characteristics[key] * weight * 0.5;
      }
    }

    // 키워드 보너스
    const text = `${exhibition.title || ''} ${exhibition.title_ko || ''} ${exhibition.description || ''}`.toLowerCase();
    const keywordBonus = profile.keywords.filter(k => text.includes(k)).length * 0.05;
    score += keywordBonus;

    // 장소 보너스
    const venue = exhibition.venue_name || '';
    const venueBonus = profile.ideal_venues.some(v => venue.includes(v)) ? 0.1 : 0;
    score += venueBonus;

    // 정규화 (0-100)
    const normalizedScore = Math.max(0, Math.min(100, (score / Math.max(weightSum, 1)) * 100));
    
    return {
      score: Math.round(normalizedScore),
      characteristics,
      keywordMatches: profile.keywords.filter(k => text.includes(k)),
      venueMatch: profile.ideal_venues.some(v => venue.includes(v))
    };
  }

  /**
   * 전체 분석 실행
   */
  async analyzeAllExhibitions() {
    console.log('🎨 SAYU APT 전시 매칭 분석 시작...\n');
    
    const exhibitions = await this.fetchExhibitions();
    if (exhibitions.length === 0) return;

    const results = {};
    
    // 각 APT 타입별로 분석
    Object.keys(this.typeProfiles).forEach(aptType => {
      results[aptType] = [];
      
      exhibitions.forEach(exhibition => {
        const matchResult = this.calculateMatchScore(exhibition, aptType);
        
        if (matchResult.score > 30) { // 30점 이상만 추천
          results[aptType].push({
            exhibition_id: exhibition.id,
            title: exhibition.title_ko || exhibition.title,
            venue: exhibition.venue_name,
            score: matchResult.score,
            characteristics: matchResult.characteristics,
            keyword_matches: matchResult.keywordMatches,
            venue_match: matchResult.venueMatch,
            start_date: exhibition.start_date,
            end_date: exhibition.end_date
          });
        }
      });
      
      // 점수 순으로 정렬
      results[aptType].sort((a, b) => b.score - a.score);
      results[aptType] = results[aptType].slice(0, 10); // 상위 10개만
    });

    return results;
  }

  /**
   * 결과 출력
   */
  printResults(results) {
    console.log('\n=== 📊 APT 타입별 전시 추천 결과 ===\n');
    
    Object.entries(results).forEach(([aptType, exhibitions]) => {
      const profile = this.typeProfiles[aptType];
      console.log(`\n🎯 ${aptType} - ${profile.name}`);
      console.log('─'.repeat(50));
      
      if (exhibitions.length === 0) {
        console.log('추천할 전시가 없습니다.');
      } else {
        exhibitions.slice(0, 5).forEach((ex, idx) => {
          console.log(`\n${idx + 1}. ${ex.title} [${ex.score}점]`);
          console.log(`   📍 ${ex.venue}`);
          if (ex.keyword_matches.length > 0) {
            console.log(`   🔑 매칭 키워드: ${ex.keyword_matches.join(', ')}`);
          }
          if (ex.venue_match) {
            console.log(`   ✨ 선호 장소 매칭!`);
          }
        });
      }
    });
  }
}

// 실행
async function main() {
  const analyzer = new APTExhibitionAnalyzer();
  const results = await analyzer.analyzeAllExhibitions();
  analyzer.printResults(results);
  
  // 결과를 파일로 저장
  const fs = require('fs');
  fs.writeFileSync(
    'apt-exhibition-analysis-results.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log('\n💾 분석 결과가 apt-exhibition-analysis-results.json 파일에 저장되었습니다.');
}

// 모듈로 사용하거나 직접 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = APTExhibitionAnalyzer;
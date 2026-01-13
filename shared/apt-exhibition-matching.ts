/**
 * APT (Art Personality Type) → 전시 매칭 알고리즘
 * MVP 1: Global Exhibition Recommendation System
 *
 * 16가지 성격 유형별 전시 추천을 위한 매칭 시스템
 */

// 전시 장르/테마 정의
export const EXHIBITION_GENRES = {
  // 추상적 장르
  ABSTRACT_EXPRESSIONISM: 'abstract_expressionism',
  SURREALISM: 'surrealism',
  MINIMALISM: 'minimalism',
  CONCEPTUAL: 'conceptual',
  INSTALLATION: 'installation',
  MEDIA_ART: 'media_art',

  // 구상적 장르
  IMPRESSIONISM: 'impressionism',
  RENAISSANCE: 'renaissance',
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
  STILL_LIFE: 'still_life',
  REALISM: 'realism',

  // 현대적 장르
  CONTEMPORARY: 'contemporary',
  POP_ART: 'pop_art',
  STREET_ART: 'street_art',
  PHOTOGRAPHY: 'photography',

  // 문화적 장르
  TRADITIONAL_ASIAN: 'traditional_asian',
  CLASSICAL: 'classical',
  FOLK_ART: 'folk_art'
} as const;

export type ExhibitionGenre = typeof EXHIBITION_GENRES[keyof typeof EXHIBITION_GENRES];

// APT 유형별 선호 장르 매핑
export interface APTGenrePreference {
  preferred: ExhibitionGenre[];    // 가장 선호 (가중치 1.0)
  compatible: ExhibitionGenre[];   // 호환 (가중치 0.7)
  neutral: ExhibitionGenre[];      // 중립 (가중치 0.4)
}

export const APT_GENRE_PREFERENCES: Record<string, APTGenrePreference> = {
  // === L (Lone) + A (Abstract) 유형 ===
  LAEF: {
    preferred: ['abstract_expressionism', 'surrealism', 'minimalism'],
    compatible: ['conceptual', 'installation', 'media_art'],
    neutral: ['impressionism', 'contemporary']
  },
  LAEC: {
    preferred: ['minimalism', 'abstract_expressionism', 'conceptual'],
    compatible: ['surrealism', 'installation', 'media_art'],
    neutral: ['contemporary', 'photography']
  },
  LAMF: {
    preferred: ['conceptual', 'surrealism', 'installation'],
    compatible: ['abstract_expressionism', 'media_art', 'minimalism'],
    neutral: ['contemporary', 'photography']
  },
  LAMC: {
    preferred: ['conceptual', 'minimalism', 'installation'],
    compatible: ['abstract_expressionism', 'media_art', 'classical'],
    neutral: ['renaissance', 'contemporary']
  },

  // === L (Lone) + R (Realistic) 유형 ===
  LREF: {
    preferred: ['impressionism', 'landscape', 'portrait'],
    compatible: ['realism', 'still_life', 'photography'],
    neutral: ['contemporary', 'classical']
  },
  LREC: {
    preferred: ['portrait', 'still_life', 'realism'],
    compatible: ['impressionism', 'landscape', 'classical'],
    neutral: ['photography', 'renaissance']
  },
  LRMF: {
    preferred: ['photography', 'contemporary', 'media_art'],
    compatible: ['realism', 'street_art', 'pop_art'],
    neutral: ['impressionism', 'installation']
  },
  LRMC: {
    preferred: ['renaissance', 'classical', 'portrait'],
    compatible: ['realism', 'landscape', 'still_life'],
    neutral: ['impressionism', 'photography']
  },

  // === S (Social) + A (Abstract) 유형 ===
  SAEF: {
    preferred: ['pop_art', 'installation', 'street_art'],
    compatible: ['abstract_expressionism', 'contemporary', 'media_art'],
    neutral: ['surrealism', 'photography']
  },
  SAEC: {
    preferred: ['installation', 'contemporary', 'media_art'],
    compatible: ['pop_art', 'conceptual', 'abstract_expressionism'],
    neutral: ['photography', 'street_art']
  },
  SAMF: {
    preferred: ['street_art', 'pop_art', 'installation'],
    compatible: ['media_art', 'contemporary', 'abstract_expressionism'],
    neutral: ['conceptual', 'photography']
  },
  SAMC: {
    preferred: ['conceptual', 'installation', 'contemporary'],
    compatible: ['media_art', 'pop_art', 'traditional_asian'],
    neutral: ['classical', 'photography']
  },

  // === S (Social) + R (Realistic) 유형 ===
  SREF: {
    preferred: ['pop_art', 'street_art', 'photography'],
    compatible: ['impressionism', 'contemporary', 'portrait'],
    neutral: ['landscape', 'realism']
  },
  SREC: {
    preferred: ['impressionism', 'portrait', 'landscape'],
    compatible: ['realism', 'photography', 'still_life'],
    neutral: ['contemporary', 'classical']
  },
  SRMF: {
    preferred: ['classical', 'renaissance', 'traditional_asian'],
    compatible: ['portrait', 'landscape', 'realism'],
    neutral: ['photography', 'contemporary']
  },
  SRMC: {
    preferred: ['classical', 'renaissance', 'portrait'],
    compatible: ['realism', 'landscape', 'traditional_asian'],
    neutral: ['impressionism', 'photography']
  }
};

// 전시 특성 인터페이스
export interface ExhibitionFeatures {
  id: string;
  title: string;
  genres: ExhibitionGenre[];
  emotionalTone: 'contemplative' | 'energetic' | 'serene' | 'provocative' | 'educational';
  interactivity: 'high' | 'medium' | 'low';
  crowdLevel: 'high' | 'medium' | 'low';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 매칭 결과 인터페이스
export interface MatchResult {
  exhibitionId: string;
  score: number;           // 0-100
  matchReasons: string[];  // 왜 매칭되었는지
  confidence: 'high' | 'medium' | 'low';
}

/**
 * APT 유형과 전시 특성을 기반으로 매칭 점수 계산
 */
export function calculateMatchScore(
  aptCode: string,
  exhibition: ExhibitionFeatures
): MatchResult {
  const preferences = APT_GENRE_PREFERENCES[aptCode];
  if (!preferences) {
    return {
      exhibitionId: exhibition.id,
      score: 50,
      matchReasons: ['기본 추천'],
      confidence: 'low'
    };
  }

  let totalScore = 0;
  const matchReasons: string[] = [];

  // 1. 장르 매칭 (최대 60점)
  let genreScore = 0;
  for (const genre of exhibition.genres) {
    if (preferences.preferred.includes(genre)) {
      genreScore += 20;
      matchReasons.push(`선호 장르: ${genre}`);
    } else if (preferences.compatible.includes(genre)) {
      genreScore += 14;
    } else if (preferences.neutral.includes(genre)) {
      genreScore += 8;
    }
  }
  genreScore = Math.min(genreScore, 60);
  totalScore += genreScore;

  // 2. 성격 특성 매칭 (최대 25점)
  const aptTraits = getAPTTraits(aptCode);

  // 혼자(L) vs 함께(S)
  if (aptCode.startsWith('L')) {
    if (exhibition.crowdLevel === 'low') {
      totalScore += 10;
      matchReasons.push('조용한 관람 환경');
    } else if (exhibition.crowdLevel === 'high') {
      totalScore -= 5;
    }
  } else {
    if (exhibition.interactivity === 'high') {
      totalScore += 10;
      matchReasons.push('소셜 인터랙션 가능');
    }
  }

  // 감정(E) vs 의미(M)
  if (aptCode[2] === 'E') {
    if (exhibition.emotionalTone === 'energetic' || exhibition.emotionalTone === 'provocative') {
      totalScore += 8;
      matchReasons.push('감정적 자극');
    }
  } else {
    if (exhibition.emotionalTone === 'contemplative' || exhibition.emotionalTone === 'educational') {
      totalScore += 8;
      matchReasons.push('의미 탐구 적합');
    }
  }

  // 자유(F) vs 체계(C)
  if (aptCode[3] === 'F') {
    if (exhibition.interactivity === 'high') {
      totalScore += 7;
    }
  } else {
    if (exhibition.difficulty !== 'beginner') {
      totalScore += 5;
      matchReasons.push('체계적 감상 가능');
    }
  }

  // 3. 난이도 매칭 (최대 15점)
  // 진지한 탐구자(M)는 고급 전시 선호
  if (aptCode[2] === 'M' && exhibition.difficulty === 'advanced') {
    totalScore += 15;
    matchReasons.push('깊이 있는 전시');
  } else if (exhibition.difficulty === 'intermediate') {
    totalScore += 10;
  } else {
    totalScore += 5;
  }

  // 점수 정규화 (0-100)
  totalScore = Math.min(Math.max(totalScore, 0), 100);

  // 신뢰도 결정
  let confidence: 'high' | 'medium' | 'low';
  if (totalScore >= 75 && matchReasons.length >= 3) {
    confidence = 'high';
  } else if (totalScore >= 50) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    exhibitionId: exhibition.id,
    score: Math.round(totalScore),
    matchReasons,
    confidence
  };
}

/**
 * APT 유형의 핵심 특성 추출
 */
function getAPTTraits(aptCode: string): {
  social: 'lone' | 'social';
  style: 'abstract' | 'realistic';
  response: 'emotional' | 'meaning';
  approach: 'free' | 'structured';
} {
  return {
    social: aptCode[0] === 'L' ? 'lone' : 'social',
    style: aptCode[1] === 'A' ? 'abstract' : 'realistic',
    response: aptCode[2] === 'E' ? 'emotional' : 'meaning',
    approach: aptCode[3] === 'F' ? 'free' : 'structured'
  };
}

/**
 * 여러 전시에 대해 매칭 점수 계산 후 정렬
 */
export function rankExhibitions(
  aptCode: string,
  exhibitions: ExhibitionFeatures[]
): MatchResult[] {
  const results = exhibitions.map(ex => calculateMatchScore(aptCode, ex));
  return results.sort((a, b) => b.score - a.score);
}

/**
 * 전시 장르 키워드로 장르 추론
 */
export function inferGenresFromKeywords(keywords: string[]): ExhibitionGenre[] {
  const genreMapping: Record<string, ExhibitionGenre> = {
    // 추상
    '추상': 'abstract_expressionism',
    'abstract': 'abstract_expressionism',
    '초현실': 'surrealism',
    'surreal': 'surrealism',
    '미니멀': 'minimalism',
    'minimal': 'minimalism',
    '개념': 'conceptual',
    'conceptual': 'conceptual',
    '설치': 'installation',
    'installation': 'installation',
    '미디어': 'media_art',
    'media': 'media_art',
    '디지털': 'media_art',
    'digital': 'media_art',

    // 구상
    '인상주의': 'impressionism',
    'impressionist': 'impressionism',
    '르네상스': 'renaissance',
    'renaissance': 'renaissance',
    '초상': 'portrait',
    'portrait': 'portrait',
    '풍경': 'landscape',
    'landscape': 'landscape',
    '정물': 'still_life',
    'still life': 'still_life',
    '사실': 'realism',
    'realism': 'realism',

    // 현대
    '현대': 'contemporary',
    'contemporary': 'contemporary',
    '팝': 'pop_art',
    'pop': 'pop_art',
    '스트릿': 'street_art',
    'street': 'street_art',
    '그래피티': 'street_art',
    'graffiti': 'street_art',
    '사진': 'photography',
    'photo': 'photography',

    // 전통
    '한국화': 'traditional_asian',
    '동양화': 'traditional_asian',
    '수묵': 'traditional_asian',
    '고전': 'classical',
    'classical': 'classical',
    '민속': 'folk_art',
    'folk': 'folk_art'
  };

  const genres: ExhibitionGenre[] = [];
  const keywordsLower = keywords.map(k => k.toLowerCase());

  for (const keyword of keywordsLower) {
    for (const [pattern, genre] of Object.entries(genreMapping)) {
      if (keyword.includes(pattern.toLowerCase())) {
        if (!genres.includes(genre)) {
          genres.push(genre);
        }
      }
    }
  }

  // 장르를 찾지 못하면 기본값
  if (genres.length === 0) {
    genres.push('contemporary');
  }

  return genres;
}

/**
 * APT 유형에 대한 추천 메시지 생성
 */
export function getRecommendationMessage(
  aptCode: string,
  matchScore: number,
  locale: 'ko' | 'en' = 'ko'
): string {
  const messages: Record<string, Record<string, string>> = {
    ko: {
      high: `${aptCode} 유형에 ${matchScore}% 매칭! 꼭 방문해보세요.`,
      medium: `${aptCode} 유형과 ${matchScore}% 어울리는 전시입니다.`,
      low: `${aptCode} 유형에게 새로운 시각을 제공할 수 있는 전시입니다.`
    },
    en: {
      high: `${matchScore}% match for ${aptCode}! A must-visit exhibition.`,
      medium: `${matchScore}% compatible with ${aptCode} personality.`,
      low: `This exhibition may offer new perspectives for ${aptCode} types.`
    }
  };

  const level = matchScore >= 75 ? 'high' : matchScore >= 50 ? 'medium' : 'low';
  return messages[locale][level];
}

export default {
  APT_GENRE_PREFERENCES,
  EXHIBITION_GENRES,
  calculateMatchScore,
  rankExhibitions,
  inferGenresFromKeywords,
  getRecommendationMessage
};

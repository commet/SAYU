/**
 * MMCA Tour Artwork Recommendation Engine
 * APT 유형 기반 작품 추천 로직
 */

import { SAYUTypeCode, SAYU_TYPES } from '@/shared/SAYUTypeDefinitions';
import {
  MMCAArtwork,
  MMCAExhibition,
  MMCAArtist,
  RecommendedArtwork,
  APT_ARTWORK_PREFERENCES,
  APTArtworkPreferences
} from '@/types/mmca-tour';
import {
  MMCA_ARTWORKS,
  MMCA_EXHIBITIONS,
  MMCA_ARTISTS,
  getExhibitionById,
  getArtistById
} from '@/data/mmca-tour-data';

/**
 * 태그 매칭 점수 계산
 */
function calculateTagMatchScore(
  artworkTags: string[],
  preferredTags: string[],
  avoidTags: string[] = []
): number {
  if (preferredTags.length === 0) return 0;

  let matchCount = 0;
  let avoidCount = 0;

  for (const tag of artworkTags) {
    if (preferredTags.includes(tag)) {
      matchCount++;
    }
    if (avoidTags.includes(tag)) {
      avoidCount++;
    }
  }

  // 선호 태그 매칭 비율에서 회피 태그 페널티 차감
  const matchRatio = matchCount / preferredTags.length;
  const avoidPenalty = avoidCount * 0.2;

  return Math.max(0, matchRatio - avoidPenalty);
}

/**
 * 작품과 APT 유형 간의 매칭 점수 계산
 */
function calculateArtworkMatchScore(
  artwork: MMCAArtwork,
  preferences: APTArtworkPreferences
): number {
  const { matchWeight } = preferences;

  // 스타일 태그 매칭
  const styleScore = calculateTagMatchScore(
    artwork.styleTags,
    preferences.preferredStyleTags,
    preferences.avoidStyleTags
  );

  // 분위기 태그 매칭
  const moodScore = calculateTagMatchScore(
    artwork.moodTags,
    preferences.preferredMoodTags,
    preferences.avoidMoodTags
  );

  // 테마 태그 매칭
  const themeScore = calculateTagMatchScore(
    artwork.themeTags,
    preferences.preferredThemeTags,
    preferences.avoidThemeTags
  );

  // 가중치 적용 총점
  const totalScore =
    styleScore * matchWeight.style +
    moodScore * matchWeight.mood +
    themeScore * matchWeight.theme;

  return totalScore;
}

/**
 * APT 유형에 맞는 추천 이유 생성
 */
function generateRecommendationReason(
  artwork: MMCAArtwork,
  artist: MMCAArtist,
  aptType: SAYUTypeCode
): string {
  // 작품에 APT별 맞춤 추천 이유가 있으면 사용
  if (artwork.aptRecommendations?.[aptType]) {
    return artwork.aptRecommendations[aptType]!;
  }

  // 없으면 APT 특성과 작품 태그 기반으로 생성
  const typeInfo = SAYU_TYPES[aptType];
  const preferences = APT_ARTWORK_PREFERENCES[aptType];

  // 매칭되는 태그 찾기
  const matchedStyleTags = artwork.styleTags.filter(tag =>
    preferences.preferredStyleTags.includes(tag)
  );
  const matchedMoodTags = artwork.moodTags.filter(tag =>
    preferences.preferredMoodTags.includes(tag)
  );

  // 추천 이유 템플릿
  const reasons: string[] = [];

  if (matchedMoodTags.length > 0) {
    reasons.push(`${matchedMoodTags.join(', ')} 분위기를 좋아하는 당신에게`);
  }
  if (matchedStyleTags.length > 0) {
    reasons.push(`${matchedStyleTags.join(', ')} 스타일의 작품이`);
  }

  const baseReason = reasons.length > 0
    ? reasons.join(' ')
    : `${typeInfo.description}을 좋아하는 당신에게`;

  return `${baseReason}, ${artist.name} 작가의 이 작품이 특별한 경험을 선사할 것입니다.`;
}

/**
 * 감상 팁 생성
 */
function generateViewingTips(
  artwork: MMCAArtwork,
  aptType: SAYUTypeCode
): string[] {
  const tips: string[] = [];
  const typeInfo = SAYU_TYPES[aptType];

  // 작품의 감상 질문을 팁으로 변환
  if (artwork.viewingQuestions && artwork.viewingQuestions.length > 0) {
    tips.push(...artwork.viewingQuestions.slice(0, 2));
  }

  // APT 특성에 맞는 일반 팁 추가
  if (typeInfo.characteristics.includes('감성적') || typeInfo.characteristics.includes('감정적')) {
    tips.push('첫인상에서 느껴지는 감정에 집중해보세요.');
  }
  if (typeInfo.characteristics.includes('분석적') || typeInfo.characteristics.includes('체계적')) {
    tips.push('작품의 구성과 기법을 자세히 살펴보세요.');
  }
  if (typeInfo.characteristics.includes('철학적') || typeInfo.characteristics.includes('탐구적')) {
    tips.push('작가가 던지는 질문은 무엇인지 생각해보세요.');
  }
  if (typeInfo.characteristics.includes('사교적') || typeInfo.characteristics.includes('나눔')) {
    tips.push('이 작품에 대해 함께 온 사람과 이야기 나눠보세요.');
  }

  return tips.slice(0, 3);
}

/**
 * APT 유형에 맞는 작품 추천
 * @param aptType - 사용자의 APT 유형
 * @param count - 추천할 작품 수 (기본 5개)
 * @param exhibitionIds - 특정 전시로 한정 (선택사항)
 * @returns 추천 작품 목록
 */
export function recommendArtworks(
  aptType: SAYUTypeCode,
  count: number = 5,
  exhibitionIds?: string[]
): RecommendedArtwork[] {
  const preferences = APT_ARTWORK_PREFERENCES[aptType];

  // 대상 작품 필터링
  let targetArtworks = [...MMCA_ARTWORKS];
  if (exhibitionIds && exhibitionIds.length > 0) {
    targetArtworks = targetArtworks.filter(a =>
      exhibitionIds.includes(a.exhibitionId)
    );
  }

  // 각 작품의 매칭 점수 계산
  const scoredArtworks = targetArtworks.map(artwork => ({
    artwork,
    score: calculateArtworkMatchScore(artwork, preferences)
  }));

  // 점수순 정렬
  scoredArtworks.sort((a, b) => b.score - a.score);

  // 전시별 분배를 위한 로직 (각 전시에서 최소 1개씩)
  const exhibitionMap = new Map<string, typeof scoredArtworks>();
  for (const item of scoredArtworks) {
    const exhId = item.artwork.exhibitionId;
    if (!exhibitionMap.has(exhId)) {
      exhibitionMap.set(exhId, []);
    }
    exhibitionMap.get(exhId)!.push(item);
  }

  // 전시별로 최소 1개씩 선택 후 나머지는 점수순
  const selectedArtworks: typeof scoredArtworks = [];
  const usedIds = new Set<string>();

  // 각 전시에서 최고 점수 작품 1개씩 선택
  for (const [, artworks] of exhibitionMap) {
    if (artworks.length > 0 && selectedArtworks.length < count) {
      selectedArtworks.push(artworks[0]);
      usedIds.add(artworks[0].artwork.id);
    }
  }

  // 나머지는 전체 점수순으로 채우기
  for (const item of scoredArtworks) {
    if (selectedArtworks.length >= count) break;
    if (!usedIds.has(item.artwork.id)) {
      selectedArtworks.push(item);
      usedIds.add(item.artwork.id);
    }
  }

  // RecommendedArtwork 형태로 변환
  return selectedArtworks.map(({ artwork, score }) => {
    const exhibition = getExhibitionById(artwork.exhibitionId)!;
    const artist = getArtistById(artwork.artistId)!;

    return {
      artwork,
      exhibition,
      artist,
      matchScore: Math.round(score * 100),
      recommendationReason: generateRecommendationReason(artwork, artist, aptType),
      viewingTips: generateViewingTips(artwork, aptType)
    };
  });
}

/**
 * 전시별 추천 작품 요약
 */
export function getRecommendationsByExhibition(
  aptType: SAYUTypeCode,
  exhibitionIds?: string[]
): Map<string, RecommendedArtwork[]> {
  const recommendations = recommendArtworks(aptType, 10, exhibitionIds);
  const byExhibition = new Map<string, RecommendedArtwork[]>();

  for (const rec of recommendations) {
    const exhId = rec.exhibition.id;
    if (!byExhibition.has(exhId)) {
      byExhibition.set(exhId, []);
    }
    byExhibition.get(exhId)!.push(rec);
  }

  return byExhibition;
}

/**
 * 모든 전시 정보 가져오기
 */
export function getAllExhibitions(): MMCAExhibition[] {
  return MMCA_EXHIBITIONS;
}

/**
 * 작품 검색 (현장에서 빠른 검색용)
 */
export function quickSearchArtworks(query: string): {
  artwork: MMCAArtwork;
  exhibition: MMCAExhibition;
  artist: MMCAArtist;
}[] {
  if (!query || query.length < 1) return [];

  const lowercaseQuery = query.toLowerCase();
  const results = MMCA_ARTWORKS.filter(artwork => {
    const artist = getArtistById(artwork.artistId);
    return (
      artwork.title.toLowerCase().includes(lowercaseQuery) ||
      artwork.titleEn?.toLowerCase().includes(lowercaseQuery) ||
      artist?.name.toLowerCase().includes(lowercaseQuery) ||
      artist?.nameEn?.toLowerCase().includes(lowercaseQuery)
    );
  });

  return results.map(artwork => ({
    artwork,
    exhibition: getExhibitionById(artwork.exhibitionId)!,
    artist: getArtistById(artwork.artistId)!
  }));
}

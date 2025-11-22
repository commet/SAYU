/**
 * MMCA Tour Data
 * 국립현대미술관 서울 전시 데이터
 *
 * ⚠️ 데이터 입력 규칙:
 * - 모든 ID는 영문 소문자 + 하이픈만 사용 (예: kim-tschang-yeul-water-drops)
 * - 날짜는 YYYY-MM-DD 형식
 * - 태그는 미리 정의된 값만 사용 (아래 VALID_TAGS 참조)
 */

import { MMCAExhibition, MMCAArtist, MMCAArtwork } from '@/types/mmca-tour';

// ==================== 유효한 태그 목록 (표준화) ====================
export const VALID_STYLE_TAGS = [
  '추상', '구상', '설치미술', '영상', '사운드아트', '사진', '회화',
  '미니멀', '표현주의', '팝아트', '미디어아트', '개념미술', '단색화'
] as const;

export const VALID_MOOD_TAGS = [
  '명상적', '역동적', '고요한', '강렬한', '서정적', '철학적',
  '따뜻한', '차가운', '신비로운', '일상적', '실험적', '전통적'
] as const;

export const VALID_THEME_TAGS = [
  '자연', '인간', '사회', '정체성', '시간', '기억', '치유',
  '물질', '공간', '관계', '역사', '기술', '감정'
] as const;

// ==================== 전시 데이터 ====================
// 필수: id, title, location, startDate, endDate
// 선택: titleEn, description, curatorNote, imageUrl, tags
export const MMCA_EXHIBITIONS: MMCAExhibition[] = [
  // 실제 데이터 입력 대기
];

// ==================== 작가 데이터 ====================
// 필수: id, name
// 선택: nameEn, birthYear, deathYear, nationality, biography, philosophy, anecdotes, styleDescription, imageUrl
export const MMCA_ARTISTS: MMCAArtist[] = [
  // 실제 데이터 입력 대기
];

// ==================== 작품 데이터 ====================
// 필수: id, exhibitionId, artistId, title, floor, styleTags(1개이상), moodTags(1개이상), themeTags(1개이상)
// 선택: titleEn, year, medium, dimensions, description, artistContext, viewingQuestions, room, locationNote, imageUrl, thumbnailUrl, aptRecommendations
export const MMCA_ARTWORKS: MMCAArtwork[] = [
  // 실제 데이터 입력 대기
];

// ==================== 데이터 헬퍼 함수 ====================
export function getExhibitionById(id: string): MMCAExhibition | undefined {
  return MMCA_EXHIBITIONS.find(e => e.id === id);
}

export function getArtistById(id: string): MMCAArtist | undefined {
  return MMCA_ARTISTS.find(a => a.id === id);
}

export function getArtworkById(id: string): MMCAArtwork | undefined {
  return MMCA_ARTWORKS.find(a => a.id === id);
}

export function getArtworksByExhibition(exhibitionId: string): MMCAArtwork[] {
  return MMCA_ARTWORKS.filter(a => a.exhibitionId === exhibitionId);
}

export function getArtworksByArtist(artistId: string): MMCAArtwork[] {
  return MMCA_ARTWORKS.filter(a => a.artistId === artistId);
}

export function searchArtworks(query: string): MMCAArtwork[] {
  if (!query || query.length < 1) return [];
  const lowercaseQuery = query.toLowerCase();
  return MMCA_ARTWORKS.filter(artwork => {
    const artist = getArtistById(artwork.artistId);
    return (
      artwork.title.toLowerCase().includes(lowercaseQuery) ||
      artwork.titleEn?.toLowerCase().includes(lowercaseQuery) ||
      artist?.name.toLowerCase().includes(lowercaseQuery) ||
      artist?.nameEn?.toLowerCase().includes(lowercaseQuery)
    );
  });
}

// ==================== 데이터 검증 함수 ====================
export function validateArtwork(artwork: Partial<MMCAArtwork>): string[] {
  const errors: string[] = [];

  // 필수 필드 검증
  if (!artwork.id) errors.push('id 필수');
  if (!artwork.exhibitionId) errors.push('exhibitionId 필수');
  if (!artwork.artistId) errors.push('artistId 필수');
  if (!artwork.title) errors.push('title 필수');
  if (!artwork.floor) errors.push('floor 필수');
  if (!artwork.styleTags || artwork.styleTags.length === 0) errors.push('styleTags 최소 1개 필수');
  if (!artwork.moodTags || artwork.moodTags.length === 0) errors.push('moodTags 최소 1개 필수');
  if (!artwork.themeTags || artwork.themeTags.length === 0) errors.push('themeTags 최소 1개 필수');

  // ID 형식 검증
  if (artwork.id && !/^[a-z0-9-]+$/.test(artwork.id)) {
    errors.push('id는 영문 소문자, 숫자, 하이픈만 사용');
  }

  // 태그 유효성 검증
  artwork.styleTags?.forEach(tag => {
    if (!VALID_STYLE_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 styleTags: ${tag}`);
    }
  });
  artwork.moodTags?.forEach(tag => {
    if (!VALID_MOOD_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 moodTags: ${tag}`);
    }
  });
  artwork.themeTags?.forEach(tag => {
    if (!VALID_THEME_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 themeTags: ${tag}`);
    }
  });

  // 참조 무결성 검증
  if (artwork.exhibitionId && !getExhibitionById(artwork.exhibitionId)) {
    errors.push(`존재하지 않는 exhibitionId: ${artwork.exhibitionId}`);
  }
  if (artwork.artistId && !getArtistById(artwork.artistId)) {
    errors.push(`존재하지 않는 artistId: ${artwork.artistId}`);
  }

  return errors;
}

/**
 * MMCA Tour Types
 * 국립현대미술관 투어 기능을 위한 타입 정의
 */

import { SAYUTypeCode } from '@sayu/shared/SAYUTypeDefinitions';

// ==================== 전시 (Exhibition) ====================
export interface MMCAExhibition {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  curatorNote?: string; // 큐레이터가 이 전시를 통해 말하고 싶은 것
  startDate: string;
  endDate: string;
  location: string; // 층, 전시실
  imageUrl?: string;
  tags: string[];
}

// ==================== 작가 (Artist) ====================
export interface MMCAArtist {
  id: string;
  name: string;
  nameEn?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  biography: string; // 작가의 삶과 철학
  philosophy?: string; // 작가의 예술 세계관
  anecdotes?: string[]; // 작품 이해에 도움되는 일화들
  styleDescription?: string;
  imageUrl?: string;
}

// ==================== 작품 (Artwork) ====================
export interface MMCAArtwork {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  titleEn?: string;
  year?: string;
  medium?: string; // 재료, 기법
  dimensions?: string;
  description: string;
  artistContext?: string; // 작품이 작가의 생애/시대와 어떻게 연결되는지
  viewingQuestions?: string[]; // 감상할 때 던질 수 있는 질문들
  imageUrl?: string;
  thumbnailUrl?: string;

  // 위치 정보
  floor?: string; // 층
  room?: string; // 전시실
  locationNote?: string; // 약도상 위치 설명

  // APT 매칭을 위한 태그
  styleTags: string[]; // 추상, 구상, 미니멀, 표현주의 등
  moodTags: string[]; // 명상적, 역동적, 고요한, 강렬한 등
  themeTags: string[]; // 자연, 인간, 사회, 정체성 등

  // APT 유형별 추천 이유 (선택적으로 특정 유형에 대한 맞춤 메시지)
  aptRecommendations?: Partial<Record<SAYUTypeCode, string>>;
}

// ==================== APT 매칭 설정 ====================
export interface APTArtworkPreferences {
  preferredStyleTags: string[];
  preferredMoodTags: string[];
  preferredThemeTags: string[];
  avoidStyleTags?: string[];
  avoidMoodTags?: string[];
  avoidThemeTags?: string[];
  matchWeight: {
    style: number;
    mood: number;
    theme: number;
  };
}

// APT 유형별 작품 선호도 매핑
export const APT_ARTWORK_PREFERENCES: Record<SAYUTypeCode, APTArtworkPreferences> = {
  // Lone + Abstract + Emotional
  LAEF: {
    preferredStyleTags: ['추상', '표현주의', '색면추상', '초현실주의'],
    preferredMoodTags: ['명상적', '몽환적', '고요한', '감성적'],
    preferredThemeTags: ['내면', '감정', '자연', '우주'],
    matchWeight: { style: 0.3, mood: 0.5, theme: 0.2 }
  },
  LAEC: {
    preferredStyleTags: ['추상', '미니멀', '기하학적', '색면추상'],
    preferredMoodTags: ['정갈한', '체계적', '섬세한', '깊이있는'],
    preferredThemeTags: ['감정', '구조', '질서', '조화'],
    matchWeight: { style: 0.35, mood: 0.4, theme: 0.25 }
  },
  LAMF: {
    preferredStyleTags: ['추상', '개념미술', '설치미술', '실험적'],
    preferredMoodTags: ['철학적', '탐구적', '신비로운', '사색적'],
    preferredThemeTags: ['의미', '존재', '시간', '무한'],
    matchWeight: { style: 0.25, mood: 0.35, theme: 0.4 }
  },
  LAMC: {
    preferredStyleTags: ['추상', '개념미술', '미니멀', '체계적'],
    preferredMoodTags: ['지적인', '분석적', '깊이있는', '정밀한'],
    preferredThemeTags: ['철학', '역사', '이론', '체계'],
    matchWeight: { style: 0.3, mood: 0.3, theme: 0.4 }
  },

  // Lone + Realistic + Emotional
  LREF: {
    preferredStyleTags: ['구상', '인상주의', '풍경화', '사실주의'],
    preferredMoodTags: ['서정적', '감성적', '자유로운', '따뜻한'],
    preferredThemeTags: ['자연', '일상', '빛', '순간'],
    matchWeight: { style: 0.35, mood: 0.45, theme: 0.2 }
  },
  LREC: {
    preferredStyleTags: ['구상', '세밀화', '정물화', '초상화'],
    preferredMoodTags: ['섬세한', '정교한', '깊이있는', '고요한'],
    preferredThemeTags: ['인물', '사물', '기억', '시간'],
    matchWeight: { style: 0.4, mood: 0.35, theme: 0.25 }
  },
  LRMF: {
    preferredStyleTags: ['구상', '디지털아트', '미디어아트', '현대미술'],
    preferredMoodTags: ['탐험적', '혁신적', '다층적', '분석적'],
    preferredThemeTags: ['기술', '미래', '사회', '변화'],
    matchWeight: { style: 0.3, mood: 0.3, theme: 0.4 }
  },
  LRMC: {
    preferredStyleTags: ['구상', '역사화', '학술적', '문헌적'],
    preferredMoodTags: ['학구적', '정밀한', '체계적', '진지한'],
    preferredThemeTags: ['역사', '문화', '연구', '기록'],
    matchWeight: { style: 0.35, mood: 0.25, theme: 0.4 }
  },

  // Social + Abstract + Emotional
  SAEF: {
    preferredStyleTags: ['추상', '표현주의', '팝아트', '역동적'],
    preferredMoodTags: ['활기찬', '감정적', '열정적', '개방적'],
    preferredThemeTags: ['감정', '소통', '연결', '공감'],
    matchWeight: { style: 0.3, mood: 0.5, theme: 0.2 }
  },
  SAEC: {
    preferredStyleTags: ['추상', '현대미술', '설치미술', '참여미술'],
    preferredMoodTags: ['연결하는', '네트워킹', '조화로운', '배려하는'],
    preferredThemeTags: ['관계', '커뮤니티', '공동체', '조화'],
    matchWeight: { style: 0.3, mood: 0.4, theme: 0.3 }
  },
  SAMF: {
    preferredStyleTags: ['추상', '개념미술', '퍼포먼스', '사회참여'],
    preferredMoodTags: ['영감주는', '선구적', '자유로운', '열정적'],
    preferredThemeTags: ['영감', '비전', '변화', '혁신'],
    matchWeight: { style: 0.25, mood: 0.35, theme: 0.4 }
  },
  SAMC: {
    preferredStyleTags: ['추상', '기획전', '테마전', '종합예술'],
    preferredMoodTags: ['기획적', '조직적', '통합적', '리더십'],
    preferredThemeTags: ['문화', '기획', '통합', '비전'],
    matchWeight: { style: 0.25, mood: 0.35, theme: 0.4 }
  },

  // Social + Realistic + Emotional
  SREF: {
    preferredStyleTags: ['구상', '인상주의', '풍속화', '일상'],
    preferredMoodTags: ['즐거운', '따뜻한', '친근한', '활기찬'],
    preferredThemeTags: ['일상', '사람', '기쁨', '축제'],
    matchWeight: { style: 0.3, mood: 0.5, theme: 0.2 }
  },
  SREC: {
    preferredStyleTags: ['구상', '초상화', '풍경화', '서사적'],
    preferredMoodTags: ['따뜻한', '안내하는', '포용적', '배려하는'],
    preferredThemeTags: ['인물', '이야기', '가이드', '안내'],
    matchWeight: { style: 0.35, mood: 0.4, theme: 0.25 }
  },
  SRMF: {
    preferredStyleTags: ['구상', '역사화', '다큐멘터리', '기록'],
    preferredMoodTags: ['교육적', '지식', '멘토링', '설명적'],
    preferredThemeTags: ['역사', '문화', '교육', '전승'],
    matchWeight: { style: 0.3, mood: 0.3, theme: 0.4 }
  },
  SRMC: {
    preferredStyleTags: ['구상', '학술적', '체계적', '교육용'],
    preferredMoodTags: ['전문적', '교육적', '체계적', '명확한'],
    preferredThemeTags: ['교육', '체계', '전문', '지식'],
    matchWeight: { style: 0.3, mood: 0.3, theme: 0.4 }
  }
};

// ==================== 감상 기록 (Impression) ====================
export interface MMCAImpression {
  id: string;
  oderId: string;
  artworkId: string;
  rating: 'love' | 'like' | 'neutral' | 'dislike'; // 좋아요 정도
  emotionTags: string[]; // 감정 태그들
  memo?: string; // 한 줄 감상
  photoUrl?: string; // 사진 첨부
  createdAt: string;
  isBestPick?: boolean; // 오늘의 Best 작품
}

// 감정 태그 프리셋
export const EMOTION_TAG_PRESETS = [
  { id: 'calm', label: '고요해지는', emoji: '🌊' },
  { id: 'energetic', label: '에너지가 느껴지는', emoji: '⚡' },
  { id: 'familiar', label: '익숙한', emoji: '🏠' },
  { id: 'unfamiliar', label: '낯선', emoji: '🌌' },
  { id: 'nostalgic', label: '그리운', emoji: '🍂' },
  { id: 'questioning', label: '질문이 생기는', emoji: '❓' },
  { id: 'comforting', label: '위로가 되는', emoji: '🤗' },
  { id: 'challenging', label: '도전받는', emoji: '🔥' },
  { id: 'inspiring', label: '영감을 주는', emoji: '💡' },
  { id: 'mysterious', label: '신비로운', emoji: '🔮' },
  { id: 'joyful', label: '기쁜', emoji: '😊' },
  { id: 'melancholic', label: '쓸쓸한', emoji: '🌙' },
] as const;

export type EmotionTagId = typeof EMOTION_TAG_PRESETS[number]['id'];

// ==================== 투어 (Tour) ====================
export interface MMCATour {
  id: string;
  name: string; // 투어 이름 (예: "SAYU 팀 투어")
  createdBy: string; // 생성자 userId
  memberIds: string[]; // 팀원 userIds
  exhibitionIds: string[]; // 관람할 전시 IDs
  visitDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
}

// ==================== 팀원 상태 (Member Status) ====================
export interface MMCATourMemberStatus {
  oderId: string;
  username: string;
  avatarUrl?: string;
  personalityType: SAYUTypeCode;
  impressionCount: number;
  recommendedArtworksViewed: number;
  totalRecommended: number;
  lastActivity?: {
    artworkTitle: string;
    action: 'viewed' | 'recorded';
    timestamp: string;
  };
  isOnline: boolean;
}

// ==================== 추천 작품 (Recommended Artwork) ====================
export interface RecommendedArtwork {
  artwork: MMCAArtwork;
  exhibition: MMCAExhibition;
  artist: MMCAArtist;
  matchScore: number;
  recommendationReason: string; // "왜 당신에게 이 작품인지" 설명
  viewingTips?: string[]; // 감상 팁
}

// ==================== API Response Types ====================
export interface MMCATourPreviewResponse {
  tour: MMCATour;
  exhibitions: MMCAExhibition[];
  recommendedArtworks: RecommendedArtwork[];
  memberStatuses: MMCATourMemberStatus[];
}

export interface RecordImpressionRequest {
  oderId: string;
  artworkId: string;
  rating: MMCAImpression['rating'];
  emotionTags: string[];
  memo?: string;
  photoUrl?: string;
}

export interface TeamGalleryArtwork {
  artwork: MMCAArtwork;
  impressions: (MMCAImpression & {
    user: { username: string; avatarUrl?: string; personalityType: SAYUTypeCode }
  })[];
}

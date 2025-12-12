// SAYU Art Memory System - Type Definitions

export type MemoryType =
  | 'online_artwork'       // 갤러리에서 발견한 작품
  | 'exhibition_visit'     // 전시 방문 자체
  | 'exhibition_artwork'   // 전시에서 본 특정 작품
  | 'personal_note';       // 개인적인 예술 메모

export type EmotionTag =
  | '위로' | '에너지' | '평온' | '호기심'
  | '감동' | '우울' | '기쁨' | '놀라움'
  | '생각할거리' | '압도적' | '아름다움' | '슬픔';

export interface ArtworkData {
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  style?: string;
  museum?: string;
  description?: string;
}

export interface ExhibitionData {
  id: string;
  name: string;
  museum: string;
  location: string;
  visitDate: Date;
  ticketPrice?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface ArtMemory {
  id: string;
  userId: string;

  // 타입 & 시간
  type: MemoryType;
  timestamp: Date;

  // 감정 & 메모
  emotionTags: EmotionTag[];
  personalNote?: string;
  mood?: string;

  // 작품 정보 (optional)
  artworkData?: ArtworkData;

  // 전시 정보 (optional)
  exhibitionId?: string;
  exhibitionData?: ExhibitionData;

  // 미디어 (optional)
  userPhotos?: string[];
  voiceNoteUrl?: string;

  // 컨텍스트
  source: 'online' | 'offline';
  weather?: string;
  companion?: string;
  location?: LocationData;

  // 메타
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationType = 'manual' | 'smart';
export type CoverType = 'auto' | 'custom';

export interface SmartFilters {
  emotions?: EmotionTag[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  exhibitions?: string[];
  artists?: string[];
  styles?: string[];
  source?: 'online' | 'offline';
  minViewCount?: number;
}

export interface Collection {
  id: string;
  userId: string;

  // 기본 정보
  name: string;
  description?: string;
  emoji?: string;
  themeColor: string;  // Hex color

  // 커버 이미지
  coverType: CoverType;
  coverImageUrl?: string;

  // 타입
  organizationType: OrganizationType;
  smartFilters?: SmartFilters;

  // 메타
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareUrl?: string;
}

export type CollectionWithMemories = Collection & {
  memories: ArtMemory[];
  coverImages: string[];  // auto cover용
};

export type TimelineGroup = {
  date: string;  // "2024-12-15"
  memories: ArtMemory[];
};

export type EmotionGroup = {
  emotion: EmotionTag;
  count: number;
  memories: ArtMemory[];
};

/**
 * SAYU Exhibition Recording System Type Definitions
 * 전시 기록 시스템 타입 정의
 *
 * Phase 1 MVP: 관람 타이머, 작품 검색/기록, 감정 선택
 */

// ============================================================================
// Database Entity Types (DB 테이블 직접 매핑)
// ============================================================================

/**
 * 전시 내 작품 정보
 */
export interface ExhibitionArtwork {
  id: string;
  exhibition_id: string;

  // 기본 정보
  title: string;
  title_en?: string;
  artist: string;
  artist_en?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  description_en?: string;

  // 이미지
  image_url?: string;
  thumbnail_url?: string;
  image_hash?: string; // Phase 2: 사진 인식용

  // 전시 내 위치
  location_in_exhibition?: string;
  display_order?: number;

  // 메타데이터
  tags?: string[];
  is_featured?: boolean;

  // 통계
  view_count: number;
  record_count: number;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

/**
 * 사용자 전시 방문 기록
 */
export interface ExhibitionVisit {
  id: string;
  user_id: string;
  exhibition_id: string;

  // 타이밍
  started_at: string;
  ended_at?: string;
  duration_minutes?: number; // Computed field

  // 상태
  status: VisitStatus;

  // 메타데이터
  device_info?: Record<string, any>;
  notes?: string;

  // 오프라인 지원
  is_offline: boolean;
  synced_at?: string;

  // 통계 (캐시)
  total_artworks_recorded: number;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

/**
 * 개별 작품 감상 기록
 */
export interface ArtworkRecord {
  id: string;
  visit_id: string;
  artwork_id: string;

  // 타이밍
  recorded_at: string;
  sequence_number?: number; // 이 방문에서 몇 번째 기록인지

  // 감정 기록
  emotions: string[]; // ['평온', '몽환', '강렬']
  emotion_text?: string; // 직접 입력
  emotion_intensity?: number; // 1-10

  // 추가 메모
  note?: string;
  photo_url?: string; // 사용자가 찍은 사진

  // 인식 방법
  recognition_method: RecognitionMethod;
  recognition_confidence?: number; // 사진 인식 신뢰도 0-100

  // 오프라인 지원
  is_offline_record: boolean;
  synced_at?: string;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Enum Types
// ============================================================================

export type VisitStatus = 'in_progress' | 'completed' | 'abandoned';

export type RecognitionMethod = 'photo' | 'search' | 'manual';

// ============================================================================
// Client-side State Types (프론트엔드 상태 관리용)
// ============================================================================

/**
 * 현재 관람 상태 (Zustand Store)
 */
export interface VisitState {
  // 현재 방문
  currentVisit: ExhibitionVisit | null;
  isRecording: boolean;

  // 타이머
  elapsedSeconds: number;
  timerInterval: ReturnType<typeof setInterval> | null;

  // 기록한 작품 목록 (캐시)
  recordedArtworks: ArtworkRecord[];

  // UI 상태
  isStartModalOpen: boolean;
  isEndModalOpen: boolean;
  isRecordModalOpen: boolean;
}

/**
 * 로컬 스토리지 방문 상태 (오프라인 지원)
 */
export interface LocalVisitState {
  visitId: string;
  exhibitionId: string;
  startedAt: string;
  status: VisitStatus;
  records: LocalArtworkRecord[];
  lastSyncedAt: string;
}

/**
 * 로컬 작품 기록 (오프라인 지원)
 */
export interface LocalArtworkRecord {
  localId: string; // 로컬 임시 ID
  artworkId: string;
  recordedAt: string;
  emotions: string[];
  emotionText?: string;
  note?: string;
  photoDataUrl?: string; // Base64 (sync 전)
  recognitionMethod: RecognitionMethod;
  isSynced: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * 관람 시작 요청
 */
export interface StartVisitRequest {
  exhibitionId: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    screenSize?: string;
  };
}

/**
 * 관람 시작 응답
 */
export interface StartVisitResponse {
  success: boolean;
  data?: {
    visitId: string;
    startedAt: string;
    exhibition: {
      id: string;
      title: string;
      venue: string;
    };
  };
  error?: string;
}

/**
 * 관람 종료 요청
 */
export interface EndVisitRequest {
  visitId: string;
  endedAt: string;
  notes?: string;
}

/**
 * 관람 종료 응답
 */
export interface EndVisitResponse {
  success: boolean;
  data?: {
    visitId: string;
    duration: number; // minutes
    recordCount: number;
    analysisStarted: boolean; // Phase 4: AI 분석
  };
  error?: string;
}

/**
 * 작품 기록 추가 요청
 */
export interface AddRecordRequest {
  visitId: string;
  artworkId: string;
  emotions: string[];
  emotionText?: string;
  emotionIntensity?: number;
  note?: string;
  photo?: File;
  recognitionMethod: RecognitionMethod;
  recordedAt: string;
}

/**
 * 작품 기록 추가 응답
 */
export interface AddRecordResponse {
  success: boolean;
  data?: {
    recordId: string;
    sequenceNumber: number;
    artwork: {
      id: string;
      title: string;
      artist: string;
    };
  };
  error?: string;
}

/**
 * 작품 검색 요청 (자동완성)
 */
export interface SearchArtworksRequest {
  exhibitionId: string;
  query: string;
  limit?: number;
}

/**
 * 작품 검색 응답
 */
export interface SearchArtworksResponse {
  success: boolean;
  data?: ExhibitionArtwork[];
  error?: string;
}

/**
 * 사진 인식 요청 (Phase 2)
 */
export interface RecognizeArtworkRequest {
  image: File;
  exhibitionId: string;
}

/**
 * 사진 인식 응답 (Phase 2)
 */
export interface RecognizeArtworkResponse {
  success: boolean;
  data?: {
    matches: Array<{
      artwork: ExhibitionArtwork;
      confidence: number; // 0-100
    }>;
  };
  error?: string;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

/**
 * 관람 시작 버튼 Props
 */
export interface StartVisitButtonProps {
  exhibitionId: string;
  exhibitionTitle: string;
  onStarted?: (visitId: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 관람 종료 버튼 Props
 */
export interface EndVisitButtonProps {
  visitId: string;
  onEnded?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 플로팅 기록 버튼 Props
 */
export interface FloatingRecordButtonProps {
  visitId: string;
  onClick: () => void;
  disabled?: boolean;
  recordCount: number;
}

/**
 * 작품 검색 모달 Props
 */
export interface ArtworkSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  exhibitionId: string;
  visitId: string;
  onArtworkSelected: (artwork: ExhibitionArtwork) => void;
}

/**
 * 감정 선택 컴포넌트 Props
 */
export interface EmotionSelectorProps {
  selectedEmotions: string[];
  onEmotionsChange: (emotions: string[]) => void;
  maxSelections?: number; // 기본 3개
  userAPT?: string; // Smart suggestions용
  className?: string;
}

/**
 * 관람 진행 헤더 Props
 */
export interface VisitProgressHeaderProps {
  visit: ExhibitionVisit;
  elapsedSeconds: number;
  recordCount: number;
  onEndVisit: () => void;
}

/**
 * 작품 기록 카드 Props
 */
export interface ArtworkRecordCardProps {
  record: ArtworkRecord;
  artwork: ExhibitionArtwork;
  onEdit?: (recordId: string) => void;
  onDelete?: (recordId: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * 감정 정의
 */
export interface Emotion {
  id: string;
  label: string;
  labelEn: string;
  color: string; // Tailwind color class
  emoji?: string;
}

/**
 * 기본 감정 목록
 */
export const EMOTIONS: readonly Emotion[] = Object.freeze([
  { id: 'calm', label: '평온', labelEn: 'Calm', color: 'blue', emoji: '🌊' },
  { id: 'intense', label: '강렬', labelEn: 'Intense', color: 'red', emoji: '🔥' },
  { id: 'dreamy', label: '몽환', labelEn: 'Dreamy', color: 'purple', emoji: '✨' },
  { id: 'sharp', label: '날카로움', labelEn: 'Sharp', color: 'orange', emoji: '⚡' },
  { id: 'warm', label: '따뜻함', labelEn: 'Warm', color: 'amber', emoji: '☀️' },
  { id: 'cool', label: '차가움', labelEn: 'Cool', color: 'cyan', emoji: '❄️' },
  { id: 'soft', label: '부드러움', labelEn: 'Soft', color: 'pink', emoji: '🌸' },
  { id: 'chaotic', label: '혼란', labelEn: 'Chaotic', color: 'gray', emoji: '🌀' },
]);

/**
 * 감정별 색상 맵핑
 */
export const EMOTION_COLORS: Record<string, string> = {
  평온: 'bg-blue-500',
  강렬: 'bg-red-500',
  몽환: 'bg-purple-500',
  날카로움: 'bg-orange-500',
  따뜻함: 'bg-amber-500',
  차가움: 'bg-cyan-500',
  부드러움: 'bg-pink-500',
  혼란: 'bg-gray-500',
};

/**
 * 방문 통계
 */
export interface VisitStats {
  totalDuration: number; // minutes
  artworksRecorded: number;
  mostCommonEmotion: string;
  emotionDistribution: Record<string, number>;
  averageTimePerArtwork: number; // minutes
}

/**
 * 전시 방문 요약 (대시보드용)
 */
export interface VisitSummary {
  visit: ExhibitionVisit;
  exhibition: {
    id: string;
    title: string;
    venue: string;
    image?: string;
  };
  stats: VisitStats;
  topArtworks: Array<{
    artwork: ExhibitionArtwork;
    record: ArtworkRecord;
  }>;
}

// ============================================================================
// Helper Functions Type Guards
// ============================================================================

/**
 * ExhibitionVisit 타입 가드
 */
export function isExhibitionVisit(obj: any): obj is ExhibitionVisit {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.exhibition_id === 'string' &&
    typeof obj.started_at === 'string' &&
    ['in_progress', 'completed', 'abandoned'].includes(obj.status)
  );
}

/**
 * ArtworkRecord 타입 가드
 */
export function isArtworkRecord(obj: any): obj is ArtworkRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.visit_id === 'string' &&
    typeof obj.artwork_id === 'string' &&
    Array.isArray(obj.emotions) &&
    ['photo', 'search', 'manual'].includes(obj.recognition_method)
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  CURRENT_VISIT: 'sayu:current_visit',
  PENDING_SYNC: 'sayu:pending_sync',
  OFFLINE_MODE: 'sayu:offline_mode',
} as const;

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  START_VISIT: '/api/visits/start',
  END_VISIT: '/api/visits/end',
  ADD_RECORD: '/api/visits/records',
  SEARCH_ARTWORKS: '/api/artworks/search',
  RECOGNIZE_ARTWORK: '/api/artworks/recognize', // Phase 2
  GET_VISIT: '/api/visits',
  GET_RECORDS: '/api/visits/records',
} as const;

/**
 * 설정 상수
 */
export const CONFIG = {
  MAX_EMOTIONS_PER_RECORD: 3,
  SEARCH_DEBOUNCE_MS: 300,
  TIMER_UPDATE_INTERVAL_MS: 1000,
  SYNC_RETRY_ATTEMPTS: 3,
  SYNC_RETRY_DELAY_MS: 2000,
} as const;


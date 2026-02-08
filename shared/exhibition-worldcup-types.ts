/**
 * SAYU Exhibition Worldcup System Type Definitions
 * 전시 월드컵 시스템 타입 정의
 *
 * MVP Phase 1: 업로드/검색, 토너먼트 진행, 결과 공유
 */

// ============================================================================
// Database Entity Types (DB 테이블 직접 매핑)
// ============================================================================

/**
 * 월드컵 세션
 */
export type WorldcupMode = 'artwork' | 'exhibition';

export type ExhibitionWorldcupTheme = 'korean' | 'international' | 'ongoing' | 'all';

export interface WorldcupSession {
  id: string;
  user_id?: string;
  exhibition_visit_id?: string;
  exhibition_id?: string;

  // 모드
  mode: WorldcupMode;

  // 설정
  round_type: RoundType;

  // 상태
  status: WorldcupStatus;
  current_match_index: number;
  total_matches?: number;

  // 결과
  winner_participant_id?: string;

  // 타이밍
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

/**
 * 참가 작품
 */
export interface WorldcupParticipant {
  id: string;
  session_id: string;

  // 작품 소스
  source_type: ParticipantSourceType;
  artwork_id?: string;

  // 전시 참조 (exhibition 모드)
  exhibition_ref_id?: string;
  description?: string;

  // 업로드 이미지
  temp_image_url?: string;
  temp_image_path?: string;

  // 작품 정보
  title?: string;
  artist?: string;
  image_url?: string;

  // 토너먼트 상태
  seed_position: number;
  eliminated_round?: number;
  final_rank?: number;

  // 통계
  total_matches: number;
  wins: number;

  // 타임스탬프
  created_at: string;
}

/**
 * 매치 기록
 */
export interface WorldcupMatch {
  id: string;
  session_id: string;

  // 매치 정보
  match_index: number;
  round: number;
  round_match_index: number;

  // 참가자
  participant_a_id: string;
  participant_b_id: string;

  // 결과
  winner_id?: string;

  // 선택 정보
  decision_time_ms?: number;

  // 타임스탬프
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

/**
 * 임시 이미지
 */
export interface TempWorldcupImage {
  id: string;
  session_id: string;
  storage_path: string;
  storage_url: string;
  original_filename?: string;
  file_size_bytes?: number;
  user_consented: boolean;
  expires_at: string;
  created_at: string;
}

/**
 * 공유된 결과
 */
export interface WorldcupShare {
  id: string;
  session_id: string;
  share_code: string;
  share_type: ShareType;
  view_count: number;
  created_at: string;
}

// ============================================================================
// Enum Types
// ============================================================================

export type RoundType = 8 | 16 | 32 | 64;

export type WorldcupStatus = 'setup' | 'in_progress' | 'completed' | 'abandoned';

export type ParticipantSourceType = 'uploaded' | 'artwork' | 'manual' | 'exhibition';

export type ShareType = 'link' | 'image';

// ============================================================================
// Client-side State Types (프론트엔드 상태 관리용)
// ============================================================================

/**
 * 월드컵 스토어 상태
 */
export interface WorldcupState {
  // 세션
  session: WorldcupSession | null;
  participants: WorldcupParticipant[];

  // 매치
  matches: WorldcupMatch[];
  currentMatch: WorldcupMatch | null;
  currentMatchParticipants: {
    a: WorldcupParticipant | null;
    b: WorldcupParticipant | null;
  };

  // UI 상태
  isLoading: boolean;
  matchStartTime: number | null;

  // 결과
  winner: WorldcupParticipant | null;
  rankings: WorldcupParticipant[];
}

/**
 * 참가자 추가용 임시 데이터
 */
export interface PendingParticipant {
  id: string; // 임시 ID
  type: ParticipantSourceType;
  artwork_id?: string;
  image_url?: string;
  file?: File;
  title?: string;
  artist?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * 세션 생성 요청
 */
export interface CreateSessionRequest {
  round_type: RoundType;
  exhibition_visit_id?: string;
  exhibition_id?: string;
}

/**
 * 세션 생성 응답
 */
export interface CreateSessionResponse {
  success: boolean;
  data?: {
    session: WorldcupSession;
  };
  error?: string;
}

/**
 * 참가자 추가 요청 (업로드)
 */
export interface AddParticipantUploadRequest {
  session_id: string;
  files: File[];
  consent_storage?: boolean;
}

/**
 * 참가자 추가 요청 (작품 검색)
 */
export interface AddParticipantArtworkRequest {
  session_id: string;
  artwork_id: string;
}

/**
 * 참가자 추가 요청 (수동)
 */
export interface AddParticipantManualRequest {
  session_id: string;
  title: string;
  artist?: string;
  image_url?: string;
}

/**
 * 참가자 추가 응답
 */
export interface AddParticipantResponse {
  success: boolean;
  data?: {
    participant: WorldcupParticipant;
    temp_image?: TempWorldcupImage;
  };
  error?: string;
}

/**
 * 토너먼트 시작 요청
 */
export interface StartTournamentRequest {
  session_id: string;
}

/**
 * 토너먼트 시작 응답
 */
export interface StartTournamentResponse {
  success: boolean;
  data?: {
    session: WorldcupSession;
    first_match: WorldcupMatch;
    participants: WorldcupParticipant[];
  };
  error?: string;
}

/**
 * 매치 결과 제출 요청
 */
export interface SubmitMatchResultRequest {
  match_id: string;
  winner_id: string;
  decision_time_ms?: number;
}

/**
 * 매치 결과 제출 응답
 */
export interface SubmitMatchResultResponse {
  success: boolean;
  data?: {
    completed: boolean;
    next_match?: WorldcupMatch;
    winner?: WorldcupParticipant;
  };
  error?: string;
}

/**
 * 세션 완료 후 결과 조회 응답
 */
export interface GetResultResponse {
  success: boolean;
  data?: {
    session: WorldcupSession;
    winner: WorldcupParticipant;
    rankings: WorldcupRanking[];
    matches: WorldcupMatch[];
  };
  error?: string;
}

/**
 * 공유 URL 생성 요청
 */
export interface CreateShareRequest {
  session_id: string;
  share_type: ShareType;
}

/**
 * 공유 URL 생성 응답
 */
export interface CreateShareResponse {
  success: boolean;
  data?: {
    share: WorldcupShare;
    share_url: string;
  };
  error?: string;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

/**
 * 세션 설정 컴포넌트 Props
 */
export interface WorldcupSetupProps {
  onSessionCreated: (session: WorldcupSession) => void;
  exhibitionVisitId?: string;
}

/**
 * 참가자 추가 컴포넌트 Props
 */
export interface ParticipantAddProps {
  sessionId: string;
  currentCount: number;
  targetCount: RoundType;
  onParticipantAdded: (participant: WorldcupParticipant) => void;
  onParticipantRemoved: (participantId: string) => void;
}

/**
 * 매치 카드 Props
 */
export interface MatchCardProps {
  match: WorldcupMatch;
  participantA: WorldcupParticipant;
  participantB: WorldcupParticipant;
  onSelect: (winnerId: string) => void;
  isLoading?: boolean;
}

/**
 * 토너먼트 진행 헤더 Props
 */
export interface TournamentProgressProps {
  currentRound: number;
  totalRounds: number;
  currentMatch: number;
  totalMatchesInRound: number;
}

/**
 * 결과 카드 Props
 */
export interface ResultCardProps {
  winner: WorldcupParticipant;
  rankings: WorldcupRanking[];
  sessionId: string;
  onShare: () => void;
  onRestart: () => void;
}

/**
 * 참가자 카드 Props
 */
export interface ParticipantCardProps {
  participant: WorldcupParticipant;
  onClick?: () => void;
  isSelected?: boolean;
  showRank?: boolean;
  className?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * 랭킹 정보
 */
export interface WorldcupRanking {
  rank: number;
  participant_id: string;
  title?: string;
  artist?: string;
  image_url?: string;
  source_type: ParticipantSourceType;
  wins: number;
  total_matches: number;
}

/**
 * 라운드 정보
 */
export interface RoundInfo {
  roundNumber: number;
  label: string;
  labelEn: string;
  matchCount: number;
}

/**
 * 라운드 라벨
 */
export const ROUND_LABELS: Record<number, { ko: string; en: string }> = {
  1: { ko: '결승', en: 'Final' },
  2: { ko: '4강', en: 'Semi-Final' },
  3: { ko: '8강', en: 'Quarter-Final' },
  4: { ko: '16강', en: 'Round of 16' },
  5: { ko: '32강', en: 'Round of 32' },
  6: { ko: '64강', en: 'Round of 64' },
} as const;

/**
 * 라운드 타입별 설정
 */
export const ROUND_TYPE_CONFIG: Record<
  RoundType,
  { totalMatches: number; startRound: number; label: string }
> = {
  8: { totalMatches: 7, startRound: 3, label: '8강' },
  16: { totalMatches: 15, startRound: 4, label: '16강' },
  32: { totalMatches: 31, startRound: 5, label: '32강' },
  64: { totalMatches: 63, startRound: 6, label: '64강' },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 라운드 번호에서 라벨 가져오기
 */
export function getRoundLabel(round: number, lang: 'ko' | 'en' = 'ko'): string {
  const labels = ROUND_LABELS[round];
  return labels ? labels[lang] : `Round ${round}`;
}

/**
 * 참가자 수가 유효한지 확인 (2의 거듭제곱)
 */
export function isValidParticipantCount(count: number): count is RoundType {
  return [8, 16, 32, 64].includes(count);
}

/**
 * 총 매치 수 계산
 */
export function calculateTotalMatches(roundType: RoundType): number {
  return roundType - 1;
}

/**
 * 현재 라운드의 매치 수 계산
 */
export function calculateMatchesInRound(round: number): number {
  return Math.pow(2, round - 1);
}

/**
 * 참가자 이미지 URL 가져오기
 */
export function getParticipantImageUrl(participant: WorldcupParticipant): string {
  return participant.image_url || participant.temp_image_url || '/images/placeholder-artwork.png';
}

/**
 * 참가자 표시 제목 가져오기
 */
export function getParticipantTitle(participant: WorldcupParticipant): string {
  return participant.title || '제목 없음';
}

/**
 * 참가자 아티스트 가져오기
 */
export function getParticipantArtist(participant: WorldcupParticipant): string {
  return participant.artist || '작가 미상';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * WorldcupSession 타입 가드
 */
export function isWorldcupSession(obj: unknown): obj is WorldcupSession {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as WorldcupSession).id === 'string' &&
    typeof (obj as WorldcupSession).round_type === 'number' &&
    ['setup', 'in_progress', 'completed', 'abandoned'].includes(
      (obj as WorldcupSession).status
    )
  );
}

/**
 * WorldcupParticipant 타입 가드
 */
export function isWorldcupParticipant(obj: unknown): obj is WorldcupParticipant {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as WorldcupParticipant).id === 'string' &&
    typeof (obj as WorldcupParticipant).session_id === 'string' &&
    ['uploaded', 'artwork', 'manual', 'exhibition'].includes(
      (obj as WorldcupParticipant).source_type
    )
  );
}

/**
 * WorldcupMatch 타입 가드
 */
export function isWorldcupMatch(obj: unknown): obj is WorldcupMatch {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as WorldcupMatch).id === 'string' &&
    typeof (obj as WorldcupMatch).session_id === 'string' &&
    typeof (obj as WorldcupMatch).match_index === 'number'
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 로컬 스토리지 키
 */
export const WORLDCUP_STORAGE_KEYS = {
  CURRENT_SESSION: 'sayu:worldcup:current_session',
  PENDING_PARTICIPANTS: 'sayu:worldcup:pending_participants',
} as const;

/**
 * API 엔드포인트
 */
export const WORLDCUP_API_ENDPOINTS = {
  SESSIONS: '/api/worldcup/sessions',
  PARTICIPANTS: '/api/worldcup/participants',
  MATCHES: '/api/worldcup/matches',
  SHARE: '/api/worldcup/share',
  UPLOAD: '/api/worldcup/upload',
} as const;

/**
 * 설정 상수
 */
export const WORLDCUP_CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  MAX_IMAGE_DIMENSION: 1920,
  TEMP_IMAGE_EXPIRY_HOURS: 24,
  MIN_PARTICIPANTS: 8,
  MAX_PARTICIPANTS: 64,
  COMPRESSION_QUALITY: 0.8,
} as const;

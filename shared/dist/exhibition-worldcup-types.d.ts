/**
 * SAYU Exhibition Worldcup System Type Definitions
 * 전시 월드컵 시스템 타입 정의
 *
 * MVP Phase 1: 업로드/검색, 토너먼트 진행, 결과 공유
 */
/**
 * 월드컵 세션
 */
export interface WorldcupSession {
    id: string;
    user_id?: string;
    exhibition_visit_id?: string;
    exhibition_id?: string;
    round_type: RoundType;
    status: WorldcupStatus;
    current_match_index: number;
    total_matches?: number;
    winner_participant_id?: string;
    started_at?: string;
    completed_at?: string;
    duration_seconds?: number;
    created_at: string;
    updated_at: string;
}
/**
 * 참가 작품
 */
export interface WorldcupParticipant {
    id: string;
    session_id: string;
    source_type: ParticipantSourceType;
    artwork_id?: string;
    temp_image_url?: string;
    temp_image_path?: string;
    title?: string;
    artist?: string;
    image_url?: string;
    seed_position: number;
    eliminated_round?: number;
    final_rank?: number;
    total_matches: number;
    wins: number;
    created_at: string;
}
/**
 * 매치 기록
 */
export interface WorldcupMatch {
    id: string;
    session_id: string;
    match_index: number;
    round: number;
    round_match_index: number;
    participant_a_id: string;
    participant_b_id: string;
    winner_id?: string;
    decision_time_ms?: number;
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
export type RoundType = 8 | 16 | 32 | 64;
export type WorldcupStatus = 'setup' | 'in_progress' | 'completed' | 'abandoned';
export type ParticipantSourceType = 'uploaded' | 'artwork' | 'manual';
export type ShareType = 'link' | 'image';
/**
 * 월드컵 스토어 상태
 */
export interface WorldcupState {
    session: WorldcupSession | null;
    participants: WorldcupParticipant[];
    matches: WorldcupMatch[];
    currentMatch: WorldcupMatch | null;
    currentMatchParticipants: {
        a: WorldcupParticipant | null;
        b: WorldcupParticipant | null;
    };
    isLoading: boolean;
    matchStartTime: number | null;
    winner: WorldcupParticipant | null;
    rankings: WorldcupParticipant[];
}
/**
 * 참가자 추가용 임시 데이터
 */
export interface PendingParticipant {
    id: string;
    type: ParticipantSourceType;
    artwork_id?: string;
    image_url?: string;
    file?: File;
    title?: string;
    artist?: string;
}
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
export declare const ROUND_LABELS: Record<number, {
    ko: string;
    en: string;
}>;
/**
 * 라운드 타입별 설정
 */
export declare const ROUND_TYPE_CONFIG: Record<RoundType, {
    totalMatches: number;
    startRound: number;
    label: string;
}>;
/**
 * 라운드 번호에서 라벨 가져오기
 */
export declare function getRoundLabel(round: number, lang?: 'ko' | 'en'): string;
/**
 * 참가자 수가 유효한지 확인 (2의 거듭제곱)
 */
export declare function isValidParticipantCount(count: number): count is RoundType;
/**
 * 총 매치 수 계산
 */
export declare function calculateTotalMatches(roundType: RoundType): number;
/**
 * 현재 라운드의 매치 수 계산
 */
export declare function calculateMatchesInRound(round: number): number;
/**
 * 참가자 이미지 URL 가져오기
 */
export declare function getParticipantImageUrl(participant: WorldcupParticipant): string;
/**
 * 참가자 표시 제목 가져오기
 */
export declare function getParticipantTitle(participant: WorldcupParticipant): string;
/**
 * 참가자 아티스트 가져오기
 */
export declare function getParticipantArtist(participant: WorldcupParticipant): string;
/**
 * WorldcupSession 타입 가드
 */
export declare function isWorldcupSession(obj: unknown): obj is WorldcupSession;
/**
 * WorldcupParticipant 타입 가드
 */
export declare function isWorldcupParticipant(obj: unknown): obj is WorldcupParticipant;
/**
 * WorldcupMatch 타입 가드
 */
export declare function isWorldcupMatch(obj: unknown): obj is WorldcupMatch;
/**
 * 로컬 스토리지 키
 */
export declare const WORLDCUP_STORAGE_KEYS: {
    readonly CURRENT_SESSION: "sayu:worldcup:current_session";
    readonly PENDING_PARTICIPANTS: "sayu:worldcup:pending_participants";
};
/**
 * API 엔드포인트
 */
export declare const WORLDCUP_API_ENDPOINTS: {
    readonly SESSIONS: "/api/worldcup/sessions";
    readonly PARTICIPANTS: "/api/worldcup/participants";
    readonly MATCHES: "/api/worldcup/matches";
    readonly SHARE: "/api/worldcup/share";
    readonly UPLOAD: "/api/worldcup/upload";
};
/**
 * 설정 상수
 */
export declare const WORLDCUP_CONFIG: {
    readonly MAX_FILE_SIZE_MB: 5;
    readonly MAX_IMAGE_DIMENSION: 1920;
    readonly TEMP_IMAGE_EXPIRY_HOURS: 24;
    readonly MIN_PARTICIPANTS: 8;
    readonly MAX_PARTICIPANTS: 64;
    readonly COMPRESSION_QUALITY: 0.8;
};
//# sourceMappingURL=exhibition-worldcup-types.d.ts.map
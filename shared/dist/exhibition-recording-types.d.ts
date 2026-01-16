/**
 * SAYU Exhibition Recording System Type Definitions
 * 전시 기록 시스템 타입 정의
 *
 * Phase 1 MVP: 관람 타이머, 작품 검색/기록, 감정 선택
 */
/**
 * 전시 내 작품 정보
 */
export interface ExhibitionArtwork {
    id: string;
    exhibition_id: string;
    title: string;
    title_en?: string;
    artist: string;
    artist_en?: string;
    year?: string;
    medium?: string;
    dimensions?: string;
    description?: string;
    description_en?: string;
    image_url?: string;
    thumbnail_url?: string;
    image_hash?: string;
    location_in_exhibition?: string;
    display_order?: number;
    tags?: string[];
    is_featured?: boolean;
    view_count: number;
    record_count: number;
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
    started_at: string;
    ended_at?: string;
    duration_minutes?: number;
    status: VisitStatus;
    device_info?: Record<string, any>;
    notes?: string;
    is_offline: boolean;
    synced_at?: string;
    total_artworks_recorded: number;
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
    recorded_at: string;
    sequence_number?: number;
    emotions: string[];
    emotion_text?: string;
    emotion_intensity?: number;
    note?: string;
    photo_url?: string;
    recognition_method: RecognitionMethod;
    recognition_confidence?: number;
    is_offline_record: boolean;
    synced_at?: string;
    created_at: string;
    updated_at: string;
}
export type VisitStatus = 'in_progress' | 'completed' | 'abandoned';
export type RecognitionMethod = 'photo' | 'search' | 'manual';
/**
 * 현재 관람 상태 (Zustand Store)
 */
export interface VisitState {
    currentVisit: ExhibitionVisit | null;
    isRecording: boolean;
    elapsedSeconds: number;
    timerInterval: NodeJS.Timeout | null;
    recordedArtworks: ArtworkRecord[];
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
    localId: string;
    artworkId: string;
    recordedAt: string;
    emotions: string[];
    emotionText?: string;
    note?: string;
    photoDataUrl?: string;
    recognitionMethod: RecognitionMethod;
    isSynced: boolean;
}
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
        duration: number;
        recordCount: number;
        analysisStarted: boolean;
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
            confidence: number;
        }>;
    };
    error?: string;
}
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
    maxSelections?: number;
    userAPT?: string;
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
/**
 * 감정 정의
 */
export interface Emotion {
    id: string;
    label: string;
    labelEn: string;
    color: string;
    emoji?: string;
}
/**
 * 기본 감정 목록
 */
export declare const EMOTIONS: readonly Emotion[];
/**
 * 감정별 색상 맵핑
 */
export declare const EMOTION_COLORS: Record<string, string>;
/**
 * 방문 통계
 */
export interface VisitStats {
    totalDuration: number;
    artworksRecorded: number;
    mostCommonEmotion: string;
    emotionDistribution: Record<string, number>;
    averageTimePerArtwork: number;
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
/**
 * ExhibitionVisit 타입 가드
 */
export declare function isExhibitionVisit(obj: any): obj is ExhibitionVisit;
/**
 * ArtworkRecord 타입 가드
 */
export declare function isArtworkRecord(obj: any): obj is ArtworkRecord;
/**
 * 로컬 스토리지 키
 */
export declare const STORAGE_KEYS: {
    readonly CURRENT_VISIT: "sayu:current_visit";
    readonly PENDING_SYNC: "sayu:pending_sync";
    readonly OFFLINE_MODE: "sayu:offline_mode";
};
/**
 * API 엔드포인트
 */
export declare const API_ENDPOINTS: {
    readonly START_VISIT: "/api/visits/start";
    readonly END_VISIT: "/api/visits/end";
    readonly ADD_RECORD: "/api/visits/records";
    readonly SEARCH_ARTWORKS: "/api/artworks/search";
    readonly RECOGNIZE_ARTWORK: "/api/artworks/recognize";
    readonly GET_VISIT: "/api/visits";
    readonly GET_RECORDS: "/api/visits/records";
};
/**
 * 설정 상수
 */
export declare const CONFIG: {
    readonly MAX_EMOTIONS_PER_RECORD: 3;
    readonly SEARCH_DEBOUNCE_MS: 300;
    readonly TIMER_UPDATE_INTERVAL_MS: 1000;
    readonly SYNC_RETRY_ATTEMPTS: 3;
    readonly SYNC_RETRY_DELAY_MS: 2000;
};
//# sourceMappingURL=exhibition-recording-types.d.ts.map
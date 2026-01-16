"use strict";
/**
 * SAYU Exhibition Recording System Type Definitions
 * 전시 기록 시스템 타입 정의
 *
 * Phase 1 MVP: 관람 타이머, 작품 검색/기록, 감정 선택
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.API_ENDPOINTS = exports.STORAGE_KEYS = exports.EMOTION_COLORS = exports.EMOTIONS = void 0;
exports.isExhibitionVisit = isExhibitionVisit;
exports.isArtworkRecord = isArtworkRecord;
/**
 * 기본 감정 목록
 */
exports.EMOTIONS = Object.freeze([
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
exports.EMOTION_COLORS = {
    평온: 'bg-blue-500',
    강렬: 'bg-red-500',
    몽환: 'bg-purple-500',
    날카로움: 'bg-orange-500',
    따뜻함: 'bg-amber-500',
    차가움: 'bg-cyan-500',
    부드러움: 'bg-pink-500',
    혼란: 'bg-gray-500',
};
// ============================================================================
// Helper Functions Type Guards
// ============================================================================
/**
 * ExhibitionVisit 타입 가드
 */
function isExhibitionVisit(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.user_id === 'string' &&
        typeof obj.exhibition_id === 'string' &&
        typeof obj.started_at === 'string' &&
        ['in_progress', 'completed', 'abandoned'].includes(obj.status));
}
/**
 * ArtworkRecord 타입 가드
 */
function isArtworkRecord(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.visit_id === 'string' &&
        typeof obj.artwork_id === 'string' &&
        Array.isArray(obj.emotions) &&
        ['photo', 'search', 'manual'].includes(obj.recognition_method));
}
// ============================================================================
// Constants
// ============================================================================
/**
 * 로컬 스토리지 키
 */
exports.STORAGE_KEYS = {
    CURRENT_VISIT: 'sayu:current_visit',
    PENDING_SYNC: 'sayu:pending_sync',
    OFFLINE_MODE: 'sayu:offline_mode',
};
/**
 * API 엔드포인트
 */
exports.API_ENDPOINTS = {
    START_VISIT: '/api/visits/start',
    END_VISIT: '/api/visits/end',
    ADD_RECORD: '/api/visits/records',
    SEARCH_ARTWORKS: '/api/artworks/search',
    RECOGNIZE_ARTWORK: '/api/artworks/recognize', // Phase 2
    GET_VISIT: '/api/visits',
    GET_RECORDS: '/api/visits/records',
};
/**
 * 설정 상수
 */
exports.CONFIG = {
    MAX_EMOTIONS_PER_RECORD: 3,
    SEARCH_DEBOUNCE_MS: 300,
    TIMER_UPDATE_INTERVAL_MS: 1000,
    SYNC_RETRY_ATTEMPTS: 3,
    SYNC_RETRY_DELAY_MS: 2000,
};
// Note: All types are exported inline with their definitions above

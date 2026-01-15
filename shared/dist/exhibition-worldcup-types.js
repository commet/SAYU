"use strict";
/**
 * SAYU Exhibition Worldcup System Type Definitions
 * 전시 월드컵 시스템 타입 정의
 *
 * MVP Phase 1: 업로드/검색, 토너먼트 진행, 결과 공유
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORLDCUP_CONFIG = exports.WORLDCUP_API_ENDPOINTS = exports.WORLDCUP_STORAGE_KEYS = exports.ROUND_TYPE_CONFIG = exports.ROUND_LABELS = void 0;
exports.getRoundLabel = getRoundLabel;
exports.isValidParticipantCount = isValidParticipantCount;
exports.calculateTotalMatches = calculateTotalMatches;
exports.calculateMatchesInRound = calculateMatchesInRound;
exports.getParticipantImageUrl = getParticipantImageUrl;
exports.getParticipantTitle = getParticipantTitle;
exports.getParticipantArtist = getParticipantArtist;
exports.isWorldcupSession = isWorldcupSession;
exports.isWorldcupParticipant = isWorldcupParticipant;
exports.isWorldcupMatch = isWorldcupMatch;
/**
 * 라운드 라벨
 */
exports.ROUND_LABELS = {
    1: { ko: '결승', en: 'Final' },
    2: { ko: '4강', en: 'Semi-Final' },
    3: { ko: '8강', en: 'Quarter-Final' },
    4: { ko: '16강', en: 'Round of 16' },
    5: { ko: '32강', en: 'Round of 32' },
    6: { ko: '64강', en: 'Round of 64' },
};
/**
 * 라운드 타입별 설정
 */
exports.ROUND_TYPE_CONFIG = {
    8: { totalMatches: 7, startRound: 3, label: '8강' },
    16: { totalMatches: 15, startRound: 4, label: '16강' },
    32: { totalMatches: 31, startRound: 5, label: '32강' },
    64: { totalMatches: 63, startRound: 6, label: '64강' },
};
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * 라운드 번호에서 라벨 가져오기
 */
function getRoundLabel(round, lang = 'ko') {
    const labels = exports.ROUND_LABELS[round];
    return labels ? labels[lang] : `Round ${round}`;
}
/**
 * 참가자 수가 유효한지 확인 (2의 거듭제곱)
 */
function isValidParticipantCount(count) {
    return [8, 16, 32, 64].includes(count);
}
/**
 * 총 매치 수 계산
 */
function calculateTotalMatches(roundType) {
    return roundType - 1;
}
/**
 * 현재 라운드의 매치 수 계산
 */
function calculateMatchesInRound(round) {
    return Math.pow(2, round - 1);
}
/**
 * 참가자 이미지 URL 가져오기
 */
function getParticipantImageUrl(participant) {
    return participant.image_url || participant.temp_image_url || '/images/placeholder-artwork.png';
}
/**
 * 참가자 표시 제목 가져오기
 */
function getParticipantTitle(participant) {
    return participant.title || '제목 없음';
}
/**
 * 참가자 아티스트 가져오기
 */
function getParticipantArtist(participant) {
    return participant.artist || '작가 미상';
}
// ============================================================================
// Type Guards
// ============================================================================
/**
 * WorldcupSession 타입 가드
 */
function isWorldcupSession(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.round_type === 'number' &&
        ['setup', 'in_progress', 'completed', 'abandoned'].includes(obj.status));
}
/**
 * WorldcupParticipant 타입 가드
 */
function isWorldcupParticipant(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.session_id === 'string' &&
        ['uploaded', 'artwork', 'manual'].includes(obj.source_type));
}
/**
 * WorldcupMatch 타입 가드
 */
function isWorldcupMatch(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.session_id === 'string' &&
        typeof obj.match_index === 'number');
}
// ============================================================================
// Constants
// ============================================================================
/**
 * 로컬 스토리지 키
 */
exports.WORLDCUP_STORAGE_KEYS = {
    CURRENT_SESSION: 'sayu:worldcup:current_session',
    PENDING_PARTICIPANTS: 'sayu:worldcup:pending_participants',
};
/**
 * API 엔드포인트
 */
exports.WORLDCUP_API_ENDPOINTS = {
    SESSIONS: '/api/worldcup/sessions',
    PARTICIPANTS: '/api/worldcup/participants',
    MATCHES: '/api/worldcup/matches',
    SHARE: '/api/worldcup/share',
    UPLOAD: '/api/worldcup/upload',
};
/**
 * 설정 상수
 */
exports.WORLDCUP_CONFIG = {
    MAX_FILE_SIZE_MB: 5,
    MAX_IMAGE_DIMENSION: 1920,
    TEMP_IMAGE_EXPIRY_HOURS: 24,
    MIN_PARTICIPANTS: 8,
    MAX_PARTICIPANTS: 64,
    COMPRESSION_QUALITY: 0.8,
};

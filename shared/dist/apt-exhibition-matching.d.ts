/**
 * APT (Art Personality Type) → 전시 매칭 알고리즘
 * MVP 1: Global Exhibition Recommendation System
 *
 * 16가지 성격 유형별 전시 추천을 위한 매칭 시스템
 */
export declare const EXHIBITION_GENRES: {
    readonly ABSTRACT_EXPRESSIONISM: "abstract_expressionism";
    readonly SURREALISM: "surrealism";
    readonly MINIMALISM: "minimalism";
    readonly CONCEPTUAL: "conceptual";
    readonly INSTALLATION: "installation";
    readonly MEDIA_ART: "media_art";
    readonly IMPRESSIONISM: "impressionism";
    readonly RENAISSANCE: "renaissance";
    readonly PORTRAIT: "portrait";
    readonly LANDSCAPE: "landscape";
    readonly STILL_LIFE: "still_life";
    readonly REALISM: "realism";
    readonly CONTEMPORARY: "contemporary";
    readonly POP_ART: "pop_art";
    readonly STREET_ART: "street_art";
    readonly PHOTOGRAPHY: "photography";
    readonly TRADITIONAL_ASIAN: "traditional_asian";
    readonly CLASSICAL: "classical";
    readonly FOLK_ART: "folk_art";
};
export type ExhibitionGenre = typeof EXHIBITION_GENRES[keyof typeof EXHIBITION_GENRES];
export interface APTGenrePreference {
    preferred: ExhibitionGenre[];
    compatible: ExhibitionGenre[];
    neutral: ExhibitionGenre[];
}
export declare const APT_GENRE_PREFERENCES: Record<string, APTGenrePreference>;
export interface ExhibitionFeatures {
    id: string;
    title: string;
    genres: ExhibitionGenre[];
    emotionalTone: 'contemplative' | 'energetic' | 'serene' | 'provocative' | 'educational';
    interactivity: 'high' | 'medium' | 'low';
    crowdLevel: 'high' | 'medium' | 'low';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface MatchResult {
    exhibitionId: string;
    score: number;
    matchReasons: string[];
    confidence: 'high' | 'medium' | 'low';
}
/**
 * APT 유형과 전시 특성을 기반으로 매칭 점수 계산
 */
export declare function calculateMatchScore(aptCode: string, exhibition: ExhibitionFeatures): MatchResult;
/**
 * 여러 전시에 대해 매칭 점수 계산 후 정렬
 */
export declare function rankExhibitions(aptCode: string, exhibitions: ExhibitionFeatures[]): MatchResult[];
/**
 * 전시 장르 키워드로 장르 추론
 */
export declare function inferGenresFromKeywords(keywords: string[]): ExhibitionGenre[];
/**
 * APT 유형에 대한 추천 메시지 생성
 */
export declare function getRecommendationMessage(aptCode: string, matchScore: number, locale?: 'ko' | 'en'): string;
declare const _default: {
    APT_GENRE_PREFERENCES: Record<string, APTGenrePreference>;
    EXHIBITION_GENRES: {
        readonly ABSTRACT_EXPRESSIONISM: "abstract_expressionism";
        readonly SURREALISM: "surrealism";
        readonly MINIMALISM: "minimalism";
        readonly CONCEPTUAL: "conceptual";
        readonly INSTALLATION: "installation";
        readonly MEDIA_ART: "media_art";
        readonly IMPRESSIONISM: "impressionism";
        readonly RENAISSANCE: "renaissance";
        readonly PORTRAIT: "portrait";
        readonly LANDSCAPE: "landscape";
        readonly STILL_LIFE: "still_life";
        readonly REALISM: "realism";
        readonly CONTEMPORARY: "contemporary";
        readonly POP_ART: "pop_art";
        readonly STREET_ART: "street_art";
        readonly PHOTOGRAPHY: "photography";
        readonly TRADITIONAL_ASIAN: "traditional_asian";
        readonly CLASSICAL: "classical";
        readonly FOLK_ART: "folk_art";
    };
    calculateMatchScore: typeof calculateMatchScore;
    rankExhibitions: typeof rankExhibitions;
    inferGenresFromKeywords: typeof inferGenresFromKeywords;
    getRecommendationMessage: typeof getRecommendationMessage;
};
export default _default;
//# sourceMappingURL=apt-exhibition-matching.d.ts.map
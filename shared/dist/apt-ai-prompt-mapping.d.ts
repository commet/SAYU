/**
 * APT (Art Personality Type) → AI Prompt Mapping
 * 16가지 성격 유형별 AI 아트 프로필 생성을 위한 프롬프트 매핑
 *
 * 사용 목적: MVP 2 - "나를 닮은 명화" 바이럴 기능
 */
export interface ArtStyle {
    id: string;
    name: string;
    nameKo: string;
    description: string;
    artistReference: string;
    basePrompt: string;
    negativePrompt: string;
    colorPalette: string;
}
export interface APTPromptProfile {
    code: string;
    personalityEssence: string;
    visualMetaphors: string[];
    emotionalAura: string;
    symbolicElements: string[];
    colorMood: string;
    compositionStyle: string;
    lightingMood: string;
}
export declare const ART_STYLES: Record<string, ArtStyle>;
export declare const APT_PROMPT_PROFILES: Record<string, APTPromptProfile>;
/**
 * APT 유형과 아트 스타일을 조합하여 AI 이미지 생성 프롬프트 생성
 */
export declare function generateArtProfilePrompt(aptCode: string, artStyleId: string, gender?: 'male' | 'female' | 'neutral'): {
    prompt: string;
    negativePrompt: string;
};
/**
 * APT 유형에 따른 추천 아트 스타일 반환
 */
export declare function getRecommendedStylesForAPT(aptCode: string): string[];
/**
 * 결과 카드용 짧은 설명 생성
 */
export declare function getArtProfileDescription(aptCode: string, artStyleId: string, locale?: 'ko' | 'en'): string;
declare const _default: {
    ART_STYLES: Record<string, ArtStyle>;
    APT_PROMPT_PROFILES: Record<string, APTPromptProfile>;
    generateArtProfilePrompt: typeof generateArtProfilePrompt;
    getRecommendedStylesForAPT: typeof getRecommendedStylesForAPT;
    getArtProfileDescription: typeof getArtProfileDescription;
};
export default _default;
//# sourceMappingURL=apt-ai-prompt-mapping.d.ts.map
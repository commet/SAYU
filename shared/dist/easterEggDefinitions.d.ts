/**
 * SAYU Easter Egg System Definitions
 * Rewards curious and creative users with hidden features and badges
 */
export interface EasterEgg {
    id: string;
    name: string;
    nameKo: string;
    description: string;
    descriptionKo: string;
    trigger: 'action' | 'time' | 'sequence' | 'command' | 'random';
    condition: EasterEggCondition;
    reward: EasterEggReward;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
    discoveredCount?: number;
    firstDiscoveredBy?: string;
    hints?: string[];
}
export interface EasterEggCondition {
    type: string;
    value: any;
    checkFunction?: (context: any) => boolean;
}
export interface EasterEggReward {
    type: 'badge' | 'title' | 'feature' | 'experience';
    id: string;
    data?: any;
}
export interface Badge {
    id: string;
    name: string;
    nameKo: string;
    description: string;
    descriptionKo: string;
    icon: string;
    category: 'knowledge' | 'exploration' | 'emotion' | 'special';
    tier: 1 | 2 | 3;
    points: number;
}
export interface UserEasterEggProgress {
    userId: string;
    discoveredEggs: string[];
    badges: string[];
    titles: string[];
    totalPoints: number;
    lastDiscoveryAt?: Date;
    statistics: {
        totalDiscoveries: number;
        commonDiscoveries: number;
        rareDiscoveries: number;
        epicDiscoveries: number;
        legendaryDiscoveries: number;
    };
}
export declare const ACTION_EASTER_EGGS: EasterEgg[];
export declare const TIME_EASTER_EGGS: EasterEgg[];
export declare const COMMAND_EASTER_EGGS: EasterEgg[];
export declare const BADGES: Record<string, Badge>;
export declare function checkEasterEgg(easterEgg: EasterEgg, context: any): boolean;
export declare function getAllEasterEggs(): EasterEgg[];
export declare function getEasterEggById(id: string): EasterEgg | undefined;
export declare function getBadgeById(id: string): Badge | undefined;
export declare function calculateUserPoints(badgeIds: string[]): number;
export declare function getUserTitle(points: number): {
    title: string;
    titleKo: string;
};
//# sourceMappingURL=easterEggDefinitions.d.ts.map
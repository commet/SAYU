/**
 * SAYU Shared Types and Utilities
 * Central export point for all shared types across frontend and backend
 */
export * from './SAYUTypeDefinitions';
export * from './easterEggDefinitions';
export * from './artist-types';
export interface EmotionInterpretation {
    emotionId: string;
    dimensions: {
        valence: number;
        arousal: number;
        dominance: number;
        complexity: number;
    };
    vector: number[];
    characteristics: string[];
}
export interface ArtworkMatch {
    artwork: {
        id: string;
        title: string;
        artist?: string;
        imageUrl?: string;
    };
    matching: {
        score: number;
        type: 'direct' | 'metaphorical' | 'complementary';
        reason?: string;
    };
}
export interface EmotionInput {
    primary: string;
    secondary?: string;
    intensity: number;
    context?: string;
}
export interface EvolutionProgress {
    id: string;
    userId: string;
    currentLevel: number;
    currentXP: number;
    totalXP: number;
    evolutionStage: string;
    artworkCount: number;
    connectionCount: number;
    lastActivityAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface EvolutionMilestone {
    id: string;
    level: number;
    xpRequired: number;
    stageName: string;
    stageDescription: string;
    rewards: string[];
    artworkRequirement: number;
    connectionRequirement: number;
}
export interface EvolutionActivity {
    id: string;
    userId: string;
    activityType: string;
    xpGained: number;
    description: string;
    metadata?: any;
    createdAt: Date;
}
export interface FollowUser {
    id: string;
    username: string;
    profileImage?: string;
    personalityType?: string;
    bio?: string;
    artworkCount?: number;
    followerCount?: number;
    isFollowing?: boolean;
    createdAt?: Date;
}
export interface FollowListResponse {
    users: FollowUser[];
    total: number;
    page: number;
    pageSize: number;
}
export interface FollowStats {
    followersCount: number;
    followingCount: number;
    mutualCount: number;
}
export type PersonalityType = string;
export interface EvolutionState {
    userId: string;
    currentStage: string;
    xp: number;
    level: number;
    nextLevelXp: number;
    streakDays: number;
    badges: string[];
    milestones: Milestone[];
    stats: {
        artworksViewed: number;
        connectionsFormed: number;
        questsCompleted: number;
        totalXpEarned: number;
    };
}
export interface ActionResult {
    success: boolean;
    xpGained?: number;
    newLevel?: number;
    newBadges?: string[];
    message?: string;
}
export interface ActionContext {
    type: string;
    metadata?: Record<string, any>;
}
export interface DailyCheckInResult {
    success: boolean;
    xpGained: number;
    streakDays: number;
    bonusXp?: number;
    newBadges?: string[];
}
export interface LeaderboardData {
    userId: string;
    username: string;
    profileImage?: string;
    level: number;
    xp: number;
    rank: number;
    personalityType?: string;
}
export interface Milestone {
    id: string;
    name: string;
    description: string;
    xpRequired: number;
    achieved: boolean;
    achievedAt?: Date;
    rewards: string[];
}
export interface EvolutionAnimation {
    type: string;
    duration: number;
    particles?: any;
    colors?: string[];
}
export interface ArtStyle {
    id: string;
    name: string;
    nameKo?: string;
    description: string;
    examples: string[];
    colorPalette: string[];
    characteristics: string[];
}
export interface ArtProfileResult {
    id: string;
    userId: string;
    primaryStyle?: ArtStyle;
    secondaryStyle?: ArtStyle;
    colorPreferences?: string[];
    themePreferences?: string[];
    generatedImage?: string;
    transformedImage?: string;
    originalImage?: string;
    styleUsed?: ArtStyle;
    createdAt: Date | string;
}
export interface ArtProfileGalleryItem {
    id: string;
    userId: string;
    profileId: string;
    imageUrl: string;
    style: string;
    createdAt: Date;
    isLiked?: boolean;
    likeCount?: number;
    artProfile?: ArtProfileResult;
    user?: {
        username: string;
        avatarUrl?: string;
    };
}
export declare const predefinedStyles: ArtStyle[];
export interface ArtPulseSession {
    id: string;
    artworkId: string;
    artwork?: any;
    phase: 'contemplation' | 'sharing' | 'voting';
    participants: string[];
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'completed' | 'cancelled';
    results?: SessionResults;
}
export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'surprise' | 'calm' | 'excitement' | 'wonder' | 'melancholy' | 'contemplation' | 'nostalgia' | 'awe' | 'serenity' | 'passion' | 'mystery' | 'hope';
export interface EmotionDistribution {
    emotion: EmotionType;
    count: number;
    percentage: number;
}
export interface ArtPulseReflection {
    id: string;
    userId: string;
    sessionId: string;
    content: string;
    emotion: EmotionType;
    createdAt: Date;
    username?: string;
    isAnonymous?: boolean;
    sayuType?: string;
    timestamp?: Date | string;
    reflection?: string;
    likedBy?: string[];
    likes?: number;
}
export interface TypingIndicator {
    userId: string;
    isTyping: boolean;
    username?: string;
}
export interface ArtPulseSocketEvents {
    emotionSelected: {
        emotion: EmotionType;
        userId: string;
    };
    reflectionSubmitted: ArtPulseReflection;
    typingStatus: TypingIndicator;
    phaseChanged: {
        phase: ArtPulseSession['phase'];
    };
    art_pulse_joined: {
        sessionId: string;
        participantCount: number;
    };
    art_pulse_state_update: {
        session: ArtPulseSession;
    };
    art_pulse_participant_joined: {
        userId: string;
        nickname: string;
    };
    art_pulse_participant_left: {
        userId: string;
    };
    art_pulse_emotion_update: {
        emotions: EmotionDistribution;
    };
    art_pulse_new_reflection: ArtPulseReflection;
    art_pulse_reflection_liked: {
        reflectionId: string;
        likes: number;
        likedBy?: string[];
    };
    art_pulse_user_typing: {
        userId: string;
        isTyping: boolean;
    };
    art_pulse_phase_change: {
        phase: ArtPulseSession['phase'];
    };
    art_pulse_session_ended: {
        sessionId: string;
        results?: SessionResults;
    };
    art_pulse_session_started: {
        sessionId: string;
        artwork: any;
    };
    art_pulse_error: {
        message: string;
        code?: string;
    };
}
export interface SessionResults {
    sessionId: string;
    topEmotions: EmotionDistribution[];
    reflections: ArtPulseReflection[];
    participantCount: number;
    totalParticipants?: number;
    emotionDiversity?: number;
    averageEngagement?: number;
    totalReflections?: number;
    topReflections?: ArtPulseReflection[];
    sayuDistribution?: Record<string, number>;
    artwork?: {
        id: string;
        title: string;
        artist?: string;
        imageUrl?: string;
    };
}
export interface EmotionBubble {
    id?: string;
    emotion: EmotionType;
    x: number;
    y: number;
    size: number;
    radius: number;
    velocity: {
        x: number;
        y: number;
    };
    vx: number;
    vy: number;
    intensity?: number;
    opacity?: number;
    userId?: string;
    timestamp?: number;
}
export interface EmotionConfig {
    color: string;
    label: string;
    icon?: string;
    name?: string;
    description?: string;
    bgColor?: string;
    ringColor?: string;
}
export declare const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig>;
export interface EmotionColor {
    hue: number;
    saturation: number;
    lightness: number;
    opacity?: number;
}
export interface WeatherMetaphor {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
    intensity: number;
    temperature: 'cold' | 'cool' | 'warm' | 'hot';
}
export interface AbstractShape {
    form: 'circle' | 'square' | 'triangle' | 'irregular';
    edges: 'sharp' | 'rounded' | 'fluid';
    density: 'sparse' | 'moderate' | 'dense';
}
export interface SoundTexture {
    pitch: 'low' | 'medium' | 'high';
    volume: number;
    rhythm: 'regular' | 'syncopated' | 'free' | 'absent';
}
export interface UserStats {
    userId: string;
    totalXP: number;
    level: number;
    levelName: string;
    levelColor?: string;
    levelIcon?: string;
    nextLevelXP: number;
    currentLevelXP: number;
    progress: number;
    weeklyRank?: number;
    achievements: any[];
    recentActivity: any[];
    lastActivityDate?: Date | string;
}
export interface Mission {
    id: string;
    title: string;
    description: string;
    description_ko: string;
    points: number;
    xpReward: number;
    progress: number;
    target: number;
    completed: boolean;
}
export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    completed: boolean;
}
export interface DailyChallenge {
    id: string;
    date: string;
    theme: string;
    description: string;
    emotion: EmotionType;
    artwork?: any;
    completedBy?: string[];
}
export interface ChallengeMatch {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    emotion: EmotionType;
    reflection: string;
    createdAt: Date;
    similarity?: number;
}
export interface DailyChallengeStats {
    totalChallenges: number;
    completedChallenges: number;
    streak: number;
    longestStreak: number;
}
export interface CompanionRequest {
    id: string;
    userId: string;
    exhibitionId: string;
    preferredDate: Date;
    timeSlot: string;
    message?: string;
    status: 'pending' | 'matched' | 'cancelled';
}
export interface Exhibition {
    id: string;
    title: string;
    venueId: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    imageUrl?: string;
    artists?: string[];
}
export declare const TIME_SLOT_OPTIONS: readonly ["morning", "afternoon", "evening"];
export declare const VIEWING_PACE_OPTIONS: readonly ["slow", "moderate", "fast"];
export declare const INTERACTION_STYLE_OPTIONS: readonly ["quiet", "discussion", "guided"];
export interface HSLColor {
    h: number;
    s: number;
    l: number;
}
//# sourceMappingURL=index.d.ts.map
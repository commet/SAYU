/**
 * SAYU Shared Types and Utilities
 * Central export point for all shared types across frontend and backend
 */

// Re-export SAYU type definitions
export * from './SAYUTypeDefinitions';
export * from './easterEggDefinitions';
export * from './artist-types';

// Common API types
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

// Evolution system types
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

// Follow system types
export interface FollowUser {
  id: string;
  username: string;
  nickname: string;
  profileImage?: string;
  personalityType?: string;
  animalType?: string;
  bio?: string;
  artworkCount?: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  createdAt?: Date;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
  page: number;
  limit: number;
  pageSize?: number;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualCount: number;
}

// Type alias for backward compatibility
export type PersonalityType = string;

// Evolution system extended types
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

// Art Profile types
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
  createdAt: Date | string;  // Allow both Date and string
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

export const predefinedStyles: ArtStyle[] = [
  {
    id: 'impressionist',
    name: 'Impressionist',
    description: 'Soft, dreamy brushstrokes with emphasis on light and color',
    examples: ['Monet', 'Renoir'],
    colorPalette: ['#E6D5B8', '#F0A500', '#4A7C7E'],
    characteristics: ['soft edges', 'light play', 'atmospheric']
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Bold shapes and colors expressing emotions',
    examples: ['Kandinsky', 'Pollock'],
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    characteristics: ['geometric', 'expressive', 'non-representational']
  }
];

// Art Pulse types
export interface ArtPulseSession {
  id: string;
  artworkId?: string;
  artwork?: any;  // Full artwork data
  phase?: 'contemplation' | 'sharing' | 'voting';
  participants?: string[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  results?: SessionResults;
  dailyChallengeId?: string;
  participantCount?: number;
  createdAt?: Date;
}

export interface TouchData {
  x: number;
  y: number;
  timestamp: number;
  duration?: number;
}

export interface ResonanceData {
  type: 'sensory' | 'emotional' | 'cognitive' | null;
  intensity: number;
  focusAreas: string[];
  dwellTime: number;
}

export interface ArtPulseParticipation {
  id: string;
  sessionId: string;
  userId: string;
  aptType: string;
  joinedAt: Date;
  leftAt?: Date;
  touchData: TouchData[];
  resonanceData: ResonanceData;
  session?: ArtPulseSession;
}

export interface ArtPulseAnalytics {
  sessionId: string;
  heatmapData: Array<{ x: number; y: number; value: number }>;
  resonanceDistribution: Record<string, number>;
  aptTypeDistribution: Record<string, number>;
  averageDwellTime: number;
  peakConcurrentUsers: number;
  engagementScore: number;
}

// Perception Exchange types (loose shapes — Supabase rpc-driven)
export interface PerceptionExchangeSession {
  id: string;
  initiator_id: string;
  partner_id: string;
  artwork_id: string;
  museum_source?: string;
  artwork_data?: any;
  status: 'active' | 'completed' | 'cancelled' | string;
  current_phase?: number | string;
  initiated_at?: string;
  messages?: PerceptionMessage[];
  partner?: any;
  initiator?: any;
  quality_metrics?: any;
  [key: string]: any;
}

export interface PerceptionMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  emotion_tags?: string[];
  word_count?: number;
  sent_at?: string;
  read_at?: string | null;
  phase?: number | string;
  sender?: any;
  [key: string]: any;
}

export interface ExchangePreferences {
  user_id: string;
  auto_accept?: boolean;
  preferred_apt_types?: string[];
  notification_enabled?: boolean;
  [key: string]: any;
}

export interface CreateExchangeRequest {
  partner_id: string;
  artwork_id: string;
  museum_source?: string;
  artwork_data?: any;
  initial_message?: string;
}

export interface ExchangeListItem {
  session: PerceptionExchangeSession;
  unread_count: number;
  last_message?: PerceptionMessage;
  my_role: 'initiator' | 'partner';
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
  emotionSelected: { emotion: EmotionType; userId: string };
  reflectionSubmitted: ArtPulseReflection;
  typingStatus: TypingIndicator;
  phaseChanged: { phase: ArtPulseSession['phase'] };
  art_pulse_joined: { sessionId: string; participantCount: number };
  art_pulse_state_update: { session: ArtPulseSession };
  art_pulse_participant_joined: { userId: string; nickname: string };
  art_pulse_participant_left: { userId: string };
  art_pulse_emotion_update: { emotions: EmotionDistribution };
  art_pulse_new_reflection: ArtPulseReflection;
  art_pulse_reflection_liked: { reflectionId: string; likes: number; likedBy?: string[] };
  art_pulse_user_typing: { userId: string; isTyping: boolean };
  art_pulse_phase_change: { phase: ArtPulseSession['phase'] };
  art_pulse_session_ended: { sessionId: string; results?: SessionResults };
  art_pulse_session_started: { sessionId: string; artwork: any };
  art_pulse_error: { message: string; code?: string };
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
  velocity: { x: number; y: number };
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

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  joy: { color: '#FFD93D', label: 'Joy', icon: '😊', name: 'Joy', description: 'Feeling of happiness and delight' },
  sadness: { color: '#6C5CE7', label: 'Sadness', icon: '😢', name: 'Sadness', description: 'Feeling of sorrow or unhappiness' },
  anger: { color: '#FF6B6B', label: 'Anger', icon: '😠', name: 'Anger', description: 'Feeling of strong displeasure' },
  fear: { color: '#A8E6CF', label: 'Fear', icon: '😰', name: 'Fear', description: 'Feeling of anxiety or apprehension' },
  love: { color: '#FF8B94', label: 'Love', icon: '❤️', name: 'Love', description: 'Feeling of deep affection' },
  surprise: { color: '#4ECDC4', label: 'Surprise', icon: '😮', name: 'Surprise', description: 'Feeling of unexpected wonder' },
  calm: { color: '#95E1D3', label: 'Calm', icon: '😌', name: 'Calm', description: 'Feeling of peace and tranquility' },
  excitement: { color: '#F38181', label: 'Excitement', icon: '🤩', name: 'Excitement', description: 'Feeling of enthusiasm and energy' },
  wonder: { color: '#B794F4', label: 'Wonder', icon: '🤔', name: 'Wonder', description: 'Feeling of curiosity and amazement' },
  melancholy: { color: '#718096', label: 'Melancholy', icon: '😔', name: 'Melancholy', description: 'Feeling of pensive sadness' },
  contemplation: { color: '#4FD1C5', label: 'Contemplation', icon: '🧐', name: 'Contemplation', description: 'Deep reflective thought' },
  nostalgia: { color: '#F6AD55', label: 'Nostalgia', icon: '🥺', name: 'Nostalgia', description: 'Sentimental longing for the past' },
  awe: { color: '#FC8181', label: 'Awe', icon: '😲', name: 'Awe', description: 'Feeling of reverent wonder' },
  serenity: { color: '#9F7AEA', label: 'Serenity', icon: '😇', name: 'Serenity', description: 'State of being calm and peaceful' },
  passion: { color: '#F687B3', label: 'Passion', icon: '🔥', name: 'Passion', description: 'Intense enthusiasm or desire' },
  mystery: { color: '#667EEA', label: 'Mystery', icon: '🎭', name: 'Mystery', description: 'Feeling of intrigue and curiosity' },
  hope: { color: '#48BB78', label: 'Hope', icon: '🌟', name: 'Hope', description: 'Feeling of expectation and desire' }
};

// Note: Artist types are now exported from './artist-types'
// The complex Artist type system (PublicDomainArtist, LicensedArtist, etc.) is defined there
// For backward compatibility, SimpleArtist interface is also available

// Emotion translation types
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

// Gamification types
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

// Daily Challenge types — match daily_challenge_artworks table schema
export interface DailyChallengeArtworkData {
  title?: string;
  artist?: string;
  date?: string;
  image_url?: string;
  [key: string]: any;
}

export interface DailyChallenge {
  id: string;
  date: string;
  artwork_id: string;
  museum_source: string;
  artwork_data: DailyChallengeArtworkData;
  artwork_vector?: Record<string, any>;
  theme?: string;
  curator_note?: string;
  created_at?: string;
}

export interface ChallengeResponse {
  id: string;
  challenge_date: string;
  user_id: string;
  user_apt_type: string;
  emotion_tags: string[];
  emotion_selection_time?: number;
  emotion_changed?: boolean;
  personal_note?: string;
  responded_at?: string;
}

export interface UserTasteProfile {
  user_id: string;
  apt_type: string;
  emotion_profile?: Record<string, number>;
  updated_at?: string;
  [key: string]: any;
}

export interface ChallengeProgressState {
  hasResponded: boolean;
  currentStreak: number;
  longestStreak: number;
  totalParticipations: number;
  nextReward?: {
    type: '7day_streak' | '30day_streak';
    daysRemaining: number;
  };
}

export interface ChallengeMatch {
  id: string;
  challenge_date: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  apt_compatibility?: number;
  emotion_similarity?: number;
  match_reasons?: string[];
  matched_user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type?: string;
  };
  created_at?: string;
}

export interface DailyChallengeStats {
  total_responses: number;
  emotion_distribution: Record<string, number>;
  apt_distribution: Record<string, number>;
  avg_response_time: number;
  participation_rate?: number;
  top_emotions: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
}

// Exhibition Companion types
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

// Constants
export const TIME_SLOT_OPTIONS = [
  'morning',
  'afternoon', 
  'evening'
] as const;

export const VIEWING_PACE_OPTIONS = [
  'slow',
  'moderate',
  'fast'
] as const;

export const INTERACTION_STYLE_OPTIONS = [
  'quiet',
  'discussion',
  'guided'
] as const;

// Color types
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}
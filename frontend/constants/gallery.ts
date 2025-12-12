import type { EmotionTag } from '@/types/gallery';

export const THEME_COLORS = [
  { id: 'midnight', name: '미드나이트', color: '#1a1a2e' },
  { id: 'ocean', name: '오션 블루', color: '#0f4c81' },
  { id: 'forest', name: '포레스트', color: '#2d5016' },
  { id: 'sunset', name: '선셋', color: '#d4423a' },
  { id: 'lavender', name: '라벤더', color: '#8b5cf6' },
  { id: 'gold', name: '골드', color: '#d4a520' },
  { id: 'rose', name: '로즈', color: '#e91e63' },
  { id: 'sage', name: '세이지', color: '#87a96b' },
] as const;

export const EMOTION_TAGS: EmotionTag[] = [
  '위로', '에너지', '평온', '호기심',
  '감동', '우울', '기쁨', '놀라움',
  '생각할거리', '압도적', '아름다움', '슬픔'
];

export const EMOTION_COLORS: Record<EmotionTag, string> = {
  '위로': '#0f4c81',
  '에너지': '#d4423a',
  '평온': '#87a96b',
  '호기심': '#d4a520',
  '감동': '#e91e63',
  '우울': '#1a1a2e',
  '기쁨': '#fbbf24',
  '놀라움': '#8b5cf6',
  '생각할거리': '#64748b',
  '압도적': '#dc2626',
  '아름다움': '#ec4899',
  '슬픔': '#475569'
};

export const EMOJI_OPTIONS = [
  '🎨', '🖼️', '💙', '❤️', '✨', '🌟', '🌸', '🍂',
  '🌊', '🌅', '🏛️', '📚', '🎭', '🎪', '🎬', '🎵'
];

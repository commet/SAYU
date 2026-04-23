import type { StaticImageData } from 'next/image';

export interface ArtStyle {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  descriptionKo?: string;
  sample?: string;
  exampleImage?: StaticImageData | string;
  tags?: string[];
  artist?: string;
  movement?: string;
  colorPalette: string[];
  intensity?: number;
  examples?: string[];
  characteristics?: string[];
}

export interface ArtProfileRequest {
  userId: string;
  imageUrl: string;
  styleId: string;
  customSettings?: {
    brushStroke?: number; // 0-100
    saturation?: number;  // 0-100
    abstraction?: number; // 0-100
  };
}

export interface ArtProfileResult {
  id: string;
  userId: string;
  originalImage: string;
  transformedImage: string;
  styleUsed: ArtStyle;
  createdAt: Date | string;  // Allow both Date and string for compatibility
  likes?: number;
  shared?: boolean;
}

export interface ArtProfileGalleryItem {
  id: string;
  user: {
    id: string;
    nickname: string;
    personalityType?: string;
  };
  artProfile: ArtProfileResult;
  isLiked?: boolean;
  likeCount: number;
}


export interface UserArtPreference {
  userId: string;
  favoriteStyles: string[];
  recentlyViewed: {
    exhibitionId: string;
    artistName: string;
    movement: string;
    date: string;
  }[];
  generatedCount: number;
  monthlyCredits: number;
  isPremium: boolean;
}
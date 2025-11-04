'use client';

export type ArtCounselorStage =
  | 'opening'
  | 'exploration'
  | 'connection'
  | 'complete';

export type ConversationRole = 'user' | 'ai' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  stage?: ArtCounselorStage;
  content: string;
  subtitle?: string;
  emoji?: string;
  method?: string;
  createdAt: string;
}

export interface CounselorOption {
  id: string;
  label: string;
  description?: string;
  tone?: 'gentle' | 'curious' | 'grounding' | 'playful';
  accent?: string;
}

export interface ArtworkSummary {
  id: string;
  title: string;
  artist: string;
  year?: string;
  imageUrl?: string;
  medium?: string;
  moodKeywords?: string[];
}

export interface HybridOpeningData {
  artworkId: string;
  artworkTitle: string;
  artworkArtist: string;
  artworkYear?: string;
  personality: string;
  emoji?: string;
  message: string;
  options?: CounselorOption[];
  stage: 'opening';
}

export interface HybridExplorationData {
  artworkId: string;
  personality: string;
  stage: 'exploration';
  message: string;
  method?: string;
  options?: CounselorOption[];
  userSelection?: string | null;
  userInput?: string | null;
}

export interface HybridConnectionData {
  artworkId: string;
  personality: string;
  stage: 'connection';
  message: string;
  method?: string;
  userInput?: string;
}

export interface HybridCompleteData {
  journalId: string;
  summary: string;
  artworkTitle: string;
  createdAt: string;
}

export interface HybridApiError {
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface HybridOpeningResponse {
  success: true;
  data: HybridOpeningData;
}

export interface HybridExplorationResponse {
  success: true;
  data: HybridExplorationData;
}

export interface HybridConnectionResponse {
  success: true;
  data: HybridConnectionData;
}

export interface HybridCompleteResponse {
  success: true;
  data: HybridCompleteData;
}

export type HybridErrorResponse = {
  success: false;
  error?: HybridApiError;
  message?: string;
};

export type HybridStageResponse =
  | HybridOpeningResponse
  | HybridExplorationResponse
  | HybridConnectionResponse
  | HybridCompleteResponse
  | HybridErrorResponse;

export interface CompletePayload {
  summary: string;
  journalPrompt: string;
  emotionalKeywords: string[];
  recommendedActions: Array<{
    id: string;
    label: string;
    href?: string;
  }>;
}

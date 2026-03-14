export type SessionStage = 'opening' | 'exploring' | 'connecting' | 'complete';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatOption {
  id: string;
  label: string;
}

export interface CounselorArtwork {
  id: string;
  title: string;
  artist: string;
  year?: string;
  imageUrl: string;
  thumbnailUrl: string;
  sayuType: string;
}

export interface CounselorSession {
  id: string;
  userId: string;
  artworkId: string;
  artworkTitle: string;
  artworkArtist: string | null;
  artworkImageUrl: string | null;
  artworkThumbnailUrl: string | null;
  aptType: string;
  messages: ChatMessage[];
  summary: string | null;
  moodTags: string[];
  status: 'active' | 'completed';
  startedAt: string;
  completedAt: string | null;
}

export type SSEEvent =
  | { type: 'chunk'; content: string }
  | { type: 'options'; options: ChatOption[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface TimelineItem {
  id: string;
  artworkTitle: string;
  artworkArtist: string | null;
  artworkThumbnailUrl: string | null;
  summary: string | null;
  moodTags: string[];
  completedAt: string;
}

'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatMessage, ChatOption, CounselorArtwork, SessionStage } from './types';

interface ArtCounselorState {
  sessionId: string | null;
  stage: SessionStage;
  artwork: CounselorArtwork | null;

  messages: ChatMessage[];
  options: ChatOption[];
  isStreaming: boolean;
  streamingContent: string;

  summary: string | null;
  moodTags: string[];

  error: string | null;

  setSession: (id: string, artwork: CounselorArtwork) => void;
  setStage: (stage: SessionStage) => void;
  appendMessage: (msg: ChatMessage) => void;
  setOptions: (opts: ChatOption[]) => void;
  startStreaming: () => void;
  appendStreamChunk: (chunk: string) => void;
  finishStreaming: (fullContent: string) => void;
  setSummary: (summary: string, moodTags: string[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  stage: 'opening' as SessionStage,
  artwork: null as CounselorArtwork | null,
  messages: [] as ChatMessage[],
  options: [] as ChatOption[],
  isStreaming: false,
  streamingContent: '',
  summary: null as string | null,
  moodTags: [] as string[],
  error: null as string | null,
};

export const useArtCounselorStore = create<ArtCounselorState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSession: (id, artwork) => set({ sessionId: id, artwork }),

      setStage: (stage) => set({ stage }),

      appendMessage: (msg) => set({ messages: [...get().messages, msg] }),

      setOptions: (opts) => set({ options: opts }),

      startStreaming: () => set({ isStreaming: true, streamingContent: '' }),

      appendStreamChunk: (chunk) =>
        set({ streamingContent: get().streamingContent + chunk }),

      finishStreaming: (fullContent) => {
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
        };
        set({
          isStreaming: false,
          streamingContent: '',
          messages: [...get().messages, msg],
        });
      },

      setSummary: (summary, moodTags) => set({ summary, moodTags }),

      setError: (error) => set({ error }),

      reset: () => set({ ...initialState }),
    }),
    { name: 'art-counselor-store' }
  )
);

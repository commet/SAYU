'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  ArtCounselorStage,
  ArtworkSummary,
  CompletePayload,
  ConversationMessage,
  CounselorOption,
} from './types';

export interface ArtCounselorState {
  stage: ArtCounselorStage;
  sessionId: string | null;
  personality: string | null;
  artwork: ArtworkSummary | null;
  messages: ConversationMessage[];
  options: CounselorOption[];
  isLoading: boolean;
  journalPayload: CompletePayload | null;
  error: string | null;
  setStage: (stage: ArtCounselorStage) => void;
  setSessionMeta: (sessionId: string, personality: string) => void;
  setArtwork: (artwork: ArtworkSummary) => void;
  setOptions: (options: CounselorOption[]) => void;
  appendMessage: (message: ConversationMessage) => void;
  setLoading: (loading: boolean) => void;
  setJournalPayload: (payload: CompletePayload | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<
  ArtCounselorState,
  | 'stage'
  | 'sessionId'
  | 'personality'
  | 'artwork'
  | 'messages'
  | 'options'
  | 'isLoading'
  | 'journalPayload'
  | 'error'
> = {
  stage: 'opening',
  sessionId: null,
  personality: null,
  artwork: null,
  messages: [],
  options: [],
  isLoading: false,
  journalPayload: null,
  error: null,
};

export const useArtCounselorStore = create<ArtCounselorState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setStage: (stage) => set({ stage }),
      setSessionMeta: (sessionId, personality) =>
        set({ sessionId, personality }),
      setArtwork: (artwork) => set({ artwork }),
      setOptions: (options) => set({ options }),
      appendMessage: (message) =>
        set({ messages: [...get().messages, message] }),
      setLoading: (isLoading) => set({ isLoading }),
      setJournalPayload: (journalPayload) => set({ journalPayload }),
      setError: (error) => set({ error }),
      reset: () => set({ ...initialState }),
    }),
    { name: 'art-counselor-store' }
  )
);

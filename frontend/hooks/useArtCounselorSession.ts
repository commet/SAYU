'use client';

import { useCallback } from 'react';
import { useArtCounselorStore } from '@/lib/art-counselor/store';
import {
  ArtCounselorStage,
  HybridOpeningResponse,
  HybridExplorationResponse,
  HybridConnectionResponse,
  HybridCompleteResponse,
  HybridStageResponse,
  CompletePayload,
} from '@/lib/art-counselor/types';
import { createMessage } from '@/lib/art-counselor/utils';

interface OpeningParams {
  artworkId: string;
  personality: string;
}

interface ExplorationParams extends OpeningParams {
  userSelection: string;
  freeText?: string | null;
}

interface ConnectionParams extends OpeningParams {
  reflection: string;
}

const HYBRID_ENDPOINT = '/api/art-counselor/hybrid';

async function parseResponse<T extends HybridStageResponse>(
  response: Response
): Promise<T> {
  const data = (await response.json()) as T;
  if (!data.success) {
    throw new Error(data.error?.message || 'Art counselor request failed');
  }
  return data;
}

export function useArtCounselorSession() {
  const {
    setStage,
    setSessionMeta,
    setArtwork,
    setOptions,
    appendMessage,
    setLoading,
    setJournalPayload,
    setError,
    reset,
    sessionId,
  } = useArtCounselorStore();

  const resetSession = useCallback(() => {
    reset();
  }, [reset]);

  const finalizeSession = useCallback(
    async ({ artworkId, personality }: OpeningParams) => {
      if (!sessionId) {
        console.warn('[ArtCounselor] finalize called without session');
        return;
      }

      try {
    const response = await fetch(`${HYBRID_ENDPOINT}/complete`, {
      method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworkId,
            personality,
            sessionId,
          }),
        });

        const data = await parseResponse<HybridCompleteResponse>(response);
        if (!data.success) return;

        const payload: CompletePayload = {
          summary: data.data.summary,
          journalPrompt:
            '지금 느낀 감정을 짧게 기록해 두면 내일의 나에게 도움이 될 거예요.',
          emotionalKeywords: [],
          recommendedActions: [
            { id: 'journal', label: '저널에 오늘의 감정 기록하기', href: '/art-counselor/journal' },
            { id: 'journey', label: '아트 여정 지도로 이동', href: '/art-counselor/journey' },
          ],
        };

        setJournalPayload(payload);
        setStage('complete');
        appendMessage(
          createMessage('system', payload.summary, {
            stage: 'complete',
          })
        );
      } catch (error) {
        console.error('[ArtCounselor] finalize failed', error);
        setError(
          error instanceof Error ? error.message : 'Complete request failed'
        );
      }
    },
    [appendMessage, sessionId, setError, setJournalPayload]
  );

  const loadOpening = useCallback(
    async ({ artworkId, personality }: OpeningParams) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${HYBRID_ENDPOINT}/opening/${artworkId}/${personality}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        const data = await parseResponse<HybridOpeningResponse>(response);
        if (!data.success) return;

        const sessionIdentifier =
          sessionId ??
          (typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `session-${Date.now()}`);

        setStage('opening');
        setSessionMeta(sessionIdentifier, personality);
        setArtwork({
          id: data.data.artworkId,
          title: data.data.artworkTitle,
          artist: data.data.artworkArtist,
          year: data.data.artworkYear,
        });
        setOptions(data.data.options || []);
        appendMessage(
          createMessage('ai', data.data.message, {
            stage: 'opening',
            emoji: data.data.emoji,
          })
        );
      } catch (error) {
        console.error('[ArtCounselor] opening failed', error);
        setError(
          error instanceof Error ? error.message : 'Opening request failed'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      appendMessage,
      setArtwork,
      setError,
      setLoading,
      setOptions,
      setStage,
      setSessionMeta,
    ]
  );

  const sendExploration = useCallback(
    async (params: ExplorationParams) => {
      const { artworkId, personality, userSelection, freeText = null } = params;

      if (!sessionId) {
        console.warn('[ArtCounselor] exploration called without session');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${HYBRID_ENDPOINT}/exploration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworkId,
            personality,
            userSelection,
            freeText,
            sessionId,
          }),
        });

        const data = await parseResponse<HybridExplorationResponse>(response);
        if (!data.success) return;

        setStage(data.data.stage ?? 'connection');
        setOptions(data.data.options || []);
        appendMessage(
          createMessage('ai', data.data.message, {
            stage: 'exploration',
            method: data.data.method,
          })
        );
      } catch (error) {
        console.error('[ArtCounselor] exploration failed', error);
        setError(
          error instanceof Error ? error.message : 'Exploration request failed'
        );
      } finally {
        setLoading(false);
      }
    },
    [appendMessage, sessionId, setError, setLoading, setOptions, setStage]
  );

  const sendConnection = useCallback(
    async ({ artworkId, personality, reflection }: ConnectionParams) => {
      if (!sessionId) {
        console.warn('[ArtCounselor] connection called without session');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${HYBRID_ENDPOINT}/connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworkId,
            personality,
            userInput: reflection,
            sessionId,
          }),
        });

        const data = await parseResponse<HybridConnectionResponse>(response);
        if (!data.success) return;

        appendMessage(
          createMessage('ai', data.data.message, {
            stage: 'connection',
            method: data.data.method,
          })
        );

        setStage('connection');
        await finalizeSession({ artworkId, personality });
      } catch (error) {
        console.error('[ArtCounselor] connection failed', error);
        setError(
          error instanceof Error ? error.message : 'Connection request failed'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      appendMessage,
      finalizeSession,
      sessionId,
      setError,
      setLoading,
      setStage,
    ]
  );

  const transitionTo = useCallback(
    (stage: ArtCounselorStage) => setStage(stage),
    [setStage]
  );

  return {
    resetSession,
    loadOpening,
    sendExploration,
    sendConnection,
    finalizeSession,
    transitionTo,
  };
}

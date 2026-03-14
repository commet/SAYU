'use client';

import { useCallback, useRef } from 'react';
import { useArtCounselorStore } from '@/lib/art-counselor/store';
import { useShallow } from 'zustand/react/shallow';
import type { ChatMessage, SSEEvent, SessionStage } from '@/lib/art-counselor/types';

const EXCLUDE_IDS_KEY = 'sayu_counselor_exclude_ids';

function getExcludeIds(): string[] {
  try {
    const raw = localStorage.getItem(EXCLUDE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addExcludeId(id: string) {
  try {
    const ids = getExcludeIds();
    if (!ids.includes(id)) {
      ids.push(id);
      // Keep only last 50 to avoid blocking all artworks
      const trimmed = ids.slice(-50);
      localStorage.setItem(EXCLUDE_IDS_KEY, JSON.stringify(trimmed));
    }
  } catch {
    // localStorage unavailable
  }
}

function formatMessagesForAPI(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}

export function useArtCounselorSession() {
  const abortRef = useRef<AbortController | null>(null);

  const {
    sessionId,
    stage,
    messages,
    options,
    isStreaming,
    streamingContent,
    artwork,
    summary,
    moodTags,
    error,
    setSession,
    setStage,
    appendMessage,
    setOptions,
    startStreaming,
    appendStreamChunk,
    finishStreaming,
    setSummary,
    setError,
    reset: storeReset,
  } = useArtCounselorStore(
    useShallow((s) => ({
      sessionId: s.sessionId,
      stage: s.stage,
      messages: s.messages,
      options: s.options,
      isStreaming: s.isStreaming,
      streamingContent: s.streamingContent,
      artwork: s.artwork,
      summary: s.summary,
      moodTags: s.moodTags,
      error: s.error,
      setSession: s.setSession,
      setStage: s.setStage,
      appendMessage: s.appendMessage,
      setOptions: s.setOptions,
      startStreaming: s.startStreaming,
      appendStreamChunk: s.appendStreamChunk,
      finishStreaming: s.finishStreaming,
      setSummary: s.setSummary,
      setError: s.setError,
      reset: s.reset,
    }))
  );

  // ---- internal: stream a chat response ----
  const streamChat = useCallback(
    async (
      allMessages: ChatMessage[],
      nextStage: SessionStage,
      aptType: string,
      artworkTitle: string,
      artworkArtist: string
    ) => {
      startStreaming();
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/art-counselor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: formatMessagesForAPI(allMessages),
            aptType,
            artworkTitle,
            artworkArtist,
            stage: nextStage,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Chat request failed (${response.status})`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const event: SSEEvent = JSON.parse(data);
              if (event.type === 'chunk') {
                accumulated += event.content;
                appendStreamChunk(event.content);
              }
              if (event.type === 'options') {
                setOptions(event.options);
              }
              if (event.type === 'error') {
                setError(event.message);
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        // Get the final accumulated content from store
        const finalContent =
          accumulated || useArtCounselorStore.getState().streamingContent;
        finishStreaming(finalContent);
        setStage(nextStage);

        return finalContent;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return '';
        const message =
          err instanceof Error ? err.message : 'Stream error';
        setError(message);
        // Ensure streaming state is cleaned up on error
        finishStreaming(
          useArtCounselorStore.getState().streamingContent || ''
        );
        return '';
      }
    },
    [
      startStreaming,
      setError,
      appendStreamChunk,
      setOptions,
      finishStreaming,
      setStage,
    ]
  );

  // ---- internal: complete session ----
  const completeSession = useCallback(
    async (
      currentSessionId: string,
      allMessages: ChatMessage[]
    ) => {
      // Use last assistant message as summary
      const lastAssistant = [...allMessages]
        .reverse()
        .find((m) => m.role === 'assistant');
      const summaryText = lastAssistant?.content || '';

      try {
        await fetch('/api/art-counselor/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            sessionId: currentSessionId,
            messages: allMessages,
            summary: summaryText,
            moodTags: [],
          }),
        });
      } catch {
        // non-critical, session saved best-effort
      }

      setSummary(summaryText, []);
      setStage('complete');
    },
    [setSummary, setStage]
  );

  // ---- public: initSession ----
  const initSession = useCallback(
    async (aptType: string) => {
      setError(null);

      try {
        // 1. Fetch artwork
        const excludeIds = getExcludeIds();
        const artworkRes = await fetch('/api/art-counselor/artwork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aptType, excludeIds }),
        });

        if (!artworkRes.ok) {
          throw new Error('Failed to fetch artwork');
        }

        const { artwork: fetchedArtwork } = await artworkRes.json();
        if (!fetchedArtwork) {
          throw new Error('No artwork available');
        }

        // 2. Create session
        const sessionRes = await fetch('/api/art-counselor/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            artworkId: fetchedArtwork.id,
            artworkTitle: fetchedArtwork.title,
            artworkArtist: fetchedArtwork.artist,
            artworkImageUrl: fetchedArtwork.imageUrl,
            artworkThumbnailUrl: fetchedArtwork.thumbnailUrl,
            aptType,
          }),
        });

        if (!sessionRes.ok) {
          throw new Error('Failed to create session');
        }

        const { sessionId: newSessionId } = await sessionRes.json();

        // 3. Store in zustand
        setSession(newSessionId, fetchedArtwork);

        // 4. Save to exclude list
        addExcludeId(fetchedArtwork.id);

        // 5. Stream opening message
        await streamChat(
          [],
          'opening',
          aptType,
          fetchedArtwork.title,
          fetchedArtwork.artist
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Session init failed';
        setError(message);
      }
    },
    [setError, setSession, streamChat]
  );

  // ---- public: sendMessage ----
  const sendMessage = useCallback(
    async (content: string, optionId?: string) => {
      const state = useArtCounselorStore.getState();
      const currentArtwork = state.artwork;
      const currentSessionId = state.sessionId;
      const currentStage = state.stage;

      if (!currentArtwork || !currentSessionId) return;

      // 1. Create and append user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      appendMessage(userMessage);

      const allMessages = [...state.messages, userMessage];

      // 2. Determine next stage
      let nextStage: SessionStage;
      if (currentStage === 'opening') {
        nextStage = 'exploring';
      } else if (currentStage === 'exploring') {
        nextStage = 'connecting';
      } else {
        // connecting -> trigger completion after AI response
        nextStage = 'connecting';
      }

      // 3. Stream AI response
      const aptType = currentArtwork.sayuType || 'LAEF';
      await streamChat(
        allMessages,
        nextStage,
        aptType,
        currentArtwork.title,
        currentArtwork.artist
      );

      // 4. If we just finished the connecting stage, complete the session
      if (currentStage === 'connecting') {
        const updatedState = useArtCounselorStore.getState();
        await completeSession(currentSessionId, updatedState.messages);
      }
    },
    [appendMessage, streamChat, completeSession]
  );

  // ---- public: reset ----
  const reset = useCallback(() => {
    abortRef.current?.abort();
    storeReset();
  }, [storeReset]);

  return {
    // State
    stage,
    messages,
    options,
    isStreaming,
    streamingContent,
    artwork,
    summary,
    moodTags,
    error,

    // Actions
    initSession,
    sendMessage,
    reset,
  };
}

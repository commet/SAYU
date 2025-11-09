'use client';

import { useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useArtCounselorSession } from '@/hooks/useArtCounselorSession';
import { useArtCounselorStore } from '@/lib/art-counselor/store';
import { useShallow } from 'zustand/react/shallow';
import { createMessage } from '@/lib/art-counselor/utils';
import { CounselorOption } from '@/lib/art-counselor/types';
import { ArtCounselorShell } from '@/components/art-counselor-hybrid/ArtCounselorShell';
import { ArtworkHero } from '@/components/art-counselor-hybrid/ArtworkHero';
import { ConversationStage } from '@/components/art-counselor-hybrid/ConversationStage';
import { ConversationThread } from '@/components/art-counselor-hybrid/ConversationThread';
import { OpeningStep } from '@/components/art-counselor-hybrid/OpeningStep';
import { ExplorationStep } from '@/components/art-counselor-hybrid/ExplorationStep';
import { ConnectionStep } from '@/components/art-counselor-hybrid/ConnectionStep';
import { CompleteStep } from '@/components/art-counselor-hybrid/CompleteStep';
import { SessionInsightsPanel } from '@/components/art-counselor-hybrid/SessionInsightsPanel';

export default function ArtCounselorSessionPage() {
  const params = useParams<{ artworkId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const artworkId = params?.artworkId ?? '';

  const {
    stage,
    messages,
    options,
    isLoading,
    artwork,
    journalPayload,
    appendMessage,
    setOptions,
  } = useArtCounselorStore(
    useShallow((state) => ({
      stage: state.stage,
      messages: state.messages,
      options: state.options,
      isLoading: state.isLoading,
      artwork: state.artwork,
      journalPayload: state.journalPayload,
      appendMessage: state.appendMessage,
      setOptions: state.setOptions,
    }))
  );

  const {
    resetSession,
    loadOpening,
    sendExploration,
    sendConnection,
  } = useArtCounselorSession();

  useEffect(() => {
    resetSession();
    return () => resetSession();
  }, [resetSession, artworkId]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (!user.personalityType) {
      router.replace('/quiz');
      return;
    }

    if (!artworkId) {
      router.replace('/art-counselor');
      return;
    }

    loadOpening({ artworkId, personality: user.personalityType });
  }, [authLoading, user, router, artworkId, loadOpening]);

  const ensurePersonality = useCallback(() => {
    if (!user?.personalityType) {
      throw new Error('Personality type is required for counselor session');
    }
    return user.personalityType;
  }, [user?.personalityType]);

  const handleOptionSelect = useCallback(
    async (option: CounselorOption) => {
      const personality = ensurePersonality();
      if (option.id === 'free_input') {
        return;
      }

      appendMessage(
        createMessage('user', option.label, { stage: 'opening' })
      );
      setOptions([]);
      await sendExploration({
        artworkId,
        personality,
        userSelection: option.id,
        freeText: null,
      });
    },
    [
      appendMessage,
      ensurePersonality,
      artworkId,
      sendExploration,
      setOptions,
    ]
  );

  const handleExplorationFreeText = useCallback(
    async (freeText: string) => {
      appendMessage(
        createMessage('user', freeText, { stage: 'exploration' })
      );
      const personality = ensurePersonality();
      setOptions([]);
      await sendExploration({
        artworkId,
        personality,
        userSelection: 'free_input',
        freeText,
      });
    },
    [appendMessage, ensurePersonality, artworkId, sendExploration, setOptions]
  );

  const handleConnectionSubmit = useCallback(
    async (reflection: string) => {
      appendMessage(
        createMessage('user', reflection, { stage: 'connection' })
      );
      const personality = ensurePersonality();
      await sendConnection({ artworkId, personality, reflection });
    },
    [appendMessage, ensurePersonality, artworkId, sendConnection]
  );

  const handleJournalRedirect = useCallback(() => {
    router.push('/art-counselor/journal');
  }, [router]);

  const conversationFooter = (() => {
    switch (stage) {
      case 'opening':
        return (
          <OpeningStep
            options={options}
            isLoading={isLoading}
            onSelectOption={handleOptionSelect}
          />
        );
      case 'exploration':
        return (
          <ExplorationStep
            options={options}
            isLoading={isLoading}
            onSelectOption={handleOptionSelect}
            onSubmitFreeText={handleExplorationFreeText}
          />
        );
      case 'connection':
        return (
          <ConnectionStep
            isLoading={isLoading}
            onSubmit={handleConnectionSubmit}
          />
        );
      case 'complete':
      default:
        return <CompleteStep payload={journalPayload} onReset={handleJournalRedirect} />;
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <ArtCounselorShell
        artworkPanel={<ArtworkHero artwork={artwork} personality={user?.personalityType ?? null} />}
        conversationPanel={
          <div className="relative flex h-full flex-col">
            <ConversationStage stage={stage} />
            <ConversationThread messages={messages} />
            <div className="border-t border-white/5 bg-white/6">
              {conversationFooter}
            </div>
            {isLoading ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-sayu-lavender-dream" />
              </div>
            ) : null}
          </div>
        }
        summaryPanel={
          <SessionInsightsPanel
            artwork={artwork}
            personality={user?.personalityType ?? null}
            stage={stage}
            journalPayload={journalPayload}
            onOpenJournal={journalPayload ? handleJournalRedirect : undefined}
          />
        }
      />
    </div>
  );
}

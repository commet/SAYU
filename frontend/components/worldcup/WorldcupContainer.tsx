'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import { ModeSelector } from './ModeSelector';
import { SetupPhase } from './SetupPhase';
import { ExhibitionSetupPhase } from './ExhibitionSetupPhase';
import { MatchView } from './MatchView';
import { ResultView } from './ResultView';
import type {
  RoundType,
  WorldcupMode,
  ExhibitionWorldcupTheme,
} from '@sayu/shared/exhibition-worldcup-types';

type Phase = 'mode-select' | 'setup' | 'tournament' | 'result';

interface WorldcupContainerProps {
  exhibitionVisitId?: string;
  exhibitionId?: string;
  initialMode?: WorldcupMode;
}

// Ambient Background Component
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(180,140,100,0.03) 0%, transparent 60%)',
        }}
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100,120,180,0.02) 0%, transparent 60%)',
        }}
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function WorldcupContainer({
  exhibitionVisitId,
  exhibitionId,
  initialMode,
}: WorldcupContainerProps) {
  const {
    session,
    participants,
    currentMatch,
    winner,
    mode,
    setMode,
    setSession,
    addParticipant,
    removeParticipant,
    startTournament,
    selectWinner,
    advanceInRound,
    generateNextRound,
    completeTournament,
    setLoading,
    reset,
    getProgress,
  } = useWorldcupStore();

  const [phase, setPhase] = useState<Phase>(initialMode ? 'setup' : 'mode-select');
  const [isProcessing, setIsProcessing] = useState(false);

  // Set initial mode from prop
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);

  useEffect(() => {
    if (session?.status === 'completed' && winner) {
      setPhase('result');
    } else if (session?.status === 'in_progress' && currentMatch) {
      setPhase('tournament');
    }
  }, [session?.status, winner, currentMatch]);

  const handleSelectMode = useCallback(
    (selectedMode: WorldcupMode) => {
      setMode(selectedMode);
      setPhase('setup');
    },
    [setMode]
  );

  const handleCreateSession = useCallback(
    async (roundType: RoundType) => {
      try {
        setLoading(true);

        const response = await fetch('/api/worldcup/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            round_type: roundType,
            exhibition_visit_id: exhibitionVisitId,
            exhibition_id: exhibitionId,
            mode,
          }),
        });

        const data = await response.json();

        if (data.success && data.data?.session) {
          setSession(data.data.session);
        } else {
          console.error('Failed to create session:', data.error);
        }
      } catch (error) {
        console.error('Session creation error:', error);
      } finally {
        setLoading(false);
      }
    },
    [exhibitionVisitId, exhibitionId, setSession, setLoading]
  );

  const handleExhibitionStart = useCallback(
    async (round: RoundType, theme: ExhibitionWorldcupTheme, city?: string) => {
      try {
        setLoading(true);
        setIsProcessing(true);

        const response = await fetch('/api/worldcup/sessions/exhibition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ round, theme, city }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          const {
            session: newSession,
            participants: newParticipants,
            matches,
          } = data.data;

          setSession(newSession);
          useWorldcupStore.setState({ participants: newParticipants });
          startTournament(matches);
          setPhase('tournament');
        } else {
          console.error('Failed to start exhibition worldcup:', data.error);
          alert(data.error || '전시 월드컵 시작에 실패했습니다.');
        }
      } catch (error) {
        console.error('Exhibition worldcup error:', error);
      } finally {
        setLoading(false);
        setIsProcessing(false);
      }
    },
    [setSession, startTournament, setLoading]
  );

  const handleStartTournament = useCallback(async () => {
    if (!session?.id) return;

    try {
      setLoading(true);
      setIsProcessing(true);

      const response = await fetch(`/api/worldcup/sessions/${session.id}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { session: updatedSession, matches, participants: updatedParticipants } = data.data;

        setSession(updatedSession);
        useWorldcupStore.setState({ participants: updatedParticipants });
        startTournament(matches);
        setPhase('tournament');
      } else {
        console.error('Failed to start tournament:', data.error);
        alert(data.error || '토너먼트 시작에 실패했습니다.');
      }
    } catch (error) {
      console.error('Start tournament error:', error);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }, [session?.id, setSession, startTournament, setLoading]);

  const handleMatchResult = useCallback(
    (winnerId: string, decisionTimeMs?: number) => {
      if (!session?.id || !currentMatch?.id || isProcessing) return;

      setIsProcessing(true);

      // 1. Record winner in local state (instant)
      selectWinner(winnerId, decisionTimeMs);

      // 2. Fire API call in background (no await - fire and forget)
      fetch(
        `/api/worldcup/sessions/${session.id}/matches/${currentMatch.id}/result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            winner_id: winnerId,
            decision_time_ms: decisionTimeMs,
          }),
        }
      ).catch((error) => console.error('Background match result save error:', error));

      // 3. Client-side bracket progression (instant)
      // Small delay for selection animation to be visible
      setTimeout(() => {
        const hasMoreInRound = advanceInRound();

        if (!hasMoreInRound) {
          // Round complete - generate next round or finish tournament
          const hasNextRound = generateNextRound();

          if (!hasNextRound) {
            // Tournament complete (final was played)
            const winnerParticipant = participants.find((p) => p.id === winnerId);
            if (winnerParticipant) {
              completeTournament(winnerParticipant, []);
              setPhase('result');
            }
          }
        }

        setIsProcessing(false);
      }, 200);
    },
    [
      session?.id,
      currentMatch?.id,
      isProcessing,
      selectWinner,
      participants,
      completeTournament,
      advanceInRound,
      generateNextRound,
    ]
  );

  const handleRestart = useCallback(() => {
    reset();
    setPhase('mode-select');
  }, [reset]);

  return (
    <div className="min-h-screen relative">
      <AmbientBackground />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'mode-select' && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ModeSelector onSelectMode={handleSelectMode} />
            </motion.div>
          )}

          {phase === 'setup' && mode === 'artwork' && (
            <motion.div
              key="setup-artwork"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <SetupPhase
                session={session}
                participants={participants}
                onCreateSession={handleCreateSession}
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
                onStartTournament={handleStartTournament}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {phase === 'setup' && mode === 'exhibition' && (
            <motion.div
              key="setup-exhibition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ExhibitionSetupPhase
                onStart={handleExhibitionStart}
                onBack={() => setPhase('mode-select')}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {phase === 'tournament' && currentMatch && (
            <motion.div
              key="tournament"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <MatchView
                match={currentMatch}
                onSelectWinner={handleMatchResult}
                progress={getProgress()}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {phase === 'result' && winner && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <ResultView
                sessionId={session?.id || ''}
                winner={winner}
                mode={mode}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

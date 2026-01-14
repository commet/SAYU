'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import { SetupPhase } from './SetupPhase';
import { MatchView } from './MatchView';
import { ResultView } from './ResultView';
import type { RoundType } from '@/shared/exhibition-worldcup-types';

type Phase = 'setup' | 'tournament' | 'result';

interface WorldcupContainerProps {
  exhibitionVisitId?: string;
  exhibitionId?: string;
}

export function WorldcupContainer({
  exhibitionVisitId,
  exhibitionId,
}: WorldcupContainerProps) {
  const {
    session,
    participants,
    currentMatch,
    winner,
    setSession,
    addParticipant,
    removeParticipant,
    startTournament,
    setCurrentMatch,
    selectWinner,
    advanceToNextMatch,
    completeTournament,
    setLoading,
    reset,
    getProgress,
  } = useWorldcupStore();

  const [phase, setPhase] = useState<Phase>('setup');
  const [isProcessing, setIsProcessing] = useState(false);

  // 세션 상태에 따라 phase 설정
  useEffect(() => {
    if (session?.status === 'completed' && winner) {
      setPhase('result');
    } else if (session?.status === 'in_progress' && currentMatch) {
      setPhase('tournament');
    } else {
      setPhase('setup');
    }
  }, [session?.status, winner, currentMatch]);

  // 세션 생성
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

  // 토너먼트 시작
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

        // 참가자 업데이트 (셔플된 순서)
        useWorldcupStore.setState({ participants: updatedParticipants });

        // 토너먼트 시작
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

  // 매치 결과 제출
  const handleMatchResult = useCallback(
    async (winnerId: string, decisionTimeMs?: number) => {
      if (!session?.id || !currentMatch?.id || isProcessing) return;

      try {
        setIsProcessing(true);

        // 로컬 상태 먼저 업데이트 (빠른 UI 반응)
        selectWinner(winnerId, decisionTimeMs);

        const response = await fetch(
          `/api/worldcup/sessions/${session.id}/matches/${currentMatch.id}/result`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              winner_id: winnerId,
              decision_time_ms: decisionTimeMs,
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.data) {
          if (data.data.completed) {
            // 토너먼트 완료
            const winnerParticipant = participants.find((p) => p.id === winnerId);
            if (winnerParticipant) {
              completeTournament(winnerParticipant, []);
              setPhase('result');
            }
          } else if (data.data.nextMatch) {
            // 다음 매치로 진행
            setTimeout(() => {
              advanceToNextMatch(data.data.nextMatch);
            }, 500);
          }
        } else {
          console.error('Failed to submit match result:', data.error);
        }
      } catch (error) {
        console.error('Match result error:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      session?.id,
      currentMatch?.id,
      isProcessing,
      selectWinner,
      participants,
      completeTournament,
      advanceToNextMatch,
    ]
  );

  // 재시작
  const handleRestart = useCallback(() => {
    reset();
    setPhase('setup');
  }, [reset]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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

        {phase === 'tournament' && currentMatch && (
          <motion.div
            key="tournament"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <ResultView
              sessionId={session?.id || ''}
              winner={winner}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Exhibition Worldcup Store (Zustand)
 * 전시 월드컵 상태 관리
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WorldcupSession,
  WorldcupParticipant,
  WorldcupMatch,
  WorldcupState,
  PendingParticipant,
  RoundType,
  WorldcupMode,
  WORLDCUP_STORAGE_KEYS,
} from '@sayu/shared/exhibition-worldcup-types';
import {
  calculateTotalMatches,
  getParticipantImageUrl,
  getParticipantTitle,
  ROUND_TYPE_CONFIG,
} from '@sayu/shared/exhibition-worldcup-types';

interface WorldcupStore extends WorldcupState {
  // Mode
  mode: WorldcupMode;
  setMode: (mode: WorldcupMode) => void;

  // Setup Actions
  setSession: (session: WorldcupSession) => void;
  addParticipant: (participant: WorldcupParticipant) => void;
  removeParticipant: (participantId: string) => void;
  clearParticipants: () => void;

  // Tournament Actions
  startTournament: (matches: WorldcupMatch[]) => void;
  setCurrentMatch: (match: WorldcupMatch) => void;
  selectWinner: (winnerId: string, decisionTimeMs?: number) => void;
  advanceToNextMatch: (nextMatch: WorldcupMatch) => void;
  completeTournament: (winner: WorldcupParticipant, rankings: WorldcupParticipant[]) => void;

  // State Actions
  setLoading: (loading: boolean) => void;
  setMatchStartTime: () => void;

  // Reset
  reset: () => void;
  abandonSession: () => void;

  // Helpers
  getParticipantById: (id: string) => WorldcupParticipant | undefined;
  getCurrentRoundLabel: () => string;
  getProgress: () => { current: number; total: number; percentage: number };
}

const initialState: WorldcupState = {
  session: null,
  participants: [],
  matches: [],
  currentMatch: null,
  currentMatchParticipants: { a: null, b: null },
  isLoading: false,
  matchStartTime: null,
  winner: null,
  rankings: [],
};

export const useWorldcupStore = create<WorldcupStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Mode
      // ========================================
      mode: 'artwork' as WorldcupMode,

      setMode: (mode: WorldcupMode) => {
        set({ mode });
      },

      // ========================================
      // Setup Actions
      // ========================================

      setSession: (session: WorldcupSession) => {
        set({ session });
      },

      addParticipant: (participant: WorldcupParticipant) => {
        set((state) => ({
          participants: [...state.participants, participant],
        }));
      },

      removeParticipant: (participantId: string) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== participantId),
        }));
      },

      clearParticipants: () => {
        set({ participants: [] });
      },

      // ========================================
      // Tournament Actions
      // ========================================

      startTournament: (matches: WorldcupMatch[]) => {
        const state = get();
        if (!state.session || matches.length === 0) return;

        const firstMatch = matches[0];
        const participantA = state.participants.find(
          (p) => p.id === firstMatch.participant_a_id
        );
        const participantB = state.participants.find(
          (p) => p.id === firstMatch.participant_b_id
        );

        set({
          matches,
          currentMatch: firstMatch,
          currentMatchParticipants: {
            a: participantA || null,
            b: participantB || null,
          },
          matchStartTime: Date.now(),
          session: {
            ...state.session,
            status: 'in_progress',
            started_at: new Date().toISOString(),
          },
        });
      },

      setCurrentMatch: (match: WorldcupMatch) => {
        const state = get();
        const participantA = state.participants.find(
          (p) => p.id === match.participant_a_id
        );
        const participantB = state.participants.find(
          (p) => p.id === match.participant_b_id
        );

        set({
          currentMatch: match,
          currentMatchParticipants: {
            a: participantA || null,
            b: participantB || null,
          },
          matchStartTime: Date.now(),
        });
      },

      selectWinner: (winnerId: string, decisionTimeMs?: number) => {
        const state = get();
        if (!state.currentMatch) return;

        // 매치 결과 업데이트
        const updatedMatches = state.matches.map((m) =>
          m.id === state.currentMatch!.id
            ? {
                ...m,
                winner_id: winnerId,
                decision_time_ms: decisionTimeMs,
                completed_at: new Date().toISOString(),
              }
            : m
        );

        set({ matches: updatedMatches });
      },

      advanceToNextMatch: (nextMatch: WorldcupMatch) => {
        const state = get();

        // 다음 매치의 참가자 찾기
        const participantA = state.participants.find(
          (p) => p.id === nextMatch.participant_a_id
        );
        const participantB = state.participants.find(
          (p) => p.id === nextMatch.participant_b_id
        );

        // 세션 current_match_index 업데이트
        const newMatchIndex = (state.session?.current_match_index || 0) + 1;

        set({
          currentMatch: nextMatch,
          currentMatchParticipants: {
            a: participantA || null,
            b: participantB || null,
          },
          matchStartTime: Date.now(),
          session: state.session
            ? {
                ...state.session,
                current_match_index: newMatchIndex,
              }
            : null,
        });
      },

      completeTournament: (winner: WorldcupParticipant, rankings: WorldcupParticipant[]) => {
        const state = get();

        set({
          winner,
          rankings,
          currentMatch: null,
          currentMatchParticipants: { a: null, b: null },
          session: state.session
            ? {
                ...state.session,
                status: 'completed',
                winner_participant_id: winner.id,
                completed_at: new Date().toISOString(),
              }
            : null,
        });
      },

      // ========================================
      // State Actions
      // ========================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setMatchStartTime: () => {
        set({ matchStartTime: Date.now() });
      },

      // ========================================
      // Reset
      // ========================================

      reset: () => {
        set({ ...initialState, mode: 'artwork' as WorldcupMode });
        localStorage.removeItem('sayu:worldcup:current_session');
      },

      abandonSession: () => {
        const state = get();
        set({
          ...initialState,
          session: state.session
            ? {
                ...state.session,
                status: 'abandoned',
              }
            : null,
        });
      },

      // ========================================
      // Helpers
      // ========================================

      getParticipantById: (id: string) => {
        return get().participants.find((p) => p.id === id);
      },

      getCurrentRoundLabel: () => {
        const state = get();
        if (!state.currentMatch) return '';

        const round = state.currentMatch.round;
        const labels: Record<number, string> = {
          1: '결승',
          2: '4강',
          3: '8강',
          4: '16강',
          5: '32강',
          6: '64강',
        };
        return labels[round] || `라운드 ${round}`;
      },

      getProgress: () => {
        const state = get();
        if (!state.session) {
          return { current: 0, total: 0, percentage: 0 };
        }

        const total = state.session.total_matches || calculateTotalMatches(state.session.round_type);
        const current = state.session.current_match_index || 0;
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

        return { current, total, percentage };
      },
    }),
    {
      name: 'sayu:worldcup-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 필수 상태만 저장
        session: state.session,
        participants: state.participants,
        matches: state.matches,
        currentMatch: state.currentMatch,
        winner: state.winner,
        rankings: state.rankings,
        mode: state.mode,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Re-derive currentMatchParticipants from restored data
        if (state.currentMatch) {
          if (state.participants.length > 0) {
            const a = state.participants.find(
              (p) => p.id === state.currentMatch?.participant_a_id
            );
            const b = state.participants.find(
              (p) => p.id === state.currentMatch?.participant_b_id
            );

            if (a && b) {
              useWorldcupStore.setState({
                currentMatchParticipants: { a, b },
                matchStartTime: Date.now(),
              });
            } else {
              // Invalid state - can't find participants, reset
              useWorldcupStore.setState({
                ...initialState,
                mode: state.mode || ('artwork' as WorldcupMode),
              });
            }
          } else {
            // currentMatch exists but no participants - corrupted state, reset
            useWorldcupStore.setState({
              ...initialState,
              mode: state.mode || ('artwork' as WorldcupMode),
            });
          }
        }
      },
    }
  )
);

// ========================================
// Selectors (성능 최적화)
// ========================================

export const selectSession = (state: WorldcupStore) => state.session;
export const selectParticipants = (state: WorldcupStore) => state.participants;
export const selectParticipantCount = (state: WorldcupStore) => state.participants.length;
export const selectCurrentMatch = (state: WorldcupStore) => state.currentMatch;
export const selectMatchParticipants = (state: WorldcupStore) => state.currentMatchParticipants;
export const selectIsLoading = (state: WorldcupStore) => state.isLoading;
export const selectWinner = (state: WorldcupStore) => state.winner;
export const selectRankings = (state: WorldcupStore) => state.rankings;
export const selectIsCompleted = (state: WorldcupStore) =>
  state.session?.status === 'completed';
export const selectIsInProgress = (state: WorldcupStore) =>
  state.session?.status === 'in_progress';
export const selectMode = (state: WorldcupStore) => state.mode;

// ========================================
// Utility Functions
// ========================================

/**
 * 시드 셔플 (Fisher-Yates)
 */
export function shuffleParticipants<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 브래킷 생성
 */
export function generateBracket(
  participants: WorldcupParticipant[]
): WorldcupMatch[] {
  const count = participants.length;
  const matches: WorldcupMatch[] = [];

  // 시작 라운드 계산 (8강=3, 16강=4, 32강=5, 64강=6)
  const startRound = Math.log2(count);

  // 첫 라운드 매치 생성
  let matchIndex = 0;
  for (let i = 0; i < count / 2; i++) {
    matches.push({
      id: `match-${matchIndex}`,
      session_id: participants[0].session_id,
      match_index: matchIndex,
      round: startRound,
      round_match_index: i,
      participant_a_id: participants[i * 2].id,
      participant_b_id: participants[i * 2 + 1].id,
      created_at: new Date().toISOString(),
    });
    matchIndex++;
  }

  return matches;
}

/**
 * 진행률 텍스트
 */
export function getProgressText(current: number, total: number): string {
  return `${current + 1}/${total} 매치`;
}

/**
 * 라운드별 진행 상황
 */
export function getRoundProgress(
  currentRound: number,
  currentMatchInRound: number,
  totalMatchesInRound: number
): string {
  const roundLabel: Record<number, string> = {
    1: '결승',
    2: '4강',
    3: '8강',
    4: '16강',
    5: '32강',
    6: '64강',
  };

  const label = roundLabel[currentRound] || `라운드 ${currentRound}`;
  return `${label} ${currentMatchInRound + 1}/${totalMatchesInRound}`;
}

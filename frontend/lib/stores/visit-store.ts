/**
 * Exhibition Visit Store (Zustand)
 * 전시 관람 상태 관리
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ExhibitionVisit,
  ArtworkRecord,
  VisitState,
  LocalVisitState,
  STORAGE_KEYS,
} from '@/shared/exhibition-recording-types';

interface VisitStore extends VisitState {
  // Actions
  startVisit: (visit: ExhibitionVisit) => void;
  endVisit: () => void;
  updateVisit: (updates: Partial<ExhibitionVisit>) => void;

  addRecord: (record: ArtworkRecord) => void;
  removeRecord: (recordId: string) => void;
  updateRecord: (recordId: string, updates: Partial<ArtworkRecord>) => void;

  // Timer
  startTimer: () => void;
  stopTimer: () => void;
  updateElapsedTime: () => void;

  // UI State
  openStartModal: () => void;
  closeStartModal: () => void;
  openEndModal: () => void;
  closeEndModal: () => void;
  openRecordModal: () => void;
  closeRecordModal: () => void;

  // Reset
  reset: () => void;

  // Offline sync
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const initialState: VisitState = {
  currentVisit: null,
  isRecording: false,
  elapsedSeconds: 0,
  timerInterval: null,
  recordedArtworks: [],
  isStartModalOpen: false,
  isEndModalOpen: false,
  isRecordModalOpen: false,
};

export const useVisitStore = create<VisitStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Visit Management
      // ========================================

      startVisit: (visit: ExhibitionVisit) => {
        set({
          currentVisit: visit,
          isRecording: true,
          elapsedSeconds: 0,
          recordedArtworks: [],
          isStartModalOpen: false,
        });

        // 타이머 시작
        get().startTimer();

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      endVisit: () => {
        // 타이머 정지
        get().stopTimer();

        set((state) => ({
          currentVisit: state.currentVisit
            ? { ...state.currentVisit, status: 'completed', ended_at: new Date().toISOString() }
            : null,
          isRecording: false,
          isEndModalOpen: false,
        }));

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      updateVisit: (updates: Partial<ExhibitionVisit>) => {
        set((state) => ({
          currentVisit: state.currentVisit ? { ...state.currentVisit, ...updates } : null,
        }));

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      // ========================================
      // Record Management
      // ========================================

      addRecord: (record: ArtworkRecord) => {
        set((state) => ({
          recordedArtworks: [...state.recordedArtworks, record],
          isRecordModalOpen: false,
        }));

        // Visit의 total_artworks_recorded 업데이트
        const state = get();
        if (state.currentVisit) {
          state.updateVisit({
            total_artworks_recorded: state.recordedArtworks.length,
          });
        }

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      removeRecord: (recordId: string) => {
        set((state) => ({
          recordedArtworks: state.recordedArtworks.filter((r) => r.id !== recordId),
        }));

        // Visit의 total_artworks_recorded 업데이트
        const state = get();
        if (state.currentVisit) {
          state.updateVisit({
            total_artworks_recorded: state.recordedArtworks.length,
          });
        }

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      updateRecord: (recordId: string, updates: Partial<ArtworkRecord>) => {
        set((state) => ({
          recordedArtworks: state.recordedArtworks.map((r) =>
            r.id === recordId ? { ...r, ...updates } : r
          ),
        }));

        // 로컬 스토리지에 저장
        get().saveToLocalStorage();
      },

      // ========================================
      // Timer
      // ========================================

      startTimer: () => {
        const state = get();

        // 이미 타이머가 실행 중이면 중복 방지
        if (state.timerInterval) {
          clearInterval(state.timerInterval);
        }

        const interval = setInterval(() => {
          get().updateElapsedTime();
        }, 1000);

        set({ timerInterval: interval });
      },

      stopTimer: () => {
        const state = get();
        if (state.timerInterval) {
          clearInterval(state.timerInterval);
          set({ timerInterval: null });
        }
      },

      updateElapsedTime: () => {
        const state = get();
        if (!state.currentVisit || !state.isRecording) return;

        const startTime = new Date(state.currentVisit.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);

        set({ elapsedSeconds });
      },

      // ========================================
      // UI State
      // ========================================

      openStartModal: () => set({ isStartModalOpen: true }),
      closeStartModal: () => set({ isStartModalOpen: false }),

      openEndModal: () => set({ isEndModalOpen: true }),
      closeEndModal: () => set({ isEndModalOpen: false }),

      openRecordModal: () => set({ isRecordModalOpen: true }),
      closeRecordModal: () => set({ isRecordModalOpen: false }),

      // ========================================
      // Reset
      // ========================================

      reset: () => {
        get().stopTimer();
        set(initialState);
        localStorage.removeItem('sayu:current_visit');
      },

      // ========================================
      // Offline Support
      // ========================================

      loadFromLocalStorage: () => {
        try {
          const stored = localStorage.getItem('sayu:current_visit');
          if (!stored) return;

          const localState: LocalVisitState = JSON.parse(stored);

          // LocalVisitState를 VisitState로 변환
          const visit: ExhibitionVisit = {
            id: localState.visitId,
            user_id: '', // API에서 가져와야 함
            exhibition_id: localState.exhibitionId,
            started_at: localState.startedAt,
            status: localState.status,
            is_offline: true,
            total_artworks_recorded: localState.records.length,
            created_at: localState.startedAt,
            updated_at: new Date().toISOString(),
          };

          const records: ArtworkRecord[] = localState.records.map((r) => ({
            id: r.localId,
            visit_id: localState.visitId,
            artwork_id: r.artworkId,
            recorded_at: r.recordedAt,
            emotions: r.emotions,
            emotion_text: r.emotionText,
            note: r.note,
            photo_url: r.photoDataUrl,
            recognition_method: r.recognitionMethod,
            is_offline_record: !r.isSynced,
            created_at: r.recordedAt,
            updated_at: r.recordedAt,
          }));

          set({
            currentVisit: visit,
            recordedArtworks: records,
            isRecording: localState.status === 'in_progress',
          });

          // 진행 중이면 타이머 재시작
          if (localState.status === 'in_progress') {
            get().startTimer();
          }
        } catch (error) {
          console.error('Failed to load visit from localStorage:', error);
        }
      },

      saveToLocalStorage: () => {
        try {
          const state = get();
          if (!state.currentVisit) {
            localStorage.removeItem('sayu:current_visit');
            return;
          }

          const localState: LocalVisitState = {
            visitId: state.currentVisit.id,
            exhibitionId: state.currentVisit.exhibition_id,
            startedAt: state.currentVisit.started_at,
            status: state.currentVisit.status,
            records: state.recordedArtworks.map((r) => ({
              localId: r.id,
              artworkId: r.artwork_id,
              recordedAt: r.recorded_at,
              emotions: r.emotions,
              emotionText: r.emotion_text,
              note: r.note,
              photoDataUrl: r.photo_url,
              recognitionMethod: r.recognition_method,
              isSynced: !r.is_offline_record,
            })),
            lastSyncedAt: state.currentVisit.synced_at || new Date().toISOString(),
          };

          localStorage.setItem('sayu:current_visit', JSON.stringify(localState));
        } catch (error) {
          console.error('Failed to save visit to localStorage:', error);
        }
      },
    }),
    {
      name: 'sayu:visit-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 타이머 interval은 저장하지 않음
        currentVisit: state.currentVisit,
        isRecording: state.isRecording,
        recordedArtworks: state.recordedArtworks,
      }),
    }
  )
);

// ========================================
// Selectors (성능 최적화)
// ========================================

export const selectCurrentVisit = (state: VisitStore) => state.currentVisit;
export const selectIsRecording = (state: VisitStore) => state.isRecording;
export const selectRecordedArtworks = (state: VisitStore) => state.recordedArtworks;
export const selectRecordCount = (state: VisitStore) => state.recordedArtworks.length;
export const selectElapsedSeconds = (state: VisitStore) => state.elapsedSeconds;

// ========================================
// Utility Hooks
// ========================================

/**
 * 타이머 표시 포맷팅 (HH:MM:SS 또는 MM:SS)
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 관람 시간 텍스트 (예: "45분 경과")
 */
export function getElapsedText(seconds: number): string {
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return '방금 시작';
  if (minutes < 60) return `${minutes}분 경과`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}시간 경과`;
  return `${hours}시간 ${remainingMinutes}분 경과`;
}

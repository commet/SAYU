'use client';

/**
 * EndVisitButton Component
 * 전시 관람 종료 버튼
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVisitStore, getElapsedText } from '@/lib/stores/visit-store';
import type { EndVisitButtonProps } from '@sayu/shared/exhibition-recording-types';

export default function EndVisitButton({
  visitId,
  onEnded,
  disabled = false,
  className = '',
}: EndVisitButtonProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { endVisit, elapsedSeconds, recordedArtworks } = useVisitStore();

  const handleEnd = async () => {
    if (disabled || isEnding) return;

    setIsEnding(true);

    try {
      // API 호출 (타임아웃 10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/visits/${visitId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitId,
          endedAt: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // HTTP 상태 체크
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Zustand Store 업데이트
        endVisit();

        // 성공 알림
        toast.success(
          `관람을 종료했습니다. ${recordedArtworks.length}개의 작품을 기록했어요!`,
          {
            duration: 3000,
            icon: '✅',
          }
        );

        // 콜백 호출
        onEnded?.();
      } else {
        throw new Error(data.error || '관람 종료에 실패했습니다');
      }
    } catch (error: any) {
      console.error('End visit error:', error);

      // 에러 타입별 처리
      if (error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다. 네트워크를 확인해주세요.', {
          duration: 4000,
        });
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error('네트워크 연결을 확인해주세요', {
          duration: 4000,
        });
      } else {
        toast.error(error.message || '관람 종료 중 오류가 발생했습니다', {
          duration: 4000,
        });
      }
    } finally {
      setIsEnding(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowConfirm(true)}
        disabled={disabled || isEnding}
        className={`
          px-6 py-2 rounded-lg
          border-2 border-neutral-300
          text-neutral-700 font-medium
          hover:border-neutral-900 hover:text-neutral-900
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        whileTap={{ scale: disabled || isEnding ? 1 : 0.95 }}
      >
        <span className="flex items-center gap-2">
          <Square size={16} />
          관람 종료
        </span>
      </motion.button>

      {/* 확인 다이얼로그 */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                정말 종료하시겠어요?
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">총 관람 시간</span>
                  <span className="font-medium text-neutral-900">
                    {getElapsedText(elapsedSeconds)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">기록한 작품</span>
                  <span className="font-medium text-neutral-900">
                    {recordedArtworks.length}개
                  </span>
                </div>
              </div>

              {recordedArtworks.length === 0 && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    아무것도 기록되지 않았어요. 그래도 종료할까요?
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-neutral-300 text-neutral-700 font-medium hover:border-neutral-900 hover:text-neutral-900 transition-all"
                >
                  아니오, 계속 볼래요
                </button>
                <button
                  onClick={handleEnd}
                  disabled={isEnding}
                  className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all"
                >
                  {isEnding ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      종료 중...
                    </span>
                  ) : (
                    '네, 종료'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

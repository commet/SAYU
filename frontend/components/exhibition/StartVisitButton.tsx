'use client';

/**
 * StartVisitButton Component
 * 전시 관람 시작 버튼
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useVisitStore } from '@/lib/stores/visit-store';
import type { StartVisitButtonProps } from '@/shared/exhibition-recording-types';

export default function StartVisitButton({
  exhibitionId,
  exhibitionTitle,
  onStarted,
  disabled = false,
  className = '',
}: StartVisitButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const { startVisit } = useVisitStore();

  const handleStart = async () => {
    if (disabled || isStarting) return;

    setIsStarting(true);

    try {
      // API 호출
      const response = await fetch('/api/visits/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exhibitionId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenSize: `${window.screen.width}x${window.screen.height}`,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Zustand Store에 저장
        startVisit({
          id: data.data.visitId,
          user_id: '', // 서버에서 처리
          exhibition_id: exhibitionId,
          started_at: data.data.startedAt,
          status: 'in_progress',
          is_offline: false,
          total_artworks_recorded: 0,
          created_at: data.data.startedAt,
          updated_at: data.data.startedAt,
        });

        // 콜백 호출
        onStarted?.(data.data.visitId);
      } else {
        alert(`관람 시작 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('Start visit error:', error);
      alert('관람 시작 중 오류가 발생했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <motion.button
      onClick={handleStart}
      disabled={disabled || isStarting}
      className={`
        w-full px-8 py-4 rounded-xl
        bg-gradient-to-r from-black to-neutral-800
        text-white font-medium text-lg
        shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileTap={{ scale: disabled || isStarting ? 1 : 0.98 }}
    >
      {isStarting ? (
        <span className="flex items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin" />
          시작 중...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-3">
          <Play size={24} fill="white" />
          관람 시작하기
        </span>
      )}
      {!isStarting && (
        <p className="text-sm text-white/80 mt-2">
          지금 이 전시를 보고 있다면 탭해서 시작하세요
        </p>
      )}
    </motion.button>
  );
}

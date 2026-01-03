'use client';

/**
 * StartVisitButton Component
 * 전시 관람 시작 버튼
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, loading: authLoading } = useAuth();
  const { startVisit } = useVisitStore();
  const router = useRouter();

  const handleStart = async () => {
    if (disabled || isStarting) return;

    // 1. 인증 확인
    if (!user) {
      toast.error('로그인이 필요합니다', {
        duration: 3000,
        icon: '🔒',
      });
      // 현재 페이지 URL을 저장하고 로그인 페이지로 이동
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setIsStarting(true);

    try {
      // 2. API 호출 (타임아웃 10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 3. HTTP 상태 체크
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 4. 응답 데이터 검증
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

        // 성공 알림
        toast.success(
          `${exhibitionTitle ? `"${exhibitionTitle}" ` : ''}관람을 시작했습니다!`,
          {
            duration: 2000,
            icon: '🎨',
          }
        );

        // 콜백 호출
        onStarted?.(data.data.visitId);
      } else {
        throw new Error(data.error || '관람 시작에 실패했습니다');
      }
    } catch (error: any) {
      console.error('Start visit error:', error);

      // 5. 에러 타입별 처리
      if (error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다. 네트워크를 확인해주세요.', {
          duration: 4000,
        });
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error('네트워크 연결을 확인해주세요', {
          duration: 4000,
        });
      } else if (error.message?.includes('HTTP 401')) {
        toast.error('인증이 만료되었습니다. 다시 로그인해주세요.', {
          duration: 4000,
        });
        router.push('/login');
      } else if (error.message?.includes('HTTP 404')) {
        toast.error('전시를 찾을 수 없습니다', {
          duration: 4000,
        });
      } else {
        toast.error(error.message || '관람 시작 중 오류가 발생했습니다', {
          duration: 4000,
        });
      }
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

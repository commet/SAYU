'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import type { WorldcupMatch } from '@/shared/exhibition-worldcup-types';
import { getRoundLabel } from '@/shared/exhibition-worldcup-types';

interface MatchViewProps {
  match: WorldcupMatch;
  onSelectWinner: (winnerId: string, decisionTimeMs?: number) => void;
  progress: { current: number; total: number; percentage: number };
  isProcessing: boolean;
}

export function MatchView({
  match,
  onSelectWinner,
  progress,
  isProcessing,
}: MatchViewProps) {
  const { currentMatchParticipants, matchStartTime, getCurrentRoundLabel } = useWorldcupStore();
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  const participantA = currentMatchParticipants.a;
  const participantB = currentMatchParticipants.b;

  const roundLabel = getCurrentRoundLabel();

  // 선택 처리
  const handleSelect = useCallback(
    (side: 'a' | 'b') => {
      if (isProcessing || selected) return;

      setSelected(side);

      const winnerId = side === 'a' ? participantA?.id : participantB?.id;
      if (!winnerId) return;

      const decisionTimeMs = matchStartTime
        ? Date.now() - matchStartTime
        : undefined;

      // 짧은 딜레이 후 결과 제출 (애니메이션 효과)
      setTimeout(() => {
        onSelectWinner(winnerId, decisionTimeMs);
      }, 300);
    },
    [isProcessing, selected, participantA?.id, participantB?.id, matchStartTime, onSelectWinner]
  );

  // 매치 변경 시 선택 초기화
  useEffect(() => {
    setSelected(null);
  }, [match.id]);

  if (!participantA || !participantB) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="p-4 text-center border-b border-gray-800">
        <div className="text-lg font-bold text-yellow-500">{roundLabel}</div>
        <div className="text-sm text-gray-400">
          {progress.current + 1} / {progress.total} 매치
        </div>
        <div className="w-full max-w-xs mx-auto mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* VS 텍스트 - 중앙 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <motion.div
          className="w-16 h-16 rounded-full bg-gray-900 border-4 border-yellow-500 flex items-center justify-center shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-yellow-500 font-bold text-lg">VS</span>
        </motion.div>
      </div>

      {/* 매치 영역 */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* 참가자 A (왼쪽/위) */}
        <ParticipantCard
          participant={participantA}
          side="a"
          isSelected={selected === 'a'}
          isLoser={selected === 'b'}
          isDisabled={isProcessing || selected !== null}
          onClick={() => handleSelect('a')}
        />

        {/* 참가자 B (오른쪽/아래) */}
        <ParticipantCard
          participant={participantB}
          side="b"
          isSelected={selected === 'b'}
          isLoser={selected === 'a'}
          isDisabled={isProcessing || selected !== null}
          onClick={() => handleSelect('b')}
        />
      </div>
    </div>
  );
}

interface ParticipantCardProps {
  participant: {
    id: string;
    title?: string;
    artist?: string;
    image_url?: string;
    temp_image_url?: string;
  };
  side: 'a' | 'b';
  isSelected: boolean;
  isLoser: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function ParticipantCard({
  participant,
  side,
  isSelected,
  isLoser,
  isDisabled,
  onClick,
}: ParticipantCardProps) {
  const imageUrl =
    participant.image_url ||
    participant.temp_image_url ||
    '/images/placeholder-artwork.png';

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex-1 relative overflow-hidden transition-all',
        'focus:outline-none',
        side === 'a' ? 'md:border-r border-b md:border-b-0' : '',
        'border-gray-800',
        isDisabled && !isSelected && !isLoser ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      animate={{
        scale: isSelected ? 1.02 : isLoser ? 0.95 : 1,
        opacity: isLoser ? 0.4 : 1,
        filter: isLoser ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.3 }}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
    >
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* 오버레이 */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          isSelected
            ? 'bg-gradient-to-t from-green-900/80 via-green-900/40 to-transparent'
            : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
          !isDisabled && 'hover:from-blue-900/60 hover:via-blue-900/30'
        )}
      />

      {/* 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-1 line-clamp-2">
            {participant.title || '제목 없음'}
          </h3>
          <p className="text-gray-300 text-sm md:text-base">
            {participant.artist || '작가 미상'}
          </p>
        </motion.div>
      </div>

      {/* 선택 표시 */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full bg-green-500/30 flex items-center justify-center backdrop-blur-sm">
              <motion.div
                className="text-6xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                ✓
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 측면 색상 인디케이터 */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1',
          side === 'a' ? 'left-0 bg-blue-500' : 'right-0 bg-red-500'
        )}
      />
    </motion.button>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, Trophy } from 'lucide-react';
import type { WorldcupMatch } from '@sayu/shared/exhibition-worldcup-types';

const t = {
  en: {
    match: 'Match',
    loading: 'Loading...',
    untitled: 'Untitled',
    unknownVenue: 'Unknown Venue',
  },
  ko: {
    match: '매치',
    loading: '로딩 중...',
    untitled: '제목 없음',
    unknownVenue: '장소 미상',
  },
};

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
  const { language } = useLanguage();
  const texts = t[language];
  const { currentMatchParticipants, matchStartTime, getCurrentRoundLabel } = useWorldcupStore();
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  const participantA = currentMatchParticipants.a;
  const participantB = currentMatchParticipants.b;

  const roundLabel = getCurrentRoundLabel();

  const handleSelect = useCallback(
    (side: 'a' | 'b') => {
      if (isProcessing || selected) return;

      setSelected(side);

      const winnerId = side === 'a' ? participantA?.id : participantB?.id;
      if (!winnerId) return;

      const decisionTimeMs = matchStartTime
        ? Date.now() - matchStartTime
        : undefined;

      setTimeout(() => {
        onSelectWinner(winnerId, decisionTimeMs);
      }, 300);
    },
    [isProcessing, selected, participantA?.id, participantB?.id, matchStartTime, onSelectWinner]
  );

  useEffect(() => {
    setSelected(null);
  }, [match.id]);

  if (!participantA || !participantB) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/worldcup"
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#D4A520]" />
              <span className="font-bold text-neutral-900">{roundLabel}</span>
            </div>
            <div className="text-sm text-neutral-500">
              {progress.current + 1} / {progress.total}
            </div>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neutral-900"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* VS Badge - Center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <motion.div
          className="w-16 h-16 rounded-full bg-white border-4 border-neutral-900 flex items-center justify-center shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-neutral-900 font-bold text-lg">VS</span>
        </motion.div>
      </div>

      {/* Match Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Participant A */}
        <ParticipantCard
          participant={participantA}
          side="a"
          isSelected={selected === 'a'}
          isLoser={selected === 'b'}
          isDisabled={isProcessing || selected !== null}
          onClick={() => handleSelect('a')}
          texts={texts}
        />

        {/* Participant B */}
        <ParticipantCard
          participant={participantB}
          side="b"
          isSelected={selected === 'b'}
          isLoser={selected === 'a'}
          isDisabled={isProcessing || selected !== null}
          onClick={() => handleSelect('b')}
          texts={texts}
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
    venue?: string;
    image_url?: string;
    temp_image_url?: string;
  };
  side: 'a' | 'b';
  isSelected: boolean;
  isLoser: boolean;
  isDisabled: boolean;
  onClick: () => void;
  texts: typeof t['en'];
}

function ParticipantCard({
  participant,
  side,
  isSelected,
  isLoser,
  isDisabled,
  onClick,
  texts,
}: ParticipantCardProps) {
  const imageUrl =
    participant.image_url ||
    participant.temp_image_url ||
    '/images/placeholder-exhibition.png';

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex-1 relative overflow-hidden transition-all min-h-[40vh] md:min-h-0',
        'focus:outline-none',
        side === 'a' ? 'md:border-r border-b md:border-b-0 border-neutral-300' : '',
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
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={participant.title || 'Exhibition'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          isSelected
            ? 'bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent'
            : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent',
          !isDisabled && 'hover:from-neutral-900/60 hover:via-neutral-900/20'
        )}
      />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-1 line-clamp-2 drop-shadow-lg">
            {participant.title || texts.untitled}
          </h3>
          <p className="text-white/80 text-sm md:text-base drop-shadow">
            {participant.venue || participant.artist || texts.unknownVenue}
          </p>
        </motion.div>
      </div>

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
              <motion.div
                className="text-6xl text-white"
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

      {/* Side Color Indicator */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1',
          side === 'a' ? 'left-0 bg-neutral-900' : 'right-0 bg-[#D4A520]'
        )}
      />
    </motion.button>
  );
}

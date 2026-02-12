'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import type { WorldcupMatch, WorldcupParticipant } from '@sayu/shared/exhibition-worldcup-types';

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
  const { currentMatchParticipants, matchStartTime, getCurrentRoundLabel, mode } = useWorldcupStore();
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  const participantA = currentMatchParticipants.a;
  const participantB = currentMatchParticipants.b;

  const roundLabel = getCurrentRoundLabel();
  const isExhibitionMode = mode === 'exhibition';

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
      }, 400);
    },
    [isProcessing, selected, participantA?.id, participantB?.id, matchStartTime, onSelectWinner]
  );

  useEffect(() => {
    setSelected(null);
  }, [match.id]);

  if (!participantA || !participantB) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white/40"
        />
      </div>
    );
  }

  const accentColor = isExhibitionMode ? 'violet' : 'amber';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 text-center border-b border-white/10 bg-white/[0.02]"
      >
        <p className={cn(
          'font-light text-lg mb-1',
          isExhibitionMode ? 'text-violet-400/80' : 'text-amber-400/80'
        )}>
          {roundLabel}
        </p>
        <p className="text-xs text-white/40">
          {progress.current + 1} / {progress.total} 매치
        </p>
        <div className="w-full max-w-xs mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full bg-gradient-to-r',
              isExhibitionMode
                ? 'from-violet-500/80 to-indigo-400/80'
                : 'from-amber-500/80 to-yellow-400/80'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Match Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* VS Badge - Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <motion.div
            className={cn(
              'w-16 h-16 rounded-full bg-[#0a0a0b] flex items-center justify-center shadow-2xl border-2',
              isExhibitionMode ? 'border-violet-500/60' : 'border-amber-500/60'
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          >
            <span className={cn(
              'font-light text-sm tracking-wider',
              isExhibitionMode ? 'text-violet-400' : 'text-amber-400'
            )}>
              VS
            </span>
          </motion.div>
        </div>

        {/* Participant A */}
        {isExhibitionMode ? (
          <ExhibitionCard
            participant={participantA}
            side="a"
            isSelected={selected === 'a'}
            isLoser={selected === 'b'}
            isDisabled={isProcessing || selected !== null}
            onClick={() => handleSelect('a')}
          />
        ) : (
          <ArtworkCard
            participant={participantA}
            side="a"
            isSelected={selected === 'a'}
            isLoser={selected === 'b'}
            isDisabled={isProcessing || selected !== null}
            onClick={() => handleSelect('a')}
          />
        )}

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10" />
        <div className="md:hidden h-px bg-white/10" />

        {/* Participant B */}
        {isExhibitionMode ? (
          <ExhibitionCard
            participant={participantB}
            side="b"
            isSelected={selected === 'b'}
            isLoser={selected === 'a'}
            isDisabled={isProcessing || selected !== null}
            onClick={() => handleSelect('b')}
          />
        ) : (
          <ArtworkCard
            participant={participantB}
            side="b"
            isSelected={selected === 'b'}
            isLoser={selected === 'a'}
            isDisabled={isProcessing || selected !== null}
            onClick={() => handleSelect('b')}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Artwork Card (기존 이미지 기반 카드)
// ============================================================================

interface CardProps {
  participant: WorldcupParticipant;
  side: 'a' | 'b';
  isSelected: boolean;
  isLoser: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function ArtworkCard({
  participant,
  side,
  isSelected,
  isLoser,
  isDisabled,
  onClick,
}: CardProps) {
  const imageUrl =
    participant.image_url ||
    participant.temp_image_url ||
    '/images/placeholder-artwork.png';

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex-1 relative overflow-hidden transition-all min-h-[40vh] md:min-h-0',
        'focus:outline-none',
        isDisabled && !isSelected && !isLoser ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      animate={{
        scale: isSelected ? 1.02 : isLoser ? 0.96 : 1,
        opacity: isLoser ? 0.3 : 1,
        filter: isLoser ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.4 }}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Gradient Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-400',
          isSelected
            ? 'bg-gradient-to-t from-amber-900/80 via-amber-900/30 to-transparent'
            : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
          !isDisabled && 'hover:from-white/20 hover:via-transparent'
        )}
      />

      {/* Artwork Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3
            className="text-xl md:text-2xl font-light mb-1 line-clamp-2 text-white"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {participant.title || '제목 없음'}
          </h3>
          <p className="text-white/60 text-sm font-light">
            {participant.artist || '작가 미상'}
          </p>
        </motion.div>
      </div>

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center backdrop-blur-sm border border-amber-400/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                className="text-5xl text-amber-400"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                &#10003;
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Color Indicator */}
      <div
        className={cn(
          'absolute w-1 transition-all duration-300',
          side === 'a'
            ? 'left-0 top-0 bottom-0 bg-gradient-to-b from-blue-400/60 to-blue-600/60'
            : 'right-0 top-0 bottom-0 bg-gradient-to-b from-red-400/60 to-red-600/60'
        )}
      />
    </motion.button>
  );
}

// ============================================================================
// Exhibition Card (전시 정보 텍스트 기반 카드)
// ============================================================================

function ExhibitionCard({
  participant,
  side,
  isSelected,
  isLoser,
  isDisabled,
  onClick,
}: CardProps) {
  const exhibitionData = (participant as any)._exhibition;
  const startDate = exhibitionData?.start_date;
  const endDate = exhibitionData?.end_date;
  const category = exhibitionData?.category;
  const venueName = exhibitionData?.venue_name;
  const imageUrl = participant.image_url || exhibitionData?.image_url;

  const dateRange =
    startDate && endDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : startDate
        ? `${formatDate(startDate)} ~`
        : '';

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex-1 relative overflow-hidden transition-all min-h-[40vh] md:min-h-0',
        'focus:outline-none',
        imageUrl ? '' : 'flex items-center justify-center',
        isDisabled && !isSelected && !isLoser ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      animate={{
        scale: isSelected ? 1.02 : isLoser ? 0.96 : 1,
        opacity: isLoser ? 0.3 : 1,
        filter: imageUrl && isLoser ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.4 }}
      whileHover={!isDisabled ? { scale: 1.01, backgroundColor: imageUrl ? undefined : 'rgba(255,255,255,0.03)' } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
    >
      {imageUrl ? (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Gradient Overlay */}
          <div
            className={cn(
              'absolute inset-0 transition-all duration-400',
              isSelected
                ? 'bg-gradient-to-t from-violet-900/80 via-violet-900/30 to-transparent'
                : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
              !isDisabled && 'hover:from-white/20 hover:via-transparent'
            )}
          />
          {/* Exhibition Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {category && (
                <span className="inline-block text-[10px] uppercase tracking-[0.15em] text-violet-300/80 mb-2 px-2 py-0.5 border border-violet-400/30 rounded-sm backdrop-blur-sm bg-black/20">
                  {category}
                </span>
              )}
              <h3
                className="text-xl md:text-2xl font-light mb-1 line-clamp-2 text-white"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {participant.title || '제목 없음'}
              </h3>
              {(venueName || participant.artist) && (
                <p className="text-white/60 text-sm font-light">
                  {venueName || participant.artist}
                </p>
              )}
              {dateRange && (
                <p className="text-white/40 text-xs font-light mt-1">
                  {dateRange}
                </p>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        <>
          {/* Background gradient (no image) */}
          <div
            className={cn(
              'absolute inset-0 transition-all duration-400',
              isSelected
                ? 'bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-transparent'
                : 'bg-gradient-to-br from-white/[0.02] to-transparent'
            )}
          />
          {/* Exhibition Info - Center */}
          <div className="relative z-10 p-8 max-w-sm text-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {category && (
                <span className="inline-block text-[10px] uppercase tracking-[0.15em] text-violet-400/60 mb-3 px-2 py-1 border border-violet-500/20 rounded-sm">
                  {category}
                </span>
              )}
              <h3
                className="text-xl md:text-2xl font-light mb-3 line-clamp-3 text-white/90 leading-relaxed"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {participant.title || '제목 없음'}
              </h3>
              {(venueName || participant.artist) && (
                <p className="text-white/50 text-sm font-light mb-2">
                  {venueName || participant.artist}
                </p>
              )}
              {dateRange && (
                <p className="text-white/30 text-xs font-light mb-3">
                  {dateRange}
                </p>
              )}
              {participant.description && (
                <p className="text-white/30 text-xs font-light line-clamp-2 leading-relaxed">
                  {participant.description}
                </p>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center backdrop-blur-sm border border-violet-400/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                className="text-5xl text-violet-400"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                &#10003;
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Color Indicator */}
      <div
        className={cn(
          'absolute w-1 transition-all duration-300',
          side === 'a'
            ? 'left-0 top-0 bottom-0 bg-gradient-to-b from-blue-400/60 to-blue-600/60'
            : 'right-0 top-0 bottom-0 bg-gradient-to-b from-red-400/60 to-red-600/60'
        )}
      />
    </motion.button>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

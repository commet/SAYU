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
  const { currentMatchParticipants, matchStartTime, getCurrentRoundLabel, mode, participants } = useWorldcupStore();
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  // Use currentMatchParticipants with fallback lookup from participants array
  const participantA = currentMatchParticipants.a
    || participants.find((p) => p.id === match.participant_a_id)
    || null;
  const participantB = currentMatchParticipants.b
    || participants.find((p) => p.id === match.participant_b_id)
    || null;

  const roundLabel = getCurrentRoundLabel();
  const isExhibitionMode = mode === 'exhibition';

  // Calculate round-specific progress (e.g., "8강 3/4 매치")
  const roundMatchCount = Math.pow(2, match.round - 1);
  const roundMatchProgress = `${match.round_match_index + 1}/${roundMatchCount}`;

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
      }, 200);
    },
    [isProcessing, selected, participantA?.id, participantB?.id, matchStartTime, onSelectWinner]
  );

  // Reset selection on new match
  useEffect(() => {
    setSelected(null);
  }, [match.id]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isProcessing || selected) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleSelect('a');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleSelect('b');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, selected, handleSelect]);

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 text-center border-b border-white/10 bg-white/[0.02]"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <p className={cn(
            'font-light text-lg',
            isExhibitionMode ? 'text-white/70' : 'text-amber-400/80'
          )}>
            {roundLabel}
          </p>
          <span className="text-white/20 text-xs">|</span>
          <p className="text-xs text-white/40">
            {roundMatchProgress} 매치
          </p>
        </div>
        <p className="text-[10px] text-white/30 mb-2">
          {progress.current + 1} / {progress.total} 전체 진행
        </p>
        <div className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full bg-gradient-to-r',
              isExhibitionMode
                ? 'from-white/60 to-white/40'
                : 'from-amber-500/80 to-yellow-400/80'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        {/* Keyboard hint */}
        <p className="text-[9px] text-white/20 mt-2 hidden md:block">
          Keyboard: &larr; / A = left &middot; &rarr; / D = right
        </p>
      </motion.div>

      {/* Match Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* VS Badge - Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <motion.div
            className={cn(
              'w-14 h-14 rounded-full bg-[#0a0a0b] flex items-center justify-center shadow-2xl border-2',
              isExhibitionMode ? 'border-white/30' : 'border-amber-500/60'
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          >
            <span className={cn(
              'font-light text-sm tracking-wider',
              isExhibitionMode ? 'text-white/50' : 'text-amber-400'
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
// Artwork Card
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
      <SelectionOverlay isSelected={isSelected} color="amber" />

      {/* Side Color Indicator */}
      <SideIndicator side={side} />
    </motion.button>
  );
}

// ============================================================================
// Exhibition Card
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
  const venueCity = exhibitionData?.venue_city;
  const status = exhibitionData?.status;
  const imageUrl = participant.image_url || exhibitionData?.image_url;

  const dateRange =
    startDate && endDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : startDate
        ? `${formatDate(startDate)} ~`
        : '';

  const hasImage = !!imageUrl;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex-1 relative overflow-hidden transition-all max-h-[70vh] md:max-h-none min-h-[35vh] md:min-h-0',
        'focus:outline-none',
        !hasImage && 'flex items-center justify-center',
        isDisabled && !isSelected && !isLoser ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      animate={{
        scale: isSelected ? 1.02 : isLoser ? 0.96 : 1,
        opacity: isLoser ? 0.3 : 1,
        filter: hasImage && isLoser ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.3 }}
      whileHover={!isDisabled ? { scale: 1.01, backgroundColor: hasImage ? undefined : 'rgba(255,255,255,0.03)' } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
    >
      {hasImage ? (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Gradient Overlay */}
          <div
            className={cn(
              'absolute inset-0 transition-all duration-300',
              isSelected
                ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/10'
                : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
              !isDisabled && 'hover:from-black/60 hover:via-black/20'
            )}
          />
          {/* Exhibition Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/* Badges row */}
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {venueCity && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-white/80 px-1.5 py-0.5 border border-white/20 rounded-sm backdrop-blur-sm bg-black/30">
                    {venueCity}
                  </span>
                )}
                {status === 'ongoing' && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-green-300/90 px-1.5 py-0.5 border border-green-400/30 rounded-sm backdrop-blur-sm bg-black/30">
                    진행중
                  </span>
                )}
                {category && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-white/60 px-1.5 py-0.5 border border-white/15 rounded-sm backdrop-blur-sm bg-black/30">
                    {category}
                  </span>
                )}
              </div>
              <h3
                className="text-lg md:text-xl font-light mb-1 line-clamp-2 text-white"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {participant.title || '제목 없음'}
              </h3>
              {venueName && (
                <p className="text-white/60 text-sm font-light line-clamp-1">
                  {venueName}
                </p>
              )}
              {dateRange && (
                <p className="text-white/40 text-xs font-light mt-1">
                  {dateRange}
                </p>
              )}
              {participant.description && (
                <p className="text-white/35 text-xs font-light mt-1.5 line-clamp-2 leading-relaxed">
                  {participant.description}
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
              'absolute inset-0 transition-all duration-300',
              isSelected
                ? 'bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent'
                : 'bg-gradient-to-br from-white/[0.02] to-transparent'
            )}
          />
          {/* Exhibition Info - Center */}
          <div className="relative z-10 p-8 max-w-sm text-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/* Badges row */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {venueCity && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-white/60 px-1.5 py-0.5 border border-white/15 rounded-sm">
                    {venueCity}
                  </span>
                )}
                {status === 'ongoing' && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-green-400/70 px-1.5 py-0.5 border border-green-500/20 rounded-sm">
                    진행중
                  </span>
                )}
                {category && (
                  <span className="inline-block text-[9px] uppercase tracking-[0.1em] text-white/40 px-1.5 py-0.5 border border-white/10 rounded-sm">
                    {category}
                  </span>
                )}
              </div>
              <h3
                className="text-xl md:text-2xl font-light mb-3 line-clamp-3 text-white/90 leading-relaxed"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {participant.title || '제목 없음'}
              </h3>
              {venueName && (
                <p className="text-white/50 text-sm font-light mb-1">
                  {venueName}
                </p>
              )}
              {participant.artist && (
                <p className="text-white/40 text-xs font-light mb-2">
                  {participant.artist}
                </p>
              )}
              {dateRange && (
                <p className="text-white/30 text-xs font-light mb-3">
                  {dateRange}
                </p>
              )}
              {participant.description && (
                <p className="text-white/25 text-xs font-light line-clamp-3 leading-relaxed">
                  {participant.description}
                </p>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* Selection Indicator */}
      <SelectionOverlay isSelected={isSelected} color="neutral" />

      {/* Side Color Indicator */}
      <SideIndicator side={side} />
    </motion.button>
  );
}

// ============================================================================
// Shared Sub-components
// ============================================================================

function SelectionOverlay({ isSelected, color }: { isSelected: boolean; color: 'amber' | 'neutral' }) {
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border',
              color === 'amber'
                ? 'bg-amber-500/20 border-amber-400/30'
                : 'bg-white/10 border-white/30'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.span
              className={cn(
                'text-4xl',
                color === 'amber' ? 'text-amber-400' : 'text-white'
              )}
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
  );
}

function SideIndicator({ side }: { side: 'a' | 'b' }) {
  return (
    <div
      className={cn(
        'absolute w-1 transition-all duration-300',
        side === 'a'
          ? 'left-0 top-0 bottom-0 bg-gradient-to-b from-blue-400/60 to-blue-600/60'
          : 'right-0 top-0 bottom-0 bg-gradient-to-b from-red-400/60 to-red-600/60'
      )}
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SessionSummaryProps {
  summary: string;
  moodTags: string[];
  onNewSession: () => void;
  onViewTimeline: () => void;
}

export function SessionSummary({
  summary,
  moodTags,
  onNewSession,
  onViewTimeline,
}: SessionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="px-4 py-6"
    >
      <div
        className={cn(
          'border border-white/10 rounded-lg',
          'bg-white/[0.02] p-6'
        )}
      >
        {/* Header */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-4">
          오늘의 감상
        </p>

        {/* Summary */}
        <p
          className="text-white/70 text-[15px] leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {summary}
        </p>

        {/* Mood tags */}
        {moodTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {moodTags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-block px-2.5 py-1 text-xs',
                  'border border-white/10 rounded-full',
                  'text-white/40'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={onNewSession}
            className={cn(
              'w-full py-2.5 text-sm font-light rounded-lg',
              'border border-white/15 text-white/70',
              'hover:bg-white/[0.06] hover:border-white/25',
              'transition-colors duration-200'
            )}
          >
            새 작품 만나기
          </button>
          <button
            onClick={onViewTimeline}
            className={cn(
              'w-full py-2.5 text-sm font-light rounded-lg',
              'text-white/40',
              'hover:text-white/60',
              'transition-colors duration-200'
            )}
          >
            내 감상 모아보기
          </button>
        </div>
      </div>
    </motion.div>
  );
}

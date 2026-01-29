'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArtCounselorStage } from '@/lib/art-counselor/types';
import { cn } from '@/lib/utils';

const STAGE_ORDER: ArtCounselorStage[] = [
  'opening',
  'exploration',
  'connection',
  'complete',
];

const STAGE_INFO: Record<ArtCounselorStage, { label: string; subtitle: string }> = {
  opening: { label: '만남', subtitle: '작품과의 첫 만남' },
  exploration: { label: '탐색', subtitle: '감정의 깊이로' },
  connection: { label: '연결', subtitle: '나와 작품 사이' },
  complete: { label: '기록', subtitle: '오늘의 감상' },
};

interface ConversationStageProps {
  stage: ArtCounselorStage;
}

export const ConversationStage = memo(function ConversationStage({
  stage,
}: ConversationStageProps) {
  const currentIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div className="border-b border-white/10 bg-white/[0.02] px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-1">
            Art Counselor
          </p>
          <h1 className="text-lg font-light text-white/90 tracking-wide">
            {STAGE_INFO[stage].label}
          </h1>
          <p className="text-xs text-white/40 mt-0.5 font-light">
            {STAGE_INFO[stage].subtitle}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {STAGE_ORDER.map((item, index) => {
            const active = item === stage;
            const reached = currentIndex > index;
            const isLast = index === STAGE_ORDER.length - 1;

            return (
              <div key={item} className="flex items-center">
                <motion.div
                  animate={{
                    scale: active ? 1 : 0.8,
                    opacity: active || reached ? 1 : 0.3,
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors duration-300',
                    active
                      ? 'bg-white'
                      : reached
                      ? 'bg-white/60'
                      : 'bg-white/20'
                  )}
                />
                {!isLast && (
                  <div
                    className={cn(
                      'w-6 h-px mx-1 transition-colors duration-300',
                      reached ? 'bg-white/40' : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

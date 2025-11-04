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

const STAGE_LABEL: Record<ArtCounselorStage, string> = {
  opening: '시작하기',
  exploration: '깊이 탐색',
  connection: '감정 연결',
  complete: '정리하기',
};

interface ConversationStageProps {
  stage: ArtCounselorStage;
}

export const ConversationStage = memo(function ConversationStage({
  stage,
}: ConversationStageProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 bg-white/4 px-6 py-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3rem] text-white/40">
          Guidance Flow
        </p>
        <h1 className="text-2xl font-semibold text-white">
          {STAGE_LABEL[stage]}
        </h1>
      </div>

      <ol className="flex items-center gap-3 text-xs font-medium text-white/60">
        {STAGE_ORDER.map((item, index) => {
          const active = item === stage;
          const reached =
            STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(item);

          return (
            <li key={item} className="flex items-center">
              <motion.span
                animate={{
                  opacity: active || reached ? 1 : 0.2,
                  scale: active ? 1.05 : 1,
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-[0.7rem]',
                  active
                    ? 'border-white bg-white/90 text-sayu-dark-purple shadow-lg shadow-white/20'
                    : reached
                    ? 'border-white/50 bg-white/10 text-white'
                    : 'border-white/20 bg-white/5 text-white/40'
                )}
              >
                {index + 1}
              </motion.span>
              {index < STAGE_ORDER.length - 1 ? (
                <span className="mx-1 h-px w-8 bg-gradient-to-r from-white/20 via-white/40 to-white/10" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
});

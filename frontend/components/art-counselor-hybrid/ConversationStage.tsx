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
    <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Guidance Flow
        </p>
        <h1 className="text-xl font-medium text-black">
          {STAGE_LABEL[stage]}
        </h1>
      </div>

      <ol className="flex items-center gap-3 text-xs font-medium text-neutral-500">
        {STAGE_ORDER.map((item, index) => {
          const active = item === stage;
          const reached =
            STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(item);

          return (
            <li key={item} className="flex items-center">
              <motion.span
                animate={{
                  opacity: active || reached ? 1 : 0.4,
                  scale: active ? 1.05 : 1,
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center border text-[0.7rem]',
                  active
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : reached
                    ? 'border-neutral-400 bg-neutral-100 text-neutral-700'
                    : 'border-neutral-200 bg-white text-neutral-400'
                )}
              >
                {index + 1}
              </motion.span>
              {index < STAGE_ORDER.length - 1 ? (
                <span className="mx-1 h-px w-8 bg-neutral-200" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
});

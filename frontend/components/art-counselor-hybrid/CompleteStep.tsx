'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, NotebookPen, Navigation } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CompletePayload } from '@/lib/art-counselor/types';

interface CompleteStepProps {
  payload: CompletePayload | null;
  onReset?: () => void;
}

export function CompleteStep({ payload, onReset }: CompleteStepProps) {
  if (!payload) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 py-12">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle2 className="h-8 w-8 text-white/30" />
        </motion.div>
        <p className="text-white/40 text-sm font-light">
          세션 결과를 정리하는 중이에요...
        </p>
      </div>
    );
  }

  const emotionalKeywords = payload.emotionalKeywords ?? [];
  const recommendedActions = payload.recommendedActions ?? [];

  return (
    <div className="flex h-full flex-col space-y-4 px-5 py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 bg-white/[0.03] p-5 rounded-sm"
      >
        <h3 className="flex items-center gap-2 text-sm font-light text-white/80">
          <CheckCircle2 className="h-4 w-4 text-white/40" />
          오늘의 요약
        </h3>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-sm font-light text-white/70">
          {payload.summary}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/10 bg-white/[0.02] p-5 rounded-sm"
      >
        <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <NotebookPen className="h-3.5 w-3.5" />
          Journal Prompt
        </h4>
        <p className="mt-2.5 text-sm leading-relaxed text-white/70 font-light">
          {payload.journalPrompt}
        </p>
        {emotionalKeywords.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {emotionalKeywords.map((keyword) => (
              <span
                key={keyword}
                className="border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-widest text-white/50 rounded-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </motion.div>

      {recommendedActions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {recommendedActions.map((action, index) => {
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-sm font-light transition-all rounded-sm',
                  'border border-white/10 bg-white/[0.03] text-white/70',
                  'hover:bg-white/[0.06] hover:border-white/15 hover:text-white/90'
                )}
              >
                <span>{action.label}</span>
                <Navigation className="h-3.5 w-3.5 text-white/30" />
              </motion.div>
            );

            return action.href ? (
              <Link key={action.id} href={action.href}>
                {content}
              </Link>
            ) : (
              <button
                key={action.id}
                type="button"
                className="w-full text-left"
                onClick={onReset}
              >
                {content}
              </button>
            );
          })}
        </motion.div>
      ) : null}
    </div>
  );
}

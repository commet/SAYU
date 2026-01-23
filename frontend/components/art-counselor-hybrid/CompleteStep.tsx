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
      <div className="flex h-full flex-col items-center justify-center space-y-4 text-neutral-500">
        <CheckCircle2 className="h-10 w-10 text-neutral-400" />
        <p>세션 결과를 정리하는 중이에요...</p>
      </div>
    );
  }

  const emotionalKeywords = payload.emotionalKeywords ?? [];
  const recommendedActions = payload.recommendedActions ?? [];

  return (
    <div className="flex h-full flex-col space-y-6 px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-neutral-200 bg-white p-5 text-sm text-neutral-700"
      >
        <h3 className="flex items-center gap-2 text-base font-medium text-black">
          <CheckCircle2 className="h-5 w-5 text-neutral-400" />
          오늘의 요약
        </h3>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          {payload.summary}
        </p>
      </motion.div>

      <div className="border border-neutral-200 bg-neutral-50 p-5">
        <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
          <NotebookPen className="h-4 w-4" />
          Journal Prompt
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-neutral-900">
          {payload.journalPrompt}
        </p>
        {emotionalKeywords.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {emotionalKeywords.map((keyword) => (
              <span
                key={keyword}
                className="border border-neutral-200 bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-neutral-500"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {recommendedActions.length > 0 ? (
        <div className="space-y-3">
          {recommendedActions.map((action) => {
            const content = (
              <div
                className={cn(
                  'flex w-full items-center justify-between border border-neutral-200 px-4 py-3 text-sm text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-50',
                  'bg-white'
                )}
              >
                <span>{action.label}</span>
                <Navigation className="h-4 w-4 text-neutral-400" />
              </div>
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
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Feather, Compass } from 'lucide-react';
import { ArtworkSummary, CompletePayload } from '@/lib/art-counselor/types';

const STAGE_LABEL: Record<string, string> = {
  opening: '만남',
  exploration: '탐색',
  connection: '연결',
  complete: '기록',
};

interface SessionInsightsPanelProps {
  artwork: ArtworkSummary | null;
  personality?: string | null;
  stage: string;
  journalPayload: CompletePayload | null;
  onOpenJournal?: () => void;
}

export function SessionInsightsPanel({
  artwork,
  personality,
  stage,
  journalPayload,
  onOpenJournal,
}: SessionInsightsPanelProps) {
  const readableStage = STAGE_LABEL[stage] ?? stage;

  return (
    <div className="flex h-full flex-col justify-between p-6">
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            Session Overview
          </p>
          <h2 className="mt-2 text-lg font-light text-white/90 tracking-wide">
            {artwork?.title ?? '작품 탐색'}
          </h2>
          <p className="text-xs text-white/40 font-light">
            {artwork?.artist}
            {artwork?.year ? ` · ${artwork.year}` : null}
          </p>
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-white/[0.03] p-4 rounded-sm"
        >
          <div className="mb-1 flex items-center gap-2 text-white/70 text-xs">
            <Heart className="h-3.5 w-3.5 text-white/40" />
            {personality ?? 'APT 미지정'}
          </div>
          <p className="text-xs text-white/50 font-light leading-relaxed">
            현재 단계{' '}
            <span className="text-white/80">
              {readableStage}
            </span>
          </p>
        </motion.div>

        <div className="space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 border border-white/10 bg-white/[0.02] p-3 rounded-sm"
          >
            <Clock className="mt-0.5 h-3.5 w-3.5 text-white/30" />
            <div>
              <p className="text-xs font-light text-white/70">느린 호흡</p>
              <p className="text-[11px] text-white/40 font-light mt-0.5">
                필요하면 언제든 속도를 조절하거나 잠시 쉬어가도 괜찮아요.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-start gap-3 border border-white/10 bg-white/[0.02] p-3 rounded-sm"
          >
            <Feather className="mt-0.5 h-3.5 w-3.5 text-white/30" />
            <div>
              <p className="text-xs font-light text-white/70">기록 축적</p>
              <p className="text-[11px] text-white/40 font-light mt-0.5">
                감정의 작은 메모 하나가 당신만의 저널을 채워갑니다.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {journalPayload ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          type="button"
          onClick={onOpenJournal}
          className="inline-flex items-center justify-between border border-white/20 bg-white/10 px-4 py-3 text-sm font-light text-white/90 transition-all hover:bg-white/15 rounded-sm"
        >
          저널에서 이어보기
          <Compass className="h-4 w-4 text-white/50" />
        </motion.button>
      ) : null}
    </div>
  );
}

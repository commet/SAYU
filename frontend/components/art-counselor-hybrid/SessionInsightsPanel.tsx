'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Feather, Compass } from 'lucide-react';
import { ArtworkSummary, CompletePayload } from '@/lib/art-counselor/types';

const STAGE_LABEL: Record<string, string> = {
  opening: '시작 단계',
  exploration: '탐색 단계',
  connection: '감정 연결',
  complete: '정리 완료',
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
    <div className="flex h-full flex-col justify-between p-6 text-neutral-900">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Session Overview
          </p>
          <h2 className="mt-2 text-xl font-medium text-black">
            {artwork?.title ?? '작품 탐색'}
          </h2>
          <p className="text-sm text-neutral-500">
            {artwork?.artist}
            {artwork?.year ? ` · ${artwork.year}` : null}
          </p>
        </div>

        <motion.div
          layout
          className="border border-neutral-200 bg-white p-4 text-xs text-neutral-600"
        >
          <div className="mb-1 flex items-center gap-2 text-black">
            <Heart className="h-4 w-4 text-neutral-400" />
            {personality ?? 'APT 미지정'}
          </div>
          <p className="leading-relaxed">
            현재 단계{' '}
            <strong className="text-black">
              {readableStage}
            </strong>
          </p>
        </motion.div>

        <div className="space-y-3 text-xs text-neutral-600">
          <div className="flex items-start gap-3 border border-neutral-200 bg-white p-3">
            <Clock className="mt-0.5 h-4 w-4 text-neutral-400" />
            <div>
              <p className="font-medium text-black">느린 호흡</p>
              <p>필요하면 언제든 속도를 조절하거나 잠시 쉬어가도 괜찮아요.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-neutral-200 bg-white p-3">
            <Feather className="mt-0.5 h-4 w-4 text-neutral-400" />
            <div>
              <p className="font-medium text-black">기록 축적</p>
              <p>감정의 작은 메모 하나가 당신만의 저널을 채워갑니다.</p>
            </div>
          </div>
        </div>
      </div>

      {journalPayload ? (
        <button
          type="button"
          onClick={onOpenJournal}
          className="inline-flex items-center justify-between border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          저널에서 이어보기
          <Compass className="h-4 w-4 text-neutral-300" />
        </button>
      ) : null}
    </div>
  );
}

'use client';

/**
 * VisitProgressHeader Component
 * 관람 진행 상태 표시 헤더
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText } from 'lucide-react';
import { formatElapsedTime, getElapsedText } from '@/lib/stores/visit-store';
import EndVisitButton from './EndVisitButton';
import type { VisitProgressHeaderProps } from '@sayu/shared/exhibition-recording-types';

export default function VisitProgressHeader({
  visit,
  elapsedSeconds,
  recordCount,
  onEndVisit,
}: VisitProgressHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 진행 상태 */}
          <div className="flex items-center gap-6">
            {/* 타이머 */}
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-neutral-600" />
              <div>
                <p className="text-xs text-neutral-500">관람 시간</p>
                <p className="text-lg font-medium text-neutral-900 font-mono">
                  {formatElapsedTime(elapsedSeconds)}
                </p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-px h-10 bg-neutral-200" />

            {/* 기록 개수 */}
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-neutral-600" />
              <div>
                <p className="text-xs text-neutral-500">기록한 작품</p>
                <p className="text-lg font-medium text-neutral-900">
                  {recordCount}개
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 종료 버튼 */}
          <EndVisitButton visitId={visit.id} onEnded={onEndVisit} />
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{getElapsedText(elapsedSeconds)}</span>
            <span>{recordCount}개 기록됨</span>
          </div>
          <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((recordCount / 10) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-black"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

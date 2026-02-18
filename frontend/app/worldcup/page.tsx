'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { WorldcupContainer } from '@/components/worldcup';
import type { WorldcupMode } from '@sayu/shared/exhibition-worldcup-types';

function WorldcupPageContent() {
  const searchParams = useSearchParams();
  const exhibitionVisitId = searchParams?.get('visitId') || undefined;
  const exhibitionId = searchParams?.get('exhibitionId') || undefined;
  const modeParam = searchParams?.get('mode');
  const initialMode =
    modeParam === 'exhibition' || modeParam === 'artwork'
      ? (modeParam as WorldcupMode)
      : undefined;

  return (
    <WorldcupContainer
      exhibitionVisitId={exhibitionVisitId}
      exhibitionId={exhibitionId}
      initialMode={initialMode}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0b]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-amber-400/60 mx-auto mb-4"
        />
        <p className="text-white/40 text-sm font-light">로딩 중...</p>
      </div>
    </div>
  );
}

export default function WorldcupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorldcupPageContent />
    </Suspense>
  );
}

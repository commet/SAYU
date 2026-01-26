'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorldcupContainer } from '@/components/worldcup';

function WorldcupPlayContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'all'; // 'my' | 'all'
  const exhibitionVisitId = searchParams.get('visitId') || undefined;
  const exhibitionId = searchParams.get('exhibitionId') || undefined;

  return (
    <WorldcupContainer
      mode={mode as 'my' | 'all'}
      exhibitionVisitId={exhibitionVisitId}
      exhibitionId={exhibitionId}
    />
  );
}

export default function WorldcupPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-900 border-t-transparent mx-auto" />
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <WorldcupPlayContent />
    </Suspense>
  );
}

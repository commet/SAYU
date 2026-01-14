'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorldcupContainer } from '@/components/worldcup';

function WorldcupPageContent() {
  const searchParams = useSearchParams();
  const exhibitionVisitId = searchParams.get('visitId') || undefined;
  const exhibitionId = searchParams.get('exhibitionId') || undefined;

  return (
    <WorldcupContainer
      exhibitionVisitId={exhibitionVisitId}
      exhibitionId={exhibitionId}
    />
  );
}

export default function WorldcupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-white">로딩 중...</div>
        </div>
      }
    >
      <WorldcupPageContent />
    </Suspense>
  );
}

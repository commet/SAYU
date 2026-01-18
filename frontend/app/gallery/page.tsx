import { Suspense } from 'react';
import { getCachedGalleryStats } from '@/lib/supabase/gallery.server';
import GalleryClient from '@/components/gallery/GalleryClient';

// Server Component - 데이터 프리로딩
async function GalleryWithData() {
  // 서버에서 초기 데이터 로드 (React.cache로 중복 제거)
  let initialStats = { artworks: 0, exhibitions: 0, collections: 0 };

  try {
    initialStats = await getCachedGalleryStats();
  } catch (error) {
    // 비로그인 상태 또는 에러 시 기본값 사용
    console.error('Failed to prefetch gallery stats:', error);
  }

  return <GalleryClient initialStats={initialStats} />;
}

// Loading UI
function GalleryLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
        <p className="text-neutral-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryWithData />
    </Suspense>
  );
}

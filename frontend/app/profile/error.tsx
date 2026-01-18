'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, UserX } from 'lucide-react';
import Link from 'next/link';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Profile error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX className="w-10 h-10 text-neutral-400" />
        </div>

        <h2 className="text-2xl font-light text-black mb-2">
          Profile Error
        </h2>
        <p className="text-neutral-500 mb-8 text-sm">
          {error.message || '프로필을 불러오는 중 문제가 발생했습니다.'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium hover:border-neutral-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

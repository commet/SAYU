'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TimelineCard } from '@/components/art-counselor/TimelineCard';
import { cn } from '@/lib/utils';
import type { TimelineItem } from '@/lib/art-counselor/types';

const PAGE_SIZE = 20;

export default function ArtCounselorTimelinePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/art-counselor/timeline');
    }
  }, [authLoading, user, router]);

  // Fetch initial data
  const fetchTimeline = useCallback(
    async (offset = 0, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(
          `/api/art-counselor/timeline?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (res.ok) {
          const data = await res.json();
          if (append) {
            setSessions((prev) => [...prev, ...data.sessions]);
          } else {
            setSessions(data.sessions);
          }
          setTotal(data.total);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading && user) {
      fetchTimeline();
    }
  }, [authLoading, user, fetchTimeline]);

  const handleLoadMore = useCallback(() => {
    fetchTimeline(sessions.length, true);
  }, [sessions.length, fetchTimeline]);

  const hasMore = sessions.length < total;

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0b]/90 backdrop-blur-sm border-b border-white/[0.04]">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => router.push('/art-counselor')}
              className="p-1.5 -ml-1.5 text-white/40 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1
                className="text-lg text-white/80 font-light"
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                }}
              >
                나의 감상
              </h1>
              <p className="text-[11px] text-white/30 mt-0.5">
                작품과 나눈 대화의 기록
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {sessions.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center px-6 pt-32"
          >
            <p
              className="text-white/50 text-center text-base leading-relaxed mb-8"
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
              }}
            >
              아직 기록된 감상이 없어요.
              <br />
              작품과의 첫 대화를 시작해볼까요?
            </p>
            <button
              onClick={() => router.push('/art-counselor')}
              className={cn(
                'px-6 py-2.5 text-sm font-light',
                'border border-white/15 rounded-sm text-white/60',
                'hover:bg-white/[0.06] hover:border-white/25',
                'transition-colors duration-200'
              )}
            >
              첫 작품 만나기
            </button>
          </motion.div>
        ) : (
          /* Timeline list */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {sessions.map((item) => (
              <TimelineCard key={item.id} item={item} />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="px-4 py-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={cn(
                    'px-6 py-2 text-sm font-light',
                    'text-white/40 hover:text-white/60',
                    'disabled:opacity-30',
                    'transition-colors'
                  )}
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '더 보기'
                  )}
                </button>
              </div>
            )}

            {/* New session CTA at bottom */}
            <div className="px-4 py-8 flex justify-center border-t border-white/[0.04]">
              <button
                onClick={() => router.push('/art-counselor')}
                className={cn(
                  'px-6 py-2.5 text-sm font-light',
                  'border border-white/15 rounded-sm text-white/60',
                  'hover:bg-white/[0.06] hover:border-white/25',
                  'transition-colors duration-200'
                )}
              >
                새 작품 만나기
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

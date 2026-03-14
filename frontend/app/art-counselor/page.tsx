'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ArtworkReveal } from '@/components/art-counselor/ArtworkReveal';
import { cn } from '@/lib/utils';
import type { CounselorArtwork } from '@/lib/art-counselor/types';

const EXCLUDE_IDS_KEY = 'sayu_counselor_exclude_ids';

function getExcludeIds(): string[] {
  try {
    const raw = localStorage.getItem(EXCLUDE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addExcludeId(id: string) {
  try {
    const ids = getExcludeIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(EXCLUDE_IDS_KEY, JSON.stringify(ids.slice(-50)));
    }
  } catch {}
}

function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(60,50,40,0.04) 0%, transparent 60%)',
        }}
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function ArtCounselorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [artwork, setArtwork] = useState<CounselorArtwork | null>(null);
  const [loadingArtwork, setLoadingArtwork] = useState(false);
  const [ready, setReady] = useState(false);

  const aptType = user?.personalityType || user?.aptType || null;

  // Determine readiness after auth resolves
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setReady(true);
      return;
    }
    if (!aptType) {
      router.replace('/quiz?redirect=/art-counselor');
      return;
    }
    setReady(true);
  }, [authLoading, user, aptType, router]);

  // Fetch artwork when user is ready
  const fetchArtwork = useCallback(async () => {
    if (!aptType) return;
    setLoadingArtwork(true);
    try {
      const excludeIds = getExcludeIds();
      const res = await fetch('/api/art-counselor/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aptType, excludeIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.artwork) {
          setArtwork(data.artwork);
          addExcludeId(data.artwork.id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingArtwork(false);
    }
  }, [aptType]);

  useEffect(() => {
    if (ready && user && aptType) {
      fetchArtwork();
    }
  }, [ready, user, aptType, fetchArtwork]);

  const handleStart = useCallback(() => {
    if (!artwork) return;
    router.push(`/art-counselor/session/${artwork.id}`);
  }, [artwork, router]);

  const handleLogin = () =>
    router.push('/login?redirect=/art-counselor');

  // Auth loading
  if (authLoading || !ready) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Top label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 text-white/25 text-[11px] uppercase tracking-[0.3em]"
        >
          Art Counselor
        </motion.p>

        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* No user: welcome screen */}
            {!user && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-4"
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                  }}
                >
                  예술 작품과 함께
                  <br />
                  마음을 들여다보는 시간
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/45 text-sm font-light mb-12 leading-relaxed"
                >
                  AI 큐레이터가 당신의 감정에 맞는 작품을 추천하고,
                  <br />
                  그 작품과 함께 짧은 대화를 나눕니다.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3"
                >
                  <button
                    onClick={handleLogin}
                    className={cn(
                      'w-full max-w-xs mx-auto block',
                      'px-6 py-3 bg-white text-neutral-900',
                      'text-sm font-medium rounded-sm',
                      'hover:bg-white/90 transition-colors'
                    )}
                  >
                    로그인하고 시작하기
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* User with artwork */}
            {user && (
              <motion.div
                key="artwork"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ArtworkReveal
                  artwork={artwork}
                  loading={loadingArtwork}
                  onStart={handleStart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useArtCounselorSession } from '@/hooks/useArtCounselorSession';
import { ChatInterface } from '@/components/art-counselor/ChatInterface';
import { cn } from '@/lib/utils';

export default function ArtCounselorSessionPage() {
  const params = useParams<{ artworkId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const artworkId = params?.artworkId ?? '';

  const {
    stage,
    messages,
    options,
    isStreaming,
    streamingContent,
    artwork,
    summary,
    moodTags,
    error,
    initSession,
    sendMessage,
    reset,
  } = useArtCounselorSession();

  const aptType = user?.personalityType || user?.aptType || 'LAEF';

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/art-counselor');
      return;
    }
    if (!user.personalityType && !user.aptType) {
      router.replace('/quiz?redirect=/art-counselor');
    }
  }, [authLoading, user, router]);

  // Init session on mount
  useEffect(() => {
    if (authLoading || !user || !artworkId) return;
    reset();
    initSession(aptType);

    return () => {
      reset();
    };
    // Only run on mount and when artworkId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId, authLoading]);

  const handleSendMessage = useCallback(
    (content: string, optionId?: string) => {
      sendMessage(content, optionId);
    },
    [sendMessage]
  );

  const handleNewSession = useCallback(() => {
    reset();
    router.push('/art-counselor');
  }, [reset, router]);

  const handleViewTimeline = useCallback(() => {
    router.push('/art-counselor/timeline');
  }, [router]);

  const handleBack = useCallback(() => {
    reset();
    router.push('/art-counselor');
  }, [reset, router]);

  // Loading state
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  // Error state
  if (error && !artwork) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col items-center justify-center px-6">
        <p
          className="text-white/60 text-lg mb-6 text-center"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          잠시 문제가 생겼어요
        </p>
        <p className="text-white/35 text-sm mb-8 text-center">{error}</p>
        <button
          onClick={handleBack}
          className={cn(
            'px-6 py-2.5 text-sm font-light',
            'border border-white/15 rounded-sm text-white/60',
            'hover:bg-white/[0.06] transition-colors'
          )}
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col md:flex-row">
      {/* ---- Left / Top: Artwork panel ---- */}
      <div
        className={cn(
          // Mobile: compact sticky header
          'relative shrink-0',
          'h-[22vh] md:h-full',
          'md:w-[40%] lg:w-[42%]',
          'border-b md:border-b-0 md:border-r border-white/[0.06]'
        )}
      >
        {artwork ? (
          <>
            {/* Back button */}
            <button
              onClick={handleBack}
              className={cn(
                'absolute top-3 left-3 z-20',
                'p-2 rounded-full',
                'bg-black/40 backdrop-blur-sm',
                'text-white/50 hover:text-white/80',
                'transition-colors'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Artwork image */}
            <div className="relative w-full h-full">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-contain p-4 md:p-8"
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
              />

              {/* Title overlay on mobile */}
              <div className="absolute bottom-0 inset-x-0 md:hidden bg-gradient-to-t from-[#0a0a0b] to-transparent pt-8 pb-2 px-4">
                <h2
                  className="text-sm text-white/70 font-light truncate"
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                  }}
                >
                  {artwork.title}
                </h2>
                <p className="text-[11px] text-white/35 truncate">
                  {artwork.artist}
                </p>
              </div>
            </div>

            {/* Title below image on desktop */}
            <div className="hidden md:block absolute bottom-6 inset-x-0 text-center px-6">
              <h2
                className="text-base text-white/70 font-light"
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                }}
              >
                {artwork.title}
              </h2>
              <p className="text-xs text-white/35 mt-1">
                {artwork.artist}
                {artwork.year && ` \u00B7 ${artwork.year}`}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-white/20" />
          </div>
        )}
      </div>

      {/* ---- Right / Bottom: Chat panel ---- */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Stage indicator */}
        <div className="shrink-0 px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            {(['opening', 'exploring', 'connecting'] as const).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors duration-500',
                      stage === s || getStageIndex(stage) > i
                        ? 'bg-white/50'
                        : 'bg-white/10'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-widest transition-colors duration-500',
                      stage === s ? 'text-white/40' : 'text-white/15'
                    )}
                  >
                    {s === 'opening'
                      ? '만남'
                      : s === 'exploring'
                        ? '탐색'
                        : '연결'}
                  </span>
                </div>
              )
            )}
            {stage === 'complete' && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                  마무리
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            stage={stage}
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            options={options}
            summary={summary}
            moodTags={moodTags}
            onSendMessage={handleSendMessage}
            onNewSession={handleNewSession}
            onViewTimeline={handleViewTimeline}
          />
        </div>
      </div>
    </div>
  );
}

function getStageIndex(stage: string): number {
  const order = ['opening', 'exploring', 'connecting', 'complete'];
  return order.indexOf(stage);
}

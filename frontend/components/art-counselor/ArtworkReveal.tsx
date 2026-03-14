'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CounselorArtwork } from '@/lib/art-counselor/types';

interface ArtworkRevealProps {
  artwork: CounselorArtwork | null;
  loading: boolean;
  onStart: () => void;
}

export function ArtworkReveal({ artwork, loading, onStart }: ArtworkRevealProps) {
  if (loading || !artwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-full max-w-sm aspect-[3/4] rounded bg-white/[0.03]" />
          <div className="h-4 w-48 rounded bg-white/[0.04]" />
          <div className="h-3 w-32 rounded bg-white/[0.03]" />
        </motion.div>
        <div className="mt-8 flex items-center gap-2 text-white/30 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>작품을 고르고 있어요</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      {/* Artwork image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>
      </motion.div>

      {/* Title and artist */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 text-center"
      >
        <h2
          className="text-lg text-white/80 font-light"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {artwork.title}
        </h2>
        <p className="mt-1.5 text-sm text-white/40">
          {artwork.artist}
          {artwork.year && ` \u00B7 ${artwork.year}`}
        </p>
      </motion.div>

      {/* CTA button */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        onClick={onStart}
        className={cn(
          'mt-10 px-8 py-3 text-sm font-light',
          'border border-white/20 rounded-sm text-white/80',
          'hover:bg-white/[0.06] hover:border-white/30',
          'transition-colors duration-300'
        )}
      >
        이 작품과 대화 나누기
      </motion.button>
    </motion.div>
  );
}

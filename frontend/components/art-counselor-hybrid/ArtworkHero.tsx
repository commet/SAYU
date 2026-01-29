'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ArtworkSummary } from '@/lib/art-counselor/types';

interface ArtworkHeroProps {
  artwork: ArtworkSummary | null;
  personality?: string | null;
}

export function ArtworkHero({ artwork, personality }: ArtworkHeroProps) {
  if (!artwork) {
    return (
      <div className="flex flex-col justify-center space-y-4 p-8 text-white/50">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 rounded-full bg-white/10 mx-auto"
        />
        <p className="text-sm text-center font-light">
          작품을 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Artwork Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-sm"
      >
        <div className="relative aspect-[3/4] w-full">
          {artwork.imageUrl ? (
            <>
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {/* Subtle vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-white/5">
              <Sparkles className="h-12 w-12 text-white/20" />
            </div>
          )}
        </div>

        {/* Artwork Info Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute inset-x-0 bottom-0 p-5"
        >
          <h2 className="text-lg font-light text-white tracking-wide">
            {artwork.title}
          </h2>
          <p className="text-sm text-white/60 mt-1 font-light">
            {artwork.artist}
            {artwork.year ? ` · ${artwork.year}` : null}
          </p>
        </motion.div>
      </motion.div>

      {/* Session Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between px-1"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            APT Mode
          </p>
          <p className="text-sm text-white/70 font-light mt-0.5">
            {personality ?? '미지정'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
          <Sparkles className="h-3 w-3" />
          Session
        </div>
      </motion.div>

      {/* Mood Keywords */}
      {artwork.moodKeywords && artwork.moodKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-2 px-1"
        >
          {artwork.moodKeywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-white/40 uppercase tracking-wider"
            >
              {keyword}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}

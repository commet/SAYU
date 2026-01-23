'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Palette } from 'lucide-react';
import { ArtworkSummary } from '@/lib/art-counselor/types';
import { cn } from '@/lib/utils';

interface ArtworkHeroProps {
  artwork: ArtworkSummary | null;
  personality?: string | null;
}

export function ArtworkHero({ artwork, personality }: ArtworkHeroProps) {
  if (!artwork) {
    return (
      <div className="flex h-full flex-col justify-center space-y-4 bg-neutral-50 p-8 text-neutral-500">
        <p className="font-medium">작품 정보를 불러오는 중이에요...</p>
        <p className="text-sm text-neutral-400">
          잠시 후 오늘의 작품과 이야기가 준비됩니다.
        </p>
      </div>
    );
  }

  const accent =
    artwork.moodKeywords?.[0] ??
    artwork.medium ??
    (personality ? `${personality} 모드` : 'SAYU Session');

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-neutral-200 bg-neutral-100">
        {artwork.imageUrl ? (
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            priority
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-400">
            <Palette className="h-12 w-12" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-black/0 p-6 text-white"
        >
          <p className="text-xs uppercase tracking-widest text-white/70">
            {accent}
          </p>
          <h2 className="mt-1 text-xl font-medium">{artwork.title}</h2>
          <p className="text-sm text-white/70">
            {artwork.artist}
            {artwork.year ? `, ${artwork.year}` : null}
          </p>
        </motion.div>
      </div>

      <div className="border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              현재 APT 모드
            </p>
            <p className="text-lg font-medium text-black">
              {personality ?? '미지정'}
            </p>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700',
              'bg-white'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            세션 준비 완료
          </div>
        </div>
      </div>
    </div>
  );
}

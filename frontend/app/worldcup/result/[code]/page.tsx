'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Crown,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { WorldcupRanking, WorldcupSession } from '@sayu/shared/exhibition-worldcup-types';

interface ShareResult {
  session: WorldcupSession;
  winner: WorldcupRanking;
  rankings: WorldcupRanking[];
}

// Ambient Background Component
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(180,140,100,0.03) 0%, transparent 60%)',
        }}
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function SharedResultPage() {
  const params = useParams();
  const code = params.code as string;

  const [result, setResult] = useState<ShareResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/worldcup/share?code=${code}`);
        const data = await response.json();

        if (data.success && data.data) {
          setResult({
            session: data.data.session,
            winner: data.data.winner,
            rankings: data.data.rankings,
          });
        } else {
          setError(data.error || '결과를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('결과를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    if (code) {
      fetchResult();
    }
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <AmbientBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-amber-400/60 mx-auto mb-4"
            />
            <p className="text-white/40 text-sm font-light">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen relative">
        <AmbientBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <AlertCircle className="w-12 h-12 text-red-400/60 mb-4" />
          <h1 className="text-lg font-light text-white/80 mb-2">결과를 찾을 수 없습니다</h1>
          <p className="text-white/40 text-sm mb-6 font-light">{error}</p>
          <Link
            href="/worldcup"
            className={cn(
              "px-6 py-3 rounded-sm text-sm font-light transition-all",
              "bg-gradient-to-r from-amber-500/80 to-yellow-500/80 text-white",
              "hover:from-amber-500 hover:to-yellow-500"
            )}
          >
            나도 해보기
          </Link>
        </div>
      </div>
    );
  }

  const { winner, rankings } = result;

  return (
    <div className="min-h-screen relative">
      <AmbientBackground />

      {/* Floating Sparkles */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${20 + Math.random() * 40}%`,
              left: `${15 + Math.random() * 70}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="text-amber-400/30 w-4 h-4" />
          </motion.div>
        ))}
      </motion.div>

      <div className="relative z-20 p-6">
        <div className="max-w-lg mx-auto">
          {/* Result Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f0f10] rounded-sm overflow-hidden border border-white/10"
          >
            {/* Winner Header */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 p-6 text-center border-b border-amber-500/20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-3"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-600/30 flex items-center justify-center border border-amber-400/40">
                  <Crown className="w-7 h-7 text-amber-400" />
                </div>
              </motion.div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/60 mb-1">
                Shared Result
              </p>
              <h1
                className="text-lg font-light text-white/90"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                전시 월드컵 결과
              </h1>
            </div>

            {/* Winner Artwork */}
            {winner && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/60">최애 작품</span>
                </div>
                <div className="aspect-square rounded-sm overflow-hidden mb-4 border border-white/10">
                  <img
                    src={winner.image_url || '/images/placeholder-artwork.png'}
                    alt={winner.title || '우승 작품'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2
                  className="text-lg font-light text-center text-white/90 mb-1"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {winner.title || '제목 없음'}
                </h2>
                <p className="text-white/40 text-sm text-center font-light">
                  {winner.artist || '작가 미상'}
                </p>
              </motion.div>
            )}

            {/* Rankings */}
            {rankings.length > 1 && (
              <motion.div
                className="px-6 pb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
                  최종 순위
                </p>
                <div className="space-y-2">
                  {rankings.slice(1, 4).map((ranking, index) => (
                    <motion.div
                      key={ranking.participant_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-sm"
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-light',
                          ranking.rank === 2
                            ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30'
                            : 'bg-amber-700/20 text-amber-300/80 border border-amber-700/30'
                        )}
                      >
                        {ranking.rank}
                      </div>
                      {ranking.image_url && (
                        <img
                          src={ranking.image_url}
                          alt={ranking.title || ''}
                          className="w-10 h-10 rounded-sm object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-light truncate text-sm text-white/70">
                          {ranking.title || '제목 없음'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Watermark */}
            <div className="px-6 pb-4 text-center">
              <p className="text-[10px] text-white/20 tracking-wider">SAYU Exhibition Worldcup</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/worldcup"
              className={cn(
                "w-full py-4 rounded-sm font-light text-sm transition-all",
                "bg-gradient-to-r from-amber-500/80 to-yellow-500/80 text-white",
                "hover:from-amber-500 hover:to-yellow-500",
                "flex items-center justify-center gap-2"
              )}
            >
              나도 해보기
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

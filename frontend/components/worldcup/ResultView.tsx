'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorldcupParticipant, WorldcupRanking } from '@sayu/shared/exhibition-worldcup-types';

interface ResultViewProps {
  sessionId: string;
  winner: WorldcupParticipant;
  onRestart: () => void;
}

export function ResultView({ sessionId, winner, onRestart }: ResultViewProps) {
  const [rankings, setRankings] = useState<WorldcupRanking[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionResponse = await fetch(`/api/worldcup/sessions/${sessionId}`);
        const sessionData = await sessionResponse.json();

        if (sessionData.success && sessionData.data?.participants) {
          const rankedParticipants = sessionData.data.participants
            .filter((p: any) => p.final_rank)
            .sort((a: any, b: any) => a.final_rank - b.final_rank)
            .map((p: any) => ({
              rank: p.final_rank,
              participant_id: p.id,
              title: p.title,
              artist: p.artist,
              image_url: p.image_url || p.temp_image_url,
              source_type: p.source_type,
              wins: p.wins,
              total_matches: p.total_matches,
            }));

          setRankings(rankedParticipants);
        }

        const shareResponse = await fetch('/api/worldcup/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            share_type: 'link',
          }),
        });

        const shareData = await shareResponse.json();
        if (shareData.success && shareData.data?.share_url) {
          setShareUrl(shareData.data.share_url);
        }
      } catch (error) {
        console.error('Failed to fetch result data:', error);
      }
    }

    fetchData();
  }, [sessionId]);

  const handleDownloadImage = useCallback(async () => {
    if (!resultCardRef.current) return;

    setIsGeneratingImage(true);

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0b',
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worldcup-result-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  const handleCopyUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: '전시 월드컵 결과',
      text: `나의 최애 작품은 "${winner.title || '작품'}"! 당신의 최애는?`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled
      }
    } else {
      handleCopyUrl();
    }
  }, [shareUrl, winner.title, handleCopyUrl]);

  const winnerImageUrl =
    winner.image_url ||
    winner.temp_image_url ||
    '/images/placeholder-artwork.png';

  return (
    <div className="min-h-screen p-6">
      {/* Floating Sparkles */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${15 + Math.random() * 50}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className={`text-amber-400/40 w-${4 + Math.floor(Math.random() * 4)} h-${4 + Math.floor(Math.random() * 4)}`} />
          </motion.div>
        ))}
      </motion.div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Result Card */}
        <motion.div
          ref={resultCardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0f10] rounded-sm overflow-hidden border border-white/10"
        >
          {/* Winner Header */}
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 p-6 text-center border-b border-amber-500/20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="mb-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-600/30 flex items-center justify-center border border-amber-400/40">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-400/60 mb-1"
            >
              My Favorite
            </motion.p>
            <motion.h1
              className="text-xl font-light text-white/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              나의 최애 작품
            </motion.h1>
          </div>

          {/* Winner Artwork */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="aspect-square rounded-sm overflow-hidden mb-4 border border-white/10">
              <img
                src={winnerImageUrl}
                alt={winner.title || '우승 작품'}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
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

          {/* Rankings */}
          {rankings.length > 1 && (
            <motion.div
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
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
                    transition={{ delay: 1 + index * 0.1 }}
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
                        crossOrigin="anonymous"
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

        {/* Action Buttons */}
        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {/* Download Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className={cn(
              "w-full py-4 rounded-sm font-light text-sm transition-all",
              "bg-gradient-to-r from-amber-500/80 to-yellow-500/80 text-white",
              "hover:from-amber-500 hover:to-yellow-500",
              "flex items-center justify-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />
            {isGeneratingImage ? '이미지 생성 중...' : '결과 이미지 저장'}
          </button>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className={cn(
                "flex-1 py-4 rounded-sm font-light text-sm transition-all",
                "bg-white/[0.05] border border-white/10 text-white/70",
                "hover:bg-white/[0.08] hover:text-white/90",
                "flex items-center justify-center gap-2"
              )}
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
            <button
              onClick={handleCopyUrl}
              disabled={!shareUrl}
              className={cn(
                "flex-1 py-4 rounded-sm font-light text-sm transition-all",
                "bg-white/[0.05] border border-white/10 text-white/70",
                "hover:bg-white/[0.08] hover:text-white/90",
                "flex items-center justify-center gap-2",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  링크 복사
                </>
              )}
            </button>
          </div>

          {/* Restart */}
          <button
            onClick={onRestart}
            className={cn(
              "w-full py-4 rounded-sm font-light text-sm transition-all",
              "border border-white/10 text-white/50",
              "hover:bg-white/[0.03] hover:text-white/70",
              "flex items-center justify-center gap-2"
            )}
          >
            <RotateCcw className="w-4 h-4" />
            새 월드컵 시작
          </button>
        </motion.div>
      </div>
    </div>
  );
}

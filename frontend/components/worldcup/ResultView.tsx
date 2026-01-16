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

  // 랭킹 및 공유 URL 가져오기
  useEffect(() => {
    async function fetchData() {
      try {
        // 세션 데이터 조회
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

        // 공유 URL 생성
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

  // 결과 이미지 생성 및 다운로드
  const handleDownloadImage = useCallback(async () => {
    if (!resultCardRef.current) return;

    setIsGeneratingImage(true);

    try {
      // html2canvas 동적 import
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        backgroundColor: '#111827',
        useCORS: true,
      });

      // Blob으로 변환
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

  // URL 복사
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

  // 공유 (Web Share API)
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
        // 사용자가 취소한 경우 무시
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
      {/* 축하 효과 */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Sparkles className="absolute top-20 left-10 text-yellow-400 w-8 h-8 animate-pulse" />
        <Sparkles className="absolute top-40 right-20 text-yellow-400 w-6 h-6 animate-pulse delay-300" />
        <Sparkles className="absolute top-60 left-1/4 text-yellow-400 w-4 h-4 animate-pulse delay-500" />
      </motion.div>

      <div className="max-w-lg mx-auto">
        {/* 결과 카드 (캡처 대상) */}
        <div
          ref={resultCardRef}
          className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* 우승 헤더 */}
          <div className="bg-gradient-to-r from-yellow-600 to-amber-500 p-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-100" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              나의 최애 작품
            </motion.h1>
          </div>

          {/* 우승 작품 */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
              <img
                src={winnerImageUrl}
                alt={winner.title || '우승 작품'}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h2 className="text-xl font-bold text-center mb-1">
              {winner.title || '제목 없음'}
            </h2>
            <p className="text-gray-400 text-center">
              {winner.artist || '작가 미상'}
            </p>
          </motion.div>

          {/* 순위 */}
          {rankings.length > 1 && (
            <motion.div
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-sm text-gray-400 mb-3">최종 순위</h3>
              <div className="space-y-2">
                {rankings.slice(1, 4).map((ranking, index) => (
                  <div
                    key={ranking.participant_id}
                    className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg"
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
                        ranking.rank === 2
                          ? 'bg-gray-400 text-gray-900'
                          : 'bg-amber-700 text-amber-100'
                      )}
                    >
                      {ranking.rank}
                    </div>
                    {ranking.image_url && (
                      <img
                        src={ranking.image_url}
                        alt={ranking.title || ''}
                        className="w-10 h-10 rounded object-cover"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">
                        {ranking.title || '제목 없음'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 워터마크 */}
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-gray-500">SAYU 전시 월드컵</p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {/* 이미지 저장 */}
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isGeneratingImage ? '이미지 생성 중...' : '결과 이미지 저장'}
          </button>

          {/* 공유 */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              공유하기
            </button>
            <button
              onClick={handleCopyUrl}
              disabled={!shareUrl}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isCopied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  링크 복사
                </>
              )}
            </button>
          </div>

          {/* 다시하기 */}
          <button
            onClick={onRestart}
            className="w-full py-4 border border-gray-700 hover:bg-gray-800 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            새 월드컵 시작
          </button>
        </motion.div>
      </div>
    </div>
  );
}

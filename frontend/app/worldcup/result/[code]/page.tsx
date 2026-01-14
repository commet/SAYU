'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { WorldcupRanking, WorldcupSession } from '@/shared/exhibition-worldcup-types';

interface ShareResult {
  session: WorldcupSession;
  winner: WorldcupRanking;
  rankings: WorldcupRanking[];
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-xl font-bold mb-2">결과를 찾을 수 없습니다</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link
          href="/worldcup"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
        >
          나도 해보기
        </Link>
      </div>
    );
  }

  const { winner, rankings } = result;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        {/* 결과 카드 */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* 우승 헤더 */}
          <div className="bg-gradient-to-r from-yellow-600 to-amber-500 p-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-100" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">전시 월드컵 결과</h1>
          </div>

          {/* 우승 작품 */}
          {winner && (
            <motion.div
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center mb-4">
                <span className="text-yellow-500 text-sm font-medium">최애 작품</span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                <img
                  src={winner.image_url || '/images/placeholder-artwork.png'}
                  alt={winner.title || '우승 작품'}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-center mb-1">
                {winner.title || '제목 없음'}
              </h2>
              <p className="text-gray-400 text-center">
                {winner.artist || '작가 미상'}
              </p>
            </motion.div>
          )}

          {/* 순위 */}
          {rankings.length > 1 && (
            <motion.div
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm text-gray-400 mb-3">최종 순위</h3>
              <div className="space-y-2">
                {rankings.slice(1, 4).map((ranking) => (
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

        {/* CTA */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/worldcup"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            나도 해보기
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

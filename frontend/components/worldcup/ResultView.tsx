'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Crown,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorldcupStore } from '@/lib/stores/worldcup-store';
import type {
  WorldcupParticipant,
  WorldcupRanking,
  WorldcupMode,
} from '@sayu/shared/exhibition-worldcup-types';
import {
  inferGenresFromKeywords,
  APT_GENRE_PREFERENCES,
} from '@sayu/shared/apt-exhibition-matching';

interface ResultViewProps {
  sessionId: string;
  winner: WorldcupParticipant;
  mode: WorldcupMode;
  onRestart: () => void;
}

interface APTAnalysisResult {
  aptCode: string;
  aptLabel: string;
  scores: { axis: string; label: string; value: number }[];
}

const APT_LABELS: Record<string, string> = {
  LAEF: '고독한 감성 탐험가',
  LAEC: '조용한 추상 분석가',
  LAMF: '내면의 의미 추구자',
  LAMC: '심오한 체계 탐구자',
  LREF: '감성적 사실주의자',
  LREC: '고전적 관찰자',
  LRMF: '자유로운 현대 관찰자',
  LRMC: '전통적 미학 연구자',
  SAEF: '열정적 표현주의자',
  SAEC: '소셜 설치 애호가',
  SAMF: '거리예술 활동가',
  SAMC: '문화 큐레이터',
  SREF: '트렌디 아트 러버',
  SREC: '인상주의 감상가',
  SRMF: '클래식 문화 탐험가',
  SRMC: '전통 미학 수호자',
};

function analyzeExhibitionPreferences(
  chosen: WorldcupParticipant[],
  allParticipants: WorldcupParticipant[]
): APTAnalysisResult {
  // 선택된 전시의 키워드에서 장르 추론
  const chosenKeywords = chosen.flatMap((p) => {
    const words: string[] = [];
    if (p.title) words.push(...p.title.split(/[\s,/]+/));
    if (p.description) words.push(...p.description.split(/[\s,/]+/).slice(0, 10));
    const ex = (p as any)._exhibition;
    if (ex?.tags) words.push(...ex.tags);
    if (ex?.category) words.push(ex.category);
    return words;
  });

  const chosenGenres = inferGenresFromKeywords(chosenKeywords);

  // 각 APT 유형과의 매칭 점수 계산
  let bestApt = 'LAEF';
  let bestScore = -1;

  const aptScores: Record<string, number> = {};

  for (const [aptCode, prefs] of Object.entries(APT_GENRE_PREFERENCES)) {
    let score = 0;
    for (const genre of chosenGenres) {
      if (prefs.preferred.includes(genre)) score += 3;
      else if (prefs.compatible.includes(genre)) score += 2;
      else if (prefs.neutral.includes(genre)) score += 1;
    }
    aptScores[aptCode] = score;
    if (score > bestScore) {
      bestScore = score;
      bestApt = aptCode;
    }
  }

  // 4축 점수 계산
  const axisScores = [
    {
      axis: 'L/S',
      label: bestApt[0] === 'L' ? '혼자 (Lone)' : '함께 (Social)',
      value: bestApt[0] === 'L' ? 70 : 30,
    },
    {
      axis: 'A/R',
      label: bestApt[1] === 'A' ? '추상 (Abstract)' : '구상 (Realistic)',
      value: bestApt[1] === 'A' ? 70 : 30,
    },
    {
      axis: 'E/M',
      label: bestApt[2] === 'E' ? '감성 (Emotional)' : '의미 (Meaning)',
      value: bestApt[2] === 'E' ? 70 : 30,
    },
    {
      axis: 'F/C',
      label: bestApt[3] === 'F' ? '자유 (Free)' : '체계 (Curated)',
      value: bestApt[3] === 'F' ? 70 : 30,
    },
  ];

  return {
    aptCode: bestApt,
    aptLabel: APT_LABELS[bestApt] || bestApt,
    scores: axisScores,
  };
}

export function ResultView({ sessionId, winner, mode, onRestart }: ResultViewProps) {
  const { participants } = useWorldcupStore();
  const [rankings, setRankings] = useState<WorldcupRanking[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aptAnalysis, setAptAnalysis] = useState<APTAnalysisResult | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const isExhibitionMode = mode === 'exhibition';

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

  // APT 분석 (exhibition 모드만)
  useEffect(() => {
    if (!isExhibitionMode || participants.length === 0) return;

    // 승자 포함 선택된 참가자들 = wins > 0
    const chosen = participants.filter((p) => p.wins > 0);
    const analysis = analyzeExhibitionPreferences(chosen, participants);
    setAptAnalysis(analysis);
  }, [isExhibitionMode, participants]);

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
    const titleText = isExhibitionMode ? '전시 월드컵 결과' : '작품 월드컵 결과';
    const bodyText = isExhibitionMode
      ? `나의 이상형 전시는 "${winner.title || '전시'}"! 당신의 이상형 전시는?`
      : `나의 최애 작품은 "${winner.title || '작품'}"! 당신의 최애는?`;

    const shareData = {
      title: titleText,
      text: bodyText,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      handleCopyUrl();
    }
  }, [shareUrl, winner.title, handleCopyUrl, isExhibitionMode]);

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
            <Sparkles className={cn(
              'w-5 h-5',
              isExhibitionMode ? 'text-violet-400/40' : 'text-amber-400/40'
            )} />
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
          <div className={cn(
            'p-6 text-center border-b',
            isExhibitionMode
              ? 'bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-violet-500/20 border-violet-500/20'
              : 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-amber-500/20'
          )}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="mb-3"
            >
              <div className={cn(
                'w-16 h-16 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center border',
                isExhibitionMode
                  ? 'from-violet-400/30 to-indigo-600/30 border-violet-400/40'
                  : 'from-amber-400/30 to-yellow-600/30 border-amber-400/40'
              )}>
                {isExhibitionMode ? (
                  <MapPin className="w-8 h-8 text-violet-400" />
                ) : (
                  <Crown className="w-8 h-8 text-amber-400" />
                )}
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={cn(
                'text-[10px] uppercase tracking-[0.3em] mb-1',
                isExhibitionMode ? 'text-violet-400/60' : 'text-amber-400/60'
              )}
            >
              {isExhibitionMode ? 'My Ideal Exhibition' : 'My Favorite'}
            </motion.p>
            <motion.h1
              className="text-xl font-light text-white/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              {isExhibitionMode ? '나의 이상형 전시' : '나의 최애 작품'}
            </motion.h1>
          </div>

          {/* Winner Content */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {isExhibitionMode ? (
              // Exhibition mode: text-based winner display
              <div className="text-center mb-4 py-4">
                <h2
                  className="text-2xl font-light text-white/90 mb-3 leading-relaxed"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {winner.title || '제목 없음'}
                </h2>
                {winner.artist && (
                  <p className="text-white/50 text-sm font-light mb-2">
                    {winner.artist}
                  </p>
                )}
                {winner.description && (
                  <p className="text-white/30 text-xs font-light max-w-xs mx-auto leading-relaxed">
                    {winner.description}
                  </p>
                )}
              </div>
            ) : (
              // Artwork mode: image-based winner display
              <>
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
              </>
            )}
          </motion.div>

          {/* APT Analysis (exhibition mode only) */}
          {isExhibitionMode && aptAnalysis && (
            <motion.div
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="border border-violet-500/20 rounded-sm p-5 bg-violet-500/[0.03]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400/60 mb-3">
                  당신의 전시 취향 분석
                </p>
                <p
                  className="text-lg font-light text-white/90 mb-1"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {aptAnalysis.aptLabel}
                </p>
                <p className="text-violet-400/80 text-sm font-light mb-4">
                  {aptAnalysis.aptCode}
                </p>
                <div className="space-y-2">
                  {aptAnalysis.scores.map((score) => (
                    <div key={score.axis} className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30 w-8 shrink-0">{score.axis}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500/80 to-indigo-400/80 rounded-full"
                          style={{ width: `${score.value}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 w-24 text-right shrink-0">
                        {score.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Rankings */}
          {rankings.length > 1 && (
            <motion.div
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
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
                    transition={{ delay: 1.1 + index * 0.1 }}
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
                    {!isExhibitionMode && ranking.image_url && (
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
            <p className="text-[10px] text-white/20 tracking-wider">
              {isExhibitionMode ? 'SAYU Exhibition Worldcup' : 'SAYU Artwork Worldcup'}
            </p>
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
              "text-white flex items-center justify-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isExhibitionMode
                ? "bg-gradient-to-r from-violet-500/80 to-indigo-500/80 hover:from-violet-500 hover:to-indigo-500"
                : "bg-gradient-to-r from-amber-500/80 to-yellow-500/80 hover:from-amber-500 hover:to-yellow-500"
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

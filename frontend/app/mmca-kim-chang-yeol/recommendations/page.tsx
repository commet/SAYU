'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Heart, Info } from 'lucide-react';
import { MMCA_ARTWORKS, MMCA_ARTISTS, getArtworkById, getArtistById } from '@/data/mmca-tour-data';
import { SAYUTypeCode } from '@/shared/SAYUTypeDefinitions';
import { useAuth } from '@/hooks/useAuth';

// APT 유형 선택지 (팀원들 위한 간단한 선택)
const APT_OPTIONS = [
  { code: 'LAEF', label: '명상적 추상', emoji: '🌊' },
  { code: 'LAEC', label: '체계적 추상', emoji: '🎨' },
  { code: 'LAMF', label: '철학적 탐구', emoji: '🤔' },
  { code: 'LAMC', label: '분석적 사고', emoji: '🧠' },
  { code: 'LREF', label: '서정적 감성', emoji: '🍃' },
  { code: 'LREC', label: '섬세한 관찰', emoji: '👁️' },
  { code: 'LRMF', label: '혁신적 탐구', emoji: '🚀' },
  { code: 'LRMC', label: '학구적 연구', emoji: '📚' },
  { code: 'SAEF', label: '열정적 표현', emoji: '🔥' },
  { code: 'SAEC', label: '조화로운 연결', emoji: '🤝' },
  { code: 'SAMF', label: '영감을 주는', emoji: '💡' },
  { code: 'SAMC', label: '통합적 기획', emoji: '🎯' },
  { code: 'SREF', label: '따뜻한 공감', emoji: '☀️' },
  { code: 'SREC', label: '포용적 안내', emoji: '🫂' },
  { code: 'SRMF', label: '교육적 멘토', emoji: '👨‍🏫' },
  { code: 'SRMC', label: '전문적 체계', emoji: '📊' }
];

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<SAYUTypeCode | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  useEffect(() => {
    // 로그인한 사용자의 personality_type 가져오기
    if (user?.personality_type) {
      setSelectedType(user.personality_type as SAYUTypeCode);
    }
  }, [user]);

  useEffect(() => {
    if (selectedType) {
      // 선택된 유형에 맞는 작품 필터링
      const filtered = MMCA_ARTWORKS.filter(artwork => {
        return artwork.aptRecommendations && artwork.aptRecommendations[selectedType];
      }).map(artwork => ({
        ...artwork,
        reason: artwork.aptRecommendations?.[selectedType] || '당신을 위한 특별한 작품입니다.'
      }));

      setRecommendedArtworks(filtered);
    }
  }, [selectedType]);

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">나를 위한 추천 작품</h1>
                <p className="text-sm text-gray-400">Art Persona를 선택하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">당신의 Art Persona는?</h2>
            <p className="text-sm text-gray-400">
              퀴즈를 완료하셨다면 자동으로 적용됩니다. 아니면 직접 선택해주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {APT_OPTIONS.map((option) => (
              <motion.button
                key={option.code}
                onClick={() => setSelectedType(option.code as SAYUTypeCode)}
                className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-xs font-bold text-white mb-1">{option.code}</div>
                <div className="text-xs text-gray-400">{option.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedType(null)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">당신을 위한 추천 작품</h1>
              <p className="text-sm text-gray-400">
                {APT_OPTIONS.find(o => o.code === selectedType)?.label} ({selectedType})
              </p>
            </div>
            <div className="text-2xl">
              {APT_OPTIONS.find(o => o.code === selectedType)?.emoji}
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Special Intro Message */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
          >
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">당신을 위한 특별한 여정</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedType === 'LAEF' && '🦊 밤에 자유롭게 숲을 헤매는 여우처럼, 동선에 얽매이지 말고 편하게 둘러보세요. 마음이 끌리는 물방울 앞에 서 있으면 될 것 같아요.'}
                  {selectedType === 'LREC' && '🐢 서두르지 않으셔도 괜찮아요. 작품 하나하나 앞에서 시간을 두고 서 있어보세요. 그 시간이 김창열의 50년과 공명할 거예요.'}
                  {selectedType === 'LRMC' && '🐢 깊이 있게 사유하며 천천히 의미를 탐구해보시는 건 어떨까요? 혼자만의 시간에 작품을 음미하시면 좋을 것 같아요.'}
                  {selectedType === 'SRMC' && '🦅 팀원들과 함께 역사적 맥락 속에서 작품을 이해하고 이야기 나눠보면 재미있을 거예요. 김창열 예술의 변화 과정을 함께 따라가보세요.'}
                  {!['LAEF', 'LREC', 'LRMC', 'SRMC'].includes(selectedType) && '각 작품에 담긴 작가의 철학과 감정을 느껴보시면 좋을 것 같아요.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {recommendedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">추천 작품이 아직 준비되지 않았습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedArtwork(artwork)}
                className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all"
              >
                {/* Artwork Image */}
                <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="p-2 bg-purple-500/90 backdrop-blur-sm rounded-full">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Artwork Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {artwork.year} · {artwork.room}
                  </p>

                  {/* Recommendation Reason */}
                  <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Heart className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-300 leading-relaxed">
                      {artwork.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Team Common Recommendations */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              팀 전체 꼭 함께 봐야 할 것들
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-2">1. 8전시실 '무슈 구뜨, 김창열' 아카이브</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  작가가 '무슈 구뜨(Monsieur Gouttes·물방울 씨)'로 불렸대요.
                  작가의 삶과 예술의 또 다른 면모를 볼 수 있는 별도 공간이니 꼭 들러보세요.
                </p>
              </div>
              <div className="p-4 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-2">2. 작가 육성 영상</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  작가의 삶과 예술 여정을 그의 목소리로 직접 들을 수 있어요.
                  영화 '물방울을 그리는 남자'의 축약본이니 시간 내서 보시면 좋을 것 같아요.
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <h4 className="font-bold text-amber-300 mb-2">💬 관람 후 함께 이야기 나눠요</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• 김창열에게 물방울은 무엇이었을까요? 전쟁의 상처? 치유? 생명?</li>
                  <li>• 각자 가장 인상 깊었던 작품과 그 이유는 무엇인가요?</li>
                  <li>• 앵포르멜에서 물방울까지의 변화 과정에서 무엇을 느끼셨나요?</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArtwork(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-700"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-950">
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedArtwork.title}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    {selectedArtwork.year} · {selectedArtwork.room}
                  </p>

                  {/* Recommendation */}
                  <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-purple-300">추천 이유</span>
                    </div>
                    <p className="text-sm text-purple-200 leading-relaxed">
                      {selectedArtwork.reason}
                    </p>
                  </div>

                  {/* Description */}
                  {selectedArtwork.description && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-white">작품 설명</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedArtwork.description}
                      </p>
                    </div>
                  )}

                  {/* Viewing Questions */}
                  {selectedArtwork.viewingQuestions && selectedArtwork.viewingQuestions.length > 0 && (
                    <div className="mb-6">
                      <div className="font-bold text-white mb-3">감상 포인트</div>
                      <ul className="space-y-2">
                        {selectedArtwork.viewingQuestions.map((q: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span className="text-sm text-gray-300">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

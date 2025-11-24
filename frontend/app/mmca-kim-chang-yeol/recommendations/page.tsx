'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Heart, Info, Trophy } from 'lucide-react';
import { MMCA_ARTWORKS } from '@/data/mmca-tour-data';
import { SAYUTypeCode } from '@/shared/SAYUTypeDefinitions';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

type Artwork = (typeof MMCA_ARTWORKS)[number] & { reason?: string };

const APT_OPTIONS = [
  { code: 'LAEF', label: '몽환적 방랑자', emoji: '🦊' },
  { code: 'LAEC', label: '감성 큐레이터', emoji: '🐱' },
  { code: 'LAMF', label: '직관적 탐구자', emoji: '🦉' },
  { code: 'LAMC', label: '철학적 수집가', emoji: '🐢' },
  { code: 'LREF', label: '고독한 관찰자', emoji: '🦎' },
  { code: 'LREC', label: '섬세한 감정가', emoji: '🦔' },
  { code: 'LRMF', label: '디지털 탐험가', emoji: '🐙' },
  { code: 'LRMC', label: '학구적 연구자', emoji: '🦫' },
  { code: 'SAEF', label: '감성 나눔이', emoji: '🦋' },
  { code: 'SAEC', label: '예술 네트워커', emoji: '🐧' },
  { code: 'SAMF', label: '영감 전도사', emoji: '🦜' },
  { code: 'SAMC', label: '문화 기획자', emoji: '🦌' },
  { code: 'SREF', label: '열정적 관람자', emoji: '🐕' },
  { code: 'SREC', label: '따뜻한 안내자', emoji: '🦆' },
  { code: 'SRMF', label: '지식 멘토', emoji: '🐘' },
  { code: 'SRMC', label: '체계적 교육자', emoji: '🦅' },
] as const;

const introMessages: Partial<Record<SAYUTypeCode | 'default', string>> = {
  LAEF: '여우처럼 자유롭게 동선에 얽매이지 말고, 노란·대형 물방울 앞에서 직관적으로 몰입해 보세요. 시(詩)를 물방울로 번역한 작품도 놓치지 마세요.',
  LREC: '서두르지 말고 작품마다 오래 머물러 보세요. 극사실 물방울과 천자문 대형작에서 섬세한 감정과 체계를 함께 느낄 수 있습니다.',
  LRMC: '거북이처럼 천천히 변화를 추적하세요. 점액질 같은 현상 연작 → 초기 물방울 → 천자문 회귀까지 의미의 정제 과정을 따라가 보세요.',
  SRMC: '독수리 시선으로 큰 흐름을 팀과 함께 보세요. 앵포르멜 → 뉴욕 전환 → 첫 물방울 → 회귀까지 서사를 토론해보세요.',
  default: '각 작품에 담긴 김창열의 상처, 치유, 사유의 흐름을 느껴보세요.',
};

const curatedReasons: Partial<Record<SAYUTypeCode, Record<string, string>>> = {
  LREC: {
    'sangheun-01': '1950년대 전쟁 직후의 구상 작업으로, 상처를 구체적 형상에 담아낸 순간입니다.',
    'moolbangul-01': '1970년대 극사실 물방울의 정점. 촉촉한 질감과 감정을 섬세하게 느껴보세요.',
    'hoegwi-01': '천자문과 물방울이 만나는 회귀작. 체계와 감정이 만나는 지점을 음미해보세요.',
  },
  SRMC: {
    'sangheun-01': '한국 앵포르멜의 역사적 맥락을 팀과 함께 토론해보세요.',
    'hyunsang-01': '뉴욕·파리 전환기의 실험적 추상. 전환점을 함께 분석해보세요.',
    'moolbangul-01': '초기 물방울의 탄생 배경을 질문해보세요. “왜 물방울인가?”',
  },
  LRMC: {
    'hyunsang-01': '고체에서 액체로 변하는 경계의 순간. 존재론적 전환을 천천히 추적하세요.',
    'moolbangul-01': '끈적한 점액질에서 투명한 물방울로 정제되는 과정 자체가 수행입니다.',
    'hoegwi-01': '언어(천자문)와 이미지(물방울)의 관계를 철학적으로 사유해보세요.',
  },
  LAEF: {
    'moolbangul-02': '노란 바탕의 따뜻한 물방울, 비극 속에서도 놓지 않은 생명력을 직관적으로 느껴보세요.',
    'moolbangul-03': '거대한 물방울 앞에서 몽환적 몰입을 경험해보세요.',
    'il-pleut': '시(詩)를 물방울로 번역한 작품. 빛과 리듬을 자유롭게 느껴보세요.',
  },
};

const EXHIBITION_SECTIONS = [
  {
    id: 'section-1',
    title: '1장. 상흔',
    subtitle: '전쟁과 분단의 상처가 새겨진 초기 구상 작업',
    description:
      '한국전쟁 직후, 총탄 자국과 피 묻은 천처럼 거칠고 무거운 화면에 상처를 새겨 넣은 시기입니다. 전쟁과 월남의 경험이 캔버스에 각인되며, 이후 물방울 모티프가 태동하기 전 감정의 원형을 보여줍니다.',
  },
  {
    id: 'section-2',
    title: '2장. 현상',
    subtitle: '뉴욕·파리 전환기의 추상 실험과 점액질 형상',
    description:
      '앵포르멜 이후 질감을 걷어내며 기하학적 추상으로 옮겨가던 시기입니다. 뉴욕의 소비사회에 대한 이질감, 파리 정착 후 점액질로 변형되는 유기적 형상을 통해 존재의 경계와 변화를 탐구합니다.',
  },
  {
    id: 'section-3',
    title: '3장. 물방울',
    subtitle: '극사실적 물방울에서 수행적 반복으로',
    description:
      '파리 외곽 작업실에서 우연히 발견한 물방울을 극사실적으로 그리기 시작해 50년간 반복합니다. 촉촉한 빛과 그림자가 사실성을 넘어 명상적·치유적 공간을 만드는 시기입니다.',
  },
  {
    id: 'section-4',
    title: '4장. 회귀',
    subtitle: '천자문과 물방울이 만나는 후기 작업',
    description:
      '신문지·한지 위에 문자와 물방울을 결합하며 어린 시절 배운 천자문으로 귀환합니다. 언어(기억)와 이미지(물방울)가 겹쳐지는 지점에서 존재와 시간, 수행의 의미를 묻습니다.',
  },
];

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [selectedType, setSelectedType] = useState<SAYUTypeCode | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPersona = async () => {
      if (user?.personality_type) {
        setSelectedType(user.personality_type as SAYUTypeCode);
        return;
      }
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('personality_type')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          if (data?.personality_type) {
            setSelectedType(data.personality_type as SAYUTypeCode);
          }
        } catch (err) {
          console.error('Failed to load personality_type:', err);
        }
      }
    };
    loadPersona();
  }, [user, supabase]);

  
useEffect(() => {
    if (!selectedType) return;

    
    const filtered = MMCA_ARTWORKS.filter(artwork => {
      return artwork.aptRecommendations && artwork.aptRecommendations[selectedType];
    }).map(artwork => {
      const reason =
        curatedReasons[selectedType]?.[artwork.id] ||
        artwork.aptRecommendations?.[selectedType] ||
        '???? ???? ?????.';
      return { ...artwork, reason };
    });

    const existingIds = new Set(filtered.map(a => a.id));
    const fillers = MMCA_ARTWORKS.filter(a => !existingIds.has(a.id))
      .slice(0, Math.max(0, 3 - filtered.length))
      .map(a => ({ ...a, reason: '?? ????? ?? ?? ???.' }));
const existingIds = new Set(filtered.map(a => a.id));
    const fillers = MMCA_ARTWORKS.filter(a => !existingIds.has(a.id)).slice(0, Math.max(0, 3 - filtered.length));
    setRecommendedArtworks([...filtered, ...fillers]);
  }, [selectedType]);


const introText = useMemo(() => {
    if (!selectedType) return '';
    return introMessages[selectedType] || introMessages.default || '각 작품에 담긴 김창열의 상처, 치유, 사유의 흐름을 느껴보세요.';
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
                  {introText}
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
                    src={encodeURI(artwork.imageUrl)}
                    alt={artwork.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
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

        {/* Exhibition Sections (1~4장) */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-300" />
            전시 구성 (1장~4장)
          </h3>
          {EXHIBITION_SECTIONS.map(section => {
            const isOpen = !!openSections[section.id];
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-blue-700/40 rounded-2xl bg-slate-900/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections(prev => ({ ...prev, [section.id]: !isOpen }))
                  }
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-blue-900/40 transition-colors"
                >
                  <div>
                    <div className="text-sm text-blue-200">{section.title}</div>
                    <div className="text-base font-semibold text-white">{section.subtitle}</div>
                  </div>
                  <div className="text-blue-200 text-sm">{isOpen ? '닫기' : '더보기'}</div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-sm text-gray-200 leading-relaxed"
                    >
                      {section.description}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

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
                  작가가 '무슈 구뜨(Monsieur Gouttes·물방울 씨)'로 불렸던 이야기를 만날 수 있는 별도 공간입니다.
                </p>
              </div>
              <div className="p-4 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-2">2. 작가 육성 영상</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  영화 '물방울을 그리는 남자' 축약본을 통해 작가의 육성과 여정을 들을 수 있습니다.
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <h4 className="font-bold text-amber-300 mb-2">💬 관람 후 함께 이야기 나눠요</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• 김창열에게 물방울은 무엇이었을까요? 전쟁의 상처? 치유? 수행? 존재 증명?</li>
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
                <div className="relative aspect-[4/3] bg-gray-950">
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedArtwork.title}</h3>
                      <p className="text-sm text-gray-400">{selectedArtwork.year} · {selectedArtwork.room}</p>
                    </div>
                    <span className="text-2xl">
                      {APT_OPTIONS.find(o => o.code === selectedType)?.emoji}
                    </span>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-start gap-2">
                    <Heart className="w-5 h-5 text-purple-300 mt-0.5" />
                    <p className="text-sm text-gray-200 leading-relaxed">{selectedArtwork.reason}</p>
                  </div>

                  {selectedArtwork.description && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 flex items-start gap-2">
                      <Info className="w-5 h-5 text-gray-300 mt-0.5" />
                      <p className="text-sm text-gray-200 leading-relaxed">{selectedArtwork.description}</p>
                    </div>
                  )}

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

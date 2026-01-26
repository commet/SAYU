'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import LanguageToggle from '@/components/ui/LanguageToggle';
import {
  Trophy,
  Clock,
  History,
  Sparkles,
  ChevronRight,
  Calendar,
  Lock
} from 'lucide-react';

// Translations
const t = {
  en: {
    badge: 'Exhibition Worldcup',
    title: 'Which exhibition\nleft the deepest impression?',
    subtitle: 'Relive and rank your past exhibition experiences through a fun bracket-style competition.',

    myExhibitions: 'My Exhibition History',
    myExhibitionsDesc: 'Compare exhibitions you\'ve actually visited and discover your true favorites.',
    requiresLogin: 'Requires login',
    visitCount: (n: number) => `${n} exhibitions visited`,

    allExhibitions: 'All Exhibitions',
    allExhibitionsDesc: 'Explore current and upcoming exhibitions. Discover new shows while playing!',
    includesOngoing: 'Ongoing & Upcoming',

    features: [
      { title: '2-3 min', desc: 'Quick bracket format' },
      { title: 'Memory lane', desc: 'Revisit past experiences' },
      { title: 'Share results', desc: 'Show your top picks' },
      { title: 'Recommendations', desc: 'Get personalized suggestions' },
    ],

    startButton: 'Start Worldcup',
    noVisits: 'No exhibition visits yet',
    visitExhibitions: 'Visit some exhibitions first!',
    browseExhibitions: 'Browse Exhibitions',
  },
  ko: {
    badge: '전시 월드컵',
    title: '어떤 전시가\n가장 인상 깊었나요?',
    subtitle: '과거의 전시 경험을 되돌아보며, 토너먼트 방식으로 최애 전시를 찾아보세요.',

    myExhibitions: '내가 본 전시',
    myExhibitionsDesc: '실제로 관람한 전시들을 비교하며 진짜 취향을 발견하세요.',
    requiresLogin: '로그인 필요',
    visitCount: (n: number) => `${n}개 전시 관람`,

    allExhibitions: '모든 전시',
    allExhibitionsDesc: '현재 진행 중이거나 예정된 전시를 탐색하세요. 새로운 전시도 발견할 수 있어요!',
    includesOngoing: '진행중 & 예정',

    features: [
      { title: '2-3분', desc: '빠른 토너먼트 진행' },
      { title: '기억 회상', desc: '과거 경험 되새기기' },
      { title: '결과 공유', desc: '나의 최애 전시 자랑' },
      { title: '맞춤 추천', desc: '취향에 맞는 전시 제안' },
    ],

    startButton: '월드컵 시작',
    noVisits: '아직 관람한 전시가 없어요',
    visitExhibitions: '먼저 전시를 관람해보세요!',
    browseExhibitions: '전시 둘러보기',
  },
};

type WorldcupMode = 'my' | 'all';

export default function WorldcupIntroPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const texts = t[language];

  const [selectedMode, setSelectedMode] = useState<WorldcupMode | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  // Fetch user's exhibition visit count
  useEffect(() => {
    if (user) {
      fetchVisitCount();
    }
  }, [user]);

  const fetchVisitCount = async () => {
    setIsLoadingVisits(true);
    try {
      const response = await fetch('/api/exhibitions/visits/count');
      if (response.ok) {
        const data = await response.json();
        setVisitCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch visit count:', error);
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const handleStart = () => {
    if (!selectedMode) return;

    if (selectedMode === 'my') {
      if (!user) {
        // Redirect to login
        router.push('/auth/login?redirect=/worldcup');
        return;
      }
      router.push('/worldcup/play?mode=my');
    } else {
      router.push('/worldcup/play?mode=all');
    }
  };

  const canStartMy = user && visitCount >= 4;

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Language Toggle */}
      <div className="absolute top-1 right-1 z-50 scale-75">
        <LanguageToggle variant="glass" size="sm" />
      </div>

      {/* Gallery Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/backgrounds/gallery-interior-minimal.jpg")',
            opacity: 0.6
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/60" />
      </div>

      <motion.div
        initial={{ opacity: 0.9, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              {texts.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight whitespace-pre-line">
              {texts.title}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {texts.subtitle}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Exhibitions Mode */}
            <button
              onClick={() => setSelectedMode('my')}
              disabled={!user}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                selectedMode === 'my'
                  ? 'border-neutral-900 bg-neutral-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              } ${!user ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMode === 'my' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  <History className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{texts.myExhibitions}</h3>
                    {!user && <Lock className="w-4 h-4 text-neutral-400" />}
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{texts.myExhibitionsDesc}</p>
                  <div className="flex items-center gap-3 text-xs">
                    {!user ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                        {texts.requiresLogin}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {isLoadingVisits ? '...' : texts.visitCount(visitCount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {selectedMode === 'my' && (
                <motion.div
                  layoutId="modeIndicator"
                  className="absolute top-3 right-3 w-6 h-6 bg-neutral-900 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </button>

            {/* All Exhibitions Mode */}
            <button
              onClick={() => setSelectedMode('all')}
              className={`relative text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                selectedMode === 'all'
                  ? 'border-neutral-900 bg-neutral-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMode === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">{texts.allExhibitions}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{texts.allExhibitionsDesc}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {texts.includesOngoing}
                    </span>
                  </div>
                </div>
              </div>
              {selectedMode === 'all' && (
                <motion.div
                  layoutId="modeIndicator"
                  className="absolute top-3 right-3 w-6 h-6 bg-neutral-900 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {texts.features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 bg-white/80 shadow-sm p-4 flex flex-col gap-1"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center mb-1">
                  {idx === 0 && <Clock className="w-4 h-4" />}
                  {idx === 1 && <History className="w-4 h-4" />}
                  {idx === 2 && <Sparkles className="w-4 h-4" />}
                  {idx === 3 && <Trophy className="w-4 h-4" />}
                </div>
                <p className="font-semibold text-sm text-neutral-900">{feature.title}</p>
                <p className="text-xs text-neutral-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Warning for My Mode with insufficient visits */}
          {selectedMode === 'my' && user && visitCount < 4 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
            >
              <p className="text-amber-800 font-medium mb-2">{texts.noVisits}</p>
              <p className="text-amber-700 text-sm mb-3">{texts.visitExhibitions}</p>
              <Link
                href="/exhibitions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                {texts.browseExhibitions}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Start Button */}
          <div className="text-center space-y-3">
            <button
              onClick={handleStart}
              disabled={!selectedMode || (selectedMode === 'my' && !canStartMy)}
              className={`mx-auto flex items-center justify-center gap-2 px-10 md:px-14 py-4 md:py-5 text-lg font-semibold rounded-xl shadow-md transition-all duration-300 ${
                selectedMode && (selectedMode === 'all' || canStartMy)
                  ? 'bg-neutral-900 text-white hover:bg-[#D4A520] hover:-translate-y-0.5 hover:shadow-xl'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Trophy className="w-6 h-6" />
              {texts.startButton}
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-neutral-500">
              {language === 'ko'
                ? '모드를 선택하고 시작하세요'
                : 'Select a mode and start'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

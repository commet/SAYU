'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Heart,
  X,
  Star,
  Sparkles,
  MapPin,
  Eye,
  Calendar,
  MessageCircle,
  ChevronRight,
  Info,
  Palette
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAnimalByType } from '@/data/personality-animals';
import { Container } from '@/components/design-system/Container';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface UserMatch {
  id: string;
  nickname: string;
  age: number;
  personalityType: string;
  bio: string;
  avatar: string;
  recentExhibitions: Array<{
    title: string;
    museum: string;
    image: string;
    date: string;
  }>;
  favoriteArtists: string[];
  favoriteStyles: string[];
  viewingStyle?: string[]; // 관람 스타일
  stats: {
    exhibitions: number;
    artworks: number;
    distance: number;
  };
  compatibilityScore: number;
}

const mockMatches: UserMatch[] = [
  {
    id: '1',
    nickname: 'sohee.moment',
    age: 28,
    personalityType: 'SAEF',
    bio: '감각적인 순간을 포착하는 것을 좋아해요. 인상주의와 추상표현주의에 빠져있습니다.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&crop=face',
    recentExhibitions: [
      {
        title: '모네: 빛의 순간들',
        museum: '국립중앙박물관',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
        date: '2주 전'
      },
      {
        title: 'Rothko 회고전',
        museum: '리움미술관',
        image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600',
        date: '1개월 전'
      }
    ],
    favoriteArtists: ['Claude Monet', 'Mark Rothko', '이불'],
    favoriteStyles: ['인상주의', '추상표현주의', '현대미술'],
    viewingStyle: ['천천히 감상', '사진 촬영', '감정 중심'],
    stats: {
      exhibitions: 42,
      artworks: 156,
      distance: 3.5
    },
    compatibilityScore: 95
  },
  {
    id: '2',
    nickname: 'woojin.archive',
    age: 32,
    personalityType: 'LREF',
    bio: '색채와 빛의 변화를 관찰하는 걸 좋아합니다. 천천히, 깊게 감상하는 스타일이에요.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=800&fit=crop&crop=face',
    recentExhibitions: [
      {
        title: '터너: 빛과 색채',
        museum: '예술의전당',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
        date: '1주 전'
      },
      {
        title: '김환기 회고전',
        museum: '국립현대미술관',
        image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=600',
        date: '3주 전'
      }
    ],
    favoriteArtists: ['J.M.W. Turner', '김환기', 'Wassily Kandinsky'],
    favoriteStyles: ['낭만주의', '한국 추상미술', '색면추상'],
    viewingStyle: ['오래 머무르기', '색채 관찰', '조용히 사색'],
    stats: {
      exhibitions: 38,
      artworks: 142,
      distance: 8.2
    },
    compatibilityScore: 88
  },
  {
    id: '3',
    nickname: 'minjee.curator',
    age: 25,
    personalityType: 'LAMF',
    bio: '깊이 있는 해석과 맥락을 중요하게 생각해요. 전시의 큐레토리얼 컨셉에 관심이 많습니다.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=face',
    recentExhibitions: [
      {
        title: '현대미술의 흐름',
        museum: 'MMCA 서울',
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600',
        date: '3일 전'
      },
      {
        title: 'James Turrell 개인전',
        museum: '리움미술관',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600',
        date: '2주 전'
      }
    ],
    favoriteArtists: ['Anish Kapoor', 'James Turrell', '서도호'],
    favoriteStyles: ['설치미술', '개념미술', '공간 특정적 작업'],
    viewingStyle: ['작품 기록', '맥락 분석', '큐레이션 연구'],
    stats: {
      exhibitions: 28,
      artworks: 89,
      distance: 15.7
    },
    compatibilityScore: 74
  }
];

const recommendedExhibitions = [
  {
    title: '빛의 예술: 인상주의에서 현대까지',
    museum: '국립현대미술관 서울관',
    image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=800',
    reason: '두 분 모두 빛과 색채에 관심이 많으시네요',
    conversationStarters: [
      '빛이 시간에 따라 어떻게 변하는지 관찰해보세요',
      '좋아하는 시간대의 빛은 언제인가요?',
      '인상주의 작가들의 색채 이론에 대해 이야기 나눠보세요'
    ]
  },
  {
    title: '이불: 숨',
    museum: '리움미술관',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc31?w=800',
    reason: '현대미술과 실험적 표현에 대한 공통 관심사',
    conversationStarters: [
      '작품이 주는 감각적 경험에 대해 이야기해보세요',
      '재료와 형태의 관계를 어떻게 보시나요?',
      '이불의 작업이 한국 현대미술에서 갖는 의미'
    ]
  },
  {
    title: '색채의 교향곡',
    museum: '예술의전당',
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
    reason: '색채 감각이 뛰어난 두 분께 완벽한 전시',
    conversationStarters: [
      '각자가 느끼는 색의 온도 차이를 비교해보세요',
      '음악과 색채의 관계에 대해 토론해보세요',
      '좋아하는 색의 조합과 그 이유'
    ]
  }
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChemistry, setShowChemistry] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [exitOpacity, setExitOpacity] = useState(1);

  const strings = useMemo(
    () => ({
      title: language === 'ko' ? '예술 동행자 찾기' : 'Find Art Companions',
      subtitle: language === 'ko'
        ? '당신과 잘 맞는 예술 동행자를 만나보세요'
        : 'Meet art companions who match your taste',
      noMore: language === 'ko' ? '모든 추천을 확인했어요' : "You've seen all recommendations",
      viewChemistry: language === 'ko' ? '케미스트리 보기' : 'View Chemistry',
      chemistryTitle: language === 'ko' ? '우리의 케미스트리' : 'Our Chemistry',
      compatibility: language === 'ko' ? '궁합' : 'Compatibility',
      perfectFor: language === 'ko' ? '함께 가면 좋을 전시' : 'Perfect exhibitions together',
      talkAbout: language === 'ko' ? '이런 이야기를 나눠보세요' : 'Conversation starters',
      sharedInterests: language === 'ko' ? '공통 관심사' : 'Shared interests',
      recentVisits: language === 'ko' ? '최근 관람' : 'Recent visits',
      favoriteArtists: language === 'ko' ? '좋아하는 작가' : 'Favorite artists',
      bio: language === 'ko' ? '소개' : 'About',
      gateMessage: language === 'ko' ? '이 기능은 회원 전용입니다.' : 'Please sign up to use this feature.'
    }),
    [language]
  );

  const currentMatch = mockMatches[currentIndex];
  const userAnimal = user?.personalityType ? getAnimalByType(user.personalityType) : null;
  const matchAnimal = currentMatch ? getAnimalByType(currentMatch.personalityType) : null;

  // APT 각 글자의 의미
  const getAPTDescription = (type: string) => {
    const descriptions: Record<string, string[]> = {
      S: ['함께', 'Social'],
      L: ['혼자', 'Lone'],
      A: ['추상', 'Abstract'],
      R: ['구상', 'Realistic'],
      E: ['감성', 'Emotional'],
      M: ['의미', 'Meaning'],
      F: ['자유', 'Flow'],
      C: ['체계', 'Constructive']
    };

    return type.split('').map((char) => {
      const desc = descriptions[char];
      return language === 'ko' ? desc?.[0] : desc?.[1];
    }).join(' · ');
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 1000 : -1000);
      setExitOpacity(0);

      // Handle like/pass
      if (info.offset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
        setExitOpacity(1);
      }, 300);
    }
  };

  const handleLike = () => {
    if (!user) return requireAuth({ message: strings.gateMessage });
    console.log('Liked:', currentMatch?.nickname);
    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = () => {
    if (!user) return requireAuth({ message: strings.gateMessage });
    console.log('Passed:', currentMatch?.nickname);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSuperLike = () => {
    if (!user) return requireAuth({ message: strings.gateMessage });
    console.log('Super liked:', currentMatch?.nickname);
    setCurrentIndex(prev => prev + 1);
  };

  if (!currentMatch || currentIndex >= mockMatches.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <Container size="lg" className="pt-24 pb-16">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-4xl">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{strings.noMore}</h2>
            <p className="text-neutral-600">
              {language === 'ko'
                ? '곧 새로운 추천을 준비할게요'
                : 'We\'ll prepare new recommendations soon'}
            </p>
          </div>
        </Container>
        <FeedbackButton pageName="community" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <Container size="lg" className="pt-20 pb-24">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{strings.title}</h1>
              <p className="text-neutral-600 mt-1">{strings.subtitle}</p>
            </div>
            {user && userAnimal && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-200">
                <span className="text-2xl">{userAnimal.emoji}</span>
                <span className="text-sm font-medium text-neutral-700">{user.personalityType}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Sparkles className="w-4 h-4" />
            <span>{currentIndex + 1} / {mockMatches.length}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative h-[calc(100vh-300px)] min-h-[500px] max-h-[700px]">
          <AnimatePresence>
            <motion.div
              key={currentMatch.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: exitOpacity,
                x: exitX,
                y: 0,
                rotate: exitX / 20
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                {/* Left: Profile Image */}
                <div className="relative w-[40%] bg-gradient-to-br from-neutral-200 to-neutral-300">
                  <img
                    src={currentMatch.avatar}
                    alt={currentMatch.nickname}
                    className="w-full h-full object-cover"
                  />

                  {/* Compatibility Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span className="text-sm font-bold text-neutral-900">
                        {currentMatch.compatibilityScore}%
                      </span>
                    </div>
                  </div>

                  {/* APT Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-amber-50/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <span className="text-2xl">{matchAnimal?.emoji}</span>
                      <span className="text-lg font-bold text-neutral-900">
                        {currentMatch.personalityType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 text-center">
                      {getAPTDescription(currentMatch.personalityType)}
                    </p>
                  </div>
                </div>

                {/* Right: Profile Info */}
                <div className="w-[60%] p-5 flex flex-col">
                  {/* Name & Age */}
                  <div className="mb-3">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {currentMatch.nickname}
                      <span className="text-lg text-neutral-500 ml-2">{currentMatch.age}</span>
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {currentMatch.stats.exhibitions}회
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentMatch.stats.distance}km
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-neutral-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3">{currentMatch.bio}</p>
                  </div>

                  {/* Recent Exhibitions */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {strings.recentVisits}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {currentMatch.recentExhibitions.slice(0, 2).map((ex, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                          <img
                            src={ex.image}
                            alt={ex.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-medium line-clamp-1">{ex.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Artists */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
                      <Palette className="w-4 h-4" />
                      {strings.favoriteArtists}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMatch.favoriteArtists.slice(0, 3).map((artist, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Viewing Style */}
                  {currentMatch.viewingStyle && (
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        관람 스타일
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentMatch.viewingStyle.map((style, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Chemistry Button */}
                  <button
                    onClick={() => setShowChemistry(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow mt-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    {strings.viewChemistry}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-red-500 hover:border-red-500 transition-colors"
          >
            <X className="w-7 h-7" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSuperLike}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <Star className="w-7 h-7 fill-current" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <Heart className="w-7 h-7 fill-current" />
          </motion.button>
        </div>

        {/* Swipe Hint */}
        <div className="text-center mt-6 text-sm text-neutral-500">
          카드를 좌우로 스와이프하거나 버튼을 눌러보세요
        </div>
      </Container>

      {/* Chemistry Modal */}
      <AnimatePresence>
        {showChemistry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChemistry(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-900">{strings.chemistryTitle}</h2>
                  <button
                    onClick={() => setShowChemistry(false)}
                    className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Compatibility Score */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{userAnimal?.emoji}</span>
                      <span className="text-xl">+</span>
                      <span className="text-3xl">{matchAnimal?.emoji}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-600">{strings.compatibility}</div>
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                        {currentMatch.compatibilityScore}%
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-700">
                    {userAnimal?.animal_ko}와 {matchAnimal?.animal_ko}의 완벽한 조합!
                    감각적 경험을 중시하는 두 분은 전시에서 깊은 공감대를 형성할 수 있어요.
                  </p>
                </div>

                {/* Recommended Exhibitions */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    {strings.perfectFor}
                  </h3>
                  <div className="space-y-4">
                    {recommendedExhibitions.map((ex, i) => (
                      <div key={i} className="bg-neutral-50 rounded-2xl overflow-hidden">
                        <div className="flex gap-4 p-4">
                          <img
                            src={ex.image}
                            alt={ex.title}
                            className="w-24 h-24 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900">{ex.title}</h4>
                            <p className="text-sm text-neutral-600 mt-1">{ex.museum}</p>
                            <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              {ex.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Starters */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-pink-500" />
                    {strings.talkAbout}
                  </h3>
                  <div className="space-y-3">
                    {recommendedExhibitions[0].conversationStarters.map((starter, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-pink-600">{i + 1}</span>
                        </div>
                        <p className="text-neutral-700">{starter}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Interests */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {strings.sharedInterests}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['인상주의', '현대미술', '색채 이론', '설치미술'].map((interest, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FeedbackButton pageName="community" />
    </div>
  );
}

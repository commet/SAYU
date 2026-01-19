'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  X,
  Star,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackButton from '@/components/feedback/FeedbackButton';

// Translations
const t = {
  en: {
    community: 'Community',
    connectShare: 'Connect & Share',
    subtitle: 'Meet people who share your art taste.',
    profilesLeft: (count: number) => `${count} profiles left`,
    exhibitions: 'Exhibitions',
    artworks: 'Artworks',
    followers: 'Followers',
    match: 'Match',
    noMoreProfiles: 'No more profiles to show',
    checkBackLater: 'Check back later for new art lovers!',
    reviewAgain: 'Start Over',
    recentlyActive: 'Recently active',
    newMember: 'New member',
    verified: 'Verified',
    superLike: 'Super Like',
    swipeHint: 'Swipe to connect',
    swipeLeft: 'Pass',
    swipeRight: 'Like',
    filter: 'Filter',
    gender: 'Gender',
    all: 'All',
    male: 'Male',
    female: 'Female',
    age: 'Age',
    distance: 'Distance',
    anyAge: 'Any',
    nearby: 'Nearby',
    anywhere: 'Anywhere',
  },
  ko: {
    community: 'Community',
    connectShare: 'Connect & Share',
    subtitle: '비슷한 취향의 사람들과 만나보세요.',
    profilesLeft: (count: number) => `${count}명 남음`,
    exhibitions: '전시',
    artworks: '작품',
    followers: '팔로워',
    match: '매치',
    noMoreProfiles: '더 이상 프로필이 없습니다',
    checkBackLater: '나중에 다시 확인해보세요!',
    reviewAgain: '처음부터',
    recentlyActive: '최근 활동',
    newMember: '신규 멤버',
    verified: '인증됨',
    superLike: 'Super Like',
    swipeHint: '스와이프하여 연결하기',
    swipeLeft: '패스',
    swipeRight: '좋아요',
    filter: '필터',
    gender: '성별',
    all: '전체',
    male: '남성',
    female: '여성',
    age: '나이',
    distance: '거리',
    anyAge: '전체',
    nearby: '가까운',
    anywhere: '전체',
  },
};

// Extended mock users with more realistic data
const mockUsersData = [
  {
    id: '1',
    nickname: 'sohee.moment',
    age: 28,
    personalityType: 'SAEF',
    location: 'Seoul, Gangnam',
    bio_en: 'Loves capturing sensory moments. Currently fascinated by Impressionism and Abstract Expressionism. Always hunting for hidden gem galleries.',
    bio_ko: '감각적인 순간을 포착하는 것을 좋아해요. 인상주의와 추상표현주의에 빠져 있고, 숨겨진 갤러리를 찾아다니는 중이에요.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 42, artworks: 156, followers: 128 },
    compatibility: 95,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
  {
    id: '2',
    nickname: 'woojin.archive',
    age: 32,
    personalityType: 'LREF',
    location: 'Seoul, Itaewon',
    bio_en: 'Enjoys observing changes in color and light. A slow, deep appreciator of art. Coffee enthusiast who loves museum cafes.',
    bio_ko: '색과 빛의 변화를 관찰하는 것을 즐겨요. 천천히 깊이 있게 예술을 감상하는 편이에요. 미술관 카페 러버.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 38, artworks: 142, followers: 98 },
    compatibility: 88,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
  {
    id: '3',
    nickname: 'minjee.curator',
    age: 25,
    personalityType: 'LAMF',
    location: 'Seoul, Hongdae',
    bio_en: 'Values deep interpretation and context. Highly interested in curatorial concepts. Dreaming of running my own gallery someday.',
    bio_ko: '깊은 해석과 맥락을 중요시해요. 전시 기획에 큰 관심이 있고, 언젠가 나만의 갤러리를 꿈꾸고 있어요.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 28, artworks: 89, followers: 204 },
    compatibility: 82,
    isVerified: false,
    isActive: true,
    isNew: true,
  },
  {
    id: '4',
    nickname: 'jiwon.lens',
    age: 29,
    personalityType: 'SRMF',
    location: 'Seoul, Seongsu',
    bio_en: 'Photographer by day, art lover by night. Love the intersection of photography and contemporary art. DM for gallery recommendations!',
    bio_ko: '낮에는 사진작가, 밤에는 예술 애호가. 사진과 현대미술의 교차점을 사랑해요. 갤러리 추천은 DM으로!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 67, artworks: 234, followers: 312 },
    compatibility: 91,
    isVerified: true,
    isActive: false,
    isNew: false,
  },
  {
    id: '5',
    nickname: 'yuna.artwalker',
    age: 26,
    personalityType: 'LAEF',
    location: 'Seoul, Samcheong',
    bio_en: 'Weekend gallery hopper. Loves discussing art over wine. Looking for companions to explore new exhibitions together.',
    bio_ko: '주말마다 갤러리 탐방하는 사람. 와인 마시며 예술 이야기 나누는 걸 좋아해요. 전시 같이 볼 동행 찾아요.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 51, artworks: 178, followers: 156 },
    compatibility: 94,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
  {
    id: '6',
    nickname: 'hyunwoo.canvas',
    age: 31,
    personalityType: 'SREC',
    location: 'Seoul, Hannam',
    bio_en: 'Art collector in the making. Fascinated by emerging Korean artists. Let\'s discover the next big thing together.',
    bio_ko: '아트 컬렉터 지망생. 신진 한국 작가들에게 매료되어 있어요. 함께 새로운 아티스트를 발굴해봐요.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 73, artworks: 289, followers: 421 },
    compatibility: 79,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
  {
    id: '7',
    nickname: 'subin.palette',
    age: 24,
    personalityType: 'SAMC',
    location: 'Seoul, Apgujeong',
    bio_en: 'Art student with a passion for color theory. Love both classic masterpieces and bold contemporary works.',
    bio_ko: '색채 이론에 빠진 미대생. 클래식한 명작부터 과감한 현대 작품까지 모두 좋아해요.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 23, artworks: 67, followers: 89 },
    compatibility: 86,
    isVerified: false,
    isActive: true,
    isNew: true,
  },
  {
    id: '8',
    nickname: 'dongwook.frame',
    age: 35,
    personalityType: 'LRMC',
    location: 'Seoul, Jamsil',
    bio_en: 'Architecture meets art. Love spatial installations and immersive experiences. Always looking for art that transforms space.',
    bio_ko: '건축과 예술의 만남. 공간 설치와 몰입형 경험을 좋아해요. 공간을 변화시키는 예술을 찾아다녀요.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 45, artworks: 134, followers: 178 },
    compatibility: 72,
    isVerified: true,
    isActive: false,
    isNew: false,
  },
  {
    id: '9',
    nickname: 'nari.muse',
    age: 27,
    personalityType: 'LAMC',
    location: 'Seoul, Bukchon',
    bio_en: 'Inspired by traditional Korean art. Love finding contemporary artists who honor our heritage. Tea ceremony enthusiast.',
    bio_ko: '한국 전통 미술에서 영감을 받아요. 전통을 현대적으로 해석하는 작가를 찾아다녀요. 다도 애호가.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 36, artworks: 112, followers: 234 },
    compatibility: 89,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
  {
    id: '10',
    nickname: 'taehyung.vision',
    age: 30,
    personalityType: 'SREF',
    location: 'Seoul, Yeouido',
    bio_en: 'Digital art enthusiast. Exploring NFTs and the future of art ownership. Open to discussing tech meets creativity.',
    bio_ko: '디지털 아트 매니아. NFT와 예술 소유의 미래를 탐구 중이에요. 기술과 창의성의 만남을 논해봐요.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 29, artworks: 203, followers: 567 },
    compatibility: 77,
    isVerified: true,
    isActive: true,
    isNew: false,
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { language } = useLanguage();
  const texts = t[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [showSwipeGuide, setShowSwipeGuide] = useState(false);

  // Check if user has seen the swipe guide before
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('community-swipe-guide-seen');
    if (!hasSeenGuide) {
      setShowSwipeGuide(true);
    }
  }, []);

  // Localized mock users
  const localizedUsers = useMemo(() =>
    mockUsersData.map(u => ({
      ...u,
      bio: language === 'ko' ? u.bio_ko : u.bio_en,
    }))
  , [language]);

  const handleSwipe = useCallback((action: 'like' | 'pass' | 'superlike') => {
    // Hide swipe guide after first swipe
    if (showSwipeGuide) {
      setShowSwipeGuide(false);
      localStorage.setItem('community-swipe-guide-seen', 'true');
    }
    const dir = action === 'pass' ? 'left' : 'right';
    setExitDirection(dir);
  }, [showSwipeGuide]);

  const handleExitComplete = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setExitDirection(null);
  }, []);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold) {
      handleSwipe('pass');
    }
  }, [handleSwipe]);

  const activeUser = localizedUsers[currentIndex];
  const remainingCount = localizedUsers.length - currentIndex;

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Header - Matching Gallery style */}
        <header className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-neutral-500 mb-3">{texts.community}</p>
              <h1 className="text-5xl font-light text-black mb-1 tracking-tight">{texts.connectShare}</h1>
              <p className="text-base text-neutral-500 font-light mt-2">{texts.subtitle}</p>
            </div>
            {activeUser && (
              <div className="flex gap-8 pb-2">
                <div className="text-right">
                  <p className="text-2xl font-light text-black tracking-tight">{remainingCount}</p>
                  <p className="text-xs uppercase tracking-wider text-neutral-400">{language === 'ko' ? '남음' : 'Left'}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
          <span className="text-xs uppercase tracking-widest text-neutral-400">{texts.filter}</span>
          <div className="flex items-center gap-2">
            <select className="text-sm bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300">
              <option value="all">{texts.gender}: {texts.all}</option>
              <option value="male">{texts.male}</option>
              <option value="female">{texts.female}</option>
            </select>
            <select className="text-sm bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300">
              <option value="any">{texts.age}: {texts.anyAge}</option>
              <option value="20-25">20-25</option>
              <option value="26-30">26-30</option>
              <option value="31-35">31-35</option>
              <option value="36+">36+</option>
            </select>
            <select className="text-sm bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300">
              <option value="anywhere">{texts.distance}: {texts.anywhere}</option>
              <option value="nearby">{texts.nearby} (5km)</option>
              <option value="10km">10km</option>
              <option value="25km">25km</option>
            </select>
          </div>
        </div>

        {/* Main Content - Centered Card with Side Info */}
        <div className="flex gap-8 lg:gap-12 items-start">
          {/* Left Spacer for centering */}
          <div className="hidden lg:block w-72 flex-shrink-0" />

          {/* Card Section - Centered */}
          <div className="flex-1 flex flex-col items-center">
            <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
              {activeUser && !exitDirection ? (
                <motion.div
                  key={activeUser.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-80 bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-neutral-100"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02 }}
                >
                  {/* Image Section - Shorter */}
                  <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <Image
                    src={activeUser.avatar}
                    alt={activeUser.nickname}
                    fill
                    className="object-cover"
                    draggable={false}
                    priority
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex gap-2">
                      {activeUser.isVerified && (
                        <div className="px-2 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-medium text-neutral-700">{texts.verified}</span>
                        </div>
                      )}
                      {activeUser.isNew && (
                        <div className="px-2 py-1 bg-rose-500 rounded-full">
                          <span className="text-[10px] font-medium text-white">{texts.newMember}</span>
                        </div>
                      )}
                    </div>
                    {activeUser.isActive && (
                      <div className="px-2 py-1 bg-emerald-500 rounded-full flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-medium text-white">{texts.recentlyActive}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white mb-1">
                          {activeUser.nickname.split('.')[0]}, {activeUser.age}
                        </h2>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{activeUser.location}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        <p className="text-xs font-medium text-white">
                          APT: {activeUser.personalityType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section - Compact */}
                <div className="p-4 space-y-3">
                  {/* Bio */}
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
                    {activeUser.bio}
                  </p>

                  {/* Compatibility Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">{texts.match}</span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeUser.compatibility}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-rose-500">{activeUser.compatibility}%</span>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                    <div className="text-center flex-1">
                      <p className="text-base font-semibold text-neutral-800">{activeUser.stats.exhibitions}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">{texts.exhibitions}</p>
                    </div>
                    <div className="h-6 w-px bg-neutral-100" />
                    <div className="text-center flex-1">
                      <p className="text-base font-semibold text-neutral-800">{activeUser.stats.artworks}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">{texts.artworks}</p>
                    </div>
                    <div className="h-6 w-px bg-neutral-100" />
                    <div className="text-center flex-1">
                      <p className="text-base font-semibold text-neutral-800">{activeUser.stats.followers}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">{texts.followers}</p>
                    </div>
                  </div>
                </div>

                {/* Swipe Guide Overlay */}
                <AnimatePresence>
                  {showSwipeGuide && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-3xl"
                      onClick={() => {
                        setShowSwipeGuide(false);
                        localStorage.setItem('community-swipe-guide-seen', 'true');
                      }}
                    >
                      <p className="text-white text-lg font-medium mb-8">{texts.swipeHint}</p>
                      <div className="flex items-center gap-16">
                        {/* Left swipe indicator */}
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          animate={{ x: [-5, -15, -5] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                            <X className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex items-center gap-1 text-white/80">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">{texts.swipeLeft}</span>
                          </div>
                        </motion.div>

                        {/* Right swipe indicator */}
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          animate={{ x: [5, 15, 5] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <div className="w-14 h-14 rounded-full bg-rose-500/80 border-2 border-rose-400 flex items-center justify-center">
                            <Heart className="w-7 h-7 text-white fill-white" />
                          </div>
                          <div className="flex items-center gap-1 text-white/80">
                            <span className="text-sm">{texts.swipeRight}</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </motion.div>
                      </div>
                      <p className="text-white/50 text-xs mt-8">Tap to dismiss</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : activeUser && exitDirection ? (
              <motion.div
                key={`${activeUser.id}-exit`}
                initial={{ x: 0, rotate: 0 }}
                animate={{
                  x: exitDirection === 'right' ? 500 : -500,
                  rotate: exitDirection === 'right' ? 30 : -30,
                  opacity: 0,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-80 bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100"
              >
                <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <Image
                    src={activeUser.avatar}
                    alt={activeUser.nickname}
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-semibold text-white">
                      {activeUser.nickname.split('.')[0]}, {activeUser.age}
                    </h2>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-neutral-600 line-clamp-2">{activeUser.bio}</p>
                </div>
              </motion.div>
            ) : !activeUser ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-8 w-80"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-lg font-light text-neutral-600 mb-2">{texts.noMoreProfiles}</p>
                <p className="text-sm text-neutral-400 mb-6">{texts.checkBackLater}</p>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  {texts.reviewAgain}
                </button>
              </motion.div>
            ) : null}
            </AnimatePresence>

            {/* Action Buttons */}
            {activeUser && !exitDirection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mt-5"
              >
                <button
                  onClick={() => handleSwipe('pass')}
                  className="w-12 h-12 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
                <button
                  onClick={() => handleSwipe('superlike')}
                  className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Star className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleSwipe('like')}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center hover:from-rose-500 hover:to-rose-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Heart className="w-5 h-5 text-white fill-white" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Upcoming Profiles */}
          {activeUser && (
            <div className="hidden lg:block w-72 space-y-4">
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">{language === 'ko' ? '다음 프로필' : 'Coming Up'}</p>
              <div className="space-y-3">
                {localizedUsers.slice(currentIndex + 1, currentIndex + 4).map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-sm"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={user.avatar}
                        alt={user.nickname}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {user.nickname.split('.')[0]}, {user.age}
                      </p>
                      <p className="text-xs text-neutral-400">{user.personalityType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-rose-500">{user.compatibility}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">{language === 'ko' ? '오늘의 활동' : "Today's Activity"}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-xl font-light text-neutral-800">{currentIndex}</p>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">{language === 'ko' ? '확인함' : 'Viewed'}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-xl font-light text-rose-500">{Math.floor(currentIndex * 0.6)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">{language === 'ko' ? '좋아요' : 'Liked'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <FeedbackButton pageName="community" />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass';
import { GlassButton } from '@/components/ui/glass';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock, Palette, Heart, Compass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import '@/styles/emotional-palette.css';
import '@/styles/museum-entrance.css';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface Room {
  name: string;
  icon: string;
  path: string;
  status?: 'locked' | 'available';
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();

  // Sample artists data with images - using SAYU personality types
  const featuredArtists = [
    {
      name: { en: 'Yayoi Kusama', ko: '쿠사마 야요이' },
      style: { en: 'Contemporary, Installation', ko: '현대미술, 설치미술' },
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Yayoi_Kusama_cropped_1_Yayoi_Kusama_201611.jpg/400px-Yayoi_Kusama_cropped_1_Yayoi_Kusama_201611.jpg',
      personality: ['SREF', 'SREC'] // 이야기 직조가, 마음의 큐레이터
    },
    {
      name: { en: 'Lee Ufan', ko: '이우환' },
      style: { en: 'Minimalism, Mono-ha', ko: '미니멀리즘, 모노하' },
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&q=80',
      personality: ['LAMC', 'SAMF'] // 패턴 건축가, 마음의 연금술사
    },
    {
      name: { en: 'David Hockney', ko: '데이비드 호크니' },
      style: { en: 'Pop Art, Landscapes', ko: '팝아트, 풍경화' },
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/David_Hockney_-_Pop_Art_-_A_Bigger_Splash.jpg/400px-David_Hockney_-_Pop_Art_-_A_Bigger_Splash.jpg',
      personality: ['LREF', 'LREC'] // 침묵의 시인, 질감의 예언자
    },
    {
      name: { en: 'Nam June Paik', ko: '백남준' },
      style: { en: 'Video Art, New Media', ko: '비디오 아트, 뉴미디어' },
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/TV_Buddha_by_Nam_June_Paik.jpg/400px-TV_Buddha_by_Nam_June_Paik.jpg',
      personality: ['SAEF', 'SREC'] // 감정 지휘자, 마음의 큐레이터
    }
  ];
  const [timeOfDay, setTimeOfDay] = useState('');
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [currentVisitors, setCurrentVisitors] = useState(1234);
  const [todayDiscoveries, setTodayDiscoveries] = useState(89);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  const rooms: Room[] = [
    {
      name: language === 'ko' ? '당신의 유형 발견하기' : 'Discover Your Type',
      icon: '🎭',
      path: '/quiz',
      status: 'available',
      description: language === 'ko' ? '자기 발견의 여정을 시작하세요' : 'Begin your journey of self-discovery'
    },
    {
      name: language === 'ko' ? '갤러리' : 'Gallery',
      icon: '🖼️',
      path: '/explore',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '당신의 영혼과 맞는 예술 작품을 탐험하세요' : 'Explore artworks matched to your soul'
    },
    {
      name: language === 'ko' ? '커뮤니티 살롱' : 'Community Salon',
      icon: '👥',
      path: '/community',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '비슷한 감성의 사람들과 연결하세요' : 'Connect with kindred spirits'
    },
    {
      name: language === 'ko' ? '나의 컬렉션' : 'Your Collection',
      icon: '📚',
      path: '/profile',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '당신만의 예술 성역' : 'Your personal art sanctuary'
    },
    {
      name: language === 'ko' ? '아트페어 모드' : 'Art Fair Mode',
      icon: '🎨',
      path: '/art-fair',
      status: 'available',
      description: language === 'ko' ? '빠르게 작품을 저장하고 정리하세요' : 'Quickly save and organize artworks'
    },
    {
      name: language === 'ko' ? '전시 감상 기록' : 'Exhibition Record',
      icon: '📝',
      path: '/exhibition/record',
      status: 'available',
      description: language === 'ko' ? '전시 관람 경험을 아름답게 기록하세요' : 'Beautifully record your exhibition experience'
    },
    {
      name: language === 'ko' ? '작가 발견하기' : 'Discover Artists',
      icon: '👨‍🎨',
      path: '/artists',
      status: 'available',
      description: language === 'ko' ? '다양한 시대의 작가들을 만나보세요' : 'Explore artists from different eras'
    }
  ];

  const handleRoomClick = (room: Room) => {
    if (room.status === 'locked') {
      if (room.path === '/profile' || room.path === '/community' || room.path === '/explore') {
        toast(language === 'ko' 
          ? '로그인이 필요합니다' 
          : 'Please login to access this feature', 
          {
            icon: '🔒',
            style: {
              background: 'rgba(147, 51, 234, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              color: '#fff',
            },
          }
        );
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
      return;
    }
    router.push(room.path);
  };

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Gradient Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 -z-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${['rgba(26, 84, 144, 0.1)', 'rgba(230, 57, 70, 0.1)', 'rgba(241, 196, 15, 0.1)'][i % 3]} 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              SAYU
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-700">
              {language === 'ko' ? '당신만의 예술 여정이 시작됩니다' : 'Your Personal Art Journey Begins'}
            </p>
          </motion.div>

          {/* Hero Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? '성격 기반 큐레이션' : 'Personality-Based Curation'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? 'MBTI로 발견하는 나만의 예술 취향' : 'Discover art that matches your MBTI'}
              </p>
            </GlassCard>

            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? '세계적인 컬렉션' : 'Global Collections'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? 'MET, Rijksmuseum 등 명작 탐험' : 'Explore masterpieces from MET, Rijksmuseum'}
              </p>
            </GlassCard>

            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? '당신만의 독특한 예술 정체성 생성' : 'Generate your unique artistic identity'}
              </p>
            </GlassCard>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/quiz">
              <GlassButton size="lg" variant="primary" className="group">
                <Palette className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                {language === 'ko' ? '성향 테스트 시작하기' : 'Start Personality Test'}
              </GlassButton>
            </Link>
            <Link href="/explore">
              <GlassButton size="lg" variant="default">
                <Compass className="mr-2 h-5 w-5" />
                {language === 'ko' ? '갤러리 둘러보기' : 'Explore Gallery'}
              </GlassButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full p-1">
            <div className="w-1 h-3 bg-gray-400 rounded-full mx-auto animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ko' ? '당신의 예술 공간' : 'Your Art Spaces'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ko' ? '각각의 공간이 특별한 경험을 선사합니다' : 'Each space offers a unique experience'}
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
            {rooms.map((room, index) => {
              const isLarge = index === 0 || index === 2; // Make certain cards larger
              const gridClass = isLarge ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2';
              
              return (
                <motion.div
                  key={room.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={gridClass}
                >
                  <GlassCard
                    className={`h-full cursor-pointer group relative overflow-hidden ${
                      room.status === 'locked' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleRoomClick(room)}
                    whileHover={room.status !== 'locked' ? { scale: 1.02 } : {}}
                    whileTap={room.status !== 'locked' ? { scale: 0.98 } : {}}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                      <div>
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          {room.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                        <p className="text-gray-600">{room.description}</p>
                      </div>

                      {room.status === 'locked' ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Lock size={16} />
                          <span className="text-sm">{language === 'ko' ? '로그인 필요' : 'Login required'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-primary group-hover:translate-x-2 transition-transform">
                          <span className="text-sm font-medium">{language === 'ko' ? '입장하기' : 'Enter'}</span>
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard variant="light">
            <div className="flex flex-wrap justify-center gap-8 py-4">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentVisitors.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '현재 방문자' : 'Current visitors'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayDiscoveries}</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '오늘의 발견' : 'Discoveries today'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">16</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '성격 유형' : 'Personality types'}</p>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ko' ? '당신과 대화하는 작가들' : 'Artists Who Speak Your Language'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ko' ? '성격 유형별로 만나는 예술가들' : 'Discover artists by personality type'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featuredArtists.map((artist, index) => (
              <motion.div
                key={artist.name.en}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="group cursor-pointer h-full">
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img
                      src={artist.image}
                      alt={artist.name[language]}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3">
                      <span className="glass px-3 py-1 rounded-full text-xs font-medium">
                        {artist.personality[0]}
                      </span>
                    </div>
                  </div>
                  <GlassCardHeader>
                    <GlassCardTitle>{artist.name[language]}</GlassCardTitle>
                    <GlassCardDescription>{artist.style[language]}</GlassCardDescription>
                  </GlassCardHeader>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlassCard className="inline-block p-12">
              <h3 className="text-3xl font-bold mb-4">
                {language === 'ko' ? '당신의 예술 성격을 발견하세요' : 'Discover Your Art Soul'}
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                {language === 'ko' 
                  ? '16가지 성격 유형을 기반으로 당신만의 독특한 예술 취향을 찾아드립니다' 
                  : 'Find your unique artistic taste based on 16 personality types'}
              </p>
              <Link href="/quiz">
                <GlassButton size="lg" variant="primary" className="group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  {language === 'ko' ? '지금 시작하기' : 'Start Now'}
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'home',
          feature: 'landing-page'
        }}
      />
    </div>
  );
}
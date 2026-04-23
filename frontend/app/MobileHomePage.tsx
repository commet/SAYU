'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

// 저작권 free 유명 작품들 (데스크탑과 동일)
const famousArtworks = [
  {
    id: 1,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: '별이 빛나는 밤',
    title_en: 'Starry Night',
    artist: '빈센트 반 고흐',
    artist_en: 'Vincent van Gogh',
    perceptions: [
      "소용돌이치는 불안감",
      "우주와의 교감",
      "붓질의 역동적 리듬",
      "생명력 넘치는 밤하늘",
      "후기인상주의 기법",
      "희망의 별빛"
    ],
    perceptions_en: [
      "Swirling anxiety",
      "Cosmic connection",
      "Dynamic brush rhythm",
      "Vibrant night sky",
      "Post-impressionist technique",
      "Hopeful starlight"
    ]
  },
  {
    id: 2,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1280px-Monet_Water_Lilies_1916.jpg',
    title: '수련',
    title_en: 'Water Lilies',
    artist: '클로드 모네',
    artist_en: 'Claude Monet',
    perceptions: [
      "고요한 평온함",
      "자연과의 조화",
      "빛의 미묘한 변화",
      "인상주의 터치",
      "시간의 흐름",
      "물의 반사"
    ],
    perceptions_en: [
      "Serene tranquility",
      "Harmony with nature", 
      "Subtle light changes",
      "Impressionist touches",
      "Flow of time",
      "Water reflections"
    ]
  },
  {
    id: 3,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/1280px-Gustav_Klimt_016.jpg',
    title: '키스',
    title_en: 'The Kiss',
    artist: '구스타프 클림트',
    artist_en: 'Gustav Klimt',
    perceptions: [
      "황금빛 사랑",
      "장식적 아름다움",
      "친밀한 순간",
      "비잔틴 영감",
      "패턴의 조화",
      "영원한 포옹"
    ],
    perceptions_en: [
      "Golden love",
      "Decorative beauty",
      "Intimate moment",
      "Byzantine inspiration",
      "Pattern harmony",
      "Eternal embrace"
    ]
  }
];

export default function MobileHomePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentArtwork, setCurrentArtwork] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 섹션별 독립적 표시 (겹치지 않도록 수정)
  const mazeOpacity = useTransform(scrollYProgress, [0, 0.2, 0.24], [1, 1, 0]);
  const artworksOpacity = useTransform(scrollYProgress, [0.24, 0.25, 0.49, 0.5], [0, 1, 1, 0]);
  const peopleOpacity = useTransform(scrollYProgress, [0.5, 0.51, 0.74, 0.75], [0, 1, 1, 0]);
  const gardenOpacity = useTransform(scrollYProgress, [0.75, 0.76, 1], [0, 1, 1]);

  const lightIntensity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % famousArtworks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Fixed viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Scene 1: 미로 입구 (데스크탑과 동일한 컨셉을 모바일에 맞게) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: mazeOpacity }}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* 부드러운 미로 배경 - 감성적인 어둠 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900" />
            
            {/* 부드러운 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
            
            {/* 모바일용 미로 안개 효과 (더 단순화) */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => {
                const left = (i * 25) + 12.5;
                const top = (i * 20) + 10;
                const size = 80 + (i * 20);
                
                return (
                  <motion.div
                    key={`mist-${i}`}
                    className="absolute rounded-full opacity-20"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      background: `radial-gradient(circle, rgba(100, 100, 120, 0.3) 0%, transparent 70%)`,
                      filter: 'blur(40px)',
                    }}
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -30, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 10 + (i * 2),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 2,
                    }}
                  />
                );
              })}
            </div>
            
            {/* 모바일용 미로 패턴 (단순화) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full opacity-15" viewBox="0 0 400 600">
                <defs>
                  <filter id="mobile-glow">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 중앙 원형 미로 */}
                <circle cx="200" cy="300" r="60" fill="none" stroke="rgba(150, 150, 200, 0.4)" strokeWidth="1" filter="url(#mobile-glow)" />
                <circle cx="200" cy="300" r="100" fill="none" stroke="rgba(140, 140, 190, 0.3)" strokeWidth="1" strokeDasharray="15 8" filter="url(#mobile-glow)" />
                <circle cx="200" cy="300" r="140" fill="none" stroke="rgba(130, 130, 180, 0.2)" strokeWidth="1" strokeDasharray="20 10" filter="url(#mobile-glow)" />
                
                {/* 연결 경로들 */}
                <path d="M200,240 Q240,270 200,300 T160,330" fill="none" stroke="rgba(140, 140, 190, 0.3)" strokeWidth="1" filter="url(#mobile-glow)" />
                <path d="M160,300 Q180,240 200,300 T220,360" fill="none" stroke="rgba(130, 130, 180, 0.3)" strokeWidth="1" filter="url(#mobile-glow)" />
                
                {/* 작은 노드들 */}
                <circle cx="200" cy="240" r="3" fill="rgba(160, 160, 210, 0.4)" filter="url(#mobile-glow)" />
                <circle cx="240" cy="300" r="3" fill="rgba(150, 150, 200, 0.4)" filter="url(#mobile-glow)" />
                <circle cx="160" cy="300" r="3" fill="rgba(140, 140, 190, 0.4)" filter="url(#mobile-glow)" />
              </svg>
            </div>
            
            {/* 미로에 떠다니는 작품들 (모바일 버전) */}
            <div className="absolute inset-0">
              {famousArtworks.slice(0, 3).map((artwork, i) => {
                const positions = [
                  { x: '25%', y: '25%' },
                  { x: '75%', y: '30%' },
                  { x: '30%', y: '75%' }
                ];
                return (
                  <motion.div
                    key={artwork.id}
                    className="absolute w-20 h-24"
                    style={{
                      left: positions[i].x,
                      top: positions[i].y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.2, 0.15, 0.2],
                      scale: [0.8, 1, 0.95, 1],
                      y: [0, -8, 0, -4, 0]
                    }}
                    transition={{ 
                      delay: i * 0.5 + 2,
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={artwork.url}
                        alt={artwork.title}
                        className="w-full h-full object-cover rounded-lg"
                        style={{
                          filter: 'blur(4px) brightness(0.3) saturate(0.5)',
                        }}
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* 메인 텍스트 (모바일 최적화) */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
              <motion.h1 
                className="text-3xl font-bold text-white/90 mb-4 text-center leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {language === 'ko' 
                  ? '하루에도 몇 번씩 바뀌는 마음,'
                  : 'Your feelings shift like the tides,'}
              </motion.h1>
              <motion.p 
                className="text-lg text-white/70 mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {language === 'ko'
                  ? '어떤 게 진짜 나인지 헷갈리시나요?'
                  : 'Wondering which one is the real you?'}
              </motion.p>
              <motion.p 
                className="text-base text-white/60 mb-6 text-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {language === 'ko'
                  ? '예술과 함께 진정한 나를 발견하는 여정을 시작하세요'
                  : "Begin your artistic journey to discover your true self"}
              </motion.p>

              {/* 서비스 가치 명확화 - 모바일 최적화 */}
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-8 mx-4 max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-base mb-1">✨</span>
                    <p className="text-white/90 text-[9px] font-medium leading-tight">
                      {language === 'ko' ? '5분 만에' : 'Discover in'}
                    </p>
                    <p className="text-white/70 text-[8px] leading-tight">
                      {language === 'ko' ? '예술 성향' : '5 minutes'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-base mb-1">🤝</span>
                    <p className="text-white/90 text-[9px] font-medium leading-tight">
                      {language === 'ko' ? '완벽한 매칭' : 'Perfect match'}
                    </p>
                    <p className="text-white/70 text-[8px] leading-tight">
                      {language === 'ko' ? '전시 동행' : 'Companions'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-base mb-1">🎨</span>
                    <p className="text-white/90 text-[9px] font-medium leading-tight">
                      {language === 'ko' ? 'AI 추천' : 'AI-powered'}
                    </p>
                    <p className="text-white/70 text-[8px] leading-tight">
                      {language === 'ko' ? '맞춤 전시' : 'Art recs'}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 시작 버튼 (모바일 최적화) */}
              <motion.div
                className="relative cursor-pointer group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                onClick={() => router.push('/quiz')}
              >
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 group-hover:bg-white/15 group-active:scale-95 transition-all">
                  <span className="text-white/90 font-medium text-lg">
                    {language === 'ko' ? '나의 예술 여정 시작하기' : 'Begin My Art Journey'}
                  </span>
                </div>
                
                {/* 버튼 글로우 효과 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 2: 작품들의 세계 (모바일 최적화) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: artworksOpacity }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* 모바일 스크롤 가능한 작품 섹션 */}
            <div className="h-full overflow-y-auto scrollbar-hide">
              <div className="min-h-full flex flex-col px-4 pt-12 pb-40">
                {/* 상단 헤더 - 충분한 여백 */}
                <div className="mb-6">
                  <motion.h2 
                    className="text-xl font-bold text-white text-center mb-3 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {language === 'ko' ? '같은 작품, 다른 시선' : 'Same Art, Different Eyes'}
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/70 text-center text-sm px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {language === 'ko' 
                      ? '16가지 고유한 관점, 각각 자신만의 예술 세계'
                      : '16 unique perspectives, each with their own art world'}
                  </motion.p>
                </div>
                
                {/* 중앙 작품 */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-72 h-80">
                    {famousArtworks.map((artwork, i) => {
                      const isActive = i === currentArtwork;
                      
                      return (
                        <motion.div
                          key={artwork.id}
                          className="absolute inset-0"
                          animate={{
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1 : 0.95,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <img
                            src={artwork.url}
                            alt={artwork.title}
                            className="w-full h-full object-cover rounded-2xl shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                          
                          {/* 작품 정보 */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-1">
                              {language === 'ko' ? artwork.title : artwork.title_en}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {language === 'ko' ? artwork.artist : artwork.artist_en}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 6개 감상 포인트 - 더 자유로운 배치 */}
                <motion.div
                  key={currentArtwork}
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex flex-wrap justify-center gap-2">
                    {(language === 'ko' 
                      ? famousArtworks[currentArtwork].perceptions 
                      : famousArtworks[currentArtwork].perceptions_en
                    ).map((perception, i) => (
                      <motion.div
                        key={i}
                        className="bg-white/90 rounded-full px-4 py-2 shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 + 0.3, type: "spring", bounce: 0.4 }}
                      >
                        <p className="text-gray-800 text-xs font-medium whitespace-nowrap">
                          {perception}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* 하단 3개 기능 카드 - 모두 보이도록 */}
                <div className="space-y-4">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500/25 to-pink-500/25 backdrop-blur-sm rounded-2xl p-5 border border-white/30 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="absolute top-3 right-3 text-xl opacity-70">👥</div>
                    <h3 className="text-white font-bold text-base mb-2 pr-8">
                      {language === 'ko' ? '관점 공유' : 'Share Perspectives'}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {language === 'ko' 
                        ? '당신만의 해석을 공유하고 다른 이들의 관점을 발견하세요'
                        : 'Share your unique interpretation and discover others\' perspectives'}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500/25 to-cyan-500/25 backdrop-blur-sm rounded-2xl p-5 border border-white/30 relative"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="absolute top-3 right-3 text-xl opacity-70">🤝</div>
                    <h3 className="text-white font-bold text-base mb-2 pr-8">
                      {language === 'ko' ? '전시 동행' : 'Exhibition Companions'}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {language === 'ko'
                        ? '비슷하거나 다른 예술 성향의 사람들과 함께 전시를 즐기세요'
                        : 'Meet Art Personas similar or different from you'}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-r from-green-500/25 to-teal-500/25 backdrop-blur-sm rounded-2xl p-5 border border-white/30 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="absolute top-3 right-3 text-xl opacity-70">🤖</div>
                    <h3 className="text-white font-bold text-base mb-2 pr-8">
                      {language === 'ko' ? 'AI 아트 큐레이터' : 'AI Art Curator'}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {language === 'ko'
                        ? '끊임없이 변화하는 당신을 위한 일일 큐레이션'
                        : 'Daily curation for the ever-changing you'}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scene 3: 사람들의 이야기 (모바일 최적화) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: peopleOpacity }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              <motion.h2 
                className="text-3xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {language === 'ko' ? '이미 많은 사람들이 SAYU와 함께하고 있어요' : 'Many people are already with SAYU'}
              </motion.h2>
              
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="text-xl text-white/90 mb-6 italic">
                  "{language === 'ko' 
                    ? '매일 아침 감정에 맞는 작품을 보며 하루를 시작해요.' 
                    : 'I start each day viewing artworks that match my emotions.'}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🦊</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">
                      {language === 'ko' ? '민지' : 'Emily'}
                    </p>
                    <p className="text-white/70 text-sm">APT: LAEF</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 4: 예술 정원 (모바일 최적화) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: gardenOpacity }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-900 via-green-800 to-teal-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* 떠다니는 빛 효과들 */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`light-${i}`}
                  className="absolute w-20 h-20 rounded-full"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${20 + ((i % 3) * 25)}%`,
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 4 + (i * 0.5),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              <motion.h2 
                className="text-3xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {language === 'ko' 
                  ? '함께 만들어가는 예술의 정원' 
                  : 'A Garden of Art We Create Together'}
              </motion.h2>
              
              <motion.div
                className="space-y-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {[
                  language === 'ko' ? '🎁 첫 100명 특별 혜택' : '🎁 Special Benefits for First 100',
                  language === 'ko' ? '🌱 새로운 기능 우선 체험' : '🌱 Early Access to New Features',
                  language === 'ko' ? '🏆 창립 멤버 뱃지' : '🏆 Founding Member Badge',
                  language === 'ko' ? '🎨 서비스 공동 창조' : '🎨 Co-create the Service'
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                  >
                    <p className="text-white/90 text-left">{benefit}</p>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.button
                className="bg-white text-green-700 px-8 py-4 rounded-full font-bold text-lg w-full max-w-xs active:scale-95 transition-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                onClick={() => router.push('/quiz')}
              >
                {language === 'ko' ? '지금 시작하기 →' : 'Start Now →'}
              </motion.button>
              
              <motion.p 
                className="text-white/70 text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                {language === 'ko' 
                  ? '오늘 47명이 자신의 예술 성향을 발견했습니다' 
                  : 'Today 47 people discovered their Art Persona'}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
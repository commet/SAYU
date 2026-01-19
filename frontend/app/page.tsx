'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useResponsive } from '@/lib/responsive';
import { useLanguage } from '@/contexts/LanguageContext';
import { Container, Button } from '@/components/design-system';
import { Sparkles, ArrowRight, MessageSquare, TrendingUp } from 'lucide-react';

// Translations
const t = {
  en: {
    // Features section
    featuresTitle: 'What SAYU Offers',
    featuresSubtitle: 'A Journey of Self-Discovery Through Art',
    aptTest: 'APT Test',
    aptTitle: 'Discover Your\nArt Persona',
    aptDescription: 'Find your type among 16 art personalities. In just 3-5 minutes, discover how you appreciate art and which works resonate with you.',
    takeTest: 'Take the Test',
    // Quiz
    quizQuestion: 'When you enter an exhibition hall, you...',
    quizOptionA: 'Read the artwork descriptions carefully',
    quizOptionB: 'Appreciate the art intuitively',
    emotionalDreamer: 'Emotional Dreamer',
    emotionalDreamerDesc: 'You experience art through color and emotion',
    personaRecommendation: 'Personalized Recommendations',
    recommendedArtworks: 'Recommended Artworks',
    recommendedExhibition: 'Recommended Exhibition',
    recommendReason: (code: string) => `Why we recommend this for ${code}:`,
    // Gallery section
    gallery: 'Gallery',
    galleryTitle: 'World Masterpieces in One Place',
    galleryDescription: 'Explore over 10,000 curated artworks. From pieces recommended based on your Art Persona Type to masterpieces spanning eras and genres.',
    exploreGallery: 'Explore Gallery',
    recommended: 'Recommended',
    artworks: 'artworks',
    // Art movements
    expressionism: 'Expressionism',
    baroque: 'Baroque',
    ukiyoe: 'Ukiyo-e',
    impressionism: 'Impressionism',
    colorFocused: 'Color-focused',
    emotional: 'Emotional',
    // Community section
    community: 'Community',
    communityTitle: 'Connect with Like-minded People',
    communityDescription: 'Meet people with similar Art Persona Types, share artworks, visit exhibitions together, and engage in conversations about art.',
    joinCommunity: 'Join Community',
    exhibitionCompanion: 'Exhibition Companion · Live',
    aptTypeMatching: 'APT Type Matching',
    sendCompanionRequest: 'Send a companion request now...',
    // Featured Collection
    featuredCollection: 'Featured Collection',
    curatedMasterpieces: 'Curated Masterpieces',
    viewAll: 'View All',
    // CTA
    ctaTitle: 'Start Now',
    ctaDescription: 'Discover your Art Persona Type in just 3-5 minutes.',
    todayDiscovered: (count: number) => `${count} people discovered theirs today.`,
    startFree: 'Start for Free',
    // Artwork titles
    starryNight: 'The Starry Night',
    waterLilies: 'Water Lilies',
    theKiss: 'The Kiss',
    theScream: 'The Scream',
    girlWithPearl: 'Girl with a Pearl Earring',
    greatWave: 'The Great Wave off Kanagawa',
    selfPortrait: 'Self-Portrait',
    sundayGrandeJatte: 'A Sunday on La Grande Jatte',
    gardenDelights: 'The Garden of Earthly Delights',
    creationAdam: 'The Creation of Adam',
    // Artist names
    vanGogh: 'Vincent van Gogh',
    monet: 'Claude Monet',
    klimt: 'Gustav Klimt',
    munch: 'Edvard Munch',
    vermeer: 'Johannes Vermeer',
    hokusai: 'Katsushika Hokusai',
    kahlo: 'Frida Kahlo',
    seurat: 'Georges Seurat',
    bosch: 'Hieronymus Bosch',
    michelangelo: 'Michelangelo',
    // Exhibition
    leeBulExhibition: 'Lee Bul Solo Exhibition',
    leeum: 'Leeum Museum of Art',
    seoulHannam: 'Hannam-dong, Yongsan-gu, Seoul',
    exhibitionReason: 'Emotional interpretation + Free viewing preference',
    // Community feed
    saturdayExhibition: 'Anyone want to see the exhibition together Saturday 3PM?',
    cafeGathering: 'Art appreciation meetup at a cafe near the museum',
    openingRunTeam: 'Recruiting a team for the new exhibition opening!',
  },
  ko: {
    // Features section
    featuresTitle: 'SAYU가 제공하는 경험',
    featuresSubtitle: '예술을 통한 자기 발견의 여정',
    aptTest: 'APT 테스트',
    aptTitle: '나만의 Art Persona\n발견하기',
    aptDescription: '16가지 예술 성향 중 당신의 유형을 찾아보세요. 3-5분의 테스트로 당신이 어떤 방식으로 예술을 감상하고, 어떤 작품에 끌리는지 알 수 있습니다.',
    takeTest: '테스트 하러가기',
    // Quiz
    quizQuestion: '전시실에 들어갔을 때, 당신은?',
    quizOptionA: '작품 설명부터 꼼꼼히 읽는다',
    quizOptionB: '직관적으로 작품을 감상한다',
    emotionalDreamer: '감성적 몽상가',
    emotionalDreamerDesc: '색채와 감정으로 예술을 느끼는 당신',
    personaRecommendation: 'Persona별 맞춤 추천',
    recommendedArtworks: '추천 작품',
    recommendedExhibition: '추천 전시',
    recommendReason: (code: string) => `${code}인 당신에게 추천하는 이유:`,
    // Gallery section
    gallery: '갤러리',
    galleryTitle: '세계의 명작을 한곳에서',
    galleryDescription: '10,000점 이상의 큐레이션된 작품을 탐험하세요. 당신의 Art Persona Type에 맞춰 추천되는 작품부터, 시대와 장르를 넘나드는 명작까지.',
    exploreGallery: '갤러리 둘러보기',
    recommended: '추천',
    artworks: '작품',
    // Art movements
    expressionism: '표현주의',
    baroque: '바로크',
    ukiyoe: '우키요에',
    impressionism: '인상주의',
    colorFocused: '색채 중심',
    emotional: '감성적',
    // Community section
    community: '커뮤니티',
    communityTitle: '같은 취향의 사람들과 연결',
    communityDescription: '비슷한 Art Persona Type을 가진 사람들과 만나 작품을 공유하고, 전시를 함께 방문하며, 예술에 대한 대화를 나눠보세요.',
    joinCommunity: '커뮤니티 참여하기',
    exhibitionCompanion: '전시 동행 · 실시간',
    aptTypeMatching: 'APT 타입 매칭',
    sendCompanionRequest: '지금 전시 동행 제안 보내기...',
    // Featured Collection
    featuredCollection: 'Featured Collection',
    curatedMasterpieces: '엄선된 명작들',
    viewAll: '전체 보기',
    // CTA
    ctaTitle: '지금 시작하세요',
    ctaDescription: '3-5분이면 당신만의 Art Persona Type을 발견할 수 있습니다.',
    todayDiscovered: (count: number) => `오늘 ${count}명이 이미 발견했어요.`,
    startFree: '무료로 시작하기',
    // Artwork titles
    starryNight: '별이 빛나는 밤',
    waterLilies: '수련',
    theKiss: '키스',
    theScream: '절규',
    girlWithPearl: '진주 귀걸이를 한 소녀',
    greatWave: '가나가와 파도 아래',
    selfPortrait: '자화상',
    sundayGrandeJatte: '그랑드자트 섬의 일요일',
    gardenDelights: '쾌락의 정원',
    creationAdam: '아담의 창조',
    // Artist names
    vanGogh: '빈센트 반 고흐',
    monet: '클로드 모네',
    klimt: '구스타프 클림트',
    munch: '에드바르 뭉크',
    vermeer: '요하네스 페르메이르',
    hokusai: '가츠시카 호쿠사이',
    kahlo: '프리다 칼로',
    seurat: '조르주 쇠라',
    bosch: '히에로니무스 보스',
    michelangelo: '미켈란젤로',
    // Exhibition
    leeBulExhibition: '이불 개인전',
    leeum: '리움미술관',
    seoulHannam: '서울 용산구 한남동',
    exhibitionReason: '감성적 해석 + 자유로운 관람 선호',
    // Community feed
    saturdayExhibition: '토요일 오후 3시 전시 같이 보실 분?',
    cafeGathering: '국현 근처 카페에서 감상 모임 열어요',
    openingRunTeam: '새 전시 오픈런 팀 모집!',
  },
};
// Dynamic import for heavy 3D hero section
const Hero3DSection = dynamic(
  () => import('@/components/hero/Hero3DSection').then(mod => ({ default: mod.Hero3DSection })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-64 h-64 bg-neutral-200 rounded-2xl mx-auto mb-4" />
          <div className="animate-pulse w-48 h-6 bg-neutral-200 rounded mx-auto" />
        </div>
      </div>
    ),
  }
);

const MobileHomePage = dynamic(() => import('./MobileHomePageFixed'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
    </div>
  ),
});

const featuredArtworks = [
  {
    id: 1,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: '별이 빛나는 밤',
    artist: '빈센트 반 고흐',
  },
  {
    id: 2,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1200px-Monet_Water_Lilies_1916.jpg',
    title: '수련',
    artist: '클로드 모네',
  },
  {
    id: 3,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg',
    title: '키스',
    artist: '구스타프 클림트',
  },
];

const galleryArtworks = [
  {
    id: 1,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/1200px-The_Scream.jpg',
    title: '절규',
    artist: '에드바르 뭉크',
  },
  {
    id: 2,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1200px-1665_Girl_with_a_Pearl_Earring.jpg',
    title: '진주 귀걸이를 한 소녀',
    artist: '요하네스 페르메이르',
  },
  {
    id: 3,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1200px-The_Great_Wave_off_Kanagawa.jpg',
    title: '가나가와 파도 아래',
    artist: '가츠시카 호쿠사이',
  },
  {
    id: 4,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/1200px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg',
    title: '자화상',
    artist: '프리다 칼로',
  },
];

const collectionArtworks = [
  {
    id: 1,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1200px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg',
    title: '그랑드자트 섬의 일요일',
    artist: '조르주 쇠라',
  },
  {
    id: 2,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg/1200px-El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg',
    title: '쾌락의 정원',
    artist: '히에로니무스 보스',
  },
  {
    id: 3,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1200px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
    title: '아담의 창조',
    artist: '미켈란젤로',
  },
];

const aptSlides = [
  {
    id: 1,
    type: 'quiz' as const,
    question: '전시실에 들어갔을 때, 당신은?',
    options: [
      { key: 'A', label: '작품 설명부터 꼼꼼히 읽는다' },
      { key: 'B', label: '직관적으로 작품을 감상한다' },
    ],
  },
  {
    id: 2,
    type: 'result' as const,
    emoji: '🦊',
    persona: '감성적 몽상가',
    code: 'LAEF',
    description: '색채와 감정으로 예술을 느끼는 당신',
  },
  {
    id: 3,
    type: 'recommendation' as const,
    title: 'Persona별 맞춤 추천',
    artworks: featuredArtworks.slice(0, 2),
    exhibition: {
      name: '이불 개인전',
      museum: '리움미술관',
      location: '서울 용산구 한남동',
      reason: '감성적 해석 + 자유로운 관람 선호'
    },
    tags: ['인상주의', '색채 중심', '감성적'],
  },
];

const scenarioOptions = [
  { key: 'A', label: '포스터를 보고 바로 입장' },
  { key: 'B', label: '한 바퀴 둘러본 뒤 천천히 감상' },
  { key: 'C', label: '조용한 코너에서 오래 머무름' },
];

const communityFeeds = [
  { name: 'sj.moment', msg: '토요일 오후 3시 전시 같이 보실 분?', badge: 'LAEF · 96%', tone: 'bg-emerald-500 text-white' },
  { name: 'art_watcher', msg: '국현 근처 카페에서 감상 모임 열어요', badge: 'SRMC · 82%', tone: 'bg-blue-500 text-white' },
  { name: 'gallery_buddy', msg: '새 전시 오픈런 팀 모집!', badge: 'LAMF · 78%', tone: 'bg-amber-500 text-white' },
];

export default function HomePage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const texts = t[language];
  const [currentAptSlide, setCurrentAptSlide] = useState(0);
  const [todayUsers] = useState(47);

  // Dynamic data based on language
  const featuredArtworksLocalized = [
    { id: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', title: texts.starryNight, artist: texts.vanGogh },
    { id: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1200px-Monet_Water_Lilies_1916.jpg', title: texts.waterLilies, artist: texts.monet },
    { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg', title: texts.theKiss, artist: texts.klimt },
  ];

  const galleryArtworksLocalized = [
    { id: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/1200px-The_Scream.jpg', title: texts.theScream, artist: texts.munch },
    { id: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1200px-1665_Girl_with_a_Pearl_Earring.jpg', title: texts.girlWithPearl, artist: texts.vermeer },
    { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1200px-The_Great_Wave_off_Kanagawa.jpg', title: texts.greatWave, artist: texts.hokusai },
    { id: 4, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/1200px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg', title: texts.selfPortrait, artist: texts.kahlo },
  ];

  const collectionArtworksLocalized = [
    { id: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1200px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg', title: texts.sundayGrandeJatte, artist: texts.seurat },
    { id: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg/1200px-El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg', title: texts.gardenDelights, artist: texts.bosch },
    { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1200px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg', title: texts.creationAdam, artist: texts.michelangelo },
  ];

  const aptSlidesLocalized = [
    {
      id: 1,
      type: 'quiz' as const,
      question: texts.quizQuestion,
      options: [
        { key: 'A', label: texts.quizOptionA },
        { key: 'B', label: texts.quizOptionB },
      ],
    },
    {
      id: 2,
      type: 'result' as const,
      emoji: '🦊',
      persona: texts.emotionalDreamer,
      code: 'LAEF',
      description: texts.emotionalDreamerDesc,
    },
    {
      id: 3,
      type: 'recommendation' as const,
      title: texts.personaRecommendation,
      artworks: featuredArtworksLocalized.slice(0, 2),
      exhibition: {
        name: texts.leeBulExhibition,
        museum: texts.leeum,
        location: texts.seoulHannam,
        reason: texts.exhibitionReason,
      },
      tags: [texts.impressionism, texts.colorFocused, texts.emotional],
    },
  ];

  const communityFeedsLocalized = [
    { name: 'sj.moment', msg: texts.saturdayExhibition, badge: 'LAEF · 96%', tone: 'bg-emerald-500 text-white' },
    { name: 'art_watcher', msg: texts.cafeGathering, badge: 'SRMC · 82%', tone: 'bg-blue-500 text-white' },
    { name: 'gallery_buddy', msg: texts.openingRunTeam, badge: 'LAMF · 78%', tone: 'bg-amber-500 text-white' },
  ];

  // if (isMobile) return <MobileHomePage />;

  useEffect(() => {
    const aptTimer = setInterval(() => {
      setCurrentAptSlide((prev) => (prev + 1) % aptSlidesLocalized.length);
    }, 4000);
    return () => clearInterval(aptTimer);
  }, [aptSlidesLocalized.length]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* 3D Hero Section */}
      <Hero3DSection />

      {/* Features Section */}
      <section className="py-12 md:py-20 border-t border-neutral-200">
        <Container size="2xl">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-black">{texts.featuresTitle}</h2>
            <p className="text-base md:text-lg lg:text-xl text-black">{texts.featuresSubtitle}</p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {/* Feature 1 - APT Test */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">
                  <Sparkles className="w-3 h-3" />{texts.aptTest}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-black whitespace-pre-line">
                  {texts.aptTitle}
                </h3>
                <p className="text-sm md:text-base lg:text-lg leading-relaxed text-black mb-6 md:mb-8">
                  {texts.aptDescription}
                </p>
                <Button
                  variant="outline"
                  className="hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                  onClick={() => router.push('/quiz')}
                >
                  {texts.takeTest}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl" style={{ perspective: '1000px' }}>
                <AnimatePresence mode="wait">
                  {aptSlidesLocalized.map((slide, index) => index === currentAptSlide && (
                    <motion.div
                      key={slide.id}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                      className={`absolute inset-0 flex flex-col p-8 ${
                        slide.type === 'recommendation' ? 'items-stretch justify-start gap-5' : 'items-center justify-center'
                      }`}
                    >
                      {slide.type === 'quiz' && (
                        <div className="w-full space-y-6">
                          <p className="text-2xl font-bold text-center text-black">{slide.question}</p>
                          <div className="space-y-3">
                            {slide.options.map((option, idx) => (
                              <div
                                key={option.key}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-all ${
                                  idx === 0
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black border-neutral-200 hover:border-black'
                                }`}
                              >
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                  idx === 0 ? 'bg-white text-black' : 'bg-neutral-100 text-black'
                                }`}>
                                  {option.key}
                                </span>
                                <span className="font-medium">{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {slide.type === 'result' && (
                        <div className="w-full text-center space-y-4">
                          <div className="text-7xl mb-2">{slide.emoji}</div>
                          <div>
                            <h4 className="text-3xl font-bold text-black mb-1">{slide.persona}</h4>
                            <p className="text-2xl font-bold text-neutral-800 mb-4">{slide.code}</p>
                            <p className="text-base text-neutral-600">{slide.description}</p>
                          </div>
                        </div>
                      )}

                      {slide.type === 'recommendation' && (
                        <div className="w-full space-y-5">
                          <h4 className="text-2xl font-bold text-center text-black">{slide.title}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden border border-neutral-200">
                            {/* Left: Recommended Artworks */}
                            <div className="bg-white p-4 space-y-3">
                              <p className="text-sm font-semibold text-neutral-700">{texts.recommendedArtworks}</p>
                              {slide.artworks.slice(0, 1).map((artwork) => (
                                <div key={artwork.id} className="relative h-56 rounded-xl overflow-hidden border border-neutral-200">
                                  <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                                  <div className="absolute bottom-2 left-2 text-white drop-shadow">
                                    <p className="text-sm font-semibold">{artwork.title}</p>
                                    <p className="text-xs text-white/80">{artwork.artist}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Right: Recommended Exhibition */}
                            <div className="bg-neutral-900 text-white p-4 space-y-3">
                              <p className="text-sm font-semibold text-white">{texts.recommendedExhibition}</p>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white text-lg">🏛️</div>
                                <div className="flex-1 text-left space-y-0.5">
                                  <p className="text-base font-bold">{slide.exhibition.name}</p>
                                  <p className="text-sm text-white/90">{slide.exhibition.museum}</p>
                                  <p className="text-xs text-white/60">{slide.exhibition.location}</p>
                                  <p className="text-xs text-[#D4A520] mt-5 pt-2 border-t border-white/10">
                                    {texts.recommendReason('LAEF')} {slide.exhibition.reason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {slide.tags.map((tag) => (
                              <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {aptSlidesLocalized.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentAptSlide(index)}
                      className={`h-1.5 transition-all rounded-full ${
                        currentAptSlide === index ? 'w-8 bg-black' : 'w-1.5 bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Gallery Section - DARK THEME FULL WIDTH */}
      <section className="py-12 md:py-20 bg-neutral-950">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-xl p-6">
              <div className="flex h-full flex-col gap-3">
                <div className="relative flex-1 overflow-hidden">
                  <motion.div
                    className="flex gap-3"
                    animate={{
                      x: ['0%', '-33.33%'],
                    }}
                    transition={{
                      x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 15,
                        ease: 'linear',
                      },
                    }}
                  >
                    {[...galleryArtworksLocalized, ...galleryArtworksLocalized, ...galleryArtworksLocalized].map((art, idx) => (
                      <div key={`${art.id}-${idx}`} className="relative w-[200px] aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800 shadow-lg flex-shrink-0">
                        <Image src={art.image} alt={art.title} fill className="object-cover" />
                        <div className="absolute bottom-2 left-2 right-2 text-white text-xs drop-shadow">
                          <p className="font-semibold truncate">{art.title}</p>
                          <p className="text-white/80 truncate">{art.artist}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 rounded-full bg-neutral-800">{texts.expressionism}</span>
                    <span className="px-2 py-1 rounded-full bg-neutral-800">{texts.baroque}</span>
                    <span className="px-2 py-1 rounded-full bg-neutral-800">{texts.ukiyoe}</span>
                  </div>
                  <span className="text-neutral-500 whitespace-nowrap">{texts.recommended} · 10,000+ {texts.artworks}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4A520] text-white text-xs font-medium mb-4 rounded-full">{texts.gallery}</div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-white">{texts.galleryTitle}</h3>
              <p className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-300 mb-6 md:mb-8">{texts.galleryDescription}</p>
              <Button
                variant="outline"
                className="bg-white text-black border-white hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                onClick={() => router.push('/gallery')}
              >
                {texts.exploreGallery}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Community Section */}
      <section className="py-20">
        <Container size="2xl">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">{texts.community}</div>
              <h3 className="text-4xl font-bold mb-6 text-black">{texts.communityTitle}</h3>
              <p className="text-lg leading-relaxed text-black mb-8">{texts.communityDescription}</p>
              <Button
                variant="outline"
                className="hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                onClick={() => router.push('/community')}
              >
                {texts.joinCommunity}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl shadow-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-neutral-700" />
                  <span className="text-sm font-semibold text-neutral-800">{texts.exhibitionCompanion}</span>
                </div>
                <span className="text-xs text-neutral-500">{texts.aptTypeMatching}</span>
              </div>
              <div className="space-y-2">
                {communityFeedsLocalized.map((feed) => (
                  <div key={feed.name} className="rounded-xl bg-white border border-neutral-200 shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">@{feed.name}</p>
                      <p className="text-sm text-neutral-700">{feed.msg}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${feed.tone}`}>{feed.badge}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-neutral-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {texts.sendCompanionRequest}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-16 mb-10 border-t border-neutral-200"></div>

          <div className="space-y-12">
            {/* Featured Collection */}
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-5xl font-bold mb-2 text-black">{texts.featuredCollection}</h2>
                  <p className="text-lg text-neutral-800">{texts.curatedMasterpieces}</p>
                </div>
                <Button
                  variant="ghost"
                  className="hover:bg-[#D4A520]/10 text-neutral-800"
                  onClick={() => router.push('/gallery')}
                >
                  {texts.viewAll}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {collectionArtworksLocalized.map((art) => (
                  <div key={art.id} className="group cursor-pointer">
                    <div className="relative aspect-[4/5] bg-neutral-200 overflow-hidden mb-3 rounded-2xl border border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-500">
                      <Image src={art.image} alt={art.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <p className="font-semibold mb-1 text-black">{art.title}</p>
                    <p className="text-sm text-neutral-600">{art.artist}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl text-center py-8 md:py-12 lg:py-16 px-4 md:px-8 space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-black">{texts.ctaTitle}</h2>
              <p className="text-sm md:text-base lg:text-xl text-neutral-700 leading-relaxed">
                {texts.ctaDescription}
                <br />
                {texts.todayDiscovered(todayUsers)}
              </p>
              <Button
                variant="primary"
                className="bg-[#D4A520] text-white hover:bg-[#B8860B] transition-all duration-300"
                onClick={() => router.push('/quiz')}
              >
                {texts.startFree}
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

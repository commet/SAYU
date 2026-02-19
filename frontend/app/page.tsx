'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useResponsive } from '@/lib/responsive';
import { useLanguage } from '@/contexts/LanguageContext';
import { Container } from '@/components/design-system';
import { ArrowRight, MessageSquare } from 'lucide-react';

// Shared serif font style
const serifStyle = { fontFamily: 'var(--font-cormorant), var(--font-noto-serif-kr), serif' };

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
    exhibitionCompanion: 'Exhibition Companion',
    aptTypeMatching: 'Live',
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
    exhibitionCompanion: '전시 동행',
    aptTypeMatching: '실시간',
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
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-48 h-[1px] bg-neutral-800 mx-auto mb-6" />
          <div className="animate-pulse w-32 h-[1px] bg-neutral-800 mx-auto" />
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
    { name: 'sj.moment', msg: texts.saturdayExhibition, badge: 'LAEF · 96%' },
    { name: 'art_watcher', msg: texts.cafeGathering, badge: 'SRMC · 82%' },
    { name: 'gallery_buddy', msg: texts.openingRunTeam, badge: 'LAMF · 78%' },
  ];

  // if (isMobile) return <MobileHomePage />;

  useEffect(() => {
    const aptTimer = setInterval(() => {
      setCurrentAptSlide((prev) => (prev + 1) % aptSlidesLocalized.length);
    }, 4000);
    return () => clearInterval(aptTimer);
  }, [aptSlidesLocalized.length]);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-neutral-900">
      {/* 3D Hero Section */}
      <Hero3DSection />

      {/* ── Features Section (APT Test) ── */}
      <section className="py-20 md:py-28 lg:py-32 bg-[#fafaf8]">
        <Container size="2xl">
          <div className="text-center mb-16 md:mb-24">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-5 text-neutral-900"
              style={{ ...serifStyle, wordBreak: 'keep-all' }}
            >
              {texts.featuresTitle}
            </h2>
            <p className="text-base md:text-lg text-neutral-500 tracking-wide">{texts.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: text */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                {texts.aptTest}
              </span>
              <h3
                className="text-2xl md:text-3xl lg:text-4xl font-light mt-4 mb-5 md:mb-7 text-neutral-900 whitespace-pre-line leading-snug"
                style={{ ...serifStyle, wordBreak: 'keep-all' }}
              >
                {texts.aptTitle}
              </h3>
              <p
                className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-500 mb-8 md:mb-10"
                style={{ wordBreak: 'keep-all' }}
              >
                {texts.aptDescription}
              </p>
              <button
                onClick={() => router.push('/quiz')}
                className="inline-flex items-center gap-3 px-6 py-3 border border-neutral-900 text-neutral-900 text-sm tracking-wide hover:bg-neutral-900 hover:text-white transition-colors duration-300"
              >
                {texts.takeTest}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: APT card showcase */}
            <div className="relative aspect-[4/3] overflow-hidden border border-neutral-200 bg-white">
              <AnimatePresence mode="wait">
                {aptSlidesLocalized.map((slide, index) => index === currentAptSlide && (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`absolute inset-0 flex flex-col p-6 md:p-8 ${
                      slide.type === 'recommendation' ? 'items-stretch justify-start gap-4' : 'items-center justify-center'
                    }`}
                  >
                    {slide.type === 'quiz' && (
                      <div className="w-full space-y-6">
                        <p
                          className="text-xl md:text-2xl font-light text-center text-neutral-900"
                          style={{ ...serifStyle, wordBreak: 'keep-all' }}
                        >
                          {slide.question}
                        </p>
                        <div className="space-y-3">
                          {slide.options.map((option, idx) => (
                            <div
                              key={option.key}
                              className={`flex items-center gap-3 px-5 py-3.5 border transition-colors duration-200 ${
                                idx === 0
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <span className={`w-7 h-7 flex items-center justify-center text-xs font-medium border ${
                                idx === 0 ? 'border-white/30 text-white' : 'border-neutral-300 text-neutral-500'
                              }`}>
                                {option.key}
                              </span>
                              <span className="text-sm" style={{ wordBreak: 'keep-all' }}>{option.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {slide.type === 'result' && (
                      <div className="w-full text-center space-y-5">
                        <div className="text-6xl">{slide.emoji}</div>
                        <div>
                          <h4
                            className="text-2xl md:text-3xl font-light text-neutral-900 mb-2"
                            style={serifStyle}
                          >
                            {slide.persona}
                          </h4>
                          <p className="text-lg tracking-[0.15em] text-neutral-400 mb-4">{slide.code}</p>
                          <p className="text-sm text-neutral-500" style={{ wordBreak: 'keep-all' }}>{slide.description}</p>
                        </div>
                      </div>
                    )}

                    {slide.type === 'recommendation' && (
                      <div className="w-full space-y-4">
                        <h4
                          className="text-lg md:text-xl font-light text-center text-neutral-900"
                          style={serifStyle}
                        >
                          {slide.title}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden border border-neutral-200">
                          {/* Left: Recommended Artworks */}
                          <div className="bg-white p-4 space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">{texts.recommendedArtworks}</p>
                            {slide.artworks.slice(0, 1).map((artwork) => (
                              <div key={artwork.id} className="relative h-48 md:h-56 overflow-hidden">
                                <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                  <p className="text-sm text-white font-medium">{artwork.title}</p>
                                  <p className="text-xs text-white/70">{artwork.artist}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Right: Recommended Exhibition */}
                          <div className="bg-[#0a0a0a] text-white p-4 space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">{texts.recommendedExhibition}</p>
                            <div className="flex-1 text-left space-y-1">
                              <p className="text-base font-light" style={serifStyle}>{slide.exhibition.name}</p>
                              <p className="text-sm text-white/80">{slide.exhibition.museum}</p>
                              <p className="text-xs text-white/50">{slide.exhibition.location}</p>
                              <p className="text-xs text-[#D4A520] mt-4 pt-3 border-t border-white/10" style={{ wordBreak: 'keep-all' }}>
                                {texts.recommendReason('LAEF')} {slide.exhibition.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 justify-center flex-wrap">
                          {slide.tags.map((tag) => (
                            <span key={tag} className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {aptSlidesLocalized.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAptSlide(index)}
                    className={`h-[2px] transition-all duration-300 ${
                      currentAptSlide === index ? 'w-8 bg-neutral-900' : 'w-4 bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Gallery Section ── */}
      <section className="py-20 md:py-28 lg:py-32 bg-[#0a0a0a]">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: marquee artwork scroll */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#111] p-5 md:p-6">
              <div className="flex h-full flex-col gap-4">
                <div className="relative flex-1 overflow-hidden">
                  <motion.div
                    className="flex gap-4"
                    animate={{ x: ['0%', '-33.33%'] }}
                    transition={{
                      x: { repeat: Infinity, repeatType: 'loop', duration: 18, ease: 'linear' },
                    }}
                  >
                    {[...galleryArtworksLocalized, ...galleryArtworksLocalized, ...galleryArtworksLocalized].map((art, idx) => (
                      <div key={`${art.id}-${idx}`} className="relative w-[180px] md:w-[200px] aspect-[3/4] overflow-hidden flex-shrink-0">
                        <Image src={art.image} alt={art.title} fill className="object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-xs text-white font-medium truncate">{art.title}</p>
                          <p className="text-[10px] text-white/60 truncate">{art.artist}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-neutral-500">
                  <div className="flex gap-3">
                    <span className="uppercase tracking-[0.12em]">{texts.expressionism}</span>
                    <span className="uppercase tracking-[0.12em]">{texts.baroque}</span>
                    <span className="uppercase tracking-[0.12em]">{texts.ukiyoe}</span>
                  </div>
                  <span className="whitespace-nowrap tracking-wide">{texts.recommended} / 10,000+ {texts.artworks}</span>
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4A520] font-medium">
                {texts.gallery}
              </span>
              <h3
                className="text-2xl md:text-3xl lg:text-4xl font-light mt-4 mb-5 md:mb-7 text-white leading-snug"
                style={{ ...serifStyle, wordBreak: 'keep-all' }}
              >
                {texts.galleryTitle}
              </h3>
              <p
                className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-400 mb-8 md:mb-10"
                style={{ wordBreak: 'keep-all' }}
              >
                {texts.galleryDescription}
              </p>
              <button
                onClick={() => router.push('/gallery')}
                className="inline-flex items-center gap-3 px-6 py-3 border border-white/30 text-white text-sm tracking-wide hover:bg-white hover:text-neutral-900 transition-colors duration-300"
              >
                {texts.exploreGallery}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Community Section ── */}
      <section className="py-20 md:py-28 lg:py-32 bg-[#fafaf8]">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: text */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                {texts.community}
              </span>
              <h3
                className="text-2xl md:text-3xl lg:text-4xl font-light mt-4 mb-5 md:mb-7 text-neutral-900 leading-snug"
                style={{ ...serifStyle, wordBreak: 'keep-all' }}
              >
                {texts.communityTitle}
              </h3>
              <p
                className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-500 mb-8 md:mb-10"
                style={{ wordBreak: 'keep-all' }}
              >
                {texts.communityDescription}
              </p>
              <button
                onClick={() => router.push('/community')}
                className="inline-flex items-center gap-3 px-6 py-3 border border-neutral-900 text-neutral-900 text-sm tracking-wide hover:bg-neutral-900 hover:text-white transition-colors duration-300"
              >
                {texts.joinCommunity}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: chat feed mockup */}
            <div className="border border-neutral-200 bg-white p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-800">{texts.exhibitionCompanion}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{texts.aptTypeMatching}</span>
              </div>
              <div className="space-y-2">
                {communityFeedsLocalized.map((feed) => (
                  <div
                    key={feed.name}
                    className="border border-neutral-100 p-4 flex items-center justify-between hover:border-neutral-300 transition-colors duration-200"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-xs text-neutral-400 mb-0.5">@{feed.name}</p>
                      <p className="text-sm text-neutral-700 truncate" style={{ wordBreak: 'keep-all' }}>{feed.msg}</p>
                    </div>
                    <span className="text-[10px] tracking-[0.1em] text-neutral-400 whitespace-nowrap border border-neutral-200 px-2 py-1">
                      {feed.badge}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400 pt-2" style={{ wordBreak: 'keep-all' }}>
                {texts.sendCompanionRequest}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Featured Collection ── */}
      <section className="py-20 md:py-28 lg:py-32 bg-white">
        <Container size="2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
            <div>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-900 mb-2"
                style={serifStyle}
              >
                {texts.featuredCollection}
              </h2>
              <p className="text-sm text-neutral-400" style={{ wordBreak: 'keep-all' }}>{texts.curatedMasterpieces}</p>
            </div>
            <button
              onClick={() => router.push('/gallery')}
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
            >
              {texts.viewAll}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {collectionArtworksLocalized.map((art) => (
              <div key={art.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden mb-4">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
                <p className="text-sm font-medium text-neutral-900 mb-0.5" style={{ wordBreak: 'keep-all' }}>{art.title}</p>
                <p className="text-xs text-neutral-400">{art.artist}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-28 lg:py-36 bg-[#0a0a0a]">
        <Container size="2xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-5 md:mb-6"
              style={{ ...serifStyle, wordBreak: 'keep-all' }}
            >
              {texts.ctaTitle}
            </h2>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-2" style={{ wordBreak: 'keep-all' }}>
              {texts.ctaDescription}
            </p>
            <p className="text-sm text-neutral-500 mb-8 md:mb-10">
              {texts.todayDiscovered(todayUsers)}
            </p>
            <button
              onClick={() => router.push('/quiz')}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#D4A520] text-white text-sm tracking-wide hover:bg-[#B8860B] transition-colors duration-300"
            >
              {texts.startFree}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Container>
      </section>
    </div>
  );
}

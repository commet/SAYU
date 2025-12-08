'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';
import { Container, Card, Button, Heading, Text } from '@/components/design-system';
import { Sparkles, ArrowRight, Heart, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

// Mobile component
const MobileHomePage = dynamic(() => import('./MobileHomePageFixed'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-sayu-accent border-t-transparent mx-auto mb-4" />
        <p className="text-sayu-mid-gray text-sm">Loading...</p>
      </div>
    </div>
  ),
});

// Featured artworks (placeholder - connect to API later)
const featuredArtworks = [
  {
    id: 1,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: '별이 빛나는 밤',
    artist: '빈센트 반 고흐',
    museum: 'MoMA',
  },
  {
    id: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/800px-Monet_Water_Lilies_1916.jpg',
    title: '수련',
    artist: '클로드 모네',
    museum: '오랑주리 미술관',
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg',
    title: '키스',
    artist: '구스타프 클림트',
    museum: '벨베데레 궁전',
  },
  {
    id: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/800px-The_Great_Wave_off_Kanagawa.jpg',
    title: '가나가와 해변의 큰 파도',
    artist: '가쓰시카 호쿠사이',
    museum: 'Metropolitan Museum',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isMobile } = useResponsive();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [todayUsers, setTodayUsers] = useState(47);

  // Mobile redirect
  if (isMobile) {
    return <MobileHomePage />;
  }

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredArtworks.length) % featuredArtworks.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-sayu-border">
        <Container size="2xl">
          <div className="flex items-center justify-between h-16">
            <Heading as="h5" serif={false} className="text-sayu-accent">
              SAYU
            </Heading>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => router.push('/exhibitions')} className="text-sm text-sayu-dark-gray hover:text-sayu-black transition-colors">
                전시
              </button>
              <button onClick={() => router.push('/gallery')} className="text-sm text-sayu-dark-gray hover:text-sayu-black transition-colors">
                갤러리
              </button>
              <button onClick={() => router.push('/community')} className="text-sm text-sayu-dark-gray hover:text-sayu-black transition-colors">
                커뮤니티
              </button>
              <button onClick={() => router.push('/quiz')} className="text-sm text-sayu-dark-gray hover:text-sayu-black transition-colors">
                APT 테스트
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                로그인
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/quiz')}>
                시작하기
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section - Carousel */}
      <section className="relative bg-sayu-off-white">
        <Container size="2xl" noPadding>
          <div className="relative h-[600px] overflow-hidden">
            {/* Slides */}
            {featuredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: currentSlide === index ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-2 h-full">
                  {/* Image */}
                  <div className="relative bg-sayu-light-gray">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col justify-center px-20">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 20 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Text size="sm" color="tertiary" className="mb-2">
                        {artwork.museum}
                      </Text>
                      <Heading as="h1" className="mb-4">
                        {artwork.title}
                      </Heading>
                      <Text size="lg" color="secondary" className="mb-8">
                        {artwork.artist}
                      </Text>
                      <Button variant="primary" onClick={() => router.push('/gallery')}>
                        자세히 보기
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-sayu-black" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-sayu-black" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredArtworks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-sayu-accent w-8' : 'bg-sayu-mid-gray'
                  }`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container size="2xl" className="py-20">
        {/* Intro Text */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Heading as="h2" className="mb-4">
            예술과 함께 진정한 나를 발견하는 여정
          </Heading>
          <Text size="lg" color="secondary" className="leading-relaxed">
            SAYU는 당신만의 예술적 성향을 발견하고, 세계의 명작들을 탐험하며,
            같은 취향을 가진 사람들과 연결되는 공간입니다.
          </Text>
        </div>

        {/* APT Quiz CTA - Prominent */}
        <Card className="mb-20 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-sayu-accent flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <Heading as="h3" serif={false} className="mb-2">
                  나의 예술 성향 발견하기
                </Heading>
                <Text color="secondary">
                  간단한 테스트로 당신만의 APT(Art Personality Type)를 찾아보세요
                </Text>
              </div>
            </div>
            <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
              테스트 시작
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          <Card className="text-center p-8">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-sayu-accent" />
            </div>
            <Text size="xs" color="tertiary" className="mb-1 uppercase tracking-wider">
              Today
            </Text>
            <Heading as="h3" serif={false}>
              {todayUsers}명
            </Heading>
            <Text size="sm" color="secondary" className="mt-2">
              새로운 Art Persona 발견
            </Text>
          </Card>

          <Card className="text-center p-8">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-sayu-accent-cool" />
            </div>
            <Text size="xs" color="tertiary" className="mb-1 uppercase tracking-wider">
              Artworks
            </Text>
            <Heading as="h3" serif={false}>
              10,234
            </Heading>
            <Text size="sm" color="secondary" className="mt-2">
              큐레이션된 작품
            </Text>
          </Card>

          <Card className="text-center p-8">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-sayu-accent-warm" />
            </div>
            <Text size="xs" color="tertiary" className="mb-1 uppercase tracking-wider">
              Community
            </Text>
            <Heading as="h3" serif={false}>
              2,450
            </Heading>
            <Text size="sm" color="secondary" className="mt-2">
              활동 중인 멤버
            </Text>
          </Card>
        </div>

        {/* Featured Collections Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <Heading as="h2">Featured Collections</Heading>
            <button
              onClick={() => router.push('/gallery')}
              className="text-sm text-sayu-accent-cool hover:underline flex items-center gap-1"
            >
              모두 보기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {featuredArtworks.map((artwork) => (
              <Card
                key={artwork.id}
                padding="none"
                clickable
                onClick={() => router.push('/gallery')}
              >
                <div className="relative aspect-[3/4] bg-sayu-light-gray overflow-hidden">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <Text size="sm" weight="semibold" className="mb-1 line-clamp-1">
                    {artwork.title}
                  </Text>
                  <Text size="xs" color="secondary" className="line-clamp-1">
                    {artwork.artist}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 border-t border-sayu-border">
          <Heading as="h3" className="mb-4">
            지금 시작하세요
          </Heading>
          <Text size="lg" color="secondary" className="mb-6">
            오늘 {todayUsers}명이 새로운 Art Persona를 발견했어요.
          </Text>
          <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
            나의 예술 성향 찾기
          </Button>
        </div>
      </Container>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';
import { Container, Card, Button, Heading, Text } from '@/components/design-system';
import { Sparkles, ArrowRight, Heart, Users, Eye, TrendingUp } from 'lucide-react';

// Mobile component
const MobileHomePage = dynamic(() => import('./MobileHomePageFixed'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4" />
    </div>
  ),
});

// Featured artworks
const featuredArtworks = [
  {
    id: 1,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: '별이 빛나는 밤',
    artist: '빈센트 반 고흐',
  },
  {
    id: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1200px-Monet_Water_Lilies_1916.jpg',
    title: '수련',
    artist: '클로드 모네',
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg',
    title: '키스',
    artist: '구스타프 클림트',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [todayUsers] = useState(47);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (isMobile) return <MobileHomePage />;

  // Auto-rotate artworks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % featuredArtworks.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-black/5">
        <Container size="2xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Bold */}
            <button onClick={() => router.push('/')} className="text-3xl font-bold tracking-tight">
              SAYU
            </button>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-10">
              <button
                onClick={() => router.push('/exhibitions')}
                className="text-base hover:opacity-60 transition-opacity"
              >
                전시
              </button>
              <button
                onClick={() => router.push('/gallery')}
                className="text-base hover:opacity-60 transition-opacity"
              >
                갤러리
              </button>
              <button
                onClick={() => router.push('/quiz')}
                className="text-base font-medium hover:opacity-60 transition-opacity"
              >
                APT 테스트
              </button>
            </div>

            {/* CTA */}
            <Button variant="primary" onClick={() => router.push('/quiz')}>
              시작하기
            </Button>
          </div>
        </Container>
      </nav>

      {/* Hero Section - Full Screen with Big Typography */}
      <section className="relative h-screen flex items-center pt-20">
        <Container size="2xl">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left - Big Typography */}
            <div className="col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-[2px] bg-black" />
                  <span className="text-sm font-medium tracking-widest uppercase">
                    Art Discovery Platform
                  </span>
                </div>

                {/* Main Headline - HUGE */}
                <h1 className="text-[5.5rem] leading-[1.1] font-bold tracking-tight mb-8">
                  예술과 함께<br />
                  진정한 나를<br />
                  <span className="italic font-serif">발견하는</span> 여정
                </h1>

                {/* Subheading */}
                <p className="text-xl leading-relaxed mb-12 max-w-lg">
                  당신만의 예술적 성향을 발견하고,
                  세계의 명작들을 탐험하며,
                  같은 취향의 사람들과 연결되세요.
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
                    <Sparkles className="w-5 h-5" />
                    APT 테스트 시작
                  </Button>
                  <button
                    onClick={() => router.push('/gallery')}
                    className="text-base font-medium hover:opacity-60 transition-opacity flex items-center gap-2"
                  >
                    갤러리 둘러보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Stats - Fun Point! */}
                <motion.div
                  className="mt-16 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>오늘 <strong>{todayUsers}명</strong>이 Art Persona를 발견했어요</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Right - Artwork Showcase with Parallax */}
            <div className="col-span-5">
              <motion.div
                className="relative"
                style={{
                  x: mousePosition.x,
                  y: mousePosition.y,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                {/* Main Image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                  {featuredArtworks.map((artwork, index) => (
                    <motion.div
                      key={artwork.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: currentArtwork === index ? 1 : 0 }}
                      transition={{ duration: 1 }}
                    >
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />

                      {/* Info overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <p className="text-sm opacity-80 mb-1">{artwork.artist}</p>
                        <p className="text-2xl font-bold">{artwork.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Card - Fun Point! */}
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-black/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm font-medium mb-1">Featured Collection</p>
                  <p className="text-xs opacity-60">10,234 artworks curated</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section - Asymmetric Layout (Fun!) */}
      <section className="py-32 bg-neutral-50">
        <Container size="2xl">
          <div className="grid grid-cols-12 gap-8">
            {/* Large stat */}
            <div className="col-span-5">
              <div className="sticky top-32">
                <div className="mb-4">
                  <div className="text-[8rem] font-bold leading-none tracking-tighter">
                    {todayUsers}
                  </div>
                  <p className="text-xl mt-4">
                    새로운 Art Persona<br />발견 (오늘)
                  </p>
                </div>
              </div>
            </div>

            {/* Small stats - Stacked */}
            <div className="col-span-7 space-y-6">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <Eye className="w-8 h-8 mb-4" />
                <div className="text-4xl font-bold mb-2">10,234</div>
                <p className="text-lg">큐레이션된 명작</p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <Users className="w-8 h-8 mb-4" />
                <div className="text-4xl font-bold mb-2">2,450</div>
                <p className="text-lg">활동 중인 커뮤니티 멤버</p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <Heart className="w-8 h-8 mb-4" />
                <div className="text-4xl font-bold mb-2">156</div>
                <p className="text-lg">진행 중인 전시</p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery Preview - Horizontal Scroll */}
      <section className="py-32">
        <Container size="2xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-5xl font-bold mb-4">Featured Artworks</h2>
              <p className="text-xl opacity-60">당신을 위한 큐레이션</p>
            </div>
            <button
              onClick={() => router.push('/gallery')}
              className="text-base font-medium hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal scroll */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {[...featuredArtworks, ...featuredArtworks].map((artwork, index) => (
              <motion.div
                key={`${artwork.id}-${index}`}
                className="flex-shrink-0 w-[300px] group cursor-pointer"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push('/gallery')}
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-semibold mb-1">{artwork.title}</p>
                <p className="text-sm opacity-60">{artwork.artist}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA - Full Width */}
      <section className="py-32 bg-black text-white">
        <Container size="2xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl font-bold mb-8">
                당신의 Art Persona를<br />
                발견할 시간
              </h2>
              <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">
                단 5분이면 당신만의 예술적 성향을 알 수 있어요
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/quiz')}
                className="bg-white text-black hover:bg-white/90"
              >
                <Sparkles className="w-5 h-5" />
                무료로 시작하기
              </Button>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
}

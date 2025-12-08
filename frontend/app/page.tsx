'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';
import { Container, Card, Button } from '@/components/design-system';
import { Sparkles, ArrowRight, Users, Eye, MessageSquare, TrendingUp, Palette } from 'lucide-react';

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

  if (isMobile) return <MobileHomePage />;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
        <Container size="2xl">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => router.push('/')} className="text-2xl font-bold text-black">
              SAYU
            </button>

            <div className="hidden md:flex items-center gap-10">
              <button onClick={() => router.push('/exhibitions')} className="text-black hover:text-neutral-600 transition-colors">
                전시
              </button>
              <button onClick={() => router.push('/gallery')} className="text-black hover:text-neutral-600 transition-colors">
                갤러리
              </button>
              <button onClick={() => router.push('/quiz')} className="text-black font-medium hover:text-neutral-600 transition-colors">
                APT 테스트
              </button>
            </div>

            <Button variant="primary" onClick={() => router.push('/quiz')}>
              시작하기
            </Button>
          </div>
        </Container>
      </nav>

      {/* Hero - Full Screen */}
      <section className="relative h-screen flex items-center pt-20">
        <Container size="2xl">
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left - Typography */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-[2px] bg-black" />
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-black">
                    Art Discovery Platform
                  </span>
                </div>

                <h1 className="text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-black">
                  예술과 함께<br />
                  진정한 나를<br />
                  발견하는 여정
                </h1>

                <p className="text-xl leading-relaxed mb-10 text-black max-w-lg">
                  당신만의 예술적 성향을 발견하고, 세계의 명작들을 탐험하며, 같은 취향의 사람들과 연결되세요.
                </p>

                <div className="flex items-center gap-4">
                  <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
                    <Sparkles className="w-5 h-5" />
                    APT 테스트 시작
                  </Button>
                  <button
                    onClick={() => router.push('/gallery')}
                    className="text-base font-medium text-black hover:text-neutral-600 transition-colors flex items-center gap-2"
                  >
                    둘러보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Live badge */}
                <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-white">오늘 <strong>{todayUsers}명</strong>이 발견했어요</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Artwork */}
            <div className="relative h-[600px]">
              {featuredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentArtwork === index ? 1 : 0 }}
                  transition={{ duration: 1 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <p className="text-sm mb-1 text-white/80">{artwork.artist}</p>
                      <p className="text-2xl font-bold text-white">{artwork.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Indicators */}
              <div className="absolute bottom-8 right-8 flex gap-2">
                {featuredArtworks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentArtwork(index)}
                    className={`h-1 transition-all ${
                      currentArtwork === index ? 'w-8 bg-white' : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section - 실제 기능 소개 */}
      <section className="py-32 border-t border-neutral-200">
        <Container size="2xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 text-black">SAYU가 제공하는 경험</h2>
            <p className="text-xl text-black">예술을 통한 자기 발견의 여정</p>
          </div>

          <div className="space-y-24">
            {/* Feature 1 - APT Test */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  APT 테스트
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  나만의 Art Persona<br />발견하기
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  16가지 예술 성향 중 당신의 유형을 찾아보세요.
                  5분의 테스트로 당신이 어떤 방식으로 예술을 감상하고,
                  어떤 작품에 끌리는지 알 수 있습니다.
                </p>
                <Button variant="outline" onClick={() => router.push('/quiz')}>
                  테스트 하러가기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center">
                <Palette className="w-24 h-24 text-neutral-400" />
              </div>
            </div>

            {/* Feature 2 - Gallery */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center">
                <Eye className="w-24 h-24 text-neutral-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">
                  갤러리
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  세계의 명작을<br />한곳에서
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  10,000점 이상의 큐레이션된 작품을 탐험하세요.
                  당신의 APT 유형에 맞춰 추천되는 작품부터,
                  시대와 장르를 넘나드는 명작까지.
                </p>
                <Button variant="outline" onClick={() => router.push('/gallery')}>
                  갤러리 둘러보기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Feature 3 - Community */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">
                  커뮤니티
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  같은 취향의<br />사람들과 연결
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  비슷한 APT 유형을 가진 사람들과 만나 작품을 공유하고,
                  전시를 함께 방문하며, 예술에 대한 대화를 나눠보세요.
                </p>
                <Button variant="outline" onClick={() => router.push('/community')}>
                  커뮤니티 참여하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center">
                <Users className="w-24 h-24 text-neutral-400" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery Grid - 둥근 테두리 제거 */}
      <section className="py-32 bg-neutral-50">
        <Container size="2xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-5xl font-bold mb-2 text-black">Featured Collection</h2>
              <p className="text-lg text-black">엄선된 명작들</p>
            </div>
            <button
              onClick={() => router.push('/gallery')}
              className="text-base font-medium text-black hover:text-neutral-600 transition-colors flex items-center gap-2"
            >
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {featuredArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className="group cursor-pointer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => router.push('/gallery')}
              >
                <div className="relative aspect-[3/4] bg-neutral-200 overflow-hidden mb-4">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-semibold mb-1 text-black">{artwork.title}</p>
                <p className="text-sm text-neutral-600">{artwork.artist}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA - 개선 */}
      <section className="py-32">
        <Container size="2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-6xl font-bold mb-6 text-black">
              지금 시작하세요
            </h2>
            <p className="text-xl text-black mb-10">
              5분이면 당신만의 예술적 성향을 발견할 수 있습니다.<br />
              오늘 {todayUsers}명이 이미 발견했어요.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
              <Sparkles className="w-5 h-5" />
              무료로 시작하기
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useResponsive } from '@/lib/responsive';
import { Container, Button } from '@/components/design-system';
import { Sparkles, ArrowRight, MessageSquare, TrendingUp } from 'lucide-react';

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
    title: '당신에게 추천하는 작품',
    artworks: featuredArtworks.slice(0, 2),
    exhibition: { name: '이불 개인전 · 서울시립미술관', location: '서소문본관 2층 미디어룸' },
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
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [currentAptSlide, setCurrentAptSlide] = useState(0);
  const [todayUsers] = useState(47);

  // if (isMobile) return <MobileHomePage />;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const aptTimer = setInterval(() => {
      setCurrentAptSlide((prev) => (prev + 1) % aptSlides.length);
    }, 4000);
    return () => clearInterval(aptTimer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: '#D4A520' }}>
        <Container size="2xl">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => router.push('/')} className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
              SAYU
            </button>
            <div className="flex items-center gap-6">
              <button onClick={() => router.push('/gallery')} className="text-white hover:text-white/80 transition-colors font-medium">
                갤러리
              </button>
              <button onClick={() => router.push('/exhibitions')} className="text-white hover:text-white/80 transition-colors font-medium">
                전시
              </button>
              <button onClick={() => router.push('/community')} className="text-white hover:text-white/80 transition-colors font-medium">
                커뮤니티
              </button>
              <button
                onClick={() => router.push('/quiz')}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                APT 테스트
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero */}
      <section className="relative flex items-start pt-32 pb-20">
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
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-black">Art Discovery Platform</span>
                </div>

                <h1 className="text-7xl font-bold leading-[1.1] tracking-tight mb-8" style={{ color: '#000000' }}>
                  예술과 함께
                  <br />
                  나만의 취향을
                  <br />
                  찾아가는 시간
                </h1>

                <p className="text-xl leading-relaxed mb-10 text-black max-w-lg">
                  당신만의 예술적 성향을 발견하고, 세계의 명작들을 탐험하며, 같은 취향의 사람들과 연결되세요.
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/quiz')}
                    className="px-6 py-3 bg-black text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:bg-[#D4A520] hover:text-white"
                  >
                    <Sparkles className="w-5 h-5" />
                    APT 테스트 시작
                  </button>
                  <button
                    onClick={() => router.push('/gallery')}
                    className="text-base font-medium text-black hover:text-neutral-600 transition-colors flex items-center gap-2"
                  >
                    둘러보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-12 text-sm text-black">오늘 {todayUsers}명이 발견했어요.</div>
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

              <div className="absolute bottom-8 right-8 flex gap-2">
                {featuredArtworks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentArtwork(index)}
                    className={`h-1 transition-all ${currentArtwork === index ? 'w-8 bg-white' : 'w-1 bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-neutral-200">
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
                  <Sparkles className="w-3 h-3" />APT 테스트
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  나만의 Art Persona
                  <br />
                  발견하기
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  16가지 예술 성향 중 당신의 유형을 찾아보세요. 5분의 테스트로 당신이 어떤 방식으로 예술을 감상하고, 어떤 작품에 끌리는지 알 수 있습니다.
                </p>
                <Button
                  variant="outline"
                  className="hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                  onClick={() => router.push('/quiz')}
                >
                  테스트 하러가기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl">
                <AnimatePresence mode="wait">
                  {aptSlides.map((slide, index) => index === currentAptSlide && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
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
                          <div className="grid grid-cols-2 gap-3">
                            {slide.artworks.map((artwork) => (
                              <div key={artwork.id} className="relative h-48 rounded-xl overflow-hidden border border-neutral-200">
                                <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white text-lg">🏛️</div>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-black">{slide.exhibition.name}</p>
                                <p className="text-xs text-neutral-600">{slide.exhibition.location}</p>
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
                  {aptSlides.map((_, index) => (
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

            {/* Feature 2 - Gallery */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm p-6">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                      갤러리
                    </div>
                    <div className="text-xs text-neutral-500">추천 · 10,000+ 작품</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {featuredArtworks.map((art) => (
                      <div key={art.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200">
                        <Image src={art.image} alt={art.title} fill className="object-cover" />
                        <div className="absolute bottom-2 left-2 text-white text-xs drop-shadow">
                          <p className="font-semibold">{art.title}</p>
                          <p className="text-white/80">{art.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs text-neutral-700 flex-wrap">
                    <span className="px-2 py-1 rounded-full bg-neutral-100">인상주의</span>
                    <span className="px-2 py-1 rounded-full bg-neutral-100">색채 중심</span>
                    <span className="px-2 py-1 rounded-full bg-neutral-100">추천 98%</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">갤러리</div>
                <h3 className="text-4xl font-bold mb-6 text-black">세계의 명작을 한곳에서</h3>
                <p className="text-lg leading-relaxed text-black mb-8">10,000점 이상의 큐레이션된 작품을 탐험하세요. 당신의 Art Persona Type에 맞춰 추천되는 작품부터, 시대와 장르를 넘나드는 명작까지.</p>
                <Button
                  variant="outline"
                  className="hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                  onClick={() => router.push('/gallery')}
                >
                  갤러리 둘러보기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Feature 3 - Community */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">커뮤니티</div>
                <h3 className="text-4xl font-bold mb-6 text-black">같은 취향의 사람들과 연결</h3>
                <p className="text-lg leading-relaxed text-black mb-8">비슷한 Art Persona Type을 가진 사람들과 만나 작품을 공유하고, 전시를 함께 방문하며, 예술에 대한 대화를 나눠보세요.</p>
                <Button
                  variant="outline"
                  className="hover:bg-[#D4A520] hover:text-white hover:border-[#D4A520]"
                  onClick={() => router.push('/community')}
                >
                  커뮤니티 참여하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neutral-700" />
                    <span className="text-sm font-semibold text-neutral-800">전시 동행 · 실시간</span>
                  </div>
                  <span className="text-xs text-neutral-500">APT 타입 매칭</span>
                </div>
                <div className="space-y-2">
                  {communityFeeds.map((feed) => (
                    <div key={feed.name} className="rounded-2xl bg-white border border-neutral-200 p-4 flex items-center justify-between">
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
                  지금 전시 동행 제안 보내기...
                </div>
              </div>
            </div>

            {/* Featured Collection */}
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-5xl font-bold mb-2 text-black">Featured Collection</h2>
                  <p className="text-lg text-neutral-800">엄선된 명작들</p>
                </div>
                <Button
                  variant="ghost"
                  className="hover:bg-[#D4A520]/10 text-neutral-800"
                  onClick={() => router.push('/gallery')}
                >
                  전체 보기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {featuredArtworks.map((art) => (
                  <div key={art.id} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] bg-neutral-200 overflow-hidden mb-3 rounded-xl border border-neutral-200">
                      <Image src={art.image} alt={art.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <p className="font-semibold mb-1 text-black">{art.title}</p>
                    <p className="text-sm text-neutral-600">{art.artist}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center bg-neutral-50 border border-neutral-200 rounded-3xl py-16 px-8 space-y-4">
              <h2 className="text-6xl font-bold text-black">지금 시작하세요</h2>
              <p className="text-xl text-neutral-700 leading-relaxed space-y-1">
                5분이면 당신만의 Art Persona Type을 발견할 수 있습니다.
                <br />
                오늘 {todayUsers}명이 이미 발견했어요.
              </p>
              <Button
                variant="primary"
                className="bg-black text-white hover:bg-[#D4A520] hover:text-white"
                onClick={() => router.push('/quiz')}
              >
                무료로 시작하기
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

const scenarioOptions = [
  { key: 'A', label: '빛 좋은 2전시실에서 분위기 먼저 살피기' },
  { key: 'B', label: '대표작 앞에서 바로 감상 시작' },
  { key: 'C', label: '조용한 아카이브 존에서 스케치부터' },
];

const communityFeeds = [
  { name: 'sj.moment', msg: '토요일 오후 3시 한 번 전시 같이 보실 분?', badge: 'LAEF · 96%', tone: 'bg-emerald-500 text-white' },
  { name: 'art_watcher', msg: '국현 근처 카페에서 감상 모임 열어요', badge: 'SRMC · 82%', tone: 'bg-blue-500 text-white' },
  { name: 'gallery_buddy', msg: '새 전시 오픈런 팀 모집!', badge: 'LAMF · 78%', tone: 'bg-amber-500 text-white' },
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
      {/* Hero */}
      <section className="relative flex items-start pt-16 pb-20">
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
                  <span className="text-white">
                    오늘 <strong>{todayUsers}명</strong>이 발견했어요
                  </span>
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
                  <Sparkles className="w-3 h-3" />
                  APT 테스트
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  나만의 Art Persona
                  <br />
                  발견하기
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  16가지 예술 성향 중 당신의 유형을 찾아보세요. 5분의 테스트로 당신이 어떤 방식으로 예술을 감상하고, 어떤 작품에 끌리는지 알 수 있습니다.
                </p>
                <Button variant="outline" onClick={() => router.push('/quiz')}>
                  테스트 하러가기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl grid grid-cols-2">
                {/* Left: 실제 내러티브 퀴즈 느낌 */}
                <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-white">
                  <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.14em] text-white/70">
                    <span>Scene 02 · Exploration</span>
                    <span>남은 문항 6</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold leading-tight">2전시실, 어디부터 볼까요?</p>
                    <p className="text-sm text-white/70">당신의 관람 흐름을 따라 맞춤 타입을 찾고 있어요.</p>
                  </div>
                  <div className="space-y-2">
                    {scenarioOptions.map((option, idx) => (
                      <div
                        key={option.key}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm border ${
                          idx === 0
                            ? 'bg-white text-black border-white shadow-sm'
                            : 'bg-white/5 text-white border-white/15'
                        }`}
                      >
                        <span
                          className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                            idx === 0 ? 'bg-black text-white' : 'bg-white/10 text-white'
                          }`}
                        >
                          {option.key}
                        </span>
                        <span className="leading-snug">{option.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="h-2 flex-1 bg-white/15 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white" />
                      </div>
                      <span>스토리 진행 63%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-white/80">
                      <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">공간 스캔 중</span>
                      <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">감정 신호 수집</span>
                    </div>
                  </div>
                </div>

                {/* Right: 결과/매칭 가독성 강화 */}
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white">APT 실시간 매칭</span>
                    <span className="text-neutral-400">실시간 업데이트</span>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-semibold">
                          LAEF
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-neutral-900">여유 · 감성형</p>
                          <p className="text-xs text-neutral-600">몰입 · 직관 큐레이터</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-neutral-900">92%</p>
                        <p className="text-[11px] text-green-600">적합도</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-neutral-800">
                      <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 leading-snug">
                        추천 동선: 몰입형 전시 · 미디어 아트
                      </div>
                      <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 leading-snug">
                        함께 보면 좋은 타입: SAEF, LREF
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>오늘의 추천</span>
                      <span className="text-neutral-400">동선 · 전시 · 커뮤니티</span>
                    </div>
                    <ul className="space-y-1 text-sm text-neutral-800">
                      <li>· 전시 동선: 2전시실 → 몰입형 미디어룸 → 카페</li>
                      <li>· 작품 포커스: 빛/색감이 강한 회화 3점</li>
                      <li>· 커뮤니티: LAEF 관람 메이트 2명 매칭</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Gallery */}
            <div className="grid grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm p-6">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                      APT 맞춤 큐레이션
                    </div>
                    <div className="text-xs text-neutral-500">필터: 몰입형 · 색채 · 1890s</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl overflow-hidden border border-neutral-100 shadow-sm relative">
                      <Image
                        src={featuredArtworks[0].image}
                        alt={featuredArtworks[0].title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                        <p className="text-xs text-white/80">{featuredArtworks[0].artist}</p>
                        <p className="text-lg font-semibold">{featuredArtworks[0].title}</p>
                        <div className="flex items-center justify-between text-[11px] text-white/80">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> APT 맞춤 98%
                          </span>
                          <span>타입: LAEF</span>
                        </div>
                        <p className="text-[11px] text-white/70">추천 이유: 색채 집중 · 몰입형 관람 패턴</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {featuredArtworks.map((artwork) => (
                        <div
                          key={artwork.id}
                          className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 shadow-sm"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-100">
                            <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-900">{artwork.title}</p>
                            <p className="text-xs text-neutral-600 mb-1">{artwork.artist}</p>
                            <div className="flex items-center gap-2 text-[11px] text-green-600">
                              <TrendingUp className="w-3 h-3" /> 97% 매칭 · 유사 작품 24개 추천됨
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600">
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50">#개인 컬렉션 추천</span>
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50">#전시 예약 연동</span>
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50">#AI 큐레이션 근거</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-medium mb-4 rounded-full">
                  갤러리
                </div>
                <h3 className="text-4xl font-bold mb-6 text-black">
                  세계의 명작을
                  <br />
                  한곳에서
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  10,000점 이상의 큐레이션된 작품을 탐험하세요. 당신의 APT 유형에 맞춰 추천되는 작품부터, 시대와 장르를 넘나드는 명작까지.
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
                  같은 취향의
                  <br />
                  사람들과 연결
                </h3>
                <p className="text-lg leading-relaxed text-black mb-8">
                  비슷한 APT 유형을 가진 사람들과 만나 작품을 공유하고, 전시를 함께 방문하며, 예술에 대한 대화를 나눠보세요.
                </p>
                <Button variant="outline" onClick={() => router.push('/community')}>
                  커뮤니티 참여하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative aspect-[4/3] rounded-3xl border border-neutral-200 bg-white shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    전시 동행 · 실시간
                  </div>
                  <span className="text-neutral-800 text-base font-semibold">APT 타입 매칭</span>
                </div>
                <div className="space-y-3">
                  {communityFeeds.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${item.tone}`}>
                        {item.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
                          <span>@{item.name}</span>
                          <span className="text-base font-semibold text-green-700">{item.badge}</span>
                        </div>
                        <p className="text-sm text-neutral-700 mt-1">{item.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700 bg-neutral-50">
                    지금 전시 동행 제안 보내기...
                  </div>
                  <button className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery Grid */}
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

      {/* Final CTA */}
      <section className="py-32">
        <Container size="2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-6xl font-bold mb-6 text-black">지금 시작하세요</h2>
            <p className="text-xl text-black mb-10">
              5분이면 당신만의 예술적 성향을 발견할 수 있습니다.
              <br />
              오늘 {todayUsers}명이 이미 발견했어요.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/quiz')}>
              <Sparkles className="w-5 h-5" />
              무료로 시작하기
            </Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12">
        <Container size="2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-black mb-2">SAYU</p>
              <p className="text-sm text-neutral-600">예술을 통한 자기 발견</p>
            </div>

            <div className="flex gap-12">
              <div>
                <p className="text-sm font-medium text-black mb-3">탐색</p>
                <div className="space-y-2">
                  <button onClick={() => router.push('/gallery')} className="block text-sm text-neutral-600 hover:text-black">
                    갤러리
                  </button>
                  <button onClick={() => router.push('/exhibitions')} className="block text-sm text-neutral-600 hover:text-black">
                    전시
                  </button>
                  <button onClick={() => router.push('/community')} className="block text-sm text-neutral-600 hover:text-black">
                    커뮤니티
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-black mb-3">정보</p>
                <div className="space-y-2">
                  <button onClick={() => router.push('/about')} className="block text-sm text-neutral-600 hover:text-black">
                    소개
                  </button>
                  <button className="block text-sm text-neutral-600 hover:text-black">이용약관</button>
                  <button className="block text-sm text-neutral-600 hover:text-black">개인정보처리방침</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-xs text-neutral-600">© 2025 SAYU. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="text-xs text-neutral-600 hover:text-black">Instagram</button>
              <button className="text-xs text-neutral-600 hover:text-black">Twitter</button>
              <button className="text-xs text-neutral-600 hover:text-black">Email</button>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

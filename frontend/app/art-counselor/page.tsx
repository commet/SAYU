'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Clock, BookOpen, HeartHandshake, Feather, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type CounselorArtwork = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  heroImage: string;
  summary: string;
  moodTags: string[];
  personalityFit: string[];
  durationMinutes?: number;
};

type CounselorProgress = {
  completedSessions: number;
  weeklyStreak: number;
  lastEmotion: string;
  lastArtworkTitle?: string;
  lastUpdated?: string;
};

type MemorySnippet = {
  id: string;
  content: string;
  theme?: string;
  emotion?: string;
  createdAt?: string;
};

type JournalEntryPreview = {
  id: string;
  artworkTitle?: string;
  artworkArtist?: string;
  emotionalResponse?: string;
  intensity?: number | string;
  createdAt?: string;
};

const OFFLINE_ARTWORKS: CounselorArtwork[] = [
  {
    id: 'claude-monet-water-lilies-1906',
    title: 'Water Lilies, Morning Light',
    artist: 'Claude Monet',
    year: '1906',
    heroImage: 'https://images.unsplash.com/photo-1500346138972-dc5b229af4ad?auto=format&fit=crop&w=900&q=80',
    summary: '모네가 백내장을 견디며 그린 아침의 호수 빛. 잔잔한 파동과 빛의 움직임을 통해 감정의 층을 여는 작품입니다.',
    moodTags: ['calm', 'wonder', 'reflection'],
    personalityFit: ['LAEF', 'SAEF', 'LRMF'],
    durationMinutes: 6,
  },
  {
    id: 'piet-mondrian-composition-1921',
    title: 'Composition with Red, Yellow and Blue',
    artist: 'Piet Mondrian',
    year: '1921',
    heroImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80',
    summary: '수직과 수평의 완벽한 조화. 복잡한 감정을 단순한 구조로 정리하고 싶을 때 적합한 작품입니다.',
    moodTags: ['contemplative', 'structured', 'clarity'],
    personalityFit: ['LAMF', 'LRMC', 'SRMF'],
    durationMinutes: 8,
  },
  {
    id: 'kim-whanki-universe-1969',
    title: '25-VII-69 #200 (Universe)',
    artist: '김환기',
    year: '1969',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    summary: '밤하늘을 닮은 점묘의 리듬. 호흡을 고르고 내면의 패턴을 찾도록 돕는 명상형 작품입니다.',
    moodTags: ['cosmic', 'meditative', 'steady'],
    personalityFit: ['LAMF', 'LRMC', 'SRMF'],
    durationMinutes: 8,
  },
];

const OFFLINE_PROGRESS: CounselorProgress = {
  completedSessions: 0,
  weeklyStreak: 0,
  lastEmotion: '아직 세션 기록이 없어요',
};

const OFFLINE_JOURNAL_ENTRIES: JournalEntryPreview[] = [
  {
    id: 'offline-journal-1',
    artworkTitle: 'Water Lilies',
    artworkArtist: 'Claude Monet',
    emotionalResponse: '차분함과 동시에 잔잔한 기쁨이 올라왔어요.',
    intensity: 0.42,
    createdAt: new Date().toISOString(),
  },
];

const OFFLINE_MEMORY_SNIPPETS: MemorySnippet[] = [
  {
    id: 'offline-memory-1',
    content: '하늘을 바라볼 때마다 떠올릴 수 있는 작은 루틴을 만들었어요.',
    theme: 'connection',
    emotion: 'hopeful',
    createdAt: new Date().toISOString(),
  },
];

const BACKEND_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

const fetchArtCounselor = async (endpoint: string, init?: RequestInit) => {
  const sanitized = endpoint.replace(/^\/+/, '');
  const requestInit: RequestInit = {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(init?.headers || {}),
    },
  };

  const proxyUrl = `/api/art-counselor/${sanitized}`;

  try {
    const response = await fetch(proxyUrl, requestInit);
    if (!response.ok && BACKEND_API_URL) {
      return fetch(`${BACKEND_API_URL}/api/art-counselor/${sanitized}`, requestInit);
    }
    return response;
  } catch (error) {
    if (BACKEND_API_URL) {
      return fetch(`${BACKEND_API_URL}/api/art-counselor/${sanitized}`, requestInit);
    }
    throw error;
  }
};

const toCounselorArtwork = (payload?: any, fallback?: Partial<CounselorArtwork>): CounselorArtwork | null => {
  if (!payload) return null;
  const base = {
    ...fallback,
    ...payload,
  };

  return {
    id: base.id ?? base.artworkId ?? '',
    title: base.title ?? base.artworkTitle ?? fallback?.title ?? 'Untitled',
    artist: base.artist ?? base.artworkArtist ?? '',
    year: base.year ?? base.artworkYear,
    heroImage: base.heroImage ?? base.imageUrl ?? base.image_url ?? OFFLINE_ARTWORKS[0].heroImage,
    summary:
      base.summary ??
      base.story ??
      base.preview ??
      base.synopsis ??
      fallback?.summary ??
      '작품 소개가 준비 중입니다.',
    moodTags: base.moodTags ?? base.emotions ?? base.tags ?? [],
    personalityFit: base.personalityFit ?? base.recommendedPersonalities ?? [],
    durationMinutes: base.durationMinutes ?? base.estimatedDuration ?? fallback?.durationMinutes,
  };
};

export default function ArtCounselorLandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [artworks, setArtworks] = useState<CounselorArtwork[]>(OFFLINE_ARTWORKS);
  const [todayArtwork, setTodayArtwork] = useState<CounselorArtwork | null>(null);
  const [progress, setProgress] = useState<CounselorProgress>(OFFLINE_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memorySnippets, setMemorySnippets] = useState<MemorySnippet[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryPreview[]>([]);
  const [insightLoading, setInsightLoading] = useState(true);

  const greeting = useMemo(() => {
    if (authLoading) return 'Art Companion';
    const nickname = user?.nickname || user?.full_name || user?.email?.split('@')[0];
    return nickname ? `${nickname}의 Art Companion` : 'Art Companion';
  }, [authLoading, user]);

  const displayJournalEntries =
    journalEntries.length > 0
      ? journalEntries
      : !insightLoading
      ? OFFLINE_JOURNAL_ENTRIES
      : [];
  const displayMemorySnippets =
    memorySnippets.length > 0
      ? memorySnippets
      : !insightLoading
      ? OFFLINE_MEMORY_SNIPPETS
      : [];

  useEffect(() => {
    let ignore = false;

    async function loadArtCounselorData() {
      setLoading(true);
      setError(null);

      try {
        const [todayRes, artworksRes, progressRes] = await Promise.allSettled([
          fetchArtCounselor('today'),
          fetchArtCounselor('artworks?limit=6'),
          fetchArtCounselor('progress'),
        ]);

        if (!ignore && artworksRes.status === 'fulfilled' && artworksRes.value.ok) {
          const json = await artworksRes.value.json();
          const rawList = Array.isArray(json?.data)
            ? json?.data
            : json?.data?.records ?? [];
          const items: CounselorArtwork[] = rawList
            .map((item: any) => toCounselorArtwork(item))
            .filter(Boolean) as CounselorArtwork[];

          if (items.length) {
            setArtworks(items);
          }
        }

        if (!ignore && todayRes.status === 'fulfilled' && todayRes.value.ok) {
          const json = await todayRes.value.json();
          const data = json?.data ?? json;
          const primary = data?.artwork ?? data ?? null;
          const normalized = toCounselorArtwork(primary, {
            id: data?.artworkId,
          });
          if (normalized) {
            setTodayArtwork(normalized);
          }
        } else if (!ignore) {
          setTodayArtwork(OFFLINE_ARTWORKS[0]);
        }

        if (!ignore && progressRes.status === 'fulfilled' && progressRes.value.ok) {
          const json = await progressRes.value.json();
          const data = json?.data ?? json;
          if (data) {
            setProgress({
              completedSessions: data.completedSessions ?? data.totalSessions ?? 0,
              weeklyStreak: data.weeklyStreak ?? data.currentStreak ?? 0,
              lastEmotion: data.lastEmotion ?? data.lastMood ?? OFFLINE_PROGRESS.lastEmotion,
              lastArtworkTitle: data.lastArtworkTitle ?? data.lastArtwork?.title,
              lastUpdated: data.lastCompletedAt ?? data.updatedAt,
            });
          }
        }

        if (
          (todayRes.status === 'rejected' ||
            artworksRes.status === 'rejected' ||
            progressRes.status === 'rejected') &&
          !ignore
        ) {
          const reason =
            (todayRes.status === 'rejected' && todayRes.reason?.message) ||
            (artworksRes.status === 'rejected' && artworksRes.reason?.message) ||
            (progressRes.status === 'rejected' && progressRes.reason?.message) ||
            'Art Counselor API 응답이 없습니다. 백엔드를 확인해 주세요.';
          setError(reason);
          if (!todayArtwork) {
            setTodayArtwork(OFFLINE_ARTWORKS[0]);
          }
        }

      } catch (err) {
        console.error('[ArtCounselor] landing fetch failed', err);
        if (!ignore) {
          setError(
            '라이브 데이터를 불러오지 못했습니다. 백엔드 상태를 확인하고 다시 시도해주세요.',
          );
          setTodayArtwork(OFFLINE_ARTWORKS[0]);
          setProgress(OFFLINE_PROGRESS);
          setArtworks(OFFLINE_ARTWORKS);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadArtCounselorData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInsightData() {
      setInsightLoading(true);
      try {
        const [memoryRes, responseRes] = await Promise.allSettled([
          fetchArtCounselor('memory?limit=6'),
          fetchArtCounselor('response/history?limit=6'),
        ]);

        if (!ignore && memoryRes.status === 'fulfilled' && memoryRes.value.ok) {
          const json = await memoryRes.value.json();
          const rows: MemorySnippet[] = (json?.data ?? []).map((item: any) => ({
            id: item.id ?? item.session_id ?? Math.random().toString(36),
            content: item.content ?? '대화 기록이 준비 중입니다.',
            theme: item.therapeutic_theme ?? item.theme,
            emotion: item.emotion_detected ?? item.emotion,
            createdAt: item.created_at,
          }));
          setMemorySnippets(rows);
        }

        if (!ignore && responseRes.status === 'fulfilled' && responseRes.value.ok) {
          const json = await responseRes.value.json();
          const rawEntries = Array.isArray(json?.data)
            ? json.data
            : json?.data?.entries ?? [];
          const parsed: JournalEntryPreview[] = rawEntries.map((item: any) => ({
            id: item.id ?? item.response_id ?? Math.random().toString(36),
            artworkTitle: item.artwork_title ?? item.artworkTitle,
            artworkArtist: item.artwork_artist ?? item.artworkArtist,
            emotionalResponse: item.emotional_response ?? item.emotionalResponse,
            intensity: item.response_intensity ?? item.responseIntensity,
            createdAt: item.created_at ?? item.recordedAt,
          }));
          setJournalEntries(parsed);
        }

        if (
          (memoryRes.status === 'rejected' || responseRes.status === 'rejected') &&
          !ignore
        ) {
          const message =
            (memoryRes.status === 'rejected' && memoryRes.reason?.message) ||
            (responseRes.status === 'rejected' && responseRes.reason?.message) ||
            null;
          if (message) {
            setError(message);
          }
        }
      } catch (err) {
        console.error('[ArtCounselor] insights fetch failed', err);
      } finally {
        if (!ignore) {
          setInsightLoading(false);
        }
      }
    }

    loadInsightData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleStartSession = (artworkId?: string) => {
    if (!artworkId) return;
    router.push(`/art-counselor/session/${artworkId}`);
  };

  const ritualSteps = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Opening',
      description: 'AI 큐레이터가 오늘의 작품을 골라 감정을 여는 질문과 함께 소개합니다.',
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: 'Exploration',
      description: '작품을 자세히 관찰하며 떠오르는 감정과 생각을 자유롭게 탐색합니다.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: 'Connection',
      description: '작품과 나의 경험을 연결하며 의미 있는 통찰을 발견합니다.',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Complete',
      description: '세션을 마무리하며 감정 키워드와 통찰을 저널에 기록합니다.',
    },
  ];

  const pillars = [
    {
      title: 'Art First',
      copy: '모든 대화는 작품에서 출발합니다. 시각 경험을 지키고 감정은 그 위에 펼칩니다.',
    },
    {
      title: 'Personal Journal',
      copy: '세션이 끝나면 감정 키워드, 통찰, 추천 행동이 모두 개인 기록으로 남습니다.',
    },
    {
      title: 'Natural Connection',
      copy: '강요 없이 차분한 톤으로 묻고 기다립니다. APT 유형에 맞춘 언어로 연결합니다.',
    },
  ];

  const statusIndicators = [
    {
      label: '완료한 세션',
      value: progress.completedSessions,
    },
    {
      label: '연속 돌봄일',
      value: `${progress.weeklyStreak}`,
    },
    {
      label: '마지막 감정',
      value: progress.lastEmotion,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">SAYU · APT Companion</p>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-3 tracking-tight">
            {greeting}
          </h1>
          <p className="text-lg text-neutral-500 font-light max-w-3xl">
            매일 한 작품으로 감정과 시선을 정리하는 하이브리드 아트 카운슬러.
            Opening → Exploration → Connection → Complete 네 단계로 감정과 관찰을 풀어냅니다.
          </p>
        </motion.div>
      </header>

      {/* Featured Artwork Section */}
      {todayArtwork && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Today's Artwork</h2>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleStartSession(todayArtwork.id)}
          >
            <div className="relative aspect-[16/7] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden">
              <Image
                src={todayArtwork.heroImage}
                alt={todayArtwork.title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <p className="text-xs uppercase tracking-widest text-white/70 mb-2">오늘의 세션</p>
                <h3 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">{todayArtwork.title}</h3>
                <p className="text-sm uppercase tracking-wider text-white/90">{todayArtwork.artist} {todayArtwork.year && `· ${todayArtwork.year}`}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {todayArtwork.moodTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs uppercase tracking-wide border border-white/30 text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium">
                  세션 시작
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-3 gap-6">
          {statusIndicators.map((status, index) => (
            <motion.div
              key={status.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="border border-neutral-200 p-6"
            >
              <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">{status.label}</p>
              <p className="text-2xl font-light text-black tracking-tight">{status.value}</p>
              {progress.lastArtworkTitle && status.label === '마지막 감정' && (
                <p className="mt-2 text-xs text-neutral-400">
                  최근 작품 · {progress.lastArtworkTitle}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Daily Ritual Steps */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Daily Ritual</h2>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>
          <p className="text-neutral-600 font-light mb-10 max-w-2xl">
            한 작품, 네 단계. 모든 여정은 10분 내외의 호흡으로 설계되어 있습니다.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {ritualSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 border border-neutral-300 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-neutral-400">{step.icon}</span>
                </div>
                <h3 className="text-lg font-medium text-black mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600 font-light">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Service Pillars</h2>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="border border-neutral-200 p-6"
            >
              <h3 className="text-base font-medium text-black mb-3">{pillar.title}</h3>
              <p className="text-sm text-neutral-600 font-light">{pillar.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Artwork Collection Grid */}
      <section id="artwork-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Featured Pairings</h2>
          <div className="h-px flex-1 bg-neutral-200" />
          <p className="text-xs text-neutral-400">
            {loading ? '불러오는 중...' : 'APT 맞춤 추천'}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {artworks.map((artwork) => (
            <motion.div
              key={artwork.id || artwork.title}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => handleStartSession(artwork.id)}
            >
              <div className="aspect-[4/3] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden mb-4 relative">
                <Image
                  src={artwork.heroImage}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-wider text-neutral-500 font-light">
                  {artwork.durationMinutes && `${artwork.durationMinutes}min`}
                  {artwork.year && ` · ${artwork.year}`}
                </p>
                <h3 className="text-base font-medium text-black line-clamp-2 leading-snug">{artwork.title}</h3>
                <p className="text-sm text-neutral-600 font-light">{artwork.artist}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {artwork.personalityFit.slice(0, 3).map((fit) => (
                    <span
                      key={`${artwork.id}-${fit}`}
                      className="px-2 py-0.5 text-xs text-neutral-500 border border-neutral-200"
                    >
                      {fit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-px bg-neutral-900 mt-3 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journal & Memory Section */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Reflection</h2>
            <div className="h-px flex-1 bg-neutral-300" />
            {insightLoading && <p className="text-xs text-neutral-400">기록 불러오는 중...</p>}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Journal Preview */}
            <div className="border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-600 mb-6">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Journal Preview</span>
              </div>
              <div className="space-y-4">
                {displayJournalEntries.map((entry) => (
                  <div key={entry.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-black">
                      {entry.artworkTitle ?? '기록된 작품'}
                    </p>
                    {entry.artworkArtist && (
                      <p className="text-xs text-neutral-400">{entry.artworkArtist}</p>
                    )}
                    <p className="mt-2 text-sm text-neutral-600 font-light">
                      {entry.emotionalResponse ?? '감정 기록이 준비 중입니다.'}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                      <span>
                        강도{' '}
                        {typeof entry.intensity === 'number'
                          ? `${Math.round(entry.intensity * 100)}%`
                          : entry.intensity ?? '-'}
                      </span>
                      <span>
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleDateString()
                          : '최근'}
                      </span>
                    </div>
                  </div>
                ))}
                {!journalEntries.length && !insightLoading && (
                  <p className="text-sm text-neutral-400">
                    아직 저장된 저널이 없습니다. 첫 번째 세션을 시작하면 기록이 여기에 쌓여요.
                  </p>
                )}
              </div>
            </div>

            {/* Memory Highlights */}
            <div className="border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-600 mb-6">
                <Feather className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Memory Highlights</span>
              </div>
              <div className="space-y-4">
                {displayMemorySnippets.map((snippet) => (
                  <div key={snippet.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm text-neutral-700 font-light">{snippet.content}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                      <span>{snippet.theme ?? '기록'}</span>
                      <span>
                        {snippet.createdAt
                          ? new Date(snippet.createdAt).toLocaleDateString()
                          : '최근'}
                      </span>
                    </div>
                    {snippet.emotion && (
                      <p className="mt-1 text-xs text-neutral-500">감정 · {snippet.emotion}</p>
                    )}
                  </div>
                ))}
                {!memorySnippets.length && !insightLoading && (
                  <p className="text-sm text-neutral-400">
                    최근 대화 메모리가 아직 없습니다. 세션을 시작하면 여기에서 흐름을 다시 이어갈 수 있어요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Coming Soon</h2>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'APT 저널',
              description: '세션 완료 시 감정 키워드와 추천 행동이 자동으로 저장됩니다.',
            },
            {
              title: '감정 메모리',
              description: '16가지 유형별 감정 히스토리를 시각화하여 다음 추천에 반영합니다.',
            },
            {
              title: 'Community Reflection',
              description: '비슷한 감정 궤적을 가진 사용자와 익명으로 통찰을 나눌 수 있습니다.',
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="border border-dashed border-neutral-300 p-6"
            >
              <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Next step</p>
              <h3 className="text-base font-medium text-black mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600 font-light">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

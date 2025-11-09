'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Clock, BookOpen, HeartHandshake, Feather, Compass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
    id: 'kim-whanki-25-vii-69',
    title: '25-VII-69 #200 (Universe)',
    artist: '김환기',
    year: '1969',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    summary: '밤하늘을 닮은 점묘의 리듬. 호흡을 고르고 내면의 패턴을 찾도록 돕는 명상형 작품입니다.',
    moodTags: ['contemplative', 'cosmic', 'steady'],
    personalityFit: ['LAMF', 'LRMC', 'SRMF'],
    durationMinutes: 8,
  },
  {
    id: 'yoo-youngkuk-untitled-orange-peak',
    title: 'Untitled (Orange Peak)',
    artist: '유영국',
    year: '1974',
    heroImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    summary: '산세를 추상화한 직선과 색면이 에너지를 깨우는 작품. 도전과 활력을 필요로 할 때 적합합니다.',
    moodTags: ['energy', 'focus', 'momentum'],
    personalityFit: ['SAMC', 'SREC', 'SRMC'],
    durationMinutes: 5,
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
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      title: 'Morning Spotlight',
      description: 'AI 큐레이터가 오늘의 작품을 골라 감정을 여는 질문과 함께 소개합니다.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-purple-400" />,
      title: 'Guided Dialogue',
      description: 'Opening → Exploration → Connection 단계별로 감정과 시선을 정리합니다.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      title: 'Personal Journal',
      description: '완료 후 감정 키워드와 통찰을 저널·콜렉션에 자동으로 아카이빙합니다.',
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
      accent: 'from-pink-500/20 to-pink-500/5',
    },
    {
      label: '연속 돌봄일',
      value: `${progress.weeklyStreak} day${progress.weeklyStreak === 1 ? '' : 's'}`,
      accent: 'from-purple-500/20 to-purple-500/5',
    },
    {
      label: '마지막 감정',
      value: progress.lastEmotion,
      accent: 'from-indigo-500/20 to-indigo-500/5',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-300/80">
            SAYU · APT Companion
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {greeting}
            <span className="block text-slate-300">
              매일 한 작품으로 감정과 시선을 정리하는 하이브리드 아트 카운슬러
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-200">
            Opening → Exploration → Connection → Complete 네 단계로 감정과 관찰을 풀어내고,
            세션이 끝나면 저널·콜렉션·추천 행동까지 즉시 전달합니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!todayArtwork?.id || loading}
              onClick={() => handleStartSession(todayArtwork?.id)}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70"
            >
              <Sparkles className="h-4 w-4" />
              {todayArtwork?.title ? `오늘의 세션 열기` : '세션 준비 중'}
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('artwork-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-white transition hover:border-white hover:bg-white/10"
            >
              컬렉션 살펴보기
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-300">
              {error} · API_URL 확인 후 다시 새로고침 해주세요.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {statusIndicators.map((status) => (
            <div
              key={status.label}
              className={`rounded-3xl border border-white/5 bg-gradient-to-br ${status.accent} p-6`}
            >
              <p className="text-sm text-slate-300">{status.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{status.value}</p>
              {progress.lastArtworkTitle && status.label === '마지막 감정' && (
                <p className="mt-2 text-sm text-slate-400">
                  최근 작품 · {progress.lastArtworkTitle}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-slate-900/40 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold text-white">Service Pillars</h2>
          <p className="mt-2 text-slate-300">
            SAYU Art Counselor는 단순 추천을 넘어, 예술 경험을 Art First · Personal Journal ·
            Natural Connection 세 축으로 설계합니다.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-transparent p-6"
              >
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{pillar.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Daily Ritual</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">한 작품, 네 단계</h2>
            <p className="mt-3 text-slate-300">
              Morning Notification → Art Presentation → Guided Dialogue → Personal Journal. 모든
              여정은 10분 내외의 호흡으로 설계되어 있습니다.
            </p>
            <div className="mt-8 space-y-5">
              {ritualSteps.map((step) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-white/5 p-4">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/5 bg-slate-900/60 p-6"
          >
            <p className="text-sm text-slate-400">오늘의 작품</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {todayArtwork?.title ?? '준비 중'}
            </h3>
            <p className="text-sm text-slate-400">{todayArtwork?.artist}</p>
            <div className="mt-4 overflow-hidden rounded-2xl">
              <img
                src={todayArtwork?.heroImage ?? OFFLINE_ARTWORKS[0].heroImage}
                alt={todayArtwork?.title ?? 'Daily artwork'}
                className="h-64 w-full object-cover"
              />
            </div>
            <p className="mt-4 text-slate-300">{todayArtwork?.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(todayArtwork?.moodTags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              disabled={!todayArtwork?.id || loading}
              onClick={() => handleStartSession(todayArtwork?.id)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Feather className="h-4 w-4" />
              세션 시작
              {todayArtwork?.durationMinutes && (
                <span className="text-sm text-white/80">
                  · {todayArtwork.durationMinutes}분 대화
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      <section id="artwork-grid" className="bg-slate-900/20 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">APT 맞춤 추천 풀</p>
              <h2 className="text-3xl font-semibold text-white">Featured pairings</h2>
            </div>
            <p className="text-sm text-slate-400">
              {loading ? '데이터를 불러오는 중입니다…' : '16개의 시그니처 조합을 순차적으로 공개합니다.'}
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.id || artwork.title}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60"
              >
                <div className="relative h-48">
                  <img
                    src={artwork.heroImage}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guided pairing</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{artwork.title}</h3>
                  <p className="text-sm text-slate-400">
                    {artwork.artist}
                    {artwork.year && ` · ${artwork.year}`}
                  </p>
                  <p className="mt-3 min-h-[72px] text-sm text-slate-300">{artwork.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {artwork.personalityFit.slice(0, 3).map((fit) => (
                      <span
                        key={`${artwork.id}-${fit}`}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
                      >
                        {fit}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!artwork.id}
                    onClick={() => handleStartSession(artwork.id)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Compass className="h-4 w-4" />
                    이 작품으로 대화 열기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
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
              description: '비슷한 감정 궤적을 가진 사용자와 익명으로 통찰을 나눌 수 있게 준비 중입니다.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-dashed border-white/10 p-6">
              <p className="text-sm text-slate-400">Next step</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950/30 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Reflection</p>
              <h2 className="text-3xl font-semibold text-white">저널 & 메모리</h2>
            </div>
            {insightLoading && <p className="text-sm text-slate-400">기록을 불러오는 중…</p>}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm uppercase tracking-[0.3em]">Journal Preview</span>
              </div>
              <div className="mt-4 space-y-4">
                {displayJournalEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/5 p-4">
                    <p className="text-sm font-semibold text-white">
                      {entry.artworkTitle ?? '기록된 작품'}
                    </p>
                      {entry.artworkArtist && (
                        <p className="text-xs text-slate-400">{entry.artworkArtist}</p>
                      )}
                      <p className="mt-2 text-sm text-slate-200">
                        {entry.emotionalResponse ?? '감정 기록이 준비 중입니다.'}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
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
                  ),
                ))}
                {!journalEntries.length && !insightLoading && (
                  <p className="text-sm text-slate-400">
                    아직 저장된 저널이 없습니다. 첫 번째 세션을 시작하면 기록이 여기에 쌓여요.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Feather className="h-4 w-4" />
                <span className="text-sm uppercase tracking-[0.3em]">Memory Highlights</span>
              </div>
              <div className="mt-4 space-y-4">
                {displayMemorySnippets.map((snippet) => (
                  <div key={snippet.id} className="rounded-2xl border border-white/5 p-4">
                    <p className="text-sm text-slate-200">{snippet.content}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>{snippet.theme ?? '기록'}</span>
                        <span>
                          {snippet.createdAt
                            ? new Date(snippet.createdAt).toLocaleString()
                            : '최근'}
                        </span>
                      </div>
                      {snippet.emotion && (
                        <p className="mt-1 text-xs text-pink-300">감정 · {snippet.emotion}</p>
                      )}
                    </div>
                  ),
                ))}
                {!memorySnippets.length && !insightLoading && (
                  <p className="text-sm text-slate-400">
                    최근 대화 메모리가 아직 없습니다. 세션을 시작하면 여기에서 흐름을 다시 이어갈
                    수 있어요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

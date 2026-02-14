'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Search,
  Heart,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
} from 'lucide-react';
import { ExhibitionPlaceholder } from '@/components/exhibitions/ExhibitionPlaceholder';

const t = {
  en: {
    title: 'Exhibitions',
    currentExhibitions: 'Current Exhibitions',
    subtitle: 'Discover curated exhibitions from galleries and museums worldwide.',
    featured: 'Featured',
    featuredExhibition: 'Featured Exhibition',
    all: 'All',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    ended: 'Ended',
    searchPlaceholder: 'Search title, venue, or artist...',
    endsIn: (days: number) => `${days}d left`,
    closingSoon: 'Closing Soon',
    noExhibitions: 'No exhibitions found.',
    retry: 'Retry',
    error: 'An error occurred while fetching exhibitions.',
    addedToSaved: 'Added to saved',
    removedFromSaved: 'Removed from saved',
    loginToSave: 'Login to save exhibitions.',
    recommendedForYou: 'Recommended for You',
    matchScore: 'Match',
    loadMore: 'Load more',
    allCities: 'All Cities',
    showingCount: (shown: number, total: number) => `${shown} of ${total}`,
  },
  ko: {
    title: '전시',
    currentExhibitions: '전시 탐색',
    subtitle: '전 세계 갤러리와 미술관의 전시를 발견하세요.',
    featured: '추천',
    featuredExhibition: '추천 전시',
    all: '전체',
    ongoing: '진행중',
    upcoming: '예정',
    ended: '종료',
    searchPlaceholder: '전시, 장소, 작가 검색...',
    endsIn: (days: number) => `${days}일 남음`,
    closingSoon: '곧 종료',
    noExhibitions: '전시를 찾을 수 없습니다.',
    retry: '다시 시도',
    error: '전시 정보를 불러오는 중 오류가 발생했습니다.',
    addedToSaved: '저장되었습니다',
    removedFromSaved: '저장 취소되었습니다',
    loginToSave: '전시를 저장하려면 로그인이 필요합니다.',
    recommendedForYou: '당신을 위한 추천',
    matchScore: '매칭',
    loadMore: '더 보기',
    allCities: '모든 도시',
    showingCount: (shown: number, total: number) => `${shown} / ${total}`,
  },
};

interface Exhibition {
  id: string;
  title: string;
  titleEn?: string | null;
  titleLocal?: string | null;
  venue: string;
  location: string;
  country?: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  closingSoon?: boolean;
  daysLeft?: number | null;
  daysUntilStart?: number | null;
  artists?: string[];
  tags?: string[];
  source?: string;
  featured?: boolean;
}

interface TotalStats {
  ongoing: number;
  upcoming: number;
  ended: number;
  total: number;
}

interface SavedExhibitionRow {
  exhibition_id: string;
}

interface RecommendationExhibition {
  id: string;
  title_local?: string;
  title_en?: string;
  venue_name?: string;
  image_url?: string;
  image?: string;
  matchScore?: number;
}

const CITY_TABS = [
  { id: 'all', labelEn: 'All', labelKo: '전체' },
  { id: 'Seoul', labelEn: 'Seoul', labelKo: '서울' },
  { id: 'Tokyo', labelEn: 'Tokyo', labelKo: '도쿄' },
  { id: 'New York', labelEn: 'NYC', labelKo: '뉴욕' },
  { id: 'London', labelEn: 'London', labelKo: '런던' },
  { id: 'Paris', labelEn: 'Paris', labelKo: '파리' },
  { id: 'Berlin', labelEn: 'Berlin', labelKo: '베를린' },
];

const CITY_KO: Record<string, string> = {
  'Seoul': '서울', 'Busan': '부산', 'Daegu': '대구', 'Incheon': '인천',
  'Gwangju': '광주', 'Daejeon': '대전', 'Ulsan': '울산', 'Jeju': '제주',
  'Gwacheon': '과천', 'Cheongju': '청주', 'Cheonan': '천안', 'Suwon': '수원',
  'Gyeongju': '경주', 'Paju': '파주',
  'Tokyo': '도쿄', 'New York': '뉴욕', 'London': '런던', 'Paris': '파리',
  'Berlin': '베를린', 'Chicago': '시카고', 'Cleveland': '클리블랜드',
  'Los Angeles': 'LA', 'San Francisco': '샌프란시스코',
  'Amsterdam': '암스테르담', 'Rome': '로마', 'Milan': '밀라노',
  'Venice': '베니스', 'Vienna': '비엔나', 'Madrid': '마드리드',
  'Barcelona': '바르셀로나', 'Shanghai': '상하이', 'Beijing': '베이징',
  'Hong Kong': '홍콩', 'Taipei': '타이베이', 'Singapore': '싱가포르',
  'Sydney': '시드니', 'Melbourne': '멜버른',
};

const PAGE_SIZE = 40;

const ExhibitionSkeleton = () => (
  <div className="group">
    <div className="aspect-[3/4] bg-neutral-100 border border-neutral-200 mb-4 animate-pulse rounded-sm" />
    <div className="space-y-3">
      <div className="h-3 w-3/4 bg-neutral-100 animate-pulse rounded" />
      <div className="h-4 w-full bg-neutral-100 animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-neutral-100 animate-pulse rounded" />
    </div>
  </div>
);

export default function ExhibitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { trackExhibitionView } = useActivityTracker();
  const { language } = useLanguage();
  const texts = t[language];

  const [activeStatus, setActiveStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all');
  const [activeCity, setActiveCity] = useState('all');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null);
  const [apiCities, setApiCities] = useState<string[]>([]);
  const [savedExhibitions, setSavedExhibitions] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<RecommendationExhibition[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const offsetRef = useRef(0);

  const handleExhibitionClick = useCallback((exhibition: Exhibition) => {
    if (user) {
      trackExhibitionView({
        id: exhibition.id,
        title: exhibition.title,
        venue: exhibition.venue,
        image: exhibition.image,
      });
    }
    router.push(`/exhibitions/${exhibition.id}`);
  }, [user, trackExhibitionView, router]);

  const buildApiUrl = useCallback((offset: number, search?: string) => {
    const params = new URLSearchParams();
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(offset));
    if (activeStatus !== 'all') params.set('status', activeStatus);
    if (activeCity !== 'all') params.set('city', activeCity);
    if (search) params.set('search', search);
    return `/api/exhibitions?${params.toString()}`;
  }, [activeStatus, activeCity]);

  const fetchExhibitions = useCallback(async (append = false, search?: string) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        offsetRef.current = 0;
      }
      setError(null);

      const url = buildApiUrl(offsetRef.current, search ?? searchQuery);
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`API responded with status ${response.status}`);
      const result = await response.json();

      const newData = result.data || [];

      if (append) {
        setExhibitions(prev => [...prev, ...newData]);
      } else {
        setExhibitions(newData);
        if (result.totalStats) setTotalStats(result.totalStats);
        if (result.cities) setApiCities(result.cities);
      }

      setTotal(result.total || 0);
      setHasMore(result.hasMore || false);
      offsetRef.current += newData.length;
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      if (!append) setError(texts.error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildApiUrl, searchQuery, texts.error]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchExhibitions(true);
  }, [fetchExhibitions, loadingMore, hasMore]);

  // Reset and refetch when filters change
  useEffect(() => {
    offsetRef.current = 0;
    fetchExhibitions(false);
  }, [activeStatus, activeCity]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      offsetRef.current = 0;
      fetchExhibitions(false, searchQuery);
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const fetchSavedExhibitions = useCallback(async () => {
    try {
      const localSaved = localStorage.getItem('savedExhibitions');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          setSavedExhibitions(new Set(parsed.filter((id): id is string => typeof id === 'string')));
        }
      }
    } catch {
      localStorage.removeItem('savedExhibitions');
    }

    if (!user) return;
    try {
      const response = await fetch('/api/exhibitions/save');
      if (response.ok) {
        const result: { localOnly?: boolean; data?: SavedExhibitionRow[] } = await response.json();
        if (!result.localOnly && result.data) {
          const savedIds = new Set(result.data.map((item) => item.exhibition_id));
          setSavedExhibitions(savedIds);
          localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(savedIds)));
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved exhibitions:', error);
    }
  }, [user]);

  const handleSaveExhibition = useCallback(async (exhibitionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const gate = requireAuth({ message: texts.loginToSave });
    if (!gate.allowed) return;

    const newSet = new Set(savedExhibitions);
    const isSaved = savedExhibitions.has(exhibitionId);
    if (isSaved) {
      newSet.delete(exhibitionId);
      toast.success(texts.removedFromSaved);
    } else {
      newSet.add(exhibitionId);
      toast.success(texts.addedToSaved);
    }
    setSavedExhibitions(newSet);
    localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));

    if (user) {
      try {
        const response = await fetch('/api/exhibitions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exhibitionId, action: isSaved ? 'unsave' : 'save' }),
        });
        if (!response.ok) throw new Error('Sync failed');
      } catch {
        const rollbackSet = new Set(savedExhibitions);
        setSavedExhibitions(rollbackSet);
        localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(rollbackSet)));
        toast.error(texts.error);
      }
    }
  }, [user, savedExhibitions, requireAuth, texts]);

  const fetchRecommendations = useCallback(async () => {
    if (!user?.aptType) return;
    try {
      const response = await fetch(`/api/exhibitions/recommend?apt=${user.aptType}&limit=6`);
      if (response.ok) {
        const result: { success?: boolean; data?: { recommendations?: RecommendationExhibition[] } } = await response.json();
        if (result.success && Array.isArray(result.data?.recommendations)) {
          setRecommendations(result.data.recommendations);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  }, [user?.aptType]);

  useEffect(() => {
    fetchSavedExhibitions();
    fetchRecommendations();
  }, [fetchSavedExhibitions, fetchRecommendations]);

  // Pick featured from first page
  const featuredExhibition = useMemo(() => {
    if (loading || exhibitions.length === 0 || activeCity !== 'all' || activeStatus !== 'all' || searchQuery) return null;
    const ongoing = exhibitions.filter(e => e.status === 'ongoing' && e.image);
    return ongoing[0] || exhibitions.find(e => e.image) || null;
  }, [exhibitions, loading, activeCity, activeStatus, searchQuery]);

  const displayExhibitions = useMemo(() => {
    if (featuredExhibition) return exhibitions.filter(e => e.id !== featuredExhibition.id);
    return exhibitions;
  }, [exhibitions, featuredExhibition]);

  // Build city tabs: static tabs + dynamic from API
  const cityTabs = useMemo(() => {
    const staticIds = new Set(CITY_TABS.map(t => t.id));
    const extra = apiCities
      .filter(c => !staticIds.has(c) && c !== '')
      .slice(0, 8)
      .map(c => ({ id: c, labelEn: c, labelKo: CITY_KO[c] || c }));
    return [...CITY_TABS, ...extra];
  }, [apiCities]);

  const ExhibitionCard = ({ exhibition }: { exhibition: Exhibition }) => {
    const dateLocale = language === 'ko' ? 'ko-KR' : 'en-US';
    const startDate = new Date(exhibition.startDate);
    const endDate = new Date(exhibition.endDate);
    const hasValidDates = exhibition.startDate && exhibition.endDate &&
      !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime());
    const dates = hasValidDates
      ? `${startDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

    const showClosingSoon = exhibition.closingSoon && exhibition.daysLeft != null && exhibition.daysLeft >= 0;

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
        onClick={() => handleExhibitionClick(exhibition)}
        layout
      >
        <div className="aspect-[3/4] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden mb-4 relative bg-neutral-50">
          {exhibition.image ? (
            <Image
              src={exhibition.image}
              alt={exhibition.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <ExhibitionPlaceholder
              title={exhibition.title}
              venue={exhibition.venue}
              variant="card"
              category={exhibition.tags?.[0] || undefined}
            />
          )}
          {showClosingSoon && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">
              <Clock className="w-3 h-3" />
              {texts.endsIn(exhibition.daysLeft!)}
            </div>
          )}
          {!showClosingSoon && exhibition.status === 'upcoming' && exhibition.daysUntilStart && exhibition.daysUntilStart > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">
              <Clock className="w-3 h-3" />
              {language === 'ko' ? `${exhibition.daysUntilStart}일 후 시작` : `In ${exhibition.daysUntilStart}d`}
            </div>
          )}
          {!showClosingSoon && exhibition.status === 'ongoing' && exhibition.daysLeft != null && exhibition.daysLeft > 7 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">
              {language === 'ko' ? '전시중' : 'Now Open'}
            </div>
          )}
          <button
            onClick={(e) => handleSaveExhibition(exhibition.id, e)}
            className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
          >
            <Heart
              className={cn("w-4 h-4 transition-colors",
                savedExhibitions.has(exhibition.id)
                  ? "fill-red-500 text-red-500"
                  : "text-neutral-500"
              )}
            />
          </button>
        </div>
        <div className="space-y-1.5">
          {dates && (
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-light">{dates}</p>
          )}
          <h3 className="text-sm font-medium text-black line-clamp-2 leading-snug">{exhibition.title}</h3>
          {exhibition.titleEn && exhibition.titleLocal && exhibition.titleEn !== exhibition.title && (
            <p className="text-xs text-neutral-400 line-clamp-1 font-light">{exhibition.titleEn}</p>
          )}
          <p className="text-xs text-neutral-600 font-light">{exhibition.venue}</p>
          {exhibition.location && (
            <p className="text-[11px] text-neutral-400 font-light flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {language === 'ko' ? (CITY_KO[exhibition.location] || exhibition.location) : exhibition.location}
              {exhibition.country ? `, ${exhibition.country}` : ''}
            </p>
          )}
        </div>
        <div className="h-px bg-neutral-900 mt-3 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="py-12 md:py-16">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">{texts.title}</p>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-3 tracking-tight">{texts.currentExhibitions}</h1>
          <p className="text-lg text-neutral-500 font-light max-w-3xl">{texts.subtitle}</p>
          {totalStats && (
            <div className="flex gap-6 mt-6 text-sm text-neutral-500 font-light">
              <span><strong className="text-black font-medium">{totalStats.ongoing.toLocaleString()}</strong> {texts.ongoing}</span>
              <span><strong className="text-black font-medium">{totalStats.upcoming.toLocaleString()}</strong> {texts.upcoming}</span>
              <span><strong className="text-black font-medium">{totalStats.total.toLocaleString()}</strong> {texts.all}</span>
            </div>
          )}
        </header>

        {/* Featured */}
        {featuredExhibition && (
          <section className="mb-12 md:mb-16 group" onClick={() => handleExhibitionClick(featuredExhibition)}>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.featured}</h2>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="relative aspect-[16/7] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden cursor-pointer">
              {featuredExhibition.image ? (
                <Image
                  src={featuredExhibition.image}
                  alt={featuredExhibition.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  priority
                />
              ) : (
                <ExhibitionPlaceholder
                  title={featuredExhibition.title}
                  venue={featuredExhibition.venue}
                  variant="featured"
                  category={featuredExhibition.tags?.[0] || undefined}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <p className="text-xs uppercase tracking-widest text-white/70 mb-2">{texts.featuredExhibition}</p>
                <h3 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">{featuredExhibition.title}</h3>
                <p className="text-sm uppercase tracking-wider text-white/90">
                  {featuredExhibition.venue}
                  {featuredExhibition.location ? ` \u00b7 ${featuredExhibition.location}` : ''}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mb-12 md:mb-16">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.recommendedForYou}</h2>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex-none w-52 cursor-pointer group"
                  onClick={() => router.push(`/exhibitions/${rec.id}`)}
                >
                  <div className="aspect-[3/4] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden mb-3 relative bg-neutral-50 rounded-sm">
                    {(rec.image_url || rec.image) ? (
                      <Image
                        src={(rec.image_url || rec.image)!}
                        alt={rec.title_local || rec.title_en || 'recommended exhibition'}
                        fill
                        sizes="208px"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <ExhibitionPlaceholder
                        title={rec.title_local || rec.title_en || ''}
                        venue={rec.venue_name || ''}
                        variant="card"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded-full backdrop-blur-sm">
                      {texts.matchScore} {Math.round((rec.matchScore ?? 0) * 100)}%
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-black line-clamp-2 leading-snug mb-1">
                    {rec.title_local || rec.title_en}
                  </h3>
                  <p className="text-xs text-neutral-500 font-light">{rec.venue_name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* City Tabs */}
        <div className="mb-2 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-3 min-w-max">
            {cityTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveCity(tab.id); }}
                className={cn(
                  "px-4 py-1.5 text-xs uppercase tracking-wider rounded-full border transition-all whitespace-nowrap",
                  activeCity === tab.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                )}
              >
                {language === 'ko' ? tab.labelKo : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs + Search */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md pt-4 pb-4 border-b border-neutral-200 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-8 sm:gap-12">
              {([
                { id: 'all', label: texts.all, count: totalStats?.total },
                { id: 'ongoing', label: texts.ongoing, count: totalStats?.ongoing },
                { id: 'upcoming', label: texts.upcoming, count: totalStats?.upcoming },
                { id: 'ended', label: texts.ended, count: totalStats?.ended },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatus(tab.id)}
                  className="pb-2 text-sm uppercase tracking-widest font-light hover:text-black transition-colors relative"
                >
                  <span className={activeStatus === tab.id ? "text-black font-medium" : "text-neutral-400"}>
                    {tab.label}
                  </span>
                  {activeStatus === tab.id &&
                    <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-black" layoutId="activeExhibitionTab" />
                  }
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder={texts.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 bg-transparent pl-9 pr-4 py-2 border-b border-neutral-200 focus:outline-none focus:border-black transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <main>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(12)].map((_, i) => <ExhibitionSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">{error}</p>
              <button onClick={() => fetchExhibitions()} className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-neutral-800">{texts.retry}</button>
            </div>
          ) : (
            <>
              {total > 0 && (
                <p className="text-xs text-neutral-400 mb-6 font-light">
                  {texts.showingCount(displayExhibitions.length, total)}
                </p>
              )}
              <AnimatePresence>
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
                >
                  {displayExhibitions.map(exhibition => (
                    <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}
          {(!loading && displayExhibitions.length === 0 && !error) &&
            <div className="text-center py-20">
              <p className="text-neutral-500">{texts.noExhibitions}</p>
            </div>
          }

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-12">
              {loadingMore && <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Eye,
  Heart,
  Sparkles,
  Map as MapIcon,
  Ticket,
  AlertCircle,
  Loader2,
  TrendingUp,
  Flame,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Dynamic import for map component (client-side only)
const ExhibitionMap = dynamic(
  () => import('@/components/exhibitions/ExhibitionMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-neutral-100 flex items-center justify-center rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }
);

interface TransformedExhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  category?: string;
  price?: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  viewCount?: number;
  likeCount?: number;
  featured?: boolean;
}

// Skeleton loader component
const ExhibitionSkeleton = () => (
  <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm animate-pulse">
    <div className="p-4 space-y-3">
      <div className="h-5 bg-neutral-200 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-2/3" />
      </div>
      <div className="h-6 bg-neutral-200 rounded w-16" />
    </div>
  </div>
);

export default function ExhibitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { trackExhibitionView } = useActivityTracker();

  // State management
  const [activeTab, setActiveTab] = useState<'discover' | 'near' | 'trending' | 'all'>('discover');
  const [exhibitions, setExhibitions] = useState<TransformedExhibition[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedExhibitions, setSavedExhibitions] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);

  // Handle exhibition click with activity tracking
  const handleExhibitionClick = useCallback((exhibition: TransformedExhibition) => {
    if (user) {
      trackExhibitionView({
        id: exhibition.id,
        title: exhibition.title,
        venue: exhibition.venue,
        image: exhibition.image
      });
    }
    router.push(`/exhibitions/${exhibition.id}`);
  }, [user, trackExhibitionView, router]);

  // Fetch exhibitions
  const fetchExhibitions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/exhibitions?limit=100`, {
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = await response.json();
      const newExhibitions = result.data || result.exhibitions || [];

      setExhibitions(newExhibitions);

    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      setError('전시 정보를 불러오는 중 문제가 발생했습니다.');

      // Fallback data
      const fallbackData: TransformedExhibition[] = [
        {
          id: 'fallback-1',
          title: '이불: 1998년 이후',
          venue: '리움미술관',
          location: '서울',
          startDate: '2024-12-01',
          endDate: '2025-01-15',
          description: '한국 현대미술을 대표하는 이불 작가의 대규모 회고전',
          category: '현대미술',
          price: '성인 20,000원',
          status: 'ongoing',
          viewCount: 1240,
          likeCount: 89,
          featured: true
        }
      ];
      setExhibitions(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch saved exhibitions
  const fetchSavedExhibitions = useCallback(async () => {
    const localSaved = localStorage.getItem('savedExhibitions');
    if (localSaved) {
      setSavedExhibitions(new Set(JSON.parse(localSaved)));
    }

    if (!user) return;

    try {
      const response = await fetch('/api/exhibitions/save');
      if (response.ok) {
        const result = await response.json();
        if (!result.localOnly && result.data) {
          const savedIds = new Set(result.data.map((item: any) => item.exhibition_id));
          setSavedExhibitions(savedIds);
          localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(savedIds)));
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved exhibitions:', error);
    }
  }, [user]);

  // Handle save/unsave exhibition
  const handleSaveExhibition = useCallback(async (exhibition: TransformedExhibition, e: React.MouseEvent) => {
    e.stopPropagation();

    const gate = requireAuth({ message: '관심 전시는 회원 전용 기능입니다. 로그인 후 이용해주세요.' });
    if (!gate.allowed) return;

    const isSaved = savedExhibitions.has(exhibition.id);

    if (isSaved) {
      setSavedExhibitions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exhibition.id);
        localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      toast.success('관심 전시에서 제거되었습니다');
    } else {
      setSavedExhibitions(prev => {
        const newSet = new Set(prev);
        newSet.add(exhibition.id);
        localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      toast.success('관심 전시에 추가되었습니다');
    }

    if (user) {
      try {
        await fetch('/api/exhibitions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exhibitionId: exhibition.id,
            action: isSaved ? 'unsave' : 'save'
          })
        });
      } catch (error) {
        console.error('Failed to sync to server:', error);
      }
    }
  }, [user, savedExhibitions]);

  // Initial load
  useEffect(() => {
    fetchExhibitions();
    fetchSavedExhibitions();
  }, [fetchExhibitions, fetchSavedExhibitions]);

  // Calculate days until end
  const getDaysUntilEnd = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if exhibition is new (started within last 7 days)
  const isNewExhibition = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Categorize exhibitions
  const categorizedExhibitions = useMemo(() => {
    const ongoing = exhibitions.filter(ex => ex.status === 'ongoing');

    // New exhibitions (started within last 7 days)
    const newExhibitions = ongoing
      .filter(ex => isNewExhibition(ex.startDate))
      .slice(0, 3);

    // Ending soon (less than 14 days remaining)
    const endingSoon = ongoing
      .filter(ex => {
        const days = getDaysUntilEnd(ex.endDate);
        return days > 0 && days <= 14;
      })
      .sort((a, b) => getDaysUntilEnd(a.endDate) - getDaysUntilEnd(b.endDate))
      .slice(0, 3);

    // APT recommended (featured or random)
    const aptRecommended = ongoing
      .filter(ex => ex.featured)
      .slice(0, 6);

    // Trending (by view count)
    const trending = [...exhibitions]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);

    // Most saved
    const mostSaved = [...exhibitions]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 10);

    return {
      new: newExhibitions,
      endingSoon,
      aptRecommended,
      trending,
      mostSaved
    };
  }, [exhibitions]);

  // Filter for Near You and All tabs
  const filteredExhibitions = useMemo(() => {
    let filtered = [...exhibitions];

    // City filter (for Near You and All tabs)
    if (selectedCity !== 'all') {
      filtered = filtered.filter(ex => ex.location === selectedCity);
    }

    // Search filter (for All tab)
    if (searchQuery && activeTab === 'all') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(query) ||
        ex.venue.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [exhibitions, selectedCity, searchQuery, activeTab]);

  // Extract unique cities
  const cities = useMemo(() => {
    const locs = new Set(exhibitions.map(ex => ex.location).filter(Boolean));
    return Array.from(locs);
  }, [exhibitions]);

  // Stats
  const stats = useMemo(() => {
    const ongoing = exhibitions.filter(ex => ex.status === 'ongoing').length;
    const upcoming = exhibitions.filter(ex => ex.status === 'upcoming').length;
    return { ongoing, upcoming };
  }, [exhibitions]);

  // Exhibition Card Component
  const ExhibitionCard = ({ exhibition, showBadge }: { exhibition: TransformedExhibition; showBadge?: 'new' | 'ending' | null }) => {
    const daysLeft = getDaysUntilEnd(exhibition.endDate);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => handleExhibitionClick(exhibition)}
        className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      >
        <div className="p-4">
          {/* Header with badges and save button */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2">
              {showBadge === 'new' && (
                <span className="inline-flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              )}
              {showBadge === 'ending' && daysLeft > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  D-{daysLeft}
                </span>
              )}
              {exhibition.featured && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 text-black px-2 py-1 rounded text-xs font-medium">
                  <Star className="w-3 h-3" />
                  추천
                </span>
              )}
            </div>
            <button
              onClick={(e) => handleSaveExhibition(exhibition, e)}
              className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  savedExhibitions.has(exhibition.id)
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-400 group-hover:text-red-500"
                )}
              />
            </button>
          </div>

          <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 group-hover:underline">
            {exhibition.title}
          </h3>

          <div className="space-y-1 text-sm text-neutral-600 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{exhibition.venue}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {new Date(exhibition.startDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~
                {new Date(exhibition.endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {exhibition.price && (
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span className="text-xs">{exhibition.price}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{exhibition.viewCount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{exhibition.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">전시 탐색</h1>
              <p className="mt-1 text-sm text-neutral-600">
                현재 <span className="font-semibold text-black">{stats.ongoing}개</span>의 전시가 진행 중이고,
                <span className="font-semibold text-black"> {stats.upcoming}개</span>가 예정되어 있습니다
              </p>
            </div>

            {/* My Saved button */}
            <button
              onClick={() => router.push('/exhibitions/saved')}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">관심 전시</span>
              {savedExhibitions.size > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-neutral-700 rounded-full text-xs">
                  {savedExhibitions.size}
                </span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-neutral-200">
            <div className="flex gap-8">
              {[
                { id: 'discover', label: 'Discover', icon: Sparkles },
                { id: 'near', label: 'Near You', icon: MapIcon },
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'all', label: 'All', icon: Search }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "pb-4 font-medium transition-colors relative flex items-center gap-2",
                      activeTab === tab.id ? "text-black" : "text-neutral-600 hover:text-black"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ExhibitionSkeleton key={i} />
            ))}
          </div>
        ) : error && exhibitions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">{error}</p>
            <button
              onClick={() => fetchExhibitions()}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div className="space-y-12">
                {/* New Exhibitions */}
                {categorizedExhibitions.new.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-6 h-6 text-black" />
                      <h2 className="text-2xl font-bold text-black">이번 주 새로 시작</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorizedExhibitions.new.map(exhibition => (
                        <ExhibitionCard key={exhibition.id} exhibition={exhibition} showBadge="new" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Ending Soon */}
                {categorizedExhibitions.endingSoon.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-black">곧 끝나는 전시</h2>
                      <span className="text-sm text-neutral-600">놓치지 마세요!</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorizedExhibitions.endingSoon.map(exhibition => (
                        <ExhibitionCard key={exhibition.id} exhibition={exhibition} showBadge="ending" />
                      ))}
                    </div>
                  </section>
                )}

                {/* APT Recommended */}
                {categorizedExhibitions.aptRecommended.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="w-6 h-6 text-black" />
                      <h2 className="text-2xl font-bold text-black">
                        {user?.personalityType ? `${user.personalityType}인 당신을 위한 추천` : '당신을 위한 추천'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categorizedExhibitions.aptRecommended.map(exhibition => (
                        <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Near You Tab */}
            {activeTab === 'near' && (
              <div className="space-y-6">
                {/* Region filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      selectedCity === 'all'
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    전체
                  </button>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        selectedCity === city
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Map toggle */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <MapIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">지도로 보기</span>
                  {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Map */}
                {showMap && (
                  <div className="h-[400px] rounded-lg overflow-hidden border border-neutral-200">
                    <ExhibitionMap
                      userAPT={user?.personalityType || 'LRMC'}
                      onExhibitionSelect={(exhibition) => {
                        handleExhibitionClick(exhibition as any);
                      }}
                    />
                  </div>
                )}

                {/* Exhibition grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredExhibitions.map(exhibition => (
                    <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Tab */}
            {activeTab === 'trending' && (
              <div className="space-y-8">
                <div className="bg-neutral-50 rounded-lg p-6 text-center">
                  <p className="text-neutral-600">
                    전시 처음이신가요? 많은 사람들이 관심있는 전시부터 시작해보세요
                  </p>
                </div>

                {/* Most Viewed */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Flame className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-black">지금 가장 많이 본 전시</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categorizedExhibitions.trending.slice(0, 8).map(exhibition => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                    ))}
                  </div>
                </section>

                {/* Most Saved */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-black">가장 많이 저장된 전시</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categorizedExhibitions.mostSaved.slice(0, 8).map(exhibition => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* All Tab */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="전시회 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="all">모든 지역</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Results count */}
                <p className="text-sm text-neutral-600">
                  총 <span className="font-semibold text-black">{filteredExhibitions.length}개</span>의 전시
                </p>

                {/* Exhibition grid */}
                {filteredExhibitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredExhibitions.map(exhibition => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

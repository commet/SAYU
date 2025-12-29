'use client';

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Search,
  Eye,
  Heart,
  Sparkles,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Flame,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-neutral-200 mb-5" />
    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-neutral-200 rounded w-1/3" />
  </div>
);

export default function ExhibitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { trackExhibitionView } = useActivityTracker();

  // State management
  const [filter, setFilter] = useState('all');
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
    if (searchQuery && filter === 'all') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(query) ||
        ex.venue.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [exhibitions, selectedCity, searchQuery, filter]);

  // Extract unique cities
  const cities = useMemo(() => {
    const locs = new Set(exhibitions.map(ex => ex.location).filter(Boolean));
    return Array.from(locs);
  }, [exhibitions]);

  // Exhibition Card Component
  const ExhibitionCard = ({ exhibition, index }: { exhibition: TransformedExhibition; index: number }) => {
    const daysLeft = getDaysUntilEnd(exhibition.endDate);
    const isNew = isNewExhibition(exhibition.startDate);

    return (
      <motion.div
        key={exhibition.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        whileHover={{ y: -8 }}
        onClick={() => handleExhibitionClick(exhibition)}
        className="group cursor-pointer"
      >
        {/* Poster Image */}
        <div className="aspect-[3/4] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-500 overflow-hidden mb-5 relative bg-neutral-50">
          {exhibition.image ? (
            <Image
              src={exhibition.image}
              alt={exhibition.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 grayscale group-hover:grayscale-0 transition-all duration-700" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
        </div>

        {/* Info */}
        <div className="space-y-2 px-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400">
                {exhibition.status}
              </p>
              {isNew && (
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-blue-500 font-medium">New</span>
              )}
              {daysLeft > 0 && daysLeft <= 14 && (
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-red-500 font-medium">D-{daysLeft}</span>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-neutral-400 font-light">
              {new Date(exhibition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(exhibition.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          <h3 className="text-base md:text-lg font-medium text-black line-clamp-2 group-hover:text-neutral-600 transition-colors duration-300">
            {exhibition.title}
          </h3>
          
          <div className="pt-1">
            <p className="text-sm text-neutral-600 font-medium">
              {exhibition.venue}
            </p>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              {exhibition.location}
            </p>
          </div>
        </div>

        {/* Animated Underline */}
        <div className="h-px bg-neutral-900 mt-6 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-8 lg:px-12">
      {/* 1. Page Header */}
      <div className="max-w-7xl mx-auto mb-12 md:mb-20">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs md:text-sm uppercase tracking-widest text-neutral-400 mb-3 md:mb-4"
        >
          Exhibitions
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-7xl font-light text-black mb-4 md:mb-6 tracking-tight"
        >
          Current Exhibitions
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-neutral-500 font-light max-w-2xl leading-relaxed"
        >
          Discover curated exhibitions happening now. <br className="hidden md:block" />
          Immerse yourself in the world of art.
        </motion.p>
      </div>

      {/* 2. Featured Exhibition (Hero) */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Featured</h2>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative aspect-[4/3] md:aspect-[21/9] border border-neutral-200 overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-neutral-100">
            <div className="w-full h-full bg-neutral-300 grayscale group-hover:grayscale-0 transition-all duration-1000" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
            <p className="text-xs uppercase tracking-widest text-white/70 mb-2 md:mb-3">Featured Exhibition</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-2 md:mb-4 tracking-tight">
              The Space Between
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-white/90">
              <p className="text-xs md:text-sm uppercase tracking-wider font-medium">Lee Ufan</p>
              <span className="hidden md:inline text-white/40">|</span>
              <p className="text-xs md:text-sm font-light">Guggenheim Museum · Until Sep 2025</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="border-b border-neutral-200 overflow-x-auto scrollbar-hide">
          <div className="flex gap-8 md:gap-12 min-w-max px-1">
            {['all', 'ongoing', 'upcoming', 'past'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-4 text-xs md:text-sm uppercase tracking-widest transition-colors relative ${
                  filter === tab ? 'text-black font-medium' : 'text-neutral-400 font-light hover:text-neutral-600'
                }`}
              >
                {tab}
                {filter === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-px bg-black" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
            {[...Array(8)].map((_, i) => (
              <ExhibitionSkeleton key={i} />
            ))}
          </div>
        ) : error && exhibitions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
            {filteredExhibitions.map((exhibition, index) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Search,
  Heart,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const ExhibitionMap = dynamic(
  () => import('@/components/exhibitions/ExhibitionMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-neutral-100 flex items-center justify-center rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    ),
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

  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [exhibitions, setExhibitions] = useState<TransformedExhibition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedExhibitions, setSavedExhibitions] = useState<Set<string>>(new Set());

  const featuredExhibition = useMemo(() => {
    if (loading || exhibitions.length === 0) return null;
    const featured = exhibitions.find(e => e.featured);
    const ongoing = exhibitions.filter(e => e.status === 'ongoing');
    return featured || ongoing[0] || exhibitions[0];
  }, [exhibitions, loading]);

  const handleExhibitionClick = useCallback((exhibition: TransformedExhibition) => {
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

  const fetchExhibitions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/exhibitions?limit=200`, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`API responded with status ${response.status}`);
      const result = await response.json();
      setExhibitions(result.data || result.exhibitions || []);
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      setError('An error occurred while fetching exhibitions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedExhibitions = useCallback(async () => {
    const localSaved = localStorage.getItem('savedExhibitions');
    if (localSaved) setSavedExhibitions(new Set(JSON.parse(localSaved)));

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

  const handleSaveExhibition = useCallback(async (exhibitionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const gate = requireAuth({ message: 'Login to save exhibitions.' });
    if (!gate.allowed) return;
    
    const newSet = new Set(savedExhibitions);
    const isSaved = savedExhibitions.has(exhibitionId);
    if (isSaved) {
      newSet.delete(exhibitionId);
      toast.success('Removed from saved');
    } else {
      newSet.add(exhibitionId);
      toast.success('Added to saved');
    }
    setSavedExhibitions(newSet);
    localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));

    if (user) {
      try {
        await fetch('/api/exhibitions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exhibitionId: exhibitionId, action: isSaved ? 'unsave' : 'save' }),
        });
      } catch (error) { console.error('Failed to sync saved exhibitions:', error); }
    }
  }, [user, savedExhibitions, requireAuth]);

  useEffect(() => {
    fetchExhibitions();
    fetchSavedExhibitions();
  }, [fetchExhibitions, fetchSavedExhibitions]);

  const filteredExhibitions = useMemo(() => {
    let filtered = exhibitions.filter(ex => ex.id !== featuredExhibition?.id);
    if (activeTab !== 'all') {
      filtered = filtered.filter(ex => ex.status === activeTab);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(query) ||
        ex.venue.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [exhibitions, activeTab, searchQuery, featuredExhibition]);

  const ExhibitionCard = ({ exhibition }: { exhibition: TransformedExhibition }) => {
    const dates = `${new Date(exhibition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(exhibition.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    let statusText: string;
    if (exhibition.status === 'ongoing') {
      const daysLeft = Math.ceil((new Date(exhibition.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      statusText = (daysLeft > 0 && daysLeft <= 14) ? `Ends in ${daysLeft}d` : 'Ongoing';
    } else {
      statusText = exhibition.status === 'upcoming' ? 'Upcoming' : 'Ended';
    }

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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : <div />}
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
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-light">{statusText} &middot; {dates}</p>
          <h3 className="text-base font-medium text-black line-clamp-2 leading-snug">{exhibition.title}</h3>
          <p className="text-sm text-neutral-600 font-light">{exhibition.venue}</p>
          <p className="text-xs text-neutral-400 font-light">{exhibition.location}</p>
        </div>
        <div className="h-px bg-neutral-900 mt-3 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="py-12 md:py-16">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">Exhibitions</p>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-3 tracking-tight">Current Exhibitions</h1>
          <p className="text-lg text-neutral-500 font-light max-w-3xl">Discover curated exhibitions from galleries and museums, updated daily.</p>
        </header>

        {featuredExhibition && (
          <section className="mb-12 md:mb-16 group" onClick={() => handleExhibitionClick(featuredExhibition)}>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Featured</h2>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="relative aspect-[16/7] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden cursor-pointer">
              {featuredExhibition.image &&
                <Image
                  src={featuredExhibition.image}
                  alt={featuredExhibition.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  priority
                />
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <p className="text-xs uppercase tracking-widest text-white/70 mb-2">Featured Exhibition</p>
                <h3 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">{featuredExhibition.title}</h3>
                <p className="text-sm uppercase tracking-wider text-white/90">{featuredExhibition.venue}</p>
              </div>
            </div>
          </section>
        )}

        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md pt-4 pb-4 border-b border-neutral-200 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-8 sm:gap-12">
              {(['all', 'ongoing', 'upcoming'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-2 text-sm uppercase tracking-widest font-light hover:text-black transition-colors relative"
                >
                  <span className={activeTab === tab ? "text-black font-medium" : "text-neutral-400"}>{tab}</span>
                  {activeTab === tab &&
                    <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-black" layoutId="activeExhibitionTab" />
                  }
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search title or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-transparent pl-9 pr-4 py-2 border-b border-neutral-200 focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>

        <main>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(12)].map((_, i) => <ExhibitionSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">{error}</p>
              <button onClick={() => fetchExhibitions()} className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-neutral-800">Retry</button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
              >
                {filteredExhibitions.map(exhibition => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
          {(!loading && filteredExhibitions.length === 0 && !error) &&
             <div className="text-center py-20">
                <p className="text-neutral-500">No exhibitions found for this filter.</p>
             </div>
          }
        </main>
      </div>
    </div>
  );
}
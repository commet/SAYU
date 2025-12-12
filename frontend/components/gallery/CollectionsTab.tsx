'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Heart, Sparkles, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { getCollectionsWithCovers, getArtMemories } from '@/lib/supabase/gallery';
import type { Collection } from '@/types/gallery';

import CreateCollectionModal from './CreateCollectionModal';
import CollectionCard from './CollectionCard';

interface CollectionsTabProps {
  onStatsUpdate: () => void;
}

interface CollectionWithCovers extends Collection {
  coverImages: string[];
}

export default function CollectionsTab({ onStatsUpdate }: CollectionsTabProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionWithCovers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Smart collection stats
  const [smartStats, setSmartStats] = useState({
    recent: 0,
    loved: 0,
    thisMonth: 0,
    exhibitions: 0
  });

  useEffect(() => {
    loadCollections();
    loadSmartStats();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const cols = await getCollectionsWithCovers();
      setCollections(cols as CollectionWithCovers[]);
    } catch (error: any) {
      console.error('Failed to load collections:', error);

      // Show specific error message
      if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        toast.error('❌ Supabase 테이블이 없습니다. Migration을 먼저 실행하세요!', { duration: 5000 });
      } else {
        toast.error(`컬렉션을 불러오지 못했습니다: ${error?.message || '알 수 없는 오류'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSmartStats = async () => {
    try {
      // Recent (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { total: recentCount } = await getArtMemories({
        startDate: sevenDaysAgo.toISOString(),
        limit: 1
      });

      // This month
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const { total: thisMonthCount } = await getArtMemories({
        startDate: thisMonthStart.toISOString(),
        limit: 1
      });

      // Exhibition visits
      const { total: exhibitionsCount } = await getArtMemories({
        type: 'exhibition_visit',
        limit: 1
      });

      setSmartStats({
        recent: recentCount,
        loved: 0, // TODO: implement "most viewed" logic
        thisMonth: thisMonthCount,
        exhibitions: exhibitionsCount
      });
    } catch (error) {
      console.error('Failed to load smart stats:', error);
    }
  };

  const handleCreateCollection = async () => {
    await loadCollections();
    onStatsUpdate();
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
        <p className="text-neutral-600">컬렉션을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Smart Collections */}
      <div>
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Quick Access</h2>
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">Auto-updated</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SmartCollectionCard
            title="Recent"
            subtitle="Last 7 days"
            count={smartStats.recent}
          />
          <SmartCollectionCard
            title="Favorites"
            subtitle="Most viewed"
            count={smartStats.loved}
          />
          <SmartCollectionCard
            title="This Month"
            subtitle={new Date().toLocaleDateString('en-US', { month: 'long' })}
            count={smartStats.thisMonth}
          />
          <SmartCollectionCard
            title="Exhibitions"
            subtitle="Visited"
            count={smartStats.exhibitions}
          />
        </div>
      </div>

      {/* User Collections */}
      <div>
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Personal Collections</h2>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {collections.length === 0 && !loading ? (
          <div className="border border-neutral-200 rounded-sm p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
              <Palette className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-light text-black mb-2 tracking-tight">Create your first collection</h3>
            <p className="text-sm text-neutral-500 mb-8 max-w-md mx-auto">
              Organize artworks by theme and build your personal museum
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              New Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Create New Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="aspect-[4/3] border border-neutral-300 hover:border-black transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <Plus className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
              <p className="text-xs uppercase tracking-wider text-neutral-500 group-hover:text-black transition-colors">New</p>
            </button>

            {/* User Collections */}
            {collections.filter(c => c.organizationType === 'manual').map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onUpdate={() => {
                  loadCollections();
                  onStatsUpdate();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCollection}
        />
      )}
    </div>
  );
}

// Smart Collection Card Component - Minimal & Professional
function SmartCollectionCard({
  title,
  subtitle,
  count
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white border border-neutral-200 hover:border-neutral-400 transition-all p-6 overflow-hidden"
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">{subtitle}</p>
          <h3 className="text-sm font-medium text-black">{title}</h3>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light text-black tracking-tight">{count}</span>
          <span className="text-xs text-neutral-400 uppercase tracking-wider">items</span>
        </div>
      </div>

      {/* Accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

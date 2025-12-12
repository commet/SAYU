'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getArtMemories, getCollectionsWithCovers } from '@/lib/supabase/gallery';

// Tabs
import CollectionsTab from '@/components/gallery/CollectionsTab';
import TimelineTab from '@/components/gallery/TimelineTab';
import MapTab from '@/components/gallery/MapTab';
import EmotionsTab from '@/components/gallery/EmotionsTab';
import DiscoverTab from '@/components/gallery/DiscoverTab';

type TabType = 'collections' | 'timeline' | 'map' | 'emotions' | 'discover';

function GalleryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [stats, setStats] = useState({
    artworks: 0,
    exhibitions: 0,
    collections: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Get total artworks
      const { total: artworksCount } = await getArtMemories({ limit: 1 });

      // Get exhibition visits
      const { total: exhibitionsCount } = await getArtMemories({
        type: 'exhibition_visit',
        limit: 1
      });

      // Get collections
      const collections = await getCollectionsWithCovers();

      setStats({
        artworks: artworksCount,
        exhibitions: exhibitionsCount,
        collections: collections.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Personal Archive</p>
              <h1 className="text-5xl font-light text-black mb-1 tracking-tight">Art Memories</h1>
            </div>

            {/* Stats - Minimal */}
            <div className="flex gap-8 pb-2">
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.artworks}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">Works</p>
              </div>
              <div className="h-12 w-px bg-neutral-200" />
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.exhibitions}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">Visits</p>
              </div>
              <div className="h-12 w-px bg-neutral-200" />
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.collections}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">Collections</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-neutral-200 mb-8"
        >
          <div className="flex gap-12">
            {[
              { id: 'collections', label: 'Collections' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'map', label: 'Map' },
              { id: 'emotions', label: 'Emotions' },
              { id: 'discover', label: 'Discover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "pb-4 text-sm uppercase tracking-widest transition-colors relative",
                  activeTab === tab.id
                    ? "text-black font-medium"
                    : "text-neutral-400 hover:text-neutral-600 font-light"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-px bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'collections' && <CollectionsTab onStatsUpdate={loadStats} />}
            {activeTab === 'timeline' && <TimelineTab />}
            {activeTab === 'map' && <MapTab />}
            {activeTab === 'emotions' && <EmotionsTab />}
            {activeTab === 'discover' && <DiscoverTab onStatsUpdate={loadStats} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}

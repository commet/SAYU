'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getArtMemories, getCollectionsWithCovers } from '@/lib/supabase/gallery';
import { useLanguage } from '@/contexts/LanguageContext';

// Tabs
import CollectionsTab from '@/components/gallery/CollectionsTab';
import TimelineTab from '@/components/gallery/TimelineTab';
import MapTab from '@/components/gallery/MapTab';
import EmotionsTab from '@/components/gallery/EmotionsTab';
import DiscoverTab from '@/components/gallery/DiscoverTab';

type TabType = 'collections' | 'timeline' | 'map' | 'emotions' | 'discover';

// Translations
const t = {
  en: {
    personalArchive: 'Personal Archive',
    artMemories: 'Art Memories',
    works: 'Works',
    visits: 'Visits',
    collections: 'Collections',
    timeline: 'Timeline',
    map: 'Map',
    emotions: 'Emotions',
    discover: 'Discover',
    loading: 'Loading...',
  },
  ko: {
    personalArchive: 'Personal Archive',
    artMemories: 'Art Memories',
    works: '작품',
    visits: '방문',
    collections: '컬렉션',
    timeline: '타임라인',
    map: '지도',
    emotions: '감정',
    discover: '발견',
    loading: '로딩 중...',
  },
};

interface GalleryClientProps {
  initialStats: {
    artworks: number;
    exhibitions: number;
    collections: number;
  };
}

export default function GalleryClient({ initialStats }: GalleryClientProps) {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const texts = t[language];

  const tabParam = searchParams?.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'discover');
  const [stats, setStats] = useState(initialStats);

  // URL의 tab 파라미터가 변경되면 activeTab 업데이트
  useEffect(() => {
    if (tabParam && ['collections', 'timeline', 'map', 'emotions', 'discover'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 사용자 변경 시에만 통계 다시 로드 (초기 데이터는 서버에서 받음)
  const loadStats = async () => {
    try {
      const [artworksResult, exhibitionsResult, collections] = await Promise.all([
        getArtMemories({ limit: 1 }),
        getArtMemories({ type: 'exhibition_visit', limit: 1 }),
        getCollectionsWithCovers()
      ]);

      setStats({
        artworks: artworksResult.total,
        exhibitions: exhibitionsResult.total,
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
          <p className="text-neutral-600 text-sm">{texts.loading}</p>
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
              <p className="text-sm uppercase tracking-widest text-neutral-500 mb-3">{texts.personalArchive}</p>
              <h1 className="text-5xl font-light text-black mb-1 tracking-tight">{texts.artMemories}</h1>
            </div>

            {/* Stats - Minimal */}
            <div className="flex gap-8 pb-2">
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.artworks}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">{texts.works}</p>
              </div>
              <div className="h-12 w-px bg-neutral-200" />
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.exhibitions}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">{texts.visits}</p>
              </div>
              <div className="h-12 w-px bg-neutral-200" />
              <div className="text-right">
                <p className="text-2xl font-light text-black tracking-tight">{stats.collections}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400">{texts.collections}</p>
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
              { id: 'collections', label: texts.collections },
              { id: 'timeline', label: texts.timeline },
              { id: 'map', label: texts.map },
              { id: 'emotions', label: texts.emotions },
              { id: 'discover', label: texts.discover },
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

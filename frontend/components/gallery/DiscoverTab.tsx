'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCloudinaryArtworks } from '@/hooks/useCloudinaryArtworks';
import { createArtMemory, getCollections, addMemoryToCollection } from '@/lib/supabase/gallery';
import { cn } from '@/lib/utils';

interface DiscoverTabProps {
  onStatsUpdate: () => void;
}

export default function DiscoverTab({ onStatsUpdate }: DiscoverTabProps) {
  const { user } = useAuth();
  const { artworks, loading } = useCloudinaryArtworks({
    userType: user?.personalityType || user?.aptType || 'SREF',
    limit: 30,
    random: true,
    autoLoad: true
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    try {
      const cols = await getCollections();
      setCollections(cols);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleSave = async (artwork: any) => {
    try {
      // 1. Create Art Memory
      const memory = await createArtMemory({
        type: 'online_artwork',
        timestamp: new Date(),
        emotionTags: [],
        artworkData: {
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          imageUrl: artwork.imageUrl,
          style: artwork.style,
          museum: artwork.museum,
          description: artwork.description
        },
        source: 'online'
      });

      // 2. Add to "Unsorted" collection (if exists)
      const unsortedCollection = collections.find(c => c.name === 'Unsorted');
      if (unsortedCollection) {
        await addMemoryToCollection(unsortedCollection.id, memory.id);
      }

      setSavedIds(prev => new Set(prev).add(artwork.id));
      toast.success('💾 저장되었습니다!');
      onStatsUpdate();
    } catch (error) {
      console.error('Failed to save artwork:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
        <p className="text-neutral-600">작품을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline gap-3 mb-8">
        <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Curated For You</h2>
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-400">AI Selected</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group relative"
          >
            <div className="aspect-square bg-neutral-100 relative border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden">
              {artwork.imageUrl && (
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              )}

              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

              {/* Save Button - Minimal */}
              <button
                onClick={() => handleSave(artwork)}
                disabled={savedIds.has(artwork.id)}
                className={cn(
                  "absolute top-3 right-3 p-2 backdrop-blur-sm border transition-all",
                  savedIds.has(artwork.id)
                    ? "bg-black border-black"
                    : "bg-white/90 border-white/90 opacity-0 group-hover:opacity-100"
                )}
              >
                <Bookmark className={cn(
                  "w-4 h-4 transition-colors",
                  savedIds.has(artwork.id) ? "text-white fill-white" : "text-neutral-600"
                )} />
              </button>
            </div>

            {/* Info below */}
            <div className="mt-3 space-y-0.5">
              <h3 className="text-sm font-medium text-black line-clamp-1">
                {artwork.title}
              </h3>
              <p className="text-xs text-neutral-500 line-clamp-1">
                {artwork.artist}
              </p>
              <p className="text-xs text-neutral-400">
                {artwork.year}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

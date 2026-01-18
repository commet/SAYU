'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Calendar, Palette, MapPin } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuthSelector, authSelectors } from '@/hooks/useAuth';
import { useCloudinaryArtworks } from '@/hooks/useCloudinaryArtworks';
import { createArtMemory, getCollections, addMemoryToCollection } from '@/lib/supabase/gallery';
import { cn } from '@/lib/utils';

interface DiscoverTabProps {
  onStatsUpdate: () => void;
}

interface ArtworkGridItemProps {
  artwork: any;
  index: number;
  isSaved: boolean;
  onSave: (artwork: any) => void;
  onSelect: (artwork: any) => void;
}

// Memoized grid item to prevent unnecessary re-renders
const ArtworkGridItem = memo(function ArtworkGridItem({
  artwork,
  index,
  isSaved,
  onSave,
  onSelect
}: ArtworkGridItemProps) {
  return (
    <motion.div
      key={artwork.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative"
    >
      <div
        className="aspect-square bg-neutral-100 relative border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden cursor-pointer"
        onClick={() => onSelect(artwork)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(artwork)}
        tabIndex={0}
        role="button"
        aria-label={`View ${artwork.title} by ${artwork.artist}`}
      >
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
          onClick={(e) => { e.stopPropagation(); onSave(artwork); }}
          disabled={isSaved}
          aria-label={isSaved ? `${artwork.title} saved` : `Save ${artwork.title}`}
          className={cn(
            "absolute top-3 right-3 p-2 backdrop-blur-sm border transition-all",
            isSaved
              ? "bg-black border-black"
              : "bg-white/90 border-white/90 opacity-0 group-hover:opacity-100"
          )}
        >
          <Bookmark className={cn(
            "w-4 h-4 transition-colors",
            isSaved ? "text-white fill-white" : "text-neutral-600"
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
  );
});

export default function DiscoverTab({ onStatsUpdate }: DiscoverTabProps) {
  // Selector pattern: only re-renders when user or personalityType changes
  const user = useAuthSelector(authSelectors.user);
  const personalityType = useAuthSelector(authSelectors.personalityType);

  const { artworks, loading } = useCloudinaryArtworks({
    userType: personalityType || user?.aptType || 'SREF',
    limit: 30,
    random: true,
    autoLoad: true
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

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

  const handleSave = useCallback(async (artwork: any) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

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
    } catch (error: any) {
      console.error('Failed to save artwork:', error?.message || error?.code || JSON.stringify(error));
      toast.error(error?.message || '저장에 실패했습니다');
    }
  }, [user, collections, onStatsUpdate]);

  const handleSelectArtwork = useCallback((artwork: any) => {
    setSelectedArtwork(artwork);
  }, []);

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
          <ArtworkGridItem
            key={artwork.id}
            artwork={artwork}
            index={index}
            isSaved={savedIds.has(artwork.id)}
            onSave={handleSave}
            onSelect={handleSelectArtwork}
          />
        ))}
      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative bg-white max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-1/2 aspect-square bg-neutral-100">
                  {selectedArtwork.imageUrl && (
                    <Image
                      src={selectedArtwork.imageUrl}
                      alt={selectedArtwork.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-black mb-1">
                      {selectedArtwork.title}
                    </h2>
                    <p className="text-lg text-neutral-600 mb-4">
                      {selectedArtwork.artist}
                    </p>

                    <div className="space-y-3 mb-6">
                      {selectedArtwork.year && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedArtwork.year}</span>
                        </div>
                      )}
                      {selectedArtwork.style && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Palette className="w-4 h-4" />
                          <span>{selectedArtwork.style}</span>
                        </div>
                      )}
                      {selectedArtwork.museum && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedArtwork.museum}</span>
                        </div>
                      )}
                    </div>

                    {selectedArtwork.description && (
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {selectedArtwork.description}
                      </p>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      handleSave(selectedArtwork);
                      setSelectedArtwork(null);
                    }}
                    disabled={savedIds.has(selectedArtwork.id)}
                    className={cn(
                      "mt-6 w-full py-3 flex items-center justify-center gap-2 font-medium transition-all",
                      savedIds.has(selectedArtwork.id)
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-neutral-800"
                    )}
                  >
                    <Bookmark className={cn(
                      "w-5 h-5",
                      savedIds.has(selectedArtwork.id) && "fill-current"
                    )} />
                    {savedIds.has(selectedArtwork.id) ? '저장됨' : '내 갤러리에 저장'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtMemories } from '@/lib/supabase/gallery';
import type { ArtMemory, EmotionTag, EmotionGroup } from '@/types/gallery';

const EMOTION_CONFIG: Record<EmotionTag, { color: string; bg: string; label: string }> = {
  '위로':      { color: '#D97706', bg: 'bg-amber-50',   label: '위로' },
  '에너지':    { color: '#EA580C', bg: 'bg-orange-50',  label: '에너지' },
  '평온':      { color: '#0D9488', bg: 'bg-teal-50',    label: '평온' },
  '호기심':    { color: '#4F46E5', bg: 'bg-indigo-50',  label: '호기심' },
  '감동':      { color: '#E11D48', bg: 'bg-rose-50',    label: '감동' },
  '우울':      { color: '#475569', bg: 'bg-slate-50',   label: '우울' },
  '기쁨':      { color: '#CA8A04', bg: 'bg-yellow-50',  label: '기쁨' },
  '놀라움':    { color: '#9333EA', bg: 'bg-purple-50',  label: '놀라움' },
  '생각할거리': { color: '#6B7280', bg: 'bg-gray-50',    label: '생각할거리' },
  '압도적':    { color: '#991B1B', bg: 'bg-red-50',     label: '압도적' },
  '아름다움':  { color: '#EC4899', bg: 'bg-pink-50',    label: '아름다움' },
  '슬픔':      { color: '#1E3A5F', bg: 'bg-blue-50',    label: '슬픔' },
};

const ALL_EMOTIONS: EmotionTag[] = [
  '위로', '에너지', '평온', '호기심',
  '감동', '우울', '기쁨', '놀라움',
  '생각할거리', '압도적', '아름다움', '슬픔',
];

export default function EmotionsTab() {
  const [memories, setMemories] = useState<ArtMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTag | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getArtMemories({ limit: 500 });
        setMemories(result.memories);
      } catch (e) {
        console.error('Failed to load memories:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const emotionGroups: EmotionGroup[] = useMemo(() => {
    return ALL_EMOTIONS.map((emotion) => {
      const matched = memories.filter((m) => m.emotionTags?.includes(emotion));
      return { emotion, count: matched.length, memories: matched };
    });
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (!selectedEmotion) return [];
    return memories.filter((m) => m.emotionTags?.includes(selectedEmotion));
  }, [memories, selectedEmotion]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Emotion Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {emotionGroups.map(({ emotion, count, memories: groupMemories }) => {
          const config = EMOTION_CONFIG[emotion];
          const isSelected = selectedEmotion === emotion;
          const coverImage = groupMemories[0]?.artworkData?.imageUrl;

          return (
            <motion.button
              key={emotion}
              onClick={() => setSelectedEmotion(isSelected ? null : emotion)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative overflow-hidden rounded-xl aspect-square
                transition-all duration-200
                ${isSelected ? 'ring-2 ring-offset-2' : ''}
              `}
              style={{
                ringColor: isSelected ? config.color : undefined,
              }}
            >
              {/* Background */}
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={emotion}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: config.color + '18' }}
                />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: coverImage
                    ? `linear-gradient(to top, ${config.color}CC, ${config.color}44)`
                    : 'transparent',
                }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-3 text-center">
                <span
                  className="text-lg font-semibold"
                  style={{ color: coverImage ? '#fff' : config.color }}
                >
                  {config.label}
                </span>
                <span
                  className="text-xs mt-1 font-medium"
                  style={{ color: coverImage ? 'rgba(255,255,255,0.8)' : config.color + '99' }}
                >
                  {count > 0 ? `${count}개` : '-'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Empty State - no memories at all */}
      {memories.length === 0 && (
        <div className="bg-neutral-50 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">🎨</p>
          <p className="text-neutral-600">
            갤러리에서 작품을 저장할 때 감정 태그를 추가하면 여기에 표시됩니다
          </p>
        </div>
      )}

      {/* Filtered Artworks */}
      <AnimatePresence mode="wait">
        {selectedEmotion && (
          <motion.div
            key={selectedEmotion}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: EMOTION_CONFIG[selectedEmotion].color }}
              />
              <h3 className="text-lg font-medium text-black">
                {EMOTION_CONFIG[selectedEmotion].label}
              </h3>
              <span className="text-sm text-neutral-400">{filteredMemories.length}개</span>
            </div>

            {filteredMemories.length === 0 ? (
              <p className="text-neutral-500 text-sm py-6 text-center">
                이 감정으로 태그된 작품이 아직 없습니다
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMemories.map((memory) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 relative">
                      {memory.artworkData?.imageUrl ? (
                        <img
                          src={memory.artworkData.imageUrl}
                          alt={memory.artworkData?.title || ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">
                          {memory.type === 'exhibition_visit' ? '🏛️' : '🎨'}
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-black truncate">
                        {memory.artworkData?.title || memory.personalNote?.slice(0, 30) || '무제'}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {memory.artworkData?.artist || memory.exhibitionData?.museum || ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

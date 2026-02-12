'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getArtMemories } from '@/lib/supabase/gallery';
import type { ArtMemory, EmotionTag } from '@/types/gallery';

const EMOTION_COLORS: Record<string, string> = {
  '위로': '#D97706', '에너지': '#EA580C', '평온': '#0D9488', '호기심': '#4F46E5',
  '감동': '#E11D48', '우울': '#475569', '기쁨': '#CA8A04', '놀라움': '#9333EA',
  '생각할거리': '#6B7280', '압도적': '#991B1B', '아름다움': '#EC4899', '슬픔': '#1E3A5F',
};

const TYPE_ICONS: Record<string, string> = {
  online_artwork: '🎨',
  exhibition_visit: '🏛️',
  exhibition_artwork: '🖼️',
  personal_note: '📝',
};

const PAGE_SIZE = 30;

interface MonthGroup {
  key: string;      // "2025-12"
  label: string;    // "2025년 12월"
  memories: ArtMemory[];
}

function formatMonthLabel(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}년 ${parseInt(month)}월`;
}

function formatDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[date.getDay()];
  return `${m}/${d} (${day})`;
}

export default function TimelineTab() {
  const [memories, setMemories] = useState<ArtMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const loadMemories = useCallback(async (offset: number) => {
    try {
      const result = await getArtMemories({ limit: PAGE_SIZE, offset });
      return result;
    } catch (e) {
      console.error('Failed to load memories:', e);
      return { memories: [], total: 0 };
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const result = await loadMemories(0);
      setMemories(result.memories);
      setTotal(result.total);
      setHasMore(result.memories.length < result.total);
      setLoading(false);
    };
    init();
  }, [loadMemories]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const result = await loadMemories(memories.length);
    const combined = [...memories, ...result.memories];
    setMemories(combined);
    setHasMore(combined.length < result.total);
    setLoadingMore(false);
  };

  const monthGroups: MonthGroup[] = useMemo(() => {
    const groups = new Map<string, ArtMemory[]>();
    memories.forEach((m) => {
      const d = new Date(m.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    });
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, mems]) => ({ key, label: formatMonthLabel(key), memories: mems }));
  }, [memories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black" />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-2xl p-12 text-center">
        <p className="text-4xl mb-4">📅</p>
        <h3 className="text-lg font-medium text-black mb-2">아직 기록이 없어요</h3>
        <p className="text-neutral-500 text-sm">
          첫 번째 예술 기억을 만들어보세요 &mdash; Discover 탭에서 작품을 저장하거나 전시 방문을 기록하세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Summary */}
      <p className="text-sm text-neutral-400 mb-6">
        총 {total}개의 기억
      </p>

      {/* Timeline */}
      {monthGroups.map((group, gi) => (
        <div key={group.key} className="relative">
          {/* Month Header */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm py-2 mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              {group.label}
            </h3>
          </div>

          {/* Timeline Line + Cards */}
          <div className="relative pl-8 border-l border-neutral-200 ml-3 space-y-4 pb-8">
            {group.memories.map((memory, mi) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: mi * 0.03 }}
                className="relative"
              >
                {/* Dot on timeline */}
                <div
                  className="absolute -left-[41px] top-3 w-3 h-3 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: memory.emotionTags?.[0]
                      ? EMOTION_COLORS[memory.emotionTags[0]] || '#9CA3AF'
                      : '#D1D5DB',
                  }}
                />

                {/* Card */}
                <div className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {memory.artworkData?.imageUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={memory.artworkData.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0 text-2xl">
                        {TYPE_ICONS[memory.type] || '🎨'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">
                          {TYPE_ICONS[memory.type] || '🎨'}
                        </span>
                        <p className="text-sm font-medium text-black truncate">
                          {memory.artworkData?.title || memory.exhibitionData?.name || memory.personalNote?.slice(0, 40) || '무제'}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-500 mb-2">
                        {formatDate(new Date(memory.timestamp))}
                        {memory.artworkData?.artist && ` · ${memory.artworkData.artist}`}
                        {memory.exhibitionData?.museum && ` · ${memory.exhibitionData.museum}`}
                      </p>

                      {/* Emotion Tags */}
                      {memory.emotionTags && memory.emotionTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {memory.emotionTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: (EMOTION_COLORS[tag] || '#9CA3AF') + '18',
                                color: EMOTION_COLORS[tag] || '#6B7280',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-full hover:border-neutral-400 transition-colors disabled:opacity-50"
          >
            {loadingMore ? '불러오는 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
}

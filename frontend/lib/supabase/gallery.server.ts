import { cache } from 'react';
import { createClient } from './server';
import type { ArtMemory, Collection } from '@/types/gallery';

// ============================================
// React.cache() - 같은 요청 내 중복 호출 제거
// ============================================

/**
 * 캐시된 컬렉션 목록 조회
 * Server Component에서 여러 번 호출해도 1번만 실행
 */
export const getCachedCollections = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(transformCollectionFromDB) || [];
});

/**
 * 캐시된 컬렉션 + 커버 이미지 조회
 * 단일 JOIN 쿼리로 N+1 문제 해결
 */
export const getCachedCollectionsWithCovers = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (
        memory_id,
        added_at,
        art_memories (artwork_data)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(col => {
    // @ts-ignore - Supabase nested select typing
    const sortedItems = (col.collection_items || [])
      .sort((a: any, b: any) =>
        new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      )
      .slice(0, 4);

    const coverImages = sortedItems
      .map((item: any) => item.art_memories?.artwork_data?.imageUrl)
      .filter(Boolean);

    const { collection_items, ...collectionData } = col;
    return {
      ...transformCollectionFromDB(collectionData),
      coverImages
    };
  }) || [];
});

/**
 * 캐시된 Art Memory 통계 조회
 */
export const getCachedGalleryStats = cache(async () => {
  const supabase = await createClient();

  // 병렬로 모든 통계 조회
  const [artworksResult, exhibitionsResult, collectionsResult] = await Promise.all([
    supabase
      .from('art_memories')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('art_memories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'exhibition_visit'),
    supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
  ]);

  return {
    artworks: artworksResult.count || 0,
    exhibitions: exhibitionsResult.count || 0,
    collections: collectionsResult.count || 0
  };
});

/**
 * 캐시된 Art Memories 조회 (필터링 지원)
 */
export const getCachedArtMemories = cache(async (filters?: {
  type?: string;
  source?: string;
  limit?: number;
}) => {
  const supabase = await createClient();

  let query = supabase
    .from('art_memories')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.source) {
    query = query.eq('source', filters.source);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    memories: data?.map(transformMemoryFromDB) || [],
    total: count || 0
  };
});

// ============================================
// Transform Helpers
// ============================================

function transformMemoryFromDB(dbMemory: any): ArtMemory {
  return {
    id: dbMemory.id,
    userId: dbMemory.user_id,
    type: dbMemory.type,
    timestamp: new Date(dbMemory.timestamp),
    emotionTags: dbMemory.emotion_tags || [],
    personalNote: dbMemory.personal_note,
    mood: dbMemory.mood,
    artworkData: dbMemory.artwork_data,
    exhibitionId: dbMemory.exhibition_id,
    exhibitionData: dbMemory.exhibition_data,
    userPhotos: dbMemory.user_photos || [],
    voiceNoteUrl: dbMemory.voice_note_url,
    source: dbMemory.source,
    weather: dbMemory.weather,
    companion: dbMemory.companion,
    location: dbMemory.location_lat && dbMemory.location_lng ? {
      lat: parseFloat(dbMemory.location_lat),
      lng: parseFloat(dbMemory.location_lng),
      address: dbMemory.location_address
    } : undefined,
    viewCount: dbMemory.view_count,
    createdAt: new Date(dbMemory.created_at),
    updatedAt: new Date(dbMemory.updated_at)
  };
}

function transformCollectionFromDB(dbCollection: any): Collection {
  return {
    id: dbCollection.id,
    userId: dbCollection.user_id,
    name: dbCollection.name,
    description: dbCollection.description,
    emoji: dbCollection.emoji,
    themeColor: dbCollection.theme_color,
    coverType: dbCollection.cover_type,
    coverImageUrl: dbCollection.cover_image_url,
    organizationType: dbCollection.organization_type,
    smartFilters: dbCollection.smart_filters,
    itemCount: dbCollection.item_count,
    createdAt: new Date(dbCollection.created_at),
    updatedAt: new Date(dbCollection.updated_at),
    isPublic: dbCollection.is_public,
    shareUrl: dbCollection.share_url
  };
}

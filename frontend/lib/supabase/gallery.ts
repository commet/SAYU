import { createClient } from '@/lib/supabase/client';
import type { ArtMemory, Collection, CollectionWithMemories } from '@/types/gallery';

const supabase = createClient();

// ============================================
// Art Memories CRUD
// ============================================

export async function createArtMemory(data: Partial<ArtMemory>) {
  const { data: memory, error } = await supabase
    .from('art_memories')
    .insert({
      type: data.type,
      timestamp: data.timestamp || new Date().toISOString(),
      emotion_tags: data.emotionTags || [],
      personal_note: data.personalNote,
      mood: data.mood,
      artwork_data: data.artworkData,
      exhibition_id: data.exhibitionId,
      exhibition_data: data.exhibitionData,
      user_photos: data.userPhotos || [],
      voice_note_url: data.voiceNoteUrl,
      source: data.source,
      weather: data.weather,
      companion: data.companion,
      location_lat: data.location?.lat,
      location_lng: data.location?.lng,
      location_address: data.location?.address,
    })
    .select()
    .single();

  if (error) throw error;
  return transformMemoryFromDB(memory);
}

export async function getArtMemories(filters?: {
  type?: string;
  source?: string;
  emotions?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
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
  if (filters?.emotions && filters.emotions.length > 0) {
    query = query.overlaps('emotion_tags', filters.emotions);
  }
  if (filters?.startDate) {
    query = query.gte('timestamp', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('timestamp', filters.endDate);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    memories: data?.map(transformMemoryFromDB) || [],
    total: count || 0
  };
}

export async function getArtMemory(id: string) {
  const { data, error } = await supabase
    .from('art_memories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return transformMemoryFromDB(data);
}

export async function updateArtMemory(id: string, updates: Partial<ArtMemory>) {
  const { data, error } = await supabase
    .from('art_memories')
    .update({
      emotion_tags: updates.emotionTags,
      personal_note: updates.personalNote,
      mood: updates.mood,
      artwork_data: updates.artworkData,
      user_photos: updates.userPhotos,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformMemoryFromDB(data);
}

export async function deleteArtMemory(id: string) {
  const { error } = await supabase
    .from('art_memories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// Collections CRUD
// ============================================

export async function createCollection(data: Partial<Collection>) {
  const { data: collection, error } = await supabase
    .from('collections')
    .insert({
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      theme_color: data.themeColor || '#000000',
      cover_type: data.coverType || 'auto',
      cover_image_url: data.coverImageUrl,
      organization_type: data.organizationType || 'manual',
      smart_filters: data.smartFilters,
      is_public: data.isPublic || false,
    })
    .select()
    .single();

  if (error) throw error;
  return transformCollectionFromDB(collection);
}

export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(transformCollectionFromDB) || [];
}

export async function getCollection(id: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return transformCollectionFromDB(data);
}

export async function getCollectionWithMemories(id: string): Promise<CollectionWithMemories> {
  // 1. Get collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (collectionError) throw collectionError;

  // 2. Get memories through collection_items
  const { data: items, error: itemsError } = await supabase
    .from('collection_items')
    .select(`
      memory_id,
      art_memories (*)
    `)
    .eq('collection_id', id)
    .order('position', { ascending: true });

  if (itemsError) throw itemsError;

  // @ts-ignore - Supabase nested select typing issue
  const memories = items?.map(item => transformMemoryFromDB(item.art_memories)) || [];
  const coverImages = memories
    .slice(0, 4)
    .map(m => m.artworkData?.imageUrl)
    .filter(Boolean) as string[];

  return {
    ...transformCollectionFromDB(collection),
    memories,
    coverImages
  };
}

export async function updateCollection(id: string, updates: Partial<Collection>) {
  const { data, error } = await supabase
    .from('collections')
    .update({
      name: updates.name,
      description: updates.description,
      emoji: updates.emoji,
      theme_color: updates.themeColor,
      cover_type: updates.coverType,
      cover_image_url: updates.coverImageUrl,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformCollectionFromDB(data);
}

export async function deleteCollection(id: string) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function addMemoryToCollection(collectionId: string, memoryId: string) {
  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      memory_id: memoryId,
    });

  if (error) throw error;
}

export async function removeMemoryFromCollection(collectionId: string, memoryId: string) {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('memory_id', memoryId);

  if (error) throw error;
}

// ============================================
// Helper: Get Collections with Cover Images
// ============================================

export async function getCollectionsWithCovers() {
  const collections = await getCollections();

  const collectionsWithCovers = await Promise.all(
    collections.map(async (col) => {
      // Get first 4 memories for cover
      const { data: items } = await supabase
        .from('collection_items')
        .select(`
          memory_id,
          art_memories (artwork_data)
        `)
        .eq('collection_id', col.id)
        .order('added_at', { ascending: false })
        .limit(4);

      // @ts-ignore
      const coverImages = items
        ?.map(item => item.art_memories?.artwork_data?.imageUrl)
        .filter(Boolean) || [];

      return {
        ...col,
        coverImages
      };
    })
  );

  return collectionsWithCovers;
}

// ============================================
// Transform Helpers (DB → App Types)
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

-- ============================================
-- SAYU Art Memory System
-- Phase 1: Foundation
-- ============================================

-- ============================================
-- Art Memories Table
-- ============================================

CREATE TABLE art_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type & Timestamp
  type TEXT NOT NULL CHECK (type IN ('online_artwork', 'exhibition_visit', 'exhibition_artwork', 'personal_note')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Emotions & Notes
  emotion_tags TEXT[] DEFAULT '{}',
  personal_note TEXT,
  mood TEXT,

  -- Artwork Data (JSONB for flexibility)
  artwork_data JSONB,
  /*
    Structure:
    {
      "title": "별이 빛나는 밤",
      "artist": "빈센트 반 고흐",
      "year": "1889",
      "imageUrl": "https://...",
      "style": "인상주의",
      "museum": "MoMA",
      "description": "..."
    }
  */

  -- Exhibition Data
  exhibition_id UUID,
  exhibition_data JSONB,
  /*
    Structure:
    {
      "name": "이불 개인전",
      "museum": "리움미술관",
      "location": "서울 용산구",
      "visitDate": "2024-12-15",
      "ticketPrice": 15000
    }
  */

  -- Media
  user_photos TEXT[] DEFAULT '{}',
  voice_note_url TEXT,

  -- Context
  source TEXT NOT NULL CHECK (source IN ('online', 'offline')),
  weather TEXT,
  companion TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,

  -- Meta
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_art_memories_user ON art_memories(user_id);
CREATE INDEX idx_art_memories_type ON art_memories(type);
CREATE INDEX idx_art_memories_timestamp ON art_memories(timestamp DESC);
CREATE INDEX idx_art_memories_emotions ON art_memories USING GIN(emotion_tags);
CREATE INDEX idx_art_memories_source ON art_memories(source);

-- ============================================
-- Collections Table
-- ============================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  theme_color TEXT DEFAULT '#000000',

  -- Cover
  cover_type TEXT DEFAULT 'auto' CHECK (cover_type IN ('auto', 'custom')),
  cover_image_url TEXT,

  -- Type
  organization_type TEXT DEFAULT 'manual' CHECK (organization_type IN ('manual', 'smart')),
  smart_filters JSONB,
  /*
    Structure for smart collections:
    {
      "emotions": ["위로", "평온"],
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      },
      "exhibitions": ["uuid1", "uuid2"],
      "artists": ["Vincent van Gogh"],
      "styles": ["인상주의"],
      "source": "online",
      "minViewCount": 3
    }
  */

  -- Meta
  item_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  share_url TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_type ON collections(organization_type);

-- ============================================
-- Collection Items (Many-to-Many)
-- ============================================

CREATE TABLE collection_items (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES art_memories(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (collection_id, memory_id)
);

-- Indexes
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_memory ON collection_items(memory_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Art Memories RLS
ALTER TABLE art_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
  ON art_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON art_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON art_memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON art_memories FOR DELETE
  USING (auth.uid() = user_id);

-- Collections RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection Items RLS
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collection items"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own collection items"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own collection items"
  ON collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- ============================================
-- Triggers for Auto-updating
-- ============================================

-- Update collection item_count
CREATE OR REPLACE FUNCTION update_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE collections
    SET item_count = item_count + 1
    WHERE id = NEW.collection_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE collections
    SET item_count = item_count - 1
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_item_count
AFTER INSERT OR DELETE ON collection_items
FOR EACH ROW
EXECUTE FUNCTION update_collection_item_count();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_art_memories_updated_at
BEFORE UPDATE ON art_memories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

# SAYU Gallery - Art Memory System 구현 가이드

> **대상**: Gemini (구현 담당 AI)
> **작성자**: Claude (총괄 기획자/수석 개발자/수석 디자이너)
> **목적**: SAYU의 차별화된 통합 아카이빙 시스템 구현

---

## 📋 목차

1. [Context & Vision](#1-context--vision)
2. [System Architecture](#2-system-architecture)
3. [Data Models](#3-data-models)
4. [Database Schema](#4-database-schema)
5. [API Specifications](#5-api-specifications)
6. [Step-by-Step Implementation](#6-step-by-step-implementation)
7. [UI/UX Design Specifications](#7-uiux-design-specifications)
8. [Testing Checklist](#8-testing-checklist)
9. [Future Phases](#9-future-phases)

---

## 1. Context & Vision

### 🎯 왜 이 시스템을 만드는가?

**문제 인식**:
- 기존 미술 플랫폼들은 "온라인 작품 저장" 또는 "전시 정보 제공"만 함
- 사용자의 실제 예술 경험(전시 방문, 사진 촬영, 개인 감상)은 기록되지 않음
- 온라인과 오프라인 경험이 분리되어 있음
- 시간이 지나면 기억이 희미해지고 정리되지 않음

**SAYU의 해결책**:
```
온라인 작품 발견 ──┐
                   ├──→ [통합 Art Memory Timeline] ──→ 개인화된 재발견
오프라인 전시 경험 ─┘
```

**핵심 차별점**:
1. ✨ **통합 아카이빙**: 온라인 저장 + 전시 방문 기록을 하나의 타임라인으로
2. 📚 **Exhibition Memory Book**: 전시 경험 → 자동으로 아름다운 PDF 생성
3. ❤️ **감정 메타데이터**: 작품과 나의 관계를 감정으로 기록
4. 🎭 **APT 기반**: 16가지 성향별로 다른 큐레이션

**목표**:
> "SAYU = 내 모든 예술 경험이 기록되고 재발견되는 곳"

---

## 2. System Architecture

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Gallery Page                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │Collections │  │ Timeline   │  │   Map      │        │
│  │            │  │            │  │            │        │
│  │ • Manual   │  │ • Chrono   │  │ • Location │        │
│  │ • Smart    │  │ • Filter   │  │ • Visits   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────┐  ┌────────────┐                         │
│  │ Emotions   │  │  Discover  │                         │
│  │            │  │            │                         │
│  │ • Mood     │  │ • Browse   │                         │
│  │ • Patterns │  │ • Save     │                         │
│  └────────────┘  └────────────┘                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────────────────┐
              │   Art Memories DB     │
              │                       │
              │ • online_artwork      │
              │ • exhibition_visit    │
              │ • exhibition_artwork  │
              │ • personal_note       │
              └───────────────────────┘
                          ↓
              ┌───────────────────────┐
              │    Collections DB     │
              │                       │
              │ • manual (user)       │
              │ • smart (auto)        │
              └───────────────────────┘
```

### 데이터 흐름

```
1. 사용자가 Discover 탭에서 작품 저장
   ↓
2. Art Memory 생성 (type: online_artwork)
   ↓
3. 컬렉션에 추가 (선택)
   ↓
4. Timeline에 자동 표시

───────────────────────────────────────

1. 사용자가 전시 관심 등록 (Exhibition 페이지)
   ↓
2. "Before Visit" 컬렉션 자동 생성
   ↓
3. 전시 방문 후 기록
   ↓
4. Art Memory 생성 (type: exhibition_visit)
   ↓
5. PDF Memory Book 생성 가능
```

---

## 3. Data Models

### 3.1 ArtMemory (TypeScript Interface)

```typescript
// frontend/types/gallery.ts

export type MemoryType =
  | 'online_artwork'       // 갤러리에서 발견한 작품
  | 'exhibition_visit'     // 전시 방문 자체
  | 'exhibition_artwork'   // 전시에서 본 특정 작품
  | 'personal_note';       // 개인적인 예술 메모

export type EmotionTag =
  | '위로' | '에너지' | '평온' | '호기심'
  | '감동' | '우울' | '기쁨' | '놀라움'
  | '생각할거리' | '압도적' | '아름다움' | '슬픔';

export interface ArtworkData {
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  style?: string;
  museum?: string;
  description?: string;
}

export interface ExhibitionData {
  id: string;
  name: string;
  museum: string;
  location: string;
  visitDate: Date;
  ticketPrice?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface ArtMemory {
  id: string;
  userId: string;

  // 타입 & 시간
  type: MemoryType;
  timestamp: Date;

  // 감정 & 메모
  emotionTags: EmotionTag[];
  personalNote?: string;
  mood?: string;

  // 작품 정보 (optional)
  artworkData?: ArtworkData;

  // 전시 정보 (optional)
  exhibitionId?: string;
  exhibitionData?: ExhibitionData;

  // 미디어 (optional)
  userPhotos?: string[];
  voiceNoteUrl?: string;

  // 컨텍스트
  source: 'online' | 'offline';
  weather?: string;
  companion?: string;
  location?: LocationData;

  // 메타
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Collection (TypeScript Interface)

```typescript
// frontend/types/gallery.ts

export type OrganizationType = 'manual' | 'smart';
export type CoverType = 'auto' | 'custom';

export interface SmartFilters {
  emotions?: EmotionTag[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  exhibitions?: string[];
  artists?: string[];
  styles?: string[];
  source?: 'online' | 'offline';
  minViewCount?: number;
}

export interface Collection {
  id: string;
  userId: string;

  // 기본 정보
  name: string;
  description: string;
  emoji?: string;
  themeColor: string;  // Hex color

  // 커버 이미지
  coverType: CoverType;
  coverImageUrl?: string;

  // 타입
  organizationType: OrganizationType;
  smartFilters?: SmartFilters;

  // 아이템 (manual only)
  memoryIds?: string[];

  // 메타
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareUrl?: string;
}
```

### 3.3 Theme Colors (Preset)

```typescript
// frontend/constants/gallery.ts

export const THEME_COLORS = [
  { id: 'midnight', name: '미드나이트', color: '#1a1a2e' },
  { id: 'ocean', name: '오션 블루', color: '#0f4c81' },
  { id: 'forest', name: '포레스트', color: '#2d5016' },
  { id: 'sunset', name: '선셋', color: '#d4423a' },
  { id: 'lavender', name: '라벤더', color: '#8b5cf6' },
  { id: 'gold', name: '골드', color: '#d4a520' },
  { id: 'rose', name: '로즈', color: '#e91e63' },
  { id: 'sage', name: '세이지', color: '#87a96b' },
] as const;
```

---

## 4. Database Schema

### 4.1 Supabase Tables

```sql
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
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL,
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
```

---

## 5. API Specifications

### 5.1 Art Memories API

#### `POST /api/memories`
**설명**: 새로운 Art Memory 생성

**Request Body**:
```json
{
  "type": "online_artwork",
  "timestamp": "2024-12-15T10:30:00Z",
  "emotionTags": ["위로", "평온"],
  "personalNote": "힘들 때 보면 위로가 된다",
  "artworkData": {
    "title": "별이 빛나는 밤",
    "artist": "빈센트 반 고흐",
    "year": "1889",
    "imageUrl": "https://...",
    "style": "인상주의"
  },
  "source": "online"
}
```

**Response**:
```json
{
  "success": true,
  "memory": {
    "id": "uuid",
    "userId": "uuid",
    "type": "online_artwork",
    "timestamp": "2024-12-15T10:30:00Z",
    "emotionTags": ["위로", "평온"],
    "personalNote": "힘들 때 보면 위로가 된다",
    "artworkData": { ... },
    "source": "online",
    "viewCount": 0,
    "createdAt": "2024-12-15T10:30:00Z",
    "updatedAt": "2024-12-15T10:30:00Z"
  }
}
```

#### `GET /api/memories`
**설명**: Art Memory 목록 조회 (필터링 가능)

**Query Parameters**:
- `type` (optional): 'online_artwork' | 'exhibition_visit' | 'exhibition_artwork' | 'personal_note'
- `source` (optional): 'online' | 'offline'
- `emotions` (optional): 쉼표로 구분된 감정 태그 ('위로,평온')
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date
- `limit` (optional): 기본값 50
- `offset` (optional): 기본값 0

**Response**:
```json
{
  "success": true,
  "memories": [ ... ],
  "total": 156,
  "hasMore": true
}
```

#### `GET /api/memories/:id`
**설명**: 특정 Memory 조회

**Response**:
```json
{
  "success": true,
  "memory": { ... }
}
```

#### `PATCH /api/memories/:id`
**설명**: Memory 수정

**Request Body** (부분 수정 가능):
```json
{
  "emotionTags": ["위로", "평온", "아름다움"],
  "personalNote": "업데이트된 감상..."
}
```

#### `DELETE /api/memories/:id`
**설명**: Memory 삭제

**Response**:
```json
{
  "success": true,
  "message": "Memory deleted successfully"
}
```

#### `GET /api/memories/timeline`
**설명**: Timeline 뷰를 위한 그룹화된 데이터

**Query Parameters**:
- `year` (optional): 2024
- `month` (optional): 12

**Response**:
```json
{
  "success": true,
  "timeline": {
    "2024-12": [
      {
        "date": "2024-12-15",
        "memories": [ ... ]
      },
      {
        "date": "2024-12-10",
        "memories": [ ... ]
      }
    ]
  }
}
```

#### `GET /api/memories/emotions`
**설명**: 감정별 그룹화된 Memory

**Response**:
```json
{
  "success": true,
  "emotionGroups": {
    "위로": {
      "count": 23,
      "memories": [ ... ]
    },
    "평온": {
      "count": 18,
      "memories": [ ... ]
    }
  }
}
```

---

### 5.2 Collections API

#### `POST /api/collections`
**설명**: 새 컬렉션 생성

**Request Body**:
```json
{
  "name": "위로받는 작품들",
  "description": "힘들 때 보면 위로가 되는 작품 모음",
  "emoji": "💙",
  "themeColor": "#0f4c81",
  "organizationType": "manual"
}
```

**Response**:
```json
{
  "success": true,
  "collection": {
    "id": "uuid",
    "userId": "uuid",
    "name": "위로받는 작품들",
    "description": "...",
    "emoji": "💙",
    "themeColor": "#0f4c81",
    "coverType": "auto",
    "organizationType": "manual",
    "itemCount": 0,
    "isPublic": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/collections`
**설명**: 사용자의 모든 컬렉션 조회

**Response**:
```json
{
  "success": true,
  "collections": [
    {
      "id": "uuid",
      "name": "위로받는 작품들",
      "emoji": "💙",
      "themeColor": "#0f4c81",
      "itemCount": 23,
      "coverImages": ["url1", "url2", "url3", "url4"],  // auto cover용 4개 이미지
      "createdAt": "..."
    }
  ]
}
```

#### `GET /api/collections/:id`
**설명**: 컬렉션 상세 + 포함된 Memory들

**Response**:
```json
{
  "success": true,
  "collection": {
    "id": "uuid",
    "name": "위로받는 작품들",
    "description": "...",
    "emoji": "💙",
    "themeColor": "#0f4c81",
    "itemCount": 23,
    "organizationType": "manual",
    "createdAt": "..."
  },
  "memories": [ ... ]  // 이 컬렉션에 속한 모든 Memory
}
```

#### `PATCH /api/collections/:id`
**설명**: 컬렉션 정보 수정

**Request Body**:
```json
{
  "name": "새 이름",
  "description": "새 설명",
  "themeColor": "#d4423a"
}
```

#### `DELETE /api/collections/:id`
**설명**: 컬렉션 삭제 (Memory는 삭제되지 않음)

#### `POST /api/collections/:id/items`
**설명**: 컬렉션에 Memory 추가

**Request Body**:
```json
{
  "memoryId": "uuid",
  "position": 0  // optional, 순서
}
```

**Response**:
```json
{
  "success": true,
  "message": "Memory added to collection"
}
```

#### `DELETE /api/collections/:id/items/:memoryId`
**설명**: 컬렉션에서 Memory 제거

**Response**:
```json
{
  "success": true,
  "message": "Memory removed from collection"
}
```

#### `GET /api/collections/smart/preview`
**설명**: Smart Collection 필터 미리보기

**Query Parameters**:
- `filters`: JSON string of SmartFilters

**Response**:
```json
{
  "success": true,
  "count": 18,
  "preview": [ ... ]  // 처음 4개 Memory
}
```

---

## 6. Step-by-Step Implementation

### 🚀 Phase 1: Foundation (Day 1-2)

#### Step 1.1: Database Setup

**파일**: `supabase/migrations/20241215000000_art_memory_system.sql`

```sql
-- 위의 "4. Database Schema" 섹션 전체 SQL을 복사
-- Supabase Dashboard > SQL Editor에서 실행
```

**검증**:
- Supabase Dashboard에서 테이블 3개 생성 확인
- RLS 정책 활성화 확인
- Trigger 작동 확인 (collection_items 추가 시 item_count 증가)

---

#### Step 1.2: Type Definitions

**파일**: `frontend/types/gallery.ts`

```typescript
// 위의 "3. Data Models" 섹션 전체 TypeScript 인터페이스 복사

// 추가로 유틸리티 타입:

export type CollectionWithMemories = Collection & {
  memories: ArtMemory[];
  coverImages: string[];  // auto cover용
};

export type TimelineGroup = {
  date: string;  // "2024-12-15"
  memories: ArtMemory[];
};

export type EmotionGroup = {
  emotion: EmotionTag;
  count: number;
  memories: ArtMemory[];
};
```

**파일**: `frontend/constants/gallery.ts`

```typescript
export const THEME_COLORS = [
  { id: 'midnight', name: '미드나이트', color: '#1a1a2e' },
  { id: 'ocean', name: '오션 블루', color: '#0f4c81' },
  { id: 'forest', name: '포레스트', color: '#2d5016' },
  { id: 'sunset', name: '선셋', color: '#d4423a' },
  { id: 'lavender', name: '라벤더', color: '#8b5cf6' },
  { id: 'gold', name: '골드', color: '#d4a520' },
  { id: 'rose', name: '로즈', color: '#e91e63' },
  { id: 'sage', name: '세이지', color: '#87a96b' },
] as const;

export const EMOTION_TAGS: EmotionTag[] = [
  '위로', '에너지', '평온', '호기심',
  '감동', '우울', '기쁨', '놀라움',
  '생각할거리', '압도적', '아름다움', '슬픔'
];

export const EMOTION_COLORS: Record<EmotionTag, string> = {
  '위로': '#0f4c81',
  '에너지': '#d4423a',
  '평온': '#87a96b',
  '호기심': '#d4a520',
  '감동': '#e91e63',
  '우울': '#1a1a2e',
  '기쁨': '#fbbf24',
  '놀라움': '#8b5cf6',
  '생각할거리': '#64748b',
  '압도적': '#dc2626',
  '아름다움': '#ec4899',
  '슬픔': '#475569'
};
```

---

#### Step 1.3: Supabase Client Setup

**파일**: `frontend/lib/supabase/gallery.ts`

```typescript
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
    .select('*')
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

export async function getCollectionWithMemories(id: string): Promise<CollectionWithMemories> {
  // 1. Get collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (collectionError) throw collectionError;

  // 2. Get memories
  const { data: items, error: itemsError } = await supabase
    .from('collection_items')
    .select('memory_id, art_memories(*)')
    .eq('collection_id', id)
    .order('position', { ascending: true });

  if (itemsError) throw itemsError;

  const memories = items?.map(item => transformMemoryFromDB(item.art_memories)) || [];
  const coverImages = memories.slice(0, 4).map(m => m.artworkData?.imageUrl).filter(Boolean) as string[];

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
```

---

### 🎨 Phase 2: UI Components (Day 3-4)

#### Step 2.1: Gallery Layout Component

**파일**: `frontend/app/gallery/page.tsx` (완전 재작성)

```tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

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
    loadStats();
  }, [user]);

  const loadStats = async () => {
    // TODO: Load from Supabase
    setStats({
      artworks: 156,
      exhibitions: 8,
      collections: 12
    });
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
          <h1 className="text-4xl font-bold text-black mb-2">My Art Memories</h1>
          <p className="text-lg text-neutral-600 mb-6">
            당신의 모든 예술 경험을 기록하고 재발견하세요
          </p>

          {/* Stats */}
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-black">{stats.artworks}</p>
              <p className="text-sm text-neutral-600">작품</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black">{stats.exhibitions}</p>
              <p className="text-sm text-neutral-600">전시 방문</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black">{stats.collections}</p>
              <p className="text-sm text-neutral-600">컬렉션</p>
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
          <div className="flex gap-8">
            {[
              { id: 'collections', label: '🗂️ Collections' },
              { id: 'timeline', label: '📅 Timeline' },
              { id: 'map', label: '🗺️ Map' },
              { id: 'emotions', label: '❤️ Emotions' },
              { id: 'discover', label: '🔍 Discover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "pb-4 font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-black"
                    : "text-neutral-600 hover:text-black"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
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
            {activeTab === 'collections' && <CollectionsTab />}
            {activeTab === 'timeline' && <TimelineTab />}
            {activeTab === 'map' && <MapTab />}
            {activeTab === 'emotions' && <EmotionsTab />}
            {activeTab === 'discover' && <DiscoverTab />}
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
```

---

#### Step 2.2: Collections Tab Component

**파일**: `frontend/components/gallery/CollectionsTab.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Palette, Sparkles, Clock, Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

import { getCollections, getCollectionWithMemories } from '@/lib/supabase/gallery';
import type { Collection, CollectionWithMemories } from '@/types/gallery';

import CreateCollectionModal from './CreateCollectionModal';
import CollectionCard from './CollectionCard';

export default function CollectionsTab() {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionWithMemories[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const cols = await getCollections();

      // Load each collection with its memories
      const collectionsWithData = await Promise.all(
        cols.map(col => getCollectionWithMemories(col.id))
      );

      setCollections(collectionsWithData);
    } catch (error) {
      console.error('Failed to load collections:', error);
      toast.error('컬렉션을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    await loadCollections();
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
        <h2 className="text-xl font-bold text-black mb-4">
          ✨ Quick Collections
          <span className="text-sm font-normal text-neutral-500 ml-2">
            스마트, 자동 업데이트
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recent */}
          <SmartCollectionCard
            title="최근 저장"
            count={18}
            icon={<Clock className="w-6 h-6" />}
            color="#000000"
          />

          {/* Most Viewed */}
          <SmartCollectionCard
            title="자주 보는"
            count={24}
            icon={<Heart className="w-6 h-6" />}
            color="#e91e63"
          />

          {/* This Month */}
          <SmartCollectionCard
            title="이번 달"
            count={12}
            icon={<Sparkles className="w-6 h-6" />}
            color="#d4a520"
          />

          {/* Exhibition Visits */}
          <SmartCollectionCard
            title="전시 기록"
            count={8}
            icon={<Palette className="w-6 h-6" />}
            color="#0f4c81"
          />
        </div>
      </div>

      {/* User Collections */}
      <div>
        <h2 className="text-xl font-bold text-black mb-4">📚 My Collections</h2>

        {/* Create New Button */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="aspect-[4/3] bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center gap-3"
          >
            <Plus className="w-8 h-8 text-neutral-400" />
            <p className="font-medium text-neutral-600">새 컬렉션</p>
          </button>

          {/* User Collections */}
          {collections.filter(c => c.organizationType === 'manual').map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onUpdate={loadCollections}
            />
          ))}
        </div>
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

// Smart Collection Card Component
function SmartCollectionCard({
  title,
  count,
  icon,
  color
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="aspect-[4/3] bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-all p-6 flex flex-col items-center justify-center gap-3"
      style={{ borderColor: color }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="font-bold text-black text-lg">{title}</p>
        <p className="text-sm text-neutral-600">{count}개</p>
      </div>
    </motion.button>
  );
}
```

---

#### Step 2.3: Collection Card Component

**파일**: `frontend/components/gallery/CollectionCard.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import type { CollectionWithMemories } from '@/types/gallery';

interface CollectionCardProps {
  collection: CollectionWithMemories;
  onUpdate: () => void;
}

export default function CollectionCard({ collection, onUpdate }: CollectionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/gallery/collection/${collection.id}`);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="aspect-[4/3] bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all group relative"
      style={{ borderColor: collection.themeColor }}
    >
      {/* Cover Images - 2x2 Grid */}
      {collection.coverType === 'auto' && collection.coverImages.length > 0 ? (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-2">
          {collection.coverImages.slice(0, 4).map((imageUrl, idx) => (
            <div key={idx} className="relative bg-neutral-100 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          ))}
          {/* Fill empty slots */}
          {[...Array(Math.max(0, 4 - collection.coverImages.length))].map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-neutral-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">{collection.emoji || '🎨'}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <div
          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mb-2"
          style={{ backgroundColor: collection.themeColor }}
        >
          {collection.emoji}
        </div>
        <h3 className="font-bold text-black group-hover:text-white transition-colors text-lg mb-1">
          {collection.name}
        </h3>
        <p className="text-sm text-neutral-600 group-hover:text-white/80 transition-colors">
          {collection.itemCount}개
        </p>
      </div>

      {/* More Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Show context menu
        }}
        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-4 h-4 text-neutral-600" />
      </button>
    </motion.button>
  );
}
```

---

#### Step 2.4: Create Collection Modal

**파일**: `frontend/components/gallery/CreateCollectionModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCollection } from '@/lib/supabase/gallery';
import { THEME_COLORS } from '@/constants/gallery';

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreate: () => void;
}

const EMOJI_OPTIONS = [
  '🎨', '🖼️', '💙', '❤️', '✨', '🌟', '🌸', '🍂',
  '🌊', '🌅', '🏛️', '📚', '🎭', '🎪', '🎬', '🎵'
];

export default function CreateCollectionModal({ onClose, onCreate }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎨');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].color);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('컬렉션 이름을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        themeColor,
        organizationType: 'manual',
        coverType: 'auto',
      });

      toast.success('✨ 컬렉션이 생성되었습니다!');
      onCreate();
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast.error('컬렉션 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-black mb-6">새 컬렉션 만들기</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                컬렉션 이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 위로받는 작품들"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 컬렉션에 대해 간단히 설명해주세요"
                rows={3}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                maxLength={200}
              />
            </div>

            {/* Emoji */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                이모지
              </label>
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`
                      p-3 rounded-lg text-2xl hover:bg-neutral-100 transition-colors
                      ${emoji === em ? 'bg-neutral-900 hover:bg-neutral-900' : 'bg-neutral-50'}
                    `}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                테마 컬러
              </label>
              <div className="grid grid-cols-4 gap-3">
                {THEME_COLORS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeColor(theme.color)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${themeColor === theme.color ? 'border-black scale-105' : 'border-transparent'}
                    `}
                    style={{ backgroundColor: theme.color }}
                  >
                    <span className="text-xs text-white font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-neutral-300 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '생성 중...' : '만들기'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

---

#### Step 2.5: Timeline Tab (Placeholder)

**파일**: `frontend/components/gallery/TimelineTab.tsx`

```tsx
'use client';

export default function TimelineTab() {
  return (
    <div className="bg-neutral-50 rounded-2xl p-12 text-center">
      <p className="text-6xl mb-4">📅</p>
      <h3 className="text-xl font-bold text-black mb-2">Timeline View</h3>
      <p className="text-neutral-600">
        시간순으로 모든 예술 경험을 확인하세요
      </p>
      <p className="text-sm text-neutral-500 mt-4">Phase 2에서 구현 예정</p>
    </div>
  );
}
```

---

#### Step 2.6: Map, Emotions, Discover Tabs (Placeholders)

**파일**: `frontend/components/gallery/MapTab.tsx`

```tsx
'use client';

export default function MapTab() {
  return (
    <div className="bg-neutral-50 rounded-2xl p-12 text-center">
      <p className="text-6xl mb-4">🗺️</p>
      <h3 className="text-xl font-bold text-black mb-2">Memory Map</h3>
      <p className="text-neutral-600">
        전시를 다녀온 미술관들을 지도에서 확인하세요
      </p>
      <p className="text-sm text-neutral-500 mt-4">Phase 2에서 구현 예정</p>
    </div>
  );
}
```

**파일**: `frontend/components/gallery/EmotionsTab.tsx`

```tsx
'use client';

export default function EmotionsTab() {
  return (
    <div className="bg-neutral-50 rounded-2xl p-12 text-center">
      <p className="text-6xl mb-4">❤️</p>
      <h3 className="text-xl font-bold text-black mb-2">Emotions</h3>
      <p className="text-neutral-600">
        감정별로 작품을 탐색하고 재발견하세요
      </p>
      <p className="text-sm text-neutral-500 mt-4">Phase 2에서 구현 예정</p>
    </div>
  );
}
```

**파일**: `frontend/components/gallery/DiscoverTab.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCloudinaryArtworks } from '@/hooks/useCloudinaryArtworks';
import { createArtMemory, getCollections, addMemoryToCollection } from '@/lib/supabase/gallery';
import { cn } from '@/lib/utils';

export default function DiscoverTab() {
  const { artworks, loading } = useCloudinaryArtworks({
    userType: 'SREF', // TODO: Get from user
    limit: 30,
    random: true,
    autoLoad: true
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const cols = await getCollections();
    setCollections(cols);
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
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">당신을 위한 추천</h2>
        <p className="text-neutral-600 mb-6">
          AI가 당신의 성향에 맞춰 선별한 작품들
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="aspect-square bg-neutral-100 relative">
              {artwork.imageUrl && (
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              )}

              {/* Save Button */}
              <button
                onClick={() => handleSave(artwork)}
                disabled={savedIds.has(artwork.id)}
                className={cn(
                  "absolute top-3 right-3 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
                  savedIds.has(artwork.id)
                    ? "bg-green-500"
                    : "bg-white/90 hover:bg-white"
                )}
              >
                <Bookmark className={cn(
                  "w-4 h-4",
                  savedIds.has(artwork.id) ? "text-white fill-white" : "text-neutral-600"
                )} />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-black text-sm line-clamp-1 mb-1">
                {artwork.title}
              </h3>
              <p className="text-xs text-neutral-600 line-clamp-1">
                {artwork.artist} · {artwork.year}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

### 🔗 Phase 3: Integration with Discover (Day 5)

#### Step 3.1: Update Existing Discover Flow

기존 `frontend/app/gallery/page.tsx`의 `handleSave` 함수를 수정하여 Art Memory 시스템 사용:

```typescript
// Before (old code)
const handleSave = async (artworkId: string) => {
  const newSaved = new Set(savedArtworks);
  newSaved.add(artworkId);
  setSavedArtworks(newSaved);
  toast.success('📌 컬렉션에 추가되었습니다!');
};

// After (new Art Memory system)
import { createArtMemory, addMemoryToCollection } from '@/lib/supabase/gallery';

const handleSave = async (artworkId: string) => {
  try {
    const artwork = cloudinaryArtworks.find(a => a.id === artworkId);
    if (!artwork) return;

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

    // 2. Optionally add to a collection
    // Show collection selector or add to default "Unsorted"

    toast.success('💾 작품이 저장되었습니다!');
  } catch (error) {
    console.error('Failed to save:', error);
    toast.error('저장에 실패했습니다');
  }
};
```

---

## 7. UI/UX Design Specifications

### 7.1 Color System

```css
/* Primary Colors */
--color-black: #000000;
--color-white: #ffffff;

/* Neutrals */
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #0a0a0a;

/* Theme Colors (Collection Themes) */
--theme-midnight: #1a1a2e;
--theme-ocean: #0f4c81;
--theme-forest: #2d5016;
--theme-sunset: #d4423a;
--theme-lavender: #8b5cf6;
--theme-gold: #d4a520;
--theme-rose: #e91e63;
--theme-sage: #87a96b;

/* Emotion Colors */
--emotion-comfort: #0f4c81;    /* 위로 */
--emotion-energy: #d4423a;     /* 에너지 */
--emotion-peace: #87a96b;      /* 평온 */
--emotion-curiosity: #d4a520;  /* 호기심 */
--emotion-moved: #e91e63;      /* 감동 */
--emotion-sad: #1a1a2e;        /* 우울 */
--emotion-joy: #fbbf24;        /* 기쁨 */
--emotion-surprise: #8b5cf6;   /* 놀라움 */
```

### 7.2 Typography

```css
/* Headings */
.heading-1 { font-size: 2.25rem; font-weight: 700; line-height: 1.2; }  /* 36px */
.heading-2 { font-size: 1.875rem; font-weight: 700; line-height: 1.3; } /* 30px */
.heading-3 { font-size: 1.5rem; font-weight: 700; line-height: 1.4; }   /* 24px */
.heading-4 { font-size: 1.25rem; font-weight: 600; line-height: 1.5; }  /* 20px */

/* Body */
.body-large { font-size: 1.125rem; line-height: 1.75; }  /* 18px */
.body { font-size: 1rem; line-height: 1.5; }             /* 16px */
.body-small { font-size: 0.875rem; line-height: 1.5; }   /* 14px */
.caption { font-size: 0.75rem; line-height: 1.5; }       /* 12px */
```

### 7.3 Spacing System

```
4px (0.25rem)   - xs
8px (0.5rem)    - sm
12px (0.75rem)  - md
16px (1rem)     - lg
24px (1.5rem)   - xl
32px (2rem)     - 2xl
48px (3rem)     - 3xl
64px (4rem)     - 4xl
```

### 7.4 Animation Specifications

```typescript
// Framer Motion Variants

// Page Transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

// Card Hover
export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

### 7.5 Layout Specifications

#### Collection Card
```
- Aspect Ratio: 4:3
- Border Radius: 1rem (16px)
- Border Width: 2px
- Border Color: themeColor
- Padding: 1.5rem (24px)
- Grid: 2x2 for cover images (with 2px gap)
```

#### Smart Collection Card
```
- Aspect Ratio: 4:3
- Border Radius: 1rem
- Border Width: 1px
- Icon Size: 3rem (48px)
- Icon Background: themeColor
```

#### Timeline Item
```
- Vertical Spacing: 2rem (32px)
- Timeline Line Width: 2px
- Timeline Dot Size: 12px
- Card Padding: 1.5rem
```

---

## 8. Testing Checklist

### Phase 1 Testing

- [ ] **Database**
  - [ ] 테이블 3개 생성 확인
  - [ ] RLS 정책 작동 확인 (다른 유저 데이터 접근 불가)
  - [ ] Trigger 작동 확인 (item_count 자동 업데이트)

- [ ] **Art Memory CRUD**
  - [ ] Memory 생성 (online_artwork)
  - [ ] Memory 목록 조회
  - [ ] Memory 수정 (emotionTags, personalNote)
  - [ ] Memory 삭제

- [ ] **Collection CRUD**
  - [ ] Collection 생성 (manual)
  - [ ] Collection 목록 조회
  - [ ] Collection 상세 조회 (with memories)
  - [ ] Collection 수정
  - [ ] Collection 삭제

- [ ] **Collection Items**
  - [ ] Memory를 Collection에 추가
  - [ ] Memory를 Collection에서 제거
  - [ ] item_count 자동 업데이트 확인

- [ ] **UI Components**
  - [ ] Collections 탭 렌더링
  - [ ] Smart Collection 카드 표시
  - [ ] User Collection 카드 표시 (2x2 cover images)
  - [ ] Create Collection 모달 작동
  - [ ] Collection 클릭 시 상세 페이지 이동

- [ ] **Integration**
  - [ ] Discover 탭에서 작품 저장 → Memory 생성
  - [ ] 저장된 작품이 Collection에 표시됨

### Phase 2 Testing (Future)

- [ ] Timeline 탭 - 시간순 표시
- [ ] Map 탭 - 지도에 전시 마커
- [ ] Emotions 탭 - 감정별 필터링
- [ ] Smart Collections - 자동 필터링

### Phase 3 Testing (Future)

- [ ] Exhibition 방문 기록
- [ ] PDF Memory Book 생성
- [ ] Before/After Exhibition 비교

---

## 9. Future Phases

### Phase 2: Timeline & Emotions (다음 단계)

**구현 내용**:
1. Timeline 탭 - 시간순 모든 Memory 표시
2. Emotions 탭 - 감정별 그룹화
3. Smart Collections 필터링 로직
4. Memory 상세 모달 (감정 태그 추가/수정)

**예상 작업 시간**: 2-3일

### Phase 3: Exhibition Integration (핵심!)

**구현 내용**:
1. Exhibition 페이지에 "관심 등록" 기능
2. Before Visit 컬렉션 자동 생성
3. 전시 방문 기록 UI (사진, 작품 체크리스트)
4. Exhibition Memory Book PDF 생성
5. Before/After 비교 뷰

**예상 작업 시간**: 3-4일

### Phase 4: Advanced Features

**구현 내용**:
1. Memory Map (React Leaflet)
2. Artist Journey
3. Mood-based Rediscovery
4. Collection 공유
5. 통계 대시보드

**예상 작업 시간**: 4-5일

---

## 📝 Implementation Notes for Gemini

### 중요 사항

1. **순서 엄수**:
   - Step 1.1 (DB) → Step 1.2 (Types) → Step 1.3 (Supabase Client) → Step 2 (UI)
   - 순서를 바꾸면 에러 발생

2. **타입 안전성**:
   - 모든 컴포넌트에서 TypeScript strict mode 사용
   - `any` 타입 최소화

3. **에러 처리**:
   - 모든 async 함수에 try-catch
   - 사용자에게 친절한 에러 메시지 (toast)

4. **성능**:
   - 이미지 lazy loading (Next.js Image component)
   - 무한 스크롤은 나중에 구현 (일단 50개 제한)
   - React Query는 사용하지 않음 (직접 useState 관리)

5. **기존 코드와의 호환성**:
   - `frontend/app/gallery/page.tsx` 완전 대체
   - 기존 `useCloudinaryArtworks` hook 재사용
   - 기존 `useAuth` hook 재사용

6. **스타일링**:
   - Tailwind CSS 사용
   - Framer Motion으로 애니메이션
   - 기존 SAYU 디자인 시스템 준수

### 구현 시 주의사항

- **Supabase RLS**: 반드시 활성화, 테스트 시 다른 유저로 접근 시도
- **UUID 생성**: Supabase가 자동 생성 (uuid_generate_v4())
- **Timestamp**: ISO 8601 형식 사용
- **JSONB 필드**: artworkData, exhibitionData는 유연한 구조
- **Array 필드**: emotionTags, userPhotos는 PostgreSQL array

### 도움이 필요할 때

1. **DB 에러**: Supabase Dashboard > Logs 확인
2. **RLS 에러**: "new row violates row-level security policy" → 정책 재확인
3. **이미지 로딩 실패**: Next.js Image domains 설정 확인
4. **타입 에러**: `types/gallery.ts` 재확인

---

## 🎯 Success Criteria

Phase 1 완료 기준:

✅ 사용자가 Discover 탭에서 작품을 저장하면 Art Memory로 생성됨
✅ Collections 탭에서 새 컬렉션을 만들 수 있음
✅ 컬렉션 카드에 2x2 작품 썸네일이 자동으로 표시됨
✅ 컬렉션 클릭 시 해당 작품들이 표시됨
✅ Smart Collections가 표시됨 (데이터는 더미)
✅ 모든 CRUD 작업이 Supabase에 저장됨
✅ 다른 유저의 데이터는 보이지 않음 (RLS)

---

**Gemini, 이 가이드를 따라 Phase 1을 구현해주세요!**

각 Step을 완료할 때마다 보고하고, 에러가 발생하면 로그와 함께 알려주세요.

Good luck! 🚀

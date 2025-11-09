# SAYU Mood Atlas 통합 설계 v2.0

> **작성일:** 2025-11-09
> **목적:** "능동적 상호작용 → 감정 언어화 → 개인화된 정보 → 연결된 기록" 완전 통합
> **구현 우선순위:** Backend → Frontend
> **CODEX 피드백 반영 완료**

---

## 📋 목차

1. [핵심 철학 & 차별화](#1-핵심-철학--차별화)
2. [통합 아키텍처](#2-통합-아키텍처)
3. [데이터 모델](#3-데이터-모델)
4. [상세 기능 명세](#4-상세-기능-명세)
5. [프런트엔드 결과물](#5-프런트엔드-결과물)
6. [Backend 구현 가이드](#6-backend-구현-가이드)
7. [Frontend 구현 가이드](#7-frontend-구현-가이드)
8. [구현 타임라인](#8-구현-타임라인)

---

## 1. 핵심 철학 & 차별화

### 1.1 SAYU만의 차별점

**기존 예술 앱의 문제:**
```
수동적 감상 → 일방향 정보 → 막연한 기록 → 일시적 경험
```

**SAYU의 접근:**
```
능동적 터치 → AI 대화 → 개인화된 정보 → 연결된 기록 → 누적되는 결과물
       ↓           ↓            ↓              ↓               ↓
   심리적 관여   감정 언어화   깊은 몰입    확장성 있는 메모   나만의 창조물
```

### 1.2 핵심 키워드

```
✅ 개인화 (Personalization)
   - 내가 터치한 부분 중심 정보
   - 내 선택 하이라이트
   - 내 이전 기록과 연결

✅ 능동적 참여 (Active Engagement)
   - 작품을 만지고, 색을 고르고, 느낌을 선택
   - 정보가 아닌 경험 우선

✅ 연결성 (Connectivity)
   - 작품 ↔ 나의 감정
   - 오늘 ↔ 과거 기록
   - 나 ↔ 다른 사용자 (P2P)

✅ 성장하는 결과물 (Growing Artifacts)
   - 지도 타일 채우기
   - 캐릭터 생성 & 성장
   - 감정 캡슐 (P2P 편지)
```

### 1.3 사용자 경험 순서

```
기존 순서 (정보 먼저):
정보 파악 → 감정 탐색 → 상호작용 → 메모

SAYU 순서 (감정 먼저):
1. 감정 선택 (오늘 내 마음)
2. AI 추천 (3개 작품)
3. 👆 능동적 터치 (터치 + 색상 + 느낌)
4. 작품 선택
5. 💬 AI 대화 (상호작용 반영)
6. 📚 개인화된 정보 (관심사 하이라이트)
7. 📝 가이드된 메모 (질문 + 연결)
8. 🎁 결과물 (타일 + 캐릭터 + P2P 편지)
```

**왜 이 순서?**
1. **심리적 관여**: 먼저 터치 → "내가 참여한 작품"
2. **맥락 있는 대화**: "방금 수련을 3번 터치했는데 왜?" → AI 질문
3. **사후적 보상**: 감정 정리 후 정보 → "아, 그래서 내가 끌렸구나"
4. **연결된 기록**: 이전 기록 제안 → "지난주에도 비슷한 작품 선택했어요"

---

## 2. 통합 아키텍처

### 2.1 전체 플로우

```
┌─────────────────────────────────────────────────┐
│         SAYU Daily Art Journey (통합)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  [1] 감정 선택 (Mood Atlas)                      │
│      - 6색 감정 팔레트                            │
│      - 강도 선택 (0-100%)                        │
│                                                 │
│  [2] AI 추천 (Mood Atlas + Groq)                │
│      - 감정 기반 작품 3개 추천                    │
│      - 이유 제공                                 │
│                                                 │
│  [3] 🆕 능동적 상호작용                          │
│      - 비주얼 터치 (작품 영역 클릭)               │
│      - 색상 선택 (끌리는 색)                     │
│      - 느낌 태그 (평온한, 아름다운)               │
│      → 데이터 저장 (interaction_id 생성)         │
│                                                 │
│  [4] 작품 선택                                   │
│                                                 │
│  [5] 🆕 AI 대화 (Art Counselor 흡수)            │
│      - Opening: "방금 수련 3번 터치했는데..."     │
│      - Connection: 깊은 연결                     │
│      → counselor_insights 생성                   │
│                                                 │
│  [6] 🆕 개인화된 정보 레이어                     │
│      - Layer 1: 기본 정보 (항상)                │
│      - Layer 2: 작가 스토리                      │
│        └─ 사용자가 터치한 요소 하이라이트        │
│        └─ 선택한 색상 연결된 부분 강조           │
│      → info_layers_viewed 기록                   │
│                                                 │
│  [7] 🆕 가이드된 메모 작성                       │
│      - AI 질문: "수련을 많이 터치했는데 왜?"      │
│      - 이전 기록 연결: "지난주에도 물 그림"       │
│      - 템플릿 제공                               │
│      → user_memo 저장                            │
│                                                 │
│  [8] 🆕 결과물 생성                              │
│      - 타일 색칠 + 애니메이션                    │
│      - 캐릭터 성장/생성 (대륙 완료 시)           │
│      - 감정 캡슐 생성 (P2P 편지)                 │
│      → 보상 지급 + 통계 업데이트                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 시스템 통합 구조

```
┌──────────────────────────────────────┐
│        Mood Atlas (기반)              │
│  - 감정 선택, AI 추천, 지도 진행      │
├──────────────────────────────────────┤
│     Art Counselor (대화 흡수)         │
│  - Opening, Connection 단계          │
│  - 상호작용 데이터 활용               │
├──────────────────────────────────────┤
│   Interactive Layer (신규)            │
│  - 비주얼 터치                        │
│  - 색상/느낌 선택                     │
├──────────────────────────────────────┤
│  Personalized Info (신규)             │
│  - 사용자 관심사 하이라이트           │
│  - 이전 기록 연결                     │
├──────────────────────────────────────┤
│  Character System (신규)              │
│  - 대륙별 캐릭터 생성                 │
│  - 레벨 시스템                        │
├──────────────────────────────────────┤
│  P2P Capsule (신규)                   │
│  - 느린 감정 편지                     │
│  - 120자 제한, 지연 전달              │
└──────────────────────────────────────┘
```

---

## 3. 데이터 모델

### 3.1 DB 스키마 전체

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. 상호작용 데이터
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE artwork_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL,

  -- 터치 데이터
  visual_touches JSONB,
  -- [{ area: "pond", count: 3, percentage: 0.45 }, ...]

  -- 선택 데이터
  color_selections TEXT[],      -- ['blue', 'pink']
  feeling_tags TEXT[],          -- ['peaceful', 'calm']

  -- 분석 결과 (AI 생성)
  dominant_area TEXT,           -- 'pond'
  dominant_colors TEXT[],       -- ['blue', 'pink']
  interaction_summary TEXT,     -- "물의 반짝임에 집중"

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON artwork_interactions(user_id);
CREATE INDEX idx_interactions_artwork ON artwork_interactions(artwork_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. 대화 기록
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE counselor_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES artwork_interactions(id),

  stage VARCHAR(20) NOT NULL,   -- 'opening', 'connection'

  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,

  -- AI 추출 통찰
  insights TEXT[],

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_entry ON counselor_conversations(entry_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. 정보 레이어 기록
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE info_layer_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id),
  user_id UUID REFERENCES users(id),

  layer_name VARCHAR(50),       -- 'artist_story', 'historical_context'

  -- 개인화 정보
  highlighted_sections TEXT[],  -- 사용자 관심사 연결된 부분
  time_spent INT,               -- 초 단위

  created_at TIMESTAMP DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. 메모 작성 가이드
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE memo_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id),
  user_id UUID REFERENCES users(id),

  -- AI 생성 질문
  questions JSONB,
  -- [
  --   { q: "수련을 3번 터치했는데 왜?", type: "interaction" },
  --   { q: "파란색에 끌린 이유는?", type: "color" }
  -- ]

  -- 이전 기록 연결
  related_entries UUID[],
  connection_reason TEXT,       -- "지난주에도 물 관련 작품"

  -- 사용 여부
  used_questions TEXT[],
  used_connections BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. mood_atlas_entries 확장
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE mood_atlas_entries
  -- 상호작용 연결
  ADD COLUMN interaction_id UUID REFERENCES artwork_interactions(id),
  ADD COLUMN interaction_points INT DEFAULT 0,

  -- 대화 통찰
  ADD COLUMN counselor_insights TEXT[],

  -- 정보 탐색
  ADD COLUMN info_layers_viewed TEXT[],
  ADD COLUMN info_exploration_time INT,

  -- 메모 품질
  ADD COLUMN memo_word_count INT,
  ADD COLUMN memo_used_suggestions BOOLEAN DEFAULT false,
  ADD COLUMN memo_connected_to_past BOOLEAN DEFAULT false,

  -- 보상 계산
  ADD COLUMN total_points INT DEFAULT 0,
  ADD COLUMN point_breakdown JSONB;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. 캐릭터 시스템
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE user_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  region_id VARCHAR(50) REFERENCES mood_atlas_regions(id),

  -- 캐릭터 정보
  character_name VARCHAR(100),
  character_name_ko VARCHAR(100),
  character_type VARCHAR(50),   -- 'artist_reborn', 'creature', 'abstract'

  -- 구성 요소
  space TEXT,                   -- '별이 빛나는 하늘'
  time TEXT,                    -- '깊은 밤'
  character_entity TEXT,        -- '반 고흐의 환생'

  -- 비주얼
  character_icon TEXT,
  character_image_url TEXT,

  -- 설명
  description TEXT,
  birth_story TEXT,

  -- 특성
  personality_traits TEXT[],
  favorite_things TEXT[],
  speaking_style TEXT,

  -- 레벨
  level INT DEFAULT 1,
  experience INT DEFAULT 0,

  -- 생성 근거 (분석 데이터)
  creation_data JSONB,
  -- {
  --   visualPreferences: { pond: 12, sky: 8 },
  --   colorPreferences: { blue: 15, pink: 8 },
  --   feelingTags: { peaceful: 10, calm: 7 },
  --   dominantArtist: "Claude Monet"
  -- }

  is_representative BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, region_id)
);

CREATE INDEX idx_characters_user ON user_characters(user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. P2P 감정 캡슐 (느린 편지)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE emotion_capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  entry_id UUID REFERENCES mood_atlas_entries(id),

  -- 캡슐 내용
  emotion_color VARCHAR(20),
  emotion_label TEXT,
  artwork_id TEXT,
  message TEXT CHECK (char_length(message) <= 120),

  -- 발송 설정
  is_public BOOLEAN DEFAULT true,
  delivery_delay_days INT DEFAULT 3,

  -- 수신 설정
  recipient_id UUID REFERENCES users(id),
  recipient_character_id UUID REFERENCES user_characters(id),

  -- 상태
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' → 'in_transit' → 'delivered' → 'read'

  -- 필터링
  is_filtered BOOLEAN DEFAULT false,
  filter_reason TEXT,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_capsules_sender ON emotion_capsules(sender_id);
CREATE INDEX idx_capsules_recipient ON emotion_capsules(recipient_id);
CREATE INDEX idx_capsules_status ON emotion_capsules(status);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. 캡슐 큐 시스템
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE capsule_delivery_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES emotion_capsules(id),

  scheduled_delivery TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt TIMESTAMP,

  status VARCHAR(20) DEFAULT 'scheduled',
  -- 'scheduled' → 'processing' → 'delivered' → 'failed'

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queue_scheduled ON capsule_delivery_queue(scheduled_delivery);
CREATE INDEX idx_queue_status ON capsule_delivery_queue(status);
```

### 3.2 핵심 데이터 구조 (TypeScript)

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 상호작용 데이터
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ArtworkInteraction {
  id: string;
  userId: string;
  artworkId: string;

  visualTouches: {
    area: string;           // "pond", "water-lilies", "sky"
    count: number;
    percentage: number;     // 전체 터치 중 비율
  }[];

  colorSelections: string[];
  feelingTags: string[];

  // AI 분석
  dominantArea: string;
  dominantColors: string[];
  interactionSummary: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 개인화된 정보 레이어
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PersonalizedInfoLayer {
  basic: {
    title: string;
    artist: string;
    year: string;
    movement: string;
  };

  artistStory: {
    title: string;
    content: string;

    // 🆕 개인화
    highlightedSections: {
      text: string;
      reason: string;       // "수련을 터치했으므로"
      userAction: string;   // "touched_pond"
    }[];

    funFact: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메모 작성 가이드
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MemoSuggestion {
  entryId: string;

  questions: {
    q: string;
    type: 'interaction' | 'color' | 'feeling' | 'general';
    relatedData?: any;
  }[];

  relatedEntries: {
    entryId: string;
    date: string;
    similarity: number;
    connectionReason: string;
  }[];

  templates: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 감정 캡슐 (P2P)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EmotionCapsule {
  id: string;
  senderId: string;

  emotionColor: string;
  emotionLabel: string;
  artworkId: string;
  message: string;          // 120자 제한

  isPublic: boolean;
  deliveryDelayDays: number;

  recipientId?: string;
  recipientCharacterId?: string;

  status: 'pending' | 'in_transit' | 'delivered' | 'read';

  createdAt: Date;
  deliveredAt?: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 캐릭터
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UserCharacter {
  id: string;
  userId: string;
  regionId: string;

  characterName: string;
  characterNameKo: string;
  characterType: 'artist_reborn' | 'creature' | 'abstract';

  space: string;
  time: string;
  characterEntity: string;

  characterIcon: string;
  description: string;
  birthStory: string;

  personalityTraits: string[];
  favoriteThings: string[];
  speakingStyle: string;

  level: number;
  experience: number;

  creationData: {
    visualPreferences: Record<string, number>;
    colorPreferences: Record<string, number>;
    feelingTags: Record<string, number>;
    dominantArtist: string;
  };

  isRepresentative: boolean;
}
```

---

## 4. 상세 기능 명세

### Step 1-2: 감정 선택 (기존 유지)

**변경 없음** - Mood Atlas 기존 기능 유지

### Step 3: AI 추천 (기존 유지)

**변경 없음** - Mood Atlas 기존 기능 유지

### Step 4: 능동적 상호작용

#### 4.1 UI 흐름

```
┌─────────────────────────────────────┐
│  클로드 모네 "수련" (1916)           │
├─────────────────────────────────────┤
│                                     │
│  작품을 자유롭게 탐색해보세요        │
│  정보는 나중에 함께 알아갈 거예요 😊 │
│                                     │
│  ┌───────────────────────┐         │
│  │                       │         │
│  │   [작품 이미지]        │         │
│  │   👆 터치 가능        │         │
│  │                       │         │
│  │   ✨ 터치된 영역:      │         │
│  │   • 연못 (★★★ 45%)  │         │
│  │   • 수련 (★★ 33%)    │         │
│  │   • 하늘 (★ 22%)     │         │
│  │                       │         │
│  └───────────────────────┘         │
│                                     │
│  🎨 어떤 색이 좋으세요?              │
│  ○ 파랑  ○ 연분홍  ○ 초록  ○ 흰색 │
│  ✓ 파랑  ✓ 연분홍                  │
│                                     │
│  💭 어떤 느낌인가요? (복수 선택)     │
│  [평온한] [잔잔한] [그리운] [신비한]│
│  ✓ 평온한  ✓ 잔잔한                │
│                                     │
│  터치 6회 · 색상 2개 · 느낌 2개     │
│  [다음: 작품 더 알아보기]            │
│                                     │
└─────────────────────────────────────┘
```

#### 4.2 Backend API

```javascript
// POST /api/mood-atlas/interactions

async function saveInteraction(req, res) {
  const { artworkId, visualTouches, colorSelections, feelingTags } = req.body;
  const userId = req.user.id;

  // 1. 비율 계산
  const totalTouches = visualTouches.reduce((sum, t) => sum + t.count, 0);
  const touchesWithPercentage = visualTouches.map(t => ({
    ...t,
    percentage: t.count / totalTouches
  }));

  // 2. AI 분석 (Groq)
  const analysis = await analyzeInteraction({
    artworkId,
    visualTouches: touchesWithPercentage,
    colorSelections,
    feelingTags
  });

  // 3. 저장
  const { data: interaction } = await supabase
    .from('artwork_interactions')
    .insert({
      user_id: userId,
      artwork_id: artworkId,
      visual_touches: touchesWithPercentage,
      color_selections: colorSelections,
      feeling_tags: feelingTags,
      dominant_area: analysis.dominantArea,
      dominant_colors: analysis.dominantColors,
      interaction_summary: analysis.summary
    })
    .select()
    .single();

  res.json({
    interactionId: interaction.id,
    summary: analysis.summary,
    dominantArea: analysis.dominantArea
  });
}

// AI 분석 함수
async function analyzeInteraction(data) {
  const prompt = `작품 상호작용 데이터를 분석:

작품: ${data.artworkId}
터치: ${JSON.stringify(data.visualTouches)}
색상: ${data.colorSelections.join(', ')}
느낌: ${data.feelingTags.join(', ')}

1문장으로 요약: "사용자는 ___에 특히 관심"`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 100
  });

  const summary = completion.choices[0].message.content;
  const dominantArea = data.visualTouches
    .sort((a, b) => b.percentage - a.percentage)[0]?.area;

  return {
    summary,
    dominantArea,
    dominantColors: data.colorSelections.slice(0, 2)
  };
}
```

### Step 5: AI 대화 (상호작용 반영)

#### 5.1 Opening 단계 - 상호작용 데이터 활용

```
┌─────────────────────────────────────┐
│  💬 작품과 대화하기                  │
├─────────────────────────────────────┤
│                                     │
│  [작품 썸네일]                       │
│                                     │
│  🤖 SAYU:                            │
│  "방금 이 작품의 연못을 45%나        │
│   터치하셨네요. 수면의 반짝임이      │
│   특히 마음에 드셨나봐요.            │
│                                     │
│   파란색과 연분홍을 선택하고,        │
│   '평온한', '잔잔한'이라고           │
│   느끼셨다고요.                      │
│                                     │
│   어떤 순간에 이런 평온함을          │
│   느끼시나요?"                       │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  빠른 응답:                          │
│  [조용한 아침]  [비 오는 날]         │
│  [혼자 있을 때]  [직접 입력...]     │
│                                     │
└─────────────────────────────────────┘
```

**핵심:** AI가 상호작용 데이터를 구체적으로 언급 → 개인화된 느낌

#### 5.2 Backend 프롬프트 생성

```javascript
function buildCounselorPrompt(stage, context) {
  const { artwork, emotionColor, interactions, userMessage } = context;

  const interactionContext = interactions ? `
사용자의 상호작용:
- 가장 많이 터치한 영역: ${interactions.dominantArea} (${interactions.visualTouches.find(t => t.area === interactions.dominantArea)?.percentage * 100}%)
- 전체 터치: ${interactions.visualTouches.map(t => `${t.area} ${Math.round(t.percentage * 100)}%`).join(', ')}
- 선택한 색상: ${interactions.colorSelections.join(', ')}
- 느낀 감정: ${interactions.feelingTags.join(', ')}
- AI 요약: ${interactions.interactionSummary}
` : '';

  const basePrompt = `당신은 SAYU의 공감적인 예술 상담자입니다.

현재 작품: ${artwork.title} - ${artwork.artist}
사용자 감정: ${emotionColor}

${interactionContext}

[Opening 단계 가이드]
1. 사용자의 상호작용 데이터를 구체적으로 언급하세요
2. "45%나 터치", "파란색과 연분홍" 같이 구체적 수치/선택 사용
3. 질문은 1-2개, 공감적 톤 유지
4. 200자 이내로 작성`;

  return basePrompt;
}
```

### Step 6: 개인화된 정보 레이어 ⭐ **핵심 차별화**

#### 6.1 개인화 로직

```typescript
interface PersonalizedContent {
  original: string;
  highlighted: {
    text: string;
    reason: string;
    userAction: 'touched_area' | 'selected_color' | 'chose_feeling';
    cssClass: string;
  }[];
}

async function personalizeArtistStory(
  artworkId: string,
  interaction: ArtworkInteraction
): Promise<PersonalizedContent> {

  // 1. 기본 작가 스토리 가져오기
  const { data: artwork } = await supabase
    .from('mood_atlas_artworks')
    .select('artist_story, artist_story_sections')
    .eq('id', artworkId)
    .single();

  // 2. AI로 개인화 분석
  const prompt = `작가 스토리를 개인화:

스토리:
${artwork.artist_story}

사용자 상호작용:
- 터치: ${interaction.dominantArea}
- 색상: ${interaction.dominantColors.join(', ')}
- 느낌: ${interaction.feelingTags.join(', ')}

스토리 중에서 사용자 상호작용과 연결되는 부분을 JSON으로 추출:
{
  "highlights": [
    {
      "text": "모네는 지베르니 정원의 연못을...",
      "reason": "사용자가 연못을 45% 터치",
      "userAction": "touched_pond"
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  const analysis = JSON.parse(completion.choices[0].message.content);

  // 3. CSS 클래스 매핑
  const highlighted = analysis.highlights.map(h => ({
    ...h,
    cssClass: getCssClassForAction(h.userAction)
  }));

  return {
    original: artwork.artist_story,
    highlighted
  };
}

function getCssClassForAction(action: string): string {
  const mapping = {
    'touched_pond': 'bg-blue-100 border-l-4 border-blue-500',
    'selected_blue': 'bg-blue-50 text-blue-900',
    'chose_peaceful': 'bg-green-50 text-green-900'
  };
  return mapping[action] || 'bg-yellow-50';
}
```

#### 6.2 UI 구현

```
┌─────────────────────────────────────┐
│  📚 작품 더 알아보기                 │
├─────────────────────────────────────┤
│                                     │
│  ✅ 기본 정보                        │
│  제목: 수련                          │
│  작가: 클로드 모네                   │
│  연도: 1916년                        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  📖 작가 스토리 ▼                    │
│                                     │
│  모네는 말년에 자신의 정원에          │
│  ┌─────────────────────────┐       │
│  │ 연못을 만들고, 그곳의    │ 💡    │
│  │ 수련을 수없이 그렸습니다 │       │
│  └─────────────────────────┘       │
│  👆 당신이 연못을 45% 터치했어요    │
│                                     │
│  시력을 잃어가면서도               │
│  ┌─────────────────────────┐       │
│  │ 파란색과 분홍색 조합을   │ 🎨    │
│  │ 끝까지 놓지 않았죠       │       │
│  └─────────────────────────┘       │
│  👆 당신이 선택한 색상이에요        │
│                                     │
│  "평온함 속에서 영원을 본다"        │
│  라고 말한 그의 말처럼,              │
│  ┌─────────────────────────┐       │
│  │ 이 작품은 고요한 명상    │ 🧘    │
│  └─────────────────────────┘       │
│  👆 당신이 '평온한'을 느꼈어요      │
│                                     │
│  [다음: 메모 작성하기]              │
│                                     │
└─────────────────────────────────────┘
```

**시각적 강조:**
- 파란색 하이라이트: 터치한 영역 관련
- 핑크색 하이라이트: 선택한 색상 관련
- 초록색 하이라이트: 느낌 태그 관련
- 아이콘 (💡🎨🧘): 연결 유형 표시

### Step 7: 가이드된 메모 작성 ⭐ **핵심 차별화**

#### 7.1 메모 가이드 생성 (AI)

```javascript
async function generateMemoSuggestions(entryId, interaction, counselorInsights) {
  const userId = req.user.id;

  // 1. 이전 기록 찾기
  const { data: pastEntries } = await supabase
    .from('mood_atlas_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. 유사도 계산
  const relatedEntries = pastEntries
    .map(entry => ({
      ...entry,
      similarity: calculateSimilarity(interaction, entry)
    }))
    .filter(e => e.similarity > 0.6)
    .slice(0, 3);

  // 3. AI 질문 생성
  const prompt = `메모 작성 가이드 질문 생성:

상호작용:
- 터치: ${interaction.dominantArea} (${interaction.visualTouches[0]?.percentage * 100}%)
- 색상: ${interaction.colorSelections.join(', ')}
- 느낌: ${interaction.feelingTags.join(', ')}

AI 통찰:
${counselorInsights.join('\n')}

이전 기록:
${relatedEntries.map(e => `- ${e.date}: ${e.emotion_color} 감정, ${e.selected_artwork_id}`).join('\n')}

5개 질문 생성 (JSON):
{
  "questions": [
    {
      "q": "연못을 45%나 터치했는데, 물이 특별한 의미가 있나요?",
      "type": "interaction",
      "relatedData": { "area": "pond", "percentage": 0.45 }
    },
    {
      "q": "지난주에도 파란색 작품을 선택했어요. 요즘 파란색에 끌리는 이유가 있나요?",
      "type": "color",
      "relatedData": { "pastEntry": "..." }
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const { questions } = JSON.parse(completion.choices[0].message.content);

  // 4. 저장
  const { data: suggestion } = await supabase
    .from('memo_suggestions')
    .insert({
      entry_id: entryId,
      user_id: userId,
      questions,
      related_entries: relatedEntries.map(e => e.id),
      connection_reason: relatedEntries.length > 0
        ? `지난주에도 비슷한 ${interaction.dominantColors[0]} 계열 작품 선택`
        : null
    })
    .select()
    .single();

  return suggestion;
}

function calculateSimilarity(interaction, pastEntry) {
  let score = 0;

  // 색상 유사도
  if (pastEntry.dominant_colors?.some(c => interaction.dominantColors.includes(c))) {
    score += 0.3;
  }

  // 느낌 유사도
  if (pastEntry.feeling_tags?.some(t => interaction.feelingTags.includes(t))) {
    score += 0.3;
  }

  // 작가 유사도 (같은 작가)
  if (pastEntry.selected_artwork_id?.includes(interaction.artworkId.split('-')[0])) {
    score += 0.4;
  }

  return score;
}
```

#### 7.2 UI 구현

```
┌─────────────────────────────────────┐
│  📝 오늘의 기록 남기기               │
├─────────────────────────────────────┤
│                                     │
│  💭 질문에 답하며 기록해보세요       │
│                                     │
│  Q1. 연못을 45%나 터치했는데,       │
│      물이 특별한 의미가 있나요?      │
│  ┌─────────────────────────┐       │
│  │ [답변 입력...]           │       │
│  └─────────────────────────┘       │
│  [이 질문 사용 ✓]                   │
│                                     │
│  Q2. 파란색과 연분홍 조합이         │
│      좋았던 이유는?                  │
│  ┌─────────────────────────┐       │
│  │ [답변 입력...]           │       │
│  └─────────────────────────┘       │
│  [이 질문 사용 ✓]                   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  🔗 이전 기록과 연결하기             │
│                                     │
│  📅 2025-01-02 (1주일 전)           │
│  "파란색 바다 그림 - 평온함"         │
│  → 오늘도 비슷한 파란색을 선택      │
│     했어요. 연결해서 기록할까요?     │
│  [연결하기]  [건너뛰기]              │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  📄 템플릿 사용하기                  │
│  • "오늘 이 작품을 보며..."          │
│  • "가장 마음에 든 부분은..."        │
│  • "이 감정은 요즘 내 마음과..."     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  💬 자유 작성                        │
│  ┌─────────────────────────┐       │
│  │                          │       │
│  │                          │       │
│  └─────────────────────────┘       │
│                                     │
│  [저장하기]                          │
│                                     │
└─────────────────────────────────────┘
```

**3가지 방식:**
1. **질문 기반**: 상호작용 데이터로 생성된 질문에 답변
2. **연결 기반**: 과거 기록과 연결하며 작성
3. **자유 작성**: 템플릿 활용 또는 완전 자유

### Step 8: 결과물 생성

#### 8.1 타일 색칠 + 보상

```javascript
async function completeEntry(req, res) {
  const {
    emotion_color,
    emotion_intensity,
    selected_artwork_id,
    user_memo,
    interaction_id,
    counselor_insights,
    info_layers_viewed,
    memo_used_suggestions,
    memo_connected_to_past
  } = req.body;

  const userId = req.user.id;

  // 1. 포인트 계산
  const points = {
    base: 50,
    interaction: interaction_id ? 30 : 0,
    counselor: counselor_insights?.length > 0 ? 40 : 0,
    info_exploration: (info_layers_viewed?.length || 0) * 10,
    memo_quality: calculateMemoQuality(user_memo, memo_used_suggestions, memo_connected_to_past),
    capsule_bonus: 0  // P2P 편지 생성 시 추가
  };

  const totalPoints = Object.values(points).reduce((sum, p) => sum + p, 0);

  // 2. 엔트리 저장
  const { data: entry } = await supabase
    .from('mood_atlas_entries')
    .insert({
      user_id: userId,
      emotion_color,
      emotion_intensity,
      selected_artwork_id,
      user_memo,
      interaction_id,
      counselor_insights,
      info_layers_viewed,
      interaction_points: points.interaction,
      memo_word_count: user_memo.split(' ').length,
      memo_used_suggestions: memo_used_suggestions,
      memo_connected_to_past: memo_connected_to_past,
      total_points: totalPoints,
      point_breakdown: points,
      // ... region, tile_number 등
    })
    .select()
    .single();

  // 3. 포인트 지급
  await gamificationService.awardPoints(userId, 'MOOD_ATLAS_ENTRY', totalPoints);

  // 4. 진행 상황 업데이트
  const progress = await updateProgress(userId, entry);

  // 5. 캐릭터 경험치 (대륙별)
  await updateCharacterExperience(userId, entry.region, totalPoints);

  // 6. 대륙 완료 확인 → 캐릭터 생성
  let newCharacter = null;
  if (progress.regionCompleted) {
    newCharacter = await generateCharacter(userId, entry.region);
  }

  res.json({
    entry,
    rewards: { points: totalPoints, breakdown: points },
    progress,
    newCharacter
  });
}

function calculateMemoQuality(memo, usedSuggestions, connectedToPast) {
  const wordCount = memo.split(' ').length;
  let score = 0;

  // 길이 점수
  if (wordCount > 10) score += 10;
  if (wordCount > 30) score += 10;
  if (wordCount > 50) score += 10;

  // 질문 사용
  if (usedSuggestions) score += 20;

  // 과거 연결
  if (connectedToPast) score += 30;

  return score;
}
```

#### 8.2 캐릭터 생성 (대륙 완료 시)

```javascript
async function generateCharacter(userId, regionId) {
  // 1. 해당 대륙 모든 상호작용 데이터 수집
  const { data: regionEntries } = await supabase
    .from('mood_atlas_entries')
    .select(`
      *,
      artwork_interactions (*)
    `)
    .eq('user_id', userId)
    .eq('region', regionId);

  // 2. 데이터 집계
  const aggregated = aggregateInteractionData(regionEntries);

  // 3. AI로 캐릭터 생성
  const prompt = `사용자의 15일 예술 여정을 바탕으로 캐릭터 생성:

대륙: ${regionId}
기간: ${regionEntries[0].created_at} ~ ${regionEntries[regionEntries.length - 1].created_at}

상호작용 분석:
- 가장 많이 터치한 요소: ${aggregated.topVisualElements.join(', ')}
- 선호 색상: ${aggregated.topColors.join(', ')}
- 자주 느낀 감정: ${aggregated.topFeelings.join(', ')}
- 가장 좋아한 작가: ${aggregated.favoriteArtist}
- 총 터치 횟수: ${aggregated.totalTouches}
- 총 감상 작품: ${regionEntries.length}개

JSON 형식으로 캐릭터 생성:
{
  "characterNameKo": "수련의 정령",
  "characterName": "Water Lily Spirit",
  "characterType": "creature",
  "space": "고요한 연못",
  "time": "새벽 안개",
  "characterEntity": "수련 위를 떠다니는 투명한 정령",
  "description": "당신이 사랑한 모네의 고요한 연못에서 태어난 정령입니다...",
  "birthStory": "15일간 당신이 52번 터치한 물의 반짝임, 15번 선택한 파란색...",
  "personalityTraits": ["차분한", "사색적인", "부드러운"],
  "favoriteThings": ["고요한 아침", "물에 비친 풍경", "연분홍 수련"],
  "speakingStyle": "~예요, ~하지요"
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8
  });

  const characterData = JSON.parse(completion.choices[0].message.content);

  // 4. 저장
  const { data: character } = await supabase
    .from('user_characters')
    .insert({
      user_id: userId,
      region_id: regionId,
      ...characterData,
      creation_data: aggregated,
      level: 1,
      experience: 0
    })
    .select()
    .single();

  return character;
}
```

#### 8.3 P2P 감정 캡슐 생성

```
┌─────────────────────────────────────┐
│  🎊 기록 완료!                       │
├─────────────────────────────────────┤
│                                     │
│  [타일 색칠 애니메이션]              │
│  🌊 인상주의 해안 +1 (13/15)         │
│                                     │
│  획득 보상:                          │
│  ✨ +150 포인트                      │
│    • 기본 50pt                       │
│    • 상호작용 30pt                   │
│    • AI 대화 40pt                    │
│    • 정보 탐색 20pt                  │
│    • 메모 품질 10pt                  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  💌 감정 캡슐 만들기                 │
│                                     │
│  오늘의 감정을 캡슐에 담아            │
│  미래의 누군가에게 보낼 수 있어요.   │
│                                     │
│  📮 3일 후 랜덤 전달                 │
│  🎨 작품 이미지 포함                 │
│  💬 120자 메시지                     │
│                                     │
│  ┌─────────────────────────┐       │
│  │ 오늘 모네의 수련을 보며  │       │
│  │ 마음이 평온해졌어요.     │       │
│  │ 당신도 평온한 하루       │       │
│  │ 보내길 바라요 💙         │       │
│  │                          │       │
│  │ 73/120자                 │       │
│  └─────────────────────────┘       │
│                                     │
│  [익명으로 보내기]  [건너뛰기]       │
│                                     │
└─────────────────────────────────────┘
```

**P2P 캡슐 시스템:**
- 120자 제한 메시지
- 3일 지연 전달 (느린 편지)
- 익명 전달 (캐릭터로 표시)
- 필터링 (Groq AI 검열)
- 수신자는 같은 감정 색상 선택자 중 랜덤

---

## 5. 프런트엔드 결과물

### 5.1 지도 시각화

```
┌─────────────────────────────────────┐
│  🗺️ 나의 Mood Atlas                 │
├─────────────────────────────────────┤
│                                     │
│  총 진행: 13/195 타일 (7%)           │
│  현재 대륙: 🌊 인상주의 해안         │
│                                     │
│  ┌───────────────────────┐         │
│  │                       │         │
│  │   [지도 SVG]          │         │
│  │                       │         │
│  │   🏛️ 르네상스 중심    │         │
│  │   ████████░░░░░ 10/15│         │
│  │                       │         │
│  │   🌊 인상주의 해안    │ 👈 현재│
│  │   ████░░░░░░░ 3/15   │         │
│  │                       │         │
│  │   🌋 표현주의 협곡    │         │
│  │   ░░░░░░░░░░░ 0/30   │         │
│  │                       │         │
│  └───────────────────────┘         │
│                                     │
│  📊 통계                             │
│  • 가장 좋아하는 색: 파랑 (12회)     │
│  • 자주 느낀 감정: 평온함 (8회)      │
│  • 선호 작가: 클로드 모네             │
│                                     │
│  🎭 보유 캐릭터: 0개                 │
│  다음 캐릭터: 2타일 남음! (13/15)    │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 캐릭터 컬렉션

```
┌─────────────────────────────────────┐
│  🎭 나의 캐릭터                      │
├─────────────────────────────────────┤
│                                     │
│  [Empty State - 아직 캐릭터 없음]    │
│                                     │
│  🌊 인상주의 해안 완료 시:           │
│  첫 번째 캐릭터가 탄생합니다!        │
│                                     │
│  진행: 13/15 타일                    │
│  예상 탄생일: 2025-01-11             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  [대륙 완료 후]                      │
│                                     │
│  ┌─────────────────────────┐       │
│  │  🌊 수련의 정령          │       │
│  │  [캐릭터 일러스트]       │       │
│  │                          │       │
│  │  Level 2 ━━━●░ 67%      │       │
│  │                          │       │
│  │  탄생: 2025-01-25        │       │
│  │  대표 캐릭터 ⭐          │       │
│  │                          │       │
│  │  [프로필 보기]           │       │
│  └─────────────────────────┘       │
│                                     │
│  다음 캐릭터:                        │
│  🌋 표현주의 협곡 (0/30)             │
│                                     │
└─────────────────────────────────────┘
```

### 5.3 저널 아카이브

```
┌─────────────────────────────────────┐
│  📖 나의 예술 저널                   │
├─────────────────────────────────────┤
│                                     │
│  🔍 필터:                            │
│  [전체] [파랑 감정] [평온함]         │
│  [모네] [물 관련]                    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  📅 2025-01-09 (오늘)                │
│  ┌─────────────────────────┐       │
│  │ 🎨 모네 "수련" (1916)    │       │
│  │ [썸네일]                 │       │
│  │                          │       │
│  │ 💙 파랑 (25%)            │       │
│  │ #평온한 #잔잔한          │       │
│  │                          │       │
│  │ 💭 "연못의 반짝임이..."  │       │
│  │                          │       │
│  │ 📊 터치 6회 · 메모 38자  │       │
│  │ 🔗 2025-01-02와 연결됨   │       │
│  └─────────────────────────┘       │
│  [자세히]                            │
│                                     │
│  📅 2025-01-02 (1주일 전)            │
│  ┌─────────────────────────┐       │
│  │ 🎨 터너 "바다" (1840)    │       │
│  │ [썸네일]                 │       │
│  │                          │       │
│  │ 💙 파랑 (40%)            │       │
│  │ #평온한 #광활한          │       │
│  │                          │       │
│  │ 💭 "바다를 보며..."      │       │
│  └─────────────────────────┘       │
│  [자세히]                            │
│                                     │
│  💡 패턴 발견!                       │
│  "최근 2주간 파란색 작품 3회 선택"   │
│  → 물과 평온함에 끌리시는군요!      │
│                                     │
└─────────────────────────────────────┘
```

### 5.4 P2P 캡슐함

```
┌─────────────────────────────────────┐
│  💌 감정 캡슐                        │
├─────────────────────────────────────┤
│                                     │
│  📬 받은 캡슐 (3)                    │
│                                     │
│  ┌─────────────────────────┐       │
│  │ 🌊 익명의 수련의 정령    │       │
│  │ 3일 전 발송               │       │
│  │                          │       │
│  │ 💙 파랑 감정 · 모네 작품 │       │
│  │                          │       │
│  │ "평온한 하루가 당신에게  │       │
│  │  찾아가길 바라요 💙"     │       │
│  │                          │       │
│  │ [답장하기] [공유]        │       │
│  └─────────────────────────┘       │
│                                     │
│  📮 보낸 캡슐 (2)                    │
│                                     │
│  ┌─────────────────────────┐       │
│  │ 2025-01-06 발송          │       │
│  │ → 2025-01-09 전달 예정   │       │
│  │                          │       │
│  │ 💚 초록 감정              │       │
│  │ "오늘 모네의..."          │       │
│  │                          │       │
│  │ 상태: 전달 대기 중 🚀    │       │
│  └─────────────────────────┘       │
│                                     │
│  [새 캡슐 만들기]                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Backend 구현 가이드

### 6.1 마이그레이션 순서

```bash
# Day 1: 핵심 테이블
cd backend/src/migrations

# 005_artwork_interactions.sql
psql $DATABASE_URL -f 005_artwork_interactions.sql

# 006_counselor_conversations.sql
psql $DATABASE_URL -f 006_counselor_conversations.sql

# Day 2: 개인화 테이블
# 007_personalized_info.sql
psql $DATABASE_URL -f 007_personalized_info.sql

# Day 3: 캐릭터 & P2P
# 008_characters_and_capsules.sql
psql $DATABASE_URL -f 008_characters_and_capsules.sql
```

### 6.2 API 엔드포인트

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// moodAtlasRoutes.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 상호작용
router.post('/interactions', authenticateUser, moodAtlasController.saveInteraction);
router.get('/interactions/summary/:userId', authenticateUser, moodAtlasController.getInteractionSummary);

// 대화
router.post('/counselor/message', authenticateUser, moodAtlasController.counselorMessage);
router.get('/counselor/insights/:entryId', authenticateUser, moodAtlasController.getInsights);

// 개인화 정보
router.get('/artwork-info/:id/personalized', authenticateUser, moodAtlasController.getPersonalizedInfo);
router.post('/info-layer-view', authenticateUser, moodAtlasController.recordInfoView);

// 메모 가이드
router.post('/memo-suggestions', authenticateUser, moodAtlasController.generateMemoSuggestions);

// 엔트리 완성
router.post('/entry/complete', authenticateUser, moodAtlasController.completeEntry);

// 캐릭터
router.get('/characters/:userId', authenticateUser, characterController.getUserCharacters);
router.get('/characters/:id/profile', authenticateUser, characterController.getCharacterProfile);
router.post('/characters/:id/experience', authenticateUser, characterController.addExperience);

// P2P 캡슐
router.post('/capsules/create', authenticateUser, capsuleController.createCapsule);
router.get('/capsules/inbox/:userId', authenticateUser, capsuleController.getInbox);
router.get('/capsules/sent/:userId', authenticateUser, capsuleController.getSentCapsules);
router.post('/capsules/:id/read', authenticateUser, capsuleController.markAsRead);
```

### 6.3 Groq 프롬프트 예시

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 상호작용 분석
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ANALYZE_INTERACTION_PROMPT = (data) => `작품 상호작용 데이터 분석:

작품: ${data.artworkTitle} - ${data.artist}
터치 분석:
${data.visualTouches.map(t => `- ${t.area}: ${Math.round(t.percentage * 100)}% (${t.count}회)`).join('\n')}

선택한 색상: ${data.colorSelections.join(', ')}
느낌 태그: ${data.feelingTags.join(', ')}

1문장으로 요약 (예: "사용자는 수면의 반짝임에 특히 관심"):`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Opening 대화
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COUNSELOR_OPENING_PROMPT = (context) => `SAYU 예술 상담자로서 사용자와 대화:

작품: ${context.artwork.title} - ${context.artwork.artist}
사용자 감정: ${context.emotionColor}

상호작용:
- 가장 많이 터치: ${context.interaction.dominantArea} (${Math.round(context.interaction.visualTouches[0]?.percentage * 100)}%)
- 선택 색상: ${context.interaction.colorSelections.join(', ')}
- 느낌: ${context.interaction.feelingTags.join(', ')}

가이드:
1. 상호작용 구체 언급 ("45%나 터치")
2. 공감적 질문 (1-2개)
3. 200자 이내
4. 따뜻한 톤

응답:`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 개인화된 정보
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PERSONALIZE_INFO_PROMPT = (story, interaction) => `작가 스토리 개인화:

원문:
${story}

사용자 상호작용:
- 터치: ${interaction.dominantArea} (${Math.round(interaction.visualTouches[0]?.percentage * 100)}%)
- 색상: ${interaction.dominantColors.join(', ')}
- 느낌: ${interaction.feelingTags.join(', ')}

JSON 응답:
{
  "highlights": [
    {
      "text": "하이라이트할 원문 일부",
      "reason": "사용자가 연못 45% 터치",
      "userAction": "touched_pond"
    }
  ]
}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메모 질문 생성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MEMO_QUESTIONS_PROMPT = (data) => `메모 작성 질문 생성:

상호작용:
- 터치: ${data.interaction.dominantArea} (${data.interaction.visualTouches[0]?.percentage * 100}%)
- 색상: ${data.interaction.colorSelections.join(', ')}
- 느낌: ${data.interaction.feelingTags.join(', ')}

AI 통찰:
${data.insights.join('\n')}

이전 유사 기록:
${data.relatedEntries.map(e => `- ${e.date}: ${e.emotionColor}, ${e.artworkTitle}`).join('\n')}

JSON 응답 (5개 질문):
{
  "questions": [
    {
      "q": "질문 텍스트",
      "type": "interaction|color|feeling|connection",
      "relatedData": {}
    }
  ]
}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 캐릭터 생성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHARACTER_GENERATION_PROMPT = (data) => `사용자 15일 여정으로 캐릭터 생성:

대륙: ${data.regionName}
기간: ${data.startDate} ~ ${data.endDate}

집계:
- 상위 터치 요소: ${data.topVisualElements.join(', ')}
- 선호 색상: ${data.topColors.join(', ')} (${data.colorCounts})
- 자주 느낀 감정: ${data.topFeelings.join(', ')}
- 선호 작가: ${data.favoriteArtist} (${data.artistCount}회)
- 총 터치: ${data.totalTouches}회
- 총 작품: ${data.totalArtworks}개

JSON 응답:
{
  "characterNameKo": "캐릭터 이름 (한글)",
  "characterName": "Character Name (영문)",
  "characterType": "artist_reborn|creature|abstract",
  "space": "공간 (예: 별이 빛나는 하늘)",
  "time": "시간 (예: 깊은 밤)",
  "characterEntity": "인물 (예: 반 고흐의 환생)",
  "description": "캐릭터 설명 (3-5문장)",
  "birthStory": "탄생 이야기 (사용자 데이터 언급)",
  "personalityTraits": ["성격1", "성격2", "성격3"],
  "favoriteThings": ["좋아하는것1", "좋아하는것2"],
  "speakingStyle": "말투 예시"
}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// P2P 캡슐 필터링
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CAPSULE_FILTER_PROMPT = (message) => `감정 캡슐 메시지 검토:

메시지: "${message}"

부적절 내용 확인:
- 개인정보 (전화번호, SNS 계정)
- 만남 유도
- 성적 내용
- 폭력적 내용
- 스팸/광고

JSON 응답:
{
  "isSafe": true|false,
  "reason": "사유 (unsafe인 경우)",
  "suggestion": "수정 제안 (optional)"
}`;
```

---

## 7. Frontend 구현 가이드

### 7.1 페이지 구조

```
frontend/app/mood-atlas/
├── page.tsx                          # 메인 지도
├── record/
│   ├── page.tsx                      # 시작 화면
│   ├── emotion/page.tsx              # Step 1-2: 감정 선택
│   ├── recommend/page.tsx            # Step 3: AI 추천
│   ├── interact/
│   │   └── [artworkId]/page.tsx      # Step 4: 상호작용
│   ├── session/
│   │   └── [artworkId]/page.tsx      # Step 5-6: 대화 + 정보
│   ├── memo/page.tsx                 # Step 7: 메모
│   └── complete/page.tsx             # Step 8: 완료
├── characters/
│   ├── page.tsx                      # 캐릭터 컬렉션
│   └── [id]/page.tsx                 # 캐릭터 프로필
├── journal/
│   ├── page.tsx                      # 저널 아카이브
│   └── [id]/page.tsx                 # 개별 엔트리
└── capsules/
    ├── page.tsx                      # P2P 캡슐함
    └── create/page.tsx               # 캡슐 생성
```

### 7.2 Zustand 통합 Store

```typescript
// lib/mood-atlas/unifiedStore.ts

interface MoodAtlasUnifiedStore {
  // ━━━━━━ Step 1-2: 감정 ━━━━━━
  emotionColor: string | null;
  emotionIntensity: number;
  setEmotion: (color: string, intensity: number) => void;

  // ━━━━━━ Step 3: 추천 ━━━━━━
  recommendations: Artwork[];
  setRecommendations: (artworks: Artwork[]) => void;

  // ━━━━━━ Step 4: 상호작용 ━━━━━━
  currentArtworkId: string | null;
  interaction: {
    visualTouches: { area: string; count: number; percentage: number }[];
    colorSelections: string[];
    feelingTags: string[];
  };
  interactionId: string | null;

  selectArtwork: (id: string) => void;
  recordTouch: (area: string) => void;
  selectColor: (color: string) => void;
  selectFeeling: (feeling: string) => void;
  submitInteraction: () => Promise<string>;  // returns interactionId

  // ━━━━━━ Step 5: 대화 ━━━━━━
  counselorStage: 'opening' | 'connection' | 'complete';
  counselorMessages: ConversationMessage[];
  counselorInsights: string[];

  sendCounselorMessage: (message: string) => Promise<void>;

  // ━━━━━━ Step 6: 정보 ━━━━━━
  personalizedInfo: PersonalizedInfoLayer | null;
  viewedLayers: string[];
  infoExplorationTime: number;

  loadPersonalizedInfo: () => Promise<void>;
  viewLayer: (layer: string) => void;
  trackTimeSpent: (seconds: number) => void;

  // ━━━━━━ Step 7: 메모 ━━━━━━
  memoSuggestions: MemoSuggestion | null;
  userMemo: string;
  usedQuestions: string[];
  connectedToPast: boolean;

  loadMemoSuggestions: () => Promise<void>;
  setMemo: (memo: string) => void;
  useQuestion: (questionId: string) => void;
  connectToPast: (entryId: string) => void;

  // ━━━━━━ Step 8: 완료 ━━━━━━
  completeEntry: () => Promise<CompleteResult>;
  createCapsule: (message: string) => Promise<void>;

  // ━━━━━━ 리셋 ━━━━━━
  reset: () => void;
}

export const useMoodAtlas = create<MoodAtlasUnifiedStore>((set, get) => ({
  // Initial state
  emotionColor: null,
  emotionIntensity: 50,
  recommendations: [],
  currentArtworkId: null,
  interaction: {
    visualTouches: [],
    colorSelections: [],
    feelingTags: []
  },
  interactionId: null,
  counselorStage: 'opening',
  counselorMessages: [],
  counselorInsights: [],
  personalizedInfo: null,
  viewedLayers: ['basic'],
  infoExplorationTime: 0,
  memoSuggestions: null,
  userMemo: '',
  usedQuestions: [],
  connectedToPast: false,

  // Actions
  setEmotion: (color, intensity) =>
    set({ emotionColor: color, emotionIntensity: intensity }),

  setRecommendations: (artworks) =>
    set({ recommendations: artworks }),

  selectArtwork: (id) =>
    set({ currentArtworkId: id }),

  recordTouch: (area) => set((state) => {
    const existing = state.interaction.visualTouches.find(t => t.area === area);
    const totalTouches = state.interaction.visualTouches.reduce((sum, t) => sum + t.count, 0) + 1;

    const newTouches = existing
      ? state.interaction.visualTouches.map(t =>
          t.area === area ? { ...t, count: t.count + 1 } : t
        )
      : [...state.interaction.visualTouches, { area, count: 1, percentage: 0 }];

    // 비율 재계산
    const withPercentages = newTouches.map(t => ({
      ...t,
      percentage: t.count / totalTouches
    }));

    return {
      interaction: {
        ...state.interaction,
        visualTouches: withPercentages
      }
    };
  }),

  submitInteraction: async () => {
    const state = get();
    const res = await fetch('/api/mood-atlas/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkId: state.currentArtworkId,
        visualTouches: state.interaction.visualTouches,
        colorSelections: state.interaction.colorSelections,
        feelingTags: state.interaction.feelingTags
      })
    });

    const { interactionId } = await res.json();
    set({ interactionId });
    return interactionId;
  },

  loadPersonalizedInfo: async () => {
    const state = get();
    const res = await fetch(`/api/mood-atlas/artwork-info/${state.currentArtworkId}/personalized?interactionId=${state.interactionId}`);
    const info = await res.json();
    set({ personalizedInfo: info });
  },

  loadMemoSuggestions: async () => {
    const state = get();
    const res = await fetch('/api/mood-atlas/memo-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interactionId: state.interactionId,
        counselorInsights: state.counselorInsights
      })
    });

    const suggestions = await res.json();
    set({ memoSuggestions: suggestions });
  },

  completeEntry: async () => {
    const state = get();
    const res = await fetch('/api/mood-atlas/entry/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emotion_color: state.emotionColor,
        emotion_intensity: state.emotionIntensity,
        selected_artwork_id: state.currentArtworkId,
        user_memo: state.userMemo,
        interaction_id: state.interactionId,
        counselor_insights: state.counselorInsights,
        info_layers_viewed: state.viewedLayers,
        memo_used_suggestions: state.usedQuestions.length > 0,
        memo_connected_to_past: state.connectedToPast
      })
    });

    return res.json();
  },

  reset: () => set({
    emotionColor: null,
    emotionIntensity: 50,
    recommendations: [],
    currentArtworkId: null,
    interaction: { visualTouches: [], colorSelections: [], feelingTags: [] },
    interactionId: null,
    counselorStage: 'opening',
    counselorMessages: [],
    counselorInsights: [],
    personalizedInfo: null,
    viewedLayers: ['basic'],
    infoExplorationTime: 0,
    memoSuggestions: null,
    userMemo: '',
    usedQuestions: [],
    connectedToPast: false
  })
}));
```

### 7.3 핵심 컴포넌트

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 개인화된 정보 레이어
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// components/mood-atlas/PersonalizedInfoLayer.tsx

export function PersonalizedInfoLayer({ artworkId }: { artworkId: string }) {
  const { personalizedInfo, loadPersonalizedInfo, viewLayer } = useMoodAtlas();

  useEffect(() => {
    loadPersonalizedInfo();
  }, [artworkId]);

  if (!personalizedInfo) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* 기본 정보 */}
      <BasicInfo data={personalizedInfo.basic} />

      {/* 작가 스토리 (하이라이트) */}
      <Accordion>
        <AccordionItem value="artist">
          <AccordionTrigger>📖 작가 스토리</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <h4>{personalizedInfo.artistStory.title}</h4>

              {/* 하이라이트된 텍스트 */}
              <div className="space-y-2">
                {personalizedInfo.artistStory.highlighted.map((h, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${h.cssClass}`}>
                    <p className="text-sm">{h.text}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                      <span>💡</span>
                      <span>{h.reason}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fun Fact */}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm">
                  <strong>💡 재미있는 사실:</strong><br />
                  {personalizedInfo.artistStory.funFact}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 가이드된 메모 작성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// components/mood-atlas/GuidedMemoEditor.tsx

export function GuidedMemoEditor() {
  const {
    memoSuggestions,
    userMemo,
    usedQuestions,
    setMemo,
    useQuestion,
    connectToPast
  } = useMoodAtlas();

  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  if (!memoSuggestions) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* 질문 기반 작성 */}
      <section>
        <h3 className="font-semibold mb-3">💭 질문에 답하며 기록하기</h3>

        {memoSuggestions.questions.map((q, idx) => (
          <div key={idx} className="mb-4 p-4 border rounded-lg">
            <p className="font-medium mb-2">{q.q}</p>
            <Textarea
              value={questionAnswers[q.q] || ''}
              onChange={(e) => {
                setQuestionAnswers({ ...questionAnswers, [q.q]: e.target.value });
                if (e.target.value && !usedQuestions.includes(q.q)) {
                  useQuestion(q.q);
                }
              }}
              placeholder="답변 입력..."
              className="mb-2"
            />
            {usedQuestions.includes(q.q) && (
              <span className="text-xs text-green-600">✓ 이 질문 사용 중</span>
            )}
          </div>
        ))}
      </section>

      {/* 이전 기록 연결 */}
      {memoSuggestions.relatedEntries.length > 0 && (
        <section>
          <h3 className="font-semibold mb-3">🔗 이전 기록과 연결하기</h3>

          {memoSuggestions.relatedEntries.map((entry) => (
            <div key={entry.entryId} className="p-3 border rounded-lg mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{entry.date}</p>
                  <p className="text-xs text-gray-600">{entry.connectionReason}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => connectToPast(entry.entryId)}
                >
                  연결하기
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 자유 작성 */}
      <section>
        <h3 className="font-semibold mb-3">💬 자유롭게 작성하기</h3>
        <Textarea
          value={userMemo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘의 감상을 자유롭게 남겨보세요..."
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">
          {userMemo.split(' ').length}단어
        </p>
      </section>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 캐릭터 탄생 애니메이션
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// components/mood-atlas/CharacterBirthAnimation.tsx

export function CharacterBirthAnimation({ character }: { character: UserCharacter }) {
  const [step, setStep] = useState<'analyzing' | 'birthing' | 'greeting'>('analyzing');

  useEffect(() => {
    const timer1 = setTimeout(() => setStep('birthing'), 3000);
    const timer2 = setTimeout(() => setStep('greeting'), 6000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  if (step === 'analyzing') {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="text-4xl">🔮</div>
        <h2>당신의 여정을 분석하고 있습니다...</h2>
        <div className="space-y-2 text-sm">
          <p>⚡ 15일간의 기록</p>
          <p>🎨 15개의 작품 감상</p>
          <p>✋ {character.creationData.totalTouches}번의 터치</p>
        </div>
        <Progress value={83} />
      </div>
    );
  }

  if (step === 'birthing') {
    return (
      <div className="text-center p-8">
        <div className="text-6xl animate-bounce">
          {character.characterIcon}
        </div>
        <p className="mt-4">당신의 창조물이 깨어납니다...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">{character.characterIcon}</div>
        <h2 className="text-2xl font-bold">{character.characterNameKo}</h2>
        <p className="text-gray-600">{character.characterName}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm">{character.birthStory}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">특성:</h3>
        <div className="flex flex-wrap gap-2">
          {character.personalityTraits.map(t => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => {}}>프로필 보기</Button>
        <Button variant="outline">대표 캐릭터로 설정</Button>
      </div>
    </div>
  );
}
```

---

## 8. 구현 타임라인

### Phase 1: MVP (2주 - 10일)

#### Week 1: Backend 기초

| Day | Backend | Frontend |
|-----|---------|----------|
| 1 | DB 마이그레이션 (5개 테이블) | - |
| 2 | 상호작용 API | - |
| 3 | 대화 API (Opening, Connection) | - |
| 4 | 개인화 정보 API | - |
| 5 | 메모 가이드 API + Postman 테스트 | - |

#### Week 2: Frontend + 통합

| Day | Backend | Frontend |
|-----|---------|----------|
| 6 | - | Zustand 통합 store + 상호작용 컴포넌트 |
| 7 | - | 대화 페이지 (Art Counselor 재활용) |
| 8 | - | 개인화 정보 + 가이드된 메모 |
| 9 | 완료 API + 보상 | 완료 페이지 + 지도 업데이트 |
| 10 | QA & 버그 수정 | E2E 테스트 + Staging 배포 |

### Phase 2: 캐릭터 & P2P (2주)

#### Week 3: 캐릭터 시스템

| Day | 작업 |
|-----|------|
| 11-12 | 캐릭터 생성 알고리즘 (AI) |
| 13-14 | 캐릭터 UI (탄생 애니메이션, 프로필) |
| 15 | 캐릭터 컬렉션 페이지 |

#### Week 4: P2P & 최종

| Day | 작업 |
|-----|------|
| 16-17 | P2P 캡슐 시스템 (Backend + Frontend) |
| 18 | 저널 아카이브 (필터, 패턴 발견) |
| 19 | 전체 QA + 성능 최적화 |
| 20 | Production 배포 |

---

## 9. 성공 지표

### 9.1 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 평균 세션 시간 | 5분 | 15분 | Google Analytics |
| 상호작용률 | 0% | 85% | DB: interaction_id != null |
| AI 대화 참여율 | 0% | 70% | DB: counselor_insights count |
| 정보 탐색 시간 | - | 평균 3분 | DB: info_exploration_time |
| 메모 작성률 | 40% | 80% | DB: user_memo != null |
| 질문 사용률 | - | 60% | DB: memo_used_suggestions |
| 과거 연결률 | - | 40% | DB: memo_connected_to_past |
| D7 Retention | 35% | 60% | 사용자 코호트 분석 |
| D30 Retention | 15% | 35% | 사용자 코호트 분석 |

### 9.2 정성적 지표

**사용자 피드백 예상:**
- "작품과 더 깊이 연결된 느낌"
- "AI가 내가 터치한 부분을 언급해서 신기했어요"
- "정보가 내 선택과 연결돼서 더 흥미로웠어요"
- "메모 쓰기 막연했는데 질문이 도움됐어요"
- "이전 기록과 연결되니 성장하는 느낌"

---

## 10. FAQ

### Q1: 기존 Art Counselor는 어떻게 되나요?

**A:** 독립 서비스로 유지됩니다.

```
Art Counselor (독립):
- 언제든 원하는 작품으로 심도 깊은 대화
- Full 4단계 (Opening → Exploration → Connection → Complete)
- 세션 기록 관리

Mood Atlas (통합):
- 일일 감정 기록 플로우의 일부
- 간소화 2단계 (Opening → Connection)
- 엔트리 단위 관리
```

### Q2: 개인화는 어떻게 작동하나요?

**A:** 3단계 개인화:

1. **상호작용 수집**: 터치, 색상, 느낌 기록
2. **AI 분석**: Groq로 사용자 관심사 추출
3. **콘텐츠 매칭**: 정보 중 관련 부분 하이라이트

### Q3: P2P 캡슐은 왜 느리게 전달하나요?

**A:** "에믈링" 콘셉트:

- 즉각 전달 = 채팅 느낌
- 3일 지연 = 편지 느낌
- 기대감 + 우연성 증가
- 스팸 방지 효과

### Q4: 캐릭터는 어떻게 생성되나요?

**A:** 15일 데이터 집계:

```javascript
집계 데이터:
- 터치: 연못 45%, 수련 33%
- 색상: 파랑 15회, 핑크 8회
- 느낌: 평온 10회, 잔잔 7회
- 작가: 모네 10회

AI 생성:
→ 🌊 수련의 정령
  공간: 고요한 연못
  시간: 새벽 안개
  성격: 차분하고 사색적
```

---

## 11. 다음 단계

### 즉시 시작 (오늘)

```bash
# Backend Day 1
cd backend/src/migrations
code 005_artwork_interactions.sql

# SQL 작성 (섹션 3.1 참조)
# 실행
psql $DATABASE_URL -f 005_artwork_interactions.sql
```

### 1주 스프린트

**Day 1-5**: Backend 완성
**Day 6-10**: Frontend 완성
**Day 11**: MVP 테스트 & 배포

---

**문서 버전:** 2.0
**최종 수정:** 2025-01-09
**상태:** Ready for Implementation
**CODEX 피드백:** ✅ 반영 완료
**사용자 피드백:** ✅ 반영 완료

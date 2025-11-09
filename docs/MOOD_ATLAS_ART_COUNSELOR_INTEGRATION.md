# SAYU Mood Atlas × Art Counselor 통합 설계

> **작성일:** 2025-01-09
> **목적:** "능동적 상호작용 → 감정 언어화 → 정보 탐색" 순서의 완전 통합 서비스 구현
> **구현 우선순위:** Backend → Frontend

---

## 📋 목차

1. [핵심 철학](#1-핵심-철학)
2. [통합 아키텍처](#2-통합-아키텍처)
3. [상세 사용자 플로우](#3-상세-사용자-플로우)
4. [Backend 구현 가이드](#4-backend-구현-가이드-우선)
5. [Frontend 구현 가이드](#5-frontend-구현-가이드)
6. [구현 타임라인](#6-구현-타임라인)
7. [즉시 시작 가이드](#7-즉시-시작-가이드)

---

## 1. 핵심 철학

### 1.1 통합 비전

```
SAYU Daily Art Journey
"능동적 참여 → 감정 탐색 → 지식 성장"

🎨 Mood Atlas (기반)         일일 감정 기록 + 작품 추천 + 지도 진행
💬 Art Counselor (통합)       AI 대화로 감정 언어화
🖐️ Interactive (신규)         본능적 상호작용으로 몰입 증가
📚 Information (신규)         부담 없는 점진적 학습
```

### 1.2 사용자 경험 순서 (핵심!)

```
기존 순서 (정보 먼저):
정보 파악 → 감정 탐색 → 상호작용 → 메모

새로운 순서 (감정 먼저):
감정 선택 → AI 추천 → 👆 능동적 터치 → 💬 AI 대화 → 📚 정보 탐색 → 메모
```

**이유:**
- 심리적 관여: 먼저 상호작용하면 "내가 참여한 작품"이라는 소유감 생김
- Counselor 시퀀스 찰떡궁합: "본능적 반응" 후 AI가 "방금 손에 남은 느낌이 어땠나요?" 묻기
- 정보의 사후적 보상 효과: 감정 정리 후 정보 제공 → "아, 그래서 내가 이렇게 느꼈구나"

### 1.3 차별화 포인트

| 기존 예술 앱 | SAYU Mood Atlas 통합 |
|------------|---------------------|
| 수동적 감상 | ✅ 능동적 터치/선택 |
| 정보 먼저 | ✅ 감정 먼저, 정보는 나중 |
| 일방향 AI 추천 | ✅ 쌍방향 대화 |
| 학습 모드 | ✅ 자연스러운 탐색 |
| 일시적 경험 | ✅ 누적되는 기록 |

---

## 2. 통합 아키텍처

### 2.1 기존 시스템 분석

**Mood Atlas (기존):**
- ✅ DB: mood_atlas_regions, mood_atlas_artworks, mood_atlas_entries, mood_atlas_progress
- ✅ API: 15개 엔드포인트 (recommend, entry, progress, map, etc.)
- ✅ Frontend: 감정 선택, AI 추천, 지도, 히스토리

**Art Counselor (기존):**
- ✅ DB: art_counselor_sessions, counselor_messages
- ✅ API: Opening → Exploration → Connection → Complete
- ✅ Frontend: 대화 UI, 단계별 컴포넌트

### 2.2 통합 구조

```
┌─────────────────────────────────────────────────┐
│           Daily Art Journey (통합)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  1️⃣ 감정 선택 (Mood Atlas)                      │
│      ↓                                          │
│  2️⃣ AI 추천 (Mood Atlas + Groq)                │
│      ↓                                          │
│  3️⃣ 🆕 능동적 상호작용                           │
│      - 비주얼 터치 (작품 영역 클릭)               │
│      - 색상 선택 (끌리는 색)                     │
│      - 느낌 태그 (평온한, 아름다운)               │
│      ↓                                          │
│  4️⃣ 작품 선택                                    │
│      ↓                                          │
│  5️⃣ 🆕 AI 대화 (Art Counselor 흡수)             │
│      - Opening: 초기 반응 탐색                   │
│      - Exploration: 감정 탐색 (Phase 2)         │
│      - Connection: 깊은 연결                     │
│      ↓                                          │
│  6️⃣ 🆕 정보 레이어 탐색                          │
│      - Layer 1: 기본 정보 (항상)                │
│      - Layer 2: 작가 스토리 (클릭)               │
│      - Layer 3: 역사적 맥락 (Phase 2)           │
│      - Layer 4: 기법 (Phase 2)                  │
│      ↓                                          │
│  7️⃣ 메모 작성 (Mood Atlas)                      │
│      ↓                                          │
│  8️⃣ 타일 색칠 + 보상 (Mood Atlas)                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 3. 상세 사용자 플로우

### Step 1-2: 감정 선택 (기존 유지)

```typescript
// 기존 Mood Atlas 유지
interface EmotionSelection {
  emotionColor: 'blue' | 'red' | 'yellow' | 'purple' | 'green' | 'gray';
  emotionIntensity: number; // 0-100
  emotionLabel: string; // "연한 파랑 (25%)"
}
```

**API:**
```
✅ 기존: GET /api/mood-atlas/regions (현재 지역 확인)
```

### Step 3: AI 추천 (기존 유지)

```typescript
// 기존 API
POST /api/mood-atlas/recommend
Request: {
  emotionColor: 'blue',
  emotionIntensity: 25
}

Response: {
  recommendations: [
    {
      artworkId: 'monet-water-lilies-1916',
      title: '수련',
      artist: '클로드 모네',
      reason: '고요한 연못처럼 마음이 잔잔해질 거예요',
      imageUrl: 'https://...',
      thumbnailUrl: 'https://...'
    }
    // ... 2개 더
  ]
}
```

### Step 4: 🆕 능동적 상호작용

#### 4.1 데이터 구조

```typescript
interface ArtworkInteraction {
  artworkId: string;

  // 1️⃣ 비주얼 터치
  visualTouches: {
    areaName: string; // "pond", "water-lilies", "sky-reflection"
    touchCount: number;
  }[];

  // 2️⃣ 색상 선택
  colorSelections: string[]; // ['blue', 'pink']

  // 3️⃣ 느낌 태그
  feelingTags: string[]; // ['peaceful', 'calm', 'beautiful']

  // Phase 2 확장:
  compositionTags?: string[]; // ['symmetric', 'flowing']
  subjectSelections?: string[]; // ['water', 'flowers']
}
```

#### 4.2 UI 흐름

```
┌─────────────────────────────────────┐
│  클로드 모네 "수련" (1916)           │
├─────────────────────────────────────┤
│                                     │
│  작품을 자유롭게 탐색해보세요        │
│  정보는 나중에 볼 수 있어요 😊       │
│                                     │
│  ┌───────────────────────┐         │
│  │                       │         │
│  │   [작품 이미지]        │         │
│  │   👆 터치 가능        │         │
│  │                       │         │
│  │   ✨ 터치된 영역:      │         │
│  │   • 연못 (★★★)       │         │
│  │   • 수련 (★★)         │         │
│  │   • 하늘 반영 (★)     │         │
│  │                       │         │
│  └───────────────────────┘         │
│                                     │
│  🎨 어떤 색이 좋으세요?              │
│  ○ 파랑  ○ 연분홍  ○ 초록  ○ 흰색 │
│  ✓ 파랑  ✓ 연분홍                  │
│                                     │
│  💭 어떤 느낌인가요?                 │
│  [평온한] [잔잔한] [그리운] [신비한]│
│  ✓ 평온한  ✓ 잔잔한                │
│                                     │
│  [다음: 작품 더 알아보기]            │
│                                     │
└─────────────────────────────────────┘
```

### Step 5: 🆕 AI 대화 (Art Counselor 통합)

#### 5.1 통합 개념

```typescript
// Art Counselor 세션을 Mood Atlas 엔트리와 연결
interface IntegratedCounselorSession {
  moodAtlasEntryId: string; // ← 핵심! Mood Atlas와 연결
  artworkId: string;

  // Art Counselor 단계
  currentStage: 'opening' | 'exploration' | 'connection' | 'complete';

  messages: ConversationMessage[];

  // 통합 컨텍스트
  emotionColor: string; // Mood Atlas에서 가져옴
  interactions: ArtworkInteraction; // Step 4에서 수집
}
```

#### 5.2 Opening 단계 - 상호작용 반영

```
┌─────────────────────────────────────┐
│  💬 대화하기                         │
├─────────────────────────────────────┤
│                                     │
│  [작품 썸네일]                       │
│                                     │
│  🤖 SAYU:                            │
│  "방금 이 작품의 연못을 3번이나      │
│   터치하셨네요. 물의 반짝임이        │
│   특히 마음에 드셨나봐요.            │
│                                     │
│   파란색과 연분홍을 선택하셨는데,    │
│   이 색 조합에서 무엇이 느껴지나요?" │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  빠른 응답:                          │
│  [차분한 느낌]  [아름다운 조화]      │
│  [직접 입력...]                      │
│                                     │
└─────────────────────────────────────┘
```

**핵심:** AI가 사용자의 상호작용 데이터를 직접 언급 → 개인화된 대화

#### 5.3 Connection 단계 - 통찰 제공

```
┌─────────────────────────────────────┐
│  🤖 SAYU:                            │
│  "복잡한 마음이 진정되는 느낌,       │
│   그게 바로 예술이 주는 치유예요.    │
│                                     │
│   오늘 당신이 선택한 연한 파랑 감정과│
│   이 작품이 만나 새로운 평온을       │
│   만들어냈네요.                      │
│                                     │
│   이 순간을 기억하고 싶으신가요?"    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  [네, 기록할게요] [더 알아보고 싶어요]│
│                                     │
└─────────────────────────────────────┘
```

### Step 6: 🆕 정보 레이어 시스템

#### 6.1 데이터 구조

```typescript
interface InformationLayers {
  // Layer 1: 기본 정보 (항상 표시)
  basic: {
    title: string;
    artist: string;
    year: string;
    movement: string;
  };

  // Layer 2: 작가 스토리 (MVP)
  artistStory: {
    title: string;
    content: string;
    funFact: string;
  };

  // Layer 3-4: Phase 2
  historicalContext?: {...};
  technique?: {...};
}
```

#### 6.2 UI (아코디언 방식)

```
┌─────────────────────────────────────┐
│  📚 작품 더 알아보기                 │
├─────────────────────────────────────┤
│                                     │
│  ✅ 기본 정보                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  제목: 수련                          │
│  작가: 클로드 모네                   │
│  연도: 1916년                        │
│  사조: 인상주의                      │
│                                     │
│  - - - - - - - - - - - - - - - -  │
│                                     │
│  📖 [작가 스토리] ▼                  │
│  모네의 지베르니 정원                │
│  "모네는 말년에 자신의 정원에        │
│   연못을 만들고..."                  │
│                                     │
│  💡 재미있는 사실:                   │
│  "모네는 시력을 잃어가면서도          │
│   수련 시리즈를 그렸습니다"          │
│                                     │
│  - - - - - - - - - - - - - - - -  │
│                                     │
│  [메모 작성하러 가기]                │
│                                     │
└─────────────────────────────────────┘
```

### Step 7-8: 메모 작성 + 타일 색칠 (기존 유지)

**확장된 보상:**
```
획득 보상:
✨ +50 포인트 (기본)
💬 +30 포인트 (AI 대화 참여)    ← 신규
🖐️ +20 포인트 (상호작용)       ← 신규
📝 +10 포인트 (메모 작성)
━━━━━━━━━━━━━━━━━━━━━━━━━━
총 +110 포인트!
```

---

## 4. Backend 구현 가이드 (우선)

### 4.1 새 데이터베이스 테이블

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 파일: backend/src/migrations/004_artwork_interactions.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. 상호작용 저장 테이블
CREATE TABLE artwork_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL,

  -- 상호작용 데이터
  visual_touches JSONB, -- [{ area: "pond", count: 3 }, ...]
  color_selections TEXT[], -- ['blue', 'pink']
  feeling_tags TEXT[], -- ['peaceful', 'calm']

  -- Phase 2 확장
  composition_tags TEXT[],
  subject_selections TEXT[],

  -- 메타
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON artwork_interactions(user_id);
CREATE INDEX idx_interactions_artwork ON artwork_interactions(artwork_id);

-- 2. 대화 기록 테이블
CREATE TABLE counselor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES mood_atlas_entries(id) ON DELETE CASCADE,
  stage VARCHAR(20) NOT NULL, -- 'opening', 'exploration', 'connection'

  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_counselor_entry ON counselor_messages(entry_id);

-- 3. mood_atlas_entries 테이블 확장
ALTER TABLE mood_atlas_entries
  ADD COLUMN interaction_id UUID REFERENCES artwork_interactions(id),
  ADD COLUMN counselor_insights TEXT[], -- AI 대화에서 나온 통찰
  ADD COLUMN info_layers_viewed TEXT[]; -- ['basic', 'artist', 'history']
```

### 4.2 새 API 엔드포인트

#### 4.2.1 상호작용 저장 API

```javascript
// 파일: backend/src/routes/moodAtlasRoutes.js

router.post('/interactions', authenticateUser, async (req, res) => {
  try {
    const { artworkId, visualTouches, colorSelections, feelingTags } = req.body;
    const userId = req.user.id;

    // 1. 상호작용 저장
    const { data: interaction, error } = await supabase
      .from('artwork_interactions')
      .insert({
        user_id: userId,
        artwork_id: artworkId,
        visual_touches: visualTouches,
        color_selections: colorSelections,
        feeling_tags: feelingTags
      })
      .select()
      .single();

    if (error) throw error;

    // 2. 분석 요약 생성
    const summary = {
      totalTouches: visualTouches.reduce((sum, t) => sum + t.count, 0),
      dominantArea: visualTouches.sort((a, b) => b.count - a.count)[0]?.area,
      dominantColors: colorSelections,
      dominantFeelings: feelingTags
    };

    res.json({
      interactionId: interaction.id,
      summary
    });
  } catch (error) {
    console.error('Save interaction error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 4.2.2 통합 대화 API

```javascript
// 파일: backend/src/controllers/moodAtlasController.js

async function counselorMessage(req, res) {
  try {
    const { entryId, artworkId, stage, message, emotionColor, interactions } = req.body;
    const userId = req.user.id;

    // 1. Mood Atlas 엔트리 조회
    const { data: entry } = await supabase
      .from('mood_atlas_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    // 2. 작품 정보 가져오기
    const { data: artwork } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    // 3. Groq AI 프롬프트 생성
    const systemPrompt = buildCounselorPrompt(stage, {
      artwork,
      emotionColor: entry.emotion_color,
      emotionIntensity: entry.emotion_intensity,
      interactions,
      userMessage: message
    });

    // 4. Groq API 호출
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    // 5. 대화 기록 저장
    await supabase.from('counselor_messages').insert({
      entry_id: entryId,
      stage,
      user_message: message,
      ai_response: aiResponse
    });

    // 6. 다음 단계 결정
    const nextStage = determineNextStage(stage, message, aiResponse);

    // 7. 통찰 추출 (Connection 단계)
    let insights = [];
    if (stage === 'connection') {
      insights = await extractInsights(aiResponse);
    }

    res.json({
      reply: aiResponse,
      nextStage,
      suggestions: generateSuggestions(stage, artwork),
      insights
    });
  } catch (error) {
    console.error('Counselor message error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Groq 프롬프트 생성 함수
function buildCounselorPrompt(stage, context) {
  const { artwork, emotionColor, emotionIntensity, interactions, userMessage } = context;

  const basePrompt = `당신은 SAYU의 공감적인 예술 상담자입니다.
사용자와 예술 작품을 통해 감정을 탐색하고 연결을 돕습니다.

현재 작품: ${artwork.title} - ${artwork.artist} (${artwork.year})
사용자 감정: ${emotionColor} (${emotionIntensity}%)

사용자의 상호작용:
${interactions ? `
- 가장 많이 터치한 영역: ${interactions.visualTouches?.[0]?.area}
- 선택한 색상: ${interactions.colorSelections?.join(', ')}
- 느낀 감정: ${interactions.feelingTags?.join(', ')}
` : '(아직 없음)'}

대화 단계: ${stage}`;

  const stagePrompts = {
    opening: `
[Opening 단계]
사용자의 첫 반응을 부드럽게 탐색하세요.
사용자가 터치한 영역과 선택한 색상을 언급하며 자연스럽게 대화를 시작하세요.
질문은 1-2개로 제한하고, 공감적이고 따뜻한 톤을 유지하세요.`,

    exploration: `
[Exploration 단계]
사용자의 감정을 더 깊이 탐색하세요.
"왜 그렇게 느꼈을까요?" 같은 질문보다는 자연스러운 공감과 확장을 시도하세요.`,

    connection: `
[Connection 단계]
작품, 감정, 사용자의 삶을 연결하세요.
의미 있는 통찰을 1-2문장으로 제공하고, 이 순간을 기억하도록 격려하세요.`
  };

  return basePrompt + '\n\n' + stagePrompts[stage];
}

// 통찰 추출 함수
async function extractInsights(aiResponse) {
  // AI 응답에서 핵심 통찰 추출
  // 예: "복잡한 마음이 진정되는 느낌", "예술이 주는 치유"
  const insights = [];

  // 간단한 패턴 매칭 또는 별도 Groq 호출로 추출
  const sentences = aiResponse.split(/[.!?]/).filter(s => s.trim().length > 10);

  // 감정 관련 문장 필터링
  const emotionKeywords = ['느낌', '감정', '마음', '치유', '평온', '연결'];
  sentences.forEach(sentence => {
    if (emotionKeywords.some(kw => sentence.includes(kw))) {
      insights.push(sentence.trim());
    }
  });

  return insights.slice(0, 3); // 최대 3개
}

module.exports = { counselorMessage };
```

#### 4.2.3 정보 레이어 API

```javascript
// 파일: backend/src/controllers/moodAtlasController.js

async function getArtworkInfo(req, res) {
  try {
    const { id } = req.params;

    // 1. 기본 작품 정보
    const { data: artwork } = await supabase
      .from('mood_atlas_artworks')
      .select('*')
      .eq('id', id)
      .single();

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // 2. AI로 작가 스토리 생성
    const artistStoryPrompt = `다음 작품에 대한 작가 스토리를 3-4문장으로 작성해주세요:

작품: ${artwork.title}
작가: ${artwork.artist}
연도: ${artwork.year}

작가의 삶, 작품을 그린 배경, 특별한 일화를 포함해주세요.
마지막에 "재미있는 사실(Fun Fact)"도 1문장 추가해주세요.

형식:
스토리: [3-4문장]
재미있는 사실: [1문장]`;

    const storyCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: artistStoryPrompt }],
      temperature: 0.6,
      max_tokens: 300
    });

    const storyText = storyCompletion.choices[0].message.content;
    const [storyPart, funFactPart] = storyText.split('재미있는 사실:');

    const artistStory = {
      title: `${artwork.artist}의 이야기`,
      content: storyPart.replace('스토리:', '').trim(),
      funFact: funFactPart?.trim() || ''
    };

    // 3. 응답 구성
    res.json({
      basic: {
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        movement: artwork.art_movement
      },
      artistStory

      // Phase 2에 추가:
      // historicalContext: await generateHistoricalContext(artwork),
      // technique: await generateTechnique(artwork)
    });
  } catch (error) {
    console.error('Get artwork info error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

#### 4.2.4 통합 저널 저장 (확장)

```javascript
// 파일: backend/src/controllers/moodAtlasController.js

async function createEntry(req, res) {
  try {
    const {
      emotion_color,
      emotion_intensity,
      selected_artwork_id,
      user_memo,

      // 신규 필드
      interaction_id,
      counselor_insights,
      info_layers_viewed
    } = req.body;

    const userId = req.user.id;

    // 1. 현재 진행 상황 확인
    const { data: progress } = await supabase
      .from('mood_atlas_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 2. 엔트리 저장
    const { data: entry, error } = await supabase
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
        region: progress.current_region,
        tile_number: progress.total_tiles_filled + 1,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    // 3. 보상 계산 (확장)
    const rewards = {
      base: 50,
      interaction: interaction_id ? 20 : 0,
      counselor: counselor_insights?.length > 0 ? 30 : 0,
      memo: user_memo ? 10 : 0,
      info_exploration: (info_layers_viewed?.length || 1) > 1 ? 10 : 0
    };

    const totalPoints = Object.values(rewards).reduce((sum, p) => sum + p, 0);

    // 4. 포인트 지급
    await gamificationService.awardPoints(userId, 'MOOD_ATLAS_ENTRY', totalPoints);

    // 5. 진행 상황 업데이트
    await moodAtlasService.updateProgress(userId, entry);

    res.json({
      entry,
      rewards: {
        points: totalPoints,
        breakdown: rewards
      },
      nextTile: {
        region: progress.current_region,
        number: progress.total_tiles_filled + 1
      }
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### 4.3 라우트 등록

```javascript
// 파일: backend/src/routes/moodAtlasRoutes.js

const express = require('express');
const router = express.Router();
const moodAtlasController = require('../controllers/moodAtlasController');
const { authenticateUser } = require('../middleware/auth');

// ━━━━ 기존 API (유지) ━━━━
router.post('/recommend', authenticateUser, moodAtlasController.getRecommendations);
router.post('/entry', authenticateUser, moodAtlasController.createEntry);
router.get('/progress', authenticateUser, moodAtlasController.getProgress);
router.get('/map', authenticateUser, moodAtlasController.getMapData);

// ━━━━ 신규 API ━━━━
router.post('/interactions', authenticateUser, moodAtlasController.saveInteraction);
router.post('/counselor/message', authenticateUser, moodAtlasController.counselorMessage);
router.get('/artwork-info/:id', authenticateUser, moodAtlasController.getArtworkInfo);

module.exports = router;
```

### 4.4 서버 등록 확인

```javascript
// 파일: backend/src/server.js

// 357번째 줄 근처에 이미 등록되어 있음 (확인)
app.use('/api/mood-atlas', moodAtlasRoutes);
```

---

## 5. Frontend 구현 가이드

### 5.1 페이지 구조

```
frontend/app/mood-atlas/
├── page.tsx                        # ✅ 기존 (메인 지도)
├── record/                         # 🆕 통합 플로우
│   ├── page.tsx                    # 시작 화면
│   ├── emotion/page.tsx            # Step 1-2: 감정 선택
│   ├── recommend/page.tsx          # Step 3: AI 추천
│   ├── interact/
│   │   └── [artworkId]/page.tsx    # 🆕 Step 4: 상호작용
│   ├── explore/
│   │   └── [artworkId]/page.tsx    # 🆕 Step 5-6: 대화+정보
│   ├── journal/page.tsx            # Step 7: 메모 작성
│   └── complete/page.tsx           # Step 8: 완료 + 보상
├── history/page.tsx                # ✅ 기존
└── artwork/[id]/page.tsx           # ✅ 기존
```

### 5.2 핵심 컴포넌트

```
frontend/components/mood-atlas/
├── interaction/                    # 🆕 상호작용 컴포넌트
│   ├── ArtworkTouchCanvas.tsx      # 터치 가능한 캔버스
│   ├── ColorPalettePicker.tsx      # 색상 선택
│   ├── FeelingTagSelector.tsx      # 느낌 태그
│   └── InteractionSummary.tsx      # 요약 표시
│
├── counselor/                      # 🆕 대화 컴포넌트 (Art Counselor 재활용)
│   ├── CounselorChat.tsx           # 기존 재사용
│   ├── OpeningStage.tsx            # 기존 재사용
│   └── ConnectionStage.tsx         # 기존 재사용
│
└── info/                           # 🆕 정보 레이어
    ├── InformationLayers.tsx       # 레이어 컨테이너
    ├── BasicInfo.tsx               # Layer 1
    └── ArtistStory.tsx             # Layer 2
```

### 5.3 상태 관리 (Zustand)

```typescript
// 파일: frontend/lib/mood-atlas/recordStore.ts

import { create } from 'zustand';

interface MoodAtlasRecordStore {
  // Step 1-2: 감정 선택
  emotionColor: string | null;
  emotionIntensity: number;

  // Step 3: AI 추천
  recommendations: Artwork[];

  // Step 4: 상호작용
  currentArtworkId: string | null;
  interactions: {
    visualTouches: { area: string; count: number }[];
    colorSelections: string[];
    feelingTags: string[];
  };
  interactionId: string | null;

  // Step 5: 대화
  counselorStage: 'opening' | 'exploration' | 'connection' | 'complete';
  counselorMessages: ConversationMessage[];
  counselorInsights: string[];

  // Step 6: 정보 레이어
  viewedLayers: string[];

  // Step 7: 저널
  userMemo: string;

  // Actions
  setEmotion: (color: string, intensity: number) => void;
  setRecommendations: (artworks: Artwork[]) => void;
  selectArtwork: (id: string) => void;
  recordTouch: (area: string) => void;
  selectColor: (color: string) => void;
  selectTag: (tag: string) => void;
  setInteractionId: (id: string) => void;
  setCounselorStage: (stage: string) => void;
  addCounselorMessage: (message: ConversationMessage) => void;
  addInsight: (insight: string) => void;
  viewLayer: (layer: string) => void;
  setMemo: (memo: string) => void;
  reset: () => void;
}

export const useMoodAtlasRecord = create<MoodAtlasRecordStore>((set) => ({
  // Initial state
  emotionColor: null,
  emotionIntensity: 50,
  recommendations: [],
  currentArtworkId: null,
  interactions: {
    visualTouches: [],
    colorSelections: [],
    feelingTags: []
  },
  interactionId: null,
  counselorStage: 'opening',
  counselorMessages: [],
  counselorInsights: [],
  viewedLayers: ['basic'],
  userMemo: '',

  // Actions
  setEmotion: (color, intensity) =>
    set({ emotionColor: color, emotionIntensity: intensity }),

  setRecommendations: (artworks) =>
    set({ recommendations: artworks }),

  selectArtwork: (id) =>
    set({ currentArtworkId: id }),

  recordTouch: (area) => set((state) => {
    const existingTouch = state.interactions.visualTouches.find(t => t.area === area);

    if (existingTouch) {
      return {
        interactions: {
          ...state.interactions,
          visualTouches: state.interactions.visualTouches.map(t =>
            t.area === area ? { ...t, count: t.count + 1 } : t
          )
        }
      };
    } else {
      return {
        interactions: {
          ...state.interactions,
          visualTouches: [...state.interactions.visualTouches, { area, count: 1 }]
        }
      };
    }
  }),

  selectColor: (color) => set((state) => ({
    interactions: {
      ...state.interactions,
      colorSelections: state.interactions.colorSelections.includes(color)
        ? state.interactions.colorSelections
        : [...state.interactions.colorSelections, color]
    }
  })),

  selectTag: (tag) => set((state) => ({
    interactions: {
      ...state.interactions,
      feelingTags: state.interactions.feelingTags.includes(tag)
        ? state.interactions.feelingTags.filter(t => t !== tag)
        : [...state.interactions.feelingTags, tag]
    }
  })),

  setInteractionId: (id) => set({ interactionId: id }),

  setCounselorStage: (stage) => set({ counselorStage: stage as any }),

  addCounselorMessage: (message) => set((state) => ({
    counselorMessages: [...state.counselorMessages, message]
  })),

  addInsight: (insight) => set((state) => ({
    counselorInsights: [...state.counselorInsights, insight]
  })),

  viewLayer: (layer) => set((state) => ({
    viewedLayers: [...new Set([...state.viewedLayers, layer])]
  })),

  setMemo: (memo) => set({ userMemo: memo }),

  reset: () => set({
    emotionColor: null,
    emotionIntensity: 50,
    recommendations: [],
    currentArtworkId: null,
    interactions: { visualTouches: [], colorSelections: [], feelingTags: [] },
    interactionId: null,
    counselorStage: 'opening',
    counselorMessages: [],
    counselorInsights: [],
    viewedLayers: ['basic'],
    userMemo: ''
  })
}));
```

### 5.4 핵심 컴포넌트 예시

#### 5.4.1 ArtworkTouchCanvas

```typescript
// 파일: frontend/components/mood-atlas/interaction/ArtworkTouchCanvas.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMoodAtlasRecord } from '@/lib/mood-atlas/recordStore';

interface TouchArea {
  name: string;
  label: string;
  polygon: { x: number; y: number }[];
}

// 작품별 터치 영역 정의 (간소화)
const TOUCH_AREAS: Record<string, TouchArea[]> = {
  'monet-water-lilies-1916': [
    { name: 'pond', label: '연못', polygon: [{ x: 0, y: 300 }, { x: 800, y: 300 }, { x: 800, y: 600 }, { x: 0, y: 600 }] },
    { name: 'water-lilies', label: '수련', polygon: [{ x: 200, y: 350 }, { x: 600, y: 350 }, { x: 600, y: 500 }, { x: 200, y: 500 }] },
    { name: 'sky-reflection', label: '하늘 반영', polygon: [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 300 }, { x: 0, y: 300 }] }
  ]
  // 다른 작품도 추가...
};

export function ArtworkTouchCanvas({ artworkId, imageUrl }: { artworkId: string; imageUrl: string }) {
  const { interactions, recordTouch } = useMoodAtlasRecord();
  const touchAreas = TOUCH_AREAS[artworkId] || [];

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 간단한 영역 감지 (실제로는 polygon 체크)
    const clickedArea = touchAreas.find(area => {
      // 간소화: 첫 영역만 체크
      return y >= area.polygon[0].y && y <= area.polygon[2].y;
    });

    if (clickedArea) {
      recordTouch(clickedArea.name);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative cursor-pointer"
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt="작품"
          width={800}
          height={600}
          className="w-full h-auto rounded-lg"
        />
        <div className="absolute inset-0 hover:bg-white/5 transition-colors" />
      </div>

      {/* 터치 횟수 표시 */}
      {interactions.visualTouches.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">✨ 터치된 영역:</p>
          {interactions.visualTouches.map(({ area, count }) => {
            const areaInfo = touchAreas.find(a => a.name === area);
            return (
              <div key={area} className="flex items-center gap-2 text-sm">
                <span>• {areaInfo?.label || area}</span>
                <div className="flex gap-0.5">
                  {Array(count).fill(0).map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

#### 5.4.2 InformationLayers

```typescript
// 파일: frontend/components/mood-atlas/info/InformationLayers.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMoodAtlasRecord } from '@/lib/mood-atlas/recordStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ArtworkInfo {
  basic: {
    title: string;
    artist: string;
    year: string;
    movement: string;
  };
  artistStory: {
    title: string;
    content: string;
    funFact: string;
  };
}

export function InformationLayers({ artworkId }: { artworkId: string }) {
  const { viewLayer, viewedLayers } = useMoodAtlasRecord();
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);

  const { data, isLoading } = useQuery<ArtworkInfo>({
    queryKey: ['artwork-info', artworkId],
    queryFn: async () => {
      const res = await fetch(`/api/mood-atlas/artwork-info/${artworkId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const handleLayerExpand = (layer: string) => {
    if (!viewedLayers.includes(layer)) {
      viewLayer(layer);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Layer 1: 기본 정보 (항상 표시) */}
      <div className="p-4 bg-white rounded-lg border">
        <h3 className="font-semibold mb-2">✅ 기본 정보</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">제목:</span> {data.basic.title}</p>
          <p><span className="font-medium">작가:</span> {data.basic.artist}</p>
          <p><span className="font-medium">연도:</span> {data.basic.year}</p>
          <p><span className="font-medium">사조:</span> {data.basic.movement}</p>
        </div>
      </div>

      {/* Layer 2: 작가 스토리 (아코디언) */}
      <Accordion
        type="multiple"
        value={expandedLayers}
        onValueChange={(value) => {
          setExpandedLayers(value);
          value.forEach(handleLayerExpand);
        }}
      >
        <AccordionItem value="artist">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              📖 작가 스토리
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <h4 className="font-medium">{data.artistStory.title}</h4>
              <p className="text-sm leading-relaxed text-gray-700">
                {data.artistStory.content}
              </p>
              {data.artistStory.funFact && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">💡 재미있는 사실:</span><br />
                    {data.artistStory.funFact}
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

---

## 6. 구현 타임라인

### Phase 1: MVP (2주 - 10일)

#### Week 1: Backend 기초 + 상호작용

| Day | 작업 | 상세 |
|-----|------|------|
| 1 | DB 마이그레이션 | `004_artwork_interactions.sql` 생성 및 실행 |
| 2 | 상호작용 API | `POST /interactions` 구현 |
| 3 | 대화 API (기초) | `POST /counselor/message` (Opening, Connection만) |
| 4 | 정보 레이어 API | `GET /artwork-info/:id` (basic + artistStory만) |
| 5 | 통합 테스트 | Postman으로 API 전체 테스트 |

#### Week 2: Frontend + 통합

| Day | 작업 | 상세 |
|-----|------|------|
| 6 | 상호작용 컴포넌트 | ArtworkTouchCanvas, ColorPicker, FeelingTags |
| 7 | 상호작용 페이지 | `/record/interact/[artworkId]` 완성 |
| 8 | 대화 + 정보 통합 | 기존 Art Counselor 재사용 + InformationLayers |
| 9 | 전체 플로우 연결 | 감정→추천→상호작용→대화→정보→메모→완료 |
| 10 | QA & 배포 | 전체 E2E 테스트, Staging 배포 |

### Phase 2: 고급 기능 (2주)

#### Week 3: 확장 기능

| Day | 작업 |
|-----|------|
| 11-12 | 고급 상호작용 (구도, 인물 선택) |
| 13-14 | Full 대화 시스템 (Exploration 단계 추가) |
| 15 | 정보 레이어 확장 (역사, 기법) |

#### Week 4: 캐릭터 시스템 (선택)

| Day | 작업 |
|-----|------|
| 16-18 | 캐릭터 생성 시스템 |
| 19 | 캐릭터 프로필 & 컬렉션 |
| 20 | 최종 QA & Production 배포 |

---

## 7. 즉시 시작 가이드

### 7.1 Backend 시작 (Day 1)

```powershell
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: DB 마이그레이션 파일 생성
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd C:\Users\SAMSUNG\Documents\GitHub\SAYU\backend\src\migrations

# 파일 생성
New-Item -ItemType File -Name "004_artwork_interactions.sql"

# VS Code로 열기
code 004_artwork_interactions.sql

# 내용 붙여넣기 (위 4.1 섹션 참조)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: 마이그레이션 실행
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Supabase Dashboard에서 SQL Editor 열기
# 또는 psql 사용:
psql $env:DATABASE_URL -f backend/src/migrations/004_artwork_interactions.sql

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: 컨트롤러 함수 추가
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd ..\controllers

# moodAtlasController.js 파일 열기
code moodAtlasController.js

# 다음 함수들 추가 (위 4.2 섹션 참조):
# - saveInteraction
# - counselorMessage
# - getArtworkInfo

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: 라우트 추가
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd ..\routes
code moodAtlasRoutes.js

# 다음 라우트 추가:
# router.post('/interactions', ...)
# router.post('/counselor/message', ...)
# router.get('/artwork-info/:id', ...)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: 서버 시작 & 테스트
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd ..\..
npm run dev

# Postman으로 테스트:
# POST http://localhost:5000/api/mood-atlas/interactions
# Body: {
#   "artworkId": "monet-water-lilies-1916",
#   "visualTouches": [{ "area": "pond", "count": 3 }],
#   "colorSelections": ["blue", "pink"],
#   "feelingTags": ["peaceful", "calm"]
# }
```

### 7.2 Frontend 시작 (Day 6)

```powershell
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: 폴더 구조 생성
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd C:\Users\SAMSUNG\Documents\GitHub\SAYU\frontend

# 컴포넌트 폴더
New-Item -ItemType Directory -Path "components/mood-atlas/interaction"
New-Item -ItemType Directory -Path "components/mood-atlas/info"

# 페이지 폴더
New-Item -ItemType Directory -Path "app/mood-atlas/record/interact/[artworkId]"
New-Item -ItemType Directory -Path "app/mood-atlas/record/explore/[artworkId]"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: Zustand store 생성
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New-Item -ItemType File -Path "lib/mood-atlas/recordStore.ts"
code lib/mood-atlas/recordStore.ts
# 위 5.3 섹션 내용 붙여넣기

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: 컴포넌트 생성
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New-Item -ItemType File -Path "components/mood-atlas/interaction/ArtworkTouchCanvas.tsx"
New-Item -ItemType File -Path "components/mood-atlas/interaction/ColorPalettePicker.tsx"
New-Item -ItemType File -Path "components/mood-atlas/info/InformationLayers.tsx"

# 각 파일 편집
code components/mood-atlas/interaction/ArtworkTouchCanvas.tsx
# 위 5.4.1 섹션 내용 붙여넣기

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: 페이지 생성
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New-Item -ItemType File -Path "app/mood-atlas/record/interact/[artworkId]/page.tsx"

# 기본 구조:
code app/mood-atlas/record/interact/[artworkId]/page.tsx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: 개발 서버 시작
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npm run dev

# 브라우저에서 확인:
# http://localhost:3000/mood-atlas/record/interact/monet-water-lilies-1916
```

### 7.3 체크리스트

#### Backend (Day 1-5)

- [ ] DB 테이블 생성 (`artwork_interactions`, `counselor_messages`)
- [ ] `mood_atlas_entries` 테이블 확장 (3개 컬럼 추가)
- [ ] `POST /interactions` API 구현
- [ ] `POST /counselor/message` API 구현
- [ ] `GET /artwork-info/:id` API 구현
- [ ] `POST /entry` API 확장 (보상 계산)
- [ ] Postman 테스트 완료
- [ ] Groq API 연동 확인

#### Frontend (Day 6-10)

- [ ] `recordStore.ts` 생성 (Zustand)
- [ ] `ArtworkTouchCanvas.tsx` 구현
- [ ] `ColorPalettePicker.tsx` 구현
- [ ] `FeelingTagSelector.tsx` 구현
- [ ] `InformationLayers.tsx` 구현
- [ ] `/record/interact/[artworkId]` 페이지
- [ ] `/record/explore/[artworkId]` 페이지 (대화+정보)
- [ ] 전체 플로우 E2E 테스트
- [ ] 모바일 반응형 확인
- [ ] Staging 배포

---

## 8. 성공 지표

### 8.1 정량적 지표

| 지표 | 현재 | 목표 | 증가율 |
|------|------|------|--------|
| 평균 세션 시간 | 5분 | 15분 | 200% |
| 작품 상호작용률 | 0% | 80% | 신규 |
| AI 대화 참여율 | 0% | 60% | 신규 |
| 메모 작성률 | 40% | 70% | 75% |
| D7 Retention | 35% | 55% | 57% |
| D30 Retention | 15% | 30% | 100% |

### 8.2 정성적 지표

**사용자 피드백 예상:**
- "작품과 더 깊이 연결된 느낌"
- "단순 감상이 아닌 대화하는 느낌"
- "AI가 나를 이해하는 것 같아"
- "정보가 부담스럽지 않고 자연스러워"

---

## 9. 참고 문서

### 기존 문서
- `docs/mood-atlas-concept.md` - Mood Atlas 전체 컨셉
- `docs/mood-atlas-user-journey.md` - 사용자 여정 시뮬레이션
- `docs/mood-atlas-implementation-progress.md` - 현재 진행 상황
- `docs/SAYU_ART_COUNSELOR_COMPREHENSIVE_DOCUMENTATION.md` - Art Counselor 문서
- `docs/mood-atlas-character-system.md` - 캐릭터 시스템 (Phase 2)

### Backend 코드
- `backend/src/routes/moodAtlasRoutes.js` - 기존 API 라우트
- `backend/src/controllers/moodAtlasController.js` - 기존 컨트롤러
- `backend/src/services/moodAtlasService.js` - 기존 서비스
- `backend/MOOD_ATLAS_API.md` - 기존 API 문서

### Frontend 코드
- `frontend/components/art-counselor-hybrid/` - Art Counselor 컴포넌트 (재사용)
- `frontend/lib/mood-atlas/store.ts` - 기존 Mood Atlas store

---

## 10. FAQ

### Q1: Art Counselor 기능이 중복되지 않나요?

A: Art Counselor는 **별도 독립 서비스**로 유지되며, Mood Atlas는 그 대화 시스템을 **흡수**하여 일일 플로우에 통합합니다.

```
Art Counselor (독립):
- 언제든 원하는 작품으로 심도 깊은 대화
- Full 4단계 (Opening → Exploration → Connection → Complete)
- 세션 단위 관리

Mood Atlas (통합):
- 일일 감정 기록 플로우의 일부
- 간소화된 2-3단계 (Opening → Connection)
- 엔트리 단위 관리
```

### Q2: 왜 정보를 나중에 제공하나요?

A: **Art-First 철학** + **사후적 보상 효과**

1. 먼저 감정적으로 연결 (터치, 대화)
2. 감정을 정리한 후
3. 정보 제공 → "아, 그래서 내가 이렇게 느꼈구나" 깨달음

학습 모드가 아닌 **자연스러운 탐색**을 지향합니다.

### Q3: MVP와 Full 버전의 차이는?

**MVP (Phase 1 - 2주):**
- 기본 상호작용 (터치 + 색상)
- 간소화 대화 (Opening → Connection)
- 기본 정보 (작가 스토리만)

**Full (Phase 2 - +2주):**
- 고급 상호작용 (구도, 인물)
- Full 대화 (Exploration 추가)
- 전체 정보 레이어 (역사, 기법)
- 캐릭터 생성 시스템

### Q4: 기존 사용자는 어떻게 되나요?

기존 Mood Atlas 데이터는 **100% 유지**됩니다.
- 기존 엔트리: 그대로 유지
- 기존 진행: 이어서 진행
- 신규 기능: 선택적 참여

---

## 11. 마무리

### 11.1 핵심 요약

```
SAYU Daily Art Journey
"능동적 참여 → 감정 탐색 → 지식 성장"

✅ Mood Atlas 기반 유지
✅ Art Counselor 대화 시스템 흡수
✅ 새로운 상호작용 레이어 추가
✅ 점진적 정보 제공 시스템

→ 수동적 감상에서 능동적 탐험으로!
```

### 11.2 다음 단계

**즉시 시작:**
1. Backend DB 마이그레이션 (Day 1)
2. API 구현 (Day 2-4)
3. Frontend 컴포넌트 (Day 6-7)
4. 통합 테스트 (Day 9-10)

**2주 후:**
- MVP 완성 🎉
- 사용자 피드백 수집
- Phase 2 계획 수립

---

**문서 버전:** 1.0
**최종 수정:** 2025-01-09
**상태:** Ready for Implementation (Backend First)

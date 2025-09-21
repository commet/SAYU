# SAYU Art Counselor Service - Complete Implementation Guide

> *"예술이 먼저 말을 걸고, 감정은 자연스럽게 따라온다"*

## 📌 Service Vision & Philosophy

### Core Identity
SAYU Art Counselor는 **미술관 도슨트 친구**입니다. 상담사가 아닙니다.
- 매일 아름다운 예술 작품을 소개하는 것이 주 목적
- 사용자가 자신만의 예술 감상 일기를 만들어가는 플랫폼
- 치료나 상담이 아닌, 예술을 통한 자연스러운 성장과 치유

### The Three Pillars
1. **Art First**: 모든 대화는 예술 작품에서 시작
2. **Personal Journal**: 나만의 예술 감상 기록이 쌓이는 곳
3. **Natural Connection**: 강요 없이 원하는 만큼만 깊어지는 대화

---

## 🎨 Core User Experience Flow

### Daily Art Journey
```
아침 알림 → 오늘의 작품 → 감상하기 → 기록 남기기 → 내 컬렉션
```

### 1. Morning Notification
```json
{
  "time": "09:00",
  "message": "🎨 모네의 '수련'이 도착했어요",
  "preview": "물 위에 비친 하늘의 비밀"
}
```

### 2. Art Presentation Page
```typescript
interface DailyArtwork {
  // Visual First
  hero: {
    image: "high_resolution_artwork.jpg",
    zoomableAreas: ["signature", "technique_detail", "hidden_elements"],
    initialView: "full"
  },

  // Progressive Information Layers
  introduction: {
    teaser: "1906년 여름, 모네의 정원 연못에서 일어난 일",
    funFact: "하루에 같은 연못을 14번 그렸다는데...",
    duration: "3분 읽기"
  },

  infoCards: [
    {
      type: "story",
      title: "작품 탄생 스토리",
      content: "백내장을 앓던 모네가 본 세상",
      emoji: "🎨"
    },
    {
      type: "technique",
      title: "숨겨진 기법",
      content: "물 표현에 7가지 파란색을 사용",
      emoji: "🖌️"
    },
    {
      type: "influence",
      title: "영향과 유산",
      content: "추상표현주의의 시작점",
      emoji: "🌊"
    },
    {
      type: "personal",
      title: "작가의 편지",
      content: "클레망소에게 '나는 수련과 하나가 되었다'",
      emoji: "💌"
    }
  ]
}
```

### 3. Engagement Options
```typescript
interface EngagementMenu {
  primaryActions: [
    "💭 나의 감상 기록하기",     // Main CTA
    "💬 AI 도슨트와 대화하기",   // Optional
    "👥 다른 감상 엿보기"        // Community
  ],

  secondaryActions: [
    "🔍 디테일 탐험",
    "🎵 BGM과 함께 감상",
    "📚 관련 작품 더보기"
  ]
}
```

---

## 📖 Personal Art Journal System

### Core Concept
**"모든 감상은 정답이다"** - 전문적 비평부터 단순한 느낌까지 모두 가치있는 기록

### Journal Entry Structure
```typescript
interface JournalEntry {
  // 필수 (자동 생성)
  metadata: {
    date: Date,
    artwork: ArtworkReference,
    weather: string,        // API 연동
    timeOfDay: string,      // 아침/점심/저녁
    sessionNumber: number   // n번째 감상
  },

  // 사용자 입력 (모두 선택적)
  userContent: {
    // Quick Reactions (원클릭)
    mood: ["평온", "설렘", "그리움", "영감"],
    colors: ["가장 끌린 색"],

    // Free Text (자유 작성)
    firstImpression?: string,      // "첫 느낌"
    personalConnection?: string,   // "나의 경험과 연결"
    newDiscovery?: string,        // "새로 발견한 것"
    questionToArtist?: string,    // "작가에게 묻고 싶은 것"

    // Visual Notes (선택적)
    sketchNote?: Drawing,         // 간단한 스케치
    photoConnection?: Photo,      // 연관 사진
    colorPalette?: ColorSelection // 선택한 색상표
  },

  // AI 생성 (자동)
  aiEnrichment: {
    emotionalTone: EmotionVector,     // 감정 분석
    writingStyle: StyleAnalysis,      // 작성 스타일
    growthIndicator: GrowthMetric,    // 성장 지표
    suggestedNext: Artwork[]          // 추천 작품
  }
}
```

### Memory Building Features

#### 1. My Art Collection
```typescript
interface MyCollection {
  allTimeGallery: {
    total: number,
    favorites: Artwork[],
    themes: Map<string, Artwork[]>,
    emotions: Map<Emotion, Artwork[]>
  },

  monthlyGallery: {
    currentMonth: Artwork[],
    moodBoard: VisualMoodBoard,
    topDiscovery: Artwork,
    growthHighlight: string
  },

  specialCollections: {
    "비 오는 날 컬렉션": Artwork[],
    "월요일 활력 컬렉션": Artwork[],
    "나를 위로한 작품들": Artwork[]
  }
}
```

#### 2. Growth Visualization
```typescript
interface GrowthJourney {
  emotionalEvolution: {
    start: ["어두운 톤 선호"],
    current: ["밝은 색채 수용"],
    trajectory: "healing" | "exploring" | "deepening"
  },

  artistDiscovery: {
    firstLove: "모네",
    currentExploring: ["피카소", "호크니"],
    readyFor: "현대 미술"
  },

  writingEvolution: {
    early: "단답형",
    current: "서사적",
    uniqueVoice: "시적이고 섬세한"
  }
}
```

#### 3. Pattern Recognition
```typescript
interface UserPatterns {
  timePatterns: {
    mostActiveTime: "저녁 9시",
    averageSessionLength: "15분",
    consistencyScore: 0.8
  },

  preferencePatterns: {
    colorPreference: ["파란색 계열", "따뜻한 톤"],
    stylePreference: ["인상주의", "추상표현주의"],
    themePreference: ["자연", "도시 풍경"]
  },

  emotionalPatterns: {
    mondayMood: "need_energy",
    rainyDayChoice: "cozy_indoor",
    stressResponse: "seek_nature"
  }
}
```

---

## 💬 Conversation Design System

### Principle: Art Info → Personal Connection

#### Stage 1: Pure Art Information (Always First)
```typescript
AI: "모네가 이 수련 연작을 그릴 때, 매일 같은 시간에 정원에 나갔대요.
     빛의 변화를 포착하기 위해서죠.
     특히 이 작품은 오후 4시의 빛이에요. 보라색 그림자가 보이시나요?"

User: "아, 정말 보라색이 있네요!"
```

#### Stage 2: Gentle Invitation (Optional)
```typescript
AI: "많은 분들이 이 보라색 그림자에서 하루의 끝을 느낀다고 하더라구요.
     혹시 어떤 시간대가 느껴지시나요?"

User: "저녁 느낌... 퇴근할 때 같아요"
```

#### Stage 3: Personal Connection (User-Led)
```typescript
AI: "퇴근길의 하늘 색이군요. 모네도 '하루의 피로가 색으로 변한다'고
     일기에 썼어요. 오늘 퇴근길은 어떤 색이었나요?"

User: "오늘은 좀 회색빛이었어요. 힘든 하루였거든요."
```

#### Stage 4: Natural Support (When Needed)
```typescript
AI: "회색도 모네가 사랑한 색이에요. '모든 색의 어머니'라고 불렀죠.
     내일 이 시간엔 좀 더 밝은 색이 되길 바라요.
     오늘의 감상을 기록해두시면, 나중에 다시 보며 미소 지을 수 있을 거예요."
```

### Conversation Depth Control
```typescript
class ConversationManager {
  // 사용자가 원하는 깊이 자동 감지
  detectDesiredDepth(userResponse: string): DepthLevel {
    if (hasEmotionalKeywords(userResponse)) return 'deep';
    if (hasQuestions(userResponse)) return 'curious';
    if (isShortResponse(userResponse)) return 'light';
    return 'moderate';
  }

  // 깊이별 응답 전략
  responseStrategy = {
    light: "더 많은 작품 정보 제공",
    curious: "배경 지식과 맥락 설명",
    moderate: "개인적 연결점 탐색",
    deep: "감정적 공감과 지지"
  }

  // 자연스러운 대화 종료
  naturalExit = {
    light: "오늘 작품 재미있으셨나요? 내일은 피카소예요!",
    moderate: "감상 기록해두시면 좋은 추억이 될 거예요.",
    deep: "오늘 나눈 이야기 감사해요. 당신의 기록은 소중해요."
  }
}
```

---

## 🧠 Memory & Personalization Engine

### RAG-Based Continuity System
```typescript
interface MemoryEngine {
  // 즉각 기억 (현재 세션)
  immediateContext: Message[],

  // 에피소드 기억 (관련 과거 대화)
  episodicMemory: {
    similarArtworks: Conversation[],
    similarEmotions: Conversation[],
    sameTimeOfDay: Conversation[],
    specialMoments: Conversation[]  // 브레이크스루 순간
  },

  // 장기 패턴 (성장 추적)
  longTermPatterns: {
    emotionalJourney: EmotionTimeline,
    artisticGrowth: StyleEvolution,
    personalThemes: RecurringThemes
  },

  // 예측 모델 (다음 추천)
  predictiveModel: {
    nextArtwork: Artwork[],
    optimalTime: TimeOfDay,
    engagementProbability: number
  }
}
```

### Continuity Examples
```typescript
// 일주일 후
AI: "지난주 모네의 수련에서 '퇴근길 회색'을 말씀하셨죠.
     오늘은 어떤가요? 호크니의 수영장은 확실히 밝은 색이네요!"

// 한 달 후
AI: "한 달 전보다 밝은 작품들을 더 오래 보시네요.
     당신의 컬렉션이 봄처럼 밝아지고 있어요."

// 특별한 날
AI: "작년 오늘도 이 작품을 보셨네요!
     그때는 '외로워 보인다'고 하셨는데, 지금은 어떠신가요?"
```

---

## 🎯 Engagement & Retention Strategy

### Intrinsic Motivation Model
```typescript
interface MotivationDrivers {
  curiosity: {
    daily: "오늘은 어떤 작품일까?",
    progressive: "다음 수준의 작품 해금",
    discovery: "숨겨진 디테일 발견"
  },

  ownership: {
    myCollection: "내가 만든 미술관",
    myVoice: "나만의 감상 스타일",
    myGrowth: "변화하는 나의 시선"
  },

  connection: {
    withArt: "작품과의 개인적 관계",
    withArtists: "작가와의 정신적 교감",
    withOthers: "비슷한 감성의 사람들"
  }
}
```

### Habit Formation
```typescript
interface HabitLoop {
  trigger: {
    time: "매일 같은 시간 알림",
    context: "커피와 함께하는 아침 루틴",
    emotion: "하루의 시작/마무리 의식"
  },

  action: {
    minimal: "작품 보기 (30초)",
    engaged: "감상 기록 (2분)",
    deep: "AI와 대화 (10분)"
  },

  reward: {
    immediate: "아름다운 작품 감상",
    accumulated: "나의 컬렉션 성장",
    unexpected: "새로운 발견과 통찰"
  }
}
```

---

## 🛠️ Technical Implementation

### Database Schema
```sql
-- Core Tables
CREATE TABLE art_journals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  artwork_id UUID REFERENCES artworks(id),

  -- User Content
  first_impression TEXT,
  personal_connection TEXT,
  new_discovery TEXT,
  question_to_artist TEXT,

  -- Quick Reactions
  mood_tags TEXT[],
  color_selections TEXT[],

  -- Metadata
  created_at TIMESTAMP,
  weather_data JSONB,
  time_of_day VARCHAR,
  session_number INTEGER,

  -- AI Enrichment
  emotion_vector vector(768),
  writing_style JSONB,
  growth_indicators JSONB
);

CREATE TABLE user_art_journeys (
  user_id UUID PRIMARY KEY,
  total_artworks INTEGER,
  favorite_artists TEXT[],
  emotional_evolution JSONB,
  preference_patterns JSONB,
  special_moments JSONB[],
  next_recommendations UUID[]
);

CREATE TABLE conversation_memories (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  message_type VARCHAR,
  content TEXT,
  content_embedding vector(768),
  emotion_detected JSONB,
  artwork_context UUID,
  memory_importance FLOAT,
  created_at TIMESTAMP
);
```

### API Endpoints
```typescript
// Daily Art Delivery
GET /api/art-counselor/daily
Response: {
  artwork: Artwork,
  presentation: Presentation,
  userHistory: PreviousEncounter[]
}

// Journal Management
POST /api/art-counselor/journal
Body: {
  artworkId: string,
  entry: JournalEntry
}

GET /api/art-counselor/my-collection
Response: {
  total: number,
  galleries: Gallery[],
  patterns: UserPatterns,
  growth: GrowthMetrics
}

// Conversation
POST /api/art-counselor/chat
Body: {
  message: string,
  context: ConversationContext
}
Response: {
  reply: string,
  suggestions: string[],
  relatedArtworks: Artwork[]
}

// Memory & Continuity
GET /api/art-counselor/memories/:artworkId
Response: {
  previousEncounters: Memory[],
  relatedConversations: Conversation[],
  emotionalJourney: Timeline
}
```

### Frontend Components
```typescript
// Main Components Structure
/app/art-counselor/
  ├── page.tsx                     // Daily artwork presentation
  ├── components/
  │   ├── ArtworkHero.tsx         // Full-screen artwork display
  │   ├── InfoCards.tsx           // Progressive information reveal
  │   ├── JournalEntry.tsx        // Personal recording interface
  │   ├── QuickReactions.tsx      // One-click mood/color selection
  │   ├── AIConversation.tsx      // Chat interface
  │   ├── MyCollection.tsx        // Personal gallery view
  │   ├── GrowthVisualization.tsx // Progress charts
  │   └── MemoryLane.tsx          // Past conversations
  ├── hooks/
  │   ├── useArtworkPresentation.ts
  │   ├── useJournalSync.ts
  │   └── useMemoryEngine.ts
  └── utils/
      ├── emotionAnalysis.ts
      ├── patternRecognition.ts
      └── recommendationEngine.ts
```

---

## 📊 Success Metrics

### User Engagement
```typescript
interface SuccessMetrics {
  engagement: {
    dailyActiveUsers: number,
    avgSessionTime: "15 minutes",
    journalEntryRate: "70% write something",
    returnRate: "D1: 80%, D7: 60%, D30: 40%"
  },

  growth: {
    avgJournalEntries: "5 per week",
    vocabularyExpansion: "20% richer over 3 months",
    emotionalRange: "30% broader over 6 months",
    artistDiscovery: "3 new favorites per month"
  },

  satisfaction: {
    nps: 70,
    reviews: "4.7/5",
    testimonials: "This is my daily meditation",
    shareRate: "30% share artworks"
  }
}
```

### Quality Indicators
- **Journal Depth**: From "pretty" → "This reminds me of..." (3 months)
- **Emotional Articulation**: Single words → Sentences → Paragraphs
- **Art Vocabulary**: Basic → Intermediate → Sophisticated
- **Personal Voice**: Mimicking → Finding → Owning

---

## 🌟 Unique Value Propositions

### For Users
1. **"내가 만드는 미술관"** - 나만의 감상이 쌓여 만든 개인 미술관
2. **"부담 없는 일상 예술"** - 상담이 아닌 예술 감상
3. **"성장하는 나의 시선"** - 시간에 따라 변화하는 나를 발견
4. **"언제나 기억하는 친구"** - 모든 대화를 기억하는 AI 도슨트

### Differentiation
- **Not Therapy**: 미술관 가는 기분으로 가볍게
- **Not Education**: 시험 없는 즐거운 배움
- **Not Social Media**: 나를 위한 진짜 기록
- **Not Meditation App**: 능동적 참여와 창조

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Daily artwork presentation system
- Basic journal entry functionality
- Simple AI conversation

### Phase 2: Memory (Week 3-4)
- RAG implementation
- Pattern recognition
- Continuity features

### Phase 3: Personalization (Week 5-6)
- SAYU type integration
- Preference learning
- Smart recommendations

### Phase 4: Polish (Week 7-8)
- Visual refinements
- Performance optimization
- User testing

---

## 📝 Final Notes

### Remember
- **Art speaks first**: Every interaction starts with beauty
- **User dignity**: All responses are valid and valuable
- **Natural flow**: No forced emotional disclosure
- **Personal ownership**: Users own their journey

### Avoid
- Starting with "How are you feeling?"
- Pushing for emotional disclosure
- Clinical or therapeutic language
- Judgment of any response

### Celebrate
- Simple appreciations ("I like the blue")
- Growing vocabulary
- Returning users
- Personal breakthroughs

---

*This document is the north star for SAYU Art Counselor implementation. Every feature, every conversation, every pixel should honor the core principle: Art enriches life naturally, and every person's perspective is a masterpiece.*
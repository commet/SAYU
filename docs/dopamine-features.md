# SAYU 도파민 기능 마스터 플랜

> **작성일:** 2025-01-07
> **목적:** 사용자 리텐션과 참여도를 높이는 도파민 기능들의 통합 계획서

---

## 📊 현재 시스템 현황 분석

### ✅ 기존 구현된 기능들

#### 1. Gamification 시스템 (운영 중)
- **레벨 시스템**: 1-100레벨, 5단계 (첫 발걸음 → 예술혼)
- **포인트 활동**: 전시 방문, 리뷰 작성, 소셜 활동 등
- **칭호 시스템**: 7개 칭호 (얼리버드, 야행성 올빼미, 현대미술 마니아 등)
- **도전 과제**: 목표 기반 보상 시스템
- **리더보드**: 주간/월간 순위
- **전시 세션 추적**: 관람 시간, 위치 기록

**데이터베이스:**
```sql
- user_gamification: 레벨, 포인트, 스트릭
- activity_logs: 모든 활동 기록
- titles: 칭호 정의
- user_titles: 획득 칭호
- challenges: 도전 과제
- exhibition_sessions: 전시 세션
- leaderboard_weekly/monthly: 리더보드
```

**주요 포인트 활동:**
| 활동 | 기본 포인트 | 일일 제한 |
|------|------------|-----------|
| 전시 시작 | 10 | - |
| 전시 완료 | 50 | - |
| 리뷰 작성 | 30 | - |
| 사진 업로드 | 20 | - |
| 일일 체크인 | 20 | 1회 |
| 주간 스트릭 | 100 | - |

#### 2. Art Counselor (운영 중)
- **AI 기반 1:1 예술 감상 세션**
- Groq LLaMA 3.3 70B 활용
- 4단계 대화 흐름: 열기 → 탐색 → 자기연결 → 완료
- 안전 시스템 (safety disclaimer, consent 관리)
- 세션 이력 및 인사이트 제공

**구현 상태:**
- Backend API: ✅ 완료
- Frontend UI: ✅ 완료 (art-counselor-hybrid 컴포넌트)
- DB 스키마: ✅ 완료

---

## 🎯 신규 도파민 기능 제안

### 우선순위 매트릭스

```
        높은 임팩트
            ↑
   [1]무드 스트릭 | [2]아트 가챠
            |
   ─────────┼─────────→
            |        낮은 복잡도
[4]전시 매칭 | [3]유저 Counseling
            |
```

---

## 1️⃣ 무드 스트릭 (Mood Streak)

### 📝 개념
매일 감정을 기록하고 AI가 추천하는 작품을 감상하며 연속 기록을 쌓는 기능

### 🎨 핵심 기능

#### 1.1 감정 선택 인터페이스
```typescript
interface EmotionEntry {
  id: string;
  userId: string;

  // 감정 데이터
  emotionPrimary: string;      // "차분한"
  emotionSecondary: string;    // "설레는"
  emotionIntensity: number;    // 1-10

  // AI 추천 (Groq)
  recommendedArtworks: {
    artworkId: string;
    title: string;
    artist: string;
    reason: string;           // "불안하지만 아름다운 밤하늘..."
    expectedFeeling: string;  // "외롭지만 위로받는"
  }[];

  selectedArtworkId: string;
  journalEntry?: string;       // 일기 (선택)

  createdAt: Date;
  dayNumber: number;           // 연속 일수
}
```

**12가지 복합 감정 팔레트:**
1. 차분한 + 설레는 (🌅 #87CEEB)
2. 불안한 + 희망찬 (🌤️ #FFD700)
3. 우울한 + 아름다운 (🌙 #9370DB)
4. 외로운 + 평화로운
5. 흥분된 + 두려운
6. 지친 + 감사한
7. 혼란스러운 + 호기심 가득한
8. 슬픈 + 고요한
9. 화난 + 단호한
10. 무력한 + 수용적인
11. 기쁜 + 취약한
12. 그리운 + 따뜻한

#### 1.2 스트릭 시스템
```typescript
interface MoodStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  lastEntryDate: Date;

  // 감정 패턴 분석
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  preferredArtStyles: string[];
}
```

**보상 체계:**
| 스트릭 | 보상 | 특전 |
|--------|------|------|
| 3일 | 50 포인트 | - |
| 7일 | 200 포인트 + 뱃지 | "일주일 성찰" |
| 14일 | 500 포인트 | - |
| 30일 | 1000 포인트 + 뱃지 | "감정 탐험가" |
| 100일 | 3000 포인트 + 특별 뱃지 | "무드 마스터" |

#### 1.3 감정 성장 나무 (Gamification)
- 3D 나무 비주얼 (React Three Fiber 또는 Lottie)
- 스트릭에 따라 성장 (7일마다 단계 상승)
- 30일: 꽃 피우기
- 100일: 열매 맺기

#### 1.4 감정 캘린더
- Recharts 히트맵
- 클릭하면 해당 날짜의 감정 + 선택한 작품 + 일기 보기
- 월별 감정 통계 시각화

### 🗄️ DB 스키마
```sql
CREATE TABLE mood_streak_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),

  emotion_primary TEXT NOT NULL,
  emotion_secondary TEXT,
  emotion_intensity INT CHECK (emotion_intensity >= 1 AND emotion_intensity <= 10),

  recommended_artworks JSONB,
  selected_artwork_id TEXT,
  journal_entry TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  day_number INT,

  UNIQUE(user_id, DATE(created_at))
);

CREATE TABLE mood_streak_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_entries INT DEFAULT 0,
  last_entry_date DATE,
  badges_earned JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emotion_patterns (
  user_id UUID REFERENCES users(id),
  month DATE,
  emotion_distribution JSONB,
  dominant_emotion TEXT,
  preferred_art_styles JSONB,
  PRIMARY KEY (user_id, month)
);
```

### 🔌 기존 시스템 통합
- `activity_logs`에 `MOOD_STREAK_ENTRY` 활동 추가 (50 포인트)
- 기존 `weekly_streak`와 별도로 `mood_streak` 관리
- Groq API 활용하여 AI 작품 추천

---

## 2️⃣ 아트 가챠 (Art Gacha)

### 📝 개념
매일 1회 무료 가챠로 명작 카드 수집, 도감 완성 시 보상

### 🎴 가챠 메커니즘

#### 2.1 카드 등급 시스템
```typescript
interface GachaCard {
  id: string;
  artistName: string;
  artworkTitle: string;
  year: string;

  // 등급 (확률)
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarityScore: number;        // 1-100
  rarityReason: string;       // "세계에서 가장 사랑받는..."
  funFact: string;            // 흥미로운 설명

  // APT 연관성
  bestForTypes: string[];     // ['LAEF', 'SAEF']
  styleTag: string[];         // ['몽환적', '추상적']

  imageUrl: string;
  thumbnailUrl: string;
  collectorValue: number;     // 코인 환산가
}
```

**확률 분포:**
- Common (60%): 일반 명작
- Rare (25%): 유명 작가
- Epic (12%): 거장 대표작
- Legendary (3%): 세계 3대 명작급

**예시 데이터:**
- **Legendary (98점)**: 반 고흐 - 별이 빛나는 밤
- **Epic (85점)**: 클림트 - 키스
- **Rare (70점)**: 모네 - 수련
- **Common (50점)**: 세잔 - 사과 정물

#### 2.2 컬렉션 보상
```typescript
interface CollectionReward {
  milestone: number;
  reward: {
    type: 'coin' | 'badge' | 'ticket' | 'feature';
    value: any;
  };
  title: string;
  description: string;
}
```

**마일스톤:**
| 개수 | 보상 | 칭호 |
|------|------|------|
| 10 | 뱃지 | 초보 컬렉터 |
| 50 | 5000 코인 | 교양인 |
| 100 | 전시 무료 입장권 | 감식안 |
| 200 | 무제한 재시도 해금 | 큐레이터 |
| 500 | 특별 뱃지 | 마스터 컬렉터 |

**카테고리 컬렉션:**
- 인상주의 거장 (모네, 르누아르, 드가) → "인상주의 전문가"
- 천재 미치광이 (고흐, 뭉크, 달리) → "광기의 이해자"
- 추상의 선구자 (칸딘스키, 몬드리안, 말레비치) → "추상 마스터"

#### 2.3 APT 유형별 가중치
```typescript
function calculateGachaWeights(userAPT: string, baseRarity: number) {
  const aptPreferences = {
    'LAEF': { tags: ['몽환적', '추상적', '감성적'], boost: 30 },
    'SRMC': { tags: ['사실적', '구조적', '정교한'], boost: 30 },
    // ... 16가지
  };

  if (artworkTags.some(tag => aptPreferences[userAPT].tags.includes(tag))) {
    return baseRarity * (1 + aptPreferences[userAPT].boost / 100);
  }
  return baseRarity;
}
```

### 🗄️ DB 스키마
```sql
CREATE TABLE gacha_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id TEXT UNIQUE NOT NULL,
  artist_name TEXT NOT NULL,
  artwork_title TEXT NOT NULL,
  year TEXT,

  rarity VARCHAR(20) NOT NULL,
  rarity_score INT,
  rarity_reason TEXT,
  fun_fact TEXT,

  best_for_types TEXT[],
  style_tags TEXT[],

  image_url TEXT,
  thumbnail_url TEXT,
  collector_value INT
);

CREATE TABLE user_gacha_collection (
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES gacha_cards(id),
  obtained_at TIMESTAMP DEFAULT NOW(),
  duplicate_count INT DEFAULT 1,
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE gacha_daily_attempts (
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  attempts INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

### 🔌 기존 시스템 통합
- 일일 가챠 획득: 30 포인트
- 새 카드 획득: 50 포인트 (+ 등급별 보너스)
- 컬렉션 마일스톤 달성 시 `titles` 칭호 부여

---

## 3️⃣ 사용자 간 Counseling (P2P Art Confession)

### 📝 개념
예술을 매개로 익명 감정 나눔 (기존 Art Counselor와는 다른 P2P 기능)

### 💬 기능 구조

#### 3.1 고민 작성 (Confession)
```typescript
interface ArtConfession {
  id: string;
  userId: string;              // 익명화
  artworkId: string;
  artworkImage: string;

  // 공개 정보
  aptType: string;             // 'LAEF'
  aptAnimal: string;           // '여우'
  gender?: 'male' | 'female' | 'any';

  // 감정 기록
  emotion: string;             // "불안하지만 기대되는"
  confession: string;          // "요즘 새로운 시작이 두렵습니다..."

  // 상태
  isPublic: boolean;
  status: 'open' | 'matched' | 'responded' | 'closed';

  // 매칭 선호도
  preferredListener: 'same_gender' | 'opposite_gender' | 'any';
  preferredAPT?: string[];

  createdAt: Date;
}
```

#### 3.2 응답 (Response)
```typescript
interface ConfessionResponse {
  confessionId: string;
  listenerId: string;          // 익명화
  listenerAPT: string;
  listenerAnimal: string;

  response: string;
  empathyScore: number;        // AI가 자동 계산 (1-100)

  // 작성자 피드백
  authorLike: boolean;
  authorReply?: string;

  createdAt: Date;
}
```

### 🛡️ 안전 장치

#### AI 필터링 (Groq)
```typescript
async function moderateContent(text: string): Promise<{
  isSafe: boolean;
  reason?: string;
  suggestions?: string;
}> {
  const prompt = `
  다음 텍스트가 예술 감상 커뮤니티에 적합한지 판단:
  - 폭력적/성적 내용
  - 개인정보
  - 만남 유도 멘트

  텍스트: "${text}"
  `;

  const result = await groqService.chat(prompt);
  return JSON.parse(result);
}
```

#### 신고 시스템
- 3회 신고 누적 → 자동 숨김 + 관리자 검토
- 신고 카테고리: inappropriate, spam, harassment, personal_info

#### 매칭 제한
- 일일 응답 한도: 3개
- 쿨다운: 1시간
- 최소 레벨: 5 (어뷰징 방지)

### 🎁 보상 시스템
| 활동 | 포인트 |
|------|--------|
| 고민 작성 | 50 |
| 공유하기 선택 | 100 |
| 응답 작성 | 200 |
| "도움됐어요" 받기 | 300 |
| 공감도 80+ | 500 |

**뱃지:**
- "공감 마스터": 100회 응답, 평균 공감도 85+
- "지혜의 수호자": 50회 "도움됐어요"
- "용기있는 고백자": 10회 고민 공유

### 🗄️ DB 스키마
```sql
CREATE TABLE art_confessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  artwork_id TEXT NOT NULL,
  artwork_image TEXT,

  apt_type VARCHAR(10),
  apt_animal VARCHAR(20),
  gender VARCHAR(10),

  emotion TEXT NOT NULL,
  confession TEXT NOT NULL,

  is_public BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'open',

  preferred_listener VARCHAR(20),
  preferred_apt TEXT[],

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE confession_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confession_id UUID REFERENCES art_confessions(id),
  listener_id UUID REFERENCES users(id),
  listener_apt VARCHAR(10),
  listener_animal VARCHAR(20),

  response TEXT NOT NULL,
  empathy_score INT,

  author_like BOOLEAN DEFAULT false,
  author_reply TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE confession_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confession_id UUID REFERENCES art_confessions(id),
  reporter_id UUID REFERENCES users(id),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔌 기존 시스템 통합
- `activity_logs`에 새 활동 타입 추가
- 기존 safety 시스템 활용
- Groq API로 공감도 자동 계산

---

## 4️⃣ 전시 관심 기반 매칭 (Exhibition Buddy)

### 📝 개념
전시 가기 전에 동행자 찾기 (사전 계획 매칭)

### 🔄 기능 흐름

#### 4.1 관심 등록
```typescript
interface ExhibitionInterest {
  exhibitionId: string;
  userId: string;
  aptType: string;

  // 방문 계획
  preferredDate: Date[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';

  // 매칭 선호도
  groupSize: 2 | 3 | 4;
  genderPreference: 'same' | 'opposite' | 'any';
  ageRange?: [number, number];

  shortIntro: string;          // "20대 직장인, 인상주의 좋아해요"

  status: 'waiting' | 'matched' | 'met' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}
```

#### 4.2 매칭 알고리즘
```typescript
function matchExhibitionBuddies(interest: ExhibitionInterest) {
  const candidates = findCandidates({
    exhibitionId: interest.exhibitionId,
    overlappingDates: interest.preferredDate,
    genderMatch: interest.genderPreference,
    status: 'waiting'
  });

  const scored = candidates.map(c => ({
    ...c,
    compatibilityScore: calculateAPTCompatibility(interest.aptType, c.aptType),
    dateOverlap: calculateDateOverlap(interest.preferredDate, c.preferredDate)
  }));

  // 호환성 70% + 일정 겹침 30%
  scored.sort((a, b) =>
    (b.compatibilityScore * 0.7 + b.dateOverlap * 0.3) -
    (a.compatibilityScore * 0.7 + a.dateOverlap * 0.3)
  );

  return scored.slice(0, 5);
}
```

#### 4.3 호환성 등급
| 점수 | 등급 | 아이콘 |
|------|------|--------|
| 90+ | Platinum | 💎 |
| 80-89 | Gold | 🏆 |
| 70-79 | Silver | 🥈 |
| 60-69 | Bronze | 🥉 |

#### 4.4 만남 인증
```typescript
interface MeetingVerification {
  meetingId: string;
  participants: string[];
  verifiedBy: string[];        // 모두가 확인해야 함

  reward: {
    coins: 1000;
    badge: '아트 동행자';
    experience: 500;
  };

  ratings: Record<string, number>;  // 1-5점
  feedback?: string;
}
```

### 🎁 보상 시스템
| 활동 | 보상 |
|------|------|
| 만남 성사 (양쪽 인증) | 1000 코인 + 500 경험치 + 뱃지 |
| 5회 만남 달성 | "소셜 컬렉터" 뱃지 + 그룹 매칭 해금 |

### 🗄️ DB 스키마
```sql
CREATE TABLE exhibition_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  apt_type VARCHAR(10),

  preferred_dates JSONB,
  preferred_time VARCHAR(20),

  group_size INT,
  gender_preference VARCHAR(20),
  age_range INT[],

  short_intro TEXT,

  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE exhibition_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID NOT NULL,
  participants UUID[],

  confirmed_date TIMESTAMP,
  confirmed_time VARCHAR(20),
  meeting_point TEXT,

  status VARCHAR(20) DEFAULT 'proposed',
  confirmations JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meeting_verifications (
  meeting_id UUID PRIMARY KEY REFERENCES exhibition_meetings(id),
  verified_by UUID[],
  ratings JSONB,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔌 기존 시스템 통합
- 기존 `exhibition_sessions` 활용
- `activity_logs`에 매칭 활동 추가
- APT 호환성 계산 로직 재사용

---

## 🚀 구현 우선순위 제안

### Phase 1: Quick Wins (1-2주)
**목표:** 즉시 사용 가능한 기능으로 사용자 참여 유도

1. **무드 스트릭 기본 기능** (우선순위 ⭐⭐⭐⭐⭐)
   - 이유:
     - 기존 gamification 시스템과 쉽게 통합
     - 일일 접속 유도 효과 즉각적
     - Groq API만 연동하면 MVP 가능
   - 공수: 3-4일
   - MVP 범위:
     - 12가지 감정 선택 UI
     - AI 작품 추천 (3개)
     - 일기 입력 (선택)
     - 기본 스트릭 카운팅
     - 보상 지급

2. **아트 가챠 기본 기능** (우선순위 ⭐⭐⭐⭐⭐)
   - 이유:
     - 수집 욕구 자극 → 재방문 유도
     - 데이터만 준비되면 빠른 구현
     - 바이럴 가능성 높음
   - 공수: 3-4일
   - MVP 범위:
     - 100개 카드 데이터 큐레이션
     - 일일 1회 가챠
     - 카드 뒤집기 애니메이션
     - 도감 UI (그리드)
     - 10/50/100개 마일스톤 보상

**Phase 1 예상 결과:**
- 일일 활성 사용자(DAU) 30% 증가
- 평균 세션 시간 2배 증가
- 재방문율 50% 상승

### Phase 2: Community Building (3-4주)
**목표:** 사용자 간 연결 강화

3. **사용자 간 Counseling** (우선순위 ⭐⭐⭐⭐)
   - 이유:
     - SAYU만의 차별화 포인트
     - 커뮤니티 형성 핵심 기능
     - 안전 시스템 구축 필요 (시간 소요)
   - 공수: 5-7일
   - MVP 범위:
     - 고민 작성/공유
     - 응답 작성
     - AI 공감도 계산
     - 기본 신고 시스템
     - 보상 지급

### Phase 3: Social Features (4-6주)
**목표:** 오프라인 연결 촉진

4. **전시 관심 기반 매칭** (우선순위 ⭐⭐⭐)
   - 이유:
     - 오프라인 가치 창출
     - 구현 복잡도 높음
     - 사용자 안전 이슈 고려 필요
   - 공수: 7-10일
   - MVP 범위:
     - 관심 등록
     - 매칭 알고리즘
     - 약속 확정
     - 만남 인증
     - 평가 시스템

---

## 📋 즉시 시작 가능한 작업

### Option A: 무드 스트릭 DB 마이그레이션
```bash
# 1. 마이그레이션 파일 생성
cd backend/src/migrations
touch create_mood_streak_tables.sql

# 2. 스키마 작성 (위 SQL 참조)
# 3. 마이그레이션 실행
psql $DATABASE_URL -f create_mood_streak_tables.sql

# 4. 감정 팔레트 데이터 준비
cd backend/src/data
touch emotions.js
```

**예상 소요 시간:** 30분

### Option B: 아트 가챠 카드 데이터 큐레이션
```bash
# 1. Artvee 데이터에서 100-500개 작품 선정
cd backend/src/data
touch gachaCards.js

# 2. 각 작품에 메타데이터 추가:
# - 등급 (common/rare/epic/legendary)
# - 등급 이유 (1-2문장)
# - 재미있는 사실 (1-2문장)
# - APT 유형 매칭
# - 스타일 태그
```

**예상 소요 시간:** 2-3시간

### Option C: 무드 스트릭 풀스택 구현 (1주 스프린트)
**Day 1-2: Backend**
- DB 마이그레이션
- API 라우트 (`POST /mood-streak/entry`, `GET /mood-streak/stats`)
- Groq 연동 (작품 추천)
- 스트릭 계산 로직
- 보상 지급

**Day 3-4: Frontend**
- 감정 선택 UI
- AI 추천 작품 표시
- 일기 입력
- 스트릭 카운터 위젯

**Day 5: 테스트 & 배포**
- E2E 테스트
- 버그 수정
- Production 배포

---

## 🔗 기존 시스템과의 통합 포인트

### Gamification Service 확장
```javascript
// gamificationService.js 확장
getPointValues() {
  return {
    ...existing,

    // 무드 스트릭
    MOOD_STREAK_ENTRY: 50,
    MOOD_STREAK_3_DAYS: 50,
    MOOD_STREAK_7_DAYS: 200,
    MOOD_STREAK_30_DAYS: 1000,

    // 아트 가챠
    GACHA_DAILY: 30,
    GACHA_NEW_CARD: 50,
    GACHA_RARE_CARD: 100,
    GACHA_EPIC_CARD: 200,
    GACHA_LEGENDARY_CARD: 500,

    // P2P Counseling
    CONFESSION_WRITE: 50,
    CONFESSION_SHARE: 100,
    CONFESSION_RESPONSE: 200,
    CONFESSION_HELPFUL: 300,

    // 전시 매칭
    EXHIBITION_BUDDY_MATCH: 500,
    EXHIBITION_BUDDY_MET: 1000
  };
}
```

### 새 칭호 추가
```sql
INSERT INTO titles (id, name, name_ko, description_ko, icon, rarity) VALUES
-- 무드 스트릭
('mood-explorer', 'Mood Explorer', '감정 탐험가', '30일 연속 감정 기록', '🎭', 'rare'),
('mood-master', 'Mood Master', '무드 마스터', '100일 연속 감정 기록', '🌟', 'legendary'),

-- 아트 가챠
('collector', 'Collector', '컬렉터', '100개 작품 수집', '🎨', 'epic'),
('master-collector', 'Master Collector', '마스터 컬렉터', '500개 작품 수집', '👑', 'legendary'),

-- P2P Counseling
('empathy-master', 'Empathy Master', '공감 마스터', '100회 응답, 평균 공감도 85+', '💝', 'epic'),
('wisdom-keeper', 'Wisdom Keeper', '지혜의 수호자', '50회 "도움됐어요"', '🦉', 'rare'),

-- 전시 매칭
('art-companion', 'Art Companion', '아트 동행자', '첫 전시 동행', '🤝', 'common'),
('social-collector', 'Social Collector', '소셜 컬렉터', '5회 전시 동행', '👥', 'epic');
```

---

## 📊 성공 지표 (KPI)

### 무드 스트릭
- DAU (Daily Active Users)
- 연속 접속일 평균
- 일기 작성률
- 감정 → 작품 → 전시 방문 전환율

### 아트 가챠
- 일일 가챠 참여율
- 도감 완성도 평균
- 중복 카드 교환 활용도
- 가챠 → 실제 전시 관심 전환율

### P2P Counseling
- 고민 작성 → 공유 비율
- 평균 응답 시간
- "도움됐어요" 비율
- 신고율 (낮을수록 좋음)

### 전시 매칭
- 매칭 성사율
- 실제 만남 인증율
- 평균 만남 평점
- 재매칭율 (같은 사람과 또 만나는 비율)

---

## 🎯 다음 단계

1. **우선순위 확정**
   - Phase 1 두 기능 중 어느 것을 먼저 시작할지 결정
   - 리소스 할당 (백엔드 vs 프론트엔드)

2. **데이터 준비**
   - 아트 가챠: 작품 데이터 큐레이션 시작
   - 무드 스트릭: Groq 프롬프트 엔지니어링

3. **기술 검증**
   - Groq API 감정 분석 정확도 테스트
   - 가챠 확률 시뮬레이션

4. **디자인 시안**
   - 감정 선택 UI 와이어프레임
   - 가챠 애니메이션 프로토타입

---

## 💡 추가 고려사항

### A/B 테스트 기회
- 감정 팔레트: 12가지 vs 24가지
- 가챠 확률: Legendary 3% vs 5%
- 보상 크기: 현재 vs 2배

### 데이터 수집 계획
- 사용자 감정 패턴 → 개인화 추천 개선
- 가챠 선호도 → APT 유형별 큐레이션
- 매칭 성공률 → 알고리즘 개선

### 수익화 연결점
- 무드 스트릭: 프리미엄 테마
- 아트 가챠: 추가 가챠권 구매
- P2P Counseling: 전문가 상담 연결
- 전시 매칭: 전시 티켓 제휴 수수료

---

**문서 종료**

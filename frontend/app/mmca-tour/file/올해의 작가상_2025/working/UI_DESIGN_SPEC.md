# 올해의 작가상 2025 - UI 설계 문서

## 1. 개요

### 1.1 목표
- MMCA 서울 "올해의 작가상 2025" 전시를 위한 인터랙티브 가이드 앱
- 팀원들의 실시간 감상 활동을 약도 위에 시각화
- APT 유형 기반 개인화 추천 + 현장 감상 기록

### 1.2 전시 정보
- **전시명**: 올해의 작가상 2025 (Korea Artist Prize 2025)
- **위치**: MMCA 서울 B1F (3, 4, 5전시실)
- **기간**: 2024.10.17 ~ 2025.02.16
- **작가**: 김영은, 임영주, 김지평, 언메이크랩 (4팀)
- **컨셉**: 사방치기/땅따먹기 - "경계에서 비가시적인 것을 찾는 자들"

### 1.3 전시실 배치
```
B1F 평면도
┌─────────────────────────────────────────┐
│                                         │
│   ┌───────────┐    ┌─────────────┐     │
│   │     3     │    │   서울박스   │     │
│   │   김영은   │    │             │     │
│   │ Kim YoungEun│   └─────────────┘     │
│   └───────────┘                         │
│                                         │
│   ┌───────────┐                         │
│   │     4     │                         │
│   │   임영주   │                         │
│   │ Im Youngzoo│                        │
│   └───────────┘                         │
│                                         │
│   ┌─────────────────────────┐           │
│   │           5             │← 입구     │
│   │  언메이크랩  │  김지평    │           │
│   │  Unmake Lab │ Kim Jipyeong│          │
│   └─────────────────────────┘           │
│         ↓                               │
│   [아카이브 & 작가 인터뷰]               │
│         ↓                               │
│   [전시마당 → 김영은 작품]               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. 작가별 테마 요약

### 2.1 김영은 (3전시실)
- **테마**: 청취의 정치 (Politics of Listening)
- **키워드**: 소리, 디아스포라, 탈식민화, 소리 민족지학
- **핵심**: "다르게 듣기" - 들리지 않았던 것을 듣게 하고, 들을 수 없던 존재들을 세계로 회귀시키는 작업
- **작품 수**: 10개

### 2.2 임영주 (4전시실)
- **테마**: 믿음의 빈 곳을 채우는 서사
- **키워드**: 미신, 과학, VR, 가묘(假墓), 사후세계
- **핵심**: 과학과 미신 사이의 경계, "불확실성의 확실성", 빈 무덤을 통한 다른 차원 경험
- **대표작**: 고 故 The Late (2023-2025)
- **작품 수**: 10개

### 2.3 김지평 (5전시실 우측)
- **테마**: '없는' 전통으로 다시 쓰는 미술사
- **키워드**: 재야의 미술, 전통, 병풍, 한복, 다성(多聲) 코러스
- **핵심**: 전통을 "비어 있기에 열려 있는 공간"으로 읽고, 주변화된 인물들의 목소리 복원
- **대표작**: 다성 코러스 (2023-2025), 코즈믹 터틀 (2025)
- **작품 수**: 10개

### 2.4 언메이크랩 (5전시실 좌측)
- **테마**: 인간을 비추는 기계의 눈
- **키워드**: AI, 데이터셋-팅, 비미래(Non-Future), 생태위기
- **핵심**: 기술이 만드는 인식 체계를 전복, "예측과 기억, 가상과 실재가 비껴가며 만들어진 결괏값"
- **작품 수**: 10개

---

## 3. UI 설계: 3단계 드릴다운

### 3.1 1단계: B1F 전체 맵 뷰

**목적**: 전시 전체 구조 파악 + 팀원 위치 실시간 확인

```
┌─────────────────────────────────────┐
│ 올해의 작가상 2025           [팀 👥] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐   ┌──────────┐    │
│  │      3      │   │ 서울박스  │    │
│  │   김영은     │   │          │    │
│  │ 👤민지 💡   │   └──────────┘    │
│  │ "청취의 정치"│                   │
│  └─────────────┘                   │
│                                     │
│  ┌─────────────┐                   │
│  │      4      │                   │
│  │   임영주     │                   │
│  │ 👤나        │                   │
│  │ "믿음의 서사"│                   │
│  └─────────────┘                   │
│                                     │
│  ┌───────────────────────┐         │
│  │          5            │← 입구   │
│  │ 언메이크랩 │ 김지평    │         │
│  │           │ 👤수현    │         │
│  │ "비미래"  │ "재야미술" │         │
│  └───────────────────────┘         │
│                                     │
├─────────────────────────────────────┤
│ 🔔 실시간                           │
│ • 민지가 3전시실에서 "경계에서" 💡   │
│ • 2분 전                            │
└─────────────────────────────────────┘
```

**컴포넌트 구조**:
```
ExhibitionMapView/
├── FloorPlan (SVG 기반)
│   ├── GalleryRoom (터치 가능 영역)
│   │   ├── RoomLabel (번호, 작가명)
│   │   ├── TeamMemberAvatars (실시간 위치)
│   │   └── ActivityIndicator (💡 애니메이션)
│   └── NavigationPaths (이동경로 표시)
├── LiveActivityFeed (하단 피드)
└── FloorToggle (1F/B1F 전환 - 필요시)
```

**인터랙션**:
- 전시실 터치 → 2단계 (전시실 상세)로 이동
- 팀원 아바타 터치 → 해당 팀원의 최근 감상 팝업
- 실시간 피드 터치 → 해당 작품으로 이동

---

### 3.2 2단계: 전시실 상세 뷰

**목적**: 전시실 내 작품 배치 파악 + 개별 작품 접근

#### 3전시실 (김영은) 예시
```
┌─────────────────────────────────────┐
│ ← 3전시실                    [지도] │
├─────────────────────────────────────┤
│ 김영은 Kim YoungEun                 │
│ "청취의 정치"                       │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────┐      │
│   │    ●1    ●2    ●3      │      │
│   │                         │      │
│   │  ●4 👤민지              │      │
│   │          💡             │      │
│   │    ●5    ●6    ●7      │      │
│   │                         │      │
│   │    ●8    ●9    ●10     │      │
│   └─────────────────────────┘      │
│              ↑ 입구                 │
│                                     │
├─────────────────────────────────────┤
│ 작품 목록                           │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ ●1  │ │ ●2  │ │ ●3  │ ...       │
│ │작품1 │ │작품2 │ │작품3 │           │
│ │ 💡  │ │     │ │ ❤️  │           │
│ └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────┘
```

#### 5전시실 (언메이크랩 + 김지평) 예시
```
┌─────────────────────────────────────┐
│ ← 5전시실                    [지도] │
├─────────────────────────────────────┤
│                                     │
│ ┌────────────┬────────────┐        │
│ │ 언메이크랩  │  김지평     │← 입구  │
│ │            │            │        │
│ │  ●1  ●2   │  ●1  ●2   │        │
│ │  ●3  ●4   │  ●3  👤   │        │
│ │  ●5       │  ●4  ●5   │        │
│ │           │            │        │
│ └────────────┴────────────┘        │
│         ↓                          │
│   [아카이브 & 인터뷰]               │
│                                     │
├─────────────────────────────────────┤
│ 👤 수현이 김지평 섹션에서 감상 중    │
└─────────────────────────────────────┘
```

**컴포넌트 구조**:
```
GalleryDetailView/
├── Header (작가명, 테마)
├── GalleryLayout (SVG)
│   ├── ArtistSection (작가별 영역 - 5전시실용)
│   ├── ArtworkPin (작품 위치)
│   │   ├── PinMarker (●)
│   │   ├── TeamActivity (팀원 감상 표시)
│   │   └── TouchArea
│   └── EntranceMarker
├── ArtworkList (하단 가로 스크롤)
│   └── ArtworkThumbnail
└── ActivityBanner
```

**인터랙션**:
- 작품 핀(●) 터치 → 3단계 (작품 상세)로 이동
- 하단 썸네일 터치 → 3단계로 이동
- 팀원 표시된 작품은 하이라이트

---

### 3.3 3단계: 작품 상세 뷰

**목적**: 작품 감상 + 팀 감상 공유 + 내 감상 기록

```
┌─────────────────────────────────────┐
│ ← 김영은                     [···] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │                                 ││
│ │        [작품 이미지]            ││
│ │                                 ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ 경계에서 듣기                       │
│ Listening at the Border            │
│ 2024 | 사운드 설치                  │
├─────────────────────────────────────┤
│ 📍 3전시실 입구 좌측                │
├─────────────────────────────────────┤
│ 💭 감상 포인트                      │
│ "이 작품에서 들리는 소리들은        │
│  어디에서 온 것일까요?"             │
├─────────────────────────────────────┤
│ 👥 팀 감상 (2)                      │
│ ┌─────────────────────────────────┐│
│ │ 👤 민지 (LAEF)          2분 전  ││
│ │ 💡 영감을 주는 | 🌌 낯선         ││
│ │ "소리로 역사를 듣는다는 게..."   ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 👤 수현 (SREF)          15분 전 ││
│ │ 🌊 고요해지는                    ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │      [ 내 감상 기록하기 ]       ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**감상 기록 모달**:
```
┌─────────────────────────────────────┐
│ 감상 기록                      [×] │
├─────────────────────────────────────┤
│ 이 작품 어땠어요?                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│ │ 😍  │ │ 😊  │ │ 😐  │ │ 😕  │  │
│ │최고! │ │좋아요│ │보통 │ │별로 │  │
│ └─────┘ └─────┘ └─────┘ └─────┘  │
├─────────────────────────────────────┤
│ 어떤 느낌이었나요? (복수 선택)       │
│ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │🌊고요 │ │⚡에너지│ │💡영감 │ ...   │
│ └──────┘ └──────┘ └──────┘       │
│ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │🏠익숙 │ │🌌낯선 │ │🔮신비 │ ...   │
│ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────┤
│ 한 줄 메모 (선택)                   │
│ ┌─────────────────────────────────┐│
│ │                                 ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │           [ 저장 ]              ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**컴포넌트 구조**:
```
ArtworkDetailView/
├── Header
├── ArtworkImage (확대 가능)
├── ArtworkInfo
│   ├── Title (한/영)
│   ├── Year, Medium
│   └── LocationBadge
├── ViewingTip (APT 맞춤 감상 포인트)
├── TeamImpressions
│   └── ImpressionCard (팀원별)
└── RecordButton → RecordModal
    ├── RatingSelector
    ├── EmotionTagSelector
    ├── MemoInput
    └── SubmitButton
```

---

## 4. 실시간 동기화 설계

### 4.1 기술 스택
- **Supabase Realtime**: postgres_changes 구독
- **Fallback**: 30초 폴링
- **상태관리**: React Context 또는 Zustand

### 4.2 구독 대상 테이블
```sql
-- 감상 기록 변경 감지
mmca_tour_impressions (INSERT, UPDATE)
```

### 4.3 실시간 이벤트 플로우
```
[팀원 A가 감상 기록]
        ↓
[Supabase INSERT 이벤트]
        ↓
[다른 팀원들의 클라이언트에서 수신]
        ↓
[UI 업데이트]
├── 1단계 맵: 해당 전시실에 아바타 이동 + 💡 애니메이션
├── 2단계 전시실: 해당 작품 핀에 표시
└── 실시간 피드: 새 항목 추가
```

### 4.4 구현 코드 스케치
```typescript
// hooks/useTeamRealtime.ts
export function useTeamRealtime(tourId: string) {
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`tour:${tourId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mmca_tour_impressions',
        filter: `tour_id=eq.${tourId}`
      }, (payload) => {
        // 새 감상 기록 처리
        handleNewImpression(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tourId]);

  // Fallback 폴링
  useEffect(() => {
    const interval = setInterval(fetchLatestActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  return { teamActivity };
}
```

---

## 5. 데이터 구조

### 5.1 작품 데이터 스키마
```typescript
interface Artwork {
  id: string;                    // 고유 ID (예: "kye-001")
  exhibitionId: string;          // "korea-artist-prize-2025"
  artistId: string;              // "kim-youngeun"

  // 기본 정보
  title: string;                 // "경계에서 듣기"
  titleEn?: string;              // "Listening at the Border"
  year?: string;                 // "2024"
  medium?: string;               // "사운드 설치"

  // 위치 정보 (핵심!)
  galleryNumber: number;         // 3, 4, 5
  artistSection?: string;        // "unmakelab" | "kimjipyeong" (5전시실용)
  position: {
    x: number;                   // 0-100 (전시실 내 상대 좌표)
    y: number;                   // 0-100
  };
  locationNote?: string;         // "입구 좌측", "중앙"

  // 감상 가이드
  viewingQuestions?: string[];   // APT별 감상 질문

  // 태그 (APT 매칭용)
  styleTags: string[];
  moodTags: string[];
  themeTags: string[];

  // 이미지
  imageUrl?: string;
  thumbnailUrl?: string;
}
```

### 5.2 작가 데이터 스키마
```typescript
interface Artist {
  id: string;                    // "kim-youngeun"
  name: string;                  // "김영은"
  nameEn: string;                // "Kim YoungEun"

  // 전시 정보
  galleryNumber: number;         // 3
  theme: string;                 // "청취의 정치"
  themeEn: string;               // "Politics of Listening"

  // 상세 정보
  biography: string;             // CV에서 추출
  artistStatement?: string;      // 작가 노트
  keywords: string[];            // ["소리", "디아스포라", "탈식민화"]

  // 이미지
  profileImageUrl?: string;
}
```

### 5.3 팀원 위치 상태
```typescript
interface TeamMemberLocation {
  userId: string;
  username: string;
  avatarUrl?: string;
  aptType: string;

  // 현재 위치 (마지막 감상 기록 기준)
  currentLocation: {
    galleryNumber: number;
    artistSection?: string;
    artworkId?: string;
  };

  // 최근 활동
  lastActivity: {
    artworkId: string;
    artworkTitle: string;
    action: 'recorded';
    emotionTags: string[];
    timestamp: string;
  };

  isOnline: boolean;
}
```

---

## 6. 작업 목록 (TODO)

### Phase 1: 데이터 준비 (Codex 작업)
- [ ] 작가별 CV_Critics.txt 파싱 → Artist 데이터 생성
- [ ] 작품 이미지 파일명 ↔ 작품명 매핑
- [ ] 각 작품의 전시실 내 위치 좌표 입력
- [ ] 이미지 파일 → Cloudinary 업로드 (또는 public 폴더)

### Phase 2: SVG 맵 컴포넌트
- [ ] B1F 전체 맵 SVG 제작 (map_01.png 기반)
- [ ] 3전시실 상세 SVG
- [ ] 4전시실 상세 SVG
- [ ] 5전시실 상세 SVG (좌: 언메이크랩, 우: 김지평)
- [ ] 터치 가능 영역 정의
- [ ] 팀원 아바타 오버레이 컴포넌트

### Phase 3: 페이지 구현
- [ ] `/mmca-tour/korea-artist-prize-2025` - 전시 메인 (1단계)
- [ ] `/mmca-tour/korea-artist-prize-2025/gallery/[num]` - 전시실 상세 (2단계)
- [ ] `/mmca-tour/korea-artist-prize-2025/artwork/[id]` - 작품 상세 (3단계)
- [ ] 감상 기록 모달 컴포넌트

### Phase 4: 실시간 동기화
- [ ] `useTeamRealtime` 훅 구현
- [ ] Supabase Realtime 구독 설정
- [ ] 폴링 fallback 구현
- [ ] 팀원 위치 상태 Context

### Phase 5: 통합 및 테스트
- [ ] 기존 `/mmca-tour` 페이지와 연결
- [ ] 모바일 반응형 테스트
- [ ] 실시간 동기화 테스트 (복수 기기)

---

## 7. 파일 구조 (예상)

```
frontend/app/mmca-tour/
├── page.tsx                           # 메인 (전시 목록)
├── korea-artist-prize-2025/
│   ├── page.tsx                       # 1단계: B1F 맵
│   ├── gallery/
│   │   └── [num]/
│   │       └── page.tsx               # 2단계: 전시실 상세
│   └── artwork/
│       └── [id]/
│           └── page.tsx               # 3단계: 작품 상세
├── components/
│   ├── maps/
│   │   ├── B1FFloorMap.tsx            # B1F 전체 맵
│   │   ├── Gallery3Map.tsx            # 3전시실 (김영은)
│   │   ├── Gallery4Map.tsx            # 4전시실 (임영주)
│   │   ├── Gallery5Map.tsx            # 5전시실 (언메이크랩+김지평)
│   │   └── shared/
│   │       ├── ArtworkPin.tsx
│   │       ├── TeamMemberAvatar.tsx
│   │       └── ActivityIndicator.tsx
│   ├── ArtworkCard.tsx
│   ├── ArtworkDetail.tsx
│   ├── TeamImpressionCard.tsx
│   ├── RecordImpressionModal.tsx
│   └── LiveActivityFeed.tsx
├── hooks/
│   ├── useTeamRealtime.ts
│   └── useArtworkData.ts
└── data/
    └── korea-artist-prize-2025/
        ├── artists.ts
        ├── artworks.ts
        └── gallery-layouts.ts
```

---

## 8. 데이터 입력 가이드 (Codex용)

### 8.1 작품 입력 형식
```
작품명: [한글명]
영문명: [영문명] (선택)
작가: [작가명]
전시실: [3/4/5]
섹션: [언메이크랩/김지평] (5전시실만)
위치: [입구 좌측/중앙/우측 벽면 등]
좌표: x=[0-100], y=[0-100]
연도: [2024]
매체: [사운드 설치/영상/회화 등]
이미지: [work_1.jpg 등]
```

### 8.2 좌표 기준
- x: 0 = 왼쪽, 100 = 오른쪽
- y: 0 = 입구쪽, 100 = 안쪽
- 대략적인 위치만 입력해도 됨

### 8.3 예시
```
작품명: 경계에서 듣기
영문명: Listening at the Border
작가: 김영은
전시실: 3
위치: 입구 좌측
좌표: x=20, y=30
연도: 2024
매체: 사운드 설치
이미지: works_1.jpg
```

---

## 9. 참고 자료

### 9.1 파일 위치
- 평면도: `file/올해의 작가상_2025/ui_map_poster_qr/map_01~03.png`
- 전시 설명: `file/올해의 작가상_2025/올해의 작가상_2025_all.txt`
- 작가별 폴더: `file/올해의 작가상_2025/[작가명]/`
  - `[작가명]_profile.jpg`
  - `[작가명]_CV_Critics.txt`
  - `work_1~10.jpg` 또는 `works_1~10.jpg`

### 9.2 감정 태그 프리셋
```typescript
const EMOTION_TAGS = [
  { id: 'calm', label: '고요해지는', emoji: '🌊' },
  { id: 'energetic', label: '에너지가 느껴지는', emoji: '⚡' },
  { id: 'familiar', label: '익숙한', emoji: '🏠' },
  { id: 'unfamiliar', label: '낯선', emoji: '🌌' },
  { id: 'nostalgic', label: '그리운', emoji: '🍂' },
  { id: 'questioning', label: '질문이 생기는', emoji: '❓' },
  { id: 'comforting', label: '위로가 되는', emoji: '🤗' },
  { id: 'challenging', label: '도전받는', emoji: '🔥' },
  { id: 'inspiring', label: '영감을 주는', emoji: '💡' },
  { id: 'mysterious', label: '신비로운', emoji: '🔮' },
  { id: 'joyful', label: '기쁜', emoji: '😊' },
  { id: 'melancholic', label: '쓸쓸한', emoji: '🌙' },
];
```

---

*문서 작성일: 2025-11-22*
*작성자: Claude Code*

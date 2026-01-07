# SAYU 월드컵 기능 - MVP 기획서

## 📋 핵심 컨셉

**"내가 가장 좋아한 작품은 무엇일까?"**
전시 관람 후 마음에 든 작품들로 토너먼트를 진행해 최종 우승작을 선정하고, 그 과정을 SNS에 공유하는 인터랙티브 기능.

---

## 🎯 MVP 핵심 기능 (간소화)

### 필수 기능

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| **사진 업로드** | 전시에서 찍은 사진 직접 업로드 (8~64장) | P0 |
| **텍스트 검색** | 작품명/작가명으로 DB에서 검색 추가 | P0 |
| **토너먼트 진행** | 1:1 매치업, 클릭으로 선택, 자동 진행 | P0 |
| **결과 카드** | 우승작 + 순위를 이미지로 생성 | P0 |
| **SNS 공유** | 결과 이미지 다운로드/공유 | P0 |

### 제외 (v2 이후)

- AI 작품 추천
- AI 취향 분석/인사이트
- 영상 생성
- 실시간 브래킷 시각화
- 선택 이유 입력

---

## 🔄 사용자 플로우 (MVP)

```
1. 전시 녹화 선택
   ↓
2. 작품 추가 (2가지 방법 혼합 가능)
   a) 사진 업로드 (최대 64장)
   b) 텍스트 검색 → DB에서 선택
   ↓
3. 토너먼트 규모 선택
   - 8강 (8장)
   - 16강 (16장)
   - 32강 (32장)
   - 64강 (64장)
   ↓
4. 토너먼트 진행
   - 두 작품 중 하나 클릭
   - 자동으로 다음 매치 진행
   - 진행률 표시 (예: 8/15 매치)
   ↓
5. 결과 확인
   - 우승작 발표 (애니메이션)
   - 순위 표시 (1~4위)
   ↓
6. 공유
   - 결과 카드 이미지 생성
   - 다운로드 또는 클립보드 복사
   - SNS 공유 링크
```

---

## 🗄️ 간소화된 DB 스키마

```sql
-- 월드컵 세션
CREATE TABLE exhibition_worldcup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exhibition_visit_id UUID REFERENCES exhibition_visits(id), -- 연동

  -- 설정
  round_type INT NOT NULL, -- 8, 16, 32, 64

  -- 상태
  status TEXT NOT NULL DEFAULT 'setup', -- 'setup', 'in_progress', 'completed'
  current_match_index INT DEFAULT 0,

  -- 결과
  winner_participant_id UUID,

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 참가 작품
CREATE TABLE exhibition_worldcup_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

  -- 작품 정보
  source_type TEXT NOT NULL, -- 'uploaded' | 'artwork'
  artwork_id UUID REFERENCES exhibition_artworks(id),

  -- 업로드 이미지
  temp_image_url TEXT, -- Supabase Storage 임시 URL

  -- 메타데이터 (검색 실패 시 수동 입력)
  title TEXT,
  artist TEXT,

  -- 토너먼트
  seed_position INT NOT NULL,
  eliminated_round INT, -- 몇 강에서 탈락
  final_rank INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 매치 기록
CREATE TABLE exhibition_worldcup_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

  match_index INT NOT NULL, -- 전체 매치 순서
  round INT NOT NULL, -- 1=결승, 2=4강, 3=8강...

  participant_a_id UUID NOT NULL REFERENCES exhibition_worldcup_participants(id),
  participant_b_id UUID NOT NULL REFERENCES exhibition_worldcup_participants(id),
  winner_id UUID REFERENCES exhibition_worldcup_participants(id),

  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 임시 이미지 (24시간 자동 삭제)
CREATE TABLE temp_worldcup_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exhibition_worldcup_sessions(id) ON DELETE CASCADE,

  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,

  -- 저장 허용 여부 (v2)
  user_consented BOOLEAN DEFAULT false,

  expires_at TIMESTAMP NOT NULL, -- NOW() + 24 hours
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_worldcup_sessions_user ON exhibition_worldcup_sessions(user_id, status);
CREATE INDEX idx_worldcup_participants_session ON exhibition_worldcup_participants(session_id);
CREATE INDEX idx_worldcup_matches_session ON exhibition_worldcup_matches(session_id);
```

---

## 🛠️ 기술 스택 (MVP)

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **Frontend** | Next.js 15 + React 19 | 기존 스택 유지 |
| **UI** | Framer Motion | 토너먼트 애니메이션 |
| **이미지 처리** | browser-image-compression | 클라이언트에서 리사이징 |
| **이미지 저장** | Supabase Storage | 기존 인프라 활용 |
| **결과 카드 생성** | html2canvas | DOM → 이미지 변환 |
| **DB** | Supabase PostgreSQL | 기존 스택 |

**제외 (v2 이후)**
- ffmpeg.wasm (영상 생성)
- AI/ML (인사이트 생성)

---

## 🎨 UI/UX 핵심 원칙

### 모바일 우선
- 세로 스크롤 방식
- 큰 터치 영역 (작품 이미지 전체 클릭 가능)
- 간단한 제스처

### 빠른 진행
- 선택 즉시 다음 매치 (딜레이 최소화)
- 뒤로가기 버튼 (실수 대비)
- 진행률 표시 명확

### 감성적 피드백
- 선택 시 확대/축소 애니메이션
- 우승 발표 시 축하 효과 (confetti)
- 부드러운 전환

---

## 💡 개선 제안

### ✅ 유지할 것
1. **핵심 가치**: 전시 경험 회고 + SNS 공유
2. **이미지 업로드 + DB 검색 혼합**: 유연성 확보
3. **임시 저장 (24시간)**: 저작권 리스크 최소화
4. **토너먼트 알고리즘**: 검증된 방식

### ⚠️ 간소화할 것
1. **AI 기능 제거** (v2로 미룸)
   - AI 작품 추천
   - 취향 분석/인사이트
   - 이유: 구현 복잡도 ↑, MVP 필수 아님

2. **영상 생성 제거** (v2로 미룸)
   - 이유: ffmpeg.wasm 용량 크고, 이미지 카드만으로도 충분

3. **선택 이유 입력 제거** (v2로 미룸)
   - 이유: 입력 마찰 ↑, 바이럴성 저하

### 💡 추가 제안
1. **전시 녹화 연동**
   - 기존 `exhibition_visits`에 연결
   - "이 전시로 월드컵 하기" 버튼 추가

2. **공유 텍스트 자동 생성**
   ```
   "나의 [전시명] 최애 작품은 [작품명]!
   당신도 해보세요 👉 [링크]"
   ```

3. **저장 동의 프롬프트**
   - 업로드 시: "이미지는 24시간 후 자동 삭제됩니다"
   - 체크박스: "☐ 내 갤러리에 영구 저장 허용"

---

## 🗓️ 구현 로드맵

### Phase 1: 기본 토너먼트 (1-2일)
1. DB 마이그레이션
2. 작품 추가 UI (업로드 + 검색)
3. 토너먼트 브래킷 생성 로직
4. 매치 진행 화면
5. 기본 결과 화면

### Phase 2: 공유 기능 (1일)
1. 결과 카드 디자인
2. html2canvas 통합
3. 다운로드/클립보드 복사
4. 공유 텍스트 생성

### Phase 3: 폴리싱 (1일)
1. 애니메이션 추가
2. 모바일 최적화
3. 에러 핸들링
4. 로딩 상태

**예상 총 개발 기간: 3-4일**

---

## 📊 성공 지표 (MVP)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **완주율** | 30% | completed / started |
| **공유율** | 50% | shared / completed |
| **평균 소요 시간** | 3-5분 | completed_at - started_at |
| **재방문율** | 20% | 2회 이상 사용 |

---

## ⚠️ 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 저작권 이슈 | 높음 | 임시 저장 + 명시적 동의 필수 |
| 이미지 용량 | 중간 | 클라이언트 리사이징 (최대 1MB) |
| 저장소 비용 | 낮음 | 24시간 자동 삭제 |
| 중도 이탈 | 중간 | 진행 중 저장 (로컬스토리지) |

---

## 🔧 기술 상세

### 토너먼트 브래킷 생성 알고리즘

```typescript
interface TournamentBracket {
  rounds: Round[];
  participants: Participant[];
}

interface Round {
  roundNumber: number; // 1=결승, 2=4강, 3=8강...
  matches: Match[];
}

interface Match {
  matchId: string;
  participantA: Participant;
  participantB: Participant;
  winner?: Participant;
}

// 브래킷 생성 로직
function generateBracket(participants: Participant[]): TournamentBracket {
  const count = participants.length;

  // 참가자 수 검증 (2의 거듭제곱이어야 함)
  if (!isPowerOfTwo(count)) {
    throw new Error('Participant count must be power of 2');
  }

  // 시드 배정 (랜덤 셔플)
  const seeded = shuffleArray(participants).map((p, i) => ({
    ...p,
    seedPosition: i + 1
  }));

  // 라운드별 매치 생성
  const rounds: Round[] = [];
  let currentRound = seeded;
  let roundNumber = Math.log2(count);

  while (currentRound.length > 1) {
    const matches: Match[] = [];

    for (let i = 0; i < currentRound.length; i += 2) {
      matches.push({
        matchId: generateId(),
        participantA: currentRound[i],
        participantB: currentRound[i + 1],
      });
    }

    rounds.push({ roundNumber, matches });
    currentRound = []; // 다음 라운드 준비
    roundNumber--;
  }

  return { rounds, participants: seeded };
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
```

### 이미지 업로드 처리

```typescript
// 클라이언트 리사이징
import imageCompression from 'browser-image-compression';

async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  const compressed = await Promise.all(
    files.map(file => imageCompression(file, options))
  );

  // Supabase Storage 업로드
  const uploaded = await Promise.all(
    compressed.map(async (file, i) => {
      const path = `worldcup/${sessionId}/${Date.now()}_${i}.jpg`;
      const { data, error } = await supabase.storage
        .from('temp-worldcup')
        .upload(path, file, {
          cacheControl: '86400', // 24시간
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('temp-worldcup')
        .getPublicUrl(path);

      return {
        path,
        url: publicUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
    })
  );

  return uploaded;
}
```

### 결과 카드 생성

```typescript
import html2canvas from 'html2canvas';

async function generateResultCard(
  winner: Participant,
  rankings: Participant[]
): Promise<Blob> {
  // DOM 엘리먼트 생성
  const card = document.createElement('div');
  card.innerHTML = `
    <div style="width: 1080px; padding: 60px; background: white;">
      <h1>내 전시 월드컵 우승작</h1>
      <img src="${winner.imageUrl}" style="width: 100%; border-radius: 12px;" />
      <h2>${winner.title}</h2>
      <p>${winner.artist}</p>

      <div>
        <h3>순위</h3>
        ${rankings.slice(0, 4).map((p, i) => `
          <div>${i + 1}위: ${p.title}</div>
        `).join('')}
      </div>

      <p>SAYU로 나만의 월드컵 만들기 👉 sayu.app</p>
    </div>
  `;

  document.body.appendChild(card);

  // 캔버스로 변환
  const canvas = await html2canvas(card, {
    scale: 2,
    backgroundColor: '#ffffff'
  });

  document.body.removeChild(card);

  // Blob 변환
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

// 다운로드
function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 클립보드 복사
async function copyToClipboard(blob: Blob) {
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}
```

---

## 📱 API 엔드포인트 (MVP)

```typescript
// 세션 생성
POST /api/worldcup/sessions
Request: {
  roundType: 8 | 16 | 32 | 64;
  exhibitionVisitId?: string;
}
Response: {
  sessionId: string;
  expiresAt: string;
}

// 참가자 추가 (업로드)
POST /api/worldcup/sessions/:sessionId/participants/upload
Request: FormData {
  images: File[];
}
Response: {
  participants: Participant[];
}

// 참가자 추가 (검색)
POST /api/worldcup/sessions/:sessionId/participants/search
Request: {
  query: string;
}
Response: {
  artworks: Artwork[];
}

// 참가자 추가 (수동)
POST /api/worldcup/sessions/:sessionId/participants/manual
Request: {
  title: string;
  artist: string;
  imageUrl?: string;
}
Response: {
  participant: Participant;
}

// 브래킷 생성 및 시작
POST /api/worldcup/sessions/:sessionId/start
Request: {
  participantIds: string[];
}
Response: {
  bracket: TournamentBracket;
  firstMatch: Match;
}

// 매치 결과 제출
POST /api/worldcup/sessions/:sessionId/matches/:matchId/result
Request: {
  winnerId: string;
  decisionTimeSeconds: number;
}
Response: {
  nextMatch?: Match;
  roundCompleted?: boolean;
  tournamentCompleted?: boolean;
}

// 세션 완료
POST /api/worldcup/sessions/:sessionId/complete
Response: {
  winner: Participant;
  rankings: Participant[];
}

// 결과 공유 URL 생성
POST /api/worldcup/sessions/:sessionId/share
Response: {
  shareUrl: string;
}
```

---

## 🎯 다음 단계

1. ✅ 기획서 작성 완료
2. ⏳ DB 마이그레이션 작성
3. ⏳ API 라우트 구현
4. ⏳ UI 컴포넌트 개발
5. ⏳ 공유 기능 구현
6. ⏳ 테스트 및 폴리싱

---

**작성일**: 2026-01-03
**버전**: MVP v1.0

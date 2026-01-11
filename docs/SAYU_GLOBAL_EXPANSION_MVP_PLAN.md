# SAYU Global Expansion MVP Plan

> **작성일**: 2026-01-11
> **버전**: v1.0
> **목적**: Global 시장 진출을 위한 2가지 핵심 MVP 기획

---

## Executive Summary

SAYU의 Global Expansion을 위해 **2가지 MVP**를 병행 추진합니다:

| MVP | 목적 | 핵심 가치 | 타겟 |
|-----|------|----------|------|
| **MVP 1: Global Exhibition Recommendation** | 실용적 가치 제공 | "내 성격에 맞는 전시 발견" | 진지한 애호가 (20%) |
| **MVP 2: AI Art Profile Generator** | 바이럴 확산 | "나를 닮은 명화" | 캐주얼 사용자 (80%) |

**전략적 시너지**: MVP 2로 사용자 유입 → MVP 1로 리텐션 확보

---

## 핵심 인사이트 (100명 실사용자 테스트 기반)

### 발견된 진실

```
SAYU ≠ 미술 추천 플랫폼
SAYU = 예술을 매개로 한 자기 발견 플랫폼 (Self-Discovery Platform)
```

### 검증된 데이터

| 지표 | 결과 | 업계 평균 |
|------|------|----------|
| APT 테스트 완료율 | **100%** | 30-50% |
| 자발적 추천율 (Viral Coefficient) | **20%** | 5-10% |
| 핵심 반응 | "오 나는 이런 유형이구나" | - |

### 핵심 가치 제안

> **"너도 예술을 즐길 자격이 있어"** (You are allowed to enjoy art)

- 예술에 대한 진입장벽 해소
- "미술 몰라도 괜찮을까?" 라는 두려움 제거
- 자기 이해를 통한 예술 접근

---

## 타겟 세그먼트

### Segment A: 캐주얼 사용자 (80%)

```yaml
행동 패턴: 연 1-2회 전시 관람
원하는 것: 도파민, 재미, 즉각적 만족, 공유할 거리
가치 우선순위: Entertainment > Education
핵심 니즈:
  - AI로 만든 자기 프로필 사진
  - 재미있는 콘텐츠 공유
  - 친구들과 비교/경쟁
```

**→ MVP 2 (AI Art Profile) 타겟**

### Segment B: 진지한 애호가 (20%)

```yaml
행동 패턴: 월 2-4회 전시 관람
원하는 것: 깊이, 큐레이션, 전문성, 숨은 정보
가치 우선순위: Education > Entertainment
핵심 니즈:
  - 내 취향에 맞는 전시 발견
  - 놓치면 안 될 전시 알림
  - 깊이 있는 감상 기록
```

**→ MVP 1 (Global Exhibition) 타겟**

---

## MVP 1: Global Exhibition Recommendation System

### 비전

> **"당신의 APT 유형에 딱 맞는 전시를, 전 세계 어디서든"**

### 왜 Global인가?

1. **시장 확장**: 한국 전시 시장 한계 → 글로벌 사용자 확보
2. **차별화**: 국내 서비스들과 다른 포지셔닝
3. **데이터 확보**: 글로벌 미술관 API 활용 (무료/오픈 데이터 다수)

### 핵심 기능

#### 1. APT 기반 전시 매칭

```
사용자 APT 유형 → 전시 특성 분석 → 맞춤 추천
```

| APT 유형 예시 | 추천 전시 특성 |
|--------------|---------------|
| LAEF (몽상가 여우) | 몽환적, 초현실주의, 감성적 |
| SRMC (전달자 사슴) | 스토리텔링, 서사적, 역사적 맥락 |
| HAEC (탐험가 매) | 실험적, 현대미술, 인터랙티브 |

#### 2. 글로벌 전시 데이터베이스

**Phase 1 (MVP) - 3개 도시**
- 서울 (20개 기관)
- 뉴욕 (15개 기관)
- 파리 (10개 기관)

**데이터 소스**
```yaml
한국:
  - 문화포털 API (culture.go.kr) - 무료, 일일 1,000건
  - 서울시 열린데이터 API
  - 주요 갤러리 크롤링

글로벌:
  - Artsy API
  - Google Arts & Culture
  - 각 미술관 공식 API (MoMA, Met, Pompidou 등)
```

#### 3. 위치 기반 추천

```
"지금 당신 근처 500m에 딱 맞는 전시가 있어요"
```

- GPS 기반 실시간 추천
- 여행 중 도시 선택 시 추천
- "이번 주말 갈 수 있는 전시"

### 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| Frontend | Next.js 15 + React 19 | 기존 스택 유지 |
| Backend | Supabase Edge Functions | 서버리스, 글로벌 엣지 |
| Database | Supabase PostgreSQL + pgvector | 벡터 검색 (추천용) |
| 외부 API | 문화포털, Artsy, Google Arts | 전시 데이터 |
| 캐싱 | Supabase + Edge Cache | API 호출 최소화 |

### DB 스키마 (핵심)

```sql
-- 글로벌 기관 정보
CREATE TABLE global_institutions (
  id UUID PRIMARY KEY,
  name_en VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  coordinates POINT,
  timezone VARCHAR(50),
  website VARCHAR(500),
  data_source VARCHAR(100)
);

-- 글로벌 전시 정보
CREATE TABLE global_exhibitions (
  id UUID PRIMARY KEY,
  institution_id UUID REFERENCES global_institutions(id),
  title_en VARCHAR(500) NOT NULL,
  title_local VARCHAR(500),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  genres TEXT[],
  apt_match_scores JSONB, -- 16개 APT 유형별 매칭 점수
  image_url TEXT
);

-- APT-전시 매칭 스코어
-- apt_match_scores 예시:
-- {"LAEF": 0.92, "SRMC": 0.45, "HAEC": 0.78, ...}
```

### 사용자 플로우

```
1. APT 테스트 완료 (기존)
   ↓
2. "내 유형에 맞는 전시 보기" 클릭
   ↓
3. 위치 허용 (선택)
   ↓
4. 추천 전시 목록 표시
   - 매칭률 (예: 92% 맞춤)
   - 거리/위치
   - 기간
   - 핵심 정보
   ↓
5. 상세 보기 → 외부 링크 또는 앱 내 정보
   ↓
6. "관람 예정" 저장 → 리마인더
```

### 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 추천 클릭률 | 30% | 추천 노출 대비 클릭 |
| 실제 방문 전환율 | 10% | "관람 예정" 후 방문 기록 |
| 재방문율 (7일) | 40% | 추천 기능 재사용 |
| NPS | 50+ | 사용자 설문 |

### 구현 로드맵

```
Phase 1 (2주): 데이터 파이프라인
├── 문화포털 API 연동 완료
├── 서울 20개 기관 데이터 수집
├── APT 매칭 알고리즘 v1
└── 기본 추천 UI

Phase 2 (2주): 글로벌 확장
├── 뉴욕/파리 데이터 추가
├── 다국어 지원 (EN/KO)
├── 위치 기반 필터링
└── 푸시 알림 연동

Phase 3 (1주): 최적화
├── 추천 알고리즘 튜닝
├── 캐싱 최적화
├── 성능 모니터링
└── A/B 테스트 셋업
```

---

## MVP 2: AI Art Profile Generator

### 비전

> **"당신의 성격을 명화로 표현하면?"**

### 왜 바이럴인가?

1. **공유 욕구**: "이거 봐, 나 이런 사람이래"
2. **비교 재미**: "너는 뭐 나왔어?"
3. **시각적 임팩트**: SNS에 바로 올릴 수 있는 이미지
4. **벤치마크**: Lensa AI - 2022년 $1M/day 수익

### 핵심 기능

#### 1. APT 기반 AI 아트 생성

```
APT 테스트 결과 → 성격 특성 추출 → AI 프롬프트 생성 → 이미지 생성
```

**예시 프롬프트 구조**
```
APT: LAEF (몽상가 여우)
→ "A dreamlike portrait in the style of {art_movement},
   featuring a person with {personality_traits},
   surrounded by {symbolic_elements},
   color palette: {apt_colors}"

→ 결과: 초현실주의 스타일의 몽환적 인물화
```

#### 2. 아트 스타일 선택

| 스타일 | 설명 | 예시 화가 |
|--------|------|----------|
| 인상주의 | 빛과 색채의 순간 포착 | 모네, 르누아르 |
| 초현실주의 | 꿈과 무의식의 세계 | 달리, 마그리트 |
| 표현주의 | 강렬한 감정 표현 | 뭉크, 칸딘스키 |
| 팝아트 | 대중문화와 위트 | 워홀, 리히텐슈타인 |
| 르네상스 | 고전적 우아함 | 다빈치, 라파엘로 |

#### 3. 결과 카드 생성

```
┌────────────────────────────┐
│                            │
│     [AI 생성 이미지]        │
│                            │
├────────────────────────────┤
│  당신은 LAEF - 몽상가 여우   │
│                            │
│  "현실과 꿈의 경계에서       │
│   아름다움을 찾는 영혼"      │
│                            │
│  🎨 당신을 표현하는 작품:    │
│  초현실주의 × 몽환적 색채    │
│                            │
│  ─────────────────────     │
│  SAYU | sayu.app           │
└────────────────────────────┘
```

### 수익화 모델

```yaml
무료 (바이럴 훅):
  - 기본 이미지 1장 (워터마크 포함)
  - 저해상도 다운로드
  - SNS 공유 기능

유료 옵션:
  - HD 다운로드: $2.99
  - 워터마크 제거: $1.99
  - 추가 스타일 생성 (3장): $4.99
  - 월간 구독 (무제한): $9.99/month

굿즈 (추후):
  - 포스터 프린트: $19.99
  - 캔버스 액자: $49.99
  - 머그컵: $14.99
```

### 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| AI 이미지 생성 | Replicate API (SDXL) | 비용 효율적, 빠른 생성 |
| 대안 | OpenAI DALL-E 3 | 고품질, 안정적 |
| 이미지 처리 | Sharp.js | 리사이징, 워터마크 |
| 결과 카드 | html2canvas | DOM → 이미지 변환 |
| 저장소 | Supabase Storage | 임시 저장 (24시간) |

### 사용자 플로우

```
1. APT 테스트 완료
   ↓
2. "나를 닮은 명화 만들기" 클릭
   ↓
3. 아트 스타일 선택 (선택사항)
   - 자동 추천 (APT 기반)
   - 또는 직접 선택
   ↓
4. 생성 중... (10-30초)
   - 로딩 애니메이션
   - 재미있는 문구 표시
   ↓
5. 결과 공개!
   - 이미지 + 설명
   - 공유 버튼
   - 다운로드 버튼
   ↓
6. 공유하기
   - Instagram Story 최적화 (9:16)
   - Twitter/X 최적화 (16:9)
   - 클립보드 복사
   ↓
7. CTA: "친구도 테스트하게 하기"
```

### 바이럴 최적화

```yaml
공유 텍스트 자동 생성:
  ko: "나는 LAEF - 몽상가 여우! 🦊✨
       내 성격을 명화로 표현하면 이렇대.
       너도 해봐 👉 sayu.app/art-profile"

  en: "I'm LAEF - The Dreamy Fox! 🦊✨
       This is my personality as a masterpiece.
       Try yours 👉 sayu.app/art-profile"

Open Graph 메타:
  - 동적 이미지 생성
  - 유형별 다른 썸네일
  - 클릭 유도 문구
```

### 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 생성 완료율 | 80% | 시작 대비 완료 |
| 공유율 | 50% | 완료 대비 공유 |
| 바이럴 계수 | 0.3 | 공유 → 신규 유입 |
| 유료 전환율 | 5% | 무료 사용자 대비 |

### 구현 로드맵

```
Phase 1 (1주): 기본 생성
├── Replicate API 연동
├── APT → 프롬프트 매핑
├── 기본 생성 UI
└── 결과 카드 디자인

Phase 2 (1주): 공유 기능
├── 이미지 다운로드
├── SNS 공유 최적화
├── Open Graph 동적 생성
└── 바이럴 링크 트래킹

Phase 3 (1주): 수익화
├── 결제 시스템 연동
├── HD 다운로드 기능
├── 구독 모델 구현
└── A/B 테스트
```

---

## Go-to-Market 전략

### 단계별 접근

```
Step 1: MVP 2 (AI Profile) 먼저 출시 - 바이럴 유입
        ↓
Step 2: 유입된 사용자에게 MVP 1 (Exhibition) 소개
        ↓
Step 3: 전시 추천으로 리텐션 확보
        ↓
Step 4: Premium 구독으로 수익화
```

### 예상 퍼널

```
MVP 2 바이럴 (100,000 방문)
    ↓ 50% 테스트 완료
APT 테스트 완료 (50,000)
    ↓ 30% 전시 추천 클릭
MVP 1 사용 (15,000)
    ↓ 10% 정기 사용
Active Users (1,500)
    ↓ 5% Premium
유료 구독자 (75)
```

### 마케팅 채널

| 채널 | 전략 | 예상 효과 |
|------|------|----------|
| Instagram | AI 프로필 공유 유도 | 바이럴 핵심 |
| TikTok | 테스트 과정 영상화 | Gen Z 유입 |
| Twitter/X | 결과 공유 + 토론 | 오피니언 리더 |
| 미술 커뮤니티 | 전시 추천 가치 홍보 | 충성 사용자 |

---

## 리스크 & 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|----------|
| AI 이미지 생성 비용 | 높음 | 캐싱 + 제한 (무료 1회) |
| 전시 데이터 부정확 | 중간 | 사용자 제보 + 정기 검증 |
| 저작권 이슈 | 중간 | 스타일 모방 (특정 작품 X) |
| 서버 비용 급증 | 중간 | 서버리스 + 캐싱 최적화 |
| 경쟁사 모방 | 낮음 | APT 시스템 차별화 |

---

## 다음 단계

### 즉시 실행 (이번 주)

1. [ ] 문화포털 API 키 발급 및 테스트
2. [ ] Replicate API 계정 생성 및 테스트
3. [ ] APT → 프롬프트 매핑 테이블 작성
4. [ ] 기본 UI 와이어프레임

### 단기 (2주)

1. [ ] MVP 2 (AI Profile) 프로토타입
2. [ ] 서울 전시 데이터 수집 자동화
3. [ ] 추천 알고리즘 v1 구현

### 중기 (1개월)

1. [ ] MVP 2 출시 및 바이럴 테스트
2. [ ] MVP 1 글로벌 데이터 확장
3. [ ] 수익화 기능 연동

---

## 참고 문서

- `_bmad-output/analysis/brainstorming-session-2026-01-03.md` - 22개 아이디어
- `docs/archive/CULTURE_API_INTEGRATION_GUIDE.md` - 문화포털 API
- `docs/archive/GLOBAL_EXHIBITION_DATABASE.md` - 글로벌 DB 설계
- `docs/archive/APT_EXHIBITION_MATCHING_SYSTEM.md` - APT 매칭 시스템
- `docs/archive/EXHIBITION_WORLDCUP_MVP_PLAN.md` - 월드컵 기능 (별도 MVP)

---

**작성자**: Claude (with SAYU team)
**최종 수정**: 2026-01-11

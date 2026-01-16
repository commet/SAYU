# SAYU - 예술을 통한 자기 발견 플랫폼

**"예술과 나를 연결하다"** (Connecting Art and Myself)

SAYU는 단순한 미술 추천 서비스가 아닌, 예술을 매개로 한 **자기 발견 플랫폼**입니다. 16가지 예술 성격 유형(APT)을 기반으로 당신만의 예술 여정을 안내합니다.

## 핵심 가치

- **예술에 대한 진입장벽 해소** - "미술 몰라도 괜찮을까?"라는 두려움 제거
- **자기 이해를 통한 예술 접근** - 성격 유형 기반 맞춤 경험
- **의미 있는 연결 형성** - 표면적 매칭이 아닌 깊이 있는 예술 관계

## 주요 기능

### APT (Art Personality Type) 테스트
16가지 예술 성격 유형을 발견하세요. 100명 실사용자 테스트에서 **100% 완료율**과 **20% 자발적 추천율**을 기록했습니다.

### AI Art Profile Generator
당신의 성격을 명화로 표현합니다. APT 유형을 기반으로 AI가 생성한 개인화된 예술 프로필을 받아보세요.

### Global Exhibition Recommendation
서울, 뉴욕, 파리 등 전 세계 전시 정보를 APT 유형에 맞춰 추천합니다. "지금 당신 근처 500m에 딱 맞는 전시가 있어요"

### Mood Atlas
매일 감정을 색으로 기록하고, AI가 추천하는 작품을 감상하며 예술 세계 지도를 탐험하세요. 7개 대륙, 180일의 여정.

### Art Counselor
AI 기반 예술 상담 서비스. 작품을 매개로 한 자기 성찰과 치유의 경험을 제공합니다.

## 기술 스택

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| AI/ML | Groq, OpenAI, Replicate (SDXL) |
| Database | Supabase PostgreSQL + pgvector |
| Deployment | Vercel |

## 프로젝트 구조

```
sayu/
├── frontend/          # Next.js 웹 애플리케이션
├── backend/           # Express.js API 서버
├── shared/            # 공유 타입 및 유틸리티
├── supabase/          # Supabase 마이그레이션
└── docs/              # 프로젝트 문서
```

## 시작하기

### 요구 사항
- Node.js 18+
- npm 9+

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp frontend/.env.example frontend/.env.local
# .env.local 파일에 필요한 API 키 설정

# 개발 서버 실행
npm run dev:frontend
```

### 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

## 16가지 APT 유형

SAYU의 APT 시스템은 4가지 축을 기반으로 16가지 예술 성격 유형을 정의합니다:

- **L/S** - Lyrical(서정적) vs Structural(구조적)
- **A/R** - Abstract(추상적) vs Realistic(사실적)
- **E/M** - Emotional(감성적) vs Mental(이성적)
- **F/C** - Free(자유로운) vs Conventional(전통적)

예시 유형:
- **LAEF** (몽상가 여우) - 몽환적, 초현실주의, 감성적
- **SRMC** (전달자 사슴) - 스토리텔링, 서사적, 역사적 맥락
- **HAEC** (탐험가 매) - 실험적, 현대미술, 인터랙티브

## 검증된 성과

| 지표 | 결과 | 업계 평균 |
|------|------|----------|
| APT 테스트 완료율 | **100%** | 30-50% |
| 바이럴 계수 | **20%** | 5-10% |
| 핵심 반응 | "오 나는 이런 유형이구나" | - |

## 라이선스

이 프로젝트는 개인 사용 목적으로 개발되었습니다.

## 문의

프로젝트에 대한 문의사항은 Issues를 통해 남겨주세요.

---

**SAYU** - 예술을 통해 나를 발견하는 여정

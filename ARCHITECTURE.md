# SAYU 프로젝트 아키텍처

> 생성일: 2026-01-19
> 프레임워크: Next.js 15 (App Router) + React 19

---

## 프로젝트 구조 요약

```
SAYU/
├── frontend/           # Next.js 프론트엔드 (메인)
├── backend/            # Express 백엔드 (일부 API)
├── supabase/           # Supabase 마이그레이션
├── data/               # 크롤러 데이터, 아트워크 JSON
├── scripts/            # 마이그레이션/유틸리티 스크립트
├── docs/               # 문서
├── _deprecated/        # 미사용 코드 (289개 파일)
└── _bmad/              # BMAD 워크플로우 설정
```

---

## 빌드 시 사용되는 핵심 파일

### 1. 엔트리 포인트

| 파일 | 역할 |
|------|------|
| `app/layout.tsx` | 루트 레이아웃 (폰트, 메타데이터) |
| `app/providers.tsx` | 전역 Provider 래퍼 |
| `app/page.tsx` | 홈페이지 (/) |
| `app/globals.css` | 글로벌 CSS |

### 2. Provider 계층 (app/providers.tsx)

```
SessionProvider (next-auth)
└── QueryClientProvider (react-query)
    └── PWAProvider
        └── AuthProvider (useAuth)
            └── LanguageProvider
                └── DarkModeProvider
                    └── ThemeProvider (APT 테마)
                        └── OnboardingProviderV2
                            └── AnimalCursorProvider
                                └── EasterEggProvider
                                    └── ArtworkViewingProvider
                                        └── ClientLayout
                                            └── {children}
                                            └── SmartChatbot
```

---

## 페이지 구조 (99개 페이지)

### 핵심 페이지

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 홈 (Hero3D, MobileHome) |
| `/quiz` | `app/quiz/page.tsx` | APT 성격 테스트 |
| `/quiz/results` | `app/quiz/results/page.tsx` | 테스트 결과 |
| `/exhibitions` | `app/exhibitions/page.tsx` | 전시회 목록 |
| `/gallery` | `app/gallery/page.tsx` | 아트워크 갤러리 |
| `/profile` | `app/profile/page.tsx` | 사용자 프로필 |
| `/worldcup` | `app/worldcup/page.tsx` | 전시회 월드컵 |

### 주요 기능별 페이지

**인증**
- `/login`, `/register`, `/auth/login`
- `/forgot-password`, `/auth/processing`

**전시회**
- `/exhibitions/[id]` - 전시 상세
- `/exhibitions/saved` - 저장한 전시
- `/exhibitions/history` - 관람 기록
- `/exhibition-archive` - 전시 아카이브

**갤러리/아트워크**
- `/gallery/collection` - 내 컬렉션
- `/gallery/recommendations` - AI 추천
- `/artwork/[id]` - 아트워크 상세
- `/artists`, `/artists/[artistId]` - 아티스트

**AI 기능**
- `/art-counselor` - AI 아트 카운슬러
- `/art-profile-ai` - AI 아트 프로필 생성
- `/art-pulse` - 실시간 아트 피드

**커뮤니티**
- `/community` - 커뮤니티
- `/matching` - 성향 매칭
- `/contemplative-walk` - 사색적 산책

**관리자**
- `/admin/*` - 관리자 페이지들

---

## API 라우트 (78개)

### 카테고리별 정리

**인증 (4개)**
```
/api/auth/[...nextauth]
/api/auth/kakao/auth-url
/api/auth/kakao/exchange-token
/api/auth/kakao/user-info
```

**전시회 (11개)**
```
/api/exhibitions
/api/exhibitions/[id]
/api/exhibitions/[id]/like
/api/exhibitions/bulk-update
/api/exhibitions/confirm-save
/api/exhibitions/map
/api/exhibitions/parse-natural
/api/exhibitions/popular
/api/exhibitions/recommend
/api/exhibitions/save
```

**갤러리/아트워크 (8개)**
```
/api/gallery/artworks
/api/gallery/collection
/api/gallery/collection/migrate
/api/gallery/preferences
/api/artworks
/api/artworks/cloudinary
/api/artworks/search
```

**AI 생성 (10개)**
```
/api/art-profile/generate
/api/art-profile/generate-apt
/api/art-profile/generate-replicate
/api/art-profile/universal
/api/art-transform
/api/generate-art
/api/generate-image
/api/openai/generate
/api/openai/generate-art
/api/replicate/generate
```

**챗봇/상담 (5개)**
```
/api/chatbot
/api/chatbot-groq
/api/gemini-consult
/api/openai-consult
/api/ai-council
```

**월드컵 (7개)**
```
/api/worldcup/sessions
/api/worldcup/sessions/[id]
/api/worldcup/sessions/[id]/start
/api/worldcup/sessions/[id]/participants
/api/worldcup/sessions/[id]/matches/[matchId]/result
/api/worldcup/share
/api/worldcup/upload
```

**사용자/활동 (10개)**
```
/api/users/[userId]/follow-artist
/api/users/[userId]/unfollow-artist
/api/users/[userId]/followed-artists
/api/activities/track
/api/activities/recent
/api/artists
/api/artists/[artistId]/follow
/api/artists/[artistId]/unfollow
/api/artists/stats
```

---

## 컴포넌트 구조 (416개)

### 주요 폴더

| 폴더 | 파일 수 | 설명 |
|------|---------|------|
| `ui/` | 다수 | 기본 UI 컴포넌트 |
| `quiz/` | - | 퀴즈 관련 |
| `exhibitions/` | - | 전시회 UI |
| `gallery/` | - | 갤러리 UI |
| `chatbot/` | - | 스마트 챗봇 |
| `apt/` | - | APT 성격 유형 |
| `design-system/` | - | 디자인 시스템 |
| `worldcup/` | - | 월드컵 게임 |
| `profile/` | - | 프로필 관련 |
| `achievements/` | - | 업적/배지 |
| `art-counselor-hybrid/` | - | AI 아트 카운슬러 |

### 전역 컴포넌트

```
components/
├── ToasterProvider.tsx      # 토스트 알림
├── IDCard.tsx               # 성격 카드
├── PersonalityIcon.tsx      # 성격 아이콘
├── PersonalityTypeGrid.tsx  # 성격 그리드
├── ImageWithFallback.tsx    # 이미지 폴백
└── SocialLoginModal.tsx     # 소셜 로그인
```

---

## Contexts (8개)

| Context | 역할 |
|---------|------|
| `DarkModeContext` | 다크모드 상태 |
| `LanguageContext` | 다국어 (ko/en) |
| `OnboardingContextV2` | 온보딩 플로우 |
| `AnimalCursorContext` | 커스텀 커서 |
| `EasterEggContext` | 이스터에그 |
| `ArtworkViewingContext` | 작품 감상 상태 |
| `I18nLanguageProvider` | i18n 래퍼 |

---

## Hooks (38개)

### 핵심 Hooks

| Hook | 역할 |
|------|------|
| `useAuth` | 인증 상태 관리 |
| `usePersonalizedTheme` | APT 기반 테마 |
| `useLanguage` | 언어 전환 |
| `useGamification` | 게이미피케이션 |
| `useAchievements` | 업적 시스템 |
| `useActivityTracker` | 활동 추적 |
| `useArtistFollow` | 아티스트 팔로우 |
| `useCloudinaryArtworks` | Cloudinary 아트워크 |
| `usePersonalityData` | 성격 데이터 (지연로딩) |

---

## 주요 라이브러리 (lib/)

### 핵심 모듈

| 파일 | 역할 |
|------|------|
| `supabase.ts` | Supabase 클라이언트 |
| `auth.ts` | NextAuth 설정 |
| `api-client.ts` | API 클라이언트 |
| `groq-client.ts` | Groq LLM API |
| `replicate-art-service.ts` | Replicate 이미지 생성 |
| `cloudinary-client.ts` | Cloudinary 이미지 |
| `themes.ts` | APT 테마 정의 |

### AI/ML 서비스

```
lib/
├── ai-art-service.ts           # AI 아트 통합
├── openai-art-service.ts       # OpenAI 이미지
├── replicate-universal-service.ts # Replicate 통합
├── huggingface-api.ts          # HuggingFace
├── free-llm-client.ts          # 무료 LLM
└── art-counselor/              # 아트 카운슬러 모듈
```

---

## 데이터 흐름

```
[사용자 액션]
     ↓
[React Component]
     ↓
[Custom Hook] (useAuth, useGamification, etc.)
     ↓
[API Route] (/api/*)
     ↓
[External Service]
├── Supabase (DB, Auth)
├── Groq (LLM)
├── Replicate (이미지 생성)
├── Cloudinary (이미지 호스팅)
└── OpenAI/Gemini (AI)
```

---

## 빌드 최적화

### Dynamic Imports (코드 스플리팅)

```typescript
// 무거운 컴포넌트 지연 로딩
const Hero3DSection = dynamic(() => import('@/components/hero/Hero3DSection'));
const MobileHomePage = dynamic(() => import('./MobileHomePageFixed'));
const SmartChatbot = dynamic(() => import('@/components/chatbot/SmartChatbot'));
```

### 캐싱 전략

| 엔드포인트 | Cache-Control |
|------------|---------------|
| `/api/exhibitions` | 5분 |
| `/api/personality-types` | 1시간 |
| `/api/gallery/artworks` | 10분 |
| `/api/museum-image` | 24시간 |

---

## 파일 수 요약

| 카테고리 | 개수 |
|----------|------|
| 페이지 (page.tsx) | 99 |
| API 라우트 | 78 |
| 컴포넌트 (.tsx) | 416 |
| Hooks | 38 |
| Contexts | 8 |
| Lib 모듈 | 90+ |
| **활성 코드 총합** | **~700+** |
| _deprecated 파일 | 289 |

---

## 다음 단계

1. **UI/UX 개선**
   - prefers-reduced-motion 지원
   - aria-live 추가
   - transition: all → 구체적 속성
   - autocomplete 속성 추가

2. **성능 최적화**
   - 번들 크기 분석
   - 이미지 AVIF 변환
   - 추가 코드 스플리팅

3. **보안 강화**
   - RLS 마이그레이션 적용
   - API 키 교체

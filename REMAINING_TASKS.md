# SAYU 남은 작업 목록

> 이 문서는 2026-01-19 보안/성능/코드품질 감사 후 작성됨
> 마지막 커밋: `eda9f94` (refactor: remove any types and improve exhibition cache)

---

## 완료된 작업 ✅

### 보안
- [x] SSRF 취약점 수정 (`frontend/app/api/image-proxy/route.ts`)
  - 21개 도메인 화이트리스트 추가
  - Private IP 차단 (127.0.0.1, 10.x, 172.16-31.x, 192.168.x, 169.254.169.254)
  - HTTPS 강제, 파일 크기 제한 (10MB)
- [x] RLS 마이그레이션 파일 생성 (`supabase/migrations/20260118000000_security_performance_fixes.sql`)
- [x] Worldcup 치팅 방지 RLS 정책 작성

### 성능
- [x] 이미지 압축 (200MB → 54MB, 73% 절감)
- [x] Hydration 이슈 수정
  - `DarkModeContext.tsx` - SSR 가드 추가
  - `RecommendationFeed.tsx` - localStorage → session token
- [x] Promise 에러 핸들링 (`SwipeCard.tsx` - .catch() 추가)
- [x] `usePersonalityData.ts` 지연 로딩 훅 생성
- [x] Exhibition 캐시 개선 (글로벌 변수 → HTTP Cache-Control 헤더)

### 코드 품질
- [x] useAuth 의존성 배열 수정 (`[router]` → `[router, supabase]`)
- [x] `any` 타입 제거 (10개 API 라우트)
  - exhibitions/route.ts
  - chatbot/route.ts
  - groq/generate/route.ts
  - quiz/analyze/route.ts
  - worldcup/sessions/route.ts
  - worldcup/share/route.ts
  - worldcup/sessions/[id]/route.ts
  - worldcup/sessions/[id]/start/route.ts
  - worldcup/sessions/[id]/participants/route.ts
  - worldcup/sessions/[id]/matches/[matchId]/result/route.ts

---

## 🔴 긴급 - 보안 (Priority 1)

### 1. API 키 교체 (수동 작업)
> 사용자가 직접 교체 예정 ("api키는 나중에 내가 교환할게")

**교체 필요:**
- [ ] `GROQ_API_KEY` - 무료 LLM API 키
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 서비스 롤 키 (노출시 위험)
- [ ] `REPLICATE_API_TOKEN` - AI 이미지 생성
- [ ] `OPENAI_API_KEY` - OpenAI API (비활성화 상태)

**확인 필요:**
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지
- [ ] Vercel 환경 변수 설정 확인
- [ ] 이전 커밋에 키 노출 여부 확인 (git log --all -p | grep "sk-")

### 2. RLS 마이그레이션 적용 ⚠️
> 파일은 생성됨, Supabase에 적용 필요

**파일 위치:** `supabase/migrations/20260118000000_security_performance_fixes.sql`

```bash
# 방법 1: Supabase CLI
cd C:\Users\admin\documents\github\sayu
supabase db push

# 방법 2: Supabase 대시보드
# SQL Editor에서 직접 실행
```

**적용될 RLS 정책:**
| 테이블 | 정책 | 설명 |
|--------|------|------|
| `emotion_vectors` | SELECT own | 자신의 감정 벡터만 조회 |
| `user_activities` | SELECT own | 자신의 활동 기록만 조회 |
| `art_recommendations` | SELECT own | 자신의 추천만 조회 |
| `gamification_points` | SELECT own | 자신의 포인트만 조회 |
| `notification_preferences` | CRUD own | 자신의 알림 설정만 관리 |
| `exhibition_reviews` | SELECT all, CRUD own | 전체 조회, 자기 것만 수정 |
| `exhibition_worldcup_matches` | UPDATE once | winner_id 한 번만 설정 (치팅 방지) |

**적용될 인덱스 (10개):**
```sql
idx_user_activities_user_created
idx_gamification_points_user_action
idx_exhibitions_dates_status
idx_exhibition_visits_user_exhibition
idx_exhibition_reviews_exhibition_created
idx_emotion_vectors_user_created
idx_art_recommendations_user_created
idx_follow_relationships_both
idx_exhibition_worldcup_sessions_user_status
idx_exhibition_worldcup_participants_session
```

---

## 🟡 코드 품질 (Priority 2)

### 3. 남은 `any` 타입 제거

**확인 명령:**
```bash
# API 라우트에서 any 찾기
grep -r ": any" frontend/app/api --include="*.ts"

# 컴포넌트에서 any 찾기
grep -r ": any" frontend/components --include="*.tsx"
```

#### API 라우트 (우선순위 높음)
| 파일 | any 개수 | 설명 |
|------|----------|------|
| `worldcup/upload/route.ts` | 4 | 업로드 이미지 배열, 에러 핸들링 |
| `generate-art/route.ts` | 1 | Replicate 모델 반환 타입 |
| `art-profile/generate/route.ts` | 2+ | AI 생성 관련 |
| `art-profile/universal/route.ts` | 2+ | 범용 프로필 생성 |
| `openai/generate/route.ts` | 1+ | OpenAI 응답 타입 |
| `openai-consult/route.ts` | 1+ | 상담 API |
| `chatbot-groq/route.ts` | 2+ | Groq 챗봇 |
| `exhibitions/confirm-save/route.ts` | 1+ | 저장 확인 |
| `art-transform/route.ts` | 1+ | 아트 변환 |
| `ai-council/route.ts` | 1+ | AI 위원회 |
| `personality-types/route.ts` | 1+ | 성격 유형 |
| `quiz-answer/route.ts` | 1+ | 퀴즈 답변 |

#### 비활성 코드 (우선순위 낮음)
| 파일 | 상태 |
|------|------|
| `gemini-consult/route.ts` | 비활성화됨 (billing 이슈) |
| `exhibitions/route-optimized.ts` | 백업 파일 |
| `chatbot/route-optimized.ts` | 백업 파일 |
| `gallery/collection/route-optimized.ts` | 백업 파일 |

#### 컴포넌트/훅
| 파일 | any 위치 | 수정 방법 |
|------|----------|-----------|
| `AnimeJSEnhanced.tsx` | anime 라이브러리 | `@types/animejs` 설치 또는 declare |
| `AchievementBadge.tsx` | achievements 배열 | Achievement 인터페이스 정의 |
| `pages/_error.tsx` | props, contextData | NextPageContext 타입 사용 |
| `supabase-auth-form.tsx` | error 핸들링 | AuthError 타입 사용 |
| `useAuth.tsx` | metadata 파라미터 | UserMetadata 인터페이스 정의 |
| `migration-helper.tsx` | t 함수 | i18n 타입 정의 |

### 4. 미사용 코드 정리

**삭제 후보:**
```
frontend/app/api/exhibitions/route-optimized.ts  (백업)
frontend/app/api/chatbot/route-optimized.ts      (백업)
frontend/app/api/gallery/collection/route-optimized.ts (백업)
```

**확인 필요:**
- [ ] `route-optimized.ts` 파일들이 실제로 사용되지 않는지 확인
- [ ] 삭제 전 git에서 복구 가능한지 확인

---

## 🟢 성능 최적화 (Priority 3)

### 5. 번들 크기 최적화

**현재 큰 청크:**
| 파일 | 크기 | 개선 방안 |
|------|------|-----------|
| `personality-descriptions.ts` | 45KB | 동적 임포트 (✅ usePersonalityData.ts로 해결) |
| `recharts` | ~200KB | 필요한 컴포넌트만 임포트 |
| `framer-motion` | ~150KB | 필요한 기능만 임포트 |
| `phosphor-react` | ~100KB | 사용하는 아이콘만 개별 임포트 |

**확인 명령:**
```bash
cd frontend
npx @next/bundle-analyzer
```

### 6. 이미지 최적화 추가

- [ ] WebP → AVIF 변환 검토 (추가 30% 절감 가능)
- [ ] 이미지 lazy loading 확인
- [ ] placeholder blur 적용 확인

### 7. API 응답 캐싱 추가

**캐싱 추가 후보:**
| 엔드포인트 | 현재 | 권장 |
|------------|------|------|
| `/api/exhibitions` | ✅ 5분 | 완료 |
| `/api/personality-types` | ❌ | 1시간 (정적 데이터) |
| `/api/gallery/artworks` | ❌ | 10분 |
| `/api/museums` | ❌ | 1시간 (정적 데이터) |

---

## 🔧 기술 부채 (Priority 4)

### 8. 테스트 코드 추가

**우선순위 높은 테스트:**
- [ ] `image-proxy/route.ts` - SSRF 방지 테스트
- [ ] `worldcup/sessions` - 토너먼트 로직 테스트
- [ ] `useAuth.tsx` - 인증 흐름 테스트

### 9. 에러 모니터링

- [ ] Sentry 또는 유사 서비스 설정 검토
- [ ] 에러 바운더리 컴포넌트 확인

### 10. 문서화

- [ ] API 엔드포인트 문서화 (Swagger/OpenAPI)
- [ ] 컴포넌트 스토리북 추가 검토

---

## 📋 빠른 시작 가이드

### 데스크탑 Claude Code에서 이어서 작업시:

```bash
# 1. 현재 상태 확인
cd C:\Users\admin\documents\github\sayu
git status
git log --oneline -5

# 2. RLS 마이그레이션 적용 (Supabase CLI 필요)
supabase db push

# 3. 남은 any 타입 확인
grep -r ": any" frontend/app/api --include="*.ts" | wc -l

# 4. 빌드 확인
cd frontend && npm run build

# 5. 린트 확인 (선택)
npm run lint
```

### 우선순위별 작업 순서:
1. **RLS 마이그레이션 적용** → DB 보안 강화
2. **API 키 교체** → 보안 키 갱신 (수동)
3. **남은 any 타입 제거** → 타입 안전성
4. **미사용 코드 정리** → 코드베이스 정리
5. **추가 캐싱** → 성능 개선

---

## 감사 결과 요약

| 카테고리 | 발견 | 해결 | 남음 |
|----------|------|------|------|
| 보안 취약점 | 4 | 2 | 2 (키교체, RLS적용) |
| any 타입 | 50+ | 20+ | 30+ |
| 성능 이슈 | 5 | 4 | 1 |
| 인덱스 누락 | 10 | 0 | 10 (SQL 준비됨) |

---

## 관련 파일

```
supabase/migrations/20260118000000_security_performance_fixes.sql  # RLS + 인덱스
frontend/hooks/usePersonalityData.ts                                # 지연 로딩 훅
frontend/app/api/image-proxy/route.ts                              # SSRF 수정됨
frontend/contexts/DarkModeContext.tsx                              # Hydration 수정됨
```

---

*생성일: 2026-01-19*
*작성자: Claude Opus 4.5*
*프로젝트: SAYU (사유) - 예술 성격 테스트 플랫폼*

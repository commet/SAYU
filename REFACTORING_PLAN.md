# SAYU 리팩토링 계획서

> 생성일: 2026-01-19
> 분석 기준: 실제 import/사용 횟수 기반

---

## 분석 요약

### 코드베이스 현황
| 항목 | 수치 |
|------|------|
| 총 컴포넌트 코드 | 100,584줄 |
| 컴포넌트 폴더 | 86개 |
| **0 imports 폴더** | **33개 (38%)** |
| npm 의존성 | 108개 |

---

## Phase 1: 확실한 Dead Code 제거 (저위험)

### 1.1 빈 폴더 삭제 (0 파일)

```
components/economy/      # 빈 폴더
components/entrance/     # 빈 폴더
components/forms/        # 빈 폴더
components/identity/     # 빈 폴더
components/village/      # 빈 폴더
```

**작업:** 바로 삭제 가능

### 1.2 완전 미사용 컴포넌트 폴더 (0 imports, 파일 있음)

| 폴더 | 파일 수 | 상태 | 조치 |
|------|---------|------|------|
| `achievements/` | 4 | `gamification/`에 중복 있음 | deprecated |
| `apt-theme/` | 3 | 미사용 | deprecated |
| `apt/` | 1 | 미사용 | deprecated |
| `artist-apt/` | 1 | 미사용 | deprecated |
| `artmap/` | 1 | 미사용 | deprecated |
| `artwork/` | 2 | 미사용 | deprecated |
| `calendar/` | 2 | 미사용 | deprecated |
| `community/` | 5 | 미사용 | deprecated |
| `cursor/` | 2 | Context에서 사용 확인 필요 | 검토 |
| `dual-value/` | 4 | 미사용 | deprecated |
| `easter-egg/` | 1 | Context 연관 확인 필요 | 검토 |
| `email/` | 1 | 미사용 | deprecated |
| `examples/` | 1 | 데모 코드 | deprecated |
| `exhibition-companion/` | 2 | 미사용 | deprecated |
| `landing/` | 1 | 미사용 | deprecated |
| `notifications/` | 1 | 미사용 | deprecated |
| `optimized/` | 1 | 실험 코드 | deprecated |
| `providers/` | 1 | `contexts/`와 중복 | deprecated |
| `recommendations/` | 2 | 미사용 | deprecated |
| `reflections/` | 1 | 미사용 | deprecated |
| `reservations/` | 2 | 미사용 | deprecated |
| `settings/` | 1 | 미사용 | deprecated |
| `system/` | 1 | 미사용 | deprecated |
| `waitlist/` | 2 | 미사용 | deprecated |

**총 약 45개 파일 deprecated 가능**

### 1.3 중복 파일 (같은 이름, 다른 폴더)

| 파일 | 위치1 | 위치2 | 조치 |
|------|-------|-------|------|
| `AchievementBadge.tsx` | `achievements/` | `gamification/` | gamification만 유지 |

---

## Phase 2: 폴더 통합 (중위험)

### 2.1 단수/복수 폴더 통합

| 현재 | 통합 후 | 파일 수 |
|------|---------|---------|
| `exhibition/` + `exhibitions/` | `exhibitions/` | 18 |
| `collection/` + `collections/` | `collections/` | 6 |
| `layout/` + `layouts/` | `layouts/` | 검토 필요 |

### 2.2 기능별 폴더 통합 제안

```
# 현재 (분산)
components/achievements/      → 미사용
components/gamification/      → 사용중
components/economy/          → 빈 폴더

# 통합 후
components/gamification/     → 모든 게임/포인트 관련
```

---

## Phase 3: 저사용 Hooks 정리 (중위험)

### 3.1 사용 횟수별 Hook 분석

| Hook | 사용 횟수 | 상태 |
|------|----------|------|
| `useMatchingSystem` | 1 | 통합 검토 |
| `useArtvee` | 2 | 통합 검토 |
| `useArtCounselorSession` | 3 | 유지 |
| `useArtistFollow` | 3 | 유지 |
| `useContemplativeTracking` | 3 | 통합 검토 |
| `useGamification` | 3 | 유지 |
| `useIntersectionObserver` | 3 | 유지 (일반 유틸) |

### 3.2 V2 Hook 통합

| 현재 | 조치 |
|------|------|
| `useGamification.ts` + `useGamificationV2.ts` | V2로 통합 |
| `useMediaQuery.ts` + `use-media-query.tsx` | 하나로 통합 |

---

## Phase 4: Provider 최적화 (고위험)

### 현재 Provider 계층 (10단계)

```tsx
SessionProvider          // next-auth - 필수
└── QueryClientProvider  // react-query - 필수
    └── PWAProvider      // PWA - 선택적
        └── AuthProvider // 인증 - 필수
            └── LanguageProvider    // i18n - 필수
                └── DarkModeProvider // 테마 - 필요
                    └── ThemeProvider // APT테마 - 필요
                        └── OnboardingProviderV2  // 온보딩 - 검토
                            └── AnimalCursorProvider  // 커서 - 19회 사용
                                └── EasterEggProvider // 이스터에그 - 검토
                                    └── ArtworkViewingProvider // 감상 - 검토
```

### 권장 통합안

```tsx
SessionProvider          // 유지
└── QueryClientProvider  // 유지
    └── AuthProvider     // 유지
        └── AppProvider  // 통합: Language + DarkMode + Theme
            └── UIProvider // 통합: Cursor + EasterEgg + Onboarding
                └── ArtworkViewingProvider // 유지 (특수 목적)
```

**10단계 → 6단계로 축소**

---

## 실행 순서 (권장)

### Week 1: Phase 1 (저위험)
1. [ ] 빈 폴더 5개 삭제
2. [ ] 명확한 dead code 폴더 20개+ deprecated
3. [ ] 중복 파일 정리

### Week 2: Phase 2 (중위험)
4. [ ] exhibition/exhibitions 통합
5. [ ] collection/collections 통합
6. [ ] 관련 import 경로 수정

### Week 3: Phase 3 (중위험)
7. [ ] V2 Hook 통합
8. [ ] 저사용 Hook 검토 및 정리

### Week 4: Phase 4 (고위험) - 선택적
9. [ ] Provider 통합 테스트
10. [ ] 점진적 Provider 마이그레이션

---

## 리스크 관리

### 각 Phase별 롤백 포인트

```bash
# Phase 1 시작 전
git tag refactor-phase1-start

# Phase 2 시작 전
git tag refactor-phase2-start

# etc.
```

### 테스트 체크리스트

- [ ] 빌드 성공 (`npm run build`)
- [ ] 타입 체크 (`npx tsc --noEmit`)
- [ ] 주요 페이지 접근 테스트
  - [ ] / (홈)
  - [ ] /quiz
  - [ ] /exhibitions
  - [ ] /gallery
  - [ ] /profile

---

## 예상 효과

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| 컴포넌트 폴더 | 86 | ~50 | -42% |
| Dead code 파일 | ~50+ | 0 | -100% |
| Provider 단계 | 10 | 6 | -40% |
| 코드 가독성 | 낮음 | 중간 | 향상 |

---

## 주의사항

1. **절대 한번에 하지 마세요** - 단계별로 커밋
2. **빌드 확인 필수** - 각 변경 후 빌드
3. **동적 import 주의** - grep으로 못 찾는 경우 있음
4. **Context 연관 확인** - Provider 제거 전 사용처 확인

---

*작성자: Claude Opus 4.5*
*프로젝트: SAYU*

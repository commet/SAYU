# Exhibition Improvements Progress

## Overview
전시 탐색 기능의 데이터 품질, UI/UX, 국제화를 종합적으로 개선하는 작업.

---

## Completed (2026-02-15)

### 1. 데이터 품질 개선

#### 1-1. 중복 전시 제거
- **문제**: 같은 전시가 다른 소스(MMCA, Exhibition Integrated 등)에서 중복 수집
- **해결**: `cleanup-exhibitions.js` - 제목+날짜 기준 cross-source dedup
- **결과**: 1,292건 삭제 (12,349 → 11,057)
- **파일**: `backend/cleanup-exhibitions.js`

#### 1-2. 도시명 정규화
- **문제**: '과천'과 'Gwacheon', '서울'과 'Seoul'이 별도 도시로 표시
- **해결**:
  - `sync-to-exhibitions.js` - MMCA_VENUES, GALLERY_VENUES, extractCity() 모두 영문 도시명 사용
  - `cleanup-exhibitions.js` - 기존 3,416건 한글 도시명 → 영문 정규화
- **결과**: 필터에 중복 도시 없음
- **파일**: `backend/sync-to-exhibitions.js`, `backend/cleanup-exhibitions.js`

#### 1-3. Perrotin 스크래퍼 버그 수정
- **문제 1**: source_url이 `https://www.perrotin.comhttps//leaflet.perrotin.com/...` 형태로 깨짐
- **문제 2**: 전시명이 "Untitled"로만 표시
- **해결**:
  - URL 검증 로직 추가 (절대/상대 URL 판별, 프로토콜 검사)
  - "Untitled" 제목에 작가명 결합: "Untitled - [Artist Name]"
- **결과**: 11건 URL 수정, 제목 구별 가능
- **파일**: `backend/sync-galleries.js` (scrapePerrotin 함수)

### 2. 프론트엔드 개선

#### 2-1. 도시명 한글 번역
- **문제**: KR 모드에서도 Chicago, Cleveland 등 영문으로 표시
- **해결**: `CITY_KO` 번역 맵 추가 (32개 도시)
  - 한국: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 제주, 과천, 청주 등 14개
  - 해외: 도쿄, 뉴욕, 런던, 파리, 베를린, 시카고, 클리블랜드 등 18개
- **적용**: 도시 필터 탭 + 카드 내 위치 표시 모두
- **파일**: `frontend/app/exhibitions/page.tsx`

#### 2-2. 전시 상태 배지 추가
- **문제**: 진행중/예정 전시의 상태가 한눈에 안 보임
- **해결**: 3가지 상태 배지
  - 🔴 빨간색: "X일 남음" (종료 7일 이내)
  - 🟢 초록색: "전시중" / "Now Open" (진행중, 7일 이상 남음)
  - 🔵 파란색: "X일 후 시작" / "In Xd" (예정)
- **API**: `daysUntilStart` 필드 추가
- **파일**: `frontend/app/exhibitions/page.tsx`, `frontend/app/api/exhibitions/route.ts`

#### 2-3. 플레이스홀더 카테고리 연동
- **문제**: 이미지 없는 전시 모두 동일한 남색 그라데이션
- **해결**: 태그 첫 번째 값을 category로 전달 → 카테고리별 다른 그라데이션
- **파일**: `frontend/app/exhibitions/page.tsx`

### 3. 빌드 오류 수정

#### 3-1. weekly-summary UTF-8 인코딩
- **문제**: ISO-8859 인코딩으로 한글 패턴이 깨져 빌드 실패
- **해결**: 모든 한글 패턴을 정상 UTF-8로 재작성
- **파일**: `frontend/app/api/admin/feedback/weekly-summary/route.ts`

#### 3-2. NEXTAUTH_SECRET 빌드 타임 에러
- **문제**: Vercel에서 NEXTAUTH_SECRET 없어 빌드 실패
- **해결**: 빌드 타임 throw 제거, fallback secret 추가 (Supabase Auth가 메인)
- **파일**: `frontend/lib/auth.ts`

#### 3-3. remotePatterns 50개 초과
- **문제**: next.config.js remotePatterns 53개로 빌드 실패
- **해결**: 와일드카드(`**`)로 커버되는 중복 패턴 제거 → 43개
- **파일**: `frontend/next.config.js`

---

## Remaining / TODO

### 데이터

- [ ] **전시 제목 번역**: 프랑스어/독일어 제목을 영어/한국어로 번역 (Paris, Berlin 소스)
  - Paris 데이터 1,211건 중 대부분 프랑스어 제목
  - Berlin 데이터 1,002건 중 독일어 제목 다수
  - 방법: LLM 번역 스크립트 or Google Translate API (무료 티어)
- [ ] **이미지 보강**: 이미지 없는 전시에 대해 venue 기본 이미지 매핑
  - 주요 미술관별 대표 이미지 DB 구축 가능
- [ ] **source_galleries Perrotin 재크롤링**: 수정된 스크래퍼로 재실행하여 올바른 데이터 수집
- [ ] **추가 국제 소스 연동**: source_cleveland, source_whitney 등 테이블 생성 후 실행 필요
  - `backend/create-source-tables.js` SQL을 Supabase SQL Editor에서 실행

### 프론트엔드

- [ ] **전시 상세 페이지 한글화**: ExhibitionDetailClient.tsx의 UI 텍스트 번역 점검
- [ ] **도시 필터 카운트 표시**: 각 도시 탭에 전시 수 표시 (예: "서울 (3,200)")
- [ ] **플레이스홀더 다양화**: 현재 카테고리 연동했으나, 실제 태그 값과 categoryStyles 키 매핑 검증 필요
- [ ] **전시 검색 고도화**: 작가명, 미술관명으로도 검색 가능하도록 (현재도 가능하나 UI에서 명시 필요)
- [ ] **모바일 UX**: 도시 탭 스크롤 UX, 카드 레이아웃 모바일 최적화 점검

### 인프라

- [ ] **Vercel 환경변수**: NEXTAUTH_SECRET을 Vercel 프로젝트 설정에 추가 (또는 NextAuth 완전 제거)
- [ ] **크론 자동화**: 새로운 소스(Cleveland, Whitney, Paris, Berlin, e-flux) 크론에 등록
  - `backend/src/services/exhibition-pipeline/index.js` 수정 필요

---

## 파일 변경 이력

| 커밋 | 내용 | 날짜 |
|------|------|------|
| `4c84a507` | 국제 전시 확장 - 도시 기반 데이터 파이프라인 | 2026-02-14 |
| `bdf9aad9` | 빌드 오류 수정 + 피드백 관리 기능 | 2026-02-15 |
| `d6ef1ca1` | NEXTAUTH_SECRET 빌드 타임 throw 제거 | 2026-02-15 |
| `c8965756` | 데이터 품질 - 중복 제거, 도시 정규화, 상태 배지 | 2026-02-15 |

## 주요 파일 맵

```
backend/
├── sync-galleries.js          # 갤러리 스크래퍼 (Perrotin 수정됨)
├── sync-to-exhibitions.js     # 소스 → exhibitions 매핑 (도시 정규화됨)
├── cleanup-exhibitions.js     # DB 클린업 스크립트 (일회성)
├── enrich-exhibitions.js      # venue_city 보강 스크립트
├── sync-cleveland.js          # Cleveland Museum sync
├── sync-whitney.js            # Whitney Museum sync
├── sync-paris.js              # Paris open data sync
├── sync-berlin.js             # Berlin kulturdaten sync
└── sync-eflux.js              # e-flux scraping sync

frontend/
├── app/exhibitions/page.tsx                    # 전시 목록 (도시 탭, 상태 배지, 한글화)
├── app/exhibitions/[id]/ExhibitionDetailClient.tsx  # 전시 상세
├── app/api/exhibitions/route.ts                # 목록 API (daysUntilStart 추가)
├── app/api/exhibitions/[id]/route.ts           # 상세 API
├── components/exhibitions/ExhibitionPlaceholder.tsx  # 이미지 없을 때 플레이스홀더
├── next.config.js                              # 이미지 도메인 설정
└── lib/auth.ts                                 # NextAuth 설정 (throw 제거됨)
```

## 데이터 현황 (2026-02-15)

| 항목 | 수치 |
|------|------|
| 전시 총 건수 | 11,057 |
| 진행중 | ~1,200 |
| 예정 | ~800 |
| 종료 | ~9,000 |
| 도시 수 | 50+ |
| 국가 수 | 6+ |
| 소스 수 | 10+ (한국 API 3 + AIC + 갤러리 10 + 국제 5) |

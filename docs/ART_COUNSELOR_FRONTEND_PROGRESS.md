# SAYU Art Counselor Frontend 진행 현황 (2025-11-08)

## 신규 업데이트 (2025-11-08)
- `/art-counselor` 랜딩 페이지를 구축해 오늘의 작품, APT 추천 컬렉션, 서비스 철학 및 데일리 리추얼을 한 화면에서 소개합니다.
- Next.js API 프록시(`/api/art-counselor/*`, `/api/art-counselor/hybrid/*`)를 추가하여 프런트가 항상 동일한 엔드포인트를 호출하도록 정리했습니다.
- React 19 규칙에 맞춰 `useArtCounselorSession`/세션 페이지의 `zustand` selector를 안정화했고, 세션 진입 시 경고 없이 동작합니다.
- `supabaseArtService`가 `mood_atlas_artworks` 테이블을 읽도록 재작성되어 일일 추천/프레젠테이션/컬렉션이 실제 작품 ID를 반환합니다.
- 랜딩 페이지의 저널 & 메모리 섹션이 `/memory`, `/response/history` 데이터를 노출하며, API 응답이 없을 때는 샘플 카드로 UX를 유지합니다.

## 남은 TODO (업데이트)
1. `/api/art-counselor/journal`, `/preferences`, `/insights`를 실제 저장/조회 로직과 연결하고 UI에서 바로 쓸 수 있게 하기.
2. Complete 단계에서 자동으로 저널을 저장하고 랜딩 페이지 저널 리스트와 연동.
3. 커뮤니티 브리지(저널 공유/감정 메모리) UX를 설계하고 `/memory/search`·커뮤니티 엔드포인트와 연동.

---

## 이전 기록 (2025-XX-XX 스냅샷)

## 1. 현재 단계
- 하이브리드 상담 플로우(Opening → Exploration → Connection → Complete)용 핵심 페이지와 컴포넌트 구현 완료
- `zustand` 기반 세션 상태 관리, 하이브리드 API 연동 훅까지 작성
- UI는 기존 스타일과 조화를 유지하면서 APT 맞춤 문구/옵션을 단계별로 표시하도록 구현
- 지금은 **로컬 백엔드/프론트 동시에 띄워 실제 흐름을 검증**하고, 필요 시 카피·에지 케이스 처리 등을 다듬는 단계

## 2. 주요 구현 내용
- `frontend/app/art-counselor/session/[artworkId]/page.tsx`  
  ↳ 작품 소개, 대화 영역, 인사이트 패널의 3단 레이아웃 + 단계별 입력 컴포넌트 연결  
  ↳ Opening/Exploration/Connection/Complete 전환 로직과 사용자 메시지 기록 처리

- `frontend/hooks/useArtCounselorSession.ts`  
  ↳ `/api/art-counselor/hybrid/*`와 통신해 단계별 응답을 받아 상태/메시지/옵션 업데이트  
  ↳ free-input 경로, 세션 ID 관리, Complete 단계 요약 가공 처리

- `frontend/lib/art-counselor/*`  
  ↳ `types.ts`: 백엔드 응답 구조와 연동되는 타입 정의  
  ↳ `store.ts`: `zustand` 스토어(단계, 세션 메타, 메시지, 옵션, 로딩 등)  
  ↳ `utils.ts`: 메시지 ID 생성 등 유틸리티

- `frontend/components/art-counselor-hybrid/*`  
  ↳ Shell/Layout, Stage Indicator, MessageBubble, Opening/Exploration/Connection 입력 UI,  
    Complete 요약 카드, Session Insights 패널 등 핵심 컴포넌트 일체

## 3. 남은 TODO / 확인 사항
| 구분 | 내용 |
| --- | --- |
| 실행 확인 | 백엔드 `npm run dev`, 프론트 `npm run dev` 실행 후 `/art-counselor/session/<artworkId>` 플로우 직접 검증 |
| API 응답 | `/hybrid/*` 응답 구조가 `types.ts`와 동일한지 확인 (특히 options, message, summary) |
| 데이터/카피 | 기본 `CompletePayload`에 감정 키워드가 비어 있으므로 필요하면 백엔드에서 보강 |
| UI 다듬기 | Skeleton/Loading, 에러 상태, 모바일 반응형 세부 튜닝 여부 검토 |
| QA | APT 미설정 사용자 접근 보호(현재 `useAuth`로 리다이렉트), free-input 경로 안전망, 긴 문자열 UI 처리 등 복합 케이스 테스트 |

## 4. 실행 가이드 (로컬 테스트)
```powershell
# 터미널 1 – Backend
cd c:\Users\SAMSUNG\Documents\GitHub\SAYU\backend
npm run dev

# 터미널 2 – Frontend
cd c:\Users\SAMSUNG\Documents\GitHub\SAYU\frontend
npm run dev
```
이후 브라우저에서 `http://localhost:3000/art-counselor/session/<artworkId>`로 접속해 세션 전체 흐름을 확인.

## 5. 다음 작업 제안
1. 실제 입력으로 Opening → Exploration → Connection → Complete 전환 검증
2. 저널, 여정 페이지 등과의 링크/상태 연결 확인
3. UI/카피 피드백 반영 및 에러/로딩 상태 보강

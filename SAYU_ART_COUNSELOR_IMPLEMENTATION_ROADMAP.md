# SAYU Art Counselor 구현 로드맵

## 🎯 프로젝트 개요
SAYU의 16가지 성격 유형(APT)별 맞춤 작품 추천 시스템 구현

### 핵심 철학
- **관계 중심**: 사용자 내면과 예술의 연결
- **16가지 개성 존중**: 각 APT 유형별 고유한 UX/UI
- **MVP 우선**: 빠르고 동작하는 솔루션
- **완전한 구현**: TODO 없는 실제 동작 코드

---

## ✅ 완료된 작업 (Phase 1)

### 1. 데이터베이스 구축 ✅
- **16개 퍼블릭 도메인 작품 데이터 삽입 완료**
- 파일: `scripts/insert-16-artworks.sql`
- Supabase DB 테이블: `artworks`
- 한국 작품 3개 포함 (김홍도, 신윤복, 정선)
- 검증: 42개 총 작품 중 16개 목표 작품 확인됨

### 2. 백엔드 API 서비스 구축 ✅
- **Supabase 연동 서비스 완성**
- 파일: `backend/src/services/supabaseArtService.js`
- 기능: 작품 조회, 일일 추천, 프레젠테이션 생성
- 16가지 성격별 작품 매핑 데이터 준비됨

### 3. API 엔드포인트 구현 ✅
- **완전 동작하는 테스트 서버 구축**
- 파일: `simple-art-api-test.js` (포트 3009)
- 검증된 엔드포인트:
  - `GET /api/art-counselor/artworks` ✅
  - `GET /api/art-counselor/today` ✅
  - `GET /api/art-counselor/artwork/:id/presentation` ✅
  - `POST /api/art-counselor/journal` (스텁)
  - `GET /api/art-counselor/collection` (스텁)

### 4. 테스트 환경 구축 ✅
- **DB 연결 테스트**: `test-artworks-db.js`
- **프론트엔드 테스트 페이지**: `frontend/pages/test-api.tsx`
- **API 연결 확인**: 모든 핵심 기능 동작 검증

---

## 🚀 다음 단계 (Phase 2) - 성격별 추천 시스템

### 1. 성격별 추천 로직 구현 [다음 작업]

#### 1.1 성격 유형 정의 강화
```javascript
// 현재 상태: 기본 매핑만 존재
// 필요: 각 성격별 상세 특성 정의

const personalityDetails = {
  LAEF: {
    animal: "여우",
    traits: ["내향적", "추상적", "감정적", "유연함"],
    artPreferences: ["몽환적", "철학적", "실험적"],
    recommendedMoods: ["contemplation", "wonder", "mystery"]
  },
  // ... 16가지 모두 정의
}
```

#### 1.2 지능형 추천 알고리즘 구현
- 현재: 단순 배열 매핑
- 목표: 사용자 감정상태 + 성격 + 시간대 고려
- 파일 수정: `backend/src/services/supabaseArtService.js`

### 2. 프론트엔드 성격별 UX 구현

#### 2.1 성격 진단 페이지
- 파일 생성: `frontend/pages/personality-test.tsx`
- 16가지 성격 진단 로직
- 결과 저장 (Supabase users 테이블)

#### 2.2 성격별 UX 차별화 (UI는 공통 유지)
- **동일한 UI 컴포넌트 사용** (현실적 접근)
- 성격별 **작품 설명 톤과 내용** 차별화
- 성격별 **추천 알고리즘과 메시지** 개인화
- 성격별 **인터랙션 패턴** (빠른 추천 vs 깊은 탐색 등)

### 3. 작품 프레젠테이션 고도화

#### 3.1 성격별 작품 해석
```javascript
// 예시: 같은 작품, 다른 설명
"별이 빛나는 밤" + LAEF(여우) = "내면의 소용돌이와 우주의 신비"
"별이 빛나는 밤" + SREF(강아지) = "활기찬 에너지와 사회적 연결"
```

#### 3.2 감정 매칭 시스템
- 현재 감정상태 입력
- 작품의 감정 태그와 매칭
- 치유/성장 관점 추천

---

## 📋 Phase 3 - 고급 기능

### 1. 저널링 시스템 구현
- 작품 감상 기록
- 개인적 연결점 발견
- 성장 추적

### 2. 커뮤니티 기능
- 성격별 소그룹 형성
- 작품 토론 (익명/공개)
- 인사이트 공유

### 3. AI 큐레이션 강화
- GPT 기반 개인화 설명
- 작품간 연결고리 발견
- 예술 여정 가이드

---

## 🔧 기술적 구현 상세

### 현재 서버 구성
```bash
# 테스트 서버 실행 (검증됨)
cd C:\Users\SAMSUNG\documents\github\sayu
node simple-art-api-test.js
# → http://localhost:3009

# 데이터베이스 테스트
node test-artworks-db.js
# → 16/16 작품 확인됨
```

### 환경 설정
- Supabase URL: `https://hgltvdshuyfffskvjmst.supabase.co`
- 백엔드 환경변수: `backend/.env` (76개 변수 로드됨)
- 프론트엔드 설정: Next.js 기반

### 데이터 구조
```sql
-- artworks 테이블 스키마
CREATE TABLE artworks (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    artist VARCHAR(300),
    year_created VARCHAR(50),
    medium VARCHAR(200),
    dimensions VARCHAR(200),
    image_url TEXT,
    style VARCHAR(100),
    metadata JSONB  -- 성격별 추가 정보 저장
);
```

---

## 🎯 다음 세션 실행 계획

### 즉시 시작 가능한 작업
1. **서버 재시작**:
```bash
cd C:\Users\SAMSUNG\documents\github\sayu
node simple-art-api-test.js
```

2. **성격별 추천 로직 구현**:
- 파일: `backend/src/services/supabaseArtService.js`
- 함수: `selectDailyArtwork()` 개선
- 성격 유형 감지 → 맞춤 작품 선택

3. **테스트 및 검증**:
- 16가지 성격별 다른 추천 결과 확인
- API 응답 형식 표준화

### 우선순위
1. **HIGH**: 성격별 추천 알고리즘 구현
2. **MEDIUM**: 프론트엔드 성격 테스트 페이지
3. **MEDIUM**: 성격별 작품 해석 차별화
4. **LOW**: ~~UI 테마 시스템~~ (제외, 공통 UI 사용)

---

## 🛡️ 주의사항

### 서버 실행 시 문제해결
- 포트 충돌 시: 다른 포트 사용 (3010, 3011 등)
- 환경변수 오류 시: `backend/.env` 경로 확인
- Supabase 연결 실패 시: 서비스 키 확인

### 코드 품질 유지
- MVP 원칙: 완전 동작하는 간단한 솔루션
- TODO 금지: 모든 기능 완전 구현
- 에러 핸들링: 모든 API 엔드포인트에 try-catch

### 성격별 구현 시 고려사항 (현실적 접근)
- **UI는 공통 사용** (개발 효율성 고려)
- **UX만 성격별 차별화**: 추천 로직, 설명 톤, 메시지
- 16가지 유형별 **작품 해석과 추천 알고리즘** 차별화
- 사용자 존엄성과 공감 최우선

---

## 📊 성공 지표

### Phase 2 완료 기준
- [ ] 16가지 성격별 서로 다른 작품 추천
- [ ] 성격 진단 → 맞춤 추천 전체 플로우 동작
- [ ] 프론트엔드 테스트 페이지에서 성격별 **UX** 확인 (UI는 공통)

### 최종 목표
사용자가 5분 내에:
1. 성격 진단 완료
2. 맞춤 작품 추천 받기
3. 개인화된 작품 해석 경험
4. 저널 기록 남기기

---

**다음 세션에서는 `backend/src/services/supabaseArtService.js`의 `selectDailyArtwork()` 함수부터 시작하여 16가지 성격별 지능형 추천 시스템을 구현하겠습니다.**
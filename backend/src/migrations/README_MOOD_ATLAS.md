# Mood Atlas 데이터베이스 마이그레이션 가이드

> **완성 날짜:** 2025-01-07
> **상태:** ✅ 준비 완료 - 즉시 실행 가능

---

## 📋 개요

Mood Atlas 기능을 위한 데이터베이스 설정을 완료합니다.

**포함 내용:**
- 4개 테이블 생성 (regions, artworks, entries, progress)
- 7개 예술 대륙 데이터
- 41개 작품 데이터 (Cloudinary Public Domain)
- RLS 정책 설정

---

## 🚀 빠른 실행 (Supabase)

### 방법 1: SQL Editor 사용 (권장)

1. **Supabase Dashboard 접속**
   ```
   https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql
   ```

2. **3개 파일을 순서대로 실행**
   ```
   ✅ 001_create_mood_atlas_tables.sql
   ✅ 002_insert_mood_atlas_regions.sql
   ✅ 003_insert_mood_atlas_artworks.sql
   ```

3. **각 파일 내용 복사 → New Query → Run**

---

### 방법 2: Supabase CLI 사용

```bash
# 1. Supabase 로그인
supabase login

# 2. 프로젝트 링크
supabase link --project-ref [YOUR_PROJECT_REF]

# 3. 마이그레이션 실행
supabase db push

# 또는 개별 실행
psql $DATABASE_URL -f backend/src/migrations/001_create_mood_atlas_tables.sql
psql $DATABASE_URL -f backend/src/migrations/002_insert_mood_atlas_regions.sql
psql $DATABASE_URL -f backend/src/migrations/003_insert_mood_atlas_artworks.sql
```

---

## 📊 생성되는 데이터

### 1. 테이블 (4개)

| 테이블명 | 용도 | 행 수 |
|---------|------|-------|
| `mood_atlas_regions` | 7개 예술 대륙 정의 | 7 |
| `mood_atlas_artworks` | 작품 데이터 | 41 |
| `mood_atlas_entries` | 사용자 일일 감정 기록 | 0 (사용자 데이터) |
| `mood_atlas_progress` | 사용자별 진행 상황 | 0 (사용자 데이터) |

### 2. 지역 데이터 (7개)

```
🏛️ 르네상스 중심 (Day 1-10, 10타일)
🌊 인상주의 해안 (Day 11-25, 15타일)
🌋 표현주의 협곡 (Day 11-30, 20타일)
🏝️ 팝아트 섬 (Day 31-50, 20타일)
🌈 현대미술 군도 (Day 51-80, 30타일)
🏔️ 추상의 고원 (Day 81-120, 40타일)
🌌 초현실 심연 (Day 121-180, 60타일)

총 195 타일 = 약 6개월 완주
```

### 3. 작품 데이터 (41개)

| 지역 | 작품 수 | 대표 작가 |
|-----|--------|---------|
| 르네상스 중심 | 10 | Jan Vermeer, Rembrandt |
| 인상주의 해안 | 10 | Claude Monet, Renoir |
| 표현주의 협곡 | 10 | Vincent van Gogh, Munch |
| 추상의 고원 | 3 | Kandinsky, Mondrian |
| 초현실 심연 | 3 | Dalí, Chagall |
| 팝아트 섬 | 4 | Warhol 스타일 작품 |
| 현대미술 군도 | 1 | Contemporary |

---

## ✅ 검증 쿼리

마이그레이션 후 다음 쿼리로 검증하세요:

```sql
-- 1. 테이블 생성 확인
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'mood_atlas%';
-- 예상: 4개 테이블

-- 2. 지역 데이터 확인
SELECT icon, name_ko, total_tiles
FROM mood_atlas_regions
ORDER BY day_start;
-- 예상: 7개 지역

-- 3. 작품 데이터 확인
SELECT region, COUNT(*) as count
FROM mood_atlas_artworks
GROUP BY region
ORDER BY region;
-- 예상: 41개 작품

-- 4. 총 타일 수 확인
SELECT SUM(total_tiles) as total FROM mood_atlas_regions;
-- 예상: 195

-- 5. RLS 정책 확인
SELECT tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'mood_atlas%';
-- 예상: 8개 정책
```

---

## 🔧 문제 해결

### 오류: "relation already exists"

이미 테이블이 존재하는 경우:

```sql
-- 모든 데이터 삭제 후 재실행
DROP TABLE IF EXISTS mood_atlas_entries CASCADE;
DROP TABLE IF EXISTS mood_atlas_progress CASCADE;
DROP TABLE IF EXISTS mood_atlas_artworks CASCADE;
DROP TABLE IF EXISTS mood_atlas_regions CASCADE;

-- 그 다음 001번부터 다시 실행
```

### 오류: "foreign key constraint"

순서대로 실행되지 않은 경우:
- 반드시 `001 → 002 → 003` 순서로 실행
- regions → artworks → entries/progress 순서

### 데이터 재삽입 (작품/지역만)

```sql
-- 사용자 데이터는 유지하고 작품/지역만 재삽입
DELETE FROM mood_atlas_artworks;
DELETE FROM mood_atlas_regions;

-- 그 다음 002, 003번 다시 실행
```

---

## 📝 다음 단계

DB 설정이 완료되면:

1. **Backend API 구현**
   ```
   backend/src/routes/moodAtlasRoutes.js
   backend/src/controllers/moodAtlasController.js
   backend/src/services/moodAtlasService.js
   ```

2. **주요 API 엔드포인트**
   ```
   POST   /api/mood-atlas/entry          # 일일 감정 기록
   GET    /api/mood-atlas/progress       # 진행 상황 조회
   GET    /api/mood-atlas/recommend      # AI 작품 추천 (Groq)
   GET    /api/mood-atlas/regions        # 지역 목록
   GET    /api/mood-atlas/history        # 기록 히스토리
   ```

3. **Frontend 구현**
   ```
   frontend/components/mood-atlas/
   ├── ColorSelector.tsx
   ├── IntensitySlider.tsx
   ├── ArtworkCard.tsx
   ├── TileGrid.tsx
   └── RegionMap.tsx
   ```

---

## 📌 중요 사항

### 보안
- ✅ RLS 정책 설정 완료
- ✅ 사용자는 자신의 데이터만 조회/수정 가능
- ✅ regions, artworks는 모두 읽기 전용

### 성능
- ✅ 필요한 인덱스 모두 설정
- ✅ JSONB 타입 활용 (감정 메시지)
- ✅ GIN 인덱스 (tags 검색)

### 확장성
- ✅ ON CONFLICT DO NOTHING (재실행 가능)
- ✅ 지역/작품 추가 가능한 구조
- ✅ 복합 감정 지원 (is_complex)

---

## 📞 지원

문제 발생 시:
1. 검증 쿼리 실행
2. Supabase Logs 확인
3. 문제 해결 섹션 참고

---

**✨ 모든 준비 완료! 이제 API 개발을 시작하세요.**

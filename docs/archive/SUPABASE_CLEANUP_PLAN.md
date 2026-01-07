# Supabase Database Cleanup Plan
**작성일**: 2026-01-01
**작성자**: BMAD Architect + Claude Code
**목적**: 211개 테이블을 40개로 축소 (80% 감소)

---

## 1. Risk Assessment (위험도 평가)

### Phase 1: 백업 테이블 삭제 (7개)
- **Risk Level**: ⚠️ **MEDIUM**
- **Reason**:
  - ✅ 이름에 `_backup` 또는 `_unified`가 포함되어 명확한 백업/임시 테이블
  - ✅ 기존 migration 스크립트 (`99-unified-venue-exhibition-system.sql`)에서 백업 목적으로 생성됨
  - ⚠️ **BUT**: `exhibitions_master` 테이블은 일부 SQL 파일에서 **INSERT 구문으로 사용 중**
  - ⚠️ 현재 production 데이터가 어느 테이블에 있는지 불명확 (venues vs venues_unified)
- **Dependencies**:
  - `exhibitions_backup` → 없음 (백업 전용)
  - `exhibitions_unified` → **venues_unified(venue_id)** FK 존재
  - `exhibitions_master` → 일부 배치 SQL 스크립트에서 INSERT 사용
  - `venues_backup`, `venues_unified`, `global_*_backup` → 없음
- **실제 영향**:
  - 코드베이스에서 직접 참조 없음
  - 단, 과거 마이그레이션 스크립트가 이들 테이블을 생성했으므로 데이터가 존재할 가능성 있음
- **권장 사항**:
  - ⚠️ **삭제 전 반드시 데이터 카운트 확인**
  - ⚠️ **현재 production에서 사용 중인 실제 테이블 확인 필요**
  - ✅ 데이터가 비어있거나 이미 메인 테이블로 마이그레이션 완료된 경우에만 삭제

### Phase 2: Gamification 삭제 (~20개)
- **Risk Level**: 🟢 **LOW**
- **Reason**:
  - ✅ 현재 애플리케이션에서 gamification 기능 미구현
  - ✅ `/backend/migrations/gamification-schema.sql`에만 존재
  - ✅ 실제 코드에서 사용되지 않음 (controller/service는 있지만 route에 연결 안 됨)
  - ✅ 모든 FK가 `users(id)` 참조로 단순함
- **Dependencies**:
  - `user_gamification` ← `activity_logs`, `user_titles`, `title_progress`, `user_challenges`, `daily_stats`, `leaderboard_*`
  - `titles` ← `user_titles`, `title_progress`, `challenges`
  - `challenges` ← `user_challenges`
  - `gamification_events` ← 독립 테이블
  - `exhibition_sessions` ← 독립 테이블 (gamification 전용)
- **CASCADE 영향**:
  - ✅ 모두 gamification 도메인 내에서만 연결됨
  - ✅ 핵심 기능(exhibitions, users, collections)과 무관
- **삭제 대상**:
  ```
  user_gamification, activity_logs, titles, user_titles, title_progress,
  challenges, user_challenges, daily_stats, leaderboard_weekly,
  leaderboard_monthly, gamification_events, exhibition_sessions,
  user_achievements, user_badges, user_points, user_streaks,
  gamification_levels, gamification_points, milestone_achievements,
  habit_rewards, user_unlocks
  ```

### Phase 3: 미사용 기능 삭제 (~30개)
- **Risk Level**: 🟢 **LOW-MEDIUM**
- **Reason**:
  - ✅ Village, Email, Agent, Calendar 등 명백히 미구현 기능
  - ⚠️ 일부는 초기 기획에만 존재하고 실제 코드 없음
- **세부 분류**:

  **🏘️ Village 시스템 (4개)** - Risk: LOW
  - `villages`, `village_memberships`, `village_events`, `personality_village_mapping`
  - 완전히 미구현, 코드 참조 없음

  **📧 Email/Notification (10개)** - Risk: MEDIUM
  - `email_logs`, `email_preferences`, `email_verification_tokens`, `password_reset_tokens`
  - `push_subscriptions`, `notification_logs`, `notifications`, `user_notifications`
  - ⚠️ **주의**: Supabase Auth가 자체 이메일 시스템 사용 중일 수 있음
  - ⚠️ `email_verification_tokens`, `password_reset_tokens`는 삭제 전 확인 필요

  **🤖 Agent/AI (2개)** - Risk: LOW
  - `agent_conversations`, `sayu_functions`
  - 현재 미사용, AI 기능은 API 직접 호출 방식

  **📅 Calendar (3개)** - Risk: LOW
  - `calendar_sync_settings`, `calendar_view_stats`, `event_participations`
  - 캘린더 연동 기능 미구현

  **🔬 Artvee/외부 API (4개)** - Risk: LOW
  - `artvee_artworks`, `artvee_collection_jobs`, `external_api_configs`, `scraping_configurations`
  - 현재 Artvee 데이터 수집 중단 상태

  **기타 (7개)** - Risk: LOW
  - `phase_reveals`, `token_transactions`, `leaderboard_cache`, `online_users`, `user_sessions`
  - `cron_job_logs`, `daily_visits`, `data_enrichment_batches`, `image_optimization_queue`

- **삭제 전 확인 필요**:
  - ⚠️ `email_verification_tokens`, `password_reset_tokens` - Supabase Auth 연동 확인
  - ⚠️ `user_sessions` - 세션 관리 방식 확인

### Phase 4: 고급 기능 보류 (~40개)
- **Risk Level**: 🟡 **MEDIUM-HIGH**
- **Reason**:
  - ⚠️ Phase 4+ 로드맵에 포함된 기능들
  - ⚠️ 삭제하면 나중에 재구현 필요
  - ⚠️ 일부는 현재 실험적으로 사용 중일 수 있음
- **삭제 보류 권장**:

  **🎨 고급 작품 분석 (10개)**
  - `artwork_interpretation_archive`, `interpretation_feedback`
  - `artwork_similarities`, `artwork_personality_tags`, `artwork_enrichments`
  - `artwork_color_analysis`, `artworks_vectors`, `emotion_vectors`
  - `user_preference_vectors`, `artwork_viewing_behavior`
  - **보류 이유**: Phase 3-4 AI 추천 시스템에 필요

  **📈 성장/Evolution (10개)**
  - `art_comprehension_evolution`, `evolution_activities`, `evolution_history`
  - `evolution_statistics`, `growth_milestones`, `emotional_milestones`
  - `empathy_development`, `contemplative_depth_tracking`
  - `mutual_learning_tracking`, `knowledge_reproduction_cycle`
  - **보류 이유**: 핵심 철학 구현 (단계적 성장 추적)

  **📊 고급 통계/분석 (8개)**
  - `recommendation_history`, `recommendation_metrics`, `recommendation_feedback`
  - `user_activity_patterns`, `social_interactions`, `data_quality_scores`
  - **보류 이유**: 향후 데이터 분석 및 개선에 필요

  **기타 보류 (12개)**
  - `exhibitions_translations` (다국어 지원 예정)
  - `user_action_logs` (상세 로그 분석용)
  - 기타 미래 기능용 테이블

- **권장 조치**:
  - 🔒 **삭제하지 말고 보존**
  - 📝 향후 로드맵 구현 시 재평가

---

## 2. Dependency Analysis (의존성 분석)

### Foreign Key Constraints 맵

#### 핵심 테이블 FK 체인
```
users (root)
├── profiles (user_id)
├── user_profiles (user_id)
├── user_activities (user_id)
├── quiz_sessions (user_id)
│   ├── quiz_answers (session_id)
│   └── quiz_results (session_id)
├── collections (user_id)
│   ├── collection_items (collection_id)
│   ├── collection_likes (collection_id)
│   └── collection_comments (collection_id)
└── art_memories (user_id)

venues (root)
└── exhibitions (venue_id)
    ├── exhibition_visits (exhibition_id) ⭐ Phase 1 MVP
    │   └── artwork_records (visit_id) ⭐ Phase 1 MVP
    │       └── exhibition_artworks (artwork_id) ⭐ Phase 1 MVP
    ├── exhibition_views (exhibition_id)
    ├── exhibition_likes (exhibition_id)
    └── user_saved_exhibitions (exhibition_id)

artists (root)
└── artworks (artist_id)
    └── exhibition_artworks (artwork_id)
```

#### Gamification FK 체인 (삭제 대상)
```
users
├── user_gamification (user_id) ← CASCADE DELETE
│   ├── activity_logs (user_id)
│   ├── user_titles (user_id)
│   ├── title_progress (user_id)
│   ├── user_challenges (user_id)
│   └── daily_stats (user_id)
└── exhibition_sessions (user_id)

titles (독립)
├── user_titles (title_id)
├── title_progress (title_id)
└── challenges (reward_title_id)

challenges (독립)
└── user_challenges (challenge_id)
```

### CASCADE 영향 범위

#### Phase 1 백업 테이블 삭제
```sql
-- CASCADE 체인 확인
exhibitions_unified (삭제)
└── ON DELETE CASCADE 없음 (백업 테이블이므로 참조 없을 것)

venues_unified (삭제)
└── exhibitions_unified.venue_id → CASCADE 삭제될 exhibitions_unified 행들
```
⚠️ **주의**: `exhibitions_unified`에 실제 데이터가 있고 다른 테이블이 참조 중이면 문제 발생

#### Phase 2 Gamification 삭제
```sql
-- 1단계: 자식 테이블 먼저 삭제
DROP TABLE activity_logs CASCADE;
DROP TABLE user_titles CASCADE;
DROP TABLE title_progress CASCADE;
DROP TABLE user_challenges CASCADE;
DROP TABLE daily_stats CASCADE;
DROP TABLE leaderboard_weekly CASCADE;
DROP TABLE leaderboard_monthly CASCADE;
DROP TABLE exhibition_sessions CASCADE;
DROP TABLE user_achievements CASCADE;
DROP TABLE user_badges CASCADE;

-- 2단계: 부모 테이블 삭제
DROP TABLE user_gamification CASCADE;
DROP TABLE challenges CASCADE;
DROP TABLE titles CASCADE;
DROP TABLE gamification_events CASCADE;
DROP TABLE gamification_levels CASCADE;
DROP TABLE gamification_points CASCADE;
```

### Views/Functions 영향

#### Gamification 관련 뷰 삭제 필요
- `user_stats_summary` - user_gamification 기반 뷰

#### Gamification 관련 함수 삭제 필요
- `get_level_name(INTEGER)` - 레벨 이름 반환
- `update_user_points()` - activity_logs INSERT 시 트리거

#### Gamification 관련 트리거 삭제 필요
- `trigger_update_user_points` - activity_logs 테이블용
- `update_user_gamification_updated_at` - user_gamification 테이블용

---

## 3. Execution Plan (단계별 실행 계획)

### Step 0: Pre-cleanup Preparation (사전 준비)

**목적**: 데이터 안전성 확보 및 현황 파악

```sql
-- 0.1 전체 테이블 목록 및 행 수 확인
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = schemaname AND table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 0.2 Phase 1 대상 테이블 데이터 확인
SELECT 'exhibitions_backup' as table_name, COUNT(*) as row_count FROM exhibitions_backup
UNION ALL
SELECT 'exhibitions_unified', COUNT(*) FROM exhibitions_unified
UNION ALL
SELECT 'exhibitions_master', COUNT(*) FROM exhibitions_master
UNION ALL
SELECT 'venues_backup', COUNT(*) FROM venues_backup
UNION ALL
SELECT 'venues_unified', COUNT(*) FROM venues_unified
UNION ALL
SELECT 'global_exhibitions_backup', COUNT(*) FROM global_exhibitions_backup
UNION ALL
SELECT 'global_venues_backup', COUNT(*) FROM global_venues_backup;

-- 0.3 현재 production 테이블 확인
SELECT 'exhibitions' as table_name, COUNT(*) as row_count FROM exhibitions
UNION ALL
SELECT 'venues', COUNT(*) FROM venues;

-- 0.4 FK 관계 확인
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'exhibitions_backup', 'exhibitions_unified', 'exhibitions_master',
        'venues_backup', 'venues_unified',
        'global_exhibitions_backup', 'global_venues_backup'
    );
```

**Action Items**:
1. ✅ Supabase Dashboard에서 SQL Editor로 위 쿼리 실행
2. ✅ 결과를 `CLEANUP_ANALYSIS_RESULTS.md` 파일에 저장
3. ⚠️ **CRITICAL**: row_count > 0인 테이블이 있으면 **삭제 중단** 후 데이터 마이그레이션 먼저 실행
4. ✅ 전체 데이터베이스 백업 생성 (Supabase Dashboard → Database → Backups)

---

### Step 1: Phase 1 Execution (백업 테이블 삭제)

**전제 조건**:
- ✅ Step 0 완료 및 검증
- ✅ 백업 테이블이 비어있거나 데이터가 메인 테이블로 마이그레이션 완료
- ✅ 전체 백업 완료

```sql
-- 1.1 트랜잭션 시작
BEGIN;

-- 1.2 삭제 전 최종 확인 (다시 한번)
SELECT 'exhibitions_backup' as table_name, COUNT(*) as row_count FROM exhibitions_backup
UNION ALL
SELECT 'exhibitions_unified', COUNT(*) FROM exhibitions_unified
UNION ALL
SELECT 'exhibitions_master', COUNT(*) FROM exhibitions_master
UNION ALL
SELECT 'venues_backup', COUNT(*) FROM venues_backup
UNION ALL
SELECT 'venues_unified', COUNT(*) FROM venues_unified
UNION ALL
SELECT 'global_exhibitions_backup', COUNT(*) FROM global_exhibitions_backup
UNION ALL
SELECT 'global_venues_backup', COUNT(*) FROM global_venues_backup;

-- ⚠️ 위 결과에서 row_count > 0이면 ROLLBACK 후 중단!

-- 1.3 뷰 삭제 (venues_unified/exhibitions_unified 참조하는 뷰가 있다면)
-- 주의: 99-unified-venue-exhibition-system.sql에서 생성한 뷰 확인
DROP VIEW IF EXISTS venues CASCADE; -- venues_unified 기반 뷰
DROP VIEW IF EXISTS exhibitions CASCADE; -- exhibitions_unified 기반 뷰

-- 1.4 백업 테이블 삭제
DROP TABLE IF EXISTS exhibitions_backup CASCADE;
DROP TABLE IF EXISTS global_exhibitions_backup CASCADE;
DROP TABLE IF EXISTS exhibitions_master CASCADE;
DROP TABLE IF EXISTS exhibitions_unified CASCADE;

DROP TABLE IF EXISTS venues_backup CASCADE;
DROP TABLE IF EXISTS global_venues_backup CASCADE;
DROP TABLE IF EXISTS venues_unified CASCADE;

-- 1.5 삭제 확인
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename LIKE '%backup%'
    OR tablename LIKE '%unified%'
    OR tablename = 'exhibitions_master';
-- 결과: 0 rows (성공)

-- 1.6 커밋 (문제 없으면)
COMMIT;
-- 문제 있으면: ROLLBACK;
```

**Validation**:
```sql
-- 메인 테이블 정상 작동 확인
SELECT COUNT(*) FROM exhibitions;
SELECT COUNT(*) FROM venues;

-- FK 관계 정상 확인
SELECT e.id, e.title, v.name
FROM exhibitions e
JOIN venues v ON e.venue_id = v.id
LIMIT 10;
```

---

### Step 2: Phase 2 Execution (Gamification 삭제)

**전제 조건**:
- ✅ Phase 1 완료 및 검증
- ✅ Gamification 기능 사용 안 함 확인

```sql
BEGIN;

-- 2.1 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_user_points ON activity_logs;
DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;

-- 2.2 함수 삭제
DROP FUNCTION IF EXISTS update_user_points() CASCADE;
DROP FUNCTION IF EXISTS get_level_name(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE; -- 주의: 다른 곳에서도 사용될 수 있음

-- 2.3 뷰 삭제
DROP VIEW IF EXISTS user_stats_summary CASCADE;

-- 2.4 자식 테이블 먼저 삭제 (FK 순서대로)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_titles CASCADE;
DROP TABLE IF EXISTS title_progress CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS leaderboard_weekly CASCADE;
DROP TABLE IF EXISTS leaderboard_monthly CASCADE;
DROP TABLE IF EXISTS exhibition_sessions CASCADE;

-- 추가 gamification 테이블들
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS user_unlocks CASCADE;
DROP TABLE IF EXISTS milestone_achievements CASCADE;
DROP TABLE IF EXISTS habit_rewards CASCADE;

-- 2.5 부모 테이블 삭제
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS titles CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS gamification_events CASCADE;
DROP TABLE IF EXISTS gamification_levels CASCADE;
DROP TABLE IF EXISTS gamification_points CASCADE;

-- 2.6 검증
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND (
        tablename LIKE '%gamification%'
        OR tablename LIKE '%leaderboard%'
        OR tablename IN ('titles', 'challenges', 'activity_logs', 'daily_stats')
    );
-- 결과: 0 rows

COMMIT;
```

---

### Step 3: Phase 3 Execution (미사용 기능 삭제)

**전제 조건**:
- ✅ Phase 2 완료
- ⚠️ Email/Notification 테이블 중 Supabase Auth 연동 확인

```sql
BEGIN;

-- 3.1 Village 시스템 (안전)
DROP TABLE IF EXISTS village_memberships CASCADE;
DROP TABLE IF EXISTS village_events CASCADE;
DROP TABLE IF EXISTS personality_village_mapping CASCADE;
DROP TABLE IF EXISTS villages CASCADE;

-- 3.2 Agent/AI (안전)
DROP TABLE IF EXISTS agent_conversations CASCADE;
DROP TABLE IF EXISTS sayu_functions CASCADE;

-- 3.3 Calendar (안전)
DROP TABLE IF EXISTS event_participations CASCADE;
DROP TABLE IF EXISTS calendar_sync_settings CASCADE;
DROP TABLE IF EXISTS calendar_view_stats CASCADE;

-- 3.4 Artvee/외부 API (안전)
DROP TABLE IF EXISTS artvee_collection_jobs CASCADE;
DROP TABLE IF EXISTS artvee_artworks CASCADE;
DROP TABLE IF EXISTS external_api_configs CASCADE;
DROP TABLE IF EXISTS scraping_configurations CASCADE;

-- 3.5 기타 미사용 (안전)
DROP TABLE IF EXISTS phase_reveals CASCADE;
DROP TABLE IF EXISTS token_transactions CASCADE;
DROP TABLE IF EXISTS leaderboard_cache CASCADE;
DROP TABLE IF EXISTS online_users CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE; -- ⚠️ 세션 관리 방식 확인 후
DROP TABLE IF EXISTS cron_job_logs CASCADE;
DROP TABLE IF EXISTS daily_visits CASCADE;
DROP TABLE IF EXISTS data_enrichment_batches CASCADE;
DROP TABLE IF EXISTS image_optimization_queue CASCADE;
DROP TABLE IF EXISTS image_usage_log CASCADE;

-- 3.6 Email/Notification (⚠️ 주의 - Supabase Auth 확인 후 실행)
-- ⚠️ 아래는 Supabase Auth와 무관함을 확인한 후에만 실행
-- DROP TABLE IF EXISTS email_logs CASCADE;
-- DROP TABLE IF EXISTS email_preferences CASCADE;
-- DROP TABLE IF EXISTS email_verification_tokens CASCADE; -- ⚠️ Auth 관련
-- DROP TABLE IF EXISTS password_reset_tokens CASCADE; -- ⚠️ Auth 관련
-- DROP TABLE IF EXISTS push_subscriptions CASCADE;
-- DROP TABLE IF EXISTS notification_logs CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS user_notifications CASCADE;

COMMIT;
```

---

### Step 4: Phase 4 - NO ACTION (보류)

**Phase 4 테이블은 삭제하지 않고 보존합니다.**

이유:
- 🎨 AI 추천/분석 시스템 (Phase 3-4 로드맵)
- 📈 성장/Evolution 추적 (핵심 철학)
- 🔬 향후 데이터 분석 및 개선

**보존 대상**:
```
artwork_interpretation_archive, interpretation_feedback, artwork_similarities,
artwork_personality_tags, artwork_enrichments, artwork_color_analysis,
artworks_vectors, emotion_vectors, user_preference_vectors,
art_comprehension_evolution, evolution_activities, evolution_history,
evolution_statistics, growth_milestones, emotional_milestones,
empathy_development, contemplative_depth_tracking, mutual_learning_tracking,
knowledge_reproduction_cycle, recommendation_history, recommendation_metrics,
recommendation_feedback, user_activity_patterns, social_interactions,
exhibitions_translations, user_action_logs, data_quality_scores
```

---

## 4. Rollback Strategy (롤백 전략)

### Phase 1 Rollback

**시나리오**: Phase 1 실행 후 문제 발견 (예: 메인 테이블 데이터 손실)

**즉시 롤백** (트랜잭션 내):
```sql
ROLLBACK;
```

**Backup에서 복구** (트랜잭션 커밋 후 문제 발견):
```sql
-- Supabase Dashboard → Database → Backups → Restore
-- 또는 pg_restore 사용
```

### Phase 2 Rollback

**테이블 재생성**:
```sql
-- backend/migrations/gamification-schema.sql 파일 재실행
\i backend/migrations/gamification-schema.sql
```

**데이터 복구**:
- Supabase Backup에서 gamification 관련 테이블만 선택 복구

### Phase 3 Rollback

```sql
-- 각 기능별 migration 파일 재실행
-- Village: backend/migrations/update-village-clustering.sql
-- Email: backend/migrations/add-email-system.sql
-- 등...
```

---

## 5. SQL Scripts

### Phase 1: Safe Deletion (백업 테이블)

```sql
-- =============================================================================
-- SAYU Database Cleanup - Phase 1: Backup Tables Deletion
-- =============================================================================
-- 날짜: 2026-01-01
-- 대상: 백업/통합 테이블 7개
-- 위험도: MEDIUM
--
-- ⚠️ 경고:
-- 1. 반드시 Step 0 (Pre-cleanup) 먼저 실행
-- 2. 백업 테이블에 데이터가 있으면 실행 중단
-- 3. 전체 데이터베이스 백업 완료 후 실행
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- STEP 1: Pre-execution Validation
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    backup_count INTEGER;
    unified_count INTEGER;
    master_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM exhibitions_backup;
    SELECT COUNT(*) INTO unified_count FROM exhibitions_unified;
    SELECT COUNT(*) INTO master_count FROM exhibitions_master;

    RAISE NOTICE '=== PRE-EXECUTION CHECK ===';
    RAISE NOTICE 'exhibitions_backup rows: %', backup_count;
    RAISE NOTICE 'exhibitions_unified rows: %', unified_count;
    RAISE NOTICE 'exhibitions_master rows: %', master_count;

    IF backup_count > 0 OR unified_count > 0 OR master_count > 0 THEN
        RAISE EXCEPTION '❌ ABORT: Backup tables contain data! Manual migration required.';
    END IF;

    RAISE NOTICE '✅ All backup tables are empty. Safe to proceed.';
END $$;

-- -----------------------------------------------------------------------------
-- STEP 2: Drop Views (if they reference _unified tables)
-- -----------------------------------------------------------------------------
-- 주의: 99-unified-venue-exhibition-system.sql에서 생성한 뷰들
-- 실제 production에서 이 뷰들이 사용 중이라면 재생성 필요

-- 뷰 존재 확인
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN ('venues', 'exhibitions');

-- 뷰 삭제 (venues_unified/exhibitions_unified 기반인 경우)
-- ⚠️ 주의: 메인 테이블을 뷰로 래핑했을 수 있으므로 확인 후 실행
-- DROP VIEW IF EXISTS venues CASCADE;
-- DROP VIEW IF EXISTS exhibitions CASCADE;

-- -----------------------------------------------------------------------------
-- STEP 3: Drop Backup Tables
-- -----------------------------------------------------------------------------
RAISE NOTICE '=== DROPPING BACKUP TABLES ===';

-- Exhibition 관련 백업 테이블
DROP TABLE IF EXISTS exhibitions_backup CASCADE;
RAISE NOTICE '✓ Dropped: exhibitions_backup';

DROP TABLE IF EXISTS global_exhibitions_backup CASCADE;
RAISE NOTICE '✓ Dropped: global_exhibitions_backup';

DROP TABLE IF EXISTS exhibitions_master CASCADE;
RAISE NOTICE '✓ Dropped: exhibitions_master';

DROP TABLE IF EXISTS exhibitions_unified CASCADE;
RAISE NOTICE '✓ Dropped: exhibitions_unified';

-- Venue 관련 백업 테이블
DROP TABLE IF EXISTS venues_backup CASCADE;
RAISE NOTICE '✓ Dropped: venues_backup';

DROP TABLE IF EXISTS global_venues_backup CASCADE;
RAISE NOTICE '✓ Dropped: global_venues_backup';

DROP TABLE IF EXISTS venues_unified CASCADE;
RAISE NOTICE '✓ Dropped: venues_unified';

-- -----------------------------------------------------------------------------
-- STEP 4: Post-deletion Verification
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_tables
    WHERE schemaname = 'public'
        AND (
            tablename LIKE '%_backup'
            OR tablename LIKE '%_unified'
            OR tablename = 'exhibitions_master'
        );

    RAISE NOTICE '=== POST-DELETION CHECK ===';
    RAISE NOTICE 'Remaining backup/unified tables: %', remaining_count;

    IF remaining_count > 0 THEN
        RAISE WARNING 'Some backup tables still exist. Check manually.';
    ELSE
        RAISE NOTICE '✅ All Phase 1 tables successfully deleted.';
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- STEP 5: Validate Main Tables
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    exhibitions_count INTEGER;
    venues_count INTEGER;
    valid_fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO exhibitions_count FROM exhibitions;
    SELECT COUNT(*) INTO venues_count FROM venues;
    SELECT COUNT(*) INTO valid_fk_count
    FROM exhibitions e
    JOIN venues v ON e.venue_id = v.id;

    RAISE NOTICE '=== MAIN TABLES VALIDATION ===';
    RAISE NOTICE 'Exhibitions count: %', exhibitions_count;
    RAISE NOTICE 'Venues count: %', venues_count;
    RAISE NOTICE 'Valid FK relationships: %', valid_fk_count;

    IF exhibitions_count = 0 OR venues_count = 0 THEN
        RAISE EXCEPTION '❌ CRITICAL: Main tables are empty! ROLLBACK immediately!';
    END IF;

    RAISE NOTICE '✅ Main tables are healthy.';
END $$;

-- -----------------------------------------------------------------------------
-- COMMIT or ROLLBACK
-- -----------------------------------------------------------------------------
-- 위의 모든 검증이 통과하면:
COMMIT;

-- 문제가 있으면:
-- ROLLBACK;

-- =============================================================================
-- END OF PHASE 1
-- =============================================================================
```

### Phase 2-4: Execution Scripts (Phase 1 검증 후 제공 예정)

**Phase 2 (Gamification)** - 별도 파일로 제공:
- `CLEANUP_PHASE2_GAMIFICATION.sql`

**Phase 3 (미사용 기능)** - 별도 파일로 제공:
- `CLEANUP_PHASE3_UNUSED_FEATURES.sql`

**Phase 4** - 실행하지 않음 (보존)

---

## 6. Post-Cleanup Actions (정리 후 조치)

### 1. Migration 파일 정리

**삭제된 테이블 관련 migration 파일 아카이브**:
```bash
mkdir -p backend/migrations/archived
mv backend/migrations/gamification-schema.sql backend/migrations/archived/
mv backend/migrations/99-unified-venue-exhibition-system.sql backend/migrations/archived/
# ... 기타 삭제된 기능 관련 파일들
```

### 2. 코드베이스 정리

**삭제된 테이블 참조 제거**:
```bash
# Gamification controller/service 삭제
rm -f backend/src/controllers/gamificationController.js
rm -f backend/src/services/gamificationService.js

# Config 파일 업데이트
# backend/src/config/hybridDatabase.js에서 gamification 관련 설정 제거
```

### 3. 문서 업데이트

**업데이트 필요 문서**:
- `README.md` - 데이터베이스 스키마 섹션
- `ARCHITECTURE.md` - 시스템 아키텍처 다이어그램
- `API_DOCS.md` - 삭제된 엔드포인트 제거

### 4. 성능 최적화

```sql
-- VACUUM으로 디스크 공간 회수
VACUUM FULL ANALYZE;

-- 통계 업데이트
ANALYZE;
```

### 5. 모니터링

**삭제 후 1주일간 모니터링**:
- ❌ 애플리케이션 에러 로그에 삭제된 테이블 참조 에러 없는지 확인
- ✅ Supabase Dashboard → Logs → Postgres Logs
- ✅ Sentry/로그 시스템에서 SQL 에러 모니터링

---

## 7. Emergency Recovery Plan (긴급 복구 계획)

### 시나리오 1: Phase 1 실행 후 메인 테이블 데이터 손실

```sql
-- 1. 즉시 애플리케이션 중단
-- 2. Supabase Dashboard → Database → Backups
-- 3. 최신 백업 선택 → Restore
-- 4. 복구 완료 후 데이터 무결성 확인
SELECT COUNT(*) FROM exhibitions;
SELECT COUNT(*) FROM venues;
```

### 시나리오 2: Phase 2 실행 후 Gamification 기능 필요

```sql
-- 1. gamification-schema.sql 재실행
\i backend/migrations/gamification-schema.sql

-- 2. 백업에서 데이터 복구 (필요시)
-- Supabase Dashboard → Backups → Point-in-time Recovery
```

### 시나리오 3: FK 관계 손상

```sql
-- FK 무결성 검증
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f';

-- FK 재생성 (필요시)
ALTER TABLE exhibitions
ADD CONSTRAINT exhibitions_venue_id_fkey
FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE;
```

---

## 8. Final Checklist (최종 체크리스트)

### Phase 1 실행 전
- [ ] Step 0 (Pre-cleanup) 완료
- [ ] 모든 백업 테이블 row_count = 0 확인
- [ ] 전체 데이터베이스 백업 완료
- [ ] Supabase 프로젝트 백업 다운로드 (로컬 저장)
- [ ] 팀원에게 작업 공지
- [ ] 애플리케이션 점검 모드 활성화 (선택)

### Phase 1 실행 후
- [ ] 메인 테이블 (exhibitions, venues) 데이터 확인
- [ ] FK 관계 정상 작동 확인
- [ ] 애플리케이션 정상 작동 확인
- [ ] 에러 로그 확인 (24시간)

### Phase 2 실행 전
- [ ] Phase 1 완료 및 검증 완료
- [ ] Gamification 미사용 재확인
- [ ] 코드베이스에서 gamification 참조 없음 확인

### Phase 2 실행 후
- [ ] Gamification 테이블 삭제 확인
- [ ] 뷰/함수/트리거 삭제 확인
- [ ] 애플리케이션 에러 없음 확인

### Phase 3 실행 전
- [ ] Phase 2 완료 및 검증 완료
- [ ] Email/Auth 관련 테이블 Supabase Auth 연동 확인
- [ ] 삭제 대상 테이블 최종 검토

### Phase 3 실행 후
- [ ] 삭제 대상 테이블 모두 제거 확인
- [ ] 보존 대상 테이블 (Phase 4) 정상 확인
- [ ] Migration 파일 아카이브
- [ ] 코드베이스 정리
- [ ] 문서 업데이트
- [ ] VACUUM FULL 실행

---

## 9. Success Metrics (성공 지표)

### Before Cleanup
- **총 테이블 수**: 211개
- **실제 사용**: ~40개 (19%)
- **미사용**: ~170개 (81%)
- **데이터베이스 크기**: ? MB (Step 0에서 측정)

### After Phase 1
- **삭제 테이블**: 7개
- **남은 테이블**: 204개
- **디스크 공간 절감**: ? MB

### After Phase 2
- **삭제 테이블**: ~20개
- **남은 테이블**: ~184개
- **디스크 공간 절감**: ? MB

### After Phase 3
- **삭제 테이블**: ~30개
- **남은 테이블**: ~154개 (Phase 4 보존 포함)
- **디스크 공간 절감**: ? MB

### Target (Phase 4 제외)
- **최종 테이블 수**: ~114개 (Phase 4 보존 40개 포함)
- **감소율**: 46%
- **순수 사용 테이블**: ~40개 (핵심 기능)

---

## 10. Notes & Warnings (주의사항 및 참고)

### ⚠️ CRITICAL WARNINGS

1. **절대 Production에서 먼저 실행하지 마세요**
   - Development 환경에서 먼저 테스트
   - Staging 환경에서 검증
   - Production은 최후

2. **백업 테이블에 데이터가 있으면 즉시 중단**
   - `exhibitions_backup`, `exhibitions_unified`, `exhibitions_master` 등
   - 데이터가 있으면 마이그레이션 먼저 실행

3. **Email/Auth 관련 테이블 주의**
   - `email_verification_tokens`, `password_reset_tokens`
   - Supabase Auth가 사용 중일 수 있음
   - 삭제 전 Supabase Auth 설정 확인

4. **뷰 재생성 필요**
   - `99-unified-venue-exhibition-system.sql`에서 생성한 뷰들
   - 삭제 후 메인 테이블 기반으로 재생성 필요 (필요시)

### 📝 NOTES

1. **Phase 4 테이블은 삭제하지 않습니다**
   - AI 추천, Evolution 등 향후 로드맵 기능
   - 디스크 공간보다 미래 가치 우선

2. **Migration 파일 아카이브**
   - 삭제된 테이블 migration은 `archived/` 폴더로 이동
   - 완전 삭제하지 않고 보존

3. **트랜잭션 사용**
   - 모든 Phase는 BEGIN/COMMIT으로 감싸기
   - 문제 발생 시 ROLLBACK 가능

4. **점진적 실행**
   - Phase 1 → 검증 → Phase 2 → 검증 → Phase 3
   - 한 번에 모두 실행하지 않기

---

**최종 승인자**: _________________
**실행 날짜**: _________________
**실행 완료**: _________________

---

**다음 단계**:
1. Step 0 실행 및 결과 분석
2. CLEANUP_ANALYSIS_RESULTS.md 작성
3. 팀 리뷰 및 승인
4. Phase 1 실행 (승인 후)

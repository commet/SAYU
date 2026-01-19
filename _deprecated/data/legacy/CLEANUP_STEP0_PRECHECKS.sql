-- =============================================================================
-- SAYU Database Cleanup - Step 0: Pre-Cleanup Analysis
-- =============================================================================
-- 날짜: 2026-01-01
-- 목적: 삭제 전 현황 파악 및 안전성 검증
-- 실행 방법: Supabase Dashboard → SQL Editor에 복사/붙여넣기 후 실행
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 전체 테이블 목록 및 크기 확인
-- -----------------------------------------------------------------------------
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = schemaname AND table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 결과를 CLEANUP_ANALYSIS_RESULTS.md에 저장하세요!

-- -----------------------------------------------------------------------------
-- 2. Phase 1 대상 테이블 존재 여부 및 행 수 확인
-- -----------------------------------------------------------------------------
SELECT 'PHASE 1: BACKUP TABLES' as section, '==================' as status
UNION ALL
SELECT 'exhibitions_backup' as table_name,
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'exhibitions_backup')
           THEN (SELECT COUNT(*)::text FROM exhibitions_backup) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END as status
UNION ALL
SELECT 'exhibitions_unified',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'exhibitions_unified')
           THEN (SELECT COUNT(*)::text FROM exhibitions_unified) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END
UNION ALL
SELECT 'exhibitions_master',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'exhibitions_master')
           THEN (SELECT COUNT(*)::text FROM exhibitions_master) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END
UNION ALL
SELECT 'venues_backup',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'venues_backup')
           THEN (SELECT COUNT(*)::text FROM venues_backup) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END
UNION ALL
SELECT 'venues_unified',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'venues_unified')
           THEN (SELECT COUNT(*)::text FROM venues_unified) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END
UNION ALL
SELECT 'global_exhibitions_backup',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'global_exhibitions_backup')
           THEN (SELECT COUNT(*)::text FROM global_exhibitions_backup) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END
UNION ALL
SELECT 'global_venues_backup',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'global_venues_backup')
           THEN (SELECT COUNT(*)::text FROM global_venues_backup) || ' rows'
           ELSE 'TABLE NOT FOUND'
       END;

-- ⚠️ 중요: 위 결과에서 "X rows" (X > 0)인 테이블이 있으면 Phase 1 실행 전 데이터 마이그레이션 필요!

-- -----------------------------------------------------------------------------
-- 3. 현재 Production 메인 테이블 확인
-- -----------------------------------------------------------------------------
SELECT 'MAIN TABLES CHECK' as section, '==================' as status
UNION ALL
SELECT 'exhibitions' as table_name,
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'exhibitions')
           THEN (SELECT COUNT(*)::text FROM exhibitions) || ' rows'
           ELSE '❌ TABLE NOT FOUND - CRITICAL!'
       END as status
UNION ALL
SELECT 'venues',
       CASE
           WHEN EXISTS (SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'venues')
           THEN (SELECT COUNT(*)::text FROM venues) || ' rows'
           ELSE '❌ TABLE NOT FOUND - CRITICAL!'
       END;

-- ⚠️ exhibitions 또는 venues가 없으면 ABORT! 백업 테이블에서 복구 필요

-- -----------------------------------------------------------------------------
-- 4. Phase 1 테이블의 FK 관계 확인
-- -----------------------------------------------------------------------------
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'exhibitions_backup', 'exhibitions_unified', 'exhibitions_master',
        'venues_backup', 'venues_unified',
        'global_exhibitions_backup', 'global_venues_backup'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- 결과가 비어있으면 OK (FK 없음)
-- 결과가 있으면 해당 FK 확인 필요

-- -----------------------------------------------------------------------------
-- 5. Phase 1 테이블을 참조하는 다른 테이블 확인 (역 FK)
-- -----------------------------------------------------------------------------
SELECT
    tc.table_name as referencing_table,
    kcu.column_name as referencing_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name IN (
        'exhibitions_backup', 'exhibitions_unified', 'exhibitions_master',
        'venues_backup', 'venues_unified',
        'global_exhibitions_backup', 'global_venues_backup'
    )
ORDER BY ccu.table_name, tc.table_name;

-- ⚠️ 결과가 있으면 다른 테이블이 백업 테이블을 참조 중! 삭제 전 FK 제거 필요

-- -----------------------------------------------------------------------------
-- 6. Phase 2 Gamification 테이블 확인
-- -----------------------------------------------------------------------------
SELECT 'PHASE 2: GAMIFICATION' as section, '==================' as status
UNION ALL
SELECT tablename as table_name, 'EXISTS' as status
FROM pg_tables
WHERE schemaname = 'public'
    AND (
        tablename LIKE '%gamification%'
        OR tablename LIKE '%leaderboard%'
        OR tablename IN (
            'titles', 'challenges', 'activity_logs', 'daily_stats',
            'user_achievements', 'user_badges', 'user_points',
            'user_streaks', 'user_titles', 'title_progress',
            'user_challenges', 'exhibition_sessions', 'milestone_achievements',
            'habit_rewards', 'user_unlocks'
        )
    )
ORDER BY tablename;

-- 결과: Phase 2에서 삭제할 테이블 목록

-- -----------------------------------------------------------------------------
-- 7. Gamification 테이블 데이터 확인
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
    row_count INTEGER;
    total_rows INTEGER := 0;
BEGIN
    RAISE NOTICE 'GAMIFICATION TABLES DATA CHECK:';
    RAISE NOTICE '================================';

    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
            AND (
                tablename LIKE '%gamification%'
                OR tablename LIKE '%leaderboard%'
                OR tablename IN (
                    'titles', 'challenges', 'activity_logs', 'daily_stats'
                )
            )
        ORDER BY tablename
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(r.tablename) INTO row_count;
        RAISE NOTICE '  % : % rows', rpad(r.tablename, 30), row_count;
        total_rows := total_rows + row_count;
    END LOOP;

    RAISE NOTICE '================================';
    RAISE NOTICE 'TOTAL GAMIFICATION DATA: % rows', total_rows;

    IF total_rows > 0 THEN
        RAISE WARNING '⚠️  Gamification tables contain data!';
        RAISE WARNING '   If you want to preserve this data, backup before Phase 2.';
    ELSE
        RAISE NOTICE '✅ Gamification tables are empty. Safe to delete.';
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Phase 3 미사용 기능 테이블 확인
-- -----------------------------------------------------------------------------
SELECT 'PHASE 3: UNUSED FEATURES' as section, '==================' as status
UNION ALL
SELECT tablename as table_name, 'EXISTS' as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        -- Village
        'villages', 'village_memberships', 'village_events', 'personality_village_mapping',
        -- Agent/AI
        'agent_conversations', 'sayu_functions',
        -- Calendar
        'calendar_sync_settings', 'calendar_view_stats', 'event_participations',
        -- Artvee
        'artvee_artworks', 'artvee_collection_jobs', 'external_api_configs', 'scraping_configurations',
        -- Email/Notification
        'email_logs', 'email_preferences', 'email_verification_tokens', 'password_reset_tokens',
        'push_subscriptions', 'notification_logs', 'notifications', 'user_notifications',
        -- 기타
        'phase_reveals', 'token_transactions', 'leaderboard_cache', 'online_users',
        'user_sessions', 'cron_job_logs', 'daily_visits', 'data_enrichment_batches',
        'image_optimization_queue', 'image_usage_log'
    )
ORDER BY tablename;

-- -----------------------------------------------------------------------------
-- 9. 뷰 확인 (삭제 시 영향받을 수 있는 뷰)
-- -----------------------------------------------------------------------------
SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- 특히 venues, exhibitions 뷰가 있는지 확인
-- 99-unified-venue-exhibition-system.sql에서 생성한 뷰들

-- -----------------------------------------------------------------------------
-- 10. 함수 및 트리거 확인
-- -----------------------------------------------------------------------------
-- Gamification 관련 함수
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND (
        routine_name LIKE '%gamification%'
        OR routine_name IN ('update_user_points', 'get_level_name')
    )
ORDER BY routine_name;

-- Gamification 관련 트리거
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND (
        trigger_name LIKE '%gamification%'
        OR trigger_name LIKE '%user_points%'
    )
ORDER BY trigger_name;

-- -----------------------------------------------------------------------------
-- 11. 데이터베이스 전체 크기
-- -----------------------------------------------------------------------------
SELECT
    pg_database.datname as database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE pg_database.datname = current_database();

-- -----------------------------------------------------------------------------
-- 12. 최종 요약
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    total_tables INTEGER;
    phase1_tables INTEGER;
    phase2_tables INTEGER;
    phase3_tables INTEGER;
    exhibitions_count INTEGER;
    venues_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tables FROM pg_tables WHERE schemaname = 'public';

    SELECT COUNT(*) INTO phase1_tables
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename IN (
            'exhibitions_backup', 'exhibitions_unified', 'exhibitions_master',
            'venues_backup', 'venues_unified',
            'global_exhibitions_backup', 'global_venues_backup'
        );

    SELECT COUNT(*) INTO phase2_tables
    FROM pg_tables
    WHERE schemaname = 'public'
        AND (
            tablename LIKE '%gamification%'
            OR tablename LIKE '%leaderboard%'
            OR tablename IN ('titles', 'challenges', 'activity_logs', 'daily_stats')
        );

    SELECT COUNT(*) INTO phase3_tables
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename IN (
            'villages', 'village_memberships', 'village_events', 'personality_village_mapping',
            'agent_conversations', 'sayu_functions',
            'calendar_sync_settings', 'calendar_view_stats', 'event_participations',
            'artvee_artworks', 'artvee_collection_jobs', 'external_api_configs',
            'phase_reveals', 'token_transactions', 'online_users'
        );

    -- 메인 테이블 확인
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exhibitions') THEN
        SELECT COUNT(*) INTO exhibitions_count FROM exhibitions;
    ELSE
        exhibitions_count := -1; -- TABLE NOT FOUND
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues') THEN
        SELECT COUNT(*) INTO venues_count FROM venues;
    ELSE
        venues_count := -1; -- TABLE NOT FOUND
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '  SAYU DATABASE CLEANUP - PRE-EXECUTION SUMMARY';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Total tables in public schema: %', total_tables;
    RAISE NOTICE '';
    RAISE NOTICE '--- DELETION TARGETS ---';
    RAISE NOTICE 'Phase 1 (Backup tables): % tables', phase1_tables;
    RAISE NOTICE 'Phase 2 (Gamification): % tables', phase2_tables;
    RAISE NOTICE 'Phase 3 (Unused features): % tables', phase3_tables;
    RAISE NOTICE 'Total to delete: % tables', (phase1_tables + phase2_tables + phase3_tables);
    RAISE NOTICE '';
    RAISE NOTICE '--- MAIN TABLES STATUS ---';
    IF exhibitions_count >= 0 THEN
        RAISE NOTICE 'exhibitions: % rows ✅', exhibitions_count;
    ELSE
        RAISE NOTICE 'exhibitions: ❌ TABLE NOT FOUND - CRITICAL!';
    END IF;

    IF venues_count >= 0 THEN
        RAISE NOTICE 'venues: % rows ✅', venues_count;
    ELSE
        RAISE NOTICE 'venues: ❌ TABLE NOT FOUND - CRITICAL!';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '--- NEXT STEPS ---';
    RAISE NOTICE '1. Review all query results above';
    RAISE NOTICE '2. Save results to CLEANUP_ANALYSIS_RESULTS.md';
    RAISE NOTICE '3. Verify backup tables are empty (0 rows)';
    RAISE NOTICE '4. Create full database backup in Supabase Dashboard';
    RAISE NOTICE '5. Get team approval';
    RAISE NOTICE '6. Execute Phase 1 deletion script';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';

    -- 안전성 체크
    IF exhibitions_count < 0 OR venues_count < 0 THEN
        RAISE EXCEPTION '❌ CRITICAL: Main tables not found! ABORT cleanup.';
    END IF;

    IF exhibitions_count = 0 OR venues_count = 0 THEN
        RAISE WARNING '⚠️  Main tables are empty! Verify this is expected.';
    END IF;
END $$;

-- =============================================================================
-- END OF STEP 0
-- =============================================================================
-- 다음 단계:
-- 1. 위의 모든 결과를 CLEANUP_ANALYSIS_RESULTS.md에 저장
-- 2. Phase 1 백업 테이블이 비어있는지 확인 (row_count = 0)
-- 3. Supabase Dashboard에서 전체 백업 생성
-- 4. 팀 리뷰 및 승인 후 Phase 1 실행
-- =============================================================================

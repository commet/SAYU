# Supabase 테이블 정리 분석

## 📊 현황
- **전체 테이블 수**: 211개
- **실제 사용 중**: ~40개 (추정)
- **사용하지 않음**: ~170개 (80%)

## ✅ 실제 사용 중인 핵심 테이블 (코드에서 확인됨)

### 👤 사용자 시스템
- `profiles` - 사용자 프로필
- `users` - 사용자 계정
- `user_profiles` - 확장 프로필
- `user_activities` - 활동 로그
- `user_saved_exhibitions` - 저장한 전시
- `user_art_activities` - 예술 활동

### 🎨 전시/작품 시스템
- `exhibitions` - 전시 정보 ⭐
- `exhibition_visits` - 관람 기록 ⭐ (Phase 1 MVP)
- `exhibition_artworks` - 전시 작품 ⭐ (Phase 1 MVP)
- `artwork_records` - 작품 감정 기록 ⭐ (Phase 1 MVP)
- `exhibition_views` - 조회 수
- `exhibition_likes` - 좋아요
- `artworks` - 작품 마스터
- `artists` - 작가 정보
- `venues` - 장소

### 🧪 APT 시스템 (16가지 성격 유형)
- `apt_compatibility_scores` - 궁합 점수
- `quiz_results` - 퀴즈 결과
- `quiz_sessions` - 퀴즈 세션
- `quiz_answers` - 퀴즈 답변

### 📚 컬렉션
- `collections` - 컬렉션
- `collection_items` - 컬렉션 아이템
- `collection_likes` - 좋아요
- `collection_comments` - 댓글
- `art_collections` - 예술 컬렉션

### 💬 소셜/커뮤니티
- `chat_conversations` - 채팅 대화
- `chat_messages` - 메시지
- `perception_exchanges` - 지각 교환
- `perception_exchange_sessions` - 세션
- `artist_follows` - 작가 팔로우

### 🎯 Daily Challenge
- `daily_challenge_artworks` - 일일 작품
- `daily_challenge_matches` - 매칭
- `daily_challenge_responses` - 응답

### 🎭 Art Pulse
- `art_pulse_sessions` - 세션
- `art_pulse_participations` - 참여

### 📝 Art Memory
- `art_memories` - 예술 기억
- `art_profiles` - 프로필

---

## ❌ 사용하지 않는 테이블 (삭제 후보)

### 🗑️ 중복/레거시 테이블
- `exhibitions_backup` - 백업 (삭제 가능)
- `exhibitions_unified` - 통합 (exhibitions로 대체)
- `venues_backup` - 백업
- `venues_unified` - 통합
- `global_exhibitions_backup`
- `global_venues_backup`
- `exhibitions_master` (exhibitions와 중복)
- `exhibitions_translations` (사용 안 함)

### 📊 미사용 통계/분석 테이블
- `activity_logs` - 통합된 user_activities로 대체
- `user_action_logs` - 중복
- `recommendation_history`
- `recommendation_metrics`
- `recommendation_feedback`
- `artwork_viewing_behavior`
- `user_activity_patterns`
- `social_interactions`

### 🎮 Gamification (현재 미사용)
- `gamification_events`
- `gamification_levels`
- `gamification_points`
- `gamification_levels`
- `user_gamification`
- `user_achievements`
- `user_badges`
- `user_points`
- `user_streaks`
- `user_titles`
- `user_unlocks`
- `titles`
- `title_progress`
- `milestone_achievements`
- `habit_rewards`

### 🏘️ Village 시스템 (미구현)
- `villages`
- `village_memberships`
- `village_events`
- `personality_village_mapping`

### 📧 Email/Notification (외부 서비스 사용)
- `email_logs`
- `email_preferences`
- `email_verification_tokens`
- `password_reset_tokens`
- `push_subscriptions`
- `notification_logs`
- `notifications`
- `user_notifications`

### 🤖 Agent/AI (미사용)
- `agent_conversations`
- `sayu_functions`

### 📅 Calendar (미구현)
- `calendar_sync_settings`
- `calendar_view_stats`
- `event_participations`

### 🔬 Artvee/외부 API (현재 미사용)
- `artvee_artworks`
- `artvee_collection_jobs`
- `external_api_configs`
- `scraping_configurations`

### 🎨 고급 기능 (미구현)
- `artwork_interpretation_archive`
- `interpretation_feedback`
- `artwork_similarities`
- `artwork_personality_tags`
- `artwork_enrichments`
- `artwork_color_analysis`
- `artworks_vectors`
- `emotion_vectors`
- `user_preference_vectors`

### 📈 성장/Evolution (미사용)
- `art_comprehension_evolution`
- `evolution_activities`
- `evolution_history`
- `evolution_statistics`
- `growth_milestones`
- `emotional_milestones`
- `empathy_development`
- `contemplative_depth_tracking`
- `mutual_learning_tracking`
- `knowledge_reproduction_cycle`

### 🎲 기타 미사용
- `phase_reveals`
- `token_transactions`
- `leaderboard_cache`
- `leaderboard_monthly`
- `leaderboard_weekly`
- `online_users`
- `user_sessions`
- `cron_job_logs`
- `daily_stats`
- `daily_visits`
- `data_enrichment_batches`
- `data_quality_scores`
- `image_optimization_queue`
- `image_usage_log`

---

## 🎯 정리 계획

### Phase 1: 즉시 삭제 (안전)
**백업 테이블** - 7개
```sql
DROP TABLE IF EXISTS exhibitions_backup CASCADE;
DROP TABLE IF EXISTS exhibitions_unified CASCADE;
DROP TABLE IF EXISTS venues_backup CASCADE;
DROP TABLE IF EXISTS venues_unified CASCADE;
DROP TABLE IF EXISTS global_exhibitions_backup CASCADE;
DROP TABLE IF EXISTS global_venues_backup CASCADE;
DROP TABLE IF EXISTS exhibitions_master CASCADE;
```

### Phase 2: Gamification 정리
**미구현 게임화 테이블** - ~20개
```sql
-- 게임화 관련 테이블 전체 삭제
DROP SCHEMA IF EXISTS gamification CASCADE;
```

### Phase 3: 미사용 기능 정리
**Village, Email, Agent, Calendar 등** - ~30개

### Phase 4: 고급 기능 보류
**AI 분석, Evolution, Vector** - ~40개
→ Phase 4 (AI 분석) 구현 시 재검토

---

## 📊 정리 후 예상 결과
- **삭제 예정**: ~170개
- **유지**: ~40개
- **감소율**: 80%

---

## ⚠️ 주의사항
1. **외래키 확인**: CASCADE 옵션으로 연쇄 삭제
2. **백업**: 삭제 전 pg_dump로 전체 백업
3. **단계적 진행**: Phase별로 확인 후 진행

---

**생성일**: 2025-01-01
**작성자**: BMAD Architect + Claude Code

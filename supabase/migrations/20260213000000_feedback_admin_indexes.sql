-- Feedback admin performance indexes
-- Improves filtering, sorting, and text search in /api/admin/feedback endpoints.

create extension if not exists pg_trgm;

create index if not exists idx_feedback_created_at
  on public.feedback (created_at desc);

create index if not exists idx_feedback_status_created_at
  on public.feedback (status, created_at desc);

create index if not exists idx_feedback_type_created_at
  on public.feedback (type, created_at desc);

create index if not exists idx_feedback_user_id_created_at
  on public.feedback (user_id, created_at desc)
  where user_id is not null;

create index if not exists idx_feedback_message_trgm
  on public.feedback using gin (message gin_trgm_ops)
  where message is not null;

create index if not exists idx_feedback_email_trgm
  on public.feedback using gin (email gin_trgm_ops)
  where email is not null;

create index if not exists idx_user_activities_user_id_created_at
  on public.user_activities (user_id, created_at desc);

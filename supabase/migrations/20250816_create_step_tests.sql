-- Step Tests schema and RLS
-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- Active test set per step, rotated monthly
create table if not exists public.test_versions (
  id uuid primary key default gen_random_uuid(),
  step_id text not null,
  title text,
  published_at timestamptz not null,
  is_active boolean not null default true
);

-- Questions for a version
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.test_versions(id) on delete cascade,
  order_index int not null,
  prompt text not null,
  choices jsonb not null,
  correct_index int not null
);

-- User’s graded attempt
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  step_id text not null,
  version_id uuid not null references public.test_versions(id) on delete restrict,
  score int not null,
  correct_count int not null,
  total int not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

-- Lightweight session & events for future AI monitoring
create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  step_id text not null,
  version_id uuid not null references public.test_versions(id) on delete restrict,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  device jsonb,
  integrity_score numeric,
  flags jsonb
);

create table if not exists public.test_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  ts timestamptz not null default now(),
  type text not null,
  payload jsonb
);

-- Helpful indexes
create index if not exists idx_test_versions_step_published on public.test_versions (step_id, published_at desc) where is_active;
create index if not exists idx_test_questions_version_order on public.test_questions (version_id, order_index);
create index if not exists idx_test_attempts_user_version_created on public.test_attempts (user_id, version_id, created_at);
create index if not exists idx_test_sessions_user_version on public.test_sessions (user_id, version_id);
create index if not exists idx_test_events_session_ts on public.test_events (session_id, ts);

-- RLS
alter table public.test_versions enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_sessions enable row level security;
alter table public.test_events enable row level security;

-- For versions/questions: authenticated users can read
drop policy if exists select_test_versions on public.test_versions;
create policy select_test_versions on public.test_versions
  for select
  to authenticated
  using (true);

drop policy if exists select_test_questions on public.test_questions;
create policy select_test_questions on public.test_questions
  for select
  to authenticated
  using (true);

-- Attempts: users can select and insert their own
drop policy if exists select_own_test_attempts on public.test_attempts;
create policy select_own_test_attempts on public.test_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists insert_own_test_attempts on public.test_attempts;
create policy insert_own_test_attempts on public.test_attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Sessions: users can select/insert their own, and update ended_at and metadata for their own
drop policy if exists select_own_test_sessions on public.test_sessions;
create policy select_own_test_sessions on public.test_sessions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists insert_own_test_sessions on public.test_sessions;
create policy insert_own_test_sessions on public.test_sessions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists update_own_test_sessions on public.test_sessions;
create policy update_own_test_sessions on public.test_sessions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Events: insert allowed if event belongs to a session owned by user
drop policy if exists insert_session_events_by_owner on public.test_events;
create policy insert_session_events_by_owner on public.test_events
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.test_sessions s
      where s.id = test_events.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists select_session_events_by_owner on public.test_events;
create policy select_session_events_by_owner on public.test_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.test_sessions s
      where s.id = test_events.session_id
        and s.user_id = auth.uid()
    )
  );



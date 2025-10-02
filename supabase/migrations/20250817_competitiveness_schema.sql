-- Ensure required extensions
create extension if not exists pgcrypto;

-- 1) profiles.cpp_state JSONB for competitiveness storage
alter table if exists public.profiles
  add column if not exists cpp_state jsonb not null default '{}'::jsonb;

-- 2) application_progress table used by ApplicationContext
create table if not exists public.application_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  step_id text not null,
  status text not null check (status in ('not_started','in_progress','completed')),
  notes text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  inserted_at timestamptz not null default now(),
  constraint application_progress_pkey primary key (user_id, step_id)
);

create index if not exists application_progress_user_id_idx on public.application_progress (user_id);

-- 3) Content tables are defined in a dedicated migration (create_app_content_text_table.sql).
--    Avoid redefining here to keep a single source of truth for schema and RLS.

-- 4) RLS policies
alter table public.application_progress enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'application_progress' and policyname = 'application_progress_select'
  ) then
    create policy application_progress_select on public.application_progress
      for select using (auth.uid() = user_id);
  end if;
end $$;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'application_progress' and policyname = 'application_progress_insert'
  ) then
    create policy application_progress_insert on public.application_progress
      for insert with check (auth.uid() = user_id);
  end if;
end $$;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'application_progress' and policyname = 'application_progress_update'
  ) then
    create policy application_progress_update on public.application_progress
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Content table RLS/policies are also defined in create_app_content_text_table.sql

-- 5) Seed benchmarks content if missing
insert into public.app_content_text (content_key, section, component, current_text, description)
select 'application.competitiveness.benchmarks', 'application', 'competitiveness',
$$
{
  "competitivenessBenchmarks": {
    "education": {
      "minimum": "High School Diploma",
      "competitive": "2-4 years Post-Secondary (College Diploma or University Degree)",
      "weight": 30
    },
    "work_experience": {
      "minimum_years": 2,
      "competitive_range": "2-5 years stable full-time employment",
      "preferred_fields": ["Public Safety", "Customer Service", "Security", "Corrections", "Leadership"],
      "weight": 25
    },
    "volunteer_experience": {
      "minimum_hours": 100,
      "competitive_hours": "150-300+ hours",
      "notes": "Consistent long-term volunteering is valued",
      "weight": 20
    },
    "certifications": {
      "required": ["First Aid/CPR-C"],
      "competitive_plus": ["Mental Health First Aid", "Crisis Intervention", "De-escalation", "Second Language"],
      "weight": 15
    },
    "references": {
      "required_count": 3,
      "rules": "Non-family, preferably supervisors/teachers/volunteer coordinators",
      "weight": 10
    }
  }
}
$$,
  'Benchmarks for competitiveness analysis'
where not exists (
  select 1 from public.app_content_text where content_key = 'application.competitiveness.benchmarks'
);



-- Ensure common extensions
create extension if not exists pgcrypto;

-- =====================================================================
-- PROFILES: add columns used by app if they don't already exist
-- Competitiveness data is stored in jsonb (cpp_state) added in a prior migration
-- =====================================================================
alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists date_of_birth date,
  add column if not exists gender text check (gender in ('male','female','other')),
  add column if not exists height numeric,
  add column if not exists weight numeric,
  add column if not exists location text,
  add column if not exists emergency_contact text,
  add column if not exists emergency_phone text,
  add column if not exists goal text,
  add column if not exists target_test_date date,
  add column if not exists department_interest text,
  add column if not exists experience_level text check (experience_level in ('beginner','intermediate','advanced')),
  add column if not exists motivation text,
  add column if not exists has_experience boolean,
  add column if not exists previous_training text,
  add column if not exists current_fitness_level text check (current_fitness_level in ('beginner','intermediate','advanced')),
  add column if not exists workout_frequency text,
  add column if not exists available_time text,
  add column if not exists injuries text,
  add column if not exists medical_conditions text,
  add column if not exists prep_circuit_level text check (prep_circuit_level in ('never_attempted','below_average','average','good','excellent')),
  add column if not exists shuttle_run_level numeric,
  add column if not exists push_ups_max integer,
  add column if not exists sit_reach_distance numeric,
  add column if not exists mile_run_time text,
  add column if not exists core_endurance_time integer,
  add column if not exists back_extension_time integer,
  add column if not exists role text check (role in ('user','admin','super_admin')) default 'user',
  add column if not exists is_admin boolean not null default false,
  add column if not exists admin_permissions text[] not null default '{}'::text[],
  add column if not exists fitness_level text,
  add column if not exists goals text[],
  add column if not exists has_seen_cpp_intro boolean not null default false,
  add column if not exists cpp_percent numeric not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Create/replace the function using its own dollar-quoting tag
create or replace function public.set_updated_at()
returns trigger as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$ language plpgsql;

-- Recreate trigger idempotently
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- PIN TEST RESULTS
-- =====================================================================
create table if not exists public.pin_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mile_run_minutes integer,
  mile_run_seconds integer,
  pushups_count integer,
  core_endurance_minutes integer,
  core_endurance_seconds integer,
  sit_reach_distance numeric,
  overall_score numeric,
  pass_status boolean,
  notes text,
  test_date timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

create index if not exists pin_test_results_user_id_idx on public.pin_test_results(user_id);

alter table public.pin_test_results enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='pin_test_results' and policyname='pin_results_select'
  ) then
    create policy pin_results_select on public.pin_test_results
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='pin_test_results' and policyname='pin_results_insert'
  ) then
    create policy pin_results_insert on public.pin_test_results
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- =====================================================================
-- FITNESS TESTS
-- =====================================================================
create table if not exists public.fitness_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_type text not null check (test_type in ('shuttle_run','push_ups','sit_ups','plank')),
  score numeric,
  level numeric,
  notes text,
  completed_at timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

create index if not exists fitness_tests_user_id_idx on public.fitness_tests(user_id);

alter table public.fitness_tests enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='fitness_tests' and policyname='fitness_tests_select'
  ) then
    create policy fitness_tests_select on public.fitness_tests
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='fitness_tests' and policyname='fitness_tests_insert'
  ) then
    create policy fitness_tests_insert on public.fitness_tests
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- =====================================================================
-- OPTIONAL: add column used by UI to pin community posts if table exists
-- =====================================================================
-- Conditionally add is_pinned without DO-block (works in psql and Supabase SQL editor)
select
  case when exists (
    select 1 from information_schema.tables where table_schema='public' and table_name='community_posts'
  ) then (
    select 1 from (
      select alter_table from (
        select 1 as alter_table
      ) s
    ) t
  ) end;
-- The above SELECT noop is for idempotency in environments where DO is restricted.
alter table if exists public.community_posts
  add column if not exists is_pinned boolean not null default false;

-- =====================================================================
-- BOOKINGS: add columns used for waiver capture if table exists, otherwise create minimal table
-- =====================================================================
-- Create table if missing, otherwise no-op
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id uuid,
  status text,
  payment_status text,
  amount_cents integer,
  waiver_signed boolean,
  waiver_signed_at timestamptz,
  waiver_signed_name text,
  waiver_data jsonb,
  emergency_contact text,
  emergency_phone text,
  emergency_relationship text,
  medical_conditions text,
  medications text,
  allergies text,
  created_at timestamptz not null default now()
);

-- Ensure columns exist for existing deployments
alter table if exists public.bookings
  add column if not exists user_id uuid,
  add column if not exists session_id uuid,
  add column if not exists status text,
  add column if not exists payment_status text,
  add column if not exists amount_cents integer,
  add column if not exists waiver_signed boolean,
  add column if not exists waiver_signed_at timestamptz,
  add column if not exists waiver_signed_name text,
  add column if not exists waiver_data jsonb,
  add column if not exists emergency_contact text,
  add column if not exists emergency_phone text,
  add column if not exists emergency_relationship text,
  add column if not exists medical_conditions text,
  add column if not exists medications text,
  add column if not exists allergies text,
  add column if not exists created_at timestamptz;

create index if not exists bookings_user_id_idx on public.bookings(user_id);

alter table public.bookings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_select'
  ) then
    create policy bookings_select on public.bookings
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_insert'
  ) then
    create policy bookings_insert on public.bookings
      for insert with check (auth.uid() = user_id);
  end if;
end $$;



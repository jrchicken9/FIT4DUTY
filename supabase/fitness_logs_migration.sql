-- OACP Fitness Logs Migration
-- This migration creates the tables and policies for the 14-day fitness log feature

-- 1) Parent log table
create table if not exists fitness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('in_progress','completed')) default 'in_progress',
  signed boolean not null default false,
  signed_name text,
  signed_at timestamptz,
  signature_blob text, -- base64 image (optional)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_fitness_logs_user on fitness_logs(user_id);
create index if not exists idx_fitness_logs_dates on fitness_logs(start_date, end_date);
create index if not exists idx_fitness_logs_status on fitness_logs(status);

-- 2) Daily entries table (one per day)
create table if not exists fitness_log_days (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references fitness_logs(id) on delete cascade,
  day_date date not null,
  -- run tracking
  run_duration_min numeric,      -- minutes
  run_distance_km numeric,       -- kilometers
  run_location text,
  -- strength training
  strength_duration_min numeric,
  strength_env text check (strength_env in ('indoor','outdoor')),
  strength_split text check (strength_split in ('upper','lower','full','other')),
  strength_description text,     -- exercises / sets / reps / weights
  -- other activities
  other_activity_type text,
  other_activity_duration_min numeric,
  other_activity_location text,
  -- required every day:
  stress_method text,            -- REQUIRED for completion
  sleep_hours numeric,           -- REQUIRED for completion
  notes text,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (log_id, day_date)
);

-- Indexes for performance
create index if not exists idx_fitness_log_days_log on fitness_log_days(log_id);
create index if not exists idx_fitness_log_days_date on fitness_log_days(day_date);
create index if not exists idx_fitness_log_days_complete on fitness_log_days(is_complete);

-- 3) Updated_at trigger function
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4) Triggers for updated_at
drop trigger if exists trg_fitness_logs_updated on fitness_logs;
create trigger trg_fitness_logs_updated
before update on fitness_logs
for each row execute procedure set_updated_at();

drop trigger if exists trg_fitness_log_days_updated on fitness_log_days;
create trigger trg_fitness_log_days_updated
before update on fitness_log_days
for each row execute procedure set_updated_at();

-- 5) Row Level Security (RLS)
alter table fitness_logs enable row level security;
alter table fitness_log_days enable row level security;

-- 6) RLS Policies for fitness_logs
-- Users can see their own logs
create policy "fitness_logs_select_own" on fitness_logs
for select using (auth.uid() = user_id);

-- Users can create their own logs
create policy "fitness_logs_insert_own" on fitness_logs
for insert with check (auth.uid() = user_id);

-- Users can update their own logs
create policy "fitness_logs_update_own" on fitness_logs
for update using (auth.uid() = user_id);

-- Admins can see all logs
create policy "fitness_logs_admin_all" on fitness_logs
for all using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role in ('admin','super_admin'))
  )
);

-- 7) RLS Policies for fitness_log_days
-- Users can see their own log days
create policy "fitness_log_days_select_own" on fitness_log_days
for select using (
  exists (select 1 from fitness_logs fl where fl.id = log_id and fl.user_id = auth.uid())
);

-- Users can create their own log days
create policy "fitness_log_days_insert_own" on fitness_log_days
for insert with check (
  exists (select 1 from fitness_logs fl where fl.id = log_id and fl.user_id = auth.uid())
);

-- Users can update their own log days
create policy "fitness_log_days_update_own" on fitness_log_days
for update using (
  exists (select 1 from fitness_logs fl where fl.id = log_id and fl.user_id = auth.uid())
);

-- Admins can see all log days
create policy "fitness_log_days_admin_all" on fitness_log_days
for all using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role in ('admin','super_admin'))
  )
);

-- 8) Admin view for monitoring
create or replace view admin_fitness_logs as
select 
  fl.*,
  p.email as user_email,
  p.full_name as user_name,
  (select count(*) from fitness_log_days d where d.log_id = fl.id and d.is_complete) as days_completed,
  (select count(*) from fitness_log_days d where d.log_id = fl.id) as total_days
from fitness_logs fl
left join profiles p on p.id = fl.user_id;

-- 9) Function to get user's active log with progress
create or replace function get_user_active_fitness_log(user_uuid uuid)
returns table (
  log_id uuid,
  start_date date,
  end_date date,
  status text,
  signed boolean,
  days_completed bigint,
  total_days bigint,
  current_day integer
) as $$
begin
  return query
  select 
    fl.id as log_id,
    fl.start_date,
    fl.end_date,
    fl.status,
    fl.signed,
    count(case when fld.is_complete then 1 end) as days_completed,
    count(fld.id) as total_days,
    case 
      when fl.status = 'completed' then 14
      else greatest(1, least(14, extract(days from (current_date - fl.start_date))::integer + 1))
    end as current_day
  from fitness_logs fl
  left join fitness_log_days fld on fld.log_id = fl.id
  where fl.user_id = user_uuid 
    and fl.status = 'in_progress'
  group by fl.id, fl.start_date, fl.end_date, fl.status, fl.signed
  order by fl.created_at desc
  limit 1;
end;
$$ language plpgsql security definer;

-- 10) Function to validate day completion
create or replace function validate_fitness_log_day_completion(day_uuid uuid)
returns boolean as $$
declare
  day_record fitness_log_days%rowtype;
begin
  select * into day_record from fitness_log_days where id = day_uuid;
  
  -- Check if required fields are filled
  if day_record.stress_method is null or trim(day_record.stress_method) = '' then
    return false;
  end if;
  
  if day_record.sleep_hours is null or day_record.sleep_hours < 0 then
    return false;
  end if;
  
  return true;
end;
$$ language plpgsql security definer;

-- 11) Grant necessary permissions
grant usage on schema public to authenticated;
grant all on fitness_logs to authenticated;
grant all on fitness_log_days to authenticated;
grant select on admin_fitness_logs to authenticated;

-- 12) Comments for documentation
comment on table fitness_logs is 'Parent table for 14-day OACP fitness logs';
comment on table fitness_log_days is 'Daily entries for fitness logs with activity tracking';
comment on column fitness_logs.signature_blob is 'Base64 encoded signature image';
comment on column fitness_log_days.stress_method is 'Required field: stress management method used';
comment on column fitness_log_days.sleep_hours is 'Required field: hours of sleep (decimal allowed)';
comment on function get_user_active_fitness_log is 'Returns active fitness log with progress for a user';
comment on function validate_fitness_log_day_completion is 'Validates if a day entry can be marked complete';

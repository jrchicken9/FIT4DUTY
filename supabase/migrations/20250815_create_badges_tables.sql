-- Badges system schema
-- Creates: badges, user_badges, badge_events

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  icon_key text not null,
  rarity text not null check (rarity in ('common','rare','epic')),
  points integer not null default 0,
  is_hidden boolean not null default false,
  is_temporary boolean not null default false,
  starts_at timestamptz null,
  ends_at timestamptz null,
  criteria jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  revoked_at timestamptz null,
  evidence jsonb not null default '{}'::jsonb,
  source text not null default 'system',
  notes text null,
  constraint user_badges_unique unique (user_id, badge_id)
);

create table if not exists public.badge_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_id uuid null,
  event_type text not null check (event_type in ('issued','revoked','failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_user_badges_user on public.user_badges(user_id);
create index if not exists idx_user_badges_badge on public.user_badges(badge_id);
create index if not exists idx_badges_active on public.badges(active);

-- Seed initial minimal badges (idempotent)
insert into public.badges (slug, title, description, icon_key, rarity, points, is_hidden, is_temporary, criteria, active)
select * from (
  values
  ('profile_complete', 'Profile Complete', 'Complete your profile details', 'award', 'common', 10, false, false, '{"type":"event","on":"profile.completed"}'::jsonb, true),
  ('milestone_i', 'Milestone I', 'Complete 3 application steps', 'star', 'common', 20, false, false, '{"type":"threshold","on":"application.step.completed","minSteps":3}'::jsonb, true),
  ('first_booking', 'First Booking', 'Book and get confirmed for a practice session', 'shield', 'rare', 30, false, false, '{"type":"event","on":"booking.confirmed"}'::jsonb, true),
  ('supporter', 'Supporter', 'Activate a monthly subscription', 'crown', 'rare', 50, false, false, '{"type":"purchase","kind":"subscription"}'::jsonb, true)
) as v(slug,title,description,icon_key,rarity,points,is_hidden,is_temporary,criteria,active)
where not exists (select 1 from public.badges b where b.slug = v.slug);

-- Touch updated_at on update
create or replace function public.touch_badges_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_badges_updated_at on public.badges;
create trigger trg_touch_badges_updated_at
before update on public.badges
for each row execute function public.touch_badges_updated_at();




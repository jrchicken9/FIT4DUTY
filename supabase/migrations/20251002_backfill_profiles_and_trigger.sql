-- Ensure all auth users have a corresponding profile and future signups auto-create profiles

-- 1) Backfill missing profiles from auth.users (idempotent)
insert into public.profiles (
  id,
  email,
  full_name,
  first_name,
  last_name,
  role,
  is_admin,
  created_at,
  updated_at
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'last_name', ''),
  'user',
  false,
  now(),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2) Function to auto-create profile on new signup (idempotent via OR REPLACE)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    is_admin,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'user',
    false,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3) Trigger on auth.users to call the function (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Ensure profiles.updated_at auto-touches on update (idempotent)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();



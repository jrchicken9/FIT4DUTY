-- Promote specific account to super_admin and ensure future signups preserve it

-- 1) Promote existing profile (idempotent)
update public.profiles
set role = 'super_admin',
    is_admin = true,
    updated_at = now()
where lower(email) = 'ih.haddad009@gmail.com';

-- 2) Ensure signup trigger assigns super_admin to this email going forward
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
    case when lower(new.email) = 'ih.haddad009@gmail.com' then 'super_admin' else 'user' end,
    case when lower(new.email) = 'ih.haddad009@gmail.com' then true else false end,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3) Recreate trigger idempotently
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();



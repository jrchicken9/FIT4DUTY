-- Entities for service-specific competitiveness research data
create extension if not exists pgcrypto;

-- Police services catalog
create table if not exists public.police_services (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  city text,
  region text,
  latitude double precision,
  longitude double precision,
  website text,
  created_at timestamptz not null default now()
);

-- Benchmarks per service or province-wide
create table if not exists public.competitiveness_benchmarks (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('province','service')),
  service_id uuid references public.police_services(id) on delete cascade,
  benchmarks jsonb not null,
  source_urls text[],
  effective_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists competitiveness_benchmarks_service_idx on public.competitiveness_benchmarks(service_id);

-- RLS
alter table public.police_services enable row level security;
alter table public.competitiveness_benchmarks enable row level security;

-- Read allowed to all authenticated users
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='police_services' and policyname='police_services_read'
  ) then
    create policy police_services_read on public.police_services for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='competitiveness_benchmarks' and policyname='competitiveness_benchmarks_read'
  ) then
    create policy competitiveness_benchmarks_read on public.competitiveness_benchmarks for select using (true);
  end if;
end $$;

-- Writes restricted to super admins
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='police_services' and policyname='police_services_write'
  ) then
    create policy police_services_write on public.police_services
      for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
      with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='competitiveness_benchmarks' and policyname='competitiveness_benchmarks_write'
  ) then
    create policy competitiveness_benchmarks_write on public.competitiveness_benchmarks
      for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
      with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
  end if;
end $$;

-- Seed a few services if table is empty
insert into public.police_services (slug, name, city, region, latitude, longitude, website)
select * from (
  values
    ('tps','Toronto Police Service','Toronto','GTA',43.6532,-79.3832,'https://www.torontopolice.on.ca/careers/'),
    ('prp','Peel Regional Police','Mississauga/Brampton','GTA',43.5890,-79.6441,'https://www.peelpolice.ca/en/careers/careers.aspx'),
    ('yrp','York Regional Police','Aurora','GTA',44.0065,-79.4504,'https://www.yrp.ca/en/careers-and-opportunities/police-constable.aspx')
) as s(slug,name,city,region,latitude,longitude,website)
where not exists (select 1 from public.police_services);



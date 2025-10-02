-- Editable numeric thresholds per category for competitiveness analysis
create table if not exists public.benchmark_thresholds (
  category_key text primary key,
  thresholds jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.benchmark_thresholds enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_thresholds' and policyname='benchmark_thresholds_read'
  ) then
    create policy benchmark_thresholds_read on public.benchmark_thresholds for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_thresholds' and policyname='benchmark_thresholds_write'
  ) then
    create policy benchmark_thresholds_write on public.benchmark_thresholds
      for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
      with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
  end if;
end $$;

-- Seed defaults if absent
insert into public.benchmark_thresholds (category_key, thresholds)
values
  ('work', jsonb_build_object('fulltime_years_min', 2, 'relevant_months_min', 12)),
  ('volunteer', jsonb_build_object('hours_lifetime_min', 150, 'hours_12mo_min', 75)),
  ('education', jsonb_build_object('anchor_levels', jsonb_build_array('College Diploma','University Degree','Postgrad')))
on conflict (category_key) do nothing;



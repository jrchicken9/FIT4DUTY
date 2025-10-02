-- Competitiveness tiered rules, application_profile storage, and user_profile_attributes_v view
create extension if not exists pgcrypto;

-- =====================================================================
-- CATEGORY/RULE REGISTRY (text-only rules; no numeric output to user)
-- =====================================================================
create table if not exists public.benchmark_categories (
  key text primary key,
  name text not null,
  description text,
  is_unwritten boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.benchmark_rules (
  id uuid primary key default gen_random_uuid(),
  category_key text not null references public.benchmark_categories(key) on delete cascade,
  rule_key text not null,
  description text,
  is_anchor boolean not null default false,
  is_unwritten boolean not null default false,
  service_id uuid null references public.police_services(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.benchmark_categories enable row level security;
alter table public.benchmark_rules enable row level security;

-- Read for all authenticated users
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_categories' and policyname='benchmark_categories_read'
  ) then
    create policy benchmark_categories_read on public.benchmark_categories for select using (true);
  end if;
end $$;

-- Uniqueness: enforce one rule per (category_key, rule_key, service_id) with single NULL allowed
create unique index if not exists benchmark_rules_cat_rule_service_uniq
  on public.benchmark_rules (category_key, rule_key, service_id)
  where service_id is not null;

create unique index if not exists benchmark_rules_cat_rule_null_service_uniq
  on public.benchmark_rules (category_key, rule_key)
  where service_id is null;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_rules' and policyname='benchmark_rules_read'
  ) then
    create policy benchmark_rules_read on public.benchmark_rules for select using (true);
  end if;
end $$;

-- Writes restricted to super admins
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_categories' and policyname='benchmark_categories_write'
  ) then
    create policy benchmark_categories_write on public.benchmark_categories
      for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
      with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='benchmark_rules' and policyname='benchmark_rules_write'
  ) then
    create policy benchmark_rules_write on public.benchmark_rules
      for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
      with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
  end if;
end $$;

-- =====================================================================
-- APPLICANT-REPORTED ATTRIBUTES STORAGE (doc-backed flags included)
-- =====================================================================
create table if not exists public.application_profile (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  -- Education
  education_level text, -- High School, College Diploma, University Degree, etc.
  education_field_relevant boolean,
  education_cont_ed_recent boolean,
  education_transcript_verified boolean,
  education_academic_recognition text,
  -- Work
  work_fulltime_years integer,
  work_relevant_months integer,
  work_public_facing boolean,
  work_continuity_ok boolean,
  work_leadership boolean,
  work_shift_exposure boolean,
  work_employment_letter_verified boolean,
  -- Volunteer
  volunteer_hours_lifetime integer,
  volunteer_hours_12mo integer,
  volunteer_consistency_6mo boolean,
  volunteer_role_type text, -- youth|seniors|vulnerable|coaching|community_safety
  volunteer_lead_role boolean,
  volunteer_reference_verified boolean,
  -- Certs & Skills
  certs_cpr_c_current boolean,
  certs_mhfa boolean,
  certs_cpi_nvci boolean,
  certs_asist boolean,
  certs_cpr_c_verified boolean,
  skills_language_second boolean,
  driver_licence_class text,
  driver_clean_abstract boolean,
  driver_abstract_verified boolean,
  fitness_prep_observed_verified boolean,
  fitness_prep_digital_attempted boolean,
  -- References
  refs_count integer,
  refs_diverse_contexts boolean,
  refs_confirmed_recent boolean,
  refs_letters_verified boolean,
  -- Optional Professional Conduct & Driving
  conduct_no_major_issues boolean,
  conduct_clean_driving_24mo boolean,
  conduct_social_media_ack boolean,
  -- Timestamps
  updated_at timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

alter table public.application_profile enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='application_profile' and policyname='application_profile_select'
  ) then
    create policy application_profile_select on public.application_profile for select using (auth.uid() = user_id);
  end if;
end $$;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='application_profile' and policyname='application_profile_upsert'
  ) then
    create policy application_profile_upsert on public.application_profile for insert with check (auth.uid() = user_id);
    create policy application_profile_update on public.application_profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- =====================================================================
-- VIEW: user_profile_attributes_v (JSON for client evaluator + verified_map)
-- =====================================================================
create or replace view public.user_profile_attributes_v as
select
  p.id as user_id,
  jsonb_build_object(
    'education', jsonb_build_object(
      'level', ap.education_level,
      'field_relevant', ap.education_field_relevant,
      'cont_ed_recent', ap.education_cont_ed_recent,
      'transcript_verified', ap.education_transcript_verified,
      'academic_recognition', ap.education_academic_recognition
    ),
    'work', jsonb_build_object(
      'fulltime_years', ap.work_fulltime_years,
      'relevant_months', ap.work_relevant_months,
      'public_facing', ap.work_public_facing,
      'continuity_ok', ap.work_continuity_ok,
      'leadership', ap.work_leadership,
      'shift_exposure', ap.work_shift_exposure,
      'employment_letter_verified', ap.work_employment_letter_verified
    ),
    'volunteer', jsonb_build_object(
      'hours_lifetime', ap.volunteer_hours_lifetime,
      'hours_12mo', ap.volunteer_hours_12mo,
      'consistency_6mo', ap.volunteer_consistency_6mo,
      'role_type', ap.volunteer_role_type,
      'lead_role', ap.volunteer_lead_role,
      'reference_verified', ap.volunteer_reference_verified
    ),
    'certs', jsonb_build_object(
      'cpr_c_current', ap.certs_cpr_c_current,
      'mhfa', ap.certs_mhfa,
      'cpi_nvci', ap.certs_cpi_nvci,
      'asist', ap.certs_asist
    ),
    'skills', jsonb_build_object(
      'language_second', ap.skills_language_second
    ),
    'driver', jsonb_build_object(
      'licence_class', ap.driver_licence_class,
      'clean_abstract', ap.driver_clean_abstract
    ),
    'fitness', jsonb_build_object(
      'prep_observed_verified', ap.fitness_prep_observed_verified,
      'prep_digital_attempted', ap.fitness_prep_digital_attempted
    ),
    'refs', jsonb_build_object(
      'count', ap.refs_count,
      'diverse_contexts', ap.refs_diverse_contexts,
      'confirmed_recent', ap.refs_confirmed_recent,
      'letters_verified', ap.refs_letters_verified
    ),
    'conduct', jsonb_build_object(
      'no_major_issues', ap.conduct_no_major_issues,
      'clean_driving_24mo', ap.conduct_clean_driving_24mo,
      'social_media_ack', ap.conduct_social_media_ack
    )
  ) as attributes,
  jsonb_build_object(
    'education.transcript', ap.education_transcript_verified,
    'work.employment_letter', ap.work_employment_letter_verified,
    'volunteer.reference', ap.volunteer_reference_verified,
    'certs.cpr_c', ap.certs_cpr_c_verified,
    'driver.abstract', ap.driver_abstract_verified,
    'fitness.prep_observed', ap.fitness_prep_observed_verified,
    'refs.letters', ap.refs_letters_verified
  ) as verified_map
from public.profiles p
left join public.application_profile ap on ap.user_id = p.id;

-- =====================================================================
-- SEEDS: categories and rules (Ontario-generic; service_id = NULL)
-- =====================================================================
insert into public.benchmark_categories as c (key, name, description)
values
  ('education','Education','Education credentials and relevance'),
  ('work','Work Experience','Employment history and relevance'),
  ('volunteer','Volunteer Experience','Community involvement and impact'),
  ('certs_skills','Certifications & Skills','Safety, de-escalation, languages, driving'),
  ('references','References','Reference availability and quality'),
  ('conduct','Professional Conduct & Driving','Optional soft-gate signals')
on conflict (key) do update set name = excluded.name, description = excluded.description;

-- Education
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('education','education.level_postsecondary','Post-secondary credential present (College Diploma or University Degree)', true),
  ('education','education.field_relevant','Field relevance to policing/adjacent', false),
  ('education','education.cont_ed_recent','Continuing education in last 24 months', false),
  ('education','education.transcript_verified','Transcript/diploma uploaded (Verified)', false)
on conflict do nothing;

-- Work Experience
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('work','work.fulltime_years_2','≥ 2 years full-time employment', true),
  ('work','work.relevant_months_12','≥ 12 months in relevant role', true),
  ('work','work.public_facing','Public-facing/service roles history', false),
  ('work','work.continuity_ok','No >6-month unexplained gap (last 3y)', false),
  ('work','work.leadership','Leadership/supervisory duties', false),
  ('work','work.shift_exposure','Shift work/nights/weekends exposure', false),
  ('work','work.employment_letter_verified','Letter of employment Verified', false)
on conflict do nothing;

-- Volunteer
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('volunteer','volunteer.hours_lifetime_150','≥ 150 lifetime hours', true),
  ('volunteer','volunteer.hours_12mo_75','≥ 75 hours in last 12 months', true),
  ('volunteer','volunteer.consistency_6mo','Active ≥ 6 months with same org', false),
  ('volunteer','volunteer.role_type_priority','Role type: youth/seniors/vulnerable/coaching/community_safety', false),
  ('volunteer','volunteer.lead_role','Coordinator/lead role', false),
  ('volunteer','volunteer.reference_verified','Reference/letter Verified', false)
on conflict do nothing;

-- Certifications & Skills
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('certs_skills','certs.cpr_c_current','Current First Aid / CPR-C (unexpired)', true),
  ('certs_skills','certs.mhfa','Mental Health First Aid', false),
  ('certs_skills','certs.cpi_nvci','CPI/NVCI (de-escalation)', false),
  ('certs_skills','certs.asist','ASIST or equivalent', false),
  ('certs_skills','skills.language_second','Functional second language', false),
  ('certs_skills','driver.licence_class_g','Driver’s licence G', false),
  ('certs_skills','driver.clean_abstract','Clean driver abstract', false),
  ('certs_skills','fitness.prep_observed_verified','In-person PREP observed results (Verified)', false),
  ('certs_skills','fitness.prep_digital_attempted','Digital PREP/PIN attempted (Unverified)', false)
on conflict do nothing;

-- References
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('references','refs.count_3','3 non-family references identified', true),
  ('references','refs.diverse_contexts','Diversity across contexts (work/volunteer/academic)', false),
  ('references','refs.confirmed_recent','Recently contacted/confirmed (self-declared)', false),
  ('references','refs.letters_verified','Letters uploaded (Verified)', false)
on conflict do nothing;

-- Optional Conduct (soft gate)
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor)
values
  ('conduct','conduct.no_major_issues','No major unresolved legal issues', true),
  ('conduct','conduct.clean_driving_24mo','Clean driving abstract in last 24 months', false),
  ('conduct','conduct.social_media_ack','Social media policy acknowledgment', false)
on conflict do nothing;

-- =====================================================================
-- SIMPLE CACHE TABLE (optional; client can write a compact result)
-- =====================================================================
create table if not exists public.user_competitiveness_cache (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  overall_tier text, -- Exceptional | Competitive | Developing | Needs Improvement | Unknown
  category_tiers jsonb, -- { education: 'Competitive', work: 'Exceptional', ... }
  verified_counts jsonb, -- { verified: 3, unverified: 2 }
  updated_at timestamptz not null default now()
);

alter table public.user_competitiveness_cache enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_competitiveness_cache' and policyname='user_competitiveness_cache_rw'
  ) then
    create policy user_competitiveness_cache_rw on public.user_competitiveness_cache
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;



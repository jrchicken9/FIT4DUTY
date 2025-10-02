-- Optional detailed inputs storage for guided UI (jsonb arrays)
create extension if not exists pgcrypto;

alter table if exists public.application_profile
  add column if not exists work_history jsonb not null default '[]'::jsonb,
  add column if not exists volunteer_history jsonb not null default '[]'::jsonb,
  add column if not exists certs_details jsonb not null default '[]'::jsonb,
  add column if not exists refs_list jsonb not null default '[]'::jsonb,
  add column if not exists education_details jsonb not null default '[]'::jsonb,
  add column if not exists work_public_contexts jsonb not null default '[]'::jsonb,
  add column if not exists work_shift_types jsonb not null default '[]'::jsonb,
  add column if not exists volunteer_populations jsonb not null default '[]'::jsonb,
  add column if not exists skills_languages jsonb not null default '[]'::jsonb;



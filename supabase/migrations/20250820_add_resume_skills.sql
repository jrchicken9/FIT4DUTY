-- Add skills_details JSON array to application_profile for resume builder
create extension if not exists pgcrypto;

alter table if exists public.application_profile
  add column if not exists skills_details jsonb not null default '[]'::jsonb;



-- Rollup detailed entries into anchor/support fields and expose resume view
create extension if not exists pgcrypto;

-- Rollup function: sets aggregate rule fields from detailed arrays
create or replace function public.rollup_application_profile(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  ap record;
  sum_work_months int := 0;
  has_public_context boolean := false;
  has_shift_exposure boolean := false;
  sum_vol_hours int := 0;
  sum_vol_hours_12mo int := 0;
  has_second_language boolean := false;
  refs_total int := 0;
  refs_diverse boolean := false;
begin
  select * into ap from public.application_profile where user_id = p_user_id;
  if not found then return; end if;

  -- Work months (prefer explicit months; derive from start/end when missing)
  begin
    with jobs as (
      select
        (j->>'months') as months_txt,
        (j->>'start') as start_txt,
        (j->>'end') as end_txt
      from jsonb_array_elements(coalesce(ap.work_history, '[]'::jsonb)) j
    ), parsed as (
      select
        case when months_txt ~ '^\\d+$' then (months_txt)::int
             when start_txt ~ '^\\d{4}-\\d{2}$' then (
               (date_part('year', coalesce(to_date(end_txt||'-01','YYYY-MM-DD'), now())) - date_part('year', to_date(start_txt||'-01','YYYY-MM-DD')))*12
               + (date_part('month', coalesce(to_date(end_txt||'-01','YYYY-MM-DD'), now())) - date_part('month', to_date(start_txt||'-01','YYYY-MM-DD')))
             )::int
             else 0 end as months_derived
      from jobs
    )
    select coalesce(sum(months_derived), 0) into sum_work_months from parsed;
  exception when others then sum_work_months := coalesce(ap.work_relevant_months, 0); end;

  -- Public contexts and shifts (also accept entry-level flags from work_history entries)
  has_public_context := jsonb_array_length(coalesce(ap.work_public_contexts, '[]'::jsonb)) > 0
                        or exists (
                          select 1 from jsonb_array_elements(coalesce(ap.work_history,'[]'::jsonb)) j
                          where coalesce(j->>'public_contexts','') <> ''
                        );
  has_shift_exposure := jsonb_array_length(coalesce(ap.work_shift_types, '[]'::jsonb)) > 0
                        or coalesce(ap.work_shift_exposure,false)
                        or exists (
                          select 1 from jsonb_array_elements(coalesce(ap.work_history,'[]'::jsonb)) j
                          where coalesce(j->>'shift_types','') <> ''
                        );

  -- Volunteer hours (lifetime)
  begin
    with vols as (
      select (v->>'hours') as hours_txt, (v->>'date') as date_txt
      from jsonb_array_elements(coalesce(ap.volunteer_history, '[]'::jsonb)) v
    ), parsed as (
      select case when hours_txt ~ '^\\d+$' then (hours_txt)::int else 0 end as hours,
             case when date_txt ~ '^\\d{4}-\\d{2}$' then to_date(date_txt||'-01','YYYY-MM-DD') else null end as d
      from vols
    )
    select coalesce(sum(hours), 0) into sum_vol_hours from parsed;
    select coalesce(sum(hours), 0) into sum_vol_hours_12mo from parsed where d >= (current_date - interval '12 months');
  exception when others then sum_vol_hours := coalesce(ap.volunteer_hours_lifetime, 0); end;

  -- Optionally, derive hours in last 12 months could be added similarly when needed

  -- Second language: any listed languages
  has_second_language := jsonb_array_length(coalesce(ap.skills_languages, '[]'::jsonb)) > 0 or coalesce(ap.skills_language_second,false);

  -- References
  refs_total := coalesce( jsonb_array_length(coalesce(ap.refs_list, '[]'::jsonb)), 0 );
  begin
    with rels as (
      select distinct lower(coalesce(r->>'relationship','')) as rel
      from jsonb_array_elements(coalesce(ap.refs_list, '[]'::jsonb)) r
      where coalesce(r->>'relationship','') <> ''
    )
    select (count(*) >= 2) into refs_diverse from rels;
  exception when others then refs_diverse := coalesce(ap.refs_diverse_contexts,false); end;

  update public.application_profile set
    work_relevant_months = greatest(coalesce(work_relevant_months,0), sum_work_months),
    work_fulltime_years = greatest(coalesce(work_fulltime_years,0), floor(sum_work_months / 12.0)::int),
    work_public_facing = coalesce(work_public_facing,false) or has_public_context,
    work_shift_exposure = has_shift_exposure,
    volunteer_hours_lifetime = greatest(coalesce(volunteer_hours_lifetime,0), sum_vol_hours),
    volunteer_hours_12mo = greatest(coalesce(volunteer_hours_12mo,0), sum_vol_hours_12mo),
    skills_language_second = has_second_language,
    refs_count = refs_total,
    refs_diverse_contexts = coalesce(refs_diverse_contexts,false) or refs_diverse,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- Update trigger to roll up first, then refresh cache
create or replace function public.trg_refresh_user_competitiveness()
returns trigger language plpgsql security definer as $$
declare
  is_running text;
  uid uuid;
begin
  -- Guard against recursive trigger calls caused by rollup updates
  is_running := current_setting('pp.competitiveness_guard', true);
  if is_running = 'on' then
    return new;
  end if;

  uid := coalesce(new.user_id, old.user_id);
  if uid is null then
    return new;
  end if;

  perform set_config('pp.competitiveness_guard', 'on', true);
  perform public.rollup_application_profile(uid);
  perform public.refresh_user_competitiveness_cache(uid);
  return new;
end;
$$;

-- Resume JSON view to power AI generator
create or replace view public.resume_profile_v as
select
  p.id as user_id,
  jsonb_build_object(
    'basics', jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email,
      'phone', p.phone,
      'location', p.location
    ),
    'education', coalesce(ap.education_details, '[]'::jsonb),
    'work_experience', coalesce(ap.work_history, '[]'::jsonb),
    'volunteering', coalesce(ap.volunteer_history, '[]'::jsonb),
    'certifications', coalesce(ap.certs_details, '[]'::jsonb),
    'languages', coalesce(ap.skills_languages, '[]'::jsonb),
    'references', coalesce(ap.refs_list, '[]'::jsonb)
  ) as resume
from public.profiles p
left join public.application_profile ap on ap.user_id = p.id;



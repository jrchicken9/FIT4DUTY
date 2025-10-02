-- Server-side competitiveness evaluation and cache refresh
create extension if not exists pgcrypto;

-- Helper: compute tier text based on booleans and counts
create or replace function public.compute_tier(anchor_met boolean, support_count integer, verified_support_count integer)
returns text language sql immutable as $$
  select case
    when coalesce(anchor_met,false) and coalesce(support_count,0) >= 2 then 'Exceptional'
    when coalesce(anchor_met,false) then 'Competitive'
    when coalesce(support_count,0) >= 2 then case when coalesce(verified_support_count,0) > 0 then 'Competitive' else 'Developing' end
    else 'Needs Improvement'
  end
$$;

-- Main evaluator: returns overall and per-category tiers plus verified counts
create or replace function public.evaluate_competitiveness(p_user_id uuid default auth.uid(), show_unwritten boolean default false)
returns jsonb language plpgsql security definer as $$
declare
  attrs jsonb;
  vmap jsonb;
  -- per category flags and counts
  edu_anchor boolean; edu_supports int; edu_verified int;
  work_anchor boolean; work_supports int; work_verified int;
  vol_anchor boolean; vol_supports int; vol_verified int;
  cert_anchor boolean; cert_supports int; cert_verified int;
  refs_anchor boolean; refs_supports int; refs_verified int;
  tier_education text; tier_work text; tier_volunteer text; tier_certs text; tier_references text;
  high_count int; low_count int; exc_count int; comp_count int; dev_count int; need_count int;
  overall text;
  verified_true int; verified_false int;
begin
  select attributes, verified_map into attrs, vmap
  from public.user_profile_attributes_v
  where user_id = p_user_id;

  if attrs is null then
    return jsonb_build_object(
      'overall_tier','Unknown',
      'category_tiers', jsonb_build_object(),
      'verified_counts', jsonb_build_object('verified',0,'unverified',0)
    );
  end if;

  -- Education
  edu_anchor := (attrs #>> '{education,level}') in ('College Diploma','University Degree');
  edu_supports := 0;
  edu_verified := 0;
  if (attrs #>> '{education,field_relevant}') = 'true' then edu_supports := edu_supports + 1; end if;
  if (attrs #>> '{education,cont_ed_recent}') = 'true' then edu_supports := edu_supports + 1; end if;
  if (attrs #>> '{education,transcript_verified}') = 'true' then edu_supports := edu_supports + 1; edu_verified := edu_verified + 1; end if;
  tier_education := public.compute_tier(edu_anchor, edu_supports, edu_verified);

  -- Work
  work_anchor := coalesce((attrs #>> '{work,fulltime_years}')::int,0) >= 2 or coalesce((attrs #>> '{work,relevant_months}')::int,0) >= 12;
  work_supports := 0; work_verified := 0;
  if (attrs #>> '{work,public_facing}') = 'true' then work_supports := work_supports + 1; end if;
  if (attrs #>> '{work,continuity_ok}') = 'true' then work_supports := work_supports + 1; end if;
  if (attrs #>> '{work,leadership}') = 'true' then work_supports := work_supports + 1; end if;
  if (attrs #>> '{work,shift_exposure}') = 'true' then work_supports := work_supports + 1; end if;
  if (attrs #>> '{work,employment_letter_verified}') = 'true' then work_supports := work_supports + 1; work_verified := work_verified + 1; end if;
  tier_work := public.compute_tier(work_anchor, work_supports, work_verified);

  -- Volunteer
  vol_anchor := coalesce((attrs #>> '{volunteer,hours_lifetime}')::int,0) >= 150 or coalesce((attrs #>> '{volunteer,hours_12mo}')::int,0) >= 75;
  vol_supports := 0; vol_verified := 0;
  if (attrs #>> '{volunteer,consistency_6mo}') = 'true' then vol_supports := vol_supports + 1; end if;
  if ( (attrs #>> '{volunteer,role_type}') in ('youth','seniors','vulnerable','coaching','community_safety') ) then vol_supports := vol_supports + 1; end if;
  if (attrs #>> '{volunteer,lead_role}') = 'true' then vol_supports := vol_supports + 1; end if;
  if (attrs #>> '{volunteer,reference_verified}') = 'true' then vol_supports := vol_supports + 1; vol_verified := vol_verified + 1; end if;
  tier_volunteer := public.compute_tier(vol_anchor, vol_supports, vol_verified);

  -- Certifications & Skills
  cert_anchor := ((attrs #>> '{certs,cpr_c_current}') = 'true');
  cert_supports := 0; cert_verified := 0;
  if (attrs #>> '{certs,mhfa}') = 'true' then cert_supports := cert_supports + 1; end if;
  if (attrs #>> '{certs,cpi_nvci}') = 'true' then cert_supports := cert_supports + 1; end if;
  if (attrs #>> '{certs,asist}') = 'true' then cert_supports := cert_supports + 1; end if;
  if (attrs #>> '{skills,language_second}') = 'true' then cert_supports := cert_supports + 1; end if;
  if (attrs #>> '{driver,licence_class}') in ('G') then cert_supports := cert_supports + 1; end if;
  if (attrs #>> '{driver,clean_abstract}') = 'true' then cert_supports := cert_supports + 1; cert_verified := cert_verified + 1; end if;
  if (attrs #>> '{fitness,prep_observed_verified}') = 'true' then cert_supports := cert_supports + 1; cert_verified := cert_verified + 1; end if;
  if (attrs #>> '{fitness,prep_digital_attempted}') = 'true' then cert_supports := cert_supports + 1; end if;
  -- If CPR-C has a separate verified flag in vmap, count it toward verified
  if (vmap #>> '{certs.cpr_c}') = 'true' then cert_verified := cert_verified + 1; end if;
  tier_certs := public.compute_tier(cert_anchor, cert_supports, cert_verified);

  -- References
  refs_anchor := coalesce((attrs #>> '{refs,count}')::int,0) >= 3;
  refs_supports := 0; refs_verified := 0;
  if (attrs #>> '{refs,diverse_contexts}') = 'true' then refs_supports := refs_supports + 1; end if;
  if (attrs #>> '{refs,confirmed_recent}') = 'true' then refs_supports := refs_supports + 1; end if;
  if (attrs #>> '{refs,letters_verified}') = 'true' then refs_supports := refs_supports + 1; refs_verified := refs_verified + 1; end if;
  tier_references := public.compute_tier(refs_anchor, refs_supports, refs_verified);

  -- Overall computation using only main categories
  exc_count :=
    (case when tier_education = 'Exceptional' then 1 else 0 end) +
    (case when tier_work = 'Exceptional' then 1 else 0 end) +
    (case when tier_volunteer = 'Exceptional' then 1 else 0 end) +
    (case when tier_certs = 'Exceptional' then 1 else 0 end) +
    (case when tier_references = 'Exceptional' then 1 else 0 end);
  comp_count :=
    (case when tier_education = 'Competitive' then 1 else 0 end) +
    (case when tier_work = 'Competitive' then 1 else 0 end) +
    (case when tier_volunteer = 'Competitive' then 1 else 0 end) +
    (case when tier_certs = 'Competitive' then 1 else 0 end) +
    (case when tier_references = 'Competitive' then 1 else 0 end);
  dev_count :=
    (case when tier_education = 'Developing' then 1 else 0 end) +
    (case when tier_work = 'Developing' then 1 else 0 end) +
    (case when tier_volunteer = 'Developing' then 1 else 0 end) +
    (case when tier_certs = 'Developing' then 1 else 0 end) +
    (case when tier_references = 'Developing' then 1 else 0 end);
  need_count :=
    (case when tier_education = 'Needs Improvement' then 1 else 0 end) +
    (case when tier_work = 'Needs Improvement' then 1 else 0 end) +
    (case when tier_volunteer = 'Needs Improvement' then 1 else 0 end) +
    (case when tier_certs = 'Needs Improvement' then 1 else 0 end) +
    (case when tier_references = 'Needs Improvement' then 1 else 0 end);

  high_count := exc_count + comp_count;
  low_count := dev_count + need_count;
  if high_count >= 3 then
    if exc_count >= 2 and (dev_count + need_count) = 0 then overall := 'Exceptional'; else overall := 'Competitive'; end if;
  elsif low_count >= 3 then
    if need_count >= 2 then overall := 'Needs Improvement'; else overall := 'Developing'; end if;
  else
    if high_count >= low_count then overall := 'Competitive'; else overall := 'Developing'; end if;
  end if;

  -- value is jsonb; avoid casting jsonb null to boolean
  select count(*) filter (where (value)::text = 'true'), count(*) filter (where (value)::text = 'false')
    into verified_true, verified_false
  from jsonb_each(vmap);

  return jsonb_build_object(
    'overall_tier', overall,
    'category_tiers', jsonb_build_object(
      'education', tier_education,
      'work', tier_work,
      'volunteer', tier_volunteer,
      'certs_skills', tier_certs,
      'references', tier_references
    ),
    'verified_counts', jsonb_build_object('verified', coalesce(verified_true,0), 'unverified', coalesce(verified_false,0))
  );
end;
$$;

-- Cache refresher
create or replace function public.refresh_user_competitiveness_cache(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  res jsonb;
begin
  res := public.evaluate_competitiveness(p_user_id);
  insert into public.user_competitiveness_cache(user_id, overall_tier, category_tiers, verified_counts, updated_at)
  values (
    p_user_id,
    (res #>> '{overall_tier}'),
    (res #> '{category_tiers}'),
    (res #> '{verified_counts}'),
    now()
  )
  on conflict (user_id) do update set
    overall_tier = excluded.overall_tier,
    category_tiers = excluded.category_tiers,
    verified_counts = excluded.verified_counts,
    updated_at = now();
end;
$$;

-- Trigger to refresh cache after profile changes
-- Trigger function wrapper (triggers cannot pass arguments directly)
create or replace function public.trg_refresh_user_competitiveness()
returns trigger language plpgsql security definer as $$
begin
  perform public.refresh_user_competitiveness_cache(coalesce(new.user_id, old.user_id));
  return new;
end;
$$;

drop trigger if exists trg_application_profile_competitiveness on public.application_profile;
create trigger trg_application_profile_competitiveness
after insert or update on public.application_profile
for each row
execute function public.trg_refresh_user_competitiveness();



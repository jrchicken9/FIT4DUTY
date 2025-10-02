-- =====================================================================
-- MASTER FUNCTIONS, VIEWS, TRIGGERS, AND SEED DATA
-- =====================================================================

-- =====================================================================
-- FUNCTIONS
-- =====================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- Badges update timestamp function
CREATE OR REPLACE FUNCTION public.touch_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Content history function
CREATE OR REPLACE FUNCTION create_content_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_text != NEW.current_text THEN
    INSERT INTO app_content_text_history (
      content_id,
      previous_text,
      changed_by,
      change_reason
    ) VALUES (
      OLD.id,
      OLD.current_text,
      NEW.last_updated_by,
      'Content updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Competitiveness evaluation functions
CREATE OR REPLACE FUNCTION public.compute_tier(anchor_met boolean, support_count integer, verified_support_count integer)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT case
    when coalesce(anchor_met,false) and coalesce(support_count,0) >= 2 then 'Exceptional'
    when coalesce(anchor_met,false) then 'Competitive'
    when coalesce(support_count,0) >= 2 then case when coalesce(verified_support_count,0) > 0 then 'Competitive' else 'Developing' end
    else 'Needs Improvement'
  end
$$;

-- Main competitiveness evaluator
CREATE OR REPLACE FUNCTION public.evaluate_competitiveness(p_user_id uuid default auth.uid(), show_unwritten boolean default false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
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
BEGIN
  SELECT attributes, verified_map INTO attrs, vmap
  FROM public.user_profile_attributes_v
  WHERE user_id = p_user_id;

  IF attrs IS NULL THEN
    RETURN jsonb_build_object(
      'overall_tier','Unknown',
      'category_tiers', jsonb_build_object(),
      'verified_counts', jsonb_build_object('verified',0,'unverified',0)
    );
  END IF;

  -- Education
  edu_anchor := (attrs #>> '{education,level}') IN ('College Diploma','University Degree');
  edu_supports := 0;
  edu_verified := 0;
  IF (attrs #>> '{education,field_relevant}') = 'true' THEN edu_supports := edu_supports + 1; END IF;
  IF (attrs #>> '{education,cont_ed_recent}') = 'true' THEN edu_supports := edu_supports + 1; END IF;
  IF (attrs #>> '{education,transcript_verified}') = 'true' THEN edu_supports := edu_supports + 1; edu_verified := edu_verified + 1; END IF;
  tier_education := public.compute_tier(edu_anchor, edu_supports, edu_verified);

  -- Work
  work_anchor := coalesce((attrs #>> '{work,fulltime_years}')::int,0) >= 2 OR coalesce((attrs #>> '{work,relevant_months}')::int,0) >= 12;
  work_supports := 0; work_verified := 0;
  IF (attrs #>> '{work,public_facing}') = 'true' THEN work_supports := work_supports + 1; END IF;
  IF (attrs #>> '{work,continuity_ok}') = 'true' THEN work_supports := work_supports + 1; END IF;
  IF (attrs #>> '{work,leadership}') = 'true' THEN work_supports := work_supports + 1; END IF;
  IF (attrs #>> '{work,shift_exposure}') = 'true' THEN work_supports := work_supports + 1; END IF;
  IF (attrs #>> '{work,employment_letter_verified}') = 'true' THEN work_supports := work_supports + 1; work_verified := work_verified + 1; END IF;
  tier_work := public.compute_tier(work_anchor, work_supports, work_verified);

  -- Volunteer
  vol_anchor := coalesce((attrs #>> '{volunteer,hours_lifetime}')::int,0) >= 150 OR coalesce((attrs #>> '{volunteer,hours_12mo}')::int,0) >= 75;
  vol_supports := 0; vol_verified := 0;
  IF (attrs #>> '{volunteer,consistency_6mo}') = 'true' THEN vol_supports := vol_supports + 1; END IF;
  IF ( (attrs #>> '{volunteer,role_type}') IN ('youth','seniors','vulnerable','coaching','community_safety') ) THEN vol_supports := vol_supports + 1; END IF;
  IF (attrs #>> '{volunteer,lead_role}') = 'true' THEN vol_supports := vol_supports + 1; END IF;
  IF (attrs #>> '{volunteer,reference_verified}') = 'true' THEN vol_supports := vol_supports + 1; vol_verified := vol_verified + 1; END IF;
  tier_volunteer := public.compute_tier(vol_anchor, vol_supports, vol_verified);

  -- Certifications & Skills
  cert_anchor := ((attrs #>> '{certs,cpr_c_current}') = 'true');
  cert_supports := 0; cert_verified := 0;
  IF (attrs #>> '{certs,mhfa}') = 'true' THEN cert_supports := cert_supports + 1; END IF;
  IF (attrs #>> '{certs,cpi_nvci}') = 'true' THEN cert_supports := cert_supports + 1; END IF;
  IF (attrs #>> '{certs,asist}') = 'true' THEN cert_supports := cert_supports + 1; END IF;
  IF (attrs #>> '{skills,language_second}') = 'true' THEN cert_supports := cert_supports + 1; END IF;
  IF (attrs #>> '{driver,licence_class}') IN ('G') THEN cert_supports := cert_supports + 1; END IF;
  IF (attrs #>> '{driver,clean_abstract}') = 'true' THEN cert_supports := cert_supports + 1; cert_verified := cert_verified + 1; END IF;
  IF (attrs #>> '{fitness,prep_observed_verified}') = 'true' THEN cert_supports := cert_supports + 1; cert_verified := cert_verified + 1; END IF;
  IF (attrs #>> '{fitness,prep_digital_attempted}') = 'true' THEN cert_supports := cert_supports + 1; END IF;
  -- If CPR-C has a separate verified flag in vmap, count it toward verified
  IF (vmap #>> '{certs.cpr_c}') = 'true' THEN cert_verified := cert_verified + 1; END IF;
  tier_certs := public.compute_tier(cert_anchor, cert_supports, cert_verified);

  -- References
  refs_anchor := coalesce((attrs #>> '{refs,count}')::int,0) >= 3;
  refs_supports := 0; refs_verified := 0;
  IF (attrs #>> '{refs,diverse_contexts}') = 'true' THEN refs_supports := refs_supports + 1; END IF;
  IF (attrs #>> '{refs,confirmed_recent}') = 'true' THEN refs_supports := refs_supports + 1; END IF;
  IF (attrs #>> '{refs,letters_verified}') = 'true' THEN refs_supports := refs_supports + 1; refs_verified := refs_verified + 1; END IF;
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
  IF high_count >= 3 THEN
    IF exc_count >= 2 AND (dev_count + need_count) = 0 THEN overall := 'Exceptional'; ELSE overall := 'Competitive'; END IF;
  ELSIF low_count >= 3 THEN
    IF need_count >= 2 THEN overall := 'Needs Improvement'; ELSE overall := 'Developing'; END IF;
  ELSE
    IF high_count >= low_count THEN overall := 'Competitive'; ELSE overall := 'Developing'; END IF;
  END IF;

  -- value is jsonb; avoid casting jsonb null to boolean
  SELECT count(*) FILTER (WHERE (value)::text = 'true'), count(*) FILTER (WHERE (value)::text = 'false')
    INTO verified_true, verified_false
  FROM jsonb_each(vmap);

  RETURN jsonb_build_object(
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
END;
$$;

-- Cache refresher
CREATE OR REPLACE FUNCTION public.refresh_user_competitiveness_cache(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  res jsonb;
BEGIN
  res := public.evaluate_competitiveness(p_user_id);
  INSERT INTO public.user_competitiveness_cache(user_id, overall_tier, category_tiers, verified_counts, updated_at)
  VALUES (
    p_user_id,
    (res #>> '{overall_tier}'),
    (res #> '{category_tiers}'),
    (res #> '{verified_counts}'),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    overall_tier = excluded.overall_tier,
    category_tiers = excluded.category_tiers,
    verified_counts = excluded.verified_counts,
    updated_at = now();
END;
$$;

-- Rollup function for application profile
CREATE OR REPLACE FUNCTION public.rollup_application_profile(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  ap record;
  sum_work_months int := 0;
  has_public_context boolean := false;
  has_shift_exposure boolean := false;
  sum_vol_hours int := 0;
  sum_vol_hours_12mo int := 0;
  has_second_language boolean := false;
  refs_total int := 0;
  refs_diverse boolean := false;
BEGIN
  SELECT * INTO ap FROM public.application_profile WHERE user_id = p_user_id;
  IF NOT found THEN RETURN; END IF;

  -- Work months (prefer explicit months; derive from start/end when missing)
  BEGIN
    WITH jobs AS (
      SELECT
        (j->>'months') AS months_txt,
        (j->>'start') AS start_txt,
        (j->>'end') AS end_txt
      FROM jsonb_array_elements(coalesce(ap.work_history, '[]'::jsonb)) j
    ), parsed AS (
      SELECT
        CASE WHEN months_txt ~ '^\\d+$' THEN (months_txt)::int
             WHEN start_txt ~ '^\\d{4}-\\d{2}$' THEN (
               (date_part('year', coalesce(to_date(end_txt||'-01','YYYY-MM-DD'), now())) - date_part('year', to_date(start_txt||'-01','YYYY-MM-DD')))*12
               + (date_part('month', coalesce(to_date(end_txt||'-01','YYYY-MM-DD'), now())) - date_part('month', to_date(start_txt||'-01','YYYY-MM-DD')))
             )::int
             ELSE 0 END AS months_derived
      FROM jobs
    )
    SELECT coalesce(sum(months_derived), 0) INTO sum_work_months FROM parsed;
  EXCEPTION WHEN others THEN sum_work_months := coalesce(ap.work_relevant_months, 0); END;

  -- Public contexts and shifts (also accept entry-level flags from work_history entries)
  has_public_context := jsonb_array_length(coalesce(ap.work_public_contexts, '[]'::jsonb)) > 0
                        OR EXISTS (
                          SELECT 1 FROM jsonb_array_elements(coalesce(ap.work_history,'[]'::jsonb)) j
                          WHERE coalesce(j->>'public_contexts','') <> ''
                        );
  has_shift_exposure := jsonb_array_length(coalesce(ap.work_shift_types, '[]'::jsonb)) > 0
                        OR coalesce(ap.work_shift_exposure,false)
                        OR EXISTS (
                          SELECT 1 FROM jsonb_array_elements(coalesce(ap.work_history,'[]'::jsonb)) j
                          WHERE coalesce(j->>'shift_types','') <> ''
                        );

  -- Volunteer hours (lifetime)
  BEGIN
    WITH vols AS (
      SELECT (v->>'hours') AS hours_txt, (v->>'date') AS date_txt
      FROM jsonb_array_elements(coalesce(ap.volunteer_history, '[]'::jsonb)) v
    ), parsed AS (
      SELECT CASE WHEN hours_txt ~ '^\\d+$' THEN (hours_txt)::int ELSE 0 END AS hours,
             CASE WHEN date_txt ~ '^\\d{4}-\\d{2}$' THEN to_date(date_txt||'-01','YYYY-MM-DD') ELSE null END AS d
      FROM vols
    )
    SELECT coalesce(sum(hours), 0) INTO sum_vol_hours FROM parsed;
    SELECT coalesce(sum(hours), 0) INTO sum_vol_hours_12mo FROM parsed WHERE d >= (current_date - interval '12 months');
  EXCEPTION WHEN others THEN sum_vol_hours := coalesce(ap.volunteer_hours_lifetime, 0); END;

  -- Second language: any listed languages
  has_second_language := jsonb_array_length(coalesce(ap.skills_languages, '[]'::jsonb)) > 0 OR coalesce(ap.skills_language_second,false);

  -- References
  refs_total := coalesce( jsonb_array_length(coalesce(ap.refs_list, '[]'::jsonb)), 0 );
  BEGIN
    WITH rels AS (
      SELECT DISTINCT lower(coalesce(r->>'relationship','')) AS rel
      FROM jsonb_array_elements(coalesce(ap.refs_list, '[]'::jsonb)) r
      WHERE coalesce(r->>'relationship','') <> ''
    )
    SELECT (count(*) >= 2) INTO refs_diverse FROM rels;
  EXCEPTION WHEN others THEN refs_diverse := coalesce(ap.refs_diverse_contexts,false); END;

  UPDATE public.application_profile SET
    work_relevant_months = greatest(coalesce(work_relevant_months,0), sum_work_months),
    work_fulltime_years = greatest(coalesce(work_fulltime_years,0), floor(sum_work_months / 12.0)::int),
    work_public_facing = coalesce(work_public_facing,false) OR has_public_context,
    work_shift_exposure = has_shift_exposure,
    volunteer_hours_lifetime = greatest(coalesce(volunteer_hours_lifetime,0), sum_vol_hours),
    volunteer_hours_12mo = greatest(coalesce(volunteer_hours_12mo,0), sum_vol_hours_12mo),
    skills_language_second = has_second_language,
    refs_count = refs_total,
    refs_diverse_contexts = coalesce(refs_diverse_contexts,false) OR refs_diverse,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger function wrapper
CREATE OR REPLACE FUNCTION public.trg_refresh_user_competitiveness()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  is_running text;
  uid uuid;
BEGIN
  -- Guard against recursive trigger calls caused by rollup updates
  is_running := current_setting('pp.competitiveness_guard', true);
  IF is_running = 'on' THEN
    RETURN new;
  END IF;

  uid := coalesce(new.user_id, old.user_id);
  IF uid IS NULL THEN
    RETURN new;
  END IF;

  PERFORM set_config('pp.competitiveness_guard', 'on', true);
  PERFORM public.rollup_application_profile(uid);
  PERFORM public.refresh_user_competitiveness_cache(uid);
  RETURN new;
END;
$$;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Profiles update trigger
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Badges update trigger
DROP TRIGGER IF EXISTS trg_touch_badges_updated_at ON public.badges;
CREATE TRIGGER trg_touch_badges_updated_at
  BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.touch_badges_updated_at();

-- Content history trigger
DROP TRIGGER IF EXISTS app_content_text_history_trigger ON public.app_content_text;
CREATE TRIGGER app_content_text_history_trigger
  AFTER UPDATE ON public.app_content_text
  FOR EACH ROW
  EXECUTE FUNCTION create_content_history();

-- Competitiveness cache trigger
DROP TRIGGER IF EXISTS trg_application_profile_competitiveness ON public.application_profile;
CREATE TRIGGER trg_application_profile_competitiveness
  AFTER INSERT OR UPDATE ON public.application_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_user_competitiveness();

-- =====================================================================
-- VIEWS
-- =====================================================================

-- User profile attributes view
CREATE OR REPLACE VIEW public.user_profile_attributes_v AS
SELECT
  p.id AS user_id,
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
      'employment_letter_verified', ap.work_employment_letter_verified,
      'frontline_public_safety_12m', ap.work_frontline_public_safety_12m
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
      'asist', ap.certs_asist,
      'naloxone_trained', ap.certs_naloxone_trained,
      'deescalation_advanced', ap.certs_deescalation_advanced,
      'cpr_valid_6mo', ap.certs_cpr_valid_6mo
    ),
    'skills', jsonb_build_object(
      'language_second', ap.skills_language_second,
      'priority_language', ap.skills_priority_language
    ),
    'driver', jsonb_build_object(
      'licence_class', ap.driver_licence_class,
      'clean_abstract', ap.driver_clean_abstract
    ),
    'fitness', jsonb_build_object(
      'prep_observed_verified', ap.fitness_prep_observed_verified,
      'prep_digital_attempted', ap.fitness_prep_digital_attempted,
      'pin_digital_attempts_3', ap.fitness_pin_digital_attempts_3
    ),
    'refs', jsonb_build_object(
      'count', ap.refs_count,
      'diverse_contexts', ap.refs_diverse_contexts,
      'confirmed_recent', ap.refs_confirmed_recent,
      'letters_verified', ap.refs_letters_verified,
      'supervisor_within_12mo', ap.refs_supervisor_within_12mo,
      'no_family', ap.refs_no_family,
      'contactable_verified', ap.refs_contactable_verified
    ),
    'conduct', jsonb_build_object(
      'no_major_issues', ap.conduct_no_major_issues,
      'clean_driving_24mo', ap.conduct_clean_driving_24mo,
      'social_media_ack', ap.conduct_social_media_ack
    )
  ) AS attributes,
  jsonb_build_object(
    'education.transcript', ap.education_transcript_verified,
    'work.employment_letter', ap.work_employment_letter_verified,
    'volunteer.reference', ap.volunteer_reference_verified,
    'certs.cpr_c', ap.certs_cpr_c_verified,
    'driver.abstract', ap.driver_abstract_verified,
    'fitness.prep_observed', ap.fitness_prep_observed_verified,
    'refs.letters', ap.refs_letters_verified
  ) AS verified_map,
  jsonb_build_object(
    'education_details', coalesce(ap.education_details, '[]'::jsonb),
    'work_history', coalesce(ap.work_history, '[]'::jsonb),
    'volunteer_history', coalesce(ap.volunteer_history, '[]'::jsonb),
    'certs_details', coalesce(ap.certs_details, '[]'::jsonb),
    'refs_list', coalesce(ap.refs_list, '[]'::jsonb),
    'work_public_contexts', coalesce(ap.work_public_contexts, '[]'::jsonb),
    'work_shift_types', coalesce(ap.work_shift_types, '[]'::jsonb),
    'skills_languages', coalesce(ap.skills_languages, '[]'::jsonb)
  ) AS details
FROM public.profiles p
LEFT JOIN public.application_profile ap ON ap.user_id = p.id;

-- Resume profile view
CREATE OR REPLACE VIEW public.resume_profile_v AS
SELECT
  p.id AS user_id,
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
  ) AS resume
FROM public.profiles p
LEFT JOIN public.application_profile ap ON ap.user_id = p.id;

-- Competitiveness details view
CREATE OR REPLACE VIEW public.competitiveness_details AS
SELECT 
  ap.user_id,
  ap.education_details,
  ap.work_history,
  ap.volunteer_history,
  ap.certs_details,
  ap.skills_details,
  ap.skills_languages,
  ap.refs_list,
  ap.awards_details,
  -- Driving & Record
  jsonb_build_object(
    'licence_class', ap.driver_licence_class,
    'clean_abstract', ap.driver_clean_abstract,
    'abstract_date', ap.driver_abstract_date,
    'infractions', ap.driver_infractions,
    'infraction_date', ap.driver_infraction_date
  ) AS driving_info,
  -- Physical Readiness
  jsonb_build_object(
    'prep_observed_verified', ap.fitness_prep_observed_verified,
    'prep_digital_attempted', ap.fitness_prep_digital_attempted,
    'prep_date', ap.fitness_prep_date,
    'shuttle_run', ap.fitness_shuttle_run,
    'circuit_time', ap.fitness_circuit_time,
    'push_ups', ap.fitness_push_ups,
    'sit_ups', ap.fitness_sit_ups
  ) AS fitness_info,
  -- Background & Integrity
  jsonb_build_object(
    'no_major_issues', ap.conduct_no_major_issues,
    'background_check_complete', ap.background_check_complete,
    'credit_check_complete', ap.credit_check_complete,
    'social_media_clean', ap.social_media_clean,
    'education_verified', ap.education_verified,
    'employment_verified', ap.employment_verified
  ) AS background_info,
  ap.updated_at
FROM public.application_profile ap;

-- Mandatory requirements summary view
CREATE OR REPLACE VIEW public.mandatory_requirements_summary AS
SELECT 
  ap.user_id,
  ap.mandatory_requirements,
  CASE 
    WHEN ap.mandatory_requirements IS NOT NULL THEN
      -- Calculate completion percentage
      ROUND(
        (
          SELECT COUNT(*)::float 
          FROM jsonb_each(ap.mandatory_requirements) AS mr(key, value)
          WHERE (value->>'completed')::boolean = true
        ) * 100.0 / 
        (
          SELECT COUNT(*)::float 
          FROM jsonb_each(ap.mandatory_requirements)
        )
      )
    ELSE 0
  END AS completion_percentage,
  ap.updated_at
FROM public.application_profile ap
WHERE ap.mandatory_requirements IS NOT NULL;












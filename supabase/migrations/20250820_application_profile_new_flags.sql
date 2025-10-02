-- Extend application_profile with additional competitiveness flags
alter table if exists public.application_profile
  add column if not exists work_frontline_public_safety_12m boolean,
  add column if not exists certs_naloxone_trained boolean,
  add column if not exists certs_deescalation_advanced boolean,
  add column if not exists certs_cpr_valid_6mo boolean,
  add column if not exists skills_priority_language boolean,
  add column if not exists fitness_pin_digital_attempts_3 boolean,
  add column if not exists refs_supervisor_within_12mo boolean,
  add column if not exists refs_no_family boolean,
  add column if not exists refs_contactable_verified boolean;

-- Refresh view to surface new fields
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



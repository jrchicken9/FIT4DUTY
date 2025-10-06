-- OACP Fitness Log Analytics Migration
-- This migration adds OACP-specific fields to support enhanced PDF export functionality

-- 1) Add OACP fields to fitness_logs table
alter table fitness_logs 
add column if not exists full_name text,
add column if not exists dob date,
add column if not exists address text,
add column if not exists email text,
add column if not exists phone text,
add column if not exists declaration_date_iso date,
add column if not exists applicant_signature_png_base64 text,
add column if not exists declaration_acknowledged boolean default false,
add column if not exists verifier_enabled boolean default false,
add column if not exists verifier_name text,
add column if not exists verifier_title text,
add column if not exists verifier_phone text,
add column if not exists verifier_date_iso date,
add column if not exists verifier_signature_png_base64 text;

-- 2) Add OACP fields to fitness_log_days table
alter table fitness_log_days
add column if not exists activity text,
add column if not exists duration_mins numeric default 0,
add column if not exists intensity text check (intensity in ('Low','Moderate','Vigorous')) default 'Moderate',
add column if not exists comments text,
add column if not exists signer_initials text,
add column if not exists signed boolean default false;

-- 3) Create indexes for new fields
create index if not exists idx_fitness_logs_full_name on fitness_logs(full_name);
create index if not exists idx_fitness_log_days_activity on fitness_log_days(activity);
create index if not exists idx_fitness_log_days_intensity on fitness_log_days(intensity);
create index if not exists idx_fitness_log_days_signed on fitness_log_days(signed);

-- 4) Add comments for documentation
comment on column fitness_logs.full_name is 'Full name for OACP PDF export';
comment on column fitness_logs.dob is 'Date of birth for OACP PDF export';
comment on column fitness_logs.address is 'Address for OACP PDF export';
comment on column fitness_logs.email is 'Email for OACP PDF export';
comment on column fitness_logs.phone is 'Phone number for OACP PDF export';
comment on column fitness_logs.declaration_date_iso is 'Declaration date for OACP PDF export';
comment on column fitness_logs.applicant_signature_png_base64 is 'Applicant signature image for OACP PDF export';
comment on column fitness_logs.declaration_acknowledged is 'Whether declaration was acknowledged';
comment on column fitness_logs.verifier_enabled is 'Whether verifier section is enabled';
comment on column fitness_logs.verifier_name is 'Verifier name for OACP PDF export';
comment on column fitness_logs.verifier_title is 'Verifier title for OACP PDF export';
comment on column fitness_logs.verifier_phone is 'Verifier phone for OACP PDF export';
comment on column fitness_logs.verifier_date_iso is 'Verifier date for OACP PDF export';
comment on column fitness_logs.verifier_signature_png_base64 is 'Verifier signature image for OACP PDF export';

comment on column fitness_log_days.activity is 'Activity summary for OACP PDF export';
comment on column fitness_log_days.duration_mins is 'Total duration in minutes for OACP PDF export';
comment on column fitness_log_days.intensity is 'Activity intensity level (Low/Moderate/Vigorous)';
comment on column fitness_log_days.comments is 'Additional comments for OACP PDF export';
comment on column fitness_log_days.signer_initials is 'Signature initials for OACP PDF export';
comment on column fitness_log_days.signed is 'Whether day entry is signed';

-- 5) Create a view for OACP export data
create or replace view oacp_export_data as
select 
  fl.id as log_id,
  fl.user_id,
  fl.start_date,
  fl.end_date,
  fl.status,
  fl.signed,
  fl.signed_name,
  fl.signed_at,
  fl.signature_blob,
  -- OACP fields from fitness_logs
  fl.full_name,
  fl.dob,
  fl.address,
  fl.email,
  fl.phone,
  fl.declaration_date_iso,
  fl.applicant_signature_png_base64,
  fl.declaration_acknowledged,
  fl.verifier_enabled,
  fl.verifier_name,
  fl.verifier_title,
  fl.verifier_phone,
  fl.verifier_date_iso,
  fl.verifier_signature_png_base64,
  -- Daily entries with OACP fields
  array_agg(
    json_build_object(
      'id', fld.id,
      'day_date', fld.day_date,
      'run_duration_min', fld.run_duration_min,
      'run_distance_km', fld.run_distance_km,
      'run_location', fld.run_location,
      'strength_duration_min', fld.strength_duration_min,
      'strength_env', fld.strength_env,
      'strength_split', fld.strength_split,
      'strength_description', fld.strength_description,
      'other_activity_type', fld.other_activity_type,
      'other_activity_duration_min', fld.other_activity_duration_min,
      'other_activity_location', fld.other_activity_location,
      'stress_method', fld.stress_method,
      'sleep_hours', fld.sleep_hours,
      'notes', fld.notes,
      'is_complete', fld.is_complete,
      -- OACP fields
      'activity', fld.activity,
      'duration_mins', fld.duration_mins,
      'intensity', fld.intensity,
      'comments', fld.comments,
      'signer_initials', fld.signer_initials,
      'signed', fld.signed
    ) order by fld.day_date
  ) as days
from fitness_logs fl
left join fitness_log_days fld on fld.log_id = fl.id
where fl.signed = true
group by fl.id, fl.user_id, fl.start_date, fl.end_date, fl.status, fl.signed, 
         fl.signed_name, fl.signed_at, fl.signature_blob,
         fl.full_name, fl.dob, fl.address, fl.email, fl.phone,
         fl.declaration_date_iso, fl.applicant_signature_png_base64, fl.declaration_acknowledged,
         fl.verifier_enabled, fl.verifier_name, fl.verifier_title, fl.verifier_phone,
         fl.verifier_date_iso, fl.verifier_signature_png_base64;

-- 6) Grant permissions on the new view
grant select on oacp_export_data to authenticated;

-- 7) Add comment for the view
comment on view oacp_export_data is 'Complete fitness log data formatted for OACP PDF export';
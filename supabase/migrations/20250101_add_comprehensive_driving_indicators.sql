-- Add comprehensive driving and indicators fields to application_profile table
-- This migration adds all the new fields needed for the enhanced Driving & Indicators modal
-- and the comprehensive grading system

-- Add new driving and record fields
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS driver_abstract_date text,
ADD COLUMN IF NOT EXISTS driver_infractions text CHECK (driver_infractions IN ('None', '1 Minor', '2+ Minor', 'Major')),
ADD COLUMN IF NOT EXISTS driver_infraction_date text CHECK (driver_infraction_date IN ('Within 6 months', '6-12 months ago', '1-2 years ago', '2-3 years ago', '3+ years ago'));

-- Add new physical readiness fields
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS fitness_prep_observed_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fitness_prep_digital_attempted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fitness_prep_date text,
ADD COLUMN IF NOT EXISTS fitness_shuttle_run text CHECK (fitness_shuttle_run IN ('Excellent', 'Good', 'Average', 'Below Average', 'Not Tested')),
ADD COLUMN IF NOT EXISTS fitness_circuit_time text,
ADD COLUMN IF NOT EXISTS fitness_push_ups text,
ADD COLUMN IF NOT EXISTS fitness_sit_ups text;

-- Add new background and integrity fields
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS conduct_no_major_issues boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_check_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media_clean boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS education_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS employment_verified boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN application_profile.driver_abstract_date IS 'Date when driving abstract was last obtained';
COMMENT ON COLUMN application_profile.driver_infractions IS 'Recent driving infractions (None, 1 Minor, 2+ Minor, Major)';
COMMENT ON COLUMN application_profile.driver_infraction_date IS 'Date of most recent infraction (Within 6 months, 6-12 months ago, 1-2 years ago, 2-3 years ago, 3+ years ago)';
COMMENT ON COLUMN application_profile.fitness_prep_observed_verified IS 'PREP test observed and verified by official';
COMMENT ON COLUMN application_profile.fitness_prep_digital_attempted IS 'PREP test attempted digitally/at home';
COMMENT ON COLUMN application_profile.fitness_prep_date IS 'Date of PREP/PIN fitness test';
COMMENT ON COLUMN application_profile.fitness_shuttle_run IS 'Shuttle run performance level (Excellent, Good, Average, Below Average, Not Tested)';
COMMENT ON COLUMN application_profile.fitness_circuit_time IS 'PREP circuit completion time in MM:SS format';
COMMENT ON COLUMN application_profile.fitness_push_ups IS 'Push-ups performance data';
COMMENT ON COLUMN application_profile.fitness_sit_ups IS 'Sit-ups performance data';
COMMENT ON COLUMN application_profile.conduct_no_major_issues IS 'No major conduct issues or infractions';
COMMENT ON COLUMN application_profile.background_check_complete IS 'Background check completion status';
COMMENT ON COLUMN application_profile.credit_check_complete IS 'Credit check completion status';
COMMENT ON COLUMN application_profile.social_media_clean IS 'Social media accounts clean status';
COMMENT ON COLUMN application_profile.education_verified IS 'Education verification completion status';
COMMENT ON COLUMN application_profile.employment_verified IS 'Employment verification completion status';

-- Create indexes for better query performance on commonly accessed fields
CREATE INDEX IF NOT EXISTS idx_application_profile_driver_licence_class ON application_profile(driver_licence_class);
CREATE INDEX IF NOT EXISTS idx_application_profile_driver_clean_abstract ON application_profile(driver_clean_abstract);
CREATE INDEX IF NOT EXISTS idx_application_profile_fitness_prep_observed ON application_profile(fitness_prep_observed_verified);
CREATE INDEX IF NOT EXISTS idx_application_profile_conduct_issues ON application_profile(conduct_no_major_issues);

-- Update the competitiveness view to include new fields
-- This ensures the grading system can access all the new data
CREATE OR REPLACE VIEW competitiveness_details AS
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
  ) as driving_info,
  -- Physical Readiness
  jsonb_build_object(
    'prep_observed_verified', ap.fitness_prep_observed_verified,
    'prep_digital_attempted', ap.fitness_prep_digital_attempted,
    'prep_date', ap.fitness_prep_date,
    'shuttle_run', ap.fitness_shuttle_run,
    'circuit_time', ap.fitness_circuit_time,
    'push_ups', ap.fitness_push_ups,
    'sit_ups', ap.fitness_sit_ups
  ) as fitness_info,
  -- Background & Integrity
  jsonb_build_object(
    'no_major_issues', ap.conduct_no_major_issues,
    'background_check_complete', ap.background_check_complete,
    'credit_check_complete', ap.credit_check_complete,
    'social_media_clean', ap.social_media_clean,
    'education_verified', ap.education_verified,
    'employment_verified', ap.employment_verified
  ) as background_info,
  ap.updated_at
FROM application_profile ap;
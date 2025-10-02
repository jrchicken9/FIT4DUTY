-- Fix Driving & Indicators Database Schema
-- This script ensures all comprehensive driving fields are properly created and accessible

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'application_profile' 
AND column_name LIKE '%driver%' OR column_name LIKE '%fitness%' OR column_name LIKE '%conduct%' OR column_name LIKE '%background%' OR column_name LIKE '%credit%' OR column_name LIKE '%social%' OR column_name LIKE '%education_verified%' OR column_name LIKE '%employment_verified%'
ORDER BY column_name;

-- Add any missing columns (this will be safe with IF NOT EXISTS)
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS driver_abstract_date text,
ADD COLUMN IF NOT EXISTS driver_infractions text,
ADD COLUMN IF NOT EXISTS driver_infraction_date text,
ADD COLUMN IF NOT EXISTS fitness_prep_observed_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fitness_prep_digital_attempted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fitness_prep_date text,
ADD COLUMN IF NOT EXISTS fitness_shuttle_run text,
ADD COLUMN IF NOT EXISTS fitness_circuit_time text,
ADD COLUMN IF NOT EXISTS fitness_push_ups text,
ADD COLUMN IF NOT EXISTS fitness_sit_ups text,
ADD COLUMN IF NOT EXISTS conduct_no_major_issues boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_check_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media_clean boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS education_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS employment_verified boolean DEFAULT false;

-- Remove any problematic CHECK constraints that might be causing issues
-- (We'll add them back later if needed)
ALTER TABLE application_profile 
DROP CONSTRAINT IF EXISTS application_profile_driver_infractions_check,
DROP CONSTRAINT IF EXISTS application_profile_driver_infraction_date_check,
DROP CONSTRAINT IF EXISTS application_profile_fitness_shuttle_run_check;

-- Add the CHECK constraints back with more flexible options
ALTER TABLE application_profile 
ADD CONSTRAINT application_profile_driver_infractions_check 
CHECK (driver_infractions IS NULL OR driver_infractions IN ('None', '1 Minor', '2+ Minor', 'Major'));

ALTER TABLE application_profile 
ADD CONSTRAINT application_profile_driver_infraction_date_check 
CHECK (driver_infraction_date IS NULL OR driver_infraction_date IN ('Within 6 months', '6-12 months ago', '1-2 years ago', '2-3 years ago', '3+ years ago'));

ALTER TABLE application_profile 
ADD CONSTRAINT application_profile_fitness_shuttle_run_check 
CHECK (fitness_shuttle_run IS NULL OR fitness_shuttle_run IN ('Excellent', 'Good', 'Average', 'Below Average', 'Not Tested'));

-- Verify the columns exist and are accessible
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'application_profile' 
AND column_name LIKE '%driver%' OR column_name LIKE '%fitness%' OR column_name LIKE '%conduct%' OR column_name LIKE '%background%' OR column_name LIKE '%credit%' OR column_name LIKE '%social%' OR column_name LIKE '%education_verified%' OR column_name LIKE '%employment_verified%'
ORDER BY column_name;

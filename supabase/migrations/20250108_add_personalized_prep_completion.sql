-- ADD PERSONALIZED PREP PLAN COMPLETION TRACKING
-- This migration adds a field to track whether a user has completed their personalized PREP plan setup

-- Add field to track personalized PREP plan completion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_personalized_prep_plan BOOLEAN NOT NULL DEFAULT false;

-- Add field to store the completion date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS personalized_prep_plan_completed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.has_completed_personalized_prep_plan IS 'Whether the user has completed their personalized PREP plan setup';
COMMENT ON COLUMN public.profiles.personalized_prep_plan_completed_at IS 'When the user completed their personalized PREP plan setup';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_personalized_prep_completion 
ON public.profiles (has_completed_personalized_prep_plan) 
WHERE has_completed_personalized_prep_plan = true;

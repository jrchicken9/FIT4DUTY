-- Add is_draft column to existing user_eci_answers table
-- This migration adds the missing is_draft column that was referenced in the updated schema

-- Add the is_draft column with default value true (existing records will be treated as drafts)
ALTER TABLE public.user_eci_answers 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT true;

-- Add a comment to document the new column
COMMENT ON COLUMN public.user_eci_answers.is_draft IS 'Indicates whether this answer is a draft (true) or a final graded answer (false)';

-- Update any existing records that might have grading data to be marked as final answers
-- This assumes that if they have a score > 0, they are graded answers, not drafts
UPDATE public.user_eci_answers 
SET is_draft = false 
WHERE score > 0 AND is_draft = true;

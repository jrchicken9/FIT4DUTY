-- =====================================================================
-- ADD PERSONALIZED PLAN COLUMNS TO PROFILES TABLE
-- =====================================================================
-- This adds the missing columns for tracking personalized prep plan completion

-- Step 1: Add the missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_personalized_prep_plan BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS personalized_prep_plan_completed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS selected_workout_plan_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS workout_plan_selected_at TIMESTAMPTZ DEFAULT NULL;

-- Step 2: Add comments to document the new columns
COMMENT ON COLUMN public.profiles.has_completed_personalized_prep_plan IS 'Whether the user has completed the personalized prep plan setup';
COMMENT ON COLUMN public.profiles.personalized_prep_plan_completed_at IS 'Timestamp when the user completed the personalized prep plan setup';
COMMENT ON COLUMN public.profiles.selected_workout_plan_id IS 'ID of the workout plan selected by the user';
COMMENT ON COLUMN public.profiles.workout_plan_selected_at IS 'Timestamp when the user selected their workout plan';

-- Step 3: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_personalized_plan_completed 
ON public.profiles(has_completed_personalized_prep_plan);

CREATE INDEX IF NOT EXISTS idx_profiles_selected_workout_plan 
ON public.profiles(selected_workout_plan_id);

-- Step 4: Add foreign key constraint for selected_workout_plan_id
-- First, let's check if the workout_plans table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_plans') THEN
        -- Add foreign key constraint if workout_plans table exists
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_selected_workout_plan 
        FOREIGN KEY (selected_workout_plan_id) 
        REFERENCES public.workout_plans(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Step 5: Update RLS policies to include the new columns
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with new columns
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 6: Create a function to mark personalized plan as completed
CREATE OR REPLACE FUNCTION public.mark_personalized_plan_completed(
    p_user_id UUID,
    p_plan_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        has_completed_personalized_prep_plan = TRUE,
        personalized_prep_plan_completed_at = now(),
        selected_workout_plan_id = COALESCE(p_plan_id, selected_workout_plan_id),
        workout_plan_selected_at = CASE 
            WHEN p_plan_id IS NOT NULL THEN now()
            ELSE workout_plan_selected_at
        END,
        updated_at = now()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- Step 7: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.mark_personalized_plan_completed(UUID, UUID) TO authenticated;

-- Step 8: Verify the changes
SELECT 
    'Personalized plan columns added successfully!' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
    'has_completed_personalized_prep_plan',
    'personalized_prep_plan_completed_at',
    'selected_workout_plan_id',
    'workout_plan_selected_at'
)
ORDER BY column_name;

-- Step 9: Show sample data (if any profiles exist)
SELECT 
    id,
    has_completed_personalized_prep_plan,
    personalized_prep_plan_completed_at,
    selected_workout_plan_id,
    workout_plan_selected_at
FROM public.profiles 
LIMIT 5;

-- Fix workout system issues
-- This migration addresses:
-- 1. Missing RLS policies for exercise_usage_stats
-- 2. Better error handling for workout_exercises unique constraints

-- =====================================================================
-- FIX EXERCISE_USAGE_STATS RLS POLICIES
-- =====================================================================

-- Add missing INSERT policy for exercise_usage_stats
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_usage_stats' 
    AND policyname = 'Usage stats are insertable by authenticated users'
  ) THEN
    CREATE POLICY "Usage stats are insertable by authenticated users" ON public.exercise_usage_stats
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Add missing UPDATE policy for exercise_usage_stats
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_usage_stats' 
    AND policyname = 'Usage stats are updatable by authenticated users'
  ) THEN
    CREATE POLICY "Usage stats are updatable by authenticated users" ON public.exercise_usage_stats
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================================
-- IMPROVE WORKOUT_EXERCISES HANDLING
-- =====================================================================

-- Create a function to safely add exercises to workouts
CREATE OR REPLACE FUNCTION safe_add_workout_exercise(
  p_workout_id UUID,
  p_exercise_id UUID,
  p_sets INTEGER DEFAULT 3,
  p_reps INTEGER DEFAULT 10,
  p_weight_kg NUMERIC DEFAULT NULL,
  p_rest_time_seconds INTEGER DEFAULT 90,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_next_order_index INTEGER;
  v_exercise_record_id UUID;
BEGIN
  -- Calculate the next available order_index
  SELECT COALESCE(MAX(order_index), 0) + 1
  INTO v_next_order_index
  FROM public.workout_exercises
  WHERE workout_id = p_workout_id;
  
  -- Insert the exercise with the calculated order_index
  INSERT INTO public.workout_exercises (
    workout_id,
    exercise_id,
    order_index,
    sets,
    reps,
    weight_kg,
    rest_time_seconds,
    notes
  ) VALUES (
    p_workout_id,
    p_exercise_id,
    v_next_order_index,
    p_sets,
    p_reps,
    p_weight_kg,
    p_rest_time_seconds,
    p_notes
  ) RETURNING id INTO v_exercise_record_id;
  
  RETURN v_exercise_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION safe_add_workout_exercise(UUID, UUID, INTEGER, INTEGER, NUMERIC, INTEGER, TEXT) TO authenticated;

-- =====================================================================
-- ADD BETTER ERROR HANDLING FOR WORKOUT_EXERCISES
-- =====================================================================

-- Create a function to check if exercise already exists in workout
CREATE OR REPLACE FUNCTION check_exercise_in_workout(
  p_workout_id UUID,
  p_exercise_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workout_exercises 
    WHERE workout_id = p_workout_id 
    AND exercise_id = p_exercise_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_exercise_in_workout(UUID, UUID) TO authenticated;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify the policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'exercise_usage_stats'
ORDER BY policyname;

-- Verify the functions are created
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('safe_add_workout_exercise', 'check_exercise_in_workout')
AND n.nspname = 'public'
ORDER BY p.proname;

-- Show current workout_exercises constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'workout_exercises'
AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;


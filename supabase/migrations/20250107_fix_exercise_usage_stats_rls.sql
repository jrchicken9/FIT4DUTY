-- Fix exercise_usage_stats RLS policies
-- This migration adds the missing INSERT and UPDATE policies for exercise_usage_stats table

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

-- Verify the policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'exercise_usage_stats'
ORDER BY policyname;


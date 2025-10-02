-- Add missing DELETE policy for workout plans
-- This allows admins to delete workout plans

CREATE POLICY "Workout plans are deletable by admins" ON public.workout_plans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Add missing DELETE policy for workouts
CREATE POLICY "Workouts are deletable by admins" ON public.workouts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Add missing DELETE policy for workout exercises
CREATE POLICY "Workout exercises are deletable by admins" ON public.workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );


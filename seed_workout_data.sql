-- =====================================================================
-- SEED WORKOUT DATA (Run this directly in Supabase SQL editor)
-- =====================================================================
-- This script bypasses RLS policies to populate the database with initial data
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to the SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. The script will temporarily disable RLS, seed data, then re-enable RLS

-- Temporarily disable RLS for seeding
ALTER TABLE public.exercise_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- EXERCISE CATEGORIES
-- =====================================================================

INSERT INTO public.exercise_categories (name, description, icon, color) VALUES
('Cardio', 'Cardiovascular exercises for endurance', 'heart', '#EF4444'),
('Strength', 'Strength training exercises', 'dumbbell', '#3B82F6'),
('Bodyweight', 'Bodyweight exercises', 'user', '#8B5CF6'),
('Flexibility', 'Stretching and flexibility exercises', 'stretch', '#10B981'),
('Plyometrics', 'Explosive movement exercises', 'zap', '#F59E0B'),
('Core', 'Core and abdominal exercises', 'target', '#DC2626'),
('Agility', 'Agility and coordination exercises', 'zap', '#8B5CF6'),
('Police Specific', 'Exercises specific to police work', 'shield', '#1E40AF'),
('Balance', 'Balance and stability exercises', 'circle', '#059669'),
('Recovery', 'Recovery and mobility exercises', 'refresh-cw', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- BASIC EXERCISES
-- =====================================================================

-- Get category IDs
DO $$
DECLARE
  cardio_id UUID;
  strength_id UUID;
  bodyweight_id UUID;
  flexibility_id UUID;
  plyo_id UUID;
  core_id UUID;
  agility_id UUID;
  police_id UUID;
  balance_id UUID;
  recovery_id UUID;
BEGIN
  SELECT id INTO cardio_id FROM public.exercise_categories WHERE name = 'Cardio';
  SELECT id INTO strength_id FROM public.exercise_categories WHERE name = 'Strength';
  SELECT id INTO bodyweight_id FROM public.exercise_categories WHERE name = 'Bodyweight';
  SELECT id INTO flexibility_id FROM public.exercise_categories WHERE name = 'Flexibility';
  SELECT id INTO plyo_id FROM public.exercise_categories WHERE name = 'Plyometrics';
  SELECT id INTO core_id FROM public.exercise_categories WHERE name = 'Core';
  SELECT id INTO agility_id FROM public.exercise_categories WHERE name = 'Agility';
  SELECT id INTO police_id FROM public.exercise_categories WHERE name = 'Police Specific';
  SELECT id INTO balance_id FROM public.exercise_categories WHERE name = 'Balance';
  SELECT id INTO recovery_id FROM public.exercise_categories WHERE name = 'Recovery';

  -- Cardio Exercises
  INSERT INTO public.exercises (name, description, category_id, difficulty_level, muscle_groups, equipment_needed, instructions) VALUES
  ('Running', 'Basic running for cardiovascular fitness', cardio_id, 'beginner', ARRAY['legs', 'cardiovascular'], ARRAY['running_shoes'], 'Run at a comfortable pace for the specified duration'),
  ('Shuttle Run', 'Agility and speed training with directional changes - essential for PREP test', cardio_id, 'intermediate', ARRAY['legs', 'cardiovascular', 'core'], ARRAY['cones', 'running_shoes'], 'Set up cones 10-20 meters apart. Run back and forth between cones, touching each cone'),
  ('Cycling', 'Low-impact cardiovascular exercise', cardio_id, 'beginner', ARRAY['legs', 'cardiovascular'], ARRAY['bicycle', 'helmet'], 'Cycle at a moderate pace for the specified duration'),
  ('High-Intensity Interval Training (HIIT)', 'Alternating high and low intensity cardio', cardio_id, 'advanced', ARRAY['full_body', 'cardiovascular'], ARRAY['timer'], 'Alternate 30 seconds high intensity with 30 seconds rest');

  -- Strength Exercises
  INSERT INTO public.exercises (name, description, category_id, difficulty_level, muscle_groups, equipment_needed, instructions) VALUES
  ('Push-ups', 'Classic upper body strength exercise - essential for PREP test', strength_id, 'beginner', ARRAY['chest', 'shoulders', 'triceps'], ARRAY[]::text[], 'Start in plank position, lower body until chest nearly touches ground, then push back up'),
  ('Pull-ups', 'Upper body pulling strength exercise', strength_id, 'intermediate', ARRAY['back', 'biceps', 'shoulders'], ARRAY['pull_up_bar'], 'Hang from bar, pull body up until chin is over bar, then lower back down'),
  ('Squats', 'Lower body strength exercise', strength_id, 'beginner', ARRAY['legs', 'glutes', 'core'], ARRAY[]::text[], 'Stand with feet shoulder-width apart, lower body as if sitting back, then stand back up'),
  ('Deadlifts', 'Full body strength exercise', strength_id, 'advanced', ARRAY['legs', 'back', 'core'], ARRAY['barbell', 'weight_plates'], 'Stand with feet shoulder-width apart, bend at hips and knees to lower hands to bar, then stand up while keeping bar close to body');

  -- Bodyweight Exercises
  INSERT INTO public.exercises (name, description, category_id, difficulty_level, muscle_groups, equipment_needed, instructions) VALUES
  ('Burpees', 'Full body conditioning exercise', bodyweight_id, 'intermediate', ARRAY['full_body', 'cardiovascular'], ARRAY[]::text[], 'Start standing, drop to push-up position, do push-up, jump back up, then jump with arms overhead'),
  ('Mountain Climbers', 'Dynamic core exercise', bodyweight_id, 'intermediate', ARRAY['core', 'shoulders', 'cardiovascular'], ARRAY[]::text[], 'Start in plank position, alternate bringing knees to chest in running motion'),
  ('Lunges', 'Lower body exercise', bodyweight_id, 'beginner', ARRAY['legs', 'glutes', 'core'], ARRAY[]::text[], 'Step forward with one leg, lower body until both knees are bent at 90 degrees, then step back');

  -- Core Exercises
  INSERT INTO public.exercises (name, description, category_id, difficulty_level, muscle_groups, equipment_needed, instructions) VALUES
  ('Plank', 'Core stability exercise', core_id, 'beginner', ARRAY['core', 'shoulders'], ARRAY[]::text[], 'Hold body in straight line from head to heels, engaging core muscles'),
  ('Crunches', 'Basic abdominal exercise', core_id, 'beginner', ARRAY['core'], ARRAY[]::text[], 'Lie on back with knees bent, lift shoulders off ground while engaging abs'),
  ('Russian Twists', 'Rotational core exercise', core_id, 'intermediate', ARRAY['core', 'obliques'], ARRAY[]::text[], 'Sit with knees bent, lean back slightly, rotate torso from side to side');

  -- Police Specific Exercises
  INSERT INTO public.exercises (name, description, category_id, difficulty_level, muscle_groups, equipment_needed, instructions) VALUES
  ('Obstacle Course Running', 'Practice for PREP test obstacle course', police_id, 'intermediate', ARRAY['legs', 'cardiovascular', 'agility'], ARRAY['cones', 'hurdles'], 'Set up obstacle course and practice running through it'),
  ('Equipment Carry', 'Simulate carrying police equipment', police_id, 'intermediate', ARRAY['legs', 'core', 'shoulders'], ARRAY['weight_vest', 'dumbbells'], 'Walk while carrying weighted equipment to simulate real police work'),
  ('Barrier Climbing', 'Practice climbing over obstacles', police_id, 'intermediate', ARRAY['legs', 'upper_body', 'core'], ARRAY['climbing_wall', 'boxes'], 'Practice climbing over obstacles');

END $$;

-- =====================================================================
-- WORKOUT PLANS
-- =====================================================================

INSERT INTO public.workout_plans (title, description, difficulty_level, duration_weeks, focus_areas, target_audience, is_featured, is_active) VALUES
('Police Fitness Prep Program', 'Comprehensive 8-week program designed specifically for police fitness test preparation. Includes strength training, cardio, and police-specific exercises.', 'intermediate', 8, ARRAY['strength', 'cardio', 'endurance'], 'police_candidates', true, true),
('Beginner Fitness Foundation', 'Perfect for those new to fitness. Builds fundamental strength, cardio, and flexibility in a safe, progressive manner.', 'beginner', 6, ARRAY['strength', 'cardio', 'flexibility'], 'general_fitness', true, true),
('Advanced Strength & Power', 'High-intensity strength training program for experienced athletes. Focuses on compound movements, progressive overload, and power development.', 'advanced', 10, ARRAY['strength', 'power', 'endurance'], 'advanced_athletes', true, true);

-- =====================================================================
-- WORKOUTS FOR POLICE FITNESS PREP PROGRAM
-- =====================================================================

DO $$
DECLARE
  police_plan_id UUID;
BEGIN
  SELECT id INTO police_plan_id FROM public.workout_plans WHERE title = 'Police Fitness Prep Program' LIMIT 1;
  
  -- Week 1 Workouts
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (police_plan_id, 'Week 1 - Day 1: Upper Body Strength', 'Focus on push-ups, pull-ups, and shoulder strength', 1, 1, 45, 60),
  (police_plan_id, 'Week 1 - Day 2: Cardio & Endurance', 'Running intervals and shuttle run practice', 2, 1, 30, 45),
  (police_plan_id, 'Week 1 - Day 3: Core & Stability', 'Core exercises and balance training', 3, 1, 40, 60),
  (police_plan_id, 'Week 1 - Day 4: Lower Body Strength', 'Squats, lunges, and leg strength', 4, 1, 45, 60),
  (police_plan_id, 'Week 1 - Day 5: Active Recovery', 'Light stretching and mobility work', 5, 1, 25, 30);

  -- Week 2 Workouts
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (police_plan_id, 'Week 2 - Day 1: Advanced Upper Body', 'Progressive overload on upper body exercises', 1, 2, 50, 60),
  (police_plan_id, 'Week 2 - Day 2: High-Intensity Cardio', 'Tabata intervals and sprint training', 2, 2, 35, 45),
  (police_plan_id, 'Week 2 - Day 3: Dynamic Core', 'Advanced core movements and stability', 3, 2, 45, 60),
  (police_plan_id, 'Week 2 - Day 4: Power Training', 'Explosive movements and plyometrics', 4, 2, 50, 60),
  (police_plan_id, 'Week 2 - Day 5: Recovery & Mobility', 'Foam rolling and flexibility work', 5, 2, 30, 30);
END $$;

-- =====================================================================
-- WORKOUTS FOR BEGINNER FITNESS FOUNDATION
-- =====================================================================

DO $$
DECLARE
  beginner_plan_id UUID;
BEGIN
  SELECT id INTO beginner_plan_id FROM public.workout_plans WHERE title = 'Beginner Fitness Foundation' LIMIT 1;
  
  -- Week 1 Workouts
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (beginner_plan_id, 'Week 1 - Day 1: Introduction to Strength', 'Basic bodyweight exercises and form instruction', 1, 1, 30, 90),
  (beginner_plan_id, 'Week 1 - Day 2: Walking & Light Cardio', 'Gentle cardio introduction and walking intervals', 2, 1, 25, 60),
  (beginner_plan_id, 'Week 1 - Day 3: Basic Core', 'Simple core exercises and posture work', 3, 1, 25, 90),
  (beginner_plan_id, 'Week 1 - Day 4: Rest Day', 'Active recovery with light stretching', 4, 1, 15, 30),
  (beginner_plan_id, 'Week 1 - Day 5: Flexibility & Mobility', 'Basic stretching and range of motion work', 5, 1, 20, 60);
END $$;

-- =====================================================================
-- WORKOUT EXERCISES
-- =====================================================================

DO $$
DECLARE
  workout_id UUID;
  pushup_id UUID;
  squat_id UUID;
  plank_id UUID;
  lunge_id UUID;
  burpee_id UUID;
BEGIN
  -- Get exercise IDs
  SELECT id INTO pushup_id FROM public.exercises WHERE name = 'Push-ups';
  SELECT id INTO squat_id FROM public.exercises WHERE name = 'Squats';
  SELECT id INTO plank_id FROM public.exercises WHERE name = 'Plank';
  SELECT id INTO lunge_id FROM public.exercises WHERE name = 'Lunges';
  SELECT id INTO burpee_id FROM public.exercises WHERE name = 'Burpees';

  -- Get workout ID for Week 1 Day 1 of Police Plan
  SELECT id INTO workout_id FROM public.workouts 
  WHERE plan_id = (SELECT id FROM public.workout_plans WHERE title = 'Police Fitness Prep Program')
  AND week_number = 1 AND day_number = 1;

  -- Add exercises to workout
  IF workout_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight_kg, rest_time_seconds) VALUES
    (workout_id, pushup_id, 1, 3, 10, NULL, 60),
    (workout_id, squat_id, 2, 3, 15, NULL, 60),
    (workout_id, plank_id, 3, 3, 30, NULL, 60),
    (workout_id, lunge_id, 4, 3, 10, NULL, 60),
    (workout_id, burpee_id, 5, 3, 8, NULL, 90);
  END IF;
END $$;

-- Re-enable RLS after seeding
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Exercise Categories' as table_name, COUNT(*) as count FROM public.exercise_categories
UNION ALL
SELECT 'Exercises' as table_name, COUNT(*) as count FROM public.exercises
UNION ALL
SELECT 'Workout Plans' as table_name, COUNT(*) as count FROM public.workout_plans
UNION ALL
SELECT 'Workouts' as table_name, COUNT(*) as count FROM public.workouts
UNION ALL
SELECT 'Workout Exercises' as table_name, COUNT(*) as count FROM public.workout_exercises;

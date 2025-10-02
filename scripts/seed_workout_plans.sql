-- =====================================================================
-- SEED WORKOUT PLANS FOR TESTING
-- =====================================================================

-- Insert a Police Fitness Prep Plan
INSERT INTO public.workout_plans (
  title,
  description,
  difficulty_level,
  duration_weeks,
  focus_areas,
  target_audience,
  is_featured,
  is_active
) VALUES (
  'Police Fitness Prep Program',
  'Comprehensive 8-week program designed specifically for police fitness test preparation. Includes strength training, cardio, and police-specific exercises.',
  'intermediate',
  8,
  ARRAY['strength', 'cardio', 'endurance'],
  'police_candidates',
  true,
  true
) RETURNING id;

-- Get the plan ID
DO $$
DECLARE
  plan_id UUID;
BEGIN
  SELECT id INTO plan_id FROM public.workout_plans WHERE title = 'Police Fitness Prep Program' LIMIT 1;
  
  -- Insert workouts for Week 1
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (plan_id, 'Week 1 - Day 1: Upper Body Strength', 'Focus on push-ups, pull-ups, and shoulder strength', 1, 1, 45, 60),
  (plan_id, 'Week 1 - Day 2: Cardio & Endurance', 'Running intervals and shuttle run practice', 2, 1, 30, 45),
  (plan_id, 'Week 1 - Day 3: Core & Stability', 'Core exercises and balance training', 3, 1, 40, 60),
  (plan_id, 'Week 1 - Day 4: Lower Body Strength', 'Squats, lunges, and leg strength', 4, 1, 45, 60),
  (plan_id, 'Week 1 - Day 5: Active Recovery', 'Light stretching and mobility work', 5, 1, 25, 30);

  -- Insert workouts for Week 2
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (plan_id, 'Week 2 - Day 1: Advanced Upper Body', 'Progressive overload on upper body exercises', 1, 2, 50, 60),
  (plan_id, 'Week 2 - Day 2: High-Intensity Cardio', 'Tabata intervals and sprint training', 2, 2, 35, 45),
  (plan_id, 'Week 2 - Day 3: Dynamic Core', 'Advanced core movements and stability', 3, 2, 45, 60),
  (plan_id, 'Week 2 - Day 4: Power Training', 'Explosive movements and plyometrics', 4, 2, 50, 60),
  (plan_id, 'Week 2 - Day 5: Recovery & Mobility', 'Foam rolling and flexibility work', 5, 2, 30, 30);
END $$;

-- Insert a Beginner Fitness Plan
INSERT INTO public.workout_plans (
  title,
  description,
  difficulty_level,
  duration_weeks,
  focus_areas,
  target_audience,
  is_featured,
  is_active
) VALUES (
  'Beginner Fitness Foundation',
  'Perfect for those new to fitness. Builds fundamental strength, cardio, and flexibility in a safe, progressive manner.',
  'beginner',
  6,
  ARRAY['strength', 'cardio', 'flexibility'],
  'general_fitness',
  true,
  true
) RETURNING id;

-- Get the beginner plan ID and add workouts
DO $$
DECLARE
  beginner_plan_id UUID;
BEGIN
  SELECT id INTO beginner_plan_id FROM public.workout_plans WHERE title = 'Beginner Fitness Foundation' LIMIT 1;
  
  -- Insert workouts for Week 1
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (beginner_plan_id, 'Week 1 - Day 1: Introduction to Strength', 'Basic bodyweight exercises and form instruction', 1, 1, 30, 90),
  (beginner_plan_id, 'Week 1 - Day 2: Walking & Light Cardio', 'Gentle cardio introduction and walking intervals', 2, 1, 25, 60),
  (beginner_plan_id, 'Week 1 - Day 3: Basic Core', 'Simple core exercises and posture work', 3, 1, 25, 90),
  (beginner_plan_id, 'Week 1 - Day 4: Rest Day', 'Active recovery with light stretching', 4, 1, 15, 30),
  (beginner_plan_id, 'Week 1 - Day 5: Flexibility & Mobility', 'Basic stretching and range of motion work', 5, 1, 20, 60);
END $$;

-- Insert an Advanced Strength Plan
INSERT INTO public.workout_plans (
  title,
  description,
  difficulty_level,
  duration_weeks,
  focus_areas,
  target_audience,
  is_featured,
  is_active
) VALUES (
  'Advanced Strength & Power',
  'High-intensity strength training program for experienced athletes. Focuses on compound movements, progressive overload, and power development.',
  'advanced',
  12,
  ARRAY['strength', 'power', 'endurance'],
  'athletes',
  true,
  true
) RETURNING id;

-- Get the advanced plan ID and add workouts
DO $$
DECLARE
  advanced_plan_id UUID;
BEGIN
  SELECT id INTO advanced_plan_id FROM public.workout_plans WHERE title = 'Advanced Strength & Power' LIMIT 1;
  
  -- Insert workouts for Week 1
  INSERT INTO public.workouts (plan_id, name, description, day_number, week_number, estimated_duration_minutes, rest_between_exercises_seconds) VALUES
  (advanced_plan_id, 'Week 1 - Day 1: Heavy Compound Lifts', 'Deadlifts, squats, and bench press focus', 1, 1, 75, 120),
  (advanced_plan_id, 'Week 1 - Day 2: Power & Explosiveness', 'Olympic lifts and plyometric training', 2, 1, 60, 90),
  (advanced_plan_id, 'Week 1 - Day 3: Upper Body Strength', 'Progressive overload on upper body movements', 3, 1, 70, 120),
  (advanced_plan_id, 'Week 1 - Day 4: Lower Body Power', 'Squat variations and explosive movements', 4, 1, 65, 120),
  (advanced_plan_id, 'Week 1 - Day 5: Accessory & Recovery', 'Isolation work and active recovery', 5, 1, 45, 90);
END $$;

-- Add exercises to the first workout of the Police Fitness Plan
DO $$
DECLARE
  workout_id UUID;
  push_ups_id UUID;
  sit_ups_id UUID;
  running_id UUID;
BEGIN
  -- Get the first workout of the police plan
  SELECT w.id INTO workout_id 
  FROM public.workouts w 
  JOIN public.workout_plans wp ON w.plan_id = wp.id 
  WHERE wp.title = 'Police Fitness Prep Program' AND w.week_number = 1 AND w.day_number = 1;
  
  -- Get exercise IDs
  SELECT id INTO push_ups_id FROM public.exercises WHERE name = 'Push-ups';
  SELECT id INTO sit_ups_id FROM public.exercises WHERE name = 'Sit-ups';
  SELECT id INTO running_id FROM public.exercises WHERE name = 'Running';
  
  -- Add exercises to the workout
  INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight_kg, rest_time_seconds, notes) VALUES
  (workout_id, push_ups_id, 1, 3, 15, NULL, 90, 'Focus on proper form and controlled movement'),
  (workout_id, sit_ups_id, 2, 3, 20, NULL, 90, 'Keep feet flat on ground, engage core'),
  (workout_id, running_id, 3, 1, 1, NULL, 120, '10-minute moderate pace run');
END $$;

-- Add exercises to the first workout of the Beginner Plan
DO $$
DECLARE
  workout_id UUID;
  push_ups_id UUID;
  sit_ups_id UUID;
BEGIN
  -- Get the first workout of the beginner plan
  SELECT w.id INTO workout_id 
  FROM public.workouts w 
  JOIN public.workout_plans wp ON w.plan_id = wp.id 
  WHERE wp.title = 'Beginner Fitness Foundation' AND w.week_number = 1 AND w.day_number = 1;
  
  -- Get exercise IDs
  SELECT id INTO push_ups_id FROM public.exercises WHERE name = 'Push-ups';
  SELECT id INTO sit_ups_id FROM public.exercises WHERE name = 'Sit-ups';
  
  -- Add exercises to the workout
  INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight_kg, rest_time_seconds, notes) VALUES
  (workout_id, push_ups_id, 1, 2, 5, NULL, 120, 'Start with knee push-ups if needed'),
  (workout_id, sit_ups_id, 2, 2, 10, NULL, 120, 'Focus on form over quantity');
END $$;

-- Add exercises to the first workout of the Advanced Plan
DO $$
DECLARE
  workout_id UUID;
  push_ups_id UUID;
  sit_ups_id UUID;
  running_id UUID;
BEGIN
  -- Get the first workout of the advanced plan
  SELECT w.id INTO workout_id 
  FROM public.workouts w 
  JOIN public.workout_plans wp ON w.plan_id = wp.id 
  WHERE wp.title = 'Advanced Strength & Power' AND w.week_number = 1 AND w.day_number = 1;
  
  -- Get exercise IDs
  SELECT id INTO push_ups_id FROM public.exercises WHERE name = 'Push-ups';
  SELECT id INTO sit_ups_id FROM public.exercises WHERE name = 'Sit-ups';
  SELECT id INTO running_id FROM public.exercises WHERE name = 'Running';
  
  -- Add exercises to the workout
  INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight_kg, rest_time_seconds, notes) VALUES
  (workout_id, push_ups_id, 1, 5, 25, NULL, 60, 'Explosive push-ups with clap'),
  (workout_id, sit_ups_id, 2, 4, 30, NULL, 60, 'Fast tempo, minimal rest'),
  (workout_id, running_id, 3, 1, 1, NULL, 90, '20-minute high-intensity intervals');
END $$;







-- =====================================================================
-- WORKOUT TRACKING SYSTEM SCHEMA
-- =====================================================================
-- This migration adds comprehensive workout tracking capabilities
-- including admin-created workout plans, exercise library, and user progress tracking

-- =====================================================================
-- CLEANUP EXISTING TABLES (if they exist with wrong structure)
-- =====================================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS public.completed_sets CASCADE;
DROP TABLE IF EXISTS public.user_exercise_progress CASCADE;
DROP TABLE IF EXISTS public.user_workout_sessions CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.workout_plans CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.exercise_categories CASCADE;

-- =====================================================================
-- EXERCISE LIBRARY (Admin-managed)
-- =====================================================================

-- Exercise categories for organization
CREATE TABLE public.exercise_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercise library (admin-created exercises)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.exercise_categories(id) ON DELETE SET NULL,
  muscle_groups TEXT[], -- ['chest', 'triceps', 'shoulders']
  equipment_needed TEXT[], -- ['dumbbells', 'barbell', 'bodyweight']
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT,
  video_url TEXT,
  gif_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- WORKOUT PLANS (Admin-created)
-- =====================================================================

-- Workout plans created by admins
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER NOT NULL,
  focus_areas TEXT[], -- ['strength', 'cardio', 'flexibility', 'endurance']
  target_audience TEXT, -- 'police_candidates', 'general_fitness', etc.
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual workouts within a plan
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_number INTEGER NOT NULL, -- Day 1, Day 2, etc.
  week_number INTEGER NOT NULL, -- Week 1, Week 2, etc.
  estimated_duration_minutes INTEGER,
  rest_between_exercises_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, week_number, day_number)
);

-- Exercises within a workout
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL, -- Order within the workout
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight_kg NUMERIC, -- Optional weight in kg
  rest_time_seconds INTEGER NOT NULL DEFAULT 90,
  notes TEXT,
  -- Cardio-specific fields
  cardio_category TEXT CHECK (cardio_category IN ('endurance', 'speed', 'intervals', 'strength')),
  cardio_type TEXT CHECK (cardio_type IN ('easy_run', 'tempo_run', 'long_run', 'threshold_run', 'progressive_run', 'recovery_run', 'sprint_intervals', 'hill_runs', 'fartlek', 'ladder_intervals', 'pyramid_intervals', 'time_trial')),
  -- Duration with adjustable units
  duration_value NUMERIC, -- Duration value
  duration_unit TEXT CHECK (duration_unit IN ('seconds', 'minutes', 'hours')) DEFAULT 'minutes',
  -- Distance with adjustable units
  distance_value NUMERIC, -- Distance value
  distance_unit TEXT CHECK (distance_unit IN ('meters', 'kilometers', 'miles')) DEFAULT 'kilometers',
  -- Warm-up with adjustable units
  warm_up_value NUMERIC DEFAULT 5, -- Warm-up value
  warm_up_unit TEXT CHECK (warm_up_unit IN ('seconds', 'minutes')) DEFAULT 'minutes',
  intensity_level TEXT CHECK (intensity_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
  target_pace_min_km NUMERIC, -- Target pace in minutes per kilometer
  heart_rate_zone TEXT CHECK (heart_rate_zone IN ('zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5')),
  interval_count INTEGER, -- Number of intervals for interval training
  interval_duration_seconds INTEGER, -- Duration of work intervals
  interval_rest_seconds INTEGER, -- Rest time between intervals
  -- Advanced interval configuration
  ladder_start_seconds INTEGER, -- Starting duration for ladder intervals
  ladder_increment_seconds INTEGER, -- Increment for ladder intervals
  -- Hill training specific
  hill_grade_percent NUMERIC, -- Hill grade percentage
  hill_distance_meters NUMERIC, -- Distance per hill repeat in meters
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workout_id, exercise_id, order_index)
);

-- =====================================================================
-- USER WORKOUT TRACKING
-- =====================================================================

-- User workout sessions
CREATE TABLE public.user_workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual set completions
CREATE TABLE public.completed_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.user_workout_sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL, -- Set 1, Set 2, etc.
  reps_completed INTEGER,
  weight_kg NUMERIC,
  rest_time_seconds INTEGER, -- Actual rest time taken
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User progress tracking (personal records, etc.)
CREATE TABLE public.user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  max_weight_kg NUMERIC,
  max_reps INTEGER,
  max_sets INTEGER,
  total_volume INTEGER, -- Total reps across all time
  last_performed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Exercise indexes
CREATE INDEX idx_exercises_category ON public.exercises(category_id);
CREATE INDEX idx_exercises_active ON public.exercises(is_active);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by);

-- Workout plan indexes
CREATE INDEX idx_workout_plans_active ON public.workout_plans(is_active);
CREATE INDEX idx_workout_plans_featured ON public.workout_plans(is_featured);
CREATE INDEX idx_workout_plans_difficulty ON public.workout_plans(difficulty_level);
CREATE INDEX idx_workout_plans_created_by ON public.workout_plans(created_by);

-- Workout indexes
CREATE INDEX idx_workouts_plan ON public.workouts(plan_id);
CREATE INDEX idx_workouts_week_day ON public.workouts(week_number, day_number);

-- Workout exercise indexes
CREATE INDEX idx_workout_exercises_workout ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON public.workout_exercises(workout_id, order_index);

-- User session indexes
CREATE INDEX idx_user_sessions_user ON public.user_workout_sessions(user_id);
CREATE INDEX idx_user_sessions_workout ON public.user_workout_sessions(workout_id);
CREATE INDEX idx_user_sessions_started ON public.user_workout_sessions(started_at);

-- Completed sets indexes
CREATE INDEX idx_completed_sets_session ON public.completed_sets(session_id);
CREATE INDEX idx_completed_sets_exercise ON public.completed_sets(exercise_id);
CREATE INDEX idx_completed_sets_completed_at ON public.completed_sets(completed_at);

-- Progress indexes
CREATE INDEX idx_user_progress_user ON public.user_exercise_progress(user_id);
CREATE INDEX idx_user_progress_exercise ON public.user_exercise_progress(exercise_id);

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Insert basic exercise categories
INSERT INTO public.exercise_categories (name, description, icon, color) VALUES
('Strength Training', 'Build muscle and increase strength', 'dumbbell', '#3B82F6'),
('Cardio', 'Improve cardiovascular fitness', 'heart', '#EF4444'),
('Flexibility', 'Improve range of motion and mobility', 'stretch', '#10B981'),
('Core', 'Strengthen abdominal and back muscles', 'target', '#F59E0B'),
('Bodyweight', 'Exercises using only body weight', 'user', '#8B5CF6'),
('Police Specific', 'Exercises relevant to police fitness tests', 'shield', '#DC2626')
ON CONFLICT (name) DO NOTHING;

-- Insert basic exercises for police fitness
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Push-ups',
  'Standard push-ups to build upper body strength',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight'],
  'beginner',
  'Start in plank position, lower body until chest nearly touches ground, push back up'
FROM public.exercise_categories ec WHERE ec.name = 'Strength Training'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions)
SELECT 
  'Sit-ups',
  'Core strengthening exercise',
  ec.id,
  ARRAY['abs', 'core'],
  ARRAY['bodyweight'],
  'beginner',
  'Lie on back, knees bent, lift upper body to knees, lower back down'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions)
SELECT 
  'Running',
  'Cardiovascular endurance training',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['running_shoes'],
  'beginner',
  'Maintain good posture, land mid-foot, keep steady pace'
FROM public.exercise_categories ec WHERE ec.name = 'Cardio'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_progress ENABLE ROW LEVEL SECURITY;

-- Exercise categories: Readable by all authenticated users
CREATE POLICY "Exercise categories are viewable by authenticated users" ON public.exercise_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Exercises: Readable by all authenticated users, writable by admins
CREATE POLICY "Exercises are viewable by authenticated users" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Exercises are insertable by admins" ON public.exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Exercises are updatable by admins" ON public.exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Workout plans: Readable by all authenticated users, writable by admins
CREATE POLICY "Workout plans are viewable by authenticated users" ON public.workout_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workout plans are insertable by admins" ON public.workout_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Workout plans are updatable by admins" ON public.workout_plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Workouts: Readable by all authenticated users, writable by admins
CREATE POLICY "Workouts are viewable by authenticated users" ON public.workouts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workouts are insertable by admins" ON public.workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Workout exercises: Readable by all authenticated users, writable by admins
CREATE POLICY "Workout exercises are viewable by authenticated users" ON public.workout_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workout exercises are insertable by admins" ON public.workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- User sessions: Users can only see their own sessions
CREATE POLICY "Users can view their own workout sessions" ON public.user_workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sessions" ON public.user_workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" ON public.user_workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Completed sets: Users can only see their own completed sets
CREATE POLICY "Users can view their own completed sets" ON public.completed_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_workout_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own completed sets" ON public.completed_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_workout_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- User progress: Users can only see their own progress
CREATE POLICY "Users can view their own exercise progress" ON public.user_exercise_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise progress" ON public.user_exercise_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise progress" ON public.user_exercise_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_exercise_categories_updated_at BEFORE UPDATE ON public.exercise_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_workout_sessions_updated_at BEFORE UPDATE ON public.user_workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exercise_progress_updated_at BEFORE UPDATE ON public.user_exercise_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

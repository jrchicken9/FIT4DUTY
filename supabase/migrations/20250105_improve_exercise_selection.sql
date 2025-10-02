-- =====================================================================
-- IMPROVE EXERCISE SELECTION FUNCTIONALITY
-- =====================================================================
-- This migration adds improvements to the exercise selection system
-- including better search, filtering, and organization features

-- =====================================================================
-- ADD NEW COLUMNS TO EXERCISES TABLE
-- =====================================================================

-- Add search and organization improvements
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS search_tags TEXT[], -- For better search functionality
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0, -- Track most used exercises
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER, -- Estimated time to complete
ADD COLUMN IF NOT EXISTS calories_burn_rate INTEGER, -- Calories burned per minute (approximate)
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false; -- Featured exercises for quick access

-- =====================================================================
-- ADD NEW COLUMNS TO EXERCISE_CATEGORIES TABLE
-- =====================================================================

-- Add better category organization
ALTER TABLE public.exercise_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0, -- For custom ordering
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false; -- Primary categories for main display

-- =====================================================================
-- CREATE EXERCISE TEMPLATES TABLE
-- =====================================================================

-- Pre-configured exercise templates for quick addition
CREATE TABLE IF NOT EXISTS public.exercise_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.exercise_categories(id) ON DELETE SET NULL,
  template_type TEXT CHECK (template_type IN ('strength', 'cardio', 'flexibility', 'warmup', 'cooldown')),
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_rest_seconds INTEGER DEFAULT 90,
  default_duration_minutes INTEGER,
  default_distance_km NUMERIC,
  default_cardio_type TEXT CHECK (default_cardio_type IS NULL OR default_cardio_type IN ('easy_run', 'tempo_run', 'long_run', 'threshold_run', 'progressive_run', 'recovery_run', 'sprint_intervals', 'hill_runs', 'fartlek', 'ladder_intervals', 'pyramid_intervals', 'time_trial')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to existing exercise_templates table if they don't exist
ALTER TABLE public.exercise_templates 
ADD COLUMN IF NOT EXISTS default_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS default_distance_km NUMERIC;

-- Drop existing constraint if it exists and add new one
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'exercise_templates_default_cardio_type_check'
  ) THEN
    ALTER TABLE public.exercise_templates DROP CONSTRAINT exercise_templates_default_cardio_type_check;
  END IF;
  
  -- Add new constraint with updated cardio types
  ALTER TABLE public.exercise_templates 
  ADD CONSTRAINT exercise_templates_default_cardio_type_check 
  CHECK (default_cardio_type IS NULL OR default_cardio_type IN ('easy_run', 'tempo_run', 'long_run', 'sprint_intervals', 'hill_runs', 'fartlek'));
END $$;

-- =====================================================================
-- CREATE EXERCISE FAVORITES TABLE
-- =====================================================================

-- Allow admins to mark favorite exercises for quick access
CREATE TABLE IF NOT EXISTS public.exercise_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- =====================================================================
-- CREATE EXERCISE USAGE STATISTICS TABLE
-- =====================================================================

-- Track exercise usage for popularity scoring
CREATE TABLE IF NOT EXISTS public.exercise_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exercise_id)
);

-- =====================================================================
-- ADD INDEXES FOR NEW FUNCTIONALITY
-- =====================================================================

-- Exercise search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_exercises_search_tags ON public.exercises USING GIN(search_tags);
CREATE INDEX IF NOT EXISTS idx_exercises_popularity ON public.exercises(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_featured ON public.exercises(is_featured);
CREATE INDEX IF NOT EXISTS idx_exercises_duration ON public.exercises(estimated_duration_minutes);

-- Category organization indexes
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.exercise_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_primary ON public.exercise_categories(is_primary);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_exercise_templates_type ON public.exercise_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_exercise_templates_active ON public.exercise_templates(is_active);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_exercise_favorites_user ON public.exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_favorites_exercise ON public.exercise_favorites(exercise_id);

-- Usage stats indexes
CREATE INDEX IF NOT EXISTS idx_exercise_usage_stats_usage ON public.exercise_usage_stats(times_used DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_usage_stats_last_used ON public.exercise_usage_stats(last_used_at DESC);

-- =====================================================================
-- UPDATE EXISTING SEED DATA
-- =====================================================================

-- Update existing categories with better organization
UPDATE public.exercise_categories 
SET sort_order = CASE 
  WHEN name = 'Strength Training' THEN 1
  WHEN name = 'Cardio' THEN 2
  WHEN name = 'Core' THEN 3
  WHEN name = 'Flexibility' THEN 4
  ELSE 5
END,
is_primary = CASE 
  WHEN name IN ('Strength Training', 'Cardio', 'Core') THEN true
  ELSE false
END;

-- Add search tags to existing exercises (example)
UPDATE public.exercises 
SET search_tags = ARRAY[
  LOWER(name),
  LOWER(COALESCE(description, '')),
  LOWER(ARRAY_TO_STRING(muscle_groups, ' ')),
  LOWER(ARRAY_TO_STRING(equipment_needed, ' '))
]
WHERE search_tags IS NULL;

-- =====================================================================
-- INSERT EXERCISE TEMPLATES
-- =====================================================================

-- Insert common exercise templates for quick addition (only if they don't exist)
INSERT INTO public.exercise_templates (name, description, template_type, default_sets, default_reps, default_rest_seconds, default_duration_minutes, default_cardio_type, default_distance_km) 
SELECT * FROM (VALUES
-- Strength Templates
('Push-ups', 'Standard push-ups for chest and triceps', 'strength', 3, 15, 60, NULL, NULL, NULL),
('Squats', 'Bodyweight squats for legs', 'strength', 3, 20, 90, NULL, NULL, NULL),
('Pull-ups', 'Upper body pulling exercise', 'strength', 3, 8, 120, NULL, NULL, NULL),
('Lunges', 'Forward lunges for leg strength', 'strength', 3, 12, 60, NULL, NULL, NULL),
('Plank', 'Core stability exercise', 'strength', 3, 60, 30, NULL, NULL, NULL), -- 60 seconds hold

-- Cardio Templates
('Easy Run', 'Light jogging for endurance building', 'cardio', 1, 0, 0, 30, 'easy_run', 3.0),
('Tempo Run', 'Moderate pace for speed development', 'cardio', 1, 0, 0, 25, 'tempo_run', 4.0),
('Long Run', 'Extended distance for endurance', 'cardio', 1, 0, 0, 60, 'long_run', 8.0),
('Sprint Intervals', 'High intensity burst training', 'cardio', 1, 0, 0, 20, 'sprint_intervals', NULL),
('Hill Runs', 'Incline training for strength', 'cardio', 1, 0, 0, 30, 'hill_runs', NULL),
('Fartlek Training', 'Speed play variations', 'cardio', 1, 0, 0, 25, 'fartlek', NULL),

-- Warm-up Templates
('Light Stretching', 'Gentle stretching to warm up', 'warmup', 1, 0, 0, 10, NULL, NULL),
('Dynamic Stretches', 'Movement-based warm-up', 'warmup', 1, 0, 0, 8, NULL, NULL),

-- Cool-down Templates
('Static Stretching', 'Hold stretches for recovery', 'cooldown', 1, 0, 0, 5, NULL, NULL),
('Light Walking', 'Gradual cool-down', 'cooldown', 1, 0, 0, 5, NULL, NULL)
) AS v(name, description, template_type, default_sets, default_reps, default_rest_seconds, default_duration_minutes, default_cardio_type, default_distance_km)
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercise_templates WHERE name = v.name
);

-- =====================================================================
-- CREATE FUNCTIONS FOR EXERCISE SEARCH
-- =====================================================================

-- Function to search exercises with multiple criteria
CREATE OR REPLACE FUNCTION search_exercises(
  search_term TEXT DEFAULT NULL,
  category_ids UUID[] DEFAULT NULL,
  difficulty_levels TEXT[] DEFAULT NULL,
  equipment_types TEXT[] DEFAULT NULL,
  target_muscle_groups TEXT[] DEFAULT NULL,
  max_duration_minutes INTEGER DEFAULT NULL,
  include_featured BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  category_name TEXT,
  muscle_groups TEXT[],
  equipment_needed TEXT[],
  difficulty_level TEXT,
  estimated_duration_minutes INTEGER,
  is_featured BOOLEAN,
  popularity_score INTEGER,
  search_rank NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.description,
    e.category_id,
    ec.name as category_name,
    e.muscle_groups,
    e.equipment_needed,
    e.difficulty_level,
    e.estimated_duration_minutes,
    e.is_featured,
    e.popularity_score,
    -- Calculate search rank based on relevance
    CASE 
      WHEN search_term IS NOT NULL THEN
        CASE 
          WHEN e.name ILIKE '%' || search_term || '%' THEN 100
          WHEN e.description ILIKE '%' || search_term || '%' THEN 50
          WHEN search_term = ANY(e.search_tags) THEN 75
          ELSE 0
        END
      ELSE 0
    END + 
    CASE WHEN e.is_featured THEN 25 ELSE 0 END +
    COALESCE(e.popularity_score, 0) as search_rank
  FROM public.exercises e
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  WHERE e.is_active = true
    AND (search_term IS NULL OR 
         e.name ILIKE '%' || search_term || '%' OR 
         e.description ILIKE '%' || search_term || '%' OR
         search_term = ANY(e.search_tags))
    AND (category_ids IS NULL OR e.category_id = ANY(category_ids))
    AND (difficulty_levels IS NULL OR e.difficulty_level = ANY(difficulty_levels))
    AND (equipment_types IS NULL OR e.equipment_needed && equipment_types)
    AND (target_muscle_groups IS NULL OR e.muscle_groups && target_muscle_groups)
    AND (max_duration_minutes IS NULL OR e.estimated_duration_minutes <= max_duration_minutes)
    AND (NOT include_featured OR e.is_featured = true)
  ORDER BY search_rank DESC, e.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular exercises
CREATE OR REPLACE FUNCTION get_popular_exercises(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category_name TEXT,
  times_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    ec.name as category_name,
    COALESCE(eus.times_used, 0) as times_used
  FROM public.exercises e
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  LEFT JOIN public.exercise_usage_stats eus ON e.id = eus.exercise_id
  WHERE e.is_active = true
  ORDER BY COALESCE(eus.times_used, 0) DESC, e.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get exercise favorites for a user
CREATE OR REPLACE FUNCTION get_user_exercise_favorites(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category_name TEXT,
  difficulty_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    ec.name as category_name,
    e.difficulty_level
  FROM public.exercise_favorites ef
  JOIN public.exercises e ON ef.exercise_id = e.id
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  WHERE ef.user_id = user_uuid AND e.is_active = true
  ORDER BY ef.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================

-- Trigger to update exercise usage statistics
CREATE OR REPLACE FUNCTION update_exercise_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.exercise_usage_stats (exercise_id, times_used, last_used_at)
  VALUES (NEW.exercise_id, 1, now())
  ON CONFLICT (exercise_id)
  DO UPDATE SET 
    times_used = exercise_usage_stats.times_used + 1,
    last_used_at = now(),
    updated_at = now();
  
  -- Update popularity score in exercises table
  UPDATE public.exercises 
  SET popularity_score = (
    SELECT times_used 
    FROM public.exercise_usage_stats 
    WHERE exercise_id = NEW.exercise_id
  )
  WHERE id = NEW.exercise_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workout_exercises table (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_update_exercise_usage' 
    AND event_object_table = 'workout_exercises'
  ) THEN
    CREATE TRIGGER trigger_update_exercise_usage
      AFTER INSERT ON public.workout_exercises
      FOR EACH ROW
      EXECUTE FUNCTION update_exercise_usage();
  END IF;
END $$;

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Exercise templates RLS
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  -- Exercise templates policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_templates' 
    AND policyname = 'Exercise templates are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Exercise templates are viewable by authenticated users" ON public.exercise_templates
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_templates' 
    AND policyname = 'Exercise templates are insertable by admins'
  ) THEN
    CREATE POLICY "Exercise templates are insertable by admins" ON public.exercise_templates
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Exercise favorites RLS
ALTER TABLE public.exercise_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_favorites' 
    AND policyname = 'Users can view their own favorites'
  ) THEN
    CREATE POLICY "Users can view their own favorites" ON public.exercise_favorites
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_favorites' 
    AND policyname = 'Users can manage their own favorites'
  ) THEN
    CREATE POLICY "Users can manage their own favorites" ON public.exercise_favorites
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Exercise usage stats RLS
ALTER TABLE public.exercise_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_usage_stats' 
    AND policyname = 'Usage stats are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Usage stats are viewable by authenticated users" ON public.exercise_usage_stats
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercise_usage_stats' 
    AND policyname = 'Usage stats are insertable by authenticated users'
  ) THEN
    CREATE POLICY "Usage stats are insertable by authenticated users" ON public.exercise_usage_stats
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

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
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE public.exercise_templates IS 'Pre-configured exercise templates for quick addition to workouts';
COMMENT ON TABLE public.exercise_favorites IS 'User favorite exercises for quick access';
COMMENT ON TABLE public.exercise_usage_stats IS 'Track exercise usage for popularity scoring';
COMMENT ON FUNCTION search_exercises IS 'Advanced exercise search with multiple filtering options';
COMMENT ON FUNCTION get_popular_exercises IS 'Get most frequently used exercises';
COMMENT ON FUNCTION get_user_exercise_favorites IS 'Get favorite exercises for a specific user';

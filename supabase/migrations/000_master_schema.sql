-- =====================================================================
-- MASTER DATABASE SCHEMA FOR POLICE APPLICATION APP
-- =====================================================================
-- This file consolidates all database structure, functions, views, and seed data
-- for the complete police application system.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CORE TABLES
-- =====================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male','female','other')),
  height NUMERIC,
  weight NUMERIC,
  location TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  goal TEXT,
  target_test_date DATE,
  department_interest TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner','intermediate','advanced')),
  motivation TEXT,
  has_experience BOOLEAN,
  previous_training TEXT,
  current_fitness_level TEXT CHECK (current_fitness_level IN ('beginner','intermediate','advanced')),
  workout_frequency TEXT,
  available_time TEXT,
  injuries TEXT,
  medical_conditions TEXT,
  prep_circuit_level TEXT CHECK (prep_circuit_level IN ('never_attempted','below_average','average','good','excellent')),
  shuttle_run_level NUMERIC,
  push_ups_max INTEGER,
  sit_reach_distance NUMERIC,
  mile_run_time TEXT,
  core_endurance_time INTEGER,
  back_extension_time INTEGER,
  role TEXT CHECK (role IN ('user','admin','super_admin')) DEFAULT 'user',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  admin_permissions TEXT[] NOT NULL DEFAULT '{}'::text[],
  fitness_level TEXT,
  goals TEXT[],
  has_seen_cpp_intro BOOLEAN NOT NULL DEFAULT false,
  cpp_percent NUMERIC NOT NULL DEFAULT 0,
  cpp_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application Progress tracking
CREATE TABLE IF NOT EXISTS public.application_progress (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started','in_progress','completed')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT application_progress_pkey PRIMARY KEY (user_id, step_id)
);

-- Application Profile (detailed competitiveness data)
CREATE TABLE IF NOT EXISTS public.application_profile (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Education
  education_level TEXT,
  education_field_relevant BOOLEAN,
  education_cont_ed_recent BOOLEAN,
  education_transcript_verified BOOLEAN,
  education_academic_recognition TEXT,
  education_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Work
  work_fulltime_years INTEGER,
  work_relevant_months INTEGER,
  work_public_facing BOOLEAN,
  work_continuity_ok BOOLEAN,
  work_leadership BOOLEAN,
  work_shift_exposure BOOLEAN,
  work_employment_letter_verified BOOLEAN,
  work_frontline_public_safety_12m BOOLEAN,
  work_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_public_contexts JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_shift_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Volunteer
  volunteer_hours_lifetime INTEGER,
  volunteer_hours_12mo INTEGER,
  volunteer_consistency_6mo BOOLEAN,
  volunteer_role_type TEXT,
  volunteer_lead_role BOOLEAN,
  volunteer_reference_verified BOOLEAN,
  volunteer_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Certs & Skills
  certs_cpr_c_current BOOLEAN,
  certs_mhfa BOOLEAN,
  certs_cpi_nvci BOOLEAN,
  certs_asist BOOLEAN,
  certs_cpr_c_verified BOOLEAN,
  certs_naloxone_trained BOOLEAN,
  certs_deescalation_advanced BOOLEAN,
  certs_cpr_valid_6mo BOOLEAN,
  certs_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_language_second BOOLEAN,
  skills_priority_language BOOLEAN,
  skills_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Driver
  driver_licence_class TEXT,
  driver_clean_abstract BOOLEAN,
  driver_abstract_verified BOOLEAN,
  driver_abstract_date TEXT,
  driver_infractions TEXT CHECK (driver_infractions IN ('None', '1 Minor', '2+ Minor', 'Major')),
  driver_infraction_date TEXT CHECK (driver_infraction_date IN ('Within 6 months', '6-12 months ago', '1-2 years ago', '2-3 years ago', '3+ years ago')),
  -- Fitness
  fitness_prep_observed_verified BOOLEAN,
  fitness_prep_digital_attempted BOOLEAN,
  fitness_prep_date TEXT,
  fitness_shuttle_run TEXT CHECK (fitness_shuttle_run IN ('Excellent', 'Good', 'Average', 'Below Average', 'Not Tested')),
  fitness_circuit_time TEXT,
  fitness_push_ups TEXT,
  fitness_sit_ups TEXT,
  fitness_pin_digital_attempts_3 BOOLEAN,
  -- References
  refs_count INTEGER,
  refs_diverse_contexts BOOLEAN,
  refs_confirmed_recent BOOLEAN,
  refs_letters_verified BOOLEAN,
  refs_supervisor_within_12mo BOOLEAN,
  refs_no_family BOOLEAN,
  refs_contactable_verified BOOLEAN,
  refs_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Conduct & Background
  conduct_no_major_issues BOOLEAN,
  conduct_clean_driving_24mo BOOLEAN,
  conduct_social_media_ack BOOLEAN,
  background_check_complete BOOLEAN,
  credit_check_complete BOOLEAN,
  social_media_clean BOOLEAN,
  education_verified BOOLEAN,
  employment_verified BOOLEAN,
  -- Resume & Awards
  awards_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Police Service Selection
  selected_police_service TEXT,
  -- Mandatory Requirements
  mandatory_requirements JSONB,
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- WORKOUT & FITNESS TABLES
-- =====================================================================

-- Workout plans
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout sessions
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  session_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout exercises
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'agility', 'bodyweight')),
  duration INTEGER, -- in minutes
  distance NUMERIC, -- in kilometers
  target_pace TEXT, -- format: "5:30" (min:sec per km)
  rest_time INTEGER, -- in seconds
  sets INTEGER,
  reps INTEGER,
  weight NUMERIC, -- in kg
  notes TEXT,
  order_index INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercise library
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('strength', 'cardio', 'flexibility', 'agility', 'bodyweight')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[],
  equipment_needed TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- BADGES SYSTEM
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic')),
  points INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_temporary BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'system',
  notes TEXT NULL,
  CONSTRAINT user_badges_unique UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.badge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NULL REFERENCES public.badges(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('issued','revoked','failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- TEST SYSTEM
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.test_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL,
  title TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.test_versions(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_index INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step_id TEXT NOT NULL,
  version_id UUID NOT NULL REFERENCES public.test_versions(id) ON DELETE RESTRICT,
  score INT NOT NULL,
  correct_count INT NOT NULL,
  total INT NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step_id TEXT NOT NULL,
  version_id UUID NOT NULL REFERENCES public.test_versions(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  device JSONB,
  integrity_score NUMERIC,
  flags JSONB
);

CREATE TABLE IF NOT EXISTS public.test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  payload JSONB
);

-- =====================================================================
-- COMPETITIVENESS SYSTEM
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.police_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  city TEXT,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competitiveness_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('province','service')),
  service_id UUID REFERENCES public.police_services(id) ON DELETE CASCADE,
  benchmarks JSONB NOT NULL,
  source_urls TEXT[],
  effective_date DATE DEFAULT current_date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benchmark_categories (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_unwritten BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benchmark_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key TEXT NOT NULL REFERENCES public.benchmark_categories(key) ON DELETE CASCADE,
  rule_key TEXT NOT NULL,
  description TEXT,
  is_anchor BOOLEAN NOT NULL DEFAULT false,
  is_unwritten BOOLEAN NOT NULL DEFAULT false,
  service_id UUID NULL REFERENCES public.police_services(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benchmark_thresholds (
  category_key TEXT PRIMARY KEY,
  thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_competitiveness_cache (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_tier TEXT,
  category_tiers JSONB,
  verified_counts JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- FITNESS & TESTING
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.pin_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mile_run_minutes INTEGER,
  mile_run_seconds INTEGER,
  pushups_count INTEGER,
  core_endurance_minutes INTEGER,
  core_endurance_seconds INTEGER,
  sit_reach_distance NUMERIC,
  overall_score NUMERIC,
  pass_status BOOLEAN,
  notes TEXT,
  test_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fitness_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('shuttle_run','push_ups','sit_ups','plank')),
  score NUMERIC,
  level NUMERIC,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- BOOKINGS & SESSIONS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID,
  status TEXT,
  payment_status TEXT,
  amount_cents INTEGER,
  waiver_signed BOOLEAN,
  waiver_signed_at TIMESTAMPTZ,
  waiver_signed_name TEXT,
  waiver_data JSONB,
  emergency_contact TEXT,
  emergency_phone TEXT,
  emergency_relationship TEXT,
  medical_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- CONTENT MANAGEMENT
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.app_content_text (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key VARCHAR(255) NOT NULL UNIQUE,
  section VARCHAR(100) NOT NULL,
  component VARCHAR(100) NOT NULL,
  current_text TEXT NOT NULL,
  description TEXT,
  last_updated_by UUID REFERENCES auth.users(id),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_content_text_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES app_content_text(id) ON DELETE CASCADE,
  previous_text TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

-- =====================================================================
-- INDEXES
-- =====================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Application progress indexes
CREATE INDEX IF NOT EXISTS idx_application_progress_user_id ON public.application_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_application_progress_step_id ON public.application_progress(step_id);

-- Application profile indexes
CREATE INDEX IF NOT EXISTS idx_application_profile_user_id ON public.application_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_application_profile_selected_service ON public.application_profile(selected_police_service);
CREATE INDEX IF NOT EXISTS idx_application_profile_mandatory_requirements ON public.application_profile USING GIN (mandatory_requirements);

-- Workout indexes
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan_id ON public.workout_sessions(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON public.workout_exercises(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_order ON public.workout_exercises(workout_session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON public.exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_difficulty ON public.exercise_library(difficulty_level);

-- Badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_active ON public.badges(active);

-- Test indexes
CREATE INDEX IF NOT EXISTS idx_test_versions_step_published ON public.test_versions(step_id, published_at DESC) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_test_questions_version_order ON public.test_questions(version_id, order_index);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_version_created ON public.test_attempts(user_id, version_id, created_at);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_version ON public.test_sessions(user_id, version_id);
CREATE INDEX IF NOT EXISTS idx_test_events_session_ts ON public.test_events(session_id, ts);

-- Competitiveness indexes
CREATE INDEX IF NOT EXISTS idx_competitiveness_benchmarks_service ON public.competitiveness_benchmarks(service_id);

-- Fitness indexes
CREATE INDEX IF NOT EXISTS idx_pin_test_results_user_id ON public.pin_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_tests_user_id ON public.fitness_tests(user_id);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_app_content_text_key ON public.app_content_text(content_key);
CREATE INDEX IF NOT EXISTS idx_app_content_text_section ON public.app_content_text(section);
CREATE INDEX IF NOT EXISTS idx_app_content_text_history_content_id ON public.app_content_text_history(content_id);

-- =====================================================================
-- CONSTRAINTS
-- =====================================================================

-- Benchmark rules uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS benchmark_rules_cat_rule_service_uniq
  ON public.benchmark_rules (category_key, rule_key, service_id)
  WHERE service_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS benchmark_rules_cat_rule_null_service_uniq
  ON public.benchmark_rules (category_key, rule_key)
  WHERE service_id IS NULL;

-- Police service constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_valid_police_service'
  ) THEN
    ALTER TABLE public.application_profile 
    ADD CONSTRAINT check_valid_police_service 
    CHECK (selected_police_service IN ('toronto', 'opp', 'peel', 'york', 'durham', 'hamilton', 'windsor', 'kingston', 'ottawa', 'london'));
  END IF;
END $$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitiveness_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_competitiveness_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_content_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_content_text_history ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin' OR is_admin = true))
  );

-- Application progress policies
CREATE POLICY "Users can manage own application progress" ON public.application_progress
  FOR ALL USING (auth.uid() = user_id);

-- Application profile policies
CREATE POLICY "Users can manage own application profile" ON public.application_profile
  FOR ALL USING (auth.uid() = user_id);

-- Workout policies
CREATE POLICY "Users can manage own workout plans" ON public.workout_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws 
      WHERE ws.id = workout_exercises.workout_session_id 
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "All users can view exercise library" ON public.exercise_library
  FOR SELECT USING (true);

-- Badges policies
CREATE POLICY "All users can view badges" ON public.badges FOR SELECT USING (true);

CREATE POLICY "Users can view own user badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badge events" ON public.badge_events
  FOR SELECT USING (auth.uid() = user_id);

-- Test policies
CREATE POLICY "Authenticated users can view test versions" ON public.test_versions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view test questions" ON public.test_questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own test attempts" ON public.test_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own test sessions" ON public.test_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert events for own sessions" ON public.test_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      WHERE s.id = test_events.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view events for own sessions" ON public.test_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      WHERE s.id = test_events.session_id AND s.user_id = auth.uid()
    )
  );

-- Competitiveness policies
CREATE POLICY "All users can view police services" ON public.police_services
  FOR SELECT USING (true);

CREATE POLICY "All users can view competitiveness benchmarks" ON public.competitiveness_benchmarks
  FOR SELECT USING (true);

CREATE POLICY "All users can view benchmark categories" ON public.benchmark_categories
  FOR SELECT USING (true);

CREATE POLICY "All users can view benchmark rules" ON public.benchmark_rules
  FOR SELECT USING (true);

CREATE POLICY "All users can view benchmark thresholds" ON public.benchmark_thresholds
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own competitiveness cache" ON public.user_competitiveness_cache
  FOR ALL USING (auth.uid() = user_id);

-- Admin write policies for competitiveness
CREATE POLICY "Super admins can manage police services" ON public.police_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can manage competitiveness benchmarks" ON public.competitiveness_benchmarks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can manage benchmark categories" ON public.benchmark_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can manage benchmark rules" ON public.benchmark_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can manage benchmark thresholds" ON public.benchmark_thresholds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Fitness policies
CREATE POLICY "Users can manage own pin test results" ON public.pin_test_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fitness tests" ON public.fitness_tests
  FOR ALL USING (auth.uid() = user_id);

-- Booking policies
CREATE POLICY "Users can manage own bookings" ON public.bookings
  FOR ALL USING (auth.uid() = user_id);

-- Content policies
CREATE POLICY "Super admins can manage app content text" ON public.app_content_text
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'super_admin' OR is_admin = true))
  );

CREATE POLICY "Authenticated users can read app content text" ON public.app_content_text
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage app content text history" ON public.app_content_text_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'super_admin' OR is_admin = true))
  );

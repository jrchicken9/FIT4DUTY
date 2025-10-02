-- =====================================================================
-- ESSENTIAL DATABASE SETUP FOR FIT4DUTY APP
-- =====================================================================
-- Run this script in your Supabase SQL Editor to create the necessary tables
-- for authentication and basic app functionality.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CORE TABLES
-- =====================================================================

-- Profiles table (extends auth.users) - ESSENTIAL FOR AUTHENTICATION
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
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
  has_completed_personalized_prep_plan BOOLEAN NOT NULL DEFAULT false,
  personalized_prep_plan_completed_at TIMESTAMPTZ,
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

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Application progress policies
ALTER TABLE public.application_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application progress" ON public.application_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own application progress" ON public.application_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application progress" ON public.application_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- FUNCTIONS
-- =====================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, role, is_admin, admin_permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'ih.gaming009@gmail.com' THEN 'super_admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email = 'ih.gaming009@gmail.com' THEN true
      ELSE false
    END,
    CASE 
      WHEN NEW.email = 'ih.gaming009@gmail.com' THEN ARRAY['manage_users', 'manage_content', 'view_analytics', 'manage_community', 'manage_subscriptions', 'system_admin']
      ELSE ARRAY[]::text[]
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- SUCCESS MESSAGE
-- =====================================================================

-- This will show a success message when the script runs
SELECT 'Database setup completed successfully! Your app should now work properly.' as status;

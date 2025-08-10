-- IMPORTANT: Run this entire SQL script in your Supabase SQL Editor
-- Copy and paste the entire content and execute it all at once

-- Complete Supabase Setup with All User Signup Fields
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- 1. Drop existing profiles table to recreate with all fields
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create comprehensive profiles table with all signup fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    
    -- Personal Information
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    age INTEGER, -- calculated from date_of_birth or manually entered
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    location TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    
    -- Goals and Aspirations
    goal TEXT,
    target_test_date DATE,
    department_interest TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    motivation TEXT,
    has_experience BOOLEAN DEFAULT FALSE,
    previous_training TEXT,
    
    -- Fitness Profile
    current_fitness_level TEXT CHECK (current_fitness_level IN ('beginner', 'intermediate', 'advanced')),
    workout_frequency TEXT CHECK (workout_frequency IN ('1-2 times/week', '3-4 times/week', '5+ times/week')),
    available_time TEXT CHECK (available_time IN ('15-30 minutes', '30-60 minutes', '60+ minutes')),
    injuries TEXT,
    medical_conditions TEXT,
    
    -- Legacy fields for backward compatibility
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    goals JSONB, -- array of goals as strings
    
    -- Police Test Current Levels
    prep_circuit_level TEXT CHECK (prep_circuit_level IN ('never_attempted', 'below_average', 'average', 'good', 'excellent')),
    shuttle_run_level DECIMAL(3,1), -- e.g., 8.5
    push_ups_max INTEGER,
    sit_reach_distance DECIMAL(4,1), -- in inches
    mile_run_time TEXT, -- format: mm:ss
    core_endurance_time INTEGER, -- in seconds
    back_extension_time INTEGER, -- in seconds
    
    -- Admin and Role Management
    role TEXT CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    admin_permissions JSONB DEFAULT '[]'::jsonb, -- array of permission strings
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workout_type TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    calories_burned INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create fitness_tests table
CREATE TABLE IF NOT EXISTS public.fitness_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('shuttle_run', 'push_ups', 'sit_ups', 'plank', 'prep_circuit', 'pin_test', 'sit_reach', 'mile_run', 'core_endurance', 'back_extension')),
    score NUMERIC NOT NULL,
    level INTEGER, -- for shuttle run level
    time_value TEXT, -- for time-based tests like mile run
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create application_progress table
CREATE TABLE IF NOT EXISTS public.application_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    step_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, step_id)
);

-- 6. Create community_posts table for community features
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT CHECK (post_type IN ('question', 'achievement', 'tip', 'discussion')) DEFAULT 'discussion',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create community_comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create community_likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- 9. Create workout_sessions table for detailed workout tracking
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workout_id TEXT NOT NULL, -- reference to workout from constants
    session_type TEXT CHECK (session_type IN ('training', 'test', 'practice')) DEFAULT 'training',
    duration INTEGER, -- in seconds
    exercises_completed JSONB, -- array of exercise data
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- user rating of workout
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_data JSONB, -- flexible data for different achievement types
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create pin_test_results table for Ontario Police PIN Test
CREATE TABLE IF NOT EXISTS public.pin_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Individual component results
    mile_run_minutes INTEGER, -- minutes portion of 1.5 mile run time
    mile_run_seconds INTEGER, -- seconds portion of 1.5 mile run time
    pushups_count INTEGER, -- number of correct pushup reps
    core_endurance_minutes INTEGER, -- minutes portion of core endurance hold
    core_endurance_seconds INTEGER, -- seconds portion of core endurance hold
    sit_reach_distance DECIMAL(5,2), -- distance reached in centimeters
    
    -- Individual component scores (calculated from scoring tables)
    mile_run_score DECIMAL(5,2),
    pushups_score DECIMAL(5,2),
    core_endurance_score DECIMAL(5,2),
    sit_reach_score DECIMAL(5,2),
    
    -- Overall test results
    overall_score DECIMAL(5,2), -- overall test score out of 100
    pass_status BOOLEAN, -- whether the test was passed (>= 80 points)
    
    -- Metadata
    notes TEXT,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Practice Tests Tables
CREATE TABLE IF NOT EXISTS public.practice_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('PREP', 'PIN', 'Combined')),
    location VARCHAR(255) NOT NULL,
    address TEXT,
    instructor_name VARCHAR(255),
    instructor_email VARCHAR(255),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_capacity INTEGER NOT NULL DEFAULT 20,
    current_registrations INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern JSONB, -- For storing recurring event data
    requirements TEXT,
    what_to_bring TEXT,
    cancellation_policy TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.practice_test_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_test_id UUID REFERENCES public.practice_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_status VARCHAR(20) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'waitlisted', 'cancelled', 'attended', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_intent_id VARCHAR(255), -- For Stripe integration
    special_requirements TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(practice_test_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.practice_test_waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_test_id UUID REFERENCES public.practice_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(practice_test_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_test_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_test_waitlist ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DO $policy_cleanup$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $policy_cleanup$;

-- Create RLS policies for profiles table (FIXED - no circular references)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Admin policy to view all profiles (simplified to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin') OR
        (auth.jwt() ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin policy to update any profile (simplified to avoid recursion)
CREATE POLICY "Super admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'role')::text = 'super_admin'
    );

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Admin policy to delete any profile (simplified to avoid recursion)
CREATE POLICY "Super admins can delete any profile" ON public.profiles
    FOR DELETE USING (
        (auth.jwt() ->> 'role')::text = 'super_admin'
    );

-- Create RLS policies for workouts table
CREATE POLICY "Users can view own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fitness_tests table
CREATE POLICY "Users can view own fitness tests" ON public.fitness_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness tests" ON public.fitness_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fitness tests" ON public.fitness_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fitness tests" ON public.fitness_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for application_progress table
CREATE POLICY "Users can view own application progress" ON public.application_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application progress" ON public.application_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own application progress" ON public.application_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own application progress" ON public.application_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_posts table
CREATE POLICY "Users can view all community posts" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own community posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own community posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own community posts" ON public.community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_comments table
CREATE POLICY "Users can view all community comments" ON public.community_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own community comments" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own community comments" ON public.community_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own community comments" ON public.community_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_likes table
CREATE POLICY "Users can view all community likes" ON public.community_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own community likes" ON public.community_likes
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for workout_sessions table
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements table
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pin_test_results table
CREATE POLICY "Users can view own PIN test results" ON public.pin_test_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PIN test results" ON public.pin_test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PIN test results" ON public.pin_test_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PIN test results" ON public.pin_test_results
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for practice_tests table
CREATE POLICY "Anyone can view active practice tests" ON public.practice_tests
    FOR SELECT USING (is_active = true);

-- Create RLS policies for practice_test_registrations table
CREATE POLICY "Users can view their own registrations" ON public.practice_test_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for tests" ON public.practice_test_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.practice_test_registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for practice_test_waitlist table
CREATE POLICY "Users can view their own waitlist entries" ON public.practice_test_waitlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlists" ON public.practice_test_waitlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist entries" ON public.practice_test_waitlist
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_completed_at_idx ON public.workouts(completed_at);
CREATE INDEX IF NOT EXISTS fitness_tests_user_id_idx ON public.fitness_tests(user_id);
CREATE INDEX IF NOT EXISTS fitness_tests_test_type_idx ON public.fitness_tests(test_type);
CREATE INDEX IF NOT EXISTS fitness_tests_completed_at_idx ON public.fitness_tests(completed_at);
CREATE INDEX IF NOT EXISTS application_progress_user_id_idx ON public.application_progress(user_id);
CREATE INDEX IF NOT EXISTS application_progress_step_id_idx ON public.application_progress(step_id);
CREATE INDEX IF NOT EXISTS community_posts_user_id_idx ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON public.community_posts(created_at);
CREATE INDEX IF NOT EXISTS community_comments_post_id_idx ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS community_comments_user_id_idx ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS community_likes_user_id_idx ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS community_likes_post_id_idx ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS workout_sessions_user_id_idx ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS workout_sessions_completed_at_idx ON public.workout_sessions(completed_at);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS pin_test_results_user_id_idx ON public.pin_test_results(user_id);
CREATE INDEX IF NOT EXISTS pin_test_results_test_date_idx ON public.pin_test_results(test_date);
CREATE INDEX IF NOT EXISTS practice_tests_start_time_idx ON public.practice_tests(start_time);
CREATE INDEX IF NOT EXISTS practice_tests_test_type_idx ON public.practice_tests(test_type);
CREATE INDEX IF NOT EXISTS practice_tests_location_idx ON public.practice_tests(location);
CREATE INDEX IF NOT EXISTS practice_test_registrations_user_id_idx ON public.practice_test_registrations(user_id);
CREATE INDEX IF NOT EXISTS practice_test_registrations_test_id_idx ON public.practice_test_registrations(practice_test_id);
CREATE INDEX IF NOT EXISTS practice_test_waitlist_user_id_idx ON public.practice_test_waitlist(user_id);
CREATE INDEX IF NOT EXISTS practice_test_waitlist_test_id_idx ON public.practice_test_waitlist(practice_test_id);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create enhanced function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log the trigger execution
    RAISE LOG 'Creating profile for new user: %', NEW.id;
    
    -- Create profile with better error handling
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name, 
            created_at, 
            updated_at
        )
        VALUES (
            NEW.id, 
            NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
            
        RAISE LOG 'Profile created successfully for user: %', NEW.id;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- Log the error but don't fail the user creation
            RAISE WARNING 'Failed to create profile for user %: % (SQLSTATE: %)', 
                NEW.id, SQLERRM, SQLSTATE;
    END;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_application_progress ON public.application_progress;
CREATE TRIGGER handle_updated_at_application_progress
    BEFORE UPDATE ON public.application_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_community_posts ON public.community_posts;
CREATE TRIGGER handle_updated_at_community_posts
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_community_comments ON public.community_comments;
CREATE TRIGGER handle_updated_at_community_comments
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update post/comment counts
CREATE OR REPLACE FUNCTION public.update_community_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'community_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.community_posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.community_posts 
            SET comments_count = comments_count - 1 
            WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'community_likes' THEN
        IF TG_OP = 'INSERT' THEN
            IF NEW.post_id IS NOT NULL THEN
                UPDATE public.community_posts 
                SET likes_count = likes_count + 1 
                WHERE id = NEW.post_id;
            ELSIF NEW.comment_id IS NOT NULL THEN
                UPDATE public.community_comments 
                SET likes_count = likes_count + 1 
                WHERE id = NEW.comment_id;
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF OLD.post_id IS NOT NULL THEN
                UPDATE public.community_posts 
                SET likes_count = likes_count - 1 
                WHERE id = OLD.post_id;
            ELSIF OLD.comment_id IS NOT NULL THEN
                UPDATE public.community_comments 
                SET likes_count = likes_count - 1 
                WHERE id = OLD.comment_id;
            END IF;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for community counts
DROP TRIGGER IF EXISTS update_comment_counts ON public.community_comments;
CREATE TRIGGER update_comment_counts
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_community_counts();

DROP TRIGGER IF EXISTS update_like_counts ON public.community_likes;
CREATE TRIGGER update_like_counts
    AFTER INSERT OR DELETE ON public.community_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_community_counts();

-- Create function to handle application progress updates with proper conflict resolution
CREATE OR REPLACE FUNCTION public.upsert_application_progress(
    p_user_id UUID,
    p_step_id TEXT,
    p_status TEXT,
    p_notes TEXT DEFAULT NULL,
    p_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    step_id TEXT,
    status TEXT,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the operation
    RAISE LOG 'Upserting application progress: user_id=%, step_id=%, status=%', p_user_id, p_step_id, p_status;
    
    -- Perform the upsert operation
    RETURN QUERY
    INSERT INTO public.application_progress (
        user_id,
        step_id,
        status,
        notes,
        completed_at,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_step_id,
        p_status,
        p_notes,
        p_completed_at,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, step_id)
    DO UPDATE SET
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
    RETURNING 
        public.application_progress.id,
        public.application_progress.user_id,
        public.application_progress.step_id,
        public.application_progress.status,
        public.application_progress.notes,
        public.application_progress.completed_at,
        public.application_progress.created_at,
        public.application_progress.updated_at;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.workouts TO anon, authenticated;
GRANT ALL ON public.fitness_tests TO anon, authenticated;
GRANT ALL ON public.application_progress TO anon, authenticated;
GRANT ALL ON public.community_posts TO anon, authenticated;
GRANT ALL ON public.community_comments TO anon, authenticated;
GRANT ALL ON public.community_likes TO anon, authenticated;
GRANT ALL ON public.workout_sessions TO anon, authenticated;
GRANT ALL ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.pin_test_results TO anon, authenticated;
GRANT ALL ON public.practice_tests TO anon, authenticated;
GRANT ALL ON public.practice_test_registrations TO anon, authenticated;
GRANT ALL ON public.practice_test_waitlist TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_application_progress TO authenticated;

-- Create trigger for pin_test_results updated_at
DROP TRIGGER IF EXISTS handle_updated_at_pin_test_results ON public.pin_test_results;
CREATE TRIGGER handle_updated_at_pin_test_results
    BEFORE UPDATE ON public.pin_test_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create triggers for practice tests updated_at
DROP TRIGGER IF EXISTS handle_updated_at_practice_tests ON public.practice_tests;
CREATE TRIGGER handle_updated_at_practice_tests
    BEFORE UPDATE ON public.practice_tests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_practice_test_registrations ON public.practice_test_registrations;
CREATE TRIGGER handle_updated_at_practice_test_registrations
    BEFORE UPDATE ON public.practice_test_registrations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update practice test registration count
CREATE OR REPLACE FUNCTION public.update_practice_test_registrations_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase count for new registration
        UPDATE public.practice_tests 
        SET current_registrations = current_registrations + 1
        WHERE id = NEW.practice_test_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease count for cancelled registration
        UPDATE public.practice_tests 
        SET current_registrations = current_registrations - 1
        WHERE id = OLD.practice_test_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.registration_status != 'cancelled' AND NEW.registration_status = 'cancelled' THEN
            UPDATE public.practice_tests 
            SET current_registrations = current_registrations - 1
            WHERE id = NEW.practice_test_id;
        ELSIF OLD.registration_status = 'cancelled' AND NEW.registration_status != 'cancelled' THEN
            UPDATE public.practice_tests 
            SET current_registrations = current_registrations + 1
            WHERE id = NEW.practice_test_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply registration count triggers
DROP TRIGGER IF EXISTS update_registrations_count_insert ON public.practice_test_registrations;
CREATE TRIGGER update_registrations_count_insert 
    AFTER INSERT ON public.practice_test_registrations 
    FOR EACH ROW EXECUTE FUNCTION public.update_practice_test_registrations_count();

DROP TRIGGER IF EXISTS update_registrations_count_update ON public.practice_test_registrations;
CREATE TRIGGER update_registrations_count_update 
    AFTER UPDATE ON public.practice_test_registrations 
    FOR EACH ROW EXECUTE FUNCTION public.update_practice_test_registrations_count();

DROP TRIGGER IF EXISTS update_registrations_count_delete ON public.practice_test_registrations;
CREATE TRIGGER update_registrations_count_delete 
    AFTER DELETE ON public.practice_test_registrations 
    FOR EACH ROW EXECUTE FUNCTION public.update_practice_test_registrations_count();

-- Setup completed successfully!
-- Tables created: profiles, workouts, fitness_tests, application_progress, 
-- community_posts, community_comments, community_likes, workout_sessions, user_achievements, pin_test_results,
-- practice_tests, practice_test_registrations, practice_test_waitlist
-- All RLS policies and triggers are in place.
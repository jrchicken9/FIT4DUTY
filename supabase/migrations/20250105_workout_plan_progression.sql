-- Migration: Fix workout_plans table schema for workout plan progression tracking
-- This migration adds the missing user_id column to the existing workout_plans table
-- It handles the case where the table exists but is missing required columns

-- First, let's check if the workout_plans table exists and what columns it has
DO $$
DECLARE
    col_record RECORD;
    existing_columns TEXT[] := '{}';
    has_duration_weeks BOOLEAN := FALSE;
    has_user_id BOOLEAN := FALSE;
BEGIN
    -- Check if workout_plans table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workout_plans') THEN
        
        -- Get all existing columns
        FOR col_record IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'workout_plans'
        LOOP
            existing_columns := array_append(existing_columns, col_record.column_name);
            IF col_record.column_name = 'duration_weeks' THEN
                has_duration_weeks := TRUE;
            END IF;
            IF col_record.column_name = 'user_id' THEN
                has_user_id := TRUE;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Existing columns in workout_plans: %', array_to_string(existing_columns, ', ');
        
        -- Check if user_id column exists
        IF NOT has_user_id THEN
            -- Add the missing user_id column (initially nullable)
            ALTER TABLE workout_plans ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            
            -- Handle existing rows that might have NULL user_id
            -- Option 1: Delete existing rows without user_id (recommended for workout plans)
            DELETE FROM workout_plans WHERE user_id IS NULL;
            
            -- Now make it NOT NULL
            ALTER TABLE workout_plans ALTER COLUMN user_id SET NOT NULL;
            
            RAISE NOTICE 'Added user_id column to existing workout_plans table and cleaned up orphaned data';
        ELSE
            RAISE NOTICE 'user_id column already exists in workout_plans table';
        END IF;
        
        -- Handle the duration_weeks column if it exists and has NULL values
        IF has_duration_weeks THEN
            -- Update NULL duration_weeks values to a default
            UPDATE workout_plans SET duration_weeks = 4 WHERE duration_weeks IS NULL;
            RAISE NOTICE 'Updated NULL duration_weeks values to default 4';
        END IF;
        
        -- Check if other required columns exist and add them if missing
        -- Only add columns that don't exist to avoid conflicts
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'current_week') THEN
            ALTER TABLE workout_plans ADD COLUMN current_week INTEGER DEFAULT 1;
            RAISE NOTICE 'Added current_week column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'total_weeks') THEN
            ALTER TABLE workout_plans ADD COLUMN total_weeks INTEGER DEFAULT 4;
            RAISE NOTICE 'Added total_weeks column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'progress') THEN
            ALTER TABLE workout_plans ADD COLUMN progress INTEGER DEFAULT 0;
            RAISE NOTICE 'Added progress column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'focus_areas') THEN
            ALTER TABLE workout_plans ADD COLUMN focus_areas TEXT[] DEFAULT '{}';
            RAISE NOTICE 'Added focus_areas column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'next_workout_title') THEN
            ALTER TABLE workout_plans ADD COLUMN next_workout_title TEXT;
            RAISE NOTICE 'Added next_workout_title column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'next_workout_day') THEN
            ALTER TABLE workout_plans ADD COLUMN next_workout_day TEXT;
            RAISE NOTICE 'Added next_workout_day column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'next_workout_week') THEN
            ALTER TABLE workout_plans ADD COLUMN next_workout_week TEXT;
            RAISE NOTICE 'Added next_workout_week column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'next_workout_type') THEN
            ALTER TABLE workout_plans ADD COLUMN next_workout_type TEXT;
            RAISE NOTICE 'Added next_workout_type column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'status') THEN
            ALTER TABLE workout_plans ADD COLUMN status TEXT DEFAULT 'active';
            RAISE NOTICE 'Added status column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'created_at') THEN
            ALTER TABLE workout_plans ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to workout_plans table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_plans' AND column_name = 'updated_at') THEN
            ALTER TABLE workout_plans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to workout_plans table';
        END IF;
        
        RAISE NOTICE 'Migration completed successfully. Sample data will be inserted by the application when needed.';
        
    ELSE
        -- Create the workout_plans table if it doesn't exist
        CREATE TABLE workout_plans (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            current_week INTEGER DEFAULT 1,
            total_weeks INTEGER NOT NULL,
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            focus_areas TEXT[] DEFAULT '{}',
            next_workout_title TEXT,
            next_workout_day TEXT,
            next_workout_week TEXT,
            next_workout_type TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new workout_plans table';
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_status ON workout_plans(status);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_status ON workout_plans(user_id, status);

-- Create RLS (Row Level Security) policies
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workout plans
DROP POLICY IF EXISTS "Users can view own workout plans" ON workout_plans;
CREATE POLICY "Users can view own workout plans" ON workout_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own workout plans
DROP POLICY IF EXISTS "Users can insert own workout plans" ON workout_plans;
CREATE POLICY "Users can insert own workout plans" ON workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own workout plans
DROP POLICY IF EXISTS "Users can update own workout plans" ON workout_plans;
CREATE POLICY "Users can update own workout plans" ON workout_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own workout plans
DROP POLICY IF EXISTS "Users can delete own workout plans" ON workout_plans;
CREATE POLICY "Users can delete own workout plans" ON workout_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_workout_plans_updated_at ON workout_plans;
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON workout_plans TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

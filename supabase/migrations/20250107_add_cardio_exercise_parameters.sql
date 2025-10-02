-- Add cardio-specific parameters to exercises table
-- This migration adds fields to support comprehensive cardio exercise configuration

-- Add cardio-specific fields to exercises table
DO $$
BEGIN
    -- Add is_cardio field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'is_cardio'
    ) THEN
        ALTER TABLE exercises ADD COLUMN is_cardio BOOLEAN DEFAULT false;
    END IF;

    -- Add cardio_type field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'cardio_type'
    ) THEN
        ALTER TABLE exercises ADD COLUMN cardio_type TEXT CHECK (
            cardio_type IN (
                'easy_run', 'tempo_run', 'long_run', 'threshold_run', 
                'progressive_run', 'recovery_run', 'sprint_intervals', 
                'hill_runs', 'fartlek', 'ladder_intervals', 'pyramid_intervals', 
                'time_trial', 'endurance', 'intervals', 'circuit'
            )
        );
    END IF;

    -- Add duration_unit field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'duration_unit'
    ) THEN
        ALTER TABLE exercises ADD COLUMN duration_unit TEXT CHECK (
            duration_unit IN ('seconds', 'minutes', 'hours')
        ) DEFAULT 'minutes';
    END IF;

    -- Add intensity_level field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'intensity_level'
    ) THEN
        ALTER TABLE exercises ADD COLUMN intensity_level TEXT CHECK (
            intensity_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')
        );
    END IF;

    -- Add default sets field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'default_sets'
    ) THEN
        ALTER TABLE exercises ADD COLUMN default_sets INTEGER DEFAULT 3;
    END IF;

    -- Add default_reps field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'default_reps'
    ) THEN
        ALTER TABLE exercises ADD COLUMN default_reps INTEGER DEFAULT 10;
    END IF;

    -- Add default_rest_time field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'default_rest_time_seconds'
    ) THEN
        ALTER TABLE exercises ADD COLUMN default_rest_time_seconds INTEGER DEFAULT 90;
    END IF;

    -- Add default_duration_minutes field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'default_duration_minutes'
    ) THEN
        ALTER TABLE exercises ADD COLUMN default_duration_minutes INTEGER;
    END IF;

    -- Add target_heart_rate_zone field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'target_heart_rate_zone'
    ) THEN
        ALTER TABLE exercises ADD COLUMN target_heart_rate_zone TEXT CHECK (
            target_heart_rate_zone IN ('zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5')
        );
    END IF;

    -- Add target_pace_min_km field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'target_pace_min_km'
    ) THEN
        ALTER TABLE exercises ADD COLUMN target_pace_min_km NUMERIC;
    END IF;

    -- Add distance_km field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'distance_km'
    ) THEN
        ALTER TABLE exercises ADD COLUMN distance_km NUMERIC;
    END IF;

    -- Add interval_count field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'interval_count'
    ) THEN
        ALTER TABLE exercises ADD COLUMN interval_count INTEGER;
    END IF;

    -- Add interval_duration_seconds field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'interval_duration_seconds'
    ) THEN
        ALTER TABLE exercises ADD COLUMN interval_duration_seconds INTEGER;
    END IF;

    -- Add interval_rest_seconds field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'interval_rest_seconds'
    ) THEN
        ALTER TABLE exercises ADD COLUMN interval_rest_seconds INTEGER;
    END IF;

    -- Add warm_up_minutes field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'warm_up_minutes'
    ) THEN
        ALTER TABLE exercises ADD COLUMN warm_up_minutes INTEGER DEFAULT 5;
    END IF;

    -- Add cool_down_minutes field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'cool_down_minutes'
    ) THEN
        ALTER TABLE exercises ADD COLUMN cool_down_minutes INTEGER DEFAULT 5;
    END IF;

    -- Add notes field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE exercises ADD COLUMN notes TEXT;
    END IF;

    -- Add video_url field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'video_url'
    ) THEN
        ALTER TABLE exercises ADD COLUMN video_url TEXT;
    END IF;

    -- Add gif_url field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'gif_url'
    ) THEN
        ALTER TABLE exercises ADD COLUMN gif_url TEXT;
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_is_cardio ON exercises(is_cardio);
CREATE INDEX IF NOT EXISTS idx_exercises_cardio_type ON exercises(cardio_type);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty_level ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_intensity_level ON exercises(intensity_level);

-- Add comments to document the new fields
COMMENT ON COLUMN exercises.is_cardio IS 'Whether this exercise is primarily cardiovascular';
COMMENT ON COLUMN exercises.cardio_type IS 'Type of cardiovascular exercise';
COMMENT ON COLUMN exercises.duration_unit IS 'Unit for duration (seconds, minutes, hours)';
COMMENT ON COLUMN exercises.intensity_level IS 'Intensity level of the exercise';
COMMENT ON COLUMN exercises.default_sets IS 'Default number of sets for strength exercises';
COMMENT ON COLUMN exercises.default_reps IS 'Default number of reps for strength exercises';
COMMENT ON COLUMN exercises.default_rest_time_seconds IS 'Default rest time between sets';
COMMENT ON COLUMN exercises.default_duration_minutes IS 'Default duration for cardio exercises';
COMMENT ON COLUMN exercises.target_heart_rate_zone IS 'Target heart rate zone for cardio';
COMMENT ON COLUMN exercises.target_pace_min_km IS 'Target pace in minutes per kilometer';
COMMENT ON COLUMN exercises.distance_km IS 'Target distance in kilometers';
COMMENT ON COLUMN exercises.interval_count IS 'Number of intervals for interval training';
COMMENT ON COLUMN exercises.interval_duration_seconds IS 'Duration of work intervals';
COMMENT ON COLUMN exercises.interval_rest_seconds IS 'Rest time between intervals';
COMMENT ON COLUMN exercises.warm_up_minutes IS 'Recommended warm-up time';
COMMENT ON COLUMN exercises.cool_down_minutes IS 'Recommended cool-down time';

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exercises' 
AND column_name IN (
    'is_cardio', 'cardio_type', 'duration_unit', 'intensity_level',
    'default_sets', 'default_reps', 'default_rest_time_seconds',
    'default_duration_minutes', 'target_heart_rate_zone',
    'target_pace_min_km', 'distance_km', 'interval_count',
    'interval_duration_seconds', 'interval_rest_seconds',
    'warm_up_minutes', 'cool_down_minutes', 'notes', 'video_url', 'gif_url'
)
ORDER BY column_name;


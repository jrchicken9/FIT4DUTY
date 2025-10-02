-- Fix cardio exercises to have correct is_cardio flag and parameters
-- This script updates existing cardio exercises to use the new cardio parameters

-- Update cardio exercises to set is_cardio = true
UPDATE exercises 
SET is_cardio = true 
WHERE name IN (
  'Running',
  'Shuttle Run', 
  'Cycling',
  'Rowing',
  'Swimming',
  'High-Intensity Interval Training (HIIT)',
  'Stair Climbing',
  'Jump Rope',
  'Burpees',
  'Mountain Climbers',
  'High Knees',
  'Butt Kicks',
  'Jumping Jacks',
  'Sprint Intervals',
  'Tempo Run',
  'Long Distance Run',
  'Hill Runs',
  'Fartlek Training'
);

-- Set default duration for cardio exercises
UPDATE exercises 
SET default_duration_minutes = 30,
    cardio_type = 'endurance',
    duration_unit = 'minutes',
    intensity_level = 'moderate'
WHERE is_cardio = true 
AND name IN ('Running', 'Cycling', 'Swimming', 'Stair Climbing');

-- Set specific cardio types for different exercises
UPDATE exercises 
SET cardio_type = 'intervals',
    default_duration_minutes = 20,
    intensity_level = 'high'
WHERE is_cardio = true 
AND name IN ('High-Intensity Interval Training (HIIT)', 'Sprint Intervals', 'Burpees');

UPDATE exercises 
SET cardio_type = 'agility',
    default_duration_minutes = 15,
    intensity_level = 'high'
WHERE is_cardio = true 
AND name IN ('Shuttle Run', 'Jump Rope', 'High Knees', 'Butt Kicks');

-- Verify the changes
SELECT 
  name, 
  is_cardio, 
  cardio_type, 
  default_duration_minutes,
  intensity_level
FROM exercises 
WHERE is_cardio = true
ORDER BY name;

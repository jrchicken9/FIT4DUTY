-- =====================================================================
-- ADD PERSONALIZED PREP WORKOUT PLANS
-- =====================================================================

-- Insert 4-Week Crash PREP Plans (Beginner, Intermediate, Advanced)
INSERT INTO public.workout_plans (
  title,
  description,
  difficulty_level,
  duration_weeks,
  focus_areas,
  target_audience,
  is_featured,
  is_active
) VALUES 
-- 4-Week Crash Plans
(
  '4-Week Beginner PREP Crash Plan (Cardio Focus)',
  'Intensive 4-week program for beginners needing to improve cardio fitness quickly. Focuses on building shuttle run endurance and basic strength.',
  'beginner',
  4,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Beginner PREP Crash Plan (Strength Focus)',
  'Intensive 4-week program for beginners needing to build strength quickly. Focuses on push-ups, core strength, and basic fitness.',
  'beginner',
  4,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Beginner PREP Crash Plan (Agility Focus)',
  'Intensive 4-week program for beginners needing to improve agility and coordination. Focuses on movement patterns and balance.',
  'beginner',
  4,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Intermediate PREP Crash Plan (Cardio Focus)',
  'Intensive 4-week program for intermediate athletes focusing on cardio improvement. Advanced shuttle run training and endurance building.',
  'intermediate',
  4,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Intermediate PREP Crash Plan (Strength Focus)',
  'Intensive 4-week program for intermediate athletes focusing on strength development. Advanced push-ups, pull-ups, and power training.',
  'intermediate',
  4,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Intermediate PREP Crash Plan (Agility Focus)',
  'Intensive 4-week program for intermediate athletes focusing on agility enhancement. Advanced movement drills and coordination training.',
  'intermediate',
  4,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Advanced PREP Crash Plan (Cardio Focus)',
  'Intensive 4-week program for advanced athletes focusing on elite cardio performance. High-intensity interval training and speed work.',
  'advanced',
  4,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Advanced PREP Crash Plan (Strength Focus)',
  'Intensive 4-week program for advanced athletes focusing on maximum strength gains. Advanced strength training and power development.',
  'advanced',
  4,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '4-Week Advanced PREP Crash Plan (Agility Focus)',
  'Intensive 4-week program for advanced athletes focusing on elite agility. Advanced plyometrics and movement mastery.',
  'advanced',
  4,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),

-- 8-Week Standard Plans
(
  '8-Week Beginner PREP Plan (Cardio Focus)',
  'Balanced 8-week program for beginners with cardio focus. Progressive training to build shuttle run endurance and overall fitness.',
  'beginner',
  8,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Beginner PREP Plan (Strength Focus)',
  'Balanced 8-week program for beginners with strength focus. Progressive training to build push-up capacity and core strength.',
  'beginner',
  8,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Beginner PREP Plan (Agility Focus)',
  'Balanced 8-week program for beginners with agility focus. Progressive training to improve movement patterns and coordination.',
  'beginner',
  8,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Cardio Focus)',
  'Balanced 8-week program for intermediate athletes with cardio focus. Advanced endurance training and speed development.',
  'intermediate',
  8,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Strength Focus)',
  'Balanced 8-week program for intermediate athletes with strength focus. Advanced strength training and power development.',
  'intermediate',
  8,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Agility Focus)',
  'Balanced 8-week program for intermediate athletes with agility focus. Advanced movement training and coordination enhancement.',
  'intermediate',
  8,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Cardio Focus)',
  'Balanced 8-week program for advanced athletes with cardio focus. Elite endurance training and performance optimization.',
  'advanced',
  8,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Strength Focus)',
  'Balanced 8-week program for advanced athletes with strength focus. Elite strength training and maximum power development.',
  'advanced',
  8,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Agility Focus)',
  'Balanced 8-week program for advanced athletes with agility focus. Elite movement training and coordination mastery.',
  'advanced',
  8,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),

-- 12+ Week Gradual Plans
(
  '12-Week Beginner PREP Plan (Cardio Focus)',
  'Comprehensive 12-week program for beginners with cardio focus. Gradual progression to build sustainable fitness and endurance.',
  'beginner',
  12,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Beginner PREP Plan (Strength Focus)',
  'Comprehensive 12-week program for beginners with strength focus. Gradual progression to build sustainable strength and power.',
  'beginner',
  12,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Beginner PREP Plan (Agility Focus)',
  'Comprehensive 12-week program for beginners with agility focus. Gradual progression to build sustainable movement patterns.',
  'beginner',
  12,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Intermediate PREP Plan (Cardio Focus)',
  'Comprehensive 12-week program for intermediate athletes with cardio focus. Gradual progression to elite endurance levels.',
  'intermediate',
  12,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Intermediate PREP Plan (Strength Focus)',
  'Comprehensive 12-week program for intermediate athletes with strength focus. Gradual progression to elite strength levels.',
  'intermediate',
  12,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Intermediate PREP Plan (Agility Focus)',
  'Comprehensive 12-week program for intermediate athletes with agility focus. Gradual progression to elite movement mastery.',
  'intermediate',
  12,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Advanced PREP Plan (Cardio Focus)',
  'Comprehensive 12-week program for advanced athletes with cardio focus. Gradual progression to peak performance levels.',
  'advanced',
  12,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Advanced PREP Plan (Strength Focus)',
  'Comprehensive 12-week program for advanced athletes with strength focus. Gradual progression to peak strength levels.',
  'advanced',
  12,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  '12-Week Advanced PREP Plan (Agility Focus)',
  'Comprehensive 12-week program for advanced athletes with agility focus. Gradual progression to peak movement mastery.',
  'advanced',
  12,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),

-- Dual Focus Plans (for users who select two focus areas)
(
  '8-Week Beginner PREP Plan (Cardio & Strength)',
  'Balanced 8-week program for beginners focusing on both cardio and strength. Comprehensive training for overall PREP test readiness.',
  'beginner',
  8,
  ARRAY['cardio', 'strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Beginner PREP Plan (Cardio & Agility)',
  'Balanced 8-week program for beginners focusing on both cardio and agility. Comprehensive training for movement and endurance.',
  'beginner',
  8,
  ARRAY['cardio', 'agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Beginner PREP Plan (Strength & Agility)',
  'Balanced 8-week program for beginners focusing on both strength and agility. Comprehensive training for power and movement.',
  'beginner',
  8,
  ARRAY['strength', 'agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Cardio & Strength)',
  'Balanced 8-week program for intermediate athletes focusing on both cardio and strength. Advanced training for overall performance.',
  'intermediate',
  8,
  ARRAY['cardio', 'strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Cardio & Agility)',
  'Balanced 8-week program for intermediate athletes focusing on both cardio and agility. Advanced training for endurance and movement.',
  'intermediate',
  8,
  ARRAY['cardio', 'agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Intermediate PREP Plan (Strength & Agility)',
  'Balanced 8-week program for intermediate athletes focusing on both strength and agility. Advanced training for power and coordination.',
  'intermediate',
  8,
  ARRAY['strength', 'agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Cardio & Strength)',
  'Balanced 8-week program for advanced athletes focusing on both cardio and strength. Elite training for peak performance.',
  'advanced',
  8,
  ARRAY['cardio', 'strength'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Cardio & Agility)',
  'Balanced 8-week program for advanced athletes focusing on both cardio and agility. Elite training for endurance and movement mastery.',
  'advanced',
  8,
  ARRAY['cardio', 'agility'],
  'police_candidates',
  true,
  true
),
(
  '8-Week Advanced PREP Plan (Strength & Agility)',
  'Balanced 8-week program for advanced athletes focusing on both strength and agility. Elite training for power and coordination mastery.',
  'advanced',
  8,
  ARRAY['strength', 'agility'],
  'police_candidates',
  true,
  true
);

-- Create index for efficient plan matching
CREATE INDEX IF NOT EXISTS idx_workout_plans_prep_matching 
ON public.workout_plans (target_audience, difficulty_level, duration_weeks, focus_areas) 
WHERE target_audience = 'police_candidates';

-- =====================================================================
-- ADD PLACEHOLDER PREP WORKOUT PLANS FOR DEVELOPMENT
-- =====================================================================

-- Insert placeholder plans for development and testing
INSERT INTO public.workout_plans (
  title,
  description,
  difficulty_level,
  duration_weeks,
  focus_areas,
  target_audience,
  is_featured,
  is_active
) VALUES 
-- 4-Week Placeholder Plans
(
  'Beginner 4-Week PREP Plan - Placeholder',
  'This is a placeholder plan for beginners needing a 4-week crash course. Real content coming soon.',
  'beginner',
  4,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  'Intermediate 4-Week PREP Plan - Placeholder',
  'This is a placeholder plan for intermediate athletes needing a 4-week crash course. Real content coming soon.',
  'intermediate',
  4,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  'Advanced 4-Week PREP Plan - Placeholder',
  'This is a placeholder plan for advanced athletes needing a 4-week crash course. Real content coming soon.',
  'advanced',
  4,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
),

-- 8-Week Placeholder Plans
(
  'Beginner 8-Week PREP Plan - Placeholder',
  'This is a placeholder plan for beginners needing an 8-week standard program. Real content coming soon.',
  'beginner',
  8,
  ARRAY['cardio', 'strength'],
  'police_candidates',
  true,
  true
),
(
  'Intermediate 8-Week PREP Plan - Placeholder',
  'This is a placeholder plan for intermediate athletes needing an 8-week standard program. Real content coming soon.',
  'intermediate',
  8,
  ARRAY['cardio', 'agility'],
  'police_candidates',
  true,
  true
),
(
  'Advanced 8-Week PREP Plan - Placeholder',
  'This is a placeholder plan for advanced athletes needing an 8-week standard program. Real content coming soon.',
  'advanced',
  8,
  ARRAY['strength', 'agility'],
  'police_candidates',
  true,
  true
),

-- 12-Week Placeholder Plans
(
  'Beginner 12-Week PREP Plan - Placeholder',
  'This is a placeholder plan for beginners needing a 12-week gradual program. Real content coming soon.',
  'beginner',
  12,
  ARRAY['cardio'],
  'police_candidates',
  true,
  true
),
(
  'Intermediate 12-Week PREP Plan - Placeholder',
  'This is a placeholder plan for intermediate athletes needing a 12-week gradual program. Real content coming soon.',
  'intermediate',
  12,
  ARRAY['strength'],
  'police_candidates',
  true,
  true
),
(
  'Advanced 12-Week PREP Plan - Placeholder',
  'This is a placeholder plan for advanced athletes needing a 12-week gradual program. Real content coming soon.',
  'advanced',
  12,
  ARRAY['agility'],
  'police_candidates',
  true,
  true
);

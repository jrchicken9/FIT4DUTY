-- =====================================================================
-- COMPREHENSIVE EXERCISE LIBRARY FOR POLICE FITNESS TRAINING
-- This script can be run directly in the Supabase SQL Editor
-- =====================================================================

-- First, let's add more exercise categories
INSERT INTO public.exercise_categories (name, description, icon, color) VALUES
('Upper Body', 'Chest, back, shoulders, and arms', 'dumbbell', '#3B82F6'),
('Lower Body', 'Legs, glutes, and calves', 'zap', '#10B981'),
('Agility', 'Speed, coordination, and quick movements', 'zap', '#F59E0B'),
('Endurance', 'Long-duration cardiovascular training', 'heart', '#EF4444'),
('Power', 'Explosive movements and plyometrics', 'zap', '#8B5CF6'),
('Recovery', 'Low-intensity recovery exercises', 'refresh', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- UPPER BODY EXERCISES
-- =====================================================================

-- Push-up variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Wide Push-ups',
  'Push-ups with hands positioned wider than shoulders to target chest more',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight'],
  'intermediate',
  'Position hands wider than shoulder-width, maintain straight body line, lower chest to ground'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Diamond Push-ups',
  'Push-ups with hands forming a diamond shape to target triceps',
  ec.id,
  ARRAY['triceps', 'chest', 'shoulders'],
  ARRAY['bodyweight'],
  'advanced',
  'Form diamond shape with hands under chest, keep elbows close to body, lower to diamond'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Decline Push-ups',
  'Push-ups with feet elevated to increase difficulty',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight', 'bench'],
  'advanced',
  'Place feet on elevated surface, hands on ground, maintain straight body line'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Incline Push-ups',
  'Push-ups with hands elevated to reduce difficulty',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight', 'bench'],
  'beginner',
  'Place hands on elevated surface, feet on ground, maintain straight body line'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

-- Pull-up variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Pull-ups',
  'Upper body pulling exercise using body weight',
  ec.id,
  ARRAY['back', 'biceps', 'shoulders'],
  ARRAY['pull_up_bar'],
  'intermediate',
  'Hang from bar with palms facing away, pull body up until chin over bar, lower with control'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Chin-ups',
  'Pull-ups with palms facing toward you',
  ec.id,
  ARRAY['back', 'biceps', 'shoulders'],
  ARRAY['pull_up_bar'],
  'intermediate',
  'Hang from bar with palms facing you, pull body up until chin over bar, lower with control'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Assisted Pull-ups',
  'Pull-ups with assistance to build strength',
  ec.id,
  ARRAY['back', 'biceps', 'shoulders'],
  ARRAY['pull_up_bar', 'resistance_band'],
  'beginner',
  'Use resistance band for assistance, focus on proper form and controlled movement'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

-- Dips
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Dips',
  'Tricep and chest exercise using parallel bars',
  ec.id,
  ARRAY['triceps', 'chest', 'shoulders'],
  ARRAY['dip_bars'],
  'intermediate',
  'Support body on parallel bars, lower body by bending elbows, push back up'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Bench Dips',
  'Dips using a bench or chair for support',
  ec.id,
  ARRAY['triceps', 'chest', 'shoulders'],
  ARRAY['bench'],
  'beginner',
  'Sit on edge of bench, place hands beside hips, lower body off bench, push back up'
FROM public.exercise_categories ec WHERE ec.name = 'Upper Body'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- LOWER BODY EXERCISES
-- =====================================================================

-- Squat variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Bodyweight Squats',
  'Basic squat exercise using body weight',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight'],
  'beginner',
  'Stand with feet shoulder-width apart, lower body as if sitting back, keep chest up'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Jump Squats',
  'Explosive squat with jump at the top',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight'],
  'intermediate',
  'Perform squat, then explosively jump up, land softly and repeat'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Pistol Squats',
  'Single-leg squat requiring balance and strength',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight'],
  'advanced',
  'Stand on one leg, extend other leg forward, squat down on standing leg'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Wall Squats',
  'Squat held against a wall for endurance',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight', 'wall'],
  'beginner',
  'Lean back against wall, slide down to squat position, hold for time'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

-- Lunge variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Walking Lunges',
  'Forward lunges while walking',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight'],
  'intermediate',
  'Step forward into lunge position, alternate legs while walking forward'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Jumping Lunges',
  'Explosive lunges with jump switch',
  ec.id,
  ARRAY['quads', 'glutes', 'hamstrings'],
  ARRAY['bodyweight'],
  'advanced',
  'Start in lunge position, jump and switch legs mid-air, land in opposite lunge'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Side Lunges',
  'Lateral lunges to target inner and outer thighs',
  ec.id,
  ARRAY['quads', 'glutes', 'adductors'],
  ARRAY['bodyweight'],
  'intermediate',
  'Step to the side, lower into lunge, keep other leg straight, return to center'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

-- Calf exercises
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Calf Raises',
  'Standing calf raises for lower leg strength',
  ec.id,
  ARRAY['calves'],
  ARRAY['bodyweight'],
  'beginner',
  'Stand on edge of step, raise heels up, lower down below step level'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Single Leg Calf Raises',
  'Calf raises performed on one leg at a time',
  ec.id,
  ARRAY['calves'],
  ARRAY['bodyweight'],
  'intermediate',
  'Stand on one leg on edge of step, raise heel up, lower down below step level'
FROM public.exercise_categories ec WHERE ec.name = 'Lower Body'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- CORE EXERCISES
-- =====================================================================

-- Plank variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Forearm Plank',
  'Static plank hold on forearms',
  ec.id,
  ARRAY['core', 'shoulders', 'back'],
  ARRAY['bodyweight'],
  'beginner',
  'Hold body in straight line from head to heels, support on forearms'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'High Plank',
  'Plank hold in push-up position',
  ec.id,
  ARRAY['core', 'shoulders', 'back'],
  ARRAY['bodyweight'],
  'intermediate',
  'Hold body in straight line from head to heels, support on hands'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Side Plank',
  'Plank hold on one side',
  ec.id,
  ARRAY['core', 'obliques', 'shoulders'],
  ARRAY['bodyweight'],
  'intermediate',
  'Hold body in straight line on one side, support on one forearm'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Plank with Leg Lift',
  'Plank with alternating leg raises',
  ec.id,
  ARRAY['core', 'glutes', 'shoulders'],
  ARRAY['bodyweight'],
  'intermediate',
  'Hold plank position, lift one leg straight back, alternate legs'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

-- Crunch variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Bicycle Crunches',
  'Alternating elbow-to-knee crunches',
  ec.id,
  ARRAY['abs', 'obliques'],
  ARRAY['bodyweight'],
  'intermediate',
  'Lie on back, bring opposite elbow to opposite knee in cycling motion'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Russian Twists',
  'Seated twisting exercise for obliques',
  ec.id,
  ARRAY['abs', 'obliques'],
  ARRAY['bodyweight'],
  'intermediate',
  'Sit with knees bent, lean back slightly, twist torso side to side'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Mountain Climbers',
  'Dynamic core exercise with running motion',
  ec.id,
  ARRAY['core', 'shoulders', 'cardio'],
  ARRAY['bodyweight'],
  'intermediate',
  'Start in plank position, alternate bringing knees to chest rapidly'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Dead Bug',
  'Core stability exercise lying on back',
  ec.id,
  ARRAY['core', 'stability'],
  ARRAY['bodyweight'],
  'beginner',
  'Lie on back, extend opposite arm and leg, maintain core tension'
FROM public.exercise_categories ec WHERE ec.name = 'Core'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- CARDIOVASCULAR EXERCISES
-- =====================================================================

-- Running variations
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Sprint Intervals',
  'High-intensity sprint intervals',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['running_shoes'],
  'advanced',
  'Alternate between maximum effort sprints and recovery periods'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Hill Running',
  'Running uphill for strength and endurance',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['running_shoes'],
  'intermediate',
  'Find a hill, run up at moderate pace, walk or jog down for recovery'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Fartlek Training',
  'Speed play with varying intensities',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['running_shoes'],
  'intermediate',
  'Mix different speeds and intensities throughout your run'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Tempo Run',
  'Sustained effort at lactate threshold',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['running_shoes'],
  'advanced',
  'Run at a pace you can maintain for 20-40 minutes, challenging but sustainable'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

-- Jump rope
INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Jump Rope',
  'Cardiovascular exercise with rope jumping',
  ec.id,
  ARRAY['legs', 'cardio', 'coordination'],
  ARRAY['jump_rope'],
  'intermediate',
  'Jump rope continuously, maintain rhythm and proper form'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'High Knees',
  'Running in place with high knee lifts',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['bodyweight'],
  'beginner',
  'Run in place, lift knees to waist level, maintain good posture'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Burpees',
  'Full body exercise combining squat, push-up, and jump',
  ec.id,
  ARRAY['full_body', 'cardio'],
  ARRAY['bodyweight'],
  'intermediate',
  'Squat down, place hands on ground, jump feet back to plank, do push-up, jump feet forward, jump up'
FROM public.exercise_categories ec WHERE ec.name = 'Endurance'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- AGILITY EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Lateral Shuffles',
  'Side-to-side movement for agility',
  ec.id,
  ARRAY['legs', 'agility'],
  ARRAY['bodyweight'],
  'beginner',
  'Shuffle side to side, stay low, maintain athletic stance'
FROM public.exercise_categories ec WHERE ec.name = 'Agility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Carioca',
  'Cross-step running for hip mobility and coordination',
  ec.id,
  ARRAY['legs', 'agility', 'coordination'],
  ARRAY['bodyweight'],
  'intermediate',
  'Run sideways with crossing steps, alternate front and back cross'
FROM public.exercise_categories ec WHERE ec.name = 'Agility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Box Jumps',
  'Explosive jumping onto elevated surface',
  ec.id,
  ARRAY['legs', 'power'],
  ARRAY['plyo_box'],
  'intermediate',
  'Stand in front of box, jump up and land softly on top, step down'
FROM public.exercise_categories ec WHERE ec.name = 'Agility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Tuck Jumps',
  'Jumping with knees brought to chest',
  ec.id,
  ARRAY['legs', 'power'],
  ARRAY['bodyweight'],
  'intermediate',
  'Jump straight up, bring knees to chest, land softly and repeat'
FROM public.exercise_categories ec WHERE ec.name = 'Agility'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- POLICE-SPECIFIC EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Obstacle Course Run',
  'Running through various obstacles simulating police scenarios',
  ec.id,
  ARRAY['full_body', 'agility', 'cardio'],
  ARRAY['obstacles', 'running_shoes'],
  'advanced',
  'Navigate through obstacles, maintain speed and control throughout course'
FROM public.exercise_categories ec WHERE ec.name = 'Police Specific'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Shuttle Run',
  'Back and forth running between two points',
  ec.id,
  ARRAY['legs', 'agility', 'cardio'],
  ARRAY['cones', 'running_shoes'],
  'intermediate',
  'Run between two points, touch ground at each end, complete specified number of trips'
FROM public.exercise_categories ec WHERE ec.name = 'Police Specific'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Wall Climb',
  'Climbing over walls or barriers',
  ec.id,
  ARRAY['upper_body', 'legs', 'agility'],
  ARRAY['wall', 'bodyweight'],
  'advanced',
  'Approach wall, use arms and legs to climb over, land safely on other side'
FROM public.exercise_categories ec WHERE ec.name = 'Police Specific'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Dummy Drag',
  'Dragging weighted object simulating rescue scenario',
  ec.id,
  ARRAY['upper_body', 'legs', 'back'],
  ARRAY['weighted_dummy'],
  'advanced',
  'Drag weighted dummy for specified distance, maintain proper form'
FROM public.exercise_categories ec WHERE ec.name = 'Police Specific'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RECOVERY EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Walking',
  'Low-intensity walking for recovery',
  ec.id,
  ARRAY['legs', 'cardio'],
  ARRAY['walking_shoes'],
  'beginner',
  'Walk at comfortable pace, focus on good posture and breathing'
FROM public.exercise_categories ec WHERE ec.name = 'Recovery'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Light Stretching',
  'Gentle stretching for flexibility and recovery',
  ec.id,
  ARRAY['flexibility'],
  ARRAY['bodyweight'],
  'beginner',
  'Perform gentle stretches, hold each position for 15-30 seconds'
FROM public.exercise_categories ec WHERE ec.name = 'Recovery'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Foam Rolling',
  'Self-myofascial release using foam roller',
  ec.id,
  ARRAY['recovery'],
  ARRAY['foam_roller'],
  'beginner',
  'Roll over tight muscles, spend extra time on sore areas'
FROM public.exercise_categories ec WHERE ec.name = 'Recovery'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- FLEXIBILITY EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Dynamic Stretching',
  'Moving stretches to prepare for activity',
  ec.id,
  ARRAY['flexibility'],
  ARRAY['bodyweight'],
  'beginner',
  'Perform controlled movements through full range of motion'
FROM public.exercise_categories ec WHERE ec.name = 'Flexibility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Static Stretching',
  'Holding stretches for flexibility',
  ec.id,
  ARRAY['flexibility'],
  ARRAY['bodyweight'],
  'beginner',
  'Hold each stretch for 20-30 seconds, breathe deeply'
FROM public.exercise_categories ec WHERE ec.name = 'Flexibility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Hip Flexor Stretch',
  'Stretching the front of the hip',
  ec.id,
  ARRAY['flexibility', 'hips'],
  ARRAY['bodyweight'],
  'beginner',
  'Kneel on one knee, lean forward to stretch front of hip'
FROM public.exercise_categories ec WHERE ec.name = 'Flexibility'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Hamstring Stretch',
  'Stretching the back of the thigh',
  ec.id,
  ARRAY['flexibility', 'hamstrings'],
  ARRAY['bodyweight'],
  'beginner',
  'Sit with legs extended, reach forward toward toes'
FROM public.exercise_categories ec WHERE ec.name = 'Flexibility'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- BODYWEIGHT EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Bear Crawls',
  'Moving on hands and feet like a bear',
  ec.id,
  ARRAY['full_body', 'coordination'],
  ARRAY['bodyweight'],
  'intermediate',
  'Move forward on hands and feet, keep hips level, maintain core tension'
FROM public.exercise_categories ec WHERE ec.name = 'Bodyweight'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Crab Walks',
  'Moving backward in crab position',
  ec.id,
  ARRAY['full_body', 'coordination'],
  ARRAY['bodyweight'],
  'intermediate',
  'Sit with hands behind back, lift hips, walk backward'
FROM public.exercise_categories ec WHERE ec.name = 'Bodyweight'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Inchworm Walkouts',
  'Walking hands out from standing position',
  ec.id,
  ARRAY['full_body', 'flexibility'],
  ARRAY['bodyweight'],
  'intermediate',
  'Stand, bend forward, walk hands out to plank, walk feet to hands'
FROM public.exercise_categories ec WHERE ec.name = 'Bodyweight'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Superman Hold',
  'Lying face down, lifting arms and legs',
  ec.id,
  ARRAY['back', 'glutes'],
  ARRAY['bodyweight'],
  'beginner',
  'Lie face down, lift arms and legs off ground, hold position'
FROM public.exercise_categories ec WHERE ec.name = 'Bodyweight'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- POWER EXERCISES
-- =====================================================================

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Clap Push-ups',
  'Explosive push-ups with clap at top',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight'],
  'advanced',
  'Perform push-up explosively, clap hands at top, land softly'
FROM public.exercise_categories ec WHERE ec.name = 'Power'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Medicine Ball Slams',
  'Throwing medicine ball to ground',
  ec.id,
  ARRAY['full_body', 'power'],
  ARRAY['medicine_ball'],
  'intermediate',
  'Hold ball overhead, slam to ground with force, catch and repeat'
FROM public.exercise_categories ec WHERE ec.name = 'Power'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Broad Jumps',
  'Horizontal jumping for distance',
  ec.id,
  ARRAY['legs', 'power'],
  ARRAY['bodyweight'],
  'intermediate',
  'Squat down, jump forward as far as possible, land softly'
FROM public.exercise_categories ec WHERE ec.name = 'Power'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (name, description, category_id, muscle_groups, equipment_needed, difficulty_level, instructions) 
SELECT 
  'Plyometric Push-ups',
  'Push-ups with hands leaving ground',
  ec.id,
  ARRAY['chest', 'triceps', 'shoulders'],
  ARRAY['bodyweight'],
  'advanced',
  'Perform push-up explosively, hands leave ground, land and repeat'
FROM public.exercise_categories ec WHERE ec.name = 'Power'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================

-- Check how many exercises we now have
SELECT 
  ec.name as category,
  COUNT(e.id) as exercise_count
FROM public.exercise_categories ec
LEFT JOIN public.exercises e ON ec.id = e.category_id
GROUP BY ec.id, ec.name
ORDER BY ec.name;


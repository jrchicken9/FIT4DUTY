const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Basic exercise categories
const exerciseCategories = [
  { name: 'Cardio', description: 'Cardiovascular exercises' },
  { name: 'Strength', description: 'Strength training exercises' },
  { name: 'Bodyweight', description: 'Bodyweight exercises' },
  { name: 'Flexibility', description: 'Stretching and flexibility exercises' },
  { name: 'Plyometrics', description: 'Explosive movement exercises' },
  { name: 'Core', description: 'Core and abdominal exercises' },
];

// Basic exercises for police fitness
const exercises = [
  // Cardio Exercises
  {
    name: 'Running',
    description: 'Basic running for cardiovascular fitness',
    category_name: 'Cardio',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'cardiovascular'],
    equipment_needed: ['running_shoes'],
    instructions: 'Run at a comfortable pace for the specified duration',
  },
  {
    name: 'Shuttle Run',
    description: 'Agility and speed training with directional changes',
    category_name: 'Cardio',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'cardiovascular', 'core'],
    equipment_needed: ['cones', 'running_shoes'],
    instructions: 'Set up cones 10-20 meters apart. Run back and forth between cones, touching each cone.',
  },
  {
    name: 'Cycling',
    description: 'Low-impact cardiovascular exercise',
    category_name: 'Cardio',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'cardiovascular'],
    equipment_needed: ['bicycle', 'helmet'],
    instructions: 'Cycle at a moderate pace for the specified duration',
  },

  // Strength Exercises
  {
    name: 'Push-ups',
    description: 'Classic upper body strength exercise',
    category_name: 'Strength',
    difficulty_level: 'beginner',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment_needed: [],
    instructions: 'Start in plank position, lower body until chest nearly touches ground, then push back up',
  },
  {
    name: 'Pull-ups',
    description: 'Upper body pulling strength exercise',
    category_name: 'Strength',
    difficulty_level: 'intermediate',
    muscle_groups: ['back', 'biceps', 'shoulders'],
    equipment_needed: ['pull_up_bar'],
    instructions: 'Hang from bar, pull body up until chin is above bar, then lower with control',
  },
  {
    name: 'Squats',
    description: 'Lower body compound exercise',
    category_name: 'Strength',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment_needed: [],
    instructions: 'Stand with feet shoulder-width apart, lower body as if sitting back, then stand back up',
  },
  {
    name: 'Deadlifts',
    description: 'Full body compound strength exercise',
    category_name: 'Strength',
    difficulty_level: 'advanced',
    muscle_groups: ['legs', 'back', 'core'],
    equipment_needed: ['barbell', 'weight_plates'],
    instructions: 'Stand with feet hip-width apart, bend at hips and knees to lower bar, then stand up straight',
  },

  // Bodyweight Exercises
  {
    name: 'Burpees',
    description: 'Full body conditioning exercise',
    category_name: 'Bodyweight',
    difficulty_level: 'intermediate',
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment_needed: [],
    instructions: 'Start standing, drop to push-up position, do a push-up, jump feet forward, then jump up',
  },
  {
    name: 'Mountain Climbers',
    description: 'Dynamic core and cardio exercise',
    category_name: 'Bodyweight',
    difficulty_level: 'beginner',
    muscle_groups: ['core', 'shoulders', 'cardiovascular'],
    equipment_needed: [],
    instructions: 'Start in plank position, alternate bringing knees toward chest in running motion',
  },
  {
    name: 'Plank',
    description: 'Static core stability exercise',
    category_name: 'Bodyweight',
    difficulty_level: 'beginner',
    muscle_groups: ['core', 'shoulders'],
    equipment_needed: [],
    instructions: 'Hold body in straight line from head to heels, engaging core muscles',
  },

  // Flexibility Exercises
  {
    name: 'Hamstring Stretch',
    description: 'Stretching for hamstring flexibility',
    category_name: 'Flexibility',
    difficulty_level: 'beginner',
    muscle_groups: ['legs'],
    equipment_needed: [],
    instructions: 'Sit on ground with legs extended, reach forward toward toes, hold stretch',
  },
  {
    name: 'Hip Flexor Stretch',
    description: 'Stretching for hip flexibility',
    category_name: 'Flexibility',
    difficulty_level: 'beginner',
    muscle_groups: ['hips', 'legs'],
    equipment_needed: [],
    instructions: 'Kneel on one knee, other foot forward, lean forward to stretch hip flexor',
  },

  // Plyometric Exercises
  {
    name: 'Box Jumps',
    description: 'Explosive lower body power exercise',
    category_name: 'Plyometrics',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes'],
    equipment_needed: ['plyo_box'],
    instructions: 'Stand facing box, jump onto box with both feet, step down and repeat',
  },
  {
    name: 'Jump Squats',
    description: 'Explosive squat variation',
    category_name: 'Plyometrics',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes'],
    equipment_needed: [],
    instructions: 'Perform squat, then explosively jump up, land softly and repeat',
  },

  // Core Exercises
  {
    name: 'Crunches',
    description: 'Basic abdominal exercise',
    category_name: 'Core',
    difficulty_level: 'beginner',
    muscle_groups: ['core'],
    equipment_needed: [],
    instructions: 'Lie on back, knees bent, lift shoulders off ground using abdominal muscles',
  },
  {
    name: 'Russian Twists',
    description: 'Rotational core exercise',
    category_name: 'Core',
    difficulty_level: 'intermediate',
    muscle_groups: ['core', 'obliques'],
    equipment_needed: [],
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side',
  },
  {
    name: 'Leg Raises',
    description: 'Lower abdominal exercise',
    category_name: 'Core',
    difficulty_level: 'intermediate',
    muscle_groups: ['core', 'lower_abs'],
    equipment_needed: [],
    instructions: 'Lie on back, raise legs straight up, lower with control, repeat',
  },
];

async function populateExerciseLibrary() {
  try {
    console.log('Starting exercise library population...');

    // First, populate categories
    console.log('Creating exercise categories...');
    for (const category of exerciseCategories) {
      const { data, error } = await supabase
        .from('exercise_categories')
        .insert(category)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`Category "${category.name}" already exists, skipping...`);
        } else {
          console.error(`Error creating category "${category.name}":`, error);
        }
      } else {
        console.log(`Created category: ${category.name}`);
      }
    }

    // Get category IDs for reference
    const { data: categories } = await supabase
      .from('exercise_categories')
      .select('id, name');

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Then, populate exercises
    console.log('Creating exercises...');
    for (const exercise of exercises) {
      const exerciseData = {
        name: exercise.name,
        description: exercise.description,
        category_id: categoryMap[exercise.category_name],
        difficulty_level: exercise.difficulty_level,
        muscle_groups: exercise.muscle_groups,
        equipment_needed: exercise.equipment_needed,
        instructions: exercise.instructions,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`Exercise "${exercise.name}" already exists, skipping...`);
        } else {
          console.error(`Error creating exercise "${exercise.name}":`, error);
        }
      } else {
        console.log(`Created exercise: ${exercise.name}`);
      }
    }

    console.log('Exercise library population completed!');
    
    // Show summary
    const { data: finalCategories } = await supabase
      .from('exercise_categories')
      .select('*');
    
    const { data: finalExercises } = await supabase
      .from('exercises')
      .select('*');

    console.log(`\nSummary:`);
    console.log(`- Categories created: ${finalCategories.length}`);
    console.log(`- Exercises created: ${finalExercises.length}`);

  } catch (error) {
    console.error('Error populating exercise library:', error);
  }
}

// Run the script
populateExerciseLibrary();


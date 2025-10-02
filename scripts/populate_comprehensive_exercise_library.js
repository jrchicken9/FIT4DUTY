const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Comprehensive exercise categories for police fitness
const exerciseCategories = [
  { name: 'Cardio', description: 'Cardiovascular exercises for endurance' },
  { name: 'Strength', description: 'Strength training exercises' },
  { name: 'Bodyweight', description: 'Bodyweight exercises' },
  { name: 'Flexibility', description: 'Stretching and flexibility exercises' },
  { name: 'Plyometrics', description: 'Explosive movement exercises' },
  { name: 'Core', description: 'Core and abdominal exercises' },
  { name: 'Agility', description: 'Agility and coordination exercises' },
  { name: 'Police Specific', description: 'Exercises specific to police work' },
  { name: 'Balance', description: 'Balance and stability exercises' },
  { name: 'Recovery', description: 'Recovery and mobility exercises' },
];

// Comprehensive exercises for police fitness and PREP test preparation
const exercises = [
  // ===== CARDIO EXERCISES =====
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
    description: 'Agility and speed training with directional changes - essential for PREP test',
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
  {
    name: 'Rowing',
    description: 'Full body cardiovascular exercise',
    category_name: 'Cardio',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'back', 'arms', 'cardiovascular'],
    equipment_needed: ['rowing_machine'],
    instructions: 'Sit on rower, push with legs, pull with arms, return to start position',
  },
  {
    name: 'Swimming',
    description: 'Full body low-impact cardio',
    category_name: 'Cardio',
    difficulty_level: 'intermediate',
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment_needed: ['pool', 'swimsuit'],
    instructions: 'Swim freestyle or breaststroke for the specified duration',
  },
  {
    name: 'High-Intensity Interval Training (HIIT)',
    description: 'Alternating high and low intensity cardio',
    category_name: 'Cardio',
    difficulty_level: 'advanced',
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment_needed: ['timer'],
    instructions: 'Alternate 30 seconds high intensity with 30 seconds rest',
  },
  {
    name: 'Stair Climbing',
    description: 'Cardio exercise with resistance',
    category_name: 'Cardio',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes', 'cardiovascular'],
    equipment_needed: ['stairs'],
    instructions: 'Climb stairs at a steady pace for the specified duration',
  },

  // ===== STRENGTH EXERCISES =====
  {
    name: 'Push-ups',
    description: 'Classic upper body strength exercise - essential for PREP test',
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
  {
    name: 'Bench Press',
    description: 'Upper body pushing strength',
    category_name: 'Strength',
    difficulty_level: 'intermediate',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment_needed: ['barbell', 'bench', 'weight_plates'],
    instructions: 'Lie on bench, lower bar to chest, then press up to starting position',
  },
  {
    name: 'Overhead Press',
    description: 'Shoulder strength exercise',
    category_name: 'Strength',
    difficulty_level: 'intermediate',
    muscle_groups: ['shoulders', 'triceps'],
    equipment_needed: ['barbell', 'weight_plates'],
    instructions: 'Stand with bar at shoulder level, press overhead until arms are straight',
  },
  {
    name: 'Bent-Over Rows',
    description: 'Back strength exercise',
    category_name: 'Strength',
    difficulty_level: 'intermediate',
    muscle_groups: ['back', 'biceps'],
    equipment_needed: ['barbell', 'weight_plates'],
    instructions: 'Bend at hips, pull bar toward lower chest, then lower with control',
  },
  {
    name: 'Lunges',
    description: 'Unilateral leg strength exercise',
    category_name: 'Strength',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment_needed: [],
    instructions: 'Step forward, lower back knee toward ground, then push back to start',
  },

  // ===== BODYWEIGHT EXERCISES =====
  {
    name: 'Burpees',
    description: 'Full body conditioning exercise - excellent for PREP test',
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
  {
    name: 'Dips',
    description: 'Upper body pushing exercise',
    category_name: 'Bodyweight',
    difficulty_level: 'intermediate',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment_needed: ['dip_bars'],
    instructions: 'Support body on bars, lower until upper arms are parallel to ground, then push up',
  },
  {
    name: 'Pike Push-ups',
    description: 'Advanced push-up variation for shoulders',
    category_name: 'Bodyweight',
    difficulty_level: 'advanced',
    muscle_groups: ['shoulders', 'triceps', 'core'],
    equipment_needed: [],
    instructions: 'Start in downward dog position, lower head toward ground, then push back up',
  },
  {
    name: 'Pistol Squats',
    description: 'Advanced single-leg squat',
    category_name: 'Bodyweight',
    difficulty_level: 'advanced',
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment_needed: [],
    instructions: 'Stand on one leg, extend other leg forward, squat down on standing leg',
  },
  {
    name: 'Handstand Push-ups',
    description: 'Advanced shoulder strength exercise',
    category_name: 'Bodyweight',
    difficulty_level: 'advanced',
    muscle_groups: ['shoulders', 'triceps', 'core'],
    equipment_needed: ['wall'],
    instructions: 'Kick up into handstand against wall, lower head toward ground, then push up',
  },

  // ===== FLEXIBILITY EXERCISES =====
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
  {
    name: 'Shoulder Stretch',
    description: 'Stretching for shoulder mobility',
    category_name: 'Flexibility',
    difficulty_level: 'beginner',
    muscle_groups: ['shoulders', 'chest'],
    equipment_needed: [],
    instructions: 'Stand with arms extended behind back, clasp hands and lift arms',
  },
  {
    name: 'Cat-Cow Stretch',
    description: 'Spinal mobility exercise',
    category_name: 'Flexibility',
    difficulty_level: 'beginner',
    muscle_groups: ['back', 'core'],
    equipment_needed: [],
    instructions: 'On hands and knees, alternate between arching and rounding back',
  },
  {
    name: 'Pigeon Pose',
    description: 'Deep hip stretch',
    category_name: 'Flexibility',
    difficulty_level: 'intermediate',
    muscle_groups: ['hips', 'glutes'],
    equipment_needed: [],
    instructions: 'From plank, bring one knee forward and to the side, lower hips toward ground',
  },

  // ===== PLYOMETRIC EXERCISES =====
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
  {
    name: 'Clap Push-ups',
    description: 'Explosive upper body exercise',
    category_name: 'Plyometrics',
    difficulty_level: 'advanced',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment_needed: [],
    instructions: 'Perform push-up explosively, clap hands in air, land and repeat',
  },
  {
    name: 'Tuck Jumps',
    description: 'Explosive jumping exercise',
    category_name: 'Plyometrics',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment_needed: [],
    instructions: 'Jump up, bring knees toward chest, land softly and repeat',
  },
  {
    name: 'Broad Jumps',
    description: 'Horizontal jumping for power',
    category_name: 'Plyometrics',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes'],
    equipment_needed: [],
    instructions: 'Squat down, jump forward as far as possible, land softly',
  },

  // ===== CORE EXERCISES =====
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
  {
    name: 'Bicycle Crunches',
    description: 'Dynamic core exercise',
    category_name: 'Core',
    difficulty_level: 'intermediate',
    muscle_groups: ['core', 'obliques'],
    equipment_needed: [],
    instructions: 'Lie on back, alternate bringing elbow to opposite knee in cycling motion',
  },
  {
    name: 'Side Plank',
    description: 'Lateral core stability',
    category_name: 'Core',
    difficulty_level: 'intermediate',
    muscle_groups: ['core', 'obliques', 'shoulders'],
    equipment_needed: [],
    instructions: 'Lie on side, prop up on elbow, lift hips to form straight line',
  },
  {
    name: 'Hollow Hold',
    description: 'Advanced core stability exercise',
    category_name: 'Core',
    difficulty_level: 'advanced',
    muscle_groups: ['core'],
    equipment_needed: [],
    instructions: 'Lie on back, lift shoulders and legs off ground, hold position',
  },

  // ===== AGILITY EXERCISES =====
  {
    name: 'Ladder Drills',
    description: 'Footwork and agility training',
    category_name: 'Agility',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'core'],
    equipment_needed: ['agility_ladder'],
    instructions: 'Perform various footwork patterns through agility ladder',
  },
  {
    name: 'Cone Weaving',
    description: 'Agility and coordination exercise',
    category_name: 'Agility',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'core'],
    equipment_needed: ['cones'],
    instructions: 'Weave in and out of cones in a zigzag pattern',
  },
  {
    name: 'Lateral Shuffles',
    description: 'Side-to-side movement training',
    category_name: 'Agility',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'glutes'],
    equipment_needed: [],
    instructions: 'Shuffle side to side while maintaining athletic stance',
  },
  {
    name: 'Carioca',
    description: 'Cross-step running for agility',
    category_name: 'Agility',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'core'],
    equipment_needed: [],
    instructions: 'Run sideways with crossing steps, alternating front and back',
  },

  // ===== POLICE SPECIFIC EXERCISES =====
  {
    name: 'Obstacle Course Running',
    description: 'Simulates police obstacle course',
    category_name: 'Police Specific',
    difficulty_level: 'intermediate',
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment_needed: ['obstacles', 'cones'],
    instructions: 'Navigate through various obstacles while maintaining speed',
  },
  {
    name: 'Suspect Pursuit Simulation',
    description: 'High-intensity chase simulation',
    category_name: 'Police Specific',
    difficulty_level: 'advanced',
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment_needed: ['cones', 'timer'],
    instructions: 'Sprint between points, change direction quickly, simulate pursuit',
  },
  {
    name: 'Equipment Carry',
    description: 'Simulates carrying police equipment',
    category_name: 'Police Specific',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'core', 'shoulders'],
    equipment_needed: ['weight_vest', 'dumbbells'],
    instructions: 'Walk or run while carrying weighted equipment',
  },
  {
    name: 'Barrier Climbing',
    description: 'Simulates climbing over barriers',
    category_name: 'Police Specific',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'arms', 'core'],
    equipment_needed: ['barriers', 'walls'],
    instructions: 'Practice climbing over various height barriers',
  },

  // ===== BALANCE EXERCISES =====
  {
    name: 'Single Leg Balance',
    description: 'Basic balance training',
    category_name: 'Balance',
    difficulty_level: 'beginner',
    muscle_groups: ['legs', 'core'],
    equipment_needed: [],
    instructions: 'Stand on one leg, maintain balance for specified time',
  },
  {
    name: 'Bosu Ball Squats',
    description: 'Unstable surface squatting',
    category_name: 'Balance',
    difficulty_level: 'intermediate',
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment_needed: ['bosu_ball'],
    instructions: 'Perform squats while standing on Bosu ball',
  },
  {
    name: 'Stability Ball Plank',
    description: 'Unstable core stability',
    category_name: 'Balance',
    difficulty_level: 'intermediate',
    muscle_groups: ['core', 'shoulders'],
    equipment_needed: ['stability_ball'],
    instructions: 'Hold plank position with feet on stability ball',
  },

  // ===== RECOVERY EXERCISES =====
  {
    name: 'Foam Rolling',
    description: 'Self-myofascial release',
    category_name: 'Recovery',
    difficulty_level: 'beginner',
    muscle_groups: ['full_body'],
    equipment_needed: ['foam_roller'],
    instructions: 'Roll over tight muscles to release tension',
  },
  {
    name: 'Static Stretching',
    description: 'Post-workout stretching',
    category_name: 'Recovery',
    difficulty_level: 'beginner',
    muscle_groups: ['full_body'],
    equipment_needed: [],
    instructions: 'Hold stretches for 30-60 seconds to improve flexibility',
  },
  {
    name: 'Mobility Flow',
    description: 'Dynamic mobility sequence',
    category_name: 'Recovery',
    difficulty_level: 'beginner',
    muscle_groups: ['full_body'],
    equipment_needed: [],
    instructions: 'Perform flowing movement sequence to improve joint mobility',
  },
];

async function populateComprehensiveExerciseLibrary() {
  try {
    console.log('🚀 Starting comprehensive exercise library population...');

    // First, populate categories
    console.log('📂 Creating exercise categories...');
    for (const category of exerciseCategories) {
      const { data, error } = await supabase
        .from('exercise_categories')
        .insert(category)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`✅ Category "${category.name}" already exists, skipping...`);
        } else {
          console.error(`❌ Error creating category "${category.name}":`, error);
        }
      } else {
        console.log(`✅ Created category: ${category.name}`);
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
    console.log('💪 Creating exercises...');
    let createdCount = 0;
    let skippedCount = 0;

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
          console.log(`⏭️ Exercise "${exercise.name}" already exists, skipping...`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating exercise "${exercise.name}":`, error);
        }
      } else {
        console.log(`✅ Created exercise: ${exercise.name} (${exercise.category_name})`);
        createdCount++;
      }
    }

    console.log('\n🎉 Comprehensive exercise library population completed!');
    
    // Show summary
    const { data: finalCategories } = await supabase
      .from('exercise_categories')
      .select('*');
    
    const { data: finalExercises } = await supabase
      .from('exercises')
      .select('*');

    console.log(`\n📊 Summary:`);
    console.log(`- Categories: ${finalCategories.length}`);
    console.log(`- Total Exercises: ${finalExercises.length}`);
    console.log(`- New Exercises Created: ${createdCount}`);
    console.log(`- Exercises Skipped (already existed): ${skippedCount}`);

    // Show breakdown by category
    console.log(`\n📋 Exercises by Category:`);
    const categoryCounts = {};
    finalExercises.forEach(ex => {
      const categoryName = finalCategories.find(c => c.id === ex.category_id)?.name || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} exercises`);
    });

  } catch (error) {
    console.error('❌ Error populating comprehensive exercise library:', error);
  }
}

// Run the script
populateComprehensiveExerciseLibrary();

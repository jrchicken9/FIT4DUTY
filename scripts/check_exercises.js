const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExercises() {
  console.log('🔍 Checking Exercise Database...\n');

  try {
    // 1. Check if exercises table has data
    console.log('1. Checking exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true);

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError);
      return;
    }

    console.log(`Found ${exercises.length} active exercises`);
    
    if (exercises.length === 0) {
      console.log('❌ No exercises found in database!');
      console.log('This is likely the root cause of "Unknown Exercise" issues.');
      return;
    }

    // 2. Show first few exercises
    console.log('\n2. Sample exercises:');
    exercises.slice(0, 5).forEach((exercise, index) => {
      console.log(`   ${index + 1}. ${exercise.name} (ID: ${exercise.id})`);
      console.log(`      - Difficulty: ${exercise.difficulty_level}`);
      console.log(`      - Muscle groups: ${exercise.muscle_groups?.join(', ') || 'None'}`);
    });

    // 3. Check workout_exercises table
    console.log('\n3. Checking workout_exercises table...');
    const { data: workoutExercises, error: weError } = await supabase
      .from('workout_exercises')
      .select('*')
      .limit(10);

    if (weError) {
      console.error('Error fetching workout_exercises:', weError);
      return;
    }

    console.log(`Found ${workoutExercises.length} workout_exercise records`);
    
    if (workoutExercises.length > 0) {
      console.log('\nSample workout_exercises:');
      workoutExercises.slice(0, 3).forEach((we, index) => {
        console.log(`   ${index + 1}. Workout ID: ${we.workout_id}`);
        console.log(`      - Exercise ID: ${we.exercise_id}`);
        console.log(`      - Order: ${we.order_index}`);
        console.log(`      - Sets: ${we.sets}, Reps: ${we.reps}`);
      });
    }

    // 4. Check if workout_exercises reference valid exercises
    console.log('\n4. Checking exercise references...');
    if (workoutExercises.length > 0) {
      const exerciseIds = [...new Set(workoutExercises.map(we => we.exercise_id))];
      console.log(`Unique exercise IDs referenced: ${exerciseIds.length}`);
      
      const { data: referencedExercises, error: refError } = await supabase
        .from('exercises')
        .select('id, name')
        .in('id', exerciseIds);

      if (refError) {
        console.error('Error checking referenced exercises:', refError);
      } else {
        console.log(`Found ${referencedExercises.length} referenced exercises`);
        if (referencedExercises.length < exerciseIds.length) {
          console.log('❌ Some workout_exercises reference non-existent exercises!');
          const foundIds = referencedExercises.map(e => e.id);
          const missingIds = exerciseIds.filter(id => !foundIds.includes(id));
          console.log('Missing exercise IDs:', missingIds);
        } else {
          console.log('✅ All workout_exercises reference valid exercises');
        }
      }
    }

    // 5. Test the join query
    console.log('\n5. Testing join query...');
    const { data: joinedData, error: joinError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercises (*)
      `)
      .limit(3);

    if (joinError) {
      console.error('Error testing join:', joinError);
    } else {
      console.log('Join query results:');
      joinedData.forEach((item, index) => {
        console.log(`   ${index + 1}. Workout Exercise ID: ${item.id}`);
        console.log(`      - Exercise: ${item.exercises?.name || 'NULL'} (ID: ${item.exercise_id})`);
        console.log(`      - Sets: ${item.sets}, Reps: ${item.reps}`);
      });
    }

  } catch (error) {
    console.error('Check failed:', error);
  }
}

// Run the check
checkExercises().then(() => {
  console.log('\n✅ Exercise check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Exercise check failed:', error);
  process.exit(1);
});


const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExerciseLoading() {
  console.log('🧪 Testing Exercise Loading...\n');

  try {
    // 1. Get all workout plans
    console.log('1. Fetching workout plans...');
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('is_active', true);

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      return;
    }

    console.log(`Found ${plans.length} active workout plans`);
    
    if (plans.length === 0) {
      console.log('No workout plans found. Creating a test plan...');
      return;
    }

    // 2. Get the first plan with workouts and exercises
    const testPlan = plans[0];
    console.log(`\n2. Testing plan: "${testPlan.title}" (ID: ${testPlan.id})`);

    const { data: planWithWorkouts, error: planError } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workouts (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('id', testPlan.id)
      .eq('is_active', true)
      .single();

    if (planError) {
      console.error('Error fetching plan with workouts:', planError);
      return;
    }

    console.log(`Plan has ${planWithWorkouts.workouts?.length || 0} workouts`);

    // 3. Check each workout
    if (planWithWorkouts.workouts) {
      planWithWorkouts.workouts.forEach((workout, index) => {
        console.log(`\n   Workout ${index + 1}: "${workout.name}"`);
        console.log(`   - Day ${workout.day_number}, Week ${workout.week_number}`);
        console.log(`   - Has ${workout.workout_exercises?.length || 0} exercises`);
        
        if (workout.workout_exercises && workout.workout_exercises.length > 0) {
          workout.workout_exercises.forEach((exercise, exIndex) => {
            console.log(`     Exercise ${exIndex + 1}: ${exercise.exercises?.name || 'Unknown'} (Order: ${exercise.order_index})`);
          });
        } else {
          console.log('     No exercises found');
        }
      });
    }

    // 4. Test adding an exercise to the first workout
    if (planWithWorkouts.workouts && planWithWorkouts.workouts.length > 0) {
      const firstWorkout = planWithWorkouts.workouts[0];
      console.log(`\n3. Testing exercise addition to workout: "${firstWorkout.name}"`);

      // Get available exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        return;
      }

      if (exercises.length === 0) {
        console.log('No exercises available in the database');
        return;
      }

      const testExercise = exercises[0];
      console.log(`Using exercise: "${testExercise.name}"`);

      // Try to add the exercise
      try {
        const { data: addedExercise, error: addError } = await supabase
          .rpc('safe_add_workout_exercise', {
            p_workout_id: firstWorkout.id,
            p_exercise_id: testExercise.id,
            p_sets: 3,
            p_reps: 10,
            p_rest_time_seconds: 90
          });

        if (addError) {
          console.error('Error adding exercise:', addError);
        } else {
          console.log('✅ Exercise added successfully!');
          console.log(`New exercise record ID: ${addedExercise}`);
        }
      } catch (error) {
        console.error('Exception adding exercise:', error);
      }
    }

    // 5. Verify the exercise was added
    console.log('\n4. Verifying exercise was added...');
    const { data: updatedPlan, error: verifyError } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workouts (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('id', testPlan.id)
      .single();

    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      const firstWorkout = updatedPlan.workouts[0];
      console.log(`Updated workout "${firstWorkout.name}" now has ${firstWorkout.workout_exercises?.length || 0} exercises`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testExerciseLoading().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});


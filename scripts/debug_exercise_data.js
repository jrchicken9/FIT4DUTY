const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugExerciseData() {
  console.log('🔍 Debugging Exercise Data Structure...\n');

  try {
    // 1. Get a workout plan
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (plansError || !plans.length) {
      console.error('No workout plans found');
      return;
    }

    const planId = plans[0].id;
    console.log(`Testing with plan: ${plans[0].title} (ID: ${planId})\n`);

    // 2. Get the plan with workouts and exercises
    const { data: planData, error: planError } = await supabase
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
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Error fetching plan:', planError);
      return;
    }

    console.log('📋 Raw Plan Data Structure:');
    console.log(JSON.stringify(planData, null, 2));

    // 3. Check each workout
    if (planData.workouts) {
      planData.workouts.forEach((workout, index) => {
        console.log(`\n🏋️ Workout ${index + 1}: "${workout.name}"`);
        console.log(`   - Day ${workout.day_number}, Week ${workout.week_number}`);
        console.log(`   - Raw workout_exercises:`, workout.workout_exercises);
        
        if (workout.workout_exercises && workout.workout_exercises.length > 0) {
          workout.workout_exercises.forEach((we, weIndex) => {
            console.log(`\n   Exercise ${weIndex + 1}:`);
            console.log(`     - workout_exercise ID: ${we.id}`);
            console.log(`     - exercise_id: ${we.exercise_id}`);
            console.log(`     - order_index: ${we.order_index}`);
            console.log(`     - sets: ${we.sets}, reps: ${we.reps}`);
            console.log(`     - Raw exercises data:`, we.exercises);
            console.log(`     - Exercise name: ${we.exercises?.name || 'NULL'}`);
          });
        } else {
          console.log('   No exercises found');
        }
      });
    }

    // 4. Test the mapping logic
    console.log('\n🔄 Testing Mapping Logic:');
    if (planData.workouts) {
      const mappedWorkouts = planData.workouts.map(workout => ({
        ...workout,
        exercises: (workout.workout_exercises || []).map(we => ({
          ...we,
          exercise: we.exercises
        }))
      }));

      mappedWorkouts.forEach((workout, index) => {
        console.log(`\nMapped Workout ${index + 1}: "${workout.name}"`);
        if (workout.exercises && workout.exercises.length > 0) {
          workout.exercises.forEach((ex, exIndex) => {
            console.log(`  Exercise ${exIndex + 1}: ${ex.exercise?.name || 'Unknown'} (ID: ${ex.exercise_id})`);
          });
        }
      });
    }

  } catch (error) {
    console.error('Debug failed:', error);
  }
}

// Run the debug
debugExerciseData().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});


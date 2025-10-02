const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testWorkoutCreation() {
  try {
    console.log('Testing workout creation...');

    // First, let's check if we have any workout plans
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .limit(1);

    if (plansError) {
      console.error('Error fetching workout plans:', plansError);
      return;
    }

    if (!plans || plans.length === 0) {
      console.log('No workout plans found. Creating a test plan first...');
      
      // Create a test workout plan
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          title: 'Test Workout Plan',
          description: 'A test plan for debugging',
          difficulty_level: 'beginner',
          duration_weeks: 4,
          focus_areas: ['strength'],
          target_audience: 'police_candidates',
          is_active: true,
          is_featured: false,
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating test plan:', planError);
        return;
      }

      console.log('Created test plan:', newPlan);
      
      // Now try to create a workout
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          plan_id: newPlan.id,
          name: 'Test Workout',
          description: 'A test workout',
          day_number: 1,
          week_number: 1,
          estimated_duration_minutes: 45,
          rest_between_exercises_seconds: 60,
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating test workout:', workoutError);
        return;
      }

      console.log('Created test workout:', newWorkout);

      // Check if we have any exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .limit(1);

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        return;
      }

      if (exercises && exercises.length > 0) {
        // Try to add an exercise to the workout
        const { data: newExercise, error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: newWorkout.id,
            exercise_id: exercises[0].id,
            order_index: 1,
            sets: 3,
            reps: 10,
            rest_time_seconds: 90,
          })
          .select()
          .single();

        if (exerciseError) {
          console.error('Error adding exercise to workout:', exerciseError);
          return;
        }

        console.log('Added exercise to workout:', newExercise);
      }

      // Clean up - delete the test data
      console.log('Cleaning up test data...');
      await supabase.from('workout_exercises').delete().eq('workout_id', newWorkout.id);
      await supabase.from('workouts').delete().eq('id', newWorkout.id);
      await supabase.from('workout_plans').delete().eq('id', newPlan.id);

      console.log('Test completed successfully!');
    } else {
      console.log('Found existing workout plans:', plans);
      
      // Test creating a workout with an existing plan
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          plan_id: plans[0].id,
          name: 'Test Workout',
          description: 'A test workout',
          day_number: 1,
          week_number: 1,
          estimated_duration_minutes: 45,
          rest_between_exercises_seconds: 60,
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating test workout:', workoutError);
        return;
      }

      console.log('Created test workout:', newWorkout);

      // Clean up
      await supabase.from('workouts').delete().eq('id', newWorkout.id);
      console.log('Test completed successfully!');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testWorkoutCreation();


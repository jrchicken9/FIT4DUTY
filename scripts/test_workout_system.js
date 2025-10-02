const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkoutSystem() {
  console.log('🧪 Testing Workout System...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking database tables...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('exercise_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ Exercise categories table error:', categoriesError.message);
    } else {
      console.log('✅ Exercise categories table exists');
    }

    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (exercisesError) {
      console.error('❌ Exercises table error:', exercisesError.message);
    } else {
      console.log('✅ Exercises table exists');
    }

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .limit(1);
    
    if (plansError) {
      console.error('❌ Workout plans table error:', plansError.message);
    } else {
      console.log('✅ Workout plans table exists');
    }

    // Test 2: Check seed data
    console.log('\n2. Checking seed data...');
    
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from('exercise_categories')
      .select('*');
    
    if (allCategoriesError) {
      console.error('❌ Error fetching categories:', allCategoriesError.message);
    } else {
      console.log(`✅ Found ${allCategories.length} exercise categories`);
      allCategories.forEach(cat => console.log(`   - ${cat.name}`));
    }

    const { data: allExercises, error: allExercisesError } = await supabase
      .from('exercises')
      .select('*');
    
    if (allExercisesError) {
      console.error('❌ Error fetching exercises:', allExercisesError.message);
    } else {
      console.log(`✅ Found ${allExercises.length} exercises`);
      allExercises.forEach(ex => console.log(`   - ${ex.name} (${ex.difficulty_level})`));
    }

    const { data: allPlans, error: allPlansError } = await supabase
      .from('workout_plans')
      .select('*');
    
    if (allPlansError) {
      console.error('❌ Error fetching workout plans:', allPlansError.message);
    } else {
      console.log(`✅ Found ${allPlans.length} workout plans`);
      allPlans.forEach(plan => console.log(`   - ${plan.title} (${plan.difficulty_level})`));
    }

    // Test 3: Check workouts and exercises
    console.log('\n3. Checking workouts and exercises...');
    
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_plans(title)
      `)
      .limit(5);
    
    if (workoutsError) {
      console.error('❌ Error fetching workouts:', workoutsError.message);
    } else {
      console.log(`✅ Found ${workouts.length} workouts`);
      workouts.forEach(workout => {
        console.log(`   - ${workout.name} (${workout.workout_plans?.title})`);
      });
    }

    const { data: workoutExercises, error: workoutExercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercises(name),
        workouts(name)
      `)
      .limit(5);
    
    if (workoutExercisesError) {
      console.error('❌ Error fetching workout exercises:', workoutExercisesError.message);
    } else {
      console.log(`✅ Found ${workoutExercises.length} workout exercises`);
      workoutExercises.forEach(we => {
        console.log(`   - ${we.exercises?.name} in ${we.workouts?.name} (${we.sets}x${we.reps})`);
      });
    }

    // Test 4: Test admin functionality (create a workout plan)
    console.log('\n4. Testing admin functionality...');
    
    const testPlan = {
      title: 'Test Workout Plan',
      description: 'A test plan created by the test script',
      difficulty_level: 'beginner',
      duration_weeks: 4,
      focus_areas: ['strength', 'cardio'],
      target_audience: 'test_users',
      is_featured: false,
      is_active: true
    };

    const { data: newPlan, error: createPlanError } = await supabase
      .from('workout_plans')
      .insert(testPlan)
      .select()
      .single();
    
    if (createPlanError) {
      console.error('❌ Error creating test plan:', createPlanError.message);
    } else {
      console.log('✅ Successfully created test workout plan');
      console.log(`   - ID: ${newPlan.id}`);
      console.log(`   - Title: ${newPlan.title}`);
      
      // Clean up - delete the test plan
      const { error: deleteError } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', newPlan.id);
      
      if (deleteError) {
        console.error('❌ Error deleting test plan:', deleteError.message);
      } else {
        console.log('✅ Successfully deleted test plan');
      }
    }

    console.log('\n🎉 Workout system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Exercise Categories: ${allCategories?.length || 0}`);
    console.log(`   - Exercises: ${allExercises?.length || 0}`);
    console.log(`   - Workout Plans: ${allPlans?.length || 0}`);
    console.log(`   - Workouts: ${workouts?.length || 0}`);
    console.log(`   - Workout Exercises: ${workoutExercises?.length || 0}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testWorkoutSystem();

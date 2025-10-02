const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://hdhephqdfgbtoupnewyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkaGVwaHFkZmdidG91cG5ld3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDg1MDYsImV4cCI6MjA2OTk4NDUwNn0.Pyl9S7YNjk-XLK2cX8Rd2MtA3IhRRrIQHTtZimsVc1Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function manualSeed() {
  console.log('🌱 Manual Seeding Workout System...\n');

  try {
    // 1. Insert exercise categories
    console.log('1. Inserting exercise categories...');
    
    const categories = [
      { name: 'Strength Training', description: 'Build muscle and increase strength', icon: 'dumbbell', color: '#3B82F6' },
      { name: 'Cardio', description: 'Improve cardiovascular fitness', icon: 'heart', color: '#EF4444' },
      { name: 'Flexibility', description: 'Improve range of motion and mobility', icon: 'stretch', color: '#10B981' },
      { name: 'Core', description: 'Strengthen abdominal and back muscles', icon: 'target', color: '#F59E0B' },
      { name: 'Bodyweight', description: 'Exercises using only body weight', icon: 'user', color: '#8B5CF6' },
      { name: 'Police Specific', description: 'Exercises relevant to police fitness tests', icon: 'shield', color: '#DC2626' }
    ];

    for (const category of categories) {
      const { error } = await supabase
        .from('exercise_categories')
        .insert(category);
      
      if (error) {
        console.log(`   - ${category.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${category.name}`);
      }
    }

    // 2. Insert exercises
    console.log('\n2. Inserting exercises...');
    
    const { data: strengthCategory } = await supabase
      .from('exercise_categories')
      .select('id')
      .eq('name', 'Strength Training')
      .single();

    const { data: coreCategory } = await supabase
      .from('exercise_categories')
      .select('id')
      .eq('name', 'Core')
      .single();

    const { data: cardioCategory } = await supabase
      .from('exercise_categories')
      .select('id')
      .eq('name', 'Cardio')
      .single();

    const exercises = [
      {
        name: 'Push-ups',
        description: 'Standard push-ups to build upper body strength',
        category_id: strengthCategory?.id,
        muscle_groups: ['chest', 'triceps', 'shoulders'],
        equipment_needed: ['bodyweight'],
        difficulty_level: 'beginner',
        instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up'
      },
      {
        name: 'Sit-ups',
        description: 'Core strengthening exercise',
        category_id: coreCategory?.id,
        muscle_groups: ['abs', 'core'],
        equipment_needed: ['bodyweight'],
        difficulty_level: 'beginner',
        instructions: 'Lie on back, knees bent, lift upper body to knees, lower back down'
      },
      {
        name: 'Running',
        description: 'Cardiovascular endurance training',
        category_id: cardioCategory?.id,
        muscle_groups: ['legs', 'cardio'],
        equipment_needed: ['running_shoes'],
        difficulty_level: 'beginner',
        instructions: 'Maintain good posture, land mid-foot, keep steady pace'
      }
    ];

    for (const exercise of exercises) {
      const { error } = await supabase
        .from('exercises')
        .insert(exercise);
      
      if (error) {
        console.log(`   - ${exercise.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${exercise.name}`);
      }
    }

    // 3. Insert workout plans
    console.log('\n3. Inserting workout plans...');
    
    const plans = [
      {
        title: 'Police Fitness Prep Program',
        description: 'Comprehensive 8-week program designed specifically for police fitness test preparation. Includes strength training, cardio, and police-specific exercises.',
        difficulty_level: 'intermediate',
        duration_weeks: 8,
        focus_areas: ['strength', 'cardio', 'endurance'],
        target_audience: 'police_candidates',
        is_featured: true,
        is_active: true
      },
      {
        title: 'Beginner Fitness Foundation',
        description: 'Perfect for those new to fitness. Builds fundamental strength, cardio, and flexibility in a safe, progressive manner.',
        difficulty_level: 'beginner',
        duration_weeks: 6,
        focus_areas: ['strength', 'cardio', 'flexibility'],
        target_audience: 'general_fitness',
        is_featured: true,
        is_active: true
      },
      {
        title: 'Advanced Strength & Power',
        description: 'High-intensity strength training program for experienced athletes. Focuses on compound movements, progressive overload, and power development.',
        difficulty_level: 'advanced',
        duration_weeks: 12,
        focus_areas: ['strength', 'power', 'endurance'],
        target_audience: 'athletes',
        is_featured: true,
        is_active: true
      }
    ];

    for (const plan of plans) {
      const { error } = await supabase
        .from('workout_plans')
        .insert(plan);
      
      if (error) {
        console.log(`   - ${plan.title}: ${error.message}`);
      } else {
        console.log(`   ✅ ${plan.title}`);
      }
    }

    console.log('\n🎉 Manual seeding completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the admin workout builder interface');
    console.log('   2. Test the user workout dashboard');
    console.log('   3. Create some workouts and exercises');

  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
    process.exit(1);
  }
}

// Run the seeding
manualSeed();







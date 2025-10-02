#!/usr/bin/env node

/**
 * Seed Placeholder PREP Workout Plans
 * 
 * This script helps seed placeholder workout plans for development and testing.
 * Run this script to add placeholder plans to your Supabase database.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const placeholderPlans = [
  // 4-Week Placeholder Plans
  {
    title: 'Beginner 4-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for beginners needing a 4-week crash course. Real content coming soon.',
    difficulty_level: 'beginner',
    duration_weeks: 4,
    focus_areas: ['cardio'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Intermediate 4-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for intermediate athletes needing a 4-week crash course. Real content coming soon.',
    difficulty_level: 'intermediate',
    duration_weeks: 4,
    focus_areas: ['strength'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Advanced 4-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for advanced athletes needing a 4-week crash course. Real content coming soon.',
    difficulty_level: 'advanced',
    duration_weeks: 4,
    focus_areas: ['agility'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },

  // 8-Week Placeholder Plans
  {
    title: 'Beginner 8-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for beginners needing an 8-week standard program. Real content coming soon.',
    difficulty_level: 'beginner',
    duration_weeks: 8,
    focus_areas: ['cardio', 'strength'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Intermediate 8-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for intermediate athletes needing an 8-week standard program. Real content coming soon.',
    difficulty_level: 'intermediate',
    duration_weeks: 8,
    focus_areas: ['cardio', 'agility'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Advanced 8-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for advanced athletes needing an 8-week standard program. Real content coming soon.',
    difficulty_level: 'advanced',
    duration_weeks: 8,
    focus_areas: ['strength', 'agility'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },

  // 12-Week Placeholder Plans
  {
    title: 'Beginner 12-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for beginners needing a 12-week gradual program. Real content coming soon.',
    difficulty_level: 'beginner',
    duration_weeks: 12,
    focus_areas: ['cardio'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Intermediate 12-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for intermediate athletes needing a 12-week gradual program. Real content coming soon.',
    difficulty_level: 'intermediate',
    duration_weeks: 12,
    focus_areas: ['strength'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  },
  {
    title: 'Advanced 12-Week PREP Plan - Placeholder',
    description: 'This is a placeholder plan for advanced athletes needing a 12-week gradual program. Real content coming soon.',
    difficulty_level: 'advanced',
    duration_weeks: 12,
    focus_areas: ['agility'],
    target_audience: 'police_candidates',
    is_featured: true,
    is_active: true
  }
];

async function seedPlaceholderPlans() {
  console.log('🌱 Seeding placeholder PREP workout plans...\n');

  try {
    // Check if placeholder plans already exist
    const { data: existingPlans, error: checkError } = await supabase
      .from('workout_plans')
      .select('title')
      .ilike('title', '%placeholder%')
      .eq('target_audience', 'police_candidates');

    if (checkError) {
      console.error('❌ Error checking existing plans:', checkError);
      return;
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log(`⚠️  Found ${existingPlans.length} existing placeholder plans.`);
      console.log('   Skipping seeding to avoid duplicates.\n');
      console.log('   Existing plans:');
      existingPlans.forEach(plan => console.log(`   - ${plan.title}`));
      return;
    }

    // Insert placeholder plans
    const { data: insertedPlans, error: insertError } = await supabase
      .from('workout_plans')
      .insert(placeholderPlans)
      .select();

    if (insertError) {
      console.error('❌ Error inserting placeholder plans:', insertError);
      return;
    }

    console.log(`✅ Successfully seeded ${insertedPlans.length} placeholder plans:\n`);
    
    insertedPlans.forEach(plan => {
      console.log(`   📋 ${plan.title}`);
      console.log(`      Difficulty: ${plan.difficulty_level}`);
      console.log(`      Duration: ${plan.duration_weeks} weeks`);
      console.log(`      Focus: ${plan.focus_areas.join(', ')}`);
      console.log('');
    });

    console.log('🎉 Placeholder plans are ready for development and testing!');
    console.log('   You can now test the personalized plan recommendation system.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function cleanupPlaceholderPlans() {
  console.log('🧹 Cleaning up placeholder PREP workout plans...\n');

  try {
    const { data: deletedPlans, error: deleteError } = await supabase
      .from('workout_plans')
      .delete()
      .ilike('title', '%placeholder%')
      .eq('target_audience', 'police_candidates')
      .select();

    if (deleteError) {
      console.error('❌ Error deleting placeholder plans:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${deletedPlans.length} placeholder plans:\n`);
    
    deletedPlans.forEach(plan => {
      console.log(`   🗑️  ${plan.title}`);
    });

    console.log('\n🎉 Cleanup complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'seed':
    seedPlaceholderPlans();
    break;
  case 'cleanup':
    cleanupPlaceholderPlans();
    break;
  default:
    console.log('📋 Placeholder PREP Workout Plans Seeder\n');
    console.log('Usage:');
    console.log('  node seed_placeholder_plans.js seed     - Seed placeholder plans');
    console.log('  node seed_placeholder_plans.js cleanup  - Remove placeholder plans');
    console.log('');
    console.log('Make sure to set your Supabase credentials:');
    console.log('  SUPABASE_URL=your-supabase-url');
    console.log('  SUPABASE_ANON_KEY=your-supabase-anon-key');
    break;
}











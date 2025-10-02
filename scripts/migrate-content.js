/**
 * Content Migration Script
 * 
 * This script helps migrate hardcoded content from the app to the dynamic content system.
 * Run this script after setting up the database tables to populate initial content.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Content mapping from hardcoded values to dynamic content keys
const contentMapping = [
  // Dashboard Content
  {
    key: 'dashboard.hero.greeting',
    section: 'dashboard',
    component: 'hero',
    text: 'Hello, {name} 👋',
    description: 'Dashboard hero greeting with user name placeholder'
  },
  {
    key: 'dashboard.hero.subtitle',
    section: 'dashboard',
    component: 'hero',
    text: 'Ready to achieve your police career goals?',
    description: 'Dashboard hero subtitle'
  },
  {
    key: 'dashboard.quick_actions.start_training',
    section: 'dashboard',
    component: 'quick_actions',
    text: 'Start Training',
    description: 'Quick action button text'
  },
  {
    key: 'dashboard.quick_actions.application',
    section: 'dashboard',
    component: 'quick_actions',
    text: 'Application',
    description: 'Quick action button text'
  },
  {
    key: 'dashboard.quick_actions.book_session',
    section: 'dashboard',
    component: 'quick_actions',
    text: 'Book Session',
    description: 'Quick action button text'
  },
  {
    key: 'dashboard.quick_actions.community',
    section: 'dashboard',
    component: 'quick_actions',
    text: 'Community',
    description: 'Quick action button text'
  },
  {
    key: 'dashboard.prerequisites.title',
    section: 'dashboard',
    component: 'prerequisites',
    text: 'Complete Requirements',
    description: 'Prerequisites section title'
  },
  {
    key: 'dashboard.prerequisites.missing_title',
    section: 'dashboard',
    component: 'prerequisites',
    text: 'Missing Requirements',
    description: 'Missing requirements title'
  },
  {
    key: 'dashboard.prerequisites.missing_subtitle',
    section: 'dashboard',
    component: 'prerequisites',
    text: 'Complete these to unlock application steps',
    description: 'Missing requirements subtitle'
  },
  {
    key: 'dashboard.prerequisites.view_more',
    section: 'dashboard',
    component: 'prerequisites',
    text: 'View {count} more requirements',
    description: 'View more requirements text'
  },
  {
    key: 'dashboard.bookings.title',
    section: 'dashboard',
    component: 'bookings',
    text: 'Upcoming Sessions',
    description: 'Bookings section title'
  },
  {
    key: 'dashboard.premium.title',
    section: 'dashboard',
    component: 'premium',
    text: 'Unlock Premium Features',
    description: 'Premium section title'
  },
  {
    key: 'dashboard.premium.subtitle',
    section: 'dashboard',
    component: 'premium',
    text: 'Get unlimited access to all features and accelerate your preparation',
    description: 'Premium section subtitle'
  },
  {
    key: 'dashboard.premium.feature_1',
    section: 'dashboard',
    component: 'premium',
    text: '• Unlimited digital tests with detailed analytics',
    description: 'Premium feature 1'
  },
  {
    key: 'dashboard.premium.feature_2',
    section: 'dashboard',
    component: 'premium',
    text: '• Complete training plans with personalization',
    description: 'Premium feature 2'
  },
  {
    key: 'dashboard.premium.feature_3',
    section: 'dashboard',
    component: 'premium',
    text: '• Interview prep vault with mock sessions',
    description: 'Premium feature 3'
  },
  {
    key: 'dashboard.premium.feature_4',
    section: 'dashboard',
    component: 'premium',
    text: '• Priority booking and subscriber discounts',
    description: 'Premium feature 4'
  },
  {
    key: 'dashboard.premium.upgrade_button',
    section: 'dashboard',
    component: 'premium',
    text: 'Upgrade to Premium',
    description: 'Premium upgrade button text'
  },
  {
    key: 'dashboard.premium.services_button',
    section: 'dashboard',
    component: 'premium',
    text: 'Book Services',
    description: 'Services button text'
  },
  {
    key: 'dashboard.usage.title',
    section: 'dashboard',
    component: 'usage',
    text: 'Digital Tests Remaining',
    description: 'Usage section title'
  },
  {
    key: 'dashboard.usage.take_test',
    section: 'dashboard',
    component: 'usage',
    text: 'Take a Test',
    description: 'Take test button text'
  },
  {
    key: 'dashboard.motivational.title',
    section: 'dashboard',
    component: 'motivational',
    text: 'Start Your Journey',
    description: 'Motivational section title'
  },
  {
    key: 'dashboard.motivational.text',
    section: 'dashboard',
    component: 'motivational',
    text: 'Begin by completing your profile and exploring our fitness training programs.',
    description: 'Motivational text'
  },
  {
    key: 'dashboard.motivational.button',
    section: 'dashboard',
    component: 'motivational',
    text: 'Get Started',
    description: 'Motivational button text'
  },

  // Application Content
  {
    key: 'application.step.prerequisites.title',
    section: 'application',
    component: 'step',
    text: 'Prerequisites',
    description: 'Prerequisites step title'
  },
  {
    key: 'application.step.prerequisites.description',
    section: 'application',
    component: 'step',
    text: 'Essential requirements and qualifications needed before starting your police application journey.',
    description: 'Prerequisites step description'
  },
  {
    key: 'application.step.oacp.title',
    section: 'application',
    component: 'step',
    text: 'OACP Certificate',
    description: 'OACP step title'
  },
  {
    key: 'application.step.oacp.description',
    section: 'application',
    component: 'step',
    text: 'The Ontario Association of Chiefs of Police (OACP) Certificate is a requirement for most police services in Ontario.',
    description: 'OACP step description'
  },
  {
    key: 'application.step.pre_application.title',
    section: 'application',
    component: 'step',
    text: 'Pre-Application Prep',
    description: 'Pre-application step title'
  },
  {
    key: 'application.step.pre_application.description',
    section: 'application',
    component: 'step',
    text: 'Strategic preparation to maximize your chances of success before submitting applications.',
    description: 'Pre-application step description'
  },
  {
    key: 'application.step.application.title',
    section: 'application',
    component: 'step',
    text: 'Application',
    description: 'Application step title'
  },
  {
    key: 'application.step.application.description',
    section: 'application',
    component: 'step',
    text: 'Submit your application to your chosen police service(s) with all required documentation.',
    description: 'Application step description'
  },
  {
    key: 'application.step.prep_fitness.title',
    section: 'application',
    component: 'step',
    text: 'PREP Fitness Test',
    description: 'PREP fitness step title'
  },
  {
    key: 'application.step.prep_fitness.description',
    section: 'application',
    component: 'step',
    text: 'The Physical Readiness Evaluation for Police (PREP) test assesses your physical abilities required for police work.',
    description: 'PREP fitness step description'
  },
  {
    key: 'application.step.lfi.title',
    section: 'application',
    component: 'step',
    text: 'Local Focus Interview (LFI)',
    description: 'LFI step title'
  },
  {
    key: 'application.step.lfi.description',
    section: 'application',
    component: 'step',
    text: 'The Law Enforcement Interview assesses your suitability for police work through structured questioning.',
    description: 'LFI step description'
  },
  {
    key: 'application.step.eci.title',
    section: 'application',
    component: 'step',
    text: 'ECI/Panel Interview',
    description: 'ECI step title'
  },
  {
    key: 'application.step.eci.description',
    section: 'application',
    component: 'step',
    text: 'The Essential Competency Interview (ECI) or panel interview assesses your competencies through structured behavioral questions.',
    description: 'ECI step description'
  },
  {
    key: 'application.step.background.title',
    section: 'application',
    component: 'step',
    text: 'Background Check',
    description: 'Background check step title'
  },
  {
    key: 'application.step.background.description',
    section: 'application',
    component: 'step',
    text: 'A thorough investigation of your background, including criminal history, employment history, and reference checks.',
    description: 'Background check step description'
  },
  {
    key: 'application.step.final.title',
    section: 'application',
    component: 'step',
    text: 'Final Steps',
    description: 'Final steps title'
  },
  {
    key: 'application.step.final.description',
    section: 'application',
    component: 'step',
    text: 'Final review of your application, potential job offer, and preparation for police college.',
    description: 'Final steps description'
  },

  // Fitness Content
  {
    key: 'fitness.training_plan.title',
    section: 'fitness',
    component: 'training_plan',
    text: 'Training Plan',
    description: 'Training plan title'
  },
  {
    key: 'fitness.training_plan.description',
    section: 'fitness',
    component: 'training_plan',
    text: 'Comprehensive training program designed to prepare you for police fitness tests.',
    description: 'Training plan description'
  },
  {
    key: 'fitness.workout.title',
    section: 'fitness',
    component: 'workout',
    text: 'Workout',
    description: 'Workout title'
  },
  {
    key: 'fitness.workout.description',
    section: 'fitness',
    component: 'workout',
    text: 'Structured workout session to improve your fitness levels.',
    description: 'Workout description'
  },

  // Community Content
  {
    key: 'community.welcome.title',
    section: 'community',
    component: 'welcome',
    text: 'Welcome to the Community',
    description: 'Community welcome title'
  },
  {
    key: 'community.welcome.description',
    section: 'community',
    component: 'welcome',
    text: 'Connect with fellow police applicants and share your journey.',
    description: 'Community welcome description'
  },
  {
    key: 'community.post.create',
    section: 'community',
    component: 'post',
    text: 'Create Post',
    description: 'Create post button text'
  },
  {
    key: 'community.post.placeholder',
    section: 'community',
    component: 'post',
    text: 'Share your thoughts, questions, or achievements...',
    description: 'Post placeholder text'
  },

  // UI Elements
  {
    key: 'ui.button.save',
    section: 'ui',
    component: 'button',
    text: 'Save Changes',
    description: 'Save button text'
  },
  {
    key: 'ui.button.cancel',
    section: 'ui',
    component: 'button',
    text: 'Cancel',
    description: 'Cancel button text'
  },
  {
    key: 'ui.button.edit',
    section: 'ui',
    component: 'button',
    text: 'Edit',
    description: 'Edit button text'
  },
  {
    key: 'ui.button.delete',
    section: 'ui',
    component: 'button',
    text: 'Delete',
    description: 'Delete button text'
  },
  {
    key: 'ui.button.view_all',
    section: 'ui',
    component: 'button',
    text: 'View All',
    description: 'View all button text'
  },
  {
    key: 'ui.button.get_started',
    section: 'ui',
    component: 'button',
    text: 'Get Started',
    description: 'Get started button text'
  },
  {
    key: 'ui.button.learn_more',
    section: 'ui',
    component: 'button',
    text: 'Learn More',
    description: 'Learn more button text'
  },
  {
    key: 'ui.loading.text',
    section: 'ui',
    component: 'loading',
    text: 'Loading...',
    description: 'Loading text'
  },
  {
    key: 'ui.error.generic',
    section: 'ui',
    component: 'error',
    text: 'Something went wrong. Please try again.',
    description: 'Generic error message'
  },
  {
    key: 'ui.success.saved',
    section: 'ui',
    component: 'success',
    text: 'Changes saved successfully!',
    description: 'Success message for saved changes'
  },
  {
    key: 'ui.confirm.delete',
    section: 'ui',
    component: 'confirm',
    text: 'Are you sure you want to delete this item?',
    description: 'Delete confirmation message'
  },

  // Modal Content
  {
    key: 'modal.upsell.title',
    section: 'modal',
    component: 'upsell',
    text: 'Upgrade to Premium',
    description: 'Upsell modal title'
  },
  {
    key: 'modal.upsell.description',
    section: 'modal',
    component: 'upsell',
    text: 'Unlock all premium features to accelerate your police preparation journey.',
    description: 'Upsell modal description'
  },
  {
    key: 'modal.waiver.title',
    section: 'modal',
    component: 'waiver',
    text: 'Liability Waiver',
    description: 'Waiver modal title'
  },
  {
    key: 'modal.waiver.description',
    section: 'modal',
    component: 'waiver',
    text: 'Please read and accept the liability waiver to continue.',
    description: 'Waiver modal description'
  },

  // Tooltips
  {
    key: 'tooltip.pin_test',
    section: 'tooltip',
    component: 'pin_test',
    text: 'Take a practice PIN test to assess your current fitness level',
    description: 'PIN test tooltip'
  },
  {
    key: 'tooltip.training_plan',
    section: 'tooltip',
    component: 'training_plan',
    text: 'Access personalized training plans to improve your fitness',
    description: 'Training plan tooltip'
  },
  {
    key: 'tooltip.practice_session',
    section: 'tooltip',
    component: 'practice_session',
    text: 'Book a practice session with certified instructors',
    description: 'Practice session tooltip'
  }
];

async function migrateContent() {
  console.log('🚀 Starting content migration...');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const content of contentMapping) {
    try {
      const { error } = await supabase
        .from('app_content_text')
        .upsert({
          content_key: content.key,
          section: content.section,
          component: content.component,
          current_text: content.text,
          description: content.description
        }, {
          onConflict: 'content_key'
        });

      if (error) {
        console.error(`❌ Error migrating "${content.key}":`, error.message);
        errorCount++;
        errors.push({ key: content.key, error: error.message });
      } else {
        console.log(`✅ Migrated: ${content.key}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception migrating "${content.key}":`, err.message);
      errorCount++;
      errors.push({ key: content.key, error: err.message });
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} items`);
  console.log(`❌ Failed to migrate: ${errorCount} items`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ key, error }) => {
      console.log(`  - ${key}: ${error}`);
    });
  }

  if (successCount > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now use the Content Editor in the admin dashboard.');
  } else {
    console.log('\n💥 Migration failed. Please check your database connection and permissions.');
  }
}

// Run the migration
migrateContent().catch(console.error);

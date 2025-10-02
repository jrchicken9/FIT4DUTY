-- Create app_content_text table for Super User Content Editing System
CREATE TABLE IF NOT EXISTS app_content_text (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key VARCHAR(255) NOT NULL UNIQUE,
  section VARCHAR(100) NOT NULL,
  component VARCHAR(100) NOT NULL,
  current_text TEXT NOT NULL,
  description TEXT,
  last_updated_by UUID REFERENCES auth.users(id),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_content_text_history table for versioning
CREATE TABLE IF NOT EXISTS app_content_text_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES app_content_text(id) ON DELETE CASCADE,
  previous_text TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_content_text_key ON app_content_text(content_key);
CREATE INDEX IF NOT EXISTS idx_app_content_text_section ON app_content_text(section);
CREATE INDEX IF NOT EXISTS idx_app_content_text_history_content_id ON app_content_text_history(content_id);

-- Enable RLS
ALTER TABLE app_content_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_content_text_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_content_text
-- Only super admins can read/write
CREATE POLICY "Super admins can manage app content text" ON app_content_text
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'super_admin' OR profiles.is_admin = true)
    )
  );

-- All authenticated users can read (for app display)
CREATE POLICY "Authenticated users can read app content text" ON app_content_text
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for app_content_text_history
-- Only super admins can read/write history
CREATE POLICY "Super admins can manage app content text history" ON app_content_text_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'super_admin' OR profiles.is_admin = true)
    )
  );

-- Function to automatically create history entry when content is updated
CREATE OR REPLACE FUNCTION create_content_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_text != NEW.current_text THEN
    INSERT INTO app_content_text_history (
      content_id,
      previous_text,
      changed_by,
      change_reason
    ) VALUES (
      OLD.id,
      OLD.current_text,
      NEW.last_updated_by,
      'Content updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create history entries
CREATE TRIGGER app_content_text_history_trigger
  AFTER UPDATE ON app_content_text
  FOR EACH ROW
  EXECUTE FUNCTION create_content_history();

-- Insert initial content data
INSERT INTO app_content_text (content_key, section, component, current_text, description) VALUES
-- Dashboard Section
('dashboard.hero.greeting', 'dashboard', 'hero', 'Hello, {name} 👋', 'Dashboard hero greeting with user name placeholder'),
('dashboard.hero.subtitle', 'dashboard', 'hero', 'Ready to achieve your police career goals?', 'Dashboard hero subtitle'),
('dashboard.quick_actions.start_training', 'dashboard', 'quick_actions', 'Start Training', 'Quick action button text'),
('dashboard.quick_actions.application', 'dashboard', 'quick_actions', 'Application', 'Quick action button text'),
('dashboard.quick_actions.book_session', 'dashboard', 'quick_actions', 'Book Session', 'Quick action button text'),
('dashboard.quick_actions.community', 'dashboard', 'quick_actions', 'Community', 'Quick action button text'),
('dashboard.prerequisites.title', 'dashboard', 'prerequisites', 'Mandatory Requirements', 'Mandatory Requirements section title'),
('dashboard.prerequisites.missing_title', 'dashboard', 'prerequisites', 'Missing Requirements', 'Missing requirements title'),
('dashboard.prerequisites.missing_subtitle', 'dashboard', 'prerequisites', 'Complete these to unlock application steps', 'Missing requirements subtitle'),
('dashboard.prerequisites.view_more', 'dashboard', 'prerequisites', 'View {count} more requirements', 'View more requirements text'),
('dashboard.bookings.title', 'dashboard', 'bookings', 'Upcoming Sessions', 'Bookings section title'),
('dashboard.premium.title', 'dashboard', 'premium', 'Unlock Premium Features', 'Premium section title'),
('dashboard.premium.subtitle', 'dashboard', 'premium', 'Get unlimited access to all features and accelerate your preparation', 'Premium section subtitle'),
('dashboard.premium.feature_1', 'dashboard', 'premium', '• Unlimited digital tests with detailed analytics', 'Premium feature 1'),
('dashboard.premium.feature_2', 'dashboard', 'premium', '• Complete training plans with personalization', 'Premium feature 2'),
('dashboard.premium.feature_3', 'dashboard', 'premium', '• Interview prep vault with mock sessions', 'Premium feature 3'),
('dashboard.premium.feature_4', 'dashboard', 'premium', '• Priority booking and subscriber discounts', 'Premium feature 4'),
('dashboard.premium.upgrade_button', 'dashboard', 'premium', 'Upgrade to Premium', 'Premium upgrade button text'),
('dashboard.premium.services_button', 'dashboard', 'premium', 'Book Services', 'Services button text'),
('dashboard.usage.title', 'dashboard', 'usage', 'Digital Tests Remaining', 'Usage section title'),
('dashboard.usage.take_test', 'dashboard', 'usage', 'Take a Test', 'Take test button text'),
('dashboard.motivational.title', 'dashboard', 'motivational', 'Start Your Journey', 'Motivational section title'),
('dashboard.motivational.text', 'dashboard', 'motivational', 'Begin by completing your profile and exploring our fitness training programs.', 'Motivational text'),
('dashboard.motivational.button', 'dashboard', 'motivational', 'Get Started', 'Motivational button text'),

-- Application Section
('application.step.prerequisites.title', 'application', 'step', 'Mandatory Requirements', 'Mandatory Requirements step title'),
('application.step.prerequisites.description', 'application', 'step', 'Complete checklist of mandatory requirements and health standards needed before starting your police application journey.', 'Mandatory Requirements step description'),
('application.step.oacp.title', 'application', 'step', 'OACP Certificate', 'OACP step title'),
('application.step.oacp.description', 'application', 'step', 'The Ontario Association of Chiefs of Police (OACP) Certificate is a requirement for most police services in Ontario.', 'OACP step description'),
('application.step.pre_application.title', 'application', 'step', 'Pre-Application Prep', 'Pre-application step title'),
('application.step.pre_application.description', 'application', 'step', 'Strategic preparation to maximize your chances of success before submitting applications.', 'Pre-application step description'),
('application.step.application.title', 'application', 'step', 'Application', 'Application step title'),
('application.step.application.description', 'application', 'step', 'Submit your application to your chosen police service(s) with all required documentation.', 'Application step description'),
('application.step.prep_fitness.title', 'application', 'step', 'PREP Fitness Test', 'PREP fitness step title'),
('application.step.prep_fitness.description', 'application', 'step', 'The Physical Readiness Evaluation for Police (PREP) test assesses your physical abilities required for police work.', 'PREP fitness step description'),
('application.step.lfi.title', 'application', 'step', 'Local Focus Interview (LFI)', 'LFI step title'),
('application.step.lfi.description', 'application', 'step', 'The Law Enforcement Interview assesses your suitability for police work through structured questioning.', 'LFI step description'),
('application.step.eci.title', 'application', 'step', 'ECI/Panel Interview', 'ECI step title'),
('application.step.eci.description', 'application', 'step', 'The Essential Competency Interview (ECI) or panel interview assesses your competencies through structured behavioral questions.', 'ECI step description'),
('application.step.background.title', 'application', 'step', 'Background Check', 'Background check step title'),
('application.step.background.description', 'application', 'step', 'A thorough investigation of your background, including criminal history, employment history, and reference checks.', 'Background check step description'),
('application.step.final.title', 'application', 'step', 'Final Steps', 'Final steps title'),
('application.step.final.description', 'application', 'step', 'Final review of your application, potential job offer, and preparation for police college.', 'Final steps description'),

-- Fitness Section
('fitness.training_plan.title', 'fitness', 'training_plan', 'Training Plan', 'Training plan title'),
('fitness.training_plan.description', 'fitness', 'training_plan', 'Comprehensive training program designed to prepare you for police fitness tests.', 'Training plan description'),
('fitness.workout.title', 'fitness', 'workout', 'Workout', 'Workout title'),
('fitness.workout.description', 'fitness', 'workout', 'Structured workout session to improve your fitness levels.', 'Workout description'),

-- Community Section
('community.welcome.title', 'community', 'welcome', 'Welcome to the Community', 'Community welcome title'),
('community.welcome.description', 'community', 'welcome', 'Connect with fellow police applicants and share your journey.', 'Community welcome description'),
('community.post.create', 'community', 'post', 'Create Post', 'Create post button text'),
('community.post.placeholder', 'community', 'post', 'Share your thoughts, questions, or achievements...', 'Post placeholder text'),

-- Common UI Elements
('ui.button.save', 'ui', 'button', 'Save Changes', 'Save button text'),
('ui.button.cancel', 'ui', 'button', 'Cancel', 'Cancel button text'),
('ui.button.edit', 'ui', 'button', 'Edit', 'Edit button text'),
('ui.button.delete', 'ui', 'button', 'Delete', 'Delete button text'),
('ui.button.view_all', 'ui', 'button', 'View All', 'View all button text'),
('ui.button.get_started', 'ui', 'button', 'Get Started', 'Get started button text'),
('ui.button.learn_more', 'ui', 'button', 'Learn More', 'Learn more button text'),
('ui.loading.text', 'ui', 'loading', 'Loading...', 'Loading text'),
('ui.error.generic', 'ui', 'error', 'Something went wrong. Please try again.', 'Generic error message'),
('ui.success.saved', 'ui', 'success', 'Changes saved successfully!', 'Success message for saved changes'),
('ui.confirm.delete', 'ui', 'confirm', 'Are you sure you want to delete this item?', 'Delete confirmation message'),

-- Modal Text
('modal.upsell.title', 'modal', 'upsell', 'Upgrade to Premium', 'Upsell modal title'),
('modal.upsell.description', 'modal', 'upsell', 'Unlock all premium features to accelerate your police preparation journey.', 'Upsell modal description'),
('modal.waiver.title', 'modal', 'waiver', 'Liability Waiver', 'Waiver modal title'),
('modal.waiver.description', 'modal', 'waiver', 'Please read and accept the liability waiver to continue.', 'Waiver modal description'),

-- Tooltips
('tooltip.pin_test', 'tooltip', 'pin_test', 'Take a practice PIN test to assess your current fitness level', 'PIN test tooltip'),
('tooltip.training_plan', 'tooltip', 'training_plan', 'Access personalized training plans to improve your fitness', 'Training plan tooltip'),
('tooltip.practice_session', 'tooltip', 'practice_session', 'Book a practice session with certified instructors', 'Practice session tooltip')
ON CONFLICT (content_key) DO NOTHING;

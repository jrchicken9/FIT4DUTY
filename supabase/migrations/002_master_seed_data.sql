-- =====================================================================
-- MASTER SEED DATA
-- =====================================================================

-- =====================================================================
-- SEED BADGES
-- =====================================================================

INSERT INTO public.badges (slug, title, description, icon_key, rarity, points, is_hidden, is_temporary, criteria, active)
SELECT * FROM (
  VALUES
  ('profile_complete', 'Profile Complete', 'Complete your profile details', 'award', 'common', 10, false, false, '{"type":"event","on":"profile.completed"}'::jsonb, true),
  ('milestone_i', 'Milestone I', 'Complete 3 application steps', 'star', 'common', 20, false, false, '{"type":"threshold","on":"application.step.completed","minSteps":3}'::jsonb, true),
  ('first_booking', 'First Booking', 'Book and get confirmed for a practice session', 'shield', 'rare', 30, false, false, '{"type":"event","on":"booking.confirmed"}'::jsonb, true),
  ('supporter', 'Supporter', 'Activate a monthly subscription', 'crown', 'rare', 50, false, false, '{"type":"purchase","kind":"subscription"}'::jsonb, true)
) AS v(slug,title,description,icon_key,rarity,points,is_hidden,is_temporary,criteria,active)
WHERE NOT EXISTS (SELECT 1 FROM public.badges b WHERE b.slug = v.slug);

-- =====================================================================
-- SEED POLICE SERVICES
-- =====================================================================

INSERT INTO public.police_services (slug, name, city, region, latitude, longitude, website)
SELECT * FROM (
  VALUES
    ('tps','Toronto Police Service','Toronto','GTA',43.6532,-79.3832,'https://www.torontopolice.on.ca/careers/'),
    ('prp','Peel Regional Police','Mississauga/Brampton','GTA',43.5890,-79.6441,'https://www.peelpolice.ca/en/careers/careers.aspx'),
    ('yrp','York Regional Police','Aurora','GTA',44.0065,-79.4504,'https://www.yrp.ca/en/careers-and-opportunities/police-constable.aspx')
) AS s(slug,name,city,region,latitude,longitude,website)
WHERE NOT EXISTS (SELECT 1 FROM public.police_services);

-- =====================================================================
-- SEED EXERCISE LIBRARY
-- =====================================================================

INSERT INTO public.exercise_library (name, category, difficulty_level, description, instructions, muscle_groups, equipment_needed) VALUES
-- Cardio Exercises
('Running', 'cardio', 'beginner', 'Basic running exercise for cardiovascular fitness', 'Start with a warm-up walk, then gradually increase to a jogging pace. Maintain good posture and breathe rhythmically.', ARRAY['legs', 'cardiovascular'], ARRAY['running_shoes']),
('Cycling', 'cardio', 'beginner', 'Low-impact cardiovascular exercise', 'Adjust seat height so your leg is almost fully extended at the bottom of the pedal stroke. Maintain a steady cadence.', ARRAY['legs', 'cardiovascular'], ARRAY['bicycle', 'helmet']),
('Swimming', 'cardio', 'intermediate', 'Full-body cardiovascular workout', 'Focus on proper breathing technique. Start with freestyle stroke and gradually add other strokes.', ARRAY['full_body', 'cardiovascular'], ARRAY['swimming_pool', 'swimsuit']),
('Rowing', 'cardio', 'intermediate', 'Full-body cardio and strength exercise', 'Maintain proper form: straight back, engage core, and use full range of motion.', ARRAY['full_body', 'cardiovascular'], ARRAY['rowing_machine']),

-- Strength Exercises
('Push-ups', 'strength', 'beginner', 'Upper body strength exercise', 'Start in plank position, lower body until chest nearly touches ground, then push back up.', ARRAY['chest', 'shoulders', 'triceps'], ARRAY[]),
('Squats', 'strength', 'beginner', 'Lower body strength exercise', 'Stand with feet shoulder-width apart, lower body as if sitting back into a chair, then return to standing.', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY[]),
('Pull-ups', 'strength', 'intermediate', 'Upper body pulling exercise', 'Hang from bar with hands shoulder-width apart, pull body up until chin clears the bar.', ARRAY['back', 'biceps', 'shoulders'], ARRAY['pull_up_bar']),
('Deadlifts', 'strength', 'advanced', 'Full body compound exercise', 'Stand with feet hip-width apart, bend at hips and knees to lower hands to bar, then stand up straight.', ARRAY['full_body'], ARRAY['barbell', 'weight_plates']),

-- Bodyweight Exercises
('Plank', 'bodyweight', 'beginner', 'Core stability exercise', 'Hold body in straight line from head to heels, engaging core muscles.', ARRAY['core', 'shoulders'], ARRAY[]),
('Burpees', 'bodyweight', 'intermediate', 'Full body conditioning exercise', 'Start standing, drop to push-up position, perform push-up, jump feet forward, then jump up.', ARRAY['full_body'], ARRAY[]),
('Mountain Climbers', 'bodyweight', 'intermediate', 'Dynamic core and cardio exercise', 'Start in plank position, alternate bringing knees toward chest in running motion.', ARRAY['core', 'shoulders', 'cardiovascular'], ARRAY[]),

-- Agility Exercises
('Ladder Drills', 'agility', 'beginner', 'Footwork and coordination training', 'Practice various foot patterns through agility ladder: in-and-out, lateral movement, high knees.', ARRAY['legs', 'coordination'], ARRAY['agility_ladder']),
('Cone Drills', 'agility', 'intermediate', 'Direction change and speed training', 'Set up cones in various patterns and practice quick direction changes while maintaining speed.', ARRAY['legs', 'coordination'], ARRAY['cones']),
('Box Jumps', 'agility', 'intermediate', 'Explosive power and coordination', 'Stand facing box, jump onto box with both feet, then step or jump back down.', ARRAY['legs', 'power'], ARRAY['plyometric_box']),

-- Flexibility Exercises
('Stretching', 'flexibility', 'beginner', 'Basic flexibility and mobility work', 'Hold each stretch for 15-30 seconds, breathe deeply, and don\'t bounce.', ARRAY['full_body'], ARRAY[]),
('Yoga', 'flexibility', 'intermediate', 'Mind-body flexibility and strength', 'Follow guided sequences focusing on breath, alignment, and gradual progression.', ARRAY['full_body'], ARRAY['yoga_mat']),
('Dynamic Stretching', 'flexibility', 'intermediate', 'Movement-based flexibility training', 'Perform controlled movements through full range of motion to prepare for activity.', ARRAY['full_body'], ARRAY[])
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- SEED BENCHMARK CATEGORIES
-- =====================================================================

INSERT INTO public.benchmark_categories AS c (key, name, description)
VALUES
  ('education','Education','Education credentials and relevance'),
  ('work','Work Experience','Employment history and relevance'),
  ('volunteer','Volunteer Experience','Community involvement and impact'),
  ('certs_skills','Certifications & Skills','Safety, de-escalation, languages, driving'),
  ('references','References','Reference availability and quality'),
  ('conduct','Professional Conduct & Driving','Optional soft-gate signals')
ON CONFLICT (key) DO UPDATE SET name = excluded.name, description = excluded.description;

-- =====================================================================
-- SEED BENCHMARK RULES
-- =====================================================================

-- Education
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('education','education.level_postsecondary','Post-secondary credential present (College Diploma or University Degree)', true),
  ('education','education.field_relevant','Field relevance to policing/adjacent', false),
  ('education','education.cont_ed_recent','Continuing education in last 24 months', false),
  ('education','education.transcript_verified','Transcript/diploma uploaded (Verified)', false),
  ('education','education.postgrad_credential','Postgraduate credential (Masters/PhD/Grad Cert)', true),
  ('education','education.canadian_equivalency','Foreign credential assessed as Canadian-equivalent (e.g., WES)', false),
  ('education','education.recency_credential_5y','Highest credential earned within last 5 years', false)
ON CONFLICT DO NOTHING;

-- Work Experience
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('work','work.fulltime_years_2','≥ 2 years full-time employment', true),
  ('work','work.relevant_months_12','≥ 12 months in relevant role', true),
  ('work','work.public_facing','Public-facing/service roles history', false),
  ('work','work.continuity_ok','No >6-month unexplained gap (last 3y)', false),
  ('work','work.leadership','Leadership/supervisory duties', false),
  ('work','work.shift_exposure','Shift work/nights/weekends exposure', false),
  ('work','work.employment_letter_verified','Letter of employment Verified', false),
  ('work','work.frontline_public_safety_12m','12+ months in frontline public-safety adjacent role', true),
  ('work','work.supervisor_reference_present','At least one supervisor reference from current/last 12 months', false),
  ('work','work.incident_reports_monthly_4','≥ 4 incident reports per month on average', false),
  ('work','work.community_interactions_high','High volume public interaction (retail/hospitality/call centre)', false)
ON CONFLICT DO NOTHING;

-- Volunteer
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('volunteer','volunteer.hours_lifetime_150','≥ 150 lifetime hours', true),
  ('volunteer','volunteer.hours_12mo_75','≥ 75 hours in last 12 months', true),
  ('volunteer','volunteer.consistency_6mo','Active ≥ 6 months with same org', false),
  ('volunteer','volunteer.role_type_priority','Role type: youth/seniors/vulnerable/coaching/community_safety', false),
  ('volunteer','volunteer.lead_role','Coordinator/lead role', false),
  ('volunteer','volunteer.reference_verified','Reference/letter Verified', false),
  ('volunteer','volunteer.background_checked_role','Volunteer role requiring VSS/background check', false),
  ('volunteer','volunteer.recency_3mo_24h','≥ 24 hours in last 3 months (recency signal)', false),
  ('volunteer','volunteer.team_lead_hours_20','≥ 20 hours in lead/coordination roles', false)
ON CONFLICT DO NOTHING;

-- Certifications & Skills
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('certs_skills','certs.cpr_c_current','Current First Aid / CPR-C (unexpired)', true),
  ('certs_skills','certs.mhfa','Mental Health First Aid', false),
  ('certs_skills','certs.cpi_nvci','CPI/NVCI (de-escalation)', false),
  ('certs_skills','certs.asist','ASIST or equivalent', false),
  ('certs_skills','skills.language_second','Functional second language', false),
  ('certs_skills','driver.licence_class_g','Driver''s licence G', false),
  ('certs_skills','driver.clean_abstract','Clean driver abstract', false),
  ('certs_skills','fitness.prep_observed_verified','In-person PREP observed results (Verified)', false),
  ('certs_skills','fitness.prep_digital_attempted','Digital PREP/PIN attempted (Unverified)', false),
  ('certs_skills','certs.naloxone_trained','Naloxone/overdose response trained', false),
  ('certs_skills','certs.deescalation_advanced','Advanced de-escalation beyond MHFA/CPI (e.g., ICAT/CIT)', false),
  ('certs_skills','skills.priority_language','Functional proficiency in priority language(s)', false),
  ('certs_skills','driver.first_aid_cpr_expiry_6mo','CPR-C validity ≥ 6 months remaining', false),
  ('certs_skills','fitness.pin_digital_attempts_3','≥ 3 digital PREP/PIN practice attempts', false)
ON CONFLICT DO NOTHING;

-- References
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('references','refs.count_3','3 non-family references identified', true),
  ('references','refs.diverse_contexts','Diversity across contexts (work/volunteer/academic)', false),
  ('references','refs.confirmed_recent','Recently contacted/confirmed (self-declared)', false),
  ('references','refs.letters_verified','Letters uploaded (Verified)', false),
  ('references','refs.supervisor_within_12mo','Supervisor reference within last 12 months', false),
  ('references','refs.no_family','All references are non-family', false),
  ('references','refs.contactable_verified','Reference contact details verified (no bounces)', false)
ON CONFLICT DO NOTHING;

-- Optional Conduct (soft gate)
INSERT INTO public.benchmark_rules (category_key, rule_key, description, is_anchor)
VALUES
  ('conduct','conduct.no_major_issues','No major unresolved legal issues', true),
  ('conduct','conduct.clean_driving_24mo','Clean driving abstract in last 24 months', false),
  ('conduct','conduct.social_media_ack','Social media policy acknowledgment', false),
  ('conduct','conduct.traffic_tickets_24mo_le_2','≤ 2 moving violations in last 24 months', false),
  ('conduct','conduct.no_job_terminations_36mo','No terminations/resignations-in-lieu in last 36 months', false),
  ('conduct','conduct.social_media_audit_ok','Social media review acceptable', false)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SEED BENCHMARK THRESHOLDS
-- =====================================================================

INSERT INTO public.benchmark_thresholds (category_key, thresholds)
VALUES
  ('work', jsonb_build_object('fulltime_years_min', 2, 'relevant_months_min', 12)),
  ('volunteer', jsonb_build_object('hours_lifetime_min', 150, 'hours_12mo_min', 75)),
  ('education', jsonb_build_object('anchor_levels', jsonb_build_array('College Diploma','University Degree','Postgrad')))
ON CONFLICT (category_key) DO NOTHING;

-- =====================================================================
-- SEED COMPETITIVENESS BENCHMARKS CONTENT
-- =====================================================================

INSERT INTO public.app_content_text (content_key, section, component, current_text, description)
SELECT 'application.competitiveness.benchmarks', 'application', 'competitiveness',
$$
{
  "competitivenessBenchmarks": {
    "education": {
      "minimum": "High School Diploma",
      "competitive": "2-4 years Post-Secondary (College Diploma or University Degree)",
      "weight": 30
    },
    "work_experience": {
      "minimum_years": 2,
      "competitive_range": "2-5 years stable full-time employment",
      "preferred_fields": ["Public Safety", "Customer Service", "Security", "Corrections", "Leadership"],
      "weight": 25
    },
    "volunteer_experience": {
      "minimum_hours": 100,
      "competitive_hours": "150-300+ hours",
      "notes": "Consistent long-term volunteering is valued",
      "weight": 20
    },
    "certifications": {
      "required": ["First Aid/CPR-C"],
      "competitive_plus": ["Mental Health First Aid", "Crisis Intervention", "De-escalation", "Second Language"],
      "weight": 15
    },
    "references": {
      "required_count": 3,
      "rules": "Non-family, preferably supervisors/teachers/volunteer coordinators",
      "weight": 10
    }
  }
}
$$,
  'Benchmarks for competitiveness analysis'
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_content_text WHERE content_key = 'application.competitiveness.benchmarks'
);

-- =====================================================================
-- SEED APP CONTENT TEXT
-- =====================================================================

INSERT INTO public.app_content_text (content_key, section, component, current_text, description) VALUES
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

-- =====================================================================
-- SEED TEST VERSIONS AND QUESTIONS
-- =====================================================================

-- Create test version for OACP
INSERT INTO public.test_versions (step_id, title, published_at, is_active)
SELECT 'oacp', 'OACP Written Test v1.0', now(), true
WHERE NOT EXISTS (SELECT 1 FROM public.test_versions WHERE step_id = 'oacp' AND is_active);

-- Seed OACP questions
DO $$
DECLARE
  ver_id uuid;
BEGIN
  -- Find latest active version for OACP
  SELECT id INTO ver_id
  FROM public.test_versions
  WHERE step_id = 'oacp'
    AND is_active
    AND published_at <= now()
  ORDER BY published_at DESC
  LIMIT 1;
  
  IF ver_id IS NULL THEN
    RAISE EXCEPTION 'No active test_versions row found for step oacp';
  END IF;

  -- Replace OACP test questions with authored content
  DELETE FROM public.test_questions WHERE version_id = ver_id;

  INSERT INTO public.test_questions (version_id, order_index, prompt, choices, correct_index) VALUES
  -- Language Questions
  (ver_id, 1, 'Choose the sentence that is grammatically correct.', 
   '["Each officer and every witness was interviewed.", "Each officer and every witness were interviewed.", "Each officer along with every witness were interviewed.", "Each officer with every witness have been interviewed."]', 0),
  (ver_id, 2, 'Select the correctly spelled word.', 
   '["Occurrence", "Occurance", "Occurence", "Ocurrence"]', 0),
  (ver_id, 3, 'Which sentence is most concise and formal for a police report?', 
   '["The suspect fled on foot northbound on King Street.", "The suspect took off running going north on King Street.", "The suspect started to flee and then ran north bound on King Street.", "The suspect, at that time, fled quickly in a northerly direction on King Street."]', 0),
  (ver_id, 4, 'Choose the sentence with correct punctuation.', 
   '["The witness stated, \"I saw the blue car stop suddenly.\"", "The witness stated \"I saw the blue car stop suddenly\".", "The witness stated, I saw the blue car stop suddenly.", "The witness stated I saw the blue car stop suddenly."]', 0),
  (ver_id, 5, 'Choose the correct word: The weather had a significant ____ on visibility.', 
   '["effect", "affect", "effects", "affects"]', 0),
  
  -- Reasoning Questions
  (ver_id, 6, 'All recruits must pass the written test. Taylor is a recruit. What must be true?', 
   '["Taylor must pass the written test.", "Taylor already passed the fitness test.", "Taylor will fail the written test.", "Taylor is not required to take the test."]', 0),
  (ver_id, 7, 'Complete the analogy: Evidence is to Investigation as Symptom is to _____.', 
   '["Diagnosis", "Operation", "Prescription", "Surgery"]', 0),
  (ver_id, 8, 'Which number completes the sequence: 3, 6, 9, 12, __?', 
   '["15", "18", "20", "21"]', 0),
  (ver_id, 9, 'If some officers are certified first-aiders and all first-aiders carry kits, which must be true?', 
   '["Some officers carry kits.", "All officers carry kits.", "No officers carry kits.", "Only sergeants carry kits."]', 0),
  (ver_id, 10, 'A call starts at 18:40 and ends 35 minutes later. What is the end time?', 
   '["19:15", "19:05", "19:10", "19:25"]', 0),
  
  -- Math Questions
  (ver_id, 11, 'An item costs $64. HST is 13%. What is the total price?', 
   '["$72.32", "$70.00", "$71.20", "$73.92"]', 0),
  (ver_id, 12, 'A vehicle travels 180 km in 3 hours. What is the average speed?', 
   '["60 km/h", "65 km/h", "75 km/h", "90 km/h"]', 0),
  (ver_id, 13, 'What is 15% of 240?', 
   '["36", "30", "32", "28"]', 0),
  (ver_id, 14, 'Solve for x: 4x − 12 = 20.', 
   '["8", "6", "10", "4"]', 0),
  (ver_id, 15, 'A radio costs $120 but is discounted by 25%. What is the sale price before tax?', 
   '["$90", "$95", "$85", "$100"]', 0);

END $$;

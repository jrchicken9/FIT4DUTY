# Master Database Schema

This directory contains a consolidated master schema for the Police Application App that replaces all the individual migration files.

## Files Overview

### 1. `000_master_schema.sql`
Contains all the core database structure:
- **Tables**: All application tables (profiles, application_profile, badges, tests, competitiveness, etc.)
- **Indexes**: Performance optimization indexes
- **Constraints**: Data integrity constraints
- **Row Level Security (RLS)**: Security policies for all tables

### 2. `001_master_functions_views.sql`
Contains all database logic:
- **Functions**: Competitiveness evaluation, rollup functions, triggers
- **Views**: User profile attributes, resume profile, competitiveness details
- **Triggers**: Automatic cache updates, content history tracking

### 3. `002_master_seed_data.sql`
Contains all initial data:
- **Badges**: Achievement system badges
- **Police Services**: Ontario police service data
- **Benchmark Categories & Rules**: Competitiveness evaluation framework
- **Content Text**: UI text content for the app
- **Test Questions**: OACP practice questions

## Migration Strategy

### For New Deployments
1. Run the files in order: `000_master_schema.sql`, `001_master_functions_views.sql`, `002_master_seed_data.sql`
2. This creates a complete database from scratch

### For Existing Deployments
1. **Backup your database first**
2. The files use `CREATE TABLE IF NOT EXISTS` and `INSERT ... ON CONFLICT DO NOTHING` so they're safe to run on existing databases
3. Run the files in order to add any missing structure or data

## Key Features

### Complete Application Profile System
- Comprehensive user profile data
- Education, work, volunteer, certifications tracking
- Fitness test results and PIN test data
- Mandatory requirements checklist

### Competitiveness Evaluation Engine
- Automated tier calculation (Exceptional, Competitive, Developing, Needs Improvement)
- Real-time cache updates via triggers
- Detailed benchmark rules and categories
- Verified vs unverified data tracking

### Badge Achievement System
- Gamification with points and rarity levels
- Event-driven badge issuance
- Temporary and hidden badges support

### Test Management System
- Version-controlled test questions
- Session tracking and integrity monitoring
- Comprehensive attempt history

### Content Management
- Dynamic UI text management
- Version history tracking
- Super admin editing capabilities

### Security & Performance
- Row Level Security on all tables
- Optimized indexes for common queries
- Proper foreign key constraints
- Audit trails for sensitive operations

## Database Tables Summary

### Core User Data
- `profiles` - Extended user profiles
- `application_progress` - Step-by-step progress tracking
- `application_profile` - Detailed competitiveness data

### Achievement System
- `badges` - Available badges
- `user_badges` - User badge assignments
- `badge_events` - Badge event tracking

### Testing System
- `test_versions` - Test version management
- `test_questions` - Question bank
- `test_attempts` - User test results
- `test_sessions` - Test session tracking
- `test_events` - Detailed session events

### Competitiveness System
- `police_services` - Ontario police services
- `benchmark_categories` - Evaluation categories
- `benchmark_rules` - Specific evaluation rules
- `benchmark_thresholds` - Numeric thresholds
- `user_competitiveness_cache` - Cached evaluation results

### Fitness & Testing
- `pin_test_results` - PIN test performance data
- `fitness_tests` - General fitness test results

### Booking System
- `bookings` - Session bookings with waiver data

### Content Management
- `app_content_text` - Dynamic UI content
- `app_content_text_history` - Content change history

## Views Available

- `user_profile_attributes_v` - JSON-formatted user attributes for competitiveness evaluation
- `resume_profile_v` - Resume data for AI generation
- `competitiveness_details` - Detailed competitiveness information
- `mandatory_requirements_summary` - Requirements completion tracking

## Functions Available

- `evaluate_competitiveness()` - Main competitiveness evaluation
- `refresh_user_competitiveness_cache()` - Cache refresh
- `rollup_application_profile()` - Data aggregation
- `compute_tier()` - Tier calculation helper

## Cleanup Instructions

After successfully migrating to the master schema:

1. **Verify the migration worked correctly** by checking that all tables, functions, and data are present
2. **Test the application** to ensure all features work as expected
3. **Delete the old migration files** from the `migrations` directory:
   - `20250815_create_badges_tables.sql`
   - `20250816_create_step_tests.sql`
   - `20250816_seed_*.sql` files
   - `20250817_*.sql` files
   - `20250818_*.sql` files
   - `20250819_*.sql` files
   - `20250820_*.sql` files
   - `20250101_*.sql` files
   - `20250102_*.sql` files
   - `20250103_*.sql` files
   - `create_app_content_text_table.sql`

## Benefits of Master Schema

1. **Single Source of Truth**: All database structure in one place
2. **Easier Maintenance**: No need to track multiple migration files
3. **Better Documentation**: Clear structure and relationships
4. **Faster Deployment**: Single execution instead of multiple migrations
5. **Consistency**: Ensures all environments have identical structure

## Notes

- All tables use `IF NOT EXISTS` clauses for safe re-execution
- All inserts use `ON CONFLICT DO NOTHING` for idempotent operation
- RLS policies are comprehensive and secure
- Indexes are optimized for common query patterns
- Functions include proper error handling and security contexts












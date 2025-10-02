# Personalized PREP Workout Plans Implementation

## Overview

This implementation adds a comprehensive personalized PREP workout plan system to the Fitness tab. Users can now get workout plans tailored to their fitness level, readiness deadline, and focus areas.

## Features Implemented

### 1. Database Schema
- **Migration File**: `supabase/migrations/20250106_add_prep_workout_plans.sql`
- **36 PREP Workout Plans** with different combinations of:
  - **Fitness Levels**: beginner, intermediate, advanced
  - **Durations**: 4 weeks (crash), 8 weeks (standard), 12 weeks (gradual)
  - **Focus Areas**: cardio, strength, agility (single and dual focus)

### 2. Backend Services
- **New Functions in `lib/workoutService.ts`**:
  - `getPersonalizedPrepPlan()` - Matches user parameters to best plan
  - `getPrepWorkoutPlans()` - Gets all PREP plans
  - `getPrepWorkoutPlansByDifficulty()` - Filter by difficulty
  - `getPrepWorkoutPlansByDuration()` - Filter by duration
  - `getPrepWorkoutPlansByFocusArea()` - Filter by focus area

### 3. Frontend Components

#### PersonalizedPrepPlanModal (`components/PersonalizedPrepPlanModal.tsx`)
- **4-Step Wizard**:
  1. **Fitness Level Selection**: beginner, intermediate, advanced
  2. **Readiness Deadline**: 4 weeks, 6-8 weeks, 12+ weeks
  3. **Focus Areas**: Select 1-2 areas (cardio, strength, agility)
  4. **Plan Recommendation**: Shows personalized plan with details

#### Updated Fitness Tab (`app/(tabs)/fitness.tsx`)
- **Personalized Plan Widget**: Prominent call-to-action for getting personalized plans
- **Integration**: Loads real PREP plans from database
- **Modal Integration**: Seamless workflow for plan selection

#### Updated Workout Plans Screen (`app/workout-plans.tsx`)
- **Complete Redesign**: Modern UI with filtering capabilities
- **Filter Options**: By difficulty, duration, and focus area
- **Personalized Plan Card**: Prominent placement for getting custom plans
- **Real Data**: Displays actual PREP plans from database

#### Updated UserWorkoutDashboard (`components/UserWorkoutDashboard.tsx`)
- **Personalized Plan Section**: Dedicated area for getting custom plans
- **PREP Plans Integration**: Shows actual PREP workout plans
- **Enhanced UX**: Better visual hierarchy and call-to-actions

## Plan Matching Logic

### Duration Calculation
- **4 weeks or less**: Crash plan (intensive training)
- **6-8 weeks**: Standard plan (balanced approach)
- **12+ weeks**: Gradual plan (sustainable progress)

### Focus Area Matching
- **Exact Match**: Finds plan with exact focus areas
- **Partial Match**: Falls back to plan with at least one matching area
- **Default**: Takes first available plan if no matches

### Plan Categories
1. **Single Focus Plans**: cardio, strength, or agility only
2. **Dual Focus Plans**: cardio+strength, cardio+agility, strength+agility
3. **All Difficulty Levels**: beginner, intermediate, advanced
4. **All Durations**: 4, 8, and 12 weeks

## Database Structure

### Workout Plans Table
```sql
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER NOT NULL,
  focus_areas TEXT[], -- ['strength', 'cardio', 'agility']
  target_audience TEXT, -- 'police_candidates'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Sample Plan Data
```json
{
  "title": "8-Week Beginner PREP Plan (Cardio Focus)",
  "description": "Balanced 8-week program for beginners with cardio focus. Progressive training to build shuttle run endurance and overall fitness.",
  "difficulty_level": "beginner",
  "duration_weeks": 8,
  "focus_areas": ["cardio"],
  "target_audience": "police_candidates",
  "is_featured": true,
  "is_active": true
}
```

## Setup Instructions

### 1. Run Database Migration
```bash
# Navigate to project directory
cd /path/to/your/project

# Run the migration (if Supabase CLI is configured)
npx supabase db push

# Or manually execute the SQL in your Supabase dashboard:
# Copy contents of supabase/migrations/20250106_add_prep_workout_plans.sql
```

### 2. Seed Placeholder Plans (Development)
```bash
# Option A: Use the seeding script
node scripts/seed_placeholder_plans.js seed

# Option B: The migration already includes placeholder plans
# No additional action needed if you ran the migration
```

### 3. Verify Implementation
- Check that PREP workout plans are loaded in the Fitness tab
- Test the personalized plan modal workflow
- Verify filtering works in the Workout Plans screen
- Confirm placeholder indicators are displayed correctly

## User Experience Flow

### Getting a Personalized Plan
1. **User clicks "Premium Plans" tab** - Opens personalization modal
2. **Progress is automatically loaded** if user has saved progress from previous session
3. **Step 1**: Select fitness level (beginner/intermediate/advanced)
4. **Step 2**: Choose readiness deadline (4/8/12 weeks)
5. **Step 3**: Select focus areas (1-2 areas)
6. **Step 4**: View recommended plan with details
7. **User clicks "Start This Plan"** to begin
8. **Progress is auto-saved** throughout the process
9. **User can resume** from where they left off if interrupted

### Browsing All Plans
1. **User navigates to Workout Plans screen**
2. **Apply filters** by difficulty, duration, or focus area
3. **View plan details** and descriptions
4. **Select plan** to start training

## Placeholder Plan System

### Development Support
The system includes a comprehensive placeholder plan system for development and testing:

#### Placeholder Plans Included
- **9 placeholder plans** covering all combinations:
  - 4-week crash plans (beginner, intermediate, advanced)
  - 8-week standard plans (beginner, intermediate, advanced)
  - 12-week gradual plans (beginner, intermediate, advanced)

#### Placeholder Detection
- **Automatic detection** of placeholder plans via title pattern
- **Visual indicators** throughout the UI
- **Graceful handling** of missing real content

#### UI Indicators
- **"Coming Soon" badges** on placeholder plans
- **Warning notices** explaining placeholder status
- **Disabled buttons** for placeholder plans
- **Different icons** (clock vs star) for placeholders

#### Seeding Script
```bash
# Seed placeholder plans
node scripts/seed_placeholder_plans.js seed

# Clean up placeholder plans
node scripts/seed_placeholder_plans.js cleanup
```

### Error Handling
- **Graceful fallbacks** when no plans match user criteria
- **Informative messages** explaining why no plan was found
- **Placeholder alerts** when showing placeholder content
- **Loading states** for better UX

## Progress Saving System

### Auto-Save Functionality
The system automatically saves user progress as they complete the personalization questionnaire:

#### Features
- **Auto-save on every step** - Progress is saved automatically
- **24-hour expiration** - Saved progress expires after 24 hours
- **Resume capability** - Users can continue from where they left off
- **Clear progress option** - Users can start fresh anytime

#### User Experience
- **Loading indicator** when restoring saved progress
- **Resume prompt** showing "Resuming from where you left off"
- **Start over button** to clear saved progress
- **Automatic cleanup** when personalization is completed

#### Technical Implementation
```typescript
// Save progress automatically
const saveProgress = async () => {
  const progress = {
    step,
    fitnessLevel,
    readinessDeadline: readinessDeadline?.toISOString(),
    selectedFocusAreas,
    timestamp: new Date().toISOString(),
  };
  await AsyncStorage.setItem('personalization_progress', JSON.stringify(progress));
};

// Load progress on modal open
const loadProgress = async () => {
  const savedProgress = await AsyncStorage.getItem('personalization_progress');
  // Validate timestamp and restore if valid
};
```

## Technical Implementation Details

### Enhanced Plan Matching Algorithm
```typescript
async getPersonalizedPrepPlan(params: {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  readinessDeadline: Date;
  focusAreas: ('cardio' | 'strength' | 'agility')[];
}): Promise<{ 
  plan: WorkoutPlan | null; 
  isPlaceholder: boolean; 
  message?: string 
}>
```

### UI Components
- **Modern iOS-style modals** with step indicators
- **Gradient backgrounds** for visual appeal
- **Responsive design** that works on all screen sizes
- **Accessibility features** for inclusive design

### Error Handling
- **Graceful fallbacks** when no matching plans found
- **Loading states** for better UX
- **Error messages** for debugging

## Future Enhancements

### Admin Workout Builder Integration
The system is designed to integrate seamlessly with the existing admin workout builder:

#### Current Admin Support
- **Existing workout-builder.tsx** remains the single source of truth
- **Schema compatibility** with current admin workflows
- **No overlapping structures** - extends existing functionality

#### Future Admin Features
1. **PREP Plan Templates**: Admin can create PREP-specific templates
2. **Bulk Plan Creation**: Generate multiple plans from templates
3. **Plan Validation**: Ensure plans meet PREP requirements
4. **Content Management**: Rich text editor for plan descriptions
5. **Plan Publishing**: Draft/publish workflow for plans

### User Experience Enhancements
1. **User Progress Tracking**: Track completion of personalized plans
2. **Plan Modifications**: Allow users to adjust plans after starting
3. **Coach Integration**: Connect users with coaches for personalized plans
4. **Progress Analytics**: Show improvement over time
5. **Social Features**: Share progress with other users

### Database Optimizations
1. **Caching**: Cache frequently accessed plans
2. **Indexing**: Optimize queries for plan matching
3. **Analytics**: Track which plans are most popular
4. **Content Versioning**: Track changes to workout plans

## Testing

### Manual Testing Checklist
- [ ] Personalized plan modal opens correctly
- [ ] All steps in the wizard work properly
- [ ] Plan matching returns appropriate results
- [ ] Filtering works in workout plans screen
- [ ] Navigation between screens is smooth
- [ ] Error states are handled gracefully

### Automated Testing (Future)
- Unit tests for plan matching logic
- Integration tests for database queries
- E2E tests for user workflows

## Performance Considerations

### Database Queries
- **Indexed queries** for efficient plan matching
- **Optimized filters** for browsing plans
- **Connection pooling** for better performance

### Frontend Optimization
- **Lazy loading** for plan details
- **Caching** of frequently accessed data
- **Optimized re-renders** for smooth UX

## Security

### Data Protection
- **Row Level Security** on workout plans
- **User authentication** required for personalized features
- **Input validation** on all user inputs

### Privacy
- **User data** is not shared without consent
- **Plan preferences** are stored securely
- **Analytics** are anonymized

## Support

For issues or questions about the personalized PREP workout plan system:
1. Check the database migration was applied correctly
2. Verify all components are properly imported
3. Test the plan matching logic with different parameters
4. Review the console for any error messages

## Conclusion

This implementation provides a comprehensive, user-friendly system for personalized PREP workout plans. The modular design allows for easy expansion and maintenance, while the modern UI ensures a great user experience.

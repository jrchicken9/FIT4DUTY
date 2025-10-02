# Certified Preparation Progress (CPP) System

## Overview

The Certified Preparation Progress (CPP) system is the core pathway to successful hiring with the user's desired police service. It provides a visual and tracked progress system showing completion of all key steps from profile creation through training, testing, and application readiness.

## Key Features

### 🎯 **Weighted Progress Tracking**
- **Verified Completions**: Higher weight (2.0x multiplier) for observed/confirmed completions
- **Unverified Completions**: Standard weight (1.0x multiplier) for self-reported completions
- **Progress Cap**: Cannot reach 100% without sufficient verified completions (minimum 3 required)

### 🔐 **Subscription-Based Verification**
- **Free Users**: Can only earn unverified completions
- **Premium Users**: Monthly verification allowance (3 per month) + ability to purchase more
- **Future**: Occasional lotteries/events for free users to try verified features

### 📊 **Real-Time Progress Updates**
- Progress updates across all tabs (Application, Fitness, Profile)
- Visual progress indicators with color-coded status
- Category-based progress tracking

## CPP Steps

### Profile Steps (Lower Weight)
- **Profile Completion** (5 pts) - Fill out all required profile fields
- **Email Confirmation** (3 pts) - Verify email address
- **Police Service Selection** (5 pts) - Select target police services
- **Document Verification** (8 pts) - Upload required documents (requires verification)

### Application Steps (Medium Weight)
- **Prerequisites Review** (10 pts) - Review basic requirements (requires verification)
- **OACP Preparation** (15 pts) - Complete OACP certificate preparation (requires verification)
- **Interview Prep Test** (12 pts) - AI-monitored interview preparation (requires verification)
- **Official Test Prep** (15 pts) - Prepare for official police service tests (requires verification)

### Fitness Steps (Higher Weight)
- **Fitness Assessment** (20 pts) - Initial fitness assessment (requires verification)
- **PREP Test Practice** (25 pts) - Practice PREP test components (requires verification)
- **Training Plan** (15 pts) - Complete fitness training plan
- **Progress Assessment** (18 pts) - Measure fitness improvements (requires verification)

## Architecture

### Core Files

#### Types (`types/cpp.ts`)
```typescript
export type CPPVerificationType = 
  | 'in_person_prep_test'
  | 'in_person_pin_test'
  | 'ai_monitored_test'
  | 'human_verified_test'
  | 'profile_completion'
  | 'email_confirmation'
  | 'document_verification'
  | 'police_service_selection'
  | 'interview_prep_test'
  | 'official_test_prep';

export type CPPCompletionStatus = 'verified' | 'unverified' | 'in_progress' | 'not_started';
```

#### Constants (`constants/cpp.ts`)
- **CPP_STEPS**: Complete step definitions with weights, requirements, and metadata
- **CPP_WEIGHTS**: Progress calculation rules and multipliers
- **VERIFICATION_ALLOWANCE**: Subscription-based verification limits
- **CPP_UPSELL_TRIGGERS**: Dynamic upsell messages based on progress

#### Context (`context/CPPContext.tsx`)
- **State Management**: Progress tracking, verification allowances, completions
- **Persistence**: AsyncStorage for local data persistence
- **Calculations**: Weighted progress calculation with verification rules
- **Integration**: Subscription and auth context integration

### UI Components

#### CPPProgressWidget (`components/CPPProgressWidget.tsx`)
- **Full View**: Circular progress indicator with detailed stats
- **Compact View**: Linear progress bar for profile integration
- **Dynamic Colors**: Color-coded based on progress percentage
- **Upsell Integration**: Shows relevant upsell triggers

#### CPPStepCard (`components/CPPStepCard.tsx`)
- **Step Display**: Individual CPP step with status, weight, and actions
- **Action Buttons**: Mark verified/unverified, start step
- **Premium Gating**: Shows upgrade prompts for premium-required steps
- **Navigation**: Routes to appropriate pages based on step type

### Pages

#### Main CPP Page (`app/cpp.tsx`)
- **Progress Overview**: Main CPP progress widget
- **Category Filtering**: Filter steps by category (profile, application, fitness)
- **Sorting Options**: Sort by weight, category, status, or name
- **Upsell Triggers**: Dynamic upsell cards based on progress
- **Quick Actions**: Direct navigation to key features

#### Police Service Selection (`app/application/police-service-selection.tsx`)
- **Service Selection**: Multi-select police services
- **Search & Filter**: Find services by name, location, or category
- **Requirements Display**: Show requirements for each service
- **CPP Integration**: Marks police_service_selection step as completed

## Integration Points

### Profile Tab Integration
- **CPP Progress Bar**: Replaces profile completion with CPP percentage
- **CPP Widget**: Compact progress widget linking to main CPP page
- **Stats Card**: Shows verified/unverified completions

### Application Tab Integration
- **AI-Monitored Tests**: New test types for verified completions
- **Step Completion**: Automatic CPP step marking upon completion
- **Progress Updates**: Real-time CPP progress updates

### Fitness Tab Integration
- **Existing Verification**: Leverages existing in-person test verification
- **Progress Tracking**: Fitness completions contribute to CPP
- **Session Booking**: Links to practice session booking for verification

## Configuration

### Verification Allowance
```typescript
export const VERIFICATION_ALLOWANCE = {
  free: {
    monthlyLimit: 0,
    canPurchaseMore: false,
    additionalPurchasePrice: 0,
  },
  premium: {
    monthlyLimit: 3,
    canPurchaseMore: true,
    additionalPurchasePrice: 19.99,
  },
} as const;
```

### Progress Weights
```typescript
export const CPP_WEIGHTS = {
  VERIFIED_MULTIPLIER: 2.0,
  UNVERIFIED_MULTIPLIER: 1.0,
  MAX_PERCENTAGE_WITHOUT_VERIFIED: 70,
  MIN_VERIFIED_FOR_100_PERCENT: 3,
} as const;
```

## Usage Examples

### Marking a Step as Verified
```typescript
const { markCompletion } = useCPP();

// Mark a step as verified (requires verification allowance)
await markCompletion('fitness_assessment', 'verified', {
  instructor: 'John Doe',
  location: 'Toronto Fitness Center',
  score: 85,
});
```

### Getting Progress Information
```typescript
const { progress, getCategoryProgress } = useCPP();

// Overall progress
console.log(`CPP Progress: ${progress.percentage}%`);

// Category-specific progress
const fitnessProgress = getCategoryProgress('fitness');
console.log(`Fitness: ${fitnessProgress.completed}/${fitnessProgress.total}`);
```

### Checking Verification Allowance
```typescript
const { verificationAllowance } = useCPP();

if (verificationAllowance.remainingThisMonth > 0) {
  // Can mark steps as verified
} else {
  // Need to upgrade or wait for next month
}
```

## Future Enhancements

### Planned Features
1. **AI-Monitored Tests**: Implementation of AI-monitored interview prep tests
2. **Human Review System**: Backend system for human verification of AI-monitored tests
3. **Advanced Analytics**: Detailed progress analytics and insights
4. **Gamification**: Achievement badges and milestones
5. **Social Features**: Progress sharing and community challenges

### Monetization Opportunities
1. **Additional Verifications**: Pay-per-verification for premium users
2. **Premium Features**: Advanced analytics and personalized recommendations
3. **Exclusive Content**: Premium-only preparation materials
4. **Priority Support**: Premium user support and guidance

## Testing

### Unit Tests
- Progress calculation accuracy
- Verification allowance management
- Step completion logic
- Upsell trigger conditions

### Integration Tests
- Context integration with auth and subscription
- Navigation between CPP and other tabs
- Data persistence and loading
- Real-time progress updates

## Performance Considerations

### Optimization
- **Lazy Loading**: Load step details on demand
- **Caching**: Cache progress calculations
- **Debouncing**: Debounce progress updates
- **Virtualization**: Virtual scrolling for large step lists

### Memory Management
- **Cleanup**: Proper cleanup of animations and listeners
- **Storage**: Efficient AsyncStorage usage
- **State**: Minimal state updates to prevent re-renders

## Security

### Data Protection
- **Local Storage**: Sensitive data stored locally only
- **Validation**: Input validation for all user actions
- **Authorization**: Proper subscription tier checks
- **Audit Trail**: Track verification actions for accountability

## Support

### Troubleshooting
1. **Progress Not Updating**: Check context provider wrapping
2. **Verification Issues**: Verify subscription status and allowance
3. **Navigation Errors**: Ensure routes are properly configured
4. **Data Persistence**: Check AsyncStorage permissions

### Common Issues
- **TypeScript Errors**: Ensure all types are properly imported
- **Context Errors**: Verify provider hierarchy in layout
- **Styling Issues**: Check design system constants
- **Performance**: Monitor for unnecessary re-renders

---

This CPP system provides a comprehensive, flexible, and monetizable progress tracking solution that encourages user engagement while driving subscription upgrades through strategic verification gating.


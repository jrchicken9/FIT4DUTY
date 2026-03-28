export type SubscriptionTier = 'free' | 'premium';

export type OneTimeService = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'practice-test' | 'document-review' | 'mock-interview' | 'workshop';
  duration?: number; // in minutes
  location?: string;
  maxParticipants?: number;
};

export type FeatureAccess = {
  digitalTests: {
    monthlyLimit: number;
    detailedAnalytics: boolean;
    performanceTracking: boolean;
  };
  trainingPlans: {
    unlockedWeeks: number;
    personalizedPlans: boolean;
  };
  interviewPrep: {
    sampleQuestions: boolean;
    mockInterviews: boolean;
    bestPracticeGuides: boolean;
  };
  community: {
    canPost: boolean;
    canComment: boolean;
    instructorAccess: boolean;
  };
  booking: {
    priorityBooking: boolean;
    subscriberDiscounts: boolean;
  };
  progressTracking: {
    passProbabilityTracker: boolean;
    detailedProgress: boolean;
  };
};

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    billingPeriod: null,
    features: {
      digitalTests: {
        monthlyLimit: 2,
        detailedAnalytics: false,
        performanceTracking: false,
      },
      trainingPlans: {
        unlockedWeeks: 2,
        personalizedPlans: false,
      },
      interviewPrep: {
        sampleQuestions: false,
        mockInterviews: false,
        bestPracticeGuides: false,
      },
      community: {
        canPost: false,
        canComment: false,
        instructorAccess: false,
      },
      booking: {
        priorityBooking: false,
        subscriberDiscounts: false,
      },
      progressTracking: {
        passProbabilityTracker: false,
        detailedProgress: false,
      },
    },
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    billingPeriod: 'month',
    features: {
      digitalTests: {
        monthlyLimit: -1, // unlimited
        detailedAnalytics: true,
        performanceTracking: true,
      },
      trainingPlans: {
        unlockedWeeks: -1, // unlimited
        personalizedPlans: true,
      },
      interviewPrep: {
        sampleQuestions: true,
        mockInterviews: true,
        bestPracticeGuides: true,
      },
      community: {
        canPost: true,
        canComment: true,
        instructorAccess: true,
      },
      booking: {
        priorityBooking: true,
        subscriberDiscounts: true,
      },
      progressTracking: {
        passProbabilityTracker: true,
        detailedProgress: true,
      },
    },
  },
} as const;

export const ONE_TIME_SERVICES: OneTimeService[] = [
  {
    id: 'prep-practice-test',
    title: 'In-Person PREP Practice Test',
    description: 'Realistic PREP test simulation with official equipment and scoring',
    price: 89.99,
    category: 'practice-test',
    duration: 45,
    location: 'Multiple locations available',
    maxParticipants: 8,
  },
  {
    id: 'pin-practice-test',
    title: 'In-Person PIN Practice Test',
    description: 'Comprehensive PIN fitness test with professional evaluation',
    price: 79.99,
    category: 'practice-test',
    duration: 60,
    location: 'Multiple locations available',
    maxParticipants: 6,
  },
  {
    id: 'document-review-basic',
    title: 'Application Document Review (Basic)',
    description: 'Format and completeness check of your application documents',
    price: 49.99,
    category: 'document-review',
    duration: 30,
  },
  {
    id: 'document-review-premium',
    title: 'Application Document Review (Premium)',
    description: 'Detailed scoring and improvement recommendations for your application',
    price: 99.99,
    category: 'document-review',
    duration: 60,
  },
  {
    id: 'mock-interview-live',
    title: 'Live Mock Interview',
    description: 'Live video session with professional feedback and coaching',
    price: 149.99,
    category: 'mock-interview',
    duration: 60,
  },
  {
    id: 'mock-interview-recorded',
    title: 'Recorded Interview Review',
    description: 'Submit your recorded interview for detailed feedback',
    price: 79.99,
    category: 'mock-interview',
    duration: 30,
  },
  {
    id: 'speed-drills-workshop',
    title: 'PREP Speed Drills Workshop',
    description: 'Focused training on PREP test speed and agility components',
    price: 69.99,
    category: 'workshop',
    duration: 90,
    maxParticipants: 12,
  },
  {
    id: 'lfi-prep-workshop',
    title: 'LFI Preparation Workshop',
    description: 'Specialized training for Law Enforcement Interview preparation',
    price: 89.99,
    category: 'workshop',
    duration: 120,
    maxParticipants: 10,
  },
];

export const PROMOTIONAL_OFFERS = {
  firstMonthDiscount: {
    name: 'First Month 50% Off',
    description: 'Get your first month of Premium for only $9.99',
    discountPercentage: 50,
    originalPrice: SUBSCRIPTION_PLANS.premium.price,
    discountedPrice: SUBSCRIPTION_PLANS.premium.price * 0.5,
  },
  seasonalPromotion: {
    name: 'Summer Intake Prep',
    description: '10% off all practice tests for summer intake preparation',
    discountPercentage: 10,
    validUntil: new Date('2024-08-31'),
  },
  subscriberDiscount: {
    name: 'Subscriber Discount',
    description: 'Premium subscribers get 15% off all one-time services',
    discountPercentage: 15,
  },
};

export const UPSELL_TRIGGERS = {
  afterFailedTest: {
    message: 'Need more practice? Book an in-person test for real test simulation!',
    action: 'book-practice-test',
  },
  afterLockedTrainingPlan: {
    message: 'Unlock your full personalized training plan with Premium!',
    action: 'subscribe',
  },
  afterBookingPracticeTest: {
    message: 'Get 15% off your next practice test with Premium subscription!',
    action: 'subscribe',
  },
  afterViewingLockedContent: {
    message: 'See more with Premium!',
    action: 'subscribe',
  },
};

export const FEATURE_FLAGS = {
  enableMonetization: true,
  enableApplePay: true,
  enableStripe: true,
  enableInAppPurchases: true,
  enableAnalytics: true,
  enableUpsellModals: true,
  enablePromotionalOffers: true,
};

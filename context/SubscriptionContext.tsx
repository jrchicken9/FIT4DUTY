import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionStatus = {
  tier: 'free' | 'premium' | 'pro';
  isActive: boolean;
  expiresAt: Date | null;
  features: any;
  usage: {
    digitalTestsThisMonth: number;
    lastUsageReset: Date;
  };
  purchaseHistory: any[];
};

const SubscriptionContext = createContext<any>(null);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: 'premium', // Set to premium for testing
    isActive: true,
    expiresAt: null,
    features: {
      digitalTests: { monthlyLimit: 10 },
      trainingPlans: { unlockedWeeks: -1 }, // -1 means all weeks unlocked
      interviewPrep: { sampleQuestions: true },
      community: { canPost: true },
      booking: { priorityBooking: true },
      progressTracking: { passProbabilityTracker: true },
    },
    usage: {
      digitalTestsThisMonth: 0,
      lastUsageReset: new Date(),
    },
    purchaseHistory: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const subscribeToPlan = async (planId: string) => {
    // Simple implementation
  };

  const purchaseOneTimeService = async (serviceId: string) => {
    // Simple implementation
  };

  const cancelSubscription = async () => {
    // Simple implementation
  };

  const trackDigitalTestUsage = async () => {
    // Simple implementation
  };

  const canAccessDigitalTest = () => {
    return true;
  };

  const canAccessTrainingPlan = (weekNumber: number) => {
    return true; // All weeks accessible
  };

  const canAccessFeature = (feature: string) => {
    return true; // All features accessible
  };

  const hasUsedPromotionalOffer = () => {
    return false;
  };

  const isSubscriptionExpired = () => {
    return false;
  };

  const getDaysUntilExpiry = () => {
    return null;
  };

  const getRemainingDigitalTests = () => {
    return 10; // Unlimited for testing
  };

  const contextValue = {
    subscription,
    isLoading,
    subscribeToPlan,
    purchaseOneTimeService,
    cancelSubscription,
    trackDigitalTestUsage,
    canAccessDigitalTest,
    canAccessTrainingPlan,
    canAccessFeature,
    hasUsedPromotionalOffer,
    isSubscriptionExpired,
    getDaysUntilExpiry,
    getRemainingDigitalTests,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
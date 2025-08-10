import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export type SubscriptionStatus = {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt: Date | null;
  features: {
    unlimitedWorkouts: boolean;
    personalizedPlans: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    offlineMode: boolean;
  };
};

const SUBSCRIPTION_STORAGE_KEY = 'subscription_status';

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    plan: 'free',
    isActive: true, // Free users are always "active"
    expiresAt: null,
    features: {
      unlimitedWorkouts: true, // Free users get all features for now
      personalizedPlans: true,
      advancedAnalytics: true,
      prioritySupport: false,
      offlineMode: true,
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load subscription status from storage
  useEffect(() => {
    loadSubscriptionStatus();
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const parsedSubscription = JSON.parse(stored);
        // Convert expiresAt back to Date if it exists
        if (parsedSubscription.expiresAt) {
          parsedSubscription.expiresAt = new Date(parsedSubscription.expiresAt);
        }
        setSubscription(parsedSubscription);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscriptionStatus = async (status: SubscriptionStatus) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  };

  const subscribeToPlan = async (plan: SubscriptionPlan) => {
    try {
      console.log(`Subscribing to ${plan} plan`);
      
      // For now, we'll simulate the subscription process
      // In a real app, this would integrate with payment providers like Stripe, Apple Pay, etc.
      
      let expiresAt: Date | null = null;
      if (plan === 'monthly') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (plan === 'yearly') {
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const newSubscription: SubscriptionStatus = {
        plan,
        isActive: true,
        expiresAt,
        features: {
          unlimitedWorkouts: true,
          personalizedPlans: true,
          advancedAnalytics: true,
          prioritySupport: plan !== 'free',
          offlineMode: true,
        },
      };

      setSubscription(newSubscription);
      await saveSubscriptionStatus(newSubscription);
      
      Alert.alert(
        'Subscription Successful!',
        `You've successfully subscribed to the ${plan} plan. Enjoy your premium features!`
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert('Subscription Failed', 'There was an error processing your subscription. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const cancelSubscription = async () => {
    try {
      console.log('Cancelling subscription');
      
      const cancelledSubscription: SubscriptionStatus = {
        plan: 'free',
        isActive: true, // Free plan is always active
        expiresAt: null,
        features: {
          unlimitedWorkouts: true, // Free users still get all features for now
          personalizedPlans: true,
          advancedAnalytics: true,
          prioritySupport: false,
          offlineMode: true,
        },
      };

      setSubscription(cancelledSubscription);
      await saveSubscriptionStatus(cancelledSubscription);
      
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription has been cancelled. You can continue using the free features.'
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Cancellation error:', error);
      Alert.alert('Cancellation Failed', 'There was an error cancelling your subscription. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const checkFeatureAccess = (feature: keyof SubscriptionStatus['features']): boolean => {
    return subscription.features[feature];
  };

  const isSubscriptionExpired = (): boolean => {
    if (!subscription.expiresAt) return false;
    return new Date() > subscription.expiresAt;
  };

  const getDaysUntilExpiry = (): number | null => {
    if (!subscription.expiresAt) return null;
    const now = new Date();
    const diffTime = subscription.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    subscription,
    isLoading,
    subscribeToPlan,
    cancelSubscription,
    checkFeatureAccess,
    isSubscriptionExpired,
    getDaysUntilExpiry,
  };
});
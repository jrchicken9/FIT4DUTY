import React from 'react';
import { Platform } from 'react-native';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  // On web, we'll use a simplified provider or skip Stripe entirely
  if (Platform.OS === 'web') {
    // For web, we'll just render children without Stripe provider
    // The payment flow will be handled differently on web
    return <>{children}</>;
  }

  // On native platforms, use the full Stripe provider
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const merchantIdentifier = process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID || '';

  return (
    <StripeProviderBase
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
    >
      {children as React.ReactElement}
    </StripeProviderBase>
  );
}

import React from 'react';

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  // On web, we don't need Stripe provider at all
  return <>{children}</>;
}

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSegments } from 'expo-router';

export default function FirstSignInHandler() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const rootSegment = segments[0];
    const isOnAuthScreen = rootSegment === 'auth' || rootSegment === undefined;
    const isOnCPPFlow = false;
    if (isOnAuthScreen) return;

    // CPP onboarding removed
  }, [user, isLoading, segments]);

  return null;
}


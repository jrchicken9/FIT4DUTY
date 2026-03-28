import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!user || !isAdmin()) {
      router.replace('/');
    }
  }, [user, isAdmin]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="workout-builder"
        options={{
          title: 'Workout Builder',
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'User Management',
        }}
      />
      <Stack.Screen
        name="practice-sessions"
        options={{
          title: 'Practice Sessions',
        }}
      />
      <Stack.Screen
        name="booking-approvals"
        options={{
          title: 'Booking Approvals',
        }}
      />
      <Stack.Screen
        name="application-monetization"
        options={{
          title: 'Application Monetization',
        }}
      />
      <Stack.Screen
        name="resume-logic"
        options={{
          title: 'Resume Logic & Grading',
        }}
      />

    </Stack>
  );
}

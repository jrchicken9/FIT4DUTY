import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { CommunityProvider } from "@/context/CommunityContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { PinTestProvider } from "@/context/PinTestContext";
import { PracticeTestsProvider } from "@/context/PracticeTestsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/sign-in"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/sign-up"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="workout/[id]" options={{ title: "Workout" }} />
      <Stack.Screen name="exercise/[id]" options={{ title: "Exercise" }} />
      <Stack.Screen name="video/[id]" options={{ title: "Video Tutorial" }} />
      <Stack.Screen name="application/[step]" options={{ title: "Application Step" }} />
      <Stack.Screen name="test/[id]" options={{ title: "Police Test" }} />
      <Stack.Screen name="pin-test" options={{ title: "Ontario PIN Test" }} />
      <Stack.Screen name="pin-test/results" options={{ title: "PIN Test Results" }} />
      <Stack.Screen name="subscription" options={{ title: "Subscription Plans" }} />
      <Stack.Screen name="workout/session/[id]" options={{ title: "Workout Session" }} />
      <Stack.Screen name="workout/shuttle-run" options={{ title: "Shuttle Run" }} />
      <Stack.Screen name="profile-completion" options={{ title: "Complete Profile" }} />
      <Stack.Screen name="admin/dashboard" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="admin/users" options={{ title: "User Management" }} />
      <Stack.Screen name="admin/community" options={{ title: "Community Management" }} />
      <Stack.Screen name="admin/analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="admin/settings" options={{ title: "System Settings" }} />
      <Stack.Screen name="practice-tests" options={{ title: "Practice Tests" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <FitnessProvider>
              <ApplicationProvider>
                <CommunityProvider>
                  <PinTestProvider>
                    <PracticeTestsProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </PracticeTestsProvider>
                  </PinTestProvider>
                </CommunityProvider>
              </ApplicationProvider>
            </FitnessProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "@/constants/colors";
import { typography } from "@/constants/designSystem";
import { AuthProvider } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";
import { WorkoutPlanProvider } from "@/context/WorkoutPlanContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { CommunityProvider } from "@/context/CommunityContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { PinTestProvider } from "@/context/PinTestContext";
import { PracticeTestsProvider } from "@/context/PracticeTestsContext";
import { PracticeSessionsProvider } from "@/context/PracticeSessionsContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FirstSignInHandler from "@/components/FirstSignInHandler";
import Logo from "@/components/Logo";
import ToastContainer from "@/components/ToastContainer";

// Helper function for consistent blue header styling
const getBlueHeaderOptions = (title: string) => ({
  title,
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontSize: 20,
    fontWeight: "800" as const,
    lineHeight: 28,
    letterSpacing: -0.1,
    color: Colors.white,
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



function RootLayoutNav() {
  return (
    <>
      <ToastContainer />
      <FirstSignInHandler />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
      {/* Welcome/Auth Flow */}
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
      
      {/* Main App Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Core Features */}
      <Stack.Screen name="workout/[id]" options={getBlueHeaderOptions("Workout")} />
      <Stack.Screen name="workout-plan/[id]" options={getBlueHeaderOptions("Workout Plan")} />
      <Stack.Screen name="workout-plans" options={getBlueHeaderOptions("Workout Plans")} />
      <Stack.Screen name="workout-history" options={getBlueHeaderOptions("Workout History")} />
      <Stack.Screen name="workout-analytics" options={getBlueHeaderOptions("Workout Analytics")} />
      <Stack.Screen name="exercise/[id]" options={getBlueHeaderOptions("Exercise")} />
      <Stack.Screen name="video/[id]" options={getBlueHeaderOptions("Video Tutorial")} />
      <Stack.Screen name="test/[id]" options={getBlueHeaderOptions("Police Test")} />
      <Stack.Screen name="workout/session/[id]" options={getBlueHeaderOptions("Workout Session")} />
      <Stack.Screen name="workout/shuttle-run" options={getBlueHeaderOptions("Shuttle Run")} />
      
      {/* Application Process */}
      <Stack.Screen 
        name="application/[step]" 
        options={{
          headerTitle: () => <Logo size="small" variant="light" showText={false} />,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="application/analytics" 
        options={{
          headerTitle: () => <Logo size="small" variant="light" showText={false} />,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: Colors.primary,
            borderBottomColor: Colors.primary,
            borderBottomWidth: 0,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="application-timeline" 
        options={{
          headerTitle: () => <Logo size="small" variant="light" showText={false} />,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: Colors.primary,
            borderBottomColor: Colors.primary,
            borderBottomWidth: 0,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen name="application/[step]/test" options={{ headerShown: false }} />
      <Stack.Screen name="application/[step]/quiz" options={{ headerShown: false }} />
      <Stack.Screen name="application/police-service-selection" options={getBlueHeaderOptions("Select Police Services")} />
      <Stack.Screen name="profile-completion" options={getBlueHeaderOptions("Complete Profile")} />
      
      {/* CPP System removed */}
      
      {/* Fitness Testing */}
      <Stack.Screen name="pin-test" options={getBlueHeaderOptions("Ontario PIN Test")} />
      <Stack.Screen name="pin-test/results" options={getBlueHeaderOptions("PIN Test Results")} />
      
      {/* Practice Sessions */}
      <Stack.Screen name="practice-sessions" options={getBlueHeaderOptions("Practice Sessions")} />
      <Stack.Screen name="practice-sessions/[id]" options={getBlueHeaderOptions("Session Details")} />
      <Stack.Screen name="practice-tests" options={getBlueHeaderOptions("Practice Tests")} />
      
      {/* Subscription */}
      <Stack.Screen name="subscription" options={getBlueHeaderOptions("Subscription Plans")} />
      
      {/* Admin Routes are handled within app/admin/_layout.tsx */}
      {/* No need to declare child admin screens here */}
      
      {/* Backend Test removed */}
    </Stack>
      </>
  );
}

export default function RootLayout() {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
                <FitnessProvider>
                  <WorkoutPlanProvider>
                    <ApplicationProvider>
                    <CommunityProvider>
                      <PinTestProvider>
                        <PracticeTestsProvider>
                          <PracticeSessionsProvider>
                            <NotificationProvider>
                              <ToastProvider>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                  <RootLayoutNav />
                                </GestureHandlerRootView>
                              </ToastProvider>
                            </NotificationProvider>
                          </PracticeSessionsProvider>
                        </PracticeTestsProvider>
                      </PinTestProvider>
                    </CommunityProvider>
                  </ApplicationProvider>
                </WorkoutPlanProvider>
              </FitnessProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
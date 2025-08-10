import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'super_admin';

export type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'view_analytics'
  | 'manage_community'
  | 'manage_subscriptions'
  | 'system_admin';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  
  // Personal Information
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  height: number | null;
  weight: number | null;
  location: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  
  // Goals and Aspirations
  goal: string | null;
  target_test_date: string | null;
  department_interest: string | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
  motivation: string | null;
  has_experience: boolean | null;
  previous_training: string | null;
  
  // Fitness Profile
  current_fitness_level: 'beginner' | 'intermediate' | 'advanced' | null;
  workout_frequency: '1-2 times/week' | '3-4 times/week' | '5+ times/week' | null;
  available_time: '15-30 minutes' | '30-60 minutes' | '60+ minutes' | null;
  injuries: string | null;
  medical_conditions: string | null;
  
  // Police Test Current Levels
  prep_circuit_level: 'never_attempted' | 'below_average' | 'average' | 'good' | 'excellent' | null;
  shuttle_run_level: number | null;
  push_ups_max: number | null;
  sit_reach_distance: number | null;
  mile_run_time: string | null;
  core_endurance_time: number | null;
  back_extension_time: number | null;
  
  // Admin and Role Management
  role: UserRole;
  is_admin: boolean;
  admin_permissions: AdminPermission[];
  
  // Legacy fields for backward compatibility
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | null;
  goals: string[] | null;
  
  created_at: string;
  updated_at: string;
};



type AuthState = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: any;
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        await loadAuthState();
        
        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          console.log('Auth state changed:', event, session?.user?.id);
          
          try {
            if (session?.user) {
              if (isMounted) {
                setAuthState(prev => ({ ...prev, supabaseUser: session.user }));
              }
              
              // Add delay for profile loading after signup
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (isMounted) {
                  await loadUserProfile(session.user.id);
                }
              }
            } else {
              console.log('No session found, clearing auth state');
              if (isMounted) {
                setAuthState({ 
                  user: null, 
                  supabaseUser: null,
                  isLoading: false 
                });
              }
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            if (isMounted) {
              setAuthState(prev => ({ ...prev, isLoading: false }));
            }
          }
        });
        
        subscription = data.subscription;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };
    
    initializeAuth();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Use the improved connection test from supabase.ts
      const { testConnection } = await import('@/lib/supabase');
      const result = await testConnection();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Supabase connection successful');
      return true;
    } catch (error: any) {
      console.error('Supabase connection test failed:', error.message || error);
      throw error;
    }
  };

  const loadAuthState = async () => {
    try {
      console.log('Loading auth state...');
      

      
      // Try to get session with a shorter timeout
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session load timeout')), 8000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Supabase session error:', error);
          console.log('Continuing without session due to error');
        } else if (session?.user) {
          console.log('User session found:', session.user.id);
          setAuthState(prev => ({ ...prev, supabaseUser: session.user }));
          // Load profile in background, don't wait for it
          loadUserProfile(session.user.id).catch(err => {
            const errorMessage = err?.message || (typeof err === 'string' ? err : 'Unknown error occurred');
            console.error('Background profile load failed:', errorMessage);
            console.error('ERROR Error loading profile:', typeof err === 'object' ? JSON.stringify(err) : errorMessage);
          });
        } else {
          console.log('No user session found');
        }
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      } catch (sessionError: any) {
        console.error('Session loading failed:', sessionError.message);
        console.error('ERROR Session loading failed:', sessionError.message);
        
        // Don't show timeout errors to user, just continue without session
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error loading auth state:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Loading profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = no rows returned (profile doesn't exist yet)
        // 42P01 = table doesn't exist
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId);
          
          // If profile doesn't exist, try to create it or retry loading
          if (retryCount < 2) {
            console.log('Retrying profile load after delay...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return loadUserProfile(userId, retryCount + 1);
          } else {
            console.log('Profile still not found after retries. User may need to create profile manually.');
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else if (error.code === '42P01') {
          console.log('Profiles table does not exist yet. Please run the SQL setup.');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        } else {
          console.error('Error loading profile:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          console.error('ERROR Error loading profile:', JSON.stringify(error));
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
        return;
      }

      if (profile) {
        console.log('Profile loaded successfully:', profile.full_name);
        setAuthState(prev => ({ ...prev, user: profile, isLoading: false }));
      } else {
        console.log('No profile data returned');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error occurred');
      console.error('Error loading profile:', {
        message: errorMessage,
        name: error?.name,
        stack: error?.stack,
        fullError: error
      });
      console.error('ERROR Error loading profile:', typeof error === 'object' ? JSON.stringify(error) : errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string,
    signupData?: {
      // Personal Information
      phone?: string;
      dateOfBirth?: Date;
      gender?: 'male' | 'female' | 'other';
      height?: number;
      weight?: number;
      location?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
      
      // Goals and Aspirations
      goal?: string;
      targetTestDate?: Date;
      departmentInterest?: string;
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      motivation?: string;
      hasExperience?: boolean;
      previousTraining?: string;
      
      // Fitness Profile
      currentFitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
      workoutFrequency?: '1-2 times/week' | '3-4 times/week' | '5+ times/week';
      availableTime?: '15-30 minutes' | '30-60 minutes' | '60+ minutes';
      injuries?: string;
      medicalConditions?: string;
      
      // Police Test Current Levels
      prepCircuitLevel?: 'never_attempted' | 'below_average' | 'average' | 'good' | 'excellent';
      shuttleRunLevel?: string;
      pushUpsMax?: string;
      sitReachDistance?: string;
      mileRunTime?: string;
      coreEnduranceTime?: string;
      backExtensionTime?: string;
      
      // Legacy fields for backward compatibility
      fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
      goals?: string[];
    }
  ) => {
    try {
      console.log('Attempting to sign up user:', email);
      
      // Test connection first
      try {
        await testSupabaseConnection();
      } catch (connectionError: any) {
        console.error('Connection test failed before signup:', connectionError.message);
        return { success: false, error: 'Unable to connect to authentication service. Please check your internet connection and try again.' };
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout after 15 seconds')), 15000);
      });
      
      const signupPromise = supabase.auth.signUp({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase signup error:', error.message);
        
        // Handle specific error types
        if (error.message?.includes('Load failed') || error.message?.includes('Network request failed')) {
          return { success: false, error: 'Network connection failed. Please check your internet connection and try again.' };
        } else if (error.message?.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password format.' };
        } else if (error.message?.includes('User already registered')) {
          return { success: false, error: 'An account with this email already exists.' };
        } else if (error.message?.includes('signup is disabled')) {
          return { success: false, error: 'Account registration is currently disabled. Please contact support.' };
        } else if (error.message?.includes('Password should contain at least one character of each')) {
          return { 
            success: false, 
            error: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*()_+-=[]{};\':"<>?,./`~).' 
          };
        } else if (error.message?.includes('Password should be at least')) {
          const match = error.message.match(/at least (\d+) characters/);
          const minLength = match ? match[1] : '8';
          return { success: false, error: `Password must be at least ${minLength} characters long.` };
        } else if (error.message?.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address.' };
        } else if (error.message?.includes('Email rate limit exceeded')) {
          return { success: false, error: 'Too many signup attempts. Please wait a few minutes before trying again.' };
        } else if (error.message?.includes('weak password')) {
          return { success: false, error: 'Password is too weak. Please choose a stronger password with a mix of letters, numbers, and special characters.' };
        }
        
        return { success: false, error: formatAuthError(error.message) };
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Wait for the session to be established and auth state to update
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try to create profile with retry logic
        try {
          console.log('Attempting to create profile for user:', data.user.id);
          
          // Wait for session to be fully established
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Retry profile creation up to 3 times
          let profileCreated = false;
          let lastError = null;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`Profile creation attempt ${attempt}/3`);
              
              const profileData = {
                id: data.user.id,
                email,
                full_name: fullName,
                
                // Personal Information
                phone: signupData?.phone || null,
                date_of_birth: signupData?.dateOfBirth ? signupData.dateOfBirth.toISOString().split('T')[0] : null,
                gender: signupData?.gender || null,
                height: signupData?.height || null,
                weight: signupData?.weight || null,
                location: signupData?.location || null,
                emergency_contact: signupData?.emergencyContact || null,
                emergency_phone: signupData?.emergencyPhone || null,
                
                // Goals and Aspirations
                goal: signupData?.goal || null,
                target_test_date: signupData?.targetTestDate ? signupData.targetTestDate.toISOString().split('T')[0] : null,
                department_interest: signupData?.departmentInterest || null,
                experience_level: signupData?.experienceLevel || null,
                motivation: signupData?.motivation || null,
                has_experience: signupData?.hasExperience || false,
                previous_training: signupData?.previousTraining || null,
                
                // Fitness Profile
                current_fitness_level: signupData?.currentFitnessLevel || null,
                workout_frequency: signupData?.workoutFrequency || null,
                available_time: signupData?.availableTime || null,
                injuries: signupData?.injuries || null,
                medical_conditions: signupData?.medicalConditions || null,
                
                // Police Test Current Levels
                prep_circuit_level: signupData?.prepCircuitLevel || null,
                shuttle_run_level: signupData?.shuttleRunLevel ? parseFloat(signupData.shuttleRunLevel) : null,
                push_ups_max: signupData?.pushUpsMax ? parseInt(signupData.pushUpsMax) : null,
                sit_reach_distance: signupData?.sitReachDistance ? parseFloat(signupData.sitReachDistance) : null,
                mile_run_time: signupData?.mileRunTime || null,
                core_endurance_time: signupData?.coreEnduranceTime ? parseInt(signupData.coreEnduranceTime) : null,
                back_extension_time: signupData?.backExtensionTime ? parseInt(signupData.backExtensionTime) : null,
                
                // Legacy fields for backward compatibility
                fitness_level: signupData?.fitnessLevel || signupData?.currentFitnessLevel || null,
                goals: signupData?.goals || (signupData?.goal ? [signupData.goal] : null),
              };
              
              console.log('Profile data to insert:', profileData);
              
              // Use upsert to handle cases where profile might already exist
              const { data: insertedProfile, error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' })
                .select()
                .single();

              if (profileError) {
                lastError = profileError;
                console.error(`Profile creation attempt ${attempt} failed:`, {
                  message: profileError.message,
                  code: profileError.code,
                  details: profileError.details,
                  hint: profileError.hint
                });
                
                if (profileError.code === '42P01') {
                  console.log('Profiles table does not exist. Please run the SQL setup.');
                  break; // Don't retry if table doesn't exist
                } else if (profileError.code === '42501') {
                  console.log('RLS policy violation. Retrying...');
                  if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                  }
                } else if (profileError.message?.includes('duplicate key')) {
                  console.log('Profile already exists, this is expected.');
                  profileCreated = true;
                  break;
                }
              } else {
                console.log('Profile created successfully:', insertedProfile);
                profileCreated = true;
                break;
              }
            } catch (attemptError: any) {
              lastError = attemptError;
              console.error(`Profile creation attempt ${attempt} exception:`, attemptError.message);
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          }
          
          if (!profileCreated && lastError) {
            console.log('All profile creation attempts failed. Profile may be created by database trigger later.');
          }
        } catch (profileError: any) {
          console.error('Profile creation failed with exception:', {
            message: profileError.message,
            name: profileError.name
          });
          console.log('User account created but profile creation failed. Profile may be created by trigger later.');
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error.message || error);
      
      // Handle timeout and network errors
      if (error.message?.includes('timeout')) {
        return { success: false, error: 'Connection timeout. Please check your internet connection and try again.' };
      } else if (error.message?.includes('Load failed') || error.message?.includes('Network request failed')) {
        return { success: false, error: 'Network connection failed. Please check your internet connection and try again.' };
      } else if (error.name === 'AbortError') {
        return { success: false, error: 'Request was cancelled. Please try again.' };
      }
      
      return { success: false, error: error.message || 'Failed to create account' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email);
      
      // Test connection first
      try {
        await testSupabaseConnection();
      } catch (connectionError: any) {
        console.error('Connection test failed before signin:', connectionError.message);
        return { success: false, error: 'Unable to connect to authentication service. Please check your internet connection and try again.' };
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signin timeout after 15 seconds')), 15000);
      });
      
      const signinPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([signinPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase signin error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
          code: error.code
        });
        
        // Handle specific error types
        if (error.message?.includes('Load failed') || error.message?.includes('Network request failed')) {
          return { success: false, error: 'Network connection failed. Please check your internet connection and try again.' };
        } else if (error.message?.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. Please check your credentials and try again.' 
          };
        } else if (error.message?.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and confirm your account before signing in.' };
        } else if (error.message?.includes('signup is disabled')) {
          return { success: false, error: 'Account registration is currently disabled. Please contact support.' };
        }
        
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        console.log('User signed in successfully:', data.user.id);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error.message || error);
      
      // Handle timeout and network errors
      if (error.message?.includes('timeout')) {
        return { success: false, error: 'Connection timeout. Please check your internet connection and try again.' };
      } else if (error.message?.includes('Load failed') || error.message?.includes('Network request failed')) {
        return { success: false, error: 'Network connection failed. Please check your internet connection and try again.' };
      } else if (error.name === 'AbortError') {
        return { success: false, error: 'Request was cancelled. Please try again.' };
      }
      
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Sign out from Supabase first
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign out timeout')), 5000);
        });
        
        const signOutPromise = supabase.auth.signOut();
        
        const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Supabase sign out error:', error);
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (signOutError: any) {
        console.error('Sign out timeout or error:', signOutError.message);
      }
      
      // Clear any stored session data
      try {
        await AsyncStorage.multiRemove([
          'supabase.auth.token',
          '@supabase/auth-token',
          'sb-auth-token'
        ]);
      } catch (storageError) {
        console.log('Error clearing storage:', storageError);
      }
      
      // Clear local auth state
      setAuthState({
        user: null,
        supabaseUser: null,
        isLoading: false,
      });
      
      console.log('Sign out completed, navigating to welcome screen');
      
      // Force navigation to welcome screen with a small delay to ensure state is updated
      setTimeout(() => {
        const { router } = require('expo-router');
        router.replace('/');
      }, 100);
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Ensure local state is cleared even if there's an error
      setAuthState({
        user: null,
        supabaseUser: null,
        isLoading: false,
      });
      
      // Still try to navigate even if there was an error
      setTimeout(() => {
        try {
          const { router } = require('expo-router');
          router.replace('/');
        } catch (navError) {
          console.error('Navigation error after sign out:', navError);
        }
      }, 100);
    }
  };



  const updateProfile = async (updates: Partial<Omit<User, 'id' | 'email' | 'created_at'>> & { experienceLevel?: string }) => {
    // Check if user is authenticated (either online or offline)
    if (!authState.user && !authState.supabaseUser) {
      console.error('Cannot update profile: user not authenticated');
      Alert.alert('Error', 'Please sign in to update your profile');
      return;
    }

    // If we have a supabaseUser but no profile user, try to create/load the profile first
    if (!authState.user && authState.supabaseUser) {
      console.log('User authenticated but no profile found, attempting to create profile...');
      await createProfileIfMissing();
      
      // Wait a moment for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If still no profile, continue with the update anyway
      if (!authState.user) {
        console.log('Profile creation failed, but continuing with update...');
      }
    }

    // Require authenticated user for profile updates
    if (!authState.supabaseUser) {
      console.error('Cannot update profile: user not authenticated');
      Alert.alert('Error', 'Please sign in to update your profile');
      return;
    }

    try {
      console.log('Updating profile with:', updates);
      
      // Map camelCase properties to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Map each property to its database equivalent
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        switch (key) {
          case 'experienceLevel':
            dbUpdates.experience_level = value;
            break;
          case 'fitnessLevel':
            dbUpdates.fitness_level = value;
            break;
          case 'fullName':
            dbUpdates.full_name = value;
            break;
          case 'name':
            dbUpdates.full_name = value;
            break;
          case 'avatarUrl':
            dbUpdates.avatar_url = value;
            break;
          case 'departmentInterest':
            dbUpdates.department_interest = value;
            break;
          default:
            dbUpdates[key] = value;
        }
      });
      
      console.log('Database updates:', dbUpdates);
      
      // Use the user ID from either the profile user or supabase user
      const userId = authState.user?.id || authState.supabaseUser?.id;
      if (!userId) {
        console.error('No user ID available for profile update');
        Alert.alert('Error', 'Unable to identify user for profile update');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        console.error('Profile update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        console.error('ERROR Error loading profile:', JSON.stringify(error));
        Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
        return;
      }

      if (data) {
        console.log('Profile updated successfully:', data);
        setAuthState(prev => ({ ...prev, user: data }));
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error occurred');
      console.error('Error updating profile:', {
        message: errorMessage,
        fullError: error,
        type: typeof error
      });
      console.error('ERROR Error loading profile:', typeof error === 'object' ? JSON.stringify(error) : errorMessage);
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    }
  };



  // Helper function to manually create profile if it doesn't exist
  const createProfileIfMissing = async () => {
    if (!authState.supabaseUser || authState.user) {
      return; // Already have profile or not authenticated
    }

    try {
      console.log('Attempting to create missing profile for user:', authState.supabaseUser.id);
      
      const profileData = {
        id: authState.supabaseUser.id,
        email: authState.supabaseUser.email || '',
        full_name: authState.supabaseUser.user_metadata?.full_name || authState.supabaseUser.email || 'User',
        
        // Personal Information
        phone: null,
        date_of_birth: null,
        gender: null,
        height: null,
        weight: null,
        location: null,
        emergency_contact: null,
        emergency_phone: null,
        
        // Goals and Aspirations
        goal: 'Get started',
        target_test_date: null,
        department_interest: null,
        experience_level: 'beginner',
        motivation: null,
        has_experience: false,
        previous_training: null,
        
        // Fitness Profile
        current_fitness_level: 'beginner' as const,
        workout_frequency: null,
        available_time: null,
        injuries: null,
        medical_conditions: null,
        
        // Police Test Current Levels
        prep_circuit_level: null,
        shuttle_run_level: null,
        push_ups_max: null,
        sit_reach_distance: null,
        mile_run_time: null,
        core_endurance_time: null,
        back_extension_time: null,
        
        // Admin and Role Management
        role: 'user' as const,
        is_admin: false,
        admin_permissions: [],
        
        // Legacy fields
        fitness_level: 'beginner' as const,
        goals: ['Get started'],
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Manual profile creation error:', error);
        return;
      }

      if (data) {
        console.log('Profile created manually:', data);
        setAuthState(prev => ({ ...prev, user: data }));
        Alert.alert('Success', 'Profile created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating profile manually:', error?.message || error);
    }
  };

  // Admin functions
  const isAdmin = () => {
    return authState.user?.is_admin === true || authState.user?.role === 'admin' || authState.user?.role === 'super_admin';
  };

  const isSuperAdmin = () => {
    return authState.user?.role === 'super_admin';
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!authState.user || !isAdmin()) return false;
    
    // Super admins have all permissions
    if (isSuperAdmin()) return true;
    
    // Check specific permissions
    return authState.user.admin_permissions?.includes(permission) || false;
  };

  const getAllUsers = async () => {
    if (!isAdmin()) {
      console.error('Access denied: Admin privileges required');
      return { success: false, error: 'Admin privileges required' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  };

  const updateUserRole = async (userId: string, role: UserRole, permissions: AdminPermission[] = []) => {
    if (!isSuperAdmin()) {
      console.error('Access denied: Super admin privileges required');
      return { success: false, error: 'Super admin privileges required' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role,
          is_admin: role === 'admin' || role === 'super_admin',
          admin_permissions: permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
      }

      console.log('User role updated successfully:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message || 'Failed to update user role' };
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isSuperAdmin()) {
      console.error('Access denied: Super admin privileges required');
      return { success: false, error: 'Super admin privileges required' };
    }

    try {
      // Delete from profiles table (this will cascade to other tables)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }

      console.log('User deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  };

  const pinCommunityPost = async (postId: string, isPinned: boolean) => {
    if (!hasPermission('manage_community')) {
      console.error('Access denied: Community management permission required');
      return { success: false, error: 'Community management permission required' };
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('Error updating post pin status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating post pin status:', error);
      return { success: false, error: error.message || 'Failed to update post' };
    }
  };

  return {
    user: authState.user,
    supabaseUser: authState.supabaseUser,
    isLoading: authState.isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createProfileIfMissing,
    // Admin functions
    isAdmin,
    isSuperAdmin,
    hasPermission,
    getAllUsers,
    updateUserRole,
    deleteUser,
    pinCommunityPost,
  };
});

// Helper function to format authentication error messages
const formatAuthError = (errorMessage: string): string => {
  // Common error patterns and their user-friendly messages
  const errorPatterns = [
    {
      pattern: /Password should contain at least one character of each/i,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*()_+-=[]{};\':"<>?,./`~).'
    },
    {
      pattern: /Password should be at least (\d+) characters/i,
      message: (match: RegExpMatchArray) => `Password must be at least ${match[1]} characters long.`
    },
    {
      pattern: /Invalid email/i,
      message: 'Please enter a valid email address.'
    },
    {
      pattern: /Email rate limit exceeded/i,
      message: 'Too many signup attempts. Please wait a few minutes before trying again.'
    },
    {
      pattern: /weak password/i,
      message: 'Password is too weak. Please choose a stronger password with a mix of letters, numbers, and special characters.'
    },
    {
      pattern: /User already registered/i,
      message: 'An account with this email already exists. Please try signing in instead.'
    },
    {
      pattern: /Invalid login credentials/i,
      message: 'Invalid email or password. Please check your credentials and try again.'
    },
    {
      pattern: /Email not confirmed/i,
      message: 'Please check your email and confirm your account before signing in.'
    },
    {
      pattern: /signup is disabled/i,
      message: 'Account registration is currently disabled. Please contact support.'
    },
    {
      pattern: /Network request failed|Load failed/i,
      message: 'Network connection failed. Please check your internet connection and try again.'
    }
  ];

  // Check each pattern
  for (const { pattern, message } of errorPatterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      return typeof message === 'function' ? message(match) : message;
    }
  }

  // If no pattern matches, return a generic message
  return 'An error occurred during authentication. Please try again or contact support if the problem persists.';
};
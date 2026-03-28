import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  height: number | null;
  weight: number | null;
  location: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  goal: string | null;
  target_test_date: string | null;
  department_interest: string | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
  motivation: string | null;
  has_experience: boolean | null;
  previous_training: string | null;
  current_fitness_level: 'beginner' | 'intermediate' | 'advanced' | null;
  workout_frequency: string | null;
  available_time: string | null;
  injuries: string | null;
  medical_conditions: string | null;
  prep_circuit_level: 'never_attempted' | 'below_average' | 'average' | 'good' | 'excellent' | null;
  shuttle_run_level: number | null;
  push_ups_max: number | null;
  sit_reach_distance: number | null;
  mile_run_time: string | null;
  core_endurance_time: number | null;
  back_extension_time: number | null;
  role: 'user' | 'admin' | 'super_admin';
  is_admin: boolean;
  admin_permissions: string[];
  fitness_level: string | null;
  goals: string[] | null;
  has_seen_cpp_intro: boolean;
  cpp_percent: number;
  cpp_state: any;
  created_at: string;
  updated_at: string;
};

type AuthState = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setAuthState({
              user: null,
              supabaseUser: null,
              isLoading: false,
            });
          }
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log('Loaded user profile:', data);
      console.log('User first_name:', data.first_name);
      console.log('User last_name:', data.last_name);
      console.log('User full_name:', data.full_name);
      setAuthState({
        user: data as User,
        supabaseUser: (await supabase.auth.getUser()).data.user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, data };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error?.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('AuthContext signUp called with:', { email, userData });
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            date_of_birth: userData.date_of_birth,
          }
        }
      });

      console.log('Supabase signUp result:', { data, error });
      if (data.user) {
        console.log('User metadata:', data.user.user_metadata);
      }

      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw error;
      }

      if (data.user) {
        // Wait a moment for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update the profile with additional data if needed
        if (userData.phone || userData.date_of_birth || userData.first_name || userData.last_name) {
          const updateData: any = {};
          if (userData.phone) updateData.phone = userData.phone;
          if (userData.date_of_birth) updateData.date_of_birth = userData.date_of_birth;
          if (userData.first_name) updateData.first_name = userData.first_name;
          if (userData.last_name) updateData.last_name = userData.last_name;
          if (userData.full_name) updateData.full_name = userData.full_name;

          console.log('Updating profile with:', updateData);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            console.log('Profile updated successfully');
          }
        }

        await loadUserProfile(data.user.id);
      }

      return data;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        supabaseUser: null,
        isLoading: false,
      });
      // Note: Navigation will be handled by the component calling signOut
    } catch (error: any) {
      throw error;
    }
  };

  // Admin functions
  const isAdmin = () => {
    return authState.user?.is_admin || false;
  };

  const isSuperAdmin = () => {
    return authState.user?.role === 'super_admin';
  };

  const hasPermission = (permission: string) => {
    if (!authState.user) return false;
    return authState.user.is_admin || authState.user.role === 'super_admin';
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        throw new Error('No user logged in');
      }

      // Filter out empty strings and null values to prevent database errors
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as Partial<User>);

      console.log('Updating profile with clean data:', cleanUpdates);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: data as User,
      }));

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  const contextValue = {
    user: authState.user,
    supabaseUser: authState.supabaseUser,
    isLoading: authState.isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isSuperAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import { createClient, AuthFlowType } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback to hardcoded values if env vars are not available
const finalUrl = supabaseUrl || 'https://jgkgdfohqihwojbsplab.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2dkZm9ocWlod29qYnNwbGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTA5ODYsImV4cCI6MjA2OTk2Njk4Nn0.1uIE9x0yg6TsxNKf0gTxRs4sZjb0e2RBfwm8-Joe_pE';

console.log('Supabase config:', {
  hasUrl: !!finalUrl,
  hasKey: !!finalKey,
  urlPreview: finalUrl ? finalUrl.substring(0, 30) + '...' : 'missing',
  keyPreview: finalKey ? finalKey.substring(0, 20) + '...' : 'missing'
});

if (!finalUrl || !finalKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase URL and Anon Key are required');
}

// Web-compatible storage for auth
const authStorage = Platform.OS === 'web' ? {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
} : AsyncStorage;

const supabaseOptions = {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce' as AuthFlowType,
  },
  global: {
    headers: {
      'X-Client-Info': 'police-prep-app',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
};

export const supabase = createClient(finalUrl, finalKey, supabaseOptions);

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection with URL:', finalUrl.substring(0, 30) + '...');
    
    // Create a timeout promise with shorter timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000);
    });
    
    // Test with a simple REST API call instead of auth
    const healthCheckPromise = fetch(`${finalUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': finalKey,
        'Authorization': `Bearer ${finalKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const response = await Promise.race([healthCheckPromise, timeoutPromise]) as Response;
    
    // Accept 200, 404, or 401 as valid responses (means server is reachable)
    if (!response.ok && response.status !== 404 && response.status !== 401) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('Supabase connection test successful');
    return { success: true, data: null };
  } catch (error: any) {
    console.error('Connection test error:', error);
    
    let errorMessage = 'Unknown connection error';
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout. Please check your internet connection.';
    } else if (error.message?.includes('Load failed') || error.message?.includes('Network request failed')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'CORS error. Please check your Supabase configuration.';
    } else {
      errorMessage = error.message || 'Failed to connect to Supabase';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          height: number | null;
          weight: number | null;
          fitness_level: 'beginner' | 'intermediate' | 'advanced' | null;
          goals: string[] | null;
          department_interest: string | null;
          experience_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          height?: number | null;
          weight?: number | null;
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          goals?: string[] | null;
          department_interest?: string | null;
          experience_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          height?: number | null;
          weight?: number | null;
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          goals?: string[] | null;
          department_interest?: string | null;
          experience_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          workout_type: string;
          duration: number;
          calories_burned: number | null;
          notes: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_type: string;
          duration: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_type?: string;
          duration?: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
      };
      fitness_tests: {
        Row: {
          id: string;
          user_id: string;
          test_type: 'shuttle_run' | 'push_ups' | 'sit_ups' | 'plank';
          score: number;
          level: number | null;
          notes: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_type: 'shuttle_run' | 'push_ups' | 'sit_ups' | 'plank';
          score: number;
          level?: number | null;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_type?: 'shuttle_run' | 'push_ups' | 'sit_ups' | 'plank';
          score?: number;
          level?: number | null;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
      };
      application_progress: {
        Row: {
          id: string;
          user_id: string;
          step_id: string;
          status: 'not_started' | 'in_progress' | 'completed';
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_id: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_id?: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          post_type: 'question' | 'achievement' | 'tip' | 'discussion' | null;
          likes_count: number;
          comments_count: number;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          post_type?: 'question' | 'achievement' | 'tip' | 'discussion' | null;
          likes_count?: number;
          comments_count?: number;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          post_type?: 'question' | 'achievement' | 'tip' | 'discussion' | null;
          likes_count?: number;
          comments_count?: number;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      pin_test_results: {
        Row: {
          id: string;
          user_id: string;
          mile_run_minutes: number | null;
          mile_run_seconds: number | null;
          pushups_count: number | null;
          core_endurance_minutes: number | null;
          core_endurance_seconds: number | null;
          sit_reach_distance: number | null;
          overall_score: number | null;
          pass_status: boolean | null;
          notes: string | null;
          test_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mile_run_minutes?: number | null;
          mile_run_seconds?: number | null;
          pushups_count?: number | null;
          core_endurance_minutes?: number | null;
          core_endurance_seconds?: number | null;
          sit_reach_distance?: number | null;
          overall_score?: number | null;
          pass_status?: boolean | null;
          notes?: string | null;
          test_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mile_run_minutes?: number | null;
          mile_run_seconds?: number | null;
          pushups_count?: number | null;
          core_endurance_minutes?: number | null;
          core_endurance_seconds?: number | null;
          sit_reach_distance?: number | null;
          overall_score?: number | null;
          pass_status?: boolean | null;
          notes?: string | null;
          test_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
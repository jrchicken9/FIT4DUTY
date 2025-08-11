import { createClient, AuthFlowType } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Supabase configuration - using environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Use the configuration
const finalUrl = supabaseUrl;
const finalKey = supabaseAnonKey;

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

// Initialize database tables check on startup
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testDatabaseTables().then(result => {
      if (!result.success) {
        console.warn('Database setup check:', result.error);
      }
    }).catch(err => {
      console.warn('Database setup check failed:', err.message);
    });
  }, 2000);
}

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection with URL:', finalUrl.substring(0, 30) + '...');
    
    // Create a timeout promise with shorter timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 8 seconds')), 8000);
    });
    
    // Test with a simple query to profiles table
    const testPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const { error } = await Promise.race([testPromise, timeoutPromise]) as any;
    
    // Even if there's an error, if we get a response it means connection works
    if (error) {
      // These errors indicate connection is working but table/permissions issues
      if (error.code === 'PGRST116' || // no rows
          error.code === '42P01' ||   // table doesn't exist
          error.code === '42501' ||   // insufficient privilege
          error.message?.includes('relation') ||
          error.message?.includes('permission')) {
        console.log('Supabase connection test successful (table/permission issues expected)');
        return { success: true, data: null };
      }
      
      // Network/connection errors
      if (error.message?.includes('Load failed') || 
          error.message?.includes('Network request failed') ||
          error.message?.includes('fetch')) {
        throw new Error('Network connection failed');
      }
      
      // Other errors might still indicate working connection
      console.log('Supabase connection test successful (with expected errors)');
      return { success: true, data: null };
    }
    
    console.log('Supabase connection test successful');
    return { success: true, data: null };
  } catch (error: any) {
    console.error('Connection test error:', error);
    
    let errorMessage = 'Unknown connection error';
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout. Please check your internet connection.';
    } else if (error.message?.includes('Load failed') || 
               error.message?.includes('Network request failed') ||
               error.message?.includes('fetch')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'CORS error. Please check your Supabase configuration.';
    } else {
      errorMessage = error.message || 'Failed to connect to Supabase';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Test database tables function
export const testDatabaseTables = async () => {
  try {
    console.log('Testing database tables...');
    
    // Test if profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError && profilesError.code === '42P01') {
      return { 
        success: false, 
        error: 'Database tables not found. Please run the SQL setup script in your Supabase dashboard.',
        missingTables: ['profiles']
      };
    }
    
    // Test if practice_tests table exists
    const { error: practiceTestsError } = await supabase
      .from('practice_tests')
      .select('id')
      .limit(1);
    
    if (practiceTestsError && practiceTestsError.code === '42P01') {
      return { 
        success: false, 
        error: 'Practice tests table not found. Please run the SQL setup script in your Supabase dashboard.',
        missingTables: ['practice_tests']
      };
    }
    
    console.log('Database tables test successful');
    return { success: true, data: { profilesExists: !profilesError, practiceTestsExists: !practiceTestsError } };
  } catch (error: any) {
    console.error('Database tables test error:', error);
    return { success: false, error: error.message || 'Failed to test database tables' };
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
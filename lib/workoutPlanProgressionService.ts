import { supabase } from './supabase';

export interface WorkoutPlanSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  expires_at: string;
  current_day: number;
  current_week: number;
  is_active: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentWorkout {
  workout_id: string;
  day_number: number;
  week_number: number;
  workout_name: string;
  workout_description: string;
  estimated_duration_minutes: number;
  is_available: boolean;
  days_until_available: number;
}

export interface WorkoutDayCompletion {
  id: string;
  subscription_id: string;
  workout_id: string;
  day_number: number;
  week_number: number;
  completed_at: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export class WorkoutPlanProgressionService {
  /**
   * Start a workout plan for a user
   */
  static async startWorkoutPlan(userId: string, planId: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('start_workout_plan', {
        p_user_id: userId,
        p_plan_id: planId
      });

      if (error) {
        console.error('Error starting workout plan:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to start workout plan:', error);
      throw error;
    }
  }

  /**
   * Get the current available workout for a user's active plan
   */
  static async getCurrentWorkout(userId: string, planId: string): Promise<CurrentWorkout | null> {
    try {
      const { data, error } = await supabase.rpc('get_current_workout', {
        p_user_id: userId,
        p_plan_id: planId
      });

      if (error) {
        console.error('Error getting current workout:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Failed to get current workout:', error);
      throw error;
    }
  }

  /**
   * Advance to the next workout day
   */
  static async advanceWorkoutDay(userId: string, planId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('advance_workout_day', {
        p_user_id: userId,
        p_plan_id: planId
      });

      if (error) {
        console.error('Error advancing workout day:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to advance workout day:', error);
      throw error;
    }
  }

  /**
   * Get user's active workout plan subscription
   */
  static async getActiveSubscription(userId: string, planId: string): Promise<WorkoutPlanSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_workout_plan_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting active subscription:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get active subscription:', error);
      throw error;
    }
  }

  /**
   * Complete a workout day
   */
  static async completeWorkoutDay(
    subscriptionId: string,
    workoutId: string,
    dayNumber: number,
    weekNumber: number,
    durationMinutes?: number,
    notes?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_workout_day_completions')
        .insert({
          subscription_id: subscriptionId,
          workout_id: workoutId,
          day_number: dayNumber,
          week_number: weekNumber,
          duration_minutes: durationMinutes,
          notes
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error completing workout day:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Failed to complete workout day:', error);
      throw error;
    }
  }

  /**
   * Get workout day completion history for a subscription
   */
  static async getWorkoutDayCompletions(subscriptionId: string): Promise<WorkoutDayCompletion[]> {
    try {
      const { data, error } = await supabase
        .from('user_workout_day_completions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Error getting workout day completions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get workout day completions:', error);
      throw error;
    }
  }

  /**
   * Check if a user has an active subscription for a plan
   */
  static async hasActiveSubscription(userId: string, planId: string): Promise<boolean> {
    try {
      const subscription = await this.getActiveSubscription(userId, planId);
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check active subscription:', error);
      return false;
    }
  }

  /**
   * Get all active subscriptions for a user
   */
  static async getUserActiveSubscriptions(userId: string): Promise<WorkoutPlanSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('user_workout_plan_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user active subscriptions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user active subscriptions:', error);
      throw error;
    }
  }
}

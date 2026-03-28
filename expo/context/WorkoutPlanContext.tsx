import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  focus: string[];
  nextWorkout: {
    title: string;
    day: string;
    week: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
}

interface WorkoutPlanState {
  activePlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
}

interface WorkoutPlanContextType {
  state: WorkoutPlanState;
  hasActivePlan: boolean;
  startWorkoutPlan: (planData: Partial<WorkoutPlan>) => Promise<boolean>;
  continueWorkoutPlan: () => void;
  updatePlanProgress: (week: number, progress: number) => Promise<void>;
  resetWorkoutPlan: () => Promise<void>;
  loadActivePlan: () => Promise<void>;
}

const WorkoutPlanContext = createContext<WorkoutPlanContextType | null>(null);

export const useWorkoutPlan = () => {
  const context = useContext(WorkoutPlanContext);
  if (!context) {
    throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
  }
  return context;
};

export const WorkoutPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<WorkoutPlanState>({
    activePlan: null,
    isLoading: true,
    error: null,
  });

  const hasActivePlan = !!state.activePlan;

  // Load active workout plan from database
  const loadActivePlan = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading workout plan:', error);
        throw error;
      }

      if (data) {
        // Transform database data to match our interface
        const transformedPlan: WorkoutPlan = {
          id: data.id,
          title: data.title || 'Personalized Training Plan',
          description: data.description || 'Your customized fitness journey',
          currentWeek: data.current_week || 1,
          totalWeeks: data.total_weeks || 4,
          progress: data.progress || 0,
          focus: data.focus_areas || ['cardio', 'strength'],
          nextWorkout: {
            title: data.next_workout_title || 'Daily Training',
            day: data.next_workout_day || '1',
            week: data.next_workout_week || '1',
            type: data.next_workout_type || 'cardio',
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setState(prev => ({
          ...prev,
          activePlan: transformedPlan,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          activePlan: null,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error loading workout plan:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load workout plan',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  // Start a new workout plan
  const startWorkoutPlan = useCallback(async (planData: Partial<WorkoutPlan>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Create new workout plan in database
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          title: planData.title || 'Personalized Training Plan',
          description: planData.description || 'Your customized fitness journey',
          current_week: 1,
          total_weeks: planData.totalWeeks || 4,
          progress: 0,
          focus_areas: planData.focus || ['cardio', 'strength'],
          next_workout_title: 'Daily Training',
          next_workout_day: '1',
          next_workout_week: '1',
          next_workout_type: 'cardio',
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workout plan:', error);
        throw error;
      }

      // Transform and set the new plan
      const newPlan: WorkoutPlan = {
        id: data.id,
        title: data.title,
        description: data.description,
        currentWeek: data.current_week,
        totalWeeks: data.total_weeks,
        progress: data.progress,
        focus: data.focus_areas,
        nextWorkout: {
          title: data.next_workout_title,
          day: data.next_workout_day,
          week: data.next_workout_week,
          type: data.next_workout_type,
        },
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setState(prev => ({
        ...prev,
        activePlan: newPlan,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      console.error('Error starting workout plan:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to start workout plan',
        isLoading: false,
      }));
      return false;
    }
  }, [user?.id]);

  // Continue with current workout plan
  const continueWorkoutPlan = useCallback(() => {
    if (state.activePlan) {
      // Navigate to workout plan details or next workout
      // This will be handled by the component using this context
    }
  }, [state.activePlan]);

  // Update plan progress
  const updatePlanProgress = useCallback(async (week: number, progress: number) => {
    if (!state.activePlan || !user?.id) return;

    try {
      const { error } = await supabase
        .from('workout_plans')
        .update({
          current_week: week,
          progress: progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.activePlan.id);

      if (error) {
        console.error('Error updating plan progress:', error);
        throw error;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        activePlan: prev.activePlan ? {
          ...prev.activePlan,
          currentWeek: week,
          progress: progress,
          updated_at: new Date().toISOString(),
        } : null,
      }));
    } catch (error: any) {
      console.error('Error updating plan progress:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to update progress',
      }));
    }
  }, [state.activePlan, user?.id]);

  // Reset workout plan
  const resetWorkoutPlan = useCallback(async () => {
    if (!state.activePlan || !user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Delete the current plan
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', state.activePlan.id);

      if (error) {
        console.error('Error resetting workout plan:', error);
        throw error;
      }

      setState(prev => ({
        ...prev,
        activePlan: null,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error resetting workout plan:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to reset workout plan',
        isLoading: false,
      }));
    }
  }, [state.activePlan, user?.id]);

  // Load active plan when user changes
  useEffect(() => {
    if (user?.id) {
      loadActivePlan();
    } else {
      setState(prev => ({
        ...prev,
        activePlan: null,
        isLoading: false,
      }));
    }
  }, [user?.id, loadActivePlan]);

  const contextValue: WorkoutPlanContextType = {
    state,
    hasActivePlan,
    startWorkoutPlan,
    continueWorkoutPlan,
    updatePlanProgress,
    resetWorkoutPlan,
    loadActivePlan,
  };

  return (
    <WorkoutPlanContext.Provider value={contextValue}>
      {children}
    </WorkoutPlanContext.Provider>
  );
};

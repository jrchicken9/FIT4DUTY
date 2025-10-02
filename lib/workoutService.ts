import { supabase } from './supabase';
import {
  Exercise,
  ExerciseCategory,
  WorkoutPlan,
  Workout,
  WorkoutExercise,
  UserWorkoutSession,
  CompletedSet,
  UserExerciseProgress,
  WorkoutWithExercises,
  WorkoutPlanWithWorkouts,
  UserWorkoutSessionWithDetails,
  CreateWorkoutPlanRequest,
  CreateWorkoutRequest,
  CreateWorkoutExerciseRequest,
  StartWorkoutSessionRequest,
  CompleteSetRequest,
  CompleteWorkoutSessionRequest,
  WorkoutAnalytics,
  ExerciseAnalytics
} from '../types/workout';

// =====================================================================
// EXERCISE LIBRARY OPERATIONS
// =====================================================================

export const workoutService = {
  // Get all exercise categories
  async getExerciseCategories(): Promise<ExerciseCategory[]> {
    const { data, error } = await supabase
      .from('exercise_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get all active exercises
  async getExercises(categoryId?: string): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new exercise
  async createExercise(exerciseData: {
    name: string;
    description?: string;
    category_id?: string;
    muscle_groups: string[];
    equipment_needed: string[];
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    instructions?: string;
  }): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        ...exerciseData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // =====================================================================
  // WORKOUT PLAN OPERATIONS
  // =====================================================================

  // Get all active workout plans
  async getWorkoutPlans(featuredOnly = false): Promise<WorkoutPlan[]> {
    let query = supabase
      .from('workout_plans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get all active workout plans with completion status
  async getWorkoutPlansWithCompletion(featuredOnly = false): Promise<(WorkoutPlan & { completion_status: { total_days: number; completed_days: number; completion_percentage: number } })[]> {
    let query = supabase
      .from('workout_plans')
      .select(`
        *,
        workouts (
          id,
          workout_exercises (
            id
          )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Calculate completion status for each plan
    const plansWithCompletion = (data || []).map(plan => {
      const totalDays = plan.duration_weeks * 7; // Assuming 7 days per week
            const completedDays = plan.workouts?.filter((workout: any) =>
        workout.workout_exercises && workout.workout_exercises.length > 0
      ).length || 0;
      const completionPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
      
      return {
        ...plan,
        completion_status: {
          total_days: totalDays,
          completed_days: completedDays,
          completion_percentage: completionPercentage
        }
      };
    });
    
    return plansWithCompletion;
  },

  // Get workout plan by ID with all workouts and exercises
  async getWorkoutPlanById(id: string): Promise<WorkoutPlanWithWorkouts | null> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workouts (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching workout plan:', error);
      throw error;
    }
    
    if (data?.workouts) {
      // Map workout_exercises to exercises for consistency with types
      data.workouts = data.workouts.map((workout: any) => ({
        ...workout,
        exercises: (workout.workout_exercises || []).map((we: any) => ({
          ...we,
          exercise: we.exercises // Preserve the nested exercise data
        }))
      }));
      
      data.workouts.forEach((workout: any, index: number) => {
        if (workout.exercises && workout.exercises.length > 0) {
          workout.exercises.forEach((ex: any, exIndex: number) => {
            // Process exercise data if needed
          });
        }
      });
    }
    
    return data;
  },

  // Create new workout plan (admin only)
  async createWorkoutPlan(plan: CreateWorkoutPlanRequest): Promise<WorkoutPlan> {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // =====================================================================
  // WORKOUT OPERATIONS
  // =====================================================================

  // Get workout by ID with exercises
  async getWorkoutById(id: string): Promise<WorkoutWithExercises | null> {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Map workout_exercises to exercises for consistency with types
    if (data) {
      return {
        ...data,
        exercises: (data.workout_exercises || []).map((we: any) => ({
          ...we,
          exercise: we.exercises // Preserve the nested exercise data
        }))
      };
    }
    
    return data;
  },

  // Create new workout
  async createWorkout(workoutData: CreateWorkoutRequest): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
    
    return data;
  },

  // Delete workout plan
  async deleteWorkoutPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update workout plan
  async updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const { data, error } = await supabase
      .from('workout_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete workout
  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update workout
  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete workout exercise
  async deleteWorkoutExercise(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update workout exercise
  async updateWorkoutExercise(id: string, updates: Partial<WorkoutExercise>): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Test RPC function availability
  async testRPCFunction(): Promise<boolean> {
    try {
      // Test with dummy data
      const { data, error } = await supabase
        .rpc('safe_add_workout_exercise', {
          p_workout_id: '00000000-0000-0000-0000-000000000000',
          p_exercise_id: '00000000-0000-0000-0000-000000000000',
          p_sets: 1,
          p_reps: 1,
          p_weight_kg: null,
          p_rest_time_seconds: 60,
          p_notes: 'test'
        });
      
      if (error) {
        console.error('RPC function test failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('RPC function test exception:', error);
      return false;
    }
  },

  // Add exercise to workout
  async addExerciseToWorkout(exerciseData: CreateWorkoutExerciseRequest): Promise<WorkoutExercise> {
    try {
      // Get the next order index for this workout
      const { data: existingExercises, error: orderError } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('workout_id', exerciseData.workout_id)
        .order('order_index', { ascending: false })
        .limit(1);
      
      if (orderError) {
        console.error('Error getting order index:', orderError);
        throw new Error(`Failed to get order index: ${orderError.message}`);
      }
      
      const nextOrderIndex = (existingExercises?.[0]?.order_index || 0) + 1;
      
      // Insert the exercise directly
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: exerciseData.workout_id,
          exercise_id: exerciseData.exercise_id,
          order_index: nextOrderIndex,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          weight_kg: exerciseData.weight_kg,
          rest_time_seconds: exerciseData.rest_time_seconds,
          notes: exerciseData.notes
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding exercise to workout:', error);
        throw new Error(`Failed to add exercise: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Exception in addExerciseToWorkout:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  },



  // =====================================================================
  // WORKOUT SESSION OPERATIONS
  // =====================================================================

  // Start a new workout session
  async startWorkoutSession(session: StartWorkoutSessionRequest): Promise<UserWorkoutSession> {
    const { data, error } = await supabase
      .from('user_workout_sessions')
      .insert({
        workout_id: session.workout_id,
        plan_id: session.plan_id,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get active workout session
  async getActiveWorkoutSession(userId: string): Promise<UserWorkoutSessionWithDetails | null> {
    const { data, error } = await supabase
      .from('user_workout_sessions')
      .select(`
        *,
        workout:workouts (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        ),
        plan:workout_plans (*),
        completed_sets (*)
      `)
      .eq('user_id', userId)
      .is('completed_at', null)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Complete a set
  async completeSet(set: CompleteSetRequest): Promise<CompletedSet> {
    const { data, error } = await supabase
      .from('completed_sets')
      .insert({
        ...set,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Complete workout session
  async completeWorkoutSession(session: CompleteWorkoutSessionRequest): Promise<UserWorkoutSession> {
    const { data, error } = await supabase
      .from('user_workout_sessions')
      .update({
        completed_at: new Date().toISOString(),
        total_duration_minutes: session.total_duration_minutes,
        notes: session.notes,
        rating: session.rating
      })
      .eq('id', session.session_id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's workout history
  async getUserWorkoutHistory(userId: string, limit = 20): Promise<UserWorkoutSessionWithDetails[]> {
    // Validate userId
    if (!userId || userId.trim() === '') {
      console.warn('getUserWorkoutHistory: Invalid userId provided');
      return [];
    }

    const { data, error } = await supabase
      .from('user_workout_sessions')
      .select(`
        *,
        workout:workouts (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        ),
        plan:workout_plans (*),
        completed_sets (*)
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // =====================================================================
  // PROGRESS TRACKING OPERATIONS
  // =====================================================================

  // Get user's exercise progress
  async getUserExerciseProgress(userId: string): Promise<UserExerciseProgress[]> {
    // Validate userId
    if (!userId || userId.trim() === '') {
      console.warn('getUserExerciseProgress: Invalid userId provided');
      return [];
    }

    const { data, error } = await supabase
      .from('user_exercise_progress')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update exercise progress
  async updateExerciseProgress(progress: Partial<UserExerciseProgress>): Promise<UserExerciseProgress> {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .upsert(progress, { onConflict: 'user_id,exercise_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // =====================================================================
  // ANALYTICS OPERATIONS
  // =====================================================================

  // Get workout analytics for user
  async getUserWorkoutAnalytics(userId: string): Promise<WorkoutAnalytics> {
    // Validate userId
    if (!userId || userId.trim() === '') {
      console.warn('getUserWorkoutAnalytics: Invalid userId provided');
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        favoriteExercises: [],
        weeklyProgress: [],
        strengthProgress: []
      };
    }

    // Get total sessions and duration
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);
    
    if (sessionsError) throw sessionsError;

    // Get completed sets for favorite exercises
    const sessionIds = sessions?.map(s => s.id) || [];
    let sets: any[] = [];
    
    if (sessionIds.length > 0) {
      const { data: setsData, error: setsError } = await supabase
        .from('completed_sets')
        .select(`
          *,
          exercises (name)
        `)
        .in('session_id', sessionIds);
      
      if (setsError) throw setsError;
      sets = setsData || [];
    }

    // Calculate analytics
    const totalSessions = sessions?.length || 0;
    const totalDuration = sessions?.reduce((sum, s) => sum + (s.total_duration_minutes || 0), 0) || 0;
    const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // Count exercise frequency
    const exerciseCounts: { [key: string]: number } = {};
    sets?.forEach(set => {
      const exerciseName = (set.exercises as any)?.name || 'Unknown';
      exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;
    });

    const favoriteExercises = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    return {
      totalSessions,
      totalDuration,
      averageSessionDuration,
      completionRate: 1, // TODO: Calculate based on started vs completed
      favoriteExercises,
      weeklyProgress: [], // TODO: Calculate weekly breakdown
      strengthProgress: [] // TODO: Calculate strength progression
    };
  },

  // Get exercise-specific analytics
  async getExerciseAnalytics(userId: string, exerciseId: string): Promise<ExerciseAnalytics | null> {
    // Validate userId
    if (!userId || userId.trim() === '') {
      console.warn('getExerciseAnalytics: Invalid userId provided');
      return null;
    }
    const { data: sets, error } = await supabase
      .from('completed_sets')
      .select(`
        *,
        user_workout_sessions!inner(user_id)
      `)
      .eq('exercise_id', exerciseId)
      .eq('user_workout_sessions.user_id', userId);
    
    if (error) throw error;
    if (!sets || sets.length === 0) return null;

    const totalSessions = new Set(sets.map(s => s.session_id)).size;
    const totalSets = sets.length;
    const totalReps = sets.reduce((sum, s) => sum + (s.reps_completed || 0), 0);
    const maxWeight = Math.max(...sets.map(s => s.weight_kg || 0));
    const maxReps = Math.max(...sets.map(s => s.reps_completed || 0));
    const averageWeight = sets.reduce((sum, s) => sum + (s.weight_kg || 0), 0) / sets.length;
    const averageReps = totalReps / totalSets;
    const lastPerformed = sets.sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )[0]?.completed_at || '';

    return {
      exerciseId,
      exerciseName: '', // TODO: Get from exercise lookup
      totalSessions,
      totalSets,
      totalReps,
      maxWeight,
      maxReps,
      averageWeight,
      averageReps,
      lastPerformed,
      progressTrend: 'stable' // TODO: Calculate trend
    };
  },

  // =====================================================================
  // PERSONALIZED PREP WORKOUT PLAN MATCHING
  // =====================================================================

  // Match user with personalized PREP workout plan
  async getPersonalizedPrepPlan(params: {
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    readinessDeadline: Date;
    focusAreas: ('cardio' | 'strength' | 'agility')[];
  }): Promise<{ plan: WorkoutPlan | null; isPlaceholder: boolean; message?: string }> {
    const { fitnessLevel, readinessDeadline, focusAreas } = params;
    
    // Calculate duration in weeks from now to deadline
    const now = new Date();
    const weeksUntilDeadline = Math.ceil((readinessDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    // Determine plan duration based on deadline
    let targetDuration: number;
    if (weeksUntilDeadline <= 4) {
      targetDuration = 4; // Crash plan
    } else if (weeksUntilDeadline <= 8) {
      targetDuration = 8; // Standard plan
    } else {
      targetDuration = 12; // Gradual plan
    }
    
    // Sort focus areas for consistent matching
    const sortedFocusAreas = focusAreas.sort();
    
    try {
      // Query for matching plans
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('target_audience', 'police_candidates')
        .eq('difficulty_level', fitnessLevel)
        .eq('duration_weeks', targetDuration)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          plan: null,
          isPlaceholder: false,
          message: `No ${fitnessLevel} ${targetDuration}-week PREP plans available yet. Check back soon!`
        };
      }
      
      // Find exact match for focus areas
      let bestMatch = data.find(plan => 
        JSON.stringify(plan.focus_areas.sort()) === JSON.stringify(sortedFocusAreas)
      );
      
      // If no exact match, find closest match
      if (!bestMatch) {
        // Try to find plan with at least one matching focus area
        bestMatch = data.find(plan => 
          plan.focus_areas.some((area: string) => sortedFocusAreas.includes(area as 'cardio' | 'strength' | 'agility'))
        );
        
        // If still no match, take the first available plan
        if (!bestMatch && data.length > 0) {
          bestMatch = data[0];
        }
      }
      
      if (!bestMatch) {
        return {
          plan: null,
          isPlaceholder: false,
          message: `No matching ${fitnessLevel} ${targetDuration}-week plan found for your focus areas. Check back soon!`
        };
      }
      
      // Check if this is a placeholder plan
      const isPlaceholder = bestMatch.title.toLowerCase().includes('placeholder');
      
      return {
        plan: bestMatch,
        isPlaceholder,
        message: isPlaceholder 
          ? "This is a placeholder plan. Real content coming soon!"
          : undefined
      };
      
    } catch (error) {
      console.error('Error getting personalized plan:', error);
      return {
        plan: null,
        isPlaceholder: false,
        message: 'Unable to load workout plans. Please try again later.'
      };
    }
  },

  // Get all PREP workout plans for browsing
  async getPrepWorkoutPlans(): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true })
      .order('duration_weeks', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get PREP workout plans by difficulty level
  async getPrepWorkoutPlansByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .eq('difficulty_level', difficulty)
      .eq('is_active', true)
      .order('duration_weeks', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get PREP workout plans by duration
  async getPrepWorkoutPlansByDuration(durationWeeks: number): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .eq('duration_weeks', durationWeeks)
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get PREP workout plans by focus area
  async getPrepWorkoutPlansByFocusArea(focusArea: 'cardio' | 'strength' | 'agility'): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .contains('focus_areas', [focusArea])
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true })
      .order('duration_weeks', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Helper function to check if a plan is a placeholder
  isPlaceholderPlan(plan: WorkoutPlan): boolean {
    return plan.title.toLowerCase().includes('placeholder');
  },

  // Get placeholder plans for development
  async getPlaceholderPlans(): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .ilike('title', '%placeholder%')
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true })
      .order('duration_weeks', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get non-placeholder plans (for when real content is available)
  async getRealPrepPlans(): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('target_audience', 'police_candidates')
      .not('title', 'ilike', '%placeholder%')
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true })
      .order('duration_weeks', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

};

// =====================================================================
// WORKOUT SESSION STATE MANAGEMENT
// =====================================================================

export class WorkoutSessionManager {
  private sessionState: any = null;
  private restTimer: ReturnType<typeof setInterval> | null = null;
  private onStateChange: ((state: any) => void) | null = null;

  constructor(onStateChange?: (state: any) => void) {
    this.onStateChange = onStateChange || null;
  }

  // Initialize session state
  initializeSession(sessionId: string, workout: WorkoutWithExercises) {
    this.sessionState = {
      sessionId,
      workoutId: workout.id,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      completedSets: [],
      sessionStartTime: new Date(),
      isPaused: false,
      notes: ''
    };
    this.notifyStateChange();
  }

  // Complete current set
  async completeCurrentSet() {
    if (!this.sessionState) return;

    const currentExercise = this.sessionState.workout.exercises[this.sessionState.currentExerciseIndex];
    if (!currentExercise) return;

    // Mark set as completed
    const completedSet = {
      session_id: this.sessionState.sessionId,
      workout_exercise_id: currentExercise.id,
      exercise_id: currentExercise.exercise_id,
      set_number: this.sessionState.currentSetIndex + 1,
      completed_at: new Date().toISOString()
    };

    try {
      await workoutService.completeSet(completedSet);
      this.sessionState.completedSets.push(completedSet);
    } catch (error) {
      console.error('Failed to complete set:', error);
    }

    // Move to next set or exercise
    this.sessionState.currentSetIndex++;
    
    if (this.sessionState.currentSetIndex >= currentExercise.sets) {
      // Move to next exercise
      this.sessionState.currentExerciseIndex++;
      this.sessionState.currentSetIndex = 0;
      
      if (this.sessionState.currentExerciseIndex >= this.sessionState.workout.exercises.length) {
        // Workout completed
        this.completeWorkout();
        return;
      }
    }

    // Start rest timer
    this.startRestTimer(currentExercise.rest_time_seconds);
    this.notifyStateChange();
  }

  // Start rest timer
  private startRestTimer(restTimeSeconds: number) {
    this.sessionState.isResting = true;
    this.sessionState.restTimeRemaining = restTimeSeconds;

    this.restTimer = setInterval(() => {
      this.sessionState.restTimeRemaining--;
      
      if (this.sessionState.restTimeRemaining <= 0) {
        this.stopRestTimer();
        this.sessionState.isResting = false;
      }
      
      this.notifyStateChange();
    }, 1000);
  }

  // Stop rest timer
  private stopRestTimer() {
    if (this.restTimer) {
      clearInterval(this.restTimer);
      this.restTimer = null;
    }
  }

  // Skip rest timer
  skipRest() {
    this.stopRestTimer();
    this.sessionState.isResting = false;
    this.sessionState.restTimeRemaining = 0;
    this.notifyStateChange();
  }

  // Pause/resume session
  togglePause() {
    if (!this.sessionState) return;
    
    this.sessionState.isPaused = !this.sessionState.isPaused;
    
    if (this.sessionState.isPaused) {
      this.stopRestTimer();
    } else if (this.sessionState.isResting && this.sessionState.restTimeRemaining > 0) {
      this.startRestTimer(this.sessionState.restTimeRemaining);
    }
    
    this.notifyStateChange();
  }

  // Complete workout
  private async completeWorkout() {
    if (!this.sessionState) return;

    try {
      const duration = Math.floor(
        (new Date().getTime() - this.sessionState.sessionStartTime.getTime()) / 60000
      );

      await workoutService.completeWorkoutSession({
        session_id: this.sessionState.sessionId,
        total_duration_minutes: duration,
        notes: this.sessionState.notes
      });
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  }

  // Get current state
  getState() {
    return this.sessionState;
  }

  // Update notes
  updateNotes(notes: string) {
    if (this.sessionState) {
      this.sessionState.notes = notes;
      this.notifyStateChange();
    }
  }

  // Cleanup
  cleanup() {
    this.stopRestTimer();
    this.sessionState = null;
  }

  private notifyStateChange() {
    if (this.onStateChange && this.sessionState) {
      this.onStateChange({ ...this.sessionState });
    }
  }
}

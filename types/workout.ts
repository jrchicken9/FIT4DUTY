// =====================================================================
// WORKOUT TRACKING SYSTEM TYPES
// =====================================================================

export interface ExerciseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  muscle_groups: string[];
  equipment_needed: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  video_url?: string;
  gif_url?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  focus_areas: string[];
  target_audience?: string;
  created_by?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  day_number: number;
  week_number: number;
  estimated_duration_minutes?: number;
  rest_between_exercises_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_time_seconds: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  plan_id?: string;
  started_at: string;
  completed_at?: string;
  total_duration_minutes?: number;
  notes?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CompletedSet {
  id: string;
  session_id: string;
  workout_exercise_id: string;
  exercise_id: string;
  set_number: number;
  reps_completed?: number;
  weight_kg?: number;
  rest_time_seconds?: number;
  completed_at: string;
  notes?: string;
  created_at: string;
}

export interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  max_weight_kg?: number;
  max_reps?: number;
  max_sets?: number;
  total_volume?: number;
  last_performed_at?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================================
// ENHANCED TYPES WITH RELATIONSHIPS
// =====================================================================

export interface WorkoutWithExercises extends Workout {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
}

export interface WorkoutPlanWithWorkouts extends WorkoutPlan {
  workouts: WorkoutWithExercises[];
}

export interface UserWorkoutSessionWithDetails extends UserWorkoutSession {
  workout: WorkoutWithExercises;
  plan?: WorkoutPlan;
  completed_sets: CompletedSet[];
}

// =====================================================================
// WORKOUT SESSION STATE TYPES
// =====================================================================

export interface WorkoutSessionState {
  sessionId: string;
  workoutId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  completedSets: CompletedSet[];
  sessionStartTime: Date;
  isPaused: boolean;
  notes: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  currentSet: number;
  repsCompleted: number[];
  weightsUsed: number[];
  isCompleted: boolean;
}

// =====================================================================
// WORKOUT CREATION TYPES
// =====================================================================

export interface CreateWorkoutPlanRequest {
  title: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  focus_areas: string[];
  target_audience?: string;
}

export interface CreateWorkoutRequest {
  plan_id: string;
  name: string;
  description?: string;
  day_number: number;
  week_number: number;
  estimated_duration_minutes?: number;
  rest_between_exercises_seconds?: number;
}

export interface CreateWorkoutExerciseRequest {
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_time_seconds?: number;
  notes?: string;
}

// =====================================================================
// WORKOUT SESSION TYPES
// =====================================================================

export interface StartWorkoutSessionRequest {
  workout_id: string;
  plan_id?: string;
}

export interface CompleteSetRequest {
  session_id: string;
  workout_exercise_id: string;
  exercise_id: string;
  set_number: number;
  reps_completed?: number;
  weight_kg?: number;
  rest_time_seconds?: number;
  notes?: string;
}

export interface CompleteWorkoutSessionRequest {
  session_id: string;
  total_duration_minutes?: number;
  notes?: string;
  rating?: number;
}

// =====================================================================
// ANALYTICS TYPES
// =====================================================================

export interface WorkoutAnalytics {
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  completionRate: number;
  favoriteExercises: string[];
  weeklyProgress: {
    week: string;
    sessions: number;
    duration: number;
  }[];
  strengthProgress: {
    exercise: string;
    maxWeight: number;
    maxReps: number;
    lastPerformed: string;
  }[];
}

export interface ExerciseAnalytics {
  exerciseId: string;
  exerciseName: string;
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
  maxReps: number;
  averageWeight: number;
  averageReps: number;
  lastPerformed: string;
  progressTrend: 'improving' | 'declining' | 'stable';
}

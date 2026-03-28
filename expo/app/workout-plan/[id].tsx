import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Play,
  CheckCircle,
  ChevronRight,
  Dumbbell,
  Zap,
  Activity,
  BarChart3,
  Settings,
  Share2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { WorkoutPlan } from '@/types/workout';

const { width } = Dimensions.get('window');

interface DailyWorkout {
  id: string;
  day_number: number;
  week_number: number;
  name: string;
  description: string;
  estimated_duration_minutes: number;
  exercises: WorkoutExercise[];
  completed?: boolean;
  completed_at?: string;
}

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  weight_kg?: number;
  notes?: string;
  completed?: boolean;
}

export default function WorkoutPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [progress, setProgress] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    currentStreak: 0,
    totalMinutes: 0,
  });

  // Memoized computed values
  const weeks = useMemo(() => 
    Array.from(new Set(dailyWorkouts.map(w => w.week_number))).sort((a, b) => a - b),
    [dailyWorkouts]
  );

  const progressPercentage = useMemo(() => {
    if (progress.totalWorkouts === 0) return 0;
    return Math.round((progress.completedWorkouts / progress.totalWorkouts) * 100);
  }, [progress.completedWorkouts, progress.totalWorkouts]);

  // Optimized data loading
  const loadWorkoutPlan = useCallback(async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      
      // Load plan details
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Load daily workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          id,
          day_number,
          week_number,
          name,
          description,
          estimated_duration_minutes,
          rest_between_exercises_seconds,
          workout_exercises (
            id,
            exercise_id,
            sets,
            reps,
            rest_time_seconds,
            weight_kg,
            notes,
            exercises (
              id,
              name,
              description
            )
          )
        `)
        .eq('plan_id', id)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (workoutsError) throw workoutsError;
      
      // Transform the data to match DailyWorkout interface
      const transformedWorkouts: DailyWorkout[] = (workoutsData || []).map(workout => ({
        id: workout.id,
        day_number: workout.day_number,
        week_number: workout.week_number,
        name: workout.name,
        description: workout.description || '',
        estimated_duration_minutes: workout.estimated_duration_minutes,
        completed: false, // Default to false since this field doesn't exist in workouts table
        completed_at: undefined, // Default to undefined since this field doesn't exist in workouts table
        exercises: (workout.workout_exercises || []).map((we: any) => ({
          id: we.id,
          exercise_id: we.exercise_id,
          exercise_name: we.exercises?.name || 'Unknown Exercise',
          sets: we.sets,
          reps: we.reps,
          rest_time_seconds: we.rest_time_seconds,
          weight_kg: we.weight_kg,
          notes: we.notes,
          completed: false, // Default to false since this field doesn't exist
        })),
      }));
      
      setDailyWorkouts(transformedWorkouts);

      // Calculate progress
      const totalWorkouts = transformedWorkouts.length;
      const completedWorkouts = 0; // Since we don't track completion in workouts table yet
      const totalMinutes = transformedWorkouts.reduce((sum, w) => sum + (w.estimated_duration_minutes || 0), 0);

      setProgress({
        totalWorkouts,
        completedWorkouts,
        currentStreak: 0, // TODO: Calculate streak
        totalMinutes,
      });

    } catch (error) {
      console.error('Error loading workout plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkoutPlan();
    setRefreshing(false);
  }, [loadWorkoutPlan]);

  const handleViewWorkoutDetails = useCallback((workout: DailyWorkout) => {
    router.push(`/workout/${workout.id}`);
  }, []);

  const getWeekWorkouts = useCallback((weekNumber: number) => {
    return dailyWorkouts.filter(w => w.week_number === weekNumber);
  }, [dailyWorkouts]);

  const getFocusAreaColor = useCallback((area: string) => {
    const colors = {
      strength: Colors.primary,
      cardio: Colors.error,
      flexibility: Colors.success,
      balance: Colors.warning,
    };
    return colors[area as keyof typeof colors] || Colors.primary;
  }, []);

  useEffect(() => {
    loadWorkoutPlan();
  }, [loadWorkoutPlan]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your workout plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout plan not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Plan Info */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
            
            <View style={styles.planMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={Colors.white} />
                <Text style={styles.metaText}>{plan.duration_weeks} weeks</Text>
              </View>
              <View style={styles.metaItem}>
                <Target size={16} color={Colors.white} />
                <Text style={styles.metaText}>{plan.difficulty_level}</Text>
              </View>
              <View style={styles.metaItem}>
                <Dumbbell size={16} color={Colors.white} />
                <Text style={styles.metaText}>{progress.totalWorkouts} workouts</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.progressPercentage}>{progressPercentage}% Complete</Text>
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.progressCard}>
            <View style={styles.progressIcon}>
              <CheckCircle size={24} color={Colors.primary} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>{progress.completedWorkouts}</Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressIcon}>
              <Zap size={24} color={Colors.primary} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>{progress.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressIcon}>
              <Clock size={24} color={Colors.primary} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>{progress.totalMinutes}</Text>
              <Text style={styles.progressLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Focus Areas */}
      {plan.focus_areas && plan.focus_areas.length > 0 && (
        <View style={styles.focusSection}>
          <Text style={styles.sectionTitle}>Focus Areas</Text>
          <View style={styles.focusTags}>
            {plan.focus_areas.map((area, index) => (
              <View 
                key={index} 
                style={[
                  styles.focusTag,
                  { backgroundColor: getFocusAreaColor(area) + '20' }
                ]}
              >
                <Text style={[
                  styles.focusTagText,
                  { color: getFocusAreaColor(area) }
                ]}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Weekly Workouts */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Your Workout Schedule</Text>
        
        {weeks.map((week) => (
          <View key={week} style={styles.weekContainer}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>Week {week}</Text>
              <TouchableOpacity
                style={styles.weekToggle}
                onPress={() => setCurrentWeek(currentWeek === week ? 0 : week)}
              >
                <ChevronRight 
                  size={20} 
                  color={Colors.textSecondary}
                  style={[
                    styles.weekToggleIcon,
                    { transform: [{ rotate: currentWeek === week ? '90deg' : '0deg' }] }
                  ]}
                />
              </TouchableOpacity>
            </View>
            
            {currentWeek === week && (
              <View style={styles.weekWorkouts}>
                {getWeekWorkouts(week).map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutCard}
                    onPress={() => handleViewWorkoutDetails(workout)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.workoutHeader}>
                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutDay}>Day {workout.day_number}</Text>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutDescription}>
                          {workout.description}
                        </Text>
                      </View>
                      
                      <View style={styles.workoutActions}>
                        {workout.completed ? (
                          <View style={styles.completedBadge}>
                            <CheckCircle size={20} color={Colors.primary} />
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => handleViewWorkoutDetails(workout)}
                          >
                            <Play size={20} color={Colors.white} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.exercisePreview}>
                      <Text style={styles.exercisePreviewTitle}>Preview:</Text>
                      <Text style={styles.exercisePreviewText}>
                        {workout.exercises?.slice(0, 3).map(ex => ex.exercise_name).join(', ')}
                        {workout.exercises && workout.exercises.length > 3 && '...'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <BarChart3 size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>View Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Settings size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Plan Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Share2 size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Share Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  contentContainer: {
    paddingBottom: 100,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  } as ViewStyle,
  loadingText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: spacing.md,
  } as TextStyle,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: spacing.lg,
  } as ViewStyle,
  errorText: {
    ...typography.headingMedium,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  } as TextStyle,
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  backButtonText: {
    ...typography.labelMedium,
    color: Colors.primary,
  } as TextStyle,
  headerGradient: {
    paddingTop: 100,
    paddingBottom: spacing.lg,
  } as ViewStyle,
  header: {
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  headerContent: {
    marginTop: spacing.md,
  } as ViewStyle,
  planTitle: {
    ...typography.headingLarge,
    color: Colors.white,
    marginBottom: spacing.sm,
  } as TextStyle,
  planDescription: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    marginBottom: spacing.lg,
  } as TextStyle,
  planMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  } as ViewStyle,
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  } as ViewStyle,
  metaText: {
    ...typography.labelSmall,
    color: Colors.white,
  } as TextStyle,
  progressSection: {
    margin: spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.level2,
  } as ViewStyle,
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,
  sectionTitle: {
    ...typography.headingMedium,
    color: Colors.text,
  } as TextStyle,
  progressPercentage: {
    ...typography.labelMedium,
    color: Colors.primary,
    fontWeight: '700',
  } as TextStyle,
  progressStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  } as ViewStyle,
  progressCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
  } as ViewStyle,
  progressIcon: {
    marginBottom: spacing.sm,
  } as ViewStyle,
  progressInfo: {
    alignItems: 'center',
  } as ViewStyle,
  progressNumber: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '800',
  } as TextStyle,
  progressLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  } as TextStyle,
  progressBarContainer: {
    marginTop: spacing.md,
  } as ViewStyle,
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  } as ViewStyle,
  focusSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  } as ViewStyle,
  focusTag: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  } as ViewStyle,
  focusTagText: {
    ...typography.labelSmall,
    fontWeight: '600',
  } as TextStyle,
  workoutsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,
  weekContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.level2,
  } as ViewStyle,
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  } as ViewStyle,
  weekTitle: {
    ...typography.headingSmall,
    color: Colors.text,
  } as TextStyle,
  weekToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  weekToggleIcon: {
    // Animation handled by transform prop
  } as ViewStyle,
  weekWorkouts: {
    padding: spacing.lg,
  } as ViewStyle,
  workoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  } as ViewStyle,
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  } as ViewStyle,
  workoutInfo: {
    flex: 1,
  } as ViewStyle,
  workoutDay: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,
  workoutName: {
    ...typography.headingSmall,
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  workoutDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  } as TextStyle,
  workoutActions: {
    alignItems: 'center',
  } as ViewStyle,
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  exercisePreview: {
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    paddingTop: spacing.sm,
  } as ViewStyle,
  exercisePreviewTitle: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,
  exercisePreviewText: {
    ...typography.bodySmall,
    color: Colors.text,
    lineHeight: 18,
  } as TextStyle,
  actionsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  } as ViewStyle,
  actionButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.level2,
  } as ViewStyle,
  actionIcon: {
    marginBottom: spacing.xs,
  } as ViewStyle,
  actionText: {
    ...typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  bottomSpacing: {
    height: 20,
  } as ViewStyle,
});

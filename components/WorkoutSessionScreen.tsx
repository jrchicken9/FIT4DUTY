import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  Target,
  ArrowLeft,
  Activity,
  Lightbulb
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService, WorkoutSessionManager } from '@/lib/workoutService';
import { WorkoutWithExercises, WorkoutSessionState } from '@/types/workout';
import ExerciseTipsCard from './ExerciseTipsCard';

interface WorkoutSessionScreenProps {
  workoutId: string;
  sessionId: string;
}

const { width, height } = Dimensions.get('window');

const WorkoutSessionScreen = React.memo(function WorkoutSessionScreen({ workoutId, sessionId }: WorkoutSessionScreenProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [sessionState, setSessionState] = useState<WorkoutSessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const sessionManager = useRef<WorkoutSessionManager | null>(null);

  useEffect(() => {
    loadWorkout();
    initializeSessionManager();
    
    return () => {
      if (sessionManager.current) {
        sessionManager.current.cleanup();
      }
    };
  }, []);

  const loadWorkout = async () => {
    try {
      const workoutData = await workoutService.getWorkoutById(workoutId);
      setWorkout(workoutData);
    } catch (error) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const initializeSessionManager = () => {
    sessionManager.current = new WorkoutSessionManager((state) => {
      setSessionState(state);
    });
  };

  const startWorkout = async () => {
    if (!workout) return;

    try {
      sessionManager.current?.initializeSession(sessionId, workout);
    } catch (error) {
      console.error('Failed to start workout:', error);
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  const completeSet = async () => {
    if (!sessionManager.current) return;
    await sessionManager.current.completeCurrentSet();
  };

  const skipRest = () => {
    sessionManager.current?.skipRest();
  };

  const togglePause = () => {
    sessionManager.current?.togglePause();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentExercise = () => {
    if (!sessionState || !workout) return null;
    return workout.exercises[sessionState.currentExerciseIndex];
  };

  const getProgressPercentage = () => {
    if (!sessionState || !workout) return 0;
    const totalExercises = workout.exercises.length;
    return ((sessionState.currentExerciseIndex + 1) / totalExercises) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = getCurrentExercise();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutSubtitle}>
            Exercise {sessionState?.currentExerciseIndex ? sessionState.currentExerciseIndex + 1 : 1} of {workout.exercises.length}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowTips(!showTips)}
          >
            <Lightbulb size={20} color={showTips ? Colors.warning : Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={togglePause}
          >
            {sessionState?.isPaused ? (
              <Play size={20} color={Colors.white} />
            ) : (
              <Pause size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getProgressPercentage())}% Complete
        </Text>
      </View>

      {/* Rest Timer */}
      {sessionState?.isResting && (
        <View style={styles.restTimerContainer}>
          <LinearGradient
            colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
            style={styles.restTimerGradient}
          >
            <Clock size={48} color={Colors.white} />
            <Text style={styles.restTimerText}>
              {formatTime(sessionState.restTimeRemaining)}
            </Text>
            <Text style={styles.restTimerLabel}>Rest Time</Text>
            
            {/* Next Exercise Preview */}
            {workout && sessionState.currentExerciseIndex < workout.exercises.length - 1 && (
              <View style={styles.nextExercisePreview}>
                <Text style={styles.nextExerciseLabel}>Next: {workout.exercises[sessionState.currentExerciseIndex + 1].exercise.name}</Text>
                <Text style={styles.nextExerciseDetails}>
                  {workout.exercises[sessionState.currentExerciseIndex + 1].sets} sets × {workout.exercises[sessionState.currentExerciseIndex + 1].reps} reps
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.skipRestButton}
              onPress={skipRest}
            >
              <SkipForward size={20} color={Colors.white} />
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Next Exercise Tips (during rest) */}
      {sessionState?.isResting && workout && sessionState.currentExerciseIndex < workout.exercises.length - 1 && (
        <ExerciseTipsCard
          exerciseName={workout.exercises[sessionState.currentExerciseIndex + 1].exercise.name}
          exerciseTips={workout.exercises[sessionState.currentExerciseIndex + 1].exercise.instructions ? [workout.exercises[sessionState.currentExerciseIndex + 1].exercise.instructions].filter((tip): tip is string => Boolean(tip)) : []}
          muscleGroups={workout.exercises[sessionState.currentExerciseIndex + 1].exercise.muscle_groups}
          difficultyLevel={workout.exercises[sessionState.currentExerciseIndex + 1].exercise.difficulty_level}
          isVisible={showTips}
          onToggle={() => setShowTips(!showTips)}
          isNextExercise={true}
        />
      )}

      {/* Current Exercise */}
      {currentExercise && (
        <ScrollView style={styles.exerciseContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIcon}>
                <Target size={24} color={Colors.primary} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  {currentExercise.exercise.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {currentExercise.sets} sets × {currentExercise.reps} reps
                  {currentExercise.weight_kg && ` @ ${currentExercise.weight_kg}kg`}
                </Text>
              </View>
            </View>

            {currentExercise.exercise.instructions && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>
                  {currentExercise.exercise.instructions}
                </Text>
              </View>
            )}

            {/* Set Progress */}
            <View style={styles.setProgressContainer}>
              <Text style={styles.setProgressTitle}>
                Set {sessionState?.currentSetIndex ? sessionState.currentSetIndex + 1 : 1} of {currentExercise.sets}
              </Text>
              
              <View style={styles.setButtons}>
                {Array.from({ length: currentExercise.sets }, (_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.setButton,
                      index < (sessionState?.currentSetIndex || 0) && styles.setButtonCompleted,
                      index === (sessionState?.currentSetIndex || 0) && styles.setButtonCurrent
                    ]}
                  >
                    {index < (sessionState?.currentSetIndex || 0) ? (
                      <CheckCircle size={16} color={Colors.white} />
                    ) : (
                      <Text style={styles.setButtonText}>{index + 1}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Tips Section */}
            <View style={styles.quickTipsContainer}>
              <View style={styles.quickTipsHeader}>
                <Lightbulb size={16} color={Colors.primary} />
                <Text style={styles.quickTipsTitle}>Quick Tips</Text>
                <TouchableOpacity 
                  style={styles.tipsToggleButton}
                  onPress={() => setShowTips(!showTips)}
                >
                  <Text style={styles.tipsToggleText}>
                    {showTips ? 'Hide' : 'Show'} Full Tips
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.quickTipsText}>
                {currentExercise.exercise.name === 'Bicycle Crunches' 
                  ? 'Keep your lower back pressed to the ground and bring your elbow to the opposite knee in a controlled motion.'
                  : 'Focus on proper form and controlled movement. Breathe steadily throughout the exercise.'
                }
              </Text>
            </View>
          </View>

          {/* Exercise Tips Card */}
          <ExerciseTipsCard
            exerciseName={currentExercise.exercise.name}
            exerciseTips={currentExercise.exercise.instructions ? [currentExercise.exercise.instructions] : undefined}
            muscleGroups={currentExercise.exercise.muscle_groups}
            difficultyLevel={currentExercise.exercise.difficulty_level}
            isVisible={showTips}
            onToggle={() => setShowTips(!showTips)}
          />

          {/* Complete Set Button */}
          {!sessionState?.isResting && (
            <TouchableOpacity 
              style={styles.completeSetButton}
              onPress={completeSet}
            >
              <LinearGradient
                colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
                style={styles.completeSetGradient}
              >
                <CheckCircle size={24} color={Colors.white} />
                <Text style={styles.completeSetText}>Complete Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Start Workout Button */}
      {!sessionState && (
        <View style={styles.startContainer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={startWorkout}
          >
            <LinearGradient
              colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
              style={styles.startButtonGradient}
            >
              <Play size={24} color={Colors.white} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: Colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.h2,
    color: Colors.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.primary,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  workoutTitle: {
    ...typography.h3,
    color: Colors.white,
    fontWeight: '700',
  },
  workoutSubtitle: {
    ...typography.caption,
    color: Colors.white + 'CC',
    marginTop: spacing.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  restTimerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  restTimerGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium,
  },
  restTimerText: {
    ...typography.h1,
    color: Colors.white,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  restTimerLabel: {
    ...typography.body,
    color: Colors.white + 'CC',
    marginTop: spacing.xs,
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  skipRestText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  nextExercisePreview: {
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  nextExerciseLabel: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nextExerciseDetails: {
    ...typography.caption,
    color: Colors.white + 'CC',
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  exerciseCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  exerciseDetails: {
    ...typography.body,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  instructionsContainer: {
    marginBottom: spacing.lg,
  },
  instructionsTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  instructionsText: {
    ...typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  setProgressContainer: {
    marginBottom: spacing.lg,
  },
  setProgressTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  setButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  setButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setButtonCompleted: {
    backgroundColor: Colors.success,
  },
  setButtonCurrent: {
    backgroundColor: Colors.primary,
  },
  setButtonText: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  quickTipsContainer: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  quickTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickTipsTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: spacing.xs,
    flex: 1,
  },
  tipsToggleButton: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tipsToggleText: {
    ...typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickTipsText: {
    ...typography.body,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  completeSetButton: {
    marginBottom: spacing.xl,
  },
  completeSetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  completeSetText: {
    ...typography.h3,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  startContainer: {
    padding: spacing.lg,
  },
  startButton: {
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  startButtonText: {
    ...typography.h3,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});

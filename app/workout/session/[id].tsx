import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import workouts from '@/constants/workouts';
import { useFitness } from '@/context/FitnessContext';

const { width } = Dimensions.get('window');

type WorkoutPhase = 'warmup' | 'exercise' | 'rest' | 'complete';

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saveWorkoutSession } = useFitness();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<WorkoutPhase>('warmup');
  const [timeRemaining, setTimeRemaining] = useState(10); // warmup time
  const [isRunning, setIsRunning] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workout = workouts.find((w) => w.id === id);

  const handlePhaseComplete = () => {
    switch (phase) {
      case 'warmup':
        setPhase('exercise');
        setTimeRemaining(0);
        setIsRunning(false);
        break;
      case 'exercise':
        if (isLastSet && isLastExercise) {
          setPhase('complete');
          setIsRunning(false);
        } else {
          setPhase('rest');
          setTimeRemaining(currentExercise.restTime);
          setIsRunning(true);
        }
        break;
      case 'rest':
        if (isLastSet) {
          setCurrentExerciseIndex((prev) => prev + 1);
          setCurrentSet(1);
        } else {
          setCurrentSet((prev) => prev + 1);
        }
        setPhase('exercise');
        setTimeRemaining(0);
        setIsRunning(false);
        break;
    }
  };

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
        setTotalWorkoutTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const isLastSet = currentSet === currentExercise.sets;



  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleSkip = () => {
    handlePhaseComplete();
  };

  const handleReset = () => {
    setTimeRemaining(phase === 'rest' ? currentExercise.restTime : 10);
  };

  const handleComplete = () => {
    saveWorkoutSession({
      id: `${workout.id}-${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      date: new Date().toISOString(),
      duration: Math.floor(totalWorkoutTime / 60), // Convert seconds to minutes
      exercises: workout.exercises.map(exercise => ({
        exerciseId: exercise.id || exercise.name,
        exerciseName: exercise.name,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          reps: typeof exercise.reps === 'number' ? exercise.reps : 0,
          completed: true,
        })),
        restTime: exercise.restTime,
      })),
      completed: true,
    });
    Alert.alert(
      'Workout Complete!',
      `Great job! You completed ${workout.title} in ${Math.floor(totalWorkoutTime / 60)}:${(totalWorkoutTime % 60).toString().padStart(2, '0')}`,
      [
        {
          text: 'Done',
          onPress: () => router.replace('/(tabs)/fitness'),
        },
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Workout?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'warmup':
        return 'Warm Up';
      case 'exercise':
        return currentExercise.name;
      case 'rest':
        return 'Rest Time';
      case 'complete':
        return 'Workout Complete!';
    }
  };

  const getPhaseSubtitle = () => {
    switch (phase) {
      case 'warmup':
        return 'Get ready to start your workout';
      case 'exercise':
        return `Set ${currentSet} of ${currentExercise.sets} • ${currentExercise.reps} reps`;
      case 'rest':
        return `Next: ${isLastSet ? (isLastExercise ? 'Workout Complete' : workout.exercises[currentExerciseIndex + 1].name) : currentExercise.name}`;
      case 'complete':
        return `You completed all ${workout.exercises.length} exercises!`;
    }
  };

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.completeContainer}>
          <CheckCircle size={80} color={Colors.accent} />
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          <Text style={styles.completeSubtitle}>
            Total time: {formatTime(totalWorkoutTime)}
          </Text>
          <Text style={styles.completeDescription}>
            Great job completing {workout.title}! Your progress has been saved.
          </Text>
          
          <TouchableOpacity style={styles.doneButton} onPress={handleComplete}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <X size={24} color={Colors.text} />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${((currentExerciseIndex * currentExercise.sets + currentSet - 1) / 
                  (workout.exercises.reduce((acc, ex) => acc + ex.sets, 0))) * 100}%`
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
        </Text>
      </View>

      {/* Exercise Image */}
      {phase === 'exercise' && currentExercise.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentExercise.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        {(phase === 'warmup' || phase === 'rest') && (
          <View style={styles.timerCircle}>
            <View style={styles.timerRing}>
              <View 
                style={[
                  styles.timerProgress,
                  {
                    transform: [
                      { rotate: `${((phase === 'warmup' ? 10 : currentExercise.restTime) - timeRemaining) / (phase === 'warmup' ? 10 : currentExercise.restTime) * 360}deg` }
                    ]
                  }
                ]}
              />
            </View>
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{timeRemaining}</Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
          </View>
        )}
        
        {phase === 'exercise' && (
          <View style={styles.exerciseInfo}>
            <View style={styles.exerciseIconContainer}>
              <Target size={64} color={Colors.white} />
            </View>
            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
            <View style={styles.exerciseMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{currentExercise.reps}</Text>
                <Text style={styles.metricLabel}>reps</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{currentSet}</Text>
                <Text style={styles.metricLabel}>of {currentExercise.sets}</Text>
              </View>
            </View>
            {currentExercise.tips && currentExercise.tips.length > 0 && (
              <View style={styles.tipContainer}>
                <Text style={styles.exerciseTip}>
                  💡 {currentExercise.tips[0]}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Phase Info */}
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseTitle}>{getPhaseTitle()}</Text>
        <Text style={styles.phaseSubtitle}>{getPhaseSubtitle()}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {phase === 'exercise' ? (
          <TouchableOpacity 
            style={styles.completeSetButton} 
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <CheckCircle size={28} color={Colors.white} />
            <Text style={styles.completeSetText}>Complete Set</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.playButton]} 
              onPress={isRunning ? handlePause : handleStart}
              activeOpacity={0.8}
            >
              {isRunning ? (
                <Pause size={36} color={Colors.white} />
              ) : (
                <Play size={36} color={Colors.white} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <SkipForward size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Workout Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{formatTime(totalWorkoutTime)}</Text>
        </View>
        <View style={styles.statItem}>
          <Target size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>
            {currentExerciseIndex + 1}/{workout.exercises.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  exerciseImage: {
    width: width * 0.8,
    height: 200,
    borderRadius: 12,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timerCircle: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.gray[200],
    overflow: 'hidden',
  },
  timerProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: Colors.primary,
    transformOrigin: 'right center',
  },
  timerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timerLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  exerciseInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  exerciseIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  exerciseMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[300],
    marginHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseTip: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  phaseContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  phaseSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
  },
  completeSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 60,
  },
  completeSetText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  completeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});
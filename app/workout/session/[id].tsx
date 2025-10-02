import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from 'expo-location';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Timer,
  Target,
  CheckCircle,
  Circle,
  ChevronRight,
  X,
  RotateCcw,
  Volume2,
  Settings,
  Lightbulb,
  MapPin,
  Navigation,
  Clock,
  Activity,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { borderRadius, shadows } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

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

interface WorkoutSession {
  id: string;
  name: string;
  description: string;
  estimated_duration_minutes: number;
  exercises: WorkoutExercise[];
}

interface RunningSession {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number;
  distance: number;
  pace: number;
  currentLocation: Location.LocationObject | null;
  route: Location.LocationObject[];
  targetDistance?: number;
  targetTime?: number;
}

interface ManualRunInput {
  distance: string;
  time: string;
  pace: string;
}

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  // Running specific state
  const [runningSession, setRunningSession] = useState<RunningSession>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    distance: 0,
    pace: 0,
    currentLocation: null,
    route: [],
  });
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState<ManualRunInput>({
    distance: '',
    time: '',
    pace: '',
  });
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (id) {
      loadWorkoutSession();
    }
  }, [id]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  // Running session timer
  useEffect(() => {
    let interval: number | undefined;
    if (runningSession.isRunning) {
      interval = setInterval(() => {
        setRunningSession(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runningSession.isRunning]);

  const loadWorkoutSession = async () => {
    try {
      setLoading(true);
      
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercises (
              name,
              description,
              muscle_groups,
              equipment_needed
            )
          )
        `)
        .eq('id', id)
        .single();

      if (workoutError) throw workoutError;

      const transformedSession: WorkoutSession = {
        id: workoutData.id,
        name: workoutData.name,
        description: workoutData.description || '',
        estimated_duration_minutes: workoutData.estimated_duration_minutes,
        exercises: (workoutData.workout_exercises || []).map((we: any) => ({
          id: we.id,
          exercise_id: we.exercise_id,
          exercise_name: we.exercises?.name || 'Unknown Exercise',
          sets: we.sets,
          reps: we.reps,
          rest_time_seconds: we.rest_time_seconds,
          weight_kg: we.weight_kg,
          notes: we.notes,
        })),
      };

      setSession(transformedSession);
    } catch (error) {
      console.error('Error loading workout session:', error);
      Alert.alert('Error', 'Failed to load workout session');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    setIsActive(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
  };

  const handlePauseWorkout = () => {
    setIsActive(false);
  };

  const handleResumeWorkout = () => {
    setIsActive(true);
  };

  const handleCompleteSet = () => {
    const currentExercise = session?.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      // Start rest timer
      setIsResting(true);
      setTimeRemaining(currentExercise.rest_time_seconds);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < (session?.exercises.length || 0) - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        const nextExercise = session?.exercises[currentExerciseIndex + 1];
        if (nextExercise) {
          setIsResting(true);
          setTimeRemaining(nextExercise.rest_time_seconds);
        }
      } else {
        // Workout complete
        handleCompleteWorkout();
      }
    }
  };

  const handleCompleteWorkout = () => {
    Alert.alert(
      'Workout Complete!',
      'Great job! You\'ve completed your workout.',
      [
        {
          text: 'View Summary',
          onPress: () => router.push(`/workout/summary/${id}`),
        },
        {
          text: 'Back to Plan',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (secondsPerKm: number) => {
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.floor(secondsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setLocationPermission(true);
      return true;
    } else {
      Alert.alert('Permission Denied', 'Location permission is required for GPS tracking.');
      return false;
    }
  };

  const startLocationTracking = async () => {
    if (!locationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }

    try {
      await Location.enableNetworkProviderAsync();
      
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          setRunningSession(prev => {
            const newRoute = [...prev.route, location];
            const newDistance = calculateTotalDistance(newRoute);
            const newPace = prev.elapsedTime > 0 ? (prev.elapsedTime / newDistance) * 1000 : 0;
            
            return {
              ...prev,
              currentLocation: location,
              route: newRoute,
              distance: newDistance,
              pace: newPace,
            };
          });
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('GPS Error', 'Unable to start GPS tracking. Please check your location settings.');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const calculateTotalDistance = (route: Location.LocationObject[]): number => {
    if (route.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      // Note: Location.distanceBetween is not available in expo-location
      // Using a simple calculation for now - replace with proper distance calculation
      totalDistance += 0; // TODO: Implement proper distance calculation
      // TODO: Implement proper distance calculation using coordinates
      // const distance = calculateDistance(
      //   prev.coords.latitude,
      //   prev.coords.longitude,
      //   curr.coords.latitude,
      //   curr.coords.longitude
      // );
      // totalDistance += distance;
    }
    return totalDistance;
  };

  const startRunningSession = () => {
    setRunningSession(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(),
      elapsedTime: 0,
      distance: 0,
      route: [],
    }));
    startLocationTracking();
  };

  const stopRunningSession = () => {
    stopLocationTracking();
    setRunningSession(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const pauseRunningSession = () => {
    stopLocationTracking();
    setRunningSession(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const resumeRunningSession = () => {
    setRunningSession(prev => ({
      ...prev,
      isRunning: true,
    }));
    startLocationTracking();
  };

  const handleManualInput = () => {
    const distance = parseFloat(manualInput.distance);
    const time = parseFloat(manualInput.time);
    
    if (isNaN(distance) || isNaN(time)) {
      Alert.alert('Invalid Input', 'Please enter valid distance and time values.');
      return;
    }

    const pace = (time / distance) * 1000; // seconds per km
    
    setRunningSession(prev => ({
      ...prev,
      distance,
      elapsedTime: time * 60, // convert minutes to seconds
      pace,
    }));
    
    setShowManualInput(false);
    setManualInput({ distance: '', time: '', pace: '' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / session.exercises.length) * 100;
  const isRunningExercise = currentExercise?.exercise_name.toLowerCase().includes('run') || 
                           currentExercise?.exercise_name.toLowerCase().includes('shuttle');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.workoutTitle}>{session.name}</Text>
            <Text style={styles.workoutSubtitle}>
              {currentExerciseIndex + 1} of {session.exercises.length} exercises
            </Text>
          </View>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progress}%` }]} 
          />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isActive ? (
          /* Pre-workout Screen */
          <View style={styles.preWorkoutContainer}>
            <View style={styles.workoutOverview}>
              <Text style={styles.overviewTitle}>Ready to start?</Text>
              <Text style={styles.overviewSubtitle}>{session.name}</Text>
              
              <View style={styles.overviewStats}>
                <View style={styles.statItem}>
                  <Target size={20} color={Colors.primary} />
                  <Text style={styles.statText}>{session.exercises.length} exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <Timer size={20} color={Colors.primary} />
                  <Text style={styles.statText}>{session.estimated_duration_minutes} min</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
            >
              <Play size={24} color={Colors.white} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Active Workout Screen */
          <View style={styles.activeWorkoutContainer}>
            {isResting ? (
              /* Rest Timer */
              <View style={styles.restContainer}>
                <Text style={styles.restTitle}>Rest Time</Text>
                <Text style={styles.restTimer}>{formatTime(timeRemaining)}</Text>
                <Text style={styles.restSubtitle}>Next: {currentExercise?.exercise_name}</Text>
                
                {/* Next Exercise Tips */}
                <View style={styles.nextExerciseTips}>
                  <View style={styles.tipsHeader}>
                    <Lightbulb size={16} color={Colors.primary} />
                    <Text style={styles.tipsTitle}>Next Exercise Tips</Text>
                    <TouchableOpacity 
                      style={styles.tipsToggleButton}
                      onPress={() => setShowTips(!showTips)}
                    >
                      <Text style={styles.tipsToggleText}>
                        {showTips ? 'Hide Tips' : 'Show Tips'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {showTips && currentExercise && (
                    <Text style={styles.tipsText}>
                      {currentExercise.exercise_name === 'Bicycle Crunches' 
                        ? 'Prepare for core work! Keep your lower back pressed to the ground and focus on controlled movements.'
                        : 'Get ready for the next exercise. Focus on proper form and breathing.'
                      }
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.skipRestButton}
                  onPress={handleSkipRest}
                >
                  <SkipForward size={20} color={Colors.primary} />
                  <Text style={styles.skipRestText}>Skip Rest</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Exercise Screen */
              <View style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>{currentExercise?.exercise_name}</Text>
                  <Text style={styles.exerciseSubtitle}>
                    Set {currentSet} of {currentExercise?.sets}
                  </Text>
                </View>
                
                {isRunningExercise ? (
                  /* Running Exercise UI */
                  <View style={styles.runningContainer}>
                    {/* Timer Display */}
                    <View style={styles.runningTimerContainer}>
                      <Text style={styles.runningTimer}>
                        {formatTime(runningSession.elapsedTime)}
                      </Text>
                      <Text style={styles.runningTimerLabel}>Elapsed Time</Text>
                    </View>
                    
                    {/* Running Stats */}
                    <View style={styles.runningStats}>
                      <View style={styles.runningStatCard}>
                        <Navigation size={20} color={Colors.primary} />
                        <Text style={styles.runningStatValue}>
                          {(runningSession.distance / 1000).toFixed(2)} km
                        </Text>
                        <Text style={styles.runningStatLabel}>Distance</Text>
                      </View>
                      
                      <View style={styles.runningStatCard}>
                        <Activity size={20} color={Colors.primary} />
                        <Text style={styles.runningStatValue}>
                          {formatPace(runningSession.pace)}
                        </Text>
                        <Text style={styles.runningStatLabel}>Pace</Text>
                      </View>
                    </View>
                    
                    {/* GPS Status */}
                    <View style={styles.gpsStatusContainer}>
                      <MapPin size={16} color={locationPermission ? Colors.success : Colors.error} />
                      <Text style={styles.gpsStatusText}>
                        {locationPermission ? 'GPS Active' : 'GPS Inactive'}
                      </Text>
                    </View>
                    
                    {/* Running Controls */}
                    <View style={styles.runningControls}>
                      {!runningSession.isRunning ? (
                        <TouchableOpacity
                          style={styles.startRunningButton}
                          onPress={startRunningSession}
                        >
                          <Play size={24} color={Colors.white} />
                          <Text style={styles.startRunningText}>Start Run</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.runningControlButtons}>
                          <TouchableOpacity
                            style={styles.pauseRunningButton}
                            onPress={pauseRunningSession}
                          >
                            <Pause size={24} color={Colors.white} />
                            <Text style={styles.pauseRunningText}>Pause</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.stopRunningButton}
                            onPress={stopRunningSession}
                          >
                            <X size={24} color={Colors.white} />
                            <Text style={styles.stopRunningText}>Stop</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    {/* Manual Input Option */}
                    <TouchableOpacity
                      style={styles.manualInputButton}
                      onPress={() => setShowManualInput(true)}
                    >
                      <Text style={styles.manualInputText}>Enter Results Manually</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Regular Exercise UI */
                  <>
                    <View style={styles.exerciseDetails}>
                      <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Reps</Text>
                        <Text style={styles.detailValue}>{currentExercise?.reps}</Text>
                      </View>
                      
                      {currentExercise?.weight_kg && (
                        <View style={styles.detailCard}>
                          <Text style={styles.detailLabel}>Weight</Text>
                          <Text style={styles.detailValue}>{currentExercise.weight_kg} kg</Text>
                        </View>
                      )}
                      
                      <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Rest</Text>
                        <Text style={styles.detailValue}>{currentExercise?.rest_time_seconds}s</Text>
                      </View>
                    </View>
                    
                    {currentExercise?.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{currentExercise.notes}</Text>
                      </View>
                    )}

                    {/* Exercise Tips Section */}
                    <View style={styles.tipsContainer}>
                      <View style={styles.tipsHeader}>
                        <Lightbulb size={16} color={Colors.primary} />
                        <Text style={styles.tipsTitle}>Exercise Tips</Text>
                        <TouchableOpacity 
                          style={styles.tipsToggleButton}
                          onPress={() => setShowTips(!showTips)}
                        >
                          <Text style={styles.tipsToggleText}>
                            {showTips ? 'Hide Tips' : 'Show Tips'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {showTips && (
                        <Text style={styles.tipsText}>
                          {currentExercise?.exercise_name === 'Bicycle Crunches' 
                            ? 'Keep your lower back pressed to the ground and bring your elbow to the opposite knee in a controlled motion. Focus on engaging your core throughout the movement.'
                            : 'Focus on proper form and controlled movement. Breathe steadily throughout the exercise and maintain good posture.'
                          }
                        </Text>
                      )}
                    </View>
                  </>
                )}
                
                <TouchableOpacity
                  style={styles.completeSetButton}
                  onPress={handleCompleteSet}
                >
                  <CheckCircle size={24} color={Colors.white} />
                  <Text style={styles.completeSetText}>Complete Set</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Control Bar */}
      {isActive && (
        <View style={styles.controlBar}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={isActive ? handlePauseWorkout : handleResumeWorkout}
          >
            {isActive ? (
              <Pause size={24} color={Colors.primary} />
            ) : (
              <Play size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setTimeRemaining(0)}
          >
            <RotateCcw size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Alert.alert('End Workout', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'End', style: 'destructive', onPress: () => router.back() },
            ])}
          >
            <X size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Run Results</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <TextInput
                style={styles.textInput}
                value={manualInput.distance}
                onChangeText={(text) => setManualInput(prev => ({ ...prev, distance: text }))}
                placeholder="e.g., 5.0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={manualInput.time}
                onChangeText={(text) => setManualInput(prev => ({ ...prev, time: text }))}
                placeholder="e.g., 25"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowManualInput(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleManualInput}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    fontSize: 18,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  workoutSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  preWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  workoutOverview: {
    alignItems: 'center',
    marginBottom: 40,
  },
  overviewTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
    ...shadows.medium,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  activeWorkoutContainer: {
    flex: 1,
    padding: 20,
  },
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
  },
  restSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipRestText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  exerciseContainer: {
    flex: 1,
  },
  exerciseHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  detailCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    minWidth: 80,
    ...shadows.medium,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  notesContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 32,
    ...shadows.medium,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  completeSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    gap: 12,
    ...shadows.medium,
  },
  completeSetText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    ...shadows.medium,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tipsContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...shadows.medium,
  },
  nextExerciseTips: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    ...shadows.medium,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  tipsToggleButton: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  tipsToggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  tipsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Running styles
  runningContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  runningTimerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  runningTimer: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  runningTimerLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  runningStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  runningStatCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    minWidth: 120,
    ...shadows.medium,
  },
  runningStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  runningStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  gpsStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 30,
    ...shadows.medium,
  },
  gpsStatusText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  runningControls: {
    width: '100%',
    marginBottom: 20,
  },
  startRunningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    gap: 12,
    ...shadows.medium,
  },
  startRunningText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  runningControlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pauseRunningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    ...shadows.medium,
  },
  pauseRunningText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  stopRunningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    ...shadows.medium,
  },
  stopRunningText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  manualInputButton: {
    backgroundColor: Colors.primary + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  manualInputText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    ...shadows.level8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.lg,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
});
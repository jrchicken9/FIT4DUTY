import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Calendar, 
  X, 
  Clock,
  Target,
  Users,
  Dumbbell,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Move,
  Settings,
  CalendarDays,
  TrendingUp,
  Play
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService } from '@/lib/workoutService';
import { 
  Exercise, 
  WorkoutPlan, 
  Workout, 
  ExerciseCategory,
  CreateWorkoutPlanRequest,
  CreateWorkoutRequest,
  CreateWorkoutExerciseRequest
} from '@/types/workout';

interface WorkoutPlanEditorProps {
  plan: WorkoutPlan | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface AdminWorkout extends Workout {
  description: string;
  exercises?: AdminWorkoutExercise[];
}

interface AdminWorkoutExercise {
  id?: string;
  workout_id?: string;
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_time_seconds: number;
  notes?: string;
  // Cardio-specific fields
  is_cardio?: boolean;
  duration_minutes?: number;
  distance_km?: number;
  target_pace?: string;
}

interface DailyWorkout {
  id?: string;
  plan_id: string;
  day_number: number;
  week_number: number;
  name: string;
  description: string;
  workout_type: 'strength' | 'cardio' | 'mixed' | 'rest';
  estimated_duration_minutes: number;
  exercises: AdminWorkoutExercise[];
}

export default function WorkoutPlanEditor({ 
  plan, 
  isVisible, 
  onClose, 
  onSave 
}: WorkoutPlanEditorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showDayModal, setShowDayModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editingDay, setEditingDay] = useState<DailyWorkout | null>(null);
  const [editingExercise, setEditingExercise] = useState<AdminWorkoutExercise | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Form states
  const [dayForm, setDayForm] = useState({
    day_number: 1,
    week_number: 1,
    name: '',
    description: '',
    workout_type: 'strength' as 'strength' | 'cardio' | 'mixed' | 'rest',
    estimated_duration_minutes: 45,
  });

  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: '',
    sets: 3,
    reps: 10,
    weight_kg: undefined as number | undefined,
    rest_time_seconds: 90,
    notes: '',
    is_cardio: false,
    duration_minutes: undefined as number | undefined,
    distance_km: undefined as number | undefined,
    target_pace: '',
  });

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (isVisible && plan) {
      loadData();
    }
  }, [isVisible, plan]);

  const loadData = async () => {
    if (!plan) return;
    
    try {
      setLoading(true);
      const [exercisesData, categoriesData, planData] = await Promise.all([
        workoutService.getExercises(),
        workoutService.getExerciseCategories(),
        workoutService.getWorkoutPlanById(plan.id),
      ]);
      
      setExercises(exercisesData || []);
      setCategories(categoriesData || []);
      
      // Convert workouts to daily workout format
      if (planData?.workouts) {
        const dailyWorkoutsData = planData.workouts.map(workout => {
          if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach((ex, exIndex) => {
              // Process exercise data if needed
            });
          }
          return {
            id: workout.id,
            plan_id: workout.plan_id,
            day_number: workout.day_number,
            week_number: workout.week_number,
            name: workout.name,
            description: workout.description || '',
            workout_type: 'strength' as 'strength' | 'cardio' | 'mixed' | 'rest', // Default, can be updated
            estimated_duration_minutes: workout.estimated_duration_minutes || 45,
            exercises: workout.exercises || []
          };
        });
        setDailyWorkouts(dailyWorkoutsData);
      } else {
        setDailyWorkouts([]);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDailyWorkout = async () => {
    if (!plan) {
      console.error('No plan selected');
      return;
    }
    
    try {
      const workout = await workoutService.createWorkout({
        plan_id: plan.id,
        name: dayForm.name,
        description: dayForm.description,
        day_number: dayForm.day_number,
        week_number: dayForm.week_number,
        estimated_duration_minutes: dayForm.estimated_duration_minutes,
        rest_between_exercises_seconds: 60,
      });
      
      setDayForm({
        day_number: 1,
        week_number: 1,
        name: '',
        description: '',
        workout_type: 'strength',
        estimated_duration_minutes: 45,
      });
      
      setShowDayModal(false);
      await loadData();
      Alert.alert('Success', 'Daily workout created successfully!');
    } catch (error: any) {
      console.error('Failed to create daily workout:', error);
      Alert.alert('Error', `Failed to create daily workout: ${error.message || 'Unknown error'}`);
    }
  };

  const addExerciseToDay = async () => {
    if (!editingDay) {
      console.error('No day selected for editing');
      return;
    }
    
    // Calculate the next available order_index
    const existingExercises = editingDay.exercises || [];
    const nextOrderIndex = existingExercises.length > 0 
      ? Math.max(...existingExercises.map(ex => ex.order_index)) + 1 
      : 1;
    
    try {
      await workoutService.addExerciseToWorkout({
        workout_id: editingDay.id!,
        exercise_id: exerciseForm.exercise_id,
        order_index: nextOrderIndex,
        sets: exerciseForm.sets,
        reps: exerciseForm.reps,
        weight_kg: exerciseForm.weight_kg,
        rest_time_seconds: exerciseForm.rest_time_seconds,
        notes: exerciseForm.notes,
      });
      
      // Reset form
      setExerciseForm({
        exercise_id: '',
        sets: 3,
        reps: 10,
        weight_kg: undefined,
        rest_time_seconds: 90,
        notes: '',
        is_cardio: false,
        duration_minutes: undefined,
        distance_km: undefined,
        target_pace: '',
      });
      
      setShowExerciseModal(false);
      // Force a fresh reload of the data
      try {
        const planData = await workoutService.getWorkoutPlanById(plan!.id);
        if (planData?.workouts) {
          const dailyWorkoutsData = planData.workouts.map(workout => ({
            id: workout.id,
            plan_id: workout.plan_id,
            day_number: workout.day_number,
            week_number: workout.week_number,
            name: workout.name,
            description: workout.description || '',
            workout_type: 'strength' as 'strength' | 'cardio' | 'mixed' | 'rest',
            estimated_duration_minutes: workout.estimated_duration_minutes || 45,
            exercises: workout.exercises || []
          }));
          setDailyWorkouts(dailyWorkoutsData);
        }
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        await loadData(); // Fallback to full reload
      }
      
      Alert.alert('Success', 'Exercise added to workout!');
    } catch (error: any) {
      console.error('Failed to add exercise:', error);
      Alert.alert('Error', `Failed to add exercise: ${error.message || 'Unknown error'}`);
    }
  };

  const deleteDailyWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Daily Workout',
      'Are you sure you want to delete this daily workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkout(workoutId);
              await loadData();
              Alert.alert('Success', 'Daily workout deleted successfully!');
            } catch (error) {
              console.error('Failed to delete daily workout:', error);
              Alert.alert('Error', 'Failed to delete daily workout');
            }
          }
        }
      ]
    );
  };

  const editExercise = async (exercise: AdminWorkoutExercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      exercise_id: exercise.exercise_id,
      sets: exercise.sets,
      reps: exercise.reps,
      weight_kg: exercise.weight_kg,
      rest_time_seconds: exercise.rest_time_seconds,
      notes: exercise.notes || '',
      is_cardio: exercise.is_cardio || false,
      duration_minutes: exercise.duration_minutes,
      distance_km: exercise.distance_km,
      target_pace: exercise.target_pace || '',
    });
    setShowEditExerciseModal(true);
  };

  const updateExercise = async () => {
    if (!editingExercise) {
      console.error('No exercise selected for editing');
      return;
    }
    
    try {
      // Prepare update data based on exercise type
      const updateData: any = {
        rest_time_seconds: exerciseForm.rest_time_seconds,
        notes: exerciseForm.notes,
      };

      if (exerciseForm.is_cardio) {
        // Cardio exercise fields
        updateData.duration_minutes = exerciseForm.duration_minutes;
        updateData.distance_km = exerciseForm.distance_km;
        updateData.target_pace = exerciseForm.target_pace;
        // Set strength fields to null for cardio exercises
        updateData.sets = null;
        updateData.reps = null;
        updateData.weight_kg = null;
      } else {
        // Strength training fields
        updateData.sets = exerciseForm.sets;
        updateData.reps = exerciseForm.reps;
        updateData.weight_kg = exerciseForm.weight_kg;
        // Set cardio fields to null for strength exercises
        updateData.duration_minutes = null;
        updateData.distance_km = null;
        updateData.target_pace = null;
      }

      await workoutService.updateWorkoutExercise(editingExercise.id!, updateData);
      
      // Reset form
      setExerciseForm({
        exercise_id: '',
        sets: 3,
        reps: 10,
        weight_kg: undefined,
        rest_time_seconds: 90,
        notes: '',
        is_cardio: false,
        duration_minutes: undefined,
        distance_km: undefined,
        target_pace: '',
      });
      
      setShowEditExerciseModal(false);
      setEditingExercise(null);
      
      // Force a fresh reload of the data
      try {
        const planData = await workoutService.getWorkoutPlanById(plan!.id);
        if (planData?.workouts) {
          const dailyWorkoutsData = planData.workouts.map(workout => ({
            id: workout.id,
            plan_id: workout.plan_id,
            day_number: workout.day_number,
            week_number: workout.week_number,
            name: workout.name,
            description: workout.description || '',
            workout_type: 'strength' as 'strength' | 'cardio' | 'mixed' | 'rest',
            estimated_duration_minutes: workout.estimated_duration_minutes || 45,
            exercises: workout.exercises || []
          }));
          setDailyWorkouts(dailyWorkoutsData);
        }
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        await loadData(); // Fallback to full reload
      }
      
      Alert.alert('Success', 'Exercise updated successfully!');
    } catch (error: any) {
      console.error('Failed to update exercise:', error);
      Alert.alert('Error', `Failed to update exercise: ${error.message || 'Unknown error'}`);
    }
  };

  const deleteExercise = async (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}" from this workout? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkoutExercise(exerciseId);
              
              // Force a fresh reload of the data
              try {
                const planData = await workoutService.getWorkoutPlanById(plan!.id);
                if (planData?.workouts) {
                  const dailyWorkoutsData = planData.workouts.map(workout => ({
                    id: workout.id,
                    plan_id: workout.plan_id,
                    day_number: workout.day_number,
                    week_number: workout.week_number,
                    name: workout.name,
                    description: workout.description || '',
                    workout_type: 'strength' as 'strength' | 'cardio' | 'mixed' | 'rest',
                    estimated_duration_minutes: workout.estimated_duration_minutes || 45,
                    exercises: workout.exercises || []
                  }));
                  setDailyWorkouts(dailyWorkoutsData);
                }
              } catch (refreshError) {
                console.error('Error refreshing data:', refreshError);
                await loadData(); // Fallback to full reload
              }
              
              Alert.alert('Success', 'Exercise deleted successfully!');
            } catch (error: any) {
              console.error('Failed to delete exercise:', error);
              Alert.alert('Error', `Failed to delete exercise: ${error.message || 'Unknown error'}`);
            }
          }
        }
      ]
    );
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell size={16} color={Colors.primary} />;
      case 'cardio': return <Heart size={16} color={Colors.primary} />;
      case 'mixed': return <Zap size={16} color={Colors.primary} />;
      case 'rest': return <CheckCircle size={16} color={Colors.success} />;
      default: return <Target size={16} color={Colors.primary} />;
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return Colors.primary;
      case 'cardio': return Colors.error;
      case 'mixed': return Colors.warning;
      case 'rest': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getFocusAreaIcon = (area: string) => {
    switch (area) {
      case 'cardio': return <Heart size={16} color={Colors.primary} />;
      case 'strength': return <Dumbbell size={16} color={Colors.primary} />;
      case 'agility': return <Zap size={16} color={Colors.primary} />;
      default: return <Target size={16} color={Colors.primary} />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  // Helper function to detect if an exercise is cardio
  const isCardioExercise = (exerciseName: string): boolean => {
    const name = exerciseName.toLowerCase();
    return name.includes('run') || 
           name.includes('cardio') ||
           name.includes('cycle') ||
           name.includes('jog') ||
           name.includes('sprint') ||
           name.includes('walk') ||
           name.includes('swim') ||
           name.includes('row') ||
           name.includes('elliptical') ||
           name.includes('stair') ||
           name.includes('climb') ||
           name.includes('jump') ||
           name.includes('skip') ||
           name.includes('shuttle');
  };

  // Generate weeks array based on plan duration
  const weeks = Array.from({ length: plan?.duration_weeks || 4 }, (_, i) => i + 1);

  // Filter workouts by selected week
  const weekWorkouts = dailyWorkouts.filter(workout => workout.week_number === selectedWeek);

  // Filter exercises based on search query and category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!plan) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{plan.title}</Text>
          <TouchableOpacity onPress={onSave}>
            <Save size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading workout plan...</Text>
            </View>
          ) : (
            <>
              {/* Plan Info */}
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
                <View style={styles.planMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {plan.duration_weeks} weeks • {plan.duration_weeks * 7} days
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(plan.difficulty_level) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(plan.difficulty_level) }]}>
                        {plan.difficulty_level}
                      </Text>
                    </View>
                  </View>
                  
                  {plan.focus_areas && plan.focus_areas.length > 0 && (
                    <View style={styles.focusAreas}>
                      {plan.focus_areas.map((area, index) => (
                        <View key={index} style={styles.focusAreaBadge}>
                          {getFocusAreaIcon(area)}
                          <Text style={styles.focusAreaText}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Week Selector */}
              <View style={styles.weekSelector}>
                <Text style={styles.weekSelectorTitle}>Select Week</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.weekButtons}>
                    {weeks.map((week) => (
                      <TouchableOpacity
                        key={week}
                        style={[
                          styles.weekButton,
                          selectedWeek === week && styles.weekButtonActive
                        ]}
                        onPress={() => setSelectedWeek(week)}
                      >
                        <Text style={[
                          styles.weekButtonText,
                          selectedWeek === week && styles.weekButtonTextActive
                        ]}>
                          Week {week}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Daily Workouts Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Week {selectedWeek} - Daily Workouts</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setDayForm({ ...dayForm, week_number: selectedWeek });
                      setShowDayModal(true);
                    }}
                  >
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.addButtonText}>Add Day</Text>
                  </TouchableOpacity>
                </View>

                {weekWorkouts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No workouts for Week {selectedWeek}</Text>
                    <TouchableOpacity
                      style={styles.emptyStateButton}
                      onPress={() => {
                        setDayForm({ ...dayForm, week_number: selectedWeek });
                        setShowDayModal(true);
                      }}
                    >
                      <Text style={styles.emptyStateButtonText}>Create Your First Day</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  weekWorkouts.map((workout) => (
                    <View key={workout.id} style={styles.workoutCard}>
                      <View style={styles.workoutHeader}>
                        <View style={styles.workoutTitleContainer}>
                          <View style={styles.workoutTitleRow}>
                            <Text style={styles.workoutTitle}>{workout.name}</Text>
                            <View style={[styles.workoutTypeBadge, { backgroundColor: getWorkoutTypeColor(workout.workout_type) + '20' }]}>
                              {getWorkoutTypeIcon(workout.workout_type)}
                              <Text style={[styles.workoutTypeText, { color: getWorkoutTypeColor(workout.workout_type) }]}>
                                {workout.workout_type}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.workoutMeta}>
                            <View style={styles.workoutMetaItem}>
                              <CalendarDays size={12} color={Colors.textSecondary} />
                              <Text style={styles.workoutMetaText}>
                                Day {workout.day_number}
                              </Text>
                            </View>
                            <View style={styles.workoutMetaItem}>
                              <Clock size={12} color={Colors.textSecondary} />
                              <Text style={styles.workoutMetaText}>
                                {workout.estimated_duration_minutes} min
                              </Text>
                            </View>
                            <View style={styles.workoutMetaItem}>
                              <Dumbbell size={12} color={Colors.textSecondary} />
                              <Text style={styles.workoutMetaText}>
                                {workout.exercises?.length || 0} exercises
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.workoutActions}>
                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => {
                              setEditingDay(workout);
                              setShowExerciseModal(true);
                            }}
                          >
                            <Plus size={16} color={Colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => deleteDailyWorkout(workout.id!)}
                          >
                            <Trash2 size={16} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={styles.workoutDescription}>{workout.description}</Text>
                      
                      {/* Exercises List */}
                      {workout.exercises && workout.exercises.length > 0 && (
                        <View style={styles.exerciseList}>
                          <Text style={styles.exerciseListTitle}>Exercises</Text>
                          {workout.exercises.map((exercise, index) => (
                            <View key={exercise.id || index} style={styles.exerciseItem}>
                              <View style={styles.exerciseItemContent}>
                                <Text style={styles.exerciseItemText}>
                                  {exercise.exercise?.name || 'Unknown Exercise'}
                                </Text>
                                <Text style={styles.exerciseItemMeta}>
                                  {exercise.is_cardio ? (
                                    `${exercise.duration_minutes} min${exercise.distance_km ? ` • ${exercise.distance_km}km` : ''}`
                                  ) : (
                                    `${exercise.sets} sets × ${exercise.reps} reps${exercise.weight_kg ? ` @ ${exercise.weight_kg}kg` : ''}`
                                  )}
                                </Text>
                              </View>
                              <View style={styles.exerciseItemActions}>
                                <TouchableOpacity 
                                  style={styles.exerciseActionButton}
                                  onPress={() => editExercise(exercise)}
                                >
                                  <Edit size={16} color={Colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={styles.exerciseActionButton}
                                  onPress={() => deleteExercise(exercise.id!, exercise.exercise?.name || 'Unknown Exercise')}
                                >
                                  <Trash2 size={16} color={Colors.error} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Create Daily Workout Modal */}
        <Modal
          visible={showDayModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Daily Workout</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Workout Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={dayForm.name}
                  onChangeText={(text) => setDayForm({ ...dayForm, name: text })}
                  placeholder="e.g., Upper Body Strength"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={dayForm.description}
                  onChangeText={(text) => setDayForm({ ...dayForm, description: text })}
                  placeholder="Workout description"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Week</Text>
                  <TextInput
                    style={styles.formInput}
                    value={dayForm.week_number.toString()}
                    onChangeText={(text) => setDayForm({ ...dayForm, week_number: parseInt(text) || 1 })}
                    placeholder="1"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Day</Text>
                  <TextInput
                    style={styles.formInput}
                    value={dayForm.day_number.toString()}
                    onChangeText={(text) => setDayForm({ ...dayForm, day_number: parseInt(text) || 1 })}
                    placeholder="1"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Workout Type</Text>
                <View style={styles.workoutTypeButtons}>
                  {[
                    { value: 'strength', label: 'Strength', icon: '💪' },
                    { value: 'cardio', label: 'Cardio', icon: '❤️' },
                    { value: 'mixed', label: 'Mixed', icon: '⚡' },
                    { value: 'rest', label: 'Rest', icon: '😴' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.workoutTypeButton,
                        dayForm.workout_type === type.value && styles.workoutTypeButtonActive
                      ]}
                      onPress={() => setDayForm({ ...dayForm, workout_type: type.value as any })}
                    >
                      <Text style={styles.workoutTypeButtonIcon}>{type.icon}</Text>
                      <Text style={[
                        styles.workoutTypeButtonText,
                        dayForm.workout_type === type.value && styles.workoutTypeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estimated Duration (minutes)</Text>
                <TextInput
                  style={styles.formInput}
                  value={dayForm.estimated_duration_minutes.toString()}
                  onChangeText={(text) => setDayForm({ ...dayForm, estimated_duration_minutes: parseInt(text) || 45 })}
                  placeholder="45"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  !dayForm.name && styles.disabledButton
                ]}
                onPress={createDailyWorkout}
                disabled={!dayForm.name}
              >
                <Text style={styles.saveButtonText}>Create Day</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Add Exercise Modal */}
        <Modal
          visible={showExerciseModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Exercise</Text>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search exercises..."
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Category Filter */}
                <View style={styles.categoryFilterContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryFilterScroll}
                    contentContainerStyle={styles.categoryFilterContent}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryFilterButton,
                        selectedCategory === 'all' && styles.categoryFilterButtonActive
                      ]}
                      onPress={() => setSelectedCategory('all')}
                    >
                      <Text style={[
                        styles.categoryFilterButtonText,
                        selectedCategory === 'all' && styles.categoryFilterButtonTextActive
                      ]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryFilterButton,
                          selectedCategory === category.id && styles.categoryFilterButtonActive
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Text style={[
                          styles.categoryFilterButtonText,
                          selectedCategory === category.id && styles.categoryFilterButtonTextActive
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.exerciseSelectorContainer}>
                  <ScrollView 
                    style={styles.exerciseSelector}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {filteredExercises.length === 0 ? (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                          No exercises found matching your search.
                        </Text>
                      </View>
                    ) : (
                      filteredExercises.map((exercise) => (
                        <TouchableOpacity
                          key={exercise.id}
                          style={[
                            styles.exerciseOption,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionActive
                          ]}
                          onPress={() => {
                            const isCardio = exercise.name.toLowerCase().includes('run') || 
                                           exercise.name.toLowerCase().includes('cardio') ||
                                           exercise.name.toLowerCase().includes('cycle');
                            setExerciseForm({ 
                              ...exerciseForm, 
                              exercise_id: exercise.id,
                              is_cardio: isCardio
                            });
                          }}
                        >
                          <Text style={[
                            styles.exerciseOptionText,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionTextActive
                          ]}>
                            {exercise.name}
                          </Text>
                          <Text style={[
                            styles.exerciseOptionMeta,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionMetaActive
                          ]}>
                            {exercise.difficulty_level}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>

              {/* Exercise Type Configuration */}
              {exerciseForm.exercise_id && (
                <>
                  {exerciseForm.is_cardio ? (
                    // Cardio Configuration
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Duration (minutes)</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.duration_minutes?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, duration_minutes: text ? parseInt(text) : undefined })}
                          placeholder="30"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Distance (km) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.distance_km?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, distance_km: text ? parseFloat(text) : undefined })}
                          placeholder="5.0"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Target Pace (min/km) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.target_pace}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, target_pace: text })}
                          placeholder="5:30"
                          placeholderTextColor={Colors.textSecondary}
                        />
                      </View>
                    </>
                  ) : (
                    // Strength Configuration
                    <>
                      <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                          <Text style={styles.formLabel}>Sets</Text>
                          <TextInput
                            style={styles.formInput}
                            value={exerciseForm.sets.toString()}
                            onChangeText={(text) => setExerciseForm({ ...exerciseForm, sets: parseInt(text) || 3 })}
                            placeholder="3"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                          <Text style={styles.formLabel}>Reps</Text>
                          <TextInput
                            style={styles.formInput}
                            value={exerciseForm.reps.toString()}
                            onChangeText={(text) => setExerciseForm({ ...exerciseForm, reps: parseInt(text) || 10 })}
                            placeholder="10"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Weight (kg) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.weight_kg?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, weight_kg: text ? parseFloat(text) : undefined })}
                          placeholder="0"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Rest Time (seconds)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={exerciseForm.rest_time_seconds.toString()}
                      onChangeText={(text) => setExerciseForm({ ...exerciseForm, rest_time_seconds: parseInt(text) || 90 })}
                      placeholder="90"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notes - Optional</Text>
                    <TextInput
                      style={styles.formInput}
                      value={exerciseForm.notes}
                      onChangeText={(text) => setExerciseForm({ ...exerciseForm, notes: text })}
                      placeholder="Exercise notes"
                      placeholderTextColor={Colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowExerciseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  !exerciseForm.exercise_id && styles.disabledButton
                ]}
                onPress={addExerciseToDay}
                disabled={!exerciseForm.exercise_id}
              >
                <Text style={styles.saveButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Edit Exercise Modal */}
        <Modal
          visible={showEditExerciseModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditExerciseModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Exercise</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Exercise</Text>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search exercises..."
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Category Filter */}
                <View style={styles.categoryFilterContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryFilterScroll}
                    contentContainerStyle={styles.categoryFilterContent}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryFilterButton,
                        selectedCategory === 'all' && styles.categoryFilterButtonActive
                      ]}
                      onPress={() => setSelectedCategory('all')}
                    >
                      <Text style={[
                        styles.categoryFilterButtonText,
                        selectedCategory === 'all' && styles.categoryFilterButtonTextActive
                      ]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryFilterButton,
                          selectedCategory === category.id && styles.categoryFilterButtonActive
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Text style={[
                          styles.categoryFilterButtonText,
                          selectedCategory === category.id && styles.categoryFilterButtonTextActive
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.exerciseSelectorContainer}>
                  <ScrollView 
                    style={styles.exerciseSelector}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {filteredExercises.length === 0 ? (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                          No exercises found matching your search.
                        </Text>
                      </View>
                    ) : (
                      filteredExercises.map((exercise) => (
                        <TouchableOpacity
                          key={exercise.id}
                          style={[
                            styles.exerciseOption,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionActive
                          ]}
                          onPress={() => {
                            const isCardio = exercise.name.toLowerCase().includes('run') || 
                                           exercise.name.toLowerCase().includes('cardio') ||
                                           exercise.name.toLowerCase().includes('cycle');
                            setExerciseForm({ 
                              ...exerciseForm, 
                              exercise_id: exercise.id,
                              is_cardio: isCardio
                            });
                          }}
                        >
                          <Text style={[
                            styles.exerciseOptionText,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionTextActive
                          ]}>
                            {exercise.name}
                          </Text>
                          <Text style={[
                            styles.exerciseOptionMeta,
                            exerciseForm.exercise_id === exercise.id && styles.exerciseOptionMetaActive
                          ]}>
                            {exercise.difficulty_level}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>

              {/* Exercise Type Configuration */}
              {exerciseForm.exercise_id && (
                <>
                  {exerciseForm.is_cardio ? (
                    // Cardio Configuration
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Duration (minutes)</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.duration_minutes?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, duration_minutes: text ? parseInt(text) : undefined })}
                          placeholder="30"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Distance (km) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.distance_km?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, distance_km: text ? parseFloat(text) : undefined })}
                          placeholder="5.0"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Target Pace (min/km) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.target_pace}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, target_pace: text })}
                          placeholder="5:30"
                          placeholderTextColor={Colors.textSecondary}
                        />
                      </View>
                    </>
                  ) : (
                    // Strength Configuration
                    <>
                      <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                          <Text style={styles.formLabel}>Sets</Text>
                          <TextInput
                            style={styles.formInput}
                            value={exerciseForm.sets.toString()}
                            onChangeText={(text) => setExerciseForm({ ...exerciseForm, sets: parseInt(text) || 3 })}
                            placeholder="3"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                          <Text style={styles.formLabel}>Reps</Text>
                          <TextInput
                            style={styles.formInput}
                            value={exerciseForm.reps.toString()}
                            onChangeText={(text) => setExerciseForm({ ...exerciseForm, reps: parseInt(text) || 10 })}
                            placeholder="10"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Weight (kg) - Optional</Text>
                        <TextInput
                          style={styles.formInput}
                          value={exerciseForm.weight_kg?.toString() || ''}
                          onChangeText={(text) => setExerciseForm({ ...exerciseForm, weight_kg: text ? parseFloat(text) : undefined })}
                          placeholder="0"
                          placeholderTextColor={Colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Rest Time (seconds)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={exerciseForm.rest_time_seconds.toString()}
                      onChangeText={(text) => setExerciseForm({ ...exerciseForm, rest_time_seconds: parseInt(text) || 90 })}
                      placeholder="90"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notes - Optional</Text>
                    <TextInput
                      style={styles.formInput}
                      value={exerciseForm.notes}
                      onChangeText={(text) => setExerciseForm({ ...exerciseForm, notes: text })}
                      placeholder="Exercise notes"
                      placeholderTextColor={Colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditExerciseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  !exerciseForm.exercise_id && styles.disabledButton
                ]}
                onPress={updateExercise}
                disabled={!exerciseForm.exercise_id}
              >
                <Text style={styles.saveButtonText}>Update Exercise</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  planInfo: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    ...shadows.medium,
  },
  planTitle: {
    ...typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  metaText: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: '600',
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusAreaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  focusAreaText: {
    ...typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  weekSelector: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  weekSelectorTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  weekButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  weekButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  weekButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  weekButtonTextActive: {
    color: Colors.white,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emptyStateButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  workoutTitle: {
    ...typography.h4,
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
  },
  workoutTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  workoutTypeText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  workoutMetaText: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    padding: spacing.sm,
  },
  workoutDescription: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  exerciseList: {
    marginTop: spacing.md,
  },
  exerciseListTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemText: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  exerciseItemMeta: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  exerciseItemAction: {
    padding: spacing.sm,
  },
  exerciseItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exerciseActionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formLabel: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: Colors.text,
  },
  workoutTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  workoutTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: spacing.xs,
  },
  workoutTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  workoutTypeButtonIcon: {
    fontSize: 16,
  },
  workoutTypeButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  workoutTypeButtonTextActive: {
    color: Colors.white,
  },
  exerciseSelector: {
    maxHeight: 200,
  },
  exerciseSelectorContainer: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    ...typography.body,
    color: Colors.text,
  },
  categoryFilterContainer: {
    marginBottom: spacing.sm,
  },
  categoryFilterScroll: {
    // Add any specific styles for the ScrollView if needed
  },
  categoryFilterContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryFilterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryFilterButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryFilterButtonTextActive: {
    color: Colors.white,
  },
  noResultsContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  exerciseOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginBottom: spacing.xs,
  },
  exerciseOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  exerciseOptionText: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  exerciseOptionTextActive: {
    color: Colors.white,
  },
  exerciseOptionMeta: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  exerciseOptionMetaActive: {
    color: Colors.white + '80',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: Colors.textSecondary,
    marginTop: spacing.md,
  },
});

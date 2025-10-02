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
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
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
  Settings
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';
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
import WorkoutPlanEditor from '@/components/WorkoutPlanEditor';

// Enhanced interfaces for admin functionality
interface AdminExercise extends Exercise {
  is_cardio?: boolean;
  cardio_type?: string;
  duration_value?: number;
  duration_unit?: string;
  distance_value?: number;
  distance_unit?: string;
  warm_up_value?: number;
  warm_up_unit?: string;
  intensity_level?: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  rest_time_seconds?: number;
}

interface AdminWorkoutPlan extends WorkoutPlan {
  target_audience?: 'police_candidates' | 'general_fitness' | 'athletes';
  workouts?: AdminWorkout[];
  completion_status?: {
    total_days: number;
    completed_days: number;
    completion_percentage: number;
  };
}

interface AdminWorkout extends Workout {
  description: string;
  exercises?: AdminWorkoutExercise[];
}

interface AdminWorkoutExercise {
  id?: string;
  workout_id?: string;
  exercise_id: string;
  exercise?: AdminExercise;
  order_index: number;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_time_seconds: number;
  notes?: string;
}

interface AdminExerciseCategory extends ExerciseCategory {
  description: string;
}

export default function WorkoutBuilderScreen() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<AdminWorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [categories, setCategories] = useState<AdminExerciseCategory[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminWorkoutPlan | null>(null);
  // Form states
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    description: '',
    category_id: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    instructions: '',
    is_cardio: false,
    muscle_groups: [] as string[],
    equipment_needed: [] as string[],
  });

  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_weeks: 4,
    focus_areas: [] as string[],
    target_audience: 'police_candidates' as 'police_candidates' | 'general_fitness' | 'athletes',
    is_featured: false,
  });

  const [quickEditForm, setQuickEditForm] = useState({
    title: '',
    description: '',
  });



  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, exercisesData, categoriesData] = await Promise.all([
        workoutService.getWorkoutPlansWithCompletion(),
        workoutService.getExercises(),
        workoutService.getExerciseCategories(),
      ]);
      
      setWorkoutPlans((plansData || []).map(plan => ({
        ...plan,
        target_audience: plan.target_audience as 'police_candidates' | 'general_fitness' | 'athletes' || 'police_candidates'
      })));
      
      setExercises((exercisesData || []).map(exercise => ({
        ...exercise,
        is_cardio: false,
        muscle_groups: exercise.muscle_groups || [],
        equipment_needed: exercise.equipment_needed || []
      })));
      
      setCategories((categoriesData || []).map(category => ({
        ...category,
        description: category.description || ''
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  const createExercise = async () => {
    try {
      await workoutService.createExercise(newExerciseForm);
      setNewExerciseForm({
        name: '',
        description: '',
        category_id: '',
        difficulty_level: 'beginner',
        instructions: '',
        is_cardio: false,
        muscle_groups: [],
        equipment_needed: [],
      });
      setShowExerciseModal(false);
      await loadData();
      Alert.alert('Success', 'Exercise created successfully!');
    } catch (error) {
      console.error('Failed to create exercise:', error);
      Alert.alert('Error', 'Failed to create exercise');
    }
  };

  const createWorkoutPlan = async () => {
    try {
      await workoutService.createWorkoutPlan(planForm);
      setPlanForm({
        title: '',
        description: '',
        difficulty_level: 'beginner',
        duration_weeks: 4,
        focus_areas: [],
        target_audience: 'police_candidates',
        is_featured: false,
      });
      setShowCreateModal(false);
      await loadData();
      Alert.alert('Success', 'Workout plan created successfully!');
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      Alert.alert('Error', 'Failed to create workout plan');
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this workout plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkoutPlan(planId);
              await loadData();
              Alert.alert('Success', 'Workout plan deleted successfully!');
            } catch (error: any) {
              console.error('Failed to delete workout plan:', error);
              const errorMessage = error.message || 'Unknown error occurred';
              Alert.alert('Error', `Failed to delete workout plan: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  const openPlanEditor = (plan: AdminWorkoutPlan) => {
    setSelectedPlan(plan);
    setShowPlanEditor(true);
  };

  const openQuickEdit = (plan: AdminWorkoutPlan) => {
    setSelectedPlan(plan);
    setQuickEditForm({
      title: plan.title,
      description: plan.description || '',
    });
    setShowQuickEditModal(true);
  };

  const handleQuickEditSave = async () => {
    if (!selectedPlan) return;
    
    try {
      await workoutService.updateWorkoutPlan(selectedPlan.id, {
        title: quickEditForm.title,
        description: quickEditForm.description,
      });
      
      await loadData();
      setShowQuickEditModal(false);
      Alert.alert('Success', 'Workout plan details updated successfully!');
    } catch (error) {
      console.error('Failed to update workout plan:', error);
      Alert.alert('Error', 'Failed to update workout plan details');
    }
  };

  const handlePlanSave = async () => {
    await loadData();
    setShowPlanEditor(false);
    Alert.alert('Success', 'Workout plan updated successfully!');
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Builder</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{workoutPlans.length}</Text>
            <Text style={styles.statLabel}>Workout Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={() => setShowExerciseModal(true)}
            >
              <Text style={styles.actionButtonText}>Add Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.actionButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Plans</Text>
          <Text style={styles.sectionSubtitle}>Manage your workout plans</Text>
          
          {workoutPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No workout plans yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Create Your First Plan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            workoutPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => openPlanEditor(plan)}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {plan.is_featured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.planActions}>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        openQuickEdit(plan);
                      }}
                    >
                      <Edit size={14} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        openPlanEditor(plan);
                      }}
                    >
                      <Settings size={14} color={Colors.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteWorkoutPlan(plan.id);
                      }}
                    >
                      <Trash2 size={14} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.planMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {plan.duration_weeks} weeks
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(plan.difficulty_level) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(plan.difficulty_level) }]}>
                        {plan.difficulty_level}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.completionStatus}>
                    <View style={[styles.completionBadge, { 
                      backgroundColor: (plan.completion_status?.completion_percentage || 0) === 100 
                        ? Colors.success + '20' 
                        : (plan.completion_status?.completion_percentage || 0) > 50 
                        ? Colors.warning + '20' 
                        : Colors.error + '20'
                    }]}>
                      <Text style={[styles.completionText, { 
                        color: (plan.completion_status?.completion_percentage || 0) === 100 
                          ? Colors.success 
                          : (plan.completion_status?.completion_percentage || 0) > 50 
                          ? Colors.warning 
                          : Colors.error
                      }]}>
                        {plan.completion_status?.completed_days || 0}/{plan.completion_status?.total_days || 0} days
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Library</Text>
          <Text style={styles.sectionSubtitle}>Manage your exercise library</Text>
          
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exercises yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowExerciseModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Add Your First Exercise</Text>
              </TouchableOpacity>
            </View>
          ) : (
            exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                  <View style={styles.exerciseBadge}>
                    <Text style={styles.exerciseBadgeText}>
                      {exercise.is_cardio ? 'Cardio' : 'Strength'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.difficulty_level} • {categories.find(c => c.id === exercise.category_id)?.name}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Exercise Modal */}
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
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.formInput}
                value={newExerciseForm.name}
                onChangeText={(text) => setNewExerciseForm({ ...newExerciseForm, name: text })}
                placeholder="Exercise name"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={newExerciseForm.description}
                onChangeText={(text) => setNewExerciseForm({ ...newExerciseForm, description: text })}
                placeholder="Exercise description"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      newExerciseForm.category_id === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setNewExerciseForm({ ...newExerciseForm, category_id: category.id })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      newExerciseForm.category_id === category.id && styles.categoryButtonTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Difficulty Level</Text>
              <View style={styles.difficultyButtons}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      newExerciseForm.difficulty_level === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => setNewExerciseForm({ ...newExerciseForm, difficulty_level: level as any })}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      newExerciseForm.difficulty_level === level && styles.difficultyButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instructions</Text>
              <TextInput
                style={styles.formInput}
                value={newExerciseForm.instructions}
                onChangeText={(text) => setNewExerciseForm({ ...newExerciseForm, instructions: text })}
                placeholder="Exercise instructions"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Exercise Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    !newExerciseForm.is_cardio && styles.typeButtonActive
                  ]}
                  onPress={() => setNewExerciseForm({ ...newExerciseForm, is_cardio: false })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    !newExerciseForm.is_cardio && styles.typeButtonTextActive
                  ]}>
                    Strength
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newExerciseForm.is_cardio && styles.typeButtonActive
                  ]}
                  onPress={() => setNewExerciseForm({ ...newExerciseForm, is_cardio: true })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newExerciseForm.is_cardio && styles.typeButtonTextActive
                  ]}>
                    Cardio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowExerciseModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={createExercise}
            >
              <Text style={styles.saveButtonText}>Create Exercise</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create Workout Plan Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Workout Plan</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={planForm.title}
                onChangeText={(text) => setPlanForm({ ...planForm, title: text })}
                placeholder="Workout plan title"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={planForm.description}
                onChangeText={(text) => setPlanForm({ ...planForm, description: text })}
                placeholder="Workout plan description"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Difficulty Level</Text>
              <View style={styles.difficultyButtons}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      planForm.difficulty_level === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => setPlanForm({ ...planForm, difficulty_level: level as any })}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      planForm.difficulty_level === level && styles.difficultyButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration (weeks)</Text>
              <TextInput
                style={styles.formInput}
                value={planForm.duration_weeks.toString()}
                onChangeText={(text) => setPlanForm({ ...planForm, duration_weeks: parseInt(text) || 4 })}
                placeholder="4"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Focus Areas</Text>
              <View style={styles.focusAreaButtons}>
                {['cardio', 'strength', 'agility'].map((area) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.focusAreaButton,
                      planForm.focus_areas.includes(area) && styles.focusAreaButtonActive
                    ]}
                    onPress={() => {
                      const newFocusAreas = planForm.focus_areas.includes(area)
                        ? planForm.focus_areas.filter(a => a !== area)
                        : [...planForm.focus_areas, area];
                      setPlanForm({ ...planForm, focus_areas: newFocusAreas });
                    }}
                  >
                    {getFocusAreaIcon(area)}
                    <Text style={[
                      styles.focusAreaButtonText,
                      planForm.focus_areas.includes(area) && styles.focusAreaButtonTextActive
                    ]}>
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Audience</Text>
              <View style={styles.audienceButtons}>
                {[
                  { value: 'police_candidates', label: 'Police Candidates' },
                  { value: 'general_fitness', label: 'General Fitness' },
                  { value: 'athletes', label: 'Athletes' },
                ].map((audience) => (
                  <TouchableOpacity
                    key={audience.value}
                    style={[
                      styles.audienceButton,
                      planForm.target_audience === audience.value && styles.audienceButtonActive
                    ]}
                    onPress={() => setPlanForm({ ...planForm, target_audience: audience.value as any })}
                  >
                    <Text style={[
                      styles.audienceButtonText,
                      planForm.target_audience === audience.value && styles.audienceButtonTextActive
                    ]}>
                      {audience.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.formLabel}>Featured Plan</Text>
                <Switch
                  value={planForm.is_featured}
                  onValueChange={(value) => setPlanForm({ ...planForm, is_featured: value })}
                  trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                  thumbColor={planForm.is_featured ? Colors.primary : Colors.textSecondary}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={createWorkoutPlan}
            >
              <Text style={styles.saveButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Quick Edit Workout Plan Modal */}
      <Modal
        visible={showQuickEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowQuickEditModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Workout Plan</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={quickEditForm.title}
                onChangeText={(text) => setQuickEditForm({ ...quickEditForm, title: text })}
                placeholder="Enter plan title"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={quickEditForm.description}
                onChangeText={(text) => setQuickEditForm({ ...quickEditForm, description: text })}
                placeholder="Enter plan description"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowQuickEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleQuickEditSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Plan Editor */}
      <WorkoutPlanEditor
        plan={selectedPlan}
        isVisible={showPlanEditor}
        onClose={() => setShowPlanEditor(false)}
        onSave={handlePlanSave}
      />
    </SafeAreaView>
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
    ...typography.body,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    ...typography.h2,
    color: Colors.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  statNumber: {
    ...typography.h2,
    color: Colors.text,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  actionButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  planTitle: {
    ...typography.h4,
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
  },
  featuredBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  featuredBadgeText: {
    ...typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  planActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexShrink: 0,
  },
  actionIcon: {
    padding: spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDescription: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
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
    backgroundColor: Colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  completionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    ...typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  exerciseBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  exerciseBadgeText: {
    ...typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  exerciseDescription: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exerciseMeta: {
    ...typography.caption,
    color: Colors.textSecondary,
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
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  difficultyButtonTextActive: {
    color: Colors.white,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  audienceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  audienceButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  audienceButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  audienceButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  audienceButtonTextActive: {
    color: Colors.white,
  },
  focusAreaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  focusAreaButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  focusAreaButtonText: {
    ...typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  focusAreaButtonTextActive: {
    color: Colors.white,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
  saveButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
  },

  addWorkoutButtonText: {
    ...typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});

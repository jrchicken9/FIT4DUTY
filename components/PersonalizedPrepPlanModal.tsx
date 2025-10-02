import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  X,
  Target,
  Calendar,
  Dumbbell,
  Heart,
  Zap,
  CheckCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService } from '@/lib/workoutService';
import { WorkoutPlan } from '@/types/workout';

interface PersonalizedPrepPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanSelected: (plan: WorkoutPlan, preferences: {
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    readinessDeadline: Date;
    focusAreas: ('cardio' | 'strength' | 'agility')[];
  }) => void;
}

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
type FocusArea = 'cardio' | 'strength' | 'agility';

export default function PersonalizedPrepPlanModal({
  visible,
  onClose,
  onPlanSelected,
}: PersonalizedPrepPlanModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'fitness-level' | 'deadline' | 'focus-areas' | 'recommendation'>('fitness-level');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);
  const [readinessDeadline, setReadinessDeadline] = useState<Date | null>(null);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<FocusArea[]>([]);
  const [recommendedPlan, setRecommendedPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Progress saving and loading functions
  const saveProgress = async () => {
    try {
      const progress = {
        step,
        fitnessLevel,
        readinessDeadline: readinessDeadline?.toISOString(),
        selectedFocusAreas,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem('personalization_progress', JSON.stringify(progress));
      setHasSavedProgress(true);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('personalization_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        // Check if progress is less than 24 hours old
        const progressDate = new Date(progress.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - progressDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setStep(progress.step);
          setFitnessLevel(progress.fitnessLevel);
          setReadinessDeadline(progress.readinessDeadline ? new Date(progress.readinessDeadline) : null);
          setSelectedFocusAreas(progress.selectedFocusAreas || []);
          setHasSavedProgress(true);
        } else {
          // Clear old progress
          await AsyncStorage.removeItem('personalization_progress');
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const clearProgress = async () => {
    try {
      await AsyncStorage.removeItem('personalization_progress');
      setHasSavedProgress(false);
      setStep('fitness-level');
      setFitnessLevel(null);
      setReadinessDeadline(null);
      setSelectedFocusAreas([]);
      setRecommendedPlan(null);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  // Load progress when modal opens
  useEffect(() => {
    if (visible) {
      loadProgress();
    }
  }, [visible]);

  // Auto-save progress when data changes
  useEffect(() => {
    if (visible && (fitnessLevel || readinessDeadline || selectedFocusAreas.length > 0)) {
      saveProgress();
    }
  }, [fitnessLevel, readinessDeadline, selectedFocusAreas, step, visible]);

  const fitnessLevels = [
    {
      level: 'beginner' as FitnessLevel,
      title: 'Beginner',
      description: 'New to fitness or returning after a break',
      icon: <Target size={24} color={Colors.success} />,
      color: Colors.success,
    },
    {
      level: 'intermediate' as FitnessLevel,
      title: 'Intermediate',
      description: 'Regular exercise routine, some fitness experience',
      icon: <TrendingUp size={24} color={Colors.warning} />,
      color: Colors.warning,
    },
    {
      level: 'advanced' as FitnessLevel,
      title: 'Advanced',
      description: 'Experienced athlete, high fitness level',
      icon: <Award size={24} color={Colors.error} />,
      color: Colors.error,
    },
  ];

  const focusAreas = [
    {
      area: 'cardio' as FocusArea,
      title: 'Cardio',
      description: 'Improve shuttle run endurance and overall fitness',
      icon: <Heart size={24} color="#EF4444" />,
      color: '#EF4444',
    },
    {
      area: 'strength' as FocusArea,
      title: 'Strength',
      description: 'Build push-up capacity and core strength',
      icon: <Dumbbell size={24} color="#3B82F6" />,
      color: '#3B82F6',
    },
    {
      area: 'agility' as FocusArea,
      title: 'Agility',
      description: 'Enhance movement patterns and coordination',
      icon: <Zap size={24} color="#10B981" />,
      color: '#10B981',
    },
  ];

  const deadlineOptions = [
    { weeks: 4, label: '4 weeks or less', description: 'Crash course - intensive training' },
    { weeks: 8, label: '6-8 weeks', description: 'Standard program - balanced approach' },
    { weeks: 12, label: '12+ weeks', description: 'Gradual build - sustainable progress' },
  ];

  const handleFitnessLevelSelect = (level: FitnessLevel) => {
    setFitnessLevel(level);
    setStep('deadline');
  };

  const handleDeadlineSelect = (weeks: number) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (weeks * 7));
    setReadinessDeadline(deadline);
    setStep('focus-areas');
  };

  const handleFocusAreaToggle = (area: FocusArea) => {
    setSelectedFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        // Limit to 2 focus areas
        if (prev.length >= 2) {
          return [prev[1], area];
        }
        return [...prev, area];
      }
    });
  };

  const handleGetRecommendation = async () => {
    if (!fitnessLevel || !readinessDeadline || selectedFocusAreas.length === 0) {
      Alert.alert('Missing Information', 'Please complete all steps to get your personalized plan.');
      return;
    }

    setLoading(true);
    try {
      const result = await workoutService.getPersonalizedPrepPlan({
        fitnessLevel,
        readinessDeadline,
        focusAreas: selectedFocusAreas,
      });

      if (result.plan) {
        setRecommendedPlan(result.plan);
        setStep('recommendation');
        
        // Show placeholder message if applicable
        if (result.isPlaceholder && result.message) {
          Alert.alert('Placeholder Plan', result.message);
        }
      } else {
        Alert.alert(
          'No Plan Available', 
          result.message || 'No matching plan found. Please try different options.'
        );
      }
    } catch (error) {
      console.error('Error getting personalized plan:', error);
      Alert.alert('Error', 'Failed to get personalized plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = () => {
    if (recommendedPlan && fitnessLevel && readinessDeadline && selectedFocusAreas.length > 0) {
      onPlanSelected(recommendedPlan, {
        fitnessLevel,
        readinessDeadline,
        focusAreas: selectedFocusAreas,
      });
      // Clear progress when plan is selected
      clearProgress();
      onClose();
      router.push(`/workout-plan/${recommendedPlan.id}`);
    }
  };

  const resetModal = () => {
    setStep('fitness-level');
    setFitnessLevel(null);
    setReadinessDeadline(null);
    setSelectedFocusAreas([]);
    setRecommendedPlan(null);
  };

  const handleClose = () => {
    // Clear progress if user completed personalization
    if (step === 'recommendation' && recommendedPlan) {
      clearProgress();
    }
    resetModal();
    onClose();
  };

  const renderFitnessLevelStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What's your fitness level?</Text>
        <Text style={styles.stepSubtitle}>This helps us recommend the right intensity for your plan</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {fitnessLevels.map((level) => (
          <TouchableOpacity
            key={level.level}
            style={styles.optionCard}
            onPress={() => handleFitnessLevelSelect(level.level)}
          >
            <View style={[styles.optionIcon, { backgroundColor: level.color + '20' }]}>
              {level.icon}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{level.title}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
            </View>
            <ArrowRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDeadlineStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>When do you need to be test-ready?</Text>
        <Text style={styles.stepSubtitle}>This determines your training timeline</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {deadlineOptions.map((option) => (
          <TouchableOpacity
            key={option.weeks}
            style={styles.optionCard}
            onPress={() => handleDeadlineSelect(option.weeks)}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <ArrowRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFocusAreasStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What are your weak points?</Text>
        <Text style={styles.stepSubtitle}>Select 1-2 areas you want to focus on (optional)</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {focusAreas.map((area) => (
          <TouchableOpacity
            key={area.area}
            style={[
              styles.optionCard,
              selectedFocusAreas.includes(area.area) && styles.optionCardSelected
            ]}
            onPress={() => handleFocusAreaToggle(area.area)}
          >
            <View style={[
              styles.optionIcon, 
              { backgroundColor: area.color + '20' },
              selectedFocusAreas.includes(area.area) && { backgroundColor: area.color + '40' }
            ]}>
              {area.icon}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{area.title}</Text>
              <Text style={styles.optionDescription}>{area.description}</Text>
            </View>
            {selectedFocusAreas.includes(area.area) && (
              <CheckCircle size={20} color={area.color} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (selectedFocusAreas.length === 0 || loading) && styles.primaryButtonDisabled
        ]}
        onPress={handleGetRecommendation}
        disabled={selectedFocusAreas.length === 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Get My Plan</Text>
            <ArrowRight size={16} color={Colors.white} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderRecommendationStep = () => {
    const isPlaceholder = recommendedPlan && workoutService.isPlaceholderPlan(recommendedPlan);
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Your Personalized PREP Plan</Text>
          <Text style={styles.stepSubtitle}>Based on your selections, here's your recommended plan</Text>
        </View>
        
        {recommendedPlan && (
          <View style={styles.recommendationCard}>
            <LinearGradient
              colors={[Colors.gradients.fitness.start, Colors.gradients.fitness.end]}
              style={styles.recommendationGradient}
            >
              <View style={styles.recommendationHeader}>
                <View style={styles.recommendationIcon}>
                  {isPlaceholder ? (
                    <Clock size={24} color={Colors.white} />
                  ) : (
                    <Star size={24} color={Colors.white} />
                  )}
                </View>
                <View style={styles.recommendationInfo}>
                  <Text style={styles.recommendationTitle}>{recommendedPlan.title}</Text>
                  <Text style={styles.recommendationSubtitle}>
                    {recommendedPlan.duration_weeks} weeks • {recommendedPlan.difficulty_level}
                  </Text>
                </View>
                {isPlaceholder && (
                  <View style={styles.placeholderBadge}>
                    <Text style={styles.placeholderBadgeText}>Coming Soon</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            
            <View style={styles.recommendationBody}>
              <Text style={styles.recommendationDescription}>{recommendedPlan.description}</Text>
              
              {isPlaceholder && (
                <View style={styles.placeholderNotice}>
                  <Clock size={16} color={Colors.warning} />
                  <Text style={styles.placeholderNoticeText}>
                    This is a placeholder plan. Real content will be available soon!
                  </Text>
                </View>
              )}
              
              <View style={styles.recommendationFeatures}>
                <View style={styles.recommendationFeature}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.recommendationFeatureText}>
                    {recommendedPlan.duration_weeks} weeks duration
                  </Text>
                </View>
                <View style={styles.recommendationFeature}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.recommendationFeatureText}>
                    Focus: {recommendedPlan.focus_areas.join(', ')}
                  </Text>
                </View>
                <View style={styles.recommendationFeature}>
                  <TrendingUp size={16} color={Colors.primary} />
                  <Text style={styles.recommendationFeatureText}>
                    {recommendedPlan.difficulty_level} level training
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.recommendationActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('focus-areas')}
          >
            <Text style={styles.secondaryButtonText}>Adjust Preferences</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isPlaceholder && styles.primaryButtonDisabled
            ]}
            onPress={handleStartPlan}
            disabled={isPlaceholder || false}
          >
            <Text style={[
              styles.primaryButtonText,
              isPlaceholder && styles.primaryButtonTextDisabled
            ]}>
              {isPlaceholder ? 'Coming Soon' : 'Start This Plan'}
            </Text>
            {!isPlaceholder && <ArrowRight size={16} color={Colors.white} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStepIndicator = () => {
    const steps = ['fitness-level', 'deadline', 'focus-areas', 'recommendation'];
    const currentIndex = steps.indexOf(step);
    
    return (
      <View style={styles.stepIndicator}>
        {steps.map((stepName, index) => (
          <View key={stepName} style={styles.stepIndicatorItem}>
            <View style={[
              styles.stepIndicatorDot,
              index <= currentIndex ? styles.stepIndicatorDotActive : styles.stepIndicatorDotInactive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.stepIndicatorLine,
                index < currentIndex ? styles.stepIndicatorLineActive : styles.stepIndicatorLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personalized PREP Plan</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {renderStepIndicator()}
        
        {/* Resume prompt */}
        {hasSavedProgress && step !== 'fitness-level' && !isLoadingProgress && (
          <View style={styles.resumePrompt}>
            <View style={styles.resumeIcon}>
              <Clock size={16} color={Colors.primary} />
            </View>
            <Text style={styles.resumeText}>
              Resuming from where you left off
            </Text>
            <TouchableOpacity 
              style={styles.clearProgressButton}
              onPress={() => {
                Alert.alert(
                  'Clear Progress',
                  'Are you sure you want to start over? This will clear your saved progress.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearProgress },
                  ]
                );
              }}
            >
              <Text style={styles.clearProgressText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoadingProgress ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading your progress...</Text>
            </View>
          ) : (
            <>
              {step === 'fitness-level' && renderFitnessLevelStep()}
              {step === 'deadline' && renderDeadlineStep()}
              {step === 'focus-areas' && renderFocusAreasStep()}
              {step === 'recommendation' && renderRecommendationStep()}
            </>
          )}
        </ScrollView>
      </View>
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
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepIndicatorDotActive: {
    backgroundColor: Colors.primary,
  },
  stepIndicatorDotInactive: {
    backgroundColor: Colors.border,
  },
  stepIndicatorLine: {
    width: 40,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  stepIndicatorLineActive: {
    backgroundColor: Colors.primary,
  },
  stepIndicatorLineInactive: {
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  stepHeader: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.headingLarge,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  recommendationCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
    marginBottom: spacing.xl,
  },
  recommendationGradient: {
    padding: spacing.lg,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  recommendationSubtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  recommendationBody: {
    padding: spacing.lg,
  },
  recommendationDescription: {
    ...typography.bodyMedium,
    color: Colors.text,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  recommendationFeatures: {
    gap: spacing.sm,
  },
  recommendationFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recommendationFeatureText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flex: 1,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.border,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  // Placeholder Styles
  placeholderBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  placeholderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning,
  },
  placeholderNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '10',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 16,
    gap: 8,
  },
  placeholderNoticeText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  primaryButtonTextDisabled: {
    color: Colors.textSecondary,
  },

  // Progress saving styles
  resumePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resumeIcon: {
    marginRight: spacing.sm,
  },
  resumeText: {
    ...typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  clearProgressButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearProgressText: {
    ...typography.bodySmall,
    color: Colors.error,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: spacing.md,
  },
});

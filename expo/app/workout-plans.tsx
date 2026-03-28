import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Filter,
  Target,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Dumbbell,
  Zap,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService } from '@/lib/workoutService';
import { WorkoutPlan } from '@/types/workout';
import PersonalizedPrepPlanModal from '@/components/PersonalizedPrepPlanModal';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type DurationFilter = 'all' | 4 | 8 | 12;
type FocusFilter = 'all' | 'cardio' | 'strength' | 'agility';

export default function WorkoutPlansScreen() {
  const router = useRouter();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPersonalizedModal, setShowPersonalizedModal] = useState(false);
  
  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('all');

  useEffect(() => {
    loadWorkoutPlans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workoutPlans, difficultyFilter, durationFilter, focusFilter]);

  const loadWorkoutPlans = async () => {
    setLoading(true);
    try {
      const plans = await workoutService.getPrepWorkoutPlans();
      setWorkoutPlans(plans);
    } catch (error) {
      console.error('Error loading workout plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutPlans();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...workoutPlans];

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(plan => plan.difficulty_level === difficultyFilter);
    }

    if (durationFilter !== 'all') {
      filtered = filtered.filter(plan => plan.duration_weeks === durationFilter);
    }

    if (focusFilter !== 'all') {
      filtered = filtered.filter(plan => 
        plan.focus_areas.includes(focusFilter)
      );
    }

    setFilteredPlans(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getFocusAreaIcon = (focus: string) => {
    switch (focus) {
      case 'cardio': return <Heart size={16} color="#EF4444" />;
      case 'strength': return <Dumbbell size={16} color="#3B82F6" />;
      case 'agility': return <Zap size={16} color="#10B981" />;
      default: return <Target size={16} color={Colors.textSecondary} />;
    }
  };

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Filter Plans</Text>
      
      {/* Difficulty Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Difficulty Level</Text>
        <View style={styles.filterButtons}>
          {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.filterButton,
                difficultyFilter === difficulty && styles.filterButtonActive
              ]}
              onPress={() => setDifficultyFilter(difficulty)}
            >
              <Text style={[
                styles.filterButtonText,
                difficultyFilter === difficulty && styles.filterButtonTextActive
              ]}>
                {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duration Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Duration</Text>
        <View style={styles.filterButtons}>
          {(['all', 4, 8, 12] as DurationFilter[]).map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.filterButton,
                durationFilter === duration && styles.filterButtonActive
              ]}
              onPress={() => setDurationFilter(duration)}
            >
              <Text style={[
                styles.filterButtonText,
                durationFilter === duration && styles.filterButtonTextActive
              ]}>
                {duration === 'all' ? 'All' : `${duration} weeks`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Focus Area Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Focus Area</Text>
        <View style={styles.filterButtons}>
          {(['all', 'cardio', 'strength', 'agility'] as FocusFilter[]).map((focus) => (
            <TouchableOpacity
              key={focus}
              style={[
                styles.filterButton,
                focusFilter === focus && styles.filterButtonActive
              ]}
              onPress={() => setFocusFilter(focus)}
            >
              <Text style={[
                styles.filterButtonText,
                focusFilter === focus && styles.filterButtonTextActive
              ]}>
                {focus === 'all' ? 'All' : focus.charAt(0).toUpperCase() + focus.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderWorkoutPlan = (plan: WorkoutPlan) => {
    const isPlaceholder = workoutService.isPlaceholderPlan(plan);
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={styles.workoutPlanCard}
        onPress={() => router.push(`/workout-plan/${plan.id}`)}
      >
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>
          <View style={styles.planBadges}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(plan.difficulty_level) + '20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: getDifficultyColor(plan.difficulty_level) }
              ]}>
                {plan.difficulty_level}
              </Text>
            </View>
            {isPlaceholder && (
              <View style={styles.placeholderBadge}>
                <Text style={styles.placeholderBadgeText}>Coming Soon</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.planMeta}>
          <View style={styles.planMetaItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.planMetaText}>{plan.duration_weeks} weeks</Text>
          </View>
          <View style={styles.planMetaItem}>
            <Target size={16} color={Colors.textSecondary} />
            <Text style={styles.planMetaText}>{plan.focus_areas.length} focus areas</Text>
          </View>
        </View>

        {isPlaceholder && (
          <View style={styles.placeholderNotice}>
            <Clock size={16} color={Colors.warning} />
            <Text style={styles.placeholderNoticeText}>
              This is a placeholder plan. Real content coming soon!
            </Text>
          </View>
        )}

        <View style={styles.focusAreas}>
          {plan.focus_areas.map((focus, index) => (
            <View key={index} style={styles.focusTag}>
              {getFocusAreaIcon(focus)}
              <Text style={styles.focusTagText}>{focus}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.viewPlanButton,
            isPlaceholder && styles.viewPlanButtonDisabled
          ]}
          onPress={() => router.push(`/workout-plan/${plan.id}`)}
          disabled={isPlaceholder}
        >
          <Text style={[
            styles.viewPlanButtonText,
            isPlaceholder && styles.viewPlanButtonTextDisabled
          ]}>
            {isPlaceholder ? 'Coming Soon' : 'View Plan'}
          </Text>
          {!isPlaceholder && <ChevronRight size={16} color={Colors.white} />}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PREP Workout Plans</Text>
        <TouchableOpacity 
          style={styles.personalizedButton}
          onPress={() => setShowPersonalizedModal(true)}
        >
          <Sparkles size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Personalized Plan Card */}
        <View style={styles.personalizedCard}>
          <LinearGradient
            colors={[Colors.gradients.fitness.start, Colors.gradients.fitness.end]}
            style={styles.personalizedGradient}
          >
            <View style={styles.personalizedContent}>
              <View style={styles.personalizedIcon}>
                <Sparkles size={24} color={Colors.white} />
              </View>
              <View style={styles.personalizedInfo}>
                <Text style={styles.personalizedTitle}>Get Your Personalized Plan</Text>
                <Text style={styles.personalizedSubtitle}>
                  Answer a few questions to get a workout plan tailored to your fitness level and goals
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.personalizedButton}
              onPress={() => setShowPersonalizedModal(true)}
            >
              <Text style={styles.personalizedButtonText}>Get Started</Text>
              <ChevronRight size={16} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Filters */}
        {renderFilterSection()}

        {/* Workout Plans */}
        <View style={styles.plansSection}>
          <View style={styles.plansHeader}>
            <Text style={styles.plansTitle}>
              {filteredPlans.length} Plan{filteredPlans.length !== 1 ? 's' : ''} Available
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading workout plans...</Text>
            </View>
          ) : filteredPlans.length > 0 ? (
            <View style={styles.plansList}>
              {filteredPlans.map(renderWorkoutPlan)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Plans Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your filters or check back later for new plans
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Personalized Plan Modal */}
      <PersonalizedPrepPlanModal
        visible={showPersonalizedModal}
        onClose={() => setShowPersonalizedModal(false)}
        onPlanSelected={(plan) => {
          setShowPersonalizedModal(false);
        }}
      />
    </SafeAreaView>
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
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },
  personalizedCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  personalizedGradient: {
    padding: spacing.lg,
  },
  personalizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  personalizedIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  personalizedInfo: {
    flex: 1,
  },
  personalizedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  personalizedSubtitle: {
    fontSize: 14,
    color: Colors.white + 'CC',
    lineHeight: 20,
  },
  personalizedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  personalizedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  filterSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  filterTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  filterGroup: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  plansSection: {
    marginHorizontal: spacing.lg,
  },
  plansHeader: {
    marginBottom: spacing.lg,
  },
  plansTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: spacing.md,
  },
  plansList: {
    gap: spacing.md,
  },
  workoutPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  planTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  planMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  planMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  planMetaText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  focusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  focusTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  viewPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  viewPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Placeholder Styles
  planBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
    marginBottom: spacing.md,
    gap: 8,
  },
  placeholderNoticeText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  viewPlanButtonDisabled: {
    backgroundColor: Colors.border,
  },
  viewPlanButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});

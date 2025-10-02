import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Play,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  BarChart3,
  ArrowRight,
  Plus,
  Sparkles,
  Dumbbell,
  Crown,
  Star,
  Zap,
  Users,
  BookOpen,
  Video,
  MessageCircle,
  CheckCircle,
  Lock,
  Heart,
  Timer,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService } from '@/lib/workoutService';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  WorkoutPlan,
  UserWorkoutSessionWithDetails,
  WorkoutAnalytics,
} from '@/types/workout';

interface EnhancedPremiumPlansDashboardProps {
  selectedPlan?: WorkoutPlan | null;
  userPreferences?: {
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    readinessDeadline: Date;
    focusAreas: ('cardio' | 'strength' | 'agility')[];
  } | null;
  hasCompletedPersonalizedPlan?: boolean;
  onRedoPersonalizedPlan?: () => void;
}

const EnhancedPremiumPlansDashboard = React.memo(function EnhancedPremiumPlansDashboard({ 
  selectedPlan, 
  userPreferences,
  hasCompletedPersonalizedPlan = false,
  onRedoPersonalizedPlan
}: EnhancedPremiumPlansDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, canAccessTrainingPlan } = useSubscription();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [recentSessions, setRecentSessions] = useState<UserWorkoutSessionWithDetails[]>([]);
  const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id && user.id.trim() !== '') {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, selectedPlan]);

  const loadDashboardData = async () => {
    try {
      const currentUser = user;
      if (!currentUser?.id || currentUser.id.trim() === '') {
        const allPlans = await workoutService.getPrepWorkoutPlans();
        // Filter out the selected plan to avoid duplication
        const filteredPlans = selectedPlan 
          ? allPlans.filter(plan => plan.id !== selectedPlan.id)
          : allPlans;
        setWorkoutPlans(filteredPlans);
        setRecentSessions([]);
        setAnalytics(null);
        return;
      }

      const [allPlans, sessions, userAnalytics] = await Promise.all([
        workoutService.getPrepWorkoutPlans(),
        workoutService.getUserWorkoutHistory(currentUser.id, 5),
        workoutService.getUserWorkoutAnalytics(currentUser.id),
      ]);
      
      // Filter out the selected plan to avoid duplication
      const filteredPlans = selectedPlan 
        ? allPlans.filter(plan => plan.id !== selectedPlan.id)
        : allPlans;
      setWorkoutPlans(filteredPlans);
      setRecentSessions(sessions);
      setAnalytics(userAnalytics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setWorkoutPlans([]);
      setRecentSessions([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id && user.id.trim() !== '') {
      await loadDashboardData();
    }
    setRefreshing(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading premium plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Premium Status Banner */}
      <View style={styles.premiumBanner}>
        <LinearGradient
          colors={[Colors.gradients.premium.start, Colors.gradients.premium.end]}
          style={styles.premiumBannerGradient}
        >
          <View style={styles.premiumBannerContent}>
            <View style={styles.premiumBannerLeft}>
              <Crown size={24} color={Colors.white} />
              <View style={styles.premiumBannerInfo}>
                <Text style={styles.premiumBannerTitle}>
                  {subscription?.tier === 'premium' ? 'Premium Member' : 'Upgrade to Premium'}
                </Text>
                <Text style={styles.premiumBannerSubtitle}>
                  {subscription?.tier === 'premium' 
                    ? 'Unlock unlimited access to all premium features'
                    : 'Get personalized plans, unlimited tests, and more'
                  }
                </Text>
              </View>
            </View>
            {subscription?.tier !== 'premium' && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => router.push('/subscription')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
                <ArrowRight size={16} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Analytics Overview */}
      {analytics && (
        <View style={styles.analyticsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIcon}>
                <Target size={20} color={Colors.primary} />
              </View>
              <Text style={styles.analyticsNumber}>{analytics.totalSessions}</Text>
              <Text style={styles.analyticsLabel}>Total Sessions</Text>
            </View>
            
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIcon}>
                <Clock size={20} color={Colors.primary} />
              </View>
              <Text style={styles.analyticsNumber}>
                {Math.round(analytics.averageSessionDuration)}
              </Text>
              <Text style={styles.analyticsLabel}>Avg Duration (min)</Text>
            </View>
            
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIcon}>
                <TrendingUp size={20} color={Colors.primary} />
              </View>
              <Text style={styles.analyticsNumber}>
                {Math.round(analytics.completionRate * 100)}%
              </Text>
              <Text style={styles.analyticsLabel}>Completion Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Personalized Plan Section */}
      {selectedPlan ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Active Plan</Text>
            {hasCompletedPersonalizedPlan && onRedoPersonalizedPlan && (
              <TouchableOpacity onPress={onRedoPersonalizedPlan}>
                <Text style={styles.redoText}>Redo Plan</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.activePlanCard}>
            <LinearGradient
              colors={[Colors.gradients.success.start, Colors.gradients.success.end]}
              style={styles.activePlanGradient}
            >
              <View style={styles.activePlanContent}>
                <View style={styles.activePlanIcon}>
                  <Award size={24} color={Colors.white} />
                </View>
                <View style={styles.activePlanInfo}>
                  <Text style={styles.activePlanTitle}>{selectedPlan.title}</Text>
                  <Text style={styles.activePlanSubtitle}>
                    {selectedPlan.duration_weeks} weeks • {selectedPlan.difficulty_level} • {selectedPlan.focus_areas.join(', ')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.activePlanButton}
                onPress={() => router.push(`/workout-plan/${selectedPlan.id}`)}
              >
                <Text style={styles.activePlanButtonText}>Continue Training</Text>
                <ArrowRight size={16} color={Colors.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Get Your Personalized Plan</Text>
          </View>
          
          <View style={styles.personalizedPlanCard}>
            <LinearGradient
              colors={[Colors.gradients.fitness.start, Colors.gradients.fitness.end]}
              style={styles.personalizedPlanGradient}
            >
              <View style={styles.personalizedPlanContent}>
                <View style={styles.personalizedPlanIcon}>
                  <Sparkles size={24} color={Colors.white} />
                </View>
                <View style={styles.personalizedPlanInfo}>
                  <Text style={styles.personalizedPlanTitle}>Personalized Training</Text>
                  <Text style={styles.personalizedPlanSubtitle}>
                    Answer a few questions to get a workout plan tailored to your fitness level and goals
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.personalizedPlanButton}
                onPress={() => router.push('/fitness?modal=personalized-plan')}
              >
                <Text style={styles.personalizedPlanButtonText}>Get Started</Text>
                <ArrowRight size={16} color={Colors.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Premium Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        
        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/workout-plans')}
          >
            <View style={styles.featureIcon}>
              <Target size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Training Plans</Text>
            <Text style={styles.featureSubtitle}>Comprehensive workout programs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/practice-tests')}
          >
            <View style={styles.featureIcon}>
              <Timer size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Digital Tests</Text>
            <Text style={styles.featureSubtitle}>Unlimited practice tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/workout-analytics')}
          >
            <View style={styles.featureIcon}>
              <BarChart3 size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Analytics</Text>
            <Text style={styles.featureSubtitle}>Track your progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/workout-history')}
          >
            <View style={styles.featureIcon}>
              <Activity size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>History</Text>
            <Text style={styles.featureSubtitle}>View past sessions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Plans */}
      {workoutPlans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <TouchableOpacity onPress={() => router.push('/workout-plans')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {workoutPlans.map((plan) => {
            const isPlaceholder = workoutService.isPlaceholderPlan(plan);
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => router.push(`/workout-plan/${plan.id}`)}
              >
                <LinearGradient
                  colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
                  style={styles.planCardGradient}
                >
                  <View style={styles.planCardContent}>
                    <View style={styles.planCardHeader}>
                      <View style={styles.planCardInfo}>
                        <Text style={styles.planCardTitle}>{plan.title}</Text>
                        <Text style={styles.planCardDescription}>{plan.description}</Text>
                        
                        <View style={styles.planCardMeta}>
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: Colors.white + '20' }
                          ]}>
                            <Text style={styles.difficultyText}>
                              {plan.difficulty_level}
                            </Text>
                          </View>
                          
                          <View style={styles.durationBadge}>
                            <Calendar size={12} color={Colors.white} />
                            <Text style={styles.durationText}>{plan.duration_weeks} weeks</Text>
                          </View>
                          
                          {isPlaceholder && (
                            <View style={styles.placeholderBadge}>
                              <Text style={styles.placeholderBadgeText}>Coming Soon</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.planCardActions}>
                        <TouchableOpacity 
                          style={[
                            styles.startPlanButton,
                            isPlaceholder && styles.startPlanButtonDisabled
                          ]}
                          onPress={() => router.push(`/workout-plan/${plan.id}`)}
                          disabled={isPlaceholder}
                        >
                          {isPlaceholder ? (
                            <Clock size={16} color={Colors.white + '80'} />
                          ) : (
                            <Play size={16} color={Colors.white} />
                          )}
                          <Text style={[
                            styles.startPlanText,
                            isPlaceholder && styles.startPlanTextDisabled
                          ]}>
                            {isPlaceholder ? 'Soon' : 'Start'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.focusAreas}>
                      {plan.focus_areas.slice(0, 3).map((focus, index) => (
                        <View key={index} style={styles.focusBadge}>
                          <Text style={styles.focusText}>{focus}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/workout-history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => router.push(`/workout/session/${session.id}`)}
            >
              <View style={styles.sessionCardContent}>
                <View style={styles.sessionCardLeft}>
                  <View style={styles.sessionIcon}>
                    <Activity size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>
                      {session.workout?.name || 'Workout Session'}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.started_at)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionCardRight}>
                  {session.total_duration_minutes && (
                    <Text style={styles.sessionDuration}>
                      {formatDuration(session.total_duration_minutes)}
                    </Text>
                  )}
                  <View style={[
                    styles.sessionStatus,
                    { backgroundColor: session.completed_at ? Colors.success + '20' : Colors.warning + '20' }
                  ]}>
                    <Text style={[
                      styles.sessionStatusText,
                      { color: session.completed_at ? Colors.success : Colors.warning }
                    ]}>
                      {session.completed_at ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/workout-plans')}
          >
            <View style={styles.quickActionIcon}>
              <Target size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>Browse Plans</Text>
            <Text style={styles.quickActionSubtitle}>Find your next workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/workout-history')}
          >
            <View style={styles.quickActionIcon}>
              <BarChart3 size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>View Progress</Text>
            <Text style={styles.quickActionSubtitle}>Track your fitness journey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/workout-analytics')}
          >
            <View style={styles.quickActionIcon}>
              <Award size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>Achievements</Text>
            <Text style={styles.quickActionSubtitle}>See your milestones</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  
  // Premium Banner
  premiumBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  premiumBannerGradient: {
    padding: spacing.lg,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  premiumBannerTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  premiumBannerSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  upgradeButtonText: {
    ...typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },

  // Analytics
  analyticsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  analyticsIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  analyticsNumber: {
    ...typography.h2,
    color: Colors.text,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  analyticsLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  viewAllText: {
    ...typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  redoText: {
    ...typography.body,
    color: Colors.warning,
    fontWeight: '600',
  },

  // Active Plan
  activePlanCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  activePlanGradient: {
    padding: spacing.lg,
  },
  activePlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activePlanIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activePlanInfo: {
    flex: 1,
  },
  activePlanTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  activePlanSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  activePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  activePlanButtonText: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },

  // Personalized Plan
  personalizedPlanCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  personalizedPlanGradient: {
    padding: spacing.lg,
  },
  personalizedPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  personalizedPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  personalizedPlanInfo: {
    flex: 1,
  },
  personalizedPlanTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  personalizedPlanSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  personalizedPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  personalizedPlanButtonText: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  featureSubtitle: {
    ...typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Plan Cards
  planCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  planCardGradient: {
    padding: spacing.lg,
  },
  planCardContent: {
    flex: 1,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planCardInfo: {
    flex: 1,
  },
  planCardTitle: {
    ...typography.h3,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planCardDescription: {
    ...typography.body,
    color: Colors.white + 'CC',
    marginBottom: spacing.md,
  },
  planCardMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.full,
  },
  durationText: {
    ...typography.caption,
    color: Colors.white,
  },
  planCardActions: {
    alignItems: 'flex-end',
  },
  startPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  startPlanText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  focusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.full,
  },
  focusText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },

  // Session Cards
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  sessionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  sessionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sessionDate: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  sessionCardRight: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sessionStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sessionStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quickActionSubtitle: {
    ...typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Placeholder Styles
  placeholderBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  placeholderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning,
  },
  startPlanButtonDisabled: {
    backgroundColor: Colors.white + '20',
  },
  startPlanTextDisabled: {
    color: Colors.white + '80',
  },
});

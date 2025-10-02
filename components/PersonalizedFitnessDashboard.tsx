import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ImageBackground,
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
  ChevronRight,
  Trophy,
  Flame,
  MapPin,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { workoutService } from '@/lib/workoutService';
import { WorkoutPlanProgressionService, CurrentWorkout } from '@/lib/workoutPlanProgressionService';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  WorkoutPlan,
  UserWorkoutSessionWithDetails,
  WorkoutAnalytics,
} from '@/types/workout';

interface PersonalizedFitnessDashboardProps {
  selectedPlan?: WorkoutPlan | null;
  userPreferences?: {
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    readinessDeadline: Date;
    focusAreas: ('cardio' | 'strength' | 'agility')[];
  } | null;
  hasCompletedPersonalizedPlan?: boolean;
  onRedoPersonalizedPlan?: () => void;
}

const PersonalizedFitnessDashboard = React.memo(function PersonalizedFitnessDashboard({ 
  selectedPlan, 
  userPreferences,
  hasCompletedPersonalizedPlan = false,
  onRedoPersonalizedPlan
}: PersonalizedFitnessDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [recentSessions, setRecentSessions] = useState<UserWorkoutSessionWithDetails[]>([]);
  const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  useEffect(() => {
    if (user?.id && user.id.trim() !== '') {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, selectedPlan]);

  useEffect(() => {
    if (selectedPlan) {
      setTotalWeeks(selectedPlan.duration_weeks);
      // Calculate current week based on when plan was started
      // For now, we'll use a simple calculation
      const weeksSinceStart = Math.floor((Date.now() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000));
      const currentWeekNumber = Math.max(1, Math.min(weeksSinceStart + 1, selectedPlan.duration_weeks));
      setCurrentWeek(currentWeekNumber);
      setProgressPercentage((currentWeekNumber / selectedPlan.duration_weeks) * 100);
    }
  }, [selectedPlan]);

  const loadDashboardData = async () => {
    try {
      const currentUser = user;
      if (!currentUser?.id || currentUser.id.trim() === '') {
        setRecentSessions([]);
        setAnalytics(null);
        setCurrentWorkout(null);
        setActiveSubscription(null);
        return;
      }

      const [sessions, userAnalytics] = await Promise.all([
        workoutService.getUserWorkoutHistory(currentUser.id, 10),
        workoutService.getUserWorkoutAnalytics(currentUser.id),
      ]);
      
      setRecentSessions(sessions || []);
      setAnalytics(userAnalytics || {
        totalSessions: 0,
        totalDuration: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        favoriteExercises: [],
        weeklyProgress: [],
        strengthProgress: []
      });

      // Load current workout if user has a selected plan
      if (selectedPlan) {
        try {
          const subscription = await WorkoutPlanProgressionService.getActiveSubscription(currentUser.id, selectedPlan.id);
          if (subscription) {
            setActiveSubscription(subscription);
            const workout = await WorkoutPlanProgressionService.getCurrentWorkout(currentUser.id, selectedPlan.id);
            setCurrentWorkout(workout);
            
            // Update progress based on subscription
            setCurrentWeek(subscription.current_week);
            setProgressPercentage((subscription.current_week / selectedPlan.duration_weeks) * 100);
          }
        } catch (error) {
          console.error('Failed to load workout progression data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setRecentSessions([]);
      setAnalytics({
        totalSessions: 0,
        totalDuration: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        favoriteExercises: [],
        weeklyProgress: [],
        strengthProgress: []
      });
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

  const handleStartCurrentWorkout = async () => {
    if (!currentWorkout || !user?.id || !selectedPlan) return;
    
    try {
      // Navigate to the workout detail screen
      router.push(`/workout/${currentWorkout.workout_id}`);
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  const handleCompleteWorkout = async () => {
    if (!currentWorkout || !user?.id || !selectedPlan || !activeSubscription) return;
    
    try {
      // Mark workout as completed
      await WorkoutPlanProgressionService.completeWorkoutDay(
        activeSubscription.id,
        currentWorkout.workout_id,
        currentWorkout.day_number,
        currentWorkout.week_number
      );
      
      // Advance to next day
      const advanced = await WorkoutPlanProgressionService.advanceWorkoutDay(user.id, selectedPlan.id);
      
      if (advanced) {
        // Reload dashboard data to show next workout
        await loadDashboardData();
        Alert.alert('Success', 'Workout completed! Next workout is now available.');
      } else {
        // Plan completed
        Alert.alert('Congratulations!', 'You have completed the entire workout plan!');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your fitness dashboard...</Text>
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
      {/* Personalized Plan Section */}
      {selectedPlan ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Personalized Plan</Text>
            {hasCompletedPersonalizedPlan && onRedoPersonalizedPlan && (
              <TouchableOpacity onPress={onRedoPersonalizedPlan}>
                <Text style={styles.redoText}>Redo Plan</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.activePlanCard}>
            <LinearGradient
              colors={['#374151', '#1F2937']}
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
              
              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>Week {currentWeek} of {totalWeeks}</Text>
                  <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
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
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
              style={styles.personalizedPlanBackground}
              imageStyle={styles.personalizedPlanBackgroundImage}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
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
            </ImageBackground>
          </View>
        </View>
      )}

      {/* Current Workout Section */}
      {currentWorkout && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          
          <View style={styles.currentWorkoutCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.primary + 'CC']}
              style={styles.currentWorkoutGradient}
            >
              <View style={styles.currentWorkoutContent}>
                <View style={styles.currentWorkoutIcon}>
                  <Target size={24} color={Colors.white} />
                </View>
                <View style={styles.currentWorkoutInfo}>
                  <Text style={styles.currentWorkoutTitle}>
                    Day {currentWorkout.day_number} • Week {currentWorkout.week_number}
                  </Text>
                  <Text style={styles.currentWorkoutSubtitle}>
                    {currentWorkout.workout_name}
                  </Text>
                  <Text style={styles.currentWorkoutDescription}>
                    {currentWorkout.workout_description}
                  </Text>
                  <View style={styles.currentWorkoutMeta}>
                    <View style={styles.currentWorkoutMetaItem}>
                      <Clock size={16} color={Colors.white} />
                      <Text style={styles.currentWorkoutMetaText}>
                        {currentWorkout.estimated_duration_minutes} min
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.currentWorkoutActions}>
                <TouchableOpacity 
                  style={styles.startWorkoutButton}
                  onPress={handleStartCurrentWorkout}
                >
                  <Play size={16} color={Colors.primary} />
                  <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.completeWorkoutButton}
                  onPress={handleCompleteWorkout}
                >
                  <CheckCircle size={16} color={Colors.white} />
                  <Text style={styles.completeWorkoutButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Progress Analytics */}
      {analytics && analytics.totalSessions > 0 && (
        <View style={styles.section}>
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

      {/* Weekly Goals */}
      {selectedPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Goals</Text>
          
          <View style={styles.goalsContainer}>
            <View style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Target size={20} color={Colors.success} />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>Complete 3 Workouts</Text>
                <Text style={styles.goalSubtitle}>Focus on {selectedPlan.focus_areas.join(', ')}</Text>
              </View>
              <View style={styles.goalStatus}>
                <Text style={styles.goalProgress}>1/3</Text>
              </View>
            </View>
            
            <View style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Timer size={20} color={Colors.warning} />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>Total Training Time</Text>
                <Text style={styles.goalSubtitle}>Aim for 150 minutes this week</Text>
              </View>
              <View style={styles.goalStatus}>
                <Text style={styles.goalProgress}>45/150</Text>
              </View>
            </View>
            
            <View style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Flame size={20} color={Colors.error} />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>Calories Burned</Text>
                <Text style={styles.goalSubtitle}>Target: 800 calories</Text>
              </View>
              <View style={styles.goalStatus}>
                <Text style={styles.goalProgress}>320/800</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/workout-history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSessions.slice(0, 5).map((session) => (
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
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/practice-sessions')}
          >
            <View style={styles.quickActionIcon}>
              <MapPin size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>Book Tests</Text>
            <Text style={styles.quickActionSubtitle}>Schedule practice tests</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
});

export default PersonalizedFitnessDashboard;

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
  
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
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
    marginTop: spacing.md,
  },
  activePlanButtonText: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  progressPercentage: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.white + '30',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
  },

  // Personalized Plan with Background Image
  personalizedPlanCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  personalizedPlanBackground: {
    width: '100%',
    height: 200,
  },
  personalizedPlanBackgroundImage: {
    borderRadius: borderRadius.xl,
  },
  personalizedPlanGradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
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

  // Analytics
  analyticsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 100,
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

  // Goals
  goalsContainer: {
    gap: spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 80,
    ...shadows.medium,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.success + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  goalSubtitle: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    ...typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Session Cards
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
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
    ...typography.bodyMedium,
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

  // Current Workout Styles
  currentWorkoutCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  currentWorkoutGradient: {
    padding: spacing.lg,
  },
  currentWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  currentWorkoutIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  currentWorkoutInfo: {
    flex: 1,
  },
  currentWorkoutTitle: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  currentWorkoutSubtitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  currentWorkoutDescription: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  currentWorkoutMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  currentWorkoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currentWorkoutMetaText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  currentWorkoutActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  startWorkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  startWorkoutButtonText: {
    ...typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  completeWorkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  completeWorkoutButtonText: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
});

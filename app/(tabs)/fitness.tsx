import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Target,
  TrendingUp,
  Timer,
  Calendar,
  Star,
  Info,
  Activity,
  Zap,
  Award,
  MapPin,
  Plus,
  BarChart3,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Target as TargetIcon,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  List,
  DollarSign,
  Dumbbell,
  Heart,
  Trophy,
  Video,
  MessageCircle,
  User,
  Settings,
  Bell,
  ClipboardList,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { usePinTest } from '@/context/PinTestContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { RobustBookingService } from '@/lib/robustBookingService';
import UpsellModal from '@/components/UpsellModal';
import LockedContentOverlay from '@/components/LockedContentOverlay';
import TabSpecificHeader from '@/components/TabSpecificHeader';
import EnhancedCard from '@/components/EnhancedCard';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';
import EmptyState from '@/components/EmptyState';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';
import ProfessionalBackground from '@/components/ProfessionalBackground';
import { trackTrainingPlanView, trackDigitalTestAttempt } from '@/lib/monetizationAnalytics';
import PersonalizedFitnessDashboard from '@/components/PersonalizedFitnessDashboard';
import PersonalizedPrepPlanModal from '@/components/PersonalizedPrepPlanModal';
import { WorkoutPlan as DBWorkoutPlan } from '@/types/workout';
import { WorkoutPlanProgressionService } from '@/lib/workoutPlanProgressionService';
import { ENABLE_OACP_FITNESS_LOGS } from '@/constants/applicationFeatures';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { FitnessLog, FitnessLogDay } from '@/types/fitness-log';
import { format, addDays } from 'date-fns';

type Booking = {
  id: string;
  session_id: string;
  status: string;
  practice_sessions?: {
    title: string;
    session_date: string;
    test_type: string;
  };
};

export default function FitnessScreen() {
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'tests' | 'workouts'>('tests');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState<'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general'>('general');
  const [showPersonalizedPlanModal, setShowPersonalizedPlanModal] = useState(false);
  const [hasSeenPersonalizedPlan, setHasSeenPersonalizedPlan] = useState(false);
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState<DBWorkoutPlan | null>(null);
  const [userPreferences, setUserPreferences] = useState<{
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    readinessDeadline: Date;
    focusAreas: ('cardio' | 'strength' | 'agility')[];
  } | null>(null);
  const [activeFitnessLog, setActiveFitnessLog] = useState<FitnessLog | null>(null);
  const [fitnessLogLoading, setFitnessLogLoading] = useState(false);
  const [logDays, setLogDays] = useState<FitnessLogDay[]>([]);
  const [daysCompleted, setDaysCompleted] = useState(0);
  
  const { testResults, formatTime, getPersonalBests } = usePinTest();
  const { subscription, canAccessDigitalTest, canAccessTrainingPlan, trackDigitalTestUsage, getRemainingDigitalTests } = useSubscription();
  const { user } = useAuth();
  const { loadBookings: loadContextBookings } = usePracticeSessions();
  
  const personalBests = getPersonalBests();

  // Mock workout plans data (keeping for backward compatibility)
  const workoutPlans: any[] = [
    {
      id: 'prep-12-week',
      title: 'PREP Test 12-Week Program',
      description: 'Comprehensive training program to prepare for the PREP test',
      duration: '12 weeks',
      difficulty: 'intermediate',
      focus: ['Cardiovascular', 'Strength', 'Agility'],
      currentWeek: 3,
      totalWeeks: 12,
      progress: 25,
      coachName: 'Coach Sarah',
      coachAvatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      nextSession: '2024-01-20T10:00:00Z',
    },
    {
      id: 'pin-8-week',
      title: 'PIN Test 8-Week Program',
      description: 'Focused training for the PIN test requirements',
      duration: '8 weeks',
      difficulty: 'advanced',
      focus: ['Strength', 'Endurance', 'Technique'],
      currentWeek: 1,
      totalWeeks: 8,
      progress: 12.5,
      coachName: 'Coach Mike',
      coachAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      nextSession: '2024-01-18T14:00:00Z',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSectionToggle = (section: 'tests' | 'workouts' | 'logs') => {
    // Check if user has completed personalized PREP plan
    const hasCompletedPersonalizedPlan = user?.has_completed_personalized_prep_plan;
    
    // If trying to access workouts without completing the modal and user hasn't completed personalized plan, show the modal
    if (section === 'workouts' && !selectedWorkoutPlan && !hasCompletedPersonalizedPlan) {
      setShowPersonalizedPlanModal(true);
      setHasSeenPersonalizedPlan(true);
      return; // Don't switch to workouts tab yet
    }
    
    setActiveSection(section);
    
    // Show personalized plan modal when switching to workouts for the first time and user hasn't completed it
    if (section === 'workouts' && !hasSeenPersonalizedPlan && !hasCompletedPersonalizedPlan) {
      setShowPersonalizedPlanModal(true);
      setHasSeenPersonalizedPlan(true);
    }
    
    // Reset the flag when switching back to tests so modal can be shown again
    if (section === 'tests') {
      setHasSeenPersonalizedPlan(false);
    }
  };

  const loadBookings = async () => {
    if (!user) return;
    
    setBookingsLoading(true);
    try {
      // Use Promise.allSettled to handle both operations independently
      const [contextResult, bookingsResult] = await Promise.allSettled([
        // Load from context with timeout protection
        Promise.race([
          loadContextBookings(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Context loading timeout')), 10000)
          )
        ]),
        // Get user bookings with built-in retry logic
        RobustBookingService.getUserBookings()
      ]);

      // Handle context result
      if (contextResult.status === 'rejected') {
        console.warn('⚠️ Context loading failed:', contextResult.reason?.message);
      }

      // Handle bookings result
      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value || []);
      } else {
        console.warn('⚠️ RobustBookingService failed:', bookingsResult.reason?.message);
        setBookings([]);
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error loading bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadActiveFitnessLog = async () => {
    if (!user || !ENABLE_OACP_FITNESS_LOGS) return;
    
    setFitnessLogLoading(true);
    try {
      const log = await fitnessLogService.getActiveLog();
      setActiveFitnessLog(log);
      if (log) {
        const days = await fitnessLogService.getDays(log.id);
        setLogDays(days);
        setDaysCompleted(days.filter(day => day.is_complete).length);
      } else {
        setLogDays([]);
        setDaysCompleted(0);
      }
    } catch (error) {
      console.error('Error loading active fitness log:', error);
    } finally {
      setFitnessLogLoading(false);
    }
  };

  const handleResetLog = async () => {
    if (!activeFitnessLog) return;

    Alert.alert(
      'Reset Fitness Log',
      `Are you sure you want to reset your current fitness log? This will permanently delete all your progress and cannot be undone.\n\nCurrent progress: ${daysCompleted}/14 days completed`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Log',
          style: 'destructive',
          onPress: async () => {
            try {
              setFitnessLogLoading(true);
              
              // Delete the current log and all its days
              await fitnessLogService.deleteLog(activeFitnessLog.id);
              
              // Clear local state
              setActiveFitnessLog(null);
              setLogDays([]);
              setDaysCompleted(0);
              
              Alert.alert(
                'Log Reset',
                'Your fitness log has been successfully reset. You can now start a new 14-day log.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error resetting fitness log:', error);
              Alert.alert(
                'Error',
                'Failed to reset fitness log. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setFitnessLogLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (user) {
      loadBookings();
      loadActiveFitnessLog();
    }
  }, [user]);

  // Handle modal parameter from URL
  useEffect(() => {
    if (params.modal === 'personalized-plan') {
      setShowPersonalizedPlanModal(true);
      // Clear the URL parameter
      router.replace('/fitness');
    }
  }, [params.modal]);

  // Load selected workout plan from AsyncStorage
  useEffect(() => {
    const loadSelectedPlan = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem('selected_workout_plan');
        if (savedPlan) {
          const { plan, preferences } = JSON.parse(savedPlan);
          setSelectedWorkoutPlan(plan);
          setUserPreferences(preferences);
        }
      } catch (error) {
        console.error('Error loading selected plan:', error);
      }
    };
    
    loadSelectedPlan();
  }, []);

  // Digital test access handler
  const handleDigitalTestAccess = async () => {
    // For fitness app, allow free access to PIN tests regardless of usage
    const shouldAllowAccess = canAccessDigitalTest() || subscription.tier === 'free';
    
    try {
      if (shouldAllowAccess) {
        try {
          await trackDigitalTestAttempt('fitness_screen_access');
          await trackDigitalTestUsage();
        } catch (error) {
          console.error('Error tracking digital test usage:', error);
        }
        router.push('/pin-test');
      } else {
        try {
          await trackDigitalTestAttempt('fitness_screen_locked');
        } catch (error) {
          console.error('Error tracking digital test attempt:', error);
        }
        setUpsellTrigger('digital-test');
        setShowUpsellModal(true);
      }
    } catch (error) {
      console.error('❌ Error in handleDigitalTestAccess:', error);
      // Fallback: try to navigate directly
      router.push('/pin-test');
    }
  };

  // Test Results Widget
  const TestResultsWidget = () => {
    if (testResults.length === 0) {
      return null;
    }

    return (
      <View style={styles.testResultsWidget}>
        <View style={styles.widgetHeader}>
          <BarChart3 size={20} color={Colors.primary} />
          <Text style={styles.widgetTitle}>Recent Test Results</Text>
          <TouchableOpacity onPress={() => router.push('/pin-test/results')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.testResultsList}>
          {testResults.slice(0, 2).map((result: any) => (
            <TouchableOpacity 
              key={result.id} 
              style={styles.testResultItem}
              onPress={() => router.push('/pin-test/results')}
            >
              <View style={styles.testResultHeader}>
                <View style={styles.testResultType}>
                  <View style={[styles.testResultIcon, { backgroundColor: '#EBF4FF' }]}>
                    <Target size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.testResultTitle}>PIN Test</Text>
                </View>
                <Text style={styles.testResultDate}>
                  {new Date(result.test_date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.testResultMetrics}>
                <View style={styles.testResultMetric}>
                  <Text style={styles.testResultMetricValue}>
                    {result.overall_score || 'N/A'}
                  </Text>
                  <Text style={styles.testResultMetricLabel}>Score</Text>
                </View>
                <View style={styles.testResultMetric}>
                  <Text style={[
                    styles.testResultMetricValue,
                    result.pass_status ? { color: '#10B981' } : { color: '#EF4444' }
                  ]}>
                    {result.pass_status ? 'Pass' : 'Fail'}
                  </Text>
                  <Text style={styles.testResultMetricLabel}>Status</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Current Workout Plan Widget
    const CurrentWorkoutWidget = () => {
    if (!selectedWorkoutPlan) {
      return (
        <View style={styles.emptyWorkoutWidget}>
          <View style={styles.emptyWorkoutContent}>
            <Dumbbell size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyWorkoutTitle}>No Active Workout Plan</Text>
            <Text style={styles.emptyWorkoutSubtitle}>Start a personalized training program with expert coaching</Text>
            <TouchableOpacity 
              style={styles.startWorkoutButton}
              onPress={() => {
                setShowPersonalizedPlanModal(true);
                setHasSeenPersonalizedPlan(true);
              }}
            >
              <Text style={styles.startWorkoutButtonText}>Browse Plans</Text>
              <ArrowRight size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.currentWorkoutWidget}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{selectedWorkoutPlan.title}</Text>
            <Text style={styles.workoutSubtitle}>{selectedWorkoutPlan.duration_weeks} weeks • {selectedWorkoutPlan.difficulty_level}</Text>
          </View>
          <View style={styles.workoutProgress}>
            <Text style={styles.workoutProgressText}>0%</Text>
          </View>
        </View>
        
        <View style={styles.workoutProgressBar}>
          <View 
            style={[
              styles.workoutProgressFill, 
              { width: '0%' }
            ]} 
          />
        </View>
        
        <View style={styles.workoutCoach}>
          <View style={styles.coachAvatar}>
            <User size={24} color={Colors.primary} />
          </View>
          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>Your Coach</Text>
            <Text style={styles.coachRole}>Personal Trainer</Text>
          </View>
          <TouchableOpacity style={styles.messageCoachButton}>
            <MessageCircle size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={() => router.push(`/workout-plan/${selectedWorkoutPlan.id}`)}
        >
          <Play size={16} color={Colors.white} />
          <Text style={styles.startWorkoutText}>View Your Plan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
      {/* Enhanced Fitness Header - Inspired by Dashboard & Application */}
      <View style={styles.fitnessHeader}>
        <View style={styles.fitnessBackground}>
          <LinearGradient
            colors={[Colors.gradients.fitness.start, Colors.gradients.fitness.end]}
            style={styles.fitnessGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.fitnessContent}>
            <View style={styles.fitnessTextContainer}>
              <Text style={styles.fitnessTitle}>Fitness Hub</Text>
              <Text style={styles.fitnessSubtitle}>
                {testResults.length > 0 ? 'Keep pushing your limits' : 'Train smarter, perform better'}
              </Text>
              <View style={styles.fitnessBadge}>
                <Activity size={14} color={Colors.white} />
                <Text style={styles.fitnessBadgeText}>
                  {testResults.length > 0 ? `${testResults.length} Tests Completed` : 'Ready to Start'}
                </Text>
              </View>
            </View>
            
            <View style={styles.fitnessStats}>
              <View style={styles.fitnessStatCard}>
                <Text style={styles.fitnessStatValue}>
                  {testResults.length > 0 ? testResults.length : '0'}
                </Text>
                <Text style={styles.fitnessStatLabel}>Tests</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Section Toggle */}
      <View style={styles.sectionToggle}>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            activeSection === 'tests' && styles.toggleButtonActive
          ]}
                      onPress={() => handleSectionToggle('tests')}
        >
          <Target size={20} color={activeSection === 'tests' ? Colors.white : Colors.textSecondary} />
          <Text style={[
            styles.toggleButtonText,
            activeSection === 'tests' && styles.toggleButtonTextActive
          ]}>
            Test Practice
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            activeSection === 'workouts' && styles.toggleButtonActive
          ]}
          onPress={() => handleSectionToggle('workouts')}
        >
          <Dumbbell size={20} color={
            activeSection === 'workouts' ? Colors.white : Colors.textSecondary
          } />
          <Text style={[
            styles.toggleButtonText,
            activeSection === 'workouts' && styles.toggleButtonTextActive
          ]}>
            Premium Plans
            {!selectedWorkoutPlan && !user?.has_completed_personalized_prep_plan && ' (Complete Setup)'}
          </Text>
        </TouchableOpacity>
        
      </View>

      {/* Test Practice Section */}
      {activeSection === 'tests' && (
        <View style={styles.section}>
          {/* Digital Test Practice */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Digital Test Practice</Text>
            <Text style={styles.sectionSubtitle}>Practice and improve your fitness test scores</Text>
          </View>

          <View style={styles.testCardsGrid}>
            {/* PIN Test Widget */}
            <TouchableOpacity 
              style={styles.testWidget}
              onPress={handleDigitalTestAccess}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
                style={styles.testWidgetGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.testWidgetContent}>
                  <View style={styles.testWidgetHeader}>
                    <View style={styles.testWidgetIconContainer}>
                      <Target size={20} color={Colors.white} />
                    </View>
                    <View style={styles.testWidgetBadge}>
                      <Text style={styles.testWidgetBadgeText}>FREE</Text>
                    </View>
                  </View>
                  
                  <View style={styles.testWidgetBody}>
                    <Text style={styles.testWidgetTitle}>PIN Test</Text>
                    <Text style={styles.testWidgetSubtitle}>Physical Abilities</Text>
                    
                    <View style={styles.testWidgetStats}>
                      <View style={styles.testWidgetStat}>
                        <Text style={styles.testWidgetStatValue}>8.5</Text>
                        <Text style={styles.testWidgetStatLabel}>Avg Score</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.testWidgetFooter}>
                    <View style={styles.testWidgetFeatures}>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                    </View>
                    <View style={styles.testWidgetButton}>
                      <ArrowRight size={16} color={Colors.white} />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* PREP Test Widget */}
            <TouchableOpacity 
              style={styles.testWidget}
              onPress={handleDigitalTestAccess}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={styles.testWidgetGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.testWidgetContent}>
                  <View style={styles.testWidgetHeader}>
                    <View style={styles.testWidgetIconContainer}>
                      <Timer size={20} color={Colors.white} />
                    </View>
                    <View style={styles.testWidgetBadge}>
                      <Text style={styles.testWidgetBadgeText}>FREE</Text>
                    </View>
                  </View>
                  
                  <View style={styles.testWidgetBody}>
                    <Text style={styles.testWidgetTitle}>PREP Test</Text>
                    <Text style={styles.testWidgetSubtitle}>Physical Readiness</Text>
                    
                    <View style={styles.testWidgetStats}>
                      <View style={styles.testWidgetStat}>
                        <Text style={styles.testWidgetStatValue}>6.2</Text>
                        <Text style={styles.testWidgetStatLabel}>Avg Level</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.testWidgetFooter}>
                    <View style={styles.testWidgetFeatures}>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                      <View style={styles.testWidgetFeature}>
                        <CheckCircle size={12} color={Colors.white + 'CC'} />
                      </View>
                    </View>
                    <View style={styles.testWidgetButton}>
                      <ArrowRight size={16} color={Colors.white} />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* OACP Fitness Log Card */}
          {ENABLE_OACP_FITNESS_LOGS && (
            <View style={styles.fitnessLogSection}>
              {activeFitnessLog ? (
                <View style={styles.fitnessLogCard}>
                  <View style={styles.fitnessLogCardContent}>
                    {/* Header */}
                    <View style={styles.fitnessLogCardHeader}>
                      <View style={styles.fitnessLogCardHeaderLeft}>
                        <View style={styles.fitnessLogCardIconContainer}>
                          <ClipboardList size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.fitnessLogCardTitleContainer}>
                          <Text style={styles.fitnessLogCardTitle}>OACP 14-Day Fitness Log</Text>
                          <Text style={styles.fitnessLogCardSubtitle}>Mandatory Activity & Wellness Tracking</Text>
                        </View>
                      </View>
                      <View style={styles.fitnessLogCardBadge}>
                        <Text style={styles.fitnessLogCardBadgeText}>
                          {activeFitnessLog.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                        </Text>
                      </View>
                    </View>

                    {/* Document Info */}
                    <View style={styles.fitnessLogCardDocumentInfo}>
                      <View style={styles.fitnessLogCardInfoRow}>
                        <Text style={styles.fitnessLogCardInfoLabel}>Period:</Text>
                        <Text style={styles.fitnessLogCardInfoValue}>
                          {format(new Date(activeFitnessLog.start_date), 'MMM dd, yyyy')} - {format(new Date(activeFitnessLog.end_date), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                      <View style={styles.fitnessLogCardInfoRow}>
                        <Text style={styles.fitnessLogCardInfoLabel}>Status:</Text>
                        <Text style={styles.fitnessLogCardInfoValue}>
                          {activeFitnessLog.signed ? 'Signed & Certified' : 'Pending Signature'}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Section */}
                    <View style={styles.fitnessLogCardProgressSection}>
                      <View style={styles.fitnessLogCardProgressHeader}>
                        <Text style={styles.fitnessLogCardProgressTitle}>Completion Progress</Text>
                        <Text style={styles.fitnessLogCardProgressPercentage}>
                          {Math.round((daysCompleted / 14) * 100)}%
                        </Text>
                      </View>
                      <View style={styles.fitnessLogCardProgressBar}>
                        <View style={[styles.fitnessLogCardProgressFill, { width: `${(daysCompleted / 14) * 100}%` }]} />
                      </View>
                      <Text style={styles.fitnessLogCardProgressText}>
                        {daysCompleted} of 14 days completed
                      </Text>
                    </View>

                    {/* Status Grid */}
                    <View style={styles.fitnessLogCardStatusGrid}>
                      <View style={styles.fitnessLogCardStatusItem}>
                        <View style={styles.fitnessLogCardStatusIcon}>
                          <CheckCircle2 size={20} color={Colors.success} />
                        </View>
                        <Text style={styles.fitnessLogCardStatusValue}>{daysCompleted}</Text>
                        <Text style={styles.fitnessLogCardStatusLabel}>Days Completed</Text>
                      </View>
                      <View style={styles.fitnessLogCardStatusItem}>
                        <View style={styles.fitnessLogCardStatusIcon}>
                          <Clock size={20} color={Colors.warning} />
                        </View>
                        <Text style={styles.fitnessLogCardStatusValue}>{14 - daysCompleted}</Text>
                        <Text style={styles.fitnessLogCardStatusLabel}>Days Remaining</Text>
                      </View>
                      <View style={styles.fitnessLogCardStatusItem}>
                        <View style={styles.fitnessLogCardStatusIcon}>
                          {activeFitnessLog.signed ? (
                            <CheckCircle2 size={20} color={Colors.success} />
                          ) : (
                            <XCircle size={20} color={Colors.error} />
                          )}
                        </View>
                        <Text style={styles.fitnessLogCardStatusValue}>
                          {activeFitnessLog.signed ? 'Yes' : 'No'}
                        </Text>
                        <Text style={styles.fitnessLogCardStatusLabel}>Signed</Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.fitnessLogCardActions}>
                      <TouchableOpacity 
                        style={styles.fitnessLogCardPrimaryButton}
                        onPress={() => {
                          const today = format(new Date(), 'yyyy-MM-dd');
                          const logStartDate = new Date(activeFitnessLog.start_date);
                          const dayIndex = Math.floor((new Date(today).getTime() - logStartDate.getTime()) / (1000 * 60 * 60 * 24));
                          const targetDate = format(addDays(logStartDate, Math.max(0, Math.min(dayIndex, 13))), 'yyyy-MM-dd');
                          router.push(`/fitness/logs/day/${targetDate}?logId=${activeFitnessLog.id}`);
                        }}
                      >
                        <Calendar size={18} color={Colors.white} />
                        <Text style={styles.fitnessLogCardPrimaryButtonText}>Continue Today's Entry</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.fitnessLogCardSecondaryButton}
                        onPress={() => router.push(`/fitness/logs/summary?logId=${activeFitnessLog.id}`)}
                      >
                        <ClipboardList size={18} color={Colors.primary} />
                        <Text style={styles.fitnessLogCardSecondaryButtonText}>Preview & Export</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Additional Actions */}
                    <View style={styles.fitnessLogCardAdditionalActions}>
                      {daysCompleted === 14 && !activeFitnessLog.signed && (
                        <TouchableOpacity 
                          style={styles.fitnessLogCardSignButton}
                          onPress={() => router.push(`/fitness/logs/sign?logId=${activeFitnessLog.id}`)}
                        >
                          <CheckCircle2 size={16} color={Colors.white} />
                          <Text style={styles.fitnessLogCardSignButtonText}>Finish & Sign Log</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity 
                        style={styles.fitnessLogCardResetButton}
                        onPress={handleResetLog}
                      >
                        <XCircle size={16} color={Colors.error} />
                        <Text style={styles.fitnessLogCardResetButtonText}>Reset Log</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.fitnessLogCard}
                  onPress={() => router.push('/fitness/logs/start')}
                  activeOpacity={0.9}
                >
                  <View style={styles.fitnessLogCardContent}>
                    {/* Header */}
                    <View style={styles.fitnessLogCardHeader}>
                      <View style={styles.fitnessLogCardHeaderLeft}>
                        <View style={styles.fitnessLogCardIconContainer}>
                          <ClipboardList size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.fitnessLogCardTitleContainer}>
                          <Text style={styles.fitnessLogCardTitle}>OACP 14-Day Fitness Log</Text>
                          <Text style={styles.fitnessLogCardSubtitle}>Mandatory Activity & Wellness Tracking</Text>
                        </View>
                      </View>
                      <View style={styles.fitnessLogCardBadge}>
                        <Text style={styles.fitnessLogCardBadgeText}>REQUIRED</Text>
                      </View>
                    </View>

                    {/* Document Info */}
                    <View style={styles.fitnessLogCardDocumentInfo}>
                      <View style={styles.fitnessLogCardInfoRow}>
                        <Text style={styles.fitnessLogCardInfoLabel}>Type:</Text>
                        <Text style={styles.fitnessLogCardInfoValue}>Official OACP Requirement</Text>
                      </View>
                      <View style={styles.fitnessLogCardInfoRow}>
                        <Text style={styles.fitnessLogCardInfoLabel}>Duration:</Text>
                        <Text style={styles.fitnessLogCardInfoValue}>14 consecutive days</Text>
                      </View>
                      <View style={styles.fitnessLogCardInfoRow}>
                        <Text style={styles.fitnessLogCardInfoLabel}>Status:</Text>
                        <Text style={styles.fitnessLogCardInfoValue}>Not Started</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <View style={styles.fitnessLogCardDescriptionSection}>
                      <Text style={styles.fitnessLogCardDescriptionTitle}>What's Required:</Text>
                      <Text style={styles.fitnessLogCardDescriptionText}>
                        Complete daily tracking of physical activities, stress management methods, and sleep patterns for 14 consecutive days as part of your OACP certification requirements.
                      </Text>
                    </View>

                    {/* Requirements List */}
                    <View style={styles.fitnessLogCardRequirements}>
                      <Text style={styles.fitnessLogCardRequirementsTitle}>Daily Requirements:</Text>
                      <View style={styles.fitnessLogCardRequirementItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.fitnessLogCardRequirementText}>Physical activity (run, strength, other)</Text>
                      </View>
                      <View style={styles.fitnessLogCardRequirementItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.fitnessLogCardRequirementText}>Stress management method</Text>
                      </View>
                      <View style={styles.fitnessLogCardRequirementItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.fitnessLogCardRequirementText}>Sleep hours tracking</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity 
                      style={styles.fitnessLogCardStartButton}
                      onPress={() => router.push('/fitness/logs/start')}
                    >
                      <ArrowRight size={18} color={Colors.white} />
                      <Text style={styles.fitnessLogCardStartButtonText}>Start 14-Day Log</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Modern In-Person Booking */}
          <View style={styles.bookingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Book In-Person Test</Text>
              <Text style={styles.sectionSubtitle}>Official test runs with certified instructors</Text>
            </View>

            <TouchableOpacity 
              style={styles.bookingCard}
              onPress={() => router.push('/practice-sessions')}
              activeOpacity={0.9}
            >
              <View style={styles.bookingCardContainer}>
                <View style={styles.bookingCardHeader}>
                  <View style={styles.bookingCardLeft}>
                    <View style={styles.bookingCardIconContainer}>
                      <MapPin size={24} color={Colors.white} />
                    </View>
                    <View style={styles.bookingCardInfo}>
                      <Text style={styles.bookingCardTitle}>Book Practice Tests</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.bookingCardButtons}>
                  <TouchableOpacity 
                    style={styles.bookingCardButton}
                    onPress={() => router.push('/practice-sessions?filter=pin')}
                  >
                    <Text style={styles.bookingCardButtonText}>Book PIN Practice Test</Text>
                    <ArrowRight size={16} color={Colors.white} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.bookingCardButton}
                    onPress={() => router.push('/practice-sessions?filter=prep')}
                  >
                    <Text style={styles.bookingCardButtonText}>Book PREP Practice Test</Text>
                    <ArrowRight size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* My Bookings */}
          <View style={styles.bookingsSection}>
            <TouchableOpacity 
              style={styles.bookingsWidget}
              onPress={() => router.push('/practice-sessions')}
              activeOpacity={0.9}
            >
              <View style={styles.bookingsWidgetContent}>
                <View style={styles.bookingsWidgetLeft}>
                  <View style={styles.bookingsWidgetIcon}>
                    <Calendar size={24} color={Colors.white} />
                  </View>
                  <View style={styles.bookingsWidgetInfo}>
                    <Text style={styles.bookingsWidgetTitle}>My Bookings</Text>
                    <Text style={styles.bookingsWidgetSubtitle}>View your scheduled practice tests</Text>
                  </View>
                </View>
                <View style={styles.bookingsWidgetRight}>
                  <ArrowRight size={20} color={Colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Test Results Widget */}
          <TestResultsWidget />
        </View>
      )}

      {/* Workout Plans Section */}
      {activeSection === 'workouts' && (
        <PersonalizedFitnessDashboard 
          selectedPlan={selectedWorkoutPlan}
          userPreferences={userPreferences}
          hasCompletedPersonalizedPlan={user?.has_completed_personalized_prep_plan}
          onRedoPersonalizedPlan={() => setShowPersonalizedPlanModal(true)}
        />
      )}


      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsellModal}
        trigger={upsellTrigger}
        onClose={() => setShowUpsellModal(false)}
      />

      {/* Personalized Prep Plan Modal */}
      <PersonalizedPrepPlanModal
        visible={showPersonalizedPlanModal}
        onClose={() => {
          setShowPersonalizedPlanModal(false);
          // Switch back to tests subtab when modal is closed without selection
          setActiveSection('tests');
        }}
        onPlanSelected={async (plan, preferences) => {
          setSelectedWorkoutPlan(plan);
          setUserPreferences(preferences);
          setShowPersonalizedPlanModal(false);
          
          // Start the workout plan progression
          try {
            if (user?.id) {
              await WorkoutPlanProgressionService.startWorkoutPlan(user.id, plan.id);
              console.log('Workout plan started successfully');
            }
          } catch (error) {
            console.error('Error starting workout plan:', error);
          }
          
          // Mark personalized PREP plan as completed
          try {
            const { data, error } = await supabase.rpc('mark_personalized_plan_completed', {
              p_user_id: user?.id,
              p_plan_id: plan.id
            });
            
            if (error) {
              console.error('Error marking personalized plan as completed:', error);
            }
          } catch (error) {
            console.error('Error updating user profile:', error);
          }
          
          // Store the selection in AsyncStorage for persistence
          AsyncStorage.setItem('selected_workout_plan', JSON.stringify({
            plan,
            preferences,
            selectedAt: new Date().toISOString()
          }));
          
          // Redirect to Premium Plans subtab to show the active plan
          setActiveSection('workouts');
        }}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Account for tab bar height (55 + insets.bottom + extra padding)
  },
  
  // Section Toggle
  sectionToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    gap: 6,
    minHeight: 48,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    flexShrink: 1,
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  toggleButtonTextDisabled: {
    color: Colors.textTertiary,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Enhanced Fitness Header - Inspired by Dashboard & Application
  fitnessHeader: {
    marginTop: 16, // Add space from the top header
    marginBottom: 24,
  },
  fitnessBackground: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  fitnessGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.95,
  },
  fitnessContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fitnessTextContainer: {
    flex: 1,
  },
  fitnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  fitnessBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  fitnessTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  fitnessSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    fontWeight: '500',
    lineHeight: 20,
  },
  fitnessStats: {
    alignItems: 'center',
  },
  fitnessStatCard: {
    backgroundColor: Colors.white + '20',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  fitnessStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  fitnessStatLabel: {
    fontSize: 12,
    color: Colors.white + 'CC',
    fontWeight: '600',
  },

  // Modern Test Widgets
  testCardsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  testWidget: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.heavy,
  },
  testWidgetGradient: {
    flex: 1,
    padding: 16,
  },
  testWidgetContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  testWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testWidgetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testWidgetBadge: {
    backgroundColor: Colors.white + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  testWidgetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  testWidgetBody: {
    flex: 1,
    justifyContent: 'center',
  },
  testWidgetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  testWidgetSubtitle: {
    fontSize: 12,
    color: Colors.white + 'CC',
    fontWeight: '500',
    marginBottom: 12,
  },
  testWidgetStats: {
    marginBottom: 8,
  },
  testWidgetStat: {
    alignItems: 'center',
  },
  testWidgetStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  testWidgetStatLabel: {
    fontSize: 10,
    color: Colors.white + 'CC',
    fontWeight: '600',
  },
  testWidgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testWidgetFeatures: {
    flexDirection: 'row',
    gap: 4,
  },
  testWidgetFeature: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testWidgetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modern Booking Section - Different from Digital Test Cards
  bookingSection: {
    marginBottom: 32,
  },
  bookingCardsGrid: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.heavy,
    elevation: 8,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bookingCardContainer: {
    padding: 20,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginHorizontal: -20,
    marginTop: -20,
  },
  bookingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingCardInfo: {
    flex: 1,
  },
  bookingCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  bookingCardSubtitle: {
    fontSize: 14,
    color: Colors.white + 'CC',
  },
  bookingCardBadge: {
    backgroundColor: Colors.policeRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  bookingCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingCardBody: {
    marginBottom: 16,
  },
  bookingCardFeatures: {
    gap: 10,
  },
  bookingCardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookingCardFeatureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bookingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingCardPrice: {
    alignItems: 'flex-start',
  },
  bookingCardPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  bookingCardPriceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bookingCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    flex: 1,
  },
  bookingCardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingCardButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  bookingsWidget: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.heavy,
    elevation: 8,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  bookingsWidgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  bookingsWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingsWidgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bookingsWidgetInfo: {
    flex: 1,
  },
  bookingsWidgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  bookingsWidgetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingsWidgetRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bookings List
  bookingsSection: {
    marginBottom: 32,
  },
  bookingsList: {
    gap: 12,
  },
  bookingItem: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    padding: 16,
    ...shadows.light,
  },
  bookingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingItemInfo: {
    flex: 1,
  },
  bookingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bookingItemDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  // Test Results Widget
  testResultsWidget: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  testResultsList: {
    gap: 12,
  },
  testResultItem: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    padding: 16,
  },
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testResultType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  testResultDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  testResultMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testResultMetric: {
    alignItems: 'center',
  },
  testResultMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  testResultMetricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Workout Widgets
  currentWorkoutWidget: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: 32,
    ...shadows.medium,
  },
  emptyWorkoutWidget: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    ...shadows.medium,
  },
  emptyWorkoutContent: {
    alignItems: 'center',
  },
  emptyWorkoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyWorkoutSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  workoutProgress: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutProgressText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  workoutProgressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    marginBottom: 16,
  },
  workoutProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  workoutCoach: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  coachRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageCoachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  startWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Workout Plans List
  workoutPlansList: {
    gap: 16,
    marginBottom: 32,
  },
  workoutPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    ...shadows.medium,
  },
  workoutPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutPlanInfo: {
    flex: 1,
    marginRight: 16,
  },
  workoutPlanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  workoutPlanDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  workoutPlanMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutPlanMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutPlanMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  workoutPlanCoach: {
    alignItems: 'center',
  },
  planCoachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  planCoachName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  workoutPlanFocus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  focusTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  focusTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  startPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  startPlanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Coaching Section
  coachingSection: {
    marginBottom: 32,
  },
  coachingCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    ...shadows.medium,
  },
  coachingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  coachingInfo: {
    flex: 1,
  },
  coachingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  coachingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  coachingCardRight: {
    alignItems: 'flex-end',
  },
  coachingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  bookCoachingButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  bookCoachingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  // Logs Card
  logsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    ...shadows.heavy,
    elevation: 8,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logsCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logsCardInfo: {
    flex: 1,
  },
  logsCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  logsCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logsCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Fitness Log Section Styles
  fitnessLogSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  
  // Fitness Log Card Styles
  fitnessLogCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fitnessLogCardContent: {
    padding: 24,
  },
  
  // Header Styles
  fitnessLogCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  fitnessLogCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fitnessLogCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fitnessLogCardTitleContainer: {
    flex: 1,
  },
  fitnessLogCardTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  fitnessLogCardSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  fitnessLogCardBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  fitnessLogCardBadgeText: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  
  // Document Info Styles
  fitnessLogCardDocumentInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fitnessLogCardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fitnessLogCardInfoLabel: {
    ...typography.labelMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  fitnessLogCardInfoValue: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '500',
  },
  
  // Progress Styles
  fitnessLogCardProgressSection: {
    marginBottom: 20,
  },
  fitnessLogCardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fitnessLogCardProgressTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  fitnessLogCardProgressPercentage: {
    ...typography.headingSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  fitnessLogCardProgressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fitnessLogCardProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
  },
  fitnessLogCardProgressText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Status Grid Styles
  fitnessLogCardStatusGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  fitnessLogCardStatusItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fitnessLogCardStatusIcon: {
    marginBottom: 8,
  },
  fitnessLogCardStatusValue: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  fitnessLogCardStatusLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Action Buttons Styles
  fitnessLogCardActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  fitnessLogCardPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardPrimaryButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  fitnessLogCardSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardSecondaryButtonText: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Additional Actions Styles
  fitnessLogCardAdditionalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fitnessLogCardSignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardSignButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  fitnessLogCardResetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardResetButtonText: {
    ...typography.labelMedium,
    color: Colors.error,
    fontWeight: '600',
  },
  
  // Start Log Card Specific Styles
  fitnessLogCardDescriptionSection: {
    marginBottom: 20,
  },
  fitnessLogCardDescriptionTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  fitnessLogCardDescriptionText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fitnessLogCardRequirements: {
    marginBottom: 24,
  },
  fitnessLogCardRequirementsTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  fitnessLogCardRequirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fitnessLogCardRequirementText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  fitnessLogCardStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  fitnessLogCardStartButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '700',
  },
});
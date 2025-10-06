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
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
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
  RotateCcw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
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
  X,
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
import { getTargetDateForEntry } from '@/lib/dateUtils';

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
  const [showResetModal, setShowResetModal] = useState(false);
  
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
    await Promise.all([
      loadBookings(),
      loadActiveFitnessLog()
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSectionToggle = (section: 'tests' | 'workouts') => {
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
    setShowResetModal(true);
  };

  const confirmResetLog = async () => {
    if (!activeFitnessLog) return;
    
    try {
      setFitnessLogLoading(true);
      setShowResetModal(false);
      
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
  };

  useEffect(() => {
    if (user) {
      loadBookings();
      loadActiveFitnessLog();
    }
  }, [user]);

  // Refresh fitness log when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      if (user && ENABLE_OACP_FITNESS_LOGS) {
        loadActiveFitnessLog();
      }
    }, [user])
  );

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
            <View style={styles.oacpFitnessLogSection}>
              {activeFitnessLog ? (
                // ACTIVE STATE - Show Progress
                <TouchableOpacity 
                  style={styles.oacpFitnessLogCard}
                  onPress={() => router.push(`/fitness/logs/summary?logId=${activeFitnessLog.id}`)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.oacpFitnessLogCardGradient}
                  >
                    {/* Header */}
                    <View style={styles.oacpFitnessLogHeader}>
                      <View style={styles.oacpFitnessLogHeaderLeft}>
                        <View style={styles.oacpFitnessLogIcon}>
                          <ClipboardList size={20} color={Colors.white} />
                        </View>
                        <View style={styles.oacpFitnessLogTitleContainer}>
                          <Text style={styles.oacpFitnessLogTitle}>OACP Fitness Log</Text>
                          <Text style={styles.oacpFitnessLogSubtitle}>
                            {format(new Date(activeFitnessLog.start_date + 'T00:00:00'), 'MMM dd')} - {format(new Date(activeFitnessLog.end_date + 'T00:00:00'), 'MMM dd')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.oacpFitnessLogBadge}>
                        <Text style={styles.oacpFitnessLogBadgeText}>
                          {activeFitnessLog.status === 'completed' ? 'COMPLETE' : `${daysCompleted}/14`}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.oacpFitnessLogProgressSection}>
                      <View style={styles.oacpFitnessLogProgressBar}>
                        <View 
                          style={[
                            styles.oacpFitnessLogProgressFill,
                            { width: `${(daysCompleted / 14) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.oacpFitnessLogProgressText}>
                        {daysCompleted} of 14 days completed
                      </Text>
                    </View>

                    {/* Status Indicators */}
                    <View style={styles.oacpFitnessLogStatusRow}>
                      <View style={styles.oacpFitnessLogStatusItem}>
                        <CheckCircle size={14} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogStatusText}>
                          {daysCompleted === 14 ? 'Complete' : `${daysCompleted}/14 days`}
                        </Text>
                      </View>
                      <View style={styles.oacpFitnessLogStatusItem}>
                        <CheckCircle size={14} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogStatusText}>
                          {activeFitnessLog?.signed ? 'Signed' : 'Pending signature'}
                        </Text>
                      </View>
                      <View style={styles.oacpFitnessLogStatusItem}>
                        <CheckCircle size={14} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogStatusText}>
                          {daysCompleted === 14 ? 'PDF ready' : 'PDF pending'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.oacpFitnessLogActions}>
                      {/* Summary Button */}
                      <TouchableOpacity 
                        style={styles.oacpFitnessLogActionButton}
                        onPress={() => router.push(`/fitness/logs/summary?logId=${activeFitnessLog.id}`)}
                      >
                        <FileText size={16} color={Colors.text} />
                        <Text style={styles.oacpFitnessLogActionButtonText}>Summary</Text>
                      </TouchableOpacity>
                      
                      {/* Reset Button */}
                      <TouchableOpacity 
                        style={styles.oacpFitnessLogResetButton}
                        onPress={handleResetLog}
                      >
                        <RotateCcw size={16} color={Colors.error} />
                        <Text style={styles.oacpFitnessLogResetButtonText}>Reset</Text>
                      </TouchableOpacity>
                      
                      {/* Add Daily Entry Button */}
                      <TouchableOpacity 
                        style={styles.oacpFitnessLogActionButton}
                        onPress={async () => {
                          try {
                            // Get the days to find the next incomplete day
                            const days = await fitnessLogService.getDays(activeFitnessLog.id);
                            const targetDate = getTargetDateForEntry(activeFitnessLog.start_date, activeFitnessLog.end_date, days);
                            router.push(`/fitness/logs/day/${targetDate}?logId=${activeFitnessLog.id}`);
                          } catch (error) {
                            console.error('Error determining target date:', error);
                            // Fallback to today
                            const todayString = format(new Date(), 'yyyy-MM-dd');
                            router.push(`/fitness/logs/day/${todayString}?logId=${activeFitnessLog.id}`);
                          }
                        }}
                      >
                        <Plus size={16} color={Colors.text} />
                        <Text style={styles.oacpFitnessLogActionButtonText}>Add Entry</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                // INACTIVE STATE - Hook User
                <TouchableOpacity 
                  style={styles.oacpFitnessLogCard}
                  onPress={() => router.push('/fitness/logs/start')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.oacpFitnessLogCardGradient}
                  >
                    {/* Header */}
                    <View style={styles.oacpFitnessLogHeader}>
                      <View style={styles.oacpFitnessLogHeaderLeft}>
                        <View style={styles.oacpFitnessLogIcon}>
                          <ClipboardList size={20} color={Colors.white} />
                        </View>
                        <View style={styles.oacpFitnessLogTitleContainer}>
                          <Text style={styles.oacpFitnessLogTitle}>OACP Fitness Log</Text>
                          <Text style={styles.oacpFitnessLogSubtitle}>14-Day Activity Tracking</Text>
                        </View>
                      </View>
                      <View style={styles.oacpFitnessLogBadge}>
                        <Text style={styles.oacpFitnessLogBadgeText}>REQUIRED</Text>
                      </View>
                    </View>

                    {/* Hook Message */}
                    <View style={styles.oacpFitnessLogHookSection}>
                      <Text style={styles.oacpFitnessLogHookTitle}>
                        Create Your Official OACP Fitness Log
                      </Text>
                      <Text style={styles.oacpFitnessLogHookDescription}>
                        Track your daily activities for 14 days and generate a professional PDF ready for OACP submission
                      </Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.oacpFitnessLogBenefits}>
                      <View style={styles.oacpFitnessLogBenefit}>
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogBenefitText}>Daily activity tracking</Text>
                      </View>
                      <View style={styles.oacpFitnessLogBenefit}>
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogBenefitText}>Official OACP PDF format</Text>
                      </View>
                      <View style={styles.oacpFitnessLogBenefit}>
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.oacpFitnessLogBenefitText}>Ready for submission</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.oacpFitnessLogActions}>
                      <TouchableOpacity 
                        style={styles.oacpFitnessLogActionButton}
                        onPress={() => router.push('/fitness/logs/start')}
                      >
                        <ArrowRight size={20} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
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

      {/* Reset Confirmation Modal */}
      <Modal
      visible={showResetModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowResetModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AlertTriangle size={32} color={Colors.white} />
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowResetModal(false)}
              >
                <X size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⚠️ Reset Fitness Log</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to reset your current fitness log? This will permanently delete all your progress and cannot be undone.
              </Text>

              {/* Progress Info */}
              {activeFitnessLog && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressTitle}>Current Progress:</Text>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>{daysCompleted} of 14 days completed</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(daysCompleted / 14) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Warning Section */}
              <View style={styles.warningSection}>
                <Text style={styles.warningTitle}>⚠️ This action will:</Text>
                <View style={styles.warningList}>
                  <View style={styles.warningItem}>
                    <Text style={styles.warningBullet}>•</Text>
                    <Text style={styles.warningText}>Delete all daily entries permanently</Text>
                  </View>
                  <View style={styles.warningItem}>
                    <Text style={styles.warningBullet}>•</Text>
                    <Text style={styles.warningText}>Reset your progress to day 1</Text>
                  </View>
                  <View style={styles.warningItem}>
                    <Text style={styles.warningBullet}>•</Text>
                    <Text style={styles.warningText}>Cancel all scheduled notifications</Text>
                  </View>
                  <View style={styles.warningItem}>
                    <Text style={styles.warningBullet}>•</Text>
                    <Text style={styles.warningText}>Cannot be undone</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowResetModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalResetButton}
                  onPress={confirmResetLog}
                  disabled={fitnessLogLoading}
                >
                  <RotateCcw size={16} color={Colors.white} />
                  <Text style={styles.modalResetButtonText}>
                    {fitnessLogLoading ? 'Resetting...' : 'Reset Log'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
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
    borderRadius: borderRadius.xl,
    ...shadows.medium,
    overflow: 'hidden',
  },
  fitnessLogCardGradient: {
    borderRadius: borderRadius.xl,
  },
  fitnessLogCardContent: {
    padding: 20,
  },

  // Header Styles
  fitnessLogCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fitnessLogCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fitnessLogCardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fitnessLogCardTitleContainer: {
    flex: 1,
  },
  fitnessLogCardTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  fitnessLogCardSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  fitnessLogCardBadge: {
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  fitnessLogCardBadgeCompleted: {
    backgroundColor: Colors.success + '20',
  },
  fitnessLogCardBadgeProgress: {
    backgroundColor: Colors.white + '20',
  },
  fitnessLogCardBadgeText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 11,
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
  
  // Fitness Log Grid Styles
  fitnessLogGrid: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  fitnessLogGridHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '20',
  },
  fitnessLogGridTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  fitnessLogGridSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  fitnessLogGridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '10',
    paddingVertical: 6,
  },
  fitnessLogGridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fitnessLogGridHeaderText: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    fontWeight: '600',
    fontSize: 10,
  },
  fitnessLogGridCellText: {
    ...typography.bodySmall,
    color: Colors.white,
    fontWeight: '500',
    fontSize: 11,
  },
  fitnessLogGridStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitnessLogPDFInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.white + '20',
    gap: 8,
  },
  fitnessLogPDFIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitnessLogPDFText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontWeight: '500',
    fontSize: 11,
    flex: 1,
  },

  // Fitness Log Progress Styles
  fitnessLogProgress: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  fitnessLogProgressHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '20',
  },
  fitnessLogProgressTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  fitnessLogProgressSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  fitnessLogProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  fitnessLogProgressStat: {
    alignItems: 'center',
  },
  fitnessLogProgressStatValue: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  fitnessLogProgressStatLabel: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontSize: 11,
  },
  fitnessLogRecentActivity: {
    marginBottom: 16,
  },
  fitnessLogRecentTitle: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 8,
  },
  fitnessLogRecentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '10',
  },
  fitnessLogRecentDay: {
    ...typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
    width: 40,
  },
  fitnessLogRecentDetails: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
  },
  fitnessLogRecentStatus: {
    marginLeft: 8,
  },

  // Fitness Log Calendar Styles
  fitnessLogCalendar: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  fitnessLogCalendarHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '20',
  },
  fitnessLogCalendarTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  fitnessLogCalendarSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  fitnessLogCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  fitnessLogCalendarDayCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.md,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  fitnessLogCalendarDayCardCompleted: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success + '40',
  },
  fitnessLogCalendarDayCardToday: {
    backgroundColor: Colors.warning + '20',
    borderColor: Colors.warning + '40',
  },
  fitnessLogCalendarDayCardTitle: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 10,
    marginBottom: 4,
  },
  fitnessLogCalendarDayCardIcon: {
    marginBottom: 4,
  },
  fitnessLogCalendarDayCardDate: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontSize: 9,
  },
  fitnessLogCalendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 20,
  },
  fitnessLogCalendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fitnessLogCalendarLegendText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontSize: 11,
  },

  // Features Styles
  fitnessLogFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fitnessLogFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  fitnessLogFeatureText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
  },

  // Progress Styles
  fitnessLogCardProgressSection: {
    marginBottom: 16,
  },
  fitnessLogCardProgressBar: {
    height: 6,
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fitnessLogCardProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
  },
  fitnessLogCardProgressText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
    fontSize: 12,
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
  
  // Action Button Container and Button Styles
  fitnessLogCardActionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  fitnessLogCardActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fitnessLogCardActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fitnessLogCardResetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fitnessLogCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fitnessLogCardPrimaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderWidth: 1,
    borderColor: Colors.white + '40',
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardPrimaryActionButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  fitnessLogCardSecondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error + '40',
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  fitnessLogCardSecondaryActionButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  
  // OACP Fitness Log New Styles
  oacpFitnessLogSection: {
    marginBottom: spacing.lg,
  },
  oacpFitnessLogCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.level4,
  },
  oacpFitnessLogCardGradient: {
    padding: spacing.lg,
  },
  oacpFitnessLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  oacpFitnessLogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  oacpFitnessLogIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oacpFitnessLogTitleContainer: {
    flex: 1,
  },
  oacpFitnessLogTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  oacpFitnessLogSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  oacpFitnessLogBadge: {
    backgroundColor: Colors.white + '20',
    borderWidth: 1,
    borderColor: Colors.white + '40',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  oacpFitnessLogBadgeText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  
  // Hook Section (Inactive State)
  oacpFitnessLogHookSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: Colors.white + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  oacpFitnessLogHookTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  oacpFitnessLogHookDescription: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Benefits (Inactive State)
  oacpFitnessLogBenefits: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  oacpFitnessLogBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  oacpFitnessLogBenefitText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  
  // Progress Section (Active State)
  oacpFitnessLogProgressSection: {
    marginBottom: spacing.md,
  },
  oacpFitnessLogProgressBar: {
    height: 8,
    backgroundColor: Colors.white + '20',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  oacpFitnessLogProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  oacpFitnessLogProgressText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Status Row (Active State)
  oacpFitnessLogStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  oacpFitnessLogStatusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  oacpFitnessLogStatusText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
  },
  
  // Actions
  oacpFitnessLogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  oacpFitnessLogActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  oacpFitnessLogResetButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  oacpFitnessLogActionButtonText: {
    ...typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  oacpFitnessLogResetButtonText: {
    ...typography.labelSmall,
    color: Colors.error,
    fontWeight: '600',
    fontSize: 12,
  },
  
  // Reset Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.level4,
  },
  modalGradient: {
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    ...typography.bodyMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  progressSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    ...typography.bodySmall,
    color: Colors.white,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  warningSection: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningTitle: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  warningList: {
    gap: spacing.xs,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  warningBullet: {
    ...typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 2,
  },
  warningText: {
    ...typography.bodySmall,
    color: Colors.white,
    flex: 1,
    opacity: 0.9,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalCancelButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  modalResetButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modalResetButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  
});
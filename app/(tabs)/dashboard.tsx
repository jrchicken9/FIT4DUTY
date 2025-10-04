import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronRight, 
  Target,
  Dumbbell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Shield,
  TrendingUp,
  ArrowRight,
  Activity,
  Star,
  Award,
  FileText,
  Zap,
  CheckCircle2,
  Timer,
  GraduationCap,
  Play,
  Sparkles
} from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "@/constants/colors";
import { BRAND } from "@/app/constants/branding";
import { spacing } from "@/constants/designSystem";
import { useAuth } from "@/context/AuthContext";
import { useApplication } from "@/context/ApplicationContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useWorkoutPlan } from "@/context/WorkoutPlanContext";
import { supabase } from "@/lib/supabase";
import applicationSteps from "@/constants/applicationSteps";
import UpcomingSessionsBanner, { UpcomingSession } from "@/components/UpcomingSessionsBanner";
import WorkoutPlanDashboard from "@/components/WorkoutPlanDashboard";
import PoliceThemeBackground from "@/components/PoliceThemeBackground";
import ProfessionalBackground from "@/components/ProfessionalBackground";
// import PoliceNewsWidget from "@/components/PoliceNewsWidget";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuth();
  const { getProgressPercentage, getApplicationStepsWithProgress, getCompletedStepsCount, currentStep } = useApplication();
  const { subscription } = useSubscription();
  const { hasActivePlan, state: workoutPlanState } = useWorkoutPlan();
  
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingSession[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerDisabled, setBannerDisabled] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  const displayName = authUser?.first_name || authUser?.full_name || "Future Officer";
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  
  // Memoize formatted name to avoid repeated string operations
  const formattedName = useMemo(() => {
    if (!displayName || displayName === "Future Officer") {
      return "Future Officer";
    }
    
    const names = displayName.split(' ');
    if (names.length > 0) {
      const firstName = names[0];
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      
      if (names.length > 1) {
        // If there's a last name, capitalize it too
        const lastName = names[1];
        const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        return `${capitalizedFirstName} ${capitalizedLastName}`;
      }
      
      return capitalizedFirstName;
    }
    
    return displayName;
  }, [displayName]);

  // Memoize expensive computations
  const applicationStepsWithProgress = useMemo(() => getApplicationStepsWithProgress(), [getApplicationStepsWithProgress]);
  const applicationProgress = useMemo(() => getProgressPercentage(), [getProgressPercentage]);
  const completedSteps = useMemo(() => getCompletedStepsCount(), [getCompletedStepsCount]);

  // Memoize current step information
  const currentStepData = useMemo(() => {
    if (!currentStep) {
      // If no current step, return the first step
      return applicationSteps[0];
    }
    
    const currentStepData = applicationSteps.find(step => step.id === currentStep);
    return currentStepData || applicationSteps[0];
  }, [currentStep]);

  // Memoize step features to avoid recreating objects on every render
  const stepFeaturesMap = useMemo(() => ({
    prerequisites: {
      icon: <Shield size={20} color={Colors.success} />,
      color: Colors.success,
      features: ['Interactive Checklist', 'Progress Tracking', 'Smart Validation'],
      highlight: 'Complete all mandatory requirements'
    },
    'pre-application-prep': {
      icon: <FileText size={20} color={Colors.primary} />,
      color: Colors.primary,
      features: ['Resume Builder', 'Education History', 'Work Experience'],
      highlight: 'Build your professional profile'
    },
    oacp: {
      icon: <Target size={20} color={Colors.accent} />,
      color: Colors.accent,
      features: ['Sample Test (50 Qs)', 'Daily Quiz (5 Qs)', 'Timed Practice'],
      highlight: 'Master the OACP Certificate test'
    },
    application: {
      icon: <Users size={20} color={Colors.secondary} />,
      color: Colors.secondary,
      features: ['Police Services', 'Direct Links', 'Requirements Guide'],
      highlight: 'Select and apply to services'
    },
    fitness: {
      icon: <Dumbbell size={20} color={Colors.success} />,
      color: Colors.success,
      features: ['PREP Training', 'Workout Plans', 'Progress Tracking'],
      highlight: 'Prepare for physical testing'
    },
    interview: {
      icon: <Users size={20} color={Colors.primary} />,
      color: Colors.primary,
      features: ['Interview Prep', 'Mock Interviews', 'Question Bank'],
      highlight: 'Ace your police interview'
    },
    background: {
      icon: <Shield size={20} color={Colors.accent} />,
      color: Colors.accent,
      features: ['Background Check', 'Documentation', 'Verification'],
      highlight: 'Complete background verification'
    },
    medical: {
      icon: <CheckCircle size={20} color={Colors.success} />,
      color: Colors.success,
      features: ['Medical Requirements', 'Health Standards', 'Documentation'],
      highlight: 'Meet health requirements'
    }
  }), []);

  // Get step-specific features for preview
  const getStepFeatures = useCallback((stepId: string) => {
    return stepFeaturesMap[stepId as keyof typeof stepFeaturesMap] || {
      icon: <BookOpen size={20} color={Colors.primary} />,
      color: Colors.primary,
      features: ['Step Guide', 'Requirements', 'Resources'],
      highlight: 'Complete this step'
    };
  }, [stepFeaturesMap]);

  // Check banner preference on mount
  useEffect(() => {
    const checkBannerPreference = async () => {
      try {
        const hiddenUntil = await AsyncStorage.getItem('sessionBannerHiddenUntil');
        if (hiddenUntil) {
          const hideUntilDate = new Date(hiddenUntil);
          const now = new Date();
          
          if (now < hideUntilDate) {
            // Banner is still hidden
            setBannerDisabled(true);
          } else {
            // Hide period has expired, remove the stored date
            await AsyncStorage.removeItem('sessionBannerHiddenUntil');
            setBannerDisabled(false);
          }
        } else {
          setBannerDisabled(false);
        }
      } catch (error) {
        console.error('Error checking banner preference:', error);
      }
    };
    
    checkBannerPreference();
  }, []);

  // Update banner visibility when banner disabled state changes
  useEffect(() => {
    if (upcomingBookings.length > 0 && !bannerDisabled) {
      setBannerVisible(true);
    } else {
      setBannerVisible(false);
    }
  }, [bannerDisabled, upcomingBookings.length]);

  // Load upcoming bookings with useCallback to prevent unnecessary re-renders
  const loadUpcomingBookings = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      setLoadingBookings(true);
      
      // Calculate date range for next 7 days
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          practice_sessions!inner(
            title,
            session_date,
            start_time,
            end_time,
            test_type,
            locations!inner(name)
          )
        `)
        .eq('user_id', authUser.id)
        .in('status', ['pending', 'approved', 'confirmed'])
        .gte('practice_sessions.session_date', today.toISOString().split('T')[0])
        .lte('practice_sessions.session_date', sevenDaysFromNow.toISOString().split('T')[0])
        .order('session_date', { ascending: true, foreignTable: 'practice_sessions' })
        .limit(2);

      if (error) throw error;

      const formattedBookings: UpcomingSession[] = data?.map((booking: any) => ({
        id: booking.id,
        session_title: booking.practice_sessions.title,
        session_date: booking.practice_sessions.session_date,
        start_time: booking.practice_sessions.start_time,
        end_time: booking.practice_sessions.end_time,
        status: booking.status,
        test_type: booking.practice_sessions.test_type,
        location_name: booking.practice_sessions.locations.name,
      })) || [];

      setUpcomingBookings(formattedBookings);
    } catch (error) {
      console.error('Error loading upcoming bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, [authUser?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUpcomingBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUpcomingBookings();
  }, [loadUpcomingBookings]);

  const handleBannerClose = () => {
    setBannerVisible(false);
  };

  const handleViewSession = (sessionId: string) => {
    router.push(`/practice-sessions/${sessionId}`);
  };

  const handleViewAllNews = () => {
    // You can implement a full news screen here
    Alert.alert('News', 'Full news screen coming soon!');
  };

  // Recruitment content (placeholder data; later can be fetched from Supabase)
  const recruitmentNews = [
    {
      id: 'n1',
      title: 'Provincial hiring incentives announced for 2026 cohorts',
      source: 'Ontario Government',
      tag: 'Policy',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      title: 'Physical standards update: PREP timing remains unchanged',
      source: 'Constable Selection System',
      tag: 'Standards',
      publishedAt: new Date().toISOString(),
    },
  ];

  const agencyPromos = [
    {
      id: 'p1',
      agency: 'Peel Regional Police',
      headline: 'We’re hiring—serve your community',
      cta: 'Apply Now',
      url: 'https://peelpolice.ca',
      color: Colors.primary,
      tag: 'Sponsored',
    },
    {
      id: 'p2',
      agency: 'Toronto Police Service',
      headline: 'Info session this month',
      cta: 'Reserve Seat',
      url: 'https://tps.ca',
      color: Colors.secondary,
      tag: 'Event',
    },
  ];

  const recruitmentEvents = [
    {
      id: 'e1',
      title: 'Meet & Greet: Durham Recruiting',
      date: 'Oct 12, 7:00 PM',
      location: 'Whitby HQ',
      cta: 'Register',
    },
    {
      id: 'e2',
      title: 'Recruitment Presentation: OPP',
      date: 'Oct 19, 6:30 PM',
      location: 'Online Webinar',
      cta: 'Join',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'approved':
        return <CheckCircle size={16} color={Colors.warning} />;
      case 'pending':
        return <Clock size={16} color={Colors.primary} />;
      default:
        return <Clock size={16} color={Colors.textSecondary} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'approved':
        return Colors.warning;
      case 'pending':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  // Workout plan handlers
  const handleStartWorkoutPlan = () => {
    router.push('/workout-plans');
  };

  const handleContinueWorkoutPlan = () => {
    if (workoutPlanState.activePlan) {
      router.push(`/workout-plan/${workoutPlanState.activePlan.id}`);
    }
  };


  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      {/* Upcoming Sessions Banner - Positioned at very bottom of screen */}
      <UpcomingSessionsBanner
        sessions={upcomingBookings}
        visible={bannerVisible}
        onClose={handleBannerClose}
        onViewSession={handleViewSession}
        position="bottom"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: (insets?.bottom || 0) + 60 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Welcome Header */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeBackground}>
            {/* Inverted Gradient Background */}
            <LinearGradient
              colors={['#1E40AF', '#3B82F6']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.welcomeGradient}
            />
            
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>{getGreeting()}</Text>
                <Text style={styles.welcomeName}>{formattedName}</Text>
                
                {/* NEW: subhead communicates the broader mission beyond fitness */}
                <Text style={{ marginTop: 6, fontSize: 13, color: Colors.white + 'CC' }}>
                  {BRAND.taglineShort}
                </Text>
                
                <View style={styles.welcomeBadge}>
                  <Shield size={14} color={Colors.white} />
                  <Text style={styles.welcomeBadgeText}>Police Applicant</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Shield size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>



      {/* Police News Widget */}
      {/* <PoliceNewsWidget onViewAll={handleViewAllNews} /> */}

      {/* Portal Boxes */}
      <View style={styles.section}>
        <View style={styles.portalBoxesContainer}>
          <TouchableOpacity 
            style={styles.portalBox}
            onPress={() => router.push("/application")}
          >
            <View style={styles.portalIcon}>
              <Target size={24} color={Colors.primary} />
            </View>
            <Text style={styles.portalTitle}>Application Portal</Text>
            <Text style={styles.portalSubtitle}>Access all application tools, services, and resources</Text>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>All Services</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.portalBox}
            onPress={() => router.push("/fitness")}
          >
            <View style={styles.portalIcon}>
              <Dumbbell size={24} color={Colors.success} />
            </View>
            <Text style={styles.portalTitle}>Fitness Portal</Text>
            <Text style={styles.portalSubtitle}>Train for PREP test and physical readiness</Text>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>PREP Ready</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Demo Button removed */}
      </View>

      {/* Recruitment News */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recruitment News</Text>
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllNews}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View>
          {recruitmentNews.map((n) => (
            <TouchableOpacity key={n.id} style={styles.newsCard} onPress={handleViewAllNews}>
              <View style={styles.newsHeader}>
                <View style={styles.newsTag}><Text style={styles.newsTagText}>{n.tag}</Text></View>
                <Text style={styles.newsSource}>{n.source}</Text>
              </View>
              <Text style={styles.newsTitle}>{n.title}</Text>
              <Text style={styles.newsMeta}>Today</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Agency Promos / Outreach */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agency Outreach</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promosRow}>
          {agencyPromos.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.promoCard, { borderColor: p.color + '40' }]} onPress={() => Alert.alert(p.agency, p.headline)}>
              <View style={[styles.promoBadge, { backgroundColor: p.color + '15', borderColor: p.color + '30' }]}>
                <Text style={[styles.promoBadgeText, { color: p.color }]}>{p.tag}</Text>
              </View>
              <Text style={styles.promoAgency}>{p.agency}</Text>
              <Text style={styles.promoHeadline}>{p.headline}</Text>
              <View style={[styles.promoCta, { backgroundColor: p.color }]}>
                <Text style={styles.promoCtaText}>{p.cta}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recruitment Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Recruitment Events</Text>
          <TouchableOpacity style={styles.viewAllButton} onPress={() => Alert.alert('Events', 'Full events calendar coming soon') }>
            <Text style={styles.viewAllText}>Calendar</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View>
          {recruitmentEvents.map((e) => (
            <TouchableOpacity key={e.id} style={styles.eventCard} onPress={() => Alert.alert(e.title, 'Details coming soon') }>
              <View style={styles.eventMain}>
                <View style={styles.eventIcon}><Calendar size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventMeta}>{e.date} • {e.location}</Text>
                </View>
                <View style={styles.eventCta}><Text style={styles.eventCtaText}>{e.cta}</Text></View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Workout Plan Dashboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness & Training</Text>
        <WorkoutPlanDashboard
          hasActivePlan={hasActivePlan}
          workoutPlan={workoutPlanState.activePlan}
          onStartPlan={handleStartWorkoutPlan}
          onContinuePlan={handleContinueWorkoutPlan}
        />
      </View>


      {/* Upcoming Sessions Section - Only show if no banner or banner dismissed */}
      {upcomingBookings.length > 0 && !bannerVisible && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {upcomingBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => router.push(`/practice-sessions/${booking.id}`)}
            >
              <View style={styles.bookingContent}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.session_title}</Text>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.session_date).toLocaleDateString()} • {booking.start_time}
                  </Text>
                  <Text style={styles.bookingLocation}>{booking.location_name}</Text>
                </View>
                <View style={styles.bookingStatus}>
                  {getStatusIcon(booking.status)}
                  <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingBadge}>
                <Text style={styles.bookingBadgeText}>{booking.test_type} Test</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}


      {/* Motivation Card for New Users */}
      {completedSteps === 0 && (
        <View style={styles.section}>
          <View style={styles.motivationCard}>
            <Star size={32} color={Colors.accent} />
            <Text style={styles.motivationTitle}>Start Your Journey</Text>
            <Text style={styles.motivationText}>
              Begin by completing your profile and exploring our comprehensive preparation tools.
            </Text>
            <TouchableOpacity
              style={styles.motivationButton}
              onPress={() => setShowComingSoonModal(true)}
            >
              <Text style={styles.motivationButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Coming Soon Modal */}
      <Modal
        visible={showComingSoonModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowComingSoonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Sparkles size={32} color={Colors.primary} />
              <Text style={styles.modalTitle}>Coming Soon</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              This feature is currently under development and will be available in a future update. 
              We're working hard to bring you the best police recruitment experience!
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowComingSoonModal(false)}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeBackground: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  welcomeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeBadge: {
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
  welcomeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  welcomeTitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    marginBottom: 6,
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  nextStepSection: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  nextStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextStepInfo: {
    flex: 1,
  },
  nextStepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 2,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  nextStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStepFeatures: {
    marginBottom: 8,
  },
  nextStepFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nextStepFeatureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  nextStepHighlight: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  progressButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  progressButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  portalBoxesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  portalBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  portalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  portalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  portalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
  },
  portalBadge: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  portalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bookingLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingBadge: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  bookingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  // News styles
  newsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsTag: {
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.secondary + '25',
  },
  newsTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  newsSource: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  newsMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Promos styles
  promosRow: {
    gap: 12,
    paddingRight: 8,
  },
  promoCard: {
    width: 260,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  promoAgency: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  promoHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  promoCta: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promoCtaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  // Events styles
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  eventMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventCta: {
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eventCtaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  motivationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  motivationButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  // Demo button styles
  demoButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  demoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.policeRedLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  demoButtonSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
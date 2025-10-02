import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  Target, 
  Dumbbell, 
  ArrowRight, 
  Play, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  focus: string[];
  nextWorkout: {
    title: string;
    day: string;
    week: string;
    type: string;
  };
}

interface WorkoutPlanDashboardProps {
  hasActivePlan: boolean;
  workoutPlan?: WorkoutPlan | null;
  onStartPlan?: () => void;
  onContinuePlan?: () => void;
}

export default function WorkoutPlanDashboard({
  hasActivePlan,
  workoutPlan,
  onStartPlan,
  onContinuePlan
}: WorkoutPlanDashboardProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  if (!hasActivePlan) {
    // Show Fitness Hub card when no plan is active
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primary + 'DD']}
          style={styles.fitnessHubCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.fitnessHubContent}>
            <View style={styles.fitnessHubLeft}>
              <Text style={styles.fitnessHubTitle}>Fitness Hub</Text>
              <Text style={styles.fitnessHubSubtitle}>Train smarter, perform better</Text>
              <TouchableOpacity 
                style={styles.readyToStartButton}
                onPress={() => setShowComingSoonModal(true)}
              >
                <Heart size={16} color={Colors.primary} />
                <Text style={styles.readyToStartText}>Ready to Start</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.fitnessHubRight}>
              <View style={styles.testCountBox}>
                <Text style={styles.testCountNumber}>0</Text>
                <Text style={styles.testCountLabel}>Tests</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

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
                <Dumbbell size={32} color={Colors.primary} />
                <Text style={styles.modalTitle}>Coming Soon</Text>
              </View>
              
              <Text style={styles.modalMessage}>
                Personalized workout plans are currently under development and will be available in a future update. 
                We're working hard to bring you the best fitness preparation for police recruitment!
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
      </View>
    );
  }

  // Show active plan interface when plan is active
  return (
    <View style={styles.container}>
      {/* Personalized Plan Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Personalized Plan</Text>
        <TouchableOpacity style={styles.redoPlanButton}>
          <Text style={styles.redoPlanText}>Redo Plan</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[Colors.surface, Colors.surface + 'DD']}
        style={styles.personalizedPlanCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.planCardContent}>
          <View style={styles.planCardLeft}>
            <View style={styles.planIconContainer}>
              <Target size={24} color={Colors.white} />
            </View>
            <Text style={styles.planTitle}>{workoutPlan?.title}</Text>
            <Text style={styles.planMeta}>
              {workoutPlan?.totalWeeks} weeks • {workoutPlan?.focus[0]?.toLowerCase()} • {workoutPlan?.focus[1]?.toLowerCase()}
            </Text>
            
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Week {workoutPlan?.currentWeek} of {workoutPlan?.totalWeeks}</Text>
                <Text style={styles.progressPercentage}>{workoutPlan?.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${workoutPlan?.progress || 0}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.continueTrainingButton}
            onPress={onContinuePlan}
          >
            <Text style={styles.continueTrainingText}>Continue Training</Text>
            <ArrowRight size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Today's Workout Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
      </View>

      <LinearGradient
        colors={[Colors.primary, Colors.primary + 'DD']}
        style={styles.todaysWorkoutCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.workoutCardContent}>
          <View style={styles.workoutCardLeft}>
            <View style={styles.workoutIconContainer}>
              <Target size={24} color={Colors.white} />
            </View>
            <Text style={styles.workoutDayText}>
              Day {workoutPlan?.nextWorkout.day} • Week {workoutPlan?.nextWorkout.week}
            </Text>
            <Text style={styles.workoutTypeText}>{workoutPlan?.nextWorkout.type}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.startWorkoutButton}
            onPress={() => router.push(`/workout-plan/${workoutPlan?.id}` as any)}
          >
            <Play size={20} color={Colors.primary} />
            <Text style={styles.startWorkoutText}>Start</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStatsRow}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{workoutPlan?.progress}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock size={20} color={Colors.accent} />
          <Text style={styles.statValue}>{workoutPlan?.currentWeek}</Text>
          <Text style={styles.statLabel}>Week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Zap size={20} color={Colors.warning} />
          <Text style={styles.statValue}>{(workoutPlan?.totalWeeks || 0) - (workoutPlan?.currentWeek || 0)}</Text>
          <Text style={styles.statLabel}>Left</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  
  // Fitness Hub Card (No Plan Active)
  fitnessHubCard: {
    borderRadius: borderRadius.xl,
    padding: 24,
    ...shadows.level4,
  },
  fitnessHubContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fitnessHubLeft: {
    flex: 1,
    gap: 12,
  },
  fitnessHubTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 32,
  },
  fitnessHubSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    lineHeight: 22,
  },
  readyToStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    alignSelf: 'flex-start',
    ...shadows.small,
  },
  readyToStartText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  fitnessHubRight: {
    alignItems: 'center',
  },
  testCountBox: {
    backgroundColor: Colors.primary + '40',
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  testCountNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 28,
  },
  testCountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white + 'CC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },


  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  redoPlanButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  redoPlanText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },

  // Personalized Plan Card
  personalizedPlanCard: {
    borderRadius: borderRadius.xl,
    padding: 24,
    ...shadows.level4,
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planCardLeft: {
    flex: 1,
    gap: 12,
    marginRight: 16,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 24,
  },
  planMeta: {
    fontSize: 14,
    color: Colors.white + 'CC',
    textTransform: 'capitalize',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white + 'CC',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.white + '20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  continueTrainingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface + '40',
    borderRadius: borderRadius.lg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  continueTrainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  // Today's Workout Card
  todaysWorkoutCard: {
    borderRadius: borderRadius.xl,
    padding: 24,
    ...shadows.level4,
  },
  workoutCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutCardLeft: {
    flex: 1,
    gap: 8,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  workoutTypeText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    ...shadows.small,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    ...shadows.small,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});

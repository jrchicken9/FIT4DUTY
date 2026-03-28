import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Square, 
  RotateCcw,
  Info
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import WorkoutPlanDashboard from './WorkoutPlanDashboard';
import { WorkoutPlan } from '@/context/WorkoutPlanContext';

export default function WorkoutPlanDemo() {
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [demoPlan, setDemoPlan] = useState<WorkoutPlan | null>(null);

  const handleStartPlan = () => {
    const newPlan: WorkoutPlan = {
      id: 'demo-plan-1',
      title: '4-Week Beginner PREP Crash Plan (Agility Focus)',
      description: 'Comprehensive training program to prepare for the PREP test',
      currentWeek: 1,
      totalWeeks: 4,
      progress: 25,
      focus: ['agility', 'cardio'],
      nextWorkout: {
        title: 'Daily Training',
        day: '1',
        week: '1',
        type: 'Run',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setDemoPlan(newPlan);
    setHasActivePlan(true);
  };

  const handleContinuePlan = () => {
    // Navigate to workout plan details
    console.log('Continue with plan:', demoPlan?.id);
  };

  const handleResetPlan = () => {
    setDemoPlan(null);
    setHasActivePlan(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Demo Controls */}
      <View style={styles.demoControls}>
        <LinearGradient
          colors={[Colors.surface, Colors.surface + 'DD']}
          style={styles.demoHeader}
        >
          <View style={styles.demoHeaderContent}>
            <Info size={24} color={Colors.primary} />
            <Text style={styles.demoTitle}>Workout Plan Dashboard Demo</Text>
            <Text style={styles.demoSubtitle}>
              Toggle between states to see the adaptive interface
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.controlButtons}>
          {!hasActivePlan ? (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleStartPlan}
            >
              <Play size={20} color={Colors.white} />
              <Text style={styles.controlButtonText}>Start Demo Plan</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlButtonRow}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={handleContinuePlan}
              >
                <Play size={20} color={Colors.primary} />
                <Text style={[styles.controlButtonText, { color: Colors.primary }]}>
                  Continue Plan
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.dangerButton]}
                onPress={handleResetPlan}
              >
                <RotateCcw size={20} color={Colors.white} />
                <Text style={styles.controlButtonText}>Reset Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Current State Indicator */}
      <View style={styles.stateIndicator}>
        <Text style={styles.stateLabel}>Current State:</Text>
        <View style={[
          styles.stateBadge, 
          { backgroundColor: hasActivePlan ? Colors.success : Colors.warning }
        ]}>
          <Text style={styles.stateBadgeText}>
            {hasActivePlan ? 'Active Plan' : 'No Plan'}
          </Text>
        </View>
      </View>

      {/* Adaptive Dashboard */}
      <WorkoutPlanDashboard
        hasActivePlan={hasActivePlan}
        workoutPlan={demoPlan}
        onStartPlan={handleStartPlan}
        onContinuePlan={handleContinuePlan}
      />

      {/* Demo Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How It Works</Text>
        <Text style={styles.instructionsText}>
          • When no workout plan is active, the dashboard shows the Fitness Hub card with options to start training
        </Text>
        <Text style={styles.instructionsText}>
          • Once a plan is initiated, the Fitness Hub is replaced with the Personalized Plan and Today's Workout cards
        </Text>
        <Text style={styles.instructionsText}>
          • This eliminates redundancy and provides a focused, progressive training experience
        </Text>
        <Text style={styles.instructionsText}>
          • The interface automatically adapts based on the user's workout plan status
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Demo Controls
  demoControls: {
    marginBottom: 24,
  },
  demoHeader: {
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
  },
  demoHeaderContent: {
    alignItems: 'center',
    gap: 8,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  controlButtons: {
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    ...shadows.small,
  },
  controlButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    flex: 1,
  },
  dangerButton: {
    backgroundColor: Colors.error,
    flex: 1,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  // State Indicator
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  stateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  stateBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  stateBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Instructions
  instructions: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginTop: 24,
    marginBottom: 40,
    ...shadows.small,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});

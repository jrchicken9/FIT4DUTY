import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { 
  Target, 
  Clock, 
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Lock,
  Play,
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows } from "@/constants/designSystem";
import ApplicationStepCard from "@/components/ApplicationStepCard";
import EmptyState from "@/components/EmptyState";
import PoliceThemeBackground from "@/components/PoliceThemeBackground";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { useApplication } from "@/context/ApplicationContext";
import { useAuth } from "@/context/AuthContext";
import applicationSteps from "@/constants/applicationSteps";

export default function ApplicationTimelineScreen() {
  const {
    getApplicationStepsWithProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    markStepCompleted,
    markStepIncomplete,
    isLoading,
  } = useApplication();
  const { user } = useAuth();

  const stepsWithProgress = getApplicationStepsWithProgress() || [];
  const completedStepsCount = getCompletedStepsCount() || 0;
  const progressPercentage = getProgressPercentage() || 0;

  const handleComplete = (stepId: string) => {
    markStepCompleted(stepId);
  };

  const handleUndo = (stepId: string) => {
    markStepIncomplete(stepId);
  };

  const isStepLocked = (stepIndex: number): boolean => {
    // Unlock all steps except enforce simple sequential dependency
    if (stepIndex === 0) return false;
    if (!stepsWithProgress || stepIndex < 0 || stepIndex >= stepsWithProgress.length) return false;
    for (let i = 0; i < stepIndex; i++) {
      if (stepsWithProgress[i] && !stepsWithProgress[i]?.completed) {
        return true;
      }
    }
    return false;
  };

  const handleStepPress = (step: any) => {
    // Route to the existing step page
    router.push(`/application/${step.id}` as any);
  };

  const getStepStatus = (step: any, index: number) => {
    if (step.completed) return 'completed';
    if (isStepLocked(index)) return 'locked';
    if (step.current) return 'current';
    return 'available';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading timeline...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline Header */}
        <View style={styles.timelineHeader}>
          <View style={styles.timelineBackground}>
            <LinearGradient
              colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
              style={styles.timelineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.timelineContent}>
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineTitle}>Application Timeline</Text>
                <Text style={styles.timelineSubtitle}>
                  Track your progress through each step of the police application process
                </Text>
                <View style={styles.timelineBadge}>
                  <Target size={14} color={Colors.white} />
                  <Text style={styles.timelineBadgeText}>
                    {completedStepsCount} of {stepsWithProgress.length} Steps
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineStats}>
                <View style={styles.timelineStatCard}>
                  <Text style={styles.timelineStatValue}>
                    {Math.round(progressPercentage)}%
                  </Text>
                  <Text style={styles.timelineStatLabel}>Complete</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressSubtitle}>
              {completedStepsCount > 0 
                ? `You've completed ${completedStepsCount} steps. Keep going!`
                : 'Start your journey by completing the first step.'
              }
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}% Complete
            </Text>
          </View>
        </View>

        {/* Steps Timeline */}
        <View style={styles.stepsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Application Steps</Text>
            <Text style={styles.sectionSubtitle}>
              Complete each step to advance through your police application journey
            </Text>
          </View>

          {/* Step Cards */}
          <View style={styles.stepsContainer}>
            {stepsWithProgress && Array.isArray(stepsWithProgress) && stepsWithProgress.length > 0 ? (
              stepsWithProgress.map((step, index) => {
                if (!step || !step.id) return null;
                
                const isCompleted = step.completed || false;
                const isCurrent = step.current || false;
                const isLocked = isStepLocked(index);
                const status = getStepStatus(step, index);
                
                return (
                  <TouchableOpacity
                    key={step.id}
                    style={[
                      styles.stepCard,
                      isCompleted && styles.stepCardCompleted,
                      isCurrent && styles.stepCardCurrent,
                      isLocked && styles.stepCardLocked,
                    ]}
                    onPress={() => !isLocked && handleStepPress(step)}
                    disabled={isLocked}
                    activeOpacity={isLocked ? 1 : 0.7}
                  >
                    <View style={styles.stepContent}>
                      <View style={styles.stepLeft}>
                        <View style={[
                          styles.stepIconContainer,
                          isCompleted && styles.stepIconContainerCompleted,
                          isCurrent && styles.stepIconContainerCurrent,
                          isLocked && styles.stepIconContainerLocked,
                        ]}>
                          {isCompleted ? (
                            <CheckCircle size={20} color={Colors.white} />
                          ) : isLocked ? (
                            <Lock size={20} color={Colors.textSecondary} />
                          ) : isCurrent ? (
                            <Play size={20} color={Colors.white} />
                          ) : (
                            <Target size={20} color={Colors.primary} />
                          )}
                        </View>
                        
                        <View style={styles.stepNumberContainer}>
                          <Text style={[
                            styles.stepNumber,
                            isCompleted && styles.stepNumberCompleted,
                            isCurrent && styles.stepNumberCurrent,
                            isLocked && styles.stepNumberLocked,
                          ]}>
                            {index + 1}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.stepDetails}>
                        <Text style={[
                          styles.stepTitle,
                          isCompleted && styles.stepTitleCompleted,
                          isCurrent && styles.stepTitleCurrent,
                          isLocked && styles.stepTitleLocked,
                        ]}>
                          {step.title}
                        </Text>
                        <Text style={[
                          styles.stepDescription,
                          isLocked && styles.stepDescriptionLocked,
                        ]}>
                          {step.description}
                        </Text>
                      </View>
                      
                      <ChevronRight 
                        size={16} 
                        color={isLocked ? Colors.textSecondary : Colors.textTertiary} 
                        style={styles.stepChevron}
                      />
                    </View>
                    
                    {isCurrent && (
                      <View style={styles.currentStepIndicator}>
                        <Text style={styles.currentStepText}>Current Step</Text>
                      </View>
                    )}

                    {/* Actions Row */}
                    <View style={styles.stepActionsRow}>
                      {!isLocked && !isCompleted && (
                        <TouchableOpacity
                          style={styles.stepPrimaryAction}
                          onPress={() => handleComplete(step.id)}
                        >
                          <Text style={styles.stepPrimaryActionText}>Mark as Complete</Text>
                        </TouchableOpacity>
                      )}
                      {isCompleted && (
                        <TouchableOpacity
                          style={styles.stepSecondaryAction}
                          onPress={() => handleUndo(step.id)}
                        >
                          <Text style={styles.stepSecondaryActionText}>Mark Incomplete</Text>
                        </TouchableOpacity>
                      )}
                      {!isLocked && (
                        <TouchableOpacity
                          style={styles.stepLinkAction}
                          onPress={() => handleStepPress(step)}
                        >
                          <Text style={styles.stepLinkActionText}>Open Step</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <EmptyState
                type="application"
                onAction={() => router.push('/application/prerequisites' as any)}
              />
            )}
          </View>
        </View>
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
    paddingBottom: spacing.xl,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Timeline Header
  timelineHeader: {
    marginTop: 16,
    marginBottom: 24,
  },
  timelineBackground: {
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
  timelineGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.95,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  timelineSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  timelineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  timelineBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  timelineStats: {
    alignItems: 'center',
  },
  timelineStatCard: {
    backgroundColor: Colors.white + '20',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  timelineStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  timelineStatLabel: {
    fontSize: 12,
    color: Colors.white + 'CC',
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    marginBottom: 16,
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
    fontWeight: '500',
  },
  progressBar: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },

  // Steps Section
  stepsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
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
  stepsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  stepCardCompleted: {
    borderColor: Colors.success + '30',
    backgroundColor: Colors.success + '05',
  },
  stepCardCurrent: {
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primary + '05',
  },
  stepCardLocked: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconContainerCompleted: {
    backgroundColor: Colors.success,
  },
  stepIconContainerCurrent: {
    backgroundColor: Colors.primary,
  },
  stepIconContainerLocked: {
    backgroundColor: Colors.border,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepNumberCompleted: {
    color: Colors.success,
  },
  stepNumberCurrent: {
    color: Colors.primary,
  },
  stepNumberLocked: {
    color: Colors.textSecondary,
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: Colors.success,
  },
  stepTitleCurrent: {
    color: Colors.primary,
  },
  stepTitleLocked: {
    color: Colors.textSecondary,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  stepDescriptionLocked: {
    color: Colors.textTertiary,
  },
  stepEstimatedTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepEstimatedTimeLocked: {
    color: Colors.textTertiary,
  },
  stepChevron: {
    marginLeft: 8,
  },
  currentStepIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentStepText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  stepActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepPrimaryAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stepPrimaryActionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  stepSecondaryAction: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stepSecondaryActionText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  stepLinkAction: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepLinkActionText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});


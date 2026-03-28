import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ArrowLeft, Clock, CheckCircle, X, FileText, Plus, ArrowRight } from 'lucide-react-native';
import { format, addDays } from 'date-fns';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { ENABLE_OACP_FITNESS_LOGS } from '@/constants/applicationFeatures';

export default function StartFitnessLogScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLog, setCreatedLog] = useState<any>(null);

  const handleStartLog = async () => {
    if (!ENABLE_OACP_FITNESS_LOGS) {
      Alert.alert('Feature Disabled', 'Fitness logs are currently disabled.');
      return;
    }

    setIsCreating(true);
    try {
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      const endDate = format(addDays(selectedDate, 13), 'yyyy-MM-dd');
      
      // Check if user can start a new log
      const canStart = await fitnessLogService.canStartNewLog();
      if (!canStart) {
        Alert.alert(
          'Active Log Exists',
          'You already have an active fitness log. Please complete or reset your current log before starting a new one.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create the log
      const log = await fitnessLogService.createLog(startDate);
      
      // Show custom success modal
      setCreatedLog(log);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating fitness log:', error);
      Alert.alert(
        'Error',
        'Failed to create fitness log. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => format(date, 'MMMM dd, yyyy');
  const formatEndDate = (date: Date) => format(addDays(date, 13), 'MMMM dd, yyyy');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Start 14-Day Log</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Calendar size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>OACP Fitness Log</Text>
            <Text style={styles.subtitle}>
              Choose your start date to begin your 14-day activity tracking
            </Text>
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Start Date</Text>
            <View style={styles.dateCard}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Selected Date</Text>
                <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{formatEndDate(selectedDate)}</Text>
              </View>
            </View>
          </View>

          {/* Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>What to Expect</Text>
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Clock size={20} color={Colors.white} />
                <Text style={styles.infoTitle}>14 Days</Text>
                <Text style={styles.infoDescription}>
                  Track your daily activities for exactly 14 consecutive days
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <CheckCircle size={20} color={Colors.white} />
                <Text style={styles.infoTitle}>Daily Entries</Text>
                <Text style={styles.infoDescription}>
                  Log runs, strength training, other activities, stress management, and sleep
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Calendar size={20} color={Colors.white} />
                <Text style={styles.infoTitle}>Official PDF</Text>
                <Text style={styles.infoDescription}>
                  Generate a professional PDF ready for OACP submission
                </Text>
              </View>
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.sectionTitle}>Daily Requirements</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.requirementText}>Stress management method (required)</Text>
              </View>
              <View style={styles.requirementItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.requirementText}>Sleep hours (required)</Text>
              </View>
              <View style={styles.requirementItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.requirementText}>Run, strength training, or other activity (optional)</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.startButton, isCreating && styles.startButtonDisabled]}
            onPress={handleStartLog}
            disabled={isCreating}
          >
            <LinearGradient
              colors={isCreating ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>
                {isCreating ? 'Creating Log...' : 'Start 14-Day Log'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
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
                  <CheckCircle size={32} color={Colors.white} />
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <X size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🎉 Fitness Log Started!</Text>
                <Text style={styles.modalSubtitle}>
                  Your 14-day OACP fitness log is ready from {format(selectedDate, 'MMM dd, yyyy')} to {format(addDays(selectedDate, 13), 'MMM dd, yyyy')}
                </Text>

                {/* Tips Section */}
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>💡 Daily Logging Tips:</Text>
                  <View style={styles.tipsList}>
                    <View style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>Log your activities at the end of each day</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>Include duration, distance, and location details</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>Track stress management and sleep hours daily</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>Complete all 14 days to generate your PDF</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowSuccessModal(false);
                      router.replace(`/fitness/logs/summary?logId=${createdLog.id}`);
                    }}
                  >
                    <FileText size={16} color={Colors.text} />
                    <Text style={styles.modalActionButtonText}>View Summary</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowSuccessModal(false);
                      router.replace(`/fitness/logs/day/${format(selectedDate, 'yyyy-MM-dd')}?logId=${createdLog.id}`);
                    }}
                  >
                    <Plus size={16} color={Colors.text} />
                    <Text style={styles.modalActionButtonText}>Start First Entry</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.modalSecondaryButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.replace('/(tabs)/fitness');
                  }}
                >
                  <ArrowRight size={16} color={Colors.white} />
                  <Text style={styles.modalSecondaryButtonText}>Go to Fitness Tab</Text>
                </TouchableOpacity>
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
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 60, // Increased to account for status bar since we removed the navigation header
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: Colors.white + 'CC',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  dateCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  dateInfo: {
    marginBottom: spacing.sm,
  },
  dateLabel: {
    ...typography.labelMedium,
    color: Colors.white + 'CC',
    marginBottom: 2,
  },
  dateValue: {
    ...typography.bodyLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoCards: {
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    alignItems: 'center',
  },
  infoTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
    lineHeight: 20,
  },
  requirementsSection: {
    marginBottom: spacing.xl,
  },
  requirementsList: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  requirementText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg, // Reduced from spacing.xl to minimize bottom space
    paddingTop: spacing.md,
  },
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.level4,
  },
  modalGradient: {
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'DD',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  tipsSection: {
    width: '100%',
    backgroundColor: Colors.white + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  tipsTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipBullet: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 2,
  },
  tipText: {
    ...typography.bodySmall,
    color: Colors.white + 'DD',
    flex: 1,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.level2,
  },
  modalActionButtonText: {
    ...typography.buttonMedium,
    color: Colors.text,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.white + '40',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  modalSecondaryButtonText: {
    ...typography.buttonMedium,
    color: Colors.white,
    fontWeight: '500',
  },
});
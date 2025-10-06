import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle, XCircle, Calendar, FileText, RotateCcw } from 'lucide-react-native';
import { format, addDays } from 'date-fns';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { FitnessLog, FitnessLogDay } from '@/types/fitness-log';
import { createConsistentDate, getTargetDateForEntry, isToday, formatDateISO } from '@/lib/dateUtils';

export default function FitnessLogSummaryScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const [log, setLog] = useState<FitnessLog | null>(null);
  const [days, setDays] = useState<FitnessLogDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (logId) {
      loadLogData();
    }
  }, [logId]);

  const loadLogData = async () => {
    if (!logId) return;
    
    setLoading(true);
    try {
      const [logData, daysData] = await Promise.all([
        fitnessLogService.getLog(logId),
        fitnessLogService.getDays(logId)
      ]);
      
      setLog(logData);
      setDays(daysData);
    } catch (error) {
      console.error('Error loading log data:', error);
      Alert.alert('Error', 'Failed to load fitness log data.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetLog = async () => {
    if (!log) return;

    Alert.alert(
      'Reset Fitness Log',
      'Are you sure you want to reset this fitness log? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await fitnessLogService.deleteLog(log.id);
              Alert.alert('Success', 'Fitness log has been reset.');
              router.replace('/(tabs)/fitness');
            } catch (error) {
              console.error('Error resetting log:', error);
              Alert.alert('Error', 'Failed to reset fitness log.');
            }
          }
        }
      ]
    );
  };

  const daysCompleted = days.filter(day => day.is_complete).length;
  const completionPercentage = Math.round((daysCompleted / 14) * 100);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Fitness log not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fitness Log Summary</Text>
          <TouchableOpacity 
            style={styles.headerResetButton}
            onPress={handleResetLog}
          >
            <RotateCcw size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Log Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Log Overview</Text>
            <View style={styles.overviewCard}>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Start Date</Text>
                <Text style={styles.overviewValue}>{format(new Date(log.start_date + 'T00:00:00'), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>End Date</Text>
                <Text style={styles.overviewValue}>{format(new Date(log.end_date + 'T00:00:00'), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Status</Text>
                <Text style={styles.overviewValue}>{log.status === 'completed' ? 'Completed' : 'In Progress'}</Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Signed</Text>
                <Text style={styles.overviewValue}>{log.signed ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {daysCompleted} of 14 days completed ({completionPercentage}%)
              </Text>
            </View>
          </View>

          {/* Daily Progress Grid */}
          <View style={styles.dailyProgressSection}>
            <Text style={styles.sectionTitle}>Daily Progress</Text>
            <View style={styles.dailyGrid}>
              {Array.from({ length: 14 }, (_, index) => {
                // Use the same date calculation as the start screen for consistency
                const startDateObj = new Date(log.start_date + 'T00:00:00');
                const dayDate = addDays(startDateObj, index);
                const dayNumber = index + 1;
                const dayDateString = format(dayDate, 'yyyy-MM-dd');
                const dayEntry = days.find(day => day.day_date === dayDateString);
                const isCompleted = dayEntry?.is_complete || false;
                const isTodayDate = isToday(dayDateString);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCard,
                      isCompleted && styles.dayCardCompleted,
                      isTodayDate && styles.dayCardToday
                    ]}
                    onPress={() => {
                      const targetDate = format(dayDate, 'yyyy-MM-dd');
                      router.push(`/fitness/logs/day/${targetDate}?logId=${log.id}`);
                    }}
                  >
                    <Text style={styles.dayNumber}>Day {dayNumber}</Text>
                    <View style={styles.dayIcon}>
                      {isCompleted ? (
                        <CheckCircle size={16} color={Colors.success} />
                      ) : (
                        <XCircle size={16} color={Colors.error} />
                      )}
                    </View>
                    <Text style={styles.dayDate}>{format(dayDate, 'MMM dd')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // Find the next incomplete day or today if within range
                    const targetDate = getTargetDateForEntry(log.start_date, log.end_date, days);
                    router.push(`/fitness/logs/day/${targetDate}?logId=${log.id}`);
                  }}
                >
              <Calendar size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Continue Entry</Text>
            </TouchableOpacity>

            {daysCompleted === 14 && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/fitness/logs/sign?logId=${log.id}`)}
              >
                <FileText size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Sign & Complete</Text>
              </TouchableOpacity>
            )}


          </View>
        </ScrollView>
      </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.headingMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 60, // Increased to account for status bar since we removed the navigation header
  },
  headerBackButton: {
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
  headerResetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  overviewSection: {
    marginBottom: spacing.xl,
  },
  overviewCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overviewLabel: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  overviewValue: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.white + '20',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 6,
  },
  progressText: {
    ...typography.bodyMedium,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  dailyProgressSection: {
    marginBottom: spacing.xl,
  },
  dailyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dayCardCompleted: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success + '40',
  },
  dayCardToday: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  dayNumber: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  dayIcon: {
    marginVertical: 2,
  },
  dayDate: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    fontSize: 9,
  },
  actionsSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.white + '40',
  },
  actionButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  exportSection: {
    marginTop: spacing.md,
  },
});
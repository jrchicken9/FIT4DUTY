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
import { useRouter } from 'expo-router';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Footprints,
  BedDouble,
  Brain,
  ArrowRight,
  Plus,
  FileText,
  Download,
  PenTool,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { ENABLE_OACP_FITNESS_LOGS } from '@/constants/applicationFeatures';
import type { FitnessLog, FitnessLogProgress } from '@/types/fitness-log';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import ProfessionalBackground from '@/components/ProfessionalBackground';

export default function FitnessLogsIndexScreen() {
  const router = useRouter();
  const [activeLog, setActiveLog] = useState<FitnessLog | null>(null);
  const [progress, setProgress] = useState<FitnessLogProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActiveLog = async () => {
    try {
      setLoading(true);
      const log = await fitnessLogService.getActiveLog();
      setActiveLog(log);
      
      if (log) {
        const logProgress = await fitnessLogService.getLogProgress(log.id);
        setProgress(logProgress);
      }
    } catch (error) {
      console.error('Error loading active log:', error);
      Alert.alert('Error', 'Failed to load fitness log data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveLog();
    setRefreshing(false);
  };

  useEffect(() => {
    if (ENABLE_OACP_FITNESS_LOGS) {
      loadActiveLog();
    }
  }, []);

  const handleStartNewLog = () => {
    if (activeLog) {
      Alert.alert(
        'Active Log Exists',
        'You already have an active fitness log. Would you like to start a new one? This will cancel your current log.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start New Log', style: 'destructive', onPress: () => router.push('/fitness/logs/start') }
        ]
      );
    } else {
      router.push('/fitness/logs/start');
    }
  };

  const handleContinueEntry = () => {
    if (activeLog && progress) {
      const today = new Date().toISOString().slice(0, 10);
      const startDate = new Date(activeLog.start_date);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentDay = Math.max(1, Math.min(14, daysDiff + 1));
      
      // Calculate the date for the current day
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + (currentDay - 1));
      
      router.push(`/fitness/logs/day/${targetDate.toISOString().slice(0, 10)}`);
    }
  };

  const handlePreviewExport = () => {
    if (activeLog) {
      router.push('/fitness/logs/summary');
    }
  };

  const handleFinishSign = () => {
    if (activeLog) {
      router.push('/fitness/logs/summary');
    }
  };

  if (!ENABLE_OACP_FITNESS_LOGS) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.content}>
          <EmptyState
            icon={ClipboardList}
            title="Feature Coming Soon"
            subtitle="OACP Fitness Logs will be available in a future update"
          />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading fitness log...</Text>
          </View>
        </View>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <LinearGradient
              colors={[Colors.gradients.fitness.start, Colors.gradients.fitness.end]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>OACP Fitness Logs</Text>
                <Text style={styles.headerSubtitle}>
                  Track your 14-day physical activity and wellness journey
                </Text>
                <View style={styles.headerBadge}>
                  <ClipboardList size={14} color={Colors.white} />
                  <Text style={styles.headerBadgeText}>
                    Official OACP Requirement
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerIcon}>
                <Target size={32} color={Colors.white} />
              </View>
            </View>
          </View>
        </View>

        {/* Active Log Section */}
        {activeLog && progress ? (
          <View style={styles.activeLogSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Active Log</Text>
              <Text style={styles.sectionSubtitle}>
                {progress.isComplete ? 'Completed' : 'In Progress'}
              </Text>
            </View>

            <View style={styles.activeLogCard}>
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <Text style={styles.logTitle}>14-Day Fitness Log</Text>
                  <Text style={styles.logPeriod}>
                    {new Date(progress.startDate).toLocaleDateString('en-CA')} - {new Date(progress.endDate).toLocaleDateString('en-CA')}
                  </Text>
                </View>
                <View style={styles.logStatus}>
                  <View style={[
                    styles.statusBadge,
                    progress.isComplete ? styles.statusBadgeComplete : styles.statusBadgeInProgress
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      progress.isComplete ? styles.statusBadgeTextComplete : styles.statusBadgeTextInProgress
                    ]}>
                      {progress.isComplete ? 'Complete' : 'Active'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressCount}>
                    {progress.completedDays}/{progress.totalDays} days
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(progress.completedDays / progress.totalDays) * 100}%` }
                    ]} 
                  />
                </View>
                
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <CheckCircle2 size={16} color={Colors.success} />
                    <Text style={styles.progressStatText}>
                      {progress.completedDays} Completed
                    </Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Clock size={16} color={Colors.warning} />
                    <Text style={styles.progressStatText}>
                      {progress.totalDays - progress.completedDays} Remaining
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {!progress.isComplete ? (
                  <>
                    <Button
                      title="Continue Today's Entry"
                      onPress={handleContinueEntry}
                      variant="primary"
                      fullWidth
                      icon={<PenTool size={16} color={Colors.white} />}
                      iconPosition="left"
                    />
                    
                    <View style={styles.secondaryActions}>
                      <Button
                        title="Preview & Export"
                        onPress={handlePreviewExport}
                        variant="outline"
                        style={styles.secondaryButton}
                        icon={<FileText size={16} color={Colors.primary} />}
                        iconPosition="left"
                      />
                      
                      {progress.completedDays === progress.totalDays && (
                        <Button
                          title="Finish & Sign"
                          onPress={handleFinishSign}
                          variant="gradient"
                          style={styles.secondaryButton}
                          icon={<CheckCircle2 size={16} color={Colors.white} />}
                          iconPosition="left"
                        />
                      )}
                    </View>
                  </>
                ) : (
                  <View style={styles.completedActions}>
                    <Button
                      title="View Summary & Export"
                      onPress={handlePreviewExport}
                      variant="primary"
                      fullWidth
                      icon={<Download size={16} color={Colors.white} />}
                      iconPosition="left"
                    />
                    
                    {!progress.isSigned && (
                      <Button
                        title="Sign & Complete"
                        onPress={handleFinishSign}
                        variant="gradient"
                        fullWidth
                        style={styles.signButton}
                        icon={<PenTool size={16} color={Colors.white} />}
                        iconPosition="left"
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noActiveLogSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Start Your Fitness Log</Text>
              <Text style={styles.sectionSubtitle}>
                Begin your 14-day OACP fitness tracking journey
              </Text>
            </View>

            <View style={styles.startLogCard}>
              <View style={styles.startLogContent}>
                <View style={styles.startLogIcon}>
                  <ClipboardList size={48} color={Colors.primary} />
                </View>
                
                <Text style={styles.startLogTitle}>No Active Log</Text>
                <Text style={styles.startLogSubtitle}>
                  Start a new 14-day fitness log to track your physical activity, 
                  stress management, and sleep patterns for your OACP application.
                </Text>
                
                <View style={styles.startLogFeatures}>
                  <View style={styles.startLogFeature}>
                    <Footprints size={16} color={Colors.success} />
                    <Text style={styles.startLogFeatureText}>Run & Cardio Tracking</Text>
                  </View>
                  <View style={styles.startLogFeature}>
                    <Dumbbell size={16} color={Colors.success} />
                    <Text style={styles.startLogFeatureText}>Strength Training Log</Text>
                  </View>
                  <View style={styles.startLogFeature}>
                    <Brain size={16} color={Colors.success} />
                    <Text style={styles.startLogFeatureText}>Stress Management</Text>
                  </View>
                  <View style={styles.startLogFeature}>
                    <BedDouble size={16} color={Colors.success} />
                    <Text style={styles.startLogFeatureText}>Sleep Tracking</Text>
                  </View>
                </View>
                
                <Button
                  title="Start New 14-Day Log"
                  onPress={handleStartNewLog}
                  variant="gradient"
                  fullWidth
                  icon={<Plus size={16} color={Colors.white} />}
                  iconPosition="left"
                />
              </View>
            </View>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <AlertCircle size={20} color={Colors.warning} />
              <Text style={styles.infoTitle}>Important Information</Text>
            </View>
            
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Each day requires stress management method and sleep hours to be marked complete
              </Text>
              <Text style={styles.infoText}>
                • All 14 days must be completed before you can sign and export the log
              </Text>
              <Text style={styles.infoText}>
                • You can save partial entries as drafts and complete them later
              </Text>
              <Text style={styles.infoText}>
                • Once signed, the log cannot be edited
              </Text>
            </View>
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
    paddingBottom: 100,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
  },
  
  // Header
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  headerBackground: {
    position: 'relative',
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 12,
  },
  headerBadge: {
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
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  
  // Section Headers
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  
  // Active Log Section
  activeLogSection: {
    marginBottom: 32,
  },
  activeLogCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    padding: 24,
    ...shadows.heavy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  logPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logStatus: {
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusBadgeComplete: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  statusBadgeInProgress: {
    backgroundColor: Colors.warning + '15',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextComplete: {
    color: Colors.success,
  },
  statusBadgeTextInProgress: {
    color: Colors.warning,
  },
  
  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Action Buttons
  actionButtons: {
    gap: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  completedActions: {
    gap: 12,
  },
  signButton: {
    marginTop: 8,
  },
  
  // No Active Log Section
  noActiveLogSection: {
    marginBottom: 32,
  },
  startLogCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    padding: 32,
    ...shadows.heavy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  startLogContent: {
    alignItems: 'center',
  },
  startLogIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  startLogTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  startLogSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startLogFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  startLogFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  startLogFeatureText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  
  // Info Section
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

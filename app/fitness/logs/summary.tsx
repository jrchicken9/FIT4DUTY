import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Dumbbell,
  Footprints,
  Brain,
  BedDouble,
  Activity,
  PenTool,
  Share as ShareIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { generateOACPFitnessLogHTML, generateLogSummary } from '@/lib/pdfTemplates/oacpFitnessLog';
import type { FitnessLog, FitnessLogDay, FitnessLogProgress } from '@/types/fitness-log';
import Button from '@/components/Button';
import ProfessionalBackground from '@/components/ProfessionalBackground';

export default function FitnessLogSummaryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeLog, setActiveLog] = useState<FitnessLog | null>(null);
  const [days, setDays] = useState<FitnessLogDay[]>([]);
  const [progress, setProgress] = useState<FitnessLogProgress | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const loadLogData = async () => {
    try {
      setLoading(true);
      
      const log = await fitnessLogService.getActiveLog();
      if (!log) {
        Alert.alert('Error', 'No active fitness log found');
        router.back();
        return;
      }

      setActiveLog(log);
      
      const logDays = await fitnessLogService.getDays(log.id);
      setDays(logDays);
      
      const logProgress = await fitnessLogService.getLogProgress(log.id);
      setProgress(logProgress);
      
      const logSummary = generateLogSummary(logDays);
      setSummary(logSummary);
    } catch (error) {
      console.error('Error loading log data:', error);
      Alert.alert('Error', 'Failed to load fitness log data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayStatus = (day: FitnessLogDay) => {
    if (day.is_complete) {
      return { status: 'complete', icon: CheckCircle2, color: Colors.success };
    } else if (day.stress_method && day.sleep_hours !== null && day.sleep_hours !== undefined) {
      return { status: 'partial', icon: AlertTriangle, color: Colors.warning };
    } else {
      return { status: 'incomplete', icon: XCircle, color: Colors.error };
    }
  };

  const handlePreviewPDF = async () => {
    if (!activeLog || !summary) return;
    
    try {
      setExporting(true);
      
      const userInfo = {
        name: 'User Name', // This should come from user profile
        email: 'user@example.com', // This should come from user profile
      };
      
      const html = generateOACPFitnessLogHTML({
        log: activeLog,
        days,
        userInfo,
        exportOptions: {
          includeSignature: false,
          includeWatermark: true,
          format: 'pdf'
        }
      });
      
      // For now, just show an alert. In a real app, you'd generate and show the PDF
      Alert.alert(
        'PDF Preview',
        'PDF preview functionality would be implemented here. The HTML template is ready for PDF generation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      Alert.alert('Error', 'Failed to generate PDF preview');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!activeLog || !summary) return;
    
    if (!progress?.isComplete) {
      Alert.alert(
        'Incomplete Log',
        'All 14 days must be completed before you can export the final PDF.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setExporting(true);
      
      const userInfo = {
        name: 'User Name', // This should come from user profile
        email: 'user@example.com', // This should come from user profile
      };
      
      const html = generateOACPFitnessLogHTML({
        log: activeLog,
        days,
        userInfo,
        exportOptions: {
          includeSignature: activeLog.signed,
          includeWatermark: !activeLog.signed,
          format: 'pdf'
        }
      });
      
      // For now, just show an alert. In a real app, you'd generate and save the PDF
      Alert.alert(
        'Export PDF',
        'PDF export functionality would be implemented here. The HTML template is ready for PDF generation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleFinishAndSign = () => {
    if (!progress?.isComplete) {
      Alert.alert(
        'Incomplete Log',
        'All 14 days must be completed before you can sign the log.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push('/fitness/logs/sign');
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Share.share({
          message: `I've completed my 14-day OACP fitness log! ${progress?.completedDays}/14 days completed.`,
          url: '', // Add app URL if available
        });
      } else {
        await Share.share({
          message: `I've completed my 14-day OACP fitness log! ${progress?.completedDays}/14 days completed.`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </View>
    );
  }

  if (!activeLog || !progress || !summary) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load log data</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Log Summary</Text>
            <Text style={styles.headerSubtitle}>14-Day Fitness Log Overview</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <ShareIcon size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Overview */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Log Status</Text>
              <View style={[
                styles.statusBadge,
                progress.isComplete ? styles.statusBadgeComplete : styles.statusBadgeInProgress
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  progress.isComplete ? styles.statusBadgeTextComplete : styles.statusBadgeTextInProgress
                ]}>
                  {progress.isComplete ? 'Complete' : 'In Progress'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusStats}>
              <View style={styles.statusStat}>
                <Text style={styles.statusStatValue}>{progress.completedDays}</Text>
                <Text style={styles.statusStatLabel}>Days Completed</Text>
              </View>
              <View style={styles.statusStat}>
                <Text style={styles.statusStatValue}>{progress.totalDays - progress.completedDays}</Text>
                <Text style={styles.statusStatLabel}>Days Remaining</Text>
              </View>
              <View style={styles.statusStat}>
                <Text style={styles.statusStatValue}>
                  {Math.round((progress.completedDays / progress.totalDays) * 100)}%
                </Text>
                <Text style={styles.statusStatLabel}>Progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>14-Day Summary</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Footprints size={24} color={Colors.success} />
              <Text style={styles.summaryValue}>{summary.totalRunMinutes}</Text>
              <Text style={styles.summaryLabel}>Total Run Minutes</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Dumbbell size={24} color={Colors.success} />
              <Text style={styles.summaryValue}>{summary.totalStrengthMinutes}</Text>
              <Text style={styles.summaryLabel}>Strength Minutes</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Activity size={24} color={Colors.success} />
              <Text style={styles.summaryValue}>{summary.totalOtherActivityMinutes}</Text>
              <Text style={styles.summaryLabel}>Other Activity Minutes</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <BedDouble size={24} color={Colors.success} />
              <Text style={styles.summaryValue}>{summary.averageSleepHours.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Avg Sleep Hours</Text>
            </View>
          </View>
        </View>

        {/* Daily Progress Grid */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Progress</Text>
            <Text style={styles.sectionSubtitle}>
              {formatDate(progress.startDate)} - {formatDate(progress.endDate)}
            </Text>
          </View>
          
          <View style={styles.progressGrid}>
            {days.map((day, index) => {
              const dayStatus = getDayStatus(day);
              const StatusIcon = dayStatus.icon;
              const dayNumber = index + 1;
              
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.progressDay,
                    dayStatus.status === 'complete' && styles.progressDayComplete,
                    dayStatus.status === 'partial' && styles.progressDayPartial,
                  ]}
                  onPress={() => router.push(`/fitness/logs/day/${day.day_date}`)}
                >
                  <Text style={styles.progressDayNumber}>Day {dayNumber}</Text>
                  <StatusIcon size={20} color={dayStatus.color} />
                  <Text style={styles.progressDayDate}>
                    {new Date(day.day_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Missing Fields Warning */}
        {!progress.isComplete && (
          <View style={styles.warningSection}>
            <View style={styles.warningCard}>
              <AlertTriangle size={24} color={Colors.warning} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Complete All Days</Text>
                <Text style={styles.warningText}>
                  All 14 days must be completed before you can sign and export the final log.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Export Options */}
        <View style={styles.exportSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Export Options</Text>
          </View>
          
          <View style={styles.exportOptions}>
            <Button
              title="Preview PDF (Draft)"
              onPress={handlePreviewPDF}
              variant="outline"
              loading={exporting}
              disabled={exporting}
              icon={<Eye size={16} color={Colors.primary} />}
              iconPosition="left"
              fullWidth
            />
            
            {progress.isComplete ? (
              <>
                <Button
                  title="Export Final PDF"
                  onPress={handleExportPDF}
                  variant="primary"
                  loading={exporting}
                  disabled={exporting}
                  icon={<Download size={16} color={Colors.white} />}
                  iconPosition="left"
                  fullWidth
                />
                
                {!activeLog.signed && (
                  <Button
                    title="Finish & Sign Log"
                    onPress={handleFinishAndSign}
                    variant="gradient"
                    icon={<PenTool size={16} color={Colors.white} />}
                    iconPosition="left"
                    fullWidth
                  />
                )}
              </>
            ) : (
              <View style={styles.incompleteWarning}>
                <Text style={styles.incompleteWarningText}>
                  Complete all 14 days to export final PDF and sign the log.
                </Text>
              </View>
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
    paddingBottom: 100,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  errorText: {
    ...typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Status Section
  statusSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
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
  statusStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusStat: {
    alignItems: 'center',
  },
  statusStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statusStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Summary Section
  summarySection: {
    paddingHorizontal: 20,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    ...shadows.level2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Progress Section
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressDay: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressDayComplete: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  progressDayPartial: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
  },
  progressDayNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  progressDayDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // Warning Section
  warningSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Export Section
  exportSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  exportOptions: {
    gap: 12,
  },
  incompleteWarning: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  incompleteWarningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

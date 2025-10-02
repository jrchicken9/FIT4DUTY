import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { 
  BarChart3, 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { spacing, typography, borderRadius, shadows } from '@/constants/designSystem';
import ProfessionalBackground from '@/components/ProfessionalBackground';
import useApplicationAnalytics from '@/hooks/useApplicationAnalytics';

export default function ApplicationAnalyticsScreen() {
  const { analytics, summary, loading, error, refetch } = useApplicationAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'in_progress':
        return Colors.warning;
      case 'not_started':
      default:
        return Colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
      default:
        return 'Pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'in_progress':
        return <Clock size={16} color={Colors.warning} />;
      case 'not_started':
      default:
        return <Target size={16} color={Colors.textTertiary} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Error Loading Analytics</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.retryButton}>
            <Text style={styles.retryButtonText} onPress={refetch}>Retry</Text>
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Application Analytics Header */}
        <View style={styles.analyticsHeader}>
          <View style={styles.analyticsHeaderContent}>
            <View style={styles.analyticsHeaderText}>
              <Text style={styles.analyticsTitle}>Application Analytics</Text>
              <Text style={styles.analyticsSubtitle}>
                Track your progress and performance across all application steps.
              </Text>
            </View>
            <View style={styles.analyticsIcon}>
              <BarChart3 size={32} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressMetrics}>
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>
                  {analytics?.overallProgress.completionPercentage || 0}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>
                  {analytics?.overallProgress.stepsCompleted || 0}
                </Text>
                <Text style={styles.progressLabel}>Steps Done</Text>
              </View>
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>
                  {analytics?.overallProgress.stepsRemaining || 0}
                </Text>
                <Text style={styles.progressLabel}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Step Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step Breakdown</Text>
          <View style={styles.stepsCard}>
            {analytics?.stepBreakdown.map((step) => (
              <View
                key={step.id}
                style={styles.stepItem}
              >
                <View style={styles.stepLeft}>
                  {getStatusIcon(step.status)}
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <View style={[styles.stepStatus, { backgroundColor: getStatusColor(step.status) + '20' }]}>
                  <Text style={[styles.stepStatusText, { color: getStatusColor(step.status) }]}>
                    {getStatusText(step.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        {analytics?.performanceMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            <View style={styles.insightsCard}>
              {analytics.performanceMetrics.currentStreak > 0 && (
                <View style={styles.insightItem}>
                  <Award size={20} color={Colors.success} />
                  <Text style={styles.insightText}>
                    {analytics.performanceMetrics.currentStreak} step streak!
                  </Text>
                </View>
              )}
              {analytics.performanceMetrics.averageCompletionTime && (
                <View style={styles.insightItem}>
                  <TrendingUp size={20} color={Colors.primary} />
                  <Text style={styles.insightText}>
                    Average completion time: {analytics.performanceMetrics.averageCompletionTime} days
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {summary?.recentActivity && summary.recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {summary.recentActivity.map((activity: any, index: number) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    {getStatusIcon(activity.status)}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {analytics?.stepBreakdown.find(step => step.id === activity.step_id)?.title || 'Unknown Step'}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {getStatusText(activity.status)} • {new Date(activity.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: spacing.md,
  },
  analyticsHeader: {
    backgroundColor: Colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  analyticsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  analyticsHeaderText: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  analyticsSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  analyticsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  progressMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressMetric: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  stepStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  stepStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  insightText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIcon: {
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  activitySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
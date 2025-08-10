import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Shield,
  Target,
  TrendingUp,
  Clock,
  Activity,
  Award,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PoliceTest } from '@/constants/workouts';
import { router } from 'expo-router';

interface PoliceTestWidgetProps {
  test: PoliceTest;
  userScore?: number;
  userLevel?: number;
  lastAttempt?: string;
  testId?: string;
}

export default function PoliceTestWidget({
  test,
  userScore,
  userLevel,
  lastAttempt,
  testId = 'police-test-widget'
}: PoliceTestWidgetProps) {
  const handlePress = () => {
    router.push(`/test/${test.id}`);
  };

  const getScoreColor = (score?: number) => {
    if (!score || !test.passingScore) return Colors.textSecondary;
    if (score >= test.passingScore) return Colors.success;
    return Colors.error;
  };

  const getScoreStatus = (score?: number) => {
    if (!score || !test.passingScore) return 'Not attempted';
    if (score >= test.passingScore) return 'Passed';
    return 'Needs improvement';
  };

  const formatScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${score}${test.unit ? ` ${test.unit}` : ''}`;
  };

  const getTestIcon = () => {
    switch (test.type) {
      case 'SHUTTLE_RUN':
        return <Activity size={20} color={Colors.white} />;
      case 'PREP_CIRCUIT':
        return <Shield size={20} color={Colors.white} />;
      case 'PIN':
        return <Target size={20} color={Colors.white} />;
      case 'PUSH_UPS':
        return <TrendingUp size={20} color={Colors.white} />;
      default:
        return <Shield size={20} color={Colors.white} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID={testId}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getTestIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {test.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {test.type.replace('_', ' ')} • {test.duration} min
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(userScore) }]}>
            {formatScore(userScore)}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Your Score</Text>
            <Text style={[styles.progressValue, { color: getScoreColor(userScore) }]}>
              {formatScore(userScore)}
            </Text>
            <Text style={[styles.progressStatus, { color: getScoreColor(userScore) }]}>
              {getScoreStatus(userScore)}
            </Text>
          </View>
          
          {test.type === 'SHUTTLE_RUN' && userLevel && (
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Level</Text>
              <Text style={[styles.progressValue, { color: Colors.primary }]}>
                {userLevel.toFixed(1)}
              </Text>
              <Text style={styles.progressStatus}>Reached</Text>
            </View>
          )}
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Target</Text>
            <Text style={styles.progressValue}>
              {formatScore(test.passingScore)}
            </Text>
            <Text style={styles.progressStatus}>Required</Text>
          </View>
        </View>
        
        {lastAttempt && (
          <View style={styles.lastAttemptContainer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.lastAttemptText}>
              Last attempt: {new Date(lastAttempt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionSection}>
        <View style={styles.actionContent}>
          <View style={styles.actionIcon}>
            {userScore && userScore >= (test.passingScore || 0) ? (
              <Award size={16} color={Colors.success} />
            ) : (
              <TrendingUp size={16} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.actionText}>
            {userScore && userScore >= (test.passingScore || 0) 
              ? 'Retake Test' 
              : 'Start Test'
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressSection: {
    backgroundColor: Colors.gray['100'],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 1,
  },
  progressStatus: {
    fontSize: 8,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  lastAttemptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastAttemptText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary + '10',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
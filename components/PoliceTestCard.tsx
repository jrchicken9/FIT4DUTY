import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Shield,
  Clock,
  Target,
  TrendingUp,
  ChevronRight,
  Award,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PoliceTest } from '@/constants/workouts';
import { router } from 'expo-router';

interface PoliceTestCardProps {
  test: PoliceTest;
  userScore?: number;
  userLevel?: number;
  lastAttempt?: string;
  testId?: string;
}

export default function PoliceTestCard({
  test,
  userScore,
  userLevel,
  lastAttempt,
  testId = 'police-test-card'
}: PoliceTestCardProps) {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID={testId}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {test.imageUrl ? (
            <Image source={{ uri: test.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Shield size={24} color={Colors.primary} />
            </View>
          )}
          <View style={styles.typeIndicator}>
            <Text style={styles.typeText}>{test.type.replace('_', ' ')}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {test.title}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{test.level}</Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {test.description}
          </Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{test.duration} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Target size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {test.components.length} component{test.components.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Score Section */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Your Best</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(userScore) }]}>
              {formatScore(userScore)}
            </Text>
            <Text style={[styles.scoreStatus, { color: getScoreColor(userScore) }]}>
              {getScoreStatus(userScore)}
            </Text>
          </View>
          
          {test.type === 'SHUTTLE_RUN' && userLevel && (
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Level Reached</Text>
              <Text style={[styles.scoreValue, { color: Colors.primary }]}>
                {userLevel.toFixed(1)}
              </Text>
            </View>
          )}
          
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Passing Score</Text>
            <Text style={styles.scoreValue}>
              {formatScore(test.passingScore)}
            </Text>
          </View>
        </View>
        
        {lastAttempt && (
          <View style={styles.lastAttemptRow}>
            <Text style={styles.lastAttemptText}>
              Last attempt: {new Date(lastAttempt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Action Section */}
      <View style={styles.actionSection}>
        <View style={styles.actionContent}>
          <View style={styles.actionIcon}>
            {userScore && userScore >= (test.passingScore || 0) ? (
              <Award size={20} color={Colors.success} />
            ) : (
              <TrendingUp size={20} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.actionText}>
            {userScore && userScore >= (test.passingScore || 0) 
              ? 'Retake Test' 
              : 'Start Test'
            }
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
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
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: Colors.gray['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    backgroundColor: Colors.gray['100'],
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scoreSection: {
    backgroundColor: Colors.gray['100'],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  scoreStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  lastAttemptRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastAttemptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
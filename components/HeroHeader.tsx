import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Target, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  Star,
  Award
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes, tapAnimation } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface HeroHeaderProps {
  displayName: string;
  applicationProgress: number;
  completedSteps: number;
  totalSteps: number;
  thisWeekWorkouts: number;
  currentStreak: number;
  onPressProfile?: () => void;
  onPressProgress?: () => void;
}

export default function HeroHeader({
  displayName,
  applicationProgress,
  completedSteps,
  totalSteps,
  thisWeekWorkouts,
  currentStreak,
  onPressProfile,
  onPressProgress,
}: HeroHeaderProps) {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (applicationProgress === 0) {
      return 'Ready to start your police career journey?';
    } else if (applicationProgress < 50) {
      return 'Great progress! Keep building momentum.';
    } else if (applicationProgress < 100) {
      return 'You\'re more than halfway there!';
    } else {
      return 'Outstanding! You\'re ready for the next phase.';
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Hero Card */}
      <LinearGradient
        colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
        style={styles.heroCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
          </View>
          
          {onPressProfile && (
            <Pressable 
              style={styles.profileButton} 
              onPress={onPressProfile}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View style={[styles.profileBadge, animatedStyle]}>
                <Award size={sizes.md} color={Colors.white} />
              </Animated.View>
            </Pressable>
          )}
        </View>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <Pressable 
            style={styles.progressCard}
            onPress={onPressProgress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[styles.progressContent, animatedStyle]}>
              <View style={styles.progressHeader}>
                <Target size={sizes.md} color={Colors.white} />
                <Text style={styles.progressTitle}>Application Progress</Text>
                <ChevronRight size={sizes.sm} color={Colors.white + '80'} />
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressValue}>{completedSteps}</Text>
                  <Text style={styles.progressLabel}>Steps Complete</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressStat}>
                  <Text style={styles.progressValue}>{totalSteps}</Text>
                  <Text style={styles.progressLabel}>Total Steps</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressStat}>
                  <Text style={styles.progressValue}>{Math.round(applicationProgress)}%</Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${applicationProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Activity size={sizes.sm} color={Colors.white + '80'} />
            <Text style={styles.statValue}>{thisWeekWorkouts}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={sizes.sm} color={Colors.white + '80'} />
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Star size={sizes.sm} color={Colors.white + '80'} />
            <Text style={styles.statValue}>
              {applicationProgress >= 100 ? 'Ready' : 'In Progress'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.level8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    ...typography.bodyLarge,
    color: Colors.white + 'CC',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.displaySmall,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  motivationalMessage: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileBadge: {
    width: sizes.xxl,
    height: sizes.xxl,
    borderRadius: sizes.xxl / 2,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.normal,
    borderColor: Colors.white + '30',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressCard: {
    backgroundColor: Colors.white + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white + '20',
  },
  progressContent: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    marginLeft: spacing.sm,
    flex: 1,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '800',
  },
  progressLabel: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    marginTop: spacing.xs,
  },
  progressDivider: {
    width: strokeWidth.thin,
    height: 32,
    backgroundColor: Colors.white + '20',
    marginHorizontal: spacing.sm,
  },
  progressBarContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.white + '20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white + '10',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white + '20',
  },
  statValue: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

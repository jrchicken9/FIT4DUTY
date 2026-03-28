import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Target, 
  Dumbbell, 
  Users, 
  User,
  TrendingUp,
  Award,
  Star,
  Activity,
  Clock,
  CheckCircle,
  MessageCircle,
  ThumbsUp,
  Calendar,
  BookOpen,
  Zap
} from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface TabSpecificHeaderProps {
  tab: 'dashboard' | 'application' | 'fitness' | 'community' | 'profile';
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

const ProfileButton = ({ user, onPress }: { user: any; onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.profileButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.profileButtonContent, animatedStyle]}>
        <Image
          source={{
            uri: user?.avatar_url || "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=100",
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileBadge}>
          <Star size={sizes.xs} color={Colors.white} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const ActionButton = ({ text, icon: Icon, onPress }: { text: string; icon: any; onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.actionButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.actionButtonContent, animatedStyle]}>
        <Text style={styles.actionButtonText}>{text}</Text>
        <Icon size={sizes.sm} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

export default function TabSpecificHeader({ tab, stats }: TabSpecificHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.full_name || "Future Officer";

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const renderDashboardHeader = () => (
    <LinearGradient
      colors={[Colors.tabBackgrounds.dashboard.start, Colors.tabBackgrounds.dashboard.end]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.dashboardContent}>
        <View style={styles.dashboardLeft}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>
              Good {getTimeOfDay()}, {displayName.split(' ')[0]} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>Ready to achieve your police career goals?</Text>
          </View>
          
          {stats && (
            <View style={styles.dashboardStats}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.dashboardStat}>
                  <View style={styles.statIconContainer}>
                    {stat.icon}
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <ProfileButton 
          user={user} 
          onPress={() => router.push('/(tabs)/profile')} 
        />
      </View>
    </LinearGradient>
  );

  const renderApplicationHeader = () => (
    <View style={styles.applicationContainer}>
      <View style={styles.applicationContent}>
        <View style={styles.applicationLeft}>
          <View style={styles.applicationIconContainer}>
            <Target size={sizes.xl} color={Colors.accent} />
            <View style={styles.applicationProgressRing}>
              <Text style={styles.progressText}>75%</Text>
            </View>
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicationTitle}>Application Progress</Text>
            <Text style={styles.applicationSubtitle}>Step-by-step guide to becoming a police officer</Text>
            {stats && (
              <View style={styles.applicationStats}>
                <View style={styles.applicationStat}>
                  <CheckCircle size={sizes.sm} color={Colors.success} />
                  <Text style={styles.applicationStatText}>6 of 8 steps complete</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <ActionButton 
          text="Continue" 
          icon={TrendingUp} 
          onPress={() => router.push('/application')} 
        />
      </View>
    </View>
  );

  const renderFitnessHeader = () => (
    <View style={styles.fitnessContainer}>
      <View style={styles.fitnessContent}>
        <View style={styles.fitnessLeft}>
          <View style={styles.fitnessIconContainer}>
            <Dumbbell size={sizes.xl} color={Colors.success} />
            <Activity size={sizes.sm} color={Colors.white} style={styles.fitnessOverlay} />
          </View>
          <View style={styles.fitnessInfo}>
            <Text style={styles.fitnessTitle}>Fitness & Training</Text>
            <Text style={styles.fitnessSubtitle}>Build strength and endurance for success</Text>
            {stats && (
              <View style={styles.fitnessStats}>
                <View style={styles.fitnessStat}>
                  <Clock size={sizes.xs} color={Colors.textSecondary} />
                  <Text style={styles.fitnessStatText}>Last workout: 2 days ago</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <ActionButton 
          text="Start Training" 
          icon={Zap} 
          onPress={() => router.push('/fitness')} 
        />
      </View>
    </View>
  );

  const renderCommunityHeader = () => (
    <View style={styles.communityContainer}>
      <View style={styles.communityContent}>
        <View style={styles.communityLeft}>
          <View style={styles.communityIconContainer}>
            <Users size={sizes.xl} color={Colors.warning} />
            <MessageCircle size={sizes.sm} color={Colors.white} style={styles.communityOverlay} />
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityTitle}>Community Hub</Text>
            <Text style={styles.communitySubtitle}>Connect with fellow applicants and officers</Text>
            {stats && (
              <View style={styles.communityStats}>
                <View style={styles.communityStat}>
                  <ThumbsUp size={sizes.xs} color={Colors.textSecondary} />
                  <Text style={styles.communityStatText}>Active discussions</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <ActionButton 
          text="Join Discussion" 
          icon={MessageCircle} 
          onPress={() => router.push('/community' as any)} 
        />
      </View>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileContent}>
        <View style={styles.profileLeft}>
          <View style={styles.profileIconContainer}>
            <User size={sizes.xl} color={Colors.primary} />
            <Award size={sizes.sm} color={Colors.white} style={styles.profileOverlay} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileTitle}>Profile & Settings</Text>
            <Text style={styles.profileSubtitle}>Manage your account and preferences</Text>
            {stats && (
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Star size={sizes.xs} color={Colors.textSecondary} />
                  <Text style={styles.profileStatText}>Profile complete</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <ActionButton 
          text="Edit Profile" 
          icon={User} 
          onPress={() => router.push('/profile')} 
        />
      </View>
    </View>
  );

  switch (tab) {
    case 'dashboard':
      return renderDashboardHeader();
    case 'application':
      return renderApplicationHeader();
    case 'fitness':
      return renderFitnessHeader();
    case 'community':
      return renderCommunityHeader();
    case 'profile':
      return renderProfileHeader();
    default:
      return renderDashboardHeader();
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.level4,
  },
  dashboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dashboardLeft: {
    flex: 1,
  },
  greetingSection: {
    marginBottom: spacing.md,
  },
  greetingText: {
    ...typography.headingMedium,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  greetingSubtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  dashboardStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dashboardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  statIconContainer: {
    width: sizes.md,
    height: sizes.md,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileButtonContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: sizes.xxl,
    height: sizes.xxl,
    borderRadius: sizes.xxl / 2,
    borderWidth: strokeWidth.normal,
    borderColor: Colors.white + '30',
  },
  profileBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.accent,
    borderRadius: borderRadius.full,
    width: sizes.sm,
    height: sizes.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white,
  },
  applicationContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.level4,
  },
  applicationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicationIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  applicationProgressRing: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.accent,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white,
  },
  progressText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '700',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  applicationSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  applicationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  applicationStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.level2,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  fitnessContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.level4,
  },
  fitnessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fitnessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fitnessIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  fitnessOverlay: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.success,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white,
  },
  fitnessInfo: {
    flex: 1,
  },
  fitnessTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  fitnessSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fitnessStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitnessStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fitnessStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
  communityContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.level4,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  communityOverlay: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.warning,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  communitySubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  communityStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
  profileContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.level4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  profileOverlay: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  profileSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
});




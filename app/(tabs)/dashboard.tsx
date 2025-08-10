import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { 
  ChevronRight, 
  Activity,
  Target,
  Dumbbell
} from "lucide-react-native";
import Colors from "@/constants/colors";
import ProgressCard from "@/components/ProgressCard";
import StatsOverview from "@/components/StatsOverview";
import ApplicationProgress from "@/components/ApplicationProgress";
import WorkoutCard from "@/components/WorkoutCard";
import { useAuth } from "@/context/AuthContext";
import { useApplication } from "@/context/ApplicationContext";

import workouts from "@/constants/workouts";

export default function DashboardScreen() {
  const { user: authUser } = useAuth();
  const { getProgressPercentage, getApplicationStepsWithProgress, getCompletedStepsCount } = useApplication();
  
  // Mock data for now - these would come from fitness context
  const fitnessProgress = {
    beepTestLevel: 5.2,
    pushPullWeight: 65,
    obstacleCourseTime: 180
  };
  const workoutLogs: any[] = [];
  
  // Use auth user name
  const displayName = authUser?.full_name || "Future Officer";

  const recentWorkouts = workouts.slice(0, 2);
  const applicationSteps = getApplicationStepsWithProgress();
  const applicationProgress = getProgressPercentage();
  const completedSteps = getCompletedStepsCount();
  
  // Calculate fitness stats
  const thisWeekWorkouts = workoutLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo && log.completed;
  }).length;
  
  const currentStreak = calculateCurrentStreak(workoutLogs);
  const weeklyGoal = 5; // Default weekly goal



  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.heroGreeting}>
              Hello, {displayName} 👋
            </Text>
            <Text style={styles.heroSubtitle}>Ready to achieve your police career goals?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=100",
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <StatsOverview
        totalWorkouts={thisWeekWorkouts}
        weeklyGoal={weeklyGoal}
        currentStreak={currentStreak}
        applicationProgress={applicationProgress}
      />

      {/* Top Fitness Metric */}
      <View style={styles.topMetricSection}>
        <ProgressCard
          title="Beep Test Level"
          subtitle="PREP requirement: 6.5"
          value={fitnessProgress.beepTestLevel.toFixed(1)}
          change={10}
          progress={(fitnessProgress.beepTestLevel / 6.5) * 100}
          icon={<Activity size={20} color={Colors.primary} />}
          testId="beep-test-progress"
          variant="large"
          onPress={() => router.push("/fitness")}
        />
      </View>

      {/* Application Progress */}
      <ApplicationProgress
        steps={applicationSteps.slice(0, 3).map(step => ({
          id: step.id,
          title: step.title,
          completed: step.completed,
          current: step.current,
        }))}
        completedSteps={completedSteps}
        totalSteps={applicationSteps.length}
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.modernSectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push("/fitness")}
            activeOpacity={0.8}
          >
            <Dumbbell size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Start Training</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push("/application")}
            activeOpacity={0.8}
          >
            <Target size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Application</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Workout */}
      <View style={styles.workoutsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.modernSectionTitle}>Today&apos;s Workout</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/fitness")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <WorkoutCard workout={recentWorkouts[0]} />
      </View>


    </ScrollView>
  );
}



const calculateCurrentStreak = (workoutLogs: any[]): number => {
  if (workoutLogs.length === 0) return 0;
  
  const sortedLogs = workoutLogs
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedLogs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCards: {
    gap: 12,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    textAlign: "center",
  },
  workoutsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  ctaSection: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 14,
    color: Colors.white + "CC",
    textAlign: "center",
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: Colors.white,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  premiumSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  upgradeBanner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 22,
  },
  upgradeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  heroHeader: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInfo: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  heroStats: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  heroStat: {
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 24,
  },
  heroStatLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  profileButton: {
    marginLeft: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  topMetricSection: {
    marginBottom: 20,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  modernSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 24,
  },
  ctaIcon: {
    marginBottom: 12,
  },
});
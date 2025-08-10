import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Target, Clock, Trophy } from "lucide-react-native";
import Colors from "@/constants/colors";

type StatsOverviewProps = {
  totalWorkouts: number;
  weeklyGoal: number;
  currentStreak: number;
  applicationProgress: number;
};

const StatsOverview = ({
  totalWorkouts,
  weeklyGoal,
  currentStreak,
  applicationProgress,
}: StatsOverviewProps) => {
  const stats = [
    {
      icon: <Target size={20} color={Colors.primary} />,
      label: "Weekly Goal",
      value: `${totalWorkouts}/${weeklyGoal}`,
      progress: (totalWorkouts / weeklyGoal) * 100,
    },
    {
      icon: <Clock size={20} color={Colors.secondary} />,
      label: "Current Streak",
      value: `${currentStreak} days`,
      progress: Math.min(100, (currentStreak / 30) * 100),
    },
    {
      icon: <Trophy size={20} color={Colors.accent} />,
      label: "Application",
      value: `${Math.round(applicationProgress)}%`,
      progress: applicationProgress,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Journey Progress</Text>
          <Text style={styles.subtitle}>Track your path to becoming a police officer</Text>
        </View>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=100",
          }}
          style={styles.badgeImage}
        />
      </View>
      
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              {stat.icon}
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, stat.progress)}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badgeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default StatsOverview;
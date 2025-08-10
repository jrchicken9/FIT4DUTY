import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Clock, Dumbbell, ChevronRight, Zap } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { Workout } from "@/constants/workouts";

type WorkoutCardProps = {
  workout: Workout;
  testId?: string;
};

const WorkoutCard = ({ workout, testId }: WorkoutCardProps) => {
  const handlePress = () => {
    router.push(`/workout/${workout.id}`);
  };

  const handleShuttleRunPress = (e: any) => {
    e.stopPropagation();
    router.push('/workout/shuttle-run');
  };

  const isShuttleRunWorkout = workout.exercises.some(ex => ex.name.toLowerCase().includes('shuttle run'));

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      testID={testId}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {workout.imageUrl ? (
          <Image
            source={{ uri: workout.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Dumbbell size={32} color={Colors.gray[400]} />
          </View>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{workout.level}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{workout.category}</Text>
        <Text style={styles.title}>{workout.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {workout.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{workout.duration} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Dumbbell size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {workout.exercises.length} exercises
              </Text>
            </View>
          </View>
          {isShuttleRunWorkout ? (
            <TouchableOpacity 
              style={styles.shuttleButton}
              onPress={handleShuttleRunPress}
            >
              <Zap size={14} color={Colors.white} />
              <Text style={styles.shuttleButtonText}>Test</Text>
            </TouchableOpacity>
          ) : (
            <ChevronRight size={16} color={Colors.primary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary + "CC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  content: {
    padding: 16,
  },
  category: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flexDirection: 'row',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  shuttleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  shuttleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default WorkoutCard;
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Pressable } from "react-native";
import { Clock, Dumbbell, ChevronRight, Zap } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes, tapAnimation } from "@/constants/designSystem";
import { useTapAnimation } from "@/hooks/useTapAnimation";
import type { Workout } from "@/constants/workouts";

type WorkoutCardProps = {
  workout: Workout;
  testId?: string;
};

const WorkoutCard = ({ workout, testId }: WorkoutCardProps) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const handlePress = () => {
    router.push(`/workout/${workout.id}`);
  };

  const handleShuttleRunPress = (e: any) => {
    e.stopPropagation();
    router.push('/workout/shuttle-run');
  };

  const isShuttleRunWorkout = workout.exercises.some(ex => ex.name.toLowerCase().includes('shuttle run'));

  return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.8 }
        ]}
        testID={testId}
      >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <View style={styles.imageContainer}>
          {workout.imageUrl ? (
            <Image
              source={{ uri: workout.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Dumbbell size={sizes.lg} color={Colors.gray[400]} />
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
                <Clock size={sizes.sm} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{workout.duration} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Dumbbell size={sizes.sm} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {workout.exercises.length} exercises
                </Text>
              </View>
            </View>
            {isShuttleRunWorkout ? (
              <Pressable 
                style={styles.shuttleButton}
                onPress={handleShuttleRunPress}
              >
                <Zap size={sizes.xs} color={Colors.white} />
                <Text style={styles.shuttleButtonText}>Test</Text>
              </Pressable>
            ) : (
              <ChevronRight size={sizes.sm} color={Colors.primary} />
            )}
          </View>
        </View>
      </Animated.View>
      </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.level4,
    overflow: "hidden",
  },
  touchableContent: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
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
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: Colors.primary + "E6",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.white + "40",
  },
  levelText: {
    color: Colors.white,
    ...typography.labelSmall,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  content: {
    padding: spacing.md,
  },
  category: {
    color: Colors.secondary,
    ...typography.labelMedium,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
  },
  infoText: {
    marginLeft: spacing.xs,
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  shuttleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  shuttleButtonText: {
    ...typography.labelSmall,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default WorkoutCard;
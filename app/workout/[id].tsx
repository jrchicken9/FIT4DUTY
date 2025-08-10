import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Clock,
  Dumbbell,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import workouts from "@/constants/workouts";
// import { useUser } from "@/context/UserContext"; // Removed - not available

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Mock function for now
  const logWorkout = () => {};
  const [isStarting, setIsStarting] = useState(false);

  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Workout not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleStartWorkout = () => {
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      router.push(`/workout/session/${workout.id}`);
    }, 1000);
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/exercise/${exerciseId}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
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
            <Dumbbell size={48} color={Colors.gray[400]} />
          </View>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{workout.level}</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.category}>{workout.category}</Text>
        <Text style={styles.title}>{workout.title}</Text>
        <Text style={styles.description}>{workout.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.statText}>{workout.duration} min</Text>
          </View>
          <View style={styles.statItem}>
            <Dumbbell size={20} color={Colors.primary} />
            <Text style={styles.statText}>
              {workout.exercises.length} exercises
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.exercisesContainer}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseItem}
            onPress={() => handleExercisePress(exercise.id)}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets • {exercise.reps} reps • {exercise.restTime}s
                rest
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.startContainer}>
        <Button
          title="Start Workout"
          onPress={handleStartWorkout}
          loading={isStarting}
          style={styles.startButton}
          testId="start-workout-button"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
    color: Colors.text,
  },
  imageContainer: {
    position: "relative",
    height: 200,
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
    top: 16,
    right: 16,
    backgroundColor: Colors.primary + "CC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  category: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  statText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  exercisesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  startContainer: {
    padding: 16,
  },
  startButton: {
    backgroundColor: Colors.accent,
  },
});
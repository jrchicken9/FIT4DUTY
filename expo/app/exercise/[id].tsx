import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Play, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import workouts from "@/constants/workouts";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find the exercise in all workouts
  let exercise;
  let parentWorkout;

  for (const workout of workouts) {
    const found = workout.exercises.find((ex) => ex.id === id);
    if (found) {
      exercise = found;
      parentWorkout = workout;
      break;
    }
  }

  if (!exercise) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Exercise not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleWatchVideo = () => {
    if (exercise?.videoUrl) {
      router.push(`/video/${exercise.id}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        {exercise.imageUrl ? (
          <Image
            source={{ uri: exercise.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Info size={48} color={Colors.gray[400]} />
          </View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        {exercise.videoUrl && (
          <TouchableOpacity
            style={styles.videoButton}
            onPress={handleWatchVideo}
          >
            <Play size={24} color={Colors.white} />
            <Text style={styles.videoButtonText}>Watch Video</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.subtitle}>
          Part of {parentWorkout?.title} workout
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>{exercise.sets}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={styles.statValue}>{exercise.reps}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rest</Text>
            <Text style={styles.statValue}>{exercise.restTime}s</Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{exercise.description}</Text>
      </View>

      {exercise.tips && exercise.tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Tips</Text>
          {exercise.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Text style={styles.tipBulletText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.musclesContainer}>
        <Text style={styles.sectionTitle}>Target Muscles</Text>
        <View style={styles.musclesList}>
          {exercise.targetMuscles.map((muscle, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{muscle}</Text>
            </View>
          ))}
        </View>
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
    height: 250,
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
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black + "80",
    justifyContent: "center",
    alignItems: "center",
  },
  videoButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent + "CC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  videoButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 8,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  tipBulletText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  musclesContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  musclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  muscleTag: {
    backgroundColor: Colors.secondary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleTagText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
});
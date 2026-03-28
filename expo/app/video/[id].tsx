import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Play } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import workouts from "@/constants/workouts";

const { width } = Dimensions.get("window");

export default function VideoTutorialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handlePlayVideo = () => {
    setIsPlaying(true);
    // In a real app, this would play the video
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: exercise.imageUrl || "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000" }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        {!isPlaying && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayVideo}
          >
            <Play size={40} color={Colors.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name} - Tutorial</Text>
        <Text style={styles.subtitle}>
          Part of {parentWorkout?.title} workout
        </Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>How to Perform</Text>
        <Text style={styles.description}>{exercise.description}</Text>
      </View>

      {exercise.tips && exercise.tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Key Points</Text>
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

      <Button
        title="Return to Exercise"
        onPress={() => router.back()}
        variant="outline"
        style={styles.returnButton}
      />
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
  videoContainer: {
    position: "relative",
    height: width * 0.6, // 16:9 aspect ratio
    backgroundColor: Colors.black,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black + "40",
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
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
  returnButton: {
    marginHorizontal: 16,
  },
});
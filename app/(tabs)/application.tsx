import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import ApplicationStepCard from "@/components/ApplicationStepCard";
import Button from "@/components/Button";
import { useApplication } from "@/context/ApplicationContext";

export default function ApplicationScreen() {
  const {
    getApplicationStepsWithProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    markStepCompleted,
    markStepIncomplete,
    isLoading,
    isSaving,
  } = useApplication();

  const stepsWithProgress = getApplicationStepsWithProgress();
  const completedStepsCount = getCompletedStepsCount();
  const progressPercentage = getProgressPercentage();

  const markAsCompleted = (stepId: string) => {
    markStepCompleted(stepId);
  };

  const resetStep = async (stepId: string) => {
    await markStepIncomplete(stepId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading application progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Application Process</Text>
        <Text style={styles.subtitle}>
          Follow these steps to become an Ontario police officer
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Info size={20} color={Colors.white} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Application Progress</Text>
          <Text style={styles.infoText}>
            {completedStepsCount} of {stepsWithProgress.length} steps completed ({Math.round(progressPercentage)}%)
          </Text>
          <Text style={styles.infoSubtext}>
            The entire process typically takes 6-12 months from start to finish.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.stepsContainer}
        contentContainerStyle={styles.stepsList}
        showsVerticalScrollIndicator={false}
      >
        {stepsWithProgress.map((step) => (
          <View key={step.id} style={styles.stepItem}>
            <ApplicationStepCard
              step={step}
              isCompleted={step.completed}
              isCurrent={step.current}
            />
            <View style={styles.buttonContainer}>
              {!step.completed && (
                <Button
                  title={isSaving ? "Saving..." : "Mark as Completed"}
                  onPress={() => markAsCompleted(step.id)}
                  style={styles.completeButton}
                  size="small"
                  disabled={isSaving}
                />
              )}
              {step.completed && (
                <Button
                  title={isSaving ? "Saving..." : "Mark as Incomplete"}
                  onPress={() => resetStep(step.id)}
                  variant="outline"
                  style={styles.resetButton}
                  size="small"
                  disabled={isSaving}
                />
              )}
            </View>
          </View>
        ))}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.primary + "15",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  stepsContainer: {
    flex: 1,
  },
  stepsList: {
    padding: 16,
    paddingTop: 0,
  },
  stepItem: {
    marginBottom: 16,
  },
  completeButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  resetButton: {
    backgroundColor: Colors.gray[100],
  },
});
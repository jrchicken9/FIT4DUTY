import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { router } from "expo-router";

type ApplicationStep = {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
};

type ApplicationProgressProps = {
  steps: ApplicationStep[];
  completedSteps: number;
  totalSteps: number;
};

const ApplicationProgress = ({
  steps,
  completedSteps,
  totalSteps,
}: ApplicationProgressProps) => {
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleStepPress = (stepId: string) => {
    router.push(`/application/${stepId}`);
  };

  const handleViewAll = () => {
    router.push("/application");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Application Progress</Text>
          <Text style={styles.subtitle}>
            {completedSteps} of {totalSteps} steps completed
          </Text>
        </View>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <ArrowRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
      </View>

      <View style={styles.stepsContainer}>
        {steps.slice(0, 3).map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={styles.stepItem}
            onPress={() => handleStepPress(step.id)}
            activeOpacity={0.7}
          >
            <View style={styles.stepIcon}>
              {step.completed ? (
                <CheckCircle size={20} color={Colors.success} />
              ) : step.current ? (
                <Clock size={20} color={Colors.primary} />
              ) : (
                <Circle size={20} color={Colors.gray[400]} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                step.completed && styles.completedStepTitle,
                step.current && styles.currentStepTitle,
              ]}>
                {step.title}
              </Text>
              <Text style={styles.stepStatus}>
                {step.completed ? "Completed" : step.current ? "In Progress" : "Pending"}
              </Text>
            </View>
            <ArrowRight size={16} color={Colors.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    minWidth: 40,
    textAlign: "right",
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  stepIcon: {
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    lineHeight: 20,
  },
  completedStepTitle: {
    color: Colors.success,
  },
  currentStepTitle: {
    color: Colors.primary,
  },
  stepStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default ApplicationProgress;
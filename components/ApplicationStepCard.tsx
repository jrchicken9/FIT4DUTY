import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronRight, Clock } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { ApplicationStep } from "@/constants/applicationSteps";

type ApplicationStepCardProps = {
  step: ApplicationStep;
  isCompleted?: boolean;
  isCurrent?: boolean;
  testId?: string;
};

const ApplicationStepCard = ({
  step,
  isCompleted = false,
  isCurrent = false,
  testId,
}: ApplicationStepCardProps) => {
  const handlePress = () => {
    router.push(`/application/${step.id}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted && styles.completedCard,
        isCurrent && styles.currentCard,
      ]}
      onPress={handlePress}
      testID={testId}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{step.title}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>Current</Text>
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {step.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{step.estimatedTime}</Text>
          </View>
          <ChevronRight size={16} color={Colors.primary} />
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
    borderLeftWidth: 4,
    borderLeftColor: Colors.gray[300],
  },
  completedCard: {
    borderLeftColor: Colors.success,
  },
  currentCard: {
    borderLeftColor: Colors.accent,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  completedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "bold",
  },
  currentBadge: {
    backgroundColor: Colors.accent + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  currentText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "bold",
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default ApplicationStepCard;
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronRight, Clock, CheckCircle, Target, BookOpen, Users, Shield, FileText, Dumbbell, Calendar } from "lucide-react-native";
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
    // Handle LFI special routing
    if (step.id === 'lfi-interview') {
      router.push('/application/lfi');
    } else {
      router.push(`/application/${step.id}`);
    }
  };

  // Get step-specific content based on what's actually implemented
  const getStepContent = () => {
    switch (step.id) {
      case 'prerequisites':
        return {
          icon: <Shield size={24} color={Colors.primary} />,
          features: ['Interactive Checklist', 'Progress Tracking', 'Requirements Guide'],
          highlight: '12 Requirements',
          color: Colors.success
        };
      case 'pre-application-prep':
        return {
          icon: <FileText size={24} color={Colors.primary} />,
          features: ['Resume Builder', 'Profile Sections', 'Education & Work History'],
          highlight: 'Profile Builder',
          color: Colors.primary
        };
      case 'oacp':
        return {
          icon: <Target size={24} color={Colors.primary} />,
          features: ['Sample Test (50 Qs)', 'Daily Quiz (5 Qs)', 'Practice Hub'],
          highlight: 'Test Practice',
          color: Colors.accent
        };
      case 'application':
        return {
          icon: <Users size={24} color={Colors.primary} />,
          features: ['Police Service Selection', 'Application Links', 'Requirements Guide'],
          highlight: 'Service Selection',
          color: Colors.secondary
        };
      case 'prep-fitness-test':
        return {
          icon: <Target size={24} color={Colors.primary} />,
          features: ['PREP Test Guide', 'Training Plans', 'Fitness Tab Access'],
          highlight: 'Fitness Training',
          color: Colors.accent
        };
      case 'lfi-interview':
        return {
          icon: <Users size={24} color={Colors.primary} />,
          features: ['Practice Questions', 'Community Knowledge', 'Personal Motivation', 'Situational Ethics'],
          highlight: 'Interview Prep',
          color: Colors.secondary
        };
      default:
        return {
          icon: <BookOpen size={24} color={Colors.primary} />,
          features: ['Step Guide', 'Requirements', 'Resources'],
          highlight: 'Step Guide',
          color: Colors.primary
        };
    }
  };

  const stepContent = getStepContent();

  return (
      <TouchableOpacity
        onPress={handlePress}
        testID={testId}
        activeOpacity={0.7}
        style={[
          styles.card,
          isCompleted && styles.completedCard,
          isCurrent && styles.currentCard,
        ]}
      >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              {stepContent.icon}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.highlight}>{stepContent.highlight}</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.completedText}>Done</Text>
              </View>
            )}
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Current</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {step.description}
        </Text>

        <View style={styles.featuresContainer}>
          {stepContent.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: stepContent.color }]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{step.estimatedTime}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.exploreText}>Explore</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </View>
        </View>
      </View>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  touchableContent: {
    flex: 1,
  },
  completedCard: {
    borderLeftColor: Colors.success,
    backgroundColor: Colors.surface,
  },
  currentCard: {
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  highlight: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  badgeContainer: {
    alignItems: "flex-end",
  },
  completedBadge: {
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "600",
  },
  currentBadge: {
    backgroundColor: Colors.accent + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
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
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exploreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default ApplicationStepCard;
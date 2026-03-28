import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from "@/constants/designSystem";
import { useTapAnimation } from "@/hooks/useTapAnimation";
import type { FAQ } from "@/constants/faqs";

type FAQItemProps = {
  faq: FAQ;
  testId?: string;
};

const FAQItem = ({ faq, testId }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container} testID={testId}>
      <Pressable
        style={styles.questionContainer}
        onPress={toggleExpanded}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{faq.category}</Text>
          </View>
          <Text style={styles.question}>{faq.question}</Text>
          {expanded ? (
            <ChevronUp size={sizes.md} color={Colors.primary} />
          ) : (
            <ChevronDown size={sizes.md} color={Colors.primary} />
          )}
        </Animated.View>
      </Pressable>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    ...shadows.level2,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  animatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  categoryText: {
    color: Colors.primary,
    ...typography.labelSmall,
    fontWeight: "bold",
  },
  question: {
    flex: 1,
    ...typography.labelLarge,
    color: Colors.text,
    marginRight: spacing.sm,
  },
  answerContainer: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: Colors.gray[100],
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  answer: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
});

export default FAQItem;
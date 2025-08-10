import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import Colors from "@/constants/colors";
import type { FAQ } from "@/constants/faqs";

type FAQItemProps = {
  faq: FAQ;
  testId?: string;
};

const FAQItem = ({ faq, testId }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container} testID={testId}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{faq.category}</Text>
        </View>
        <Text style={styles.question}>{faq.question}</Text>
        {expanded ? (
          <ChevronUp size={20} color={Colors.primary} />
        ) : (
          <ChevronDown size={20} color={Colors.primary} />
        )}
      </TouchableOpacity>
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
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginRight: 8,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: Colors.gray[100],
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  answer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default FAQItem;
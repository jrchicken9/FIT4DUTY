import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TrendingUp, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

type ProgressCardProps = {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  change?: number;
  testId?: string;
  onPress?: () => void;
  progress?: number; // 0-100
  subtitle?: string;
  variant?: 'default' | 'large' | 'compact';
};

const ProgressCard = ({
  title,
  value,
  unit,
  icon,
  change,
  testId,
  onPress,
  progress,
  subtitle,
  variant = 'default',
}: ProgressCardProps) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[
        styles.card, 
        variant === 'large' && styles.largeCard,
        variant === 'compact' && styles.compactCard
      ]} 
      testID={testId}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            variant === 'large' && styles.largeTitleText
          ]}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          {icon || <TrendingUp size={variant === 'large' ? 24 : 20} color={Colors.primary} />}
          {onPress && <ChevronRight size={16} color={Colors.gray[400]} style={styles.chevron} />}
        </View>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[
          styles.value,
          variant === 'large' && styles.largeValue
        ]}>
          {value}
          {unit && <Text style={styles.unit}> {unit}</Text>}
        </Text>
        
        <View style={styles.metaContainer}>
          {change !== undefined && (
            <View
              style={[
                styles.changeContainer,
                {
                  backgroundColor:
                    change > 0
                      ? Colors.success + "20"
                      : change < 0
                      ? Colors.error + "20"
                      : Colors.gray[200],
                },
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      change > 0
                        ? Colors.success
                        : change < 0
                        ? Colors.error
                        : Colors.gray[600],
                  },
                ]}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, Math.max(0, progress))}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  largeCard: {
    padding: 24,
    marginVertical: 12,
  },
  compactCard: {
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
    lineHeight: 20,
  },
  largeTitleText: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 2,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 32,
  },
  largeValue: {
    fontSize: 32,
    lineHeight: 36,
  },
  unit: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    minWidth: 35,
    textAlign: "right",
  },
});

export default ProgressCard;
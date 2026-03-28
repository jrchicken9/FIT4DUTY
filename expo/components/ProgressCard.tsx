import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from "react-native";
import { TrendingUp, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from "@/constants/designSystem";
import { useTapAnimation } from "@/hooks/useTapAnimation";

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
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    if (variant === 'large') {
      baseStyle.push(styles.largeCard);
    } else if (variant === 'compact') {
      baseStyle.push(styles.compactCard);
    }
    
    return baseStyle;
  };

  const getIconSize = () => {
    switch (variant) {
      case 'large':
        return sizes.lg;
      case 'compact':
        return sizes.sm;
      default:
        return sizes.md;
    }
  };

  if (!onPress) {
    return (
      <View style={getCardStyle()} testID={testId}>
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
            {icon || <TrendingUp size={getIconSize()} color={Colors.primary} />}
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
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        getCardStyle(),
        pressed && { opacity: 0.8 }
      ]}
      testID={testId}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
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
            {icon || <TrendingUp size={getIconSize()} color={Colors.primary} />}
            <ChevronRight size={sizes.sm} color={Colors.gray[400]} style={styles.chevron} />
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
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    ...shadows.level4,
  },
  animatedContainer: {
    flex: 1,
  },
  largeCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg + spacing.xs,
    marginVertical: spacing.sm + spacing.xs,
    ...shadows.level4,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.gray[100],
  },
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.level4,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.gray[100],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.labelLarge,
    color: Colors.textSecondary,
  },
  largeTitleText: {
    ...typography.headingSmall,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.gray[500],
    marginTop: spacing.xs,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.displaySmall,
    color: Colors.text,
  },
  largeValue: {
    ...typography.displayMedium,
  },
  unit: {
    ...typography.headingSmall,
    color: Colors.textSecondary,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  changeText: {
    ...typography.labelMedium,
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.labelMedium,
    color: Colors.textSecondary,
    minWidth: 35,
    textAlign: "right",
  },
});

export default ProgressCard;
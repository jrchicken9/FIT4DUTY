import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, premiumStyles } from '@/constants/designSystem';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  variant?: 'bar' | 'ring' | 'premium';
  colors?: [string, string];
  showPercentage?: boolean;
  animated?: boolean;
  testId?: string;
  onPress?: () => void;
}

export default function AnimatedProgressBar({
  progress,
  size = 120,
  strokeWidth = 8,
  title,
  subtitle,
  variant = 'bar',
  colors = [Colors.gradients.primary.start, Colors.gradients.primary.end],
  showPercentage = true,
  animated = true,
  testId,
  onPress,
}: AnimatedProgressBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  if (variant === 'ring' || variant === 'premium') {
    return (
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgLinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={colors[0]} />
              <Stop offset="100%" stopColor={colors[1]} />
            </SvgLinearGradient>
          </Defs>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.gray[200]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset as any}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* Center Content */}
        <View style={styles.ringContent}>
          {showPercentage && (
            <Text style={[styles.ringPercentage, { fontSize: size * 0.2 }]}>
              {Math.round(progress)}%
            </Text>
          )}
          {title && (
            <Text style={[styles.ringTitle, { fontSize: size * 0.12 }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.ringSubtitle, { fontSize: size * 0.1 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Default bar variant
  return (
    <View style={styles.barContainer}>
      {title && <Text style={styles.barTitle}>{title}</Text>}
      <View style={styles.barWrapper}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <ExpoLinearGradient
              colors={colors}
              style={styles.barGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        {showPercentage && (
          <Text style={styles.barPercentage}>{Math.round(progress)}%</Text>
        )}
      </View>
      {subtitle && <Text style={styles.barSubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    ...typography.headingLarge,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
  },
  ringTitle: {
    ...typography.labelMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ringSubtitle: {
    ...typography.labelSmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  barContainer: {
    marginBottom: spacing.sm,
  },
  barTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barGradient: {
    flex: 1,
  },
  barPercentage: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  barSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
});

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Star, Lock, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes, tapAnimation, premiumStyles } from '@/constants/designSystem';

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'heavy' | 'gradient' | 'premium' | 'locked';
  gradientColors?: [string, string];
  onPress?: () => void;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showChevron?: boolean;
  premium?: boolean;
  locked?: boolean;
  badge?: string;
  badgeColor?: string;
}

export default function EnhancedCard({
  children,
  variant = 'default',
  gradientColors,
  onPress,
  style,
  title,
  subtitle,
  icon,
  showChevron = false,
  premium = false,
  locked = false,
  badge,
  badgeColor = Colors.accent,
}: EnhancedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    
    Animated.timing(scaleAnim, {
      toValue: tapAnimation.scale,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevated, style];
      case 'heavy':
        return [styles.card, styles.heavy, style];
      case 'gradient':
        return [styles.card, styles.gradient, style];
      case 'premium':
        return [styles.card, styles.premium, style];
      case 'locked':
        return [styles.card, styles.locked, style];
      default:
        return [styles.card, style];
    }
  };

  const getGradientColors = (): [string, string] => {
    if (gradientColors) return gradientColors;
    
    switch (variant) {
      case 'premium':
        return [Colors.gradients.premium.start, Colors.gradients.premium.end];
      case 'gradient':
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
      default:
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
    }
  };

  const renderCardContent = () => {
    if (variant === 'gradient' || variant === 'premium') {
      return (
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderHeader()}
          {children}
        </LinearGradient>
      );
    }

    return (
      <>
        {renderHeader()}
        {children}
      </>
    );
  };

  const renderHeader = () => {
    if (!title && !subtitle && !icon && !premium && !locked && !badge) {
      return null;
    }

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.headerContent}>
            {title && (
              <Text style={[
                styles.title,
                variant === 'gradient' || variant === 'premium' ? styles.titleLight : styles.titleDark
              ]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[
                styles.subtitle,
                variant === 'gradient' || variant === 'premium' ? styles.subtitleLight : styles.subtitleDark
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.headerRight}>
          {premium && (
            <View style={styles.premiumBadge}>
              <Crown size={sizes.sm} color={Colors.white} />
            </View>
          )}
          {locked && (
            <View style={styles.lockedBadge}>
              <Lock size={sizes.sm} color={Colors.white} />
            </View>
          )}
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
          {showChevron && (
            <ChevronRight 
              size={sizes.sm} 
              color={variant === 'gradient' || variant === 'premium' ? Colors.white + '80' : Colors.textSecondary} 
            />
          )}
        </View>
      </View>
    );
  };

  const cardStyle = getCardStyle();

  if (!onPress) {
    return (
      <View style={cardStyle}>
        {renderCardContent()}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        cardStyle,
        pressed && { opacity: 0.8 }
      ]}
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {renderCardContent()}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  elevated: {
    ...shadows.level4,
  },
  heavy: {
    ...shadows.level8,
  },
  gradient: {
    ...shadows.level4,
  },
  premium: {
    ...shadows.level8,
    borderWidth: strokeWidth.normal,
    borderColor: Colors.premium.accent + '20',
  },
  locked: {
    ...shadows.level2,
    opacity: 0.7,
  },
  animatedContainer: {
    flex: 1,
  },
  gradientContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headingMedium,
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: Colors.text,
  },
  titleLight: {
    color: Colors.white,
  },
  subtitle: {
    ...typography.bodyMedium,
  },
  subtitleDark: {
    color: Colors.textSecondary,
  },
  subtitleLight: {
    color: Colors.white + 'CC',
  },
  premiumBadge: {
    backgroundColor: Colors.premium.accent,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    backgroundColor: Colors.textSecondary,
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
});

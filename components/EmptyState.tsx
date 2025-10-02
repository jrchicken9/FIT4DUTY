import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { 
  Target, 
  Dumbbell, 
  Users, 
  Calendar, 
  BookOpen,
  Star,
  TrendingUp,
  Award
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import EnhancedCard from './EnhancedCard';

interface EmptyStateProps {
  type: 'bookings' | 'workouts' | 'community' | 'application' | 'tests' | 'general';
  title?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  showIllustration?: boolean;
}

const ActionButton = ({ text, onPress }: { text: string; onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.actionButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.actionButtonContent, animatedStyle]}>
        <Text style={styles.actionButtonText}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function EmptyState({
  type,
  title,
  subtitle,
  actionText,
  onAction,
  showIllustration = true,
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'bookings':
        return {
          title: 'No Bookings Yet',
          subtitle: 'Book your first practice session to start preparing for your tests',
          actionText: 'Browse Sessions',
          icon: <Calendar size={sizes.xxxl} color={Colors.primary} />,
        };
      case 'workouts':
        return {
          title: 'Start Your Training',
          subtitle: 'Begin your fitness journey with our comprehensive training plans',
          actionText: 'View Plans',
          icon: <Dumbbell size={sizes.xxxl} color={Colors.success} />,
        };
      case 'community':
        return {
          title: 'Join the Community',
          subtitle: 'Connect with fellow applicants and experienced officers',
          actionText: 'Explore Community',
          icon: <Users size={sizes.xxxl} color={Colors.warning} />,
        };
      case 'application':
        return {
          title: 'Begin Your Application',
          subtitle: 'Start your police application journey step by step',
          actionText: 'Start Application',
          icon: <Target size={sizes.xxxl} color={Colors.accent} />,
        };
      case 'tests':
        return {
          title: 'Take Your First Test',
          subtitle: 'Practice with our digital tests to improve your skills',
          actionText: 'Start Testing',
          icon: <BookOpen size={sizes.xxxl} color={Colors.features.digitalTest} />,
        };
      default:
        return {
          title: 'Get Started',
          subtitle: 'Begin your journey toward becoming a police officer',
          actionText: 'Get Started',
          icon: <Star size={sizes.xxxl} color={Colors.primary} />,
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displaySubtitle = subtitle || defaultContent.subtitle;
  const displayActionText = actionText || defaultContent.actionText;

  const getMotivationalQuote = () => {
    const quotes = [
      "Every expert was once a beginner.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Your future self is watching you right now through memories.",
      "The journey of a thousand miles begins with one step.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <EnhancedCard variant="elevated" style={styles.container}>
      {showIllustration && (
        <View style={styles.illustrationContainer}>
          {defaultContent.icon}
          <View style={styles.illustrationDecoration}>
            <TrendingUp size={sizes.sm} color={Colors.primary} />
          </View>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
        
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>"{getMotivationalQuote()}"</Text>
          <Award size={sizes.xs} color={Colors.textSecondary} />
        </View>
      </View>

      {onAction && (
        <ActionButton text={displayActionText} onPress={onAction} />
      )}
    </EnhancedCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  illustrationDecoration: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    backgroundColor: Colors.primary + '20',
    borderRadius: borderRadius.full,
    width: sizes.md,
    height: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  quote: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minWidth: 120,
    alignItems: 'center',
    ...shadows.level2,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
});

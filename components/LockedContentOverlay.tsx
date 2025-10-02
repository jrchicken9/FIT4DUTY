import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Star, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { useSubscription } from '../context/SubscriptionContext';

interface LockedContentOverlayProps {
  children: React.ReactNode;
  feature: 'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general';
  onUpgrade: () => void;
  showPreview?: boolean;
  previewText?: string;
}

const { width, height } = Dimensions.get('window');

const UpgradeButton = ({ onUpgrade }: { onUpgrade: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.upgradeButton} 
      onPress={onUpgrade}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.upgradeButtonContent, animatedStyle]}>
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function LockedContentOverlay({ children }: LockedContentOverlayProps) {
  // Monetization overlay disabled; just render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: sizes.xxxl,
    height: sizes.xxxl,
    borderRadius: sizes.xxxl / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  description: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  previewText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.level2,
  },
  upgradeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  pricingText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
});

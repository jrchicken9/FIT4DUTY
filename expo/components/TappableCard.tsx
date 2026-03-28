import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ViewStyle, 
  Animated,
  Pressable 
} from 'react-native';
import { tapAnimation, shadows, borderRadius, spacing, theme } from '@/constants/designSystem';

interface TappableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'level2' | 'level4' | 'level8';
  disabled?: boolean;
  testId?: string;
}

export default function TappableCard({
  children,
  onPress,
  style,
  elevation = 'level2',
  disabled = false,
  testId,
}: TappableCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.timing(scaleAnim, {
      toValue: tapAnimation.scale,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const getElevationStyle = () => {
    switch (elevation) {
      case 'level4':
        return shadows.level4;
      case 'level8':
        return shadows.level8;
      default:
        return shadows.level2;
    }
  };

  const cardStyle = [
    styles.card,
    getElevationStyle(),
    style,
  ];

  if (!onPress) {
    return (
      <View style={cardStyle} testID={testId}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }) => [
        cardStyle,
        pressed && { opacity: disabled ? 1 : 0.8 }
      ]}
      testID={testId}
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  animatedContainer: {
    flex: 1,
  },
});













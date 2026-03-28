import { useRef } from 'react';
import { Animated } from 'react-native';
import { tapAnimation } from '@/constants/designSystem';

interface UseTapAnimationReturn {
  scaleAnim: Animated.Value;
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: {
    transform: Array<{ scale: Animated.Value }>;
  };
}

export const useTapAnimation = (disabled: boolean = false): UseTapAnimationReturn => {
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

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};













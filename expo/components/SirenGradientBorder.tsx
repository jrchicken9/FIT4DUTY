import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface SirenGradientBorderProps {
  children: React.ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'siren' | 'sirenReverse' | 'sirenBorder';
  startColor?: string;
  endColor?: string;
}

export default function SirenGradientBorder({
  children,
  borderWidth = 0.5,
  borderRadius = 12,
  style,
  variant = 'sirenBorder',
  startColor,
  endColor,
}: SirenGradientBorderProps) {
  const getGradientColors = (): [string, string] => {
    if (startColor && endColor) {
      return [startColor, endColor];
    }
    
    switch (variant) {
      case 'siren':
        return [Colors.gradients.siren.start, Colors.gradients.siren.end];
      case 'sirenReverse':
        return [Colors.gradients.sirenReverse.start, Colors.gradients.sirenReverse.end];
      case 'sirenBorder':
      default:
        return [Colors.gradients.sirenBorder.start, Colors.gradients.sirenBorder.end];
    }
  };

  const gradientColors = getGradientColors();

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { borderRadius, padding: borderWidth }, style]}
    >
      <View style={[styles.content, { 
        borderRadius: Math.max(borderRadius - borderWidth, 0),
        flex: 1,
      }]}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'white',
    flex: 1,
  },
});

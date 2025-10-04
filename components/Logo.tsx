import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Shield, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  variant?: 'light' | 'dark' | 'primary';
  showText?: boolean;
  style?: ViewStyle;
}

export default function Logo({ 
  size = 'medium', 
  variant = 'primary', 
  showText = true,
  style 
}: LogoProps) {
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 20,
          fontSize: 16,
          containerSize: 32,
          spacing: 8,
        };
      case 'large':
        return {
          iconSize: 40,
          fontSize: 32,
          containerSize: 64,
          spacing: 16,
        };
      case 'xlarge':
        return {
          iconSize: 50,
          fontSize: 40,
          containerSize: 80,
          spacing: 12,
        };
      case 'xxlarge':
        return {
          iconSize: 60,
          fontSize: 48,
          containerSize: 96,
          spacing: 24,
        };
      default: // medium
        return {
          iconSize: 28,
          fontSize: 24,
          containerSize: 48,
          spacing: 12,
        };
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          iconColor: Colors.white,
          textColor: Colors.white,
          backgroundColor: 'transparent',
          showGradient: false, // Don't show gradient for light variant
        };
      case 'dark':
        return {
          iconColor: Colors.white,
          textColor: Colors.text,
          backgroundColor: 'transparent',
          showGradient: false, // Don't show gradient for dark variant
        };
      default: // primary
        return {
          iconColor: Colors.white,
          textColor: Colors.primary,
          backgroundColor: 'transparent',
          showGradient: true, // Show gradient for primary variant
          gradientColors: ['#3B82F6', '#1E40AF'], // Blue gradient from light to dark
        };
    }
  };

  const sizes = getSizes();
  const colors = getColors();

  return (
    <View style={[styles.container, { gap: sizes.spacing }, style]}>
      <View style={[
        styles.iconContainer,
        {
          width: sizes.containerSize,
          height: sizes.containerSize,
          borderRadius: sizes.containerSize / 6,
        }
      ]}>
        {/* Blue gradient background - only for primary variant */}
        {colors.showGradient && (
          <LinearGradient
            colors={colors.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientBackground,
              {
                width: sizes.containerSize,
                height: sizes.containerSize,
                borderRadius: sizes.containerSize / 6,
              }
            ]}
          />
        )}
        
        {/* White shield outline */}
        <View style={styles.shieldContainer}>
          <Shield 
            size={sizes.iconSize} 
            color={colors.iconColor}
            fill="transparent"
            strokeWidth={2}
          />
        </View>
        
        {/* White star inside shield */}
        <View style={styles.starContainer}>
          <Star 
            size={sizes.iconSize * 0.4} 
            color={colors.iconColor}
            fill={colors.iconColor}
          />
        </View>
      </View>
      {showText && (
        <Text style={[
          styles.logoText,
          {
            fontSize: sizes.fontSize,
            color: colors.textColor,
          }
        ]}>
          FIT4DUTY
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientBackground: {
    position: 'absolute',
  },
  shieldContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'System',
    textShadowColor: Colors.primary + '20',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },
});
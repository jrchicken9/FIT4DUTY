import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Shield, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
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
        };
      case 'dark':
        return {
          iconColor: Colors.text,
          textColor: Colors.text,
          backgroundColor: 'transparent',
        };
      default: // primary
        return {
          iconColor: Colors.primary,
          textColor: Colors.primary,
          backgroundColor: 'transparent',
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
          backgroundColor: colors.backgroundColor,
        }
      ]}>
        {/* Background gradient effect */}
        <View style={[
          styles.gradientBackground,
          {
            width: sizes.containerSize,
            height: sizes.containerSize,
            borderRadius: sizes.containerSize / 6,
          }
        ]} />
        
        {/* Main shield */}
        <Shield 
          size={sizes.iconSize} 
          color={colors.iconColor} 
          fill={variant === 'primary' ? Colors.primary + '15' : 'transparent'}
          strokeWidth={2.5}
        />
        
        {/* Star accent */}
        <View style={[
          styles.starContainer,
          {
            top: sizes.containerSize * 0.15,
            right: sizes.containerSize * 0.15,
          }
        ]}>
          <Star 
            size={sizes.iconSize * 0.35} 
            color={Colors.policeRed} 
            fill={Colors.policeRed}
          />
        </View>
        
        {/* Border accent */}
        <View style={[
          styles.borderAccent,
          {
            width: sizes.containerSize,
            height: sizes.containerSize,
            borderRadius: sizes.containerSize / 6,
            borderWidth: variant === 'primary' ? 2 : 1,
            borderColor: variant === 'primary' ? Colors.primary + '30' : 'transparent',
          }
        ]} />
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
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientBackground: {
    position: 'absolute',
    backgroundColor: Colors.primary + '08',
    borderWidth: 1,
    borderColor: Colors.primary + '15',
  },
  starContainer: {
    position: 'absolute',
  },
  borderAccent: {
    position: 'absolute',
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
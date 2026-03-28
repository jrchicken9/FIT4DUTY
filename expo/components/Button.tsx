import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes, tapAnimation, theme } from '@/constants/designSystem';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium' | 'gradient' | 'alert' | 'police';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: [string, string];
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  testId?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  gradientColors,
  icon,
  iconPosition = 'left',
  testId,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.timing(scaleAnim, {
      toValue: tapAnimation.scale,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: tapAnimation.duration,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = { ...styles.button, ...styles[size] };
    
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, ...styles.fullWidth };
    }
    
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...styles.primary };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...styles.secondary };
        break;
      case 'outline':
        buttonStyle = { ...buttonStyle, ...styles.outline };
        break;
      case 'ghost':
        buttonStyle = { ...buttonStyle, ...styles.ghost };
        break;
      case 'premium':
        buttonStyle = { ...buttonStyle, ...styles.premium };
        break;
      case 'gradient':
        buttonStyle = { ...buttonStyle, ...styles.gradient };
        break;
    }
    
    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.disabled };
    }
    
    return { ...buttonStyle, ...style };
  };

  const getTextStyle = (): TextStyle => {
    let textStyleObj: TextStyle = { ...styles.text, ...styles[`${size}Text`] };
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'premium':
      case 'gradient':
      case 'alert':
      case 'police':
        textStyleObj = { ...textStyleObj, ...styles.textLight };
        break;
      case 'outline':
      case 'ghost':
        textStyleObj = { ...textStyleObj, ...styles.textDark };
        break;
    }
    
    if (disabled) {
      textStyleObj = { ...textStyleObj, ...styles.textDisabled };
    }
    
    return { ...textStyleObj, ...textStyle };
  };

  const getGradientColors = (): [string, string] => {
    if (gradientColors) return gradientColors;
    
    switch (variant) {
      case 'premium':
        return [Colors.gradients.premium.start, Colors.gradients.premium.end];
      case 'gradient':
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
      case 'alert':
        return [Colors.gradients.alert.start, Colors.gradients.alert.end];
      case 'police':
        return [Colors.gradients.police.start, Colors.gradients.police.end];
      default:
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </>
  );

  const buttonStyle = getButtonStyle();

  if (variant === 'gradient' || variant === 'premium' || variant === 'alert' || variant === 'police') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          buttonStyle,
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
          <LinearGradient
            colors={getGradientColors()}
            style={styles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderContent()}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyle,
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
        {renderContent()}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },
  
  // Size variants
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  
  // Width variants
  fullWidth: {
    width: '100%',
  },
  
  // Style variants with consistent elevation
  primary: {
    backgroundColor: Colors.primary,
    ...shadows.level2,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...shadows.level2,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: strokeWidth.normal,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  premium: {
    backgroundColor: Colors.premium.accent,
    ...shadows.level4,
  },
  gradient: {
    backgroundColor: 'transparent',
    ...shadows.level4,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
  
  // Animated container for tap effects
  animatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Gradient container
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    ...typography.labelMedium,
  },
  mediumText: {
    ...typography.labelLarge,
  },
  largeText: {
    ...typography.headingSmall,
  },
  textLight: {
    color: Colors.white,
  },
  textDark: {
    color: Colors.primary,
  },
  textDisabled: {
    color: Colors.textTertiary,
  },
  
  // Icon styles with consistent sizing
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});
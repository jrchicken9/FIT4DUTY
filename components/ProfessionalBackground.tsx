import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface ProfessionalBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'dashboard' | 'fitness' | 'application' | 'profile';
}

export default function ProfessionalBackground({ 
  children, 
  variant = 'default' 
}: ProfessionalBackgroundProps) {
  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'dashboard':
        return ['#F8FAFC', '#F1F5F9', '#E2E8F0'];
      case 'fitness':
        return ['#F0F9FF', '#E0F2FE', '#BAE6FD'];
      case 'application':
        return ['#FEF7FF', '#F3E8FF', '#E9D5FF'];
      case 'profile':
        return ['#F0FDF4', '#DCFCE7', '#BBF7D0'];
      default:
        return ['#F8FAFC', '#F1F5F9', '#E2E8F0'];
    }
  };

  const getPatternOpacity = () => {
    switch (variant) {
      case 'dashboard':
        return 0.08;
      case 'fitness':
        return 0.08;
      case 'application':
        return 0.08;
      case 'profile':
        return 0.08;
      default:
        return 0.08;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main gradient background */}
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Subtle geometric patterns */}
      <View style={[styles.pattern1, { opacity: getPatternOpacity() }]} />
      <View style={[styles.pattern2, { opacity: getPatternOpacity() }]} />
      <View style={[styles.pattern3, { opacity: getPatternOpacity() }]} />
      <View style={[styles.pattern4, { opacity: getPatternOpacity() }]} />
      <View style={[styles.pattern5, { opacity: getPatternOpacity() }]} />
      <View style={[styles.pattern6, { opacity: getPatternOpacity() }]} />
      
      {/* Professional accent elements */}
      <View style={[styles.accent1, { opacity: getPatternOpacity() * 1.5 }]} />
      <View style={[styles.accent2, { opacity: getPatternOpacity() * 1.5 }]} />
      <View style={[styles.accent3, { opacity: getPatternOpacity() * 1.5 }]} />
      <View style={[styles.accent4, { opacity: getPatternOpacity() * 1.5 }]} />
      <View style={[styles.accent5, { opacity: getPatternOpacity() * 1.5 }]} />
      
      {/* Geometric shapes */}
      <View style={[styles.geometric1, { opacity: getPatternOpacity() * 1.2 }]} />
      <View style={[styles.geometric2, { opacity: getPatternOpacity() * 1.2 }]} />
      <View style={[styles.geometric3, { opacity: getPatternOpacity() * 1.2 }]} />
      <View style={[styles.geometric4, { opacity: getPatternOpacity() * 1.2 }]} />
      
      {/* Subtle border accents */}
      <View style={[styles.borderAccent1, { opacity: getPatternOpacity() * 2 }]} />
      <View style={[styles.borderAccent2, { opacity: getPatternOpacity() * 2 }]} />
      <View style={[styles.borderAccent3, { opacity: getPatternOpacity() * 2 }]} />
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Subtle geometric patterns
  pattern1: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: Colors.primary,
    top: -50,
    right: -50,
    borderRadius: 100,
    transform: [{ rotate: '15deg' }],
  },
  pattern2: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: Colors.secondary,
    bottom: -30,
    left: -30,
    borderRadius: 75,
    transform: [{ rotate: '-20deg' }],
  },
  pattern3: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: Colors.accent,
    top: '40%',
    right: -20,
    borderRadius: 50,
    transform: [{ rotate: '45deg' }],
  },
  pattern4: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: Colors.success,
    bottom: '30%',
    left: -40,
    borderRadius: 60,
    transform: [{ rotate: '-30deg' }],
  },
  pattern5: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: Colors.accent,
    top: '60%',
    right: -20,
    borderRadius: 40,
    transform: [{ rotate: '45deg' }],
  },
  pattern6: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    bottom: '10%',
    right: -30,
    borderRadius: 50,
    transform: [{ rotate: '-15deg' }],
  },
  // Professional accent elements
  accent1: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    top: '20%',
    left: '10%',
    borderRadius: 8,
    transform: [{ rotate: '30deg' }],
  },
  accent2: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: Colors.secondary,
    bottom: '25%',
    right: '15%',
    borderRadius: 6,
    transform: [{ rotate: '-15deg' }],
  },
  accent3: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: Colors.accent,
    top: '60%',
    left: '80%',
    borderRadius: 7,
    transform: [{ rotate: '60deg' }],
  },
  accent4: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: Colors.secondary,
    top: '30%',
    left: '70%',
    borderRadius: 6,
    transform: [{ rotate: '30deg' }],
  },
  accent5: {
    position: 'absolute',
    width: 35,
    height: 35,
    backgroundColor: Colors.success,
    bottom: '40%',
    left: '20%',
    borderRadius: 5,
    transform: [{ rotate: '-45deg' }],
  },
  // Border accents
  borderAccent1: {
    position: 'absolute',
    width: 80,
    height: 2,
    backgroundColor: Colors.primary,
    top: '15%',
    left: '5%',
    transform: [{ rotate: '15deg' }],
  },
  borderAccent2: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: Colors.secondary,
    bottom: '20%',
    right: '8%',
    transform: [{ rotate: '-25deg' }],
  },
  borderAccent3: {
    position: 'absolute',
    width: 70,
    height: 2,
    backgroundColor: Colors.accent,
    top: '70%',
    left: '15%',
    transform: [{ rotate: '20deg' }],
  },
  // Geometric shapes
  geometric1: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary,
    top: '25%',
    right: '25%',
    transform: [{ rotate: '0deg' }],
  },
  geometric2: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.secondary,
    bottom: '35%',
    left: '25%',
    transform: [{ rotate: '45deg' }],
  },
  geometric3: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: Colors.accent,
    top: '45%',
    left: '15%',
    borderRadius: 4,
    transform: [{ rotate: '30deg' }],
  },
  geometric4: {
    position: 'absolute',
    width: 25,
    height: 25,
    backgroundColor: Colors.success,
    bottom: '60%',
    right: '35%',
    borderRadius: 3,
    transform: [{ rotate: '-30deg' }],
  },
});

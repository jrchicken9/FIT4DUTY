import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface PoliceThemeBackgroundProps {
  children: React.ReactNode;
}

export default function PoliceThemeBackground({ children }: PoliceThemeBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Police Badge Pattern - moved to edges */}
      <View style={styles.badge1} />
      <View style={styles.badge2} />
      <View style={styles.badge3} />
      
      {/* Shield Elements - moved to edges */}
      <View style={styles.shield1} />
      <View style={styles.shield2} />
      
      {/* Handcuff Symbols - moved to edges and reduced */}
      <View style={styles.handcuff1} />
      <View style={styles.handcuff2} />
      
      {/* Police Hat Elements - moved to edges */}
      <View style={styles.policeHat1} />
      <View style={styles.policeHat2} />
      
      {/* Geometric Law Enforcement Patterns - moved to edges and reduced */}
      <View style={styles.geometric1} />
      <View style={styles.geometric2} />
      <View style={styles.geometric3} />
      
      {/* Star/Badge Accents - moved to edges and reduced */}
      <View style={styles.star1} />
      <View style={styles.star2} />
      
      {/* Siren Light Effect - moved to edges and reduced */}
      <View style={styles.sirenLight1} />
      <View style={styles.sirenLight2} />
      
      {/* Additional subtle patterns */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.triangle1} />
      <View style={styles.triangle2} />
      
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
  // Police Badge Shapes (hexagonal/pentagonal) - more visible patterns
  badge1: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: Colors.primary + '20',
    top: 50,
    left: 20,
    transform: [{ rotate: '15deg' }],
    borderRadius: 20,
  },
  badge2: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: Colors.secondary + '18',
    bottom: 200,
    right: 20,
    transform: [{ rotate: '-20deg' }],
    borderRadius: 15,
  },
  badge3: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#FF6B6B' + '15',
    top: 300,
    right: 30,
    transform: [{ rotate: '45deg' }],
    borderRadius: 12,
  },
  // Shield Elements - more visible
  shield1: {
    position: 'absolute',
    width: 100,
    height: 120,
    backgroundColor: Colors.primary + '15',
    top: 100,
    left: 10,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  shield2: {
    position: 'absolute',
    width: 80,
    height: 100,
    backgroundColor: Colors.secondary + '12',
    bottom: 150,
    right: 15,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  // Handcuff Symbols - moved to edges and reduced size
  handcuff1: {
    position: 'absolute',
    width: 60, // Reduced from 80
    height: 60,
    backgroundColor: Colors.primary + '08', // Reduced opacity
    top: 80,
    right: 20, // Moved to edge
    borderRadius: 30,
    borderWidth: 6, // Reduced border
    borderColor: Colors.primary + '15',
  },
  handcuff2: {
    position: 'absolute',
    width: 50, // Reduced from 60
    height: 50,
    backgroundColor: Colors.secondary + '06', // Reduced opacity
    bottom: 250,
    left: 20, // Moved to edge
    borderRadius: 25,
    borderWidth: 5, // Reduced border
    borderColor: Colors.secondary + '12',
  },
  // Police Hat Elements - moved to edges
  policeHat1: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary + '08', // Reduced opacity
    top: 180,
    right: 20, // Moved to edge
    transform: [{ rotate: '0deg' }],
  },
  policeHat2: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 45,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.secondary + '06', // Reduced opacity
    bottom: 100,
    left: 20, // Moved to edge
    transform: [{ rotate: '15deg' }],
  },
  // Geometric Patterns - more visible
  geometric1: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: Colors.accent + '18',
    top: 200,
    right: 30,
    transform: [{ rotate: '30deg' }],
    borderRadius: 8,
  },
  geometric2: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: Colors.primary + '15',
    bottom: 300,
    left: 25,
    transform: [{ rotate: '-15deg' }],
    borderRadius: 6,
  },
  geometric3: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#FF6B6B' + '12',
    top: 400,
    right: 40,
    transform: [{ rotate: '60deg' }],
    borderRadius: 5,
  },
  // Star/Badge Accents - more visible
  star1: {
    position: 'absolute',
    width: 35,
    height: 35,
    backgroundColor: Colors.primary + '20',
    top: 150,
    left: 30,
    transform: [{ rotate: '0deg' }],
    borderRadius: 17.5,
  },
  star2: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: Colors.secondary + '15',
    bottom: 250,
    left: 40,
    transform: [{ rotate: '45deg' }],
    borderRadius: 15,
  },
  // Siren Light Effects - moved to edges and reduced
  sirenLight1: {
    position: 'absolute',
    width: 40, // Reduced from 50
    height: 40,
    backgroundColor: '#FF6B6B' + '08', // Reduced opacity
    top: 300,
    right: 20, // Moved to edge
    borderRadius: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, // Reduced shadow
    shadowRadius: 10, // Reduced shadow
    elevation: 3, // Reduced elevation
  },
  sirenLight2: {
    position: 'absolute',
    width: 30, // Reduced from 40
    height: 30,
    backgroundColor: Colors.primary + '06', // Reduced opacity
    bottom: 80,
    right: 20, // Moved to edge
    borderRadius: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, // Reduced shadow
    shadowRadius: 8, // Reduced shadow
    elevation: 2, // Reduced elevation
  },
  // Additional subtle patterns
  circle1: {
    position: 'absolute',
    width: 70,
    height: 70,
    backgroundColor: Colors.primary + '08',
    top: 250,
    left: 50,
    borderRadius: 35,
  },
  circle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: Colors.secondary + '10',
    bottom: 100,
    right: 60,
    borderRadius: 25,
  },
  triangle1: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.accent + '12',
    top: 350,
    left: 60,
    transform: [{ rotate: '30deg' }],
  },
  triangle2: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF6B6B' + '10',
    bottom: 350,
    right: 80,
    transform: [{ rotate: '-45deg' }],
  },
});

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import Logo from './Logo';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({ 
  title = "Loading...", 
  subtitle = "Please wait while we prepare your experience",
  showLogo = true 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Logo size="large" variant="primary" />
        </View>
      )}
      
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.policeRed} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 48,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

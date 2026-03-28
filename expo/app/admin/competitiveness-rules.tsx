import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function CompetitivenessRulesAdmin() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Auto-redirect to the proper page after a short delay
    const timer = setTimeout(() => {
      router.replace('/admin/resume-logic');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    router.replace('/admin/resume-logic');
  };

  if (!isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Access Denied' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.subtitle}>You don't have permission to access this page.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Competitiveness Rules' }} />
      
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Page Moved</Text>
        <Text style={styles.subtitle}>
          The Competitiveness Rules have been moved to the Resume Logic & Grading section.
        </Text>
        
        <View style={styles.redirectInfo}>
          <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
          <Text style={styles.redirectText}>Redirecting automatically...</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleManualRedirect}>
          <Text style={styles.buttonText}>Go Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  redirectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginRight: 8,
  },
  redirectText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});



import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, shadows } from '@/constants/designSystem';
import SirenGradientBorder from '@/components/SirenGradientBorder';
import Button from '@/components/Button';

export default function SirenGradientDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '🚨 Siren Gradient Demo',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { ...typography.headingMedium, fontWeight: '800' },
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={48} color={Colors.policeRed} />
            </View>
            <Text style={styles.title}>Police Siren Gradient Borders</Text>
            <Text style={styles.subtitle}>
              Experience subtle, elegant borders with gentle blue gradients that blend seamlessly with the UI
            </Text>
          </View>

          {/* Gradient Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gradient Variants</Text>
            
            <SirenGradientBorder variant="siren" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <AlertTriangle size={24} color={Colors.policeRed} />
                  <Text style={styles.cardTitle}>Siren Gradient</Text>
                </View>
            <Text style={styles.cardDescription}>
              Subtle blue gradient - elegant and professional
            </Text>
              </View>
            </SirenGradientBorder>

            <SirenGradientBorder variant="sirenReverse" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <CheckCircle size={24} color={Colors.policeBlue} />
                  <Text style={styles.cardTitle}>Reverse Siren</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Half blue, half red border - alternative siren effect
                </Text>
              </View>
            </SirenGradientBorder>

            <SirenGradientBorder variant="sirenBorder" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Zap size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Siren Border</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Standard red-to-blue border - perfect for UI elements
                </Text>
              </View>
            </SirenGradientBorder>
          </View>

          {/* Component Examples */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applied to Components</Text>
            
            <SirenGradientBorder variant="sirenBorder" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Application Step Card</Text>
                <Text style={styles.cardDescription}>
                  Step cards now feature siren gradient borders for enhanced visual hierarchy
                </Text>
              </View>
            </SirenGradientBorder>

            <SirenGradientBorder variant="sirenBorder" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Workout Cards</Text>
                <Text style={styles.cardDescription}>
                  Fitness workout cards enhanced with police siren gradient borders
                </Text>
              </View>
            </SirenGradientBorder>

            <SirenGradientBorder variant="sirenBorder" borderWidth={0.5} style={styles.demoCard}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>PIN Test Components</Text>
                <Text style={styles.cardDescription}>
                  All test component cards feature the siren gradient border effect
                </Text>
              </View>
            </SirenGradientBorder>
          </View>

          {/* Color Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Palette</Text>
            
            <View style={styles.colorGrid}>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: Colors.policeRed }]} />
                <Text style={styles.colorLabel}>Police Siren Red</Text>
                <Text style={styles.colorCode}>#80022F</Text>
              </View>
              
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: Colors.policeBlue }]} />
                <Text style={styles.colorLabel}>Police Siren Blue</Text>
                <Text style={styles.colorCode}>#003A7A</Text>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color={Colors.white} />
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.policeRedLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  demoCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  cardContent: {
    padding: spacing.lg,
    backgroundColor: Colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  cardDescription: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorItem: {
    alignItems: 'center',
    flex: 1,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  colorLabel: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  colorCode: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginTop: spacing.xl,
    ...shadows.medium,
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

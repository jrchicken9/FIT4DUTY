import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from "react-native";
import { Shield, Target, Users, GraduationCap, ArrowLeft } from "lucide-react-native";
import { BRAND } from "@/app/constants/branding";
import Colors from "@/constants/colors";
import { router } from "expo-router";
import Logo from "@/components/Logo";

// Hide the header for this screen
export const options = {
  headerShown: false,
};

export default function AboutFIT4Duty() {
  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.centerLogo}>
          <Logo size="small" variant="light" showText={false} />
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <Shield size={32} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>FIT4Duty</Text>
          </View>
          <Text style={styles.tagline}>{BRAND.taglineExtended}</Text>
        </View>

        {/* Mission Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Target size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>
          <Text style={styles.cardContent}>{BRAND.mission}</Text>
        </View>

        {/* Audience Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={24} color={Colors.secondary} />
            <Text style={styles.cardTitle}>Who We Serve</Text>
          </View>
          <Text style={styles.cardContent}>{BRAND.audienceNote}</Text>
        </View>

        {/* Journey Steps */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <GraduationCap size={24} color={Colors.accent} />
            <Text style={styles.cardTitle}>Your Journey</Text>
          </View>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Complete prerequisites and requirements</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Prepare for testing and fitness standards</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Submit applications and ace interviews</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Complete background checks and medical requirements</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: { 
    flex: 1, 
    backgroundColor: Colors.primary 
  },
  customHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: Colors.white,
    marginLeft: 4,
    fontWeight: '500',
  },
  centerLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: { 
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  cardContent: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  stepsContainer: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    paddingTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

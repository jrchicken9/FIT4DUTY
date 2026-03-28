import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { 
  Target, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Dumbbell,
  Heart,
  Zap,
  ExternalLink,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { shadows } from '@/constants/designSystem';
import Button from '@/components/Button';

export default function PREPFitnessTestStep() {
  const handleNavigateToFitness = () => {
    router.push('/(tabs)/fitness');
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Target size={32} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>Physical Readiness Evaluation (PREP)</Text>
          <Text style={styles.heroSubtitle}>
            Physical Readiness Evaluation for Police
          </Text>
          <View style={styles.heroBadge}>
            <Clock size={14} color={Colors.white} />
            <Text style={styles.heroBadgeText}>20-30 minutes</Text>
          </View>
        </View>
      </View>

      {/* What is PREP Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What is the PREP Test?</Text>
        <Text style={styles.sectionDescription}>
          The PREP (Physical Readiness Evaluation for Police) test is a standardized physical fitness assessment required by most police services in Ontario. It evaluates your physical capabilities to perform essential police duties.
        </Text>
        
        <View style={styles.prepComponents}>
          <View style={styles.componentCard}>
            <View style={styles.componentIcon}>
              <Heart size={24} color={Colors.primary} />
            </View>
            <Text style={styles.componentTitle}>Shuttle Run</Text>
            <Text style={styles.componentDesc}>
              Progressive 20-meter shuttle run to level 6.5, testing cardiovascular endurance
            </Text>
          </View>
          
          <View style={styles.componentCard}>
            <View style={styles.componentIcon}>
              <Dumbbell size={24} color={Colors.primary} />
            </View>
            <Text style={styles.componentTitle}>Push/Pull Machine</Text>
            <Text style={styles.componentDesc}>
              70 lbs resistance test measuring upper body strength
            </Text>
          </View>
          
          <View style={styles.componentCard}>
            <View style={styles.componentIcon}>
              <Zap size={24} color={Colors.primary} />
            </View>
            <Text style={styles.componentTitle}>Obstacle Course</Text>
            <Text style={styles.componentDesc}>
              Complete under 2:42, testing agility and coordination
            </Text>
          </View>
        </View>
      </View>

      {/* Requirements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Requirements</Text>
        <View style={styles.requirementsList}>
          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Target size={16} color={Colors.success} />
            </View>
            <Text style={styles.requirementText}>
              Shuttle run to level 6.5
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Target size={16} color={Colors.success} />
            </View>
            <Text style={styles.requirementText}>
              Push/pull machine (70 lbs)
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Target size={16} color={Colors.success} />
            </View>
            <Text style={styles.requirementText}>
              Obstacle course under 2:42
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Target size={16} color={Colors.success} />
            </View>
            <Text style={styles.requirementText}>
              Athletic clothing and footwear
            </Text>
          </View>
        </View>
      </View>

      {/* Call to Action - Fitness Tab */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={[Colors.gradients.accent.start, Colors.gradients.accent.end]}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.ctaContent}>
          <View style={styles.ctaIconContainer}>
            <TrendingUp size={32} color={Colors.white} />
          </View>
          <Text style={styles.ctaTitle}>Ready to Train?</Text>
          <Text style={styles.ctaDescription}>
            Access personalized training plans, practice sessions, and progress tracking in the Fitness Tab
          </Text>
          
          <Button
            title="Go to Fitness Tab"
            onPress={handleNavigateToFitness}
            variant="secondary"
            size="large"
            style={styles.ctaButton}
          />
          
          <View style={styles.ctaFeatures}>
            <Text style={styles.ctaFeaturesTitle}>What you'll find:</Text>
            <View style={styles.ctaFeatureItem}>
              <ChevronRight size={16} color={Colors.white} />
              <Text style={styles.ctaFeatureText}>PREP-specific training plans</Text>
            </View>
            <View style={styles.ctaFeatureItem}>
              <ChevronRight size={16} color={Colors.white} />
              <Text style={styles.ctaFeatureText}>Practice test simulations</Text>
            </View>
            <View style={styles.ctaFeatureItem}>
              <ChevronRight size={16} color={Colors.white} />
              <Text style={styles.ctaFeatureText}>Progress tracking tools</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Success Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Success Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>1</Text>
            </View>
            <Text style={styles.tipText}>
              Train specifically for each component - don't just do general fitness
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>2</Text>
            </View>
            <Text style={styles.tipText}>
              Practice the obstacle course layout if possible
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>3</Text>
            </View>
            <Text style={styles.tipText}>
              Focus on both strength and cardiovascular endurance
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>4</Text>
            </View>
            <Text style={styles.tipText}>
              Rest well before the test and stay hydrated
            </Text>
          </View>
        </View>
      </View>

      {/* Resources Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Official Resources</Text>
        <View style={styles.resourcesList}>
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => handleOpenLink('https://www.oacpcertificate.ca/physical-test/')}
          >
            <ExternalLink size={20} color={Colors.primary} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>PREP Test Overview</Text>
              <Text style={styles.resourceDesc}>Official information about the PREP test</Text>
            </View>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => handleOpenLink('https://www.oacpcertificate.ca/wp-content/uploads/2020/01/PREP-Applicant-Preparation-Guide.pdf')}
          >
            <ExternalLink size={20} color={Colors.primary} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>PREP Training Guide</Text>
              <Text style={styles.resourceDesc}>Official preparation guide and tips</Text>
            </View>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 20,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 24,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroBadgeText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },

  // PREP Components
  prepComponents: {
    gap: 16,
  },
  componentCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.small,
  },
  componentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  componentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  componentDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Requirements List
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementIcon: {
    marginRight: 12,
  },
  requirementText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },

  // Tips List
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  tipText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    flex: 1,
  },

  // CTA Section
  ctaSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaContent: {
    padding: 24,
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 22,
  },
  ctaButton: {
    marginBottom: 24,
  },
  ctaFeatures: {
    alignItems: 'flex-start',
    width: '100%',
  },
  ctaFeaturesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  ctaFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaFeatureText: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 8,
    opacity: 0.9,
  },

  // Resources
  resourcesList: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

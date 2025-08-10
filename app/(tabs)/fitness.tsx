import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Target,
  TrendingUp,
  Timer,
  Calendar,
  Star,
  Info,
  Activity,
  Zap,
  Award,
  MapPin,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { usePinTest } from '@/context/PinTestContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { router } from 'expo-router';



export default function FitnessScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { testResults, formatTime, getPersonalBests } = usePinTest();
  const { subscription } = useSubscription();
  
  // const latestResult = getLatestResult();
  const personalBests = getPersonalBests();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderOverview = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Modern Hero Header */}
      <View style={styles.heroHeader}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Fitness Testing Hub</Text>
              <Text style={styles.heroSubtitle}>Train, Track, and Test Your Readiness</Text>
            </View>
            <View style={styles.heroIllustration}>
              <View style={styles.heroIconBox}>
                <Activity size={28} color="#667EEA" />
              </View>
              <View style={[styles.heroIconBox, { marginLeft: -8, marginTop: 12 }]}>
                <Zap size={24} color="#F59E0B" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modern Test Cards Section */}
      <View style={styles.testsSection}>
        <View style={styles.testsGrid}>
          {/* PREP Test Card */}
          <View style={styles.modernTestCard}>
            <View style={styles.testCardBackground}>
              <View style={styles.testCardHeader}>
                <View style={[styles.modernTestIcon, { backgroundColor: '#EBF4FF' }]}>
                  <Timer size={36} color="#3B82F6" />
                  <View style={styles.testIconAccent} />
                </View>
                <TouchableOpacity style={styles.infoButton}>
                  <Info size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.testContent}>
                <Text style={styles.modernTestTitle}>PREP Test</Text>
                <Text style={styles.modernTestDescription}>Your complete police fitness assessment</Text>
                
                <View style={styles.modernTestActions}>
                  <TouchableOpacity style={[styles.modernPrimaryButton, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.modernPrimaryButtonText}>Start Digital Test</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.modernSecondaryButton,
                      subscription.plan === 'free' && styles.lockedButton
                    ]}
                    onPress={() => {
                      if (subscription.plan === 'free') {
                        router.push('/subscription');
                      } else {
                        console.log('Navigate to PREP practice guide');
                      }
                    }}
                  >
                    <Text style={[
                      styles.modernSecondaryButtonText,
                      subscription.plan === 'free' && styles.lockedButtonText
                    ]}>
                      {subscription.plan === 'free' ? 'View Practice Guide 🔒' : 'View Practice Guide'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* PIN Test Card */}
          <View style={styles.modernTestCard}>
            <View style={styles.testCardBackground}>
              <View style={styles.testCardHeader}>
                <View style={[styles.modernTestIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Target size={36} color="#EF4444" />
                  <View style={[styles.testIconAccent, { backgroundColor: '#EF4444' }]} />
                </View>
                <TouchableOpacity style={styles.infoButton}>
                  <Info size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.testContent}>
                <Text style={styles.modernTestTitle}>PIN Test</Text>
                <Text style={styles.modernTestDescription}>Your complete police fitness assessment</Text>
                
                {/* Modern Progress Ring */}
                <View style={styles.modernProgressContainer}>
                  <View style={styles.progressRing}>
                    <View style={styles.progressRingInner}>
                      <Text style={styles.progressPercentage}>65%</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modernTestActions}>
                  <TouchableOpacity 
                    style={[styles.modernPrimaryButton, { backgroundColor: '#EF4444' }]}
                    onPress={() => router.push('/pin-test')}
                  >
                    <Text style={styles.modernPrimaryButtonText}>Start Digital Test</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.modernSecondaryButton,
                      subscription.plan === 'free' && styles.lockedButton
                    ]}
                    onPress={() => {
                      if (subscription.plan === 'free') {
                        router.push('/subscription');
                      } else {
                        console.log('Navigate to PIN practice guide');
                      }
                    }}
                  >
                    <Text style={[
                      styles.modernSecondaryButtonText,
                      subscription.plan === 'free' && styles.lockedButtonText
                    ]}>
                      {subscription.plan === 'free' ? 'View Practice Guide 🔒' : 'View Practice Guide'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Modern In-Person Practice Sessions */}
      <View style={styles.practiceSection}>
        <LinearGradient
          colors={['#F8FAFC', '#EFF6FF']}
          style={styles.practiceSectionContainer}
        >
          <View style={styles.practiceSectionHeader}>
            <View style={styles.practiceHeaderContent}>
              <Text style={styles.modernPracticeSectionTitle}>In-Person Practice Sessions</Text>
              <Text style={styles.modernPracticeSectionSubtitle}>
                Book your spot for official practice runs of the PREP & PIN tests with certified instructors.
              </Text>
            </View>
            <View style={styles.modernMembersOnlyBadge}>
              <Award size={14} color={Colors.white} />
              <Text style={styles.membersOnlyText}>Members Only</Text>
            </View>
          </View>
          
          <View style={styles.practiceActionsGrid}>
            <TouchableOpacity 
              style={[
                styles.modernPracticeCard,
                subscription.plan === 'free' && styles.lockedCard
              ]}
              onPress={() => {
                if (subscription.plan === 'free') {
                  router.push('/subscription');
                } else {
                  console.log('Navigate to practice session dates');
                }
              }}
            >
              <View style={styles.modernPracticeCardContent}>
                <View style={[
                  styles.modernPracticeIcon,
                  { backgroundColor: '#DBEAFE' },
                  subscription.plan === 'free' && styles.lockedIconContainer
                ]}>
                  <MapPin size={28} color={subscription.plan === 'free' ? Colors.textSecondary : '#3B82F6'} />
                </View>
                <Text style={[
                  styles.modernPracticeTitle,
                  subscription.plan === 'free' && styles.lockedText
                ]}>View Dates & Locations</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modernPracticeCard,
                subscription.plan === 'free' && styles.lockedCard
              ]}
              onPress={() => {
                if (subscription.plan === 'free') {
                  router.push('/subscription');
                } else {
                  console.log('Navigate to practice session booking');
                }
              }}
            >
              <View style={styles.modernPracticeCardContent}>
                <View style={[
                  styles.modernPracticeIcon,
                  { backgroundColor: '#D1FAE5' },
                  subscription.plan === 'free' && styles.lockedIconContainer
                ]}>
                  <Calendar size={28} color={subscription.plan === 'free' ? Colors.textSecondary : '#10B981'} />
                </View>
                <Text style={[
                  styles.modernPracticeTitle,
                  subscription.plan === 'free' && styles.lockedText
                ]}>Book Now</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      {testResults.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconBg}>
                <Target size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{testResults.length}</Text>
              <Text style={styles.statLabel}>Tests Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {personalBests.mileRun ? formatTime(personalBests.mileRun.mile_run_minutes, personalBests.mileRun.mile_run_seconds) : '--'}
              </Text>
              <Text style={styles.statLabel}>Best 1.5 Mile</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#D1FAE5' }]}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {personalBests.pushups ? personalBests.pushups.pushups_count : '--'}
              </Text>
              <Text style={styles.statLabel}>Best Push-ups</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      {renderOverview()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  
  // Modern Hero Header
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontWeight: '500',
  },
  heroIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Modern Test Cards
  testsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  testsGrid: {
    gap: 20,
  },
  modernTestCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  testCardBackground: {
    backgroundColor: Colors.white,
    padding: 24,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modernTestIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  testIconAccent: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testContent: {
    flex: 1,
  },
  modernTestTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modernTestDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  
  // Modern Progress
  modernProgressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FEE2E2',
    borderTopColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  progressRingInner: {
    transform: [{ rotate: '90deg' }],
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  
  // Modern Test Actions
  modernTestActions: {
    gap: 16,
  },
  modernPrimaryButton: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modernPrimaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  modernSecondaryButton: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modernSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  lockedButton: {
    opacity: 0.6,
  },
  lockedButtonText: {
    color: Colors.textSecondary,
  },
  lockedCard: {
    opacity: 0.7,
  },
  lockedIconContainer: {
    backgroundColor: '#F8FAFC',
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  
  // Modern Practice Section
  practiceSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  practiceSectionContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  practiceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  practiceHeaderContent: {
    flex: 1,
    marginRight: 16,
  },
  modernPracticeSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modernPracticeSectionSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  modernMembersOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  membersOnlyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  practiceActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modernPracticeCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernPracticeCardContent: {
    alignItems: 'center',
  },
  modernPracticeIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modernPracticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
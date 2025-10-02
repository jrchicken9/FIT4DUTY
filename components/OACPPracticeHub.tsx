import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Star, 
  Play, 
  Award,
  Calendar,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Crown,
  Sparkles,
  Trophy,
  Brain,
  Timer,
  CheckCircle2,
  Lightbulb,
  Smile
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getDailyQuizStatus } from '@/utils/dailyQuiz';

interface PracticeTest {
  id: string;
  title: string;
  description: string;
  questions: number;
  timeLimit: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  isPremium: boolean;
  isNew?: boolean;
  bestScore?: number;
  attempts?: number;
}

const OACPPracticeHub: React.FC = () => {
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [bounceAnimation] = useState(new Animated.Value(1));
  const [showPulse, setShowPulse] = useState(true);
  const [testStats, setTestStats] = useState<{[key: string]: { bestScore?: number; attempts?: number }}>({});
  const [loading, setLoading] = useState(true);
  const [attemptLimits, setAttemptLimits] = useState<{[key: string]: { current: number; max: number; resetDate?: string }}>({});
  const { user } = useAuth();

  const practiceTests: PracticeTest[] = [
    {
      id: 'sample-test',
      title: 'Sample Test',
      description: 'Complete 50-question simulation of the actual OACP written test',
      questions: 50,
      timeLimit: '60 min',
      difficulty: 'Advanced',
      category: 'sample-test',
      isPremium: false,
      bestScore: testStats['sample-test']?.bestScore,
      attempts: testStats['sample-test']?.attempts,
    },
    {
      id: 'daily-quiz',
      title: 'Daily Quiz',
      description: '5 random questions from the test bank, resets every 24 hours',
      questions: 5,
      timeLimit: '10 min',
      difficulty: 'Intermediate',
      category: 'daily-quiz',
      isPremium: false,
      bestScore: testStats['daily-quiz']?.bestScore,
      attempts: testStats['daily-quiz']?.attempts,
    },
  ];



  const handleStartTest = (test: PracticeTest) => {
    if (test.isPremium) {
      Alert.alert(
        'Premium Test',
        'This is a premium practice test. Upgrade to access all premium content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      );
    } else {
      // Add animation before navigation
      Animated.sequence([
        Animated.timing(bounceAnimation, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Route to different endpoints based on test type
        if (test.id === 'daily-quiz') {
          router.push(`/application/oacp/quiz`);
        } else {
          router.push(`/application/oacp/test?testId=${test.id}`);
        }
      });
    }
  };

  // Start pulse animation for daily quiz with timer
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (showPulse) {
      pulse.start();
    }
    
    // Stop pulse after 5 seconds
    const timer = setTimeout(() => {
      setShowPulse(false);
      pulse.stop();
    }, 5000);
    
    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [showPulse]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return Colors.success;
      case 'Intermediate': return Colors.warning;
      case 'Advanced': return Colors.error;
      default: return Colors.gray[400];
    }
  };

  const getProgressPercentage = (test: PracticeTest) => {
    if (!test.bestScore) return 0;
    return Math.round((test.bestScore / 100) * 100);
  };

  // Fetch test statistics and attempt limits from database
  const fetchTestStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const stats: {[key: string]: { bestScore?: number; attempts?: number }} = {};
      const limits: {[key: string]: { current: number; max: number; resetDate?: string }} = {};

      // Calculate current month start for attempt limits
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Fetch sample test attempts (OACP step)
      const { data: sampleTestData, error: sampleError } = await supabase
        .from('test_attempts')
        .select('score, correct_count, total, created_at')
        .eq('user_id', user.id)
        .eq('step_id', 'oacp')
        .order('created_at', { ascending: false });

      if (!sampleError && sampleTestData && sampleTestData.length > 0) {
        const bestScore = Math.max(...sampleTestData.map(attempt => attempt.score));
        stats['sample-test'] = {
          bestScore,
          attempts: sampleTestData.length
        };
        // Calculate attempts this month
        const attemptsThisMonth = sampleTestData.filter(attempt => 
          new Date(attempt.created_at) >= monthStart
        ).length;

        limits['sample-test'] = {
          current: attemptsThisMonth,
          max: 2, // 2 attempts per month
          resetDate: nextMonthStart.toISOString()
        };
      } else {
        limits['sample-test'] = {
          current: 0,
          max: 2,
          resetDate: nextMonthStart.toISOString()
        };
      }

      // Fetch daily quiz status
      try {
        const dailyQuizStatus = await getDailyQuizStatus(user.id, 'oacp');
        if (dailyQuizStatus.quiz && dailyQuizStatus.quiz.score !== undefined) {
          stats['daily-quiz'] = {
            bestScore: dailyQuizStatus.quiz.score,
            attempts: 1 // Daily quiz is one attempt per day
          };
        }
        
        // Daily quiz is always available (resets daily)
        limits['daily-quiz'] = {
          current: dailyQuizStatus.isSubmitted ? 1 : 0,
          max: 1,
          resetDate: dailyQuizStatus.isExpired ? undefined : undefined // Resets daily
        };
      } catch (quizError) {
        // Daily quiz might not exist yet, which is fine
        limits['daily-quiz'] = {
          current: 0,
          max: 1
        };
      }

      setTestStats(stats);
      setAttemptLimits(limits);
    } catch (error) {
      console.error('Error fetching test stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load test statistics on component mount
  useEffect(() => {
    fetchTestStats();
  }, [user?.id]);

  // Refresh stats when component comes into focus (after returning from test/quiz)
  useFocusEffect(
    React.useCallback(() => {
      fetchTestStats();
    }, [user?.id])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Test Yourself!</Text>
        </View>
        <View style={styles.headerIcon}>
          <Target size={24} color={Colors.primary} />
        </View>
      </View>

      {/* Practice Tests Grid */}
      <View style={styles.testsContainer}>
        <Text style={styles.testsTitle}>Choose Your Practice Style</Text>
        
                {practiceTests.map((test) => (
          <Animated.View
            key={test.id}
            style={[
              test.id === 'daily-quiz' ? styles.quizCard : styles.testCard,
              test.id === 'daily-quiz' && showPulse && { transform: [{ scale: pulseAnimation }] }
            ]}
          >
            <TouchableOpacity
              style={styles.testCardTouchable}
              onPress={() => handleStartTest(test)}
              activeOpacity={0.8}
            >
              {/* Fun Card Design */}
              <View style={styles.funCardContent}>
                {/* Type Badge */}
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: test.id === 'daily-quiz' ? Colors.success + '30' : Colors.primary + '30' }
                ]}>
                  <Text style={[
                    styles.typeBadgeText,
                    { color: test.id === 'daily-quiz' ? Colors.success : Colors.primary }
                  ]}>
                    {test.id === 'daily-quiz' ? 'QUIZ' : 'TEST'}
                  </Text>
                </View>
                
                {/* Icon and Title Row */}
                <View style={styles.iconTitleRow}>
                  <View style={[
                    styles.testIcon,
                    { backgroundColor: test.id === 'daily-quiz' ? Colors.success + '35' : Colors.primary + '35' }
                  ]}>
                    {test.id === 'daily-quiz' ? (
                      <Calendar size={24} color={Colors.success} />
                    ) : (
                      <Target size={24} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.titleSection}>
                    <Text style={styles.funTestTitle}>{test.title}</Text>
                    <Text style={styles.funTestSubtitle}>{test.description}</Text>
                  </View>
                </View>

                {/* Quick Stats Row */}
                <View style={styles.quickStatsRow}>
                  <View style={styles.quickStat}>
                    <Clock size={16} color={Colors.textSecondary} />
                    <Text style={styles.quickStatText}>{test.timeLimit}</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <Target size={16} color={Colors.textSecondary} />
                    <Text style={styles.quickStatText}>{test.questions} questions</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <View style={[
                      styles.difficultyChip,
                      { backgroundColor: getDifficultyColor(test.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyChipText,
                        { color: getDifficultyColor(test.difficulty) }
                      ]}>
                        {test.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Time Limit Info */}
                <View style={styles.timeLimitInfo}>
                  <Text style={styles.timeLimitText}>
                    ⏱️ Timed test - {test.timeLimit} limit
                  </Text>
                </View>



                              {/* Progress or Action */}
              {loading ? (
                <View style={styles.progressSection}>
                  <Text style={styles.loadingText}>Loading stats...</Text>
                </View>
              ) : test.bestScore ? (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Your Best Score</Text>
                    <Text style={styles.progressScore}>{test.bestScore}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage(test)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.attemptsText}>{test.attempts} attempts</Text>
                </View>
              ) : (
                <View style={styles.actionSection}>
                  {(() => {
                    const limit = attemptLimits[test.id];
                    const isExhausted = limit && limit.current >= limit.max;
                    
                    if (isExhausted) {
                      return (
                        <View style={styles.lockedSection}>
                          <View style={styles.lockedIcon}>
                            <Text style={styles.lockedIconText}>🔒</Text>
                          </View>
                          <Text style={styles.lockedTitle}>Attempts Exhausted</Text>
                          <Text style={styles.lockedMessage}>
                            {test.id === 'sample-test' 
                              ? `You've used all ${limit.max} attempts for this month.`
                              : 'You\'ve completed today\'s quiz.'
                            }
                          </Text>
                          {limit.resetDate && (
                            <Text style={styles.resetInfo}>
                              {test.id === 'sample-test' 
                                ? `Resets on ${new Date(limit.resetDate).toLocaleDateString()}`
                                : 'Resets daily at midnight'
                              }
                            </Text>
                          )}
                        </View>
                      );
                    }
                    
                    return (
                      <TouchableOpacity 
                        style={[
                          styles.funStartButton,
                          { backgroundColor: test.id === 'daily-quiz' ? Colors.success : Colors.primary }
                        ]}
                        onPress={() => handleStartTest(test)}
                      >
                        <Play size={18} color={Colors.white} />
                        <Text style={styles.funStartButtonText}>
                          {test.id === 'daily-quiz' ? 'Start Daily Quiz' : 'Start Sample Test'}
                        </Text>
                        <ArrowRight size={18} color={Colors.white} />
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* OACP Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          Master the OACP Certificate test with our comprehensive practice suite. Practice with realistic questions and track your progress to prepare effectively for your police officer application.
        </Text>
      </View>

      {/* Encouraging Tips */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Lightbulb size={20} color={Colors.primary} />
          <Text style={styles.tipsTitle}>You've Got This! 💪</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>🎯</Text>
            <Text style={styles.tipText}>Start with the Daily Quiz - it's just 5 quick questions to build confidence!</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>📚</Text>
            <Text style={styles.tipText}>Take the Sample Test when you're ready - it's the full experience without pressure</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>🔄</Text>
            <Text style={styles.tipText}>Don't worry about mistakes - they're just stepping stones to success</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>⏰</Text>
            <Text style={styles.tipText}>Take your time - there's no rush, and practice makes perfect!</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeLeft: {
    flex: 1,
    marginRight: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactHeader: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },


  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.gray[200],
  },

  testsContainer: {
    marginBottom: 16,
  },
  testsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: Colors.primary + '25',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  quizCard: {
    backgroundColor: Colors.success + '25',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  testCardTouchable: {
    flex: 1,
  },
  funCardContent: {
    gap: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
  },
  funTestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  funTestSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  difficultyChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  funStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  funStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeLimitInfo: {
    marginTop: 6,
    padding: 6,
    backgroundColor: Colors.primary + '10',
    borderRadius: 6,
    alignItems: 'center',
  },
  timeLimitText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  lockedSection: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  lockedIcon: {
    marginBottom: 6,
  },
  lockedIconText: {
    fontSize: 20,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  lockedMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  resetInfo: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testHeaderLeft: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  testHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.warning,
  },
  testDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  attemptsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionSection: {
    marginTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  startButtonPremium: {
    backgroundColor: Colors.warning + '20',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  startButtonTextPremium: {
    color: Colors.warning,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default OACPPracticeHub;

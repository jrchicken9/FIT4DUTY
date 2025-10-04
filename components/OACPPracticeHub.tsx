import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
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
  Smile,
  Edit3,
  FileText,
  Building2,
  MapPin,
  Heart,
  User,
  Eye,
  ChevronDown,
  ChevronUp,
  HelpCircle
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
  const [activeTab, setActiveTab] = useState<'overview' | 'practice'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { width } = Dimensions.get('window');

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

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* OACP Hero Card */}
      <View style={styles.oacpHeroSection}>
        <View style={styles.oacpHeroIcon}>
          <Target size={32} color={Colors.white} strokeWidth={2} />
        </View>
        <Text style={styles.oacpHeroTitle}>OACP Testing & Certification</Text>
        <Text style={styles.oacpHeroSubtitle}>
          Master the Ontario Association of Chiefs of Police certification test
        </Text>
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={styles.enhancedTabContainer}>
        <View style={styles.tabBackground}>
          {[
            { key: 'overview', label: 'Overview', icon: Target },
            { key: 'practice', label: 'Practice', icon: Edit3 },
          ].map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.enhancedTabButton,
                activeTab === tab.key && styles.enhancedTabButtonActive,
                index === 0 && styles.firstTab,
                index === 1 && styles.lastTab,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabIconContainer,
                activeTab === tab.key && styles.tabIconContainerActive
              ]}>
                <tab.icon 
                  size={20} 
                  color={activeTab === tab.key ? Colors.white : Colors.gray[500]} 
                />
              </View>
              <Text style={[
                styles.enhancedTabButtonText,
                activeTab === tab.key && styles.enhancedTabButtonTextActive
              ]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          {/* Key Assessment Areas Grid */}
          <View style={styles.competenciesGrid}>
            <Text style={styles.gridTitle}>Test Components</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Brain size={20} color={Colors.primary} />
                </View>
                <Text style={styles.gridLabel}>Cognitive Ability</Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Users size={20} color={Colors.primary} />
                </View>
                <Text style={styles.gridLabel}>Interpersonal Skills</Text>
              </View>
                <View style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <Target size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>Police Knowledge</Text>
                </View>
              <View style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Lightbulb size={20} color={Colors.primary} />
                </View>
                <Text style={styles.gridLabel}>Problem Solving</Text>
              </View>
            </View>
          </View>

          {/* Test Process Overview */}
          <View style={styles.processSection}>
            <Text style={styles.processTitle}>Test Structure</Text>
            <View style={styles.processSteps}>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Registration</Text>
                  <Text style={styles.stepDescription}>Register with OACP and pay the certification fee</Text>
                </View>
              </View>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Written Test</Text>
                  <Text style={styles.stepDescription}>Complete the comprehensive written examination</Text>
                </View>
              </View>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Certification</Text>
                  <Text style={styles.stepDescription}>Receive your OACP certification upon passing</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Preparation Tips */}
          <View style={styles.quickTipsSection}>
            <Text style={styles.quickTipsTitle}>Preparation Strategy</Text>
            <View style={styles.tipsGrid}>
              <View style={styles.tipCard}>
                <Brain size={16} color={Colors.primary} />
                <Text style={styles.tipCardText}>Study cognitive patterns</Text>
              </View>
              <View style={styles.tipCard}>
                <Clock size={16} color={Colors.primary} />
                <Text style={styles.tipCardText}>Practice time management</Text>
              </View>
              <View style={styles.tipCard}>
                <BookOpen size={16} color={Colors.primary} />
                <Text style={styles.tipCardText}>Review police procedures</Text>
              </View>
              <View style={styles.tipCard}>
                <Target size={16} color={Colors.primary} />
                <Text style={styles.tipCardText}>Take practice tests</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Practice Tab Content */}
      {activeTab === 'practice' && (
        <View style={styles.tabContent}>
          {/* Practice Tests Section */}
          <View style={styles.practiceContent}>
            <View style={styles.competenciesSection}>
              <View style={styles.sectionHeader}>
                <Target size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Practice Tests</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose your practice style and track your progress
              </Text>
              
              {practiceTests.map((test) => {
                const isExpanded = expandedSections.has(test.id);
                
                return (
                  <View
                    key={test.id}
                    style={[
                      styles.enhancedTestCard,
                      test.bestScore ? styles.testCardCompleted : {}
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.testMainHeader}
                      onPress={() => toggleSectionExpansion(test.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.testHeaderContent}>
                        <View style={[
                          styles.testIcon,
                          { backgroundColor: test.id === 'daily-quiz' ? Colors.success : Colors.primary }
                        ]}>
                          {test.id === 'daily-quiz' ? (
                            <Calendar size={24} color={Colors.white} strokeWidth={2} />
                          ) : (
                            <Target size={24} color={Colors.white} strokeWidth={2} />
                          )}
                        </View>
                        
                        <View style={styles.testInfo}>
                          <Text style={styles.testTitle}>{test.title}</Text>
                          
                          <View style={styles.testStatusRow}>
                            <View style={[
                              styles.testStatusBadge,
                              {
                                backgroundColor: test.bestScore ? Colors.success + '20' : Colors.gray[100],
                                borderColor: test.bestScore ? Colors.success : Colors.gray[200]
                              }
                            ]}>
                              <View style={[
                                styles.statusIndicator,
                                {
                                  backgroundColor: test.bestScore ? Colors.success : Colors.gray[400]
                                }
                              ]} />
                              <Text style={[
                                styles.statusText,
                                {
                                  color: test.bestScore ? Colors.success : Colors.gray[600]
                                }
                              ]}>
                                {test.bestScore ? 'Completed' : 'Available'}
                              </Text>
                            </View>
                          </View>
                          
                          <Text style={styles.testDescription}>{test.description}</Text>
                        </View>
                        
                        <TouchableOpacity style={styles.expandIcon}>
                          {isExpanded ? (
                            <ChevronUp size={20} color={Colors.gray[500]} />
                          ) : (
                            <ChevronDown size={20} color={Colors.gray[500]} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <View style={styles.testExpandedContent}>
                        <View style={styles.testDetailsSection}>
                          <Text style={styles.detailsLabel}>Test Details</Text>
                          <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                              <Clock size={16} color={Colors.primary} />
                              <Text style={styles.detailText}>{test.timeLimit}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Target size={16} color={Colors.primary} />
                              <Text style={styles.detailText}>{test.questions} questions</Text>
                            </View>
                            <View style={styles.detailItem}>
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
                        </View>
                        
                        <View style={styles.testActions}>
                          <View style={styles.verticalActions}>
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
                                        styles.fullWidthButton,
                                        { backgroundColor: test.id === 'daily-quiz' ? Colors.success : Colors.primary }
                                      ]}
                                      onPress={() => handleStartTest(test)}
                                    >
                                      <View style={styles.buttonContent}>
                                        <Play size={16} color={Colors.white} />
                                        <Text style={styles.buttonText}>
                                          {test.id === 'daily-quiz' ? 'Start Daily Quiz' : 'Start Sample Test'}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })()}
                              </View>
                            )}
                            
                            <View style={styles.horizontalActions}>
                              <TouchableOpacity
                                style={styles.halfWidthButton}
                                onPress={() => {
                                  // Handle tips
                                }}
                                activeOpacity={0.8}
                              >
                                <View style={styles.buttonContent}>
                                  <HelpCircle size={14} color={Colors.white} />
                                  <Text style={styles.buttonText}>Tips</Text>
                                </View>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={styles.halfWidthButton}
                                onPress={() => {
                                  // Handle review
                                }}
                                activeOpacity={0.8}
                              >
                                <View style={styles.buttonContent}>
                                  <BookOpen size={14} color={Colors.white} />
                                  <Text style={styles.buttonText}>Review</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  // OACP Hero Section
  oacpHeroSection: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  oacpHeroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  oacpHeroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  oacpHeroSubtitle: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
    opacity: 0.9,
    letterSpacing: 0.1,
  },
  // Enhanced Tab Navigation
  enhancedTabContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enhancedTabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  enhancedTabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  firstTab: {
    marginRight: 3,
  },
  lastTab: {
    marginLeft: 3,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  enhancedTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  enhancedTabButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  tabContent: {
    flex: 1,
  },
  // Grid Layout
  competenciesGrid: {
    marginBottom: 24,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  // Process Section
  processSection: {
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  processSteps: {
    gap: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  // Quick Tips Section
  quickTipsSection: {
    marginBottom: 24,
  },
  quickTipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  tipCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 60,
  },
  tipCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  // Practice Content
  practiceContent: {
    gap: 20,
  },
  competenciesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  // Enhanced Test Cards
  enhancedTestCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  testCardCompleted: {
    borderWidth: 2,
    borderColor: Colors.success,
    shadowColor: Colors.success,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  testMainHeader: {
    padding: 16,
    maxWidth: '100%',
  },
  testHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '100%',
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testInfo: {
    flex: 1,
    maxWidth: '100%',
  },
  testTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
    lineHeight: 22,
    marginBottom: 4,
  },
  testStatusRow: {
    marginBottom: 8,
  },
  testStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '400',
    letterSpacing: 0.1,
    flexWrap: 'wrap',
  },
  expandIcon: {
    marginLeft: 12,
    padding: 4,
  },
  testExpandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: Colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    maxWidth: '100%',
  },
  testDetailsSection: {
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    color: Colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.1,
  },
  testActions: {
    marginTop: 8,
  },
  verticalActions: {
    gap: 12,
  },
  horizontalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  halfWidthButton: {
    backgroundColor: Colors.gray[600],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: Colors.gray[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  // Progress and Stats
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
  difficultyChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
});

export default OACPPracticeHub;

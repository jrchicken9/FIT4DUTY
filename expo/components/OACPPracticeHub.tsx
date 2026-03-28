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
  Modal,
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
  ChevronRight,
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
  HelpCircle,
  X,
  CreditCard,
  FileCheck,
  Monitor,
  Mail
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
  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const { user } = useAuth();
  const { width } = Dimensions.get('window');

  const stepData = [
    {
      id: 1,
      title: 'Purchase Package',
      icon: CreditCard,
      description: 'Purchase the OACP Certificate package from the official OACP website. The package includes all necessary forms, instructions, and access to the online testing platform.',
      details: [
        'Package includes all necessary forms, instructions, and testing platform access',
        'Secure payment processing with confirmation email delivery'
      ],
      timeline: '5-10 minutes online',
      requirements: [
        'Valid credit/debit card or PayPal account',
        'Email address for instructions delivery',
        'Complete mailing address',
        'Reliable internet connection'
      ],
      navigationSteps: [
        {
          title: 'Go to OACP Certificate Website',
          description: 'Visit https://www.oacpcertificate.ca/ in your web browser',
          icon: '🌐'
        },
        {
          title: 'Click "Apply Now" or "Purchase Certificate"',
          description: 'Look for the main application button on the homepage',
          icon: '📝'
        },
        {
          title: 'Fill Out Application Form',
          description: 'Complete your personal information, contact details, and preferences',
          icon: '✍️'
        },
        {
          title: 'Review Package Contents',
          description: 'Confirm you understand what\'s included in the $250 CAD package',
          icon: '📋'
        },
        {
          title: 'Proceed to Payment',
          description: 'Enter payment information securely through their payment processor',
          icon: '💳'
        },
        {
          title: 'Receive Confirmation',
          description: 'Save your confirmation email - instructions will arrive within 1 business day',
          icon: '📧'
        }
      ],
      helpfulTips: [
        'Have your payment method ready before starting the application',
        'Double-check your email address - this is where instructions will be sent',
        'Save a screenshot of your confirmation page for your records',
        'Check your spam folder if you don\'t receive the email within 24 hours',
        'The $250 CAD fee is non-refundable, so ensure you\'re ready to proceed'
      ]
    },
    {
      id: 2,
      title: 'Submit Part A Documents',
      icon: FileCheck,
      description: 'Part A involves submitting essential administrative forms and preparatory artifacts that verify your eligibility and readiness for the OACP Certificate process. These documents establish your commitment to the process and provide necessary background information.',
      details: [
        'Complete all required forms with accurate information',
        'Submit documents within the specified timeframe',
        'Ensure all signatures and dates are properly filled out',
        'Keep copies of all submitted documents for your records'
      ],
      timeline: '1-2 weeks processing after submission',
      requirements: [
        'Valid email address for communication',
        'Ability to complete forms and submit digitally'
      ],
      documentTypes: [
        {
          id: 'consent',
          title: 'Consent & Applicant Code of Conduct',
          description: 'Legal agreement acknowledging OACP terms and ethical guidelines',
          requirements: [
            'Sign and date the form',
            'Email back to OACP within 24 hours of receipt',
            'Read and understand all terms and conditions',
            'Acknowledge commitment to ethical standards'
          ],
          timeline: 'Immediate upon receipt',
          icon: '📋',
          critical: true
        },
        {
          id: 'fitness',
          title: 'Fitness Log',
          description: '14-day consecutive tracking of physical activity, rest, and sleep patterns',
          requirements: [
            'Track for minimum 14 consecutive days',
            'Include workout details, duration, and intensity',
            'Record sleep hours and quality',
            'Note rest days and recovery activities',
            'Valid for 1 month from completion date'
          ],
          timeline: '14 consecutive days',
          icon: '🏃‍♂️',
          critical: true
        },
        {
          id: 'medical',
          title: 'Medical Examination Package',
          description: 'Vision and hearing assessments by certified Canadian specialists',
          requirements: [
            'Completed by Canadian eye-care specialist',
            'Completed by audiologist or hearing-instrument specialist',
            'Not by family doctor or military physician',
            'Valid for 2 years from examination date',
            'May be required by police services (not mandatory for OACP Certificate)'
          ],
          timeline: 'Schedule within 2 weeks of receipt',
          icon: '👁️',
          critical: false
        }
      ],
      submissionSteps: [
        {
          title: 'Review Part A Email Package',
          description: 'Carefully read all instructions and requirements sent to your email',
          icon: '📧'
        },
        {
          title: 'Complete Consent Form',
          description: 'Sign and email back the Consent & Applicant Code of Conduct within 24 hours of receipt',
          icon: '✍️'
        },
        {
          title: 'Start Fitness Logging',
          description: 'Begin your 14-day consecutive fitness tracking immediately',
          icon: '📊'
        },
        {
          title: 'Schedule Medical Exams',
          description: 'Book appointments with certified Canadian specialists',
          icon: '🏥'
        },
        {
          title: 'Submit Remaining Documents',
          description: 'Email your completed 14-day Fitness Log and Medical Examination results to OACP',
          icon: '📤'
        },
        {
          title: 'Await Confirmation',
          description: 'Wait for processing confirmation and proctor registration link',
          icon: '⏳'
        }
      ],
      helpfulTips: [
        'Start your fitness log immediately upon receiving Part A package',
        'Book medical appointments early as specialists may have long wait times',
        'Keep digital copies of all submitted documents',
        'Respond to any follow-up requests from OACP promptly',
        'The medical examination is not required for the OACP Certificate but may be needed for police service applications'
      ]
    },
    {
      id: 3,
      title: 'Complete Parts B & C',
      icon: Monitor,
      description: 'Complete the Sigma Survey for Police Officers (SSPO) and Personality Research Form – Revised (PRF-R) in a single proctored session. These assessments evaluate your cognitive abilities and personality traits for police work suitability.',
      details: [
        'Single proctored session with live-online monitoring via eProctor Canada',
        'Results used comparatively by police services - no pass/fail grades'
      ],
      timeline: '60-90 minutes total testing time',
      requirements: [
        'Reliable high-speed internet connection (minimum 25 Mbps)',
        'Quiet, uninterrupted testing environment',
        'Valid government-issued photo ID',
        'Webcam and microphone for proctoring',
        'Private space free from distractions',
        'Computer or laptop (tablets/phones not permitted)',
        'Chrome, Firefox, or Safari browser (latest version)'
      ],
      testComponents: [
        {
          id: 'sspo',
          title: 'Sigma Survey for Police Officers (SSPO)',
          description: 'Standardized cognitive assessment measuring reasoning, problem-solving, and analytical abilities essential for police work.',
          duration: '45-60 minutes',
          questionTypes: ['Verbal reasoning', 'Numerical reasoning', 'Abstract reasoning', 'Logical thinking'],
          icon: '🧠',
          critical: true
        },
        {
          id: 'prf-r',
          title: 'Personality Research Form – Revised (PRF-R)',
          description: 'Personality assessment specifically designed for policing that evaluates traits, values, and behavioral tendencies relevant to law enforcement.',
          duration: '15-30 minutes',
          questionTypes: ['Personality traits', 'Behavioral tendencies', 'Value systems', 'Work preferences'],
          icon: '👤',
          critical: true
        }
      ],
      preparationSteps: [
        {
          title: 'Set Up Testing Environment',
          description: 'Prepare a quiet, well-lit room with reliable internet and proper equipment',
          icon: '🏠'
        },
        {
          title: 'Test Your Technology',
          description: 'Verify internet speed, webcam, microphone, and browser compatibility',
          icon: '🔧'
        },
        {
          title: 'Review Study Materials',
          description: 'Use the study information provided in your Part B/C email package',
          icon: '📚'
        },
        {
          title: 'Register with eProctor',
          description: 'Complete proctor registration within 24 hours of receiving the link',
          icon: '👨‍💼'
        },
        {
          title: 'Schedule Your Session',
          description: 'Book your testing appointment within the 6-month completion window',
          icon: '📅'
        },
        {
          title: 'Complete Pre-Check',
          description: 'Run system check and identity verification before testing begins',
          icon: '✅'
        }
      ],
      testingProcess: [
        {
          title: 'Identity Verification',
          description: 'Present valid ID and complete identity verification with proctor',
          icon: '🆔'
        },
        {
          title: 'Environment Check',
          description: 'Proctor verifies testing environment meets requirements',
          icon: '🔍'
        },
        {
          title: 'Sigma Survey for Police Officers (SSPO)',
          description: 'Complete the 45-60 minute cognitive ability assessment',
          icon: '🧠'
        },
        {
          title: 'Short Break (Optional)',
          description: 'Brief break between tests if needed (5-10 minutes)',
          icon: '☕'
        },
        {
          title: 'PRF-R Personality Test',
          description: 'Complete the 15-30 minute personality assessment',
          icon: '👤'
        },
        {
          title: 'Session Completion',
          description: 'Confirm completion with proctor and receive confirmation',
          icon: '🏁'
        }
      ],
      helpfulTips: [
        'Test early in the day when you\'re most alert and focused',
        'Have water and light snacks nearby (approved by proctor)',
        'Use the bathroom before starting - breaks are limited',
        'Read all questions carefully - there are no trick questions',
        'Answer honestly on personality assessment - consistency is key',
        'Stay calm if you encounter technical issues - proctor can help',
        'Results are typically available within 2-3 business days',
        'Practice with similar cognitive tests to familiarize yourself with the format'
      ]
    },
    {
      id: 4,
      title: 'Receive Certificate',
      icon: Mail,
      description: 'Congratulations! Your OACP Certificate will be emailed to you upon successful completion of all requirements. The certificate is valid for 12 months and can be used for police service applications across Ontario.',
      details: [
        'Digital certificate delivered via secure email with unique verification code',
        'Accepted by all Ontario police services for recruitment'
      ],
      timeline: '2-15 business days after completion',
      requirements: [
        'Valid email address for certificate delivery',
        'Successful completion of all previous steps'
      ],
      deliveryProcess: [
        {
          title: 'Results Processing',
          description: 'OACP reviews and processes your test results and submitted documents',
          icon: '📊'
        },
        {
          title: 'Certificate Generation',
          description: 'Your personalized certificate is created with unique verification code',
          icon: '🏆'
        },
        {
          title: 'Quality Assurance',
          description: 'Certificate undergoes final review and verification',
          icon: '✅'
        },
        {
          title: 'Email Delivery',
          description: 'Certificate is sent to your registered email address',
          icon: '📧'
        }
      ],
      certificateDetails: [
        {
          id: 'validity',
          title: 'Certificate Validity',
          description: 'Your OACP Certificate is valid for exactly 12 months from the issue date',
          details: ['Start date: Certificate issue date', 'Expiry date: 12 months later', 'Re-testing window: Opens 10 months after expiry'],
          icon: '📅',
          important: true
        },
        {
          id: 'usage',
          title: 'Using Your Certificate',
          description: 'Apply to any Ontario police service using your OACP Certificate',
          details: ['Include certificate in job applications', 'Provide verification code when requested', 'Keep digital copy for your records'],
          icon: '👮',
          important: true
        },
        {
          id: 'retesting',
          title: 'Re-testing Process',
          description: 'If your certificate expires, you can re-test after 10 months',
          details: ['No waiting period required', 'Full process must be repeated', 'New certificate issued upon completion'],
          icon: '🔄',
          important: false
        }
      ],
      helpfulTips: [
        'Save your certificate email and download the PDF immediately',
        'Keep your verification code in a safe place - you\'ll need it for applications',
        'Check your spam folder if you don\'t receive the certificate within 15 days',
        'Print a physical copy for your records and job applications',
        'The certificate is valid immediately upon receipt - no waiting period',
        'Contact OACP support if you have any issues with certificate delivery',
        'Your certificate can be used for multiple police service applications simultaneously',
        'Make note of your certificate expiry date to plan for re-testing if needed'
      ]
    }
  ];

  const handleStepPress = (stepId: number) => {
    setSelectedStep(stepId);
    setShowStepModal(true);
  };

  const closeStepModal = () => {
    setShowStepModal(false);
    setSelectedStep(null);
  };

  const closeComponentModal = () => {
    setShowComponentModal(false);
    setSelectedComponent(null);
  };

  const componentData: { [key: string]: {
    title: string;
    icon: string;
    description: string;
    duration: string;
    questionTypes: string[];
    details: string[];
    tips: string[];
  } } = {
    'sspo': {
      title: 'Sigma Survey for Police Officers (SSPO)',
      icon: '🧠',
      description: 'Standardized cognitive assessment measuring reasoning, problem-solving, and analytical abilities essential for police work.',
      duration: '45-60 minutes',
      questionTypes: ['Verbal reasoning', 'Numerical reasoning', 'Abstract reasoning', 'Logical thinking'],
      details: [
        'Measures cognitive abilities through multiple-choice questions',
        'Evaluates problem-solving skills and analytical thinking',
        'Assesses verbal comprehension and numerical reasoning',
        'Tests abstract reasoning and pattern recognition abilities',
        'No pass/fail grade - results used comparatively by police services'
      ],
      tips: [
        'Read each question carefully and consider all answer choices',
        'Manage your time - don\'t spend too long on difficult questions',
        'Practice with similar cognitive tests to familiarize yourself',
        'Stay calm and focused throughout the assessment',
        'Answer every question - there\'s no penalty for guessing'
      ]
    },
    'prf-r': {
      title: 'Personality Research Form – Revised (PRF-R)',
      icon: '👤',
      description: 'Personality assessment specifically designed for policing that evaluates traits, values, and behavioral tendencies relevant to law enforcement.',
      duration: '15-30 minutes',
      questionTypes: ['Personality traits', 'Behavioral tendencies', 'Value systems', 'Work preferences'],
      details: [
        'Evaluates personality traits relevant to policing',
        'Assesses behavioral tendencies in various situations',
        'Measures value systems and ethical frameworks',
        'Tests work preferences and team collaboration styles',
        'Designed specifically for law enforcement careers'
      ],
      tips: [
        'Answer honestly - consistency is more important than "perfect" answers',
        'Think about how you typically behave in real situations',
        'Don\'t overthink - go with your first instinct',
        'Be consistent throughout the assessment',
        'Remember there are no right or wrong answers - just honest ones'
      ]
    }
  };

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
    <View style={styles.container}>
      {/* Compact Header with Info */}
      <View style={styles.compactHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Target size={24} color={Colors.white} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>OACP Testing & Certification</Text>
              <Text style={styles.headerSubtitle}>Police applicant pre-screening</Text>
            </View>
          </View>
        </View>
        
        {/* Compact Info Bar - Moved below title */}
        <View style={styles.compactInfoBar}>
          <View style={styles.compactInfoItem}>
            <Award size={14} color={Colors.white} />
            <Text style={styles.compactInfoText}>$250</Text>
          </View>
          <View style={styles.compactInfoItem}>
            <Calendar size={14} color={Colors.white} />
            <Text style={styles.compactInfoText}>12mo</Text>
          </View>
          <View style={styles.compactInfoItem}>
            <Clock size={14} color={Colors.white} />
            <Text style={styles.compactInfoText}>6mo</Text>
          </View>
        </View>
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
          {/* Requirements Cards */}
          <View style={styles.keyInfoSection}>
            <Text style={styles.requirementsSectionTitle}>Certificate Requirements</Text>
            
            {/* Documents Row - 3 cards */}
            <View style={styles.infoCardRow}>
              <View style={[styles.infoCard, styles.highlightCard, styles.threeCardRow]}>
                <View style={styles.infoCardIcon}>
                  <FileCheck size={24} color={Colors.white} />
                </View>
                <Text style={styles.infoCardTitle}>Consent Form</Text>
                <Text style={styles.infoCardSubtitle}>Signed agreement</Text>
              </View>
              <View style={[styles.infoCard, styles.highlightCard, styles.threeCardRow]}>
                <View style={styles.infoCardIcon}>
                  <Target size={24} color={Colors.white} />
                </View>
                <Text style={styles.infoCardTitle}>Fitness Log</Text>
                <Text style={styles.infoCardSubtitle}>14 consecutive days</Text>
              </View>
              <View style={[styles.infoCard, styles.highlightCard, styles.threeCardRow]}>
                <View style={styles.infoCardIcon}>
                  <Eye size={24} color={Colors.white} />
                </View>
                <Text style={styles.infoCardTitle}>Medical Exam</Text>
                <Text style={styles.infoCardSubtitle}>Vision & Hearing</Text>
              </View>
            </View>

            {/* Test Components Row - 2 cards centered */}
            <View style={styles.testComponentsSection}>
              <Text style={styles.testComponentsLabel}>Test Components:</Text>
              <View style={[styles.infoCardRow, styles.centeredRow]}>
                <TouchableOpacity 
                  style={[styles.infoCard, styles.highlightCard, styles.clickableCard, styles.centeredCard]}
                  onPress={() => {
                    setSelectedComponent('sspo');
                    setShowComponentModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.infoCardIcon}>
                    <Brain size={24} color={Colors.white} />
                  </View>
                  <Text style={styles.infoCardTitle}>SSPO Test</Text>
                  <Text style={styles.infoCardSubtitle}>Sigma Survey for Police Officers</Text>
                  <View style={styles.clickableIndicator}>
                    <ChevronRight size={16} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.infoCard, styles.highlightCard, styles.clickableCard, styles.centeredCard]}
                  onPress={() => {
                    setSelectedComponent('prf-r');
                    setShowComponentModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.infoCardIcon}>
                    <User size={24} color={Colors.white} />
                  </View>
                  <Text style={styles.infoCardTitle}>PRF-R Test</Text>
                  <Text style={styles.infoCardSubtitle}>Personality Research Form – Revised</Text>
                  <View style={styles.clickableIndicator}>
                    <ChevronRight size={16} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>


          {/* Step-by-Step Process */}
          <View style={styles.processSection}>
            <Text style={styles.processTitle}>Step-by-Step Process</Text>
            <Text style={styles.processSubtitle}>Tap any step for detailed information</Text>
            <View style={styles.processSteps}>
              {stepData.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <TouchableOpacity
                    key={step.id}
                    style={styles.processStep}
                    onPress={() => handleStepPress(step.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stepNumberContainer}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{step.id}</Text>
                      </View>
                      {index < stepData.length - 1 && <View style={styles.stepConnector} />}
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <IconComponent size={20} color={Colors.primary} />
                      </View>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      <View style={styles.stepTimeline}>
                        <Clock size={14} color={Colors.textSecondary} />
                        <Text style={styles.stepTimelineText}>{step.timeline}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>


          {/* Success Tips */}
          <View style={styles.quickTipsSection}>
            <Text style={styles.quickTipsTitle}>Success Tips</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Clock size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Register your proctor account within 24 hours of the email</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Target size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Plan for one 60-90 min sitting; test in a quiet space</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <BookOpen size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Use the study info in your Part B/C email to prep</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Timer size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Track timelines: 6-month completion window; fitness log valid 1 month; medical valid 2 years; certificate valid 12 months; re-test after 10 months</Text>
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

      {/* Step Detail Modal */}
      <Modal
        visible={showStepModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeStepModal}
      >
        <View style={styles.modalContainer}>
          {selectedStep && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalStepNumber}>
                    <Text style={styles.modalStepNumberText}>{selectedStep}</Text>
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {stepData.find(step => step.id === selectedStep)?.title}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Step {selectedStep} of {stepData.length}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeStepModal}
                  activeOpacity={0.7}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {(() => {
                  const step = stepData.find(s => s.id === selectedStep);
                  if (!step) return null;
                  
                  const IconComponent = step.icon;
                  
                  return (
                    <>
                      <View style={styles.modalIconContainer}>
                        <View style={styles.modalIcon}>
                          <IconComponent size={32} color={Colors.primary} />
                        </View>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Overview</Text>
                        <Text style={styles.modalSectionContent}>{step.description}</Text>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Timeline</Text>
                        <View style={styles.modalTimelineContainer}>
                          <Clock size={18} color={Colors.primary} />
                          <Text style={styles.modalTimelineText}>{step.timeline}</Text>
                        </View>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Key Details</Text>
                        <View style={styles.modalDetailsList}>
                          {step.details.map((detail, index) => (
                            <View key={index} style={styles.modalDetailItem}>
                              <View style={styles.modalDetailBullet} />
                              <Text style={styles.modalDetailText}>{detail}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {step.navigationSteps && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Step-by-Step Navigation</Text>
                          <View style={styles.modalNavigationList}>
                            {step.navigationSteps.map((navStep, index) => (
                              <View key={index} style={styles.modalNavigationItem}>
                                <View style={styles.modalNavigationNumber}>
                                  <Text style={styles.modalNavigationNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.modalNavigationContent}>
                                  <View style={styles.modalNavigationHeader}>
                                    <Text style={styles.modalNavigationTitle}>{navStep.title}</Text>
                                    <Text style={styles.modalNavigationIcon}>{navStep.icon}</Text>
                                  </View>
                                  <Text style={styles.modalNavigationDescription}>{navStep.description}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.documentTypes && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Required Documents</Text>
                          <View style={styles.modalDocumentTypesList}>
                            {step.documentTypes.map((docType, index) => (
                              <View key={index} style={styles.modalDocumentTypeItem}>
                                <View style={styles.modalDocumentTypeHeader}>
                                  <View style={styles.modalDocumentTypeTitleRow}>
                                    <Text style={styles.modalDocumentTypeIcon}>{docType.icon}</Text>
                                    <Text style={styles.modalDocumentTypeTitle}>{docType.title}</Text>
                                    {docType.critical && (
                                      <View style={styles.modalCriticalBadge}>
                                        <Text style={styles.modalCriticalText}>Required</Text>
                                      </View>
                                    )}
                                  </View>
                                  <View style={styles.modalDocumentTimeline}>
                                    <Clock size={12} color={Colors.textSecondary} />
                                    <Text style={styles.modalDocumentTimelineText}>{docType.timeline}</Text>
                                  </View>
                                </View>
                                <Text style={styles.modalDocumentTypeDescription}>{docType.description}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.submissionSteps && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Submission Process</Text>
                          <View style={styles.modalSubmissionStepsList}>
                            {step.submissionSteps.map((subStep, index) => (
                              <View key={index} style={styles.modalSubmissionStepItem}>
                                <View style={styles.modalSubmissionStepNumber}>
                                  <Text style={styles.modalSubmissionStepNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.modalSubmissionStepContent}>
                                  <View style={styles.modalSubmissionStepHeader}>
                                    <Text style={styles.modalSubmissionStepTitle}>{subStep.title}</Text>
                                    <Text style={styles.modalSubmissionStepIcon}>{subStep.icon}</Text>
                                  </View>
                                  <Text style={styles.modalSubmissionStepDescription}>{subStep.description}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.testComponents && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Test Components</Text>
                          <View style={styles.modalDocumentTypesList}>
                            {step.testComponents.map((testComp, index) => (
                              <View key={index} style={styles.modalDocumentTypeItem}>
                                <View style={styles.modalDocumentTypeHeader}>
                                  <View style={styles.modalDocumentTypeTitleRow}>
                                    <Text style={styles.modalDocumentTypeIcon}>{testComp.icon}</Text>
                                    <Text style={styles.modalDocumentTypeTitle}>{testComp.title}</Text>
                                    {testComp.critical && (
                                      <View style={styles.modalCriticalBadge}>
                                        <Text style={styles.modalCriticalText}>Required</Text>
                                      </View>
                                    )}
                                  </View>
                                  <View style={styles.modalDocumentTimeline}>
                                    <Clock size={12} color={Colors.textSecondary} />
                                    <Text style={styles.modalDocumentTimelineText}>{testComp.duration}</Text>
                                  </View>
                                </View>
                                <Text style={styles.modalDocumentTypeDescription}>{testComp.description}</Text>
                                <View style={styles.modalQuestionTypesList}>
                                  {testComp.questionTypes.map((type, typeIndex) => (
                                    <View key={typeIndex} style={styles.modalQuestionTypeItem}>
                                      <View style={styles.modalQuestionTypeBullet} />
                                      <Text style={styles.modalQuestionTypeText}>{type}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.preparationSteps && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Preparation Steps</Text>
                          <View style={styles.modalSubmissionStepsList}>
                            {step.preparationSteps.map((prepStep, index) => (
                              <View key={index} style={styles.modalSubmissionStepItem}>
                                <View style={styles.modalSubmissionStepNumber}>
                                  <Text style={styles.modalSubmissionStepNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.modalSubmissionStepContent}>
                                  <View style={styles.modalSubmissionStepHeader}>
                                    <Text style={styles.modalSubmissionStepTitle}>{prepStep.title}</Text>
                                    <Text style={styles.modalSubmissionStepIcon}>{prepStep.icon}</Text>
                                  </View>
                                  <Text style={styles.modalSubmissionStepDescription}>{prepStep.description}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.testingProcess && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Testing Process</Text>
                          <View style={styles.modalSubmissionStepsList}>
                            {step.testingProcess.map((testStep, index) => (
                              <View key={index} style={styles.modalSubmissionStepItem}>
                                <View style={styles.modalSubmissionStepNumber}>
                                  <Text style={styles.modalSubmissionStepNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.modalSubmissionStepContent}>
                                  <View style={styles.modalSubmissionStepHeader}>
                                    <Text style={styles.modalSubmissionStepTitle}>{testStep.title}</Text>
                                    <Text style={styles.modalSubmissionStepIcon}>{testStep.icon}</Text>
                                  </View>
                                  <Text style={styles.modalSubmissionStepDescription}>{testStep.description}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.deliveryProcess && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Certificate Delivery Process</Text>
                          <View style={styles.modalSubmissionStepsList}>
                            {step.deliveryProcess.map((deliveryStep, index) => (
                              <View key={index} style={styles.modalSubmissionStepItem}>
                                <View style={styles.modalSubmissionStepNumber}>
                                  <Text style={styles.modalSubmissionStepNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.modalSubmissionStepContent}>
                                  <View style={styles.modalSubmissionStepHeader}>
                                    <Text style={styles.modalSubmissionStepTitle}>{deliveryStep.title}</Text>
                                    <Text style={styles.modalSubmissionStepIcon}>{deliveryStep.icon}</Text>
                                  </View>
                                  <Text style={styles.modalSubmissionStepDescription}>{deliveryStep.description}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {step.certificateDetails && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Certificate Information</Text>
                          <View style={styles.modalDocumentTypesList}>
                            {step.certificateDetails.map((certDetail, index) => (
                              <View key={index} style={styles.modalDocumentTypeItem}>
                                <View style={styles.modalDocumentTypeHeader}>
                                  <View style={styles.modalDocumentTypeTitleRow}>
                                    <Text style={styles.modalDocumentTypeIcon}>{certDetail.icon}</Text>
                                    <Text style={styles.modalDocumentTypeTitle}>{certDetail.title}</Text>
                                    {certDetail.important && (
                                      <View style={styles.modalImportantBadge}>
                                        <Text style={styles.modalImportantText}>Important</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                                <Text style={styles.modalDocumentTypeDescription}>{certDetail.description}</Text>
                                <View style={styles.modalQuestionTypesList}>
                                  {certDetail.details.map((detail, detailIndex) => (
                                    <View key={detailIndex} style={styles.modalQuestionTypeItem}>
                                      <View style={styles.modalQuestionTypeBullet} />
                                      <Text style={styles.modalQuestionTypeText}>{detail}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}


                      {step.helpfulTips && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Helpful Tips</Text>
                          <View style={styles.modalTipsList}>
                            {step.helpfulTips.map((tip, index) => (
                              <View key={index} style={styles.modalTipItem}>
                                <View style={styles.modalTipIcon}>
                                  <Lightbulb size={16} color={Colors.primary} />
                                </View>
                                <Text style={styles.modalTipText}>{tip}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>

      {/* Component Detail Modal */}
      <Modal
        visible={showComponentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeComponentModal}
      >
        <View style={styles.modalContainer}>
          {selectedComponent && componentData[selectedComponent] && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalStepNumber}>
                    <Text style={styles.modalStepNumberText}>{componentData[selectedComponent].icon}</Text>
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {componentData[selectedComponent].title}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Test Component Details
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeComponentModal}>
                  <X size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Practice Now Button - Moved to top */}
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={styles.practiceNowButton}
                    onPress={() => {
                      closeComponentModal();
                      setActiveTab('practice');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.practiceNowButtonContent}>
                      <Play size={20} color={Colors.white} />
                      <Text style={styles.practiceNowButtonText}>Practice Now!</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalIconContainer}>
                  <View style={styles.modalIcon}>
                    <Text style={{ fontSize: 40 }}>{componentData[selectedComponent].icon}</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalSectionContent}>
                    {componentData[selectedComponent].description}
                  </Text>
                </View>

                {/* Duration */}
                <View style={styles.modalTimelineContainer}>
                  <Clock size={18} color={Colors.primary} />
                  <Text style={styles.modalTimelineText}>{componentData[selectedComponent].duration}</Text>
                </View>

                {/* Question Types */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Question Types</Text>
                  <View style={styles.modalDetailsList}>
                    {componentData[selectedComponent].questionTypes.map((type: string, index: number) => (
                      <View key={index} style={styles.modalDetailItem}>
                        <View style={styles.modalDetailBullet} />
                        <Text style={styles.modalDetailText}>{type}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>What It Measures</Text>
                  <View style={styles.modalDetailsList}>
                    {componentData[selectedComponent].details.map((detail: string, index: number) => (
                      <View key={index} style={styles.modalDetailItem}>
                        <View style={styles.modalDetailBullet} />
                        <Text style={styles.modalDetailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Tips */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Success Tips</Text>
                  <View style={styles.modalTipsList}>
                    {componentData[selectedComponent].tips.map((tip: string, index: number) => (
                      <View key={index} style={styles.modalTipItem}>
                        <View style={styles.modalTipIcon}>
                          <CheckCircle size={16} color={Colors.success} />
                        </View>
                        <Text style={styles.modalTipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  // Compact Header
  compactHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    flexShrink: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white + 'CC',
    fontWeight: '400',
    letterSpacing: 0.1,
    marginTop: 4,
  },
  compactInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '25',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginTop: 4,
  },
  compactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 2,
  },
  compactInfoText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  // Enhanced Tab Navigation
  enhancedTabContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  tabContent: {
    width: '100%',
  },
  keyInfoSection: {
    marginBottom: 24,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  enhancedTabButtonText: {
    fontSize: 12,
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
  // Key Information Cards
  requirementsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
  },
  clickableCard: {
    position: 'relative',
  },
  clickableIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  infoCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  threeCardRow: {
    flex: 1,
  },
  centeredRow: {
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  centeredCard: {
    flex: 0,
    minWidth: 140,
    maxWidth: 160,
  },
  testComponentsSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  testComponentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.white + '85',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 85,
  },
  highlightCard: {
    backgroundColor: Colors.white + '85',
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  infoCardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.1,
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
  componentsContainer: {
    gap: 12,
  },
  componentCard: {
    backgroundColor: Colors.white + '85',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  componentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  componentContent: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  componentSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  componentDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  // Process Section
  processSection: {
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
  },
  processSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 16,
    letterSpacing: 0.1,
    paddingHorizontal: 20,
  },
  processSteps: {
    gap: 12,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white + '85',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  stepConnector: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.1,
    flex: 1,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginBottom: 6,
  },
  stepTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stepTimelineText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  stepDetails: {
    marginTop: 8,
  },
  stepDetailItem: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 4,
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
    paddingHorizontal: 20,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    backgroundColor: Colors.white + '85',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 16,
    letterSpacing: -0.1,
    flex: 1,
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
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc' + 'CC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.primary,
    borderBottomWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalStepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalStepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white + 'CC',
    letterSpacing: 0.1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f9ff' + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e0f2fe',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  modalSectionContent: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  modalTimelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff' + 'CC',
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: '#e0f2fe',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalTimelineText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 12,
    letterSpacing: -0.1,
  },
  modalDetailsList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalDetailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  modalDetailText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
    flex: 1,
  },
  modalNavigationList: {
    gap: 16,
  },
  modalNavigationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalNavigationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalNavigationNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  modalNavigationContent: {
    flex: 1,
  },
  modalNavigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalNavigationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.1,
    flex: 1,
  },
  modalNavigationIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  modalNavigationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  modalRequirementsList: {
    gap: 12,
  },
  modalRequirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalRequirementText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
    letterSpacing: -0.1,
    flex: 1,
  },
  modalTipsList: {
    gap: 12,
  },
  modalTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalTipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
    flex: 1,
  },
  
  // Practice Now Button Styles
  practiceNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  practiceNowButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  practiceNowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  
  // Document Types Styles
  modalDocumentTypesList: {
    gap: 12,
  },
  modalDocumentTypeItem: {
    backgroundColor: Colors.white + '85',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  modalDocumentTypeHeader: {
    marginBottom: 8,
  },
  modalDocumentTypeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  modalDocumentTypeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  modalDocumentTypeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.1,
    flex: 1,
    marginRight: 8,
  },
  modalDocumentTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26, // Align with title text (icon width + margin)
  },
  modalDocumentTimelineText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  modalCriticalBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  modalCriticalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalImportantBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  modalImportantText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDocumentTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  
  // Question Types Styles
  modalQuestionTypesList: {
    gap: 6,
  },
  modalQuestionTypeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalQuestionTypeBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  modalQuestionTypeText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
    flex: 1,
  },
  
  // Submission Steps Styles
  modalSubmissionStepsList: {
    gap: 12,
  },
  modalSubmissionStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white + '85',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 2,
  },
  modalSubmissionStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalSubmissionStepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  modalSubmissionStepContent: {
    flex: 1,
  },
  modalSubmissionStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalSubmissionStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.1,
    flex: 1,
  },
  modalSubmissionStepIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  modalSubmissionStepDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});

export default OACPPracticeHub;


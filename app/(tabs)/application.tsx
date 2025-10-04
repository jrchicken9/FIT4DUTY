import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { 
  Target, 
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "@/constants/colors";
import { spacing, shadows } from "@/constants/designSystem";
import PoliceThemeBackground from "@/components/PoliceThemeBackground";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { useApplication } from "@/context/ApplicationContext";
import { useAuth } from "@/context/AuthContext";
import applicationFeatures, { AppFeature } from "@/constants/applicationFeatures";

// Track showing the Mandatory Requirements modal once per login (per user) in-memory
let mandatoryModalShownForUser: string | null = null;
// Track showing the Profile Builder "How it works" modal once per login (per user) in-memory
let profileBuilderModalShownForUser: string | null = null;

export default function ApplicationTab() {
  const insets = useSafeAreaInsets();
  const {
    getApplicationStepsWithProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    isLoading,
  } = useApplication();
  const { user } = useAuth();

  const stepsWithProgress = getApplicationStepsWithProgress() || [];
  const completedStepsCount = getCompletedStepsCount() || 0;
  const progressPercentage = getProgressPercentage() || 0;
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [rememberInterviewChoice, setRememberInterviewChoice] = useState(false);
  const [savedInterviewChoice, setSavedInterviewChoice] = useState<string | null>(null);
  const [showPrepPinModal, setShowPrepPinModal] = useState(false);
  const [prepPinStep, setPrepPinStep] = useState<'test-type' | 'delivery-method'>('test-type');
  const [selectedTestType, setSelectedTestType] = useState<'prep' | 'pin' | null>(null);
  const [showTestingHubModal, setShowTestingHubModal] = useState(false);
  const [showProfileBuilderModal, setShowProfileBuilderModal] = useState(false);
  const [showMandatoryRequirementsModal, setShowMandatoryRequirementsModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('INTERVIEW_BASICS_PREF');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.remember && parsed?.type) {
            setSavedInterviewChoice(parsed.type);
          }
        }
      } catch {}
    })();
  }, []);

  const handleFeaturePress = (feature: AppFeature) => {
    if (feature.id === 'interviewing-basics') {
      if (savedInterviewChoice) {
        if (savedInterviewChoice === 'lfi') router.push('/application/lfi-interview' as any);
        else if (savedInterviewChoice === 'eci') router.push('/application/eci-panel-interview' as any);
        else setShowComingSoon(true);
        return;
      }
      setShowComingSoon(true);
      return;
    }
    if (feature.id === 'prep-pin-test') {
      setShowPrepPinModal(true);
      setPrepPinStep('test-type');
      setSelectedTestType(null);
      return;
    }
    if (feature.id === 'testing-hub') {
      setShowTestingHubModal(true);
      return;
    }
    if (feature.id === 'profile-builder') {
      // Only show profile builder modal once per login per user
      if (profileBuilderModalShownForUser === user?.id) {
        router.push(feature.route as any);
      } else {
        setShowProfileBuilderModal(true);
      }
      return;
    }
    if (feature.id === 'mandatory-requirements') {
      // Only show disclaimer once per login per user
      if (mandatoryModalShownForUser === user?.id) {
        router.push(feature.route as any);
      } else {
        setShowMandatoryRequirementsModal(true);
      }
      return;
    }
    router.push(feature.route as any);
  };

  const handleSelectInterview = async (type: 'lfi' | 'eci' | 'indepth') => {
    setShowComingSoon(false);
    try {
      if (rememberInterviewChoice) {
        await AsyncStorage.setItem('INTERVIEW_BASICS_PREF', JSON.stringify({ remember: true, type }));
        setSavedInterviewChoice(type);
      } else {
        await AsyncStorage.removeItem('INTERVIEW_BASICS_PREF');
        setSavedInterviewChoice(null);
      }
    } catch {}

    if (type === 'lfi') router.push('/application/lfi-interview' as any);
    else if (type === 'eci') router.push('/application/eci-panel-interview' as any);
    else {
      // Placeholder for future in-depth interview step
    }
  };

  const handleSelectTestType = (testType: 'prep' | 'pin') => {
    setSelectedTestType(testType);
    setPrepPinStep('delivery-method');
  };

  const handleSelectDeliveryMethod = (method: 'in-person' | 'online') => {
    setShowPrepPinModal(false);
    const testType = selectedTestType; // capture before reset
    setPrepPinStep('test-type');
    setSelectedTestType(null);

    // Route based on selections
    if (testType === 'prep') {
      if (method === 'in-person') {
        router.push('/practice-sessions?filter=prep' as any);
      } else {
        router.push('/pin-test' as any); // PREP online trainer
      }
    } else if (testType === 'pin') {
      if (method === 'in-person') {
        router.push('/practice-sessions?filter=pin' as any);
      } else {
        router.push('/pin-test' as any); // PIN online trainer
      }
    }
  };

  const handlePrepPinBack = () => {
    if (prepPinStep === 'delivery-method') {
      setPrepPinStep('test-type');
      setSelectedTestType(null);
    } else {
      setShowPrepPinModal(false);
    }
  };

  const handleTimelinePress = () => {
    router.push('/application-timeline' as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.policeRed} />
        <Text style={styles.loadingText}>Loading application hub...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: (insets?.bottom || 0) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Application Hub Header */}
        <View style={styles.hubHeader}>
          <View style={styles.hubBackground}>
            <LinearGradient
              colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
              style={styles.hubGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.hubContent}>
              <View style={styles.hubTextContainer}>
                <Text style={styles.hubTitle}>Application Hub</Text>
                <Text style={styles.hubSubtitle}>
                  {completedStepsCount > 0 ? 'Continue your police application journey' : 'Start your police application journey'}
                </Text>
                <View style={styles.hubBadge}>
                  <Target size={14} color={Colors.white} />
                  <Text style={styles.hubBadgeText}>
                    {completedStepsCount > 0 ? `${completedStepsCount} Steps Completed` : 'Ready to Begin'}
                  </Text>
                </View>
              </View>
              
            </View>
          </View>
        </View>

        {/* Integrated Application Progress & Guide */}
        <TouchableOpacity 
          style={styles.integratedGuideCard} 
          onPress={() => router.push('/application-timeline' as any)} 
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.gradients.primary.end]}
            style={styles.integratedGuideGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.integratedGuideContent}>
            <View style={styles.integratedGuideLeft}>
              <View style={styles.integratedGuideHeader}>
                <Text style={styles.integratedGuideTitle}>Application Guide</Text>
                {completedStepsCount > 0 && (
                  <View style={styles.integratedGuideBadge}>
                    <TrendingUp size={14} color={Colors.white} />
                    <Text style={styles.integratedGuideBadgeText}>Continue Your Journey</Text>
                  </View>
                )}
              </View>
              <Text style={styles.integratedGuideSubtitle}>
                {completedStepsCount > 0 
                  ? `You're making great progress! Keep advancing through your application.`
                  : 'Step-by-step walkthrough of your entire process'
                }
              </Text>
              {completedStepsCount > 0 && (
                <Text style={styles.integratedGuideCurrentStep}>
                  Current: {stepsWithProgress.find((step: any) => step.current)?.title || 'Next Step'}
                </Text>
              )}
            </View>
            <View style={styles.integratedGuideRight}>
              <View style={styles.integratedGuideAction}>
                <Text style={styles.integratedGuideActionText}>
                  {completedStepsCount > 0 ? 'View Timeline' : 'Open Guide'}
                </Text>
                <ChevronRight size={16} color={Colors.white} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Feature Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Application Services</Text>
            <Text style={styles.sectionSubtitle}>
              Access all the tools and resources you need for your police application
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {applicationFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={feature.id} style={styles.featureCell}>
                  <TouchableOpacity
                    style={styles.featureCard}
                    onPress={() => handleFeaturePress(feature)}
                    activeOpacity={0.7}
                  >
                    {/* Top section */}
                    <View>
                      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                        <IconComponent size={28} color={feature.color} />
                      </View>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureSubtitle} numberOfLines={2}>{feature.subtitle}</Text>
                    </View>

                    {/* Bottom section */}
                    <View>
                      {feature.badges && feature.badges.length > 0 && (
                        <View style={styles.featureBadges}>
                          {feature.badges.slice(0, 1).map((badge, badgeIndex) => (
                            <View key={badgeIndex} style={styles.featureBadge}>
                              <Text style={styles.featureBadgeText}>{badge}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {feature.highlight && (
                        <View style={styles.featureHighlight}>
                          <Text style={styles.featureHighlightText} numberOfLines={1}>{feature.highlight}</Text>
                        </View>
                      )}
                      {feature.id === 'interviewing-basics' && savedInterviewChoice && (
                        <TouchableOpacity
                          style={styles.changeLink}
                          onPress={(e) => {
                            e.stopPropagation();
                            setShowComingSoon(true);
                          }}
                        >
                          <Text style={styles.changeLinkText}>Change interview type</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {showComingSoon && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Interview Basics</Text>
            <Text style={styles.modalSubtitle}>Choose your interview type</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectInterview('lfi')}
            >
              <Text style={styles.modalOptionTitle}>Local Focus Interview (LFI)</Text>
              <Text style={styles.modalOptionSubtitle}>Foundations, structure, and practice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectInterview('eci')}
            >
              <Text style={styles.modalOptionTitle}>Essential Competency Interview (In-Depth)</Text>
              <Text style={styles.modalOptionSubtitle}>Competencies, STAR method, examples</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectInterview('indepth')}
            >
              <Text style={styles.modalOptionTitle}>In‑Depth Police Interview</Text>
              <Text style={styles.modalOptionSubtitle}>Coming soon</Text>
            </TouchableOpacity>
            
            <View style={styles.modalRememberRow}>
              <TouchableOpacity
                style={[styles.rememberCheckbox, rememberInterviewChoice && styles.rememberCheckboxChecked]}
                onPress={() => setRememberInterviewChoice(!rememberInterviewChoice)}
              >
                {rememberInterviewChoice && <Text style={styles.rememberCheckmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.rememberLabel}>Remember this choice</Text>
            </View>
            
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowComingSoon(false)}>
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showPrepPinModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {prepPinStep === 'test-type' ? (
              <>
                <Text style={styles.modalTitle}>PREP/PIN Test</Text>
                <Text style={styles.modalSubtitle}>Choose your test type</Text>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectTestType('prep')}
                >
                  <Text style={styles.modalOptionTitle}>PREP Test</Text>
                  <Text style={styles.modalOptionSubtitle}>Physical Readiness Evaluation for Police</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectTestType('pin')}
                >
                  <Text style={styles.modalOptionTitle}>PIN Test</Text>
                  <Text style={styles.modalOptionSubtitle}>Police Information Network test</Text>
                </TouchableOpacity>
                
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowPrepPinModal(false)}>
                    <Text style={styles.modalSecondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{selectedTestType?.toUpperCase()} Test</Text>
                <Text style={styles.modalSubtitle}>Choose delivery method</Text>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectDeliveryMethod('in-person')}
                >
                  <Text style={styles.modalOptionTitle}>In-Person</Text>
                  <Text style={styles.modalOptionSubtitle}>Take the test at a physical location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectDeliveryMethod('online')}
                >
                  <Text style={styles.modalOptionTitle}>Online</Text>
                  <Text style={styles.modalOptionSubtitle}>Take the test remotely from home</Text>
                </TouchableOpacity>
                
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowPrepPinModal(false)}>
                    <Text style={styles.modalSecondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {showTestingHubModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Testing Hub</Text>
            <Text style={styles.modalSubtitle}>Which test are you preparing for?</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowTestingHubModal(false);
                router.push('/application/oacp' as any);
              }}
            >
              <Text style={styles.modalOptionTitle}>OACP Testing & Certification</Text>
              <Text style={styles.modalOptionSubtitle}>Practice questions, strategies, and full simulations</Text>
            </TouchableOpacity>

            <View style={[styles.modalOption, { opacity: 0.6 }]}
            >
              <Text style={styles.modalOptionTitle}>GATB / Other Police Tests</Text>
              <Text style={styles.modalOptionSubtitle}>Coming soon</Text>
            </View>

            <View style={[styles.modalOption, { opacity: 0.6 }]}
            >
              <Text style={styles.modalOptionTitle}>Cognitive / Situational Judgement</Text>
              <Text style={styles.modalOptionSubtitle}>Coming soon</Text>
            </View>
            
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowTestingHubModal(false)}>
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showProfileBuilderModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Profile Builder</Text>
            <Text style={styles.modalSubtitle}>How Application Sections work</Text>

            <View style={styles.modalList}>
              <Text style={styles.modalListItem}>• Add entries across key categories (education, work, community, skills, conduct).</Text>
              <Text style={styles.modalListItem}>• We analyze your inputs and generate a score per category.</Text>
              <Text style={styles.modalListItem}>• Get strengths/risks summaries and clear, actionable recommendations.</Text>
              <Text style={styles.modalListItem}>• Improve your score over time by following the suggested next steps.</Text>
              <Text style={styles.modalListItem}>• Save and reuse your best responses across applications and interviews.</Text>
            </View>

            <View style={styles.modalDivider} />
            <Text style={styles.modalDisclaimerTitle}>Privacy Disclaimer</Text>
            <Text style={styles.modalDisclaimerText}>
              Your entries are stored securely in your account and used only to provide your analysis, grading, and feedback.
              You can edit or delete them anytime. Avoid adding sensitive identifiers (e.g., SIN, full license numbers) unless
              required by a specific form.
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowProfileBuilderModal(false)}>
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowProfileBuilderModal(false);
                  // mark as shown for this user for this login session
                  if (user?.id) profileBuilderModalShownForUser = user.id;
                  router.push('/application/pre-application-prep' as any);
                }}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showMandatoryRequirementsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mandatory Requirements</Text>
            <Text style={styles.modalSubtitle}>Government and Police Service Requirements</Text>

            <View style={styles.modalList}>
              <Text style={styles.modalListItem}>• These requirements are set by provincial government regulations and individual police services.</Text>
              <Text style={styles.modalListItem}>• All requirements must be met before you can proceed with your police application.</Text>
              <Text style={styles.modalListItem}>• Some requirements may vary between different police services in Ontario.</Text>
              <Text style={styles.modalListItem}>• Ensure you meet all criteria before applying to avoid delays or rejection.</Text>
            </View>

            <View style={styles.modalDivider} />
            <Text style={styles.modalDisclaimerTitle}>Important Note</Text>
            <Text style={styles.modalDisclaimerText}>
              These are non-negotiable requirements established by official government bodies and police services. 
              Failure to meet any requirement will result in application rejection. Contact your target police service 
              directly for any clarification on specific requirements.
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => {
                setShowMandatoryRequirementsModal(false);
              }}>
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowMandatoryRequirementsModal(false);
                  // mark as shown for this user for this login session
                  if (user?.id) mandatoryModalShownForUser = user.id;
                  router.push('/application/prerequisites' as any);
                }}
              >
                <Text style={styles.modalButtonText}>View Requirements</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalOption: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalButtonText: {
    color: Colors.white,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalSecondaryButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSecondaryButtonText: {
    color: Colors.text,
    fontWeight: '700',
  },
  modalList: {
    gap: 8,
    marginBottom: 12,
  },
  modalListItem: {
    color: Colors.text,
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  modalDisclaimerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  modalDisclaimerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalRememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rememberCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberCheckboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberCheckmark: {
    color: Colors.white,
    fontWeight: '800',
  },
  rememberLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Hub Header
  hubHeader: {
    marginTop: 16,
    marginBottom: 24,
  },
  hubBackground: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  hubGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.95,
  },
  hubContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hubTextContainer: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  hubSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    fontWeight: '500',
    lineHeight: 20,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  hubBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },

  // Continue Your Journey Ribbon
  continueRibbon: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueTextContainer: {
    flex: 1,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  continueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  // Features Section
  featuresSection: {
    marginBottom: 32,
  },
  guideBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.medium,
  },
  guideBannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  guideBannerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  guideSubtitle: {
    fontSize: 13,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  guidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '25',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.white + '35',
  },
  guidePillText: {
    color: Colors.white,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  featuresGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCell: {
    width: '48%',
    marginBottom: 14,
  },
  featureCard: {
    width: '100%',
    minHeight: 200,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  featureSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 16,
  },
  featureHighlight: {
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  featureHighlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  featureBadges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 'auto',
  },
  featureBadge: {
    backgroundColor: Colors.textSecondary + '15',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  changeLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  changeLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBackButton: {
    padding: 8,
  },
  modalBackText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  // Integrated Guide Card Styles
  integratedGuideCard: {
    marginBottom: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  integratedGuideGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  integratedGuideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 60,
  },
  integratedGuideLeft: {
    flex: 1,
    marginRight: 16,
  },
  integratedGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  integratedGuideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  integratedGuideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  integratedGuideBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  integratedGuideSubtitle: {
    fontSize: 12,
    color: Colors.white + 'CC',
    lineHeight: 16,
    marginBottom: 2,
  },
  integratedGuideCurrentStep: {
    fontSize: 10,
    color: Colors.white + 'AA',
    fontStyle: 'italic',
  },
  integratedGuideRight: {
    alignItems: 'flex-end',
  },
  integratedGuideAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  integratedGuideActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
});


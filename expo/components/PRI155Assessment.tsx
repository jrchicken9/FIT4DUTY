import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import {
  Brain,
  CheckCircle,
  X,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Target,
  Award,
  TrendingUp,
  Clock,
  AlertCircle,
  Info,
  Shield,
  Star,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { pri155Data } from '@/data/pri155Data';
import { PRI155Response, PRI155Result, PRI155AssessmentResult, PRI155Item } from '@/types/pri155';
import Logo from '@/components/Logo';
import ProfessionalBackground from '@/components/ProfessionalBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Extend the result type locally to include additional computed fields used by the UI
type PRI155AssessmentResultExtended = PRI155AssessmentResult & {
  overallScore?: number;
  overallPercentage?: number;
  totalQuestions?: number;
  totalTrueFalseScore?: number;
  totalLikertScore?: number;
  totalMaxLikertScore?: number;
};

interface PRI155AssessmentProps {
  onComplete?: (result: PRI155AssessmentResult) => void;
}

export default function PRI155Assessment({ onComplete }: PRI155AssessmentProps) {
  const insets = useSafeAreaInsets();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState<PRI155Response[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PRI155Result[]>([]);
  const [overallResult, setOverallResult] = useState<PRI155AssessmentResultExtended | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<PRI155Item[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [iconRotation] = useState(new Animated.Value(0));
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const currentItem = randomizedQuestions[currentItemIndex];
  const progress = randomizedQuestions.length > 0 ? ((currentItemIndex + 1) / randomizedQuestions.length) * 100 : 0;
  const isLastItem = currentItemIndex === randomizedQuestions.length - 1;

  useEffect(() => {
    loadPreviousResults();
  }, []);

  const loadPreviousResults = async () => {
    try {
      const saved = await AsyncStorage.getItem('pri155_assessment_results');
      if (saved) {
        const result = JSON.parse(saved);
        result.completedAt = new Date(result.completedAt);
        setOverallResult(result);
        setShowResults(true);
        setShowDisclaimer(false);
      }
    } catch (error) {
      console.error('Error loading previous results:', error);
    }
  };

  const saveResults = async (result: PRI155AssessmentResultExtended) => {
    try {
      await AsyncStorage.setItem('pri155_assessment_results', JSON.stringify(result));
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const randomizeQuestions = () => {
    const questions = [...pri155Data.items];
    // Fisher-Yates shuffle algorithm
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    setRandomizedQuestions(questions);
  };

  const handleResponse = (response: "T" | "F" | "strongly_disagree" | "disagree" | "agree" | "strongly_agree") => {
    if (!currentItem) return;

    let score: number | undefined;
    
    if (currentItem.type === 'likert') {
      // For Likert items, we need to determine if the response matches the adaptive key
      if (currentItem.adaptive_key === 'T' && (response === 'agree' || response === 'strongly_agree')) {
        score = 1;
      } else if (currentItem.adaptive_key === 'F' && (response === 'disagree' || response === 'strongly_disagree')) {
        score = 1;
      } else {
        score = 0;
      }
    }

    const newResponse: PRI155Response = {
      itemId: currentItem.id,
      response,
      ...(score !== undefined && { score })
    };

    setResponses(prev => [
      ...prev.filter(r => r.itemId !== currentItem.id),
      newResponse
    ]);
  };

  const nextItem = () => {
    if (currentItemIndex < randomizedQuestions.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    }
  };

  const previousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    if (responses.length === 0) return;

    const finalResponses = [...responses];
    const results: PRI155Result[] = [];
    
    let totalAdaptiveResponses = 0;
    let totalTrueFalseScore = 0;
    let totalLikertScore = 0;
    let totalMaxLikertScore = 0;
    let totalQuestions = 0;

    pri155Data.domains.forEach(domain => {
      const domainItems = pri155Data.items.filter(item => item.domain === domain.code);
      const domainResponses = finalResponses.filter(r => 
        domainItems.some(item => item.id === r.itemId)
      );

      let trueFalseScore = 0;
      let likertScore = 0;
      let maxLikertScore = 0;
      let adaptiveResponses = 0;

      domainResponses.forEach(response => {
        const item = domainItems.find(i => i.id === response.itemId);
        if (!item) return;

        if (item.type === 'true_false') {
          if (response.response === item.adaptive_key) {
            adaptiveResponses++;
            trueFalseScore++;
          }
        } else if (item.type === 'likert' && response.score !== undefined) {
          likertScore += response.score;
          maxLikertScore += 1;
          if (response.score === 1) {
            adaptiveResponses++;
          }
        }
      });

      const totalDomainScore = trueFalseScore + likertScore;
      const totalDomainMax = domainItems.filter(i => i.type === 'true_false').length + maxLikertScore;
      const percentage = totalDomainMax > 0 ? (totalDomainScore / totalDomainMax) * 100 : 0;
      
      const band = getBand(percentage);

      results.push({
        domain: domain.code,
        domainName: domain.name,
        score: totalDomainScore,
        percentage,
        band,
        adaptiveResponses,
        totalItems: domainItems.length,
        trueFalseScore,
        likertScore,
        maxLikertScore
      });

      totalAdaptiveResponses += adaptiveResponses;
      totalTrueFalseScore += trueFalseScore;
      totalLikertScore += likertScore;
      totalMaxLikertScore += maxLikertScore;
      totalQuestions += domainItems.length;
    });

    const overallPercentage = totalQuestions > 0 ? (totalAdaptiveResponses / totalQuestions) * 100 : 0;
    const overallBand = getBand(overallPercentage);

    const assessmentResult: PRI155AssessmentResultExtended = {
      responses: finalResponses,
      results,
      completedAt: new Date(),
      totalScore: totalAdaptiveResponses,
      overallBand,
      overallScore: totalAdaptiveResponses,
      overallPercentage,
      totalQuestions,
      totalTrueFalseScore,
      totalLikertScore,
      totalMaxLikertScore
    };

    setResults(results);
    setOverallResult(assessmentResult);
    setShowResults(true);
    setShowAssessmentModal(false);
    
    await saveResults(assessmentResult);
    
    if (onComplete) {
      onComplete(assessmentResult);
    }
  };

  const getBand = (percentage: number): string => {
    if (percentage >= 70) return 'Strong';
    if (percentage >= 40) return 'Developing';
    return 'Needs Focus';
  };

  const getBandColor = (band: string): string => {
    switch (band) {
      case 'Strong': return Colors.success;
      case 'Developing': return Colors.warning;
      case 'Needs Focus': return Colors.error;
      default: return Colors.gray[600];
    }
  };

  const resetAssessment = () => {
    setCurrentItemIndex(0);
    setResponses([]);
    setResults([]);
    setOverallResult(null);
    setShowResults(false);
    setShowDisclaimer(true);
    setShowAssessmentModal(false);
    setShowExitConfirmation(false);
    setRandomizedQuestions([]);
  };

  const handleExitAssessment = () => {
    setShowExitConfirmation(true);
  };

  const confirmExit = () => {
    setShowExitConfirmation(false);
    setShowAssessmentModal(false);
    // Reset to show the assessment card again
    setShowDisclaimer(true);
    setCurrentItemIndex(0);
    setResponses([]);
    setRandomizedQuestions([]);
  };

  const cancelExit = () => {
    setShowExitConfirmation(false);
  };

  const startAssessment = () => {
    console.log('Start Assessment button pressed');
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon rotation animation
    Animated.timing(iconRotation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      iconRotation.setValue(0);
    });

    console.log('Setting disclaimer modal to true');
    setShowDisclaimerModal(true);
    console.log('showDisclaimerModal state set to:', true);
  };

  const confirmStartAssessment = () => {
    setShowDisclaimerModal(false);
    randomizeQuestions();
    setShowDisclaimer(false);
    setShowAssessmentModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Disclaimer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDisclaimerModal}
        onRequestClose={() => setShowDisclaimerModal(false)}
      >
        <View style={styles.disclaimerModalOverlay}>
          <View style={styles.disclaimerModalCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.disclaimerModalGradient}
            >
              <View style={styles.disclaimerModalHeader}>
                <AlertCircle size={24} color={Colors.warning} />
                <Text style={styles.disclaimerModalTitle}>Important Notice</Text>
              </View>
              
              <Text style={styles.disclaimerModalText}>
                {pri155Data.meta.purpose}
              </Text>
              
              <Text style={styles.disclaimerModalWarning}>
                {pri155Data.meta.disclaimer}
              </Text>
              
              <View style={styles.disclaimerModalButtons}>
                <TouchableOpacity 
                  style={styles.disclaimerModalCancelButton} 
                  onPress={() => setShowDisclaimerModal(false)}
                >
                  <Text style={styles.disclaimerModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.disclaimerModalConfirmButton} 
                  onPress={confirmStartAssessment}
                >
                  <Text style={styles.disclaimerModalConfirmText}>I Understand</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Assessment Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAssessmentModal}
        onRequestClose={handleExitAssessment}
      >
        <ProfessionalBackground variant="default">
          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF', '#1E3A8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleExitAssessment}
              >
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.modalHeaderCenter}>
                <View style={styles.floatingShield}>
                  <Shield size={32} color={Colors.white} fill="transparent" strokeWidth={2} />
                  <View style={styles.floatingStar}>
                    <Star size={12} color={Colors.white} fill={Colors.white} />
                  </View>
                </View>
              </View>
              <View style={styles.modalHeaderSpacer} />
            </View>
          </View>

          {/* Exit Confirmation Overlay */}
          {showExitConfirmation && (
            <View style={styles.confirmationOverlay}>
              <View style={styles.confirmationCard}>
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF', '#1E3A8A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.confirmationHeader}
                >
                  <Logo size="medium" />
                  <Text style={styles.confirmationTitle}>Exit Assessment?</Text>
                </LinearGradient>
                
                <View style={styles.confirmationContent}>
                  <Text style={styles.confirmationMessage}>
                    Are you sure you want to exit? Your progress will be saved, but you'll need to restart the assessment.
                  </Text>
                  
                  <View style={styles.confirmationButtons}>
                    <TouchableOpacity
                      style={styles.confirmationButtonCancel}
                      onPress={cancelExit}
                    >
                      <Text style={styles.confirmationButtonCancelText}>Continue Assessment</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.confirmationButtonExit}
                      onPress={confirmExit}
                    >
                      <Text style={styles.confirmationButtonExitText}>Exit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.modalProgressContainer}>
            <View style={styles.modalProgressBar}>
              <View style={[styles.modalProgressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.modalProgressText}>
              Question {currentItemIndex + 1} of {randomizedQuestions.length}
            </Text>
          </View>

          {/* Question Content */}
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {currentItem && (
              <View style={styles.modalQuestionCard}>
                <View style={styles.modalQuestionHeader}>
                  <Brain size={24} color={Colors.primary} />
                  <Text style={styles.modalQuestionTitle}>Question {currentItemIndex + 1}</Text>
                </View>
                
                <Text style={styles.modalQuestionText}>{currentItem.text}</Text>
                
                <View style={styles.modalResponseContainer}>
                  {currentItem.type === 'true_false' ? (
                    <View style={styles.modalResponseButtons}>
                      <TouchableOpacity
                        style={[
                          styles.modalResponseButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'T' && styles.selectedResponseButton
                        ]}
                        onPress={() => handleResponse('T')}
                      >
                        <Text style={[
                          styles.modalResponseButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'T' && styles.selectedResponseButtonText
                        ]}>True</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.modalResponseButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'F' && styles.selectedResponseButton
                        ]}
                        onPress={() => handleResponse('F')}
                      >
                        <Text style={[
                          styles.modalResponseButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'F' && styles.selectedResponseButtonText
                        ]}>False</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.modalLikertButtons}>
                      <TouchableOpacity
                        style={[
                          styles.modalLikertButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'strongly_disagree' && styles.selectedLikertButton
                        ]}
                        onPress={() => handleResponse('strongly_disagree')}
                      >
                        <Text style={[
                          styles.modalLikertButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'strongly_disagree' && styles.selectedLikertButtonText
                        ]}>Strongly Disagree</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.modalLikertButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'disagree' && styles.selectedLikertButton
                        ]}
                        onPress={() => handleResponse('disagree')}
                      >
                        <Text style={[
                          styles.modalLikertButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'disagree' && styles.selectedLikertButtonText
                        ]}>Disagree</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.modalLikertButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'agree' && styles.selectedLikertButton
                        ]}
                        onPress={() => handleResponse('agree')}
                      >
                        <Text style={[
                          styles.modalLikertButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'agree' && styles.selectedLikertButtonText
                        ]}>Agree</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.modalLikertButton,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'strongly_agree' && styles.selectedLikertButton
                        ]}
                        onPress={() => handleResponse('strongly_agree')}
                      >
                        <Text style={[
                          styles.modalLikertButtonText,
                          responses.find(r => r.itemId === currentItem.id)?.response === 'strongly_agree' && styles.selectedLikertButtonText
                        ]}>Strongly Agree</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.modalNavigation}>
            <TouchableOpacity
              style={[styles.modalNavButton, currentItemIndex === 0 && styles.modalNavButtonDisabled]}
              onPress={previousItem}
              disabled={currentItemIndex === 0}
            >
              <ArrowLeft size={20} color={currentItemIndex === 0 ? Colors.gray[400] : Colors.primary} />
              <Text style={[styles.modalNavButtonText, currentItemIndex === 0 && styles.modalNavButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalNavButton, styles.modalNavButtonPrimary]}
              onPress={isLastItem ? calculateResults : nextItem}
            >
              <Text style={styles.modalNavButtonPrimaryText}>
                {isLastItem ? 'Complete Assessment' : 'Next'}
              </Text>
              {!isLastItem && <ArrowRight size={20} color={Colors.white} />}
            </TouchableOpacity>
          </View>
        </ProfessionalBackground>
      </Modal>

      {/* Main Content */}
      {showDisclaimer ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.disclaimerCard}>
            {/* Gradient Header */}
            <LinearGradient
              colors={['#3B82F6', '#1E40AF', '#1E3A8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientHeader}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconGlow}>
                  <Brain size={40} color={Colors.white} />
                </View>
              </View>
              <Text style={styles.disclaimerTitle}>PRI-155 Assessment</Text>
              <Text style={styles.disclaimerSubtitle}>Practice Psychological Readiness Inventory</Text>
            </LinearGradient>

            <View style={styles.assessmentInfo}>
              <View style={styles.assessmentInfoItem}>
                <Clock size={16} color={Colors.primary} />
                <Text style={styles.assessmentInfoText}>25-35 minutes</Text>
              </View>
              <View style={styles.assessmentInfoItem}>
                <Target size={16} color={Colors.primary} />
                <Text style={styles.assessmentInfoText}>155 total questions (75 True/False + 80 Likert scale) - Randomized order</Text>
              </View>
              <View style={styles.assessmentInfoItem}>
                <BarChart3 size={16} color={Colors.primary} />
                <Text style={styles.assessmentInfoText}>Detailed scoring with domain breakdown</Text>
              </View>
              <View style={styles.assessmentInfoItem}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.assessmentInfoText}>Practice assessment for preparation purposes</Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.startButton,
                {
                  transform: [{ scale: buttonScale }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.startButtonGradient}
                onPress={startAssessment}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF', '#1E3A8A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.startButtonText}>🚀 Start Assessment</Text>
                <Animated.View
                  style={[
                    styles.startButtonIcon,
                    {
                      transform: [{
                        rotate: iconRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}
                >
                  <Brain size={20} color={Colors.white} />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      ) : null}

      {showResults && overallResult && (
        <View style={styles.container}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.resultsHeader}>
              <Award size={32} color={Colors.success} />
              <Text style={styles.resultsTitle}>Assessment Complete</Text>
              <Text style={styles.resultsSubtitle}>
                Completed on {new Date(overallResult.completedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.overallScore}>
              <Text style={styles.overallScoreLabel}>Overall Readiness</Text>
              <Text style={[styles.overallScoreValue, { color: getBandColor(overallResult.overallBand) }]}>
                {overallResult.overallBand}
              </Text>
              {overallResult.overallPercentage !== undefined && overallResult.totalQuestions !== undefined && (
                <Text style={styles.overallScorePercentage}>
                  {overallResult.overallPercentage.toFixed(1)}% ({overallResult.overallScore}/{overallResult.totalQuestions})
                </Text>
              )}
            </View>

            <View style={styles.resultsSummary}>
              <View style={styles.resultsSummaryItem}>
                <Text style={styles.resultsSummaryLabel}>True/False Score</Text>
              {overallResult.totalTrueFalseScore !== undefined && (
                <Text style={styles.resultsSummaryValue}>{overallResult.totalTrueFalseScore}</Text>
              )}
              </View>
              <View style={styles.resultsSummaryItem}>
                <Text style={styles.resultsSummaryLabel}>Likert Score</Text>
              {overallResult.totalLikertScore !== undefined && overallResult.totalMaxLikertScore !== undefined && (
                <Text style={styles.resultsSummaryValue}>{overallResult.totalLikertScore}/{overallResult.totalMaxLikertScore}</Text>
              )}
              </View>
            </View>

            <View style={styles.domainResults}>
              <Text style={styles.domainResultsTitle}>Domain Breakdown</Text>
              {results.map((result, index) => (
                <View key={index} style={styles.domainResult}>
                  <View style={styles.domainResultHeader}>
                    <Text style={styles.domainResultName}>{result.domainName}</Text>
                    <View style={[styles.domainResultBand, { backgroundColor: getBandColor(result.band) }]}>
                      <Text style={styles.domainResultBandText}>{result.band}</Text>
                    </View>
                  </View>
                  <View style={styles.domainResultStats}>
                    <Text style={styles.domainResultPercentage}>
                      {result.percentage.toFixed(1)}% ({result.score}/{result.totalItems})
                    </Text>
                    <Text style={styles.domainResultAdaptive}>
                      {result.adaptiveResponses} adaptive responses
                    </Text>
                  </View>
                  <View style={styles.domainResultBreakdown}>
                    <Text style={styles.domainResultBreakdownText}>
                      True/False: {result.trueFalseScore} | Likert: {result.likertScore}/{result.maxLikertScore}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.retakeButton} onPress={resetAssessment}>
              <Text style={styles.retakeButtonText}>Retake Assessment</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  disclaimerCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientHeader: {
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  iconGlow: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  disclaimerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  disclaimerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  assessmentInfo: {
    padding: 20,
    gap: 12,
  },
  assessmentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assessmentInfoText: {
    fontSize: 14,
    color: Colors.gray[700],
    flex: 1,
    fontWeight: '500',
  },
  startButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  startButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  overallScore: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: Colors.gray[600],
    marginBottom: 8,
    fontWeight: '600',
  },
  overallScoreValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  overallScorePercentage: {
    fontSize: 18,
    color: Colors.gray[600],
    fontWeight: '600',
  },
  resultsSummary: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  resultsSummaryItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsSummaryLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 8,
    fontWeight: '600',
  },
  resultsSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  domainResults: {
    marginBottom: 24,
  },
  domainResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 16,
  },
  domainResult: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  domainResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    flex: 1,
  },
  domainResultBand: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  domainResultBandText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  domainResultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  domainResultPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  domainResultAdaptive: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  domainResultBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 8,
  },
  domainResultBreakdownText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontStyle: 'italic',
  },
  retakeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Modal Styles
  disclaimerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disclaimerModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  disclaimerModalGradient: {
    padding: 24,
  },
  disclaimerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  disclaimerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  disclaimerModalText: {
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
    marginBottom: 16,
  },
  disclaimerModalWarning: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '600',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  disclaimerModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
  },
  disclaimerModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  disclaimerModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  disclaimerModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalHeader: {
    paddingBottom: 16,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 80,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
  modalHeaderSpacer: {
    width: 44,
  },
  floatingShield: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingStar: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    maxWidth: 340,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmationHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.policeRedBorder,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  confirmationContent: {
    padding: 24,
  },
  confirmationMessage: {
    fontSize: 14,
    color: Colors.gray[700],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmationButtonCancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  confirmationButtonExit: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmationButtonExitText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  modalProgressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  modalQuestionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalQuestionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  modalQuestionText: {
    fontSize: 16,
    color: Colors.gray[700],
    lineHeight: 24,
    marginBottom: 24,
  },
  modalResponseContainer: {
    gap: 16,
  },
  modalResponseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalResponseButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalResponseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  selectedResponseButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedResponseButtonText: {
    color: Colors.white,
  },
  modalLikertButtons: {
    gap: 12,
  },
  modalLikertButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalLikertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  selectedLikertButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedLikertButtonText: {
    color: Colors.white,
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modalNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    gap: 8,
  },
  modalNavButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
  modalNavButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  modalNavButtonTextDisabled: {
    color: Colors.gray[400],
  },
  modalNavButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalNavButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
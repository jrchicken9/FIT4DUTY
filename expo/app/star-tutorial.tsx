import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Target,
  CheckCircle,
  RotateCcw,
  Lightbulb,
  ChevronDown,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import ProfessionalBackground from '@/components/ProfessionalBackground';

const { width } = Dimensions.get('window');

interface Statement {
  id: string;
  text: string;
  category: 'situation' | 'task' | 'action' | 'result';
}

const statements: Statement[] = [
  {
    id: '1',
    text: "During my summer job as a retail supervisor, we had a customer complaint about a product defect",
    category: 'situation'
  },
  {
    id: '2',
    text: "As the supervisor on duty, I was responsible for resolving the customer's concern while maintaining our store's reputation",
    category: 'task'
  },
  {
    id: '3',
    text: "I listened to the customer's concerns, investigated the product issue, and offered a replacement along with an apology",
    category: 'action'
  },
  {
    id: '4',
    text: "The customer left satisfied, and I learned the importance of proactive customer service. This experience strengthened my communication skills",
    category: 'result'
  }
];

const shuffledStatements = [...statements].sort(() => Math.random() - 0.5);

export default function StarTutorialScreen() {
  const navigation = useNavigation();
  
  useEffect(() => {
    // Hide the default navigation header
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [placedStatements, setPlacedStatements] = useState<{
    situation: Statement[];
    task: Statement[];
    action: Statement[];
    result: Statement[];
  }>({
    situation: [],
    task: [],
    action: [],
    result: []
  });

  const [availableStatements, setAvailableStatements] = useState<Statement[]>(shuffledStatements);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    correctCategory: typeof starCategories[0] | null;
    chosenCategory: typeof starCategories[0] | null;
    statement: Statement | null;
  } | null>(null);

  const starCategories = [
    {
      key: 'situation' as const,
      title: 'Situation',
      subtitle: 'Set the context',
      description: 'Briefly describe the background and circumstances',
      color: Colors.primary,
      icon: '📍'
    },
    {
      key: 'task' as const,
      title: 'Task',
      subtitle: 'Explain your responsibility',
      description: 'Describe what you needed to accomplish',
      color: Colors.accent,
      icon: '🎯'
    },
    {
      key: 'action' as const,
      title: 'Action',
      subtitle: 'Detail what you did',
      description: 'Focus on YOUR specific actions and decisions',
      color: Colors.secondary,
      icon: '⚡'
    },
    {
      key: 'result' as const,
      title: 'Result',
      subtitle: 'Share the outcome',
      description: 'Describe the positive outcome and what you learned',
      color: Colors.success,
      icon: '🏆'
    }
  ];

  const handleStatementPress = (statement: Statement) => {
    setSelectedStatement(statement);
    setShowCategoryModal(true);
  };

  const handleCategorySelect = (categoryKey: string) => {
    if (!selectedStatement) return;

    const correctCategory = starCategories.find(cat => cat.key === selectedStatement.category);
    const chosenCategory = starCategories.find(cat => cat.key === categoryKey);

    if (selectedStatement.category === categoryKey) {
      // Correct placement
      setPlacedStatements(prev => ({
        ...prev,
        [categoryKey]: [...prev[categoryKey], selectedStatement]
      }));
      setAvailableStatements(prev => prev.filter(s => s.id !== selectedStatement.id));
      
      // Show success feedback
      setFeedbackData({
        isCorrect: true,
        correctCategory: correctCategory || null,
        chosenCategory: null,
        statement: selectedStatement
      });
      setShowCategoryModal(false);
      setShowFeedbackModal(true);
      
      // Check completion
      setTimeout(() => {
        const totalPlaced = Object.values(placedStatements).reduce((sum, arr) => sum + arr.length, 0) + 1;
        if (totalPlaced === statements.length) {
          setIsCompleted(true);
        }
      }, 100);
    } else {
      // Incorrect placement - show educational feedback
      setFeedbackData({
        isCorrect: false,
        correctCategory: correctCategory || null,
        chosenCategory: chosenCategory || null,
        statement: selectedStatement
      });
      setShowCategoryModal(false);
      setShowFeedbackModal(true);
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    setFeedbackData(null);
    setSelectedStatement(null);
  };

  const handleTryAgain = () => {
    setShowFeedbackModal(false);
    setFeedbackData(null);
    setShowCategoryModal(true);
  };

  const resetTutorial = () => {
    setPlacedStatements({
      situation: [],
      task: [],
      action: [],
      result: []
    });
    setAvailableStatements([...statements].sort(() => Math.random() - 0.5));
    setIsCompleted(false);
    setSelectedStatement(null);
    setShowCategoryModal(false);
  };

  const renderStatement = (statement: Statement) => {
    return (
      <TouchableOpacity
        key={statement.id}
        style={styles.statementCard}
        onPress={() => handleStatementPress(statement)}
        activeOpacity={0.7}
      >
        <View style={styles.statementContent}>
          <Text style={styles.statementText}>{statement.text}</Text>
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to place</Text>
            <ChevronDown size={16} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStarCategory = (category: typeof starCategories[0]) => {
    const statements = placedStatements[category.key];
    
    return (
      <View key={category.key} style={styles.starCard}>
        <View style={[styles.starHeader, { borderLeftColor: category.color }]}>
          <Text style={styles.starIcon}>{category.icon}</Text>
          <View style={styles.starTitleContainer}>
            <Text style={styles.starTitle}>{category.title}</Text>
            <Text style={[styles.starSubtitle, { color: category.color }]}>
              {category.subtitle}
            </Text>
          </View>
        </View>
        
        <Text style={styles.starDescription}>{category.description}</Text>
        
        <View style={styles.statementsContainer}>
          {statements.map((statement, index) => (
            <View key={statement.id} style={styles.placedStatement}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.placedStatementText}>{statement.text}</Text>
            </View>
          ))}
          
          {statements.length === 0 && (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>
                Tap statements below to categorize them here
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Star size={24} color={Colors.white} />
          <Text style={styles.headerTitle}>STAR Method Tutorial</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetTutorial}
        >
          <RotateCcw size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Lightbulb size={24} color={Colors.primary} />
            <Text style={styles.introTitle}>Interactive STAR Method</Text>
          </View>
          
          <Text style={styles.introText}>
            The STAR method helps you structure behavioral interview answers. 
            Tap each statement below to categorize it in the correct STAR component.
          </Text>
          
          {isCompleted && (
            <View style={styles.completionBanner}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.completionText}>
                Perfect! You've mastered the STAR method structure.
              </Text>
            </View>
          )}
        </View>

        {/* STAR Categories */}
        <View style={styles.starSection}>
          <Text style={styles.sectionTitle}>STAR Components</Text>
          {starCategories.map(renderStarCategory)}
        </View>

        {/* Available Statements */}
        <View style={styles.statementsSection}>
          <Text style={styles.sectionTitle}>
            Tap each statement to categorize it in the correct STAR component:
          </Text>
          <View style={styles.statementsContainer}>
            {availableStatements.map(renderStatement)}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Key Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Situation:</Text> Keep it brief but provide enough context
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Task:</Text> Clearly explain your specific role and responsibility
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Action:</Text> Focus on YOUR actions using "I" statements
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Result:</Text> Describe the outcome and what you learned
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedStatement(null);
          setShowCategoryModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Where does this statement belong?</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setSelectedStatement(null);
                  setShowCategoryModal(false);
                }}
              >
                <X size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            {selectedStatement && (
              <View style={styles.selectedStatementContainer}>
                <Text style={styles.selectedStatementText}>{selectedStatement.text}</Text>
              </View>
            )}
            
            <Text style={styles.modalSubtitle}>Choose the correct STAR component:</Text>
            
            <View style={styles.categoryOptions}>
              {starCategories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryOption,
                    { borderLeftColor: category.color }
                  ]}
                  onPress={() => handleCategorySelect(category.key)}
                >
                  <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                  <View style={styles.categoryOptionContent}>
                    <Text style={styles.categoryOptionTitle}>{category.title}</Text>
                    <Text style={[styles.categoryOptionSubtitle, { color: category.color }]}>
                      {category.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleFeedbackClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {feedbackData && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.feedbackHeader}>
                    <Text style={[
                      styles.feedbackTitle,
                      { color: feedbackData.isCorrect ? Colors.success : Colors.error }
                    ]}>
                      {feedbackData.isCorrect ? '🎉 Correct!' : '❌ Not quite right!'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleFeedbackClose}
                  >
                    <X size={24} color={Colors.gray[500]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedStatementContainer}>
                  <Text style={styles.selectedStatementText}>{feedbackData.statement?.text}</Text>
                </View>

                {feedbackData.isCorrect ? (
                  <View style={styles.correctFeedback}>
                    <View style={styles.successIconContainer}>
                      <CheckCircle size={48} color={Colors.success} />
                    </View>
                    <Text style={styles.feedbackMessage}>
                      Excellent! This statement belongs in the <Text style={styles.highlightText}>{feedbackData.correctCategory?.title}</Text> section.
                    </Text>
                    <Text style={styles.feedbackDescription}>
                      {feedbackData.correctCategory?.description}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.incorrectFeedback}>
                    <View style={styles.errorIconContainer}>
                      <Text style={styles.errorEmoji}>🤔</Text>
                    </View>
                    <Text style={styles.feedbackMessage}>
                      That's not quite right! Think about what this statement is describing.
                    </Text>
                    
                    <View style={styles.hintContainer}>
                      <Text style={styles.hintLabel}>💡 Think about it:</Text>
                      <Text style={styles.hintText}>
                        {feedbackData.statement?.category === 'situation' && "Is this statement setting up the background and context of a situation?"}
                        {feedbackData.statement?.category === 'task' && "Does this statement describe what you were responsible for or needed to accomplish?"}
                        {feedbackData.statement?.category === 'action' && "Is this statement describing specific actions you took or steps you followed?"}
                        {feedbackData.statement?.category === 'result' && "Does this statement describe the outcome, impact, or what you learned?"}
                      </Text>
                    </View>

                    <View style={styles.guidanceContainer}>
                      <Text style={styles.guidanceLabel}>🎯 Remember the STAR method:</Text>
                      <View style={styles.guidanceCards}>
                        <View style={styles.guidanceCard}>
                          <Text style={styles.guidanceIcon}>📍</Text>
                          <Text style={styles.guidanceTitle}>Situation</Text>
                          <Text style={styles.guidanceText}>Background & context</Text>
                        </View>
                        <View style={styles.guidanceCard}>
                          <Text style={styles.guidanceIcon}>🎯</Text>
                          <Text style={styles.guidanceTitle}>Task</Text>
                          <Text style={styles.guidanceText}>Your responsibility</Text>
                        </View>
                        <View style={styles.guidanceCard}>
                          <Text style={styles.guidanceIcon}>⚡</Text>
                          <Text style={styles.guidanceTitle}>Action</Text>
                          <Text style={styles.guidanceText}>What you did</Text>
                        </View>
                        <View style={styles.guidanceCard}>
                          <Text style={styles.guidanceIcon}>🏆</Text>
                          <Text style={styles.guidanceTitle}>Result</Text>
                          <Text style={styles.guidanceText}>Outcome & learning</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.feedbackActions}>
                  {!feedbackData.isCorrect && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.tryAgainButton]}
                      onPress={handleTryAgain}
                    >
                      <Text style={styles.tryAgainButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.continueButton]}
                    onPress={handleFeedbackClose}
                  >
                    <Text style={styles.continueButtonText}>
                      {feedbackData.isCorrect ? 'Continue' : 'Got it'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  introSection: {
    padding: 20,
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  introText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  completionText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  starSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  starCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  starHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  starIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  starTitleContainer: {
    flex: 1,
  },
  starTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  starSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  starDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    paddingLeft: 12,
  },
  statementsContainer: {
    minHeight: 60,
  },
  placedStatement: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  placedStatementText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginLeft: 8,
  },
  emptySlot: {
    backgroundColor: Colors.gray[50],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  emptySlotText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  statementsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statementCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  statementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statementText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginRight: 12,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  selectedStatementContainer: {
    backgroundColor: Colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  selectedStatementText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  categoryOptions: {
    gap: 12,
  },
  categoryOption: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryOptionContent: {
    flex: 1,
  },
  categoryOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryOptionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced Feedback Modal Styles
  feedbackHeader: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  correctFeedback: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  feedbackMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  feedbackDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  incorrectFeedback: {
    paddingVertical: 10,
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorEmoji: {
    fontSize: 48,
  },
  highlightText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  incorrectText: {
    fontWeight: '700',
    color: Colors.error,
    textDecorationLine: 'line-through',
  },
  hintContainer: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  guidanceContainer: {
    marginTop: 20,
  },
  guidanceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  guidanceCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  guidanceCard: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  guidanceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  guidanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  comparisonContainer: {
    gap: 16,
    marginTop: 20,
  },
  comparisonItem: {
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  comparisonCard: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tryAgainButton: {
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  tryAgainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '700',
    color: Colors.text,
  },
});

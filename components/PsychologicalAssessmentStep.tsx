import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Brain,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Shield,
  Eye,
  BookOpen,
  Target,
  X,
  Info,
  Calendar,
  Award,
  ClipboardCheck,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import PRI155Assessment from "@/components/PRI155Assessment";

export default function PsychologicalAssessmentStep() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'written-test' | 'interview'>(
    tab === 'interview' ? 'interview' : 'written-test'
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPreparationModal, setShowPreparationModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  // Verified Ontario Police Service data
  const ontarioServices = [
    {
      id: 'tps',
      name: 'Toronto Police Service (TPS)',
      stage: 'After interview',
      notes: 'Written psychological assessment (historically MMPI-2)',
      validity: '12 months',
      retestWait: '12 months'
    },
    {
      id: 'prp',
      name: 'Peel Regional Police (PRP)',
      stage: 'Step 4 – Selection Process',
      notes: 'Lists Psychological Evaluation and Assessment as part of selection',
      validity: '12 months',
      retestWait: '12 months'
    },
    {
      id: 'yrp',
      name: 'York Regional Police (YRP)',
      stage: 'After successful interview',
      notes: 'All applicants evaluated; 1.5–2 hr interview; pass valid 1 yr; fail = 12 mo wait',
      validity: '12 months',
      retestWait: '12 months'
    },
    {
      id: 'ops',
      name: 'Ottawa Police Service (OPS)',
      stage: 'Stage 5',
      notes: 'Written questionnaire + interview with contracted psychologists',
      validity: '12 months',
      retestWait: '12 months'
    },
    {
      id: 'wrps',
      name: 'Waterloo Regional Police (WRPS)',
      stage: 'Within Selection Process',
      notes: 'States Psychological assessment as standard stage',
      validity: '12 months',
      retestWait: '12 months'
    },
    {
      id: 'opp',
      name: 'Ontario Provincial Police (OPP)',
      stage: 'Not published',
      notes: 'Industry standard confirms identical two-part psych screen used province-wide',
      validity: '12 months',
      retestWait: '12 months'
    }
  ];

  const evaluationThemes = [
    { icon: Shield, title: 'Emotional stability & stress tolerance', description: 'Ability to handle high-pressure situations' },
    { icon: CheckCircle, title: 'Integrity, honesty, impulse control', description: 'Moral character and self-regulation' },
    { icon: Target, title: 'Judgment & decision-making', description: 'Critical thinking under pressure' },
    { icon: Award, title: 'Responsibility & reliability', description: 'Dependability and accountability' },
    { icon: Users, title: 'Interpersonal functioning & teamwork', description: 'Working effectively with others' },
    { icon: Shield, title: 'Rule adherence & respect for authority', description: 'Following protocols and procedures' },
    { icon: AlertCircle, title: 'Psychological symptom assessment', description: 'Absence of conditions that could impair performance' }
  ];

  const timelineSteps = [
    { id: 'invite', label: 'Invite received', description: 'Notification to complete psychological assessment' },
    { id: 'written', label: 'Written questionnaire completed', description: 'Complete standardized psychological test' },
    { id: 'interview', label: 'Clinical interview completed', description: 'One-on-one interview with licensed psychologist' },
    { id: 'report', label: 'Psychologist report submitted', description: 'Assessment results sent to Recruiting Unit' },
    { id: 'decision', label: 'Decision recorded', description: 'Pass / Hold / Not Suitable determination' }
  ];

  const preparationTips = [
    'Be truthful and consistent across forms and interviews',
    'Get adequate sleep and bring corrective lenses or medications if needed',
    'Expect personal or sensitive questions — they\'re standard and confidential',
    'Interviews can last up to 2 hours',
    'Review your mental health history beforehand',
    'Prepare to discuss stress management strategies',
    'Stay calm and composed during assessment'
  ];

  const faqItems = [
    {
      question: 'How long does the psychological interview take?',
      answer: 'Usually 1.5–2 hours (example: York Regional Police). The interview is comprehensive and thorough.'
    },
    {
      question: 'Do I receive my report?',
      answer: 'No. Results are confidential and shared only with the Recruiting Unit. You will only be told whether you passed, are held for further review, or are not suitable at this time.'
    },
    {
      question: 'What if I fail?',
      answer: 'Many services, such as York Regional Police, require a 12-month waiting period before retesting. Policies may vary slightly between services.'
    },
    {
      question: 'Which test is used?',
      answer: 'Services don\'t always name it publicly; the MMPI-2 is a common example used in Ontario police recruiting. The specific test may vary by service.'
    },
    {
      question: 'When does this occur in the process?',
      answer: 'Usually after the main interview (e.g., ECI or LFI) and before/alongside background and final hiring boards.'
    },
    {
      question: 'What should I expect during the written test?',
      answer: 'A long standardized inventory (often personality or clinical-based, like the MMPI-2) with multiple-choice or true/false format, taking roughly 1–2 hours.'
    }
  ];

  const renderWrittenTestTab = () => (
    <View style={styles.tabContent}>
      {/* Written Test Overview */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderContent}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Written Psychological Test</Text>
          </View>
        </View>
        
        <View style={styles.sectionContent}>
          <Text style={styles.sectionDescription}>
            The written portion consists of standardized psychological inventories designed to assess personality traits, behavioral patterns, and psychological suitability for policing. These tests are typically administered in a controlled environment and take 1-2 hours to complete.
          </Text>
          
          <View style={styles.purposeSection}>
            <Text style={styles.purposeTitle}>What you'll encounter:</Text>
            <Text style={styles.purposeText}>
              • Long standardized inventory (often personality or clinical-based, like the MMPI-2)
            </Text>
            <Text style={styles.purposeText}>
              • Multiple-choice or true/false format questions
            </Text>
            <Text style={styles.purposeText}>
              • Questions about thoughts, feelings, and behaviors
            </Text>
            <Text style={styles.purposeText}>
              • No right or wrong answers - be honest and consistent
            </Text>
          </View>

          <View style={styles.timingSection}>
            <Text style={styles.timingTitle}>Duration & Format:</Text>
            <Text style={styles.timingText}>
              Typically takes 1-2 hours to complete. You'll be provided with instructions and can take breaks as needed.
            </Text>
          </View>
        </View>
      </View>

      {/* PRI-155 Assessment Component */}
      <PRI155Assessment />
    </View>
  );

  const renderInterviewTab = () => (
    <View style={styles.tabContent}>
      {/* Interview Overview */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderContent}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Clinical Interview</Text>
          </View>
        </View>
        
        <View style={styles.sectionContent}>
          <Text style={styles.sectionDescription}>
            The clinical interview is a one-on-one conversation with a licensed psychologist who will review your written test results, discuss your background, and ask questions about your psychological suitability for policing.
          </Text>
          
          <View style={styles.purposeSection}>
            <Text style={styles.purposeTitle}>What to expect:</Text>
            <Text style={styles.purposeText}>
              • Conducted by a licensed psychologist
            </Text>
            <Text style={styles.purposeText}>
              • Reviews written test results and background information
            </Text>
            <Text style={styles.purposeText}>
              • Typically 1.5–2 hours long
            </Text>
            <Text style={styles.purposeText}>
              • Personal and situational questions relevant to policing
            </Text>
            <Text style={styles.purposeText}>
              • Discussion of stress management and coping strategies
            </Text>
          </View>

          <View style={styles.timingSection}>
            <Text style={styles.timingTitle}>Duration & Format:</Text>
            <Text style={styles.timingText}>
              Usually takes 1.5-2 hours. The psychologist will guide the conversation and ask follow-up questions as needed.
            </Text>
          </View>
        </View>
      </View>

      {/* Evaluation Themes Section */}
      <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('themes')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderContent}>
            <CheckCircle size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Evaluation Themes</Text>
          </View>
          {isExpanded('themes') ? (
            <ChevronUp size={20} color={Colors.gray[500]} />
          ) : (
            <ChevronDown size={20} color={Colors.gray[500]} />
          )}
        </TouchableOpacity>
        
        {isExpanded('themes') && (
          <View style={styles.sectionContent}>
            <View style={styles.themesGrid}>
              {evaluationThemes.map((theme, index) => (
                <View key={index} style={styles.themeItem}>
                  <View style={styles.themeIcon}>
                    <theme.icon size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.themeTitle}>{theme.title}</Text>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Timeline Section */}
      <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('timeline')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderContent}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Assessment Timeline</Text>
          </View>
          {isExpanded('timeline') ? (
            <ChevronUp size={20} color={Colors.gray[500]} />
          ) : (
            <ChevronDown size={20} color={Colors.gray[500]} />
          )}
        </TouchableOpacity>
        
        {isExpanded('timeline') && (
          <View style={styles.sectionContent}>
            <View style={styles.timelineContainer}>
              {timelineSteps.map((step, index) => (
                <View key={step.id} style={styles.timelineStep}>
                  <View style={styles.timelineStepNumber}>
                    <Text style={styles.timelineStepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.timelineStepContent}>
                    <Text style={styles.timelineStepLabel}>{step.label}</Text>
                    <Text style={styles.timelineStepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Outcome Section */}
      <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('outcome')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderContent}>
            <Award size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Results & Outcomes</Text>
          </View>
          {isExpanded('outcome') ? (
            <ChevronUp size={20} color={Colors.gray[500]} />
          ) : (
            <ChevronDown size={20} color={Colors.gray[500]} />
          )}
        </TouchableOpacity>
        
        {isExpanded('outcome') && (
          <View style={styles.sectionContent}>
            <Text style={styles.outcomeText}>
              Results are confidential and shared only with the Recruiting Unit. Applicants are only told whether they passed, are held for further review, or are not suitable at this time.
            </Text>
            
            <View style={styles.examplePolicy}>
              <Text style={styles.examplePolicyTitle}>Example policy (York Regional Police):</Text>
              <View style={styles.policyDetails}>
                <Text style={styles.policyDetail}>• Successful: result valid for 12 months</Text>
                <Text style={styles.policyDetail}>• Unsuccessful: must wait 12 months before re-attempting</Text>
              </View>
              <Text style={styles.policyNote}>
                Expect small variations between police services.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowPreparationModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContent}>
            <Target size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Preparation Tips</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowFAQModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContent}>
            <HelpCircle size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>FAQ</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowServiceModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContent}>
            <Shield size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Service Policies</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <ProfessionalBackground>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Brain size={32} color={Colors.white} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>Psychological Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive mental fitness evaluation for police suitability
          </Text>
        </View>

        {/* General Assessment Overview */}
        <View style={styles.generalOverviewCard}>
          <View style={styles.generalOverviewHeader}>
            <Brain size={20} color={Colors.primary} />
            <Text style={styles.generalOverviewTitle}>Assessment Overview</Text>
          </View>
          <Text style={styles.generalOverviewText}>
            The psychological assessment is a mandatory two-part evaluation that occurs after your main interview and before background checks. It consists of a written test and clinical interview to assess your psychological suitability for policing.
          </Text>
          <View style={styles.generalOverviewTimeline}>
            <Text style={styles.generalOverviewTimelineText}>• Written test (1-2 hours)</Text>
            <Text style={styles.generalOverviewTimelineText}>• Clinical interview (1.5-2 hours)</Text>
            <Text style={styles.generalOverviewTimelineText}>• Results valid for 12 months</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            {[
              { key: 'written-test', label: 'Written Test', icon: FileText },
              { key: 'interview', label: 'Interview', icon: Users },
            ].map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  activeTab === tab.key && styles.tabButtonActive,
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
                    size={18} 
                    color={activeTab === tab.key ? Colors.white : Colors.gray[500]} 
                  />
                </View>
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.tabButtonTextActive
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
        {activeTab === 'written-test' && renderWrittenTestTab()}
        {activeTab === 'interview' && renderInterviewTab()}

        {/* Service-Specific Modal */}
        <Modal
          visible={showServiceModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContainer}>
                <Shield size={24} color={Colors.white} />
                <Text style={styles.modalTitle}>Ontario Service Policies</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowServiceModal(false)}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {ontarioServices.map((service, index) => (
                <View key={service.id} style={styles.serviceCard}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Stage:</Text>
                      <Text style={styles.serviceDetailValue}>{service.stage}</Text>
                    </View>
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Notes:</Text>
                      <Text style={styles.serviceDetailValue}>{service.notes}</Text>
                    </View>
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Validity:</Text>
                      <Text style={styles.serviceDetailValue}>{service.validity}</Text>
                    </View>
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Retest Wait:</Text>
                      <Text style={styles.serviceDetailValue}>{service.retestWait}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Preparation Tips Modal */}
        <Modal
          visible={showPreparationModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContainer}>
                <Target size={24} color={Colors.white} />
                <Text style={styles.modalTitle}>Preparation Tips</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPreparationModal(false)}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Target size={24} color={Colors.primary} />
                  <Text style={styles.tipsTitle}>Practical Preparation Tips</Text>
                </View>
                <View style={styles.tipsList}>
                  {preparationTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <View style={styles.tipBullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* FAQ Modal */}
        <Modal
          visible={showFAQModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContainer}>
                <HelpCircle size={24} color={Colors.white} />
                <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowFAQModal(false)}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.faqCard}>
                <View style={styles.faqList}>
                  {faqItems.map((item, index) => (
                    <View key={index} style={styles.faqItem}>
                      <TouchableOpacity
                        style={styles.faqQuestion}
                        onPress={() => toggleSection(`faq-${index}`)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.faqQuestionText}>{item.question}</Text>
                        {isExpanded(`faq-${index}`) ? (
                          <ChevronUp size={20} color={Colors.gray[500]} />
                        ) : (
                          <ChevronDown size={20} color={Colors.gray[500]} />
                        )}
                      </TouchableOpacity>
                      {isExpanded(`faq-${index}`) && (
                        <View style={styles.faqAnswer}>
                          <Text style={styles.faqAnswerText}>{item.answer}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </ProfessionalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 115,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    opacity: 0.9,
    letterSpacing: 0.1,
  },
  tabContainer: {
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
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: 'relative',
  },
  tabButtonActive: {
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
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[500],
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  tabContent: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  overviewDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  purposeSection: {
    marginBottom: 16,
  },
  purposeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  timingSection: {
    marginBottom: 0,
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  timingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  componentsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  componentsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  componentItem: {
    marginBottom: 20,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  componentDetails: {
    paddingLeft: 32,
  },
  componentDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  themesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  themeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  themeDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  timelineContainer: {
    gap: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineStepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  timelineStepContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineStepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  timelineStepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  outcomeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  outcomeContent: {
    gap: 16,
  },
  outcomeDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  outcomeExample: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  outcomeExampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  outcomeExampleList: {
    gap: 4,
  },
  outcomeExampleItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  serviceButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceButtonText: {
    flex: 1,
  },
  serviceButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  serviceButtonSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingTop: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: -12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  serviceDetails: {
    gap: 8,
  },
  serviceDetail: {
    flexDirection: 'row',
  },
  serviceDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 80,
  },
  serviceDetailValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  // New Section Styles
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  // General Overview Styles
  generalOverviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  generalOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generalOverviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  generalOverviewText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  generalOverviewTimeline: {
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
    padding: 14,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  generalOverviewTimelineText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
});

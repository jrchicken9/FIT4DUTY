import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Pressable,
  StatusBar,
} from 'react-native';
import { 
  HelpCircle, 
  X, 
  Mail,
  MessageCircle,
  BookOpen,
  Target,
  Calendar,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'application' | 'fitness' | 'tests';
}

const CloseButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.closeButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.closeButtonContent, animatedStyle]}>
        <X size={sizes.lg} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

const ContactButton = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onPress, 
  color = Colors.primary 
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  onPress: () => void; 
  color?: string;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.contactButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.contactButtonContent, animatedStyle]}>
        <View style={[styles.contactIcon, { backgroundColor: color + '10' }]}>
          <Icon size={sizes.lg} color={color} />
        </View>
        <View style={styles.contactText}>
          <Text style={styles.contactTitle}>{title}</Text>
          <Text style={styles.contactSubtitle}>{subtitle}</Text>
        </View>
        <ExternalLink size={sizes.sm} color={Colors.textSecondary} />
      </Animated.View>
    </Pressable>
  );
};

const FAQSection = ({ 
  title, 
  icon: Icon, 
  faqs, 
  color = Colors.primary 
}: { 
  title: string; 
  icon: any; 
  faqs: FAQItem[]; 
  color?: string;
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <View style={styles.faqSection}>
      <View style={styles.faqSectionHeader}>
        <View style={[styles.faqSectionIcon, { backgroundColor: color + '10' }]}>
          <Icon size={sizes.md} color={color} />
        </View>
        <Text style={styles.faqSectionTitle}>{title}</Text>
      </View>
      
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable 
            style={styles.faqQuestion}
            onPress={() => toggleItem(index)}
          >
            <Text style={styles.faqQuestionText}>{faq.question}</Text>
            {expandedItems.has(index) ? (
              <ChevronUp size={sizes.sm} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={sizes.sm} color={Colors.textSecondary} />
            )}
          </Pressable>
          
          {expandedItems.has(index) && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>{faq.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  visible,
  onClose,
}) => {
  const handleEmailSupport = () => {
    const subject = encodeURIComponent('Fit4Duty App Support Request');
    const body = encodeURIComponent(
      `Hello Fit4Duty Support Team,

I need assistance with the Fit4Duty app. Please provide the following information:

1. What issue are you experiencing?
2. What were you trying to do when the issue occurred?
3. What device and app version are you using?
4. Any additional details that might help us resolve the issue.

Thank you for your help!

Best regards,
[Your Name]`
    );
    
    Linking.openURL(`mailto:support@fit4duty.com?subject=${subject}&body=${body}`);
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1-800-FIT4DUTY');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://fit4duty.com/support');
  };

  const faqs: FAQItem[] = [
    // General FAQs
    {
      question: "How do I get started with the app?",
      answer: "Start by completing your profile and selecting your preferred police service. Then explore the dashboard to access fitness plans, practice tests, and application resources.",
      category: "general"
    },
    {
      question: "How do I track my progress?",
      answer: "Your progress is automatically tracked across all sections. Visit the dashboard to see your completion status, fitness achievements, and test scores.",
      category: "general"
    },
    {
      question: "Can I use the app offline?",
      answer: "Some features work offline, but you'll need an internet connection for practice tests, video content, and to sync your progress.",
      category: "general"
    },
    
    // Application FAQs
    {
      question: "How do I complete the application process?",
      answer: "Follow the step-by-step application guide in the Application tab. Each step provides detailed instructions and resources to help you complete your police service application.",
      category: "application"
    },
    {
      question: "What if I need to change my selected police service?",
      answer: "You can change your selected police service at any time from the Application tab. This will update your application experience to match the requirements of your chosen service.",
      category: "application"
    },
    {
      question: "How do I know if I meet the requirements?",
      answer: "Use the Mandatory Requirements checklist to review all requirements. The app will guide you through each requirement and help you understand what's needed.",
      category: "application"
    },
    
    // Fitness FAQs
    {
      question: "How do I access my fitness plan?",
      answer: "Visit the Fitness tab to view your personalized workout plans. You can start workouts, track your progress, and view detailed exercise instructions.",
      category: "fitness"
    },
    {
      question: "Can I customize my fitness plan?",
      answer: "Yes! You can modify workouts, adjust difficulty levels, and create custom routines based on your fitness level and goals.",
      category: "fitness"
    },
    {
      question: "How do I track my fitness progress?",
      answer: "Complete workouts to automatically track your progress. View your achievements, personal records, and fitness analytics in the Fitness tab.",
      category: "fitness"
    },
    
    // Test FAQs
    {
      question: "How do I take practice tests?",
      answer: "Access practice tests from the Tests tab. Choose from various test types including written exams, physical assessments, and scenario-based questions.",
      category: "tests"
    },
    {
      question: "How are my test scores calculated?",
      answer: "Test scores are calculated based on your performance and compared to established benchmarks. Detailed scoring information is provided for each test type.",
      category: "tests"
    },
    {
      question: "Can I retake practice tests?",
      answer: "Yes, you can retake practice tests multiple times to improve your scores and build confidence for the actual police service tests.",
      category: "tests"
    },
  ];

  const generalFaqs = faqs.filter(faq => faq.category === 'general');
  const applicationFaqs = faqs.filter(faq => faq.category === 'application');
  const fitnessFaqs = faqs.filter(faq => faq.category === 'fitness');
  const testFaqs = faqs.filter(faq => faq.category === 'tests');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Blue Header */}
        <View style={styles.blueHeader}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <HelpCircle size={sizes.lg} color={Colors.white} />
              <Text style={styles.title}>Help & Support</Text>
            </View>
            <Text style={styles.subtitle}>
              Get help with the app, find answers to common questions, and contact our support team.
            </Text>
          </View>
          <CloseButton onPress={onClose} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Help</Text>
            <View style={styles.contactButtons}>
              <ContactButton
                title="Email Support"
                subtitle="Send us a detailed message"
                icon={Mail}
                onPress={handleEmailSupport}
                color={Colors.primary}
              />
              <ContactButton
                title="Call Support"
                subtitle="Speak with our team"
                icon={Phone}
                onPress={handleCallSupport}
                color={Colors.success}
              />
              <ContactButton
                title="Visit Website"
                subtitle="Access online resources"
                icon={ExternalLink}
                onPress={handleVisitWebsite}
                color={Colors.accent}
              />
            </View>
          </View>

          {/* Support Hours */}
          <View style={styles.section}>
            <View style={styles.supportHoursCard}>
              <View style={styles.supportHoursHeader}>
                <Clock size={sizes.md} color={Colors.primary} />
                <Text style={styles.supportHoursTitle}>Support Hours</Text>
              </View>
              <Text style={styles.supportHoursText}>
                Monday - Friday: 9:00 AM - 6:00 PM EST{'\n'}
                Saturday: 10:00 AM - 4:00 PM EST{'\n'}
                Sunday: Closed
              </Text>
              <Text style={styles.supportHoursNote}>
                For urgent matters outside of business hours, please email us and we'll respond as soon as possible.
              </Text>
            </View>
          </View>

          {/* FAQ Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <FAQSection
              title="Getting Started"
              icon={BookOpen}
              faqs={generalFaqs}
              color={Colors.primary}
            />
            
            <FAQSection
              title="Application Tab"
              icon={Target}
              faqs={applicationFaqs}
              color={Colors.success}
            />
            
            <FAQSection
              title="Fitness & Training"
              icon={Award}
              faqs={fitnessFaqs}
              color={Colors.accent}
            />
            
            <FAQSection
              title="Practice Tests"
              icon={Users}
              faqs={testFaqs}
              color={Colors.warning}
            />
          </View>

          {/* Additional Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>
            <View style={styles.resourcesCard}>
              <Text style={styles.resourcesText}>
                • Check our comprehensive user guide for detailed instructions{'\n'}
                • Watch tutorial videos in the app's video section{'\n'}
                • Join our community forum to connect with other candidates{'\n'}
                • Follow us on social media for tips and updates
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blueHeader: {
    backgroundColor: Colors.primary,
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    ...shadows.level4,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
    zIndex: 10,
  },
  closeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  contactButtons: {
    gap: spacing.sm,
  },
  contactButton: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.level2,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  contactButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  supportHoursCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level2,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  supportHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  supportHoursTitle: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  supportHoursText: {
    ...typography.bodyMedium,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  supportHoursNote: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  faqSection: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.level2,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  faqSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  faqSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  faqSectionTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: spacing.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  faqQuestionText: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  faqAnswerText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  resourcesCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level2,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  resourcesText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default HelpSupportModal;

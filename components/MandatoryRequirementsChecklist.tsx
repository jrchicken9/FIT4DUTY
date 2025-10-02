import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { CheckCircle, Circle, AlertTriangle, Shield, Heart, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: 'mandatory' | 'health';
  required: boolean;
  completed: boolean;
}

const CollapsibleSection = ({ 
  title, 
  subtitle, 
  icon, 
  iconColor, 
  progress, 
  children, 
  isExpanded, 
  onToggle 
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  progress: number;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();
  const [animation] = useState(new Animated.Value(isExpanded ? 1 : 0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  return (
    <View style={styles.sectionCard}>
      <Pressable 
        style={styles.sectionHeader}
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.sectionHeaderContent, animatedStyle]}>
          <View style={styles.sectionIconContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: iconColor }]}>
              {icon}
            </View>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.sectionProgress}>
            <Text style={styles.sectionProgressText}>{progress}%</Text>
            <View style={styles.chevronContainer}>
              {isExpanded ? (
                <ChevronUp size={sizes.lg} color={Colors.primary} />
              ) : (
                <ChevronDown size={sizes.lg} color={Colors.primary} />
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
      
      <Animated.View style={{
        maxHeight: animation.interpolate({
          inputRange: [0, 1],
          // Use a very large value so expanded sections are fully visible
          outputRange: [0, 10000],
        }),
        opacity: animation,
        overflow: 'hidden',
      }}>
        <View style={styles.requirementsGrid}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const RequirementCard = ({ 
  requirement, 
  onToggle 
}: {
  requirement: Requirement;
  onToggle: () => void;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable
      style={[
        styles.requirementCard,
        requirement.completed && styles.requirementCardCompleted
      ]}
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.requirementCardContent, animatedStyle]}>
        <View style={styles.requirementHeader}>
          {requirement.completed ? (
            <CheckCircle size={sizes.md} color={Colors.success} />
          ) : (
            <Circle size={sizes.md} color={Colors.gray[400]} />
          )}
          <Text style={[
            styles.requirementTitle,
            requirement.completed && styles.requirementTitleCompleted
          ]}>
            {requirement.title}
          </Text>
        </View>
        <Text style={[
          styles.requirementDescription,
          requirement.completed && styles.requirementDescriptionCompleted
        ]}>
          {requirement.description}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const NextStepsButton = ({ 
  totalProgress, 
  completedCount, 
  totalCount, 
  onPress 
}: {
  totalProgress: number;
  completedCount: number;
  totalCount: number;
  onPress: () => void;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={[
        styles.nextStepsButton,
        totalProgress === 100 && styles.nextStepsButtonActive
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.nextStepsButtonContent, animatedStyle]}>
        <Text style={[
          styles.nextStepsButtonText,
          totalProgress === 100 && styles.nextStepsButtonTextActive
        ]}>
          Continue to Next Step
        </Text>
        <ArrowRight size={sizes.sm} color={totalProgress === 100 ? Colors.white : Colors.gray[400]} />
      </Animated.View>
    </Pressable>
  );
};

const MandatoryRequirementsChecklist: React.FC = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mandatoryExpanded, setMandatoryExpanded] = useState(false);
  const [healthExpanded, setHealthExpanded] = useState(false);

  // Initialize requirements
  useEffect(() => {
    initializeRequirements();
  }, []);

  const initializeRequirements = async () => {
    const defaultRequirements: Requirement[] = [
      // Mandatory Requirements
      {
        id: 'age_18_plus',
        title: 'Age 18 or Older',
        description: 'Must be at least 18 years of age at time of application',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'canadian_citizen',
        title: 'Canadian Citizen or Permanent Resident',
        description: 'Must be a Canadian citizen or permanent resident',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'drivers_license',
        title: 'Valid Driver\'s License',
        description: 'Must have a valid driver\'s license (G class preferred)',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'high_school_education',
        title: 'High School Education',
        description: 'Must have completed high school or equivalent education',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'clean_criminal_record',
        title: 'Clean Criminal Record',
        description: 'No criminal convictions for which a pardon has not been granted',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'vision_standards',
        title: 'Vision Standards',
        description: 'Meet police service vision requirements (correctable to 20/20)',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'hearing_standards',
        title: 'Hearing Standards',
        description: 'Meet police service hearing requirements',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      {
        id: 'physical_fitness',
        title: 'Physical Fitness',
        description: 'Able to meet physical fitness standards (PREP test)',
        category: 'mandatory',
        required: true,
        completed: false,
      },
      // Health Requirements
      {
        id: 'medical_clearance',
        title: 'Medical Clearance',
        description: 'Pass medical examination and health assessment',
        category: 'health',
        required: true,
        completed: false,
      },
      {
        id: 'psychological_assessment',
        title: 'Psychological Assessment',
        description: 'Complete psychological evaluation and assessment',
        category: 'health',
        required: true,
        completed: false,
      },
      {
        id: 'drug_test',
        title: 'Drug Test',
        description: 'Pass drug screening and substance abuse test',
        category: 'health',
        required: true,
        completed: false,
      },
      {
        id: 'vaccination_records',
        title: 'Vaccination Records',
        description: 'Up-to-date vaccination records and immunizations',
        category: 'health',
        required: true,
        completed: false,
      },
    ];

    // Load saved data and merge with defaults
    await loadSavedRequirements(defaultRequirements);
  };

  const loadSavedRequirements = async (defaultRequirements: Requirement[]) => {
    if (!user) {
      setRequirements(defaultRequirements);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('application_profile')
        .select('mandatory_requirements')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading requirements:', error);
      }

      if (data?.mandatory_requirements) {
        const savedRequirements = defaultRequirements.map(req => ({
          ...req,
          completed: data.mandatory_requirements[req.id]?.completed || false,
        }));
        setRequirements(savedRequirements);
      } else {
        setRequirements(defaultRequirements);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      setRequirements(defaultRequirements);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRequirement = async (requirementId: string) => {
    if (!user) return;

    const updatedRequirements = requirements.map(req =>
      req.id === requirementId ? { ...req, completed: !req.completed } : req
    );
    setRequirements(updatedRequirements);

    try {
      const requirementsData = updatedRequirements.reduce((acc, req) => {
        acc[req.id] = {
          completed: req.completed,
          title: req.title,
          category: req.category,
        };
        return acc;
      }, {} as Record<string, any>);

      const { error } = await supabase
        .from('application_profile')
        .upsert({
          user_id: user.id,
          mandatory_requirements: requirementsData,
        });

      if (error) {
        console.error('Error saving requirements:', error);
        Alert.alert('Error', 'Failed to save requirement status');
      }
    } catch (error) {
      console.error('Error saving requirements:', error);
      Alert.alert('Error', 'Failed to save requirement status');
    }
  };

  const getProgressPercentage = () => {
    const completedCount = requirements.filter(req => req.completed).length;
    return Math.round((completedCount / requirements.length) * 100);
  };

  const getCategoryProgress = (category: 'mandatory' | 'health') => {
    const categoryRequirements = requirements.filter(req => req.category === category);
    const completedCount = categoryRequirements.filter(req => req.completed).length;
    return Math.round((completedCount / categoryRequirements.length) * 100);
  };

  const mandatoryRequirements = requirements.filter(req => req.category === 'mandatory');
  const healthRequirements = requirements.filter(req => req.category === 'health');
  const totalProgress = getProgressPercentage();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading requirements...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Blue Header */}
      <View style={styles.blueHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Requirements Checklist</Text>
            <Text style={styles.headerSubtitle}>Track your progress towards eligibility</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber} numberOfLines={1}>{totalProgress}%</Text>
            <Text style={styles.progressLabel} numberOfLines={1}>Complete</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${totalProgress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {requirements.filter(req => req.completed).length} of {requirements.length} completed
        </Text>
      </View>

      {/* Basic Requirements */}
      <CollapsibleSection
        title="Basic Requirements"
        subtitle="Essential qualifications needed"
        icon={<Shield size={sizes.md} color={Colors.white} />}
        iconColor={Colors.primary}
        progress={getCategoryProgress('mandatory')}
        isExpanded={mandatoryExpanded}
        onToggle={() => setMandatoryExpanded(!mandatoryExpanded)}
      >
        {mandatoryRequirements.map((requirement) => (
          <RequirementCard
            key={requirement.id}
            requirement={requirement}
            onToggle={() => toggleRequirement(requirement.id)}
          />
        ))}
      </CollapsibleSection>

      {/* Health Requirements */}
      <CollapsibleSection
        title="Health Requirements"
        subtitle="Medical and wellness standards"
        icon={<Heart size={sizes.md} color={Colors.white} />}
        iconColor={Colors.warning}
        progress={getCategoryProgress('health')}
        isExpanded={healthExpanded}
        onToggle={() => setHealthExpanded(!healthExpanded)}
      >
        {healthRequirements.map((requirement) => (
          <RequirementCard
            key={requirement.id}
            requirement={requirement}
            onToggle={() => toggleRequirement(requirement.id)}
          />
        ))}
      </CollapsibleSection>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <View style={styles.nextStepsHeader}>
          <Text style={styles.nextStepsTitle}>Ready for the next step?</Text>
          <Text style={styles.nextStepsSubtitle}>
            {totalProgress === 100 
              ? "All requirements completed! You're ready to proceed."
              : `Complete ${requirements.length - requirements.filter(req => req.completed).length} more requirements to continue.`
            }
          </Text>
        </View>
        <NextStepsButton 
          totalProgress={totalProgress}
          completedCount={requirements.filter(req => req.completed).length}
          totalCount={requirements.length}
          onPress={() => router.push('/application/pre-application-prep')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  blueHeader: {
    backgroundColor: Colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.level4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: Colors.white,
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 8,
    minWidth: 80,
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 20,
    flexShrink: 0,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    marginTop: -spacing.xs,
    textAlign: 'center',
    lineHeight: 14,
    flexShrink: 0,
  },
  progressBar: {
    height: spacing.sm,
    backgroundColor: Colors.white + '30',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: Colors.white,
    textAlign: 'center',
  },

  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.level4,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.gray[200],
  },
  sectionHeader: {
    marginBottom: spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.gray[200],
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    marginRight: spacing.sm,
  },
  sectionIcon: {
    width: sizes.xl,
    height: sizes.xl,
    borderRadius: sizes.xl / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionProgressText: {
    ...typography.labelLarge,
    fontWeight: '600',
    color: Colors.primary,
  },
  chevronContainer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementsGrid: {
    gap: spacing.sm,
  },
  requirementCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.gray[200],
  },
  requirementCardCompleted: {
    backgroundColor: Colors.success + '08',
    borderColor: Colors.success + '20',
  },
  requirementCardContent: {
    alignItems: 'flex-start',
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requirementTitle: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
  },
  requirementTitleCompleted: {
    color: Colors.success,
    textDecorationLine: 'line-through',
  },
  requirementDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginLeft: sizes.md + spacing.sm,
  },
  requirementDescriptionCompleted: {
    color: Colors.success + '80',
  },
  nextStepsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.level4,
  },
  nextStepsHeader: {
    marginBottom: spacing.md,
  },
  nextStepsTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nextStepsSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  nextStepsButton: {
    backgroundColor: Colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.level2,
  },
  nextStepsButtonActive: {
    backgroundColor: Colors.primary,
  },
  nextStepsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextStepsButtonText: {
    ...typography.labelLarge,
    color: Colors.gray[400],
    fontWeight: '600',
  },
  nextStepsButtonTextActive: {
    color: Colors.white,
  },
});

export default MandatoryRequirementsChecklist;

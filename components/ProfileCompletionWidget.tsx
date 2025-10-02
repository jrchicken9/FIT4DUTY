import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { 
  User, 
  Target, 
  Activity, 
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

type ProfileField = {
  key: string;
  label: string;
  icon: React.ReactNode;
  getValue: (user: any) => any;
  isRequired?: boolean;
};

const profileFields: ProfileField[] = [
  {
    key: 'personal',
    label: 'Personal Information',
    icon: <User size={sizes.md} color={Colors.primary} />,
    getValue: (user) => ({
      phone: user?.phone,
      gender: user?.gender,
      location: user?.location,
      height: user?.height,
      weight: user?.weight,
    }),
  },
];

const CompleteButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.completeButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.completeButtonContent, animatedStyle]}>
        <Text style={styles.completeButtonText}>Complete</Text>
      </Animated.View>
    </Pressable>
  );
};

const SectionItem = ({ 
  field, 
  fieldCompletion, 
  isComplete, 
  onPress 
}: { 
  field: ProfileField; 
  fieldCompletion: number; 
  isComplete: boolean; 
  onPress: () => void; 
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable
      style={styles.sectionItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.sectionItemContent, animatedStyle]}>
        <View style={styles.sectionLeft}>
          {field.icon}
          <View style={styles.sectionText}>
            <Text style={styles.sectionLabel}>{field.label}</Text>
            <Text style={styles.sectionStatus}>
              {isComplete ? 'Complete' : `${fieldCompletion}% complete`}
            </Text>
          </View>
        </View>
        <View style={styles.sectionRight}>
          {isComplete ? (
            <CheckCircle size={sizes.md} color={Colors.success} />
          ) : (
            <ChevronRight size={sizes.md} color={Colors.textSecondary} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function ProfileCompletionWidget() {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate completion percentage
  const calculateCompletion = () => {
    let totalFields = 0;
    let completedFields = 0;

    profileFields.forEach(field => {
      const values = field.getValue(user);
      const fieldKeys = Object.keys(values);
      totalFields += fieldKeys.length;
      
      fieldKeys.forEach(key => {
        if (values[key] && values[key] !== '' && values[key] !== null) {
          completedFields++;
        }
      });
    });

    return Math.round((completedFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Don't show widget if profile is 100% complete
  if (completionPercentage >= 100) return null;

  const getFieldCompletion = (field: ProfileField) => {
    const values = field.getValue(user);
    const fieldKeys = Object.keys(values);
    let completed = 0;
    
    fieldKeys.forEach(key => {
      if (values[key] && values[key] !== '' && values[key] !== null) {
        completed++;
      }
    });
    
    return Math.round((completed / fieldKeys.length) * 100);
  };

  const handleCompleteProfile = () => {
    // Navigate to a profile completion screen or modal
    // For now, we'll navigate to the profile edit mode
    router.push('/profile-completion');
  };

  const handleCompleteSection = (sectionKey: string) => {
    router.push(`/profile-completion?section=${sectionKey}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AlertCircle size={sizes.lg} color={Colors.warning} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              {completionPercentage}% complete • Get personalized recommendations
            </Text>
          </View>
        </View>
        <CompleteButton onPress={handleCompleteProfile} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{completionPercentage}%</Text>
      </View>

      {/* Section Breakdown */}
      <View style={styles.sectionsContainer}>
        {profileFields.map((field) => {
          const fieldCompletion = getFieldCompletion(field);
          const isComplete = fieldCompletion >= 100;
          
          return (
            <SectionItem
              key={field.key}
              field={field}
              fieldCompletion={fieldCompletion}
              isComplete={isComplete}
              onPress={() => handleCompleteSection(field.key)}
            />
          );
        })}
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Why complete your profile?</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>• Get personalized recommendations</Text>
          <Text style={styles.benefitItem}>• Track your progress more accurately</Text>
          <Text style={styles.benefitItem}>• Receive targeted preparation tips</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    padding: spacing.lg,
    ...shadows.level4,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.warning + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.level2,
  },
  completeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  sectionsContainer: {
    marginBottom: spacing.md,
  },
  sectionItem: {
    marginBottom: spacing.sm,
  },
  sectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionText: {
    flex: 1,
  },
  sectionLabel: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionStatus: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  benefitsTitle: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  benefitsList: {
    gap: spacing.xs,
  },
  benefitItem: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
});
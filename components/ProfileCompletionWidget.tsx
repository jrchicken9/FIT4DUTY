import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
    icon: <User size={20} color={Colors.primary} />,
    getValue: (user) => ({
      phone: user?.phone,
      gender: user?.gender,
      location: user?.location,
      height: user?.height,
      weight: user?.weight,
    }),
  },
  {
    key: 'goals',
    label: 'Goals & Aspirations',
    icon: <Target size={20} color={Colors.primary} />,
    getValue: (user) => ({
      goal: user?.goal,
      department_interest: user?.department_interest,
      target_test_date: user?.target_test_date,
      experience_level: user?.experience_level,
    }),
  },
  {
    key: 'fitness',
    label: 'Fitness Profile',
    icon: <Activity size={20} color={Colors.primary} />,
    getValue: (user) => ({
      current_fitness_level: user?.current_fitness_level,
      workout_frequency: user?.workout_frequency,
      available_time: user?.available_time,
    }),
  },
];

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
          <AlertCircle size={24} color={Colors.warning} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              {completionPercentage}% complete • Get personalized recommendations
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleCompleteProfile}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
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
            <TouchableOpacity
              key={field.key}
              style={styles.sectionItem}
              onPress={() => handleCompleteSection(field.key)}
            >
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
                  <CheckCircle size={20} color={Colors.success} />
                ) : (
                  <ChevronRight size={20} color={Colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Why complete your profile?</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>• Get personalized workout recommendations</Text>
          <Text style={styles.benefitItem}>• Track your progress more accurately</Text>
          <Text style={styles.benefitItem}>• Receive targeted test preparation tips</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  sectionsContainer: {
    marginBottom: 20,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  sectionStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionRight: {
    marginLeft: 12,
  },
  benefitsContainer: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  benefitsList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
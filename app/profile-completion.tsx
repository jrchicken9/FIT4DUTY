import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  User, 
  Target, 
  Activity, 
  Calendar, 
  MapPin, 
  Phone,
  Shield,
  Clock,
  ChevronDown,
  Ruler,
  Weight,
  ArrowLeft
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function ProfileCompletionScreen() {
  const { user, updateProfile } = useAuth();
  const { section } = useLocalSearchParams();
  
  const [formData, setFormData] = useState<{
    phone: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | undefined;
    height: string;
    weight: string;
    location: string;
    emergencyContact: string;
    emergencyPhone: string;
    goal: string;
    targetTestDate: Date;
    departmentInterest: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | undefined;
    motivation: string;
    currentFitnessLevel: 'beginner' | 'intermediate' | 'advanced' | undefined;
    workoutFrequency: '1-2 times/week' | '3-4 times/week' | '5+ times/week' | undefined;
    availableTime: '15-30 minutes' | '30-60 minutes' | '60+ minutes' | undefined;
    injuries: string;
    medicalConditions: string;
  }>({
    // Personal Information
    phone: user?.phone || '',
    dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : new Date(),
    gender: (user?.gender as 'male' | 'female' | 'other' | undefined) || undefined,
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    location: user?.location || '',
    emergencyContact: user?.emergency_contact || '',
    emergencyPhone: user?.emergency_phone || '',
    
    // Goals and Aspirations
    goal: user?.goal || '',
    targetTestDate: user?.target_test_date ? new Date(user.target_test_date) : new Date(),
    departmentInterest: user?.department_interest || '',
    experienceLevel: (user?.experience_level as 'beginner' | 'intermediate' | 'advanced' | undefined) || undefined,
    motivation: user?.motivation || '',
    
    // Fitness Profile
    currentFitnessLevel: (user?.current_fitness_level as 'beginner' | 'intermediate' | 'advanced' | undefined) || undefined,
    workoutFrequency: (user?.workout_frequency as '1-2 times/week' | '3-4 times/week' | '5+ times/week' | undefined) || undefined,
    availableTime: (user?.available_time as '15-30 minutes' | '30-60 minutes' | '60+ minutes' | undefined) || undefined,
    injuries: user?.injuries || '',
    medicalConditions: user?.medical_conditions || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDropdown = (field: string, options: string[], placeholder: string, icon?: React.ReactNode) => {
    const isActive = activeDropdown === field;
    const selectedValue = formData[field as keyof typeof formData] as string | undefined;
    
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.inputContainer, isActive && styles.inputContainerActive]}
          onPress={() => setActiveDropdown(isActive ? null : field)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
            {selectedValue || placeholder}
          </Text>
          <ChevronDown 
            size={20} 
            color={Colors.textSecondary} 
            style={[styles.chevronIcon, isActive && styles.chevronIconActive]} 
          />
        </TouchableOpacity>
        
        {isActive && (
          <View style={styles.dropdownOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownOption, selectedValue === option && styles.selectedDropdownOption]}
                onPress={() => {
                  updateFormData(field, option);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownOptionText, selectedValue === option && styles.selectedDropdownOptionText]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDatePicker = (field: 'dateOfBirth' | 'targetTestDate', placeholder: string, icon?: React.ReactNode) => {
    const isDateOfBirth = field === 'dateOfBirth';
    const showPicker = isDateOfBirth ? showDatePicker : showTargetDatePicker;
    const setShowPicker = isDateOfBirth ? setShowDatePicker : setShowTargetDatePicker;
    const selectedDate = formData[field];
    
    return (
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowPicker(true)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={styles.dropdownText}>
            {formatDate(selectedDate)}
          </Text>
          <Calendar size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={isDateOfBirth ? new Date() : undefined}
            minimumDate={isDateOfBirth ? new Date(1950, 0, 1) : new Date()}
            onChange={(event, date) => {
              setShowPicker(false);
              if (date) {
                updateFormData(field, date);
              }
            }}
          />
        )}
      </View>
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const updates = {
        // Personal Information
        phone: formData.phone || null,
        date_of_birth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null,
        gender: formData.gender || null,
        height: parseInt(formData.height) || null,
        weight: parseInt(formData.weight) || null,
        location: formData.location || null,
        emergency_contact: formData.emergencyContact || null,
        emergency_phone: formData.emergencyPhone || null,
        
        // Goals and Aspirations
        goal: formData.goal || null,
        target_test_date: formData.targetTestDate ? formData.targetTestDate.toISOString().split('T')[0] : null,
        department_interest: formData.departmentInterest || null,
        experience_level: formData.experienceLevel || null,
        motivation: formData.motivation || null,
        
        // Fitness Profile
        current_fitness_level: formData.currentFitnessLevel || null,
        workout_frequency: formData.workoutFrequency || null,
        available_time: formData.availableTime || null,
        injuries: formData.injuries || null,
        medical_conditions: formData.medicalConditions || null,
      };
      
      await updateProfile(updates);
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionSubtitle}>Tell us more about yourself</Text>

      <View style={styles.inputContainer}>
        <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {renderDatePicker('dateOfBirth', 'Date of Birth', <Calendar size={20} color={Colors.textSecondary} />)}

      {renderDropdown('gender', ['male', 'female', 'other'], 'Select Gender', <User size={20} color={Colors.textSecondary} />)}

      <View style={styles.inputContainer}>
        <Ruler size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={formData.height}
          onChangeText={(value) => updateFormData('height', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Weight size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={formData.weight}
          onChangeText={(value) => updateFormData('weight', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Location (City, Province)"
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Emergency Contact Name"
          value={formData.emergencyContact}
          onChangeText={(value) => updateFormData('emergencyContact', value)}
          autoCapitalize="words"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Emergency Contact Phone"
          value={formData.emergencyPhone}
          onChangeText={(value) => updateFormData('emergencyPhone', value)}
          keyboardType="phone-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderGoalsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Goals & Aspirations</Text>
      <Text style={styles.sectionSubtitle}>Tell us about your career goals</Text>

      <View style={styles.inputContainer}>
        <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Your Goal (e.g., Pass PREP test, Join OPP)"
          value={formData.goal}
          onChangeText={(value) => updateFormData('goal', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Shield size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Department of Interest (e.g., OPP, Toronto Police)"
          value={formData.departmentInterest}
          onChangeText={(value) => updateFormData('departmentInterest', value)}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {renderDatePicker('targetTestDate', 'Target Test Date', <Calendar size={20} color={Colors.textSecondary} />)}

      {renderDropdown('experienceLevel', ['beginner', 'intermediate', 'advanced'], 'Police/Security Experience Level')}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What motivates you to become a police officer?"
          value={formData.motivation}
          onChangeText={(value) => updateFormData('motivation', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderFitnessSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fitness Profile</Text>
      <Text style={styles.sectionSubtitle}>Help us personalize your training</Text>

      {renderDropdown('currentFitnessLevel', ['beginner', 'intermediate', 'advanced'], 'Current Fitness Level', <Activity size={20} color={Colors.textSecondary} />)}

      {renderDropdown('workoutFrequency', ['1-2 times/week', '3-4 times/week', '5+ times/week'], 'How often do you currently workout?')}

      {renderDropdown('availableTime', ['15-30 minutes', '30-60 minutes', '60+ minutes'], 'Available Training Time per Session', <Clock size={20} color={Colors.textSecondary} />)}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any injuries or physical limitations? (Optional)"
          value={formData.injuries}
          onChangeText={(value) => updateFormData('injuries', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any medical conditions we should know about? (Optional)"
          value={formData.medicalConditions}
          onChangeText={(value) => updateFormData('medicalConditions', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (section) {
      case 'personal':
        return renderPersonalSection();
      case 'goals':
        return renderGoalsSection();
      case 'fitness':
        return renderFitnessSection();
      default:
        return (
          <>
            {renderPersonalSection()}
            {renderGoalsSection()}
            {renderFitnessSection()}
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputContainerActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconActive: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedDropdownOption: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedDropdownOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    width: '100%',
  },
});
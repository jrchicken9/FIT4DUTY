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
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone,
  ChevronDown,
  Ruler,
  Weight,
  ArrowLeft
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { emitBadgeEvent } from '@/lib/badgeEvents';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

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
  }>({
    // Personal Information
    phone: user?.phone || '',
    dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : new Date(1990, 0, 1),
    gender: (user?.gender as 'male' | 'female' | 'other' | undefined) || undefined,
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    location: user?.location || '',
    emergencyContact: user?.emergency_contact || '',
    emergencyPhone: user?.emergency_phone || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const renderDatePicker = (placeholder: string, icon?: React.ReactNode) => {
    const selectedDate = formData.dateOfBirth;
    
    return (
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={styles.datePickerText}>
            {formatDate(selectedDate)}
          </Text>
          <Calendar size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1950, 0, 1)}
            textColor={Colors.text}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date && event.type !== 'dismissed') {
                updateFormData('dateOfBirth', date);
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
      // Basic validation
      if (!formData.phone || !formData.phone.trim()) {
        Alert.alert('Missing Information', 'Please enter your phone number.');
        setIsLoading(false);
        return;
      }

      if (!formData.gender) {
        Alert.alert('Missing Information', 'Please select your gender.');
        setIsLoading(false);
        return;
      }

      if (!formData.height || !formData.weight) {
        Alert.alert('Missing Information', 'Please enter your height and weight.');
        setIsLoading(false);
        return;
      }

      if (!formData.location || !formData.location.trim()) {
        Alert.alert('Missing Information', 'Please enter your location.');
        setIsLoading(false);
        return;
      }

      const updates = {
        // Personal Information
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null,
        gender: formData.gender || null,
        height: parseInt(formData.height) || null,
        weight: parseInt(formData.weight) || null,
        location: formData.location.trim() || null,
        emergency_contact: formData.emergencyContact?.trim() || null,
        emergency_phone: formData.emergencyPhone?.trim() || null,
      };
      
      await updateProfile(updates);
      
      // Emit profile completion if now fully complete
      try {
        const isComplete = Boolean(
          updates.phone && updates.date_of_birth && updates.gender &&
          updates.height && updates.weight && updates.location
        );
        if (isComplete) {
          await emitBadgeEvent('profile.completed');
        }
      } catch (error) {
        }
      
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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

      {renderDatePicker('Date of Birth', <Calendar size={20} color={Colors.textSecondary} />)}

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



  const renderContent = () => {
    return renderPersonalSection();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
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
    borderColor: Colors.policeRedBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  datePickerText: {
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
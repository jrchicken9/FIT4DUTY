import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Footprints,
  Dumbbell,
  Activity,
  Brain,
  BedDouble,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import type { FitnessLogDay, FitnessLogDayFormData } from '@/types/fitness-log';
import Button from '@/components/Button';
import ProfessionalBackground from '@/components/ProfessionalBackground';

export default function DailyEntryScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [dayEntry, setDayEntry] = useState<FitnessLogDay | null>(null);
  const [formData, setFormData] = useState<FitnessLogDayFormData>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Section visibility states
  const [showRunDetails, setShowRunDetails] = useState(false);
  const [showStrengthDetails, setShowStrengthDetails] = useState(false);
  const [showOtherActivityDetails, setShowOtherActivityDetails] = useState(false);

  const loadDayEntry = async () => {
    try {
      setLoading(true);
      
      if (!date) {
        Alert.alert('Error', 'Invalid date parameter');
        router.back();
        return;
      }

      // Get active log
      const activeLog = await fitnessLogService.getActiveLog();
      if (!activeLog) {
        Alert.alert('Error', 'No active fitness log found');
        router.back();
        return;
      }

      // Get day entry
      const entry = await fitnessLogService.getDay(activeLog.id, date);
      setDayEntry(entry);
      
      if (entry) {
        // Populate form with existing data
        setFormData({
          run_duration_min: entry.run_duration_min || undefined,
          run_distance_km: entry.run_distance_km || undefined,
          run_location: entry.run_location || '',
          strength_duration_min: entry.strength_duration_min || undefined,
          strength_env: entry.strength_env || undefined,
          strength_split: entry.strength_split || undefined,
          strength_description: entry.strength_description || '',
          other_activity_type: entry.other_activity_type || '',
          other_activity_duration_min: entry.other_activity_duration_min || undefined,
          other_activity_location: entry.other_activity_location || '',
          stress_method: entry.stress_method || '',
          sleep_hours: entry.sleep_hours || undefined,
          notes: entry.notes || '',
        });
        
        // Show sections that have data
        setShowRunDetails(!!(entry.run_duration_min || entry.run_distance_km || entry.run_location));
        setShowStrengthDetails(!!(entry.strength_duration_min || entry.strength_description));
        setShowOtherActivityDetails(!!(entry.other_activity_type || entry.other_activity_duration_min));
      }
    } catch (error) {
      console.error('Error loading day entry:', error);
      Alert.alert('Error', 'Failed to load day entry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDayEntry();
  }, [date]);

  const updateFormData = (field: keyof FitnessLogDayFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields for completion
    if (!formData.stress_method?.trim()) {
      errors.stress_method = 'Stress management method is required';
    }
    
    if (formData.sleep_hours === undefined || formData.sleep_hours === null || formData.sleep_hours < 0) {
      errors.sleep_hours = 'Sleep hours must be a valid number (0 or greater)';
    }
    
    // Optional validation for other fields
    if (formData.run_duration_min !== undefined && formData.run_duration_min < 0) {
      errors.run_duration_min = 'Run duration must be 0 or greater';
    }
    
    if (formData.run_distance_km !== undefined && formData.run_distance_km < 0) {
      errors.run_distance_km = 'Run distance must be 0 or greater';
    }
    
    if (formData.strength_duration_min !== undefined && formData.strength_duration_min < 0) {
      errors.strength_duration_min = 'Strength duration must be 0 or greater';
    }
    
    if (formData.other_activity_duration_min !== undefined && formData.other_activity_duration_min < 0) {
      errors.other_activity_duration_min = 'Activity duration must be 0 or greater';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!dayEntry) {
        Alert.alert('Error', 'No day entry found');
        return;
      }

      await fitnessLogService.updateDay({
        id: dayEntry.id,
        ...formData,
      });

      Alert.alert('Success', 'Entry saved as draft');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before marking complete');
      return;
    }

    try {
      setCompleting(true);
      
      if (!dayEntry) {
        Alert.alert('Error', 'No day entry found');
        return;
      }

      await fitnessLogService.markDayComplete(dayEntry.id, formData);
      
      Alert.alert(
        'Day Completed!',
        'This day has been marked as complete. You can still edit it until the log is signed.',
        [{ text: 'OK' }]
      );
      
      // Reload the entry to update the UI
      await loadDayEntry();
    } catch (error) {
      console.error('Error marking day complete:', error);
      Alert.alert('Error', 'Failed to mark day as complete');
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayNumber = () => {
    if (!dayEntry) return 0;
    
    // Calculate day number based on log start date
    const activeLog = fitnessLogService.getActiveLog();
    // This would need to be passed as a prop or loaded differently
    // For now, we'll estimate based on the date
    return 1; // Placeholder
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading day entry...</Text>
        </View>
      </View>
    );
  }

  if (!dayEntry) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Day entry not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Day Entry</Text>
            <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
          </View>
          
          <View style={styles.headerStatus}>
            {dayEntry.is_complete ? (
              <View style={styles.completeBadge}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.completeBadgeText}>Complete</Text>
              </View>
            ) : (
              <View style={styles.draftBadge}>
                <AlertCircle size={16} color={Colors.warning} />
                <Text style={styles.draftBadgeText}>Draft</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Run Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowRunDetails(!showRunDetails)}
            >
              <View style={styles.sectionHeaderLeft}>
                <Footprints size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Running & Cardio</Text>
              </View>
              {showRunDetails ? (
                <ChevronUp size={20} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showRunDetails && (
              <View style={styles.sectionContent}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <TextInput
                      style={[styles.input, validationErrors.run_duration_min && styles.inputError]}
                      value={formData.run_duration_min?.toString() || ''}
                      onChangeText={(text) => updateFormData('run_duration_min', text ? parseFloat(text) : undefined)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    {validationErrors.run_duration_min && (
                      <Text style={styles.errorText}>{validationErrors.run_duration_min}</Text>
                    )}
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Distance (km)</Text>
                    <TextInput
                      style={[styles.input, validationErrors.run_distance_km && styles.inputError]}
                      value={formData.run_distance_km?.toString() || ''}
                      onChangeText={(text) => updateFormData('run_distance_km', text ? parseFloat(text) : undefined)}
                      placeholder="0.0"
                      keyboardType="numeric"
                    />
                    {validationErrors.run_distance_km && (
                      <Text style={styles.errorText}>{validationErrors.run_distance_km}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.run_location || ''}
                    onChangeText={(text) => updateFormData('run_location', text)}
                    placeholder="Where did you run?"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Strength Training Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowStrengthDetails(!showStrengthDetails)}
            >
              <View style={styles.sectionHeaderLeft}>
                <Dumbbell size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Strength Training</Text>
              </View>
              {showStrengthDetails ? (
                <ChevronUp size={20} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showStrengthDetails && (
              <View style={styles.sectionContent}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <TextInput
                      style={[styles.input, validationErrors.strength_duration_min && styles.inputError]}
                      value={formData.strength_duration_min?.toString() || ''}
                      onChangeText={(text) => updateFormData('strength_duration_min', text ? parseFloat(text) : undefined)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    {validationErrors.strength_duration_min && (
                      <Text style={styles.errorText}>{validationErrors.strength_duration_min}</Text>
                    )}
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Environment</Text>
                    <View style={styles.pickerContainer}>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          formData.strength_env === 'indoor' && styles.pickerOptionSelected
                        ]}
                        onPress={() => updateFormData('strength_env', 'indoor')}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.strength_env === 'indoor' && styles.pickerOptionTextSelected
                        ]}>Indoor</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          formData.strength_env === 'outdoor' && styles.pickerOptionSelected
                        ]}
                        onPress={() => updateFormData('strength_env', 'outdoor')}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.strength_env === 'outdoor' && styles.pickerOptionTextSelected
                        ]}>Outdoor</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Split</Text>
                  <View style={styles.pickerContainer}>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        formData.strength_split === 'upper' && styles.pickerOptionSelected
                      ]}
                      onPress={() => updateFormData('strength_split', 'upper')}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.strength_split === 'upper' && styles.pickerOptionTextSelected
                      ]}>Upper</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        formData.strength_split === 'lower' && styles.pickerOptionSelected
                      ]}
                      onPress={() => updateFormData('strength_split', 'lower')}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.strength_split === 'lower' && styles.pickerOptionTextSelected
                      ]}>Lower</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        formData.strength_split === 'full' && styles.pickerOptionSelected
                      ]}
                      onPress={() => updateFormData('strength_split', 'full')}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.strength_split === 'full' && styles.pickerOptionTextSelected
                      ]}>Full</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        formData.strength_split === 'other' && styles.pickerOptionSelected
                      ]}
                      onPress={() => updateFormData('strength_split', 'other')}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.strength_split === 'other' && styles.pickerOptionTextSelected
                      ]}>Other</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.strength_description || ''}
                    onChangeText={(text) => updateFormData('strength_description', text)}
                    placeholder="Exercises, sets, reps, weights..."
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Other Activity Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowOtherActivityDetails(!showOtherActivityDetails)}
            >
              <View style={styles.sectionHeaderLeft}>
                <Activity size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Other Activity</Text>
              </View>
              {showOtherActivityDetails ? (
                <ChevronUp size={20} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showOtherActivityDetails && (
              <View style={styles.sectionContent}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Activity Type</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.other_activity_type || ''}
                      onChangeText={(text) => updateFormData('other_activity_type', text)}
                      placeholder="e.g., Swimming, Cycling, Yoga"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <TextInput
                      style={[styles.input, validationErrors.other_activity_duration_min && styles.inputError]}
                      value={formData.other_activity_duration_min?.toString() || ''}
                      onChangeText={(text) => updateFormData('other_activity_duration_min', text ? parseFloat(text) : undefined)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    {validationErrors.other_activity_duration_min && (
                      <Text style={styles.errorText}>{validationErrors.other_activity_duration_min}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.other_activity_location || ''}
                    onChangeText={(text) => updateFormData('other_activity_location', text)}
                    placeholder="Where did you do this activity?"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Required Fields Section */}
          <View style={styles.requiredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Brain size={24} color={Colors.warning} />
                <Text style={styles.sectionTitle}>Required Daily Fields</Text>
              </View>
            </View>
            
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Stress Management Method <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, validationErrors.stress_method && styles.inputError]}
                  value={formData.stress_method || ''}
                  onChangeText={(text) => updateFormData('stress_method', text)}
                  placeholder="How did you manage stress today?"
                />
                {validationErrors.stress_method && (
                  <Text style={styles.errorText}>{validationErrors.stress_method}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Sleep Hours <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, validationErrors.sleep_hours && styles.inputError]}
                  value={formData.sleep_hours?.toString() || ''}
                  onChangeText={(text) => updateFormData('sleep_hours', text ? parseFloat(text) : undefined)}
                  placeholder="7.5"
                  keyboardType="numeric"
                />
                {validationErrors.sleep_hours && (
                  <Text style={styles.errorText}>{validationErrors.sleep_hours}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
              </View>
            </View>
            
            <View style={styles.sectionContent}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes || ''}
                onChangeText={(text) => updateFormData('notes', text)}
                placeholder="Any additional notes about your day..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <View style={styles.actionButtons}>
            <Button
              title="Save Draft"
              onPress={handleSave}
              variant="outline"
              loading={saving}
              disabled={saving}
              icon={<Save size={16} color={Colors.primary} />}
              iconPosition="left"
              style={styles.actionButton}
            />
            
            <Button
              title="Mark Complete"
              onPress={handleMarkComplete}
              variant="gradient"
              loading={completing}
              disabled={completing || dayEntry.is_complete}
              icon={<CheckCircle2 size={16} color={Colors.white} />}
              iconPosition="left"
              style={styles.actionButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  errorText: {
    ...typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerStatus: {
    marginLeft: 16,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  
  // Sections
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.lg,
    ...shadows.level2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requiredSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.lg,
    ...shadows.level2,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionContent: {
    padding: 16,
    gap: 16,
  },
  
  // Inputs
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Picker
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    color: Colors.white,
  },
  
  // Action Section
  actionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

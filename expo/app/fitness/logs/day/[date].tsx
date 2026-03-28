import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, CheckCircle, Calendar, Edit } from 'lucide-react-native';
import { format, addDays } from 'date-fns';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { FitnessLog, FitnessLogDay, FitnessLogDayFormData } from '@/types/fitness-log';
import { OacpFitnessLogDayFormData, Intensity } from '@/types/oacpFitnessLog';
import { calculateDayNumber, createConsistentDate } from '@/lib/dateUtils';

export default function DailyEntryScreen() {
  const { date, logId } = useLocalSearchParams<{ date: string; logId: string }>();
  const [log, setLog] = useState<FitnessLog | null>(null);
  const [dayEntry, setDayEntry] = useState<FitnessLogDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<OacpFitnessLogDayFormData>({
    run_duration_min: undefined,
    run_distance_km: undefined,
    run_location: '',
    strength_duration_min: undefined,
    strength_env: undefined,
    strength_split: undefined,
    strength_description: '',
    other_activity_type: '',
    other_activity_duration_min: undefined,
    other_activity_location: '',
    stress_method: '',
    sleep_hours: undefined,
    notes: '',
    // OACP-specific fields
    activity: '',
    duration_mins: 0,
    intensity: 'Moderate',
    comments: '',
    signer_initials: '',
    signed: false,
  });

  useEffect(() => {
    if (date && logId) {
      loadData();
    }
  }, [date, logId]);

  const loadData = async () => {
    if (!date || !logId) return;
    
    setLoading(true);
    try {
      const [logData, dayData] = await Promise.all([
        fitnessLogService.getLog(logId),
        fitnessLogService.getDay(logId, date)
      ]);
      
      setLog(logData);
      setDayEntry(dayData);
      
      if (dayData) {
        setFormData({
          run_duration_min: dayData.run_duration_min || undefined,
          run_distance_km: dayData.run_distance_km || undefined,
          run_location: dayData.run_location || '',
          strength_duration_min: dayData.strength_duration_min || undefined,
          strength_env: dayData.strength_env || undefined,
          strength_split: dayData.strength_split || undefined,
          strength_description: dayData.strength_description || '',
          other_activity_type: dayData.other_activity_type || '',
          other_activity_duration_min: dayData.other_activity_duration_min || undefined,
          other_activity_location: dayData.other_activity_location || '',
          stress_method: dayData.stress_method || '',
          sleep_hours: dayData.sleep_hours || undefined,
          notes: dayData.notes || '',
          // OACP-specific fields with backward compatibility
          activity: (dayData as any).activity || '',
          duration_mins: (dayData as any).duration_mins || 0,
          intensity: (dayData as any).intensity || 'Moderate',
          comments: (dayData as any).comments || '',
          signer_initials: (dayData as any).signer_initials || '',
          signed: (dayData as any).signed || false,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load day data.');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!date || !logId) return;
    
    setSaving(true);
    try {
      await fitnessLogService.updateDay(logId, date, formData);
      Alert.alert('Success', 'Entry saved successfully!');
      
      // If the day was completed and we were editing, return to view mode
      if (isComplete && isEditing) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async () => {
    if (!formData.stress_method || formData.sleep_hours === undefined) {
      Alert.alert(
        'Missing Required Fields',
        'Please fill in stress management method and sleep hours to mark this day as complete.'
      );
      return;
    }

    if (!date || !logId) return;
    
    setSaving(true);
    try {
      // First save the current form data
      await fitnessLogService.updateDay(logId, date, formData);
      
      // Then mark the day as complete
      await fitnessLogService.markDayComplete(logId, date);
      
      Alert.alert('Success', 'Day marked as complete!');
      router.back();
    } catch (error) {
      console.error('Error marking day complete:', error);
      Alert.alert('Error', 'Failed to mark day as complete.');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof OacpFitnessLogDayFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate day number with proper date validation
  const dayNumber = log ? calculateDayNumber(date!, log.start_date) : 0;
  
  const isComplete = dayEntry?.is_complete || false;
  const isViewMode = isComplete && !isEditing;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
        <LinearGradient
        colors={isViewMode ? ['#3B82F6DD', '#1E40AFDD'] : ['#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isViewMode ? `Day ${dayNumber} - View` : `Day ${dayNumber} Entry`}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Info */}
            <View style={styles.dateSection}>
              <View style={[styles.dateCard, isViewMode && styles.dateCardViewMode]}>
                <Calendar size={20} color={isViewMode ? Colors.white + 'CC' : Colors.white} />
                <Text style={[styles.dateText, isViewMode && styles.dateTextViewMode]}>
                  {format(new Date(date! + 'T00:00:00'), 'EEEE, MMMM dd, yyyy')}
                </Text>
                {isComplete && (
                  <View style={[styles.completeBadge, isViewMode && styles.completeBadgeViewMode]}>
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.completeText}>Complete</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Run Section */}
            <View style={[styles.section, isViewMode && styles.sectionViewMode]}>
              <Text style={[styles.sectionTitle, isViewMode && styles.sectionTitleViewMode]}>Run</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Duration (minutes)</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.run_duration_min ? `${formData.run_duration_min} minutes` : 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={formData.run_duration_min?.toString() || ''}
                      onChangeText={(text) => updateFormData('run_duration_min', text ? parseInt(text) : undefined)}
                      placeholder="30"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.white + '60'}
                    />
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Distance (km)</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.run_distance_km ? `${formData.run_distance_km} km` : 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={formData.run_distance_km?.toString() || ''}
                      onChangeText={(text) => updateFormData('run_distance_km', text ? parseFloat(text) : undefined)}
                      placeholder="5.0"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.white + '60'}
                    />
                  )}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                {isViewMode ? (
                  <View style={styles.viewModeInput}>
                    <Text style={styles.viewModeText}>
                      {formData.run_location || 'Not specified'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={formData.run_location}
                    onChangeText={(text) => updateFormData('run_location', text)}
                    placeholder="Park, treadmill, etc."
                    placeholderTextColor={Colors.white + '60'}
                  />
                )}
              </View>
            </View>

            {/* Strength Section */}
            <View style={[styles.section, isViewMode && styles.sectionViewMode]}>
              <Text style={[styles.sectionTitle, isViewMode && styles.sectionTitleViewMode]}>Strength Training</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                {isViewMode ? (
                  <View style={styles.viewModeInput}>
                    <Text style={styles.viewModeText}>
                      {formData.strength_duration_min ? `${formData.strength_duration_min} minutes` : 'Not specified'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={formData.strength_duration_min?.toString() || ''}
                    onChangeText={(text) => updateFormData('strength_duration_min', text ? parseInt(text) : undefined)}
                    placeholder="45"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.white + '60'}
                  />
                )}
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Environment</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.strength_env || 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={formData.strength_env || ''}
                      onChangeText={(text) => updateFormData('strength_env', text as 'indoor' | 'outdoor' | undefined)}
                      placeholder="indoor/outdoor"
                      placeholderTextColor={Colors.white + '60'}
                    />
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Split</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.strength_split || 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={formData.strength_split || ''}
                      onChangeText={(text) => updateFormData('strength_split', text as 'upper' | 'lower' | 'full' | 'other' | undefined)}
                      placeholder="upper/lower/full/other"
                      placeholderTextColor={Colors.white + '60'}
                    />
                  )}
                </View>
              </View>
              <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.strength_description}
                  onChangeText={(text) => updateFormData('strength_description', text)}
                  placeholder="Exercises, sets, reps, weights..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={Colors.white + '60'}
                />
              </View>
            </View>

            {/* Other Activity Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Other Activity</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Type</Text>
                <TextInput
                  style={styles.input}
                  value={formData.other_activity_type}
                  onChangeText={(text) => updateFormData('other_activity_type', text)}
                  placeholder="Swimming, cycling, yoga, etc."
                  placeholderTextColor={Colors.white + '60'}
                />
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.other_activity_duration_min?.toString() || ''}
                    onChangeText={(text) => updateFormData('other_activity_duration_min', text ? parseInt(text) : undefined)}
                    placeholder="30"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.white + '60'}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.other_activity_location}
                    onChangeText={(text) => updateFormData('other_activity_location', text)}
                    placeholder="Gym, home, etc."
                    placeholderTextColor={Colors.white + '60'}
                  />
                </View>
              </View>
            </View>

            {/* Required Fields */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Daily Fields</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stress Management Method *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stress_method}
                  onChangeText={(text) => updateFormData('stress_method', text)}
                  placeholder="Meditation, breathing exercises, etc."
                  placeholderTextColor={Colors.white + '60'}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sleep Hours *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sleep_hours?.toString() || ''}
                  onChangeText={(text) => updateFormData('sleep_hours', text ? parseFloat(text) : undefined)}
                  placeholder="8.0"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.white + '60'}
                />
              </View>
            </View>

            {/* Notes Section */}
            <View style={[styles.section, isViewMode && styles.sectionViewMode]}>
              <Text style={[styles.sectionTitle, isViewMode && styles.sectionTitleViewMode]}>Notes</Text>
              <View style={styles.inputGroup}>
                {isViewMode ? (
                  <View style={[styles.viewModeInput, styles.viewModeTextArea]}>
                    <Text style={styles.viewModeText}>
                      {formData.notes || 'No additional notes'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.notes}
                    onChangeText={(text) => updateFormData('notes', text)}
                    placeholder="Additional notes about your day..."
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={Colors.white + '60'}
                  />
                )}
              </View>
            </View>

            {/* OACP Fields Section */}
            <View style={[styles.section, isViewMode && styles.sectionViewMode]}>
              <Text style={[styles.sectionTitle, isViewMode && styles.sectionTitleViewMode]}>OACP Fields</Text>
              
              {/* Activity Summary */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Activity Summary</Text>
                {isViewMode ? (
                  <View style={styles.viewModeInput}>
                    <Text style={styles.viewModeText}>
                      {formData.activity || 'Not specified'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={formData.activity}
                    onChangeText={(text) => updateFormData('activity', text)}
                    placeholder="e.g., Run + Strength Training"
                    placeholderTextColor={Colors.white + '60'}
                  />
                )}
              </View>

              {/* Duration and Intensity Row */}
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Total Duration (min)</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.duration_mins ? `${formData.duration_mins} minutes` : 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={formData.duration_mins?.toString() || ''}
                      onChangeText={(text) => updateFormData('duration_mins', text ? parseInt(text) : 0)}
                      placeholder="45"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.white + '60'}
                    />
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Intensity</Text>
                  {isViewMode ? (
                    <View style={styles.viewModeInput}>
                      <Text style={styles.viewModeText}>
                        {formData.intensity || 'Not specified'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => {
                          Alert.alert(
                            'Select Intensity',
                            'Choose the intensity level for your activities',
                            [
                              { text: 'Low', onPress: () => updateFormData('intensity', 'Low' as Intensity) },
                              { text: 'Moderate', onPress: () => updateFormData('intensity', 'Moderate' as Intensity) },
                              { text: 'Vigorous', onPress: () => updateFormData('intensity', 'Vigorous' as Intensity) },
                              { text: 'Cancel', style: 'cancel' },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.pickerButtonText}>
                          {formData.intensity || 'Select Intensity'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Comments */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Comments</Text>
                {isViewMode ? (
                  <View style={[styles.viewModeInput, styles.viewModeTextArea]}>
                    <Text style={styles.viewModeText}>
                      {formData.comments || 'No additional comments'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.comments}
                    onChangeText={(text) => updateFormData('comments', text)}
                    placeholder="Additional comments or observations..."
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={Colors.white + '60'}
                  />
                )}
              </View>

              {/* Signature Section */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isViewMode && styles.inputLabelViewMode]}>Signature/Initials</Text>
                {isViewMode ? (
                  <View style={styles.viewModeInput}>
                    <Text style={styles.viewModeText}>
                      {formData.signer_initials || (formData.signed ? '✓ Signed' : 'Not signed')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <TextInput
                        style={styles.input}
                        value={formData.signer_initials}
                        onChangeText={(text) => updateFormData('signer_initials', text)}
                        placeholder="Your initials"
                        placeholderTextColor={Colors.white + '60'}
                        maxLength={10}
                      />
                    </View>
                    <View style={styles.checkboxContainer}>
                      <TouchableOpacity
                        style={[styles.checkbox, formData.signed && styles.checkboxChecked]}
                        onPress={() => updateFormData('signed', !formData.signed)}
                      >
                        {formData.signed && (
                          <Text style={styles.checkboxText}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <Text style={[styles.inputLabel, { marginLeft: 8 }]}>Signed</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.actionSection, isViewMode && styles.actionSectionViewMode]}>
            {isViewMode ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit size={20} color={Colors.white} />
                <Text style={styles.editButtonText}>Edit Entry</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={saveEntry}
                  disabled={saving}
                >
                  <Save size={20} color={Colors.white} />
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Entry'}
                  </Text>
                </TouchableOpacity>

                {isComplete && isEditing && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                {!isComplete && (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={markComplete}
                    disabled={saving}
                  >
                    <CheckCircle size={20} color={Colors.white} />
                    <Text style={styles.completeButtonText}>
                      {saving ? 'Saving...' : 'Mark Day Complete'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 60, // Increased to account for status bar since we removed the navigation header
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.bodyLarge,
    color: Colors.white,
    fontWeight: '600',
    flex: 1,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
  },
  completeText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.labelMedium,
    color: Colors.white + 'CC',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    ...typography.bodyMedium,
    color: Colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  viewModeInput: {
    backgroundColor: Colors.white + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '15',
    minHeight: 48,
    justifyContent: 'center',
  },
  viewModeTextArea: {
    minHeight: 80,
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
  },
  viewModeText: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    lineHeight: 20,
  },
  dateCardViewMode: {
    backgroundColor: Colors.white + '05',
    borderWidth: 1,
    borderColor: Colors.white + '10',
  },
  dateTextViewMode: {
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  completeBadgeViewMode: {
    backgroundColor: Colors.success + 'DD',
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  sectionViewMode: {
    backgroundColor: Colors.white + '03',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '08',
  },
  sectionTitleViewMode: {
    color: Colors.white + 'DD',
    fontWeight: '500',
    fontSize: 16,
  },
  inputLabelViewMode: {
    color: Colors.white + 'BB',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionSection: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.white + '40',
  },
  saveButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  completeButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.level2,
  },
  editButtonText: {
    ...typography.buttonLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.white + '40',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    ...typography.buttonMedium,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  actionSectionViewMode: {
    backgroundColor: Colors.white + '05',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '10',
  },
  // OACP-specific styles
  pickerContainer: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerButtonText: {
    ...typography.bodyMedium,
    color: Colors.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginLeft: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.white + '40',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { X, Car, Heart, Check, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

type DrivingBackgroundModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  section: 'driving_record' | 'background_fitness';
};

export default function DrivingBackgroundModal({
  visible,
  onClose,
  onSave,
  initialData = {},
  section
}: DrivingBackgroundModalProps) {
  const [data, setData] = useState<any>(initialData);

  useEffect(() => {
    if (visible) {
      setData(initialData);
    }
  }, [visible, initialData]);

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderDrivingRecordSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Driver's License & Record</Text>
      
      {/* License Class */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Driver's License Class *</Text>
        <View style={styles.optionsContainer}>
          {['G1', 'G2', 'G'].map(license => (
            <TouchableOpacity
              key={license}
              style={[
                styles.optionButton,
                data.driver_licence_class === license && styles.optionButtonSelected
              ]}
              onPress={() => updateField('driver_licence_class', license)}
            >
              <Text style={[
                styles.optionText,
                data.driver_licence_class === license && styles.optionTextSelected
              ]}>
                {license}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clean Abstract */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Clean Driving Abstract *</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.driver_clean_abstract === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('driver_clean_abstract', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.driver_clean_abstract === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Infractions */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Driving Infractions</Text>
        <View style={styles.optionsContainer}>
          {['None', '1 Minor', '2+ Minor', 'Major'].map(infraction => (
            <TouchableOpacity
              key={infraction}
              style={[
                styles.optionButton,
                data.driver_infractions === infraction && styles.optionButtonSelected
              ]}
              onPress={() => updateField('driver_infractions', infraction)}
            >
              <Text style={[
                styles.optionText,
                data.driver_infractions === infraction && styles.optionTextSelected
              ]}>
                {infraction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Infraction Date */}
      {data.driver_infractions && data.driver_infractions !== 'None' && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>When was the infraction?</Text>
          <View style={styles.optionsContainer}>
            {[
              'Within 6 months',
              '6-12 months ago',
              '1-2 years ago',
              '2-3 years ago',
              '3+ years ago'
            ].map(date => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.optionButton,
                  data.driver_infraction_date === date && styles.optionButtonSelected
                ]}
                onPress={() => updateField('driver_infraction_date', date)}
              >
                <Text style={[
                  styles.optionText,
                  data.driver_infraction_date === date && styles.optionTextSelected
                ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderBackgroundFitnessSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Background & Physical Readiness</Text>
      
      {/* Background Checks */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Background Check Complete</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.background_check_complete === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('background_check_complete', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.background_check_complete === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Credit Check */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Credit Check Complete</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.credit_check_complete === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('credit_check_complete', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.credit_check_complete === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Social Media Clean</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.social_media_clean === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('social_media_clean', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.social_media_clean === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Verifications */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Education Verified</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.education_verified === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('education_verified', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.education_verified === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Employment Verified</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                data.employment_verified === option.value && styles.optionButtonSelected
              ]}
              onPress={() => updateField('employment_verified', option.value)}
            >
              <Text style={[
                styles.optionText,
                data.employment_verified === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* PREP Test Status */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>PREP Test Status *</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: 'verified', label: 'Verified by Observer' },
            { value: 'attempted', label: 'Attempted (Digital)' },
            { value: 'not_attempted', label: 'Not Attempted' }
          ].map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                ((option.value === 'verified' && data.fitness_prep_observed_verified) ||
                 (option.value === 'attempted' && data.fitness_prep_digital_attempted) ||
                 (option.value === 'not_attempted' && !data.fitness_prep_observed_verified && !data.fitness_prep_digital_attempted)) && styles.optionButtonSelected
              ]}
              onPress={() => {
                if (option.value === 'verified') {
                  updateField('fitness_prep_observed_verified', true);
                  updateField('fitness_prep_digital_attempted', false);
                } else if (option.value === 'attempted') {
                  updateField('fitness_prep_observed_verified', false);
                  updateField('fitness_prep_digital_attempted', true);
                } else {
                  updateField('fitness_prep_observed_verified', false);
                  updateField('fitness_prep_digital_attempted', false);
                }
              }}
            >
              <Text style={[
                styles.optionText,
                ((option.value === 'verified' && data.fitness_prep_observed_verified) ||
                 (option.value === 'attempted' && data.fitness_prep_digital_attempted) ||
                 (option.value === 'not_attempted' && !data.fitness_prep_observed_verified && !data.fitness_prep_digital_attempted)) && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Circuit Time */}
      {(data.fitness_prep_observed_verified || data.fitness_prep_digital_attempted) && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>PREP Circuit Time (MM:SS) *</Text>
          <View style={styles.optionsContainer}>
            {[
              '2:00', '2:15', '2:30', '2:37', '2:45', '3:00', '3:15', '3:30', '3:45', '4:00', '4:15', '4:30', '4:45', '5:00', '5:30', 'Over 6:00'
            ].map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.optionButton,
                  data.fitness_circuit_time === time && styles.optionButtonSelected
                ]}
                onPress={() => updateField('fitness_circuit_time', time)}
              >
                <Text style={[
                  styles.optionText,
                  data.fitness_circuit_time === time && styles.optionTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Shuttle Run */}
      {(data.fitness_prep_observed_verified || data.fitness_prep_digital_attempted) && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Shuttle Run Level *</Text>
          <View style={styles.optionsContainer}>
            {[
              '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0', '12.5', '13.0', '13.5', '14.0'
            ].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  data.fitness_shuttle_run === level && styles.optionButtonSelected
                ]}
                onPress={() => updateField('fitness_shuttle_run', level)}
              >
                <Text style={[
                  styles.optionText,
                  data.fitness_shuttle_run === level && styles.optionTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* PREP Test Warning */}
      {section === 'background_fitness' && (
        <View style={styles.warningContainer}>
          <AlertCircle size={20} color={Colors.warning} />
          <Text style={styles.warningText}>
            You must be able to pass the PREP test to be considered for police recruitment.{'\n'}
            • Circuit time must be 2:37 or under to pass{'\n'}
            • Shuttle run must be level 7.0 or higher to pass
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {section === 'driving_record' ? 'Driver\'s License & Record' : 'Background & Physical Readiness'}
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {section === 'driving_record' ? renderDrivingRecordSection() : renderBackgroundFitnessSection()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    backgroundColor: Colors.white + '20',
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: Colors.white + '20',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.white,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { usePinTest, PinTestInput } from '@/context/PinTestContext';

import Button from '@/components/Button';
import Timer from '@/components/Timer';
import ComponentTooltip from '@/components/ComponentTooltip';
import PinTestTooltip from '@/components/PinTestTooltip';

import Colors from '@/constants/colors';
import { Clock, Activity, Target, Ruler, StepBack, Edit3, Info } from 'lucide-react-native';

type InputMode = 'manual' | 'timer';

export default function PinTestScreen() {
  const { submitTestResult, isSubmitting, checkProfileCompletion } = usePinTest();
  
  const [formData, setFormData] = useState<PinTestInput>({
    mileRunMinutes: '00',
    mileRunSeconds: '00',
    pushupsCount: '0',
    coreEnduranceMinutes: '00',
    coreEnduranceSeconds: '00',
    sitReachDistance: '0',
    notes: '',
  });
  
  const [mileRunMode, setMileRunMode] = useState<InputMode>('manual');
  const [coreEnduranceMode, setCoreEnduranceMode] = useState<InputMode>('manual');
  
  const [componentTooltipVisible, setComponentTooltipVisible] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<'mileRun' | 'pushups' | 'coreEndurance' | 'sitReach'>('mileRun');
  const [scoringTooltipVisible, setScoringTooltipVisible] = useState<boolean>(false);

  const handleSubmit = async () => {
    // Check profile completion first
    const { isComplete, missingFields } = checkProfileCompletion();
    
    if (!isComplete) {
      Alert.alert(
        'Profile Incomplete',
        `Please complete your profile before taking the PIN test. Missing: ${missingFields.join(', ')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Profile', 
            onPress: () => router.push('/profile-completion')
          }
        ]
      );
      return;
    }

    const success = await submitTestResult(formData);
    if (success) {
      // Reset form
      setFormData({
        mileRunMinutes: '00',
        mileRunSeconds: '00',
        pushupsCount: '0',
        coreEnduranceMinutes: '00',
        coreEnduranceSeconds: '00',
        sitReachDistance: '0',
        notes: '',
      });
      
      // Navigate to results
      router.push('/pin-test/results');
    }
  };

  const updateField = (field: keyof PinTestInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (minutes: string, seconds: string) => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateNumber = (value: string, max: number) => {
    const num = parseInt(value) || 0;
    return Math.min(Math.max(0, num), max).toString();
  };

  const handleTimerSave = (component: 'mileRun' | 'coreEndurance', minutes: number, seconds: number) => {
    if (component === 'mileRun') {
      setFormData(prev => ({
        ...prev,
        mileRunMinutes: minutes.toString().padStart(2, '0'),
        mileRunSeconds: seconds.toString().padStart(2, '0'),
      }));
      setMileRunMode('manual');
    } else {
      setFormData(prev => ({
        ...prev,
        coreEnduranceMinutes: minutes.toString().padStart(2, '0'),
        coreEnduranceSeconds: seconds.toString().padStart(2, '0'),
      }));
      setCoreEnduranceMode('manual');
    }
  };

  const showComponentTooltip = (component: 'mileRun' | 'pushups' | 'coreEndurance' | 'sitReach') => {
    setSelectedComponent(component);
    setComponentTooltipVisible(true);
  };

  const renderInputModeToggle = (currentMode: InputMode, setMode: (mode: InputMode) => void, component: string) => (
    <View style={styles.inputModeContainer}>
      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'manual' && styles.modeButtonActive]}
        onPress={() => setMode('manual')}
        testID={`${component}-manual-mode`}
      >
        <Edit3 size={16} color={currentMode === 'manual' ? Colors.white : Colors.primary} />
        <Text style={[styles.modeButtonText, currentMode === 'manual' && styles.modeButtonTextActive]}>
          Enter Manually
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'timer' && styles.modeButtonActive]}
        onPress={() => setMode('timer')}
        testID={`${component}-timer-mode`}
      >
        <StepBack size={16} color={currentMode === 'timer' ? Colors.white : Colors.primary} />
        <Text style={[styles.modeButtonText, currentMode === 'timer' && styles.modeButtonTextActive]}>
          Use Timer
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={false}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Ontario Police PIN Test</Text>
            <TouchableOpacity 
              onPress={() => setScoringTooltipVisible(true)}
              style={styles.infoButton}
              testID="scoring-info-button"
            >
              <Info size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Enter your test results for each component. You can complete any or all components independently.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Clock size={28} color={Colors.white} />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.componentTitle}>1.5 Mile Run</Text>
              <Text style={styles.componentDescription}>Enter your completion time or use the timer</Text>
            </View>
            <TouchableOpacity 
              onPress={() => showComponentTooltip('mileRun')}
              style={styles.componentInfoButton}
              testID="mile-run-info-button"
            >
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            {renderInputModeToggle(mileRunMode, setMileRunMode, 'mile-run')}
            
            {mileRunMode === 'manual' ? (
              <>
                <View style={styles.timeInputContainer}>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>Minutes</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={formData.mileRunMinutes}
                      onChangeText={(value) => {
                        const validated = validateNumber(value, 30);
                        updateField('mileRunMinutes', validated);
                      }}
                      selectTextOnFocus={true}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      testID="mile-run-minutes"
                    />
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>Seconds</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={formData.mileRunSeconds}
                      onChangeText={(value) => {
                        const validated = validateNumber(value, 59);
                        updateField('mileRunSeconds', validated);
                      }}
                      selectTextOnFocus={true}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      testID="mile-run-seconds"
                    />
                  </View>
                </View>
                <Text style={styles.timeDisplay}>
                  Time: {formatTime(formData.mileRunMinutes, formData.mileRunSeconds)}
                </Text>
              </>
            ) : (
              <Timer
                title="1.5 Mile Run Timer"
                onSave={(minutes, seconds) => handleTimerSave('mileRun', minutes, seconds)}
              />
            )}
          </View>
        </View>

        <View style={styles.componentCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.success }]}>
              <Activity size={28} color={Colors.white} />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.componentTitle}>Push-ups</Text>
              <Text style={styles.componentDescription}>Number of correct repetitions</Text>
            </View>
            <TouchableOpacity 
              onPress={() => showComponentTooltip('pushups')}
              style={styles.componentInfoButton}
              testID="pushups-info-button"
            >
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.numberInputContainer}>
              <Text style={styles.inputLabel}>Number of Push-ups</Text>
              <TextInput
                style={styles.numberInput}
                value={formData.pushupsCount}
                onChangeText={(value) => {
                  const validated = validateNumber(value, 100);
                  updateField('pushupsCount', validated);
                }}
                selectTextOnFocus={true}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                testID="pushups-input"
              />
              <Text style={styles.inputHint}>Enter 0-100 repetitions</Text>
            </View>
          </View>
        </View>

        <View style={styles.componentCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.warning }]}>
              <Target size={28} color={Colors.white} />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.componentTitle}>Core Endurance</Text>
              <Text style={styles.componentDescription}>Hold time duration or use the timer</Text>
            </View>
            <TouchableOpacity 
              onPress={() => showComponentTooltip('coreEndurance')}
              style={styles.componentInfoButton}
              testID="core-endurance-info-button"
            >
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            {renderInputModeToggle(coreEnduranceMode, setCoreEnduranceMode, 'core-endurance')}
            
            {coreEnduranceMode === 'manual' ? (
              <>
                <View style={styles.timeInputContainer}>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>Minutes</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={formData.coreEnduranceMinutes}
                      onChangeText={(value) => {
                        const validated = validateNumber(value, 15);
                        updateField('coreEnduranceMinutes', validated);
                      }}
                      selectTextOnFocus={true}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      testID="core-endurance-minutes"
                    />
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>Seconds</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={formData.coreEnduranceSeconds}
                      onChangeText={(value) => {
                        const validated = validateNumber(value, 59);
                        updateField('coreEnduranceSeconds', validated);
                      }}
                      selectTextOnFocus={true}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      testID="core-endurance-seconds"
                    />
                  </View>
                </View>
                <Text style={styles.timeDisplay}>
                  Time: {formatTime(formData.coreEnduranceMinutes, formData.coreEnduranceSeconds)}
                </Text>
              </>
            ) : (
              <Timer
                title="Core Endurance Timer"
                onSave={(minutes, seconds) => handleTimerSave('coreEndurance', minutes, seconds)}
              />
            )}
          </View>
        </View>

        <View style={styles.componentCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.secondary }]}>
              <Ruler size={28} color={Colors.white} />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.componentTitle}>Sit and Reach</Text>
              <Text style={styles.componentDescription}>Distance reached in centimeters</Text>
            </View>
            <TouchableOpacity 
              onPress={() => showComponentTooltip('sitReach')}
              style={styles.componentInfoButton}
              testID="sit-reach-info-button"
            >
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.numberInputContainer}>
              <Text style={styles.inputLabel}>Distance Reached (cm)</Text>
              <TextInput
                style={styles.numberInput}
                value={formData.sitReachDistance}
                onChangeText={(value) => {
                  const validated = validateNumber(value, 100);
                  updateField('sitReachDistance', validated);
                }}
                selectTextOnFocus={true}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                testID="sit-reach-input"
              />
              <Text style={styles.inputHint}>Enter distance in centimeters (0-100)</Text>
            </View>
          </View>
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about your test..."
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            testID="notes-input"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isSubmitting ? "Submitting..." : "Submit Results"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            testId="submit-button"
          />
          
          <Button
            title="View Previous Results"
            onPress={() => router.push('/pin-test/results')}
            variant="outline"
            style={styles.secondaryButton}
            testId="view-results-button"
          />
        </View>
      </ScrollView>
      
      <ComponentTooltip
        visible={componentTooltipVisible}
        onClose={() => setComponentTooltipVisible(false)}
        component={selectedComponent}
      />
      
      <PinTestTooltip
        visible={scoringTooltipVisible}
        onClose={() => setScoringTooltipVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  componentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  componentInfoButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    marginLeft: 8,
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardContent: {
    padding: 20,
    paddingTop: 16,
  },
  notesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  timeInputWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 70,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timeInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    width: '100%',
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.primary,
    marginHorizontal: 12,
    minWidth: 20,
  },
  timeDisplay: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  numberInputContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  numberInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    minWidth: 100,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  secondaryButton: {
    marginTop: 12,
  },
  inputModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
});
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import ScrollPicker from './ScrollPicker';
import Colors from '@/constants/colors';

interface TimePickerProps {
  minutes: string;
  seconds: string;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  maxMinutes?: number;
  testID?: string;
}

export default function TimePicker({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  maxMinutes = 30,
  testID,
}: TimePickerProps) {
  const minutesData = Array.from({ length: maxMinutes + 1 }, (_, i) => i.toString().padStart(2, '0'));
  const secondsData = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.timeContainer}>
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerContainer}>
            <ScrollPicker
              data={minutesData}
              selectedValue={minutes.padStart(2, '0')}
              onValueChange={(value) => onMinutesChange(value.toString())}
              itemHeight={60}
              visibleItems={5}
              label="Minutes"
              testID={`${testID}-minutes`}
            />
          </View>
        </View>
        
        <View style={styles.separatorContainer}>
          <Text style={styles.separator}>:</Text>
        </View>
        
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerContainer}>
            <ScrollPicker
              data={secondsData}
              selectedValue={seconds.padStart(2, '0')}
              onValueChange={(value) => onSecondsChange(value.toString())}
              itemHeight={60}
              visibleItems={5}
              label="Seconds"
              testID={`${testID}-seconds`}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      },
    }),
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  separatorContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.primary,
    opacity: 0.8,
  },

});
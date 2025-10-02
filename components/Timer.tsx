import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Play, Pause, RotateCcw, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Button from '@/components/Button';
import Colors from '@/constants/colors';

interface TimerProps {
  onSave: (minutes: number, seconds: number) => void;
  title?: string;
}

export default function Timer({ onSave, title = 'Timer' }: TimerProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0); // Time in seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Memoize formatTime function to avoid recreating on every render
  const formatTime = useCallback((totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Memoize time calculations
  const { minutes, seconds, formattedTime } = useMemo(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return {
      minutes: mins,
      seconds: secs,
      formattedTime: formatTime(time)
    };
  }, [time, formatTime]);

  const handleStart = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(false);
    setTime(0);
  }, []);

  const handleSave = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onSave(minutes, seconds);
  }, [minutes, seconds, onSave]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.timeLabel}>MM:SS</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.primaryControls}>
          {!isRunning ? (
            <Button
              title="Start"
              onPress={handleStart}
              icon={<Play size={20} color={Colors.white} />}
              style={styles.startButton}
              testId="timer-start"
            />
          ) : (
            <Button
              title="Pause"
              onPress={handlePause}
              icon={<Pause size={20} color={Colors.white} />}
              variant="outline"
              style={styles.pauseButton}
              testId="timer-pause"
            />
          )}
          
          <Button
            title="Reset"
            onPress={handleStop}
            icon={<RotateCcw size={20} color={Colors.textSecondary} />}
            variant="outline"
            style={styles.resetButton}
            disabled={time === 0}
            testId="timer-reset"
          />
        </View>

        {time > 0 && (
          <View style={styles.secondaryControls}>
            <Button
              title="Save Time"
              onPress={handleSave}
              icon={<Save size={20} color={Colors.white} />}
              style={styles.saveButton}
              testId="timer-save"
            />
          </View>
        )}
      </View>

      {time > 0 && (
        <View style={styles.timeBreakdown}>
          <Text style={styles.breakdownText}>
            {minutes} minutes, {seconds} seconds
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  controlsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  startButton: {
    flex: 1,
    maxWidth: 120,
  },
  pauseButton: {
    flex: 1,
    maxWidth: 120,
    borderColor: Colors.primary,
  },
  resetButton: {
    flex: 1,
    maxWidth: 120,
  },
  saveButton: {
    flex: 1,
    maxWidth: 140,
    backgroundColor: Colors.success || Colors.primary,
  },

  timeBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  breakdownText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
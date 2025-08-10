import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Play,
  Pause,
  Square,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFitness } from '@/context/FitnessContext';

const { width } = Dimensions.get('window');

type ShuttlePhase = 'ready' | 'running' | 'paused' | 'complete';

export default function ShuttleRunScreen() {
  const { saveWorkoutSession, saveFitnessTest } = useFitness();
  const [phase, setPhase] = useState<ShuttlePhase>('ready');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentShuttle, setCurrentShuttle] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shuttlesCompleted, setShuttlesCompleted] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Beep test timing - each level has different shuttle counts and speeds
  const beepTestLevels = [
    { level: 1, shuttles: 7, interval: 9.0 },
    { level: 2, shuttles: 8, interval: 8.5 },
    { level: 3, shuttles: 8, interval: 8.0 },
    { level: 4, shuttles: 9, interval: 7.5 },
    { level: 5, shuttles: 9, interval: 7.0 },
    { level: 6, shuttles: 10, interval: 6.5 },
    { level: 7, shuttles: 10, interval: 6.0 },
    { level: 8, shuttles: 11, interval: 5.5 },
    { level: 9, shuttles: 11, interval: 5.0 },
    { level: 10, shuttles: 11, interval: 4.5 },
    { level: 11, shuttles: 12, interval: 4.0 },
    { level: 12, shuttles: 12, interval: 3.5 },
    { level: 13, shuttles: 13, interval: 3.0 },
    { level: 14, shuttles: 13, interval: 2.5 },
    { level: 15, shuttles: 13, interval: 2.0 },
  ];

  const currentLevelData = beepTestLevels[currentLevel - 1] || beepTestLevels[0];
  const shuttleTime = currentLevelData.interval * 1000; // Convert to milliseconds

  // Initialize audio context for web
  useEffect(() => {
    if (Platform.OS === 'web' && soundEnabled && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [soundEnabled, audioContext]);

  useEffect(() => {
    if (phase === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleShuttleComplete();
            return shuttleTime;
          }
          return prev - 100;
        });
        setTotalTime((prev) => prev + 100);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, timeRemaining, shuttleTime]);

  const playBeepSound = () => {
    if (!soundEnabled) return;
    
    if (Platform.OS === 'web' && audioContext) {
      // Create beep sound for web
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      // For mobile, we would use expo-av here, but for now just log
      console.log('🔊 Beep!');
    }
  };

  const handleShuttleComplete = () => {
    setShuttlesCompleted((prev) => prev + 1);
    
    // Play beep sound
    playBeepSound();
    
    if (currentShuttle >= currentLevelData.shuttles) {
      // Level complete
      setCurrentLevel((prev) => prev + 1);
      setCurrentShuttle(1);
      
      if (currentLevel >= 15) {
        // Test complete
        setPhase('complete');
        return;
      }
    } else {
      setCurrentShuttle((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    if (phase === 'ready') {
      setTimeRemaining(shuttleTime);
      setTotalTime(0);
    }
    setPhase('running');
  };

  const handlePause = () => {
    setPhase('paused');
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Test?',
      'Are you sure you want to stop the shuttle run test?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setPhase('complete');
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setPhase('ready');
    setCurrentLevel(1);
    setCurrentShuttle(1);
    setTimeRemaining(0);
    setTotalTime(0);
    setShuttlesCompleted(0);
  };

  const handleComplete = async () => {
    const finalLevel = Math.max(1, currentLevel - (currentShuttle === 1 ? 1 : 0));
    const finalShuttle = currentShuttle === 1 ? currentLevelData.shuttles : currentShuttle - 1;
    const finalScore = `Level ${finalLevel}.${finalShuttle}`;
    
    // Save the workout session
    saveWorkoutSession({
      id: `shuttle-run-${Date.now()}`,
      workoutId: 'shuttle-run',
      workoutTitle: 'Shuttle Run Test',
      date: new Date().toISOString(),
      duration: Math.floor(totalTime / 60000), // Convert milliseconds to minutes
      exercises: [{
        exerciseId: 'shuttle-run',
        exerciseName: 'Shuttle Run Test',
        sets: [{
          reps: shuttlesCompleted,
          completed: true,
        }],
      }],
      notes: `Shuttle Run - ${finalScore}`,
      completed: true,
    });

    // Save the fitness test result
    const beepTestLevel = parseFloat(`${finalLevel}.${finalShuttle}`);
    try {
      await saveFitnessTest('shuttle_run', beepTestLevel, finalLevel, `Level ${finalLevel}.${finalShuttle} - ${shuttlesCompleted} shuttles`);
    } catch (error) {
      console.error('Error saving fitness test:', error);
    }

    Alert.alert(
      'Test Complete!',
      `Final Score: ${finalScore}\nTotal Shuttles: ${shuttlesCompleted}\nTime: ${formatTime(totalTime)}\n\nYour fitness progress has been updated!`,
      [
        {
          text: 'Done',
          onPress: () => router.replace('/(tabs)/fitness'),
        },
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Test?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((shuttleTime - timeRemaining) / shuttleTime) * 100;
  };

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>Test Complete!</Text>
          <Text style={styles.finalScore}>
            Level {Math.max(1, currentLevel - (currentShuttle === 1 ? 1 : 0))}.{currentShuttle === 1 ? (beepTestLevels[Math.max(0, currentLevel - 2)]?.shuttles || 1) : Math.max(1, currentShuttle - 1)}
          </Text>
          <Text style={styles.completeStats}>
            Total Shuttles: {shuttlesCompleted}
          </Text>
          <Text style={styles.completeStats}>
            Total Time: {formatTime(totalTime)}
          </Text>
          
          <View style={styles.completeActions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={20} color={Colors.primary} />
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.doneButton} onPress={handleComplete}>
              <Text style={styles.doneButtonText}>Save Result</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <X size={24} color={Colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.soundButton} 
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        {soundEnabled ? (
          <Volume2 size={24} color={Colors.primary} />
        ) : (
          <VolumeX size={24} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shuttle Run Test</Text>
        <Text style={styles.subtitle}>20m Beep Test (PREP)</Text>
      </View>

      {/* Current Level Display */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Level</Text>
        <Text style={styles.levelNumber}>{currentLevel}</Text>
        <Text style={styles.shuttleInfo}>
          Shuttle {currentShuttle} of {currentLevelData.shuttles}
        </Text>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View 
            style={[
              styles.progressFill,
              {
                transform: [
                  { rotate: `${(getProgressPercentage() * 3.6)}deg` }
                ]
              }
            ]}
          />
          <View style={styles.progressInner}>
            {phase === 'running' ? (
              <>
                <Text style={styles.timeText}>
                  {(timeRemaining / 1000).toFixed(1)}
                </Text>
                <Text style={styles.timeLabel}>seconds</Text>
              </>
            ) : (
              <>
                <Text style={styles.readyText}>
                  {phase === 'ready' ? 'Ready' : 'Paused'}
                </Text>
                <Text style={styles.readySubtext}>
                  {phase === 'ready' ? 'Tap start to begin' : 'Tap play to continue'}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{shuttlesCompleted}</Text>
          <Text style={styles.statLabel}>Shuttles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentLevelData.interval}s</Text>
          <Text style={styles.statLabel}>Interval</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Run 20 meters between the beeps{'\n'}
          • Turn and run back when you hear the beep{'\n'}
          • Speed increases each level{'\n'}
          • Stop when you can&apos;t keep up{'\n'}
          • Your best level will be recorded for progress tracking
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {phase === 'ready' ? (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Play size={28} color={Colors.white} />
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.runningControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleStop}
              activeOpacity={0.7}
            >
              <Square size={24} color={Colors.error} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.playButton]} 
              onPress={phase === 'running' ? handlePause : handleStart}
              activeOpacity={0.8}
            >
              {phase === 'running' ? (
                <Pause size={32} color={Colors.white} />
              ) : (
                <Play size={32} color={Colors.white} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  levelLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  shuttleInfo: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.gray[200],
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: Colors.primary,
    transformOrigin: 'right center',
  },
  progressInner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 80,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  readyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  readySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  instructionsContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 60,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
  },
  runningControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  completeStats: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  completeActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutTitle: string;
  date: string;
  duration: number; // in minutes
  exercises: ExerciseLog[];
  notes?: string;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  restTime?: number;
}

export interface SetLog {
  reps: number;
  weight?: number;
  duration?: number; // for time-based exercises
  distance?: number; // for cardio
  completed: boolean;
}

export interface FitnessMetrics {
  totalWorkouts: number;
  totalDuration: number;
  weeklyWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutDuration: number;
  favoriteWorkoutType: string;
}

export interface HealthData {
  steps: number;
  heartRate: number;
  calories: number;
  activeMinutes: number;
  date: string;
}

const STORAGE_KEYS = {
  WORKOUT_SESSIONS: 'fitness_workout_sessions',
  HEALTH_DATA: 'fitness_health_data',
  METRICS: 'fitness_metrics',
};

// Create context
const FitnessContext = createContext<any>(null);

// Provider component
export const FitnessProvider = ({ children }: { children: React.ReactNode }) => {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [metrics, setMetrics] = useState<FitnessMetrics>({
    totalWorkouts: 0,
    totalDuration: 0,
    weeklyWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageWorkoutDuration: 0,
    favoriteWorkoutType: 'PREP',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load data from storage
  useEffect(() => {
    loadFitnessData();
  }, []);

  // Generate mock health data for demo
  useEffect(() => {
    generateMockHealthData();
  }, []);

  const loadFitnessData = async () => {
    try {
      const [sessionsData, healthDataStored, metricsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.HEALTH_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.METRICS),
      ]);

      if (sessionsData) {
        setWorkoutSessions(JSON.parse(sessionsData));
      }
      if (healthDataStored) {
        setHealthData(JSON.parse(healthDataStored));
      }
      if (metricsData) {
        setMetrics(JSON.parse(metricsData));
      }
    } catch (error) {
      console.error('Error loading fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHealthData = async () => {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_DATA);
    if (existingData) return; // Don't overwrite existing data

    const mockData: HealthData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        calories: Math.floor(Math.random() * 800) + 1200, // 1200-2000 calories
        activeMinutes: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
        date: date.toISOString().split('T')[0],
      });
    }
    
    setHealthData(mockData);
    await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(mockData));
  };

  const saveWorkoutSession = async (session: WorkoutSession) => {
    try {
      const updatedSessions = [...workoutSessions, session];
      setWorkoutSessions(updatedSessions);
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(updatedSessions));
      
      // Update metrics
      updateMetrics(updatedSessions);
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  };

  const saveFitnessTest = async (testType: 'shuttle_run' | 'push_ups' | 'sit_ups' | 'plank', score: number, level?: number, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fitness_tests')
        .insert({
          user_id: user.id,
          test_type: testType,
          score,
          level,
          notes,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving fitness test:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving fitness test:', error);
      throw error;
    }
  };

  const getFitnessTests = async (testType?: 'shuttle_run' | 'push_ups' | 'sit_ups' | 'plank') => {
    if (!user) return [];

    try {
      let query = supabase
        .from('fitness_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching fitness tests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching fitness tests:', error);
      return [];
    }
  };

  const updateMetrics = async (sessions: WorkoutSession[]) => {
    const completedSessions = sessions.filter(s => s.completed);
    const totalWorkouts = completedSessions.length;
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Calculate weekly workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = completedSessions.filter(
      s => new Date(s.date) >= oneWeekAgo
    ).length;

    // Calculate current streak
    const sortedSessions = completedSessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak || (currentStreak === 0 && daysDiff <= 1)) {
        currentStreak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    const newMetrics: FitnessMetrics = {
      totalWorkouts,
      totalDuration,
      weeklyWorkouts,
      currentStreak,
      longestStreak: Math.max(metrics.longestStreak, currentStreak),
      averageWorkoutDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      favoriteWorkoutType: 'PREP', // Could be calculated from workout types
    };

    setMetrics(newMetrics);
    await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(newMetrics));
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = workoutSessions.filter(
        s => s.completed && s.date.split('T')[0] === dateStr
      ).length;
      
      weekData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        workouts: dayWorkouts,
        date: dateStr,
      });
    }
    
    return weekData;
  };

  const getMonthlyProgress = () => {
    const today = new Date();
    const monthData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = workoutSessions.filter(
        s => s.completed && s.date.split('T')[0] === dateStr
      ).length;
      
      const healthDataForDay = healthData.find(h => h.date === dateStr);
      
      monthData.push({
        date: dateStr,
        workouts: dayWorkouts,
        steps: healthDataForDay?.steps || 0,
        calories: healthDataForDay?.calories || 0,
        activeMinutes: healthDataForDay?.activeMinutes || 0,
      });
    }
    
    return monthData;
  };

  const contextValue = {
    workoutSessions,
    healthData,
    metrics,
    isLoading,
    saveWorkoutSession,
    saveFitnessTest,
    getFitnessTests,
    getWeeklyProgress,
    getMonthlyProgress,
  };

  return (
    <FitnessContext.Provider value={contextValue}>
      {children}
    </FitnessContext.Provider>
  );
};

// Hook to use the context
export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};

export const useFitnessMetrics = () => {
  const { metrics, getWeeklyProgress, getMonthlyProgress } = useFitness();
  
  return {
    metrics,
    weeklyProgress: getWeeklyProgress(),
    monthlyProgress: getMonthlyProgress(),
  };
};
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  calculatePinTestScore, 
  getAgeGroup, 
  Gender, 
  AgeGroup, 
  PinTestScoreResult 
} from '@/constants/pinTestScoring';

export type PinTestResult = {
  id: string;
  user_id: string;
  mile_run_minutes: number | null;
  mile_run_seconds: number | null;
  pushups_count: number | null;
  core_endurance_minutes: number | null;
  core_endurance_seconds: number | null;
  sit_reach_distance: number | null;
  overall_score: number | null;
  pass_status: boolean | null;
  notes: string | null;
  test_date: string;
  created_at: string;
  updated_at: string;
};

export type PinTestInput = {
  mileRunMinutes: string;
  mileRunSeconds: string;
  pushupsCount: string;
  coreEnduranceMinutes: string;
  coreEnduranceSeconds: string;
  sitReachDistance: string;
  notes?: string;
};

export const [PinTestProvider, usePinTest] = createContextHook(() => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<PinTestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadTestResults();
    }
  }, [user]);

  const loadTestResults = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('Loading PIN test results for user:', user.id);

      const { data, error } = await supabase
        .from('pin_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (error) {
        console.error('Error loading PIN test results:', error);
        Alert.alert('Error', 'Failed to load test results');
        return;
      }

      console.log('Loaded PIN test results:', data?.length || 0);
      setTestResults(data || []);
    } catch (error: any) {
      console.error('Error loading PIN test results:', error);
      Alert.alert('Error', 'Failed to load test results');
    } finally {
      setIsLoading(false);
    }
  };

  const submitTestResult = async (input: PinTestInput): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to submit test results');
      return false;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting PIN test result:', input);

      // Validate inputs
      const errors = validateTestInput(input);
      if (errors.length > 0) {
        Alert.alert('Validation Error', errors.join('\n'));
        return false;
      }

      // Convert string inputs to numbers
      const mileRunMinutes = input.mileRunMinutes ? parseInt(input.mileRunMinutes) : null;
      const mileRunSeconds = input.mileRunSeconds ? parseInt(input.mileRunSeconds) : null;
      const pushupsCount = input.pushupsCount ? parseInt(input.pushupsCount) : null;
      const coreEnduranceMinutes = input.coreEnduranceMinutes ? parseInt(input.coreEnduranceMinutes) : null;
      const coreEnduranceSeconds = input.coreEnduranceSeconds ? parseInt(input.coreEnduranceSeconds) : null;
      const sitReachDistance = input.sitReachDistance ? parseFloat(input.sitReachDistance) : null;

      // Calculate scores if user profile is complete
      let overallScore: number | null = null;
      let passStatus: boolean | null = null;
      
      if (user.date_of_birth && user.gender) {
        const ageGroup = getAgeGroup(user.date_of_birth);
        const gender = user.gender.toLowerCase() as Gender;
        
        const scoreResult = calculatePinTestScore(
          mileRunMinutes,
          mileRunSeconds,
          pushupsCount,
          coreEnduranceMinutes,
          coreEnduranceSeconds,
          sitReachDistance,
          gender,
          ageGroup
        );
        
        overallScore = scoreResult.totalScore;
        passStatus = scoreResult.passStatus;
      }

      const testData = {
        user_id: user.id,
        mile_run_minutes: mileRunMinutes,
        mile_run_seconds: mileRunSeconds,
        pushups_count: pushupsCount,
        core_endurance_minutes: coreEnduranceMinutes,
        core_endurance_seconds: coreEnduranceSeconds,
        sit_reach_distance: sitReachDistance,
        overall_score: overallScore,
        pass_status: passStatus,
        notes: input.notes || null,
        test_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pin_test_results')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting PIN test result:', error);
        Alert.alert('Error', 'Failed to submit test result');
        return false;
      }

      console.log('PIN test result submitted successfully:', data);
      Alert.alert('Success', 'Test result submitted successfully!');
      
      // Reload results to include the new one
      await loadTestResults();
      return true;
    } catch (error: any) {
      console.error('Error submitting PIN test result:', error);
      Alert.alert('Error', 'Failed to submit test result');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateTestInput = (input: PinTestInput): string[] => {
    const errors: string[] = [];

    // Check if at least one field is filled
    const hasAnyInput = Object.values(input).some(value => value && value.trim() !== '');
    if (!hasAnyInput) {
      errors.push('Please enter results for at least one test component.');
      return errors;
    }

    // Validate mile run time
    if (input.mileRunMinutes || input.mileRunSeconds) {
      const minutes = parseInt(input.mileRunMinutes || '0');
      const seconds = parseInt(input.mileRunSeconds || '0');
      
      if (isNaN(minutes) || minutes < 0 || minutes > 60) {
        errors.push('Mile run minutes must be between 0 and 60.');
      }
      if (isNaN(seconds) || seconds < 0 || seconds >= 60) {
        errors.push('Mile run seconds must be between 0 and 59.');
      }
    }

    // Validate pushups
    if (input.pushupsCount) {
      const count = parseInt(input.pushupsCount);
      if (isNaN(count) || count < 0 || count > 200) {
        errors.push('Pushups count must be between 0 and 200.');
      }
    }

    // Validate core endurance time
    if (input.coreEnduranceMinutes || input.coreEnduranceSeconds) {
      const minutes = parseInt(input.coreEnduranceMinutes || '0');
      const seconds = parseInt(input.coreEnduranceSeconds || '0');
      
      if (isNaN(minutes) || minutes < 0 || minutes > 10) {
        errors.push('Core endurance minutes must be between 0 and 10.');
      }
      if (isNaN(seconds) || seconds < 0 || seconds >= 60) {
        errors.push('Core endurance seconds must be between 0 and 59.');
      }
    }

    // Validate sit and reach distance
    if (input.sitReachDistance) {
      const distance = parseFloat(input.sitReachDistance);
      if (isNaN(distance) || distance < -50 || distance > 100) {
        errors.push('Sit and reach distance must be between -50 and 100 cm.');
      }
    }

    return errors;
  };

  const deleteTestResult = async (resultId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to delete test results');
      return false;
    }

    try {
      console.log('Deleting PIN test result:', resultId);

      const { error } = await supabase
        .from('pin_test_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', user.id); // Ensure user can only delete their own results

      if (error) {
        console.error('Error deleting PIN test result:', error);
        Alert.alert('Error', 'Failed to delete test result');
        return false;
      }

      console.log('PIN test result deleted successfully');
      Alert.alert('Success', 'Test result deleted successfully!');
      
      // Reload results
      await loadTestResults();
      return true;
    } catch (error: any) {
      console.error('Error deleting PIN test result:', error);
      Alert.alert('Error', 'Failed to delete test result');
      return false;
    }
  };

  const checkProfileCompletion = (): { isComplete: boolean; missingFields: string[] } => {
    if (!user) {
      return { isComplete: false, missingFields: ['User not authenticated'] };
    }

    const missingFields: string[] = [];
    
    if (!user.date_of_birth) {
      missingFields.push('Date of Birth');
    }
    
    if (!user.gender) {
      missingFields.push('Gender');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  };

  const getLatestResult = (): PinTestResult | null => {
    return testResults.length > 0 ? testResults[0] : null;
  };

  const formatTime = (minutes: number | null, seconds: number | null): string => {
    if (minutes === null && seconds === null) return 'Not recorded';
    const m = minutes || 0;
    const s = seconds || 0;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const calculateScoreForResult = (result: PinTestResult): PinTestScoreResult | null => {
    if (!user?.date_of_birth || !user?.gender) {
      return null;
    }

    const ageGroup = getAgeGroup(user.date_of_birth);
    const gender = user.gender.toLowerCase() as Gender;
    
    return calculatePinTestScore(
      result.mile_run_minutes,
      result.mile_run_seconds,
      result.pushups_count,
      result.core_endurance_minutes,
      result.core_endurance_seconds,
      result.sit_reach_distance,
      gender,
      ageGroup
    );
  };

  const getPersonalBests = () => {
    if (testResults.length === 0) {
      return {
        mileRun: null,
        pushups: null,
        coreEndurance: null,
        sitReach: null,
      };
    }

    // Find best mile run time (lowest time)
    const mileRunResults = testResults.filter(r => r.mile_run_minutes !== null && r.mile_run_seconds !== null);
    const bestMileRun = mileRunResults.reduce((best, current) => {
      if (!best) return current;
      const bestTotalSeconds = (best.mile_run_minutes || 0) * 60 + (best.mile_run_seconds || 0);
      const currentTotalSeconds = (current.mile_run_minutes || 0) * 60 + (current.mile_run_seconds || 0);
      return currentTotalSeconds < bestTotalSeconds ? current : best;
    }, null as PinTestResult | null);

    // Find best pushups count (highest count)
    const pushupsResults = testResults.filter(r => r.pushups_count !== null);
    const bestPushups = pushupsResults.reduce((best, current) => {
      if (!best) return current;
      return (current.pushups_count || 0) > (best.pushups_count || 0) ? current : best;
    }, null as PinTestResult | null);

    // Find best core endurance time (longest time)
    const coreEnduranceResults = testResults.filter(r => r.core_endurance_minutes !== null && r.core_endurance_seconds !== null);
    const bestCoreEndurance = coreEnduranceResults.reduce((best, current) => {
      if (!best) return current;
      const bestTotalSeconds = (best.core_endurance_minutes || 0) * 60 + (best.core_endurance_seconds || 0);
      const currentTotalSeconds = (current.core_endurance_minutes || 0) * 60 + (current.core_endurance_seconds || 0);
      return currentTotalSeconds > bestTotalSeconds ? current : best;
    }, null as PinTestResult | null);

    // Find best sit and reach distance (highest distance)
    const sitReachResults = testResults.filter(r => r.sit_reach_distance !== null);
    const bestSitReach = sitReachResults.reduce((best, current) => {
      if (!best) return current;
      return (current.sit_reach_distance || 0) > (best.sit_reach_distance || 0) ? current : best;
    }, null as PinTestResult | null);

    return {
      mileRun: bestMileRun,
      pushups: bestPushups,
      coreEndurance: bestCoreEndurance,
      sitReach: bestSitReach,
    };
  };

  const hasSuccessfulScore = (): boolean => {
    if (!user?.date_of_birth || !user?.gender || testResults.length === 0) {
      return false;
    }

    // Check if any test result has a passing overall score (80 or higher)
    return testResults.some(result => {
      if (result.overall_score !== null) {
        return result.overall_score >= 80;
      }
      
      // If overall_score is null, calculate it
      const scoreResult = calculateScoreForResult(result);
      return scoreResult ? scoreResult.passStatus : false;
    });
  };

  const getHighestScore = (): { result: PinTestResult | null; score: number } => {
    if (!user?.date_of_birth || !user?.gender || testResults.length === 0) {
      return { result: null, score: 0 };
    }

    let highestResult: PinTestResult | null = null;
    let highestScore = 0;

    testResults.forEach(result => {
      let score = 0;
      
      if (result.overall_score !== null) {
        score = result.overall_score;
      } else {
        // Calculate score if not stored
        const scoreResult = calculateScoreForResult(result);
        score = scoreResult ? scoreResult.totalScore : 0;
      }

      if (score > highestScore) {
        highestScore = score;
        highestResult = result;
      }
    });

    return { result: highestResult, score: highestScore };
  };

  return {
    testResults,
    isLoading,
    isSubmitting,
    submitTestResult,
    deleteTestResult,
    loadTestResults,
    checkProfileCompletion,
    getLatestResult,
    formatTime,
    calculateScoreForResult,
    getPersonalBests,
    hasSuccessfulScore,
    getHighestScore,
  };
});
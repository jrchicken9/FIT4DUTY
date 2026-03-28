import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import applicationSteps from '@/constants/applicationSteps';
import { useAuth } from '@/context/AuthContext';

export interface ApplicationAnalytics {
  overallProgress: {
    completionPercentage: number;
    stepsCompleted: number;
    stepsRemaining: number;
    totalSteps: number;
  };
  stepBreakdown: Array<{
    id: string;
    title: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completedAt?: string;
    estimatedTime: string;
    requirements: string[];
    tips: string[];
  }>;
  performanceMetrics: {
    averageCompletionTime?: number;
    fastestStep?: string;
    slowestStep?: string;
    currentStreak: number;
  };
  timeline: Array<{
    stepId: string;
    stepTitle: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completedAt?: string;
    estimatedCompletion?: string;
  }>;
}

export interface AnalyticsSummary {
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  notStartedSteps: number;
  completionPercentage: number;
  recentActivity: Array<{
    id: string;
    step_id: string;
    status: string;
    completed_at?: string;
    notes?: string;
    updated_at: string;
  }>;
}

export const useApplicationAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get application progress from database
      const { data: progressData, error: progressError } = await supabase
        .from('application_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (progressError) {
        throw new Error(`Failed to fetch progress data: ${progressError.message}`);
      }

      // Create a map of step progress
      const stepProgressMap = new Map();
      progressData?.forEach(progress => {
        stepProgressMap.set(progress.step_id, {
          status: progress.status,
          completedAt: progress.completed_at,
          notes: progress.notes,
          updatedAt: progress.updated_at
        });
      });

      // Calculate overall progress
      const totalSteps = applicationSteps.length;
      const completedSteps = progressData?.filter(p => p.status === 'completed').length || 0;
      const inProgressSteps = progressData?.filter(p => p.status === 'in_progress').length || 0;
      const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      const stepsRemaining = totalSteps - completedSteps;

      // Build step breakdown
      const stepBreakdown = applicationSteps.map(step => {
        const progress = stepProgressMap.get(step.id);
        return {
          id: step.id,
          title: step.title,
          status: progress?.status || 'not_started',
          completedAt: progress?.completedAt,
          estimatedTime: step.estimatedTime,
          requirements: step.requirements,
          tips: step.tips
        };
      });

      // Calculate performance metrics
      const completedStepsWithDates = progressData?.filter(p => p.status === 'completed' && p.completed_at);
      const performanceMetrics = {
        averageCompletionTime: calculateAverageCompletionTime(completedStepsWithDates),
        fastestStep: findFastestStep(completedStepsWithDates),
        slowestStep: findSlowestStep(completedStepsWithDates),
        currentStreak: calculateCurrentStreak(stepBreakdown)
      };

      // Build timeline
      const timeline = applicationSteps.map(step => {
        const progress = stepProgressMap.get(step.id);
        return {
          stepId: step.id,
          stepTitle: step.title,
          status: progress?.status || 'not_started',
          completedAt: progress?.completedAt,
          estimatedCompletion: calculateEstimatedCompletion(step, progress)
        };
      });

      const analyticsData: ApplicationAnalytics = {
        overallProgress: {
          completionPercentage,
          stepsCompleted: completedSteps,
          stepsRemaining,
          totalSteps
        },
        stepBreakdown,
        performanceMetrics,
        timeline
      };

      const summaryData: AnalyticsSummary = {
        totalSteps,
        completedSteps,
        inProgressSteps,
        notStartedSteps: totalSteps - completedSteps - inProgressSteps,
        completionPercentage,
        recentActivity: progressData?.slice(-5).reverse() || []
      };

      setAnalytics(analyticsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching application analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (stepId: string, status: 'not_started' | 'in_progress' | 'completed', notes?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const updateData = {
        status,
        notes: notes || null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      // Try to update existing record first
      const { data: existingData, error: fetchError } = await supabase
        .from('application_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('step_id', stepId)
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('application_progress')
          .update(updateData)
          .eq('id', existingData.id);

        if (error) {
          throw new Error(`Failed to update step progress: ${error.message}`);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('application_progress')
          .insert({
            user_id: user.id,
            step_id: stepId,
            ...updateData,
            created_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Failed to create step progress: ${error.message}`);
        }
      }

      // Refetch analytics after update
      await fetchAnalytics();
    } catch (error) {
      console.error('Error updating step progress:', error);
      throw error;
    }
  };

  const getStepProgress = async (stepId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('application_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('step_id', stepId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to fetch step progress: ${error.message}`);
      }

      const step = applicationSteps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      return {
        step: {
          id: step.id,
          title: step.title,
          description: step.description,
          requirements: step.requirements,
          tips: step.tips,
          estimatedTime: step.estimatedTime
        },
        progress: data ? {
          status: data.status,
          completedAt: data.completed_at,
          notes: data.notes,
          updatedAt: data.updated_at
        } : {
          status: 'not_started' as const,
          completedAt: null,
          notes: null,
          updatedAt: null
        }
      };
    } catch (error) {
      console.error('Error fetching step progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id]);

  return {
    analytics,
    summary,
    loading,
    error,
    updateStep,
    getStepProgress,
    refetch: fetchAnalytics
  };
};

// Helper functions
function calculateAverageCompletionTime(completedSteps: any[]): number | undefined {
  if (!completedSteps || completedSteps.length < 2) return undefined;
  
  const times = completedSteps
    .map(step => new Date(step.completed_at).getTime())
    .sort((a, b) => a - b);
  
  const intervals = [];
  for (let i = 1; i < times.length; i++) {
    intervals.push(times[i] - times[i - 1]);
  }
  
  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return Math.round(averageInterval / (1000 * 60 * 60 * 24)); // Convert to days
}

function findFastestStep(completedSteps: any[]): string | undefined {
  if (!completedSteps || completedSteps.length < 2) return undefined;
  
  // This is a simplified implementation
  // In a real scenario, you'd track time spent on each step
  return completedSteps[0]?.step_id;
}

function findSlowestStep(completedSteps: any[]): string | undefined {
  if (!completedSteps || completedSteps.length < 2) return undefined;
  
  // This is a simplified implementation
  // In a real scenario, you'd track time spent on each step
  return completedSteps[completedSteps.length - 1]?.step_id;
}

function calculateCurrentStreak(stepBreakdown: any[]): number {
  let streak = 0;
  for (const step of stepBreakdown) {
    if (step.status === 'completed') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateEstimatedCompletion(step: any, progress: any): string | undefined {
  if (progress?.status === 'completed') return undefined;
  
  // Simple estimation based on step order and estimated time
  const stepIndex = applicationSteps.findIndex(s => s.id === step.id);
  const estimatedDays = parseInt(step.estimatedTime.split('-')[0]) || 7;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
  
  return estimatedDate.toISOString();
}

export default useApplicationAnalytics;
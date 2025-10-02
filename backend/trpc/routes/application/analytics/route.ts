import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import applicationSteps from "@/constants/applicationSteps";

// Analytics response types
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
    averageCompletionTime?: number; // in days
    fastestStep?: string;
    slowestStep?: string;
    currentStreak: number; // consecutive completed steps
  };
  timeline: Array<{
    stepId: string;
    stepTitle: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completedAt?: string;
    estimatedCompletion?: string;
  }>;
}

const ApplicationAnalyticsRouter = createTRPCRouter({
  // Get comprehensive application analytics
  getAnalytics: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      try {
        // Get user ID from authorization header (you'll need to implement this)
        const userId = "user-id-placeholder"; // Replace with actual user ID extraction
        
        // Get application progress from database
        const { data: progressData, error: progressError } = await supabase
          .from('application_progress')
          .select('*')
          .eq('user_id', userId)
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

        const analytics: ApplicationAnalytics = {
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

        return analytics;
      } catch (error) {
        console.error('Error fetching application analytics:', error);
        throw new Error('Failed to fetch application analytics');
      }
    }),

  // Get progress for a specific step
  getStepProgress: protectedProcedure
    .input(z.object({
      stepId: z.string()
    }))
    .query(async ({ input, ctx }: { input: any, ctx: any }) => {
      try {
        const userId = "user-id-placeholder"; // Replace with actual user ID extraction
        
        const { data, error } = await supabase
          .from('application_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('step_id', input.stepId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw new Error(`Failed to fetch step progress: ${error.message}`);
        }

        const step = applicationSteps.find(s => s.id === input.stepId);
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
        throw new Error('Failed to fetch step progress');
      }
    }),

  // Update step progress
  updateStepProgress: protectedProcedure
    .input(z.object({
      stepId: z.string(),
      status: z.enum(['not_started', 'in_progress', 'completed']),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }: { input: any, ctx: any }) => {
      try {
        const userId = "user-id-placeholder"; // Replace with actual user ID extraction
        
        const updateData = {
          status: input.status,
          notes: input.notes || null,
          completed_at: input.status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };

        // Try to update existing record first
        const { data: existingData, error: fetchError } = await supabase
          .from('application_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('step_id', input.stepId)
          .single();

        if (existingData) {
          // Update existing record
          const { data, error } = await supabase
            .from('application_progress')
            .update(updateData)
            .eq('id', existingData.id)
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to update step progress: ${error.message}`);
          }

          return data;
        } else {
          // Create new record
          const { data, error } = await supabase
            .from('application_progress')
            .insert({
              user_id: userId,
              step_id: input.stepId,
              ...updateData,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to create step progress: ${error.message}`);
          }

          return data;
        }
      } catch (error) {
        console.error('Error updating step progress:', error);
        throw new Error('Failed to update step progress');
      }
    }),

  // Get analytics summary for dashboard
  getAnalyticsSummary: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      try {
        const userId = "user-id-placeholder"; // Replace with actual user ID extraction
        
        const { data: progressData, error } = await supabase
          .from('application_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to fetch progress data: ${error.message}`);
        }

        const totalSteps = applicationSteps.length;
        const completedSteps = progressData?.filter(p => p.status === 'completed').length || 0;
        const inProgressSteps = progressData?.filter(p => p.status === 'in_progress').length || 0;
        const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        return {
          totalSteps,
          completedSteps,
          inProgressSteps,
          notStartedSteps: totalSteps - completedSteps - inProgressSteps,
          completionPercentage,
          recentActivity: progressData?.slice(-5).reverse() || []
        };
      } catch (error) {
        console.error('Error fetching analytics summary:', error);
        throw new Error('Failed to fetch analytics summary');
      }
    })
});

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

export default ApplicationAnalyticsRouter;

import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import applicationSteps from "@/constants/applicationSteps";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type ApplicationStepProgress = {
  stepId: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
};

export type ApplicationState = {
  steps: ApplicationStepProgress[];
  currentStep: string | null;
  lastUpdated: string;
};

export const [ApplicationProvider, useApplication] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    steps: [],
    currentStep: null,
    lastUpdated: new Date().toISOString(),
  });

  // Load application progress from Supabase
  const applicationQuery = useQuery({
    queryKey: ["applicationProgress", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for application progress');
        return {
          steps: [],
          currentStep: null,
          lastUpdated: new Date().toISOString(),
        };
      }

      try {
        console.log('Loading application progress for user:', user.id);
        
        const { data: progressData, error } = await supabase
          .from('application_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading application progress:', error);
          throw error;
        }

        console.log('Loaded application progress data:', progressData);

        // Convert Supabase data to our format
        const steps: ApplicationStepProgress[] = applicationSteps.map(step => {
          const progress = progressData?.find((p: any) => p.step_id === step.id);
          return {
            stepId: step.id,
            completed: progress?.status === 'completed',
            completedDate: progress?.completed_at || undefined,
            notes: progress?.notes || undefined,
          };
        });

        // Find current step (first incomplete step, or null if all completed)
        const currentStepIndex = steps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex].stepId : null;

        const state: ApplicationState = {
          steps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };

        console.log('Processed application state:', state);
        return state;
      } catch (error) {
        console.error("Error loading application progress:", error);
        // Return initial state on error
        return {
          steps: applicationSteps.map(step => ({
            stepId: step.id,
            completed: false,
          })),
          currentStep: applicationSteps[0]?.id || null,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    enabled: !!user?.id,
  });

  // Save application progress mutation
  const saveApplicationMutation = useMutation({
    mutationFn: async ({ stepId, status, notes, completedAt }: {
      stepId: string;
      status: 'not_started' | 'in_progress' | 'completed';
      notes?: string;
      completedAt?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Saving application progress:', { stepId, status, notes, completedAt });

      const { data, error } = await supabase
        .from('application_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          status,
          notes: notes || null,
          completed_at: completedAt || null,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error saving application progress:', error);
        throw error;
      }

      console.log('Application progress saved successfully:', data);
      return data;
    },
    onMutate: async ({ stepId, status, notes, completedAt }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["applicationProgress", user?.id] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["applicationProgress", user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(["applicationProgress", user?.id], (old: ApplicationState | undefined) => {
        if (!old) return old;
        
        const updatedSteps = old.steps.map(step => {
          if (step.stepId === stepId) {
            return {
              ...step,
              completed: status === 'completed',
              completedDate: status === 'completed' ? completedAt : undefined,
              notes: status === 'not_started' ? undefined : notes,
            };
          }
          return step;
        });
        
        // Find current step (first incomplete step, or null if all completed)
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...old,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (data, variables) => {
      console.log('Application progress saved successfully:', data);
      
      // Update the cache with the actual server response to ensure consistency
      queryClient.setQueryData(["applicationProgress", user?.id], (old: ApplicationState | undefined) => {
        if (!old) return old;
        
        const updatedSteps = old.steps.map(step => {
          if (step.stepId === variables.stepId) {
            return {
              ...step,
              completed: variables.status === 'completed',
              completedDate: variables.status === 'completed' ? variables.completedAt : undefined,
              notes: variables.status === 'not_started' ? undefined : variables.notes,
            };
          }
          return step;
        });
        
        // Find current step (first incomplete step, or null if all completed)
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...old,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    onError: (error, variables, context) => {
      console.error("Error saving application progress:", error);
      
      // Rollback the optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(["applicationProgress", user?.id], context.previousData);
      }
      
      const errorMessage = error?.message || 'Unknown error';
      console.log('Full error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let userMessage = 'Failed to save application progress';
      if (errorMessage.includes('Network request failed')) {
        userMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        userMessage = 'Authentication failed. Please sign in again.';
      }
      
      Alert.alert("Error", userMessage);
    },

  });

  useEffect(() => {
    if (applicationQuery.data) {
      console.log('Updating local application state with fresh data:', applicationQuery.data);
      setApplicationState(applicationQuery.data);
    }
  }, [applicationQuery.data]);

  const markStepCompleted = (stepId: string, notes?: string) => {
    console.log('Marking step as completed:', { stepId, notes });
    
    if (!user?.id) {
      console.error('Cannot mark step completed: user not authenticated');
      Alert.alert('Error', 'Please sign in to save your progress');
      return;
    }
    
    const completedAt = new Date().toISOString();
    
    saveApplicationMutation.mutate({
      stepId,
      status: 'completed',
      notes,
      completedAt,
    });
  };

  const markStepIncomplete = (stepId: string) => {
    console.log('Marking step as incomplete:', { stepId });
    
    if (!user?.id) {
      console.error('Cannot mark step incomplete: user not authenticated');
      Alert.alert('Error', 'Please sign in to save your progress');
      return;
    }
    
    saveApplicationMutation.mutate({
      stepId,
      status: 'not_started',
      notes: undefined,
      completedAt: undefined,
    });
  };

  const updateStepNotes = (stepId: string, notes: string) => {
    console.log('Updating step notes:', { stepId, notes });
    
    if (!user?.id) {
      console.error('Cannot update step notes: user not authenticated');
      Alert.alert('Error', 'Please sign in to save your notes');
      return;
    }
    
    const currentStep = applicationState.steps.find(step => step.stepId === stepId);
    const status = currentStep?.completed ? 'completed' : 'in_progress';
    const completedAt = currentStep?.completed ? currentStep.completedDate : undefined;
    
    saveApplicationMutation.mutate({
      stepId,
      status,
      notes,
      completedAt,
    });
  };

  const getStepProgress = (stepId: string): ApplicationStepProgress | undefined => {
    return applicationState.steps.find(step => step.stepId === stepId);
  };

  const getCompletedStepsCount = (): number => {
    return applicationState.steps.filter(step => step.completed).length;
  };

  const getProgressPercentage = (): number => {
    const totalSteps = applicationSteps.length;
    const completedSteps = getCompletedStepsCount();
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  const getApplicationStepsWithProgress = () => {
    return applicationSteps.map(step => {
      const progress = getStepProgress(step.id);
      return {
        ...step,
        completed: progress?.completed || false,
        current: applicationState.currentStep === step.id,
        completedDate: progress?.completedDate,
        notes: progress?.notes,
      };
    });
  };

  return {
    applicationState,
    isLoading: applicationQuery.isLoading,
    isSaving: saveApplicationMutation.isPending,
    markStepCompleted,
    markStepIncomplete,
    updateStepNotes,
    getStepProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    getApplicationStepsWithProgress,
    currentStep: applicationState.currentStep,
  };
});
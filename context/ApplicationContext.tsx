import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import applicationSteps from "@/constants/applicationSteps";
import { supabase } from "@/lib/supabase";

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

const ApplicationContext = createContext<any>(null);

export const ApplicationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    steps: applicationSteps.map(step => ({
      stepId: step.id,
      completed: false,
    })),
    currentStep: applicationSteps[0]?.id || null,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load application progress from Supabase
  const loadApplicationProgress = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('application_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading application progress:', error);
        return;
      }

      if (data) {
        const progressMap = new Map(data.map(item => [item.step_id, item]));
        const steps = applicationSteps.map(step => {
          const progress = progressMap.get(step.id);
          return {
            stepId: step.id,
            completed: progress?.status === 'completed',
            completedDate: progress?.completed_at || undefined,
            notes: progress?.notes || undefined,
          };
        });

        const currentStepIndex = steps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex].stepId : null;

        setApplicationState({
          steps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error loading application progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save application progress to Supabase
  const saveApplicationProgress = async (stepId: string, completed: boolean, notes?: string) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const status = completed ? 'completed' : 'not_started';
      const completedAt = completed ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('application_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          status,
          notes: notes || null,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving application progress:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving application progress:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
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

  const getCompletedStepsCount = () => {
    return applicationState.steps.filter(step => step.completed).length;
  };

  const markStepCompleted = async (stepId: string) => {
    try {
      // Update local state immediately for responsive UI
      setApplicationState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, completed: true, completedDate: new Date().toISOString() }
            : step
        );
        
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });

      // Save to Supabase
      await saveApplicationProgress(stepId, true);
    } catch (error) {
      console.error('Error marking step as completed:', error);
      // Revert local state on error
      setApplicationState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, completed: false, completedDate: undefined }
            : step
        );
        
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });
    }
  };

  const markStepIncomplete = async (stepId: string) => {
    try {
      // Update local state immediately for responsive UI
      setApplicationState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, completed: false, completedDate: undefined }
            : step
        );
        
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });

      // Save to Supabase
      await saveApplicationProgress(stepId, false);
    } catch (error) {
      console.error('Error marking step as incomplete:', error);
      // Revert local state on error
      setApplicationState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, completed: true, completedDate: new Date().toISOString() }
            : step
        );
        
        const currentStepIndex = updatedSteps.findIndex(step => !step.completed);
        const currentStep = currentStepIndex >= 0 ? updatedSteps[currentStepIndex].stepId : null;
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep,
          lastUpdated: new Date().toISOString(),
        };
      });
    }
  };

  const updateStepNotes = async (stepId: string, notes: string) => {
    try {
      // Update local state immediately for responsive UI
      setApplicationState(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, notes }
            : step
        ),
        lastUpdated: new Date().toISOString(),
      }));

      // Save to Supabase
      const stepProgress = getStepProgress(stepId);
      await saveApplicationProgress(stepId, stepProgress?.completed || false, notes);
    } catch (error) {
      console.error('Error updating step notes:', error);
      // Revert local state on error
      setApplicationState(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.stepId === stepId 
            ? { ...step, notes: stepProgress?.notes || '' }
            : step
        ),
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  const getStepProgress = (stepId: string) => {
    return applicationState.steps.find(step => step.stepId === stepId);
  };

  // Load progress when user changes or component mounts
  useEffect(() => {
    if (user) {
      loadApplicationProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const contextValue = {
    applicationState,
    isLoading,
    isSaving,
    markStepCompleted,
    markStepIncomplete,
    updateStepNotes,
    getStepProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    getApplicationStepsWithProgress,
    currentStep: applicationState.currentStep,
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
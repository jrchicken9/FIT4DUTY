import React, { createContext, useContext, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import applicationSteps from "@/constants/applicationSteps";

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
  };

  const markStepIncomplete = async (stepId: string) => {
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
  };

  const updateStepNotes = async (stepId: string, notes: string) => {
    setApplicationState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.stepId === stepId 
          ? { ...step, notes }
          : step
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const getStepProgress = (stepId: string) => {
    return applicationState.steps.find(step => step.stepId === stepId);
  };

  const contextValue = {
    applicationState,
    isLoading: false,
    isSaving: false,
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
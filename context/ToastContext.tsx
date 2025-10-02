import React, { createContext, useContext } from 'react';
import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ToastNotification';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onPress?: () => void;
  actionText?: string;
}

interface ToastState {
  toasts: Toast[];
}

// Create context
const ToastContext = createContext<any>(null);

// Provider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ToastState>({
    toasts: [],
  });

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration = 4000,
    onPress?: () => void,
    actionText?: string
  ) => {
    const id = Date.now().toString();
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      onPress,
      actionText,
    };

    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, toast],
    }));

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(toast => toast.id !== id),
    }));
  }, []);

  const showSuccess = useCallback((
    title: string,
    message?: string,
    duration?: number,
    onPress?: () => void,
    actionText?: string
  ) => {
    return showToast('success', title, message, duration, onPress, actionText);
  }, [showToast]);

  const showError = useCallback((
    title: string,
    message?: string,
    duration?: number,
    onPress?: () => void,
    actionText?: string
  ) => {
    return showToast('error', title, message, duration, onPress, actionText);
  }, [showToast]);

  const showWarning = useCallback((
    title: string,
    message?: string,
    duration?: number,
    onPress?: () => void,
    actionText?: string
  ) => {
    return showToast('warning', title, message, duration, onPress, actionText);
  }, [showToast]);

  const showInfo = useCallback((
    title: string,
    message?: string,
    duration?: number,
    onPress?: () => void,
    actionText?: string
  ) => {
    return showToast('info', title, message, duration, onPress, actionText);
  }, [showToast]);

  const clearAllToasts = useCallback(() => {
    setState(prev => ({
      ...prev,
      toasts: [],
    }));
  }, []);

  const contextValue = {
    // State
    toasts: state.toasts,

    // Actions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use the context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

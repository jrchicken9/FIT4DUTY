import React from 'react';
import { Alert, AlertButton } from 'react-native';
import { ErrorHandler, ErrorInfo } from '@/lib/errorHandler';

interface ErrorAlertProps {
  error: any;
  onAction?: () => void;
  onDismiss?: () => void;
}

export class ErrorAlert {
  /**
   * Show a user-friendly error alert
   */
  static show(error: any, onAction?: () => void, onDismiss?: () => void) {
    const errorInfo = ErrorHandler.handleBookingError(error);
    this.showErrorInfo(errorInfo, onAction, onDismiss);
  }

  /**
   * Show payment error alert
   */
  static showPaymentError(error: any, onAction?: () => void, onDismiss?: () => void) {
    const errorInfo = ErrorHandler.handlePaymentError(error);
    this.showErrorInfo(errorInfo, onAction, onDismiss);
  }

  /**
   * Show waiver error alert
   */
  static showWaiverError(error: any, onAction?: () => void, onDismiss?: () => void) {
    const errorInfo = ErrorHandler.handleWaiverError(error);
    this.showErrorInfo(errorInfo, onAction, onDismiss);
  }

  /**
   * Show network error alert
   */
  static showNetworkError(error: any, onAction?: () => void, onDismiss?: () => void) {
    const errorInfo = ErrorHandler.handleNetworkError(error);
    this.showErrorInfo(errorInfo, onAction, onDismiss);
  }

  /**
   * Show error info with custom action handling
   */
  static showErrorInfo(errorInfo: ErrorInfo, onAction?: () => void, onDismiss?: () => void) {
    const buttons: AlertButton[] = [];

    // Add action button if provided
    if (errorInfo.action) {
      buttons.push({
        text: errorInfo.action,
        onPress: () => {
          if (errorInfo.actionCallback) {
            errorInfo.actionCallback();
          } else if (onAction) {
            onAction();
          }
        },
        style: 'default',
      });
    }

    // Add dismiss button
    buttons.push({
      text: 'OK',
      onPress: onDismiss,
      style: 'cancel',
    });

    Alert.alert(errorInfo.title, errorInfo.message, buttons);
  }

  /**
   * Show error with custom title and message
   */
  static showCustom(title: string, message: string, onAction?: () => void, onDismiss?: () => void) {
    const buttons: AlertButton[] = [];

    if (onAction) {
      buttons.push({
        text: 'Try Again',
        onPress: onAction,
        style: 'default',
      });
    }

    buttons.push({
      text: 'OK',
      onPress: onDismiss,
      style: 'cancel',
    });

    Alert.alert(title, message, buttons);
  }

  /**
   * Show confirmation dialog
   */
  static showConfirmation(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: onConfirm,
          style: 'destructive',
        },
      ]
    );
  }

  /**
   * Show success message
   */
  static showSuccess(title: string, message: string, onDismiss?: () => void) {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
          style: 'default',
        },
      ]
    );
  }

  /**
   * Show warning message
   */
  static showWarning(title: string, message: string, onAction?: () => void, onDismiss?: () => void) {
    const buttons: AlertButton[] = [];

    if (onAction) {
      buttons.push({
        text: 'Continue',
        onPress: onAction,
        style: 'default',
      });
    }

    buttons.push({
      text: 'Cancel',
      onPress: onDismiss,
      style: 'cancel',
    });

    Alert.alert(title, message, buttons);
  }
}

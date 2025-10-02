// Error handling utility for user-friendly error messages

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
  actionCallback?: () => void;
}

export class ErrorHandler {
  /**
   * Parse database error messages and convert them to user-friendly messages
   */
  static parseDatabaseError(errorMessage: string): ErrorInfo {
    // Extract error code and message
    const parts = errorMessage.split(': ');
    const errorCode = parts[0];
    const message = parts.slice(1).join(': ');

    switch (errorCode) {
      case 'AUTHENTICATION_REQUIRED':
        return {
          title: 'Sign In Required',
          message: 'Please sign in to book this session.',
          action: 'Sign In',
        };

      case 'SESSION_NOT_FOUND':
        return {
          title: 'Session Not Found',
          message: 'This session no longer exists or has been removed.',
          action: 'Go Back',
        };

      case 'SESSION_CANCELLED':
        return {
          title: 'Session Cancelled',
          message: 'This session has been cancelled and is no longer available for booking.',
          action: 'View Other Sessions',
        };

      case 'SESSION_COMPLETED':
        return {
          title: 'Session Completed',
          message: 'This session has already taken place and cannot be booked.',
          action: 'View Other Sessions',
        };

      case 'SESSION_ACTIVE':
        return {
          title: 'Session in Progress',
          message: 'This session is currently in progress and cannot be booked.',
          action: 'View Other Sessions',
        };

      case 'SESSION_UNAVAILABLE':
        return {
          title: 'Session Unavailable',
          message: message || 'This session is not currently available for booking.',
          action: 'View Other Sessions',
        };

      case 'SESSION_PAST':
        return {
          title: 'Session Has Passed',
          message: 'This session has already taken place and cannot be booked.',
          action: 'View Other Sessions',
        };

      case 'ALREADY_BOOKED':
        return {
          title: 'Already Booked',
          message: 'You have already booked this session. Check your bookings to view or manage your reservation.',
          action: 'View My Bookings',
        };

      case 'ON_WAITLIST':
        return {
          title: 'On Waitlist',
          message: 'You are currently on the waitlist for this session. You cannot book while on the waitlist.',
          action: 'Manage Waitlist',
        };

      case 'SESSION_FULL':
        return {
          title: 'Session Full',
          message: 'This session is full. You can join the waitlist to be notified if a spot becomes available.',
          action: 'Join Waitlist',
        };

      case 'WAIVER_REQUIRED':
        return {
          title: 'Waiver Required',
          message: 'You must complete the fitness assessment waiver before booking this session.',
          action: 'Complete Waiver',
        };

      case 'SUBSCRIPTION_REQUIRED':
        return {
          title: 'Subscription Required',
          message: 'You need an active subscription to book practice sessions.',
          action: 'Subscribe Now',
        };

      case 'PAYMENT_FAILED':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again or contact support.',
          action: 'Try Again',
        };

      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          action: 'Retry',
        };

      case 'VALIDATION_ERROR':
        return {
          title: 'Invalid Information',
          message: message || 'Please check your information and try again.',
          action: 'Fix Errors',
        };

      default:
        // Handle generic database errors
        if (errorMessage.includes('duplicate key')) {
          return {
            title: 'Already Exists',
            message: 'This item already exists in our system.',
            action: 'Continue',
          };
        }

        if (errorMessage.includes('foreign key')) {
          return {
            title: 'Invalid Reference',
            message: 'The selected item is no longer available.',
            action: 'Refresh',
          };
        }

        if (errorMessage.includes('not null')) {
          return {
            title: 'Missing Information',
            message: 'Please fill in all required fields.',
            action: 'Complete Form',
          };
        }

        // Default error
        return {
          title: 'Error',
          message: errorMessage || 'An unexpected error occurred. Please try again.',
          action: 'Try Again',
        };
    }
  }

  /**
   * Handle booking-specific errors
   */
  static handleBookingError(error: any): ErrorInfo {
    if (typeof error === 'string') {
      return this.parseDatabaseError(error);
    }

    if (error?.message) {
      return this.parseDatabaseError(error.message);
    }

    return {
      title: 'Booking Error',
      message: 'Unable to complete your booking. Please try again.',
      action: 'Try Again',
    };
  }

  /**
   * Handle payment-specific errors
   */
  static handlePaymentError(error: any): ErrorInfo {
    if (error?.code) {
      switch (error.code) {
        case 'card_declined':
          return {
            title: 'Payment Declined',
            message: 'Your card was declined. Please try a different payment method.',
            action: 'Try Different Card',
          };

        case 'insufficient_funds':
          return {
            title: 'Insufficient Funds',
            message: 'Your card has insufficient funds. Please try a different payment method.',
            action: 'Try Different Card',
          };

        case 'expired_card':
          return {
            title: 'Expired Card',
            message: 'Your card has expired. Please update your payment information.',
            action: 'Update Payment',
          };

        case 'invalid_cvc':
          return {
            title: 'Invalid Security Code',
            message: 'The security code on your card is incorrect.',
            action: 'Check CVC',
          };

        case 'processing_error':
          return {
            title: 'Payment Processing Error',
            message: 'There was an error processing your payment. Please try again.',
            action: 'Try Again',
          };

        default:
          return {
            title: 'Payment Error',
            message: error.message || 'There was an error with your payment.',
            action: 'Try Again',
          };
      }
    }

    return {
      title: 'Payment Error',
      message: 'Unable to process your payment. Please try again.',
      action: 'Try Again',
    };
  }

  /**
   * Handle waiver-specific errors
   */
  static handleWaiverError(error: any): ErrorInfo {
    if (typeof error === 'string') {
      return this.parseDatabaseError(error);
    }

    if (error?.message) {
      if (error.message.includes('signature')) {
        return {
          title: 'Signature Required',
          message: 'Please provide your signature to complete the waiver.',
          action: 'Add Signature',
        };
      }

      if (error.message.includes('required')) {
        return {
          title: 'Missing Information',
          message: 'Please fill in all required fields in the waiver.',
          action: 'Complete Form',
        };
      }

      return this.parseDatabaseError(error.message);
    }

    return {
      title: 'Waiver Error',
      message: 'Unable to save your waiver. Please try again.',
      action: 'Try Again',
    };
  }

  /**
   * Handle network/connection errors
   */
  static handleNetworkError(error: any): ErrorInfo {
    if (error?.message?.includes('network')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'Retry',
      };
    }

    if (error?.message?.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'Retry',
      };
    }

    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please try again.',
      action: 'Retry',
    };
  }

  /**
   * Get error icon based on error type
   */
  static getErrorIcon(errorCode?: string): string {
    switch (errorCode) {
      case 'AUTHENTICATION_REQUIRED':
        return '🔐';
      case 'SESSION_NOT_FOUND':
      case 'SESSION_CANCELLED':
      case 'SESSION_COMPLETED':
      case 'SESSION_ACTIVE':
      case 'SESSION_UNAVAILABLE':
      case 'SESSION_PAST':
        return '📅';
      case 'ALREADY_BOOKED':
        return '✅';
      case 'ON_WAITLIST':
        return '⏳';
      case 'SESSION_FULL':
        return '🚫';
      case 'WAIVER_REQUIRED':
        return '📝';
      case 'SUBSCRIPTION_REQUIRED':
        return '💳';
      case 'PAYMENT_FAILED':
        return '💳';
      case 'NETWORK_ERROR':
        return '📡';
      case 'VALIDATION_ERROR':
        return '⚠️';
      default:
        return '❌';
    }
  }
}

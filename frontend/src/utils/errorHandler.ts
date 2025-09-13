import { ApiError } from './api';

export interface ErrorInfo {
  type:
    | 'network'
    | 'validation'
    | 'auth'
    | 'forbidden'
    | 'notFound'
    | 'server'
    | 'unknown';
  message: string;
  originalError?: Error;
  statusCode?: number;
  field?: string;
  retry?: boolean;
}

export class ErrorHandler {
  static getErrorInfo(error: unknown): ErrorInfo {
    // Handle ApiError instances
    if (error instanceof ApiError) {
      return this.handleApiError(error);
    }

    // Handle generic Error instances
    if (error instanceof Error) {
      // Network errors
      if (
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch') ||
        error.name === 'NetworkError'
      ) {
        return {
          type: 'network',
          message:
            'Unable to connect to the server. Please check your internet connection and try again.',
          originalError: error,
          retry: true,
        };
      }

      return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
        originalError: error,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: 'unknown',
        message: error,
      };
    }

    // Fallback for unknown error types
    return {
      type: 'unknown',
      message: 'An unexpected error occurred',
    };
  }

  private static handleApiError(error: ApiError): ErrorInfo {
    const { status, message } = error;

    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: this.formatValidationMessage(message),
          originalError: error,
          statusCode: status,
        };

      case 401:
        return {
          type: 'auth',
          message: 'Your session has expired. Please log in again.',
          originalError: error,
          statusCode: status,
        };

      case 403:
        return {
          type: 'forbidden',
          message: 'You do not have permission to perform this action.',
          originalError: error,
          statusCode: status,
        };

      case 404:
        return {
          type: 'notFound',
          message: 'The requested resource was not found.',
          originalError: error,
          statusCode: status,
        };

      case 409:
        return {
          type: 'validation',
          message: this.formatConflictMessage(message),
          originalError: error,
          statusCode: status,
        };

      case 429:
        return {
          type: 'server',
          message: 'Too many requests. Please wait a moment and try again.',
          originalError: error,
          statusCode: status,
          retry: true,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'server',
          message:
            'Server error. Please try again later or contact support if the problem persists.',
          originalError: error,
          statusCode: status,
          retry: true,
        };

      default:
        return {
          type: 'unknown',
          message: message || 'An unexpected error occurred',
          originalError: error,
          statusCode: status,
        };
    }
  }

  private static formatValidationMessage(message: string): string {
    // Common validation messages to make more user-friendly
    const validationMap: Record<string, string> = {
      'email is required': 'Please enter your email address',
      'password is required': 'Please enter your password',
      'first_name is required': 'Please enter your first name',
      'last_name is required': 'Please enter your last name',
      'phone is required': 'Please enter your phone number',
      'invalid email format': 'Please enter a valid email address',
      'password too weak':
        'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      'invalid phone format': 'Please enter a valid phone number',
      'User with this email already exists':
        'An account with this email already exists',
      'Invalid credentials': 'Invalid email or password',
    };

    return validationMap[message] || message;
  }

  private static formatConflictMessage(message: string): string {
    // Common conflict messages
    const conflictMap: Record<string, string> = {
      'Client profile already exists':
        'You already have a profile. You can edit your existing profile instead.',
      'Therapist profile already exists':
        'You already have a profile. You can edit your existing profile instead.',
      'License number already in use':
        'This license number is already registered to another therapist',
    };

    return conflictMap[message] || message;
  }

  static getNotificationTitle(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'network':
        return 'Connection Error';
      case 'validation':
        return 'Validation Error';
      case 'auth':
        return 'Authentication Required';
      case 'forbidden':
        return 'Permission Denied';
      case 'notFound':
        return 'Not Found';
      case 'server':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  static shouldShowRetry(errorInfo: ErrorInfo): boolean {
    return (
      errorInfo.retry === true ||
      errorInfo.type === 'network' ||
      errorInfo.type === 'server'
    );
  }

  static logError(error: unknown, context?: string): void {
    const errorInfo = this.getErrorInfo(error);

    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandler] ${context ? `${context}: ` : ''}`, {
        type: errorInfo.type,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode,
        originalError: errorInfo.originalError,
        timestamp: new Date().toISOString(),
      });
    }

    // In production, you might want to send errors to a logging service
    // if (process.env.NODE_ENV === 'production') {
    //   // Send to logging service (e.g., Sentry, LogRocket, etc.)
    // }
  }
}

export const handleError = ErrorHandler.getErrorInfo;
export const logError = ErrorHandler.logError;

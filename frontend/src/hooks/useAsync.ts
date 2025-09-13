import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorHandler, ErrorInfo } from '../utils/errorHandler';
import { useNotification } from '../context/NotificationContext';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorInfo | null;
}

export interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorInfo) => void;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  context?: string;
}

export function useAsync<T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showSuccess, showError } = useNotification();
  const currentPromiseRef = useRef<Promise<T> | null>(null);

  const {
    onSuccess,
    onError,
    showSuccessNotification = false,
    showErrorNotification = true,
    successMessage,
    context,
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      if (!asyncFunction) {
        throw new Error('No async function provided');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const promise = asyncFunction(...args);
        currentPromiseRef.current = promise;

        const result = await promise;

        // Check if this is still the current promise (prevents race conditions)
        if (currentPromiseRef.current === promise) {
          setState({
            data: result,
            loading: false,
            error: null,
          });

          if (showSuccessNotification && successMessage) {
            showSuccess('Success', successMessage);
          }

          onSuccess?.(result);
          return result;
        }
      } catch (error) {
        // Check if this is still the current promise
        if (currentPromiseRef.current) {
          const errorInfo = ErrorHandler.getErrorInfo(error);
          ErrorHandler.logError(error, context);

          setState({
            data: null,
            loading: false,
            error: errorInfo,
          });

          if (showErrorNotification) {
            const title = ErrorHandler.getNotificationTitle(errorInfo);
            const retryAction = ErrorHandler.shouldShowRetry(errorInfo)
              ? { label: 'Retry', onClick: () => execute(...args) }
              : undefined;

            showError(title, errorInfo.message, retryAction);
          }

          onError?.(errorInfo);
          throw error;
        }
      }
    },
    [
      asyncFunction,
      onSuccess,
      onError,
      showSuccessNotification,
      showErrorNotification,
      successMessage,
      context,
      showSuccess,
      showError,
    ]
  );

  const reset = useCallback(() => {
    currentPromiseRef.current = null;
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      currentPromiseRef.current = null;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

// Specialized hook for API calls with common options
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  return useAsync(apiFunction, {
    showErrorNotification: true,
    ...options,
  });
}

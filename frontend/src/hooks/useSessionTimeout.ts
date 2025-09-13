import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export interface UseSessionTimeoutOptions {
  timeoutDuration?: number; // in milliseconds, default 15 minutes
  warningDuration?: number; // show warning before timeout, default 2 minutes
  checkInterval?: number; // how often to check, default 1 minute
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeoutDuration = 15 * 60 * 1000, // 15 minutes
    warningDuration = 2 * 60 * 1000, // 2 minutes
    checkInterval = 60 * 1000, // 1 minute
  } = options;

  const { user, logout } = useAuth();
  const { showWarning, showInfo } = useNotification();

  const lastActivityRef = useRef<number>(Date.now());
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  const handleLogout = useCallback(() => {
    showInfo(
      'Session Expired',
      'Your session has expired for security reasons. Please log in again.'
    );
    logout();
  }, [logout, showInfo]);

  const extendSession = useCallback(() => {
    updateLastActivity();
    showInfo('Session Extended', 'Your session has been extended.');
  }, [updateLastActivity, showInfo]);

  const checkSession = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeUntilTimeout = timeoutDuration - timeSinceActivity;
    const timeUntilWarning =
      timeoutDuration - warningDuration - timeSinceActivity;

    // If session has expired
    if (timeSinceActivity >= timeoutDuration) {
      handleLogout();
      return;
    }

    // If we should show warning and haven't shown it yet
    if (timeUntilWarning <= 0 && !warningShownRef.current) {
      warningShownRef.current = true;
      const minutesLeft = Math.ceil(timeUntilTimeout / (60 * 1000));

      showWarning(
        'Session Expiring Soon',
        `Your session will expire in ${minutesLeft} minute(s) due to inactivity.`
      );
    }
  }, [user, timeoutDuration, warningDuration, handleLogout, showWarning]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const throttledUpdateActivity = (() => {
      let lastUpdate = 0;
      return () => {
        const now = Date.now();
        if (now - lastUpdate > 1000) {
          // Throttle to once per second
          updateLastActivity();
          lastUpdate = now;
        }
      };
    })();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, true);
    });

    // Set up periodic check
    timeoutIdRef.current = setInterval(checkSession, checkInterval);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, true);
      });

      if (timeoutIdRef.current) {
        clearInterval(timeoutIdRef.current);
      }
    };
  }, [user, updateLastActivity, checkSession, checkInterval]);

  // Handle page visibility changes
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, update activity
        updateLastActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, updateLastActivity]);

  // Handle beforeunload to clean up
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timeoutIdRef.current) {
        clearInterval(timeoutIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  return {
    extendSession,
    updateLastActivity,
    isActive: !!user,
  };
};

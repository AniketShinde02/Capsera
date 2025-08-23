"use client";

import { useEffect } from 'react';
import { hasValidSessionCookies, validateCurrentSession, forceCompleteLogout } from '@/lib/session-utils';

/**
 * SessionValidator - watches for cookie removal or server session invalidation
 * If it detects the session is gone it triggers a hard logout to keep UI in sync.
 * Poll interval is conservative to avoid excessive checks.
 */
export function SessionValidator() {
  useEffect(() => {
    let mounted = true;
    let consecutiveFailures = 0;

    const check = async () => {
      if (!mounted) return;

      // Quick client-side cookie check first
      const hasCookies = hasValidSessionCookies();
      if (!hasCookies) {
        consecutiveFailures++;
        // require two consecutive failures to avoid false positives
        if (consecutiveFailures >= 2) {
          // Double-check with server session endpoint to be certain
          const serverValid = await validateCurrentSession();
          if (!serverValid) {
            // force a complete logout and reload
            forceCompleteLogout();
          } else {
            // server still thinks session is valid; reset counter
            consecutiveFailures = 0;
          }
        }
      } else {
        consecutiveFailures = 0;
      }
    };

    // Run an initial check and then poll every 15s
    check();
    const interval = setInterval(check, 15000);

    const handleVisibility = () => {
      if (!document.hidden) {
        check();
      }
    };

    const handleFocus = () => check();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
}

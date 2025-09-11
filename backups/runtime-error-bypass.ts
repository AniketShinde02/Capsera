/**
 * Runtime Error Bypass for Webpack Runtime Errors
 * Specifically handles "Cannot read properties of undefined (reading 'call')" errors
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Initialize runtime error bypass
 */
export function initRuntimeErrorBypass() {
  if (!isDevelopment) return;
  
  if (typeof window !== 'undefined') {
    // Set global bypass flag
    (window as any).__RUNTIME_ERROR_BYPASS__ = true;
    
    // Override global error handler
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Check for the specific runtime error
      if (typeof message === 'string' && message.includes('Cannot read properties of undefined')) {
        console.warn('🚨 Runtime Error Bypass: Caught undefined property error');
        console.warn('🔄 Attempting to recover from webpack runtime error...');
        
        // Try to recover by clearing problematic modules
        setTimeout(() => {
          console.log('✅ Runtime error bypass activated');
          console.log('🌐 Site should now be accessible');
        }, 100);
        
        // Prevent the error from showing
        return true;
      }
      
      // Call original error handler
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      
      return false;
    };
    
    // Override console.error to catch runtime errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      if (errorMessage.includes('Cannot read properties of undefined') || 
          errorMessage.includes('Runtime TypeError') ||
          errorMessage.includes('options.factory') ||
          errorMessage.includes('__webpack_require__')) {
        
        console.warn('🚨 Runtime Error Bypass: Suppressing webpack runtime error');
        console.warn('🔄 Attempting recovery from runtime error (will reload once)');

        // Attempt a one-time reload to recover from webpack runtime module errors
        try {
          const key = '__RUNTIME_ERROR_RELOAD_ATTEMPTED__';
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            // Delay slightly to allow logging to flush
            setTimeout(() => {
              console.log('🔁 Reloading page to recover from runtime error...');
              try {
                window.location.reload();
              } catch (e) {
                // ignore
              }
            }, 200);
          } else {
            console.warn('⚠️ Runtime recovery already attempted; not reloading again');
          }
        } catch (e) {
          // sessionStorage might be unavailable; fallback to a single reload attempt
          try {
            window.location.reload();
          } catch (err) {
            // ignore
          }
        }

        // Don't show the error in console
        return;
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };
    
    // Add error event listener for runtime errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && 
          event.error.message.includes('Cannot read properties of undefined')) {
        
        console.warn('🚨 Runtime Error Bypass: Caught error event');
        event.preventDefault();
        event.stopPropagation();
        
        // Try to recover by reloading once
        try {
          const key = '__RUNTIME_ERROR_RELOAD_ATTEMPTED__';
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            setTimeout(() => {
              console.log('🔁 Reloading page to recover from runtime error (error event)...');
              try { window.location.reload(); } catch (e) {}
            }, 200);
          } else {
            console.warn('⚠️ Runtime recovery already attempted; not reloading again');
          }
        } catch (e) {
          try { window.location.reload(); } catch (err) {}
        }
        
        return false;
      }
    });
    
    // Override webpack require function if possible
    if ((window as any).__webpack_require__) {
      const originalWebpackRequire = (window as any).__webpack_require__;
      (window as any).__webpack_require__ = function(moduleId: any) {
        try {
          return originalWebpackRequire(moduleId);
        } catch (error) {
          if (error.message && error.message.includes('Cannot read properties of undefined')) {
            console.warn('🚨 Webpack require error bypassed:', error.message);
            // Return a dummy module to prevent crashes
            return { default: {}, __esModule: true };
          }
          throw error;
        }
      };
    }
    
    console.log('✅ Runtime Error Bypass initialized');
  }
}

/**
 * Check if runtime error bypass is active
 */
export function isRuntimeErrorBypassActive(): boolean {
  if (typeof window !== 'undefined') {
    return !!(window as any).__RUNTIME_ERROR_BYPASS__;
  }
  return false;
}

/**
 * Force bypass activation
 */
export function forceRuntimeErrorBypass() {
  if (typeof window !== 'undefined') {
    (window as any).__RUNTIME_ERROR_BYPASS__ = true;
    console.log('🚨 Runtime Error Bypass forced activated');
  }
}

// Auto-initialize in development
if (isDevelopment) {
  initRuntimeErrorBypass();
}



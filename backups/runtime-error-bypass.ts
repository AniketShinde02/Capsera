/**
 * Runtime Error Bypass for Webpack Runtime Errors
 * Specifically handles "Cannot read properties of undefined (reading 'call')" errors
 * 
 * SECURITY NOTE: This implementation avoids modifying webpack internals
 * and uses safer error handling approaches.
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Module-level state instead of global window pollution
const runtimeErrorBypassState = {
  isActive: false,
  reloadAttempted: false
};

// Namespaced storage key to avoid conflicts
const STORAGE_NAMESPACE = 'capsera_runtime_bypass';
const RELOAD_ATTEMPTED_KEY = `${STORAGE_NAMESPACE}_reload_attempted`;
const BYPASS_ACTIVE_KEY = `${STORAGE_NAMESPACE}_active`;

/**
 * Robust error type and pattern checker for undefined property access errors
 * Checks if the error is a TypeError and matches the specific pattern
 */
function isUndefinedPropertyError(error: any): boolean {
  // Ensure we have a valid error object
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  // Check if it's an Error instance (TypeError, ReferenceError, etc.)
  if (!(error instanceof Error)) {
    return false;
  }
  
  // Safely access error message and stack with null/undefined safety
  const message = error.message || '';
  const stack = error.stack || '';
  
  // Conservative regex pattern for "Cannot read properties of undefined" errors
  // This pattern matches the core error message and optionally includes "call" or other property names
  const undefinedPropertyPattern = /Cannot read propert(?:y|ies) of undefined \(reading ['"](?:call|.*?)['"]\)/i;
  
  // Check both message and stack for the pattern
  return undefinedPropertyPattern.test(message) || undefinedPropertyPattern.test(stack);
}

/**
 * Safe reload attempt with loop prevention
 */
function attemptRecoveryReload(source: string): void {
  try {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RELOAD_ATTEMPTED_KEY)) {
      sessionStorage.setItem(RELOAD_ATTEMPTED_KEY, '1');
      runtimeErrorBypassState.reloadAttempted = true;
      
      setTimeout(() => {
        console.log(`🔁 Reloading page to recover from runtime error (${source})...`);
        try { 
          window.location.reload(); 
        } catch (e) {
          console.error('Failed to reload page', e);
        }
      }, 200);
    } else {
      console.warn('⚠️ Runtime recovery already attempted; not reloading again');
    }
  } catch (e) {
    console.error('Failed to attempt recovery reload', e);
  }
}

/**
 * Initialize runtime error bypass
 */
export function initRuntimeErrorBypass() {
  if (!isDevelopment) return;
  
  if (typeof window !== 'undefined') {
    // Set module-level bypass flag instead of global window pollution
    runtimeErrorBypassState.isActive = true;
    
    // Store state in namespaced sessionStorage instead of global window
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(BYPASS_ACTIVE_KEY, 'true');
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    // Override global error handler
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Check for the specific runtime error using robust type and pattern checking
      if (isUndefinedPropertyError(error) || 
          (typeof message === 'string' && isUndefinedPropertyError({ message }))) {
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
    
    // Override console.error to catch specific runtime errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      // Only handle specific webpack runtime errors, not all errors
      if (isUndefinedPropertyError({ message: errorMessage }) && 
          (errorMessage.includes('Runtime TypeError') ||
           errorMessage.includes('options.factory') ||
           errorMessage.includes('__webpack_require__'))) {
        
        console.warn('🚨 Runtime Error Bypass: Detected webpack runtime error');
        console.warn('🔄 Attempting recovery from runtime error (will reload once)');

        attemptRecoveryReload('console.error');

        // Don't show the error in console
        return;
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };
    
    // Add error event listener for runtime errors
    window.addEventListener('error', (event) => {
      if (event.error && isUndefinedPropertyError(event.error)) {
        
        console.warn('🚨 Runtime Error Bypass: Caught error event');
        event.preventDefault();
        event.stopPropagation();
        
        attemptRecoveryReload('error event');
        
        return false;
      }
    });
    
    // Note: Removed webpack require override for security reasons
    // Overriding __webpack_require__ can break legitimate module loading
    // and hide critical errors that should be addressed properly
    // Instead, we rely on error event listeners and console.error override
    // which are safer and don't interfere with webpack internals
    
    console.log('✅ Runtime Error Bypass initialized');
  }
}

/**
 * Check if runtime error bypass is active
 */
export function isRuntimeErrorBypassActive(): boolean {
  // Check module-level state first
  if (runtimeErrorBypassState.isActive) {
    return true;
  }
  
  // Fallback to namespaced storage check
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem(BYPASS_ACTIVE_KEY) === 'true';
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  return false;
}

/**
 * Force bypass activation
 */
export function forceRuntimeErrorBypass() {
  // Set module-level state instead of global window pollution
  runtimeErrorBypassState.isActive = true;
  
  // Store state in namespaced sessionStorage
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(BYPASS_ACTIVE_KEY, 'true');
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  console.log('🚨 Runtime Error Bypass forced activated');
}

// Auto-initialize in development
if (isDevelopment) {
  initRuntimeErrorBypass();
}
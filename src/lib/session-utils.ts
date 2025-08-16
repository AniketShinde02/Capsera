"use client";

import { signOut } from 'next-auth/react';

/**
 * Utility functions for session management
 */

/**
 * Force sign out and clear all session data
 * This ensures complete cleanup when cookies are cleared or session is invalid
 */
export async function forceSignOut(redirect: boolean = true) {
  try {
    // Clear NextAuth session first
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    
    // Use comprehensive cleanup function
    clearAllNextAuthStorage();
    
    // Clear ALL localStorage items (NextAuth stores tokens here)
    try {
      localStorage.clear();
    } catch (e) {
      // Fallback: remove specific NextAuth keys
      const localStorageKeys = [
        'next-auth.session',
        'next-auth.callback-url',
        'captioncraft-user-data',
        'next-auth.csrf-token',
        'next-auth.state'
      ];
      
      localStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors if localStorage is not available
        }
      });
    }
    
    // Clear ALL sessionStorage items
    try {
      sessionStorage.clear();
    } catch (e) {
      // Fallback: remove specific NextAuth keys
      const sessionStorageKeys = [
        'next-auth.session',
        'captioncraft-temp-data',
        'next-auth.csrf-token',
        'next-auth.state'
      ];
      
      sessionStorageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignore errors if sessionStorage is not available
        }
      });
    }
    
    // Clear IndexedDB (NextAuth stores JWT tokens here)
    try {
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('next-auth.session-token');
        indexedDB.deleteDatabase('next-auth');
        console.log('🗄️ IndexedDB cleared');
      }
    } catch (e) {
      console.log('IndexedDB clear failed:', e);
    }
    
    console.log('🚪 Complete sign out and cleanup performed');
    
    if (redirect) {
      // Force a hard refresh to ensure all state is cleared
      window.location.href = '/';
    }
    
  } catch (error) {
    console.error('Error during force sign out:', error);
    // Fallback: force reload
    if (redirect) {
      window.location.href = '/';
    }
  }
}

/**
 * Check if user has valid session cookies
 */
export function hasValidSessionCookies(): boolean {
  try {
    const cookies = document.cookie;
    return cookies.includes('next-auth.session-token') || 
           cookies.includes('__Secure-next-auth.session-token');
  } catch (error) {
    console.error('Error checking session cookies:', error);
    return false;
  }
}

/**
 * Clear ALL NextAuth storage to prevent session restoration
 */
export function clearAllNextAuthStorage() {
  try {
    // Clear all possible NextAuth storage locations
    const nextAuthKeys = [
      'next-auth.session',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'next-auth.state',
      'next-auth.provider',
      'next-auth.verifier',
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'next-auth.state'
    ];
    
    // Clear from localStorage
    nextAuthKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Clear from sessionStorage
    nextAuthKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Clear cookies more aggressively with all possible variations
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.state',
      '__Secure-next-auth.state',
      '__Host-next-auth.csrf-token',
      '__Host-next-auth.session-token',
      'next-auth.session',
      '__Secure-next-auth.session'
    ];
    
    // Clear cookies with multiple domain and path variations
    cookieNames.forEach(cookieName => {
      // Clear with root path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      // Clear with current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
      // Clear with subdomain variations
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
      // Clear with secure flag
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
      // Clear with sameSite variations
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;`;
      // Clear with httpOnly variations
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; httpOnly;`;
    });
    
    // Force clear any remaining cookies by setting them to empty with immediate expiration
    cookieNames.forEach(cookieName => {
      document.cookie = `${cookieName}=; max-age=0; path=/;`;
      document.cookie = `${cookieName}=; max-age=0; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; max-age=0; path=/; secure;`;
      document.cookie = `${cookieName}=; max-age=0; path=/; httpOnly;`;
    });
    
    // Additional aggressive clearing for any remaining session data
    if (typeof window !== 'undefined') {
      // Clear any remaining session-related data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('session') || key.includes('token') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('session') || key.includes('token') || key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('🧹 All NextAuth storage cleared aggressively');
  } catch (error) {
    console.error('Error clearing NextAuth storage:', error);
  }
}

/**
 * Validate current session by making a request to the session endpoint
 */
export async function validateCurrentSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return false;
    }
    
    const session = await response.json();
    return !!(session?.user?.id);
    
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Force refresh NextAuth session state without logging out
 * This ensures the UI reflects the actual authentication state
 */
export function forceSessionRefresh() {
  try {
    // Dispatch a custom event to trigger NextAuth to re-evaluate session
    window.dispatchEvent(new Event('storage'));
    
    // Force NextAuth to check session again
    if (typeof window !== 'undefined' && window.location) {
      // Trigger a soft refresh of the session
      const currentUrl = window.location.href;
      window.history.replaceState({}, '', currentUrl);
    }
    
    console.log('🔄 Forced session refresh');
  } catch (error) {
    console.error('Error forcing session refresh:', error);
  }
}

/**
 * Clear tokens and force session refresh - for manual token clearing
 * This ensures complete cleanup when tokens are manually removed
 */
export function clearTokensAndRefresh() {
  try {
    console.log('🗑️ Manually clearing tokens and refreshing session...');
    
    // Clear all NextAuth storage
    clearAllNextAuthStorage();
    
    // Force a hard logout to ensure complete session clearing
    setTimeout(() => window.location.reload(), 100);
    
    console.log('✅ Tokens cleared and session refreshed');
  } catch (error) {
    console.error('Error clearing tokens and refreshing session:', error);
  }
}

/**
 * Force complete logout - for when normal logout fails
 * This is the most aggressive session clearing method
 */
export function forceCompleteLogout() {
  try {
    console.log('🚪 Force complete logout initiated...');
    
    // Clear all NextAuth storage
    clearAllNextAuthStorage();
    
    // Clear any remaining session data
    if (typeof window !== 'undefined') {
      // Clear all localStorage
      localStorage.clear();
      // Clear all sessionStorage
      sessionStorage.clear();
      // Clear any remaining cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    
    // Force reload after a small delay
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
    console.log('✅ Force complete logout completed');
  } catch (error) {
    console.error('Error during force complete logout:', error);
    // Fallback: force reload
    window.location.href = '/';
  }
}

/**
 * Setup session monitoring
 * This function sets up listeners to detect when cookies are cleared
 */
export function setupSessionMonitoring(onSessionInvalid: () => void) {
  let lastCookieCheck = hasValidSessionCookies();
  let consecutiveFailures = 0;
  
  const checkCookies = () => {
    const currentCookieCheck = hasValidSessionCookies();
    
    // If cookies were present but now they're gone, session was cleared
    if (lastCookieCheck && !currentCookieCheck) {
      consecutiveFailures++;
      
      // Only trigger sign out after 2 consecutive failures to avoid false positives
      if (consecutiveFailures >= 2) {
        console.log('🍪 Session cookies were cleared, triggering sign out');
        onSessionInvalid();
      } else {
        console.log('🍪 Cookie check failed, will retry...');
      }
    } else if (currentCookieCheck) {
      // Reset failure counter if cookies are present
      consecutiveFailures = 0;
    }
    
    lastCookieCheck = currentCookieCheck;
  };
  
  // Check cookies every 30 seconds instead of 10 (less aggressive)
  const cookieInterval = setInterval(checkCookies, 30 * 1000);
  
  // Check when page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      checkCookies();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Check when page regains focus
  const handleFocus = () => {
    checkCookies();
  };
  
  window.addEventListener('focus', handleFocus);
  
  // Return cleanup function
  return () => {
    clearInterval(cookieInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
}

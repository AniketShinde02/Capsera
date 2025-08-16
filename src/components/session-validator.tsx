"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { hasValidSessionCookies, clearAllNextAuthStorage, forceCompleteLogout } from '@/lib/session-utils';

/**
 * Balanced SessionValidator - Only detects cookie clearing, no aggressive monitoring
 * Provides security without frequent interruptions
 */
export function SessionValidator() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Skip if still loading
    if (status === 'loading') return;

          // If we have a session, only check for cookie clearing
      if (session?.user && session.user.id) {
        console.log('🔐 Setting up minimal session monitoring for user:', session.user.email);

                          // Enhanced function to check session validity
          const checkSessionValidity = async () => {
            try {
              // Check if cookies still exist
                             if (!hasValidSessionCookies()) {
                 console.log('🍪 Session cookies were cleared, forcing logout...');
                 // Use the most aggressive logout method
                 forceCompleteLogout();
                 return;
               }
               
               // JWT-only strategy: No server validation needed
               // Just check if cookies exist - that's sufficient for JWT
                         } catch (error) {
               console.error('Session validation error:', error);
               // On error, force logout for security
               forceCompleteLogout();
             }
          };

             // Only check on visibility change (when user comes back to tab)
       const handleVisibilityChange = () => {
         if (!document.hidden) {
           console.log('👁️ Page visible, checking cookies...');
           checkSessionValidity();
         }
       };

       // Check cookies when window gets focus (user switches back)
       const handleFocus = () => {
         console.log('🎯 Window focused, checking cookies...');
         checkSessionValidity();
       };

       // Listen for storage events (when cookies/localStorage change)
       const handleStorageChange = (e: StorageEvent) => {
         if (e.key?.includes('next-auth')) {
           console.log('💾 NextAuth storage changed, checking cookies...');
           setTimeout(checkSessionValidity, 500); // Small delay to let changes settle
         }
       };

      // Set up minimal event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('storage', handleStorageChange);

      // Cleanup function
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('storage', handleStorageChange);
        console.log('🧹 Minimal session monitoring cleanup completed');
      };
         } else if (status === 'unauthenticated') {
       // If we're unauthenticated but have stale cookies, clear them
       if (hasValidSessionCookies()) {
         console.log('🧽 Clearing stale session cookies...');
         clearAllNextAuthStorage(); // Clear all storage first
         // Don't logout, just clear storage
       }
     }
  }, [session, status]);

  // This component doesn't render anything
  return null;
}

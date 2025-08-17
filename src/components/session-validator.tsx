"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { hasValidSessionCookies, clearAllNextAuthStorage, forceCompleteLogout } from '@/lib/session-utils';

/**
 * Balanced SessionValidator - Only detects cookie clearing, no aggressive monitoring
 * Provides security without frequent interruptions
 */
export function SessionValidator() {
  // Temporarily disabled to fix auto-login issue
  // This component was causing aggressive logout behavior
  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
}

export default function AdminMaintenanceCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    checkMaintenanceStatus();
  }, [session]);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        
        // If maintenance mode is enabled, check if current user should be redirected
        if (data.status.enabled) {
          // Admins are always allowed during maintenance
          if (session?.user?.isAdmin) {
            console.log('🔧 Maintenance mode enabled, but admin access allowed');
            return;
          }
          
          // Non-admin users should be redirected
          console.log('🔧 Maintenance mode enabled, redirecting to maintenance page');
          router.push('/maintenance');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything - this component just handles redirects
  return null;
}

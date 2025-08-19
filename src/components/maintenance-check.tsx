'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
}

export default function MaintenanceCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip maintenance check for certain pages to avoid infinite loops
    if (pathname === '/maintenance' || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/admin/')) {
      setIsLoading(false);
      return;
    }

    checkMaintenanceStatus();
  }, [pathname]);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance');
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.status);
        
        // If maintenance mode is enabled, redirect to maintenance page
        if (data.status.enabled) {
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

'use client';

import { useState, useEffect } from 'react';
import { Wrench, Clock, Heart, Twitter, Instagram, Mail, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
  updatedAt: Date;
}

export default function MaintenancePage() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const router = useRouter();

  const checkStatus = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const response = await fetch('/api/maintenance', {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setLastChecked(new Date());

        // Critical: If maintenance is OFF, redirect immediately
        if (!data.status.enabled) {
          console.log('✅ Maintenance mode disabled - Redirecting...');
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 30 seconds silently (no loading spinner)
    const interval = setInterval(() => checkStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Checking system status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-8">

        {/* Hero Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-1 border-b border-border/50">
            <div className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              <span>System Status: Offline</span>
            </div>
          </div>

          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-2">
              <Wrench className="w-10 h-10 text-muted-foreground" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Capsera is Currently Down
            </h1>

            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                We'll be honest with you—our free AI quota has completely run out, and we currently don't have the budget to sustain paid API costs.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground">
                We are actively looking for sponsors or a sustainable funding solution to bring Capsera back online. We aren't going anywhere, but we need a little help to keep the lights on. 💡
              </p>
            </div>

            {/* Donation / Support Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="mailto:support@capsera.com">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
                  <Mail className="w-4 h-4" />
                  Contact for Sponsorship
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2"
                onClick={() => checkStatus()}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card/50 border border-border/50 p-6 rounded-2xl backdrop-blur-sm flex flex-col items-center text-center hover:bg-card/80 transition-colors">
            <Clock className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Estimated Return</h3>
            <p className="text-muted-foreground text-sm">
              Unknown. Depends on funding & sponsorship.
            </p>
          </div>

          <div className="bg-card/50 border border-border/50 p-6 rounded-2xl backdrop-blur-sm flex flex-col items-center text-center hover:bg-card/80 transition-colors">
            <Heart className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Community Support</h3>
            <p className="text-muted-foreground text-sm">
              Your shares and support mean the world to us!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
          <div className="flex justify-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
          </div>

          <div className="pt-8">
            <Link href="/emergency-access">
              <Button variant="ghost" size="sm" className="text-muted-foreground/50 hover:text-foreground">
                <Shield className="w-3 h-3 mr-2" />
                Admin Emergency Access
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

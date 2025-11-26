'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lock,
  Unlock,
  Shield,
  Key,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicCard } from '@/components/admin/dashboard/magic-card';

interface SystemLockStatus {
  isLocked: boolean;
  setBy: string | null;
  setAt: string | null;
}

export default function SystemLockPage() {
  const { data: session } = useSession();
  const [systemLockStatus, setSystemLockStatus] = useState<SystemLockStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [mode, setMode] = useState<'view' | 'set' | 'unlock' | 'change'>('view');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSystemLockStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-status' })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemLockStatus(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemLockStatus();
  }, []);

  const handleAction = async () => {
    if (mode === 'set' && pin !== confirmPin) {
      setNotification({ message: "PINs do not match", type: 'error' });
      return;
    }

    try {
      setActionLoading(true);
      const actionType = mode === 'set' ? 'set-pin' : mode === 'unlock' ? 'disable-lock' : 'change-pin';

      const response = await fetch('/api/admin/system-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          pin,
          currentPin: mode === 'change' ? currentPin : undefined
        })
      });

      if (response.ok) {
        setNotification({ message: "Security configuration updated", type: 'success' });
        setMode('view');
        setPin('');
        setConfirmPin('');
        setCurrentPin('');
        fetchSystemLockStatus();
      } else {
        const error = await response.json();
        setNotification({ message: error.error || "Operation failed", type: 'error' });
      }
    } catch (error) {
      setNotification({ message: "Network error", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !systemLockStatus) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
          <p className="text-yellow-500 font-mono animate-pulse">ACCESSING VAULT...</p>
        </div>
      </div>
    );
  }

  const isLocked = systemLockStatus?.isLocked;

  return (
    <div className="min-h-screen bg-black text-yellow-500 font-mono p-4 sm:p-8 animate-in fade-in duration-500 selection:bg-yellow-500/30 selection:text-yellow-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-yellow-500/20 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3 text-yellow-400">
            <ShieldCheck className="w-10 h-10" />
            SECURITY_VAULT
          </h1>
          <p className="text-yellow-500/60 mt-2">Level 5 Security Clearance Required</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-2 rounded border flex items-center gap-2",
            isLocked ? "bg-green-900/20 border-green-500/50 text-green-500" : "bg-red-900/20 border-red-500/50 text-red-500"
          )}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isLocked ? "bg-green-500" : "bg-red-500")} />
            {isLocked ? "SYSTEM SECURE" : "SYSTEM VULNERABLE"}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10">
          <div className={cn(
            "border px-6 py-4 rounded-none shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 font-bold",
            notification.type === 'success' ? "bg-green-900/90 border-green-500 text-green-400" : "bg-red-900/90 border-red-500 text-red-400"
          )}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

        {/* Vault Visual */}
        <div className="relative flex items-center justify-center min-h-[400px]">
          <div className={cn(
            "absolute inset-0 border-4 border-yellow-900/30 rounded-full animate-[spin_10s_linear_infinite]",
            isLocked ? "border-green-900/30" : "border-red-900/30"
          )} />
          <div className={cn(
            "absolute inset-8 border-2 border-dashed border-yellow-900/30 rounded-full animate-[spin_15s_linear_infinite_reverse]",
            isLocked ? "border-green-900/30" : "border-red-900/30"
          )} />

          <div className="relative z-10 text-center space-y-6">
            <div className={cn(
              "w-48 h-48 rounded-full flex items-center justify-center border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-1000",
              isLocked ? "bg-green-900/20 border-green-500 text-green-500 shadow-green-900/20" : "bg-red-900/20 border-red-500 text-red-500 shadow-red-900/20"
            )}>
              {isLocked ? <Lock className="w-20 h-20" /> : <Unlock className="w-20 h-20" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-widest">
                {isLocked ? "ACCESS RESTRICTED" : "ACCESS GRANTED"}
              </h2>
              {systemLockStatus?.setBy && (
                <p className="text-sm text-yellow-500/50">
                  Last Protocol: {systemLockStatus.setBy} <br />
                  Timestamp: {new Date(systemLockStatus.setAt!).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex flex-col justify-center space-y-8">
          <Card className="bg-black border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <CardHeader className="border-b border-yellow-500/20 bg-yellow-500/5">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                SECURITY PROTOCOLS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">

              {mode === 'view' ? (
                <div className="grid gap-4">
                  {!isLocked ? (
                    <Button
                      onClick={() => setMode('set')}
                      className="h-14 text-lg bg-green-600 hover:bg-green-700 text-black font-bold tracking-wider"
                    >
                      <Lock className="w-5 h-5 mr-3" />
                      ENGAGE LOCK
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setMode('unlock')}
                        className="h-14 text-lg bg-red-600 hover:bg-red-700 text-black font-bold tracking-wider"
                      >
                        <Unlock className="w-5 h-5 mr-3" />
                        DISENGAGE LOCK
                      </Button>
                      <Button
                        onClick={() => setMode('change')}
                        variant="outline"
                        className="h-12 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        UPDATE CREDENTIALS
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-yellow-400">
                      {mode === 'set' ? 'ESTABLISH NEW PIN' : mode === 'unlock' ? 'AUTHORIZATION REQUIRED' : 'UPDATE PIN'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setMode('view')} className="text-yellow-500/50 hover:text-yellow-500">
                      CANCEL
                    </Button>
                  </div>

                  {mode === 'change' && (
                    <div className="space-y-2">
                      <Label className="text-yellow-500/70">CURRENT PIN</Label>
                      <Input
                        type="password"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        className="bg-black border-yellow-500/30 text-yellow-400 h-12 text-center text-xl tracking-[0.5em] focus:border-yellow-500"
                        maxLength={6}
                      />
                    </div>
                  )}

                  {(mode === 'set' || mode === 'change') && (
                    <div className="space-y-2">
                      <Label className="text-yellow-500/70">{mode === 'change' ? 'NEW PIN' : 'ENTER PIN'}</Label>
                      <Input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="bg-black border-yellow-500/30 text-yellow-400 h-12 text-center text-xl tracking-[0.5em] focus:border-yellow-500"
                        maxLength={6}
                      />
                    </div>
                  )}

                  {mode === 'set' && (
                    <div className="space-y-2">
                      <Label className="text-yellow-500/70">CONFIRM PIN</Label>
                      <Input
                        type="password"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className="bg-black border-yellow-500/30 text-yellow-400 h-12 text-center text-xl tracking-[0.5em] focus:border-yellow-500"
                        maxLength={6}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className="w-full h-14 text-lg bg-yellow-600 hover:bg-yellow-700 text-black font-bold tracking-wider mt-4"
                  >
                    {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    {mode === 'unlock' ? 'VERIFY & UNLOCK' : 'CONFIRM PROTOCOL'}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-black border border-yellow-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-yellow-500/50" />
                <div>
                  <p className="text-xs text-yellow-500/50">ENCRYPTION</p>
                  <p className="font-bold text-yellow-400">AES-256</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black border border-yellow-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Key className="w-8 h-8 text-yellow-500/50" />
                <div>
                  <p className="text-xs text-yellow-500/50">HASHING</p>
                  <p className="font-bold text-yellow-400">BCRYPT</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SystemLockStatus {
  isLocked: boolean;
  setBy: string | null;
  setAt: string | null;
}

export default function SystemLockPage() {
  const { data: session } = useSession();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState<{
    isSet: boolean;
    lastUpdated?: string;
    setBy?: string;
  } | null>(null);

  // System lock status
  const [systemLockStatus, setSystemLockStatus] = useState<SystemLockStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Plain text notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2 second timeout
  };

  // Form states
  const [action, setAction] = useState<'set-pin' | 'change-pin' | 'disable-lock'>('set-pin');
  const [pin, setPin] = useState('');
  const [showActionForm, setShowActionForm] = useState(false);

  // Fetch system lock status
  const fetchSystemLockStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'get-status' })
      });

      if (response.ok) {
        const data = await response.json();
        setSystemLockStatus(data);
      } else {
        console.error('Failed to fetch system lock status');
      }
    } catch (error) {
      console.error('Error fetching system lock status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle system lock action
  const handleSystemLockAction = async () => {
    // Validate PIN format
    if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
      showNotification("PIN must be 4-6 digits only", "error");
      return;
    }

    // Validate PIN confirmation
    if (action === 'set-pin' && pin !== confirmPin) {
      showNotification("PINs do not match", "error");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/system-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          pin,
          currentPin
        })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(data.message, "success");
        
        // Reset form and refresh status
        setPin('');
        setCurrentPin('');
        setConfirmPin('');
        setShowActionForm(false);
        fetchSystemLockStatus();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error, "error");
      }
    } catch (error) {
      console.error('Error managing system lock:', error);
      showNotification("Error managing system lock", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form when action changes
  useEffect(() => {
    setPin('');
    setCurrentPin('');
    setConfirmPin('');
    setShowActionForm(false);
  }, [action]);

  useEffect(() => {
    fetchSystemLockStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system lock status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔒 System Lock Management</h1>
          <p className="text-muted-foreground">Secure your setup page with PIN protection</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchSystemLockStatus}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Plain Text Notification Display */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
            : 'bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Current Status */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current System Lock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemLockStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${systemLockStatus.isLocked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-lg font-semibold">
                    Status: {systemLockStatus.isLocked ? '🔒 System Locked' : '🔓 System Unlocked'}
                  </p>
                  {systemLockStatus.setBy && (
                    <p className="text-sm text-muted-foreground">
                      Set by: {systemLockStatus.setBy} on {new Date(systemLockStatus.setAt!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setAction('set-pin');
                    setShowActionForm(true);
                  }}
                  disabled={systemLockStatus.isLocked}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Set PIN Lock
                </Button>
                <Button 
                  onClick={() => {
                    setAction('change-pin');
                    setShowActionForm(true);
                  }}
                  disabled={!systemLockStatus.isLocked}
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change PIN
                </Button>
                <Button 
                  onClick={() => {
                    setAction('disable-lock');
                    setShowActionForm(true);
                  }}
                  disabled={!systemLockStatus.isLocked}
                  variant="destructive"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Disable Lock
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Unable to fetch system lock status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Form */}
      {showActionForm && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {action === 'set-pin' && <Lock className="h-5 w-5 text-green-600" />}
              {action === 'change-pin' && <Key className="h-5 w-5 text-blue-600" />}
              {action === 'disable-lock' && <Unlock className="h-5 w-5 text-red-600" />}
              {action === 'set-pin' && 'Set New PIN Lock'}
              {action === 'change-pin' && 'Change PIN'}
              {action === 'disable-lock' && 'Disable System Lock'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action Selection */}
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <Select 
                value={action} 
                onValueChange={(value) => setAction(value as 'set-pin' | 'change-pin' | 'disable-lock')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set-pin">Set New PIN</SelectItem>
                  <SelectItem value="change-pin">Change PIN</SelectItem>
                  <SelectItem value="disable-lock">Disable Lock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current PIN (for change-pin action) */}
            {action === 'change-pin' && (
              <div>
                <Label htmlFor="current-pin" className="text-sm font-medium">Current PIN</Label>
                <Input
                  id="current-pin"
                  type="password"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={6}
                  className="mt-1"
                />
              </div>
            )}

            {/* New PIN (for set-pin and change-pin actions) */}
            {(action === 'set-pin' || action === 'change-pin') && (
              <>
                <div>
                  <Label htmlFor="new-pin" className="text-sm font-medium">New PIN</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    placeholder="Enter 4-6 digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PIN must be 4-6 digits only
                  </p>
                </div>

                {/* Confirm PIN (for set-pin action only) */}
                {action === 'set-pin' && (
                  <div>
                    <Label htmlFor="confirm-pin" className="text-sm font-medium">Confirm PIN</Label>
                    <Input
                      id="confirm-pin"
                      type="password"
                      placeholder="Confirm new PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>
                )}
              </>
            )}

            {/* Warning for disable action */}
            {action === 'disable-lock' && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Warning: Disabling the system lock will remove PIN protection from the setup page.
                  This action cannot be undone.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowActionForm(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSystemLockAction}
                disabled={
                  actionLoading ||
                  (action === 'set-pin' && (!pin || !confirmPin || pin !== confirmPin)) ||
                  (action === 'change-pin' && (!currentPin || !pin)) ||
                  (action === 'disable-lock' && false) // Always enabled for disable
                }
                variant={action === 'disable-lock' ? 'destructive' : 'default'}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {action === 'set-pin' ? 'Set PIN' : 
                     action === 'change-pin' ? 'Change PIN' : 'Disable Lock'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              How System Lock Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>When enabled, users must enter a PIN before accessing the setup page</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>PIN is securely hashed and stored in the database</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Only administrators can set, change, or disable the lock</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Lock status is displayed in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>PIN must be 4-6 digits for security and memorability</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>PINs are hashed using bcrypt with salt rounds</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Audit trail shows who set/changed the PIN and when</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Lock can be disabled in emergency situations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Page Integration Info */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Key className="h-5 w-5" />
            Setup Page Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-600 dark:text-blue-400">
            <p className="text-sm">
              When the system lock is enabled, users visiting the setup page will be required to enter the PIN before they can:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Access the OTP verification step</li>
              <li>Create new admin accounts</li>
              <li>Modify system settings</li>
              <li>Perform any setup operations</li>
            </ul>
            <p className="text-sm font-medium">
              This provides an additional layer of security for your system setup process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

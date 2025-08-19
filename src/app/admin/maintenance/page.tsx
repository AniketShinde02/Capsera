'use client';

import { useState, useEffect } from 'react';
import { Wrench, Power, PowerOff, Clock, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getMaintenanceConfig } from '@/lib/maintenance-config';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
  updatedAt: string;
}

export default function MaintenancePage() {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [message, setMessage] = useState("We're making things better! Capsera is currently under maintenance.");
  const [estimatedTime, setEstimatedTime] = useState("2-3 hours");
  const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [newIP, setNewIP] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyToken, setEmergencyToken] = useState('');
  const [emergencyTokenExpiry, setEmergencyTokenExpiry] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [envConfig, setEnvConfig] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Load current maintenance settings from server
    loadMaintenanceSettings();
    // Set stable date format to avoid hydration issues
    setLastUpdated(new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]);
    // Set environment config to avoid hydration issues
    setEnvConfig(getMaintenanceConfig());
  }, []);

  const loadMaintenanceSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const { status } = await response.json();
        console.log('Loaded maintenance settings:', status);
        
        setMaintenanceEnabled(status.enabled || false);
        setMessage(status.message || "We're making things better! Capsera is currently under maintenance.");
        setEstimatedTime(status.estimatedTime || "2-3 hours");
        setAllowedIPs(status.allowedIPs || []);
        
        // Merge database emails with environment emails
        const dbEmails = status.allowedEmails || [];
        const envEmails = envConfig?.maintenanceMode?.allowedEmails || [];
        const allEmails = [...new Set([...dbEmails, ...envEmails])]; // Remove duplicates
        setAllowedEmails(allEmails);
        
        console.log('Emails loaded:', { dbEmails, envEmails, allEmails });
             } else {
         throw new Error(`Failed to load: ${response.status}`);
       }
     } catch (error: any) {
       console.error('Failed to load maintenance settings:', error);
       showNotification("Failed to load maintenance settings.", "error");
     } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    try {
      setLoading(true);
      
      const config = {
        enabled: !maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs,
        allowedEmails
      };

      console.log('Sending maintenance config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
                 const result = await response.json();
         console.log('Maintenance update result:', result);
         
         // Update state immediately for better UX
         const newState = !maintenanceEnabled;
         setMaintenanceEnabled(newState);
         
         showNotification(
           newState ? "Maintenance Mode Enabled: " + result.message : "Maintenance Mode Disabled",
           "success"
         );
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to update maintenance mode');
       }
     } catch (error: any) {
       console.error('Error updating maintenance mode:', error);
       showNotification(error?.message || "Failed to update maintenance mode.", "error");
     } finally {
      setLoading(false);
    }
  };

  const addAllowedIP = async () => {
    if (!newIP.trim()) return;
    
    try {
      setLoading(true);
      const updatedIPs = [...allowedIPs, newIP.trim()];
      
      const config = {
        enabled: maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs: updatedIPs,
        allowedEmails
      };

      console.log('Adding IP, sending config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('IP add result:', result);
                 setAllowedIPs(updatedIPs);
         setNewIP('');
         showNotification(`${newIP.trim()} can now access during maintenance.`, "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to add IP');
       }
     } catch (error: any) {
       console.error('Error adding IP:', error);
       showNotification(error?.message || "Failed to add IP.", "error");
     } finally {
      setLoading(false);
    }
  };

  const removeAllowedIP = async (ip: string) => {
    try {
      setLoading(true);
      const updatedIPs = allowedIPs.filter(ipAddr => ipAddr !== ip);
      
      const config = {
        enabled: maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs: updatedIPs,
        allowedEmails
      };

      console.log('Removing IP, sending config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('IP remove result:', result);
                 setAllowedIPs(updatedIPs);
         showNotification(`${ip} can no longer access during maintenance.`, "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to remove IP');
       }
     } catch (error: any) {
       console.error('Error removing IP:', error);
       showNotification(error?.message || "Failed to remove IP.", "error");
     } finally {
      setLoading(false);
    }
  };

  const addAllowedEmail = async () => {
    if (!newEmail.trim()) return;
    
    try {
      setLoading(true);
      const updatedEmails = [...allowedEmails, newEmail.trim()];
      
      const config = {
        enabled: maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs,
        allowedEmails: updatedEmails
      };

      console.log('Adding email, sending config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Email add result:', result);
                 setAllowedEmails(updatedEmails);
         setNewEmail('');
         showNotification(`${newEmail.trim()} can now access during maintenance.`, "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to add email');
       }
     } catch (error: any) {
       console.error('Error adding email:', error);
       showNotification(error?.message || "Failed to add email.", "error");
     } finally {
      setLoading(false);
    }
  };

  const removeAllowedEmail = async (email: string) => {
    try {
      setLoading(true);
      const updatedEmails = allowedEmails.filter(addr => addr !== email);
      
      const config = {
        enabled: maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs,
        allowedEmails: updatedEmails
      };

      console.log('Removing email, sending config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Email remove result:', result);
                 setAllowedEmails(updatedEmails);
         showNotification(`${email} can no longer access during maintenance.`, "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to remove email');
       }
     } catch (error: any) {
       console.error('Error removing email:', error);
       showNotification(error?.message || "Failed to remove email.", "error");
     } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const config = {
        enabled: maintenanceEnabled,
        message,
        estimatedTime,
        allowedIPs,
        allowedEmails
      };

      console.log('Saving settings, sending config:', config);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
                 const result = await response.json();
         console.log('Save settings result:', result);
         showNotification("Maintenance settings have been updated.", "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to save settings');
       }
     } catch (error: any) {
       console.error('Error saving settings:', error);
       showNotification(error?.message || "Failed to save settings.", "error");
     } finally {
      setLoading(false);
    }
  };

  const disableMaintenance = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/maintenance', {
        method: 'DELETE',
      });

      if (response.ok) {
                 const result = await response.json();
         console.log('Disable maintenance result:', result);
         setMaintenanceEnabled(false);
         showNotification("Maintenance Mode Disabled: The site is now accessible to all users.", "success");
         
         // Reload settings to ensure sync
         await loadMaintenanceSettings();
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to disable maintenance mode');
       }
     } catch (error: any) {
       console.error('Error disabling maintenance mode:', error);
       showNotification(error?.message || "Failed to disable maintenance mode.", "error");
     } finally {
      setLoading(false);
    }
  };

  const generateEmergencyToken = async () => {
         if (!emergencyEmail.trim()) {
       showNotification("Please enter an email address.", "error");
       return;
     }

    try {
      setLoading(true);
      
      const response = await fetch('/api/maintenance/emergency-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emergencyEmail.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
                 setEmergencyToken(result.token);
         setEmergencyTokenExpiry(new Date(result.expiresAt).toLocaleString());
         showNotification("Emergency Token Generated: Token has been generated successfully.", "success");
       } else {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to generate emergency token');
       }
     } catch (error: any) {
       console.error('Error generating emergency token:', error);
       showNotification(error?.message || "Failed to generate emergency token.", "error");
     } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading maintenance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
             <div className="flex items-center space-x-2 mb-6">
         <Wrench className="w-8 h-8 text-yellow-500" />
         <h1 className="text-3xl font-bold">Maintenance Mode Control</h1>
       </div>

       {/* Notification Display */}
       {notification && (
         <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
           notification.type === 'success' 
             ? 'bg-green-500 text-white' 
             : notification.type === 'error' 
             ? 'bg-red-500 text-white' 
             : 'bg-blue-500 text-white'
         }`}>
           <div className="flex items-center justify-between">
             <span>{notification.message}</span>
             <button 
               onClick={() => setNotification(null)}
               className="ml-4 text-white hover:text-gray-200"
             >
               ×
             </button>
           </div>
         </div>
       )}

      {/* Debug Info */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              <strong>Current Status:</strong> {maintenanceEnabled ? 'ENABLED' : 'DISABLED'}<br/>
              <strong>Allowed IPs:</strong> {allowedIPs.length} | <strong>Allowed Emails:</strong> {allowedEmails.length}
            </p>
            <p>
              <strong>Last Updated:</strong> {lastUpdated}
            </p>
                         <div className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
               <strong>Email Sources:</strong><br/>
               • Database: {envConfig ? (envConfig.maintenanceMode.allowedEmails || []).length : 0} emails<br/>
               • Environment: {envConfig ? (envConfig.maintenanceMode.allowedEmails || []).length : 0} emails<br/>
               • Total Unique: {allowedEmails.length} emails
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Configuration Info */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-200">Environment Configuration</CardTitle>
        </CardHeader>
                 <CardContent>
           <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
             {envConfig ? (
               <>
                 <div>
                   <strong>🔧 Maintenance Mode:</strong><br/>
                   • Environment Enabled: {envConfig.maintenanceMode.enabled ? 'Yes' : 'No'}<br/>
                   • Default Allowed IPs: {envConfig.maintenanceMode.allowedIPs.join(', ')}<br/>
                   • Default Allowed Emails: {envConfig.maintenanceMode.allowedEmails.join(', ') || 'None'}
                 </div>
                 <div>
                   <strong>🚨 Emergency Access:</strong><br/>
                   • Token Expiry: {envConfig.emergencyAccess.tokenExpiryHours} hours<br/>
                   • Max Tokens per Email: {envConfig.emergencyAccess.maxTokensPerEmail}<br/>
                   • Token Length: {envConfig.emergencyAccess.tokenLength} characters<br/>
                   • Rate Limit per IP: {envConfig.emergencyAccess.rateLimitPerIP} tokens/hour
                 </div>
                 <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                   💡 These settings can be configured in your .env file
                 </div>
               </>
             ) : (
               <div className="text-center py-4">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                 <p className="text-sm">Loading environment config...</p>
               </div>
             )}
           </div>
         </CardContent>
      </Card>

      {/* Main Control */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Power className="w-5 h-5" />
            <span>Maintenance Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={toggleMaintenance}
              disabled={loading}
            />
            <Label className="text-lg font-medium">
              {maintenanceEnabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
          
          {maintenanceEnabled && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Maintenance mode is currently ACTIVE. Only allowed IPs and emails can access the site.
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                💡 Changes to message and timing will be reflected on the maintenance page within 30 seconds.
              </p>
            </div>
          )}

          {maintenanceEnabled && (
            <Button 
              onClick={disableMaintenance} 
              variant="destructive"
              disabled={loading}
            >
              <PowerOff className="w-4 h-4 mr-2" />
              Force Disable Maintenance
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Message Settings */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Message & Timing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Maintenance Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message to display during maintenance..."
              rows={3}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              💡 This message will appear on the maintenance page for all users
            </p>
          </div>
          
          <div>
            <Label htmlFor="estimatedTime">Estimated Completion Time</Label>
            <Input
              id="estimatedTime"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g., 2-3 hours"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              💡 This will show on the maintenance page as estimated completion time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allowed IPs */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Allowed IP Addresses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={addAllowedIP} variant="outline" disabled={loading}>
              Add IP
            </Button>
          </div>
          
          {allowedIPs.length > 0 ? (
            <div className="space-y-2">
              {allowedIPs.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="font-mono">{ip}</span>
                  <Button
                    onClick={() => removeAllowedIP(ip)}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No IP addresses allowed during maintenance.</p>
          )}
        </CardContent>
      </Card>

      {/* Allowed Emails */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Allowed Email Addresses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              type="email"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={addAllowedEmail} variant="outline" disabled={loading}>
              Add Email
            </Button>
          </div>
          
          {allowedEmails.length > 0 ? (
            <div className="space-y-2">
              {allowedEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>{email}</span>
                  <Button
                    onClick={() => removeAllowedEmail(email)}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No email addresses allowed during maintenance.</p>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg" disabled={loading}>
          Save All Settings
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>1. <strong>Enable Maintenance Mode:</strong> Toggle the switch above to activate maintenance mode.</p>
          <p>2. <strong>Set Message:</strong> Customize the message users will see during maintenance.</p>
          <p>3. <strong>Add Allowed IPs:</strong> Add IP addresses that can still access the site during maintenance.</p>
          <p>4. <strong>Add Allowed Emails:</strong> Add email addresses for users who can bypass maintenance.</p>
          <p>5. <strong>Save Settings:</strong> Click the save button to apply all changes.</p>
          <p className="mt-4 text-green-600 dark:text-green-400">
            ✅ <strong>Note:</strong> This is now a server-side implementation that works across all browsers and tabs!
          </p>
          <p className="mt-2 text-blue-600 dark:text-blue-400">
            🔍 <strong>Debug:</strong> Check browser console for detailed API communication logs.
          </p>
          <p className="mt-2 text-orange-600 dark:text-orange-400">
            🚨 <strong>Emergency Access:</strong> Use emergency access tokens for email-based bypass during maintenance.
          </p>
        </CardContent>
      </Card>

      {/* Emergency Access Section */}
      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Emergency Access System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            Generate emergency access tokens for whitelisted emails. These tokens allow users to bypass maintenance mode.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyEmail">Email for Emergency Access</Label>
            <div className="flex space-x-2">
              <Input
                id="emergencyEmail"
                placeholder="Enter whitelisted email"
                type="email"
                className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={emergencyEmail}
                onChange={(e) => setEmergencyEmail(e.target.value)}
              />
              <Button 
                onClick={generateEmergencyToken} 
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                disabled={loading}
              >
                Generate Token
              </Button>
            </div>
          </div>

          {emergencyToken && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
              <p className="text-green-800 dark:text-green-200 text-sm">
                <strong>Emergency Token Generated!</strong><br/>
                Token: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{emergencyToken}</code><br/>
                Expires: {emergencyTokenExpiry}<br/>
                Share this token with the user to bypass maintenance mode.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

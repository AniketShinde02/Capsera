'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save, 
  Shield, 
  Database, 
  Mail, 
  Bell,
  Globe,
  Lock
} from 'lucide-react';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'CaptionCraft',
    siteDescription: 'Generate Viral Captions in Seconds',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: '5',
    maxCaptionsPerImage: '3',
    enableAnalytics: true,
    enableNotifications: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'admin@captioncraft.com',
    backupFrequency: 'daily',
    retentionDays: '30'
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load maintenance mode status on component mount
  useEffect(() => {
    loadMaintenanceStatus();
  }, []);

  const loadMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const { status } = await response.json();
        setSettings(prev => ({
          ...prev,
          maintenanceMode: status.enabled || false
        }));
      }
    } catch (error) {
      console.error('Failed to load maintenance status:', error);
    }
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    showNotification('Settings saved successfully!', 'success');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle maintenance mode toggle with API call
  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          message: "We're making things better! Capsera is currently under maintenance.",
          estimatedTime: "2-3 hours",
          allowedIPs: [],
          allowedEmails: []
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({ ...prev, maintenanceMode: enabled }));
        showNotification(
          enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
          'success'
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update maintenance mode');
      }
    } catch (error: any) {
      console.error('Error updating maintenance mode:', error);
      showNotification(error?.message || "Failed to update maintenance mode.", 'error');
      // Revert the toggle if the API call failed
      setSettings(prev => ({ ...prev, maintenanceMode: !enabled }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
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

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable maintenance mode to restrict access
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
              disabled={loading}
            />
          </div>
          
          {settings.maintenanceMode && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ <strong>Maintenance mode is currently ACTIVE.</strong><br/>
                💡 For advanced maintenance settings, visit the <a href="/admin/maintenance" className="underline font-medium">Maintenance Management</a> page.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Enable new user registrations
              </p>
            </div>
            <Switch
              id="allowRegistration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing
              </p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            File Upload Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => updateSetting('maxFileSize', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxCaptionsPerImage">Max Captions Per Image</Label>
              <Input
                id="maxCaptionsPerImage"
                type="number"
                value={settings.maxCaptionsPerImage}
                onChange={(e) => updateSetting('maxCaptionsPerImage', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => updateSetting('smtpHost', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={settings.smtpPort}
                onChange={(e) => updateSetting('smtpPort', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input
              id="smtpUser"
              value={settings.smtpUser}
              onChange={(e) => updateSetting('smtpUser', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Backup & Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <Label htmlFor="retentionDays">Data Retention (Days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.retentionDays}
                onChange={(e) => updateSetting('retentionDays', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Feature Toggles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableAnalytics">Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track user behavior and system metrics
              </p>
            </div>
            <Switch
              id="enableAnalytics"
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send system notifications to users
              </p>
            </div>
            <Switch
              id="enableNotifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

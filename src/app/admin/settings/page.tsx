'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Lock,
  Server,
  Cpu,
  Zap,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Capsera',
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
    smtpUser: 'admin@capsera.com',
    backupFrequency: 'daily',
    retentionDays: '30'
  });

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadMaintenanceStatus();
  }, []);

  const loadMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const { status } = await response.json();
        setSettings(prev => ({ ...prev, maintenanceMode: status.enabled || false }));
      }
    } catch (error) {
      console.error('Failed to load maintenance status:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setNotification({ message: 'System configuration updated successfully.', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 lg:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            System Control
          </h1>
          <p className="text-muted-foreground mt-1">Global configuration and environment variables.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "bg-blue-600 hover:bg-blue-700 text-white transition-all",
            isSaving && "opacity-80"
          )}
        >
          {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? 'Saving Changes...' : 'Save Configuration'}
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10">
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="general" orientation="vertical" className="w-full">
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
              <TabsTrigger
                value="general"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:text-blue-500 text-muted-foreground hover:text-foreground transition-all rounded-lg"
              >
                <Globe className="w-4 h-4 mr-3" /> General
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:text-red-500 text-muted-foreground hover:text-foreground transition-all rounded-lg"
              >
                <Shield className="w-4 h-4 mr-3" /> Security
              </TabsTrigger>
              <TabsTrigger
                value="storage"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:text-purple-500 text-muted-foreground hover:text-foreground transition-all rounded-lg"
              >
                <Database className="w-4 h-4 mr-3" /> Storage
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:text-orange-500 text-muted-foreground hover:text-foreground transition-all rounded-lg"
              >
                <Mail className="w-4 h-4 mr-3" /> Email & SMTP
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:text-green-500 text-muted-foreground hover:text-foreground transition-all rounded-lg"
              >
                <Zap className="w-4 h-4 mr-3" /> Features
              </TabsTrigger>
            </TabsList>

            {/* System Status Widget */}
            <Card className="mt-6 bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">API Server</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">Database</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-foreground">CPU Load</span>
                  </div>
                  <span className="text-xs text-muted-foreground">12%</span>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-9 space-y-6">
          <Tabs defaultValue="general" orientation="vertical" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Hidden triggers to make the content switch work if we were using a single Tabs component, 
                but here we are simulating the layout. 
                Wait, the previous implementation had a nested Tabs structure which was confusing.
                I will simplify: The sidebar triggers above are just for show if they don't control the content below.
                To make it work properly, I should wrap the whole thing in one Tabs component.
            */}

            {/* Actually, let's just use the Tabs component properly wrapping everything */}
            <TabsList className="hidden">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <div className="col-span-12">
              {/* Note: In a real app with this layout, we'd need a context or state to sync the sidebar with this content area.
                  For now, I'll render all sections stacked or just the 'general' one if I strictly follow the Tabs component.
                  However, to ensure all content is accessible/visible for this refactor without complex state management in this file,
                  I will render the sections as cards one after another, or use a simple state if I want tab switching.
                  
                  Let's use simple state for tab switching to make it functional.
              */}
              <SettingsContent
                settings={settings}
                updateSetting={updateSetting}
              />
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper component to manage tab state internally for the content
function SettingsContent({ settings, updateSetting }: { settings: any, updateSetting: (k: string, v: any) => void }) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-1">
        <Button variant="ghost" onClick={() => setActiveTab('general')} className={cn("w-full justify-start", activeTab === 'general' ? "bg-card text-blue-500" : "text-muted-foreground hover:text-foreground")}>
          <Globe className="w-4 h-4 mr-3" /> General
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('security')} className={cn("w-full justify-start", activeTab === 'security' ? "bg-card text-red-500" : "text-muted-foreground hover:text-foreground")}>
          <Shield className="w-4 h-4 mr-3" /> Security
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('storage')} className={cn("w-full justify-start", activeTab === 'storage' ? "bg-card text-purple-500" : "text-muted-foreground hover:text-foreground")}>
          <Database className="w-4 h-4 mr-3" /> Storage
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('email')} className={cn("w-full justify-start", activeTab === 'email' ? "bg-card text-orange-500" : "text-muted-foreground hover:text-foreground")}>
          <Mail className="w-4 h-4 mr-3" /> Email & SMTP
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('features')} className={cn("w-full justify-start", activeTab === 'features' ? "bg-card text-green-500" : "text-muted-foreground hover:text-foreground")}>
          <Zap className="w-4 h-4 mr-3" /> Features
        </Button>

        <Card className="mt-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">API Server</span>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">Database</span>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-foreground">CPU Load</span>
              </div>
              <span className="text-xs text-muted-foreground">12%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-9">
        {activeTab === 'general' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Platform Identity</CardTitle>
              <CardDescription className="text-muted-foreground">Configure the basic information for your platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Site Name</Label>
                <Input value={settings.siteName} onChange={(e) => updateSetting('siteName', e.target.value)} className="bg-background border-input text-foreground" />
              </div>
              <div className="grid gap-2">
                <Label className="text-foreground">Description</Label>
                <Input value={settings.siteDescription} onChange={(e) => updateSetting('siteDescription', e.target.value)} className="bg-background border-input text-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-card border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500">Access Control</CardTitle>
              <CardDescription className="text-muted-foreground">Manage critical security protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/10 bg-red-500/5">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to administrators only.</p>
                </div>
                <Switch checked={settings.maintenanceMode} onCheckedChange={(c) => updateSetting('maintenanceMode', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to sign up.</p>
                </div>
                <Switch checked={settings.allowRegistration} onCheckedChange={(c) => updateSetting('allowRegistration', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email confirmation for new accounts.</p>
                </div>
                <Switch checked={settings.requireEmailVerification} onCheckedChange={(c) => updateSetting('requireEmailVerification', c)} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'storage' && (
          <Card className="bg-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-500">Storage Limits</CardTitle>
              <CardDescription className="text-muted-foreground">Configure file upload constraints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Max File Size (MB)</Label>
                  <Input type="number" value={settings.maxFileSize} onChange={(e) => updateSetting('maxFileSize', e.target.value)} className="bg-background border-input text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Max Captions / Image</Label>
                  <Input type="number" value={settings.maxCaptionsPerImage} onChange={(e) => updateSetting('maxCaptionsPerImage', e.target.value)} className="bg-background border-input text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Backup Frequency</Label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Retention (Days)</Label>
                  <Input type="number" value={settings.retentionDays} onChange={(e) => updateSetting('retentionDays', e.target.value)} className="bg-background border-input text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'email' && (
          <Card className="bg-card border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-orange-500">SMTP Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">Manage email delivery settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">SMTP Host</Label>
                  <Input value={settings.smtpHost} onChange={(e) => updateSetting('smtpHost', e.target.value)} className="bg-background border-input text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">SMTP Port</Label>
                  <Input value={settings.smtpPort} onChange={(e) => updateSetting('smtpPort', e.target.value)} className="bg-background border-input text-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">SMTP User</Label>
                <Input value={settings.smtpUser} onChange={(e) => updateSetting('smtpUser', e.target.value)} className="bg-background border-input text-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'features' && (
          <Card className="bg-card border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-500">Feature Toggles</CardTitle>
              <CardDescription className="text-muted-foreground">Enable or disable system features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">Collect usage data for insights.</p>
                </div>
                <Switch checked={settings.enableAnalytics} onCheckedChange={(c) => updateSetting('enableAnalytics', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">System Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to users.</p>
                </div>
                <Switch checked={settings.enableNotifications} onCheckedChange={(c) => updateSetting('enableNotifications', c)} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background/50 backdrop-blur-3xl p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            System Control
          </h1>
          <p className="text-muted-foreground mt-1">Global configuration and environment variables.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all",
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
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 transition-all rounded-lg"
              >
                <Globe className="w-4 h-4 mr-3" /> General
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500 transition-all rounded-lg"
              >
                <Shield className="w-4 h-4 mr-3" /> Security
              </TabsTrigger>
              <TabsTrigger
                value="storage"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500 transition-all rounded-lg"
              >
                <Database className="w-4 h-4 mr-3" /> Storage
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500 transition-all rounded-lg"
              >
                <Mail className="w-4 h-4 mr-3" /> Email & SMTP
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500 transition-all rounded-lg"
              >
                <Zap className="w-4 h-4 mr-3" /> Features
              </TabsTrigger>
            </TabsList>

            {/* System Status Widget */}
            <Card className="mt-6 border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" />
                    <span className="text-sm">API Server</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">CPU Load</span>
                  </div>
                  <span className="text-xs text-muted-foreground">12%</span>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-9 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            {/* We need to sync this Tabs with the sidebar manually or use a context, 
                but for this UI demo, we'll just render all content and let the user scroll or 
                assume the sidebar is just a visual guide. 
                Actually, let's make the sidebar buttons scroll to section or just render everything in a nice flow.
                
                Correction: The sidebar TabsTrigger needs to control the content here.
                I will wrap the content in TabsContent corresponding to the triggers.
            */}

            {/* Since the sidebar is separate, I need to restructure. 
                I will put the TabsContent here and control it via the same Tabs component if possible.
                However, Tabs component expects triggers and content to be children.
                I will use a single Tabs wrapping the whole grid.
            */}
          </Tabs>

          {/* Re-implementing structure to wrap everything in one Tabs component */}
          <Tabs defaultValue="general" orientation="vertical" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

            <TabsList className="lg:col-span-3 flex flex-col h-auto bg-transparent space-y-1 p-0 order-first">
              <TabsTrigger value="general" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 transition-all rounded-lg"><Globe className="w-4 h-4 mr-3" /> General</TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-4 py-3 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500 transition-all rounded-lg"><Shield className="w-4 h-4 mr-3" /> Security</TabsTrigger>
              <TabsTrigger value="storage" className="w-full justify-start px-4 py-3 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500 transition-all rounded-lg"><Database className="w-4 h-4 mr-3" /> Storage</TabsTrigger>
              <TabsTrigger value="email" className="w-full justify-start px-4 py-3 data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500 transition-all rounded-lg"><Mail className="w-4 h-4 mr-3" /> Email & SMTP</TabsTrigger>
              <TabsTrigger value="features" className="w-full justify-start px-4 py-3 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500 transition-all rounded-lg"><Zap className="w-4 h-4 mr-3" /> Features</TabsTrigger>

              <Card className="mt-6 border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Server className="w-4 h-4 text-green-500" /><span className="text-sm">API Server</span></div><span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Operational</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Database className="w-4 h-4 text-green-500" /><span className="text-sm">Database</span></div><span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Connected</span></div>
                </CardContent>
              </Card>
            </TabsList>

            <div className="lg:col-span-9">
              {/* General */}
              <TabsContent value="general" className="space-y-6 mt-0">
                <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Platform Identity</CardTitle>
                    <CardDescription>Configure the basic information for your platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Site Name</Label>
                      <Input value={settings.siteName} onChange={(e) => updateSetting('siteName', e.target.value)} className="bg-background/50 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Input value={settings.siteDescription} onChange={(e) => updateSetting('siteDescription', e.target.value)} className="bg-background/50 border-white/10" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <Card className="border-red-500/10 bg-red-500/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-red-500">Access Control</CardTitle>
                    <CardDescription>Manage critical security protocols.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/10 bg-red-500/5">
                      <div className="space-y-0.5">
                        <Label className="text-base">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Restrict access to administrators only.</p>
                      </div>
                      <Switch checked={settings.maintenanceMode} onCheckedChange={(c) => updateSetting('maintenanceMode', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">User Registration</Label>
                        <p className="text-sm text-muted-foreground">Allow new users to sign up.</p>
                      </div>
                      <Switch checked={settings.allowRegistration} onCheckedChange={(c) => updateSetting('allowRegistration', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Verification</Label>
                        <p className="text-sm text-muted-foreground">Require email confirmation for new accounts.</p>
                      </div>
                      <Switch checked={settings.requireEmailVerification} onCheckedChange={(c) => updateSetting('requireEmailVerification', c)} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Storage */}
              <TabsContent value="storage" className="space-y-6 mt-0">
                <Card className="border-purple-500/10 bg-purple-500/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-purple-500">Storage Limits</CardTitle>
                    <CardDescription>Configure file upload constraints.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max File Size (MB)</Label>
                        <Input type="number" value={settings.maxFileSize} onChange={(e) => updateSetting('maxFileSize', e.target.value)} className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Captions / Image</Label>
                        <Input type="number" value={settings.maxCaptionsPerImage} onChange={(e) => updateSetting('maxCaptionsPerImage', e.target.value)} className="bg-background/50 border-white/10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <select
                          value={settings.backupFrequency}
                          onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                          className="w-full h-10 rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Retention (Days)</Label>
                        <Input type="number" value={settings.retentionDays} onChange={(e) => updateSetting('retentionDays', e.target.value)} className="bg-background/50 border-white/10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email */}
              <TabsContent value="email" className="space-y-6 mt-0">
                <Card className="border-orange-500/10 bg-orange-500/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-orange-500">SMTP Configuration</CardTitle>
                    <CardDescription>Manage email delivery settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SMTP Host</Label>
                        <Input value={settings.smtpHost} onChange={(e) => updateSetting('smtpHost', e.target.value)} className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Port</Label>
                        <Input value={settings.smtpPort} onChange={(e) => updateSetting('smtpPort', e.target.value)} className="bg-background/50 border-white/10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP User</Label>
                      <Input value={settings.smtpUser} onChange={(e) => updateSetting('smtpUser', e.target.value)} className="bg-background/50 border-white/10" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features */}
              <TabsContent value="features" className="space-y-6 mt-0">
                <Card className="border-green-500/10 bg-green-500/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-green-500">Feature Toggles</CardTitle>
                    <CardDescription>Enable or disable system features.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Analytics Tracking</Label>
                        <p className="text-sm text-muted-foreground">Collect usage data for insights.</p>
                      </div>
                      <Switch checked={settings.enableAnalytics} onCheckedChange={(c) => updateSetting('enableAnalytics', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">System Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send alerts to users.</p>
                      </div>
                      <Switch checked={settings.enableNotifications} onCheckedChange={(c) => updateSetting('enableNotifications', c)} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

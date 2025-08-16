'use client';
export const dynamic = 'force-dynamic';


import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Settings, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const { status } = useSession({ required: true });
  
  // Account states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Password states
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification states
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // App settings states
  const [defaultMood, setDefaultMood] = useState('Witty');
  const [language, setLanguage] = useState('English (US)');
  const [savingAppSettings, setSavingAppSettings] = useState(false);
  const [appSettingsError, setAppSettingsError] = useState('');
  const [appSettingsSuccess, setAppSettingsSuccess] = useState('');

  // Active sidebar item
  const [activeSection, setActiveSection] = useState('Account');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.data.username || 'emma.wilson');
          setEmail(data.data.email || 'emma.wilson@email.com');
        }
      } catch (e) {
        console.error('Failed to load user', e);
      }
    };
    if (status === 'authenticated') loadUserData();
  }, [status]);

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    setAccountError('');
    setAccountSuccess('');
    
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountError(data.message || 'Unable to update your profile.');
      } else {
        setAccountSuccess('Account information updated successfully!');
      }
    } catch (err) {
      setAccountError('Network error. Please try again.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = () => {
    // This would open a modal or navigate to password reset
    window.location.href = '/reset-password';
  };

  const handleSaveAppSettings = async () => {
    setSavingAppSettings(true);
    setAppSettingsError('');
    setAppSettingsSuccess('');
    
    try {
      // Simulate API call for app settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppSettingsSuccess('App settings saved successfully!');
    } catch (err) {
      setAppSettingsError('Failed to save app settings. Please try again.');
    } finally {
      setSavingAppSettings(false);
    }
  };

  if (status === 'loading') return null;

  const sidebarItems = [
    { id: 'Account', label: 'Account', icon: User },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Integrations', label: 'Integrations', icon: Zap },
    { id: 'App Settings', label: 'App Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {sidebarItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'Account' && (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Account Information</h2>
                    <p className="text-muted-foreground text-sm">Update your account details.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Username */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium">Username</label>
                      <div className="md:col-span-2">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="md:col-span-2">
                        <Input
                          value={email}
                          disabled
                          className="bg-muted/50"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium">Password</label>
                      <div className="md:col-span-2">
                        <Button 
                          variant="outline" 
                          onClick={handleChangePassword}
                          className="text-primary"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {accountError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{accountError}</p>
                      </div>
                    )}

                    {accountSuccess && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-500">{accountSuccess}</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveAccount}
                        disabled={savingAccount}
                      >
                        {savingAccount ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'Notifications' && (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                    <p className="text-muted-foreground text-sm">Manage how you receive notifications.</p>
                  </div>

                  <div className="space-y-6">
                    {/* App Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div>
                        <p className="font-medium">App Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications about new features and updates.</p>
                      </div>
                      <Switch
                        checked={appNotifications}
                        onCheckedChange={setAppNotifications}
                      />
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Get emails about your account activity and new features.</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'Integrations' && (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Integrations</h2>
                    <p className="text-muted-foreground text-sm">Connect your social media accounts.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Social Media */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div>
                        <p className="font-medium">Social Media</p>
                        <p className="text-sm text-muted-foreground">Connect accounts for seamless caption sharing.</p>
                      </div>
                      <Button variant="outline">Connect Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'App Settings' && (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">App Settings</h2>
                    <p className="text-muted-foreground text-sm">Configure default settings for the application.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Default Mood */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium">Default Mood</label>
                      <div className="md:col-span-2">
                        <Select value={defaultMood} onValueChange={setDefaultMood}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Witty">Witty</SelectItem>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Casual">Casual</SelectItem>
                            <SelectItem value="Funny">Funny</SelectItem>
                            <SelectItem value="Inspirational">Inspirational</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium">Language</label>
                      <div className="md:col-span-2">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English (US)">English (US)</SelectItem>
                            <SelectItem value="English (UK)">English (UK)</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {appSettingsError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{appSettingsError}</p>
                      </div>
                    )}

                    {appSettingsSuccess && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-500">{appSettingsSuccess}</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveAppSettings}
                        disabled={savingAppSettings}
                      >
                        {savingAppSettings ? 'Saving...' : 'Save App Settings'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

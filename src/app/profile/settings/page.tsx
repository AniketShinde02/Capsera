'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Save, Bell, Mail, Globe, Shield, Smartphone, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { data: session } = useSession();
    // const { toast } = useToast(); // Removed toast
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: false,
        weeklyDigest: true,
        language: 'en',
        timezone: 'UTC',
        autoSave: true,
        showTips: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data.userSettings) {
                        setSettings(data.data.userSettings);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userSettings: settings })
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Settings saved successfully' });
                setTimeout(() => setStatus(null), 3000);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Quick Links (Optional, or just main settings) */}
                {/* For now, we'll use a 2-column layout for settings groups */}

                {/* Notifications Section */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Notifications</CardTitle>
                                    <CardDescription>Manage how you receive updates.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                                </div>
                                <Switch
                                    id="email-notifications"
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive real-time alerts in your browser</p>
                                </div>
                                <Switch
                                    id="push-notifications"
                                    checked={settings.pushNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="marketing-emails" className="text-base font-medium">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">Receive news, updates, and special offers</p>
                                </div>
                                <Switch
                                    id="marketing-emails"
                                    checked={settings.marketingEmails}
                                    onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences Section */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">App Preferences</CardTitle>
                                    <CardDescription>Customize your experience.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                                        <SelectTrigger id="language" className="bg-background/50 border-border/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                                        <SelectTrigger id="timezone" className="bg-background/50 border-border/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="EST">Eastern Time</SelectItem>
                                            <SelectItem value="PST">Pacific Time</SelectItem>
                                            <SelectItem value="IST">India Standard Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-save" className="text-base font-medium">Auto-save Captions</Label>
                                    <p className="text-sm text-muted-foreground">Automatically save generated content to history</p>
                                </div>
                                <Switch
                                    id="auto-save"
                                    checked={settings.autoSave}
                                    onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Summary / Actions */}
                <motion.div variants={item} className="lg:col-span-1 space-y-6">
                    <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Save Changes</CardTitle>
                            <CardDescription>
                                Review your changes before saving.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                            {status && (
                                <div className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {status.type === 'success' ? (
                                        <Save className="w-4 h-4" />
                                    ) : (
                                        <Shield className="w-4 h-4" />
                                    )}
                                    {status.message}
                                </div>
                            )}
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Last saved: Just now
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start" onClick={() => window.open('mailto:support@capsera.com')}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact Support
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                                <Shield className="mr-2 h-4 w-4" />
                                Privacy Policy
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

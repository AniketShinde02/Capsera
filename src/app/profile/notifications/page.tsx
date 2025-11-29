'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Heart, Star, Zap, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
    // const { toast } = useToast(); // Removed toast
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [notifications, setNotifications] = useState({
        email: {
            marketing: false,
            security: true,
            updates: true,
            newsletter: false
        },
        push: {
            comments: true,
            likes: false,
            mentions: true,
            newFollowers: true
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data.notificationSettings) {
                        setNotifications(data.data.notificationSettings);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
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
                body: JSON.stringify({ notificationSettings: notifications })
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Notification preferences saved' });
                setTimeout(() => setStatus(null), 3000);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save preferences' });
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
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground mt-1">
                    Choose what you want to be notified about.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Notifications */}
                <motion.div variants={item}>
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Email Notifications</CardTitle>
                                    <CardDescription>Manage your email preferences.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="security-emails" className="text-base font-medium">Security Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Login alerts and security updates</p>
                                </div>
                                <Switch
                                    id="security-emails"
                                    checked={notifications.email.security}
                                    disabled // Always on
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="updates-emails" className="text-base font-medium">Product Updates</Label>
                                    <p className="text-sm text-muted-foreground">News about new features and improvements</p>
                                </div>
                                <Switch
                                    id="updates-emails"
                                    checked={notifications.email.updates}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: { ...notifications.email, updates: checked } })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="newsletter-emails" className="text-base font-medium">Weekly Newsletter</Label>
                                    <p className="text-sm text-muted-foreground">Tips, trends, and inspiration</p>
                                </div>
                                <Switch
                                    id="newsletter-emails"
                                    checked={notifications.email.newsletter}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: { ...notifications.email, newsletter: checked } })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Push Notifications */}
                <motion.div variants={item}>
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Push Notifications</CardTitle>
                                    <CardDescription>Real-time alerts in your browser.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="comments-push" className="text-base font-medium">Comments</Label>
                                        <p className="text-sm text-muted-foreground">When someone comments on your post</p>
                                    </div>
                                </div>
                                <Switch
                                    id="comments-push"
                                    checked={notifications.push.comments}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: { ...notifications.push, comments: checked } })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="likes-push" className="text-base font-medium">Likes</Label>
                                        <p className="text-sm text-muted-foreground">When someone likes your caption</p>
                                    </div>
                                </div>
                                <Switch
                                    id="likes-push"
                                    checked={notifications.push.likes}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: { ...notifications.push, likes: checked } })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="mentions-push" className="text-base font-medium">Mentions</Label>
                                        <p className="text-sm text-muted-foreground">When someone mentions you</p>
                                    </div>
                                </div>
                                <Switch
                                    id="mentions-push"
                                    checked={notifications.push.mentions}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: { ...notifications.push, mentions: checked } })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={item} className="flex justify-end items-center gap-4">
                {status && (
                    <div className={`flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-right-5 ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {status.type === 'success' ? (
                            <Save className="w-4 h-4" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        {status.message}
                    </div>
                )}
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                        </>
                    )}
                </Button>
            </motion.div>
        </motion.div>
    );
}

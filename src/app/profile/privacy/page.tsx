'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, Globe, Activity, Database, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { InlineMessage } from '@/components/ui/inline-message';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
    const [privacy, setPrivacy] = useState({
        profilePublic: true,
        showEmail: false,
        showActivity: true,
        allowIndexing: true,
        dataCollection: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data.privacySettings) {
                        setPrivacy(data.data.privacySettings);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch privacy settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setStatus({ type: 'loading', message: 'Saving privacy settings...' });
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privacySettings: privacy })
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Privacy settings updated successfully!' });
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to update privacy settings. Please try again.' });
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
                <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
                <p className="text-muted-foreground mt-1">
                    Control how your information is shared and used.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Visibility</CardTitle>
                                    <CardDescription>Manage who can see your profile and activity.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="profile-public" className="text-base font-medium">Public Profile</Label>
                                        <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                                    </div>
                                </div>
                                <Switch
                                    id="profile-public"
                                    checked={privacy.profilePublic}
                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, profilePublic: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-activity" className="text-base font-medium">Show Activity</Label>
                                        <p className="text-sm text-muted-foreground">Let others see your recent generations</p>
                                    </div>
                                </div>
                                <Switch
                                    id="show-activity"
                                    checked={privacy.showActivity}
                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showActivity: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow-indexing" className="text-base font-medium">Search Engine Indexing</Label>
                                        <p className="text-sm text-muted-foreground">Allow search engines to show your profile</p>
                                    </div>
                                </div>
                                <Switch
                                    id="allow-indexing"
                                    checked={privacy.allowIndexing}
                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, allowIndexing: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Data Usage</CardTitle>
                                    <CardDescription>Control how we use your data.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="data-collection" className="text-base font-medium">Analytics & Improvement</Label>
                                    <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</p>
                                </div>
                                <Switch
                                    id="data-collection"
                                    checked={privacy.dataCollection}
                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, dataCollection: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="lg:col-span-1 space-y-6">
                    <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm border-emerald-500/20">
                        <CardHeader>
                            <CardTitle>Privacy Commitment</CardTitle>
                            <CardDescription>
                                We take your privacy seriously. Your personal data is encrypted and never sold to third parties.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Privacy Settings
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

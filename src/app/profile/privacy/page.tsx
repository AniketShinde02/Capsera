'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

export default function PrivacyPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [privacy, setPrivacy] = useState({
        profilePublic: true,
        showEmail: false,
        showActivity: true,
        allowIndexing: true,
        dataCollection: true,
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: 'Success',
                description: 'Privacy settings updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update privacy settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
                <p className="text-muted-foreground mt-2">
                    Control your privacy and data settings.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                        Manage who can see your information and activity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="profile-public">Public Profile</Label>
                            <p className="text-sm text-muted-foreground">
                                Make your profile visible to everyone
                            </p>
                        </div>
                        <Switch
                            id="profile-public"
                            checked={privacy.profilePublic}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, profilePublic: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-email">Show Email</Label>
                            <p className="text-sm text-muted-foreground">
                                Display your email address on your profile
                            </p>
                        </div>
                        <Switch
                            id="show-email"
                            checked={privacy.showEmail}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-activity">Show Activity</Label>
                            <p className="text-sm text-muted-foreground">
                                Let others see your recent activity
                            </p>
                        </div>
                        <Switch
                            id="show-activity"
                            checked={privacy.showActivity}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, showActivity: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="allow-indexing">Search Engine Indexing</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow search engines to index your profile
                            </p>
                        </div>
                        <Switch
                            id="allow-indexing"
                            checked={privacy.allowIndexing}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, allowIndexing: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="data-collection">Analytics & Improvement</Label>
                            <p className="text-sm text-muted-foreground">
                                Help us improve by sharing anonymous usage data
                            </p>
                        </div>
                        <Switch
                            id="data-collection"
                            checked={privacy.dataCollection}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, dataCollection: checked })}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
                <p className="text-muted-foreground mt-2">
                    Customize how Capsera looks for you.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                        Select your preferred theme for the interface.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="cursor-pointer">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="cursor-pointer">Dark</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="system" id="system" />
                            <Label htmlFor="system" className="cursor-pointer">System</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineMessage } from '@/components/ui/inline-message';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setStatus({ type: 'loading', message: 'Deleting account...' });
        try {
            const response = await fetch('/api/user', {
                method: 'DELETE',
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Account deleted successfully' });
                await signOut({ redirect: false });
                router.push('/');
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to delete account. Please try again.' });
            setLoading(false);
            setShowDialog(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-10 max-w-2xl mx-auto"
        >
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-red-600">Delete Account</h1>
                <p className="text-muted-foreground">
                    Permanently remove your account and all associated data.
                </p>
            </div>

            {status && (
                <InlineMessage
                    type={status.type}
                    message={status.message}
                    timeout={status.type === 'loading' ? 0 : 4000}
                    onDismiss={() => setStatus(null)}
                    showCloseButton={status.type !== 'loading'}
                />
            )}

            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-red-100 dark:border-red-900/30 bg-red-100/20 dark:bg-red-900/20">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                        <CardTitle className="text-lg">Warning: Irreversible Action</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Deleting your account is <span className="font-bold text-foreground">permanent</span> and cannot be undone.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All your personal information will be wiped.</li>
                            <li>Your generated captions and history will be lost.</li>
                            <li>Your subscription (if any) will be cancelled immediately.</li>
                            <li>You will not be able to recover this account.</li>
                        </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-red-100 dark:border-red-900/30">
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-foreground font-medium">
                                To confirm, type <span className="font-mono font-bold select-all">delete my account</span> below:
                            </Label>
                            <Input
                                id="confirm"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="delete my account"
                                className="border-red-200 focus-visible:ring-red-500"
                            />
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={confirmText !== 'delete my account' || loading}
                            onClick={() => setShowDialog(true)}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Permanently Delete Account
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <Button variant="ghost" onClick={() => router.back()}>
                    Cancel and Go Back
                </Button>
            </div>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent className="border-red-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, delete my account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

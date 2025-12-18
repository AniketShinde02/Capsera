'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Save, User, Mail, Briefcase, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InlineMessage } from '@/components/ui/inline-message';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        title: '',
        bio: '',
        email: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            setFormData({
                username: (session.user as any).username || '',
                title: (session.user as any).title || '',
                bio: (session.user as any).bio || '',
                email: session.user.email || '',
            });
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setStatusMsg({ type: 'error', message: 'Please upload an image file (JPG, PNG)' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setStatusMsg({ type: 'error', message: 'Please upload an image smaller than 5MB' });
            return;
        }

        // Preview the image
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setImageFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ type: 'loading', message: 'Updating profile...' });

        try {
            let imageUrl = session?.user?.image;

            // Upload image first if selected
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('Image upload failed');
                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            }

            // Update profile with all data including image
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ...(imageUrl && { image: imageUrl })
                }),
            });

            if (!response.ok) throw new Error('Update failed');

            await update();
            setImagePreview(null);
            setImageFile(null);

            setStatusMsg({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            setStatusMsg({ type: 'error', message: 'Failed to update profile' });
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
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Update your public profile details.
                </p>
            </div>

            {statusMsg && (
                <InlineMessage
                    type={statusMsg.type}
                    message={statusMsg.message}
                    timeout={statusMsg.type === 'loading' ? 0 : 4000}
                    onDismiss={() => setStatusMsg(null)}
                    showCloseButton={statusMsg.type !== 'loading'}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar */}
                <motion.div variants={item} className="lg:col-span-1">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden sticky top-8">
                        <CardHeader className="text-center">
                            <CardTitle>Profile Photo</CardTitle>
                            <CardDescription>
                                Update your profile picture.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pb-8">
                            <div className="relative group">
                                <Avatar className="h-40 w-40 border-4 border-border shadow-xl relative ring-2 ring-primary/20">
                                    <AvatarImage
                                        src={imagePreview || session?.user?.image || ''}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-4xl">
                                        {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                                >
                                    <Camera className="h-5 w-5" />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                            </div>
                            {imagePreview && (
                                <p className="text-xs text-primary mt-4 font-medium">
                                    ✓ New image selected. Click Save to apply.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">
                                Recommended: Square JPG or PNG, at least 800x800px.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Form */}
                <motion.div variants={item} className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Manage your personal details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Enter your username"
                                            className="bg-background/50 border-border/50 focus:bg-background transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                                        Professional Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Content Creator, Photographer"
                                        className="bg-background/50 border-border/50 focus:bg-background transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell us a little about yourself..."
                                        rows={5}
                                        className="resize-none bg-background/50 border-border/50 focus:bg-background transition-colors"
                                    />
                                    <div className="flex justify-end">
                                        <span className="text-xs text-muted-foreground">
                                            {formData.bio.length} / 500 characters
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border/50">
                                    <Button
                                        type="submit"
                                        disabled={loading}
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
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}

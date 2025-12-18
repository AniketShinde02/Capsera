'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Play,
    Image as ImageIcon,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Camera,
    Save,
    X,
    AlertCircle,
    CheckCircle2,
    Trash2,
    AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { InlineMessage } from '@/components/ui/inline-message';
import { getDisplayUsername } from '@/lib/username-generator';

interface Post {
    _id: string;
    image: string;
    captions: string[];
    mood: string;
    createdAt: string;
}

export default function ProfileDashboard() {
    const { data: session, status: sessionStatus, update } = useSession();
    const router = useRouter();
    // const { toast } = useToast(); // Removed toast
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [recentPage, setRecentPage] = useState(0);

    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
    const [displayUsername, setDisplayUsername] = useState<string>('');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        title: '',
        bio: '',
        image: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/');
        }
    }, [sessionStatus, router]);

    useEffect(() => {
        if (session?.user) {
            fetchUserProfile();
            fetchPosts();
        }
    }, [session]);

    // Set display username after mount to avoid hydration mismatch
    useEffect(() => {
        if (formData.username || formData.email) {
            setDisplayUsername(getDisplayUsername(formData.username, formData.email));
        }
    }, [formData.username, formData.email]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const data = await response.json();
                const user = data.data;
                setFormData({
                    username: user.username || session?.user?.name || '',
                    email: user.email || session?.user?.email || '',
                    title: user.title || '',
                    bio: user.bio || '',
                    image: user.image || session?.user?.image || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Fallback to session data
            if (session?.user) {
                const user = session.user as any;
                setFormData({
                    username: user.username || user.name || '',
                    email: user.email || '',
                    title: user.title || '',
                    bio: user.bio || '',
                    image: user.image || ''
                });
            }
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Fetched posts:', data.data);
                setPosts(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status) setStatus(null); // Clear status on input
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Instant preview (optimistic UI)
        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: objectUrl }));
        setPendingImageFile(file); // Store for later upload
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        setPendingImageFile(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatus(null);

        try {
            let finalImageUrl = formData.image;

            // Upload image if there's a pending file
            if (pendingImageFile) {
                setStatus({ type: 'loading', message: 'Uploading image...' });

                const formDataUpload = new FormData();
                formDataUpload.append('file', pendingImageFile);
                formDataUpload.append('folder', 'profile/avatar');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    finalImageUrl = uploadData.url;
                } else {
                    throw new Error('Image upload failed');
                }
            }

            // Update profile with final image URL
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image: finalImageUrl })
            });

            if (response.ok) {
                await update({ ...formData, image: finalImageUrl }); // Update session
                setFormData(prev => ({ ...prev, image: finalImageUrl })); // Update local state with real URL
                setPendingImageFile(null); // Clear pending file
                setIsEditing(false);
                setStatus({ type: 'success', message: 'Profile updated successfully' });
                setTimeout(() => setStatus(null), 3000);
            } else {
                throw new Error('Profile update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            setStatus({ type: 'error', message: 'Failed to update profile' });
            // Revert image on failure
            if (session?.user) {
                const user = session.user as any;
                setFormData(prev => ({ ...prev, image: user.image || '' }));
                setPendingImageFile(null);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (session?.user) {
            const user = session.user as any;
            setFormData({
                username: user.username || '',
                email: user.email || '',
                title: user.title || 'Content Creator',
                bio: user.bio || '',
                image: user.image || ''
            });
        }
        setIsEditing(false);
        setStatus(null);
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    const user = session.user as any;

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal information and view your activity.</p>
                </div>
                <div className="flex items-center gap-4">
                    {status && (
                        <InlineMessage
                            type={status.type}
                            message={status.message}
                            timeout={status.type === 'loading' ? 0 : 4000}
                            onDismiss={() => setStatus(null)}
                            showCloseButton={status.type !== 'loading'}
                        />
                    )}
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Top Section: User Card & Bio Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-1"
                >
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full relative z-10">
                            <div className="mb-2 w-full flex flex-col items-center">
                                {isEditing ? (
                                    <>
                                        <Input
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="text-center text-xl font-bold mb-2 bg-background/50 h-auto py-1"
                                            placeholder="Username"
                                        />
                                        <Input
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="text-center text-xs text-muted-foreground bg-transparent border-none h-auto py-0 shadow-none"
                                            placeholder="Email"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold">{displayUsername || formData.username || 'User'}</h2>
                                        <p className="text-xs text-muted-foreground mt-1">{formData.email}</p>
                                    </>
                                )}
                            </div>


                            <div className="relative my-6 group/avatar">
                                <Avatar
                                    className={cn(
                                        "w-40 h-40 border-4 border-border shadow-xl ring-2 ring-primary/20 transition-all duration-300",
                                        isEditing && "cursor-pointer hover:ring-primary/50 hover:opacity-90"
                                    )}
                                    onClick={handleAvatarClick}
                                >
                                    <AvatarImage src={formData.image || undefined} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary/20 to-purple-500/20">
                                        {user.email?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <div
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer backdrop-blur-sm transition-colors"
                                            onClick={handleAvatarClick}
                                            title="Change Image"
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                        {formData.image && (
                                            <div
                                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full cursor-pointer backdrop-blur-sm transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage();
                                                }}
                                                title="Remove Image"
                                            >
                                                <Trash2 className="w-6 h-6 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {!isEditing && (
                                <div className="w-full mt-auto pt-4">
                                    <Button className="w-full rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Bio & Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Bio & other details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">My Role</p>
                                {isEditing ? (
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="bg-background/50"
                                        placeholder="e.g. Content Creator"
                                    />
                                ) : (
                                    <p className="font-medium text-lg">{formData.title || 'Content Creator'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Experience Level</p>
                                <p className="font-medium text-lg">Intermediate</p>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bio</p>
                                {isEditing ? (
                                    <Textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="bg-background/50 min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="font-medium leading-relaxed text-muted-foreground/90">
                                        {formData.bio || "No bio added yet. Tell us about yourself!"}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">My City or Region</p>
                                <p className="font-medium text-lg">Global</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Availability</p>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 px-3 py-1">
                                    Available for Collaboration
                                </Badge>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tags</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['#Creative', '#Design', '#AI', '#Photography'].map(tag => (
                                        <span key={tag} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Captions (5 Image Grid) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Captions</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md bg-card/50 backdrop-blur-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => setRecentPage(p => Math.max(0, p - 1))}
                                disabled={recentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
                                {recentPage + 1} / {Math.max(1, Math.ceil(posts.length / 5))}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => setRecentPage(p => Math.min(Math.ceil(posts.length / 5) - 1, p + 1))}
                                disabled={recentPage >= Math.ceil(posts.length / 5) - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground ml-2" onClick={() => router.push('/profile/history')}>
                            View All
                        </Button>
                    </div>
                </div>

                {loadingPosts ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {posts.slice(recentPage * 5, (recentPage + 1) * 5).map((post, index) => (
                            <div key={post._id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                                {post.image && post.image.trim() !== '' ? (
                                    <img
                                        src={post.image}
                                        alt="Caption"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            console.error('❌ Image load failed:', post.image);
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            // Fallback content handled by parent div if img is hidden
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div class="flex flex-col items-center justify-center w-full h-full bg-secondary/50 text-muted-foreground">
                                                        <svg class="w-8 h-8 mb-2 opacity-50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                                        <span class="text-[10px] font-medium">Failed to load</span>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50 text-muted-foreground">
                                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-[10px] font-medium">No Image</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white text-xs line-clamp-2 font-medium mb-2">
                                        {post.captions[0] || 'No caption'}
                                    </p>
                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-[10px]">{format(new Date(post.createdAt), 'MMM d')}</span>
                                        <div className="flex gap-2">
                                            <Heart className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                                            <MessageCircle className="w-3 h-3 hover:text-blue-500 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {/* Play button overlay for "video" feel or just interaction */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                                    <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-1">No captions yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start creating amazing captions for your photos.</p>
                            <Button onClick={() => router.push('/create')}>Create Now</Button>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}

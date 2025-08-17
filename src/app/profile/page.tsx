'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Edit, Home, Clock, Settings, Bell, LogOut, Loader2, User, Eye, AlertCircle, CheckCircle, Star, X, Trash2, Copy, MessageSquare, Image as ImageIcon, Crown, Shield, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { IPost } from '@/models/Post';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InlineMessage } from '@/components/ui/inline-message';
import ProfileDeletion from '@/components/ProfileDeletion';

// Note: Client components cannot use server-side exports like dynamic/revalidate
// The component will be dynamic by default since it uses useSession

export default function ProfilePage() {
    const { toast } = useToast();
    const { data: session, status } = useSession({
        required: false, // Don't force authentication
    });

    const sessionStatus = status || 'loading';
    const sessionData = session || null;

    // State management
    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [expandedCaptionId, setExpandedCaptionId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [savingProfile, setSavingProfile] = useState<boolean>(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileImage, setProfileImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDataRecovery, setShowDataRecovery] = useState(false);
    const [recoveryReason, setRecoveryReason] = useState('');
    const [recoveryDetails, setRecoveryDetails] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [stats, setStats] = useState({
        captionsGenerated: 0,
        mostUsedMood: 'None',
        averageLength: 0,
        totalImages: 0
    });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    
    // Pagination state for captions
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const captionsPerPage = 3; // 3 captions per row for desktop (3x1)
    const mobileCaptionsPerPage = 2; // 2 captions for mobile
    
    const profileImageInputRef = useRef<HTMLInputElement>(null);

    // Check if user is admin
    const isAdmin = sessionData?.user?.role?.name === 'admin' || sessionData?.user?.isAdmin === true;

    // Mobile detection effect
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Restore profile image from localStorage on mount
    useEffect(() => {
        if (!profileImage && !imageUrl) {
            const localImage = localStorage.getItem('profileImage');
            if (localImage) {
                setImageUrl(localImage);
                setProfileImage(localImage);
            }
        }
    }, [profileImage, imageUrl]);

    useEffect(() => {
        const fetchData = async () => {
            if (sessionData?.user?.id) {
                setIsLoadingPosts(true);
                try {
                    const [postsRes, userRes] = await Promise.all([
                        fetch('/api/posts'),
                        fetch('/api/user'),
                    ]);
                    
                    if (postsRes.ok) {
                        const p = await postsRes.json();
                        setPosts(p.data || []);
                        
                        if (p.data && Array.isArray(p.data)) {
                            const moodCounts: { [key: string]: number } = {};
                            let totalLength = 0;
                            let imageCount = 0;
                            
                            p.data.forEach((post: IPost) => {
                                const mood = post.mood || 'None';
                                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                                if (post.captions && post.captions.length > 0) {
                                    totalLength += post.captions[0].length;
                                }
                                if (post.image) {
                                    imageCount++;
                                }
                            });
                            
                            const mostUsedMood = Object.keys(moodCounts).length > 0 
                                ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b) 
                                : 'None';
                            
                            setStats({
                                captionsGenerated: p.data.length,
                                totalImages: imageCount,
                                averageLength: p.data.length > 0 ? Math.round(totalLength / p.data.length) : 0,
                                mostUsedMood: mostUsedMood
                            });
                        }
                    }
                    
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUsername(userData.username || '');
                        setTitle(userData.title || '');
                        setBio(userData.bio || '');
                        // Use session image if available, otherwise use database image
                        const sessionImage = sessionData?.user?.image;
                        const dbImage = userData.image;
                        const finalImage = sessionImage || dbImage;
                        
                        setImageUrl(finalImage || '');
                        setProfileImage(finalImage || '');
                        
                        // If no image from session/database, try localStorage
                        if (!finalImage) {
                            const localImage = localStorage.getItem('profileImage');
                            if (localImage) {
                                setImageUrl(localImage);
                                setProfileImage(localImage);
                            }
                        }
                    }
                } catch (error) {
                    // Error handled silently for production
                } finally {
                    setIsLoadingPosts(false);
                }
            }
        };
        
        fetchData();
    }, [sessionData?.user?.id]);

    if (sessionStatus === 'loading' || !sessionData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!sessionData?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access your profile.</p>
                    <Link href="/" className="text-indigo-700 dark:text-indigo-400 font-medium">
                        Go back to home
                    </Link>
                </div>
            </div>
        );
    }

    const userEmail = sessionData?.user?.email || 'user@example.com';
    const fallbackName = userEmail ? userEmail.split('@')[0] : 'User';
    const displayName = username || fallbackName;
    const userJoined = '2022'; // Default year since createdAt might not be available

    // Profile functions
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileError('');
        setProfileSuccess('');
        
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, title, bio, image: imageUrl })
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setProfileError(data.message || 'Failed to update profile.');
            } else {
                setProfileSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setProfileError('Network error. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancel = async () => {
        setProfileError('');
        setProfileSuccess('');
        try {
            const res = await fetch('/api/user');
            if (res.ok) {
                const u = await res.json();
                setUsername(u.data.username || '');
                setTitle(u.data.title || '');
                setBio(u.data.bio || '');
                setImageUrl(u.data.image || '');
                setProfileImage(u.data.image || '');
            }
                    } catch (err) {
                // Error handled silently for production
            }
    };

    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            setInlineMessage({ type: 'error', message: 'Please select an image file.' });
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            setInlineMessage({ type: 'error', message: 'Please select an image smaller than 5MB.' });
            return;
        }
        
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadRes.ok) {
                throw new Error(uploadData.message || 'Upload failed');
            }
            
            const imageUrl = uploadData.url;
            const updateRes = await fetch('/api/user/profile-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
            
            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                throw new Error(updateData.message || 'Failed to update profile image');
            }
            
            setProfileImage(imageUrl);
            setImageUrl(imageUrl);
            
            // Store in localStorage as backup for session persistence
            localStorage.setItem('profileImage', imageUrl);
            
            setInlineMessage({ type: 'success', message: 'Your profile image has been successfully updated.' });
        } catch (error) {
            setInlineMessage({ type: 'error', message: 'Failed to update profile image. Please try again.' });
        } finally {
            setUploadingImage(false);
            if (profileImageInputRef.current) {
                profileImageInputRef.current.value = '';
            }
        }
    };

    const removeProfileImage = async () => {
        try {
            const res = await fetch('/api/user/profile-image', { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to remove profile image');
            }
            setProfileImage('');
            setImageUrl('');
            
            // Remove from localStorage
            localStorage.removeItem('profileImage');
            
            setInlineMessage({ type: 'success', message: 'Your profile image has been removed.' });
        } catch (error) {
            setInlineMessage({ type: 'error', message: 'Failed to remove profile image. Please try again.' });
        }
    };

    const handleDataRecoveryRequest = async () => {
        try {
            const response = await fetch('/api/user/data-recovery-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: recoveryReason,
                    details: recoveryDetails,
                    contactEmail: contactEmail || sessionData?.user?.email,
                }),
            });
            
            if (response.ok) {
                setInlineMessage({
                    type: 'success',
                    message: "We've received your data recovery request. Our team will review it and contact you within 24-48 hours."
                });
                setRecoveryReason('');
                setRecoveryDetails('');
                setContactEmail('');
                setShowDataRecovery(false);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit recovery request');
            }
        } catch (error: any) {
            setInlineMessage({
                type: 'error',
                message: error.message || 'Failed to submit recovery request. Please try again.'
            });
        }
    };

    const handleDeleteCaption = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this caption? This action cannot be undone.')) {
            return;
        }
        
        setIsDeleting(postId);
        
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                // Remove from local state
                setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
                // Update stats
                setStats(prev => ({
                    ...prev,
                    captionsGenerated: Math.max(0, prev.captionsGenerated - 1)
                }));
            } else {
                toast({
                    title: "Delete Failed",
                    description: "Failed to delete caption. Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Delete Error",
                description: "Failed to delete caption. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(null);
        }
    };

    // Pagination logic - Different for mobile vs desktop
    const currentCaptionsPerPage = isMobile ? mobileCaptionsPerPage : captionsPerPage;
    const startIndex = (currentPage - 1) * currentCaptionsPerPage;
    const displayedCaptions = posts.slice(startIndex, startIndex + currentCaptionsPerPage);
    const totalPages = Math.ceil(posts.length / currentCaptionsPerPage);
    const hasMoreCaptions = currentPage < totalPages;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-1 sm:px-3 py-4 sm:py-6 lg:py-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Enhanced Header Section - Mobile Optimized */}
                    <div className="mb-6 sm:mb-8 lg:mb-12">
                        {/* Welcome Header - Stack on Mobile */}
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                                {/* Profile Avatar - Smaller on Mobile */}
                                <div className="relative">
                                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 xl:w-28 xl:h-28 border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-indigo-100 dark:ring-indigo-900/30">
                                        {profileImage ? (
                                            <AvatarImage 
                                                src={profileImage} 
                                                alt={`${displayName}'s avatar`}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
                                                {displayName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    
                                    {/* Admin Crown Badge */}
                                    {isAdmin && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
                                            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                    )}
                                    
                                    {/* Online Status Indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full"></div>
                                    </div>
                                    
                                    {/* Upload Overlay */}
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/60 rounded-full cursor-pointer group"
                                        onClick={() => profileImageInputRef.current?.click()}
                                    >
                                        {uploadingImage ? (
                                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white animate-spin" />
                                        ) : (
                                            <Edit className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white group-hover:scale-110 transition-transform duration-200" />
                                        )}
                                    </div>
                                    
                                    {/* Hidden file input */}
                                    <input
                                        ref={profileImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                
                                {/* User Info - Centered on Mobile */}
                                <div className="text-center sm:text-left space-y-2">
                                    <div className="space-y-1">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                            Hi {displayName},
                                        </h1>
                                        <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                            {isAdmin ? 'Admin Dashboard' : 'Welcome back!'}
                                        </h2>
                                    </div>
                                    
                                    {title && (
                                        <p className="text-base sm:text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                                            {title}
                                        </p>
                                    )}
                                    
                                    {/* Badges - Stack on Mobile */}
                                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        <span className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 dark:bg-slate-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Joined in {userJoined}
                                        </span>
                                        <span className="flex items-center gap-1.5 sm:gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-indigo-700 dark:text-indigo-300">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {stats.captionsGenerated} captions
                                        </span>
                                        {isAdmin && (
                                            <span className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-yellow-700 dark:text-yellow-300">
                                                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                                                Admin
                                            </span>
                                        )}
                                        
                                        {/* Admin Dashboard Button */}
                                        {isAdmin && (
                                            <Link 
                                                href="/admin/dashboard"
                                                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/60 dark:hover:to-blue-800/60 transition-all duration-200 cursor-pointer"
                                            >
                                                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        {/* Quick Actions Bar - 2x2 Grid Layout - Mobile Only */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 lg:hidden w-[90%] mx-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('recent-captions')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 h-9 sm:h-11 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
                            >
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                View History
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = '/settings'}
                                className="border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 h-9 sm:h-11 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
                            >
                                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                Preferences
                            </Button>
                            
                            {/* Admin Dashboard Button - Mobile */}
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.href = '/admin/dashboard'}
                                    className="border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 h-9 sm:h-11 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
                                >
                                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                    Admin Panel
                                </Button>
                            )}
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDataRecovery(true)}
                                className="border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 h-9 sm:h-11 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
                            >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                Data Recovery
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // Double-tap logout: NextAuth + hard-clear + redirect
                                    await signOut({ redirect: false });
                                    await fetch("/logout", { method: "POST" }).catch(() => {});
                                    window.location.replace("/");
                                  } catch (error) {
                                    console.error('Logout error:', error);
                                    window.location.replace("/");
                                  }
                                }}
                                className="border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 h-9 sm:h-11 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
                            >
                                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Left Sidebar - Mobile: 90% width, Desktop: Full */}
                        <div className="w-[90%] mx-auto lg:w-full lg:col-span-1 order-2 lg:order-1">
                            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm lg:sticky lg:top-4">
                                <CardContent className="p-4 lg:p-6">
                                    {/* Navigation */}
                                    <nav className="space-y-2">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                            <User className="w-4 h-4" />
                                            Account
                                        </button>
                                        
                                        {/* Admin Dashboard Navigation */}
                                        {isAdmin && (
                                            <Link 
                                                href="/admin/dashboard"
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                                            >
                                                <Crown className="w-4 h-4" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button 
                                            onClick={() => document.getElementById('recent-captions')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Caption History
                                        </button>
                                        <button 
                                            onClick={() => window.location.href = '/settings'}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Preferences
                                        </button>
                                        <Link href="#" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <Bell className="w-4 h-4" />
                                            Notifications
                                        </Link>
                                        
                                        {/* Desktop Action Buttons */}
                                        <div className="pt-2 space-y-2">
                                            <button 
                                                onClick={() => setShowDataRecovery(true)}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Data Recovery
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                  try {
                                                    // Double-tap logout: NextAuth + hard-clear + redirect
                                                    await signOut({ redirect: false });
                                                    await fetch("/logout", { method: "POST" }).catch(() => {});
                                                    window.location.replace("/");
                                                  } catch (error) {
                                                    console.error('Logout error:', error);
                                                    window.location.replace("/");
                                                  }
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </nav>
                                    
                                    {/* Profile Image Actions */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <div className="flex gap-2 justify-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => profileImageInputRef.current?.click()}
                                                disabled={uploadingImage}
                                                className="text-xs border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-indigo-700 dark:text-indigo-300"
                                            >
                                                {uploadingImage ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit className="w-3 h-3 mr-1" />
                                                        {profileImage ? 'Change' : 'Add'} Photo
                                                    </>
                                                )}
                                            </Button>
                                            {profileImage && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={removeProfileImage}
                                                    className="text-xs border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content - Full Width on Mobile */}
                        <div className="lg:col-span-3 order-1 lg:order-2 space-y-4 sm:space-y-6 w-full">
                            
                            {/* Profile Settings */}
                            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm w-[90%] mx-auto lg:w-full">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h3>
                                    </div>
                                    
                                    <div className="grid gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter username"
                                                className="border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                            <Input
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter your title"
                                                className="border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                                            <Textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Tell us about yourself..."
                                                rows={3}
                                                className="border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>
                                        
                                        {profileError && (
                                            <p className="text-red-600 dark:text-red-400 text-sm">{profileError}</p>
                                        )}
                                        {profileSuccess && (
                                            <p className="text-green-600 dark:text-green-400 text-sm">{profileSuccess}</p>
                                        )}
                                        
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <Button 
                                                onClick={handleSaveProfile}
                                                disabled={savingProfile}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base"
                                            >
                                                {savingProfile ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={handleCancel}
                                                className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Usage Statistics - Mobile Optimized Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-[90%] mx-auto lg:w-full">
                                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
                                    <CardContent className="p-3 sm:p-4 text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.captionsGenerated}</p>
                                        <p className="text-indigo-100 text-xs sm:text-sm">Captions</p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
                                    <CardContent className="p-3 sm:p-4 text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalImages}</p>
                                        <p className="text-purple-100 text-xs sm:text-sm">Images</p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
                                    <CardContent className="p-3 sm:p-4 text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.mostUsedMood}</p>
                                        <p className="text-green-100 text-xs sm:text-sm">Mood</p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
                                    <CardContent className="p-3 sm:p-4 text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.averageLength}</p>
                                        <p className="text-orange-100 text-xs sm:text-sm">Length</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Caption History - Mobile Optimized */}
                            <div id="recent-captions" className="w-[90%] mx-auto lg:w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Caption History</h3>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm px-3 py-2 h-9 sm:h-10 disabled:opacity-50"
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm px-3 py-2 h-9 sm:h-10 disabled:opacity-50"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {isLoadingPosts ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                                        <p className="text-gray-600 dark:text-gray-400">Loading your captions...</p>
                                    </div>
                                ) : posts.length === 0 ? (
                                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                                        <CardContent className="p-12 text-center">
                                                                                         <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MessageSquare className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Captions Yet</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6">Start generating amazing captions for your images!</p>
                                            <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                                Start Generating
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                                        {displayedCaptions.map((post, index) => (
                                            <Card 
                                                key={post._id} 
                                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
                                            >
                                                <CardContent className="p-0">
                                                    {/* Image Section - Smaller on Mobile */}
                                                    <div className="relative overflow-hidden">
                                                        {post.image && (
                                                            <div className="relative h-32 sm:h-40 lg:h-48 xl:h-56 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
                                                                <Image
                                                                    src={post.image}
                                                                    alt="Generated caption image"
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                {/* Floating Mood Badge - Smaller on Mobile */}
                                                                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 lg:top-3 lg:right-3">
                                                                    <Badge className="bg-indigo-600/90 backdrop-blur-sm text-white border-0 px-1.5 py-0.5 sm:px-2 sm:py-0.5 lg:px-3 lg:py-1 rounded-full text-xs font-medium">
                                                                        {post.mood || 'Unknown'}
                                                                    </Badge>
                                                                </div>
                                                                {/* Floating Date Badge - Smaller on Mobile */}
                                                                <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 lg:bottom-3 lg:left-3">
                                                                    <Badge className="bg-gray-900/80 backdrop-blur-sm text-white border-0 px-1.5 py-0.5 sm:px-2 sm:py-0.5 lg:px-3 lg:py-1 rounded-full text-xs font-medium">
                                                                        {format(new Date(post.createdAt), 'MMM dd')}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Caption Content - Compact Padding */}
                                                    <div className="p-2 sm:p-3 lg:p-4">
                                                        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                                                            {post.captions && post.captions.length > 0 && (
                                                                <div>
                                                                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed">
                                                                        {expandedCaptionId === post._id 
                                                                            ? post.captions[0]
                                                                            : post.captions[0].length > 60 
                                                                                ? `${post.captions[0].substring(0, 60)}...`
                                                                                : post.captions[0]
                                                                        }
                                                                    </p>
                                                                    {post.captions[0].length > 60 && (
                                                                        <button
                                                                            onClick={() => setExpandedCaptionId(expandedCaptionId === post._id ? null : post._id)}
                                                                            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium hover:underline mt-1"
                                                                        >
                                                                            {expandedCaptionId === post._id ? 'Show Less' : 'Read More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {post.description && (
                                                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm italic">
                                                                    "{post.description}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Action Buttons - Compact Design */}
                                                                                                                 <div className="flex items-center justify-between mt-2 sm:mt-3 lg:mt-4 pt-2 sm:pt-3 lg:pt-4 border-t border-gray-100 dark:border-gray-800">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={async (e) => {
                                                                    if (post.captions && post.captions.length > 0) {
                                                                        try {
                                                                            await navigator.clipboard.writeText(post.captions[0]);
                                                                            // Show success feedback
                                                                            const button = e.currentTarget;
                                                                            if (button && button.textContent !== null) {
                                                                                const originalText = button.textContent;
                                                                                button.textContent = 'Copied!';
                                                                                button.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
                                                                                setTimeout(() => {
                                                                                    if (button && button.textContent !== null) {
                                                                                        button.textContent = originalText;
                                                                                        button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
                                                                                    }
                                                                                }, 1500);
                                                                            }
                                                                        } catch (error) {
                                                                            // Fallback for older browsers
                                                                            const textArea = document.createElement('textarea');
                                                                            textArea.value = post.captions[0];
                                                                            document.body.appendChild(textArea);
                                                                            textArea.select();
                                                                            document.execCommand('copy');
                                                                            document.body.removeChild(textArea);
                                                                            
                                                                            // Show success feedback
                                                                            const button = e.currentTarget;
                                                                            if (button && button.textContent !== null) {
                                                                                const originalText = button.textContent;
                                                                                button.textContent = 'Copied!';
                                                                                button.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
                                                                                setTimeout(() => {
                                                                                    if (button && button.textContent !== null) {
                                                                                        button.textContent = originalText;
                                                                                        button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
                                                                                    }
                                                                                }, 1500);
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-xs border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-1.5 group hover:scale-105"
                                                            >
                                                                <Copy className="w-3 h-3 transition-transform duration-300 group-hover:rotate-12" />
                                                                Copy
                                                            </Button>
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDeleteCaption(post._id)}
                                                                disabled={isDeleting === post._id}
                                                                className="text-xs border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-1.5 relative"
                                                            >
                                                                {isDeleting === post._id ? (
                                                                    <>
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                        <span>Deleting...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Trash2 className="w-3 h-3" />
                                                                        <span>Delete</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                

                            </div>

                            {/* Profile Deletion */}
                            <ProfileDeletion userEmail={userEmail} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Recovery Dialog - Mobile Optimized */}
            <Dialog open={showDataRecovery} onOpenChange={setShowDataRecovery}>
                <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-sm sm:max-w-md mx-4">
                    <DialogHeader className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Data Recovery Request</DialogTitle>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Tell us what you need help with</p>
                    </DialogHeader>
                    <div className="grid gap-4 sm:gap-6 py-4 sm:py-6">
                        <div className="grid gap-2 sm:gap-3">
                            <label htmlFor="recoveryReason" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reason for Recovery</label>
                            <select
                                id="recoveryReason"
                                value={recoveryReason}
                                onChange={(e) => setRecoveryReason(e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                            >
                                <option value="">Select a reason</option>
                                <option value="Account Access">Account Access</option>
                                <option value="Data Loss">Data Loss</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-2 sm:gap-3">
                            <label htmlFor="recoveryDetails" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Details (Optional)</label>
                            <textarea
                                id="recoveryDetails"
                                value={recoveryDetails}
                                onChange={(e) => setRecoveryDetails(e.target.value)}
                                rows={3}
                                placeholder="Please provide more details about your request..."
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none transition-all duration-200"
                            />
                        </div>
                        <div className="grid gap-2 sm:gap-3">
                            <label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Email (Optional)</label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="Your Email"
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200"
                            />
                        </div>
                    </div>
                    <Button 
                        onClick={handleDataRecoveryRequest} 
                        className="w-full h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                    >
                        Submit Recovery Request
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

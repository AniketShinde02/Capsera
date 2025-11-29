'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Trash2, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, Sparkles, Search, Heart, MessageCircle, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineMessage } from '@/components/ui/inline-message';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Post {
    _id: string;
    image: string;
    captions: string[];
    mood: string;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10; // Adjusted for 5-column grid (2 rows)

export default function HistoryPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchPosts();
    }, [session]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                setPosts(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(posts.filter(p => p._id !== id));
                setStatus({ type: 'success', message: 'Caption deleted successfully' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to delete caption' });
        }
        setDeleteId(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setStatus({ type: 'success', message: 'Copied to clipboard' });
    };

    // Filter posts based on search query
    const filteredPosts = posts.filter(post =>
        (post.captions && Array.isArray(post.captions) && post.captions.some(caption => caption.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (post.mood && post.mood.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">History</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        {posts.length} caption{posts.length !== 1 ? 's' : ''} generated
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search captions..."
                        className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
            </div>

            {status && (
                <InlineMessage
                    type={status.type}
                    message={status.message}
                    timeout={3000}
                    onDismiss={() => setStatus(null)}
                />
            )}

            {/* Content Grid */}
            {filteredPosts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-muted/50 to-muted/10 flex items-center justify-center mb-6 ring-8 ring-muted/20">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No captions found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        {searchQuery ? "Try adjusting your search terms." : "Start generating amazing captions to see them appear here."}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => window.location.href = '/create'} className="rounded-full px-8">
                            Create New
                        </Button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key={currentPage}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                    <AnimatePresence mode='popLayout'>
                        {currentPosts.map((post) => (
                            <motion.div key={post._id} variants={item} layout>
                                <div className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm hover:shadow-md transition-all">
                                    {post.image && post.image.trim() !== '' ? (
                                        <img
                                            src={post.image}
                                            alt="Generated content"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
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
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 text-yellow-600/70">
                                            <ImageIcon className="h-10 w-10 mb-2" />
                                            <span className="text-xs font-medium">No Image</span>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">

                                        {/* Top Actions */}
                                        <div className="flex justify-end gap-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    post.captions[0] && copyToClipboard(post.captions[0]);
                                                }}
                                                title="Copy Caption"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white border-none backdrop-blur-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteId(post._id);
                                                }}
                                                title="Delete Post"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Bottom Info */}
                                        <div className="translate-y-[10px] group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white text-xs line-clamp-3 font-medium mb-3 leading-relaxed">
                                                {post.captions[0] || 'No caption available'}
                                            </p>
                                            <div className="flex items-center justify-between text-white/80 border-t border-white/20 pt-2">
                                                <span className="text-[10px] font-medium">{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                                <div className="flex gap-2">
                                                    <Heart className="w-3 h-3 hover:text-red-500 cursor-pointer transition-colors" />
                                                    <MessageCircle className="w-3 h-3 hover:text-blue-500 cursor-pointer transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 px-4">
                        <span className="text-sm font-medium text-muted-foreground">
                            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Caption?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this caption from your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border/50 hover:bg-muted/50">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

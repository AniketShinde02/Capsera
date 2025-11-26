'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Trash2, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
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

const ITEMS_PER_PAGE = 9;

export default function HistoryPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, [session]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                console.log('📊 API Response:', data);
                console.log('📊 Posts count:', data.data?.length || 0);
                if (data.data && data.data.length > 0) {
                    console.log('📊 First post:', data.data[0]);
                    console.log('📊 First post image:', data.data[0].image);
                }
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
                toast({
                    title: 'Success',
                    description: 'Caption deleted successfully',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete caption',
                variant: 'destructive',
            });
        }
        setDeleteId(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: 'Caption copied to clipboard',
        });
    };

    const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPosts = posts.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">History</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage all your generated captions.
                    </p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No captions yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                            Start generating captions to see them appear here. Your caption history will be saved for easy access.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">History</h1>
                    <p className="text-muted-foreground mt-2">
                        {posts.length} caption{posts.length !== 1 ? 's' : ''} generated
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPosts.map((post) => (
                    <Card key={post._id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square bg-gray-100">
                            {post.image && post.image.trim() !== '' ? (
                                <img
                                    src={post.image}
                                    alt="Generated content"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onLoad={() => console.log('✅ Image loaded:', post.image)}
                                    onError={(e) => {
                                        console.error('❌ Image FAILED:', post.image);
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                                                <div class="absolute inset-0 flex flex-col items-center justify-center bg-red-100 text-red-600 p-4">
                                                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <span class="text-xs text-center">Image failed to load</span>
                                                </div>
                                            `;
                                        }
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-100 text-yellow-700 p-4">
                                    <ImageIcon className="h-12 w-12 mb-2" />
                                    <span className="text-xs text-center font-semibold">No Image URL</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-10 w-10 rounded-full"
                                    onClick={() => post.captions[0] && copyToClipboard(post.captions[0])}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-10 w-10 rounded-full"
                                    onClick={() => setDeleteId(post._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {post.mood && (
                                <div className="absolute top-3 left-3 z-20">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                        {post.mood}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {post.captions[0] || 'No caption available'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Caption?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this caption from your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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

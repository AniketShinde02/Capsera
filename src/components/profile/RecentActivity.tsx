'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Post {
    _id: string;
    image: string;
    captions: string[];
    mood: string;
    createdAt: string;
}

export function RecentActivity({ posts, loading, onDelete }: { posts: Post[], loading?: boolean, onDelete: (id: string) => void }) {
    const { toast } = useToast();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Caption copied to clipboard",
        });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">Start generating captions to see them here!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Recent Creations</h2>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                    <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                        onMouseEnter={() => setHoveredId(post._id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <Card className="overflow-hidden border-0 bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                {/* Fallback placeholder - always rendered, covered by image if loaded */}
                                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                                    <ImageIcon className="h-12 w-12" />
                                </div>

                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt="Generated content"
                                        className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : null}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-20">
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8 rounded-full shadow-lg"
                                        onClick={() => onDelete(post._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-0">
                                        {post.mood || 'Creative'}
                                    </Badge>
                                </div>

                                <div className="space-y-2 flex-1">
                                    {post.captions.slice(0, 1).map((caption, idx) => (
                                        <div key={idx} className="relative group/caption p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <p className="text-sm text-muted-foreground line-clamp-3 font-medium">
                                                "{caption}"
                                            </p>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/caption:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(caption)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

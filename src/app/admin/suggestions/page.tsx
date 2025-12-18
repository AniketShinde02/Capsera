'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Suggestion {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        username: string;
        image?: string;
    };
    title: string;
    description: string;
    category: 'feature' | 'bug' | 'improvement' | 'other';
    status: 'pending' | 'reviewed' | 'planned' | 'completed' | 'declined';
    createdAt: string;
    adminReply?: string;
    repliedAt?: string;
    reactions?: string[];
}

export default function AdminSuggestionsPage() {
    const { data: session } = useSession();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const res = await fetch('/api/admin/suggestions');
            const data = await res.json();
            if (data.success) {
                setSuggestions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (suggestionId: string) => {
        if (!replyText.trim()) return;

        setReplyStatus('sending');
        try {
            const res = await fetch(`/api/admin/suggestions/${suggestionId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText, status: 'reviewed' }),
            });

            const data = await res.json();
            if (data.success) {
                setReplyStatus('success');
                setSuggestions(prev => prev.map(s =>
                    s._id === suggestionId ? { ...s, adminReply: replyText, repliedAt: new Date().toISOString(), status: 'reviewed' } : s
                ));
                setTimeout(() => {
                    setReplyingTo(null);
                    setReplyText('');
                    setReplyStatus('idle');
                }, 2000);
            } else {
                setReplyStatus('error');
            }
        } catch (error) {
            setReplyStatus('error');
        }
    };

    const handleReaction = async (suggestionId: string, reaction: string) => {
        try {
            const res = await fetch(`/api/admin/suggestions/${suggestionId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reaction }),
            });

            const data = await res.json();
            if (data.success) {
                setSuggestions(prev => prev.map(s =>
                    s._id === suggestionId ? { ...s, reactions: data.data.reactions } : s
                ));
            }
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'reviewed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'planned': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'feature': return '✨';
            case 'bug': return '🐛';
            case 'improvement': return '🚀';
            default: return '💡';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Suggestions</h1>
                <p className="text-muted-foreground">Manage and reply to user suggestions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.length === 0 ? (
                    <Card className="col-span-full bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No suggestions yet</h3>
                            <p className="text-muted-foreground">When users submit suggestions, they will appear here.</p>
                        </CardContent>
                    </Card>
                ) : (
                    suggestions.map((suggestion) => (
                        <motion.div
                            key={suggestion._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group"
                        >
                            <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg transition-all">
                                <CardHeader className="pb-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="outline" className={`${getStatusColor(suggestion.status)} capitalize text-xs`}>
                                            {suggestion.status}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-secondary/50 text-xs">
                                            {getCategoryIcon(suggestion.category)} {suggestion.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base font-semibold line-clamp-2">{suggestion.title}</CardTitle>
                                    <CardDescription className="text-xs">
                                        By <span className="font-medium text-foreground">{suggestion.userId?.name || suggestion.userId?.username || suggestion.userId?.email || 'User'}</span>
                                        <br />
                                        <span className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(suggestion.createdAt), 'MMM d, yyyy')}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                        {suggestion.description}
                                    </p>

                                    {/* Reactions */}
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {['👍', '❤️', '🔥', '🎉', '👀'].map((emoji) => {
                                            const isActive = suggestion.reactions?.includes(emoji);
                                            return (
                                                <Button
                                                    key={emoji}
                                                    variant={isActive ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleReaction(suggestion._id, emoji)}
                                                    className={`h-7 w-7 p-0 transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                                                >
                                                    <span className="text-sm">{emoji}</span>
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {suggestion.adminReply ? (
                                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg space-y-1">
                                            <div className="flex items-center gap-1 text-primary font-medium text-xs">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Admin Reply
                                            </div>
                                            <p className="text-xs text-foreground/90">{suggestion.adminReply}</p>
                                        </div>
                                    ) : (
                                        <div className="pt-1">
                                            {replyingTo === suggestion._id ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        placeholder="Write a reply..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="min-h-[80px] text-sm"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => handleReply(suggestion._id)}
                                                            disabled={replyStatus === 'sending' || !replyText.trim()}
                                                            size="sm"
                                                            className="gap-1"
                                                        >
                                                            {replyStatus === 'sending' ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : replyStatus === 'success' ? (
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            ) : (
                                                                <Send className="w-3 h-3" />
                                                            )}
                                                            {replyStatus === 'sending' ? 'Sending...' : replyStatus === 'success' ? 'Sent!' : 'Send'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setReplyingTo(null);
                                                                setReplyText('');
                                                            }}
                                                            disabled={replyStatus === 'sending'}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(suggestion._id)}
                                                    className="gap-1 w-full"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    Reply
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

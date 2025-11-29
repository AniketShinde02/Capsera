'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Lightbulb, Send, Loader2, Plus, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InlineMessage } from '@/components/ui/inline-message';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Suggestion {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
}

export default function SuggestionsPage() {
    const { data: session } = useSession();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'feature'
    });

    useEffect(() => {
        fetchSuggestions();
    }, [session]);

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('/api/suggestions');
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: 'loading', message: 'Submitting your suggestion...' });

        try {
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions([data.data, ...suggestions]);
                setFormData({ title: '', description: '', category: 'feature' });
                setShowForm(false);
                setStatus({ type: 'success', message: 'Suggestion submitted successfully! We appreciate your feedback.' });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit suggestion. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'planned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'reviewed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bug': return <AlertCircle className="w-4 h-4" />;
            case 'improvement': return <Clock className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Suggestions</h1>
                        <p className="text-muted-foreground mt-1">
                            Help us improve Capsera by sharing your ideas.
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className={showForm ? "bg-secondary text-secondary-foreground" : ""}>
                        {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Suggestion</>}
                    </Button>
                </div>
                {status && (
                    <InlineMessage
                        type={status.type}
                        message={status.message}
                        timeout={status.type === 'loading' ? 0 : 5000}
                        onDismiss={() => setStatus(null)}
                        showCloseButton={status.type !== 'loading'}
                    />
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Submit a Suggestion</CardTitle>
                                <CardDescription>We value your feedback and review every submission.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                placeholder="Brief summary of your idea"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                            >
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="feature">New Feature</SelectItem>
                                                    <SelectItem value="improvement">Improvement</SelectItem>
                                                    <SelectItem value="bug">Bug Report</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Describe your suggestion in detail..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            className="min-h-[100px] bg-background/50"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit Suggestion
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {suggestions.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/10 border-dashed">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <Lightbulb className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No suggestions yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Be the first to share your ideas with us!
                    </p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {suggestions.map((suggestion) => (
                        <motion.div key={suggestion._id} variants={item}>
                            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                {getCategoryIcon(suggestion.category)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base line-clamp-1">{suggestion.title}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                                            {suggestion.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                        {suggestion.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

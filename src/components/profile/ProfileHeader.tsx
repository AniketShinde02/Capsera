'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Edit, Crown, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface UserData {
    username: string;
    email: string;
    image?: string;
    bio?: string;
    title?: string;
    createdAt?: string | Date;
    role?: { name: string };
    isAdmin?: boolean;
}

export function ProfileHeader({ user, loading }: { user: UserData | null; loading?: boolean }) {
    if (loading || !user) {
        return (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-4 w-64 bg-muted rounded" />
                </div>
            </div>
        );
    }

    const joinDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Unknown';
    const isAdmin = user.isAdmin || user.role?.name === 'admin';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10"
        >
            {/* Banner/Cover Image (Optional - using gradient for now) */}
            <div className="h-32 md:h-48 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 absolute top-0 left-0 -z-10" />

            <div className="pt-16 md:pt-24 px-4 md:px-8 flex flex-col md:flex-row gap-6 items-start md:items-end">
                <div className="relative">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-xl ring-4 ring-background/50">
                        <AvatarImage src={user.image} alt={user.username} className="object-cover" />
                        <AvatarFallback className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full border-4 border-background shadow-lg" title="Admin">
                            <Crown className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2 mb-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{user.username || 'User'}</h1>
                        <div className="flex gap-2">
                            {isAdmin && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">Admin</Badge>}
                            <Badge variant="outline" className="border-indigo-500/20 text-indigo-600 bg-indigo-500/5">Pro Member</Badge>
                        </div>
                    </div>

                    {user.title && (
                        <p className="text-lg text-muted-foreground font-medium">{user.title}</p>
                    )}

                    {user.bio && (
                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {joinDate}
                        </div>
                        {/* Placeholder for location or website if added later */}
                        {/* <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              San Francisco, CA
            </div> */}
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Link href="/profile/settings" className="w-full md:w-auto">
                        <Button variant="outline" className="w-full gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </Link>
                    <Button variant="default" className="w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Crown className="w-4 h-4" />
                        Upgrade
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

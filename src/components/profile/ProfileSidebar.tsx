'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    UserCog,
    History,
    Settings,
    LogOut,
    Bell,
    Shield,
    Home,
    Sparkles,
    Trash2,
    Lock,
    Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const menuItems = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', href: '/profile', icon: LayoutDashboard },
            { name: 'History', href: '/profile/history', icon: History },
        ]
    },
    {
        title: 'Account',
        items: [
            { name: 'Edit Profile', href: '/profile/edit', icon: UserCog },
            { name: 'Settings', href: '/profile/settings', icon: Settings },
            { name: 'Notifications', href: '/profile/notifications', icon: Bell },
            { name: 'Suggestions', href: '/profile/suggestions', icon: Lightbulb },
            { name: 'Privacy', href: '/profile/privacy', icon: Shield },
            { name: 'Password', href: '/profile/password', icon: Lock },
            { name: 'Delete Account', href: '/profile/delete-account', icon: Trash2 },
        ]
    }
];

interface ProfileSidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function ProfileSidebar({ className, onNavigate }: ProfileSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const handleNavigation = (href: string) => {
        router.push(href);
        onNavigate?.();
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
        onNavigate?.();
    };

    return (
        <div className={cn("w-72 h-screen bg-background/95 backdrop-blur-xl border-r border-border/40 flex flex-col", className)}>
            {/* Header / User Info */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative group cursor-pointer" onClick={() => handleNavigation('/profile')}>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200" />
                        <Avatar className="h-12 w-12 relative border-2 border-background">
                            <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                            <AvatarFallback className="bg-zinc-900 text-zinc-100 font-bold">
                                {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg leading-none tracking-tight truncate">
                            {session?.user?.username || 'User'}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1 truncate font-medium">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>

                {/* Admin Dashboard Link */}
                {(session?.user as any)?.isAdmin && (
                    <button
                        onClick={() => handleNavigation('/admin')}
                        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-[1px] mb-6 transition-all hover:shadow-md hover:shadow-orange-500/20"
                    >
                        <div className="relative flex items-center gap-3 rounded-xl bg-background/50 px-4 py-3 transition-all group-hover:bg-background/80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-semibold text-foreground">Admin Area</span>
                                <span className="text-[10px] text-muted-foreground">Manage application</span>
                            </div>
                        </div>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 space-y-8">
                {menuItems.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3 px-2">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => handleNavigation(item.href)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                        )}
                                        <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 mt-auto space-y-2">
                <Separator className="mb-4 opacity-50" />

                <button
                    onClick={() => handleNavigation('/')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                    <Home className="h-4 w-4" />
                    Back to Home
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

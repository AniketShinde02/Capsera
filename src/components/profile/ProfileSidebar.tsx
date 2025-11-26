'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    User,
    History,
    Settings,
    LogOut,
    Bell,
    Globe,
    Lock,
    Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
    {
        title: 'Profile',
        items: [
            { name: 'Edit Profile', href: '/profile', icon: User },
            { name: 'History', href: '/profile/history', icon: History },
        ]
    },
    {
        title: 'Preferences',
        items: [
            { name: 'Settings', href: '/profile/settings', icon: Settings },
            { name: 'Notifications', href: '/profile/notifications', icon: Bell },
            { name: 'Appearance', href: '/profile/appearance', icon: Palette },
        ]
    },
    {
        title: 'Security',
        items: [
            { name: 'Password', href: '/profile/password', icon: Lock },
            { name: 'Privacy', href: '/profile/privacy', icon: Globe },
        ]
    }
];

export function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <span className="font-bold text-lg">Capsera</span>
                </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback className="bg-primary text-white">
                            {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                            {session?.user?.username || session?.user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
                {menuItems.map((section) => (
                    <div key={section.title} className="mb-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => router.push(item.href)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

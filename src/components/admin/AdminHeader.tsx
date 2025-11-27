'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  LogOut,
  Globe,
  Search,
  Calendar,
  Bell
} from 'lucide-react';

interface AdminHeaderProps {
  user: {
    email: string;
    username?: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const getUserInitials = (email: string, username?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string, username?: string) => {
    if (username) {
      return username;
    }
    return email.split('@')[0];
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="bg-card border-b border-border p-3 lg:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20">
      {/* Search Bar */}
      <div className="relative w-full md:w-96 pl-12 lg:pl-0">
        <Search className="absolute left-14 lg:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="bg-muted/50 border-none pl-10 h-10 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>Today, {currentDate}</span>
        </div>

        {/* Notifications */}
        <button className="p-2.5 bg-muted/50 rounded-full hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
        </button>

        {/* Browse Site Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open('/', '_blank')}
          className="hidden sm:flex bg-muted/50 border-none rounded-full hover:bg-muted w-10 h-10"
          title="Browse Site"
        >
          <Globe className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* User Profile */}
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 border-2 border-muted hover:bg-transparent"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || ''} alt={getUserDisplayName(user.email, user.username)} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials(user.email, user.username)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 bg-card border-border text-foreground" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {getUserDisplayName(user.email, user.username)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-muted focus:text-foreground cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

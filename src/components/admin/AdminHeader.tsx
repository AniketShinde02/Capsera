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
    <header className="bg-[#09090b] border-b border-white/5 p-4 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search..."
          className="bg-[#18181b] border-none pl-10 h-12 rounded-2xl text-gray-300 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-[#18181b] px-4 py-2 rounded-xl">
          <Calendar className="w-4 h-4" />
          <span>Today, {currentDate}</span>
        </div>

        {/* Notifications */}
        <button className="p-3 bg-[#18181b] rounded-full hover:bg-white/10 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#18181b]" />
        </button>

        {/* Browse Site Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open('/', '_blank')}
          className="hidden sm:flex bg-[#18181b] border-none rounded-full hover:bg-white/10 w-12 h-12"
          title="Browse Site"
        >
          <Globe className="w-5 h-5 text-gray-300" />
        </Button>

        {/* User Profile */}
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-full p-0 border-2 border-[#18181b] hover:bg-transparent"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={session?.user?.image || ''} alt={getUserDisplayName(user.email, user.username)} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials(user.email, user.username)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 bg-[#18181b] border-white/10 text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">
                  {getUserDisplayName(user.email, user.username)}
                </p>
                <p className="text-xs leading-none text-gray-400">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-white/10 focus:text-white cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

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

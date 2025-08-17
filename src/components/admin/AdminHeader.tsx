'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import AdminModeToggle from './AdminModeToggle';
import { Zap, LogOut, User, Settings, Menu, Globe } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
  user: {
    email: string;
    username?: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/setup');
  };

  const handleProfileClick = () => {
    // Always allow access to profile
    router.push('/profile');
  };

  const handleBrowseSite = () => {
    // Always allow browsing the site
    router.push('/');
  };

  return (
    <header className="bg-background border-b border-border shadow-sm h-16 flex items-center px-4 sm:px-6 relative">
      {/* Left side - Welcome Message */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        <span className="text-lg sm:text-xl font-bold text-foreground">
          Welcome, {user.username || user.email}
        </span>
      </div>
      
      {/* Center - Admin Mode Toggle */}
      <div className="hidden md:flex items-center mx-auto">
        <AdminModeToggle />
      </div>
      
      {/* Right side - User actions - Desktop */}
      <div className="ml-auto hidden md:flex items-center space-x-4">
        
        <div className="flex items-center space-x-2">
          {/* Browse Site Button */}
          <Button
            onClick={handleBrowseSite}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            title="Browse the site as a regular user"
          >
            <Globe className="h-4 w-4" />
            <span>Browse Site</span>
          </Button>
          
          {/* Profile Button */}
          <Button
            onClick={handleProfileClick}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            title={session?.mode === 'user' ? 'Access your profile' : 'Switch to User Mode first'}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          
          {/* User Avatar */}
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden ml-auto h-10 w-10"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Admin Mode Toggle - Mobile */}
            <div className="p-3">
              <AdminModeToggle />
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.username || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleBrowseSite}
                variant="ghost"
                className="w-full justify-start h-11"
                title="Browse the site as a regular user"
              >
                <Globe className="h-4 w-4 mr-3" />
                Browse Site
              </Button>
              
              <Button
                onClick={handleProfileClick}
                variant="ghost"
                className="w-full justify-start h-11"
                title={session?.mode === 'user' ? 'Access your profile' : 'Switch to User Mode first'}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start h-11"
                onClick={() => {
                  router.push('/admin/settings');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start h-11"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>

            {/* Theme Toggle in Mobile Menu */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

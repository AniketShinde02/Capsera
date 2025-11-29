'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  Bell,
  Users,
  Image as ImageIcon,
  BarChart3,
  Database,
  Shield,
  Settings,
  FileText,
  ArrowRight,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  user: {
    email: string;
    username?: string;
  };
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  category: 'page' | 'action' | 'user';
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Define all searchable pages and actions
  const allPages: SearchResult[] = [
    { id: 'dashboard', title: 'Dashboard', description: 'Overview and analytics', icon: BarChart3, path: '/admin', category: 'page' },
    { id: 'users', title: 'Users', description: 'Manage user accounts', icon: Users, path: '/admin/users', category: 'page' },
    { id: 'images', title: 'Image Vault', description: 'Manage uploaded images', icon: ImageIcon, path: '/admin/images', category: 'page' },
    { id: 'analytics', title: 'Analytics', description: 'View detailed analytics', icon: BarChart3, path: '/admin/analytics', category: 'page' },
    { id: 'database', title: 'Database', description: 'Database management', icon: Database, path: '/admin/database', category: 'page' },
    { id: 'roles', title: 'Roles & Permissions', description: 'Manage user roles', icon: Shield, path: '/admin/roles', category: 'page' },
    { id: 'moderation', title: 'Moderation', description: 'Content moderation', icon: Shield, path: '/admin/moderation', category: 'page' },
    { id: 'logs', title: 'Activity Logs', description: 'View system logs', icon: FileText, path: '/admin/logs', category: 'page' },
    { id: 'profile', title: 'My Profile', description: 'View your profile', icon: User, path: '/profile', category: 'action' },
    { id: 'site', title: 'Browse Site', description: 'Open main site', icon: Globe, path: '/', category: 'action' },
  ];

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allPages.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.id.toLowerCase().includes(query)
    );

    setSearchResults(filtered.slice(0, 6)); // Limit to 6 results
    setShowResults(true);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        navigateToResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
    }
  };

  // Navigate to selected result
  const navigateToResult = (result: SearchResult) => {
    if (result.path === '/') {
      window.open('/', '_blank');
    } else {
      router.push(result.path);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-card border-b border-border p-3 lg:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20">
      {/* Search Bar with Command Palette */}
      <div className="relative w-full md:w-96 pl-12 lg:pl-0" ref={searchRef}>
        <Search className="absolute left-14 lg:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search pages, users, or type a command..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setShowResults(true)}
          className="bg-muted/50 border-none pl-10 pr-10 h-10 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Command className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-border bg-muted/30">
              <p className="text-xs text-muted-foreground px-2">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} • Use ↑↓ to navigate, Enter to select
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => navigateToResult(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                    index === selectedIndex && "bg-muted/50",
                    pathname === result.path && "bg-primary/10"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    pathname === result.path ? "bg-primary/20" : "bg-muted"
                  )}>
                    <result.icon className={cn(
                      "w-4 h-4",
                      pathname === result.path ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      pathname === result.path ? "text-primary" : "text-foreground"
                    )}>
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showResults && searchQuery && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl p-6 text-center z-50 animate-in fade-in slide-in-from-top-2">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try searching for pages, users, or features</p>
          </div>
        )}
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

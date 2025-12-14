'use client';

import Link from 'next/link';
import { Sparkles, Menu, User, X, Home, Star, Info, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { SignUpButton } from '@/components/SignUpButton';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { clearAllNextAuthStorage } from '@/lib/session-utils';
import { useRouter } from 'next/navigation';

export default function ServerHeader() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthed = status === 'authenticated';
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || userEmail.split('@')[0] || 'User';
  const userImage = session?.user?.image || '';

  // Hide header on admin, setup, and login pages
  const isAdminPage = pathname?.startsWith('/admin');
  const isSetupPage = pathname?.startsWith('/setup');
  const isLoginPage = pathname?.startsWith('/login');
  const isProfilePage = pathname?.startsWith('/profile');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        // Don't close if clicking on navigation elements
        const target = event.target as Element;
        if (target.closest('a') || target.closest('button')) {
          return;
        }
        closeMenu();
      }
    };

    const handleScroll = () => {
      if (isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  // Hide header on admin, setup, login, and profile pages
  if (isAdminPage || isSetupPage || isLoginPage || isProfilePage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#E3E1D9]/90 dark:bg-background/80 backdrop-blur-md border-b border-[#C7C8CC]/60 dark:border-border/50 transition-all duration-300">
        <div className="relative flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-2 h-14">
          {/* Left: Logo */}
          <div className="flex-shrink-0 z-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/web-app-manifest-192x192.png"
                  alt="Capsera Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-lg font-bold tracking-tight leading-none font-space-grotesk">
                  Capsera
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">BETA</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Nav Links - Absolutely Centered */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-8">
            <Link href="/" className="relative group">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
                Home
              </span>
              {pathname === '/' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
            <Link href="/features" className="relative group">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
                Features
              </span>
              {pathname === '/features' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
            <Link href="/about" className="relative group">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
                About
              </span>
              {pathname === '/about' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
            <Link href="/contact" className="relative group">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
                Contact
              </span>
              {pathname === '/contact' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
            <Link href="/blog" className="relative group">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
                Blog
              </span>
              {pathname === '/blog' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Right: Theme Toggle / Profile / SignUp */}
          <div className="flex items-center gap-3 z-20">
            {/* Desktop Auth & Theme - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : isAuthed ? (
                <div className="flex items-center space-x-3">
                  <Link href="/profile" className="flex items-center space-x-2 text-white hover:text-cyan-300 transition-colors duration-300 ease-out">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </div>
              ) : (
                <SignUpButton />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all duration-200"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <div className="w-4 h-4">
                  <svg className="w-4 h-4 block dark:hidden text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <svg className="w-4 h-4 hidden dark:block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </Button>
            </div>

            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-white"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Custom CSS for expanding line animation */}
      <style jsx>{`
        @keyframes expandLine {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>

      {/* Mobile Menu Overlay - Magic UI Style */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ease-out"
            onClick={closeMenu}
          />

          {/* Menu Container */}
          <div className="absolute inset-0 flex items-start justify-center pt-20 px-4">
            <div
              className={`
                relative w-full max-w-sm bg-background/80 dark:bg-slate-950/90 backdrop-blur-2xl 
                rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden
                transform transition-all duration-500 ease-out ring-1 ring-black/5
                ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'}
              `}
            >
              {/* Magic Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

              {/* Header Section */}
              <div className="relative px-6 py-5 border-b border-white/10 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Menu
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">Navigate & Settings</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    <div className="w-4 h-4">
                      <svg className="w-4 h-4 block dark:hidden text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <svg className="w-4 h-4 hidden dark:block text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </Button>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    onClick={closeMenu}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Grid Navigation */}
              <div className="relative p-4 grid grid-cols-2 gap-3">
                {[
                  { href: '/features', icon: Star, label: 'Features', color: 'text-yellow-500' },
                  { href: '/about', icon: Info, label: 'About', color: 'text-blue-500' },
                  { href: '/blog', icon: Sparkles, label: 'Blog', color: 'text-pink-500' },
                  { href: '/contact', icon: Mail, label: 'Contact', color: 'text-purple-500' },
                  { href: '/pricing', icon: null, label: 'Pricing', color: 'text-green-500', customIcon: <span className="text-lg font-bold">₹</span> },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`
                      group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                      bg-muted/30 hover:bg-muted/60 border border-white/5 hover:border-white/20
                      transition-all duration-300 active:scale-95
                      ${pathname === item.href ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20' : ''}
                    `}
                  >
                    <div className={`
                      p-2.5 rounded-xl bg-background shadow-sm group-hover:scale-110 transition-transform duration-300
                      ${item.color}
                    `}>
                      {item.customIcon ? item.customIcon : <item.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* User Section */}
              <div className="relative p-4 pt-0">
                {isLoading ? (
                  <div className="h-14 w-full rounded-2xl bg-muted animate-pulse" />
                ) : isAuthed ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-white/5 hover:border-white/20 transition-all duration-300 active:scale-95"
                    >
                      <div className="p-2.5 rounded-xl bg-background shadow-sm text-cyan-500">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80">My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        closeMenu();
                        setShowSignoutConfirm(true);
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all duration-300 active:scale-95 group"
                    >
                      <div className="p-2.5 rounded-xl bg-background shadow-sm text-red-500 group-hover:text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-red-600/80 group-hover:text-red-600">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to access your profile and saved captions.
                    </p>
                    <SignUpButton className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signout Confirmation Popup - Same Page */}
      {showSignoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-slate-600/50">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Sign Out?
              </h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to sign out? You'll need to sign in again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowSignoutConfirm(false);
                    // Enhanced logout: Clear everything + cache busting
                    try {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('theme');

                        // 1) Clear all client-side caches first
                        clearAllNextAuthStorage();

                        // 2) Ask NextAuth to invalidate
                        await signOut({ redirect: false });

                        // 3) Hard-clear cookies server-side with cache busting
                        await fetch("/logout", {
                          method: "POST",
                          headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                          },
                          cache: 'no-store'
                        }).catch(() => { });

                        // 4) Additional aggressive cache clearing
                        if ('caches' in window) {
                          caches.keys().then(names => {
                            names.forEach(name => caches.delete(name));
                          });
                        }

                        // 5) Force redirect with cache busting parameter
                        window.location.replace(`/?cache-bust=${Date.now()}&logout=success`);
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Fallback: force redirect with cache busting
                      window.location.replace(`/?cache-bust=${Date.now()}&logout=fallback`);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

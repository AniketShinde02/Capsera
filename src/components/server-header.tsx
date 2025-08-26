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
import { useRouter } from 'next/navigation';

export default function ServerHeader() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const isAuthed = Boolean(session);
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || userEmail.split('@')[0] || 'User';
  const userImage = session?.user?.image || '';

  // Hide header on admin, setup, and login pages
  const isAdminPage = pathname.startsWith('/admin');
  const isSetupPage = pathname.startsWith('/setup');
  const isLoginPage = pathname.startsWith('/login');

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

  // Hide header on admin, setup, and login pages
  if (isAdminPage || isSetupPage || isLoginPage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#E3E1D9]/90 dark:bg-background/80 backdrop-blur-sm border-b border-[#C7C8CC]/60 dark:border-border/50">
        <div className="flex items-center justify-between w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="/favicon.svg" 
                  alt="Capsera Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight leading-tight">
                  Capsera
                </h1>
                <div className="flex items-center gap-1.5 -mt-1">
                  <span className="text-[6px] sm:text-[9px] md:text-[8px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-1 sm:px-1.5 py-0.5 rounded-full font-semibold leading-none">BETA</span>
                  <span className="text-[6px] sm:text-[8px] md:text-[10px] text-muted-foreground leading-none">v1.0.0</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden md:flex flex-1 justify-center gap-6">
            <Link href="/" className="relative group">
              <span className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-colors duration-300 ease-out font-medium">
                Home
              </span>
              {pathname === '/' && (
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transform -translate-x-1/2 animate-[expandLine_0.3s_ease-out_forwards] max-w-[40px]"></div>
              )}
            </Link>
            <Link href="/features" className="relative group">
              <span className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-colors duration-300 ease-out font-medium">
                Features
              </span>
              {pathname === '/features' && (
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transform -translate-x-1/2 animate-[expandLine_0.3s_ease-out_forwards] max-w-[50px]"></div>
              )}
            </Link>
            <Link href="/about" className="relative group">
              <span className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-colors duration-300 ease-out font-medium">
                About
              </span>
              {pathname === '/about' && (
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transform -translate-x-1/2 animate-[expandLine_0.3s_ease-out_forwards] max-w-[40px]"></div>
              )}
            </Link>
            <Link href="/contact" className="relative group">
              <span className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-colors duration-300 ease-out font-medium">
                Contact
              </span>
              {pathname === '/contact' && (
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transform -translate-x-1/2 animate-[expandLine_0.3s_ease-out_forwards] max-w-[50px]"></div>
              )}
            </Link>
          </nav>

          {/* Right: Theme Toggle / Profile / SignUp */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth & Theme - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
              {isAuthed ? (
                <div className="flex items-center space-x-3">
                  <Link href="/profile" className="flex items-center space-x-2 text-white hover:text-cyan-300 transition-colors duration-300 ease-out">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </div>
              ) : (
                <SignUpButton />
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg border-slate-300/60 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 transition-all duration-300 ease-out hover:scale-110"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 block dark:hidden text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 hidden dark:block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </Button>
            </div>

            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-700 dark:text-white"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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

      {/* Mobile Menu Overlay - Top Slide Down Style */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-500 ease-out"
            onClick={closeMenu}
          />
          
          {/* Top Slide Down Container */}
          <div className="absolute inset-0 flex items-start justify-center pt-16">
            <div 
              className={`
                relative w-full max-w-xs bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl 
                rounded-b-2xl shadow-2xl border border-slate-300/60 dark:border-slate-700/50 overflow-hidden
                transform transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
              `}
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-slate-400/60 dark:bg-slate-600/70 rounded-full"></div>
              </div>

              {/* Header - Clean, Single Logo with Better Contrast */}
              <div className="px-4 py-2 text-center border-b border-slate-300/60 dark:border-slate-700/50 bg-slate-200/50 dark:bg-slate-800/50">
                <h2 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Menu</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Navigate & Settings</p>
              </div>

              {/* Back Button */}
              <button
                onClick={() => {
                  router.back();
                  // Close menu after navigation with a small delay
                  setTimeout(() => setIsMenuOpen(false), 100);
                }}
                className="absolute top-7 left-3 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Theme Toggle - Top Right with Margin */}
              <div className="absolute top-7 right-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-lg border-slate-300/60 dark:border-slate-500/60 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-300 ease-out hover:scale-110 bg-white/80 dark:bg-slate-700/80 shadow-sm"
                  onClick={() => {
                    const html = document.documentElement;
                    if (html.classList.contains('dark')) {
                      html.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                    } else {
                      html.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                    }
                  }}
                >
                  <div className="w-4 h-4">
                    <svg className="w-4 h-4 block dark:hidden text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <svg className="w-4 h-4 hidden dark:block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                </Button>
              </div>

              {/* Navigation Menu - Two Column Layout with Dark Theme Colors */}
              <div className="px-3 py-3 mt-8">
                {/* First Row - Two Columns */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Link 
                    href="/features" 
                    onClick={closeMenu}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border shadow-sm ${
                      pathname === '/features' 
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-900/20 border-blue-300/60 dark:border-blue-600/60' 
                        : 'text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-700/80 border-[#C7C8CC]/60 dark:border-slate-700/60'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${
                      pathname === '/features' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`} />
                    <span>Features</span>
                  </Link>
                  
                  <Link 
                    href="/about" 
                    onClick={closeMenu}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border shadow-sm ${
                      pathname === '/about' 
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-900/20 border-blue-300/60 dark:border-blue-600/60' 
                        : 'text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-700/80 border-[#C7C8CC]/60 dark:border-slate-700/60'
                    }`}
                  >
                    <Info className={`w-4 h-4 ${
                      pathname === '/about' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`} />
                    <span>About</span>
                  </Link>
                </div>
                
                {/* Second Row - Two Columns */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Link 
                    href="/contact" 
                    onClick={closeMenu}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border shadow-sm ${
                      pathname === '/contact' 
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-900/20 border-blue-300/60 dark:border-blue-600/60' 
                        : 'text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-700/80 border-[#C7C8CC]/60 dark:border-slate-700/60'
                    }`}
                  >
                    <Mail className={`w-4 h-4 ${
                      pathname === '/contact' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`} />
                    <span>Contact</span>
                  </Link>
                  
                  <Link 
                    href="/pricing" 
                    onClick={closeMenu}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border shadow-sm ${
                      pathname === '/pricing' 
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-900/20 border-blue-300/60 dark:border-blue-600/60' 
                        : 'text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-700/80 border-[#C7C8CC]/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center ${
                      pathname === '/pricing' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      <span className="text-sm font-bold">₹</span>
                    </div>
                    <span>Pricing</span>
                  </Link>
                </div>

                {/* Third Row - Profile & Logout Side by Side */}
                <div className="mb-2">
                  {isAuthed ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href="/profile" 
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-700/80 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border border-[#C7C8CC]/60 dark:border-slate-700/60 shadow-sm"
                      >
                        <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        <span>My Profile</span>
                      </Link>
                      
                      <button 
                        onClick={() => {
                          closeMenu(); // Close menu modal first
                          setShowSignoutConfirm(true); // Show signout popup on same page
                        }}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-white bg-[#F2EFE5]/90 dark:bg-slate-800/80 hover:bg-[#E3E1D9]/90 dark:hover:bg-slate-300/80 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] border border-[#C7C8CC]/60 dark:border-slate-700/60 shadow-sm"
                      >
                        <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-2.5 rounded-lg bg-[#F2EFE5]/90 dark:bg-slate-800/80 border border-[#C7C8CC]/60 dark:border-slate-700/60 shadow-sm">
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 inline mr-1 text-slate-700 dark:text-slate-300" />
                        Please <button 
                          onClick={() => {
                            closeMenu();
                            // You can add logic to open signup modal here
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          sign up
                        </button> to access your profile
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions - Only Sign Up Button (No Generate Captions) */}
              <div className="px-3 pb-3">
                {!isAuthed && (
                  <SignUpButton className="w-full h-9 text-xs rounded-lg font-semibold shadow-lg transition-all duration-300 ease-out" />
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
                    // Double-tap logout: NextAuth + hard-clear + redirect
                    try {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('theme');
                        // 1) Ask NextAuth to invalidate
                        await signOut({ redirect: false });
                        // 2) Hard-clear cookies server-side
                        await fetch("/logout", { method: "POST" }).catch(() => {});
                        // 3) Final redirect to kill any client cache state
                        window.location.replace("/");
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Fallback: force redirect
                      window.location.replace("/");
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

'use client';

import Link from 'next/link';
import { Sparkles, Twitter, Linkedin, Github, Heart, MessageCircle, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin, setup, login, and profile pages
  const isAdminPage = pathname.startsWith('/admin');
  const isSetupPage = pathname.startsWith('/setup');
  const isLoginPage = pathname.startsWith('/login');
  const isProfilePage = pathname.startsWith('/profile');

  if (isAdminPage || isSetupPage || isLoginPage || isProfilePage) {
    return null;
  }

  return (
    <footer className="bg-[#E3E1D9]/80 dark:bg-muted/10 border-t border-[#C7C8CC]/60 dark:border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section - Top on mobile, Left on desktop */}
          <div className="col-span-12 lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <Link className="flex items-center gap-2 mb-2 justify-center lg:justify-start" href="/">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/favicon.svg"
                  alt="Capsera Logo"
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'var(--logo-filter)'
                  }}
                />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Capsera</h1>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 max-w-xs mx-auto lg:mx-0 leading-relaxed">
              AI-powered caption generation to supercharge your social media presence.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 justify-center lg:justify-start">
              <Link href="https://x.com/24_jinwoo" className="w-8 h-8 bg-muted rounded-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200" title="Follow us on X">
                <Twitter className="w-3.5 h-3.5" />
              </Link>
              <Link href="https://www.instagram.com/introvert_ani.26/" className="w-8 h-8 bg-muted rounded-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200" title="Follow us on Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </Link>
              <Link href="https://github.com/AniketShinde02" className="w-8 h-8 bg-muted rounded-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200" title="Check out our GitHub">
                <Github className="w-3.5 h-3.5" />
              </Link>
              <Link href="https://discord.gg/Vkzca8Pdhf" className="w-8 h-8 bg-muted rounded-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200" title="Join our Discord server - Chill Zone">
                <MessageCircle className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Footer Links - Bottom on mobile (3 columns) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Product</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/features">Features</Link>
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/pricing">Pricing</Link>
                </nav>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Company</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/about">About Us</Link>
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/contact">Contact</Link>
                </nav>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Legal</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/terms">Terms</Link>
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/privacy">Privacy</Link>
                  <Link className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors" href="/cookies">Cookies</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-border/50 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-3 sm:gap-0">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Capsera. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-center">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> for creators worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { CaptionGenerator } from "@/components/caption-generator";
import { Button } from "@/components/ui/button";
import {  Bot, Palette, Hash, Pencil, Copy, Share, RefreshCcw, ArrowRight, Sparkles, Sun, Zap, Shield } from "lucide-react";
import Link from "next/link";
import CookieConsent from "@/components/CookieConsent";
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';

function HomeContent() {
  const router = useRouter();
  const { setOpen, setInitialEmail } = useAuthModal();
  const [isShaking, setIsShaking] = useState(false);

  // Handle automatic login modal opening with email pre-filled
  useEffect(() => {
    // Check if we're on the client side to avoid hydration issues
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldOpenLogin = urlParams.get('login');
      const email = urlParams.get('email');
      
      if (shouldOpenLogin === 'true' && email) {
        // Set the email in the auth modal context
        setInitialEmail(email);
        // Open the login modal
        setOpen(true);
        
        // Clean up the URL without refreshing the page
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login');
        newUrl.searchParams.delete('email');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [setOpen, setInitialEmail]);

  // Function to handle scroll to caption generator
  const scrollToCaptionGenerator = () => {
    setIsShaking(true);
    
    // Find the caption generator section
    const captionSection = document.querySelector('[data-section="caption-generator"]');
    if (captionSection) {
      captionSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Stop shaking after animation
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <main className="flex-grow">
        {/* Hero Section - Mobile First */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.2] [mask-image:linear-gradient(to_bottom,white_0%,transparent_70%)]"></div>
          <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tighter px-2">
              Generate <span className="gradient-text">Viral Captions</span><br className="hidden sm:block" /> with Capsera
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-3 sm:px-4 leading-relaxed">
              Stop guessing. Start creating. Our AI understands your content and generates captions that actually convert.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={scrollToCaptionGenerator}
                className={`w-auto max-w-[280px] sm:max-w-none h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isShaking ? 'animate-shake' : ''
                }`}
              >
                Start Generating
              </Button>
            </div>
          </div>
        </section>

        {/* Main Caption Generator */}
        <section data-section="caption-generator" className="py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <CaptionGenerator />
          </div>
        </section>

        {/* Transparency Disclaimer */}
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                By uploading images to our service, you acknowledge and agree to our{' '}
                <Link href="/terms" className="text-foreground/70 hover:text-foreground underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-foreground/70 hover:text-foreground underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Example Output - Mobile First */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#E3E1D9]/20 dark:bg-muted/20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                See the Magic in Action
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                Here's what our AI generates from a simple sunset photo
              </p>
            </div>
            
            <div className="bg-[#F2EFE5]/20 dark:bg-muted/20 shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto border border-[#C7C8CC]/80 dark:border-border rounded-xl sm:rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start md:items-center">
                <div className="md:col-span-2 space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm md:text-base text-foreground/90 leading-relaxed">
                    Chasing horizons and embracing the glow. ✨ Every sunset paints a story of gratitude and wonder. Couldn't ask for a better view to end the day.
                  </p>
                  <div className="bg-[#F2EFE5]/50 dark:bg-background/50 p-3 sm:p-4 border border-[#C7C8CC]/50 dark:border-border/50 rounded-lg">
                    <p className="text-muted-foreground font-mono text-xs sm:text-sm">#SunsetVibes #GoldenHourGlow #Gratitude #Mindfulness #NaturePhotography</p>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Sun className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Mobile First */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                Why Choose Our AI?
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                Built for creators who want results, not just fancy tech
              </p>
            </div>
            
            {/* Features Grid - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#F2EFE5]/40 dark:bg-muted/40 p-4 sm:p-6 border border-[#C7C8CC]/80 dark:border-border transition-all hover:border-[#B4B4B8]/90 dark:hover:border-border/70 hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/60 shadow-sm rounded-xl sm:rounded-2xl">
                <div className="bg-primary/10 text-primary w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 rounded-lg">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-foreground">Contextual AI</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Our AI understands your image and video content, not just keywords.</p>
              </div>
              
              <div className="bg-[#F2EFE5]/40 dark:bg-muted/40 p-4 sm:p-6 border border-[#C7C8CC]/80 dark:border-border transition-all hover:border-[#B4B4B8]/90 dark:hover:border-border/70 hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/60 shadow-sm rounded-xl sm:rounded-2xl">
                <div className="bg-secondary/10 text-secondary w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 rounded-lg">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-foreground">Lightning Fast</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Generate 3 unique captions in under 10 seconds. No waiting around.</p>
              </div>
              
              <div className="bg-[#F2EFE5]/40 dark:bg-muted/40 p-4 sm:p-6 border border-[#C7C8CC]/80 dark:border-border transition-all hover:border-[#B4B4B8]/90 dark:hover:border-border/70 hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/60 shadow-sm rounded-xl sm:rounded-2xl">
                <div className="bg-accent/10 text-accent w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 rounded-lg">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-foreground">40+ Moods</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">From romantic to vintage, plus custom styles - every vibe covered.</p>
              </div>
              
              <div className="bg-[#F2EFE5]/40 dark:bg-muted/40 p-4 sm:p-6 border border-[#C7C8CC]/80 dark:border-border transition-all hover:border-[#B4B4B8]/90 dark:hover:border-border/70 hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/60 shadow-sm rounded-xl sm:rounded-2xl">
                <div className="bg-green-500/10 text-green-500 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 rounded-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-foreground">Privacy First</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Your images are processed securely and never stored permanently.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-bold text-foreground mb-3">CaptionCraft</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered caption generation for social media. Create engaging, 
                contextual captions that match your content perfectly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Safety & Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/content-safety" className="text-muted-foreground hover:text-foreground transition-colors">
                    Content Safety Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 CaptionCraft. All rights reserved. Built with ❤️ for content creators.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Cookie Consent - Only shows on main page */}
      <CookieConsent />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

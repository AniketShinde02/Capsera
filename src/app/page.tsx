"use client";

import { CaptionGenerator } from "@/components/caption-generator";
import { Button } from "@/components/ui/button";
import { Bot, Palette, Sun, Zap, Shield } from "lucide-react";
import Link from "next/link";
import CookieConsent from "@/components/CookieConsent";
import { Testimonials } from "@/components/testimonials";
import { MagicShowcase } from "@/components/magic-showcase";
import { FeaturesGrid } from "@/components/features-grid";

import { useEffect, useState, Suspense } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';

function HomeContent() {

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
              Free <span className="gradient-text">AI Caption Generator</span><br className="hidden sm:block" /> Online - Capsera
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-3 sm:px-4 leading-relaxed">
              Create viral Instagram captions instantly with our free AI caption generator. Best caption tool for social media. No signup required - start generating captions now!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={scrollToCaptionGenerator}
                className={`w-auto max-w-[280px] sm:max-w-none h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 ${isShaking ? 'animate-shake' : ''
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
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
                Help us get better! Share your{' '}
                <Link href="https://forms.gle/Crx8voztG1TQZmBg9" className="text-foreground/70 hover:text-foreground underline" target="_blank" rel="noopener noreferrer">
                  feedback here
                </Link>
                {' '}to help us create amazing captions for you.
              </p>
            </div>
          </div>
        </section>

        {/* Magic Showcase Section */}
        <MagicShowcase />

        {/* Features Grid Section */}
        <FeaturesGrid />

        {/* Testimonials Section */}
        <Testimonials />
      </main>



      {/* Cookie Consent - Only shows on main page */}
      <CookieConsent />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}

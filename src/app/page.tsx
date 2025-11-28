"use client";

import { CaptionGenerator } from "@/components/caption-generator";
import { Hero } from "@/components/hero";
import CookieConsent from "@/components/CookieConsent";
import { Testimonials } from "@/components/testimonials";
import { MagicShowcase } from "@/components/magic-showcase";
import { FeaturesGrid } from "@/components/features-grid";
import Link from "next/link";
import { useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';


function HomeContent() {
  const { setOpen, setInitialEmail } = useAuthModal();

  // Handle automatic login modal opening with email pre-filled
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldOpenLogin = urlParams.get('login');
      const email = urlParams.get('email');

      if (shouldOpenLogin === 'true' && email) {
        setInitialEmail(email);
        setOpen(true);

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login');
        newUrl.searchParams.delete('email');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [setOpen, setInitialEmail]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <main className="flex-grow">
        {/* New Hero Section */}
        <Hero />

        {/* Main Caption Generator */}
        <section data-section="caption-generator" className="py-6 sm:py-8 md:py-12 lg:py-16 relative z-10">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <CaptionGenerator />

            {/* Feedback Card - Moved Here */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card/50 hover:bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-yellow-500/10 rounded-full shrink-0">
                    {/* Lightbulb Icon */}
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">We're building Capsera for YOU! 🫵</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Have a feature idea? Tell us directly. We read every message.
                    </p>
                  </div>
                </div>
                <Link
                  href="https://forms.gle/Crx8voztG1TQZmBg9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-center whitespace-nowrap"
                >
                  Shape the Future 🚀
                </Link>
              </div>
            </div>
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

        <MagicShowcase />

        {/* Features Grid Section */}
        <FeaturesGrid />

        {/* Testimonials Section */}
        <Testimonials />
      </main>

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}

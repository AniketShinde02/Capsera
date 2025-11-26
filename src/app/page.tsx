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

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}

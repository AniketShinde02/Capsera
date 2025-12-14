
import type { Metadata } from 'next';
import './globals.css';
import './satoshi.css';
import { inter, poppins, satoshi, spaceGrotesk } from './fonts';
import { Providers } from '@/components/providers';
import MaintenanceCheck from '@/components/maintenance-check';
import ServerHeader from '@/components/server-header';
import Footer from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';
// import ModuleErrorRecovery from '@/components/ModuleErrorRecovery';
// import { enableDevErrorBypass } from '@/backups/dev-error-bypass'; // Import error bypass utility
// import '@/lib/runtime-error-bypass'; // Import runtime error bypass utility

export const metadata: Metadata = {
  title: {
    default: 'Best AI Caption Generator 2025 (Free & Viral) - Capsera',
    template: '%s | Capsera AI'
  },
  description: 'The #1 Free AI Caption Generator for Instagram, TikTok & LinkedIn. Upload any image, and our advanced AI (Gemini Vision) will analyze it to generate viral, aesthetic, and engaging captions instantly. No signup required.',
  keywords: [
    'best ai caption generator',
    'free caption generator',
    'image to caption generator',
    'instagram caption generator free',
    'viral caption generator',
    'aesthetic caption generator',
    'tiktok caption generator',
    'linkedin caption generator',
    'social media caption tool',
    'auto caption generator',
    'photo analyzer for captions',
    'capsera ai'
  ],
  authors: [{ name: 'Capsera Team', url: 'https://capsera.online' }],
  creator: 'Capsera',
  publisher: 'Capsera',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://capsera.online'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://capsera.online',
    title: 'Best AI Caption Generator 2025 (Free & Viral) - Capsera',
    description: 'The #1 Free AI Caption Generator. Upload an image and get viral, aesthetic captions instantly using advanced AI analysis.',
    siteName: 'Capsera AI',
    images: [
      {
        url: '/og-image.png', // We should create this if it doesn't exist, or fallback to logo
        width: 1200,
        height: 630,
        alt: 'Capsera AI Caption Generator Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best AI Caption Generator 2025 (Free & Viral) - Capsera',
    description: 'The #1 Free AI Caption Generator. Upload an image and get viral, aesthetic captions instantly.',
    images: ['/og-image.png'],
    creator: '@capsera_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // User needs to provide this
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

// Enhanced Structured Data for AEO (Answer Engine Optimization)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Capsera",
  "alternateName": "Best AI Caption Generator 2025",
  "description": "The best free AI caption generator that analyzes images to create viral, aesthetic captions for Instagram, TikTok, and LinkedIn.",
  "url": "https://capsera.online",
  "applicationCategory": "SocialNetworkingApplication",
  "applicationSubCategory": "AI Tool",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free Forever Plan available"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1540",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI Image Analysis (Gemini Vision)",
    "Viral Caption Generation",
    "Instagram & TikTok Optimization",
    "Hashtag Generation",
    "Multi-language Support",
    "No Signup Required"
  ],
  "screenshot": "https://capsera.online/screenshot.png", // Placeholder
  "softwareHelp": {
    "@type": "CreativeWork",
    "url": "https://capsera.online/about"
  },
  "author": {
    "@type": "Organization",
    "name": "Capsera Team",
    "url": "https://capsera.online"
  },
  "mainEntity": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best AI caption generator for images?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Capsera is widely considered the best AI caption generator because it uses advanced computer vision (Gemini 1.5 Flash) to actually 'see' your image and generate context-aware, viral captions, unlike other tools that just use generic text prompts."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free AI caption generator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Capsera is a 100% free AI caption generator. You can upload images and generate unlimited captions without a credit card or subscription."
        }
      },
      {
        "@type": "Question",
        "name": "How do I generate captions from an image?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply upload your photo to Capsera, select a mood (e.g., Funny, Aesthetic, Professional), and our AI will instantly analyze the image to write 3 unique, engaging captions for you."
        }
      },
      {
        "@type": "Question",
        "name": "Can AI write Instagram captions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, AI tools like Capsera are specifically trained to write high-engagement Instagram captions, complete with relevant emojis and hashtags to boost your reach."
        }
      }
    ]
  }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon-32x32.png" as="image" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-G90559BY50"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-G90559BY50');
            `,
          }}
        />

        {/* Favicon and icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Manifest and theme */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />

        {/* Using locally hosted fonts */}

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//ik.imagekit.io" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${satoshi.variable} ${spaceGrotesk.variable} font-satoshi antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden`} style={satoshi.style}>
        <Providers session={session}>

          <PerformanceOptimizer />
          <MaintenanceCheck />
          <ServerHeader />
          <main className="flex-grow w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <AuthModal />
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

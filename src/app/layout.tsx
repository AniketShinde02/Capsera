
import type { Metadata } from 'next';
import './globals.css';
import './satoshi.css';
import { inter, poppins, satoshi } from './fonts';
import { Providers } from '@/components/providers';
import MaintenanceCheck from '@/components/maintenance-check';
import ServerHeader from '@/components/server-header';
import Footer from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';
// import ModuleErrorRecovery from '@/components/ModuleErrorRecovery';
// import { enableDevErrorBypass } from '@/backups/dev-error-bypass'; // Import error bypass utility
// import '@/lib/runtime-error-bypass'; // Import runtime error bypass utility

export const metadata: Metadata = {
  title: {
    default: 'Free AI Caption Generator Online | Capsera - Best Instagram Caption Tool 2024',
    template: '%s | Capsera - AI Caption Generator'
  },
  description: 'Free AI caption generator online. Create viral Instagram captions instantly with Capsera. Best caption tool for social media. No signup required. Try our AI caption generator now!',
  keywords: ['free caption generator', 'AI caption generator', 'Instagram caption generator', 'online caption maker', 'viral captions', 'social media captions', 'best caption tool', 'free AI caption tool', 'caption generator online', 'Instagram caption maker'],
  authors: [{ name: 'Capsera Team' }],
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
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://capsera.online',
    title: 'Free AI Caption Generator Online | Capsera - Best Instagram Caption Tool 2024',
    description: 'Free AI caption generator online. Create viral Instagram captions instantly with Capsera. Best caption tool for social media. No signup required.',
    siteName: 'Capsera',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'Capsera - AI Caption Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Caption Generator Online | Capsera - Best Instagram Caption Tool 2024',
    description: 'Free AI caption generator online. Create viral Instagram captions instantly with Capsera. Best caption tool for social media. No signup required.',
    images: ['/favicon.svg'],
    creator: '@capsera',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// Structured data for better SERP results
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Capsera - Free AI Caption Generator",
  "description": "Free AI caption generator online. Create viral Instagram captions instantly with our advanced AI. Best caption tool for social media with no signup required.",
  "url": "https://capsera.online",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Completely free AI caption generator"
  },
  "creator": {
    "@type": "Organization",
    "name": "Capsera",
    "url": "https://capsera.online"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "Free AI caption generator",
    "Instagram caption optimization",
    "Viral caption creation",
    "Multiple mood and style options",
    "No signup required",
    "Instant caption generation",
    "Social media optimization"
  ],
  "keywords": "free caption generator, AI caption generator, Instagram caption generator, online caption maker, viral captions, social media captions, best caption tool"
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
      <body className={`${inter.variable} ${poppins.variable} ${satoshi.variable} font-satoshi antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden`} style={satoshi.style}>
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


import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import MaintenanceCheck from '@/components/maintenance-check';
import ServerHeader from '@/components/server-header';
import Footer from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
});

// Custom font for better performance
const satoshi = {
  style: {
    fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

export const metadata: Metadata = {
  title: {
    default: 'Capsera - AI-Powered Instagram Caption Generator',
    template: '%s | Capsera'
  },
  description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image. Free to use with advanced features.',
  keywords: ['Instagram captions', 'AI caption generator', 'viral captions', 'social media content', 'caption writing'],
  authors: [{ name: 'Capsera Team' }],
  creator: 'Capsera',
  publisher: 'Capsera',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://capsera.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://capsera.vercel.app',
    title: 'Capsera - AI-Powered Instagram Caption Generator',
    description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image.',
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
    title: 'Capsera - AI-Powered Instagram Caption Generator',
    description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image.',
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
  "@type": "WebApplication",
  "name": "Capsera",
  "description": "AI-powered Instagram caption generator that creates engaging, viral captions for any mood or image",
  "url": process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://capsera.vercel.app",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "Capsera",
    "url": process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://capsera.vercel.app"
  },
  "featureList": [
    "AI-powered caption generation",
    "Multiple mood and style options",
    "Instagram optimization",
    "Viral caption templates",
    "Free basic usage"
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

        {/* Favicon and icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Manifest and theme */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        
        {/* Optimized font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Satoshi:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet"
        />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//ik.imagekit.io" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden`} style={satoshi.style}>
        <Providers>
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

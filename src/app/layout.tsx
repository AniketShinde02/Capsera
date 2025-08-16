
import type { Metadata } from 'next'
import './globals.css'

// This is the crucial line.
// It opts this layout and all pages that use it out of static caching.
// It forces Next.js to render it on the server for every request,
// ensuring the authentication state is always fresh.
export const dynamic = 'force-dynamic'

import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers'
import { AuthModal } from '@/components/auth-modal'
import ServerHeader from '@/components/server-header'
import Footer from '@/components/footer'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Capsera - AI-Powered Instagram Caption Generator',
    template: '%s | Capsera'
  },
  description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image. Free to use, no signup required for basic generation.',
  keywords: ['Instagram captions', 'AI caption generator', 'social media captions', 'viral captions', 'caption writing', 'social media marketing'],
  authors: [{ name: 'Capsera Team' }],
  creator: 'Capsera',
  publisher: 'Capsera',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ai-caption-generator-pied.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
            url: 'https://ai-caption-generator-pied.vercel.app',
    title: 'Capsera - AI-Powered Instagram Caption Generator',
    description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image.',
            siteName: 'Capsera',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Capsera - AI Instagram Caption Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capsera - AI-Powered Instagram Caption Generator',
    description: 'Generate engaging, viral Instagram captions with AI. Create perfect captions for any mood, style, or image.',
    images: ['/og-image.jpg'],
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
          "url": "https://ai-caption-generator-pied.vercel.app",
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
              "url": "https://ai-caption-generator-pied.vercel.app"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden`}>
        <Providers>
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

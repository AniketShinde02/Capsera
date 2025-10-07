import 'dotenv/config';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable proper TypeScript error checking
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    PORT: '3000',
  },
  
  // Performance optimizations
  // Note: removed experimental.optimizePackageImports which caused runtime chunk issues in dev
  experimental: {
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Server external packages for better stability
  serverExternalPackages: ['@genkit-ai/core', 'genkit'],
  
  // Disable development indicators for testing
  devIndicators: {
    position: 'bottom-left',
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Add error handling and bypass configurations
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Add cache busting and better asset handling
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Improve static asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Add error handling for development
  ...(process.env.NODE_ENV === 'development' && {
    // Bypass certain errors in development
    webpack: (config, { dev, isServer, webpack }) => {
      // Add better module resolution
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Improve module cache handling with absolute path
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(process.cwd(), '.next/cache'),
        compression: false, // Disable compression to avoid rename issues
        maxAge: 172800000, // 2 days
        // Add better error handling for cache issues
        allowCollectingMemory: true,
        memoryCacheUnaffected: true,
        // Use stable cache names to avoid rename conflicts
        name: isServer ? 'webpack-cache-server' : 'webpack-cache-client',
        version: '1.0.0',
      };

      if (dev) {
        // Suppress optional dependency warnings in development
        config.ignoreWarnings = [
          /Module not found: Can't resolve '@opentelemetry\/exporter-jaeger'/,
          /require\.extensions is not supported by webpack/,
          /Can't resolve '@opentelemetry\/exporter-jaeger'/,
          /Module not found: Can't resolve '@genkit-ai\/firebase'/,
        ];

        // MIME type handling is now done via headers configuration
        
        // Improve HMR stability
        config.plugins.push(
          new webpack.HotModuleReplacementPlugin()
        );
        
        // Add error handling plugin for development
        config.plugins.push(
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          })
        );
      }
      
      // Fix webpack cache strategy issues
      config.infrastructureLogging = {
        level: 'warn',
        debug: false,
      };
      
      // Optimize bundle splitting with better cache handling
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // Add specific handling for problematic packages
            genkit: {
              test: /[\\/]node_modules[\\/](@genkit-ai|genkit)[\\/]/,
              name: 'genkit',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        };
        
        // Improve runtime chunk handling
        config.optimization.runtimeChunk = {
          name: 'runtime',
        };
      }
      
      return config;
    },
  }),
  
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'placehold.co'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    path: '/_next/image',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Headers for performance and MIME type fixes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Fix CSS MIME type issues
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fix JavaScript MIME type issues
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // WOFF
      {
        source: '/_next/static/media/(.*)\\.(woff)',
        headers: [
          { key: 'Content-Type', value: 'font/woff' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // WOFF2
      {
        source: '/_next/static/media/(.*)\\.(woff2)',
        headers: [
          { key: 'Content-Type', value: 'font/woff2' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // TTF/OTF fonts
      {
        source: '/_next/static/media/(.*)\\.(ttf|otf)',
        headers: [
          {
            key: 'Content-Type',
            value: 'font/ttf',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // EOT fonts (legacy IE support)
      {
        source: '/_next/static/media/(.*)\\.eot',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.ms-fontobject',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fix favicon and static assets
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(png|jpg|jpeg|gif|ico|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

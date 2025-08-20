import 'dotenv/config';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@genkit-ai/core', 'genkit'],
  env: {
    PORT: '3000',
  },
  
  // Performance optimizations - removed problematic ones
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Add cache busting and better asset handling
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Improve static asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
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
      compression: 'gzip',
      maxAge: 172800000, // 2 days
    };

    if (dev) {
      // Suppress optional dependency warnings in development
      config.ignoreWarnings = [
        /Module not found: Can't resolve '@opentelemetry\/exporter-jaeger'/,
        /require\.extensions is not supported by webpack/,
        /Can't resolve '@opentelemetry\/exporter-jaeger'/,
        /Module not found: Can't resolve '@genkit-ai\/firebase'/,
      ];
      
      // Improve HMR stability
      config.plugins.push(
        new webpack.HotModuleReplacementPlugin()
      );
    }
    
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
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // ✅ Added Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for performance (fixed regex patterns)
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
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
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

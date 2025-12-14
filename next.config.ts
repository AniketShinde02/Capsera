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
    maxInactiveAge: 25 * 1000,
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
    webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(process.cwd(), '.next/cache'),
        compression: false,
        maxAge: 172800000,
        allowCollectingMemory: true,
        memoryCacheUnaffected: true,
        name: isServer
          ? `webpack-cache-server-${nextRuntime || 'nodejs'}`
          : 'webpack-cache-client',
        version: '1.0.0',
      };

      if (dev) {
        config.ignoreWarnings = [
          /Module not found: Can't resolve '@opentelemetry\/exporter-jaeger'/,
          /require\.extensions is not supported by webpack/,
          /Can't resolve '@opentelemetry\/exporter-jaeger'/,
          /Module not found: Can't resolve '@genkit-ai\/firebase'/,
        ];

        config.plugins.push(
          new webpack.HotModuleReplacementPlugin()
        );

        config.plugins.push(
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          })
        );
      }

      config.infrastructureLogging = {
        level: 'warn',
        debug: false,
      };

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
            genkit: {
              test: /[\\/]node_modules[\\/](@genkit-ai|genkit)[\\/]/,
              name: 'genkit',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        };

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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          { key: 'Content-Type', value: 'text/css; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/media/(.*)\.(woff)',
        headers: [
          { key: 'Content-Type', value: 'font/woff' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/media/(.*)\.(woff2)',
        headers: [
          { key: 'Content-Type', value: 'font/woff2' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/media/(.*)\.(ttf|otf)',
        headers: [
          { key: 'Content-Type', value: 'font/ttf' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/media/(.*)\.eot',
        headers: [
          { key: 'Content-Type', value: 'application/vnd.ms-fontobject' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Content-Type', value: 'image/x-icon' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.(png|jpg|jpeg|gif|ico|svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Proxy /docs to separate docs server on port 3002
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: 'http://localhost:3002/docs',
      },
      {
        source: '/docs/:path*',
        destination: 'http://localhost:3002/docs/:path*',
      },
    ];
  },
};

export default nextConfig;

import 'dotenv/config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  env: {
    PORT: '3000',
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Suppress optional dependency warnings in development
      config.ignoreWarnings = [
        /Module not found: Can't resolve '@opentelemetry\/exporter-jaeger'/,
        /Module not found: Can't resolve '@genkit-ai\/firebase'/,
        /require\.extensions is not supported by webpack/,
        /Can't resolve '@opentelemetry\/exporter-jaeger'/,
        /Can't resolve '@genkit-ai\/firebase'/
      ];
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
  },
};

export default nextConfig;

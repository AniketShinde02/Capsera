'use client';

import { Search, Home, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce animation-delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* 404 Icon */}
        <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-8 shadow-2xl">
          <Search className="w-16 h-16 text-blue-600" />
        </div>

        {/* 404 Title */}
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
          Page Not Found
        </h2>

        {/* Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <p className="text-lg text-gray-300 mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-400">
            Don't worry, you can always find your way back to our amazing content!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
            <MapPin className="w-5 h-5 mr-2" />
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/features"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-300 text-sm"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-300 text-sm"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-300 text-sm"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-300 text-sm"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Can't find what you're looking for? Try our search or contact support.</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

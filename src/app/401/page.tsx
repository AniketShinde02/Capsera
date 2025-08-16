'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { Lock, Shield, AlertTriangle, Home, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';

// A simple home icon for the button
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// The main component for the professional 401 page
export default function Unauthorized401Page() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Set client flag when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect tracks the mouse's movement across the screen
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return () => {}; // Return empty cleanup function to maintain hook consistency
    }

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calculate the parallax translation for the icon
  // The icon will move slightly in the opposite direction of the mouse for a subtle effect
  const parallaxX = isClient ? (mousePosition.x / window.innerWidth - 0.5) * -30 : 0;
  const parallaxY = isClient ? (mousePosition.y / window.innerHeight - 0.5) * -30 : 0;

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLogin = () => {
    router.push('/admin/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
             {/* The mouse-tracking Icon */}
       <div
         className="relative w-48 h-48 md:w-56 md:h-56 mb-8 transition-transform duration-300 ease-out"
         style={{
           transform: isClient ? `translate(${parallaxX}px, ${parallaxY}px)` : 'none',
         }}
       >
        {/* Abstract Keyhole SVG */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <radialGradient id="glowGradient">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="darkGlowGradient">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>
            </defs>
            {/* Outer circle */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-gray-900 dark:text-gray-100" strokeWidth="4" />
            {/* Inner glowing circle */}
            <circle cx="100" cy="100" r="80" fill="url(#glowGradient)" className="animate-pulse dark:hidden" />
            <circle cx="100" cy="100" r="80" fill="url(#darkGlowGradient)" className="animate-pulse hidden dark:block" />
            {/* Keyhole shape */}
            <circle cx="100" cy="80" r="30" fill="currentColor" className="text-gray-900 dark:text-gray-100" />
            <path d="M 85 110 L 85 160 L 115 160 L 115 110 Z" fill="currentColor" className="text-gray-900 dark:text-gray-100" />
        </svg>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4">
          <span className="text-yellow-500 dark:text-blue-400">401</span> | Unauthorized
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 mb-6">
          Access to this resource is denied. You need to be logged in to view this page.
        </p>
        
                 {/* Security Info - Direct Display */}
         <div className="text-center max-w-sm mx-auto mb-6">
           <div className="flex justify-center mb-3">
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
               <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-blue-400" />
             </div>
           </div>
           <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
             Authentication Required
           </h2>
           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
             This page is protected and requires valid login credentials
           </p>
           
                       <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-yellow-800 dark:text-blue-300">What Happened?</span>
                </div>
                <p className="text-yellow-700 dark:text-blue-200 text-xs sm:text-sm leading-relaxed">
                  You tried to access a protected page without being authenticated. 
                  This is a security measure to protect user data and privacy.
                </p>
              </div>

              {showDetails && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">How to Fix</span>
                  </div>
                  <ul className="text-blue-700 dark:text-blue-200 text-xs sm:text-sm space-y-1 leading-relaxed">
                    <li>• Sign in with your existing account</li>
                    <li>• Create a new account if you don't have one</li>
                    <li>• Make sure you're using the correct credentials</li>
                    <li>• Check if your session has expired</li>
                  </ul>
                </div>
              )}

             <div className="flex items-center justify-center pt-1">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowDetails(!showDetails)}
                 className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs"
               >
                 {showDetails ? <EyeOff className="w-3 h-3 mr-1.5" /> : <Eye className="w-3 h-3 mr-1.5" />}
                 {showDetails ? 'Hide Details' : 'Show Details'}
               </Button>
             </div>
           </div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          onClick={handleGoHome}
          variant="outline"
          size="lg"
          className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <Home className="w-5 h-5 mr-3" />
          Go to Homepage
        </Button>
        
        <Button
          onClick={handleGoBack}
          variant="outline"
          size="lg"
          className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-3" />
          Go Back
        </Button>
        
        <Button
          onClick={handleLogin}
          size="lg"
          className="px-8 py-3 bg-yellow-400 dark:bg-blue-600 hover:bg-yellow-500 dark:hover:bg-blue-700 text-black dark:text-white border-2 border-transparent shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <LogIn className="w-5 h-5 mr-3" />
          Sign In
        </Button>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🛡️ This system is protected by authentication and security measures
        </p>
      </div>
      
      {/* Minimal CSS for animations */}
      <style>{`
        .animate-pulse {
            animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            50% {
                opacity: .7;
            }
        }
      `}</style>
    </div>
  );
}

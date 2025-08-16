"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FeatureDevelopmentPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/email-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          source: 'feature-development'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Subscription successful! Check your email to confirm.');
        setEmail('');
      } else {
        if (response.status === 409) {
          toast.info('📧 You\'re already subscribed! Check your email for updates.');
        } else {
          toast.error(data.error || 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 sm:py-6 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-lg sm:text-xl font-bold">🚧 Feature in Development</h2>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-amber-100 text-xs sm:text-sm">
            We're building something amazing for you. Currently working as a solo developer!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center relative p-4 sm:p-6">
        {/* Animated Character and Tools */}
        <div className="relative mb-6 sm:mb-8 w-48 h-60 sm:w-64 sm:h-80">
          {/* Floating Container */}
          <div className="character-container absolute bottom-8 sm:bottom-10 left-0 w-full h-full">
            {/* Character */}
            <div className="relative w-full h-full">
              {/* Body */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-t-full"></div>
              {/* Head */}
              <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-yellow-100 rounded-full border-4 border-gray-800">
                {/* Eyes */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-6 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                  <div id="left-pupil" className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-800 rounded-full"></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                  <div id="right-pupil" className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              {/* Hard Hat */}
              <div className="absolute bottom-36 sm:bottom-44 left-1/2 -translate-x-1/2 w-24 h-12 sm:w-32 sm:h-16 bg-yellow-400 rounded-t-full border-4 border-gray-800">
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-3 sm:w-36 sm:h-4 bg-yellow-400 border-4 border-gray-800 rounded-md"></div>
              </div>
              {/* Wrench */}
              <div className="wrench absolute bottom-6 sm:bottom-8 right-0 w-16 h-16 sm:w-20 sm:h-20 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.7,19.4l-1.4-1.4c-0.2-0.2-0.5-0.2-0.7,0l-1,1c-0.2,0.2-0.5,0.2-0.7,0l-1.6-1.6c-0.2-0.2-0.5-0.2-0.7,0l-1,1 c-0.2,0.2-0.5,0.2-0.7,0l-1.5-1.5c-0.2-0.2-0.5-0.2-0.7,0l-1,1c-0.2,0.2-0.5,0.2-0.7,0L9.8,14.8c-0.2-0.2-0.5-0.2-0.7,0l-1,1 c-0.2,0.2-0.5,0.2-0.7,0L6,14.4c-0.2-0.2-0.5-0.2-0.7,0L4.2,15.5c-1.4,1.4-1.4,3.6,0,5l1.4,1.4c0.4,0.4,0.8,0.5,1.3,0.5h1 c1.4,0,2.8-0.6,3.8-1.6l1.5-1.5c0.2-0.2,0.5-0.2,0.7,0l1,1c0.2,0.2,0.5,0.2,0.7,0l1.6-1.6c0.2-0.2,0.5-0.2,0.7,0l1,1 c0.2,0.2,0.5,0.2,0.7,0l1.5-1.5c-0.2-0.2-0.5-0.2-0.7,0l1-1c0.2-0.2,0.5-0.2,0.7,0l1.4,1.4c0.9,0.9,2.2,1.2,3.4,0.9 c1.2-0.3,2.2-1.3,2.5-2.5C23.9,21.6,23.6,20.3,22.7,19.4z M4.9,2.5C4.6,1.3,3.6,0.3,2.4,0C1.2,0.3,0.2,1.3,0,2.5 c-0.3,1.2,0,2.5,0.9,3.4l1.4,1.4c0.2,0.2,0.5,0.2,0.7,0l1-1c0.2-0.2,0.5-0.2,0.7,0l1.5,1.5c0.2,0.2,0.5-0.2,0.7,0l1-1 c0.2-0.2,0.5-0.2,0.7,0l1.6,1.6c0.2,0.2,0.5,0.2,0.7,0l1-1c0.2-0.2,0.5-0.2,0.7,0l1.5,1.5c0.2,0.2,0.5,0.2,0.7,0l1-1 c0.2-0.2,0.5,0.2,0.7,0l1.4-1.4c1.4-1.4,1.4-3.6,0-5L19.4,1.3c-0.4-0.4-0.8-0.5-1.3-0.5h-1c-1.4,0-2.8,0.6-3.8,1.6L11.8,4 c-0.2,0.2-0.5,0.2-0.7,0l-1-1c-0.2-0.2-0.5-0.2-0.7,0L7.8,4.6C7.6,4.8,7.3,4.8,7.1,4.6l-1-1C5.9,3.4,5.6,3.4,5.4,3.6L4,5.1 C3.8,5.3,3.5,5.3,3.3,5.1l-1-1C2.1,3.9,1.8,3.9,1.6,4.1L0.2,5.5C-0.7,6.4,1.2,4.8,4.9,2.5z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Shadow */}
          <div className="shadow absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-36 h-3 sm:w-48 sm:h-4 bg-gray-300 rounded-full"></div>

          {/* Floating Tools */}
          <div className="tool absolute top-0 left-[-40px] sm:left-[-50px] w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.964 15.964l-3.536-3.536m-4.242 0l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="tool absolute bottom-0 right-[-40px] sm:right-[-50px] w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" style={{animationDelay: '-2s'}}>
            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            New Feature in Progress!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
            We're currently building an exciting new feature for you. It's not quite ready yet, but we're working hard to get it launched soon!
          </p>

          {/* Email Signup */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full max-w-lg mx-auto mb-6 sm:mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[280px] px-4 py-3 sm:py-3 rounded-full border-2 border-border focus:border-primary transition duration-300 text-sm sm:text-base"
              required
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-6 py-3 rounded-full transition duration-300 shadow-lg w-full sm:w-auto min-w-[120px] text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Notify Me'
              )}
            </Button>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button asChild className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
              <Link href="/features">
                Explore Features
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>

            <Button asChild variant="ghost" className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .character-container {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .tool {
          animation: spin 8s linear infinite;
        }
        
        .wrench {
          animation: swing 3s ease-in-out infinite;
          transform-origin: top right;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes swing {
          0% { transform: rotate(10deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(10deg); }
        }
        
        .shadow {
           animation: shrink 6s ease-in-out infinite;
        }

        @keyframes shrink {
          0% { transform: scaleX(1); opacity: 0.5; }
          50% { transform: scaleX(0.85); opacity: 0.3; }
          100% { transform: scaleX(1); opacity: 0.5; }
        }
      `}</style>

      {/* Mouse tracking for eyes */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('mousemove', (e) => {
              const leftPupil = document.getElementById('left-pupil');
              const rightPupil = document.getElementById('right-pupil');
              const leftEye = leftPupil?.parentElement;
              const rightEye = rightPupil?.parentElement;

              const movePupil = (pupil, eye) => {
                if (!pupil || !eye) return;
                const rect = eye.getBoundingClientRect();
                const eyeCenterX = rect.left + rect.width / 2;
                const eyeCenterY = rect.top + rect.height / 2;
                const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
                const distance = Math.min(rect.width / 4, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY));
                
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                pupil.style.transform = \`translate(\${x}px, \${y}px)\`;
              };
              
              movePupil(leftPupil, leftEye);
              movePupil(rightPupil, rightEye);
            });
          `
        }}
      />
    </div>
  );
}

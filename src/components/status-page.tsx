"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface StatusPageProps {
  variant?: 'under-development' | 'maintenance' | 'coming-soon' | 'error-404' | 'error-500';
  title?: string;
  description?: string;
  showEmailSignup?: boolean;
  emailPlaceholder?: string;
  ctaButton?: {
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryButton?: {
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export function StatusPage({
  variant = 'under-development',
  title,
  description,
  showEmailSignup = true,
  emailPlaceholder = "Enter your email",
  ctaButton,
  secondaryButton,
  showBackButton = true,
  backButtonText = "Go Back",
  backButtonHref = "/"
}: StatusPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default configurations for each variant
  const variants = {
    'under-development': {
      title: "🚧 Feature Under Development",
      description: "We're working hard to bring you this amazing feature. Currently building our platform as a solo developer!",
      theme: "from-amber-600 to-orange-600",
      icon: "🚧",
      characterColor: "bg-yellow-400",
      borderColor: "border-yellow-400"
    },
    'maintenance': {
      title: "🔧 Site Maintenance",
      description: "We're performing some maintenance to improve your experience. We'll be back shortly!",
      theme: "from-blue-600 to-indigo-600",
      icon: "🔧",
      characterColor: "bg-blue-400",
      borderColor: "border-blue-400"
    },
    'coming-soon': {
      title: "🚀 Something Awesome is Coming!",
      description: "We're building something amazing for you. Stay tuned for the big reveal!",
      theme: "from-green-600 to-teal-600",
      icon: "🚀",
      characterColor: "bg-green-400",
      borderColor: "border-green-400"
    },
    'error-404': {
      title: "❌ Page Not Found",
      description: "Oops! The page you're looking for doesn't exist. Let's get you back on track.",
      theme: "from-red-600 to-pink-600",
      icon: "❌",
      characterColor: "bg-red-400",
      borderColor: "border-red-400"
    },
    'error-500': {
      title: "💥 Something Went Wrong",
      description: "We encountered an unexpected error. Our team has been notified and is working on it.",
      theme: "from-purple-600 to-pink-600",
      icon: "💥",
      characterColor: "bg-purple-400",
      borderColor: "border-purple-400"
    }
  };

  const config = variants[variant];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    // Simulate email submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmail('');
    // You can add actual email submission logic here
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${config.theme} text-white py-6 px-4`}>
        <div className="container mx-auto text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold">{finalTitle}</h2>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-white/90 text-sm">
            {finalDescription}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center relative p-4">
        {/* Animated Character and Tools */}
        <div className="relative mb-8 w-64 h-80">
          {/* Floating Container */}
          <div className="character-container absolute bottom-10 left-0 w-full h-full">
            {/* Character */}
            <div className="relative w-full h-full">
              {/* Body */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-800 rounded-t-full"></div>
              {/* Head */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-28 h-28 bg-yellow-100 rounded-full border-4 border-gray-800">
                {/* Eyes */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div id="left-pupil" className="w-3 h-3 bg-gray-800 rounded-full"></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div id="right-pupil" className="w-3 h-3 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              {/* Hard Hat */}
              <div className={`absolute bottom-44 left-1/2 -translate-x-1/2 w-32 h-16 ${config.characterColor} rounded-t-full border-4 border-gray-800`}>
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-36 h-4 ${config.characterColor} border-4 border-gray-800 rounded-md`}></div>
              </div>
              {/* Wrench */}
              <div className="wrench absolute bottom-8 right-0 w-20 h-20 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.7,19.4l-1.4-1.4c-0.2-0.2-0.5-0.2-0.7,0l-1,1c-0.2,0.2-0.5,0.2-0.7,0l-1.6-1.6c-0.2-0.2-0.5-0.2-0.7,0l-1,1 c-0.2,0.2-0.5,0.2-0.7,0l-1.5-1.5c-0.2-0.2-0.5-0.2-0.7,0l-1,1c-0.2,0.2-0.5,0.2-0.7,0L9.8,14.8c-0.2-0.2-0.5-0.2-0.7,0l-1,1 c-0.2,0.2-0.5,0.2-0.7,0L6,14.4c-0.2-0.2-0.5-0.2-0.7,0L4.2,15.5c-1.4,1.4-1.4,3.6,0,5l1.4,1.4c0.4,0.4,0.8,0.5,1.3,0.5h1 c1.4,0,2.8-0.6,3.8-1.6l1.5-1.5c0.2-0.2,0.5-0.2,0.7,0l1,1c0.2,0.2,0.5,0.2,0.7,0l1.6-1.6c0.2-0.2,0.5-0.2,0.7,0l1,1 c0.2,0.2,0.5,0.2,0.7,0l1.5-1.5c0.2-0.2,0.5-0.2,0.7,0l1-1c0.2-0.2,0.5-0.2,0.7,0l1.4,1.4c0.9,0.9,2.2,1.2,3.4,0.9 c1.2-0.3,2.2-1.3,2.5-2.5C23.9,21.6,23.6,20.3,22.7,19.4z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Shadow */}
          <div className="shadow absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-gray-300 rounded-full"></div>

          {/* Floating Tools */}
          <div className="tool absolute top-0 left-[-50px] w-12 h-12 md:w-16 md:h-16">
            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.964 15.964l-3.536-3.536m-4.242 0l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="tool absolute bottom-0 right-[-50px] w-12 h-12 md:w-16 md:h-16" style={{animationDelay: '-2s'}}>
            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {finalTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {finalDescription}
          </p>

          {/* Email Signup */}
          {showEmailSignup && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full px-4 mb-8">
              <Input
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full max-w-sm px-4 py-3 rounded-full border-2 border-border focus:border-primary transition duration-300"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${config.characterColor} text-gray-800 font-bold px-6 py-3 rounded-full hover:opacity-90 transition duration-300 shadow-lg w-full sm:w-auto`}
              >
                {isSubmitting ? 'Submitting...' : 'Notify Me'}
              </Button>
            </form>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {ctaButton && (
              <Button asChild className="px-6 py-3 rounded-full">
                <Link href={ctaButton.href}>
                  {ctaButton.text}
                </Link>
              </Button>
            )}
            
            {secondaryButton && (
              <Button asChild variant={secondaryButton.variant || 'outline'} className="px-6 py-3 rounded-full">
                <Link href={secondaryButton.href}>
                  {secondaryButton.text}
                </Link>
              </Button>
            )}

            {showBackButton && (
              <Button asChild variant="ghost" className="px-6 py-3 rounded-full">
                <Link href={backButtonHref}>
                  {backButtonText}
                </Link>
              </Button>
            )}
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

"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Star } from "lucide-react";

export function FloatingFeedbackWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Track caption generations and manage widget visibility
  useEffect(() => {
    const checkAndShowWidget = () => {
      // Get generation count from localStorage
      const generationCount = parseInt(localStorage.getItem('captionGenerationCount') || '0');
      const lastShown = localStorage.getItem('feedbackWidgetLastShown');
      const isDismissed = localStorage.getItem('feedbackWidgetDismissed');
      const now = Date.now();

      // Don't show if dismissed in this session
      if (isDismissed === 'true') {
        return;
      }

      // Show after 1st generation (with delay)
      if (generationCount === 1 && !lastShown) {
        setTimeout(() => {
          showWidget();
          localStorage.setItem('feedbackWidgetLastShown', now.toString());
        }, 3000); // 3 second delay after generation
      }
      // Show after 2nd generation (if not shown before)
      else if (generationCount === 2 && !lastShown) {
        setTimeout(() => {
          showWidget();
          localStorage.setItem('feedbackWidgetLastShown', now.toString());
        }, 2000); // 2 second delay
      }
      // Show after 3rd generation (if not shown before)
      else if (generationCount === 3 && !lastShown) {
        setTimeout(() => {
          showWidget();
          localStorage.setItem('feedbackWidgetLastShown', now.toString());
        }, 1500); // 1.5 second delay
      }
      // Show at random intervals after 3rd generation
      else if (generationCount >= 3 && lastShown) {
        const lastShownTime = parseInt(lastShown);
        const timeSinceLastShown = now - lastShownTime;

        // Show again after 2-5 minutes randomly
        if (timeSinceLastShown > 120000) { // 2 minutes minimum
          const randomDelay = Math.random() * 180000; // 0-3 minutes
          setTimeout(() => {
            showWidget();
            localStorage.setItem('feedbackWidgetLastShown', now.toString());
          }, randomDelay);
        }
      }
    };

    const showWidget = () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(false);
      }, 100);
    };

    // Check on mount
    checkAndShowWidget();

    // Listen for generation events
    const handleGeneration = () => {
      setTimeout(checkAndShowWidget, 1000);
    };

    // Listen for custom generation events
    window.addEventListener('captionGenerated', handleGeneration);

    // Check periodically for random showing
    const interval = setInterval(checkAndShowWidget, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('captionGenerated', handleGeneration);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
      // Mark as dismissed for this session
      localStorage.setItem('feedbackWidgetDismissed', 'true');
    }, 300);
  };

  const handleFeedbackClick = () => {
    // Open Google Form in new tab
    window.open('https://forms.gle/Crx8voztG1TQZmBg9', '_blank');

    // Track feedback click
    localStorage.setItem('feedbackWidgetClicked', 'true');

    // Close widget after clicking
    handleClose();
  };

  // Don't render if not visible
  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
        } ${isAnimating ? 'pointer-events-none' : ''}`}
    >
      {/* Main Feedback Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border border-blue-500/30 rounded-2xl shadow-2xl p-4 max-w-sm backdrop-blur-sm">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
          aria-label="Close feedback widget"
        >
          <X className="w-3 h-3 text-gray-300 group-hover:text-white" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Want a specific feature? 💡
            </h3>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              Tell us exactly what you need. We build what YOU ask for.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleFeedbackClick}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 group"
            >
              <Star className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span>Request Feature</span>
            </button>
          </div>
        </div>

        {/* Subtle animation indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse opacity-70"></div>
      </div>

      {/* Mobile positioning adjustment */}
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed.bottom-6.right-6 {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: calc(100vw - 2rem);
          }
        }
      `}</style>
    </div>
  );
}

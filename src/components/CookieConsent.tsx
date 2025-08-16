'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Cookie, Settings, X, Shield, Info, Palette } from 'lucide-react';
import Link from 'next/link';
import { 
  CookiePreferences, 
  trackUserAction, 
  personalizeExperience 
} from '@/lib/cookie-utils';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay to avoid flash
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
        
        // Apply preferences immediately
        applyPreferences(savedPreferences);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    // Apply analytics consent
    if (prefs.analytics) {
      console.log('✅ Analytics cookies enabled');
      // Initialize analytics here
      initializeAnalytics();
    }
    
    // Apply marketing consent
    if (prefs.marketing) {
      console.log('✅ Marketing cookies enabled');
      // Initialize marketing pixels here
      initializeMarketingPixels();
    }
    
    // Apply functional consent
    if (prefs.functional) {
      console.log('✅ Functional cookies enabled');
      // Load user preferences and personalize
      personalizeExperience();
    }
  };

  const initializeAnalytics = () => {
    // Initialize your analytics service here
    // Example: Google Analytics, Mixpanel, etc.
    console.log('📊 Initializing analytics...');
    
    // Track that user accepted analytics
    trackUserAction('cookie_consent_analytics_accepted');
  };

  const initializeMarketingPixels = () => {
    // Initialize marketing pixels here
    // Example: Facebook Pixel, Google Ads, etc.
    console.log('📢 Initializing marketing pixels...');
    
    // Track that user accepted marketing cookies
    trackUserAction('cookie_consent_marketing_accepted');
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
    
    // Track the acceptance
    trackUserAction('cookie_consent_all_accepted');
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
    setShowBanner(false);
    
    // Track the acceptance
    trackUserAction('cookie_consent_necessary_only_accepted');
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
    
    // Track the custom preferences
    trackUserAction('cookie_consent_custom_saved', { preferences });
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    
    // Apply the preferences immediately
    applyPreferences(prefs);
    
    console.log('🍪 Cookie preferences saved and applied:', prefs);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      {/* Cookie Banner - Mobile First Responsive */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-50 animate-in slide-in-from-bottom-4 sm:slide-in-from-left-4 duration-700 ease-out">
          <Card className="w-full sm:w-auto sm:max-w-md border-border shadow-2xl bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Cookie className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      By continuing to use this site, you agree to our use of cookies for analytics and personalized content.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button 
                      onClick={acceptAll} 
                      size="sm"
                      className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Accept All
                    </Button>
                    <Button 
                      onClick={openSettings} 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm font-medium rounded-lg border-border hover:bg-muted/40"
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={closeBanner}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-lg hover:bg-muted/40"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cookie Settings Dialog - Mobile First Responsive */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              Customize how we use cookies to improve your experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-foreground">Essential Cookies</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Required for basic functionality</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Always Active</Badge>
              </div>
            </div>
            
            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-foreground">Analytics Cookies</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Help us improve our service</p>
                  </div>
                </div>
                <Checkbox 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => updatePreference('analytics', checked as boolean)}
                  className="rounded-md"
                />
              </div>
            </div>
            
            {/* Personalization Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-foreground">Personalization</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Customize your experience</p>
                  </div>
                </div>
                <Checkbox 
                  checked={preferences.personalization} 
                  onCheckedChange={(checked) => updatePreference('personalization', checked as boolean)}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
            <Button 
              onClick={savePreferences} 
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base font-medium rounded-lg"
            >
              Save Preferences
            </Button>
            <Button 
              onClick={() => setShowSettings(false)} 
              variant="outline" 
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base font-medium rounded-lg border-border hover:bg-muted/40"
            >
              Cancel
            </Button>
          </div>
          
          <div className="pt-4 sm:pt-6 border-t border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
              <p>
                Learn more about our{' '}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-2">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/cookies" className="text-primary hover:underline underline-offset-2">
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


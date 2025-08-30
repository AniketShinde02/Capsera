import { getCookie, setCookie } from 'cookies-next';

// Cookie consent types
export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

// Cookie preferences type (for components)
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

// Default consent (only necessary cookies enabled)
const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false
};

// Get current cookie consent
export const getCookieConsent = (): CookieConsent => {
  try {
    const consent = getCookie('cookie-consent');
    if (consent) {
      return JSON.parse(consent as string);
    }
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
  }
  return DEFAULT_CONSENT;
};

// Set cookie consent
export const setCookieConsent = (consent: Partial<CookieConsent>) => {
  const currentConsent = getCookieConsent();
  const newConsent = { ...currentConsent, ...consent };
  
  // Set cookie for 1 year
  setCookie('cookie-consent', JSON.stringify(newConsent), {
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  });
  
  // Initialize features based on consent
  initializeFeatures(newConsent);
  
  return newConsent;
};

// Check if specific consent is given
export const hasConsent = (type: keyof CookieConsent): boolean => {
  const consent = getCookieConsent();
  return consent[type] || false;
};

// Initialize features based on consent
export const initializeFeatures = (consent: CookieConsent) => {
  if (consent.analytics) {
    initializeAnalytics();
  }
  
  if (consent.functional) {
    initializePersonalization();
  }
  
  if (consent.marketing) {
    initializeMarketing();
  }
};

// Analytics tracking (only if consent given)
export const trackUserAction = (action: string, data?: any) => {
  if (hasConsent('analytics')) {
    // Send to your analytics endpoint
    console.log('📊 Analytics Event:', action, data);
    
    // Safely serialize data to avoid circular references
    let safeData = data;
    try {
      // Check if data is null/undefined before serializing
      if (data !== null && data !== undefined) {
        // Try to serialize and deserialize to ensure it's safe
        safeData = JSON.parse(JSON.stringify(data));
      } else {
        safeData = {
          type: 'null_or_undefined',
          timestamp: Date.now()
        };
      }
    } catch (error) {
      // If serialization fails, create a safe version
      console.warn('Data contains circular references, creating safe version:', error);
      safeData = {
        type: typeof data,
        hasData: !!data,
        timestamp: Date.now()
      };
    }
    
    // Track to your own analytics system
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action, 
        data: safeData, 
        timestamp: Date.now(),
        userId: getCurrentUserId(),
        sessionId: getSessionId()
      })
    }).catch(err => console.log('Analytics tracking failed:', err));
    
    // Google Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, safeData);
    }
  }
};

// Track caption generation (practical analytics)
export const trackCaptionGeneration = (data: {
  mood: string;
  imageSize: number;
  processingTime: number;
  success: boolean;
  error?: string;
}) => {
  trackUserAction('caption_generated', {
    ...data,
    category: 'caption_generation',
    timestamp: Date.now()
  });
};

// Track user engagement (practical analytics)
export const trackEngagement = (action: string, data?: any) => {
  trackUserAction(action, {
    ...data,
    category: 'engagement',
    timestamp: Date.now()
  });
};

// Personalization features (only if consent given)
export const saveUserPreference = (key: string, value: any) => {
  if (hasConsent('functional')) {
    try {
      const preferences = getUserPreferences();
      preferences[key] = value;
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
      console.log('💾 User preference saved:', key, value);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  }
};

export const getUserPreference = (key: string, defaultValue?: any) => {
  if (hasConsent('functional')) {
    try {
      const preferences = getUserPreferences();
      return preferences[key] ?? defaultValue;
    } catch (error) {
      console.error('Error getting preference:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem('user-preferences');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting preferences:', error);
    return {};
  }
};

// Theme personalization (practical feature)
export const saveUserTheme = (theme: 'light' | 'dark' | 'system') => {
  saveUserPreference('theme', theme);
  applyTheme(theme);
};

export const getUserTheme = (): 'light' | 'dark' | 'system' => {
  return getUserPreference('theme', 'system');
};

export const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    }
  }
};

// Mood preferences (practical personalization)
export const saveFavoriteMood = (mood: string) => {
  const favorites = getUserPreference('favoriteMoods', []);
  if (!favorites.includes(mood)) {
    favorites.push(mood);
    saveUserPreference('favoriteMoods', favorites);
  }
};

export const getFavoriteMoods = (): string[] => {
  return getUserPreference('favoriteMoods', []);
};



// Initialize analytics
const initializeAnalytics = () => {
  console.log('📊 Analytics initialized');
  // You can add Google Analytics, Mixpanel, etc. here
};

// Initialize personalization
const initializePersonalization = () => {
  console.log('🎨 Personalization initialized');
  
  // Apply saved theme
  const theme = getUserTheme();
  if (theme) {
    applyTheme(theme);
  }
  
  // Apply other saved preferences
  const preferences = getUserPreferences();
  if (preferences.language) {
    // Apply language preference
  }
};

// Initialize marketing
const initializeMarketing = () => {
  console.log('📢 Marketing initialized');
  // You can add Facebook Pixel, Google Ads, etc. here
};

// Utility functions
const getCurrentUserId = (): string | null => {
  // Get from your auth system
  return null;
};

const getSessionId = (): string => {
  return Math.random().toString(36).substring(2);
};

// Check if features should be loaded
export const shouldLoadAnalytics = (): boolean => hasConsent('analytics');
export const shouldLoadFunctional = (): boolean => hasConsent('functional');
export const shouldLoadMarketing = (): boolean => hasConsent('marketing');
export const shouldLoadMarketingPixels = (): boolean => hasConsent('marketing');

// Personalize experience based on user preferences
export const personalizeExperience = () => {
  if (hasConsent('functional')) {
    const theme = getUserTheme();
    if (theme) {
      applyTheme(theme);
    }
    
    const preferences = getUserPreferences();
    if (preferences.language) {
      // Apply language preference
      console.log('🎨 Experience personalized based on user preferences');
    }
  }
};

// Track page views
export const trackPageView = (page: string, title?: string) => {
  if (hasConsent('analytics')) {
    trackUserAction('page_view', { page, title, timestamp: Date.now() });
  }
};

// Get cookie consent status for display
export const getCookieConsentStatus = () => {
  const consent = getCookieConsent();
  return {
    necessary: consent.necessary,
    analytics: consent.analytics,
    functional: consent.functional,
    marketing: consent.marketing
  };
};

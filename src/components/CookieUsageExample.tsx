'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  hasConsent, 
  trackUserAction, 
  trackEngagement, 
  personalizeExperience,
  getCookieConsentStatus,
  shouldLoadAnalytics,
  shouldLoadMarketingPixels
} from '@/lib/cookie-utils';

/**
 * Example component showing how to use cookie utilities throughout the app
 * This demonstrates how to conditionally enable features based on user consent
 */
export default function CookieUsageExample() {
  const [consentStatus, setConsentStatus] = useState(getCookieConsentStatus());
  const [personalizedContent, setPersonalizedContent] = useState<string>('');

  useEffect(() => {
    // Check if we should personalize the experience
    if (hasConsent('functional')) {
      personalizeExperience();
      setPersonalizedContent('🎨 Your experience is personalized based on your preferences!');
    }

    // Track page view if analytics consent is given
    if (hasConsent('analytics')) {
      trackPageView('/example', 'Cookie Usage Example');
    }
  }, []);

  const handleFeatureClick = (feature: string) => {
    // Track user engagement
    trackEngagement('feature_clicked', { feature, timestamp: Date.now() });
    
    // Show different content based on marketing consent
    if (hasConsent('marketing')) {
      alert(`🎯 Thanks for trying ${feature}! We'll show you relevant content.`);
    } else {
      alert(`Thanks for trying ${feature}!`);
    }
  };

  const refreshConsentStatus = () => {
    setConsentStatus(getCookieConsentStatus());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🍪 Cookie Usage Example
          <Badge variant="outline">Demo Component</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consent Status Display */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Consent Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>Analytics:</span>
              <Badge variant={consentStatus.analyticsEnabled ? "default" : "secondary"}>
                {consentStatus.analyticsEnabled ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Marketing:</span>
              <Badge variant={consentStatus.marketingEnabled ? "default" : "secondary"}>
                {consentStatus.marketingEnabled ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Functional:</span>
              <Badge variant={consentStatus.functionalEnabled ? "default" : "secondary"}>
                {consentStatus.functionalEnabled ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Decision Made:</span>
              <Badge variant={consentStatus.hasMadeDecision ? "default" : "secondary"}>
                {consentStatus.hasMadeDecision ? "✅ Yes" : "❌ No"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Personalized Content */}
        {personalizedContent && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">{personalizedContent}</p>
          </div>
        )}

        {/* Feature Buttons */}
        <div className="space-y-2">
          <h4 className="font-medium">Try These Features:</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={() => handleFeatureClick('Caption Generator')}
              variant="outline"
            >
              Generate Caption
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleFeatureClick('Image Upload')}
              variant="outline"
            >
              Upload Image
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleFeatureClick('Settings')}
              variant="outline"
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Analytics Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Analytics & Marketing Status:</h4>
          <div className="text-sm space-y-1">
            <p>📊 Analytics Loading: {shouldLoadAnalytics() ? "✅ Yes" : "❌ No"}</p>
            <p>📢 Marketing Pixels: {shouldLoadMarketingPixels() ? "✅ Yes" : "❌ No"}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="pt-2">
          <Button 
            onClick={refreshConsentStatus} 
            size="sm" 
            variant="outline"
          >
            🔄 Refresh Consent Status
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>How to test:</strong> Go to the main page, change your cookie preferences, 
            then return here to see how the component responds to different consent levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for page tracking
const trackPageView = (page: string, title?: string) => {
  if (hasConsent('analytics')) {
    trackUserAction('page_view', { page, title, timestamp: Date.now() });
  }
};

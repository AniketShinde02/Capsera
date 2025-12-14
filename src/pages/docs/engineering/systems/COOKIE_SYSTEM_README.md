# 🍪 Cookie Consent System

This document explains how the new cookie consent system works in CaptionCraft and how to use it throughout the application.

## 🎯 What This System Does

The cookie consent system now:

1. **Only appears on the main/landing page** - not on other pages
2. **Saves user preferences** in localStorage for future use
3. **Provides utility functions** to check consent throughout the app
4. **Enables conditional features** based on user consent
5. **Tracks user actions** only when analytics consent is given
6. **Personalizes experience** when functional cookies are enabled

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── CookieConsent.tsx          # Main cookie consent component (main page only)
│   └── CookieUsageExample.tsx     # Example of how to use cookie utilities
├── lib/
│   └── cookie-utils.ts            # Utility functions for the entire app
└── app/
    ├── layout.tsx                 # Main layout (no cookie consent)
    └── page.tsx                   # Main page (with cookie consent)
```

### Key Components

1. **CookieConsent.tsx** - The actual cookie banner/dialog
2. **cookie-utils.ts** - Utility functions for checking consent and tracking
3. **CookieUsageExample.tsx** - Example component showing usage patterns

## 🚀 How to Use

### 1. Check User Consent

```typescript
import { hasConsent } from '@/lib/cookie-utils';

// Check if user has consented to analytics
if (hasConsent('analytics')) {
  // Load analytics, track events, etc.
}

// Check if user has consented to marketing
if (hasConsent('marketing')) {
  // Load marketing pixels, show ads, etc.
}

// Check if user has consented to functional cookies
if (hasConsent('functional')) {
  // Remember preferences, personalize experience
}
```

### 2. Track User Actions

```typescript
import { trackUserAction, trackEngagement } from '@/lib/cookie-utils';

// Track a specific action (only if analytics consent given)
trackUserAction('button_clicked', { button: 'submit', page: '/generate' });

// Track user engagement
trackEngagement('feature_used', { feature: 'caption_generator', duration: 5000 });
```

### 3. Personalize User Experience

```typescript
import { personalizeExperience, getUserTheme, saveUserTheme } from '@/lib/cookie-utils';

// Personalize based on functional cookie consent
if (hasConsent('functional')) {
  const theme = getUserTheme();
  if (theme) {
    // Apply user's preferred theme
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Save user preferences (only if functional cookies enabled)
saveUserTheme('dark');
```

### 4. Conditional Feature Loading

```typescript
import { shouldLoadAnalytics, shouldLoadMarketingPixels } from '@/lib/cookie-utils';

// Only load analytics if consent given
if (shouldLoadAnalytics()) {
  // Initialize Google Analytics, Mixpanel, etc.
  initializeAnalytics();
}

// Only load marketing pixels if consent given
if (shouldLoadMarketingPixels()) {
  // Load Facebook Pixel, Google Ads, etc.
  loadMarketingPixels();
}
```

## 📊 Cookie Types

### 1. Necessary Cookies (Always Enabled)
- **Purpose**: Basic site functionality, security, authentication
- **Cannot be disabled**: These are essential for the site to work
- **Examples**: Session tokens, CSRF tokens, authentication cookies

### 2. Analytics Cookies (Optional)
- **Purpose**: Understand user behavior, improve site performance
- **Benefits**: Better user experience, site optimization
- **Examples**: Google Analytics, Mixpanel, heatmaps

### 3. Marketing Cookies (Optional)
- **Purpose**: Show relevant ads, measure campaign effectiveness
- **Benefits**: Personalized content, relevant advertisements
- **Examples**: Facebook Pixel, Google Ads, social media pixels

### 4. Functional Cookies (Optional)
- **Purpose**: Remember preferences, personalize experience
- **Benefits**: Better user experience, saved settings
- **Examples**: Theme preferences, language settings, user preferences

## 🔧 Integration Examples

### Google Analytics Integration

```typescript
import { hasConsent, trackUserAction } from '@/lib/cookie-utils';

// Only initialize GA if consent given
if (hasConsent('analytics')) {
  // Initialize Google Analytics
  window.gtag('config', 'GA_MEASUREMENT_ID');
}

// Track custom events
const trackButtonClick = (buttonName: string) => {
  trackUserAction('button_click', { button: buttonName });
};
```

### Theme System Integration

```typescript
import { hasConsent, getUserTheme, saveUserTheme } from '@/lib/cookie-utils';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getUserTheme() || 'system');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    
    // Only save if functional cookies enabled
    if (hasConsent('functional')) {
      saveUserTheme(newTheme);
    }
    
    // Apply theme
    applyTheme(newTheme);
  };

  return (
    <select value={theme} onChange={(e) => handleThemeChange(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
};
```

### Marketing Pixel Integration

```typescript
import { shouldLoadMarketingPixels } from '@/lib/cookie-utils';

const MarketingPixels = () => {
  useEffect(() => {
    if (shouldLoadMarketingPixels()) {
      // Load Facebook Pixel
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    }
  }, []);

  return null; // This component doesn't render anything
};
```

## 🧪 Testing the System

### 1. Test on Main Page
- Visit the main page (`/`)
- You should see the cookie consent banner
- Try different consent options

### 2. Test on Other Pages
- Visit any other page (e.g., `/features`, `/about`)
- Cookie consent should NOT appear
- User preferences are still active

### 3. Test Consent Persistence
- Accept cookies on main page
- Navigate to other pages
- Return to main page
- Banner should not appear again

### 4. Test Utility Functions
- Use the `CookieUsageExample` component to see how utilities work
- Check browser console for tracking logs
- Verify localStorage contains saved preferences

## 📝 Browser Storage

The system uses localStorage to store:

```json
{
  "cookie-consent": "true",
  "cookie-preferences": {
    "necessary": true,
    "analytics": true,
    "marketing": false,
    "functional": true
  },
  "user-theme": "dark"
}
```

## 🚨 Important Notes

### 1. Server-Side Rendering
- Cookie utilities check for `window` object
- They return `null` or `false` on server-side
- Always handle the case where preferences might not be available

### 2. Privacy Compliance
- System respects user choices
- No tracking without explicit consent
- Easy to withdraw consent
- Clear information about what each cookie type does

### 3. Performance
- Analytics and marketing code only loads when consented
- No unnecessary tracking or pixel loading
- Preferences are cached in localStorage for fast access

## 🔮 Future Enhancements

### 1. Server-Side Integration
- Store preferences in database for logged-in users
- Sync preferences across devices
- Admin dashboard for consent management

### 2. Advanced Analytics
- Consent-aware analytics dashboard
- Privacy-focused metrics
- User behavior insights (with consent)

### 3. A/B Testing
- Consent-aware feature flags
- Personalized content delivery
- User preference learning

## 🆘 Troubleshooting

### Common Issues

1. **Cookie banner not showing on main page**
   - Check if `CookieConsent` is imported in `src/app/page.tsx`
   - Verify it's not in the main layout

2. **Cookie banner showing on other pages**
   - Ensure `CookieConsent` is removed from `src/app/layout.tsx`
   - Check that it's only in the main page

3. **Preferences not saving**
   - Check browser console for errors
   - Verify localStorage is enabled
   - Check if user has made a consent decision

4. **Tracking not working**
   - Verify analytics consent is given
   - Check browser console for tracking logs
   - Ensure utility functions are imported correctly

### Debug Mode

Enable debug logging by checking the browser console:

```typescript
// Check current consent status
console.log('Cookie Status:', getCookieConsentStatus());

// Check specific consent
console.log('Analytics enabled:', hasConsent('analytics'));
console.log('Marketing enabled:', hasConsent('marketing'));
console.log('Functional enabled:', hasConsent('functional'));
```

## 📚 Additional Resources

- [GDPR Cookie Consent Guidelines](https://gdpr.eu/cookies/)
- [Next.js localStorage Best Practices](https://nextjs.org/docs/basic-features/data-fetching)
- [Privacy-First Analytics](https://plausible.io/privacy-focused-web-analytics)

---

**Remember**: Always respect user privacy and only collect data that users have explicitly consented to. This system makes it easy to be compliant while still providing valuable insights and personalization.

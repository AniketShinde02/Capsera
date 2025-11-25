# Changelog

All notable changes to the Capsera AI Caption Generator project are documented in this file.

## [2025-11-25] - UI Overhaul & Page Deprecation

### 🎨 UI/UX Enhancements
- **Homepage Transformation**: Completely revamped the homepage with modern, interactive components.
  - **Magic Showcase**: Added "See the Magic in Action" section with animated scanning beam, dynamic tag detection, and live confidence meter.
  - **Features Grid**: Implemented "Why Choose Our AI" section using a Bento Grid layout with interactive elements (loading bars, scrolling tickers).
  - **Testimonials**: Replaced static FAQ with a "Wall of Love" masonry grid for user testimonials.
- **Animations**: Added global CSS animations for scanning effects, gradients, and loading bars.
- **Dark Mode Fix**: Fixed visibility issue with the "Refresh" button in the admin dashboard where text was unreadable in dark mode.
- **Admin Dashboard Overhaul**: Transformed the admin dashboard with "Magic" UI components.
  - **Real Data**: Replaced mock/static data with real-time analytics from MongoDB (User growth, Post history, System load).
  - **Sparklines**: Added 7-day trend sparklines to overview cards for better visual insights.
  - **Magic Cards**: Implemented glassmorphic cards with gradient effects and hover animations.
  - **System Load**: improved accuracy of system load metric based on active database connections.
- **Advanced Analytics**: Upgraded the Analytics page with real-time data and "Magic" UI.
  - **Real Metrics**: Implemented MongoDB aggregations for User Growth, Retention, Engagement, and Conversion rates.
  - **Visuals**: Replaced standard cards with `MagicCard` components featuring gradients and glassmorphism.
  - **Charts**: Connected charts to real API data for visualizing user and post activity over time.
- **Admin UI Overhaul**: Applied "Magic" UI and real data integration to all core admin pages.
  - **Users**: Enhanced user management with real-time stats and glassmorphic tables.
  - **Roles**: Upgraded role management with quick tier actions and visual stats.
  - **Database**: Improved database monitoring with real-time collection stats and connection metrics.
- **Documentation**: Added comprehensive [Admin Panel Features Guide](docs/ADMIN_PANEL_FEATURES.md) and updated help docs.

### 🧹 Deprecation & Cleanup
- **Page Relocation**: Moved redundant pages to `src/app/deprecated/` to declutter the active codebase while preserving history.
  - `src/app/setup` → `src/app/deprecated/setup`
  - `src/app/settings` → `src/app/deprecated/settings`
- **Link Updates**: Fixed all broken links resulting from the deprecation.
  - **Profile Page**: Updated "Preferences" button to scroll to the settings section on the profile page instead of navigating to `/settings`.
  - **Admin Header**: Removed the deprecated "Settings" link from the user dropdown.
  - **Unauthorized Page**: Redirects now point to the active `/admin/setup` page.
  - **Admin Layout**: Unauthenticated admin access now redirects to Home (`/`) instead of the deprecated setup page.
  - **Unsubscribe Page**: Updated link to point to `/profile` instead of `/settings`.

## [2025-11-25] - Auth UI Restoration & Admin Access Integration

### 🚀 Added
- **Admin Access**: Integrated a secure, multi-step "Register as Admin" flow directly into the Auth Form.
  - **System Verification**: Requires a system-level password to unlock.
  - **OTP Verification**: Implemented a 6-digit OTP email verification step for admin creation.
  - **Dual Mode**: Supports both creating a new admin account and logging in as an existing admin.
- **Social Logins**: Added UI buttons for Google and Apple sign-in (backend integration pending).
- **Forgot Password**: Added a dedicated "Forgot Password" tab and flow.

### 🎨 UI/UX Improvements
- **Auth Form Restoration**: Completely reverted and refined the `AuthForm` UI to match the original dark-themed design.
  - **Dark Mode Perfection**: Deep space black backgrounds (`bg-slate-900`) with high-contrast white text.
  - **Light Mode Support**: Implemented a clean, Vercel-inspired light mode with semantic colors (`bg-background`, `text-foreground`).
  - **Input Styling**: Fixed input fields to adapt perfectly to both themes (no more white inputs in dark mode).
  - **Tab Contrast**: Enhanced the contrast of the Sign In/Sign Up toggle for better visibility.
  - **Button Aesthetics**: Upgraded primary buttons with a vibrant Blue-to-Indigo gradient and glow effects.
- **Visual Polish**: Added smooth transitions, focus rings, and better spacing throughout the form.

### 🔧 Fixed
- **Admin Button Placement**: Moved the "Register as Admin" button to the Sign Up tab only, keeping the Sign In flow clean.
- **Button Text**: Renamed "Create Account" to "Sign Up" for consistency.
- **Theme Consistency**: Ensured all modal elements (close button, headers, inputs) respect the active theme.

## [2025-11-25] - Critical Fixes & Smart UX Enhancements

### 🚀 Added
- **Smart UX**: "Generate Another Set" now preserves your selected Mood and Description, so you don't have to re-enter them!
- **Restored Functionality**: Brought back missing features like animated image deletion and paste-to-upload.

### 🐛 Fixed
- **Critical Crash**: Fixed a major issue where the app would crash during caption generation due to a broken error handler.
- **Image Upload**: Fixed issues with image pasting and URL uploads not working correctly.
- **Code Quality**: Cleaned up a lot of messy code to make the app more stable and reliable.
- **Type Safety**: Fixed all TypeScript errors in the caption generator component.
- **Content Safety**: Upgraded AI model from deprecated `gemini-pro-vision` to `gemini-1.5-flash` to fix 404 errors and ensure robust safety checks.
- **Strict Safety Enforcement**: Removed "fail-open" logic in development mode; safety checks are now strictly enforced in all environments.
- **Quota Consumption**: Fixed a bug where quota was consumed even for failed or rejected requests. Quota is now only deducted after successful caption generation.
- **Caption Display**: Fixed a UI bug where generated captions were not being displayed despite successful generation.
- **Rate Limit Admin**: Fixed a 500 error in the admin dashboard caused by an unregistered Mongoose model schema.
- **Logging**: Reduced excessive console logging to improve performance and developer experience.

### ⚡ Enhanced
- **AI Model**: Switched primary caption generation to **Gemini 1.5 Flash** (multimodal) for true image analysis, replacing the text-only Groq fallback. Captions are now generated based on actual image content + mood + description.

### 🧹 Cleanup
- **API Consolidation**: Moved 5 unused duplicate API endpoints (`-fast`, `-lightning`, `-rocket`, `-ultra-fast`, `-multi`) to `_deprecated` folder. Only `/api/generate-captions` is actively used and maintained.
- **Rate Limiter Consolidation**: Moved 2 unused rate limiters (`rate-limit.ts`, `rate-limit-simple.ts`) to `_deprecated_rate_limiters`. Active system uses `consolidated-rate-limiter` + `freemium-rate-limiter`.

### 🔧 Fixed (Admin)
- **Rate Limit Reset**: Fixed admin rate limit reset to work with the ACTIVE `freemium_usage` collection. Previously only reset the old `RateLimit` collection, causing frontend to not reflect changes.
- **Unified Email Provider**: Added `email-providers` folder with Brevo, Octopus, SMTP implementations and a factory for provider selection.
- **Email Queue**: Introduced `OutboundEmail` model and `email-dispatcher` to queue emails, enabling retry and status tracking.
- **DB Optimisation**: Switched `freemium_usage` updates to atomic `$inc` pattern, added index audit script, and moved legacy rate limit files to `_deprecated_rate_limiters`.
- **Background Worker**: Prepared `email-worker` (pseudo‑code) to process queued emails.
- **Documentation**: Updated docs for email system and DB optimisation.
- **Flash Logout Fix**: Implemented server-side session passing in `layout.tsx` and `Providers.tsx` to eliminate the "Sign Up" -> "Profile" flash on page load. The UI now renders the correct auth state instantly.



### 🚀 Added
- **Lazy Loading**: Implemented lazy loading for all images to improve initial page load performance
- **Loading States**: Added loading spinners and skeleton animations for better user feedback
- **Image Preloading**: Added preloading for Cloudinary images to improve perceived performance
- **Smart Image Rendering**: Implemented intelligent image rendering based on URL type (object URLs vs Cloudinary URLs)
- **Memory Management**: Added proper cleanup for object URLs to prevent memory leaks
- **Performance Monitoring**: Added image load time tracking and memory usage monitoring
- **Error Handling**: Enhanced error handling with graceful fallbacks and user-friendly messages
- **TypeScript Improvements**: Added comprehensive type safety and proper type guards

### 🔧 Changed
- **Image Rendering**: Replaced Next.js Image component with regular `<img>` tags for better compatibility
- **Button Flow**: Optimized button workflow from double-click to single-click operation
- **Button Text**: Changed "Generate Another Set" to "Upload New Image" for better clarity
- **Messaging**: Updated terminology from "delete" to "archive" for consistency
- **State Management**: Improved state synchronization for image display and button states
- **User Experience**: Enhanced visual feedback and loading states throughout the application

### 🐛 Fixed
- **Image Display Issue**: Fixed images not displaying after caption generation for logged-in users
- **Profile Page Images**: Fixed images not visible in caption history cards (downloadable but not visible)
- **Button Double-Click**: Eliminated double-click requirement for generating new captions
- **Memory Leaks**: Fixed memory leaks from unrevoked object URLs
- **TypeScript Errors**: Fixed type safety issues with DOM element access
- **Error Handling**: Improved error handling for image loading failures
- **State Synchronization**: Fixed inconsistent state between frontend and backend

### 🎨 UI/UX Improvements
- **Loading Animations**: Added smooth loading animations and skeleton screens
- **Visual Feedback**: Improved visual feedback for all user interactions
- **Mobile Optimization**: Enhanced mobile experience with responsive design improvements
- **Accessibility**: Improved accessibility with better focus management and screen reader support
- **Error States**: Added professional error placeholders instead of broken image icons

### ⚡ Performance
- **Bundle Size**: Optimized bundle sizes (Main: 25.4 kB, Profile: 23.5 kB)
- **Loading Speed**: Improved initial page load with lazy loading implementation
- **Memory Usage**: Reduced memory usage with proper object URL cleanup
- **Core Web Vitals**: Enhanced LCP, CLS, and FID scores
- **Mobile Performance**: Optimized for mobile devices and slower connections

### 🔒 Security
- **Image Validation**: Enhanced image file validation and sanitization
- **URL Sanitization**: Added URL sanitization for image sources
- **Error Reporting**: Improved error reporting without exposing sensitive information

### 📱 Mobile
- **Touch Optimization**: Improved touch interactions and button sizes
- **Responsive Design**: Enhanced responsive design for all screen sizes
- **Performance**: Optimized performance for mobile devices
- **Battery Efficiency**: Reduced CPU usage with lazy loading

### 🧪 Testing
- **Unit Tests**: Added comprehensive unit tests for image handling functions
- **Integration Tests**: Added integration tests for complete user workflows
- **Error Testing**: Added tests for error scenarios and edge cases
- **Performance Testing**: Added performance monitoring and testing

### 📚 Documentation
- **Technical Documentation**: Added comprehensive technical implementation details
- **User Guide**: Updated user guides with new workflow information
- **API Documentation**: Updated API documentation for image handling
- **Performance Guide**: Added performance optimization guidelines

## [Previous Versions]

### [2024-XX-XX] - Initial Release
- Initial implementation of AI caption generator
- Basic image upload and processing
- User authentication system
- Admin dashboard functionality
- Basic responsive design

---

## Migration Guide

### For Developers
1. **Update Dependencies**: Ensure all dependencies are up to date
2. **Review Image Components**: Replace any remaining Next.js Image components with regular img tags
3. **Update State Management**: Review and update state management for image handling
4. **Test Error Handling**: Verify error handling works correctly in your environment
5. **Performance Testing**: Run performance tests to ensure optimizations are working

### For Users
1. **Clear Browser Cache**: Clear browser cache to ensure latest version loads
2. **Update Bookmarks**: Update any bookmarked pages if needed
3. **Report Issues**: Report any issues with the new image display functionality
4. **Feedback**: Provide feedback on the new user experience improvements

## Breaking Changes
- **Image Component**: Next.js Image component replaced with regular img tags
- **Button Behavior**: Button workflow changed from double-click to single-click
- **State Management**: Some internal state management changes (no user-facing impact)

## Deprecated Features
- **Next.js Image Component**: Deprecated in favor of regular img tags for better compatibility
- **Double-Click Workflow**: Deprecated in favor of single-click workflow

## Known Issues
- None currently known

## Future Roadmap
- Progressive image loading implementation
- WebP format support
- Advanced caching strategies
- Service worker implementation
- Drag-and-drop image upload
- Batch image processing

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles.

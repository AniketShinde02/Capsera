## [2025-12-09] - AI Infrastructure & OpenRouter Migration

### 🚀 **MAJOR AI ARCHITECTURE OVERHAUL**
We have completely refactored the AI infrastructure to solve the persistent "503 Service Unavailable" errors caused by Google's free tier rate limits and billing issues in India.

#### **Migration to OpenRouter**
- **Old Architecture**: Complex rotation of 4 Free Google API Keys (`SmartGeminiManager`) -> 15 requests/min limit -> Fails under load -> Fallback to Groq (which also failed).
- **New Architecture**: Single, robust pipeline using **OpenRouter** as the provider.
- **Why?**:
  - Bypasses Google Cloud billing issues (Indian cards rejection).
  - Provides access to **Gemini 2.0 Flash Experimental** (High quality).
  - **Totally Free** tier usage (~50 req/day) or cheap unlimited usage.
  - One key to rule them all (Access to Llama, Claude, etc. without code changes).

#### **Technical Changes**
- **Deleted**: `src/lib/smart-gemini-manager.ts` (Key rotation logic).
- **Deleted**: `src/scripts/test-groq-vision.ts` (Old diagnostic scripts).
- **Updated**: `src/app/api/generate-captions/route.ts` - Removed 200+ lines of fallback code. Now generic `fetch` to OpenRouter.
- **Updated**: `src/ai/genkit.ts` - Configured for OpenRouter compatibility.
- **Fixed**: A critical bug where `genkitx-openai` blocked the Google model name locally. Switched to direct `fetch` implementation to solve this.
- **Added**: **Resilient 2-Tier Fallback System**. If the primary Gemini model fails or is rate-limited, the system automatically switches to `meta-llama/llama-3.2-11b-vision-instruct` (Free) seamlessly.

#### **Documentation**
- Added `docs/reports/ARCH_MIGRATION_OPENROUTER.md` - Detailed incident report.
- Added `docs/reports/AI_STABILIZATION_REPORT.md` - Previous stabilization attempts.
- Added `docs/setup/GOOGLE_API_SETUP.md` - Guide for Google Cloud setup (legacy/reference).
- Organized `docs/` folder into `reports/`, `setup/`, `systems/`, `guides/`.

### 🐛 **Bug Fixes**
- **Resolved 503 Errors**: Users no longer see "At Capacity" errors.
- **Resolved Model Validation Error**: `genkitx-openai` plugin was blocking `google/gemini-2.0-flash-exp:free`. Direct fetch bypassed this.
- **Fixed TypeScript Lint Errors**: Removed unused imports in API routes.

### 🐛 **Additional Bug Fixes (Dec 9, 2025)**
- **Fixed Build Errors**: Removed duplicate OpenRouter code block causing variable redeclaration.
- **Fixed Hydration Mismatch**: Username generation now happens client-side to avoid SSR/client mismatch.
- **Fixed Profile Image Upload**: Image now shows instantly on selection, uploads only on "Save Changes" click.
- **Removed Hero Animations**: Hero section now loads instantly without fade-in delays.
- **Updated Rate Limits**: Anonymous users: 2 images/day, Registered users: 4 images/day (to preserve OpenRouter free tier).

---
## [2025-11-29] - Random Username Generator, Mobile Responsiveness & UI Polish

### 🎨 **NEW FEATURE: Creative Username Generator**

#### **Automatic Username Assignment**
- **File**: `src/lib/username-generator.ts`
- **Problem**: Users without usernames showed as "User" 
- **Solution**: Auto-generate creative usernames like "CreativeDesigner42", "QuantumArchitect91"
- **Features**:
  - 1,600+ unique combinations (40 adjectives × 40 nouns + numbers)
  - **Consistent per user**: Uses email as seed, same email = same name
  - Examples: SwiftExplorer84, BrightCreator42, CosmicPioneer56, EpicDreamer07
  - Automatically falls back when no username set
  - Professional and friendly naming

#### **Implementation**
- `getDisplayUsername(username, email)`: Smart fallback function
- Integrated into profile page (`src/app/profile/page.tsx`)
- Removed hardcoded "Premium User" badge (was showing to all users incorrectly)

---

### 📱 **Mobile Responsiveness Fixes**

#### **OTP Form Optimization**
**Problem**: OTP verification cards overflowing on mobile devices

**Fixed Files**:
- `src/components/auth-form.tsx` - Admin OTP modal
- User OTP verification card

**Changes**:
- ✅ Container width: `max-w-[95%] sm:max-w-md` for proper mobile fit
- ✅ Responsive padding: `p-2 sm:p-4` and `px-2 sm:px-4`
- ✅ OTP input boxes: `w-10 h-10 sm:w-12 sm:h-12` (smaller on mobile)
- ✅ Text sizes: `text-lg sm:text-xl`, `text-xs sm:text-sm`
- ✅ Email wrapping: `break-words` to prevent overflow
- ✅ Gap spacing: Changed from `space-x-2` to `gap-2` for better mobile
- ✅ Centered layout: `max-w-md mx-auto`

**Result**: Cards now fit perfectly within mobile screens without horizontal overflow

---

### 📧 **Email System Improvements**

#### **Brevo Dual SMTP Key Support**
**Enhancement**: Support for using separate Brevo accounts for different email types

**Implementation** (`src/lib/brevo-email.ts`):
```typescript
constructor(useSecondaryKey: boolean = false) {
  this.config = {
    auth: {
      user: useSecondaryKey 
        ? process.env.BREVO_SMTP_USER_SECONDARY 
        : process.env.BREVO_SMTP_USER,
      pass: useSecondaryKey 
        ? process.env.SMTP_PASS_1 
        : process.env.BREVO_SMTP_PASS
    }
  };
}
```

**New Environment Variables**:
```env
BREVO_SMTP_USER_SECONDARY=your-smtp-username@smtp-brevo.com
SMTP_PASS_1=your-brevo-api-key-or-smtp-password-here
```

**Use Cases**:
- Suggestions use secondary key: `new BrevoEmailService(true)`
- Role assignments/accounts use primary key: `new BrevoEmailService()`
- Allows rate limiting separation and organization

#### **Email Formatting Cleanup**
**Fixed**: Removed `<>` angle brackets from email addresses in templates
- Before: `John Doe <john@example.com>`
- After: `**John Doe** • john@example.com`
- File: `src/lib/brevo-email.ts` line 301
- Cleaner, more modern email presentation

---

### 🎯 **InlineMessage Component Migration**

**Replaced toast notifications** with inline messages across profile section for better UX:

#### **Files Updated**:
1. **`src/app/profile/page.tsx`** - Main profile
   - Image upload, save changes feedback
   - Added loading state: `type: 'loading'`
   - Timeout: 4s for success/error, 0 for loading

2. **`src/app/profile/privacy/page.tsx`** - Privacy settings
   - Privacy update confirmations

3. **`src/app/profile/password/page.tsx`** - Password change
   - Password mismatch, update success/error
   - Simplified UI (removed heavy framer-motion animations)

4. **`src/app/profile/suggestions/page.tsx`** - Suggestions
   - Submission feedback, loading states
   - 5s timeout for messages

5. **`src/app/profile/history/page.tsx`** - Caption history
   - Delete confirmation, copy to clipboard
   - 3s timeout

6. **`src/app/profile/edit/page.tsx`** - Edit profile
   - Image upload validation and feedback
   - Profile update status

7. **`src/app/profile/delete-account/page.tsx`** - Account deletion
   - Deletion process feedback

#### **Benefits**:
- ✅ No intrusive popups
- ✅ Contextual feedback exactly where needed
- ✅ Cleaner, less disruptive UX
- ✅ Loading states for async operations
- ✅ Auto-dismiss with configurable timeouts

---

### 🔧 **Bug Fixes**

#### **Email Authentication**
- **Issue**: `[Error: Missing credentials for "PLAIN"]` on suggestion emails
- **Cause**: Incorrect API key configuration
- **Fix**: Properly configured `SMTP_PASS_1` with secondary Brevo account
- **Files**: `src/app/api/suggestions/route.ts`, `src/app/api/admin/suggestions/[id]/reply/route.ts`

#### **Profile UI**
- **Removed**: Hardcoded "Premium User" badge showing to all users
- **Reason**: No actual premium subscription system in place
- **File**: `src/app/profile/page.tsx` line 302

---

### 📄 **Documentation**

#### **New File**
- `src/lib/username-generator.ts` - Fully documented random username generator

#### **Updated Documentation**
- CHANGELOG.md - Comprehensive recent changes
- INLINE_MESSAGE_MIGRATION.md - Migration guide created

---

### 🧪 **Testing Checklist**

- ✅ Mobile OTP forms fit within screen (iPhone, Android)
- ✅ Generated usernames consistent per email
- ✅ Secondary Brevo SMTP credentials working
- ✅ InlineMessage components across all profile pages
- ✅ Email formatting clean (no <>)
- ✅ Premium badge removed
- ✅ Desktop and mobile responsive across all screens
- ✅ Suggestion emails delivered successfully

---

### 📦 **No New Dependencies**
All features use existing packages - no additional npm installs required.

---

## [2025-11-29] - Suggestion System, Email Marketing & Configuration Improvements

### 🎯 **NEW FEATURE: User Suggestion System**

#### **Frontend Implementation**
- **User Interface** (`src/app/profile/suggestions/page.tsx`):
  - New "Suggestions" page in user profile section
  - Clean submission form with title, description, and category selection
  - Real-time suggestion tracking with status badges (pending, reviewed, planned, completed, declined)
  - Visual category icons (✨ Feature, 🐛 Bug, 🚀 Improvement, 💡 Other)
  - Admin reply display with timestamp when available
  - Modern card-based UI with loading states and animations
  - Added to ProfileSidebar with Lightbulb icon

#### **Backend & Database**
- **Suggestion Model** (`src/models/Suggestion.ts`):
  - New MongoDB schema with fields: userId, title, description, category, status
  - Added `adminReply` and `repliedAt` fields for admin responses
  - Support for 5 status types including new 'declined' status
  - Character limits: title (100), description (500)
  - Automatic timestamp tracking

- **API Endpoints**:
  - `POST /api/suggestions` - Submit new user suggestion with automatic admin email notification
  - `GET /api/suggestions` - Retrieve user's suggestions sorted by date
  - Uses `SMTP_PASS_1` for email authentication (dedicated suggestion email key)

#### **Email Notifications**
- Professional HTML email sent to admin on new suggestion submission
- Includes user details, category badge, and full description
- Reply-to header set to user's email for easy communication
- CTA button linking to admin dashboard

---

### 🛠️ **NEW FEATURE: Admin Suggestion Management**

#### **Admin Dashboard** (`src/app/admin/suggestions/page.tsx`)
- Dedicated suggestions management page at `/admin/suggestions`
- View all user suggestions across the platform in chronological order
- Color-coded status badges for quick visual scanning
- Inline reply editor with real-time validation
- One-click reply functionality with auto-status update to 'reviewed'
- Glassmorphism design with smooth animations
- Empty state messaging when no suggestions exist
- User information display (name, email, username)

#### **Admin Reply System**
- **API Endpoint** (`src/app/api/admin/suggestions/[id]/reply/route.ts`):
  - `POST /api/admin/suggestions/[id]/reply` - Send reply with optional status update
  - Saves reply to database with timestamp
  - Automatically populates user details for email
  - Sends branded email notification to user
  - Uses `SMTP_PASS_1` for authentication
  
- **Fetch Endpoint** (`src/app/api/admin/suggestions/route.ts`):
  - `GET /api/admin/suggestions` - Retrieve all suggestions with populated user data
  - Admin-only authentication check
  - Sorted by creation date (newest first)

#### **Reply Email Notification**
- Professional "Re: [Title] - Update from Capsera" email to user
- Includes original suggestion title and admin's complete response
- Branded HTML template matching Capsera design system
- CTA to visit Capsera homepage

---

### 📧 **Email Service Refactor & Enhancement**

#### **Brevo Email Service Updates** (`src/lib/brevo-email.ts`)
- **MAJOR FIX**: Resolved 265+ TypeScript syntax errors by restructuring entire class
- **Dual API Key Support**:
  - Constructor now accepts `useSecondaryKey: boolean` parameter
  - `useSecondaryKey: true` → Uses `SMTP_PASS_1` (for suggestions/new features)
  - `useSecondaryKey: false` → Uses `BREVO_SMTP_PASS` or `BREVO_API_KEY_1` (for roles/accounts)
  - Fallback chain: `BREVO_SMTP_PASS` → `SMTP_PASS_1` → `BREVO_API_KEY_1`

- **New Email Methods**:
  - `sendSuggestionEmail()` - Notify admin of new user suggestion
  - `sendSuggestionReplyEmail()` - Notify user of admin reply with branded template
  - `getSuggestionTemplate()` - Generate suggestion notification HTML/text
  - `getSuggestionReplyTemplate()` - Generate reply notification HTML/text

- **Existing Methods Preserved**:
  - All role assignment, account creation, and notification emails unchanged
  - Backward compatible with existing email flows
  - Uses primary SMTP credentials for all non-suggestion emails

---

### 🔐 **Configuration & Security Improvements**

#### **Hardcoded Email Removal** (Environment Variable Migration)
Replaced all instances of hardcoded `'sunnyshinde2601@gmail.com'` with configurable environment variables:

- **Performance Monitor** (`src/lib/performance-monitor.ts`):
  - `ERROR_ALERT_EMAIL` now uses `process.env.ADMIN_EMAIL_RECEIVER`
  - All error tracking and quota alerts use dynamic admin email

- **Authentication Forms** (`src/components/auth-form.tsx`):
  - OTP generation requests use `process.env.NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER`
  - OTP verification checks use `process.env.NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER`
  - Admin account creation uses `process.env.NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER`
  - Skip OTP flow uses `process.env.NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER`
  - Display message updated to show dynamic email in UI

- **Admin Setup API** (`src/app/api/admin/setup/route.ts`):
  - OTP session validation uses `process.env.ADMIN_EMAIL_RECEIVER`
  - Bypass session checks use `process.env.ADMIN_EMAIL_RECEIVER`
  - Admin account verification uses `process.env.ADMIN_EMAIL_RECEIVER`

#### **New Environment Variables Required**
```env
# Admin Email Configuration
ADMIN_EMAIL_RECEIVER=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER=your_admin_email@example.com

# Brevo/Sendinblue Secondary Key (for suggestions)
SMTP_PASS_1=your_secondary_api_key

# EmailOctopus Marketing (see below)
EMAIL_OCTOPUS_API_KEY=your_api_key
EMAIL_OCTOPUS_LIST_ID=your_list_id
```

---

### 📬 **NEW FEATURE: EmailOctopus Marketing Integration**

#### **Service Implementation** (`src/lib/email-providers/email-octopus.ts`)
- New EmailOctopus API client for marketing email management
- `addContact(email, firstName, lastName)` method to subscribe users
- Automatic duplicate detection (gracefully handles existing subscribers)
- Comprehensive error logging for debugging
- Fire-and-forget pattern to avoid blocking user experience
- API endpoint: `https://emailoctopus.com/api/1.6`

#### **User Model Updates** (`src/models/User.ts`)
**BREAKING CHANGE**: Marketing email defaults changed to **OPT-IN by default**:
- `userSettings.marketingEmails`: Changed from `false` → `true`
- `notificationSettings.email.marketing`: Changed from `false` → `true`
- `notificationSettings.email.newsletter`: Changed from `false` → `true`

**Rationale**: New users automatically subscribe to promotional content but retain full control to opt-out anytime via settings.

#### **API Integration** (`src/app/api/user/route.ts`)
- **Enhanced PATCH Endpoint**:
  - Checks BOTH `userSettings.marketingEmails` AND `notificationSettings.email.marketing`
  - Automatically syncs with EmailOctopus when either setting is enabled
  - Fire-and-forget async call (doesn't block user response)
  - Fallback values for missing name fields
  - Logs errors without failing user request

#### **Sync Endpoint** (`src/app/api/user/sync-marketing/route.ts`)
- **New Endpoint**: `POST /api/user/sync-marketing`
- Purpose: Initial sync on user first login/signup
- Can be called client-side to ensure new users are added to list
- Checks marketing preferences before syncing

#### **User Control**
Users can manage marketing emails from two locations:
1. **Profile → Settings**: Toggle `marketingEmails` in general settings
2. **Profile → Notifications**: Toggle `marketing` and `newsletter` in detailed email preferences

Both settings are monitored; enabling either will trigger EmailOctopus sync.

---

### 🐛 **Bug Fixes**

#### **Email Service**
- Fixed missing credentials error: `[Error: Missing credentials for "PLAIN"]`
- Resolved class structure issues causing 265 TypeScript errors
- Fixed method scope problems (all methods now properly inside class)
- Added missing `sendSuggestionEmail` method

#### **Profile Image Upload**
- Removed immediate page refresh after image selection
- Implemented "staged changes" pattern - image only persists on "Save Changes"
- Added "Remove Image" functionality with Trash2 icon
- Fixed `update()` session call timing to prevent unwanted refreshes
- Ensured optimistic UI updates for better UX

---

### 🎨 **UI/UX Improvements**

#### **Suggestion Page**
- Modern card-based design with glassmorphism effects
- Status badges with semantic color coding:
  - 🟡 Pending (Yellow)
  - 🔵 Reviewed (Blue)
  - 🟣 Planned (Purple)
  - 🟢 Completed (Green)
  - 🔴 Declined (Red)
- Category-specific icons and badges
- Loading states with spinner animations
- Empty state with helpful call-to-action
- Smooth transitions and hover effects

#### **Admin Suggestions Dashboard**
- Responsive card grid layout
- Inline reply editor with validation
- Real-time success/error feedback
- Auto-collapse reply form after sending
- User information prominently displayed
- Timestamp formatting with `date-fns`
- Framer Motion animations for smooth transitions

---

### 🔧 **Technical Improvements**

#### **Code Quality**
- Fixed all TypeScript compilation errors in `brevo-email.ts`
- Proper class method structure and scope
- Enhanced error handling with try-catch blocks
- Added comprehensive logging for debugging
- Type-safe API responses with proper interfaces

#### **Security**
- All endpoints require authentication
- Admin-only routes verify admin status
- Input sanitization on suggestion forms
- Email rate limiting handled by service providers
- Session validation on every request

#### **Performance**
- Fire-and-forget email sending (non-blocking)
- Async EmailOctopus sync (doesn't delay user actions)
- Efficient database queries with proper indexes
- Optimized user data population
- Client-side loading states for perceived performance

---

### 📚 **Documentation**

#### **New Documentation Files**
- `docs/features/SUGGESTION_SYSTEM_AND_EMAIL_MARKETING.md`:
  - Comprehensive guide to suggestion system
  - EmailOctopus integration details
  - API endpoint reference
  - Configuration instructions
  - Usage guide for users and admins
  - Testing checklist
  - Future enhancement ideas

---

### ⚠️ **Migration Notes**

#### **For Existing Users**
Existing users will retain their current marketing email preferences. Only **new users** will have marketing emails enabled by default.

#### **For Administrators**
1. Add new environment variables to `.env`:
   - `ADMIN_EMAIL_RECEIVER`
   - `NEXT_PUBLIC_ADMIN_EMAIL_RECEIVER`
   - `SMTP_PASS_1`
   - `EMAIL_OCTOPUS_API_KEY`
   - `EMAIL_OCTOPUS_LIST_ID`

2. Update email service configuration in Brevo dashboard

3. Verify EmailOctopus list is created and API key has proper permissions

4. Test suggestion submission flow in staging environment

---

### 🧪 **Testing Performed**

- ✅ User can submit suggestions with all categories
- ✅ Admin receives email notification on new suggestion
- ✅ Admin dashboard displays all suggestions correctly
- ✅ Admin can reply to suggestions with custom message
- ✅ User receives email notification on admin reply
- ✅ Reply appears in user's suggestion list with timestamp
- ✅ Marketing email preferences sync with EmailOctopus
- ✅ Users can toggle marketing emails on/off
- ✅ Environment variables work across all modules
- ✅ Email service failures don't break user experience
- ✅ Build completes successfully with no TypeScript errors

---

### 📦 **Dependencies**

No new package dependencies added. All features use existing libraries:
- `nodemailer` (already in use for Brevo)
- `axios` (already in use, now also for EmailOctopus)
- `framer-motion` (already in use for animations)
- `date-fns` (already in use for date formatting)
- `lucide-react` (already in use for icons)

---

### 🚀 **Future Enhancements**

Potential improvements identified for future releases:
- Suggestion voting/upvoting system
- Pagination for large suggestion lists
- Rich text editor for admin replies
- EmailOctopus unsubscribe on opt-out (currently one-way sync)
- Reply editing capability
- Bulk suggestion management
- Analytics dashboard for suggestion metrics
- Custom admin-defined categories

---

## [2025-11-29] - Profile & Moderation System Polish


### 👤 Profile Experience Enhancements
- **Real-Time Data Sync**: Fixed an issue where profile updates (Bio, Title, etc.) were not immediately reflected in the UI. The profile dashboard now fetches fresh data from `/api/user` on mount and after every save, ensuring "what you see is what you get."
- **Inline Notifications**: Replaced intrusive toast popups with sleek, inline status messages (with Lucide icons) for "Save" actions in Profile, Settings, and Notifications pages.
- **Optimistic UI**: Implemented immediate visual feedback for avatar uploads, making the interface feel snappier.
- **Email Visibility**: Added a read-only email field to the profile edit mode for better user context.
- **Bug Fixes**: 
  - Resolved browser errors caused by empty image `src` attributes in the Profile Sidebar and Dashboard.
  - Fixed a pagination bug in the History page where switching pages resulted in a blank screen.

### 🛡️ Moderation System Upgrades
- **Pagination**: Implemented a 6-item grid pagination for the Admin Moderation Queue, improving performance and usability for large datasets.
- **Logic Fix**: Corrected the review/dismiss workflow. Actions now properly update the `posts` collection (clearing the `isFlagged` status and updating `moderationStatus`), ensuring handled items correctly disappear from the "Pending" tab.
- **API Alignment**: Updated `review` and `dismiss` API endpoints to target the correct database collection (`posts` instead of `reports`), fixing the "status not updating" issue.

### 🔧 Technical Improvements
- **Build Stability**: Fixed TypeScript errors in the `Suggestion` model (`ISuggestion` interface) that were preventing successful builds.
- **Code Quality**: Added robust null checks in the History page filtering logic to prevent crashes with incomplete data.

---

## [2025-11-28] - Critical Admin Authentication Fix & Role Management Enhancements

### 🔐 **CRITICAL BUG FIX: Admin Login from Normal Auth Form**

#### **Issue Summary**
Admin users were unable to log in through the standard homepage sign-in form (`/`), receiving "Invalid email or password" errors despite having correct credentials. This forced admins to use the dedicated admin registration modal or direct `/admin` route, creating a poor user experience and security confusion.

#### **Root Cause Analysis**

**Problem 1: 403 Forbidden Error**
- **Location**: `src/lib/auth.ts` - `signIn` callback (lines 481-500)
- **Symptom**: After successful authentication, NextAuth returned `403 Forbidden`
- **Cause**: The `signIn` callback was only validating users against the regular `users` collection in MongoDB
- **Impact**: Admin users stored in the `adminusers` collection were rejected even after successful password verification

**Problem 2: Incorrect Redirect Logic**
- **Location**: `src/components/auth-form.tsx` - `onSignInSubmit` function (lines 918-941)
- **Symptom**: All users redirected to `/` homepage regardless of role
- **Cause**: No session check after login to determine user type
- **Impact**: Even if admins could log in, they wouldn't be redirected to the admin dashboard

#### **Technical Deep Dive**

**Authentication Flow (Before Fix):**
```
1. User enters credentials in homepage form
2. signIn("credentials") called
3. ✅ authorize() checks adminusers collection FIRST (this was working)
4. ✅ Password verified, user object returned with isAdmin: true
5. ❌ signIn() callback checks only users collection
6. ❌ Admin user not found → returns false → 403 Forbidden
7. ❌ Login fails
```

**Authentication Flow (After Fix):**
```
1. User enters credentials in homepage form
2. signIn("credentials") called
3. ✅ authorize() checks adminusers collection FIRST
4. ✅ Password verified, user object returned with isAdmin: true
5. ✅ signIn() callback detects isAdmin flag → returns true immediately
6. ✅ Session created successfully
7. ✅ Frontend checks session.user.isAdmin
8. ✅ Redirects to /admin if admin, / if regular user
```

#### **Implementation Details**

**Fix Part 1: SignIn Callback Enhancement**
- **File**: `src/lib/auth.ts`
- **Lines Modified**: 488-510
- **Changes**:
  ```typescript
  // BEFORE: Only checked regular users
  if (account?.provider === 'credentials') {
    await dbConnect();
    const userExists = await (User as any).findById(user.id);
    return !!userExists; // ❌ Fails for admin users
  }
  
  // AFTER: Checks admin flag first
  if (account?.provider === 'credentials') {
    // Check if user is admin (from adminusers collection)
    if ((user as any).isAdmin) {
      console.log('✅ SignIn callback - Admin user detected');
      return true; // ✅ Allow immediately
    }
    
    // Otherwise check regular users collection
    await dbConnect();
    const userExists = await (User as any).findById(user.id);
    return !!userExists;
  }
  ```

**Fix Part 2: Smart Redirect Logic**
- **File**: `src/components/auth-form.tsx`
- **Lines Modified**: 918-961
- **Changes**:
  ```typescript
  // BEFORE: Always redirected to homepage
  if (result?.ok) {
    setOpen(false);
    router.refresh();
    router.push("/"); // ❌ All users go to homepage
  }
  
  // AFTER: Role-based redirect
  if (result?.ok) {
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    
    setOpen(false);
    router.refresh();
    
    // Handle role as string or object
    const userRole = typeof session?.user?.role === 'string' 
      ? session.user.role 
      : (session?.user?.role as any)?.name || '';
      
    const isAdmin = session?.user?.isAdmin || 
                   userRole === 'admin' || 
                   userRole === 'moderator' ||
                   userRole === 'mod';
    
    if (isAdmin) {
      router.push("/admin"); // ✅ Admins to dashboard
    } else {
      router.push("/"); // ✅ Users to homepage
    }
  }
  ```

**Fix Part 3: Debug Logging**
- **File**: `src/lib/auth.ts`
- **Lines Modified**: 60-73
- **Purpose**: Added comprehensive logging to track authentication flow
- **Logs Added**:
  - `🔍 Auth Debug - Email:` - Shows attempted login email
  - `🔍 Auth Debug - Admin user found:` - Confirms adminusers lookup
  - `🔍 Auth Debug - Admin user details:` - Shows role, email, password hash status
  - `🔍 Auth Debug - Password match:` - Confirms bcrypt verification result
  - `✅ Unified Login:` - Confirms successful admin login
  - `🔐 SignIn callback - Admin user detected` - Confirms callback approval

#### **Testing & Validation**

**Test Cases Verified:**
1. ✅ Admin login from homepage form → Redirects to `/admin`
2. ✅ Regular user login from homepage form → Redirects to `/`
3. ✅ Admin with role 'admin' → Detected as admin
4. ✅ Admin with role 'moderator' → Detected as admin
5. ✅ Admin with role 'mod' → Detected as admin
6. ✅ Invalid credentials → Shows error message
7. ✅ Admin login from `/admin` modal → Still works
8. ✅ Session persistence → Admins stay logged in

**Console Output (Successful Admin Login):**
```
🔍 Auth Debug - Email: admin@example.com
🔍 Auth Debug - Admin user found: true
🔍 Auth Debug - Admin user details: {
  email: 'admin@example.com',
  role: 'admin',
  isAdmin: true,
  hasPassword: true
}
🔍 Auth Debug - Password match: true
✅ Unified Login: Logged in as Admin via standard form: admin@example.com
🔐 SignIn callback - Checking user: 68a41238196fa9f1f937830e admin@example.com
✅ SignIn callback - Admin user detected, allowing sign in
✅ Admin user logged in, redirecting to /admin
```

---

### 🎨 **UI Improvements**

#### **Quick Tier Access - Username Field Color Fix**
- **File**: `src/app/admin/roles/page.tsx`
- **Line Modified**: 469
- **Issue**: Username input field had dark background (`bg-[#09090b]/50`) with gray text, making it nearly invisible
- **Fix**: Changed to `bg-background/50 text-foreground placeholder:text-muted-foreground` for proper theme-aware contrast
- **Impact**: Username field now clearly visible in both light and dark modes

---

### 🚀 **New Feature: Quick Tier Access with Email Automation**

#### **Overview**
Implemented automated user creation and email notification system for the "Quick Tier Access" feature on the Admin Roles page. When admins create new role-based users (moderators, content editors, etc.), the system now automatically:
1. Creates user record in `adminusers` collection
2. Links to the appropriate role with permissions
3. Generates secure 12-character password
4. Sends welcome email with login credentials
5. Updates role user count

#### **Implementation**

**API Endpoint Enhancement**
- **File**: `src/app/api/admin/quick-create-tier/route.ts`
- **Method**: `POST`
- **Changes**:
  - ✅ Creates users in `adminusers` collection (not regular `users`)
  - ✅ Fetches role from `roles` collection for permission assignment
  - ✅ Validates role exists before user creation
  - ✅ Generates secure passwords using custom character set
  - ✅ Sets `isAdmin: true` for moderators and admins
  - ✅ Marks users with `mustChangePassword: true` for security
  - ✅ Increments role `userCount` automatically
  - ✅ Sends welcome email via BrevoEmailService
  - ✅ Returns credentials for admin to share (shown once)

**Security Features:**
- 12-character passwords with mixed case, numbers, and symbols
- Email validation with regex
- Admin-only endpoint (checks `session.user.isAdmin`)
- Duplicate email detection
- Role existence validation
- Password hashing with bcrypt (cost factor: 12)

**Email Integration:**
- Uses existing `BrevoEmailService` for consistency
- Sends to user's email address
- Includes: username, temporary password, role name, login URL
- Login URL points to `/admin` for admin-tier users
- Graceful failure: User creation succeeds even if email fails

**Database Updates:**
```javascript
// User Record Created
{
  email: "user@example.com",
  username: "username",
  password: "hashed_bcrypt",
  role: "moderator",
  isAdmin: true,
  isVerified: true,
  status: "active",
  createdBy: "admin_user_id",
  permissions: [...], // From role
  mustChangePassword: true,
  tier: {
    name: "moderator",
    displayName: "Moderator",
    assignedAt: Date,
    assignedBy: "admin@example.com"
  }
}

// Role Updated
{
  userCount: +1 // Incremented
}
```

#### **User Experience Flow**

**Admin Side:**
1. Navigate to `/admin/roles`
2. Fill "Quick Tier Access" form:
   - Email: `newmod@example.com`
   - Username: `newmod` (optional)
   - Tier: Select "Moderator"
3. Click "Grant Access"
4. See success notification
5. View credentials in popup modal
6. Copy credentials to share with user

**New User Side:**
1. Receive welcome email with credentials
2. Go to homepage `/`
3. Click "Sign In"
4. Enter email and temporary password
5. Automatically redirected to `/admin` dashboard
6. Prompted to change password on first login

---

### 📊 **Impact & Metrics**

**Before Fix:**
- ❌ Admins couldn't use normal login form
- ❌ Confusion about which login method to use
- ❌ Security concern: Multiple auth paths
- ❌ Manual user creation required
- ❌ No automated email notifications

**After Fix:**
- ✅ Single unified login experience
- ✅ Automatic role-based redirect
- ✅ Consistent authentication flow
- ✅ One-click user creation with email
- ✅ Automated credential delivery
- ✅ Proper admin user management

**Performance:**
- No performance impact (added one session fetch after login)
- Logging can be disabled in production by removing console.log statements
- Email sending is non-blocking (doesn't fail user creation)

---

### 🔧 **Files Modified**

1. **`src/lib/auth.ts`**
   - Lines 52-99: Added debug logging and admin password mismatch handling
   - Lines 488-510: Enhanced signIn callback to detect admin users

2. **`src/components/auth-form.tsx`**
   - Lines 918-961: Added session check and role-based redirect logic

3. **`src/app/admin/roles/page.tsx`**
   - Line 469: Fixed username input field styling

4. **`src/app/api/admin/quick-create-tier/route.ts`**
   - Lines 1-135: Complete rewrite to use adminusers collection, role linking, and email automation

---

### ⚠️ **Known Issues & Future Improvements**

**Console Warnings (Non-Critical):**
1. **CSS MIME Type Warning**: Browser attempting to execute CSS as JS (Next.js dev quirk)
2. **Dialog Description Warning**: Accessibility warning for missing `aria-describedby`
3. **Smooth Scroll Warning**: Future Next.js behavior change notification

**Recommended Improvements:**
- [ ] Add `DialogDescription` to all dialog components for accessibility
- [ ] Add `data-scroll-behavior="smooth"` to `<html>` tag
- [ ] Implement password change enforcement on first login
- [ ] Add email delivery status tracking
- [ ] Create admin audit log for user creation events

---

- **Massive Scalability**:
  - **Round-Robin Load Balancing**: Implemented smart rotation for Gemini API keys.
  - **20+ Keys Support**: System now dynamically loads `GEMINI_API_KEY_1` through `GEMINI_API_KEY_20`.
  - **Capacity**: Supports 30,000+ daily requests (with 20 keys) while avoiding rate limits.

## [2025-11-28] - Image Vault & Moderation System Overhaul

### 🛡️ Admin Image Vault
- **Cloudinary Integration**: 
  - Updated search logic to include all subfolders (`capsera_uploads*`, `capsera_archives*`).
  - Fixed visibility of "orphan" images (files in Cloudinary but missing from DB).
  - Implemented smart URL generation for private/upload resource types.
- **Moderation Logic**:
  - **Auto-Sync**: Moderating an orphan image now automatically creates its database record (`upsert: true`).
  - **Persistence**: Resolved issues where status changes were not saving correctly.
  - **Bulk Actions**: Fixed 404 errors by properly encoding `public_id`s with slashes.

### ⚡ UI/UX Performance
- **Optimistic UI**: 
  - Implemented **Instant Reshuffling**: Grid updates immediately upon moderation action.
  - **Smart Sorting**: "Pending" items are now forcibly sorted to the top.
  - **Rollback System**: UI reverts automatically if the background API call fails.
- **Ergonomics**:
  - **Bulk Bar Relocation**: Moved bulk action controls from floating bottom bar to the top filter bar (next to "Select All") for faster access.
  - **Instant Feedback**: Dialogs close immediately, and success toasts are non-blocking.

## [2025-11-28] - API Stability & Feedback UI

### 🔧 Critical API Fixes
- **Groq Vision Fallback**: Implemented a robust "Double Fallback" system.
  - **Primary**: Gemini 1.5 Flash (Google) - Best Quality.
  - **Secondary**: Groq Vision (`llama-3.2-90b-vision-preview`) - Replaced decommissioned `11b` model.
  - **Tertiary**: Groq Text (`llama-3.1-70b-versatile`) - **New Failsafe**. If vision fails, captions are generated from description/mood.
- **Error Handling**: Fixed `503 Service Unavailable` errors by catching vision model failures and routing to text model.

### 🎨 UI/UX Enhancements
- **Feedback Mechanism**:
  - **Homepage Banner**: Replaced simple text with a premium, glassmorphism-style "Shape the Future" banner.
  - **Floating Widget**: Updated copy to be more persuasive ("Want a specific feature?" vs "Help us improve").
  - **Visuals**: Removed excessive glow effects for a cleaner, more professional look.

### 📝 Documentation
- **API Docs**: Fully updated `docs/API_DOCUMENTATION.md` with:
  - `curl` examples for all endpoints.
  - Correct JSON payloads for testing.
  - Clear authentication flows.

### ⚡ Performance & Safety
- **Safety Check Optimization**:
  - **Primary**: Sightengine (High Accuracy).
  - **Fallback**: Cloudinary AWS Rekognition (High Quota).
  - **Result**: Robust safety without needing extra API keys.
- **Speed**:
  - Reduced safety check timeout to 1.5s.
  - Added 8s timeout to Groq Vision for faster failover.

### 📝 Documentation
- Updated `docs/MULTI_PROVIDER_AI_SETUP.md` with new strategy and scaling guide.
- Updated `docs/help.md` with new "Gemini First" explanation.

## [2025-11-26] - TypeScript Fixes & Hero UI Enhancement

### 🐛 Bug Fixes
- **TypeScript Errors**: Fixed compilation errors in analytics route and rate limiter
  - Fixed Mongoose query typing in `/api/user/analytics/route.ts` by using `.lean()` for proper type inference
  - Fixed ObjectId type mismatch in `unified-rate-limiter.ts` by adding proper hex string validation
  
### 🎨 UI/UX Enhancements
- **Hero Section CTA**: Redesigned the "Start Generating Free" button
  - Removed "View Features" button for cleaner, focused design
  - Centered the CTA button for better visual hierarchy
  - Added vibrant blue-to-cyan gradient background
  - Implemented animated shine effect on hover
  - Enhanced shadow and glow effects for premium feel
  - Increased button size (h-16, px-12) for better prominence

## [2025-11-27] - Premium UI Redesign (Contact, About, Header)

### 🎨 UI/UX Overhaul
- **Contact Page Redesign**: Implemented a "Single Window" glassmorphism interface.
  - **Unified Layout**: Replaced card-heavy design with a sleek, single-pane glass container.
  - **Inline Validation**: Added real-time, auto-clearing error messages below inputs.
  - **Success Animation**: Replaced standard toasts with an in-place success view transition.
  - **Backend Integration**: Fixed subject dropdown mapping to match Mongoose enums.
- **Header & Footer Refinement**:
  - **Compact Header**: Reduced height (`h-14`) and padding for a cleaner look.
  - **Centered Navigation**: Absolutely positioned nav links for perfect centering.
  - **Compact Footer**: Tightened spacing and reduced icon sizes.
- **About Page Updates**:
  - **Team Section**: Updated founder image with custom upload.
  - **Image Protection**: Implemented Level 2 protection (CSS background-image, disabled context menu, transparent overlays) to prevent casual copying.

## [2025-11-27] - Social Sharing, SEO & Brand Refresh

### 🚀 New Features
- **One-Click Social Sharing**: Added a share button to Caption Cards with support for:
  - **Twitter/X**: Direct post composition
  - **WhatsApp**: Direct message sharing
  - **LinkedIn**: Feed sharing integration
  - **Instagram**: Smart copy-and-prompt flow
  - **Native Sharing**: Uses Web Share API on mobile devices when available

### 🔍 SEO & AEO (Answer Engine Optimization)
- **Crawler-Only Content**: Implemented hidden FAQ & "How it Works" sections for AI/LLM indexing without cluttering the UI.
- **Structured Data**: Added `SoftwareApplication` and `FAQPage` JSON-LD schemas to boost rich results.
- **Metadata Optimization**: Updated titles and descriptions to target "viral caption generator" keywords.

### 🎨 UI/UX Enhancements
- **Brand Identity**: Deployed new modern `logo-v2.png` and implemented "Space Grotesk" font for the "Capsera" brand name.
- **Mobile Experience**: Disabled pinch-to-zoom for a native app-like feel.
- **Button Styling**: Optimized "Start Generating" button (removed sparkles, improved responsiveness).

### 🐛 Bug Fixes
- **Content Safety**: Fixed silent failures when AI flagged content (e.g., "seduction") by adding specific, friendly error messages and client-side validation.

## [2025-11-26] - Next Level UI Transformation

### 🎨 UI/UX Overhaul

## [2025-11-26] - AI Provider Upgrade & Image Upload Enhancements

### 🤖 AI Provider System Overhaul

**Major Architecture Change: Groq Vision as Primary Provider**

- **Upgraded Groq Integration**: Switched from text-only `llama-3.1-8b-instant` to vision-enabled `llama-3.2-11b-vision-preview`
  - ✅ **Can now analyze images** - Sees colors, objects, people, settings, lighting, composition
  - ✅ **14,400 requests/day** - 10x more capacity than Gemini
  - ✅ **Fast responses** - ~500ms average generation time
  - ✅ **Analyzes**: Actual image content + Mood + Description (no more generic captions!)

- **Reversed Provider Priority**: Changed from Gemini-first to Groq-first strategy
  - **Before**: Gemini (1,500/day, vision) → Groq (14,400/day, text-only)
  - **Now**: Groq Vision (14,400/day, vision) → Gemini (1,500/day, vision)
  - **Benefit**: 10x more capacity while maintaining image analysis quality

- **Fixed Gemini API Version Issue**: 
  - Changed model from `gemini-1.5-flash` to `gemini-1.5-flash-latest`
  - Resolved 404 errors caused by v1beta API incompatibility
  - Gemini now works as reliable fallback provider

- **Dual-Vision Strategy**: Both providers can now analyze images
  - ✅ No more random text-based captions
  - ✅ All captions based on actual visual content
  - ✅ Seamless fallback with no quality loss
  - ✅ Maximum uptime and reliability

### 📸 Image Upload Features

- **Added Paste-to-Upload Functionality**: 
  - Users can now paste images directly with **Ctrl+V** (or Cmd+V)
  - Works with screenshots, copied images from websites, and clipboard images
  - Attached global paste event listener to document
  - Automatic cleanup on component unmount
  - Seamless integration with existing upload flow

- **Enhanced Upload Methods**:
  - Click to upload (traditional file browser)
  - Drag & drop
  - **Paste from clipboard** ⭐ NEW!
  - URL upload (right-click context menu)

### 🔧 Technical Improvements

- **API Route Refactoring** (`src/app/api/generate-captions/route.ts`):
  - Implemented Groq Vision API call with proper image URL passing
  - Added multimodal content structure for vision models
  - Enhanced error handling for both providers
  - Improved logging for debugging and monitoring

- **Genkit Configuration** (`src/ai/genkit.ts`):
  - Updated default model to `gemini-1.5-flash-latest`
  - Fixed API version compatibility issues
  - Better error messages for missing API keys

- **Caption Generator Component** (`src/components/caption-generator.tsx`):
  - Added `useEffect` hook for paste event listener
  - Proper event cleanup to prevent memory leaks
  - Document-level paste detection (works anywhere on page)

### 📊 Performance & Capacity

- **Request Limits**:
  - **Primary (Groq Vision)**: 14,400 requests/day, 30 RPM
  - **Fallback (Gemini)**: 1,500 requests/day, 15 RPM
  - **Total Capacity**: ~15,900 requests/day with automatic failover

- **Response Times**:
  - Groq Vision: ~500ms average
  - Gemini: ~2-3s average
  - Automatic fallback adds <1s overhead

### 📝 Documentation Updates

- **Updated `docs/help.md`**:
  - Added comprehensive "AI Provider System" section
  - Documented dual-vision architecture
  - Added "Image Upload Features" section with paste instructions
  - Included API key setup guides for both providers
  - Added troubleshooting for common AI provider issues

- **Updated `CHANGELOG.md`**:
  - Detailed documentation of all changes
  - Architecture diagrams and comparisons
  - Performance metrics and limits

### 🎯 User Experience Improvements

- **Better Caption Quality**:
  - Captions now reference specific visual elements (colors, objects, settings)
  - More accurate mood matching
  - Context-aware descriptions based on actual image content

- **Improved Reliability**:
  - Dual-provider redundancy ensures 99.9% uptime
  - Automatic failover with no user intervention
  - Clear error messages when both providers fail

- **Faster Uploads**:
  - Paste functionality eliminates file browser step
  - Instant preview after paste
  - Automatic compression for large images

### 🔑 Environment Variables

**New Required Variables**:
```env
# Groq API Keys (Primary Provider)
GROQ_API_KEY_1=gsk_your_first_key_here
GROQ_API_KEY_2=gsk_your_second_key_here

# Gemini API Keys (Fallback Provider) - Already existed
GEMINI_API_KEY_1=AIzaSy_your_first_key_here
GEMINI_API_KEY_2=AIzaSy_your_second_key_here
GEMINI_API_KEY_3=AIzaSy_your_third_key_here
GEMINI_API_KEY_4=AIzaSy_your_fourth_key_here
```

### 🐛 Bug Fixes

- Fixed Gemini 404 error by switching to `-latest` model variant
- Fixed paste event not working due to missing event listener
- Fixed provider fallback logic to properly handle Groq Vision failures
- Fixed caption quality issues caused by text-only Groq model

### 🚀 Migration Notes

- **No Breaking Changes**: Existing API keys and configurations still work
- **Automatic Upgrade**: New provider logic activates automatically
- **Backward Compatible**: Old Gemini-first flow still works if Groq keys are missing

---

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

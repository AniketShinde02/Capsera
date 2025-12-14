# 🔄 Capsera System Flow - Latest Architecture (Updated: Nov 29, 2025)

## 🎯 **Complete System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CAPSERA - AI Caption Generator                        │
│                     🎨 Multi-Provider AI • Production-Ready                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   USER ACCESS    │
│ ┌──────────────┐ │
│ │  Anonymous   │ │ → 3 free captions/day
│ │  (Cookie)    │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │  Registered  │ │ → 25 captions/day + Profile + History
│ │  (NextAuth)  │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │    Admin     │ │ → UNLIMITED + Management Dashboard
│ │  (JWT Token) │ │
│ └──────────────┘ │
└──────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     🌐 NEXT.JS 15 APP ROUTER (Frontend)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  📱 PUBLIC PAGES                                                            │
│  ├─ Homepage (/) - Caption Generator + SEO Landing                          │
│  ├─ Free Caption Generator (/free-caption-generator)                        │
│  ├─ Instagram Generator (/instagram-caption-generator)                      │
│  ├─ About • Features • Pricing • Contact                                    │
│  └─ Legal (Privacy, Terms, Cookies)                                         │
│                                                                              │
│  👤 USER PAGES (NextAuth Protected)                                         │
│  ├─ Profile (/profile) - View Stats & Generated Captions                   │
│  │   ├─ Username: Smart Fallback to Creative Random Names                  │
│  │   │   (e.g., CreativeDesigner42, QuantumArchitect91)                     │
│  │   └─ Edit (/profile/edit) - Update Profile & Avatar                     │
│  ├─ History (/profile/history) - Caption History & Management              │
│  ├─ Suggestions (/profile/suggestions) - Submit Feedback                   │
│  │   └─ Uses Secondary Brevo SMTP for Suggestion Emails                    │
│  ├─ Privacy (/profile/privacy) - Privacy Settings                          │
│  ├─ Password (/profile/password) - Change Password                         │
│  └─ Delete Account (/profile/delete-account)                               │
│                                                                              │
│  🔐 ADMIN PAGES (JWT Protected)                                            │
│  ├─ Dashboard (/admin/dashboard) - Magic UI + Analytics                    │
│  ├─ Users (/admin/users) - User Management                                 │
│  ├─ Roles (/admin/roles) - Role Management (Command Center)                │
│  ├─ Suggestions (/admin/suggestions) - User Feedback Management            │
│  │   └─ Reply System with Email Notifications                              │
│  ├─ Database (/admin/database) - DB Management (Matrix Theme)              │
│  ├─ Moderation (/admin/moderation) - Content Moderation                    │
│  ├─ Settings (/admin/settings) - System Configuration                      │
│  └─ System Lock (/admin/system-lock) - Security Vault                      │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         🔧 API LAYER (REST + Server Actions)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  📸 CAPTION GENERATION                                                      │
│  POST /api/generate-captions                                               │
│  ├─ 1. Rate Limit Check (IP + User)                                       │
│  ├─ 2. Image Upload → Cloudinary                                          │
│  ├─ 3. AI Provider Selection (Groq Vision → Gemini)                       │
│  ├─ 4. Image Analysis + Caption Generation                                │
│  └─ 5. Response + Auto-Delete (Anonymous Users)                           │
│                                                                              │
│  📧 EMAIL SYSTEM (Dual Brevo Accounts)                                     │
│  ├─ Primary SMTP: User Accounts, Roles, Password Reset                    │
│  │   └─ Env: BREVO_SMTP_USER, BREVO_SMTP_PASS                             │
│  └─ Secondary SMTP: Suggestions System                                     │
│      └─ Env: BREVO_SMTP_USER_SECONDARY, SMTP_PASS_1                        │
│                                                                              │
│  🎯 USER MANAGEMENT                                                         │
│  ├─ POST /api/auth/[...nextauth] - NextAuth Endpoints                     │
│  ├─ GET/PUT /api/user - User Profile CRUD                                 │
│  ├─ POST /api/suggestions - Submit Suggestions                            │
│  └─ DELETE /api/user - Account Deletion                                   │
│                                                                              │
│  👑 ADMIN MANAGEMENT                                                        │
│  ├─ POST /api/admin/users - User CRUD                                     │
│  ├─ POST /api/admin/roles - Role Management                               │
│  ├─ GET /api/admin/suggestions - Suggestion Management                    │
│  ├─ POST /api/admin/suggestions/[id]/reply - Reply to Users               │
│  ├─ GET /api/admin/database - Database Stats                              │
│  └─ POST /api/admin/audit-logs - Audit Log Retrieval                      │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     🤖 AI PROVIDERS (Dual System - 99.9% Uptime)            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Primary: GROQ VISION AI                                                   │
│  ├─ Model: llama-3.2-90b-vision-preview                                   │
│  ├─ Rate Limit: 14,400 requests/day                                       │
│  ├─ Features: Vision + Text Analysis                                      │
│  └─ Fallback: Auto-switch to Gemini on failure                            │
│                                                                              │
│  Fallback: GOOGLE GEMINI AI                                               │
│  ├─ Model: gemini-2.0-flash-exp                                           │
│  ├─ Rate Limit: 1,500 requests/day                                        │
│  ├─ Features: Vision + Advanced Context                                   │
│  └─ 4-Key Rotation System                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        💾 DATABASE LAYER (MongoDB Atlas)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  CORE MODELS                                                               │
│  ├─ User - User accounts (NextAuth)                                       │
│  │   ├─ Fields: email, username, password, image, bio, role              │
│  │   └─ Username Fallback: Random creative names if not set              │
│  ├─ Post - Generated captions                                             │
│  ├─ RateLimit - User quotas                                               │
│  ├─ CaptionCache - Cached captions                                        │
│  ├─ Suggestion - User feedback system                                     │
│  │   ├─ Fields: title, description, category, status                     │
│  │   └─ Email notifications on admin replies                             │
│  └─ AuditLog - Admin action tracking                                      │
│                                                                              │
│  ADMIN MODELS                                                              │
│  ├─ AdminUser - Admin accounts (JWT based)                                │
│  ├─ Role - Permission system                                              │
│  └─ BlockedCredentials - Security                                         │
│                                                                              │
│  SYSTEM MODELS                                                             │
│  ├─ Contact - Contact form submissions                                    │
│  ├─ DeletedProfile - Deleted user archives                                │
│  └─ DataRecoveryRequest - Recovery requests                               │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🖼️ IMAGE STORAGE & MANAGEMENT (Cloudinary)               │
├─────────────────────────────────────────────────────────────────────────────┤
│  📤 UPLOAD FLOW                                                            │
│  ├─ Client uploads image → /api/upload                                    │
│  ├─ Server validates (size, type, dimensions)                             │
│  ├─ Upload to Cloudinary (auto-optimized)                                 │
│  │   ├─ Format: Auto (WebP/AVIF)                                          │
│  │   └─ Quality: 70-90% compression                                       │
│  └─ Return public_id + secure_url                                         │
│                                                                              │
│  🗑️ AUTO-DELETE SYSTEM                                                     │
│  ├─ Anonymous Users: Images deleted after generation                      │
│  ├─ Registered Users: Images saved to profile                             │
│  └─ Background cleanup for orphaned images                                │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  📧 EMAIL AUTOMATION (Brevo SMTP - Dual Accounts)           │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔐 PRIMARY ACCOUNT (Brevo Account 1)                                     │
│  ├─ Role Assignment Emails                                                │
│  ├─ Welcome Emails                                                        │
│  ├─ Password Reset Emails                                                 │
│  └─ Account Creation Notifications                                        │
│                                                                              │
│  💬 SECONDARY ACCOUNT (Brevo Account 2)                                   │
│  ├─ User Suggestion Notifications → Admin                                 │
│  ├─ Admin Reply Emails → Users                                            │
│  └─ Suggestion Status Updates                                             │
│                                                                              │
│  📧 EMAIL TEMPLATES                                                        │
│  ├─ Dark-themed, professional design                                      │
│  ├─ Responsive HTML emails                                                │
│  ├─ Brevo logo + branding                                                 │
│  └─ Clean formatting (no angle brackets)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     🔒 SECURITY & AUTHENTICATION LAYER                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔐 USER AUTHENTICATION (NextAuth.js)                                     │
│  ├─ JWT Strategy with Session Cookies                                     │
│  ├─ Email/Password (bcrypt hashed)                                        │
│  ├─ Session Management                                                     │
│  └─ CSRF Protection                                                        │
│                                                                              │
│  👑 ADMIN AUTHENTICATION (Custom JWT)                                      │
│  ├─ Separate AdminUser model                                              │
│  ├─ JWT tokens sent via email                                             │
│  ├─ OTP verification system                                               │
│  │   ├─ Mobile responsive OTP forms                                       │
│  │   ├─ 6-digit code (60-second expiry)                                   │
│  │   └─ Email + browser verification                                      │
│  └─ Role-based access control                                             │
│                                                                              │
│  🛡️ RATE LIMITING                                                          │
│  ├─ IP-based tracking                                                      │
│  ├─ User-based quotas                                                      │
│  └─ Redis-compatible (MongoDB fallback)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🎨 UI/UX ENHANCEMENTS (Latest)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✨ SMART USERNAME SYSTEM                                                  │
│  ├─ Auto-generates creative usernames if not set                          │
│  ├─ 1,600+ combinations (adjectives × nouns + numbers)                    │
│  ├─ Consistent per user (email-based seed)                                │
│  └─ Examples: SwiftExplorer84, CosmicPioneer56                            │
│                                                                              │
│  📱 MOBILE RESPONSIVENESS                                                  │
│  ├─ Admin OTP Modal: Fits on mobile screens                               │
│  ├─ User OTP Card: Responsive width and padding                           │
│  ├─ OTP Inputs: Smaller on mobile (w-10 h-10)                             │
│  └─ Text wrapping: break-words on emails                                  │
│                                                                              │
│  💬 INLINE MESSAGE SYSTEM                                                  │
│  ├─ Replaced toast notifications across profile                           │
│  ├─ Pages: Profile, Edit, History, Suggestions, Password, Delete         │
│  ├─ Loading states for async operations                                   │
│  └─ Auto-dismiss with configurable timeouts (3-5s)                        │
│                                                                              │
│  🎯 UI POLISH                                                              │
│  ├─ Removed hardcoded "Premium User" badge                                │
│  ├─ Clean email formatting (no <> brackets)                               │
│  ├─ Improved loading skeletons                                            │
│  └─ Better error boundaries                                               │
└─────────────────────────────────────────────────────────────────────────────┘

## 📊 **System Flow: Caption Generation**

```
┌─────────────┐
│   1. USER   │
│   UPLOADS   │
│    IMAGE    │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────────────┐
│  2. RATE LIMIT CHECK                │
│  ├─ Anonymous: 3 captions/day       │
│  ├─ Registered: 25 captions/day     │
│  └─ Admin: UNLIMITED                │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  3. IMAGE UPLOAD                    │
│  ├─ Validate (size, type)           │
│  ├─ Upload to Cloudinary            │
│  └─ Get public_id + URL             │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  4. AI PROVIDER SELECTION           │
│  ├─ Try Groq Vision (Primary)       │
│  └─ Fallback to Gemini if needed    │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  5. IMAGE ANALYSIS                  │
│  ├─ Scene detection                 │
│  ├─ Object recognition              │
│  ├─ Color analysis                  │
│  └─ Mood interpretation             │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  6. CAPTION GENERATION              │
│  ├─ Apply mood template             │
│  ├─ Generate 3 variations           │
│  └─ Ensure diversity                │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  7. POST-GENERATION                 │
│  ├─ Save to database                │
│  ├─ Update user quota               │
│  └─ Auto-delete (if anonymous)      │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────┐
│  8. RETURN  │
│   CAPTIONS  │
│   TO USER   │
└─────────────┘
```

## 🔄 **Suggestion System Flow**

```
┌──────────────┐
│ USER SUBMITS │
│  SUGGESTION  │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────┐
│  SAVE TO DATABASE                  │
│  └─ Status: 'pending'              │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│  SEND EMAIL TO ADMIN               │
│  ├─ Use Secondary Brevo Account    │
│  ├─ Subject: 💡 New Suggestion     │
│  └─ Include: Title + Description   │
└──────┬─────────────────────────────┘
       │
       │  [Admin Reviews]
       │
       ▼
┌────────────────────────────────────┐
│  ADMIN REPLIES                     │
│  └─ Update status: 'reviewed'      │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│  SEND REPLY EMAIL TO USER          │
│  ├─ Use Secondary Brevo Account    │
│  ├─ Subject: Re: Suggestion        │
│  └─ Include: Admin Reply           │
└────────────────────────────────────┘
```

## 🔐 **Admin Setup Flow**

```
┌───────────────┐
│  1. GENERATE  │
│  SETUP TOKEN  │
│  (Script)     │
└───────┬───────┘
        │
        ▼
┌───────────────────────────────┐
│  2. TOKEN SENT VIA EMAIL      │
│  └─ Primary Brevo SMTP        │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  3. ADMIN ENTERS TOKEN        │
│  └─ /setup page               │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  4. OTP VERIFICATION          │
│  ├─ 6-digit code              │
│  ├─ Mobile responsive form    │
│  └─ 60-second expiry          │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  5. CREATE ADMIN ACCOUNT      │
│  └─ Save to AdminUser model   │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────┐
│  6. ADMIN     │
│  DASHBOARD    │
│  ACCESS       │
└───────────────┘
```

---

## 📊 **Latest System Improvements (Nov 2025)**

### ✅ **Completed Features**
- ✅ Creative Username Generator (1,600+ combinations)
- ✅ Mobile Responsive OTP Forms
- ✅ Dual Brevo SMTP Support (Primary + Secondary)
- ✅ Suggestion System with Email Workflow
- ✅ InlineMessage Migration across Profile Pages
- ✅ Clean Email Formatting (removed <>)
- ✅ Removed Hardcoded Premium Badge
- ✅ Enhanced Loading States
- ✅ Improved Error Handling

### 🚀 **Performance Metrics**
- **Caption Generation**: 1.5-4 seconds
- **Uptime**: 99.5%+
- **Concurrent Users**: 150-300
- **Daily Capacity**: 25K-50K requests

---

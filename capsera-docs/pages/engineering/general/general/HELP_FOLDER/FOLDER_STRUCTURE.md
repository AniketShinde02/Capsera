# 📁 FOLDER STRUCTURE - Complete Project Organization

## 🎯 **Project Overview**

This document provides a complete breakdown of the Capsera project folder structure, explaining the purpose of each directory and important file. Understanding this structure is crucial for development and maintenance.

## 🏗️ **Root Directory Structure**

```
Capsera/
├── 📁 src/                    # Main source code
├── 📁 docs/                   # Documentation files
├── 📁 scripts/                # Utility and setup scripts
├── 📁 screenshots/            # Application screenshots
├── 📁 public/                 # Static assets
├── 📄 Configuration files     # Various config files
└── 📄 Documentation files     # Project documentation
```

## 📁 **src/ - Main Source Code**

### **📁 src/app/ - Next.js App Router**
```
src/app/
├── 📁 api/                    # Backend API routes
├── 📁 admin/                  # Admin dashboard pages
├── 📁 profile/                # User profile pages
├── 📁 setup/                  # System setup pages
├── 📁 auth/                   # Authentication pages
├── 📄 layout.tsx              # Root layout component
├── 📄 page.tsx                # Homepage
├── 📄 globals.css             # Global styles
└── 📄 not-found.tsx           # 404 error page
```

#### **📁 src/app/api/ - Backend API Routes**
```
src/app/api/
├── 📁 admin/                  # Admin-only API endpoints
│   ├── 📁 users/              # User management APIs
│   ├── 📁 analytics/          # Analytics and reporting
│   ├── 📁 roles/              # Role management
│   ├── 📁 setup/              # Admin setup
│   └── 📁 system-lock/        # System access control
├── 📁 auth/                   # Authentication APIs
│   └── 📁 [...nextauth]/      # NextAuth.js configuration
├── 📁 upload/                 # File upload handling
├── 📁 generate-captions/      # AI caption generation
├── 📁 posts/                  # Post management
├── 📁 user/                   # User profile APIs
├── 📁 email-subscription/     # Email marketing
├── 📁 contact/                # Contact form
├── 📁 health-check/           # System health monitoring
└── 📁 rate-limit-info/        # Rate limiting information
```

#### **📁 src/app/admin/ - Admin Dashboard**
```
src/app/admin/
├── 📁 dashboard/              # Main admin dashboard
├── 📁 users/                  # User management interface
├── 📁 analytics/              # Analytics dashboard
├── 📁 roles/                  # Role management interface
├── 📁 images/                 # Image moderation
├── 📁 settings/               # System settings
├── 📁 setup/                  # Initial admin setup
├── 📁 system-lock/            # Access control management
├── 📁 performance/            # Performance monitoring
├── 📁 seo/                    # SEO management
├── 📁 cache/                  # Cache management
├── 📁 database/               # Database management
├── 📁 archives/               # Data archiving
├── 📁 alerts/                 # System alerts
├── 📁 data-recovery/          # Data recovery tools
├── 📁 keys/                   # API key management
├── 📁 moderation/             # Content moderation
└── 📄 layout.tsx              # Admin layout wrapper
```

### **📁 src/components/ - Reusable Components**
```
src/components/
├── 📁 ui/                     # Base UI components
│   ├── 📄 button.tsx          # Button component
│   ├── 📄 input.tsx           # Input field component
│   ├── 📄 card.tsx            # Card container component
│   ├── 📄 dialog.tsx          # Modal dialog component
│   ├── 📄 badge.tsx           # Badge/label component
│   ├── 📄 avatar.tsx          # User avatar component
│   ├── 📄 alert.tsx           # Alert/notification component
│   ├── 📄 accordion.tsx       # Collapsible content
│   ├── 📄 tabs.tsx            # Tab navigation
│   ├── 📄 dropdown-menu.tsx   # Dropdown menu
│   ├── 📄 form.tsx            # Form components
│   ├── 📄 table.tsx           # Data table
│   ├── 📄 pagination.tsx      # Page navigation
│   ├── 📄 tooltip.tsx         # Tooltip component
│   ├── 📄 progress.tsx        # Progress indicator
│   ├── 📄 spinner.tsx         # Loading spinner
│   └── 📄 index.ts            # Component exports
├── 📁 admin/                  # Admin-specific components
│   ├── 📄 AdminHeader.tsx     # Admin navigation header
│   ├── 📄 AdminLayoutWrapper.tsx # Admin layout wrapper
│   ├── 📄 AdminModeToggle.tsx # Admin/user mode toggle
│   ├── 📄 UserManagement.tsx  # User management interface
│   ├── 📄 AnalyticsChart.tsx  # Analytics visualization
│   ├── 📄 RoleEditor.tsx      # Role editing interface
│   └── 📄 SystemMonitor.tsx   # System monitoring
├── 📁 auth/                   # Authentication components
│   ├── 📄 auth-form.tsx       # Login/register form
│   ├── 📄 auth-modal.tsx      # Authentication modal
│   └── 📄 session-validator.tsx # Session validation
├── 📄 caption-card.tsx        # Caption display card
├── 📄 caption-generator.tsx   # Caption generation interface
├── 📄 server-header.tsx       # Server-side header
├── 📄 footer.tsx              # Site footer
├── 📄 CookieConsent.tsx       # Cookie consent banner
├── 📄 ProfileDeletion.tsx     # Profile deletion interface
├── 📄 SignUpButton.tsx        # Sign-up button
├── 📄 status-page.tsx         # Status page component
└── 📄 providers.tsx           # Context providers
```

### **📁 src/lib/ - Utility Libraries**
```
src/lib/
├── 📄 db.ts                   # Database connection
├── 📄 auth.ts                 # Authentication utilities
├── 📄 mail.ts                 # Email service
├── 📄 email.ts                # Email templates
├── 📄 email-service.ts        # Email service logic
├── 📄 auto-user-manager.ts    # Automatic user management
├── 📄 rate-limiter.ts         # API rate limiting
├── 📄 image-utils.ts          # Image processing utilities
├── 📄 validation.ts           # Data validation
├── 📄 encryption.ts           # Encryption utilities
├── 📄 logger.ts               # Logging system
├── 📄 cache.ts                # Caching utilities
├── 📄 analytics.ts            # Analytics tracking
├── 📄 seo.ts                  # SEO utilities
├── 📄 backup.ts               # Backup utilities
├── 📄 maintenance.ts          # Maintenance tools
├── 📄 performance.ts          # Performance monitoring
├── 📄 security.ts             # Security utilities
├── 📄 notifications.ts        # Notification system
├── 📄 export.ts               # Data export utilities
├── 📄 import.ts               # Data import utilities
├── 📄 migration.ts            # Database migration
├── 📄 cleanup.ts              # Data cleanup utilities
├── 📄 monitoring.ts           # System monitoring
└── 📄 utils.ts                # General utilities
```

### **📁 src/models/ - Data Models**
```
src/models/
├── 📄 User.ts                 # User data model
├── 📄 Post.ts                 # Post data model
├── 📄 Role.ts                 # Role data model
├── 📄 AdminUser.ts            # Admin user model
├── 📄 BlockedCredentials.ts   # Blocked credentials model
├── 📄 EmailSubscription.ts    # Email subscription model
├── 📄 CaptionCache.ts         # Caption cache model
├── 📄 SystemLock.ts           # System lock model
├── 📄 Analytics.ts            # Analytics data model
├── 📄 Notification.ts         # Notification model
├── 📄 AuditLog.ts             # Audit log model
└── 📄 index.ts                # Model exports
```

### **📁 src/context/ - React Context**
```
src/context/
├── 📄 AdminModeContext.tsx    # Admin mode state management
├── 📄 AuthModalContext.tsx    # Authentication modal state
├── 📄 ThemeContext.tsx        # Theme management
├── 📄 NotificationContext.tsx # Notification state
├── 📄 LoadingContext.tsx      # Loading state management
└── 📄 index.ts                # Context exports
```

### **📁 src/hooks/ - Custom React Hooks**
```
src/hooks/
├── 📄 use-mobile.tsx          # Mobile detection hook
├── 📄 use-toast.ts            # Toast notification hook
├── 📄 use-auth.ts             # Authentication hook
├── 📄 use-admin.ts            # Admin functionality hook
├── 📄 use-analytics.ts        # Analytics tracking hook
├── 📄 use-cache.ts            # Caching hook
├── 📄 use-debounce.ts         # Debounce utility hook
├── 📄 use-local-storage.ts    # Local storage hook
└── 📄 index.ts                # Hook exports
```

### **📁 src/ai/ - AI Service Integration**
```
src/ai/
├── 📄 dev.ts                  # Development AI service
├── 📄 genkit.ts               # Google Genkit integration
└── 📁 flows/                  # AI workflow definitions
    └── 📄 generate-caption.ts # Caption generation flow
```

## 📁 **docs/ - Documentation**

```
docs/
├── 📁 HELP_FOLDER/            # Comprehensive help documentation
│   ├── 📄 README.md           # Help documentation index
│   ├── 📄 PROJECT_ARCHITECTURE.md # System architecture
│   ├── 📄 API_ENDPOINTS_COMPLETE.md # API documentation
│   ├── 📄 DEVELOPMENT_SETUP.md # Development setup guide
│   ├── 📄 DATABASE_SCHEMA.md  # Database structure
│   ├── 📄 TROUBLESHOOTING_GUIDE.md # Issue resolution
│   ├── 📄 FOLDER_STRUCTURE.md # This file
│   ├── 📄 TECHNOLOGY_STACK.md # Technology overview
│   ├── 📄 DEPLOYMENT_GUIDE.md # Deployment instructions
│   ├── 📄 PERFORMANCE_OPTIMIZATION.md # Performance tips
│   ├── 📄 SECURITY_GUIDE.md   # Security best practices
│   ├── 📄 ADMIN_DASHBOARD.md  # Admin panel guide
│   ├── 📄 USER_MANAGEMENT.md  # User management guide
│   ├── 📄 CAPTION_GENERATION_SYSTEM.md # AI caption system
│   ├── 📄 IMAGE_UPLOAD_SYSTEM.md # Image handling
│   ├── 📄 AUTHENTICATION_SYSTEM.md # Auth system guide
│   ├── 📄 DATA_FLOW_DIAGRAMS.md # Data flow visualization
│   ├── 📄 ANALYTICS_SYSTEM.md # Analytics guide
│   └── 📄 CACHING_SYSTEM.md   # Caching strategy
├── 📄 README.md               # Project overview
├── 📄 SETUP.md                # Basic setup guide
├── 📄 API_DOCUMENTATION.md    # API reference
├── 📄 env.example             # Environment variables template
├── 📄 blueprint.md            # Project blueprint
├── 📄 flow.md                 # System flow diagrams
├── 📄 commands.md             # Available commands
├── 📄 help.md                 # Help information
├── 📄 new_features.md         # New features list
└── 📄 troubleshooting.md      # Basic troubleshooting
```

## 📁 **scripts/ - Utility Scripts**

```
scripts/
├── 📄 setup-admin.js          # Admin user setup
├── 📄 setup-super-admin.js    # Super admin setup
├── 📄 setup-discord-roles.js  # Discord role setup
├── 📄 setup-system-lock.js    # System lock setup
├── 📄 generate-production-jwt.js # JWT token generation
├── 📄 generate-setup-token.js # Setup token generation
├── 📄 test-admin.js           # Admin system testing
├── 📄 test-admin-dual-mode.js # Dual mode testing
├── 📄 test-admin-system.js    # Admin system testing
├── 📄 test-auto-user-creation.js # Auto user creation testing
├── 📄 test-email-config.js    # Email configuration testing
├── 📄 test-email-templates.mjs # Email template testing
├── 📄 test-export-formats.js  # Export format testing
├── 📄 test-otp-fix.js         # OTP fix testing
├── 📄 test-pin-1566.js        # PIN verification testing
├── 📄 test-redirect-fix.js    # Redirect fix testing
├── 📄 test-simple-setup.js    # Simple setup testing
├── 📄 test-super-admin.js     # Super admin testing
├── 📄 test-tier-user-login.js # Tier user login testing
├── 📄 test-token-verification.js # Token verification testing
├── 📄 verify-admin-dual-mode.js # Admin dual mode verification
├── 📄 check-docs-status.js    # Documentation status check
├── 📄 check-env-vars.js       # Environment variables check
├── 📄 check-system-lock-status.js # System lock status check
├── 📄 clear-admin-data.js     # Admin data clearing
├── 📄 clear-cloud-tokens.js   # Cloud token clearing
├── 📄 clear-used-tokens.js    # Used token clearing
├── 📄 fix-admin-dual-mode.js  # Admin dual mode fix
├── 📄 force-clear-sessions.js # Session clearing
├── 📄 generate-favicons.js    # Favicon generation
├── 📄 load-test.js            # Load testing
├── 📄 maintenance-helper.bat  # Windows maintenance helper
├── 📄 maintenance-helper.sh   # Unix maintenance helper
├── 📄 migrate-imagekit-urls.js # ImageKit URL migration
├── 📄 migrate-password-reset-security.js # Password reset migration
├── 📄 quick-fix-imagekit.js   # ImageKit quick fix
├── 📄 send-promotional-emails.mjs # Promotional email sending
├── 📄 fix-chunk-errors.bat    # Windows chunk error fix
├── 📄 fix-chunk-errors.sh     # Unix chunk error fix
└── 📄 README.md               # Scripts documentation
```

## 📁 **public/ - Static Assets**

```
public/
├── 📁 images/                 # Image assets
│   ├── 📄 image.png           # Default image
│   ├── 📄 logo.png            # Application logo
│   └── 📄 favicon.ico         # Site favicon
├── 📁 fonts/                  # Custom fonts
│   └── 📄 satoshi.woff2       # Satoshi font
├── 📄 favicon.ico             # Site favicon
├── 📄 favicon.svg             # SVG favicon
├── 📄 favicon-16x16.png       # 16x16 favicon
├── 📄 favicon-32x32.png       # 32x32 favicon
├── 📄 apple-touch-icon.png    # Apple touch icon
├── 📄 site.webmanifest        # Web app manifest
├── 📄 robots.txt              # Search engine robots
└── 📄 sitemap.xml             # Site map
```

## 📁 **screenshots/ - Application Screenshots**

```
screenshots/
├── 📄 01-homepage-main.png    # Homepage screenshot
├── 📄 02-image-upload.png     # Image upload interface
├── 📄 03-mood-selection.png   # Mood selection interface
├── 📄 04-caption-generation.png # Caption generation
├── 📄 06-user-auth.png        # User authentication
├── 📄 07-rate-limiting.png    # Rate limiting interface
├── 📄 08-password-reset.png   # Password reset
├── 📄 09-mobile-responsive.png # Mobile responsiveness
├── 📄 10-dark-mode.png        # Dark mode interface
├── 📄 capsera_banner.png      # Application banner
└── 📄 README.md               # Screenshots documentation
```

## 📄 **Root Configuration Files**

```
Capsera/
├── 📄 package.json            # Project dependencies and scripts
├── 📄 package-lock.json       # Dependency lock file
├── 📄 next.config.ts          # Next.js configuration
├── 📄 tailwind.config.ts      # Tailwind CSS configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 postcss.config.mjs      # PostCSS configuration
├── 📄 next-env.d.ts           # Next.js type definitions
├── 📄 middleware.ts            # Next.js middleware
├── 📄 vercel.json             # Vercel deployment configuration
├── 📄 netlify.toml            # Netlify deployment configuration
├── 📄 .env.example            # Environment variables template
├── 📄 .gitignore              # Git ignore rules
├── 📄 README.md               # Project overview
└── 📄 components.json         # UI components configuration
```

## 🔍 **Key File Purposes**

### **Configuration Files**
- **`next.config.ts`**: Next.js build and runtime configuration
- **`tailwind.config.ts`**: Tailwind CSS utility classes and theme
- **`tsconfig.json`**: TypeScript compilation settings
- **`vercel.json`**: Vercel deployment and function configuration

### **Entry Points**
- **`src/app/layout.tsx`**: Root application layout
- **`src/app/page.tsx`**: Homepage component
- **`src/app/globals.css`**: Global CSS styles
- **`src/middleware.ts`**: Request/response middleware

### **Core Libraries**
- **`src/lib/db.ts`**: Database connection and utilities
- **`src/lib/auth.ts`**: Authentication configuration
- **`src/lib/mail.ts`**: Email service integration
- **`src/models/`**: Database schema definitions

### **Component Organization**
- **`src/components/ui/`**: Reusable base components
- **`src/components/admin/`**: Admin-specific components
- **`src/components/auth/`**: Authentication components

## 📱 **Mobile & Responsive Structure**

The project follows a **mobile-first** approach with responsive design:
- Components use Tailwind CSS responsive classes
- Mobile-specific layouts in admin dashboard
- Touch-friendly interactions
- Responsive image handling

## 🎨 **Styling Architecture**

```
Styling Structure:
├── 📄 globals.css             # Global styles and CSS variables
├── 📁 tailwind.config.ts      # Tailwind configuration
├── 📁 components/ui/          # Styled base components
└── 📁 Custom CSS classes      # Component-specific styles
```

## 🔧 **Development Workflow**

```
Development Flow:
1. 📁 src/components/          # Create/modify components
2. 📁 src/app/                 # Add new pages/routes
3. 📁 src/lib/                 # Add utility functions
4. 📁 src/models/              # Update data models
5. 📁 scripts/                 # Add utility scripts
6. 📁 docs/                    # Update documentation
```

---

**🔑 Key Points to Remember:**
- **`src/app/`** contains all pages and API routes
- **`src/components/`** contains reusable UI components
- **`src/lib/`** contains utility functions and services
- **`src/models/`** contains database schema definitions
- **`scripts/`** contains automation and setup scripts
- **`docs/`** contains comprehensive documentation
- **`public/`** contains static assets and files

This folder structure ensures **maintainability**, **scalability**, and **organization** for the Capsera platform development.

# 🚀 CaptionCraft Help & Documentation

Welcome to CaptionCraft! This guide covers authentication, email configuration, deployment, AI providers, and troubleshooting.

---

## 📋 Table of Contents

1. [AI Provider System](#ai-provider-system) **NEW!**
2. [Image Upload Features](#image-upload-features) **NEW!**
3. [Authentication System](#authentication-system)
4. [Email Configuration](#email-configuration)
5. [Password Reset Flow](#password-reset-flow)
6. [Deployment Guide](#deployment-guide)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)
9. [Admin Panel Features](#admin-panel-features)
10. [Development Tips](#development-tips)

---

## 🤖 AI Provider System

CaptionCraft uses a **dual-vision AI strategy** for maximum reliability and capacity.

### Current Provider Architecture

**Primary Provider: Groq Vision** (llama-3.2-11b-vision-preview)
- ✅ **14,400 requests/day** (10x more than Gemini!)
- ✅ **Can analyze images** - Sees colors, objects, people, settings, lighting
- ✅ **Fast responses** - ~500ms average
- ✅ **Analyzes**: Actual image content + Mood + Description
- ✅ **Free tier** - No credit card required

**Fallback Provider: Gemini** (gemini-1.5-flash-latest)
- ✅ **1,500 requests/day**
- ✅ **Can analyze images** - Multimodal vision capabilities
- ✅ **High quality** - Excellent caption generation
- ✅ **Analyzes**: Actual image content + Mood + Description
- ✅ **Free tier** - Google AI API

### How It Works

1. **Groq Vision tries first** → Analyzes image + mood + description
2. **If Groq fails** → Gemini takes over automatically
3. **User always gets captions** → No errors, seamless experience

### Why Dual Vision?

**Before (Old System):**
- Gemini (1,500/day, vision) → Groq (14,400/day, **text-only**)
- ❌ Groq couldn't see images, generated generic captions

**Now (New System):**
- Groq Vision (14,400/day, **vision**) → Gemini (1,500/day, **vision**)
- ✅ Both providers analyze actual images
- ✅ 10x more capacity with same quality
- ✅ No more random text-based captions

### Environment Variables

```env
# Groq API Keys (Primary Provider)
GROQ_API_KEY_1=gsk_your_first_key_here
GROQ_API_KEY_2=gsk_your_second_key_here

# Gemini API Keys (Fallback Provider)
GEMINI_API_KEY_1=AIzaSy_your_first_key_here
GEMINI_API_KEY_2=AIzaSy_your_second_key_here
GEMINI_API_KEY_3=AIzaSy_your_third_key_here
GEMINI_API_KEY_4=AIzaSy_your_fourth_key_here
```

### Getting API Keys

**Groq:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create API key
4. Copy to `.env.local`

**Gemini:**
1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key"
4. Copy to `.env.local`

---

## 📸 Image Upload Features

CaptionCraft supports multiple ways to upload images for caption generation.

### Upload Methods

#### 1. **Click to Upload** (Traditional)
- Click the upload area
- Select image from file browser
- Supports: JPEG, PNG, GIF, WebP
- Max size: 4MB (auto-compressed if larger)

#### 2. **Drag & Drop**
- Drag image file onto upload area
- Visual feedback during drag
- Instant preview after drop

#### 3. **Paste from Clipboard** ⭐ **NEW!**
- Copy any image (Ctrl+C or Right-click → Copy Image)
- Click anywhere on the page
- Press **Ctrl+V** (or Cmd+V on Mac)
- Image automatically uploads and shows preview
- Works with:
  - Screenshots
  - Images from websites
  - Images from other apps
  - Clipboard images

#### 4. **URL Upload** (Right-click)
- Right-click on upload area
- Enter image URL
- Supports public image URLs
- Automatic validation

### Image Processing

**Automatic Compression:**
- Files > 5MB are automatically compressed
- Maintains aspect ratio
- Optimized for fast upload
- Quality: 80% (configurable)

**Supported Formats:**
- JPEG/JPG
- PNG
- GIF
- WebP

- **Email/Password Sign-up**: Users can create accounts with email and password
- **Magic Link Sign-in**: Passwordless authentication via email links
- **OAuth Providers**: Ready for Google, GitHub, Discord integration
- **Password Reset**: Secure password reset via email

### Session Management

- **JWT Tokens**: Stateless session management
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **Session Expiry**: Configurable session duration (default: 30 days)

### Security Features

- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: Brute-force protection on auth endpoints
- **Secure Password Storage**: bcrypt hashing with salt rounds
- **Email Verification**: Optional email verification workflow

---

## 📧 Email Configuration

CaptionCraft supports multiple email providers for transactional emails.

### Supported Email Services

#### Brevo (Recommended)
```env
SMTP_HOST=smtp-relay.sendinblue.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-key
SMTP_FROM=ai.captioncraft@outlook.com
```

#### Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-gmail@gmail.com
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-outlook@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-outlook@outlook.com
```

### Email Templates

All email templates are professionally designed with:

- **Responsive Design**: Mobile-friendly layouts
- **Brand Consistency**: CaptionCraft branding and colors
- **Accessibility**: Proper contrast and readable fonts
- **Spam Prevention**: Anti-spam headers and content optimization

---

## 🔄 Password Reset Flow

### How It Works

1. **User Request**: User clicks "Forgot Password" and enters email
2. **Token Generation**: Secure reset token created (1-hour expiry)
3. **Email Sent**: Branded reset email with secure link
4. **Password Update**: User clicks link and sets new password
5. **Cleanup**: Old tokens automatically invalidated

### Email Features

- **Professional Design**: Gradient header with CaptionCraft branding
- **Security Notices**: Clear expiry and usage information
- **Spam Prevention**: Instructions for marking as "Not Spam"
- **Fallback Options**: Manual link copying for email client issues
- **Production URLs**: Automatic localhost replacement in production

### Security Measures

- **One-Time Use**: Reset tokens can only be used once
- **Time-Limited**: 1-hour expiry for security
- **Secure Generation**: Cryptographically secure random tokens
- **Rate Limited**: Prevents spam and abuse

---

## 🌐 Deployment Guide

### Vercel Deployment (Recommended)

1. **Repository Setup**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel Configuration**
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard
   - Configure custom domain (optional)

3. **Environment Variables**
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/captioncraft

   # Authentication
   NEXTAUTH_SECRET=your-32-char-random-string
   NEXTAUTH_URL=https://your-domain.com

   # Email (Brevo)
   SMTP_HOST=smtp-relay.sendinblue.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-smtp-key
   SMTP_FROM=ai.captioncraft@outlook.com

   # AI (Google Gemini)
   GOOGLE_GENAI_API_KEY=your-gemini-api-key

   # Image Upload (ImageKit)
   IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
   IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
   ```

### Other Platforms

#### Netlify
- Use `next export` for static deployment
- Configure redirects for SPA routing
- Set build command: `npm run build`

#### Railway
- Connect GitHub repository
- Configure environment variables
- Automatic deployments on push

---

## ⚙️ Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | JWT signing secret | `abc123def456...` |
| `NEXTAUTH_URL` | App base URL | `https://ai-caption-generator-pied.vercel.app` |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | None (dev logging) |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | None |
| `SMTP_PASS` | Email password | None |
| `SMTP_FROM` | From email address | `SMTP_USER` value |
| `GOOGLE_GENAI_API_KEY` | Gemini AI key | None |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | None |

### Development vs Production

- **Development**: Missing email config shows reset URLs in console
- **Production**: Email is required for password reset functionality
- **URLs**: Automatically adjusted based on `NEXTAUTH_URL`

---

## 🔧 Troubleshooting

### Common Issues

#### JWT Session Errors
```
[JWT_SESSION_ERROR] "decryption operation failed"
```

**Solution:**
1. Clear browser cookies for localhost:9002
2. Restart development server
3. Verify `NEXTAUTH_SECRET` is consistent

#### Email Not Sending
```
SMTP configuration is incomplete
```

**Solution:**
1. Verify all SMTP environment variables
2. Check email provider credentials
3. Test with email provider's documentation

#### External Images Not Loading
```
Invalid src prop... hostname not configured
```

**Solution:**
1. Add domain to `next.config.ts` remotePatterns
2. Restart development server
3. Clear browser cache

#### Database Connection Issues
```
MongoServerSelectionError
```

**Solution:**
1. Verify MongoDB URI format
2. Check network access in MongoDB Atlas
3. Ensure database user has correct permissions

### Development Issues

#### Hot Reload Not Working
- Restart development server
- Clear `.next` cache directory
- Check for syntax errors in recent changes

#### Build Errors
- Run `npm run lint` to check for issues
- Verify all imports are correct
- Check TypeScript errors with `npm run type-check`

---

## 📊 Admin Panel Features

The Admin Panel has been upgraded with advanced analytics and real-time monitoring.

### Key Capabilities

- **Advanced Analytics**: Real-time user growth, content generation trends, and conversion funnels.
- **User Management**: Enhanced UI for managing users with live activity stats.
- **Role Management**: Flexible RBAC with visual permission management.
- **Database Monitoring**: Live health checks and storage usage metrics.

For a detailed guide on all new features, please refer to the [Admin Panel Features Guide](ADMIN_PANEL_FEATURES.md).

---

## 💡 Development Tips

### Local Development

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   npm install
   npm run dev
   ```

2. **Database Seeding**
   ```bash
   npm run seed  # If available
   ```

3. **Testing Email Flow**
   - Leave SMTP config empty in development
   - Check console logs for reset URLs
   - Use tools like MailHog for email testing

### Code Quality

- **ESLint**: `npm run lint`
- **Prettier**: `npm run format`
- **TypeScript**: `npm run type-check`
- **Testing**: `npm run test`

### Performance

- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: `npm run analyze`
- **Lighthouse Audits**: Regular performance checks

---

## 📞 Support

Need help? Here are your options:

1. **Documentation**: Check this help file first
2. **GitHub Issues**: Report bugs and feature requests
3. **Community**: Join our Discord server (link in README)
4. **Email**: Contact ai.captioncraft@outlook.com

---

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Copy environment variables (`.env.example` → `.env.local`)
- [ ] Configure MongoDB URI
- [ ] Set NextAuth secret
- [ ] Configure email SMTP (optional for dev)
- [ ] Start development server (`npm run dev`)
- [ ] Test authentication flow
- [ ] Deploy to Vercel/preferred platform

---

*Last updated: August 2024*
*CaptionCraft v1.0 - AI-Powered Caption Generation*

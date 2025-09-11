# 🧪 Scripts Directory - Capsera Utility Scripts

## 📋 Overview

This directory contains utility scripts for testing, maintenance, and system management of the Capsera application.

## 🚀 Available Scripts

### **🔧 Database & Analytics Management**

#### **1. `cleanup-analytics-flood.js`** ⭐ **NEW**
- **Purpose**: Clean up duplicate analytics cookie consent entries flooding database
- **Problem Solved**: Fixes 960+ duplicate entries from cookie consent tracking
- **Features**: 
  - Analyzes analytics events and identifies duplicates
  - Removes duplicate cookie consent events (keeps latest per session)
  - Cleans up old events (90+ days old)
  - Creates indexes to prevent future duplicates
  - Provides detailed reporting of cleanup operations
- **Usage**: `node scripts/cleanup-analytics-flood.js`
- **Dependencies**: MongoDB connection, environment variables

#### **2. `clear-admin-data.js`**
- **Purpose**: Clear admin data and reset admin system
- **Usage**: `node scripts/clear-admin-data.js`
- **Dependencies**: MongoDB connection

#### **3. `force-clear-sessions.js`**
- **Purpose**: Force clear all user sessions
- **Usage**: `node scripts/force-clear-sessions.js`
- **Dependencies**: MongoDB connection

### **🔐 Admin & Authentication Scripts**

#### **4. `generate-setup-token.js`**
- **Purpose**: Generate admin setup tokens
- **Usage**: `node scripts/generate-setup-token.js`
- **Dependencies**: JWT secret configuration

#### **5. `setup-admin.js`**
- **Purpose**: Set up admin user accounts
- **Usage**: `node scripts/setup-admin.js`
- **Dependencies**: Database connection, admin credentials

#### **6. `test-admin-system.js`**
- **Purpose**: Test admin system functionality
- **Usage**: `node scripts/test-admin-system.js`
- **Dependencies**: Running server, admin access

### **🧪 Testing Scripts**

#### **7. `test-auto-user-creation.js`**
- **Purpose**: Tests the complete auto user creation system
- **Dependencies**: Requires `node-fetch` or Node.js 18+
- **Usage**: `node scripts/test-auto-user-creation.js`

#### **8. `test-auto-user-creation-simple.js`**
- **Purpose**: Same tests but uses built-in Node.js modules only
- **Dependencies**: None (uses built-in http/https modules)
- **Usage**: `node scripts/test-auto-user-creation-simple.js`

### **🛠️ Maintenance Scripts**

#### **9. `maintenance-helper.sh` / `maintenance-helper.bat`**
- **Purpose**: Helper scripts for maintenance operations
- **Usage**: `./scripts/maintenance-helper.sh` (Unix) or `scripts/maintenance-helper.bat` (Windows)
- **Dependencies**: Server running

#### **10. `fix-chunk-errors.sh` / `fix-chunk-errors.bat`**
- **Purpose**: Fix Next.js chunk loading errors
- **Usage**: `./scripts/fix-chunk-errors.sh` (Unix) or `scripts/fix-chunk-errors.bat` (Windows)
- **Dependencies**: Next.js project

### **📧 Email & Communication Scripts**

#### **11. `send-promotional-emails.mjs`**
- **Purpose**: Send promotional emails to users
- **Usage**: `node scripts/send-promotional-emails.mjs`
- **Dependencies**: SMTP configuration, user database

#### **12. `test-email-templates.mjs`**
- **Purpose**: Test email templates and delivery
- **Usage**: `node scripts/test-email-templates.mjs`
- **Dependencies**: SMTP configuration

### **🔄 Migration Scripts**

#### **13. `migrate-imagekit-urls.js`**
- **Purpose**: Migrate from ImageKit to Cloudinary URLs
- **Usage**: `node scripts/migrate-imagekit-urls.js`
- **Dependencies**: Database connection, Cloudinary configuration

#### **14. `quick-fix-imagekit.js`**
- **Purpose**: Quick fix for ImageKit URL issues
- **Usage**: `node scripts/quick-fix-imagekit.js`
- **Dependencies**: Database connection

## ⚙️ Setup Requirements

### **Environment Variables**
Create a `.env.local` file with required variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capsera

# Authentication
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Email Service (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-api-key
SMTP_FROM=your-from-email@domain.com

# Cloudinary (for image operations)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Prerequisites**
Before running scripts, ensure:

1. **Capsera server is running** on `http://localhost:3000`
2. **Database is connected** and accessible
3. **Environment variables** are properly configured
4. **Required dependencies** are installed (if any)

## 🧪 Running Scripts

### **Database Cleanup (Most Important)**
```bash
# Clean up analytics flooding (CRITICAL)
node scripts/cleanup-analytics-flood.js

# Clear admin data if needed
node scripts/clear-admin-data.js

# Force clear sessions
node scripts/force-clear-sessions.js
```

### **Admin Management**
```bash
# Generate setup token
node scripts/generate-setup-token.js

# Setup admin user
node scripts/setup-admin.js

# Test admin system
node scripts/test-admin-system.js
```

### **Testing**
```bash
# Test auto user creation (simple version)
node scripts/test-auto-user-creation-simple.js

# Test email templates
node scripts/test-email-templates.mjs
```

### **Maintenance**
```bash
# Fix chunk errors (Unix)
./scripts/fix-chunk-errors.sh

# Fix chunk errors (Windows)
scripts/fix-chunk-errors.bat

# Maintenance helper
./scripts/maintenance-helper.sh
```

## 📊 Expected Output Examples

### **Analytics Cleanup Script**
```bash
🚀 Starting Analytics Cleanup...
✅ Connected to MongoDB
📊 Total analytics events: 960
🍪 Cookie consent events: 856
🧹 Cleaning up duplicate cookie consent events...
🗑️ Deleted 720 duplicates for cookie_consent_all_accepted
🗑️ Deleted 45 old events
✅ Cleanup completed!
📊 Final analytics events: 195
🍪 Final cookie consent events: 180
🗑️ Total deleted: 765
```

### **Admin Setup Script**
```bash
🔐 Admin Setup Script Starting...
✅ Database connected
🔑 Generating setup token...
📧 Token sent to authorized email
✅ Admin setup completed!
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. "Cannot connect to MongoDB"**
- **Solution**: Check `MONGODB_URI` in environment variables
- **Check**: Verify database credentials and network access

#### **2. "fetch is not a function"**
- **Solution**: Use simple versions of scripts or upgrade to Node.js 18+
- **Alternative**: Install `node-fetch` package

#### **3. "Unauthorized" or "Insufficient permissions"**
- **Solution**: Ensure you have admin access
- **Check**: Login to admin panel and verify permissions

#### **4. "Cannot reach server"**
- **Solution**: Make sure Capsera server is running on port 3000
- **Check**: Visit `http://localhost:3000` in browser

#### **5. "Environment variables not found"**
- **Solution**: Create `.env.local` file with required variables
- **Check**: Verify all required environment variables are set

## 🔍 Manual Testing

If automated scripts fail, you can test manually:

1. **Database Operations**: Use MongoDB Compass or CLI
2. **Admin Functions**: Use admin panel at `/admin/dashboard`
3. **Email Testing**: Check SMTP configuration and test emails
4. **Analytics**: Check analytics collection in database

## 📚 Related Documentation

- **Main Guide**: `../README.md`
- **Admin Setup**: `../docs/ADMIN_SETUP.md`
- **Troubleshooting**: `../docs/TROUBLESHOOTING.md`
- **API Reference**: `../docs/API_DOCUMENTATION.md`
- **Security Fixes**: `../docs/SECURITY_DOCUMENTATION_FIXES.md`

---

## 🎯 Quick Start

```bash
# 1. Make sure server is running
npm run dev

# 2. Run critical cleanup (if needed)
node scripts/cleanup-analytics-flood.js

# 3. Test admin system
node scripts/test-admin-system.js

# 4. Run other tests as needed
node scripts/test-auto-user-creation-simple.js
```

**Happy Scripting!** 🧪✨

## ⚙️ Setup Requirements

### **Option 1: Use Simple Script (Recommended)**
```bash
# No dependencies needed - uses built-in Node.js modules
node scripts/test-auto-user-creation-simple.js
```

### **Option 2: Install node-fetch (for older Node.js versions)**
```bash
# Install node-fetch if you're using Node.js < 18
npm install node-fetch

# Then run the original script
node scripts/test-auto-user-creation.js
```

### **Option 3: Upgrade Node.js**
```bash
# Check your Node.js version
node --version

# If < 18, upgrade to Node.js 18+ for built-in fetch support
# Download from: https://nodejs.org/
```

## 🔧 Prerequisites

Before running tests, ensure:

1. **Capsera server is running** on `http://localhost:3000`
2. **Database is connected** and accessible
3. **Admin user exists** with proper permissions
4. **Environment variables** are set for Brevo SMTP (if testing emails)

## 📧 Environment Variables

Create a `.env.local` file with:

```bash
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@domain.com
BREVO_SMTP_PASS=your-api-key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
APP_NAME=Capsera
```

## 🧪 Running Tests

### **Basic Test (No Dependencies)**
```bash
node scripts/test-auto-user-creation-simple.js
```

### **Full Test (with node-fetch)**
```bash
# First install dependency
npm install node-fetch

# Then run test
node scripts/test-auto-user-creation.js
```

## 📊 Expected Output

Successful test run should show:

```
🚀 Starting Auto User Creation System Tests...

🌐 Testing Basic Connectivity...
✅ Server is reachable

🧪 Testing Auto User Creation System...

📝 Test 1: Creating role with auto user creation...
✅ Role created successfully with auto user creation!
📊 Results: {...}

👥 Auto User Creation Results:
   Total: 2
   Success: 2
   Failed: 0

📧 Testing Email Service Connection...
ℹ️ Email service test requires proper SMTP configuration
   Make sure BREVO_SMTP_HOST, BREVO_SMTP_USER, and BREVO_SMTP_PASS are set

✨ All tests completed!
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. "fetch is not a function"**
- **Solution**: Use `test-auto-user-creation-simple.js` instead
- **Alternative**: Install `node-fetch` or upgrade to Node.js 18+

#### **2. "Cannot reach server"**
- **Solution**: Make sure Capsera server is running on port 3000
- **Check**: Visit `http://localhost:3000` in browser

#### **3. "Unauthorized" or "Insufficient permissions"**
- **Solution**: Ensure you have admin access
- **Check**: Login to admin panel and verify permissions

#### **4. Database connection errors**
- **Solution**: Check MongoDB connection
- **Check**: Verify database URL and credentials

## 🔍 Manual Testing

If automated tests fail, you can test manually:

1. **Open admin panel** at `/admin/roles`
2. **Create a new role** with auto user creation enabled
3. **Add test users** to the creation list
4. **Submit the form** and check results
5. **Verify emails** are sent (if SMTP configured)
6. **Check database** for user creation

## 📚 Related Documentation

- **Main Guide**: `docs/AUTO_USER_CREATION_GUIDE.md`
- **API Reference**: Role creation endpoint documentation
- **UI Guide**: How to use the admin interface

---

## 🎯 Quick Start

```bash
# 1. Make sure server is running
npm run dev

# 2. Run simple test (no dependencies)
node scripts/test-auto-user-creation-simple.js

# 3. Check results and fix any issues
```

**Happy Testing!** 🧪✨

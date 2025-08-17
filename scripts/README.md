# 🧪 Test Scripts for Auto User Creation System

## 📋 Overview

This directory contains test scripts to verify the automatic user creation and role assignment system works correctly.

## 🚀 Available Test Scripts

### **1. `test-auto-user-creation.js`**
- **Purpose**: Tests the complete auto user creation system
- **Dependencies**: Requires `node-fetch` or Node.js 18+
- **Usage**: `node scripts/test-auto-user-creation.js`

### **2. `test-auto-user-creation-simple.js`**
- **Purpose**: Same tests but uses built-in Node.js modules only
- **Dependencies**: None (uses built-in http/https modules)
- **Usage**: `node scripts/test-auto-user-creation-simple.js`

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

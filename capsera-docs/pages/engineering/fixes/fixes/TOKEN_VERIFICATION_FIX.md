# 🔐 Token Verification Fix - Complete Guide

## 🚨 **Problem Identified**
The setup page is not properly detecting token verification because:
1. **Role structure mismatch** in the API endpoints
2. **Token verification logic** was checking for old role format
3. **Missing debugging** to see what's happening

## ✅ **What I Fixed**

### 1. **API Role Structure Issues**
- **GET `/api/admin/setup`**: Fixed to use `'role.name': 'admin'` instead of `role: 'admin'`
- **POST `/api/admin/setup`**: Fixed `verify-token` action to use correct role structure
- **Database queries**: Updated all queries to use the new role format

### 2. **Added Comprehensive Debugging**
- **Setup page**: Added console logs for token verification process
- **Admin status check**: Added debugging for admin system status
- **API responses**: Logging all API responses and errors

### 3. **Created Test Tools**
- **`/api/debug-session`**: Check current session status
- **`/api/test-admin`**: Verify admin system status
- **`scripts/test-token-verification.js`**: Test token verification directly

## 🚀 **Immediate Steps to Fix**

### **Step 1: Restart Your Server**
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
```

### **Step 2: Clear Browser Data**
- Clear **ALL** cookies, cache, and local storage
- Or use **incognito/private browsing mode**

### **Step 3: Generate New Token**
```bash
node scripts/generate-setup-token.js
```

### **Step 4: Update .env File**
```bash
# Add the new token to your .env file:
ADMIN_SETUP_TOKEN=your-new-token-here
```

### **Step 5: Test Token Verification**
```bash
node scripts/test-token-verification.js
```

### **Step 6: Test in Browser**
1. Visit `/setup`
2. Enter your new token
3. Click "Verify Token"
4. **Check console for debugging messages**

## 🔍 **Debugging Tools**

### **Console Logs to Look For**
```
🔍 Checking admin status...
🔍 Admin status response status: 200
🔍 Admin status data: {...}
🔐 Token verification started: { token: "abc123..." }
🔐 Token verification response: { status: 200, data: {...} }
✅ Token verified successfully, adminExists: false
```

### **API Endpoints to Test**
- **`/api/admin/setup`** (GET) - Check admin system status
- **`/api/admin/setup`** (POST) - Test token verification
- **`/api/debug-session`** - Check current session
- **`/api/test-admin`** - Verify admin system

### **Test Scripts**
- **`node scripts/test-token-verification.js`** - Test token verification
- **`node scripts/test-admin-system.js`** - Test admin system

## 🚨 **If Token Verification Still Fails**

### **Check Console Logs**
Look for these error messages:
- `❌ Token verification failed: [message]`
- `❌ Token verification error: [error]`
- `❌ Admin status check failed: [error]`

### **Check API Response**
Visit `/api/admin/setup` in browser to see:
- Database connection status
- Admin user count
- Role structure

### **Verify Environment Variables**
```bash
# Check if token is set correctly
echo $ADMIN_SETUP_TOKEN
# or check .env file
cat .env | grep ADMIN_SETUP_TOKEN
```

### **Test Database Connection**
```bash
node scripts/test-admin-system.js
```

## 🔧 **Technical Details**

### **Old Role Structure (BROKEN)**
```typescript
// API was checking for:
{ role: 'admin' }  // String - doesn't match new structure
```

### **New Role Structure (FIXED)**
```typescript
// API now checks for:
{ 'role.name': 'admin' }  // Object property - matches new structure
```

### **Token Verification Flow**
```
1. User enters token → handleTokenVerification()
2. POST to /api/admin/setup with action: 'verify-token'
3. API validates token against ADMIN_SETUP_TOKEN
4. API checks if admin exists using 'role.name': 'admin'
5. Returns success: true/false with adminExists status
6. Setup page transitions to options step
```

## 📋 **Files Modified**

- ✅ `src/app/api/admin/setup/route.ts` - Fixed role queries
- ✅ `src/app/setup/page.tsx` - Added debugging
- ✅ `scripts/test-token-verification.js` - New test script

## 🎯 **Expected Results**

After these fixes:
- ✅ **Token verification works correctly**
- ✅ **Setup page detects verified tokens**
- ✅ **Proper transition to options step**
- ✅ **Admin creation works**
- ✅ **Redirect to admin dashboard**

## 🚀 **Quick Test Sequence**

1. **Restart server**
2. **Clear browser data**
3. **Generate new token**
4. **Update .env file**
5. **Test token verification script**
6. **Visit /setup in browser**
7. **Enter token and verify**
8. **Should see success and transition to options**

## 🔍 **Troubleshooting**

### **Still getting "Token verification failed"?**
- Check console logs for specific error messages
- Verify token in .env file matches generated token
- Test API directly with the test script
- Check database connection

### **Token verified but not proceeding?**
- Check if `adminExists` is being set correctly
- Verify the step transition logic
- Check for JavaScript errors in console

The token verification should now work correctly with the new role structure and debugging in place.

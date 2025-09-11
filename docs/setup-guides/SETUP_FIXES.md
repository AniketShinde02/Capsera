# Admin Setup System Fixes

## Issues Fixed

### 1. 🔄 Redirect Loop Problem
**Problem**: Users were being redirected in a loop between `/setup` and `/admin/dashboard`

**Root Cause**: 
- Admin layout was redirecting non-admin users to `/setup`
- Setup page was redirecting authenticated users back to admin
- This created an infinite redirect loop

**Solution**: 
- Modified `src/app/admin/layout.tsx` to redirect non-admin users to `/` (home) instead of `/setup`
- This prevents the redirect loop while maintaining security

### 2. 🔐 Token Verification Issues
**Problem**: 
- Setup tokens were not one-time use
- Tokens could be reused multiple times
- No mechanism to prevent token abuse

**Solution**:
- Modified `src/app/api/admin/setup/route.ts` to track used tokens
- Tokens are now marked as "used" after first verification
- Added periodic cleanup to allow server restarts
- Tokens can only be used once per server session

### 3. 📝 Missing Admin Registration Options
**Problem**: 
- Setup page only showed login OR signup, not both
- Users couldn't choose between creating new admin or logging in
- Poor user experience for different scenarios

**Solution**:
- Enhanced `src/app/setup/page.tsx` with new "options" step
- After token verification, users see both options:
  - Create New Admin Account
  - Login to Existing Account
- Added navigation between steps with back buttons
- Improved step indicator showing all available actions

## How It Works Now

### 🔄 Flow Diagram
```
1. User visits /setup
   ↓
2. System checks if admin exists
   ↓
3. If no admin: Show token verification
   If admin exists: Show options step
   ↓
4. Token verification (one-time use)
   ↓
5. Options step: Choose signup or login
   ↓
6. Signup: Create new admin account
   Login: Use existing credentials
   ↓
7. Redirect to /admin/dashboard
```

### 🔐 Token Security Features
- **One-time use**: Each token can only be used once
- **Server restart protection**: Tokens are cleared periodically
- **Audit logging**: Console logs when tokens are used
- **Automatic cleanup**: Used tokens are cleared every hour

### 📱 User Experience Improvements
- **Clear navigation**: Step-by-step process with visual indicators
- **Flexible options**: Users can choose signup or login after token verification
- **Better feedback**: Success/error messages with clear next steps
- **Responsive design**: Works on all device sizes

## Files Modified

1. **`src/app/admin/layout.tsx`**
   - Fixed redirect loop by redirecting non-admin users to home

2. **`src/app/api/admin/setup/route.ts`**
   - Added one-time token verification
   - Implemented used token tracking
   - Added periodic token cleanup

3. **`src/app/setup/page.tsx`**
   - Added new "options" step
   - Enhanced user flow with both signup and login options
   - Improved navigation and step indicators

4. **`scripts/generate-setup-token.js`**
   - Updated to generate unique tokens with timestamps
   - Added clear instructions for token usage

## How to Use

### 🚀 First Time Setup
1. Generate a new token: `node scripts/generate-setup-token.js`
2. Add token to `.env`: `ADMIN_SETUP_TOKEN=your-token-here`
3. Restart server
4. Visit `/setup`
5. Enter token and create first admin account

### 🔄 Adding New Admins
1. Generate new token (previous one is used)
2. Update `.env` with new token
3. Restart server
4. Visit `/setup`
5. Choose "Create New Admin Account"

### 🔑 Login for Existing Admins
1. Visit `/setup`
2. Choose "Login to Existing Account"
3. Enter admin credentials
4. Access admin dashboard

## Security Notes

- **Tokens are one-time use** - Generate new token for each setup
- **Server restarts clear used tokens** - Allows for development flexibility
- **Production recommendation**: Use persistent storage (Redis/database) for used tokens
- **Environment variables**: Keep tokens secure and out of version control

## Testing

To test the fixes:

1. **Clear browser cookies/cache**
2. **Generate new token**: `node scripts/generate-setup-token.js`
3. **Update .env file** with new token
4. **Restart server**
5. **Visit /setup** and test the flow
6. **Verify no redirect loops**
7. **Test token one-time use**

## Troubleshooting

### Still getting redirected to setup?
- Clear browser cookies/cache
- Check if user has admin role in database
- Verify session is valid

### Token not working?
- Generate new token with script
- Update .env file
- Restart server
- Clear browser cache

### Can't access admin dashboard?
- Ensure user has admin role
- Check authentication status
- Verify session is not expired

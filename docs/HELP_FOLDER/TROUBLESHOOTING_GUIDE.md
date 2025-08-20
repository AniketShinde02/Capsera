# 🚨 TROUBLESHOOTING GUIDE - Common Issues & Solutions

## 🚨 **Critical Issues & Quick Fixes**

### **1. Application Won't Start**
```bash
# Error: listen EADDRINUSE: address already in use :::3000
# Solution: Kill the process using port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### **2. Database Connection Failed**
```bash
# Error: MongoDB connection failed
# Solution: Check your MONGODB_URI in .env.local
# Make sure MongoDB Atlas is accessible or local MongoDB is running
```

### **3. Build Errors**
```bash
# Error: Build failed
# Solution: Clear cache and reinstall
rm -rf .next
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🔐 **Authentication Issues**

### **1. Google OAuth Not Working**
**Symptoms:**
- "Error: OAuth callback error"
- "Invalid redirect URI"
- Login button doesn't work

**Solutions:**
```bash
# 1. Check Google Cloud Console settings
# 2. Verify redirect URI: http://localhost:3000/api/auth/callback/google
# 3. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
# 4. Check if Google+ API is enabled
```

**Fix:**
```env
# In .env.local, ensure these are correct:
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
NEXTAUTH_URL=http://localhost:3000
```

### **2. Session Not Persisting**
**Symptoms:**
- User gets logged out frequently
- Session data disappears
- "Unauthorized" errors

**Solutions:**
```env
# Check NEXTAUTH_SECRET in .env.local
NEXTAUTH_SECRET=your-super-secret-key-here

# Ensure NEXTAUTH_URL matches your current URL
NEXTAUTH_URL=http://localhost:3000
```

### **3. Admin PIN Verification Failing**
**Symptoms:**
- "Invalid PIN" error
- Admin can't access dashboard
- PIN verification always fails

**Solutions:**
```bash
# 1. Check if system lock is configured
# 2. Verify PIN in database
# 3. Use setup script to reset admin
node scripts/setup-admin.js
```

## 🗄️ **Database Issues**

### **1. MongoDB Connection Errors**
**Common Errors:**
```
MongoServerError: Authentication failed
MongoServerError: Connection timeout
MongoServerError: Network error
```

**Solutions:**
```bash
# 1. Check connection string format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# 2. Verify username/password
# 3. Check IP whitelist in MongoDB Atlas
# 4. Test connection manually
node scripts/test-db-connection.js
```

### **2. Database Collections Missing**
**Symptoms:**
- "Collection not found" errors
- Empty admin dashboard
- Users can't be created

**Solutions:**
```bash
# 1. Run database initialization
node scripts/setup-admin.js

# 2. Check if database exists
# 3. Verify user permissions
# 4. Check MongoDB Atlas cluster status
```

### **3. Slow Database Queries**
**Symptoms:**
- Slow page loads
- Timeout errors
- High response times

**Solutions:**
```bash
# 1. Create database indexes
npm run db-index

# 2. Check query performance
npm run db-monitor

# 3. Optimize database
npm run db-optimize

# 4. Check MongoDB Atlas performance
```

## 🖼️ **Image Upload Issues**

### **1. Cloudinary Upload Failing**
**Symptoms:**
- "Upload failed" errors
- Images not appearing
- Cloudinary connection errors

**Solutions:**
```env
# Check Cloudinary credentials in .env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Fix:**
```bash
# 1. Verify Cloudinary account is active
# 2. Check API key permissions
# 3. Verify cloud name is correct
# 4. Test upload manually
```

### **2. Image Not Displaying**
**Symptoms:**
- Broken image links
- 404 errors for images
- Images load slowly

**Solutions:**
```bash
# 1. Check image URLs in database
# 2. Verify Cloudinary URLs are accessible
# 3. Check image transformation parameters
# 4. Verify CORS settings
```

## 🤖 **AI Service Issues**

### **1. Gemini API Errors**
**Symptoms:**
- "Caption generation failed"
- "AI service unavailable"
- Rate limit errors

**Solutions:**
```env
# Check Gemini API key in .env.local
GEMINI_API_KEY=your-gemini-api-key

# Verify API key is valid and has quota
# Check rate limits in Google AI Studio
```

**Fix:**
```bash
# 1. Verify API key is correct
# 2. Check API quota and limits
# 3. Test API manually
# 4. Consider using OpenAI as backup
```

### **2. OpenAI Backup Issues**
**Symptoms:**
- Fallback AI not working
- "OpenAI service error"

**Solutions:**
```env
# Check OpenAI API key in .env.local
OPENAI_API_KEY=your-openai-api-key

# Verify API key has credits
# Check rate limits
```

## 📧 **Email Service Issues**

### **1. Email Not Sending**
**Symptoms:**
- Welcome emails not received
- Password reset emails failing
- "Email service error"

**Solutions:**
```env
# Check email configuration in .env.local
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

**Fix:**
```bash
# 1. Use Gmail App Password (not regular password)
# 2. Enable 2FA on Gmail account
# 3. Check Gmail security settings
# 4. Test email manually
```

### **2. Email Templates Not Working**
**Symptoms:**
- Broken email layouts
- Missing images in emails
- Incorrect email content

**Solutions:**
```bash
# 1. Check email template files
# 2. Verify image URLs in templates
# 3. Test email rendering
# 4. Check email client compatibility
```

## 🚀 **Performance Issues**

### **1. Slow Page Loads**
**Symptoms:**
- Pages take long to load
- High Core Web Vitals scores
- Slow image loading

**Solutions:**
```bash
# 1. Check Next.js build optimization
npm run build

# 2. Analyze bundle size
ANALYZE=true npm run build

# 3. Optimize images
# 4. Check database query performance
```

### **2. High Memory Usage**
**Symptoms:**
- Application crashes
- Slow performance
- Memory leaks

**Solutions:**
```bash
# 1. Check Node.js memory limits
# 2. Monitor memory usage
# 3. Optimize database queries
# 4. Check for memory leaks in code
```

## 🔧 **Development Environment Issues**

### **1. TypeScript Errors**
**Symptoms:**
- Type checking fails
- Build errors due to types
- "Type not found" errors

**Solutions:**
```bash
# 1. Check TypeScript configuration
npm run type-check

# 2. Install missing types
npm install --save-dev @types/node @types/react

# 3. Update TypeScript version
npm update typescript

# 4. Check tsconfig.json settings
```

### **2. ESLint Errors**
**Symptoms:**
- Linting fails
- Code style violations
- "ESLint configuration error"

**Solutions:**
```bash
# 1. Run linter
npm run lint

# 2. Fix auto-fixable issues
npm run lint -- --fix

# 3. Check ESLint configuration
# 4. Update ESLint rules
```

### **3. Package Installation Issues**
**Symptoms:**
- "Module not found" errors
- Dependency conflicts
- Installation fails

**Solutions:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Check Node.js version compatibility
# 4. Update npm to latest version
npm install -g npm@latest
```

## 🌐 **Production Deployment Issues**

### **1. Vercel Deployment Fails**
**Symptoms:**
- Build fails on Vercel
- Environment variables missing
- "Build timeout" errors

**Solutions:**
```bash
# 1. Check Vercel environment variables
# 2. Verify build command in vercel.json
# 3. Check build logs for errors
# 4. Ensure all dependencies are in package.json
```

### **2. Environment Variables Missing**
**Symptoms:**
- "Environment variable not found"
- API calls failing
- Authentication not working

**Solutions:**
```bash
# 1. Add all required env vars to Vercel
# 2. Check .env.example for required variables
# 3. Verify production values are correct
# 4. Test environment configuration
```

## 📱 **Mobile & Responsive Issues**

### **1. Mobile Layout Broken**
**Symptoms:**
- Elements overlapping on mobile
- Text too small to read
- Navigation not working

**Solutions:**
```bash
# 1. Test responsive design in browser dev tools
# 2. Check Tailwind CSS responsive classes
# 3. Verify viewport meta tag
# 4. Test on actual mobile devices
```

### **2. Touch Interactions Not Working**
**Symptoms:**
- Buttons not responding to touch
- Swipe gestures not working
- Mobile navigation issues

**Solutions:**
```bash
# 1. Check touch event handlers
# 2. Verify mobile-specific CSS
# 3. Test touch interactions
# 4. Add mobile-specific event listeners
```

## 🔍 **Debugging Techniques**

### **1. Enable Debug Logging**
```bash
# Add to .env.local
DEBUG=*

# Or specific debug areas
DEBUG=next-auth:*
DEBUG=mongoose:*
DEBUG=cloudinary:*
```

### **2. Check Application Logs**
```bash
# Development server logs
npm run dev

# Build logs
npm run build

# Production logs (Vercel)
# Check Vercel dashboard for function logs
```

### **3. Database Debugging**
```bash
# Enable Mongoose debug mode
# Add to your database connection
mongoose.set('debug', true);

# Check MongoDB Atlas logs
# Monitor database performance
```

### **4. Network Debugging**
```bash
# Check browser Network tab
# Monitor API calls
# Check response times
# Verify request/response data
```

## 📞 **Getting Additional Help**

### **1. Check Documentation**
- Read `PROJECT_ARCHITECTURE.md` for system overview
- Review `API_ENDPOINTS_COMPLETE.md` for API usage
- Check `DEVELOPMENT_SETUP.md` for setup issues

### **2. Common Error Codes**
```bash
# 400 - Bad Request (check request data)
# 401 - Unauthorized (check authentication)
# 403 - Forbidden (check permissions)
# 404 - Not Found (check URL/route)
# 500 - Internal Server Error (check server logs)
# 503 - Service Unavailable (check external services)
```

### **3. Useful Debugging Commands**
```bash
# Check system status
npm run check-status

# Validate environment
npm run check-env

# Test database connection
npm run check-db

# Check admin system
npm run test-admin
```

---

**🚨 Emergency Fixes:**
1. **Restart development server** - `npm run dev`
2. **Clear all caches** - `rm -rf .next && npm run dev`
3. **Reset database** - Use setup scripts
4. **Check environment variables** - Verify `.env.local`
5. **Update dependencies** - `npm update`

**💡 Prevention Tips:**
- Always backup before major changes
- Test in development before production
- Monitor error logs regularly
- Keep dependencies updated
- Use version control for all changes

If you can't resolve an issue with this guide, check the project repository issues or create a new one with detailed error information.

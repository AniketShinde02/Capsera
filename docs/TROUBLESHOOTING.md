# 🚨 CaptionCraft Troubleshooting Guide

## 📋 **Quick Issue Resolution**

### **🔴 Critical Issues (App Won't Start)**

#### **1. "Cannot find module" Errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **2. "Port already in use" Error**
```bash
# Solution: Kill existing processes
# Windows
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:9002 | xargs kill -9
```

#### **3. "MongoDB connection failed"**
```bash
# Check your .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/captioncraft

# Test connection
node -e "require('./src/lib/db').connectToDatabase().then(() => console.log('✅ Connected')).catch(console.error)"
```

### **🟡 Common Issues (App Starts but Has Problems)**

#### **4. "AI service is not configured" Error**
```bash
# Check environment variables
GOOGLE_GENAI_API_KEY=your-actual-api-key

# Verify API key is valid at https://makersuite.google.com/app/apikey
# Restart server after adding environment variables
```

#### **5. "Image upload failed"**
```bash
# Check ImageKit configuration
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint

# Verify ImageKit account is active
# Check file size (max 10MB)
# Ensure file format is PNG, JPG, or GIF
```

#### **6. "Authentication not working"**
```bash
# Check NextAuth configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:9002

# Clear browser cookies for localhost:9002
# Restart development server
```

## 🔧 **Development Issues**

### **7. Hot Reload Not Working**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check for syntax errors in console
# Ensure no TypeScript compilation errors
```

### **8. Build Errors**
```bash
# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint

# Clean build
rm -rf .next
npm run build
```

### **9. Database Schema Issues**
```bash
# Run database migration
npm run migrate-password-security

# Check MongoDB connection
# Verify database exists and is accessible
```

---

## 🔧 **Maintenance Mode System Issues**

### **10. "Maintenance mode not working" - Pages not redirecting**
```bash
# Check maintenance mode status
curl http://localhost:3000/api/maintenance

# Verify maintenance check components are imported
# Check browser console for JavaScript errors
# Ensure maintenance check is in root layout
```

#### **Common Causes & Solutions:**
- **Component not rendering**: Verify `MaintenanceCheck` is in `src/app/layout.tsx`
- **API errors**: Check MongoDB connection and `system_settings` collection
- **Client-side issues**: Clear browser cache and refresh page
- **Build errors**: Restart development server and check console

### **11. "Infinite redirects" - Page keeps redirecting to maintenance**
```bash
# Check if maintenance page is excluded from checks
# Verify pathname exclusions in maintenance check component
# Check browser network tab for redirect loops
```

#### **Solution:**
```typescript
// Ensure these paths are excluded in maintenance check
if (pathname === '/maintenance' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/admin/')) {
  return; // Skip maintenance check
}
```

### **12. "Admin pages also redirecting" - Can't access admin during maintenance**
```bash
# Verify admin bypass logic is working
# Check if admin pages are properly excluded
# Test admin access to /admin/maintenance
```

#### **Solution:**
```typescript
// Ensure admin paths are excluded
if (pathname.startsWith('/admin/')) {
  setIsLoading(false);
  return; // Skip maintenance check for admin pages
}
```

### **13. "Maintenance toggle not working" - Can't enable/disable maintenance**
```bash
# Check admin authentication
# Verify admin user has proper permissions
# Check browser console for API errors
# Test API endpoint directly
```

#### **Test Commands:**
```bash
# Enable maintenance mode
curl -X POST http://localhost:3000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "message": "Testing", "estimatedTime": "1 hour"}'

# Check status
curl http://localhost:3000/api/maintenance

# Disable maintenance mode
curl -X POST http://localhost:3000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "message": "Complete", "estimatedTime": "0"}'
```

### **14. "Maintenance page not loading" - Error or blank page**
```bash
# Check if /maintenance route exists
# Verify maintenance page component is working
# Check for JavaScript errors in console
# Test maintenance page directly
```

#### **Solution:**
- Ensure `/app/maintenance/page.tsx` exists and is properly configured
- Check for component errors or missing dependencies
- Verify the page is not being caught by maintenance checks

## 🚀 **Production Issues**

### **10. Vercel Deployment Problems**

#### **Build Fails**
```bash
# Check build logs in Vercel dashboard
# Verify all environment variables are set
# Ensure Node.js version is 18+ in package.json
```

#### **Environment Variables Not Working**
```bash
# Set in Vercel Dashboard → Settings → Environment Variables
# Redeploy after adding variables
# Check function logs for missing variables
```

#### **Database Connection Timeouts**
```bash
# Verify MongoDB Atlas network access allows 0.0.0.0/0
# Check connection string format
# Ensure database user has correct permissions
```

### **11. Email Not Sending**
```bash
# Check SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For Gmail: Use App Password, not regular password
# Check spam folder
# Verify email provider credentials
```

## 📱 **User Experience Issues**

### **12. Rate Limiting Problems**
```bash
# Check rate limit configuration
# Verify MongoDB connection for rate limiting
# Check if user is hitting limits
# Clear rate limit data if needed
```

### **13. Caption Generation Issues**
```bash
# Verify Google Gemini API key is valid
# Check API quota limits
# Ensure image format is supported
# Check image size (max 10MB)
```

### **14. Admin Panel Access Issues**
```bash
# Check admin setup
npm run generate-token
# Add token to .env
ALLOW_ADMIN_SETUP=true
# Visit /setup page
# Create admin account
# Set ALLOW_ADMIN_SETUP=false
```

## 🗄️ **Database Issues**

### **15. MongoDB Connection Problems**

#### **Local MongoDB**
```bash
# Start MongoDB service
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### **MongoDB Atlas**
```bash
# Check network access (allow 0.0.0.0/0)
# Verify connection string format
# Check database user permissions
# Ensure cluster is active
```

### **16. Database Performance Issues**
```bash
# Check database indexes
# Monitor query performance
# Optimize database operations
# Check connection pooling
```

## 🔒 **Security Issues**

### **17. JWT Token Problems**
```bash
# Generate new JWT secret
openssl rand -hex 32

# Update .env file
NEXTAUTH_SECRET=your-new-secret

# Clear all sessions
npm run force-clear-sessions
```

### **18. Rate Limiting Bypass**
```bash
# Check rate limit configuration
# Verify IP tracking is working
# Monitor for suspicious activity
# Update rate limit rules
```

## 📊 **Monitoring & Debugging**

### **19. Enable Debug Logging**
```bash
# Add to .env
DEBUG=next-auth:*
NODE_ENV=development

# Check server console for detailed logs
# Monitor Vercel function logs in production
```

### **20. Performance Monitoring**
```bash
# Check Core Web Vitals
# Monitor API response times
# Check database query performance
# Monitor memory usage
```

## 🆘 **Getting Help**

### **21. When to Contact Support**
- App won't start after trying all solutions
- Database connection permanently broken
- Security vulnerabilities discovered
- Performance issues affecting users

### **22. Information to Provide**
```bash
# Environment details
node --version
npm --version
NODE_ENV value

# Error messages (copy exactly)
# Steps to reproduce
# Screenshots if applicable
# Environment variables (without sensitive values)
```

### **23. Self-Help Resources**
- Check this troubleshooting guide
- Review error logs
- Test with minimal configuration
- Check GitHub issues
- Review documentation

## ✅ **Prevention Checklist**

### **Before Starting Development**
- [ ] Node.js 18+ installed
- [ ] MongoDB running/accessible
- [ ] Environment variables configured
- [ ] Dependencies installed

### **Before Production Deployment**
- [ ] All environment variables set
- [ ] Database accessible from production
- [ ] API keys valid and active
- [ ] Security settings configured
- [ ] Rate limiting tested
- [ ] Email system verified

### **Regular Maintenance**
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Backup important data

## 🔮 **Advanced Troubleshooting**

### **24. Network Issues**
```bash
# Check firewall settings
# Verify DNS resolution
# Test network connectivity
# Check proxy settings
```

### **25. Memory Issues**
```bash
# Monitor memory usage
# Check for memory leaks
# Optimize image processing
# Use streaming for large files
```

### **26. Caching Issues**
```bash
# Clear browser cache
# Clear Next.js cache
# Check CDN cache
# Verify cache headers
```

---

## 📞 **Still Need Help?**

If you've tried all the solutions above and still have issues:

1. **Check the logs** - Look for specific error messages
2. **Simplify the problem** - Test with minimal configuration
3. **Search GitHub issues** - Your problem might already be solved
4. **Contact support** - Provide detailed information about your issue

**Remember**: Most issues can be resolved by checking environment variables, restarting the server, and verifying external service configurations! 🚀

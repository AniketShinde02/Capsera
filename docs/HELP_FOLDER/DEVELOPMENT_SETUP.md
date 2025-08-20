# 🔧 DEVELOPMENT SETUP - Complete Environment Guide

## 🎯 **Prerequisites**

Before setting up the Capsera project, ensure you have the following installed:

### **Required Software**
- **Node.js** (v18.17 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (local or MongoDB Atlas account)
- **Code Editor** (VS Code recommended)

### **System Requirements**
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## 🚀 **Quick Start Setup**

### **Step 1: Clone the Repository**
```bash
# Clone the project
git clone <repository-url>
cd Capsera

# Install dependencies
npm install
```

### **Step 2: Environment Configuration**
Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp docs/env.example .env.local
```

### **Step 3: Configure Environment Variables**
Edit `.env.local` with your actual values:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capsera
MONGODB_URI_LOCAL=mongodb://localhost:27017/capsera

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Cloudinary (Image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Optional: Development overrides
NODE_ENV=development
```

### **Step 4: Database Setup**

#### **Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

#### **Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use `MONGODB_URI_LOCAL` in `.env.local`

### **Step 5: Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
6. Copy Client ID and Secret to `.env.local`

### **Step 6: Cloudinary Setup**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and Secret
4. Update Cloudinary variables in `.env.local`

### **Step 7: AI Services Setup**

#### **Google Gemini**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `GEMINI_API_KEY` in `.env.local`

#### **OpenAI (Backup)**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `OPENAI_API_KEY` in `.env.local`

## 🏃‍♂️ **Running the Project**

### **Development Mode**
```bash
# Start development server
npm run dev

# The app will be available at: http://localhost:3000
```

### **Build and Production Mode**
```bash
# Build the project
npm run build

# Start production server
npm start

# Or use the production script
npm run production
```

### **Other Useful Commands**
```bash
# Lint the code
npm run lint

# Type checking
npm run type-check

# Run tests (if available)
npm test

# Clean build cache
npm run clean
```

## 🗄️ **Database Initialization**

### **First Time Setup**
The database will be automatically initialized when you first run the application. However, you can manually set up:

```bash
# Run database setup script
node scripts/setup-admin.js

# Or use the setup page in the browser
# Navigate to: http://localhost:3000/setup
```

### **Database Collections**
The following collections will be created automatically:
- `users` - User accounts
- `roles` - User roles and permissions
- `posts` - Caption posts
- `adminUsers` - Admin accounts
- `captionCache` - AI response caching
- `systemLock` - Admin access control

## 🔧 **Development Tools & Scripts**

### **Available Scripts**
```bash
# Check environment variables
npm run check-env

# Check database connection
npm run check-db

# Generate JWT tokens
npm run generate-jwt

# Setup admin user
npm run setup-admin

# Clear admin data
npm run clear-admin

# Test admin system
npm run test-admin

# Check system status
npm run check-status
```

### **Database Management Scripts**
```bash
# Backup database
npm run db-backup

# Restore database
npm run db-restore

# Clear all data
npm run db-clear

# Optimize database
npm run db-optimize
```

## 🐛 **Troubleshooting Common Issues**

### **Port Already in Use**
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### **MongoDB Connection Issues**
```bash
# Check MongoDB status
npm run check-db

# Test connection string
node scripts/test-db-connection.js
```

### **Environment Variable Issues**
```bash
# Check all environment variables
npm run check-env

# Validate configuration
node scripts/validate-env.js
```

### **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 **Mobile Development**

### **Testing on Mobile Devices**
```bash
# Get your local IP address
ipconfig  # Windows
ifconfig  # macOS/Linux

# Update NEXTAUTH_URL in .env.local
NEXTAUTH_URL=http://YOUR_IP:3000

# Access from mobile device
# http://YOUR_IP:3000
```

### **Responsive Design Testing**
- Use browser dev tools device simulation
- Test on actual mobile devices
- Check different screen sizes

## 🔒 **Security Considerations**

### **Development vs Production**
```env
# Development (.env.local)
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

# Production (.env.production)
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
```

### **API Key Security**
- Never commit `.env.local` to version control
- Use different API keys for development/production
- Regularly rotate production API keys

## 📊 **Performance Optimization**

### **Development Performance**
```bash
# Enable Next.js analytics
ANALYZE=true npm run build

# Monitor bundle size
npm run analyze

# Check Core Web Vitals
npm run lighthouse
```

### **Database Performance**
```bash
# Create database indexes
npm run db-index

# Monitor query performance
npm run db-monitor

# Optimize database
npm run db-optimize
```

## 🧪 **Testing Setup**

### **Unit Testing**
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### **Integration Testing**
```bash
# Test API endpoints
npm run test:api

# Test database operations
npm run test:db

# Test authentication flow
npm run test:auth
```

## 📚 **Additional Resources**

### **Documentation Files**
- `PROJECT_ARCHITECTURE.md` - System design overview
- `API_ENDPOINTS_COMPLETE.md` - All API documentation
- `TROUBLESHOOTING_GUIDE.md` - Common issues and solutions

### **External Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## ✅ **Setup Verification Checklist**

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file created (`.env.local`)
- [ ] MongoDB connection configured
- [ ] Google OAuth credentials set up
- [ ] Cloudinary account configured
- [ ] AI service API keys added
- [ ] Development server running (`npm run dev`)
- [ ] Database collections created
- [ ] Admin user set up
- [ ] Application accessible at `http://localhost:3000`

## 🚨 **Important Notes**

1. **Never commit `.env.local`** to version control
2. **Use strong, unique secrets** for production
3. **Regularly update dependencies** for security
4. **Monitor API usage** to avoid rate limits
5. **Backup database** before major changes
6. **Test thoroughly** before deploying to production

---

**🎯 Next Steps:**
1. Complete the setup checklist above
2. Read `PROJECT_ARCHITECTURE.md` to understand the system
3. Review `API_ENDPOINTS_COMPLETE.md` for API usage
4. Start developing features!

If you encounter any issues, check the `TROUBLESHOOTING_GUIDE.md` or create an issue in the repository.

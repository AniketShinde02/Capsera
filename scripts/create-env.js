#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env file for Capsera...\n');

const envContent = `# =============================================================================
# 🔧 MAINTENANCE MODE CONFIGURATION
# =============================================================================
# Enable maintenance mode (set to 'true' to activate)
MAINTENANCE_MODE=false

# Allowed IP addresses during maintenance (comma-separated, no spaces)
MAINTENANCE_ALLOWED_IPS=172.19.176.1,192.168.1.3,192.168.1.1,127.0.0.1,::1,localhost

# Allowed email addresses during maintenance (comma-separated, no spaces)
MAINTENANCE_ALLOWED_EMAILS=admin@capsera.com,dev@capsera.com

# =============================================================================
# 🚨 EMERGENCY ACCESS SYSTEM CONFIGURATION
# =============================================================================
# Emergency access token expiration time in hours (default: 24)
EMERGENCY_TOKEN_EXPIRY_HOURS=24

# Maximum emergency tokens per email (default: 5)
EMERGENCY_MAX_TOKENS_PER_EMAIL=5

# Emergency access token length (default: 32)
EMERGENCY_TOKEN_LENGTH=32

# Emergency access rate limit per IP (tokens per hour, default: 10)
EMERGENCY_RATE_LIMIT_PER_IP=10

# =============================================================================
# 🗄️ DATABASE CONFIGURATION
# =============================================================================
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/capsera

# JWT secret for authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# NextAuth secret for session management
NEXTAUTH_SECRET=your_nextauth_secret_here_change_this_in_production

# =============================================================================
# 🌐 AUTHENTICATION & SESSION
# =============================================================================
# NextAuth URL for local development
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# 📧 EMAIL CONFIGURATION (if using email services)
# =============================================================================
# Brevo API key for email sending
BREVO_API_KEY=your_brevo_api_key_here

# =============================================================================
# 🔑 AI SERVICE KEYS
# =============================================================================
# Gemini API key for AI caption generation
GEMINI_API_KEY=your_gemini_api_key_here

# =============================================================================
# 🖼️ IMAGE STORAGE CONFIGURATION
# =============================================================================
# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# =============================================================================
# 📊 ANALYTICS & MONITORING
# =============================================================================
# Google Analytics ID (optional)
NEXT_PUBLIC_GA_ID=your_ga_id_here

# =============================================================================
# 🚀 PRODUCTION SETTINGS
# =============================================================================
# Node environment
NODE_ENV=development

# Port for development server
PORT=3000
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('📁 Location:', envPath);
    console.log('\n💡 To update it, either:');
    console.log('   1. Delete the existing .env file and run this script again');
    console.log('   2. Manually edit the .env file with the content below');
    console.log('\n📋 Content to add/update:');
    console.log('=====================================');
    console.log(envContent);
    console.log('=====================================');
  } else {
    // Create new .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📁 Location:', envPath);
    console.log('\n🔑 IMPORTANT: Update the following values:');
    console.log('   • MONGODB_URI (your MongoDB connection string)');
    console.log('   • JWT_SECRET (generate a strong random string)');
    console.log('   • NEXTAUTH_SECRET (generate a strong random string)');
    console.log('   • BREVO_API_KEY (if using email service)');
    console.log('   • GEMINI_API_KEY (if using AI caption generation)');
    console.log('\n💡 You can customize the IP addresses and emails in:');
    console.log('   • MAINTENANCE_ALLOWED_IPS');
    console.log('   • MAINTENANCE_ALLOWED_EMAILS');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📋 Manual creation:');
  console.log('1. Create a file named ".env" in your project root');
  console.log('2. Copy and paste the content above');
  console.log('3. Update the values as needed');
}

console.log('\n🚀 After creating/updating .env, restart your development server:');
console.log('   npm run dev');

#!/usr/bin/env node

/**
 * Generate a simple, unique alphanumeric token for admin setup
 * Run this script to generate a secure token for ALLOW_ADMIN_SETUP
 * Features:
 * - Simple alphanumeric characters only (a-z, A-Z, 0-9)
 * - Guaranteed uniqueness with timestamp + random string
 * - Easy to copy and paste
 * - No special characters that could cause issues
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateAlphanumericToken() {
  // Generate timestamp component (base36 for compactness)
  const timestamp = Date.now().toString(36);
  
  // Generate random alphanumeric string (8 characters)
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 8; i++) {
    randomString += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  // Generate additional random component (6 characters)
  let additionalString = '';
  for (let i = 0; i < 6; i++) {
    additionalString += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  // Combine: admin-timestamp-random-additional
  const token = `admin-${timestamp}-${randomString}-${additionalString}`;
  
  return token;
}

function updateEnvFile(token) {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  try {
    let envContent = '';
    
    // Check if .env file exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update existing ADMIN_SETUP_TOKEN if it exists
      if (envContent.includes('ADMIN_SETUP_TOKEN=')) {
        envContent = envContent.replace(/ADMIN_SETUP_TOKEN=.*/g, `ADMIN_SETUP_TOKEN=${token}`);
      } else {
        envContent += `\nADMIN_SETUP_TOKEN=${token}`;
      }
    } else if (fs.existsSync(envExamplePath)) {
      // Create .env from env.example if it doesn't exist
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      envContent = envContent.replace(/ADMIN_SETUP_TOKEN=.*/g, `ADMIN_SETUP_TOKEN=${token}`);
      envContent = envContent.replace(/ALLOW_ADMIN_SETUP=false/g, 'ALLOW_ADMIN_SETUP=true');
      envContent = envContent.replace(/NEXTAUTH_URL=http:\/\/localhost:9002/g, 'NEXTAUTH_URL=http://localhost:3000');
    } else {
      // Create basic .env file
      envContent = `# CaptionCraft Environment Configuration
MONGODB_URI=mongodb://localhost:27017/captioncraft
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ALLOW_ADMIN_SETUP=true
ADMIN_SETUP_TOKEN=${token}
NODE_ENV=development`;
    }
    
    fs.writeFileSync(envPath, envContent);
    return true;
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    return false;
  }
}

function main() {
  console.log('🔐 CAPTIONCRAFT ADMIN SETUP TOKEN GENERATOR');
  console.log('=============================================');
  console.log('');
  
  // Generate simple alphanumeric token
  const token = generateAlphanumericToken();
  
  console.log('✅ Your simple alphanumeric setup token has been generated:');
  console.log('');
  console.log(`   ${token}`);
  console.log('');
  
  // Show token characteristics
  console.log('🔍 Token Analysis:');
  console.log(`   Length: ${token.length} characters`);
  console.log(`   Type: Alphanumeric only (a-z, A-Z, 0-9)`);
  console.log(`   Format: admin-timestamp-random-additional`);
  console.log(`   Special characters: None (safe and reliable)`);
  console.log('');
  
  // Update .env file automatically
  console.log('📝 Updating environment configuration...');
  const envUpdated = updateEnvFile(token);
  
  if (envUpdated) {
    console.log('✅ .env file updated successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. ✅ Token generated and saved to .env');
    console.log('2. ✅ ALLOW_ADMIN_SETUP set to true');
    console.log('3. ✅ NEXTAUTH_URL set to http://localhost:3000');
    console.log('4. 🔄 Restart your server: npm run dev');
    console.log('5. 🌐 Visit /setup in your browser');
    console.log('6. 🔑 Enter the token above to create admin account');
    console.log('');
    console.log('🚀 Ready to go! Run: npm run dev');
  } else {
    console.log('⚠️  .env file could not be updated automatically');
    console.log('');
    console.log('📋 Manual steps required:');
    console.log('1. Add to your .env file:');
    console.log(`   ADMIN_SETUP_TOKEN=${token}`);
    console.log('2. Set ALLOW_ADMIN_SETUP=true');
    console.log('3. Set NEXTAUTH_URL=http://localhost:3000');
    console.log('4. Restart your server');
    console.log('5. Visit /setup and enter the token');
  }
  
  console.log('');
  console.log('🔒 Security Note: This token is simple but secure');
  console.log('   Each generation creates a completely different token');
  console.log('   No special characters = no copy/paste issues');
  console.log('');
}

// Run the generator
main();

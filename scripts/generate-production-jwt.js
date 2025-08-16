#!/usr/bin/env node

/**
 * Production JWT Token Generator for CaptionCraft Admin Setup
 * 
 * This script generates JWT tokens for production admin setup
 * Perfect for Vercel deployment where environment files aren't secure
 * 
 * Features:
 * - JWT tokens with 24-hour expiration
 * - Secure token generation
 * - Production-ready setup
 * - No environment file dependency
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Secret - CHANGE THIS IN PRODUCTION!
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production';

function generateProductionJWT() {
  // Generate unique JWT ID
  const jti = `setup-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  
  // Create JWT payload
  const payload = {
    type: 'admin-setup',
    purpose: 'initial-admin-creation',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    jti: jti
  };

  // Sign JWT token
  const token = jwt.sign(payload, JWT_SECRET);

  return {
    token,
    payload,
    expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000))
  };
}

function main() {
  console.log('🔐 CAPTIONCRAFT PRODUCTION JWT TOKEN GENERATOR');
  console.log('================================================');
  console.log('');
  
  // Check if JWT_SECRET is default
  if (JWT_SECRET === 'your-super-secure-jwt-secret-key-change-this-in-production') {
    console.log('⚠️  WARNING: Using default JWT_SECRET!');
    console.log('   Change this in production for security!');
    console.log('');
  }
  
  // Generate JWT token
  const { token, payload, expiresAt } = generateProductionJWT();
  
  console.log('✅ Production JWT setup token generated:');
  console.log('');
  console.log(`   ${token}`);
  console.log('');
  
  console.log('🔍 Token Details:');
  console.log(`   Type: ${payload.type}`);
  console.log(`   Purpose: ${payload.purpose}`);
  console.log(`   Expires: ${expiresAt.toISOString()}`);
  console.log(`   JWT ID: ${payload.jti}`);
  console.log('');
  
  console.log('📋 Production Setup Instructions:');
  console.log('1. ✅ JWT token generated successfully');
  console.log('2. 🔒 Share token securely with admin (email/SMS)');
  console.log('3. 🌐 Admin visits your deployed site at /setup');
  console.log('4. 🔑 Admin enters JWT token');
  console.log('5. 👤 Admin creates account with username/password');
  console.log('6. 🚀 Admin gets access to admin dashboard');
  console.log('');
  
  console.log('🌍 For Vercel Deployment:');
  console.log('1. Set JWT_SECRET in Vercel environment variables');
  console.log('2. Deploy your application');
  console.log('3. Run this script to generate setup token');
  console.log('4. Share token with admin');
  console.log('5. Admin uses /setup page to create account');
  console.log('');
  
  console.log('🔒 Security Notes:');
  console.log('   • JWT tokens expire in 24 hours');
  console.log('   • Each token can only be used once');
  console.log('   • Tokens are cryptographically secure');
  console.log('   • No environment file dependency');
  console.log('   • Perfect for production deployment');
  console.log('');
  
  console.log('🚀 Ready for production!');
  console.log('   Token expires: ' + expiresAt.toLocaleString());
}

// Run the generator
main();

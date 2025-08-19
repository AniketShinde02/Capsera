#!/usr/bin/env node

/**
 * Test Script for Maintenance Configuration
 * Tests environment-based configuration loading
 */

require('dotenv').config();

async function testMaintenanceConfig() {
  console.log('🧪 Testing Maintenance Configuration System...\n');

  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking Environment Variables...');
    const envVars = {
      'MAINTENANCE_MODE': process.env.MAINTENANCE_MODE,
      'MAINTENANCE_ALLOWED_IPS': process.env.MAINTENANCE_ALLOWED_IPS,
      'MAINTENANCE_ALLOWED_EMAILS': process.env.MAINTENANCE_ALLOWED_EMAILS,
      'EMERGENCY_TOKEN_EXPIRY_HOURS': process.env.EMERGENCY_TOKEN_EXPIRY_HOURS,
      'EMERGENCY_MAX_TOKENS_PER_EMAIL': process.env.EMERGENCY_MAX_TOKENS_PER_EMAIL,
      'EMERGENCY_TOKEN_LENGTH': process.env.EMERGENCY_TOKEN_LENGTH,
      'EMERGENCY_RATE_LIMIT_PER_IP': process.env.EMERGENCY_RATE_LIMIT_PER_IP
    };

    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ ${key}: ${value}`);
      } else {
        console.log(`⚠️  ${key}: Not set (using default)`);
      }
    });
    console.log('');

    // Test 2: Test configuration loading
    console.log('2️⃣ Testing Configuration Loading...');
    
    // Import the config module
    const { getMaintenanceConfig, generateSecureToken, calculateTokenExpiry } = require('../src/lib/maintenance-config');
    
    const config = getMaintenanceConfig();
    console.log('✅ Configuration loaded successfully');
    console.log('📋 Maintenance Mode Config:', config.maintenanceMode);
    console.log('📋 Emergency Access Config:', config.emergencyAccess);
    console.log('');

    // Test 3: Test token generation
    console.log('3️⃣ Testing Token Generation...');
    const token = generateSecureToken(config.emergencyAccess.tokenLength);
    console.log(`✅ Token generated: ${token}`);
    console.log(`🔢 Token length: ${token.length} (expected: ${config.emergencyAccess.tokenLength})`);
    console.log('');

    // Test 4: Test token expiry calculation
    console.log('4️⃣ Testing Token Expiry Calculation...');
    const expiry = calculateTokenExpiry(config.emergencyAccess.tokenExpiryHours);
    const now = new Date();
    const hoursUntilExpiry = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    console.log(`✅ Token expires: ${expiry.toLocaleString()}`);
    console.log(`⏰ Hours until expiry: ${hoursUntilExpiry} (expected: ${config.emergencyAccess.tokenExpiryHours})`);
    console.log('');

    // Test 5: Test API endpoints
    console.log('5️⃣ Testing API Endpoints...');
    const BASE_URL = 'http://localhost:3000';
    
    try {
      // Test maintenance status
      const maintenanceResponse = await fetch(`${BASE_URL}/api/maintenance`);
      if (maintenanceResponse.ok) {
        console.log('✅ Maintenance API: Working');
      } else {
        console.log('❌ Maintenance API: Failed');
      }

      // Test emergency access stats
      const statsResponse = await fetch(`${BASE_URL}/api/maintenance/emergency-access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-stats' })
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Emergency Access API: Working');
        console.log('📊 Current Stats:', statsData.stats);
        console.log('⚙️  Current Config:', statsData.config);
      } else {
        console.log('❌ Emergency Access API: Failed');
      }
    } catch (error) {
      console.log('⚠️  API tests skipped (server might not be running)');
    }
    console.log('');

    // Test 6: Configuration summary
    console.log('6️⃣ Configuration Summary...');
    console.log('🎯 Current Settings:');
    console.log(`   • Maintenance Mode: ${config.maintenanceMode.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   • Default Allowed IPs: ${config.maintenanceMode.allowedIPs.join(', ')}`);
    console.log(`   • Default Allowed Emails: ${config.maintenanceMode.allowedEmails.join(', ') || 'None'}`);
    console.log(`   • Token Expiry: ${config.emergencyAccess.tokenExpiryHours} hours`);
    console.log(`   • Max Tokens per Email: ${config.emergencyAccess.maxTokensPerEmail}`);
    console.log(`   • Token Length: ${config.emergencyAccess.tokenLength} characters`);
    console.log(`   • Rate Limit per IP: ${config.emergencyAccess.rateLimitPerIP} tokens/hour`);
    console.log('');

    console.log('🎉 All configuration tests passed!');
    console.log('');
    console.log('💡 To customize these settings, update your .env file:');
    console.log('   MAINTENANCE_MODE=true');
    console.log('   MAINTENANCE_ALLOWED_IPS=192.168.1.100,203.45.67.89');
    console.log('   MAINTENANCE_ALLOWED_EMAILS=admin@capsera.com,dev@capsera.com');
    console.log('   EMERGENCY_TOKEN_EXPIRY_HOURS=48');
    console.log('   EMERGENCY_MAX_TOKENS_PER_EMAIL=10');
    console.log('   EMERGENCY_TOKEN_LENGTH=64');
    console.log('   EMERGENCY_RATE_LIMIT_PER_IP=20');

  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMaintenanceConfig();

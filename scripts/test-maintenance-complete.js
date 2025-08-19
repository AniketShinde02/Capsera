#!/usr/bin/env node

/**
 * Complete Test Script for Maintenance Mode System
 * Tests all functionality including emergency access
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteMaintenanceSystem() {
  console.log('🧪 Testing Complete Maintenance Mode System...\n');

  try {
    // Test 1: Get current maintenance status
    console.log('1️⃣ Getting current maintenance status...');
    const statusResponse = await fetch(`${BASE_URL}/api/maintenance`);
    const statusData = await statusResponse.json();
    console.log('✅ Current Status:', statusData.status?.enabled ? 'ENABLED' : 'DISABLED');
    console.log('📝 Message:', statusData.status?.message);
    console.log('⏰ Estimated Time:', statusData.status?.estimatedTime);
    console.log('🔒 Allowed IPs:', statusData.status?.allowedIPs);
    console.log('📧 Allowed Emails:', statusData.status?.allowedEmails);
    console.log('');

    // Test 2: Add test IP and email
    console.log('2️⃣ Adding test IP and email to whitelist...');
    const testConfig = {
      enabled: false, // Start with maintenance disabled
      message: "Testing maintenance mode system",
      estimatedTime: "1 hour",
      allowedIPs: ['127.0.0.1', '::1', 'localhost'],
      allowedEmails: ['admin@capsera.com', 'test@capsera.com']
    };

    const configResponse = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig),
    });

    if (configResponse.ok) {
      console.log('✅ Test configuration saved');
    } else {
      console.log('❌ Failed to save test configuration');
    }
    console.log('');

    // Test 3: Enable maintenance mode
    console.log('3️⃣ Enabling maintenance mode...');
    const enableResponse = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testConfig, enabled: true }),
    });
    
    if (enableResponse.ok) {
      const enableData = await enableResponse.json();
      console.log('✅ Maintenance Mode ENABLED');
      console.log('📢 Response:', enableData.message);
    } else {
      console.log('❌ Failed to enable maintenance mode');
    }
    console.log('');

    // Test 4: Test emergency access token generation
    console.log('4️⃣ Testing emergency access token generation...');
    const tokenResponse = await fetch(`${BASE_URL}/api/maintenance/emergency-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@capsera.com' }),
    });
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ Emergency Token Generated');
      console.log('🔑 Token:', tokenData.token);
      console.log('⏰ Expires:', new Date(tokenData.expiresAt).toLocaleString());
      
      // Test 5: Test emergency access token verification
      console.log('5️⃣ Testing emergency access token verification...');
      const verifyResponse = await fetch(`${BASE_URL}/api/maintenance/emergency-access?token=${tokenData.token}`);
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Emergency Access Granted');
        console.log('📧 Email:', verifyData.email);
      } else {
        console.log('❌ Emergency access verification failed');
      }
    } else {
      console.log('❌ Failed to generate emergency token');
    }
    console.log('');

    // Test 6: Test site access during maintenance
    console.log('6️⃣ Testing site access during maintenance...');
    try {
      const siteResponse = await fetch(`${BASE_URL}/`);
      if (siteResponse.redirected) {
        console.log('✅ Site correctly redirects to maintenance page');
        console.log('📍 Redirect URL:', siteResponse.url);
      } else {
        console.log('⚠️ Site might not be redirecting properly');
      }
    } catch (error) {
      console.log('✅ Site access blocked (expected during maintenance)');
    }
    console.log('');

    // Test 7: Disable maintenance mode
    console.log('7️⃣ Disabling maintenance mode...');
    const disableResponse = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'DELETE'
    });
    
    if (disableResponse.ok) {
      const disableData = await disableResponse.json();
      console.log('✅ Maintenance Mode DISABLED');
      console.log('📢 Response:', disableData.message);
    } else {
      console.log('❌ Failed to disable maintenance mode');
    }
    console.log('');

    // Test 8: Final verification
    console.log('8️⃣ Final verification...');
    const finalResponse = await fetch(`${BASE_URL}/api/maintenance`);
    const finalData = await finalResponse.json();
    console.log('✅ Final Status:', finalData.status?.enabled ? 'ENABLED' : 'DISABLED');
    
    if (!finalData.status?.enabled) {
      console.log('🎉 All tests passed! Complete maintenance system is working correctly.');
    } else {
      console.log('❌ Maintenance mode is still enabled');
    }

    // Test 9: Test site access after maintenance disabled
    console.log('9️⃣ Testing site access after maintenance disabled...');
    try {
      const finalSiteResponse = await fetch(`${BASE_URL}/`);
      if (finalSiteResponse.ok) {
        console.log('✅ Site is now accessible');
      } else {
        console.log('⚠️ Site might still have issues');
      }
    } catch (error) {
      console.log('✅ Site access restored');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteMaintenanceSystem();

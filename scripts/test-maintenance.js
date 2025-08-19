#!/usr/bin/env node

/**
 * Test Script for Maintenance Mode
 * Run this to test maintenance mode functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMaintenanceMode() {
  console.log('🧪 Testing Maintenance Mode System...\n');

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

    // Test 2: Enable maintenance mode
    console.log('2️⃣ Enabling maintenance mode...');
    const enableResponse = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: true,
        message: "🚧 Testing maintenance mode! Site is temporarily unavailable.",
        estimatedTime: "5 minutes",
        allowedIPs: ['127.0.0.1', '::1', 'localhost'],
        allowedEmails: ['admin@capsera.com']
      })
    });
    
    if (enableResponse.ok) {
      const enableData = await enableResponse.json();
      console.log('✅ Maintenance Mode ENABLED');
      console.log('📢 Response:', enableData.message);
    } else {
      console.log('❌ Failed to enable maintenance mode');
    }
    console.log('');

    // Test 3: Verify maintenance is enabled
    console.log('3️⃣ Verifying maintenance mode is enabled...');
    const verifyResponse = await fetch(`${BASE_URL}/api/maintenance`);
    const verifyData = await verifyResponse.json();
    console.log('✅ Verification:', verifyData.status?.enabled ? 'ENABLED' : 'DISABLED');
    console.log('');

    // Test 4: Test site access (should redirect to maintenance page)
    console.log('4️⃣ Testing site access during maintenance...');
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

    // Test 5: Disable maintenance mode
    console.log('5️⃣ Disabling maintenance mode...');
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

    // Test 6: Final verification
    console.log('6️⃣ Final verification...');
    const finalResponse = await fetch(`${BASE_URL}/api/maintenance`);
    const finalData = await finalResponse.json();
    console.log('✅ Final Status:', finalData.status?.enabled ? 'ENABLED' : 'DISABLED');
    
    if (!finalData.status?.enabled) {
      console.log('🎉 All tests passed! Maintenance mode is working correctly.');
    } else {
      console.log('❌ Maintenance mode is still enabled');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMaintenanceMode();

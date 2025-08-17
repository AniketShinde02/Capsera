#!/usr/bin/env node

/**
 * Test Script: OTP Verification and Admin Creation Flow
 * This script tests the complete flow to ensure the OTP token is properly passed
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'sunnyshinde2601@gmail.com';

async function testOTPFlow() {
  console.log('🧪 Testing OTP Verification and Admin Creation Flow...\n');

  try {
    // Step 1: Request OTP
    console.log('📧 Step 1: Requesting OTP...');
    const otpResponse = await fetch(`${BASE_URL}/api/admin/request-setup-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    if (!otpResponse.ok) {
      const errorData = await otpResponse.json();
      console.log('❌ Failed to request OTP:', errorData.message);
      return;
    }

    const otpData = await otpResponse.json();
    console.log('✅ OTP requested successfully');
    console.log('📝 OTP generated:', otpData.otp);
    console.log('');

    // Step 2: Verify OTP
    console.log('🔐 Step 2: Verifying OTP...');
    const verifyResponse = await fetch(`${BASE_URL}/api/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify-token',
        token: otpData.otp,
        email: TEST_EMAIL
      })
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.log('❌ OTP verification failed:', errorData.message);
      return;
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ OTP verified successfully');
    console.log('📊 Admin exists:', verifyData.adminExists);
    console.log('');

    // Step 3: Create Admin (this should now work with the token)
    console.log('👤 Step 3: Creating admin account...');
    const createResponse = await fetch(`${BASE_URL}/api/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-admin',
        email: TEST_EMAIL,
        password: 'TestPassword123!',
        username: 'test-admin',
        token: otpData.otp // This should now work!
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.log('❌ Admin creation failed:', errorData.message);
      console.log('🔍 This should now work with the token being passed');
      return;
    }

    const createData = await createResponse.json();
    console.log('✅ Admin created successfully!');
    console.log('👤 Admin ID:', createData.adminUser.id);
    console.log('📧 Email:', createData.adminUser.email);
    console.log('');

    console.log('🎉 All tests passed! The OTP token is now properly passed through the flow.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOTPFlow();

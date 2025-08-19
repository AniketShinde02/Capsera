#!/usr/bin/env node
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access During Maintenance...\n');

  try {
    // Test 1: Check maintenance status
    console.log('1️⃣ Checking maintenance status...');
    const maintenanceResponse = await fetch(`${BASE_URL}/api/maintenance`);
    if (maintenanceResponse.ok) {
      const maintenanceData = await maintenanceResponse.json();
      console.log('✅ Maintenance status:', maintenanceData.status);
    } else {
      console.log('❌ Failed to get maintenance status');
      return;
    }

    // Test 2: Try to access home page (should redirect to maintenance)
    console.log('\n2️⃣ Testing home page access...');
    const homeResponse = await fetch(`${BASE_URL}/`);
    console.log('🏠 Home page response status:', homeResponse.status);
    console.log('🏠 Home page response URL:', homeResponse.url);
    
    if (homeResponse.redirected) {
      console.log('🔄 Page was redirected to:', homeResponse.url);
    }

    // Test 3: Test admin bypass endpoint with no cookies
    console.log('\n3️⃣ Testing admin bypass with no cookies...');
    const adminBypassResponse = await fetch(`${BASE_URL}/api/maintenance/admin-bypass`);
    if (adminBypassResponse.ok) {
      const adminBypassData = await adminBypassResponse.json();
      console.log('✅ Admin bypass response (no cookies):', adminBypassData);
    } else {
      console.log('❌ Failed to get admin bypass response');
    }

    // Test 4: Test admin bypass endpoint with test cookies
    console.log('\n4️⃣ Testing admin bypass with test cookies...');
    const cookiesResponse = await fetch(`${BASE_URL}/api/maintenance/admin-bypass`, {
      headers: {
        'Cookie': 'next-auth.session-token=test-token; next-auth.csrf-token=test-csrf'
      }
    });
    if (cookiesResponse.ok) {
      const cookiesData = await cookiesResponse.json();
      console.log('✅ Admin bypass response (with cookies):', cookiesData);
    } else {
      console.log('❌ Failed to get admin bypass response with cookies');
    }

    // Test 5: Test accessing admin bypass page
    console.log('\n5️⃣ Testing admin bypass page access...');
    const bypassPageResponse = await fetch(`${BASE_URL}/admin-bypass`);
    console.log('🔑 Admin bypass page response status:', bypassPageResponse.status);
    console.log('🔑 Admin bypass page response URL:', bypassPageResponse.url);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAdminAccess();

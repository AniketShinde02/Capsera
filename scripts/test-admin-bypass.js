#!/usr/bin/env node
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function testAdminBypass() {
  console.log('🧪 Testing Admin Bypass System...\n');

  try {
    // Test 1: Check maintenance status
    console.log('1️⃣ Checking maintenance status...');
    const maintenanceResponse = await fetch(`${BASE_URL}/api/maintenance`);
    if (maintenanceResponse.ok) {
      const maintenanceData = await maintenanceResponse.json();
      console.log('✅ Maintenance status:', maintenanceData.status);
    } else {
      console.log('❌ Failed to get maintenance status');
    }

    // Test 2: Test admin bypass endpoint
    console.log('\n2️⃣ Testing admin bypass endpoint...');
    const adminBypassResponse = await fetch(`${BASE_URL}/api/maintenance/admin-bypass`);
    if (adminBypassResponse.ok) {
      const adminBypassData = await adminBypassResponse.json();
      console.log('✅ Admin bypass response:', adminBypassData);
    } else {
      console.log('❌ Failed to get admin bypass response');
    }

    // Test 3: Test with cookies (simulate logged-in user)
    console.log('\n3️⃣ Testing with cookies...');
    const cookiesResponse = await fetch(`${BASE_URL}/api/maintenance/admin-bypass`, {
      headers: {
        'Cookie': 'test-cookie=value'
      }
    });
    if (cookiesResponse.ok) {
      const cookiesData = await cookiesResponse.json();
      console.log('✅ Cookies response:', cookiesData);
    } else {
      console.log('❌ Failed to get cookies response');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAdminBypass();

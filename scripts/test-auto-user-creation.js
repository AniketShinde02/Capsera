#!/usr/bin/env node

/**
 * Test Script: Auto User Creation System
 * This script tests the new automatic user creation and role assignment system
 */

// Use built-in fetch for Node.js 18+ or install node-fetch for older versions
let fetch;
try {
  // Try to use built-in fetch (Node.js 18+)
  fetch = globalThis.fetch;
} catch (error) {
  // Fallback to node-fetch for older Node.js versions
  try {
    fetch = require('node-fetch');
  } catch (fetchError) {
    console.error('❌ Fetch not available. Please install node-fetch:');
    console.error('   npm install node-fetch');
    console.error('   Or upgrade to Node.js 18+');
    process.exit(1);
  }
}

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com'; // You'll need to use a real admin email

async function testAutoUserCreation() {
  console.log('🧪 Testing Auto User Creation System...\n');

  try {
    // Test 1: Create role with auto user creation
    console.log('📝 Test 1: Creating role with auto user creation...');
    
    const roleData = {
      name: 'test_moderator',
      displayName: 'Test Moderator',
      description: 'Test role for auto user creation',
      permissions: [
        { resource: 'posts', actions: ['read', 'update', 'delete'] },
        { resource: 'users', actions: ['read'] }
      ],
      isSystem: false,
      isActive: true,
      autoCreateUsers: true,
      usersToCreate: [
        {
          email: 'moderator1@test.com',
          username: 'moderator1',
          firstName: 'John',
          lastName: 'Moderator',
          phone: '1234567890',
          department: 'Content'
        },
        {
          email: 'moderator2@test.com',
          username: 'moderator2',
          firstName: 'Jane',
          lastName: 'Moderator',
          phone: '0987654321',
          department: 'Content'
        }
      ],
      sendEmailNotifications: true
    };

    const response = await fetch(`${BASE_URL}/api/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Role created successfully with auto user creation!');
      console.log('📊 Results:', JSON.stringify(result, null, 2));
      
      if (result.autoUserCreation) {
        console.log(`\n👥 Auto User Creation Results:`);
        console.log(`   Total: ${result.autoUserCreation.results.total}`);
        console.log(`   Success: ${result.autoUserCreation.results.success}`);
        console.log(`   Failed: ${result.autoUserCreation.results.failed}`);
        
        if (result.autoUserCreation.results.failed > 0) {
          console.log('\n❌ Failed Users:');
          result.autoUserCreation.results.results
            .filter(r => !r.success)
            .forEach(r => console.log(`   ${r.email}: ${r.error}`));
        }
      }
    } else {
      const error = await response.json();
      console.log('❌ Role creation failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n🎯 Test completed!');
}

// Test email service connection
async function testEmailService() {
  console.log('\n📧 Testing Email Service Connection...');
  
  try {
    // This would test the Brevo SMTP connection
    // You'll need to implement this endpoint or test it directly
    console.log('ℹ️ Email service test requires proper SMTP configuration');
    console.log('   Make sure BREVO_SMTP_HOST, BREVO_SMTP_USER, and BREVO_SMTP_PASS are set');
  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Auto User Creation System Tests...\n');
  
  await testAutoUserCreation();
  await testEmailService();
  
  console.log('\n✨ All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAutoUserCreation, testEmailService };

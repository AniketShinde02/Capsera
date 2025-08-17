#!/usr/bin/env node

/**
 * Simple Test Script: Auto User Creation System
 * Uses built-in Node.js modules - no external dependencies required
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Simple HTTP client using built-in modules
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(jsonData)
          });
        } catch (error) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve({ error: 'Invalid JSON response', raw: data })
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

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

    const response = await makeRequest(`${BASE_URL}/api/admin/roles`, {
      method: 'POST',
      body: roleData
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

// Test basic connectivity
async function testConnectivity() {
  console.log('\n🌐 Testing Basic Connectivity...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health-check`);
    if (response.ok) {
      console.log('✅ Server is reachable');
    } else {
      console.log('⚠️ Server responded but with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot reach server. Make sure it\'s running on:', BASE_URL);
    console.log('   Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Auto User Creation System Tests...\n');
  
  await testConnectivity();
  await testAutoUserCreation();
  await testEmailService();
  
  console.log('\n✨ All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAutoUserCreation, testEmailService, testConnectivity };

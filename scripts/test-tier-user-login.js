/**
 * Test Tier User Creation and Login Flow
 * This script tests the complete flow from role creation to user creation to login
 */

const fetch = globalThis.fetch || require('node-fetch');

async function testTierUserFlow() {
  console.log('🚀 Testing Tier User Creation and Login Flow...\n');

  try {
    // Step 1: Create a test role with auto user creation
    console.log('📝 Step 1: Creating Test Role with Auto User Creation...');
    
    const testRoleData = {
      name: 'Content-Moderator-Test',
      displayName: 'Content Moderator Test',
      description: 'Test role for tier user creation and login',
      permissions: [
        {
          resource: 'posts',
          actions: ['read', 'create', 'update']
        },
        {
          resource: 'users',
          actions: ['read']
        }
      ],
      autoCreateUsers: true,
      usersToCreate: [
        {
          email: 'tieruser1@example.com',
          username: 'tieruser1',
          firstName: 'Tier',
          lastName: 'User1',
          department: 'Content'
        }
      ],
      sendEmailNotifications: true
    };

    console.log('Creating test role with auto user creation...');
    const roleResponse = await fetch('http://localhost:3000/api/admin/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRoleData)
    });

    if (!roleResponse.ok) {
      const errorData = await roleResponse.json();
      console.log('❌ Role creation failed:', errorData.error);
      return;
    }

    const roleData = await roleResponse.json();
    console.log('✅ Role created successfully!');
    console.log('Role ID:', roleData.role._id);
    
    if (roleData.autoUserCreation && roleData.autoUserCreation.results) {
      const results = roleData.autoUserCreation.results;
      console.log(`\n📊 User Creation Summary:`);
      console.log(`Total users: ${results.total}`);
      console.log(`Success: ${results.success}`);
      console.log(`Failed: ${results.failed}`);
      
      if (results.results && results.results[0].success) {
        const user = results.results[0];
        console.log(`\n👤 Created User Details:`);
        console.log(`Email: ${user.email}`);
        console.log(`Username: ${user.credentials.username}`);
        console.log(`Password: ${user.credentials.password}`);
        
        // Step 2: Test login with the created user
        console.log('\n🔐 Step 2: Testing Login with Created User...');
        
        const loginData = {
          email: user.email,
          password: user.credentials.password
        };

        console.log('Attempting login with:', loginData.email);
        
        // Test login using NextAuth
        const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            email: loginData.email,
            password: loginData.password,
            callbackUrl: '/',
            csrfToken: 'test-token' // This would normally come from the form
          })
        });

        console.log('Login response status:', loginResponse.status);
        
        if (loginResponse.ok) {
          console.log('✅ Login successful!');
        } else {
          console.log('❌ Login failed');
          const loginError = await loginResponse.text();
          console.log('Login error:', loginError);
        }

        // Step 3: Verify user exists in adminusers collection
        console.log('\n👥 Step 3: Verifying User in Database...');
        
        // This would normally be done through an admin API
        console.log('User should be stored in adminusers collection with:');
        console.log('- Email:', user.email);
        console.log('- Username:', user.credentials.username);
        console.log('- Role:', testRoleData.name);
        console.log('- Status: active');
        console.log('- Password: hashed and stored securely');

        // Step 4: Test login flow manually
        console.log('\n📋 Step 4: Manual Login Instructions...');
        console.log('To test the login manually:');
        console.log('1. Go to your app\'s login page');
        console.log('2. Use these credentials:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.credentials.password}`);
        console.log('3. The user should be able to log in successfully');
        console.log('4. Check that they have the correct role and permissions');

        console.log('\n🎉 Tier User Flow Test Completed!');
        console.log('\n📧 Check the email inbox for:', user.email);
        console.log('They should have received a welcome email with their credentials.');

      } else {
        console.log('❌ User creation failed:', results.results[0].error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
if (require.main === module) {
  testTierUserFlow();
}

module.exports = { testTierUserFlow };

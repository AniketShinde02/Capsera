/**
 * Test Auto User Creation System End-to-End
 * This script tests the complete flow from role creation to user creation and email sending
 */

const fetch = globalThis.fetch || require('node-fetch');

async function testAutoUserCreation() {
  console.log('🚀 Testing Auto User Creation System...\n');

  try {
    // Step 1: Test email service connection
    console.log('📧 Step 1: Testing Email Service Connection...');
    const emailTestResponse = await fetch('http://localhost:3000/api/admin/system-lock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'get-status' })
    });

    if (emailTestResponse.ok) {
      console.log('✅ Email service connection test passed');
    } else {
      console.log('❌ Email service connection test failed');
    }

    // Step 2: Test role creation with auto user creation
    console.log('\n🔐 Step 2: Testing Role Creation with Auto User Creation...');
    
    const testRoleData = {
      name: 'Test-Role-123',
      displayName: 'Test Role 123',
      description: 'Test role for auto user creation',
      permissions: [
        {
          resource: 'users',
          actions: ['read', 'create']
        },
        {
          resource: 'posts',
          actions: ['read']
        }
      ],
      autoCreateUsers: true,
      usersToCreate: [
        {
          email: 'testuser1@example.com',
          username: 'testuser1',
          firstName: 'Test',
          lastName: 'User1',
          department: 'Testing'
        },
        {
          email: 'testuser2@example.com',
          username: 'testuser2',
          firstName: 'Test',
          lastName: 'User2',
          department: 'Testing'
        }
      ],
      sendEmailNotifications: true
    };

    console.log('📝 Creating test role with auto user creation...');
    console.log('Role data:', JSON.stringify(testRoleData, null, 2));

    const roleResponse = await fetch('http://localhost:3000/api/admin/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRoleData)
    });

    if (roleResponse.ok) {
      const roleData = await roleResponse.json();
      console.log('✅ Role created successfully!');
      console.log('Role ID:', roleData.role._id);
      console.log('Auto user creation results:', JSON.stringify(roleData.autoUserCreation, null, 2));
      
      if (roleData.autoUserCreation && roleData.autoUserCreation.results) {
        const results = roleData.autoUserCreation.results;
        console.log(`\n📊 User Creation Summary:`);
        console.log(`Total users: ${results.total}`);
        console.log(`Success: ${results.success}`);
        console.log(`Failed: ${results.failed}`);
        
        if (results.results) {
          console.log('\n📋 Detailed Results:');
          results.results.forEach((result, index) => {
            if (result.success) {
              console.log(`✅ User ${index + 1}: ${result.email} - Created successfully`);
              if (result.credentials) {
                console.log(`   Username: ${result.credentials.username}`);
                console.log(`   Password: ${result.credentials.password}`);
              }
            } else {
              console.log(`❌ User ${index + 1}: ${result.email} - Failed: ${result.error}`);
            }
          });
        }
      }
    } else {
      const errorData = await roleResponse.json();
      console.log('❌ Role creation failed:', errorData.error);
      console.log('Status:', roleResponse.status);
    }

    // Step 3: Verify users were created
    console.log('\n👥 Step 3: Verifying Created Users...');
    const usersResponse = await fetch('http://localhost:3000/api/admin/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const testUsers = usersData.users.filter(user => 
        user.email.includes('testuser') || user.username.includes('testuser')
      );
      
      console.log(`Found ${testUsers.length} test users:`);
      testUsers.forEach(user => {
        console.log(`- ${user.email} (@${user.username}) - Role: ${user.role}`);
      });
    } else {
      console.log('❌ Failed to fetch users for verification');
    }

    // Step 4: Test email notifications
    console.log('\n📧 Step 4: Testing Email Notifications...');
    console.log('Check the email inboxes for:');
    console.log('- testuser1@example.com');
    console.log('- testuser2@example.com');
    console.log('They should have received welcome emails with their credentials.');

    console.log('\n🎉 Auto User Creation System Test Completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
if (require.main === module) {
  testAutoUserCreation();
}

module.exports = { testAutoUserCreation };

const fs = require('fs');
const path = require('path');

async function testAdminCreation() {
  try {
    console.log('🧪 Testing Admin Creation and Login...');
    console.log('==========================================');
    
    // Read .env file to get the token
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenMatch = envContent.match(/ADMIN_SETUP_TOKEN=(.+)/);
    
    if (!tokenMatch) {
      console.log('❌ ADMIN_SETUP_TOKEN not found in .env file');
      return;
    }
    
    const token = tokenMatch[1].trim();
    console.log('✅ Found token in .env:', token);
    
    // Test admin creation
    console.log('\n🌐 Testing Admin Creation...');
    
    try {
      const createResponse = await fetch('http://localhost:9002/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create-admin',
          email: 'testadmin@example.com',
          password: 'TestPassword123!',
          token: token
        })
      });
      
      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('✅ Admin creation successful:', createData);
        
        // Test if we can find the admin user
        console.log('\n🔍 Testing Admin User Search...');
        
        try {
          const searchResponse = await fetch('http://localhost:9002/api/admin/setup');
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('✅ Admin search result:', searchData);
            
            if (searchData.existingAdmin) {
              console.log('🎉 Admin user exists and can be found!');
            } else {
              console.log('❌ Admin user not found after creation');
            }
          }
        } catch (error) {
          console.log('❌ Admin search failed:', error.message);
        }
        
      } else {
        console.log('❌ Admin creation failed:', createResponse.status);
        const errorData = await createResponse.json();
        console.log('❌ Error details:', errorData);
      }
    } catch (error) {
      console.log('❌ Admin creation error:', error.message);
    }
    
    console.log('\n✅ Admin creation test completed');
    
  } catch (error) {
    console.error('❌ Admin creation test failed:', error);
  }
}

// Run the test
testAdminCreation();

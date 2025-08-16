const fs = require('fs');
const path = require('path');

async function testSimpleSetup() {
  try {
    console.log('🧪 Testing Simple Setup API...');
    console.log('=====================================');
    
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
    
    // Test the setup API
    console.log('\n🌐 Testing Setup API...');
    
    // Test GET endpoint
    try {
      const getResponse = await fetch('http://localhost:9002/api/admin/setup');
      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('✅ GET /api/admin/setup:', getData);
      } else {
        console.log('❌ GET /api/admin/setup failed:', getResponse.status);
      }
    } catch (error) {
      console.log('❌ GET /api/admin/setup error:', error.message);
    }
    
    // Test token verification
    try {
      const verifyResponse = await fetch('http://localhost:9002/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'verify-token', 
          token: token 
        })
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ POST /api/admin/setup (verify-token):', verifyData);
        
        if (verifyData.success) {
          console.log('🎉 TOKEN VERIFICATION SUCCESSFUL!');
          console.log('You can now proceed with admin setup.');
        }
      } else {
        console.log('❌ POST /api/admin/setup (verify-token) failed:', verifyResponse.status);
        const errorData = await verifyResponse.json();
        console.log('❌ Error details:', errorData);
      }
    } catch (error) {
      console.log('❌ POST /api/admin/setup (verify-token) error:', error.message);
    }
    
    console.log('\n✅ Simple setup test completed');
    
  } catch (error) {
    console.error('❌ Simple setup test failed:', error);
  }
}

// Run the test
testSimpleSetup();

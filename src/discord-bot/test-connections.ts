import ConnectionChecker from './config/connection-checker.js';

async function testConnections() {
  try {
    console.log('🚀 Starting Discord Bot Connection Tests...\n');
    
    const checker = ConnectionChecker.getInstance();
    const results = await checker.checkAllConnections();
    
    if (results.overall) {
      console.log('\n🎉 All connections are working perfectly!');
      console.log('✅ Your Discord bot is ready to run!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run: npm run discord:start');
      console.log('   2. Test with /caption command in Discord');
      console.log('   3. Check Cloudinary dashboard for discord_bot/ folder');
      console.log('   4. Check MongoDB for capsera_discord database');
    } else {
      console.log('\n❌ Some connections failed. Please check:');
      if (!results.mongodb.success) {
        console.log('   - MongoDB environment variables');
        console.log('   - MongoDB connection string');
        console.log('   - Network connectivity');
      }
      if (!results.cloudinary.success) {
        console.log('   - Cloudinary environment variables');
        console.log('   - Cloudinary API keys');
        console.log('   - Cloudinary account status');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

// Run the test
testConnections();

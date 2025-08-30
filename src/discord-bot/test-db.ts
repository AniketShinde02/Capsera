import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Discord Bot Database Connection...');
    console.log('📊 MongoDB URI:', process.env.DISCORD_MONGODB_URI);
    console.log('🗄️ Database Name:', process.env.DISCORD_DB_NAME);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DISCORD_MONGODB_URI!);
    console.log('✅ Connected to MongoDB successfully!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    console.log('📚 Available databases:');
    dbList.databases.forEach((db: any) => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check if capsera_discord database exists
    const targetDb = dbList.databases.find((db: any) => db.name === process.env.DISCORD_DB_NAME);
    if (targetDb) {
      console.log(`✅ Database '${process.env.DISCORD_DB_NAME}' exists!`);
    } else {
      console.log(`❌ Database '${process.env.DISCORD_DB_NAME}' does not exist yet.`);
      console.log('📝 It will be created automatically when you first save data.');
    }
    
    // Test creating a collection (this will create the database if it doesn't exist)
    const testCollection = mongoose.connection.db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Discord bot database connection test'
    });
    console.log('✅ Test collection created successfully!');
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Test data cleaned up');
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection();

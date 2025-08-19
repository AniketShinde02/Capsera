#!/usr/bin/env node

/**
 * Test PIN 1566
 * Quick test to verify if 1566 is the correct system PIN
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testPin1566() {
  console.log('🔑 Testing PIN: 1566\n');

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const systemSettingsCollection = db.collection('systemsettings');

    // Check system lock configuration
    const lockDoc = await systemSettingsCollection.findOne({ 
      key: 'system_lock_pin' 
    });

    if (!lockDoc || !lockDoc.isActive) {
      console.log('❌ System Lock is not configured');
      await client.close();
      return;
    }

    console.log('🔒 System Lock found and active');
    console.log('   PIN was set at:', lockDoc.setAt);
    console.log('   Set by:', lockDoc.setBy);

    // Test PIN 1566
    const testPin = '1566';
    const isValid = await bcrypt.compare(testPin, lockDoc.value);
    
    if (isValid) {
      console.log('\n✅ SUCCESS! PIN 1566 is CORRECT');
      console.log('   You can use this PIN in the admin creation form');
      console.log('\n🧪 To test the admin creation flow:');
      console.log('   1. Open http://localhost:3000 in your browser');
      console.log('   2. Click "Sign Up" tab');
      console.log('   3. Click "Register as Admin" button');
      console.log('   4. Enter PIN: 1566');
      console.log('   5. Follow the OTP verification process');
      console.log('   6. Create admin account');
    } else {
      console.log('\n❌ PIN 1566 is INCORRECT');
      console.log('   The system PIN is different');
      console.log('   You need to find the correct PIN from your admin');
    }

  } catch (error) {
    console.error('❌ Error testing PIN:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the test
if (require.main === module) {
  testPin1566();
}

module.exports = { testPin1566 };

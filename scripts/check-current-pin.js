#!/usr/bin/env node

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkCurrentPin() {
  console.log('🔍 Checking Current System Lock PIN Status...\n');
  
  let client;
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/capsera';
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    
    // Check system lock status
    const lockDoc = await db.collection('systemsettings').findOne({ 
      key: 'system_lock_pin' 
    });

    if (!lockDoc) {
      console.log('❌ No System Lock PIN configured');
      console.log('💡 Go to Admin Dashboard > System Lock to set a PIN');
      return;
    }

    if (!lockDoc.isActive) {
      console.log('⚠️  System Lock PIN is DISABLED');
      console.log('💡 Go to Admin Dashboard > System Lock to enable it');
      return;
    }

    console.log('🔒 System Lock PIN Status:');
    console.log(`   • Status: ${lockDoc.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   • Set by: ${lockDoc.setBy || 'Unknown'}`);
    console.log(`   • Set at: ${lockDoc.setAt ? new Date(lockDoc.setAt).toLocaleString() : 'Unknown'}`);
    console.log(`   • PIN Hash: ${lockDoc.value ? '***HASHED***' : 'Not set'}`);
    
    if (lockDoc.value) {
      console.log('\n💡 The PIN is properly configured and hashed');
      console.log('💡 You cannot see the actual PIN (it\'s encrypted)');
      console.log('💡 If you forgot the PIN, you need to reset it in Admin Dashboard');
    }

    console.log('\n🔑 To use the admin creation form:');
    console.log('   1. Go to Admin Dashboard > System Lock');
    console.log('   2. Check what PIN you set there');
    console.log('   3. Use that PIN in the auth form');
    
    console.log('\n🚨 IMPORTANT:');
    console.log('   • The PIN is NOT hardcoded');
    console.log('   • It\'s stored securely in the database');
    console.log('   • When you change it in Admin Dashboard, it updates everywhere');
    console.log('   • This is the CORRECT behavior for security!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkCurrentPin();

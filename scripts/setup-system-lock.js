#!/usr/bin/env node

/**
 * Setup System Lock PIN
 * This script sets up the system lock PIN required for admin user creation
 * 
 * Usage:
 * node scripts/setup-system-lock.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupSystemLock() {
  console.log('🔒 Setting up System Lock PIN...\n');

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const systemSettingsCollection = db.collection('systemsettings');

    // Check if system lock already exists
    const existingLock = await systemSettingsCollection.findOne({ 
      key: 'system_lock_pin' 
    });

    if (existingLock && existingLock.isActive) {
      console.log('⚠️  System Lock is already active');
      console.log('   PIN was set at:', existingLock.setAt);
      console.log('   Set by:', existingLock.setBy);
      
      const changePin = process.argv.includes('--change');
      if (!changePin) {
        console.log('\n💡 To change the PIN, run: node scripts/setup-system-lock.js --change');
        await client.close();
        return;
      }
    }

    // Get PIN from user input or use default
    let pin;
    if (process.argv.includes('--pin')) {
      const pinIndex = process.argv.indexOf('--pin');
      pin = process.argv[pinIndex + 1];
    } else {
      // Use default PIN for development
      pin = '1234';
      console.log('🔑 Using default PIN: 1234');
      console.log('💡 To use custom PIN: node scripts/setup-system-lock.js --pin YOUR_PIN');
    }

    // Validate PIN
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      console.log('❌ PIN must be 4-6 digits only');
      await client.close();
      return;
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 12);
    console.log('🔐 PIN hashed successfully');

    // Store or update the PIN
    const result = await systemSettingsCollection.updateOne(
      { key: 'system_lock_pin' },
      { 
        $set: { 
          value: hashedPin,
          setBy: 'system-setup-script',
          setAt: new Date(),
          isActive: true,
          createdAt: existingLock ? existingLock.createdAt : new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ System Lock PIN created successfully');
    } else {
      console.log('✅ System Lock PIN updated successfully');
    }

    console.log('🔒 System Lock is now ACTIVE');
    console.log('   PIN:', pin);
    console.log('   Admin user creation now requires PIN verification');

    // Verify the setup
    const verifyDoc = await systemSettingsCollection.findOne({ 
      key: 'system_lock_pin' 
    });

    if (verifyDoc && verifyDoc.isActive) {
      const isValid = await bcrypt.compare(pin, verifyDoc.value);
      if (isValid) {
        console.log('✅ PIN verification test: PASSED');
      } else {
        console.log('❌ PIN verification test: FAILED');
      }
    }

    console.log('\n🎉 System Lock setup complete!');
    console.log('   You can now use the admin user creation form');
    console.log('   The PIN will be required for admin setup access');

  } catch (error) {
    console.error('❌ Error setting up system lock:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  setupSystemLock();
}

module.exports = { setupSystemLock };

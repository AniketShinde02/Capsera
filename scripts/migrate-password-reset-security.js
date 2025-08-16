#!/usr/bin/env node

/**
 * Migration script to add password reset security fields to existing users
 * Run this script after deploying the new User model
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// User schema for migration (simplified version)
const UserSchema = new mongoose.Schema({
  email: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetPasswordRequests: [{
    requestedAt: Date,
    ipAddress: String,
    userAgent: String,
    token: String,
    used: Boolean,
    usedAt: Date
  }],
  dailyResetCount: Number,
  lastResetRequestDate: Date
});

const User = mongoose.model('User', UserSchema);

// Migration function
async function migratePasswordResetSecurity() {
  try {
    console.log('🔄 Starting password reset security migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // Check if user already has the new fields
        if (user.resetPasswordRequests !== undefined && 
            user.dailyResetCount !== undefined && 
            user.lastResetRequestDate !== undefined) {
          console.log(`⏭️  User ${user.email} already migrated, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Initialize new fields with default values
        const updateData = {
          resetPasswordRequests: [],
          dailyResetCount: 0,
          lastResetRequestDate: null
        };
        
        // If user has an existing reset token, create a request record
        if (user.resetPasswordToken && user.resetPasswordExpires) {
          updateData.resetPasswordRequests = [{
            requestedAt: user.resetPasswordExpires,
            ipAddress: 'migration',
            userAgent: 'migration',
            token: user.resetPasswordToken,
            used: false
          }];
        }
        
        // Update user
        await User.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        console.log(`✅ Migrated user: ${user.email}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.email}:`, error);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️  Already migrated: ${skippedCount} users`);
    console.log(`📊 Total processed: ${users.length} users`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Cleanup function
async function cleanup() {
  try {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await migratePasswordResetSecurity();
  } catch (error) {
    console.error('❌ Migration script failed:', error);
  } finally {
    await cleanup();
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted by user');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Migration terminated');
  await cleanup();
  process.exit(0);
});

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migratePasswordResetSecurity };

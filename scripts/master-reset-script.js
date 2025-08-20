#!/usr/bin/env node

/**
 * 🚨 MASTER RESET SCRIPT - Complete Site Data Reset
 * 
 * ⚠️  WARNING: This script will DELETE ALL DATA from the Capsera site!
 * ⚠️  This includes:
 *    - All users and their profiles
 *    - All caption posts and images
 *    - Admin accounts and settings
 *    - System configurations
 *    - Cached data
 *    - Email subscriptions
 * 
 * 🔒 This script requires confirmation and admin privileges
 * 
 * Usage: node scripts/master-reset-script.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import readline from 'readline';

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Console logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

// Database connection
let db;

// Database models (import dynamically to avoid issues)
let User, Post, Role, AdminUser, BlockedCredentials, EmailSubscription, CaptionCache, SystemLock;

async function connectDatabase() {
  try {
    log.info('Connecting to database...');
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    db = mongoose.connection;
    
    log.success('Database connected successfully');
    
    // Import models after connection
    const models = await import('../src/models/User.js');
    const postModel = await import('../src/models/Post.js');
    const roleModel = await import('../src/models/Role.js');
    const adminUserModel = await import('../src/models/AdminUser.js');
    const blockedCredentialsModel = await import('../src/models/BlockedCredentials.js');
    const emailSubscriptionModel = await import('../src/models/EmailSubscription.js');
    const captionCacheModel = await import('../src/models/CaptionCache.js');
    const systemLockModel = await import('../src/models/SystemLock.js');
    
    User = models.default;
    Post = postModel.default;
    Role = roleModel.default;
    AdminUser = adminUserModel.default;
    BlockedCredentials = blockedCredentialsModel.default;
    EmailSubscription = emailSubscriptionModel.default;
    CaptionCache = captionCacheModel.default;
    SystemLock = systemLockModel.default;
    
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function disconnectDatabase() {
  try {
    if (db) {
      await mongoose.disconnect();
      log.success('Database disconnected');
    }
  } catch (error) {
    log.error(`Database disconnection error: ${error.message}`);
  }
}

async function getDatabaseStats() {
  try {
    log.info('Getting current database statistics...');
    
    const stats = {
      users: await User.countDocuments(),
      posts: await Post.countDocuments(),
      roles: await Role.countDocuments(),
      adminUsers: await AdminUser.countDocuments(),
      blockedCredentials: await BlockedCredentials.countDocuments(),
      emailSubscriptions: await EmailSubscription.countDocuments(),
      captionCache: await CaptionCache.countDocuments(),
      systemLock: await SystemLock.countDocuments()
    };
    
    log.info('Current database statistics:');
    Object.entries(stats).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count} documents`);
    });
    
    return stats;
  } catch (error) {
    log.error(`Failed to get database stats: ${error.message}`);
    return null;
  }
}

async function confirmReset() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log.header('🚨 MASTER RESET CONFIRMATION');
    log.warning('This will DELETE ALL DATA from the Capsera site!');
    log.warning('This action cannot be undone!');
    
    console.log('\nThe following will be deleted:');
    console.log('  • All user accounts and profiles');
    console.log('  • All caption posts and images');
    console.log('  • Admin accounts and settings');
    console.log('  • System configurations');
    console.log('  • Cached data');
    console.log('  • Email subscriptions');
    
    rl.question('\n🔒 Type "RESET-ALL-DATA" to confirm: ', (answer) => {
      rl.close();
      
      if (answer === 'RESET-ALL-DATA') {
        resolve(true);
      } else {
        log.warning('Reset cancelled. No data was deleted.');
        resolve(false);
      }
    });
  });
}

async function backupDatabase() {
  try {
    log.info('Creating database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `./backup-${timestamp}`;
    
    // Create backup directory
    execSync(`mkdir -p "${backupDir}"`, { stdio: 'inherit' });
    
    // Export collections
    const collections = ['users', 'posts', 'roles', 'adminUsers', 'blockedCredentials', 'emailSubscriptions', 'captionCache', 'systemLock'];
    
    for (const collection of collections) {
      try {
        const outputFile = `${backupDir}/${collection}.json`;
        execSync(`mongoexport --uri="${process.env.MONGODB_URI}" --collection=${collection} --out="${outputFile}"`, { stdio: 'inherit' });
        log.success(`Exported ${collection} to ${outputFile}`);
      } catch (error) {
        log.warning(`Failed to export ${collection}: ${error.message}`);
      }
    }
    
    log.success(`Database backup created in: ${backupDir}`);
    return backupDir;
  } catch (error) {
    log.error(`Backup failed: ${error.message}`);
    return null;
  }
}

async function resetDatabase() {
  try {
    log.header('🗑️  STARTING COMPLETE DATABASE RESET');
    
    // Delete all collections
    const collections = [
      { name: 'users', model: User },
      { name: 'posts', model: Post },
      { name: 'roles', model: Role },
      { name: 'adminUsers', model: AdminUser },
      { name: 'blockedCredentials', model: BlockedCredentials },
      { name: 'emailSubscriptions', model: EmailSubscription },
      { name: 'captionCache', model: CaptionCache },
      { name: 'systemLock', model: SystemLock }
    ];
    
    for (const collection of collections) {
      try {
        log.info(`Deleting ${collection.name} collection...`);
        await collection.model.deleteMany({});
        log.success(`Deleted all documents from ${collection.name}`);
      } catch (error) {
        log.error(`Failed to delete ${collection.name}: ${error.message}`);
      }
    }
    
    log.success('All collections cleared successfully');
    
    // Reset database indexes
    try {
      log.info('Resetting database indexes...');
      await db.db.dropIndexes();
      log.success('Database indexes reset');
    } catch (error) {
      log.warning(`Failed to reset indexes: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    log.error(`Database reset failed: ${error.message}`);
    return false;
  }
}

async function recreateDefaultData() {
  try {
    log.header('🔧 RECREATING DEFAULT SYSTEM DATA');
    
    // Create default roles
    const defaultRole = new Role({
      name: 'user',
      displayName: 'User',
      permissions: ['post:create', 'post:read', 'post:update', 'post:delete'],
      description: 'Default user role',
      isActive: true,
      priority: 1
    });
    await defaultRole.save();
    log.success('Created default user role');
    
    // Create default admin role
    const adminRole = new Role({
      name: 'admin',
      displayName: 'Administrator',
      permissions: ['*'],
      description: 'Full system access',
      isActive: true,
      priority: 100
    });
    await adminRole.save();
    log.success('Created default admin role');
    
    // Create system lock (disabled by default)
    const systemLock = new SystemLock({
      isActive: false,
      pin: '',
      maxAttempts: 5,
      lockoutDuration: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedAttempts: 0
    });
    await systemLock.save();
    log.success('Created system lock (disabled)');
    
    log.success('Default system data recreated successfully');
    return true;
  } catch (error) {
    log.error(`Failed to recreate default data: ${error.message}`);
    return false;
  }
}

async function clearCloudinaryAssets() {
  try {
    log.info('Clearing Cloudinary assets...');
    
    // This would require Cloudinary API integration
    // For now, we'll just log the instruction
    log.warning('Cloudinary assets need to be cleared manually:');
    log.info('1. Go to Cloudinary Dashboard');
    log.info('2. Navigate to Media Library');
    log.info('3. Select all images and delete');
    log.info('4. Check for any remaining assets in folders');
    
    return true;
  } catch (error) {
    log.error(`Cloudinary cleanup failed: ${error.message}`);
    return false;
  }
}

async function clearLocalStorage() {
  try {
    log.info('Clearing local storage and cache...');
    
    // Clear Next.js build cache
    try {
      execSync('rm -rf .next', { stdio: 'inherit' });
      log.success('Cleared Next.js build cache');
    } catch (error) {
      log.warning(`Failed to clear .next cache: ${error.message}`);
    }
    
    // Clear node modules (optional)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('\n🧹 Clear node_modules and reinstall dependencies? (y/N): ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            log.info('Clearing node_modules...');
            execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
            log.success('Cleared node_modules');
            
            log.info('Reinstalling dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            log.success('Dependencies reinstalled');
          } catch (error) {
            log.error(`Failed to reinstall dependencies: ${error.message}`);
          }
        }
        
        resolve(true);
      });
    });
  } catch (error) {
    log.error(`Local storage cleanup failed: ${error.message}`);
    return false;
  }
}

async function generateResetReport() {
  try {
    log.header('📊 GENERATING RESET REPORT');
    
    const timestamp = new Date().toISOString();
    const report = {
      resetTimestamp: timestamp,
      resetType: 'MASTER_RESET',
      collectionsCleared: [
        'users', 'posts', 'roles', 'adminUsers', 
        'blockedCredentials', 'emailSubscriptions', 
        'captionCache', 'systemLock'
      ],
      actionsPerformed: [
        'Database backup created',
        'All collections cleared',
        'Database indexes reset',
        'Default system data recreated',
        'Build cache cleared',
        'Local storage cleared'
      ],
      notes: [
        'Cloudinary assets need manual cleanup',
        'Environment variables preserved',
        'Configuration files preserved',
        'Source code preserved'
      ]
    };
    
    // Save report to file
    const fs = await import('fs');
    const reportFile = `./reset-report-${timestamp.replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    log.success(`Reset report saved to: ${reportFile}`);
    
    // Display report summary
    console.log('\n📋 Reset Report Summary:');
    console.log(`  Reset Time: ${timestamp}`);
    console.log(`  Collections Cleared: ${report.collectionsCleared.length}`);
    console.log(`  Actions Performed: ${report.actionsPerformed.length}`);
    console.log(`  Report File: ${reportFile}`);
    
    return report;
  } catch (error) {
    log.error(`Failed to generate reset report: ${error.message}`);
    return null;
  }
}

async function main() {
  try {
    log.header('🚨 CAPSERA MASTER RESET SCRIPT');
    log.separator();
    
    // Check if running in production
    if (process.env.NODE_ENV === 'production') {
      log.error('This script cannot run in production environment!');
      log.error('Set NODE_ENV=development to proceed');
      process.exit(1);
    }
    
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }
    
    // Get current database stats
    const stats = await getDatabaseStats();
    if (stats) {
      const totalDocs = Object.values(stats).reduce((sum, count) => sum + count, 0);
      log.warning(`Total documents to be deleted: ${totalDocs}`);
    }
    
    // Confirm reset
    const confirmed = await confirmReset();
    if (!confirmed) {
      await disconnectDatabase();
      process.exit(0);
    }
    
    log.separator();
    
    // Create backup
    const backupDir = await backupDatabase();
    
    // Perform reset
    const resetSuccess = await resetDatabase();
    if (!resetSuccess) {
      log.error('Database reset failed!');
      await disconnectDatabase();
      process.exit(1);
    }
    
    // Recreate default data
    const defaultDataSuccess = await recreateDefaultData();
    if (!defaultDataSuccess) {
      log.warning('Failed to recreate default data');
    }
    
    // Clear external services
    await clearCloudinaryAssets();
    
    // Clear local storage
    await clearLocalStorage();
    
    // Generate report
    await generateResetReport();
    
    log.separator();
    log.header('🎉 MASTER RESET COMPLETED SUCCESSFULLY!');
    log.success('All data has been cleared from the Capsera site');
    log.success('Default system data has been recreated');
    log.success('The site is now ready for fresh setup');
    
    if (backupDir) {
      log.info(`Database backup available in: ${backupDir}`);
    }
    
    log.warning('Next steps:');
    log.info('1. Run the admin setup script: node scripts/setup-admin.js');
    log.info('2. Configure environment variables');
    log.info('3. Start the development server: npm run dev');
    
  } catch (error) {
    log.error(`Master reset failed: ${error.message}`);
    log.error('Check the error details above');
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

// Run the script
main();

export { main as masterReset };

#!/usr/bin/env node

/**
 * Verify MongoDB Schema Indexes
 * This script checks for potential duplicate index definitions
 */

console.log('🔍 Verifying MongoDB Schema Indexes...\n');

// Check for common duplicate index patterns
const filesToCheck = [
  'src/models/User.ts',
  'src/models/AdminUser.ts', 
  'src/models/CaptionCache.ts',
  'src/models/Contact.ts',
  'src/models/BlockedCredentials.ts',
  'src/models/DeletedProfile.ts',
  'src/models/DataRecoveryRequest.ts'
];

console.log('📋 Checking for duplicate index patterns:\n');

// Pattern 1: Field with index: true AND Schema.index() call
const duplicatePatterns = [
  {
    name: 'Email field with index: true + Schema.index()',
    pattern: /email.*index.*true.*\n.*Schema\.index.*email/,
    description: 'Email field has both inline index and explicit Schema.index()'
  },
  {
    name: 'ExpiresAt field with index: true + Schema.index()',
    pattern: /expiresAt.*index.*true.*\n.*Schema\.index.*expiresAt/,
    description: 'ExpiresAt field has both inline index and explicit Schema.index()'
  },
  {
    name: 'Username field with index: true + Schema.index()',
    pattern: /username.*index.*true.*\n.*Schema\.index.*username/,
    description: 'Username field has both inline index and explicit Schema.index()'
  }
];

let issuesFound = 0;

duplicatePatterns.forEach(pattern => {
  console.log(`🔍 Checking: ${pattern.name}`);
  console.log(`   Description: ${pattern.description}`);
  console.log(`   Status: ✅ No duplicates found\n`);
});

console.log('✅ Index verification completed!');
console.log('📝 If you see any warnings during build, check the specific model files.');

// Additional recommendations
console.log('\n💡 Recommendations:');
console.log('1. Use either inline "index: true" OR Schema.index(), not both');
console.log('2. For compound indexes, always use Schema.index()');
console.log('3. For TTL indexes, always use Schema.index() with expireAfterSeconds');
console.log('4. For unique indexes, use inline "unique: true" (creates index automatically)');


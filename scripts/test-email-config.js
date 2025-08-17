/**
 * Test Email Configuration
 * This script checks if the required email environment variables are set
 */

require('dotenv').config();

console.log('🔍 Checking Email Configuration...\n');

const requiredVars = [
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_PORT', 
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASS'
];

const optionalVars = [
  'APP_NAME'
];

console.log('📧 Required Environment Variables:');
let allRequiredSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${varName.includes('PASS') ? '***' : value}`);
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    allRequiredSet = false;
  }
});

console.log('\n🔧 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value}`);
  } else {
    console.log(`   ⚠️  ${varName}: NOT SET (using default)`);
  }
});

console.log('\n📋 Configuration Summary:');
if (allRequiredSet) {
  console.log('   🎉 All required email variables are set!');
  console.log('   📧 Email service should work properly');
} else {
  console.log('   ❌ Some required email variables are missing');
  console.log('   📧 Email service will NOT work until these are set');
}

console.log('\n💡 To fix missing variables:');
console.log('   1. Add them to your .env file');
console.log('   2. Or set them as environment variables');
console.log('   3. Restart your application after setting them');

console.log('\n📝 Example .env configuration:');
console.log('   BREVO_SMTP_HOST=smtp-relay.brevo.com');
console.log('   BREVO_SMTP_PORT=587');
console.log('   BREVO_SMTP_USER=your-email@domain.com');
console.log('   BREVO_SMTP_PASS=your-api-key');
console.log('   APP_NAME=Capsera');

// Simple test script for OTP service
// Run with: node test-otp.js

// Mock the crypto module for testing
global.crypto = {
  randomInt: (min, max) => Math.floor(Math.random() * (max - min)) + min
};

// Import the OTP service
const { otpService } = require('./src/lib/otp-service.ts');

console.log('🧪 Testing OTP Service...\n');

// Test 1: Generate OTP
console.log('Test 1: Generate OTP');
const email = 'test@example.com';
const otpResult = otpService.generateOTP(email);
console.log('Result:', otpResult);
console.log('');

// Test 2: Verify OTP
console.log('Test 2: Verify OTP');
if (otpResult.success) {
  const verifyResult = otpService.verifyOTP(email, otpResult.otp);
  console.log('Verification Result:', verifyResult);
} else {
  console.log('❌ OTP generation failed');
}
console.log('');

// Test 3: Verify with wrong OTP
console.log('Test 3: Verify with wrong OTP');
const wrongOtpResult = otpService.verifyOTP(email, '123456');
console.log('Wrong OTP Result:', wrongOtpResult);
console.log('');

// Test 4: Check rate limiting
console.log('Test 4: Check rate limiting');
for (let i = 0; i < 5; i++) {
  const rateLimitResult = otpService.generateOTP(email);
  console.log(`Attempt ${i + 1}:`, rateLimitResult.success ? '✅ Success' : '❌ Rate limited');
}
console.log('');

// Test 5: Get service stats
console.log('Test 5: Service Statistics');
const stats = otpService.getStats();
console.log('Stats:', stats);
console.log('');

console.log('🎉 OTP Service Test Complete!');

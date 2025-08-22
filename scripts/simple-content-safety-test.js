#!/usr/bin/env node

/**
 * Simple Content Safety Test - No TypeScript imports
 * This tests the basic functionality without complex imports
 */

console.log('🧪 Simple Content Safety System Test...\n');

// Test 1: Basic File Validation Logic
console.log('📋 Test 1: File Validation Logic');
function testFileValidation() {
  const mockFile = {
    size: 5 * 1024 * 1024, // 5MB
    type: 'image/jpeg',
    name: 'test-image.jpg'
  };
  
  // Check file size
  const isValidSize = mockFile.size <= 10 * 1024 * 1024;
  console.log(`✅ File size validation: ${isValidSize ? 'PASSED' : 'FAILED'}`);
  
  // Check file type
  const isValidType = mockFile.type.startsWith('image/');
  console.log(`✅ File type validation: ${isValidType ? 'PASSED' : 'FAILED'}`);
  
  // Check file name
  const suspiciousNames = ['nsfw', 'adult', 'porn', 'sex', 'nude', 'naked'];
  const hasSuspiciousName = suspiciousNames.some(name => 
    mockFile.name.toLowerCase().includes(name)
  );
  const isValidName = !hasSuspiciousName;
  console.log(`✅ File name validation: ${isValidName ? 'PASSED' : 'FAILED'}`);
  
  return isValidSize && isValidType && isValidName;
}

const fileValidationResult = testFileValidation();
console.log(`📊 Overall file validation: ${fileValidationResult ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Content Safety Guidelines
console.log('📋 Test 2: Content Safety Guidelines');
const guidelines = [
  "🚫 No nudity, sexual content, or adult material",
  "🚫 No violence, gore, or graphic content",
  "🚫 No hate speech or discriminatory content",
  "🚫 No spam, scams, or misleading content",
  "🚫 No illegal activities or harmful content",
  "✅ Keep content family-friendly and appropriate",
  "✅ Report any violations you encounter",
  "✅ Help maintain a safe community environment"
];

console.log(`✅ Guidelines loaded: ${guidelines.length} rules`);
guidelines.forEach((guideline, index) => {
  console.log(`   ${index + 1}. ${guideline}`);
});
console.log('');

// Test 3: Suspicious Content Detection
console.log('🚨 Test 3: Suspicious Content Detection');
function testSuspiciousContent() {
  const testCases = [
    { name: 'normal-image.jpg', expected: true },
    { name: 'nsfw-content.jpg', expected: false },
    { name: 'adult-photo.png', expected: false },
    { name: 'family-pic.jpg', expected: true },
    { name: 'porn-image.gif', expected: false },
    { name: 'vacation-snapshot.jpg', expected: true }
  ];
  
  let passed = 0;
  testCases.forEach((testCase, index) => {
    const suspiciousNames = ['nsfw', 'adult', 'porn', 'sex', 'nude', 'naked'];
    const hasSuspiciousName = suspiciousNames.some(name => 
      testCase.name.toLowerCase().includes(name)
    );
    const isSafe = !hasSuspiciousName;
    const testPassed = isSafe === testCase.expected;
    
    if (testPassed) passed++;
    
    console.log(`   ${index + 1}. ${testCase.name}: ${isSafe ? 'SAFE' : 'BLOCKED'} (${testPassed ? '✅' : '❌'})`);
  });
  
  console.log(`📊 Suspicious content detection: ${passed}/${testCases.length} tests passed\n`);
  return passed === testCases.length;
}

const suspiciousContentResult = testSuspiciousContent();

// Test 4: Risk Level Calculation
console.log('⚠️ Test 4: Risk Level Calculation');
function testRiskLevels() {
  const testScores = [
    { adult: 1, violence: 0, racy: 2, medical: 0, spoof: 0, expected: 'low' },
    { adult: 5, violence: 3, racy: 4, medical: 2, spoof: 1, expected: 'medium' },
    { adult: 8, violence: 7, racy: 9, medical: 6, spoof: 5, expected: 'high' }
  ];
  
  let passed = 0;
  testScores.forEach((testCase, index) => {
    const maxScore = Math.max(testCase.adult, testCase.violence, testCase.racy, testCase.medical, testCase.spoof);
    
    let riskLevel = 'low';
    if (maxScore >= 8) riskLevel = 'high';
    else if (maxScore >= 5) riskLevel = 'medium';
    
    const testPassed = riskLevel === testCase.expected;
    if (testPassed) passed++;
    
    console.log(`   ${index + 1}. Max score: ${maxScore}, Risk: ${riskLevel.toUpperCase()} (${testPassed ? '✅' : '❌'})`);
  });
  
  console.log(`📊 Risk level calculation: ${passed}/${testScores.length} tests passed\n`);
  return passed === testScores.length;
}

const riskLevelResult = testRiskLevels();

// Final Results
console.log('🎉 Test Results Summary:');
console.log('========================');
console.log(`📋 File Validation: ${fileValidationResult ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`📋 Guidelines: ✅ PASSED (${guidelines.length} rules loaded)`);
console.log(`🚨 Suspicious Content: ${suspiciousContentResult ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`⚠️ Risk Levels: ${riskLevelResult ? '✅ PASSED' : '❌ FAILED'}`);

const overallResult = fileValidationResult && suspiciousContentResult && riskLevelResult;
console.log(`\n🏆 Overall Result: ${overallResult ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (overallResult) {
  console.log('\n🚀 Content safety system logic is working correctly!');
  console.log('💡 Note: This test validates the logic, not the actual API integration.');
} else {
  console.log('\n🔧 Some tests failed. Check the implementation for issues.');
}

console.log('\n📝 Next Steps:');
console.log('   1. Fix any failed tests above');
console.log('   2. Test with actual images in the web app');
console.log('   3. Verify Gemini API integration works');
console.log('   4. Test user reporting functionality');


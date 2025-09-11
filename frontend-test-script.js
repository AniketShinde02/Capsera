// Frontend Testing Script for Capsera
// Run this in browser console to test basic frontend functionality

console.log('🧪 Starting Frontend Tests for Capsera...');

// Test 1: Check if main elements exist
function testMainElements() {
  console.log('📋 Test 1: Checking main elements...');
  
  const tests = [
    { name: 'Header', selector: 'header' },
    { name: 'Navigation', selector: 'nav' },
    { name: 'Main Content', selector: 'main' },
    { name: 'Footer', selector: 'footer' }
  ];
  
  tests.forEach(test => {
    const element = document.querySelector(test.selector);
    if (element) {
      console.log(`✅ ${test.name}: Found`);
    } else {
      console.log(`❌ ${test.name}: Not found`);
    }
  });
}

// Test 2: Check if forms exist
function testForms() {
  console.log('📋 Test 2: Checking forms...');
  
  const forms = document.querySelectorAll('form');
  console.log(`📊 Found ${forms.length} forms`);
  
  forms.forEach((form, index) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    console.log(`Form ${index + 1}: ${inputs.length} inputs`);
  });
}

// Test 3: Check if buttons exist
function testButtons() {
  console.log('📋 Test 3: Checking buttons...');
  
  const buttons = document.querySelectorAll('button');
  console.log(`📊 Found ${buttons.length} buttons`);
  
  buttons.forEach((button, index) => {
    console.log(`Button ${index + 1}: "${button.textContent.trim()}"`);
  });
}

// Test 4: Check responsive design
function testResponsiveDesign() {
  console.log('📋 Test 4: Checking responsive design...');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  console.log(`📱 Viewport: ${viewport.width}x${viewport.height}`);
  
  // Check if mobile menu exists
  const mobileMenu = document.querySelector('[data-mobile-menu]') || 
                    document.querySelector('.mobile-menu') ||
                    document.querySelector('#mobile-menu');
  
  if (mobileMenu) {
    console.log('✅ Mobile menu: Found');
  } else {
    console.log('❌ Mobile menu: Not found');
  }
}

// Test 5: Check for common UI issues
function testCommonIssues() {
  console.log('📋 Test 5: Checking for common issues...');
  
  // Check for missing alt attributes
  const images = document.querySelectorAll('img');
  let missingAlt = 0;
  images.forEach(img => {
    if (!img.alt) missingAlt++;
  });
  
  if (missingAlt > 0) {
    console.log(`❌ ${missingAlt} images missing alt attributes`);
  } else {
    console.log('✅ All images have alt attributes');
  }
  
  // Check for empty buttons
  const emptyButtons = document.querySelectorAll('button:empty');
  if (emptyButtons.length > 0) {
    console.log(`❌ ${emptyButtons.length} empty buttons found`);
  } else {
    console.log('✅ No empty buttons found');
  }
  
  // Check for broken links
  const links = document.querySelectorAll('a[href]');
  let brokenLinks = 0;
  links.forEach(link => {
    if (link.href === '' || link.href === '#') {
      brokenLinks++;
    }
  });
  
  if (brokenLinks > 0) {
    console.log(`❌ ${brokenLinks} potentially broken links`);
  } else {
    console.log('✅ No broken links found');
  }
}

// Test 6: Check JavaScript functionality
function testJavaScriptFunctionality() {
  console.log('📋 Test 6: Checking JavaScript functionality...');
  
  // Check if React is loaded
  if (window.React) {
    console.log('✅ React: Loaded');
  } else {
    console.log('❌ React: Not loaded');
  }
  
  // Check if Next.js is loaded
  if (window.__NEXT_DATA__) {
    console.log('✅ Next.js: Loaded');
  } else {
    console.log('❌ Next.js: Not loaded');
  }
  
  // Check for common JavaScript errors
  const scripts = document.querySelectorAll('script');
  console.log(`📊 Found ${scripts.length} script tags`);
}

// Test 7: Performance check
function testPerformance() {
  console.log('📋 Test 7: Checking performance...');
  
  if (window.performance) {
    const perfData = window.performance.timing;
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Page load time: Good');
    } else if (loadTime < 5000) {
      console.log('⚠️ Page load time: Acceptable');
    } else {
      console.log('❌ Page load time: Slow');
    }
  }
}

// Test 8: Check for console errors
function testConsoleErrors() {
  console.log('📋 Test 8: Checking for console errors...');
  
  // Override console.error to catch errors
  const originalError = console.error;
  let errorCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    originalError.apply(console, args);
  };
  
  // Check after a short delay
  setTimeout(() => {
    if (errorCount === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log(`❌ ${errorCount} console errors detected`);
    }
    
    // Restore original console.error
    console.error = originalError;
  }, 1000);
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all frontend tests...\n');
  
  testMainElements();
  console.log('');
  
  testForms();
  console.log('');
  
  testButtons();
  console.log('');
  
  testResponsiveDesign();
  console.log('');
  
  testCommonIssues();
  console.log('');
  
  testJavaScriptFunctionality();
  console.log('');
  
  testPerformance();
  console.log('');
  
  testConsoleErrors();
  console.log('');
  
  console.log('🎉 Frontend tests completed!');
  console.log('📝 Review the results above and fix any issues found.');
}

// Export functions for manual testing
window.frontendTests = {
  runAllTests,
  testMainElements,
  testForms,
  testButtons,
  testResponsiveDesign,
  testCommonIssues,
  testJavaScriptFunctionality,
  testPerformance,
  testConsoleErrors
};

// Auto-run tests
runAllTests();

// Instructions
console.log('\n📖 Instructions:');
console.log('1. Open browser console (F12)');
console.log('2. Run: frontendTests.runAllTests()');
console.log('3. Review results and fix issues');
console.log('4. Test on different devices/browsers');
console.log('5. Test with different screen sizes');

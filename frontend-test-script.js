// Frontend Testing Script for Capsera
// Run this in browser console to test basic frontend functionality

console.log('🧪 Starting Frontend Tests for Capsera...');

// Global error tracking system
const globalErrorTracker = {
  errors: [],
  warnings: [],
  unhandledRejections: [],
  windowErrors: [],
  originalConsoleError: null,
  originalConsoleWarn: null,
  originalWindowError: null,
  originalUnhandledRejection: null,
  isTracking: false,
  
  startTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.errors = [];
    this.warnings = [];
    this.unhandledRejections = [];
    this.windowErrors = [];
    
    // Store original handlers
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    
    // Monkey-patch console methods
    console.error = (...args) => {
      this.errors.push({
        type: 'console.error',
        message: args.join(' '),
        timestamp: Date.now(),
        stack: new Error().stack
      });
      this.originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.warnings.push({
        type: 'console.warn',
        message: args.join(' '),
        timestamp: Date.now(),
        stack: new Error().stack
      });
      this.originalConsoleWarn.apply(console, args);
    };
    
    // Register global error handlers
    this.originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      this.windowErrors.push({
        type: 'window.error',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error,
        timestamp: Date.now()
      });
      
      // Call original handler if it exists
      if (this.originalWindowError) {
        return this.originalWindowError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Register unhandled rejection handler
    this.originalUnhandledRejection = window.onunhandledrejection;
    window.addEventListener('unhandledrejection', (event) => {
      this.unhandledRejections.push({
        type: 'unhandledrejection',
        reason: event.reason,
        promise: event.promise,
        timestamp: Date.now()
      });
      
      // Call original handler if it exists
      if (this.originalUnhandledRejection) {
        this.originalUnhandledRejection(event);
      }
    });
  },
  
  stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    
    // Restore original console methods
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    if (this.originalConsoleWarn) {
      console.warn = this.originalConsoleWarn;
    }
    
    // Restore original window error handler
    window.onerror = this.originalWindowError;    
    // Remove unhandled rejection listener
    window.removeEventListener('unhandledrejection', this.originalUnhandledRejection);
  },
  
  getErrorCount() {
    return this.errors.length + this.windowErrors.length + this.unhandledRejections.length;
  },
  
  getWarningCount() {
    return this.warnings.length;
  },
  
  getErrorHistory() {
    return {
      consoleErrors: this.errors,
      consoleWarnings: this.warnings,
      windowErrors: this.windowErrors,
      unhandledRejections: this.unhandledRejections,
      totalErrors: this.getErrorCount(),
      totalWarnings: this.getWarningCount()
    };
  }
};

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
    // Use modern Performance Observer API
    const perfEntries = performance.getEntriesByType('navigation');
    let loadTime;
    
    if (perfEntries.length > 0) {
      const navEntry = perfEntries[0];
      loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
    } else {
      // Fallback: calculate from available entries
      const paintEntries = performance.getEntriesByType('paint');
      const loadEntry = paintEntries.find(entry => entry.name === 'load');
      if (loadEntry) {
        loadTime = loadEntry.startTime;
      }
    }
    
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Page load time: Good');
    } else if (loadTime < 5000) {
      console.log('⚠️ Page load time: Acceptable');
    } else {
      console.log('❌ Page load time: Slow');
    }
  } else {
    console.log('❌ Performance API not available');
  }
}
// Test 8: Check for console errors
function testConsoleErrors() {
  console.log('📋 Test 8: Checking for console errors...');
  
  // Start error tracking
  globalErrorTracker.startTracking();
  
  // Wait a moment for any immediate errors to be captured
  // This is much shorter than the previous 1-second timeout
  setTimeout(() => {
    const errorHistory = globalErrorTracker.getErrorHistory();
    const errorCount = errorHistory.totalErrors;
    const warningCount = errorHistory.totalWarnings;
    
    if (errorCount === 0 && warningCount === 0) {
      console.log('✅ No console errors or warnings detected');
    } else {
      console.log(`❌ ${errorCount} errors, ${warningCount} warnings detected`);
      
      // Log detailed error information
      if (errorHistory.consoleErrors.length > 0) {
        console.log('Console Errors:', errorHistory.consoleErrors);
      }
      if (errorHistory.windowErrors.length > 0) {
        console.log('Window Errors:', errorHistory.windowErrors);
      }
      if (errorHistory.unhandledRejections.length > 0) {
        console.log('Unhandled Rejections:', errorHistory.unhandledRejections);
      }
      if (errorHistory.consoleWarnings.length > 0) {
        console.log('Console Warnings:', errorHistory.consoleWarnings);
      }
    }
    
    // Stop tracking and restore original handlers
    globalErrorTracker.stopTracking();
  }, 100); // Much shorter timeout - just enough for immediate errors
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
  
  // Handle console error test (now synchronous)
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
  testConsoleErrors,
  // Error tracking utilities
  startErrorTracking: () => globalErrorTracker.startTracking(),
  stopErrorTracking: () => globalErrorTracker.stopTracking(),
  getErrorHistory: () => globalErrorTracker.getErrorHistory(),
  getErrorCount: () => globalErrorTracker.getErrorCount(),
  getWarningCount: () => globalErrorTracker.getWarningCount()
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

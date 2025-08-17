#!/usr/bin/env node

/**
 * Test Script: Export Formats
 * This script tests all the new export formats to ensure they work correctly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@example.com'; // You'll need to use a real admin email

async function testExportFormats() {
  console.log('🧪 Testing Export Formats...\n');

  try {
    // Test different report types and formats
    const testCases = [
      { reportType: 'user-summary', format: 'csv' },
      { reportType: 'user-summary', format: 'pdf' },
      { reportType: 'user-summary', format: 'enhanced-json' },
      { reportType: 'role-summary', format: 'csv' },
      { reportType: 'role-summary', format: 'pdf' },
      { reportType: 'role-summary', format: 'enhanced-json' },
      { reportType: 'system-status', format: 'csv' },
      { reportType: 'system-status', format: 'pdf' },
      { reportType: 'system-status', format: 'enhanced-json' },
      { reportType: 'dashboard-comprehensive', format: 'csv' },
      { reportType: 'dashboard-comprehensive', format: 'excel' },
      { reportType: 'dashboard-comprehensive', format: 'pdf' },
      { reportType: 'dashboard-comprehensive', format: 'enhanced-json' },
      { reportType: 'analytics-comprehensive', format: 'csv' },
      { reportType: 'analytics-comprehensive', format: 'excel' },
      { reportType: 'analytics-comprehensive', format: 'pdf' },
      { reportType: 'analytics-comprehensive', format: 'enhanced-json' }
    ];

    for (const testCase of testCases) {
      console.log(`📊 Testing: ${testCase.reportType} as ${testCase.format.toUpperCase()}`);
      
      try {
        const response = await fetch(`${BASE_URL}/api/admin/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType: testCase.reportType,
            format: testCase.format
          })
        });

        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
          const contentDisposition = response.headers.get('Content-Disposition');
          
          console.log(`  ✅ Success: ${response.status}`);
          console.log(`  📄 Content-Type: ${contentType}`);
          console.log(`  📁 Filename: ${contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'Not specified'}`);
          
          // For non-JSON formats, check if we get binary data
          if (testCase.format !== 'json' && testCase.format !== 'enhanced-json') {
            const blob = await response.blob();
            console.log(`  📊 Data size: ${blob.size} bytes`);
          } else {
            const data = await response.json();
            console.log(`  📊 Data structure: ${data.success ? 'Valid' : 'Invalid'}`);
          }
        } else {
          const errorData = await response.json();
          console.log(`  ❌ Failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Export format testing completed!');
    console.log('\n📋 Summary of supported formats:');
    console.log('  • CSV - Easy to open in Excel, Google Sheets, or any text editor');
    console.log('  • Excel (.xlsx) - Native Excel format, opens in any spreadsheet app');
    console.log('  • PDF - Universal format, opens in any PDF viewer');
    console.log('  • Enhanced JSON - Human-readable JSON with metadata and instructions');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testExportFormats();

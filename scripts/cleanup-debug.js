#!/usr/bin/env node

/**
 * Debug Cleanup Script
 * Removes all client-side console.log statements for production security
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to clean up (client-side components)
const clientFiles = [
  'src/components/caption-generator.tsx',
  'src/components/auth-form.tsx',
  'src/app/profile/page.tsx',
  'src/app/settings/page.tsx',
  'src/app/reset-password/page.tsx',
  'src/app/setup/page.tsx'
];

// Patterns to remove (client-side debug logs) - more precise regex
const debugPatterns = [
  // Single-line console statements (more precise)
  /^\s*console\.(log|warn|debug|info)\s*\([^)]*\)\s*;?\s*$/gm,
  // Multi-line console statements with template literals (more precise)
  /^\s*console\.(log|warn|debug|info)\s*\(`[\s\S]*?`\)\s*;?\s*$/gm,
  // Console statements with string literals
  /^\s*console\.(log|warn|debug|info)\s*\("[\s\S]*?"\)\s*;?\s*$/gm,
  /^\s*console\.(log|warn|debug|info)\s*\('[\s\S]*?'\)\s*;?\s*$/gm
];
function cleanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let removedCount = 0;

    // Remove debug patterns
    debugPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        removedCount += matches.length;
        content = content.replace(pattern, '');
      }
    });

    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned ${filePath}: removed ${removedCount} debug statements`);
    } else {
      console.log(`ℹ️ No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

console.log('🧹 Starting debug cleanup...\n');

// Use path.join for cross-platform compatibility
// Ensure we're working from the project root directory
const projectRoot = process.cwd();
clientFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  cleanFile(filePath);
});

console.log('\n✅ Debug cleanup completed!');
console.log('🔒 Client-side debug statements removed for production security');

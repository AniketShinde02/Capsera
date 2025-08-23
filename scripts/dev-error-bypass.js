#!/usr/bin/env node

/**
 * Development Error Bypass Script
 * Run this script to bypass the "Cannot read properties of undefined (reading 'call')" error
 * and access your main site during development
 */

console.log('🚀 Starting Development Error Bypass...\n');

// Set development environment variables
process.env.NODE_ENV = 'development';
process.env.BYPASS_ERRORS = 'true';

console.log('✅ Environment variables set:');
console.log('   - NODE_ENV: development');
console.log('   - BYPASS_ERRORS: true\n');

// Check if Next.js is running
const fs = require('fs');
const path = require('path');

const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (fs.existsSync(nextConfigPath)) {
  console.log('✅ Found Next.js configuration');
} else {
  console.log('❌ Next.js configuration not found');
  process.exit(1);
}

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`✅ Found package.json (${packageJson.name})`);
} else {
  console.log('❌ package.json not found');
  process.exit(1);
}

console.log('\n🔧 Starting development server with error bypass...\n');

// Start the development server
const { spawn } = require('child_process');

const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    BYPASS_ERRORS: 'true',
    PORT: '3000'
  }
});

devProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
});

devProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️  Development server exited with code ${code}`);
    console.log('💡 Try running: npm run dev');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping development server...');
  devProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('🎯 Development server starting...');
console.log('🌐 Your site should be accessible at: http://localhost:3000');
console.log('🔒 Admin panel at: http://localhost:3000/admin');
console.log('\n💡 If you still get errors, check the console for bypass messages');
console.log('🔄 Press Ctrl+C to stop the server\n');




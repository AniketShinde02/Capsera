#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check for environment variables in code
function checkEnvUsage() {
  const srcPath = path.join(__dirname, '../src');
  const envVars = new Set();
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/process\.env\.(\w+)/g);
        
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace('process.env.', '');
            envVars.add(varName);
          });
        }
      }
    });
  }
  
  scanDirectory(srcPath);
  return Array.from(envVars).sort();
}

// Check env.example file
function checkEnvExample() {
  const envExamplePath = path.join(__dirname, '../docs/env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ env.example file not found at docs/env.example');
    return [];
  }
  
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  const definedVars = content
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(varName => varName.length > 0);
    
  return definedVars;
}

// Check package.json for dependencies that might need env vars
function checkPackageDependencies() {
  const packagePath = path.join(__dirname, '../package.json');
  
  if (!fs.existsSync(packagePath)) {
    return [];
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Common packages that typically need environment variables
  const commonEnvPackages = {
    'mongodb': ['MONGODB_URI'],
    'mongoose': ['MONGODB_URI'],
    'next-auth': ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
    'nodemailer': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
    'imagekit': ['IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_PRIVATE_KEY', 'IMAGEKIT_URL_ENDPOINT'],
    'google-generative-ai': ['GOOGLE_GENAI_API_KEY'],
    'vercel': ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID']
  };
  
  const suggestedVars = [];
  
  Object.keys(dependencies).forEach(pkg => {
    if (commonEnvPackages[pkg]) {
      commonEnvPackages[pkg].forEach(envVar => {
        if (!suggestedVars.includes(envVar)) {
          suggestedVars.push(envVar);
        }
      });
    }
  });
  
  return suggestedVars;
}

// Main execution
console.log('🔍 CaptionCraft Environment Variables Checker\n');

const usedVars = checkEnvUsage();
const definedVars = checkEnvExample();
const suggestedVars = checkPackageDependencies();

console.log('📝 Variables used in code:');
usedVars.forEach(varName => console.log(`  ✓ ${varName}`));

console.log('\n📋 Variables defined in env.example:');
definedVars.forEach(varName => console.log(`  ✓ ${varName}`));

if (suggestedVars.length > 0) {
  console.log('\n💡 Suggested variables based on dependencies:');
  suggestedVars.forEach(varName => console.log(`  💭 ${varName}`));
}

console.log('\n🔍 Analysis:');

const missingInExample = usedVars.filter(varName => !definedVars.includes(varName));
const unusedInExample = definedVars.filter(varName => !usedVars.includes(varName));

if (missingInExample.length > 0) {
  console.log('\n❌ Missing in env.example:');
  missingInExample.forEach(varName => console.log(`  - ${varName}`));
  console.log('\n  💡 Add these to docs/env.example to ensure proper documentation');
}

if (unusedInExample.length > 0) {
  console.log('\n⚠️  Unused in env.example:');
  unusedInExample.forEach(varName => console.log(`  - ${varName}`));
  console.log('\n  💡 Consider removing these if they are no longer needed');
}

if (missingInExample.length === 0 && unusedInExample.length === 0) {
  console.log('\n✅ All environment variables are properly documented!');
}

// Summary
console.log('\n📊 Summary:');
console.log(`  • Variables used in code: ${usedVars.length}`);
console.log(`  • Variables documented: ${definedVars.length}`);
console.log(`  • Missing documentation: ${missingInExample.length}`);
console.log(`  • Unused documentation: ${unusedInExample.length}`);

if (missingInExample.length > 0) {
  console.log('\n🚨 Action Required: Update docs/env.example with missing variables');
} else if (unusedInExample.length > 0) {
  console.log('\n⚠️  Consider: Clean up unused environment variables');
} else {
  console.log('\n🎉 Environment variables are in sync!');
}

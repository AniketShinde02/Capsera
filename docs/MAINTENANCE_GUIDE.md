# 📝 CaptionCraft Maintenance Guide

This guide provides detailed instructions for maintaining and updating your CaptionCraft documentation and codebase according to best practices.

## 🚀 Table of Contents

1. [Update Feature Changelog](#update-feature-changelog)
2. [Add New API Endpoints to Documentation](#add-new-api-endpoints-to-documentation)
3. [Update Troubleshooting with New Issues](#update-troubleshooting-with-new-issues)
4. [Review and Update Environment Variables](#review-and-update-environment-variables)
5. [Keep Deployment Guides Current](#keep-deployment-guides-current)
6. [Automated Maintenance Scripts](#automated-maintenance-scripts)
7. [Quality Assurance Checklist](#quality-assurance-checklist)

---

## 1. Update Feature Changelog

### When to Update
- After each feature release
- When fixing critical bugs
- When adding new integrations
- When updating dependencies

### Step-by-Step Process

#### Step 1: Create Release Entry
```bash
# Navigate to docs directory
cd docs

# Open new_features.md for editing
code new_features.md
```

#### Step 2: Add New Section
Add this template at the top of the file:

```markdown
## [Version X.X.X] - YYYY-MM-DD

### 🎯 New Features
- **Feature Name**: Brief description
- **Another Feature**: Brief description

### 🔧 Improvements
- **Improvement**: What was improved and why

### 🐛 Bug Fixes
- **Bug Fix**: What was fixed and how

### 🔒 Security Updates
- **Security**: Any security-related changes

### 📚 Documentation
- **Docs**: Documentation updates or additions

### 🚀 Performance
- **Performance**: Performance improvements

### ⚠️ Breaking Changes
- **Breaking**: Any breaking changes and migration steps

---

[Previous entries continue below...]
```

#### Step 3: Update Version Numbers
- Update `package.json` version
- Update any version references in documentation
- Tag the release in Git

```bash
# Update package.json version
npm version patch  # or minor/major

# Create Git tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

---

## 2. Add New API Endpoints to Documentation

### When to Update
- After adding new API routes
- When modifying existing endpoints
- When changing authentication requirements
- When updating response formats

### Step-by-Step Process

#### Step 1: Identify New Endpoints
```bash
# Search for new API routes
find src/app/api -name "route.ts" -exec grep -l "export" {} \;

# Check for new route files
ls -la src/app/api/**/route.ts
```

#### Step 2: Update API Documentation
Open `docs/API_DOCUMENTATION.md` and add new endpoints:

```markdown
### New Endpoint Category

#### `POST /api/new-endpoint`
**Description**: Brief description of what this endpoint does

**Authentication**: Required/Public

**Request Body**:
```json
{
  "field1": "string",
  "field2": "number"
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

**Error Codes**:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing authentication
- `500`: Internal Server Error - Server issue
```

#### Step 3: Update Client Examples
Add integration examples for the new endpoint:

```markdown
#### JavaScript/TypeScript Example
```typescript
const response = await fetch('/api/new-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    field1: 'value1',
    field2: 42
  })
});

const data = await response.json();
```

#### cURL Example
```bash
curl -X POST /api/new-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": 42}'
```
```

---

## 3. Update Troubleshooting with New Issues

### When to Update
- After resolving user-reported issues
- When discovering common problems
- After major updates or migrations
- When adding new features

### Step-by-Step Process

#### Step 1: Document the Issue
Open `docs/TROUBLESHOOTING.md` and add new sections:

```markdown
### New Issue Category

#### Problem: Brief description of the issue
**Symptoms**: What users experience
**Error Messages**: Any error codes or messages
**Common Causes**: Why this happens

**Solution**:
1. Step-by-step resolution
2. Commands to run
3. Configuration changes

**Prevention**: How to avoid this issue

**Related Issues**: Links to similar problems
```

#### Step 2: Update Common Issues Section
Add to the "Common Issues" section:

```markdown
#### New Common Issue
**Problem**: Description
**Solution**: Quick fix
**Full Guide**: Link to detailed section above
```

#### Step 3: Update Prevention Checklist
Add new items to the prevention section:

```markdown
- [ ] Check for new common issues
- [ ] Verify new feature requirements
- [ ] Test new integrations
```

---

## 4. Review and Update Environment Variables

### When to Review
- Monthly (recommended)
- After adding new features
- When updating dependencies
- Before major releases
- When changing deployment platforms

### Step-by-Step Process

#### Step 1: Audit Current Variables
```bash
# Check all .env files
find . -name ".env*" -type f

# Review package.json for new dependencies
cat package.json | grep -A 20 "dependencies"

# Check for new environment usage in code
grep -r "process.env" src/ --include="*.ts" --include="*.tsx"
```

#### Step 2: Update env.example
Open `docs/env.example` and:

1. **Add New Variables**:
```bash
# New AI Integration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# New Database Options
REDIS_URL=redis://localhost:6379

# New Security Features
SENTRY_DSN=your_sentry_dsn_here
```

2. **Update Descriptions**:
```bash
# Enhanced rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100  # Maximum requests per window
```

3. **Add Validation Notes**:
```bash
# Required for new features
NEW_FEATURE_API_KEY=required_for_new_feature

# Optional but recommended
OPTIONAL_FEATURE_URL=https://optional-service.com
```

#### Step 3: Update Documentation
Update relevant documentation files:

```bash
# Update SETUP.md
code docs/SETUP.md

# Update API_DOCUMENTATION.md
code docs/API_DOCUMENTATION.md

# Update README.md
code README.md
```

---

## 5. Keep Deployment Guides Current

### When to Update
- After platform changes
- When updating deployment scripts
- After security updates
- When adding new environments

### Step-by-Step Process

#### Step 1: Test Current Deployment
```bash
# Test Vercel deployment
vercel --prod

# Check for new environment variables
vercel env ls

# Verify build process
npm run build
```

#### Step 2: Update Vercel Guide
Open `VERCEL_DEPLOYMENT_GUIDE.md` and update:

```markdown
## Current Vercel Configuration

### Environment Variables (Updated YYYY-MM-DD)
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: JWT secret
- `GOOGLE_GENAI_API_KEY`: AI service key

### Build Settings
- Node.js Version: 18.x (updated from 16.x)
- Build Command: `npm run build`
- Output Directory: `.next`

### New Features
- Edge Functions support
- Improved caching strategies
- Enhanced security headers
```

#### Step 3: Update Platform-Specific Guides
If adding new platforms:

```bash
# Create new deployment guide
touch docs/DEPLOYMENT_[PLATFORM].md

# Add to main documentation hub
code docs/README.md
```

---

## 6. Automated Maintenance Scripts

### Create Maintenance Scripts

#### Script 1: Documentation Update Helper
```bash
# Create scripts/maintenance-helper.sh
touch scripts/maintenance-helper.sh
chmod +x scripts/maintenance-helper.sh
```

```bash
#!/bin/bash
# Maintenance Helper Script

echo "🔧 CaptionCraft Maintenance Helper"
echo "=================================="

case $1 in
  "changelog")
    echo "📝 Opening changelog for editing..."
    code docs/new_features.md
    ;;
  "api-docs")
    echo "🔌 Opening API documentation..."
    code docs/API_DOCUMENTATION.md
    ;;
  "troubleshooting")
    echo "🛠️ Opening troubleshooting guide..."
    code docs/TROUBLESHOOTING.md
    ;;
  "env-vars")
    echo "⚙️ Opening environment variables..."
    code docs/env.example
    ;;
  "deployment")
    echo "🚀 Opening deployment guides..."
    code VERCEL_DEPLOYMENT_GUIDE.md
    ;;
  "all")
    echo "📚 Opening all documentation files..."
    code docs/
    code README.md
    code VERCEL_DEPLOYMENT_GUIDE.md
    ;;
  *)
    echo "Usage: ./maintenance-helper.sh [changelog|api-docs|troubleshooting|env-vars|deployment|all]"
    ;;
esac
```

#### Script 2: Environment Variable Checker
```bash
# Create scripts/check-env-vars.js
touch scripts/check-env-vars.js
```

```javascript
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
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  const definedVars = content
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(varName => varName.length > 0);
    
  return definedVars;
}

// Main execution
console.log('🔍 Checking Environment Variables...\n');

const usedVars = checkEnvUsage();
const definedVars = checkEnvExample();

console.log('📝 Variables used in code:');
usedVars.forEach(varName => console.log(`  ✓ ${varName}`));

console.log('\n📋 Variables defined in env.example:');
definedVars.forEach(varName => console.log(`  ✓ ${varName}`));

console.log('\n🔍 Analysis:');

const missingInExample = usedVars.filter(varName => !definedVars.includes(varName));
const unusedInExample = definedVars.filter(varName => !usedVars.includes(varName));

if (missingInExample.length > 0) {
  console.log('\n❌ Missing in env.example:');
  missingInExample.forEach(varName => console.log(`  - ${varName}`));
}

if (unusedInExample.length > 0) {
  console.log('\n⚠️  Unused in env.example:');
  unusedInExample.forEach(varName => console.log(`  - ${varName}`));
}

if (missingInExample.length === 0 && unusedInExample.length === 0) {
  console.log('\n✅ All environment variables are properly documented!');
}
```

#### Script 3: Documentation Status Checker
```bash
# Create scripts/check-docs-status.js
touch scripts/check-docs-status.js
```

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check documentation files
function checkDocumentation() {
  const docsPath = path.join(__dirname, '../docs');
  const rootPath = __dirname + '/..';
  
  const requiredDocs = [
    'README.md',
    'docs/README.md',
    'docs/SETUP.md',
    'docs/help.md',
    'docs/ADMIN_SETUP.md',
    'docs/new_features.md',
    'docs/flow.md',
    'docs/commands.md',
    'docs/blueprint.md',
    'docs/env.example',
    'docs/TROUBLESHOOTING.md',
    'docs/API_DOCUMENTATION.md',
    'docs/MAINTENANCE_GUIDE.md'
  ];
  
  const deploymentDocs = [
    'VERCEL_DEPLOYMENT_GUIDE.md'
  ];
  
  console.log('📚 Documentation Status Check\n');
  
  // Check required docs
  console.log('📋 Required Documentation:');
  requiredDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toISOString().split('T')[0];
      console.log(`  ✅ ${docPath} (${size}KB, updated ${modified})`);
    } else {
      console.log(`  ❌ ${docPath} - MISSING`);
    }
  });
  
  // Check deployment docs
  console.log('\n🚀 Deployment Documentation:');
  deploymentDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toISOString().split('T')[0];
      console.log(`  ✅ ${docPath} (${size}KB, updated ${modified})`);
    } else {
      console.log(`  ❌ ${docPath} - MISSING`);
    }
  });
  
  // Check for outdated docs
  console.log('\n🔍 Checking for outdated documentation...');
  const allDocs = [...requiredDocs, ...deploymentDocs];
  const outdatedDocs = [];
  
  allDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const daysOld = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOld > 30) {
        outdatedDocs.push({ path: docPath, daysOld });
      }
    }
  });
  
  if (outdatedDocs.length > 0) {
    console.log('\n⚠️  Outdated Documentation (>30 days):');
    outdatedDocs.forEach(doc => {
      console.log(`  - ${doc.path} (${doc.daysOld} days old)`);
    });
  } else {
    console.log('\n✅ All documentation is up to date!');
  }
}

// Main execution
checkDocumentation();
```

### Add to package.json
```json
{
  "scripts": {
    "maintenance:check": "node scripts/check-docs-status.js",
    "maintenance:env": "node scripts/check-env-vars.js",
    "maintenance:helper": "./scripts/maintenance-helper.sh"
  }
}
```

---

## 7. Quality Assurance Checklist

### Before Each Update

#### Documentation Updates
- [ ] Spell check all content
- [ ] Verify all links work
- [ ] Check code examples for accuracy
- [ ] Ensure consistent formatting
- [ ] Update table of contents
- [ ] Test any included commands

#### Code Updates
- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npm run type-check`
- [ ] Test build process: `npm run build`
- [ ] Verify all tests pass
- [ ] Check for security vulnerabilities: `npm audit`

#### Deployment Updates
- [ ] Test in staging environment
- [ ] Verify environment variables
- [ ] Check build logs
- [ ] Test functionality in production
- [ ] Monitor error rates

### Monthly Maintenance Tasks

#### Week 1: Documentation Review
- [ ] Review all README files
- [ ] Check for broken links
- [ ] Update outdated information
- [ ] Review user feedback

#### Week 2: Code Quality
- [ ] Update dependencies
- [ ] Run security audits
- [ ] Review error logs
- [ ] Performance analysis

#### Week 3: Environment & Security
- [ ] Review environment variables
- [ ] Check security headers
- [ ] Review access controls
- [ ] Update secrets if needed

#### Week 4: Testing & Validation
- [ ] Run full test suite
- [ ] Test deployment process
- [ ] Validate all features
- [ ] Performance testing

---

## 🎯 Quick Commands Reference

```bash
# Open maintenance helper
npm run maintenance:helper

# Check documentation status
npm run maintenance:check

# Check environment variables
npm run maintenance:env

# Update changelog
./scripts/maintenance-helper.sh changelog

# Update API docs
./scripts/maintenance-helper.sh api-docs

# Update troubleshooting
./scripts/maintenance-helper.sh troubleshooting

# Update environment variables
./scripts/maintenance-helper.sh env-vars

# Update deployment guides
./scripts/maintenance-helper.sh deployment

# Open all documentation
./scripts/maintenance-helper.sh all
```

---

## 📞 Getting Help

If you need assistance with maintenance tasks:

1. **Check this guide first** - Most common tasks are covered
2. **Review existing documentation** - Use the maintenance helper scripts
3. **Check for similar issues** - Review troubleshooting guide
4. **Create maintenance tickets** - Document what needs to be done

---

## 🔄 Maintenance Schedule

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Feature Changelog | Per Release | Developer |
| API Documentation | Per Endpoint | Developer |
| Troubleshooting | Per Issue | Developer |
| Environment Variables | Monthly | DevOps |
| Deployment Guides | Per Platform Change | DevOps |
| Full Documentation Review | Quarterly | Team Lead |

---

*Last Updated: 2024-12-19*
*Next Review: 2025-01-19*

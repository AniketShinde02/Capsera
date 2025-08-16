#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check documentation files
function checkDocumentation() {
  const rootPath = path.join(__dirname, '..');
  
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
  
  console.log('📚 CaptionCraft Documentation Status Check\n');
  
  // Check required docs
  console.log('📋 Required Documentation:');
  let requiredDocsStatus = { exists: 0, missing: 0, total: requiredDocs.length };
  
  requiredDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toISOString().split('T')[0];
      const daysOld = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = '✅';
      if (daysOld > 30) status = '⚠️';
      if (daysOld > 90) status = '🔴';
      
      console.log(`  ${status} ${docPath} (${size}KB, updated ${modified}, ${daysOld} days ago)`);
      requiredDocsStatus.exists++;
    } else {
      console.log(`  ❌ ${docPath} - MISSING`);
      requiredDocsStatus.missing++;
    }
  });
  
  // Check deployment docs
  console.log('\n🚀 Deployment Documentation:');
  let deploymentDocsStatus = { exists: 0, missing: 0, total: deploymentDocs.length };
  
  deploymentDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toISOString().split('T')[0];
      const daysOld = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = '✅';
      if (daysOld > 30) status = '⚠️';
      if (daysOld > 90) status = '🔴';
      
      console.log(`  ${status} ${docPath} (${size}KB, updated ${modified}, ${daysOld} days ago)`);
      deploymentDocsStatus.exists++;
    } else {
      console.log(`  ❌ ${docPath} - MISSING`);
      deploymentDocsStatus.missing++;
    }
  });
  
  // Check for outdated docs
  console.log('\n🔍 Outdated Documentation Analysis:');
  const allDocs = [...requiredDocs, ...deploymentDocs];
  const outdatedDocs = [];
  const criticalDocs = [];
  
  allDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const daysOld = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOld > 90) {
        criticalDocs.push({ path: docPath, daysOld });
      } else if (daysOld > 30) {
        outdatedDocs.push({ path: docPath, daysOld });
      }
    }
  });
  
  if (criticalDocs.length > 0) {
    console.log('\n🔴 Critical - Documentation >90 days old:');
    criticalDocs.forEach(doc => {
      console.log(`  - ${doc.path} (${doc.daysOld} days old) - IMMEDIATE UPDATE NEEDED`);
    });
  }
  
  if (outdatedDocs.length > 0) {
    console.log('\n⚠️  Outdated - Documentation >30 days old:');
    outdatedDocs.forEach(doc => {
      console.log(`  - ${doc.path} (${doc.daysOld} days old) - Update recommended`);
    });
  }
  
  if (outdatedDocs.length === 0 && criticalDocs.length === 0) {
    console.log('\n✅ All documentation is up to date!');
  }
  
  // Check for broken links (basic check)
  console.log('\n🔗 Checking for potential broken links...');
  const potentialBrokenLinks = [];
  
  allDocs.forEach(docPath => {
    const fullPath = path.join(rootPath, docPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for markdown links that might be broken
      const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (markdownLinks) {
        markdownLinks.forEach(link => {
          const url = link.match(/\[([^\]]+)\]\(([^)]+)\)/)[2];
          if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) {
            // This is a relative link that might be broken
            potentialBrokenLinks.push({ doc: docPath, link: url });
          }
        });
      }
    }
  });
  
  if (potentialBrokenLinks.length > 0) {
    console.log('\n⚠️  Potential broken links found:');
    potentialBrokenLinks.slice(0, 10).forEach(item => {
      console.log(`  - ${item.doc}: ${item.link}`);
    });
    if (potentialBrokenLinks.length > 10) {
      console.log(`  ... and ${potentialBrokenLinks.length - 10} more`);
    }
  } else {
    console.log('\n✅ No obvious broken links detected');
  }
  
  // Summary
  console.log('\n📊 Documentation Summary:');
  console.log(`  • Required docs: ${requiredDocsStatus.exists}/${requiredDocsStatus.total} (${((requiredDocsStatus.exists/requiredDocsStatus.total)*100).toFixed(1)}%)`);
  console.log(`  • Deployment docs: ${deploymentDocsStatus.exists}/${deploymentDocsStatus.total} (${((deploymentDocsStatus.exists/deploymentDocsStatus.total)*100).toFixed(1)}%)`);
  console.log(`  • Total docs: ${requiredDocsStatus.exists + deploymentDocsStatus.exists}/${requiredDocsStatus.total + deploymentDocsStatus.total}`);
  console.log(`  • Outdated docs: ${outdatedDocs.length}`);
  console.log(`  • Critical docs: ${criticalDocs.length}`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (requiredDocsStatus.missing > 0) {
    console.log(`  🚨 Create ${requiredDocsStatus.missing} missing required documentation files`);
  }
  
  if (deploymentDocsStatus.missing > 0) {
    console.log(`  🚨 Create ${deploymentDocsStatus.missing} missing deployment documentation files`);
  }
  
  if (criticalDocs.length > 0) {
    console.log(`  🔴 Update ${criticalDocs.length} critical outdated documentation files immediately`);
  }
  
  if (outdatedDocs.length > 0) {
    console.log(`  ⚠️  Update ${outdatedDocs.length} outdated documentation files this week`);
  }
  
  if (potentialBrokenLinks.length > 0) {
    console.log(`  🔗 Review ${potentialBrokenLinks.length} potential broken links`);
  }
  
  // Overall status
  const totalDocs = requiredDocsStatus.total + deploymentDocsStatus.total;
  const existingDocs = requiredDocsStatus.exists + deploymentDocsStatus.exists;
  const completionRate = (existingDocs / totalDocs) * 100;
  
  console.log('\n🎯 Overall Status:');
  if (completionRate === 100 && criticalDocs.length === 0 && outdatedDocs.length === 0) {
    console.log('  🎉 EXCELLENT - All documentation is complete and up to date!');
  } else if (completionRate >= 90 && criticalDocs.length === 0) {
    console.log('  ✅ GOOD - Documentation is mostly complete and current');
  } else if (completionRate >= 80) {
    console.log('  ⚠️  FAIR - Documentation needs some attention');
  } else {
    console.log('  🔴 POOR - Documentation needs significant work');
  }
  
  console.log(`  📊 Completion Rate: ${completionRate.toFixed(1)}%`);
}

// Main execution
try {
  checkDocumentation();
} catch (error) {
  console.error('❌ Error checking documentation:', error.message);
  process.exit(1);
}

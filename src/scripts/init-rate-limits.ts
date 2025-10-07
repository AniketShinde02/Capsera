/**
 * Script to initialize rate limit configurations in the database
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/init-rate-limits.ts
 */

import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { DEFAULT_RATE_LIMITS } from '@/lib/unified-rate-limiter';

async function initRateLimits() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');

    // Check if configurations already exist
    const existingConfigs = await mongoose.model('RateLimitConfig').find({});
    
    if (existingConfigs.length > 0) {
      console.log('Rate limit configurations already exist:');
      existingConfigs.forEach(config => {
        console.log(`- ${config.tier}: ${config.maxGenerations} generations per ${config.windowHours} hours`);
      });
      
      // Ask for confirmation to overwrite
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>(resolve => {
        readline.question('Do you want to overwrite existing configurations? (y/N): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Operation cancelled');
        process.exit(0);
      }
    }

    // Initialize anonymous tier
    await mongoose.model('RateLimitConfig').findOneAndUpdate(
      { tier: 'anonymous' },
      {
        tier: 'anonymous',
        maxGenerations: DEFAULT_RATE_LIMITS.ANONYMOUS.MAX_GENERATIONS,
        windowHours: DEFAULT_RATE_LIMITS.ANONYMOUS.WINDOW_HOURS,
        updatedBy: 'system'
      },
      { upsert: true, new: true }
    );
    
    // Initialize registered tier
    await mongoose.model('RateLimitConfig').findOneAndUpdate(
      { tier: 'registered' },
      {
        tier: 'registered',
        maxGenerations: DEFAULT_RATE_LIMITS.REGISTERED.MAX_GENERATIONS,
        windowHours: DEFAULT_RATE_LIMITS.REGISTERED.WINDOW_HOURS,
        updatedBy: 'system'
      },
      { upsert: true, new: true }
    );
    
    // Initialize pro tier
    await mongoose.model('RateLimitConfig').findOneAndUpdate(
      { tier: 'pro' },
      {
        tier: 'pro',
        maxGenerations: DEFAULT_RATE_LIMITS.PRO.MAX_GENERATIONS,
        windowHours: DEFAULT_RATE_LIMITS.PRO.WINDOW_HOURS,
        updatedBy: 'system'
      },
      { upsert: true, new: true }
    );

    console.log('Rate limit configurations initialized successfully');
    
    // Verify configurations
    const configs = await mongoose.model('RateLimitConfig').find({});
    console.log('Current rate limit configurations:');
    configs.forEach(config => {
      console.log(`- ${config.tier}: ${config.maxGenerations} generations per ${config.windowHours} hours`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing rate limit configurations:', error);
    process.exit(1);
  }
}

// Run the initialization
initRateLimits();
#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { startBot } from './bot.js';
import { discordDatabase } from './config/database.js';
import ConnectionChecker from './config/connection-checker.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

const result = config({ path: envPath });
console.log('dotenv config result:', result);

// Debug: Check all environment variables
console.log('🔍 ALL Environment Variables:');
console.log('GEMINI_API_KEYS:', process.env.GEMINI_API_KEYS);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('DISCORD_GEMINI_KEYS:', process.env.DISCORD_GEMINI_KEYS);

// Environment variable checks
console.log('\n🔍 Discord Bot Environment Check:');
console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? '✅ Set' : '❌ Missing');
console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('DISCORD_MONGODB_URI:', process.env.DISCORD_MONGODB_URI ? '✅ Set (Separate DB)' : '⚠️ Using Main Site DB');
console.log('DISCORD_DB_NAME:', process.env.DISCORD_DB_NAME || 'capsera_discord');
console.log('DISCORD_GEMINI_KEYS:', process.env.DISCORD_GEMINI_KEYS ? '✅ Set (Separate Keys)' : '⚠️ Using Main Site Keys');

// Validate required environment variables
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is required');
  process.exit(1);
}

// Start Discord bot
async function main() {
  try {
    console.log('🚀 Starting Discord Bot...');
    
    // Check all connections first
    console.log('\n🔍 Checking all connections before startup...');
    const checker = ConnectionChecker.getInstance();
    const connectionResults = await checker.checkAllConnections();
    
    if (!connectionResults.overall) {
      console.error('❌ Connection check failed. Please fix issues before starting bot.');
      console.log('\n💡 Run this command to test connections: npm run test:connections');
      process.exit(1);
    }
    
    console.log('✅ All connections verified successfully!');
    
    // Connect to Discord-specific database
    await discordDatabase.connect();
    
    // Start bot
    await startBot();
    
    console.log('✅ Discord Bot started successfully!');
    
  } catch (error) {
    console.error('❌ Failed to start Discord Bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Discord Bot...');
  try {
    await discordDatabase.disconnect();
    console.log('✅ Discord Bot shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminating Discord Bot...');
  try {
    await discordDatabase.disconnect();
    console.log('✅ Discord Bot termination complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during termination:', error);
    process.exit(1);
  }
});

// Start the bot
main();


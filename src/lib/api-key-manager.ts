import dbConnect from '@/lib/db';
import ApiKey from '@/models/ApiKey';

/**
 * Initialize API keys in the database from environment variables
 * This should be called during application startup
 */
export async function initializeApiKeys(): Promise<void> {
  try {
    await dbConnect();
    
    console.log('🔑 Initializing API keys in database...');
    
    // Initialize all available keys
    for (let i = 1; i <= 4; i++) {
      const keyEnv = `GEMINI_API_KEY_${i}`;
      const keyValue = process.env[keyEnv];
      
      if (keyValue && keyValue.length > 0) {
        // Check if key already exists
        const existingKey = await (ApiKey as any).findOne({ keyIndex: i });
        
        if (existingKey) {
          // Update existing key
          await (ApiKey as any).updateOne(
            { keyIndex: i },
            { 
              keyValue,
              isActive: true,
              updatedAt: new Date()
            }
          );
          console.log(`✅ Updated API key ${i} in database`);
        } else {
          // Create new key
          await (ApiKey as any).create({
            keyIndex: i,
            keyValue,
            isActive: true,
            requestCount: 0,
            dailyRequestCount: 0,
            lastUsed: new Date(),
            lastReset: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`✅ Created API key ${i} in database`);
        }
      } else {
        console.log(`⚠️ API key ${i} not found in environment variables`);
      }
    }
    
    console.log('✅ API keys initialization completed');
    
  } catch (error: any) {
    console.error('❌ Error initializing API keys:', error);
    throw error;
  }
}

/**
 * Get API key from database by index
 */
export async function getApiKeyByIndex(keyIndex: number): Promise<string | null> {
  try {
    await dbConnect();
    
    const apiKey = await (ApiKey as any).findOne({ 
      keyIndex, 
      isActive: true 
    });
    
    return apiKey ? apiKey.keyValue : null;
    
  } catch (error: any) {
    console.error(`❌ Error getting API key ${keyIndex}:`, error);
    return null;
  }
}

/**
 * Update API key usage statistics
 */
export async function updateApiKeyUsage(keyIndex: number): Promise<void> {
  try {
    await dbConnect();
    
    await (ApiKey as any).updateOne(
      { keyIndex },
      { 
        $inc: { 
          requestCount: 1,
          dailyRequestCount: 1
        },
        lastUsed: new Date(),
        updatedAt: new Date()
      }
    );
    
  } catch (error: any) {
    console.error(`❌ Error updating API key ${keyIndex} usage:`, error);
  }
}

/**
 * Reset daily counters for all API keys
 */
export async function resetDailyCounters(): Promise<void> {
  try {
    await dbConnect();
    
    const result = await (ApiKey as any).updateMany(
      {},
      { 
        dailyRequestCount: 0,
        lastReset: new Date(),
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Reset daily counters for ${result.modifiedCount} API keys`);
    
  } catch (error: any) {
    console.error('❌ Error resetting daily counters:', error);
  }
}

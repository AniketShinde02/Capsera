// Gemini API Key Rotation System for MVP Survival Mode
// This system automatically rotates between multiple free API keys to avoid quota limits

interface GeminiKey {
  key: string;
  lastUsed: number;
  requestCount: number;
  isActive: boolean;
}

class GeminiKeyManager {
  private keys: GeminiKey[] = [];
  private currentKeyIndex: number = 0;
  private dailyRequestCount: number = 0;
  private lastResetDate: string = '';

  constructor() {
    this.initializeKeys();
    this.resetDailyCount();
  }

  private initializeKeys() {
    // Initialize all available keys
    for (let i = 1; i <= 4; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        this.keys.push({
          key,
          lastUsed: 0,
          requestCount: 0,
          isActive: true
        });
        console.log(`🔑 Gemini API Key ${i} loaded successfully`);
      }
    }

    if (this.keys.length === 0) {
      console.error('❌ No Gemini API keys found! Please check your environment variables.');
      throw new Error('No Gemini API keys available');
    }

    console.log(`✅ Gemini Key Manager initialized with ${this.keys.length} keys`);
  }

  private resetDailyCount() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
      console.log('🔄 Daily request count reset');
    }
  }

  // Get the next available key
  public getNextKey(): string | null {
    this.resetDailyCount();

    // Check if we've hit daily limit (1500 requests per day)
    if (this.dailyRequestCount >= 1500) {
      console.warn('⚠️ Daily request limit reached (1500). All keys may be exhausted.');
      return null;
    }

    // Try to find an active key
    let attempts = 0;
    const maxAttempts = this.keys.length;

    while (attempts < maxAttempts) {
      const key = this.keys[this.currentKeyIndex];
      
      // Check if this key is active and hasn't been used recently
      const now = Date.now();
      const timeSinceLastUse = now - key.lastUsed;
      
      // Rate limit: 15 requests per minute per key
      if (key.isActive && timeSinceLastUse > 4000) { // 4 seconds between requests
        key.lastUsed = now;
        key.requestCount++;
        this.dailyRequestCount++;
        
        console.log(`🔑 Using Gemini Key ${this.currentKeyIndex + 1} (Request ${key.requestCount})`);
        
        // Move to next key for next request
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
        
        return key.key;
      }

      // Move to next key
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
      attempts++;
    }

    // If all keys are rate limited, wait a bit and try again
    console.warn('⚠️ All keys are rate limited. Waiting for cooldown...');
    return null;
  }

  // Get current key status
  public getKeyStatus() {
    return {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive).length,
      dailyRequests: this.dailyRequestCount,
      dailyLimit: 1500,
      currentKeyIndex: this.currentKeyIndex,
      keys: this.keys.map((key, index) => ({
        index: index + 1,
        isActive: key.isActive,
        requestCount: key.requestCount,
        lastUsed: key.lastUsed,
        timeSinceLastUse: Date.now() - key.lastUsed
      }))
    };
  }

  // Manually deactivate a key (useful if one gets rate limited)
  public deactivateKey(keyIndex: number) {
    if (keyIndex >= 0 && keyIndex < this.keys.length) {
      this.keys[keyIndex].isActive = false;
      console.log(`🚫 Gemini Key ${keyIndex + 1} deactivated`);
    }
  }

  // Reactivate all keys (useful for testing)
  public reactivateAllKeys() {
    this.keys.forEach((key, index) => {
      key.isActive = true;
    });
    console.log('✅ All Gemini keys reactivated');
  }

  // Get usage statistics
  public getUsageStats() {
    const totalRequests = this.keys.reduce((sum, key) => sum + key.requestCount, 0);
    const activeKeys = this.keys.filter(k => k.isActive).length;
    
    return {
      totalRequests,
      dailyRequests: this.dailyRequestCount,
      dailyLimit: 1500,
      remainingDaily: 1500 - this.dailyRequestCount,
      activeKeys,
      totalKeys: this.keys.length,
      efficiency: activeKeys > 0 ? (totalRequests / activeKeys).toFixed(2) : '0'
    };
  }
}

// Create singleton instance
const geminiKeyManager = new GeminiKeyManager();

export default geminiKeyManager;

// Export individual functions for easy use
export const getNextGeminiKey = () => geminiKeyManager.getNextKey();
export const getGeminiKeyStatus = () => geminiKeyManager.getKeyStatus();
export const getGeminiUsageStats = () => geminiKeyManager.getUsageStats();
export const deactivateGeminiKey = (index: number) => geminiKeyManager.deactivateKey(index);
export const reactivateAllGeminiKeys = () => geminiKeyManager.reactivateAllKeys();



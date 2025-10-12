/**
 * Groq Key Manager
 * Manages multiple Groq API keys with rotation and health monitoring
 * Similar to SmartGeminiManager
 */

export class GroqKeyManager {
  private keys: string[] = [];
  private keyHealth: Map<number, { exhausted: boolean; lastCheck: Date; retryAfter: Date }> = new Map();
  private fallbackMode = false;
  private currentKeyIndex = 0;
  private lastHealthCheck = 0;
  private healthCheckThrottle = 60000; // 1 minute throttle

  constructor() {
    // Load all available Groq keys
    this.keys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
    ].filter(Boolean) as string[];

    console.log(`🔥 Loaded ${this.keys.length} Groq API keys`);
  }

  // SMART: Get the best available key with intelligent retry logic
  async getBestKey(): Promise<{ key: string; index: number } | null> {
    const now = new Date();
    
    // Find a healthy key that's not exhausted
    for (let i = 0; i < this.keys.length; i++) {
      const keyHealth = this.keyHealth.get(i);
      
      if (!keyHealth || (!keyHealth.exhausted && keyHealth.retryAfter < now)) {
        console.log(`🔥 Using Groq key ${i + 1}`);
        return { key: this.keys[i], index: i };
      }
    }

    // If all keys are exhausted, try to reset them
    console.log(`⚠️ All Groq keys exhausted, attempting reset...`);
    this.resetAllKeys();
    
    // Try again after reset
    for (let i = 0; i < this.keys.length; i++) {
      const keyHealth = this.keyHealth.get(i);
      if (!keyHealth || !keyHealth.exhausted) {
        console.log(`🔄 Using reset Groq key ${i + 1}`);
        return { key: this.keys[i], index: i };
      }
    }

    console.error(`❌ No healthy Groq keys available`);
    return null;
  }

  // Mark a key as exhausted (rate limited or quota exceeded)
  markKeyExhausted(keyIndex: number, retryAfterSeconds: number = 300): void {
    const retryAfter = new Date(Date.now() + retryAfterSeconds * 1000);
    this.keyHealth.set(keyIndex, {
      exhausted: true,
      lastCheck: new Date(),
      retryAfter
    });
    console.log(`⚠️ Groq key ${keyIndex + 1} marked as exhausted until ${retryAfter.toISOString()}`);
  }

  // Reset all keys (useful when quota resets)
  resetAllKeys(): void {
    this.keyHealth.clear();
    this.fallbackMode = false;
    console.log(`🔄 All Groq keys reset`);
  }

  // Get status of all keys
  getStatus() {
    const available = this.keys.length - Array.from(this.keyHealth.values()).filter(h => h.exhausted).length;
    const total = this.keys.length;
    
    return {
      total,
      available,
      exhausted: total - available,
      keys: this.keys.map((key, index) => ({
        index: index + 1,
        isExhausted: this.keyHealth.get(index)?.exhausted || false,
        retryAfter: this.keyHealth.get(index)?.retryAfter || null,
        lastCheck: this.keyHealth.get(index)?.lastCheck || null
      })),
      fallbackMode: this.fallbackMode
    };
  }

  // Round-robin key selection
  getNextKey(): { key: string; index: number } | null {
    if (this.keys.length === 0) return null;
    
    const healthyKeys = this.keys.filter((_, index) => {
      const health = this.keyHealth.get(index);
      return !health || !health.exhausted || health.retryAfter < new Date();
    });

    if (healthyKeys.length === 0) {
      console.log(`⚠️ No healthy Groq keys available for round-robin`);
      return null;
    }

    // Simple round-robin selection
    this.currentKeyIndex = (this.currentKeyIndex + 1) % healthyKeys.length;
    const selectedKey = healthyKeys[this.currentKeyIndex];
    const originalIndex = this.keys.indexOf(selectedKey);
    
    console.log(`🔄 Round-robin selected Groq key ${originalIndex + 1}`);
    return { key: selectedKey, index: originalIndex };
  }

  // Health check for a specific key
  async checkKeyHealth(keyIndex: number): Promise<boolean> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.keys[keyIndex]}`,
        },
      });

      const isHealthy = response.ok;
      this.keyHealth.set(keyIndex, {
        exhausted: !isHealthy,
        lastCheck: new Date(),
        retryAfter: isHealthy ? new Date() : new Date(Date.now() + 300000) // 5 minutes
      });

      return isHealthy;
    } catch (error) {
      console.error(`❌ Groq key ${keyIndex + 1} health check failed:`, error);
      this.keyHealth.set(keyIndex, {
        exhausted: true,
        lastCheck: new Date(),
        retryAfter: new Date(Date.now() + 300000) // 5 minutes
      });
      return false;
    }
  }

  // Health check for all keys (with throttling)
  async checkAllKeysHealth(): Promise<void> {
    const now = Date.now();
    
    // Throttle health checks to prevent excessive API calls
    if (now - this.lastHealthCheck < this.healthCheckThrottle) {
      return; // Skip this health check
    }
    
    this.lastHealthCheck = now;
    console.log(`🔍 Checking health of all ${this.keys.length} Groq keys...`);
    
    const healthChecks = this.keys.map((_, index) => this.checkKeyHealth(index));
    await Promise.allSettled(healthChecks);
    
    const healthyCount = Array.from(this.keyHealth.values()).filter(h => !h.exhausted).length;
    console.log(`✅ Groq health check complete: ${healthyCount}/${this.keys.length} keys healthy`);
  }
}

// Singleton instance
export const groqKeyManager = new GroqKeyManager();

export class SmartGeminiManager {
  private keys: string[] = [];
  private keyHealth: Map<number, { exhausted: boolean; lastCheck: Date; retryAfter: Date }> = new Map();
  private fallbackMode = false;
  private currentKeyIndex = 0; // For round-robin load balancing

  constructor() {
    // Load all available keys dynamically (supports up to 20 keys)
    const loadedKeys: string[] = [];

    // Check for keys GEMINI_API_KEY_1 through GEMINI_API_KEY_20
    for (let i = 1; i <= 20; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        loadedKeys.push(key);
      }
    }

    this.keys = loadedKeys;

    console.log(`🔑 Loaded ${this.keys.length} Gemini API keys`);
  }

  // SMART: Get the best available key with intelligent retry logic
  async getBestKey(): Promise<{ key: string; index: number } | null> {
    const now = new Date();
    const totalKeys = this.keys.length;

    // Round-robin: Start from the next key index
    // This distributes load across ALL keys to avoid hitting the 15 RPM limit on just the first one
    const startIndex = this.currentKeyIndex % totalKeys;

    // Try each key starting from the current rotation index
    for (let offset = 0; offset < totalKeys; offset++) {
      const i = (startIndex + offset) % totalKeys;
      const health = this.keyHealth.get(i);

      // Skip if exhausted and retry time hasn't passed
      if (health?.exhausted && health.retryAfter > now) {
        continue;
      }

      // Reset exhausted status if retry time has passed
      if (health?.exhausted && health.retryAfter <= now) {
        this.keyHealth.set(i, { exhausted: false, lastCheck: now, retryAfter: new Date() });
        console.log(`🔄 Retrying key ${i} after cooldown`);
      }

      // Update rotation index for next time
      this.currentKeyIndex = (i + 1) % totalKeys;

      return { key: this.keys[i], index: i };
    }

    // All keys exhausted - enable fallback mode
    if (!this.fallbackMode) {
      this.fallbackMode = true;
      console.warn('🚨 All Gemini keys exhausted - enabling fallback mode');
    }

    return null;
  }

  // SMART: Mark key as exhausted with intelligent retry timing
  markKeyExhausted(index: number, error: any) {
    const retryAfter = new Date();

    // Smart retry timing based on error type
    if (error.message?.includes('quota')) {
      retryAfter.setHours(retryAfter.getHours() + 1); // Retry in 1 hour for quota
    } else if (error.message?.includes('rate limit')) {
      retryAfter.setMinutes(retryAfter.getMinutes() + 15); // Retry in 15 min for rate limit
    } else {
      retryAfter.setMinutes(retryAfter.getMinutes() + 5); // Retry in 5 min for other errors
    }

    this.keyHealth.set(index, {
      exhausted: true,
      lastCheck: new Date(),
      retryAfter
    });

    console.warn(`⚠️ Key ${index} marked exhausted, retry after ${retryAfter.toISOString()}`);
  }

  // SMART: Get system status for admin dashboard
  getStatus() {
    const now = new Date();
    const available = this.keys.filter((_, i) => {
      const health = this.keyHealth.get(i);
      return !health?.exhausted || health.retryAfter <= now;
    }).length;

    return {
      total: this.keys.length,
      available,
      exhausted: this.keys.length - available,
      fallbackMode: this.fallbackMode,
      nextRetry: Math.min(...Array.from(this.keyHealth.values()).map(h => h.retryAfter.getTime()))
    };
  }
}

// Singleton instance
export const geminiManager = new SmartGeminiManager();

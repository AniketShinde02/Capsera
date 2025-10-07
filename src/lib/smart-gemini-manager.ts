export class SmartGeminiManager {
  private keys: string[] = [];
  private keyHealth: Map<number, { exhausted: boolean; lastCheck: Date; retryAfter: Date }> = new Map();
  private fallbackMode = false;

  constructor() {
    // Load all available keys
    this.keys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean) as string[];

    console.log(`🔑 Loaded ${this.keys.length} Gemini API keys`);
  }

  // SMART: Get the best available key with intelligent retry logic
  async getBestKey(): Promise<{ key: string; index: number } | null> {
    const now = new Date();
    
    // Try each key in order, skipping exhausted ones
    for (let i = 0; i < this.keys.length; i++) {
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

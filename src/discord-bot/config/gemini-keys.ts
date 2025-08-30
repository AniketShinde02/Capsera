// Discord-specific Gemini API key management
export class DiscordGeminiKeys {
  private static instance: DiscordGeminiKeys;
  private keys: string[] = [];
  private currentIndex: number = 0;
  private keysLoaded: boolean = false;

  private constructor() {
    // Don't load keys in constructor - load them when needed
  }
  
  // Singleton pattern
  public static getInstance(): DiscordGeminiKeys {
    if (!DiscordGeminiKeys.instance) {
      DiscordGeminiKeys.instance = new DiscordGeminiKeys();
    }
    return DiscordGeminiKeys.instance;
  }

  // Load Gemini API keys from environment (lazy loading)
  private loadKeys(): void {
    if (this.keysLoaded) return;
    
    console.log('🔑 DiscordGeminiKeys: Loading keys...');
    console.log('🔑 DISCORD_GEMINI_KEYS:', process.env.DISCORD_GEMINI_KEYS);
    console.log('🔑 GEMINI_API_KEYS:', process.env.GEMINI_API_KEYS);
    console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
    
    // Check for Discord-specific keys first
    const discordKeys = process.env.DISCORD_GEMINI_KEYS;
    if (discordKeys) {
      this.keys = discordKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
      console.log(`🔑 Discord Gemini keys loaded: ${this.keys.length}`);
      this.keysLoaded = true;
      return;
    }

    // Fallback to main site keys if Discord-specific not set
    const mainKeys = process.env.GEMINI_API_KEYS;
    if (mainKeys) {
      this.keys = mainKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
      console.log(`🔑 Using main site Gemini keys for Discord: ${this.keys.length}`);
      this.keysLoaded = true;
      return;
    }

    // Check for individual API keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
    const individualKeys: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key && key.trim().length > 0) {
        individualKeys.push(key.trim());
      }
    }
    
    if (individualKeys.length > 0) {
      this.keys = individualKeys;
      console.log(`🔑 Using individual Gemini keys for Discord: ${this.keys.length}`);
      this.keysLoaded = true;
      return;
    }

    // Single key fallback
    const singleKey = process.env.GEMINI_API_KEY;
    if (singleKey) {
      this.keys = [singleKey];
      console.log('🔑 Using single Gemini key for Discord');
      this.keysLoaded = true;
      return;
    }

    console.warn('⚠️ No Gemini API keys found for Discord bot');
    console.warn('🔑 Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
    this.keysLoaded = true;
  }

  // Get next available key
  public getNextKey(): string | null {
    if (!this.keysLoaded) {
      this.loadKeys();
    }
    
    if (this.keys.length === 0) {
      return null;
    }

    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    
    return key;
  }

  // Get current key
  public getCurrentKey(): string | null {
    if (!this.keysLoaded) {
      this.loadKeys();
    }
    
    if (this.keys.length === 0) {
      return null;
    }
    return this.keys[this.currentIndex];
  }

  // Get all keys count
  public getKeysCount(): number {
    if (!this.keysLoaded) {
      this.loadKeys();
    }
    return this.keys.length;
  }

  // Check if keys are available
  public hasKeys(): boolean {
    if (!this.keysLoaded) {
      this.loadKeys();
    }
    return this.keys.length > 0;
  }

  // Reload keys (useful for hot reloading)
  public reloadKeys(): void {
    this.keysLoaded = false;
    this.loadKeys();
  }
}

// Export singleton instance
export const discordGeminiKeys = DiscordGeminiKeys.getInstance();

// Convenience function
export function getNextDiscordGeminiKey(): string | null {
  return discordGeminiKeys.getNextKey();
}

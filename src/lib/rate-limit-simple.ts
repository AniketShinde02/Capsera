// Simple IP-based Rate Limiting for MVP Survival Mode
// This prevents abuse without over-engineering

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SimpleRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minute
  private readonly maxRequests: number = 5; // 5 requests per minute

  constructor() {
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Check if IP is rate limited
  public async isRateLimited(ip: string, userId?: string): Promise<boolean> {
    // If userId is provided, check if user is admin
    if (userId) {
      try {
        const User = (await import('@/models/User')).default;
        const user = await User.findById(userId);
        if (user?.isAdmin) {
          console.log(`👑 Admin user ${userId} (${user.email}) - bypassing rate limits completely`);
          return false; // Admin users are never rate limited
        } else {
          console.log(`👤 Regular user ${userId} - applying rate limits`);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // If we can't determine admin status, apply rate limits for safety
        console.log(`⚠️ Could not determine admin status for ${userId}, applying rate limits`);
      }
    } else {
      console.log(`🌐 Anonymous user (IP: ${ip}) - applying rate limits`);
    }

    const now = Date.now();
    const entry = this.limits.get(ip);

    if (!entry) {
      // First request from this IP
      this.limits.set(ip, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      // Reset window
      entry.count = 1;
      entry.resetTime = now + this.windowMs;
      return false;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return true;
    }

    // Increment count
    entry.count++;
    return false;
  }

  // Get remaining requests for an IP
  public getRemainingRequests(ip: string): number {
    const entry = this.limits.get(ip);
    if (!entry) {
      return this.maxRequests;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  // Get reset time for an IP
  public getResetTime(ip: string): number {
    const entry = this.limits.get(ip);
    if (!entry) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }

  // Clean up old entries
  private cleanup() {
    const now = Date.now();
    for (const [ip, entry] of this.limits.entries()) {
      if (now > entry.resetTime + (5 * 60 * 1000)) { // 5 minutes after reset
        this.limits.delete(ip);
      }
    }
  }

  // Get current rate limit status
  public getStatus(): { totalIPs: number; limits: Map<string, RateLimitEntry> } {
    return {
      totalIPs: this.limits.size,
      limits: this.limits
    };
  }

  // Reset rate limit for an IP (useful for testing)
  public resetIP(ip: string) {
    this.limits.delete(ip);
  }

  // Reset all rate limits (useful for testing)
  public resetAll() {
    this.limits.clear();
  }

  // Helper function to check if user is admin
  private async checkIfUserIsAdmin(userId: string): Promise<boolean> {
    try {
      const User = (await import('@/models/User')).default;
      const user = await User.findById(userId);
      return user?.isAdmin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false; // Default to false for safety
    }
  }
}

// Create singleton instance
const simpleRateLimiter = new SimpleRateLimiter();

export default simpleRateLimiter;

// Export individual functions for easy use
export const isRateLimited = async (ip: string, userId?: string) => simpleRateLimiter.isRateLimited(ip, userId);
export const getRemainingRequests = (ip: string) => simpleRateLimiter.getRemainingRequests(ip);
export const getResetTime = (ip: string) => simpleRateLimiter.getResetTime(ip);
export const getRateLimitStatus = () => simpleRateLimiter.getStatus();
export const resetRateLimit = (ip: string) => simpleRateLimiter.resetIP(ip);
export const resetAllRateLimits = () => simpleRateLimiter.resetAll();



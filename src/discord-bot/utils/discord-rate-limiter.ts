import mongoose from 'mongoose';

// Discord-specific rate limiting interface
interface DiscordRateLimit {
  discordUserId: string;
  requestsToday: number;
  lastRequest: Date;
  resetDate: Date;
}

// Discord rate limit schema
const DiscordRateLimitSchema = new mongoose.Schema<DiscordRateLimit>({
  discordUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  requestsToday: {
    type: Number,
    default: 0
  },
  lastRequest: {
    type: Date,
    default: Date.now
  },
  resetDate: {
    type: Date,
    default: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }
  }
});

// Index for efficient queries
DiscordRateLimitSchema.index({ discordUserId: 1 });
DiscordRateLimitSchema.index({ resetDate: 1 });

// Create model
const DiscordRateLimit = mongoose.model<DiscordRateLimit>('DiscordRateLimit', DiscordRateLimitSchema);

// Discord rate limiter class
export class DiscordRateLimiter {
  private static instance: DiscordRateLimiter;
  private rateLimitModel: typeof DiscordRateLimit;

  private constructor() {
    this.rateLimitModel = DiscordRateLimit;
  }

  // Singleton pattern
  public static getInstance(): DiscordRateLimiter {
    if (!DiscordRateLimiter.instance) {
      DiscordRateLimiter.instance = new DiscordRateLimiter();
    }
    return DiscordRateLimiter.instance;
  }

  // Check if user can make request
  async canMakeRequest(discordUserId: string, maxRequests: number = 25): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      // Get or create rate limit record
      let rateLimit = await this.rateLimitModel.findOne({ discordUserId });
      
      if (!rateLimit) {
        // Create new rate limit record
        rateLimit = new this.rateLimitModel({
          discordUserId,
          requestsToday: 0,
          lastRequest: new Date(),
          resetDate: this.getNextResetDate()
        });
      }

      // Check if we need to reset daily count
      if (new Date() >= rateLimit.resetDate) {
        rateLimit.requestsToday = 0;
        rateLimit.resetDate = this.getNextResetDate();
      }

      // Check if user can make request
      const allowed = rateLimit.requestsToday < maxRequests;
      const remaining = Math.max(0, maxRequests - rateLimit.requestsToday);

      if (allowed) {
        // Increment request count
        rateLimit.requestsToday += 1;
        rateLimit.lastRequest = new Date();
        await rateLimit.save();
      }

      return {
        allowed,
        remaining,
        resetTime: rateLimit.resetDate
      };

    } catch (error) {
      console.error('❌ Discord rate limit check failed:', error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: 24,
        resetTime: this.getNextResetDate()
      };
    }
  }

  // Get user's current rate limit status
  async getUserStatus(discordUserId: string, maxRequests: number = 25): Promise<{
    requestsToday: number;
    remaining: number;
    resetTime: Date;
    lastRequest: Date;
  }> {
    try {
      const rateLimit = await this.rateLimitModel.findOne({ discordUserId });
      
      if (!rateLimit) {
        return {
          requestsToday: 0,
          remaining: maxRequests,
          resetTime: this.getNextResetDate(),
          lastRequest: new Date()
        };
      }

      // Check if we need to reset daily count
      if (new Date() >= rateLimit.resetDate) {
        return {
          requestsToday: 0,
          remaining: maxRequests,
          resetTime: this.getNextResetDate(),
          lastRequest: rateLimit.lastRequest
        };
      }

      return {
        requestsToday: rateLimit.requestsToday,
        remaining: Math.max(0, maxRequests - rateLimit.requestsToday),
        resetTime: rateLimit.resetDate,
        lastRequest: rateLimit.lastRequest
      };

    } catch (error) {
      console.error('❌ Discord rate limit status check failed:', error);
      return {
        requestsToday: 0,
        remaining: maxRequests,
        resetTime: this.getNextResetDate(),
        lastRequest: new Date()
      };
    }
  }

  // Reset user's rate limit (admin function)
  async resetUserRateLimit(discordUserId: string): Promise<boolean> {
    try {
      await this.rateLimitModel.updateOne(
        { discordUserId },
        {
          requestsToday: 0,
          resetDate: this.getNextResetDate()
        }
      );
      return true;
    } catch (error) {
      console.error('❌ Discord rate limit reset failed:', error);
      return false;
    }
  }

  // Get next reset date (midnight tomorrow)
  private getNextResetDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}

// Export singleton instance
export const discordRateLimiter = DiscordRateLimiter.getInstance();

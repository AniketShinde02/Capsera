/**
 * CONSOLIDATED RATE LIMITER
 * 
 * This is the SINGLE SOURCE OF TRUTH for all rate limiting in the application.
 * It now delegates to the Freemium Rate Limiter strategy which supports:
 * - Daily limits (5 for free, 20 for basic)
 * - Weekly grace periods
 * - Upgrade prompts
 */

import { checkFreemiumLimits, getFreemiumUsageInfo, incrementFreemiumUsage, FreemiumResult } from './freemium-rate-limiter';
import { SmartRateLimiter } from './smart-rate-limiter';
import { NextRequest } from 'next/server';

export class ConsolidatedRateLimiter {
  private secondaryLimiter: SmartRateLimiter;

  constructor() {
    this.secondaryLimiter = new SmartRateLimiter();
  }

  /**
   * PRIMARY RATE LIMITING - Main quota system
   * Uses FreemiumRateLimiter for daily quotas and user tiers
   */
  async checkPrimaryRateLimit(userId?: string, ip?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    userTier?: string;
    isAdmin?: boolean;
    reason?: string;
    retryAfter?: number;
    upgradePrompt?: boolean;
  }> {
    try {
      const result = await checkFreemiumLimits(userId, ip);

      return {
        allowed: result.allowed,
        remaining: result.remainingDaily, // Map daily remaining to generic remaining
        resetTime: result.resetTime,
        userTier: result.tier,
        isAdmin: result.tier === 'pro',
        reason: result.reason,
        upgradePrompt: result.upgradePrompt
      };
    } catch (error: any) {
      console.error('Primary rate limit check failed:', error);
      // Fail open - allow request if primary system fails
      return {
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
        userTier: 'free',
        isAdmin: false,
        reason: 'Rate limit system temporarily unavailable'
      };
    }
  }

  /**
   * SECONDARY RATE LIMITING - Security and abuse prevention
   * Uses SmartRateLimiter for additional security checks
   */
  async checkSecondaryRateLimit(ip: string, userId?: string): Promise<{
    limited: boolean;
    reason?: string;
    retryAfter?: number;
  }> {
    try {
      return await this.secondaryLimiter.isRateLimited(ip, userId);
    } catch (error: any) {
      console.error('Secondary rate limit check failed:', error);
      // Fail closed for security - block if secondary system fails
      return {
        limited: true,
        reason: 'Security system temporarily unavailable',
        retryAfter: 60
      };
    }
  }

  /**
   * COMBINED RATE LIMITING - Primary + Secondary checks
   * This is the main method that should be used throughout the app
   */
  async checkRateLimit(userId?: string, ip?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    userTier?: string;
    isAdmin?: boolean;
    reason?: string;
    retryAfter?: number;
    securityLimited?: boolean;
    upgradePrompt?: boolean;
  }> {
    // Step 1: Check primary rate limit (quotas)
    const primaryResult = await this.checkPrimaryRateLimit(userId, ip);

    if (!primaryResult.allowed) {
      return {
        ...primaryResult,
        securityLimited: false
      };
    }

    // Step 2: Check secondary rate limit (security)
    const secondaryResult = await this.checkSecondaryRateLimit(ip || 'unknown', userId);

    if (secondaryResult.limited) {
      return {
        allowed: false,
        remaining: primaryResult.remaining,
        resetTime: primaryResult.resetTime,
        userTier: primaryResult.userTier,
        isAdmin: primaryResult.isAdmin,
        reason: secondaryResult.reason || 'Security rate limit exceeded',
        retryAfter: secondaryResult.retryAfter,
        securityLimited: true,
        upgradePrompt: primaryResult.upgradePrompt
      };
    }

    // Both checks passed
    return {
      ...primaryResult,
      securityLimited: false
    };
  }

  /**
   * Increment usage count - Call ONLY after successful operation
   */
  async incrementUsage(userId?: string, ip?: string): Promise<void> {
    try {
      await incrementFreemiumUsage(userId, ip);
    } catch (error) {
      console.error('Failed to increment usage:', error);
    }
  }

  /**
   * Get rate limit info for display (consistent with checkRateLimit)
   */
  async getRateLimitInfo(userId?: string, ip?: string): Promise<{
    isAuthenticated: boolean;
    maxGenerations: number;
    currentUsage: number;
    remaining: number;
    resetTime: number;
    windowHours: number;
    isAdmin?: boolean;
    userTier?: string;
    resetMessage?: string;
    upgradePrompt?: boolean;
  }> {
    try {
      const info = await getFreemiumUsageInfo(userId, ip);

      // Calculate reset message
      const now = Date.now();
      const timeUntilReset = info.resetTime - now;
      const hoursUntilReset = Math.ceil(timeUntilReset / (60 * 60 * 1000));

      let resetMessage = 'tomorrow';
      if (hoursUntilReset < 24) {
        if (hoursUntilReset < 1) {
          resetMessage = 'in less than an hour';
        } else {
          resetMessage = `in ${hoursUntilReset} hours`;
        }
      }

      return {
        isAuthenticated: !!userId,
        maxGenerations: info.dailyLimit,
        currentUsage: info.dailyUsage,
        remaining: info.remainingDaily,
        resetTime: info.resetTime,
        windowHours: 24,
        isAdmin: info.tier === 'pro',
        userTier: info.tier,
        resetMessage,
        upgradePrompt: info.upgradePrompt
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return {
        isAuthenticated: !!userId,
        maxGenerations: 2,
        currentUsage: 0,
        remaining: 2,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
        windowHours: 24,
        isAdmin: false,
        userTier: 'free',
        resetMessage: 'tomorrow'
      };
    }
  }

  /**
   * Generate rate limit key (consistent across systems)
   */
  generateRateLimitKey(userId?: string, ip?: string): string {
    if (userId) {
      return `user:${userId}`;
    }
    return `ip:${ip || 'unknown'}`;
  }

  /**
   * Get client IP from request
   */
  getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    return 'unknown';
  }
}

// Export singleton instance
export const consolidatedRateLimiter = new ConsolidatedRateLimiter();

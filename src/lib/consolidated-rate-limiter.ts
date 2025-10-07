/**
 * CONSOLIDATED RATE LIMITER
 * 
 * This is the SINGLE SOURCE OF TRUTH for all rate limiting in the application.
 * All other rate limiters should be deprecated and replaced with this one.
 * 
 * PRIMARY SYSTEM: UnifiedRateLimiter (main functionality)
 * SECONDARY SYSTEM: SmartRateLimiter (for additional security features)
 */

import { UnifiedRateLimiter } from './unified-rate-limiter';
import { SmartRateLimiter } from './smart-rate-limiter';
import { NextRequest } from 'next/server';

export class ConsolidatedRateLimiter {
  private primaryLimiter: UnifiedRateLimiter;
  private secondaryLimiter: SmartRateLimiter;
  
  constructor() {
    this.primaryLimiter = new UnifiedRateLimiter();
    this.secondaryLimiter = new SmartRateLimiter();
  }

  /**
   * PRIMARY RATE LIMITING - Main quota system
   * Uses UnifiedRateLimiter for daily quotas and user tiers
   */
  async checkPrimaryRateLimit(userId?: string, ip?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    userTier?: string;
    isAdmin?: boolean;
    reason?: string;
    retryAfter?: number;
  }> {
    try {
      const key = this.primaryLimiter.generateRateLimitKey(userId, ip);
      const userTier = userId ? 'registered' : 'anonymous';
      const config = await this.primaryLimiter.getRateLimitConfig(userTier);
      
      const result = await this.primaryLimiter.checkRateLimit(
        key,
        config.MAX_GENERATIONS,
        config.WINDOW_HOURS,
        userId,
        ip
      );
      
      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
        userTier: result.userTier,
        isAdmin: result.isAdmin,
        reason: result.reason,
        retryAfter: result.retryAfter
      };
    } catch (error: any) {
      console.error('Primary rate limit check failed:', error);
      // Fail open - allow request if primary system fails
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
        userTier: 'anonymous',
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
        securityLimited: true
      };
    }

    // Both checks passed
    return {
      ...primaryResult,
      securityLimited: false
    };
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
  }> {
    return await this.primaryLimiter.getRateLimitInfo(userId, ip);
  }

  /**
   * Generate rate limit key (consistent across systems)
   */
  generateRateLimitKey(userId?: string, ip?: string): string {
    return this.primaryLimiter.generateRateLimitKey(userId, ip);
  }

  /**
   * Get rate limit configuration
   */
  async getRateLimitConfig(tier: string) {
    return await this.primaryLimiter.getRateLimitConfig(tier as any);
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

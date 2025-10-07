export class SmartRateLimiter {
  private limits: Map<string, { count: number; resetTime: number; violations: number }> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private trustedIPs: Set<string> = new Set();

  constructor() {
    // Load trusted IPs from environment
    const trustedIPsEnv = process.env.TRUSTED_IPS?.split(',') || [];
    trustedIPsEnv.forEach(ip => this.trustedIPs.add(ip.trim()));
  }

  // SMART: Intelligent rate limiting with adaptive thresholds
  async isRateLimited(ip: string, userId?: string): Promise<{ limited: boolean; reason?: string; retryAfter?: number }> {
    const now = Date.now();
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    const entry = this.limits.get(key);

    // Trusted IPs get higher limits
    const isTrusted = this.trustedIPs.has(ip);
    const maxRequests = isTrusted ? 50 : (userId ? 25 : 5);
    const windowMs = 60 * 1000; // 1 minute

    if (!entry) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs, violations: 0 });
      return { limited: false };
    }

    // Reset window if expired
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
      entry.violations = Math.max(0, entry.violations - 1); // Reduce violations over time
      return { limited: false };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      entry.violations++;
      
      // Escalating penalties for repeat violations
      let penaltyMultiplier = 1;
      if (entry.violations > 3) penaltyMultiplier = 2;
      if (entry.violations > 10) penaltyMultiplier = 5;
      
      const retryAfter = Math.min(entry.resetTime - now, windowMs * penaltyMultiplier);
      
      // Mark suspicious IPs
      if (entry.violations > 5 && !userId) {
        this.suspiciousIPs.add(ip);
        console.warn(`🚨 Suspicious IP detected: ${ip} (${entry.violations} violations)`);
      }
      
      return { 
        limited: true, 
        reason: `Rate limit exceeded. ${entry.violations} violations.`,
        retryAfter: Math.ceil(retryAfter / 1000)
      };
    }

    entry.count++;
    return { limited: false };
  }

  // SMART: Admin bypass with logging
  async checkAdminBypass(userId: string): Promise<boolean> {
    try {
      const User = (await import('@/models/User')).default;
      const user = await (User as any).findById(userId);
      
      if (user?.isAdmin) {
        console.log(`👑 Admin bypass granted for user ${userId}`);
        return true;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    
    return false;
  }

  // SMART: Get rate limiting insights
  getInsights(): { suspiciousIPs: string[]; violationStats: any; recommendations: string[] } {
    const suspiciousIPs = Array.from(this.suspiciousIPs);
    const violationStats = Array.from(this.limits.entries())
      .filter(([_, data]) => data.violations > 0)
      .map(([key, data]) => ({ key, violations: data.violations }));
    
    const recommendations: string[] = [];
    
    if (suspiciousIPs.length > 0) {
      recommendations.push(`Consider blocking ${suspiciousIPs.length} suspicious IPs`);
    }
    
    if (violationStats.length > 10) {
      recommendations.push('High violation rate detected - consider stricter limits');
    }
    
    return { suspiciousIPs, violationStats, recommendations };
  }
}

export const smartRateLimiter = new SmartRateLimiter();

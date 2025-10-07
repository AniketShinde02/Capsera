import { NextResponse } from 'next/server';
import { geminiManager } from '@/lib/smart-gemini-manager';
import { smartErrorHandler } from '@/lib/smart-error-handler';
import { smartRateLimiter } from '@/lib/smart-rate-limiter';

export async function GET() {
  try {
    // Get system health status
    const geminiStatus = geminiManager.getStatus();
    const errorInsights = smartErrorHandler.getErrorInsights();
    const rateLimitInsights = smartRateLimiter.getInsights();
    
    // Determine overall health
    const isHealthy = 
      geminiStatus.available > 0 && 
      errorInsights.critical.length === 0 &&
      rateLimitInsights.suspiciousIPs.length < 10;
    
    const healthScore = calculateHealthScore(geminiStatus, errorInsights, rateLimitInsights);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      healthy: isHealthy,
      healthScore,
      status: {
        gemini: {
          available: geminiStatus.available,
          total: geminiStatus.total,
          exhausted: geminiStatus.exhausted,
          fallbackMode: geminiStatus.fallbackMode
        },
        errors: {
          critical: errorInsights.critical.length,
          recommendations: errorInsights.recommendations.length
        },
        rateLimiting: {
          suspiciousIPs: rateLimitInsights.suspiciousIPs.length,
          violations: rateLimitInsights.violationStats.length
        }
      },
      alerts: generateAlerts(geminiStatus, errorInsights, rateLimitInsights)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      healthy: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function calculateHealthScore(geminiStatus: any, errorInsights: any, rateLimitInsights: any): number {
  let score = 100;
  
  // Deduct points for exhausted keys
  if (geminiStatus.exhausted > 0) {
    score -= (geminiStatus.exhausted / geminiStatus.total) * 30;
  }
  
  // Deduct points for critical errors
  score -= errorInsights.critical.length * 10;
  
  // Deduct points for suspicious IPs
  score -= rateLimitInsights.suspiciousIPs.length * 2;
  
  return Math.max(0, Math.round(score));
}

function generateAlerts(geminiStatus: any, errorInsights: any, rateLimitInsights: any): string[] {
  const alerts: string[] = [];
  
  if (geminiStatus.exhausted >= geminiStatus.total * 0.8) {
    alerts.push('🚨 High number of exhausted Gemini keys');
  }
  
  if (errorInsights.critical.length > 0) {
    alerts.push('🚨 Critical errors detected');
  }
  
  if (rateLimitInsights.suspiciousIPs.length > 5) {
    alerts.push('🚨 Multiple suspicious IPs detected');
  }
  
  if (geminiStatus.fallbackMode) {
    alerts.push('⚠️ System running in fallback mode');
  }
  
  return alerts;
}

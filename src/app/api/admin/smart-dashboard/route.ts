import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { geminiManager } from '@/lib/smart-gemini-manager';
import { smartErrorHandler } from '@/lib/smart-error-handler';
import { unifiedRateLimiter } from '@/lib/unified-rate-limiter';
import { SmartDBQueries } from '@/lib/smart-db-queries';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const dbQueries = new SmartDBQueries(db);
    
    // Get all smart insights in parallel
    const [dbStats, errorInsights, rateLimitInsights, geminiStatus] = await Promise.all([
      dbQueries.getDashboardStats(),
      smartErrorHandler.getErrorInsights(),
      {
        suspiciousIPs: Array.from(unifiedRateLimiter.getSuspiciousIPs()),
        violationStats: await unifiedRateLimiter.getViolationStats(),
        recommendations: unifiedRateLimiter.getViolationCount() > 10 ? ['Consider stricter rate limits'] : []
      },
      geminiManager.getStatus()
    ]);
    
    // Combine all insights
    const recommendations = [
      ...errorInsights.recommendations,
      ...rateLimitInsights.recommendations
    ];

    // Add system-specific recommendations
    if (geminiStatus.exhausted > geminiStatus.total * 0.8) {
      recommendations.push('Consider adding more Gemini API keys or upgrading quotas');
    }

    if (errorInsights.critical.length > 0) {
      recommendations.push('Address critical error patterns immediately');
    }

    if (rateLimitInsights.suspiciousIPs.length > 5) {
      recommendations.push('Consider implementing IP blocking for suspicious addresses');
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        database: dbStats,
        errors: errorInsights,
        rateLimiting: rateLimitInsights,
        gemini: geminiStatus,
        recommendations: [...new Set(recommendations)] // Remove duplicates
      }
    });
  } catch (error) {
    console.error('Smart dashboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch smart dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

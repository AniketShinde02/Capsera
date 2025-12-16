import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Health Check Endpoint - Environment Configuration Only
 * DOES NOT make actual API calls to avoid wasting tokens
 * Protected endpoint - requires authentication
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication to prevent public token waste
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - Authentication required'
      }, { status: 401 });
    }

    // Only check if admin user
    if (!session.user.isAdmin) {
      return NextResponse.json({
        status: 'error',
        message: 'Forbidden - Admin access required'
      }, { status: 403 });
    }

    // Check environment variables without making API calls
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const envStatus = {
      openrouter: !!openRouterKey,
      gemini: !!geminiKey,
      groq: !!groqKey
    };

    const allConfigured = envStatus.openrouter && envStatus.gemini && envStatus.groq;

    return NextResponse.json({
      status: allConfigured ? 'healthy' : 'partial',
      message: allConfigured
        ? 'All AI provider keys configured'
        : 'Some AI provider keys missing',
      providers: envStatus,
      note: 'This endpoint only checks environment variables. No API calls are made to preserve tokens.'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    }, { status: 500 });
  }
}

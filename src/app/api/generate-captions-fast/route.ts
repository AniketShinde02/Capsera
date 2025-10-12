import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';

// Get client IP address
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
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

// Fast Groq caption generation with basic rate limiting
async function generateFastCaptions(mood: string, description: string, imageUrl: string): Promise<{ success: boolean; captions?: string[]; error?: string; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    // Get the best Groq key
    const groqKey = process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2;
    
    if (!groqKey) {
      return {
        success: false,
        error: 'No Groq API keys available',
        processingTime: Date.now() - startTime
      };
    }

    console.log('⚡ Fast Groq generation...');

    // Optimized prompt for speed and quality balance
    const prompt = `Create 3 ${mood} social media captions${description ? ` for: ${description}` : ''}. Each 10-25 words with 2-3 hashtags. Format: 1. 2. 3.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Generate 3 social media captions. Each 10-25 words with 2-3 hashtags. Format as numbered list (1., 2., 3.).'
          },
          {
            role: 'user',
            content: `${prompt}\n\nImage URL: ${imageUrl}`
          }
        ],
        max_tokens: 150,
        temperature: 0.6,
        stream: false,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle content safety responses
      if (response.status === 400 && errorData.error?.message?.includes('safety')) {
        return {
          success: false,
          error: 'This content was flagged by our safety filters. Please try with a different image.',
          processingTime: Date.now() - startTime
        };
      }
      
      if (response.status === 400 && errorData.error?.message?.includes('policy')) {
        return {
          success: false,
          error: 'This content violates our usage policies. Please try with a different image.',
          processingTime: Date.now() - startTime
        };
      }
      
      return {
        success: false,
        error: `Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
        processingTime: Date.now() - startTime
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: 'No content received from Groq',
        processingTime: Date.now() - startTime
      };
    }

    // Extract captions
    const lines = content.split('\n').filter(line => line.trim());
    const captions: string[] = [];
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      if (cleanLine && cleanLine.length > 10) {
        captions.push(cleanLine);
        if (captions.length >= 3) break;
      }
    }

    if (captions.length === 0) {
      return {
        success: false,
        error: 'No valid captions extracted',
        processingTime: Date.now() - startTime
      };
    }

    console.log(`⚡ Fast captions generated in ${Date.now() - startTime}ms`);

    return {
      success: true,
      captions,
      processingTime: Date.now() - startTime
    };

  } catch (error: any) {
    console.error('❌ Fast generation failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      processingTime: Date.now() - startTime
    };
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(req);

  // Get session for user authentication
  const session = await getServerSession(authOptions);

  try {
    // Parse request body
    const body = await req.json();
    const { mood, description, imageUrl } = body;

    // Validate required fields
    if (!mood || !imageUrl) {
      return NextResponse.json({
        success: false,
        message: 'Mood and image are required'
      }, { status: 400 });
    }

    // ⚡ FAST RATE LIMITING: Quick check
    const rateLimitResult = await consolidatedRateLimiter.checkRateLimit(
      session?.user?.id || clientIP
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        message: rateLimitResult.reason || 'Rate limit exceeded',
        rateLimit: {
          userTier: rateLimitResult.userTier,
          isAdmin: rateLimitResult.isAdmin,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      }, { status: 429 });
    }

    // ⚡ FAST GENERATION: Direct Groq API call (no content safety - providers handle this)
    console.log('⚡ Starting fast caption generation...');
    
    const result = await generateFastCaptions(mood, description || '', imageUrl);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Caption generation failed',
        processingTime: Date.now() - startTime
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`⚡ Fast caption generated successfully in ${processingTime}ms`);

    // Get rate limit info for display
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);
    
    // Return success response
    return NextResponse.json({
      success: true,
      captions: result.captions,
      processingTime,
      note: `Generated with Groq AI ⚡ (Fast Mode)`,
      provider: 'groq',
      cached: false,
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        isAdmin: rateLimitInfo.isAdmin,
        maxGenerations: rateLimitInfo.maxGenerations,
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ Fast caption generation failed after ${processingTime}ms:`, error);

    // Get rate limit info for error response
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    return NextResponse.json({
      success: false,
      message: error.message || 'Caption generation failed',
      processingTime,
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        isAdmin: rateLimitInfo.isAdmin,
        maxGenerations: rateLimitInfo.maxGenerations,
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      }
    }, { status: 500 });
  }
}

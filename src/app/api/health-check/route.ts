import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenRouter Health Check Endpoint
 * Tests if OpenRouter API is accessible and returns account status
 */
export async function GET(req: NextRequest) {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return NextResponse.json({
        status: 'error',
        message: 'OPENROUTER_API_KEY not configured in environment',
        keyPresent: false
      }, { status: 500 });
    }

    // Test with a cheap, reliable model (GPT-3.5-turbo is widely available)
    const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://capsera.com',
        'X-Title': 'Capsera Health Check',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Most universally available model
        messages: [
          { role: 'user', content: 'ping' }
        ],
        max_tokens: 5
      })
    });

    const responseData = await testResponse.json();

    if (!testResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenRouter API rejected request',
        httpStatus: testResponse.status,
        error: responseData,
        keyPresent: true,
        keyPrefix: openRouterKey.substring(0, 12) + '...',
        diagnosis: testResponse.status === 401
          ? 'INVALID API KEY'
          : testResponse.status === 402
            ? 'INSUFFICIENT CREDITS'
            : testResponse.status === 403
              ? 'ACCESS FORBIDDEN - Check account status'
              : 'UNKNOWN ERROR'
      }, { status: testResponse.status });
    }

    // Success - API is reachable
    return NextResponse.json({
      status: 'healthy',
      message: 'OpenRouter API is accessible',
      keyPresent: true,
      keyPrefix: openRouterKey.substring(0, 12) + '...',
      testModel: 'openai/gpt-3.5-turbo',
      response: {
        model: responseData.model,
        usage: responseData.usage
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to reach OpenRouter API',
      error: error.message,
      diagnosis: 'NETWORK/CONNECTION ISSUE'
    }, { status: 500 });
  }
}

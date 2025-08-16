import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { action, data, timestamp, userId, sessionId } = await req.json();
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Create analytics event document
    const analyticsEvent = {
      action,
      data,
      timestamp: new Date(timestamp),
      userId: userId || null,
      sessionId,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent'),
      createdAt: new Date()
    };
    
    // Store in analytics collection
    await db.collection('analytics_events').insertOne(analyticsEvent);
    
    console.log('📊 Analytics event tracked:', { action, userId, sessionId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    });
    
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

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
  
  return req.ip || 'unknown';
}

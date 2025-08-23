import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token || new URL(request.url).searchParams.get('token');

    const secret = process.env.MAINTENANCE_BYPASS_TOKEN;
    if (!secret) {
      return NextResponse.json({ success: false, message: 'Bypass token not configured' }, { status: 500 });
    }

    if (!token || token !== secret) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Set cookie valid for 12 hours
    const res = NextResponse.json({ success: true });
    const cookieOptions = `maintenance_bypass=1; Path=/; Max-Age=${12 * 60 * 60}; HttpOnly; SameSite=Strict`;
    // In production, ensure Secure flag
    if (process.env.NODE_ENV === 'production') {
      res.headers.set('Set-Cookie', cookieOptions + '; Secure');
    } else {
      res.headers.set('Set-Cookie', cookieOptions);
    }

    return res;
  } catch (error) {
    console.error('Bypass route error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

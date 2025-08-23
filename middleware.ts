import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: checks maintenance mode in two ways:
 * 1) Fast path: environment variable MAINTENANCE_MODE (true/1) - easiest for production toggles (Vercel env var)
 * 2) Fallback: call server API /api/maintenance/status which reads the DB
 *
 * This lets you toggle maintenance quickly via Vercel env vars, or use a DB-driven toggle via an admin API.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid applying middleware to static/assets and API routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  try {
    // Bypass cookie (set via /api/maintenance/bypass with a server-side token)
    // Check cookies via request.cookies (NextRequest API)
    const bypassCookie = (request.cookies && request.cookies.get && request.cookies.get('maintenance_bypass')?.value) || '';
    if (bypassCookie === '1') {
      return NextResponse.next();
    }
  // Determine client IP from common headers (x-forwarded-for, cf-connecting-ip, x-real-ip)
  const headers = request.headers;
  const xff = headers.get('x-forwarded-for') || '';
  const cfIp = headers.get('cf-connecting-ip') || '';
  const xReal = headers.get('x-real-ip') || '';
  const clientIp = (xff.split(',')[0].trim() || cfIp || xReal || '').toLowerCase();

  // Parse allowlist from environment (comma-separated)
  const allowlistEnv = process.env.MAINTENANCE_ALLOWED_IPS || '';
  const allowedIps = allowlistEnv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const isAllowedIp = clientIp && allowedIps.includes(clientIp);

    // 1) Fast check - environment variable (set MAINTENANCE_MODE=true in Vercel env vars)
    const envFlag = process.env.MAINTENANCE_MODE;
    if (envFlag && (envFlag === '1' || envFlag.toLowerCase() === 'true')) {
      // If env flag is enabled but client IP is allowed, let them through
      if (isAllowedIp) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // 2) Fallback: fetch server-maintenance status endpoint (no-cache)
    // Keep this call lightweight; it returns a small JSON { enabled: boolean }
    try {
      const origin = request.nextUrl.origin;
      const res = await fetch(new URL('/api/maintenance/status', origin).toString(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.enabled) {
          // Allow bypass if client IP is in the allowed list
          if (isAllowedIp) {
            return NextResponse.next();
          }
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    } catch (fetchErr) {
      // If the fetch fails, fall through and allow access (fail-open)
      console.error('Middleware: maintenance status fetch failed:', fetchErr);
    }
  } catch (err) {
    console.error('Middleware error:', err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};



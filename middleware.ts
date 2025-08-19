import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🛡️ Middleware executing for path: ${pathname}`);
  
  // Simple test: redirect /test to /maintenance
  if (pathname === '/test') {
    console.log('🧪 Test redirect working!');
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  // For all other routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};



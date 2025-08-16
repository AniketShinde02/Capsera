import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Performance and caching headers
  const { pathname } = request.nextUrl

  // Static assets caching
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') || 
      pathname.includes('.') ||
      pathname.startsWith('/images/') ||
      pathname.startsWith('/favicon')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Vary', 'Accept-Encoding')
  }
  
  // API routes - short cache for dynamic content
  else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // HTML pages - moderate cache
  else {
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')
    response.headers.set('Vary', 'Accept-Encoding, Accept-Language')
  }

  // Compression hint
  response.headers.set('Accept-Encoding', 'gzip, deflate, br')

  // Preload critical resources - removed problematic preloads that were causing errors
  // if (pathname === '/') {
  //   response.headers.set('Link', '</_next/static/css/app.css>; rel=preload; as=style, </_next/static/chunks/main.js>; rel=preload; as=script')
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

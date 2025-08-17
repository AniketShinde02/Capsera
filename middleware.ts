import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Always allow setup page to pass through
    if (pathname === '/admin/setup') {
      return NextResponse.next();
    }

    // For all other routes, let NextAuth handle authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow setup page
        if (pathname === '/admin/setup') {
          return true;
        }
        
        // ONLY protect admin routes - allow all other routes to pass through
        if (pathname.startsWith('/admin')) {
          return !!token;
        }
        
        // Allow all other routes without authentication requirement
        return true;
      },
    },
    pages: { 
      signIn: '/401',
      error: '/401',
    },
  }
);

export const config = {
  matcher: [
    // ONLY protect admin routes - remove profile, settings, etc.
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};



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
        
        // For admin routes, require authentication
        if (pathname.startsWith('/admin')) {
          return !!token;
        }
        
        // For other protected routes, require authentication
        return !!token;
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
    '/admin/dashboard',
    '/profile',
    '/settings',
    '/api/admin/dashboard-stats',
    '/api/user/:path*',
    '/api/posts/:path*'
  ]
};



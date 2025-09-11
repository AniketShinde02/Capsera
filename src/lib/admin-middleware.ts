import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface AdminSession {
  user: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    hasRegularUserAccount?: boolean;
    canBrowseAsUser?: boolean;
  };
}

/**
 * Verify admin access for API routes
 * Returns null if admin access is verified, or a Response object if access is denied
 */
export async function verifyAdminAccess(request: NextRequest): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions) as AdminSession | null;
    
    if (!session?.user) {
      console.log('❌ Admin middleware: No session found');
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      console.log('❌ Admin middleware: User is not admin:', session.user.email);
      return NextResponse.json({ 
        error: 'Admin access required',
        message: 'This resource requires administrator privileges'
      }, { status: 403 });
    }

    console.log('✅ Admin middleware: Admin access verified for:', session.user.email);
    return null; // No error, admin verified

  } catch (error: any) {
    console.error('❌ Admin middleware error:', error);
    return NextResponse.json({ 
      error: 'Authentication verification failed',
      message: 'Unable to verify admin privileges'
    }, { status: 401 });
  }
}

/**
 * Verify super admin access for API routes
 * Returns null if super admin access is verified, or a Response object if access is denied
 */
export async function verifySuperAdminAccess(request: NextRequest): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions) as AdminSession | null;
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        message: 'This resource requires administrator privileges'
      }, { status: 403 });
    }

    if (!session.user.isSuperAdmin) {
      console.log('❌ Super admin middleware: User is not super admin:', session.user.email);
      return NextResponse.json({ 
        error: 'Super admin access required',
        message: 'This resource requires super administrator privileges'
      }, { status: 403 });
    }

    console.log('✅ Super admin middleware: Super admin access verified for:', session.user.email);
    return null; // No error, super admin verified

  } catch (error: any) {
    console.error('❌ Super admin middleware error:', error);
    return NextResponse.json({ 
      error: 'Authentication verification failed',
      message: 'Unable to verify super admin privileges'
    }, { status: 401 });
  }
}

/**
 * Get current user session with type safety
 */
export async function getCurrentUser(): Promise<AdminSession | null> {
  try {
    const session = await getServerSession(authOptions) as AdminSession | null;
    return session;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const session = await getCurrentUser();
    return !!(session?.user?.isAdmin);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if current user is super admin
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  try {
    const session = await getCurrentUser();
    return !!(session?.user?.isSuperAdmin);
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Higher-order function to wrap API routes with admin authentication
 */
export function withAdminAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;
    
    return handler(request, context);
  };
}

/**
 * Higher-order function to wrap API routes with super admin authentication
 */
export function withSuperAdminAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const superAdminError = await verifySuperAdminAccess(request);
    if (superAdminError) return superAdminError;
    
    return handler(request, context);
  };
}

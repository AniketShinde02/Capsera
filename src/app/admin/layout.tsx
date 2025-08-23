import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { canManageAdmins } from '@/lib/init-admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { Toaster } from '@/components/ui/toaster';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMaintenanceCheck from '@/components/admin-maintenance-check';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/lib/dev-error-bypass'; // Import error bypass utility
import '@/lib/runtime-error-bypass'; // Import runtime error bypass utility

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  console.log('🔐 Admin layout - Session check:', { 
    hasSession: !!session, 
    userId: session?.user?.id, 
    userRole: session?.user?.role,
    userEmail: session?.user?.email 
  });
  
  // If no session, redirect to setup page
  if (!session) {
    console.log('❌ Admin layout - No session, redirecting to setup');
    redirect('/setup');
  }
  
  // Check if user has admin access using the permission system
  try {
    const hasAdminAccess = await canManageAdmins(session.user.id);
    if (!hasAdminAccess) {
      console.log('❌ Admin layout - User does not have admin access, redirecting to unauthorized page');
      redirect('/unauthorized');
    }
  } catch (error) {
    console.error('❌ Admin layout - Error checking admin access:', error);
    redirect('/unauthorized');
  }

  console.log('✅ Admin layout - User has admin access, rendering admin interface');

  return (
    <ErrorBoundary>
      <AdminThemeProvider>
        <AdminMaintenanceCheck />
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
          {/* Mobile Header - Only show on mobile */}
          <div className="lg:hidden bg-sidebar border-b border-sidebar-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-sidebar-foreground">CaptionCraft</h1>
                  <p className="text-sm text-sidebar-foreground/60">Admin Panel</p>
                </div>
              </div>
              <AdminHeader user={{ 
                email: session.user.email || 'unknown@example.com',
                username: session.user.username || undefined
              }} />
            </div>
          </div>

          {/* Sidebar - Mobile First */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <AdminSidebar />
          </div>
          
          {/* Main content area - Mobile First */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Desktop Header - Only show on desktop */}
            <div className="hidden lg:block">
              <AdminHeader user={{ 
                email: session.user.email || 'unknown@example.com',
                username: session.user.username || undefined
              }} />
            </div>
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              <div className="max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </AdminThemeProvider>
    </ErrorBoundary>
  );
}

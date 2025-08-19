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
    <AdminThemeProvider>
      <AdminLayoutWrapper>
        <AdminMaintenanceCheck />
        <div className="flex h-screen bg-background overflow-hidden">
          {/* Sidebar - Mobile First */}
          <div className="w-0 lg:w-64 flex-shrink-0">
            <AdminSidebar />
          </div>
          
          {/* Main content area - Mobile First */}
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader user={{ 
              email: session.user.email || 'unknown@example.com',
              username: session.user.username || undefined
            }} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
              <div className="max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </AdminLayoutWrapper>
    </AdminThemeProvider>
  );
}

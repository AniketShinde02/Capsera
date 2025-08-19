'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Users, 
  Shield, 
  Archive, 
  FileText, 
  Settings, 
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Database,
  Image as ImageIcon,
  Lock,
  Zap,
  Menu,
  X,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'User behavior and performance analytics'
  },
  {
    title: 'Advanced Analytics',
    href: '/admin/advanced-analytics',
    icon: TrendingUp,
    description: 'System performance and technical metrics'
  },
  {
    title: 'System Setup',
    href: '/admin/setup',
    icon: Shield,
    description: 'Initialize admin system and create admin users'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts and roles'
  },
  {
    title: 'Role Management',
    href: '/admin/roles',
    icon: Shield,
    description: 'Create and manage user roles'
  },
  {
    title: 'Archived Profiles',
    href: '/admin/archived-profiles',
    icon: Archive,
    description: 'View deleted user data'
  },
  {
    title: 'Data Recovery',
    href: '/admin/data-recovery',
    icon: FileText,
    description: 'Handle recovery requests'
  },
  {
    title: 'Content Moderation',
    href: '/admin/moderation',
    icon: MessageSquare,
    description: 'Moderate user content'
  },
  {
    title: 'System Alerts',
    href: '/admin/alerts',
    icon: AlertTriangle,
    description: 'System warnings and alerts'
  },
  {
    title: 'Database Management',
    href: '/admin/database',
    icon: Database,
    description: 'Database operations and backups'
  },
  {
    title: 'Image Management',
    href: '/admin/images',
    icon: ImageIcon,
    description: 'Manage Cloudinary storage'
  },
  {
    title: 'API Keys',
    href: '/admin/keys',
    icon: Zap,
    description: 'Manage Gemini API keys and quotas'
  },
  {
    title: 'Cache Management',
    href: '/admin/cache',
    icon: Database,
    description: 'Manage caption cache and optimize API usage'
  },
  {
    title: 'Archive Management',
    href: '/admin/archives',
    icon: Archive,
    description: 'Manage Cloudinary archives and cleanup old files'
  },
  {
    title: 'Admin Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Administrative configuration'
  },
  {
    title: 'System Lock',
    href: '/admin/system-lock',
    icon: Lock,
    description: 'Manage system lock PIN and security settings'
  },
  {
    title: 'Maintenance Mode',
    href: '/admin/maintenance',
    icon: Wrench,
    description: 'Control site maintenance mode and access'
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 bg-background border border-border rounded-lg shadow-lg h-10 w-10 flex items-center justify-center"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Mobile First */}
      <div className={cn(
        "h-full bg-sidebar border-r border-sidebar-border shadow-lg transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
          {/* Logo and Branding - Mobile First */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8 h-10 sm:h-12">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-sidebar-foreground">CaptionCraft</h1>
              <p className="text-xs text-sidebar-foreground/60 hidden sm:block">Admin Panel</p>
            </div>
          </div>

          {/* Navigation Menu - Mobile First */}
          <nav className="space-y-1 lg:space-y-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-sidebar-foreground"
                  )}
                  title={item.description}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions - Mobile First */}
          <div className="mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 mb-2 hidden sm:block">Quick Actions</div>
            <div className="space-y-1">
              <Link
                href="/admin/system-lock"
                className="w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMobileOpen(false)}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">System Lock</span>
              </Link>
              <button 
                onClick={() => {
                  // Navigate to dashboard and trigger export
                  window.location.href = '/admin/dashboard';
                  setTimeout(() => {
                    const exportSelect = document.querySelector('select[onchange*="handleExportReport"]') as HTMLSelectElement;
                    if (exportSelect) {
                      exportSelect.value = 'system-status';
                      exportSelect.dispatchEvent(new Event('change'));
                    }
                  }, 1000);
                }}
                className="w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              >
                <span className="truncate">📊 Generate Report</span>
              </button>
            </div>
          </div>

          {/* Theme Toggle - Mobile First */}
          <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 mb-2 hidden sm:block">Appearance</div>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

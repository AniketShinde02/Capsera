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
  Wrench,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

// Group navigation items by category for better mobile organization
const adminNavCategories = [
  {
    title: 'Overview',
    items: [
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
      }
    ]
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
        description: 'Manage user accounts and roles'
      },
      {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
        description: 'Create and manage user roles'
      },
      {
        title: 'Archived Profiles',
        href: '/admin/archived-profiles',
        icon: Archive,
        description: 'View deleted user data'
      }
    ]
  },
  {
    title: 'Content & Data',
    items: [
      {
        title: 'Content Moderation',
        href: '/admin/moderation',
        icon: MessageSquare,
        description: 'Moderate user content'
      },
      {
        title: 'Data Recovery',
        href: '/admin/data-recovery',
        icon: FileText,
        description: 'Handle recovery requests'
      },
      {
        title: 'Images',
        href: '/admin/images',
        icon: ImageIcon,
        description: 'Manage Cloudinary storage'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        title: 'System Setup',
        href: '/admin/setup',
        icon: Shield,
        description: 'Initialize admin system and create admin users'
      },
      {
        title: 'System Alerts',
        href: '/admin/alerts',
        icon: AlertTriangle,
        description: 'System warnings and alerts'
      },
      {
        title: 'Database',
        href: '/admin/database',
        icon: Database,
        description: 'Database operations and backups'
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
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Settings',
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
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Overview']);

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryTitle) 
        ? prev.filter(cat => cat !== categoryTitle)
        : [...prev, categoryTitle]
    );
  };

  const isCategoryExpanded = (categoryTitle: string) => expandedCategories.includes(categoryTitle);

  return (
    <>
      {/* Mobile Menu Button - Fixed position on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 bg-background border border-border rounded-lg shadow-lg h-10 w-10 flex items-center justify-center"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile First */}
      <div className={cn(
        "bg-sidebar border-r border-sidebar-border shadow-lg transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:relative lg:z-auto",
        isMobileOpen 
          ? "fixed inset-y-0 left-0 z-50 w-80 translate-x-0" 
          : "fixed inset-y-0 left-0 z-50 w-80 -translate-x-full lg:relative lg:translate-x-0 lg:w-64"
      )}>
        <div className="h-full overflow-y-auto">
          {/* Desktop Logo and Branding - Hidden on mobile */}
          <div className="hidden lg:block p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">CaptionCraft</h1>
                <p className="text-sm text-sidebar-foreground/60">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu - Mobile First */}
          <div className="p-4 lg:p-6">
            <nav className="space-y-4">
              {adminNavCategories.map((category) => (
                <div key={category.title} className="space-y-2">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                  >
                    <span>{category.title}</span>
                    {isCategoryExpanded(category.title) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Category Items */}
                  {isCategoryExpanded(category.title) && (
                    <div className="ml-4 space-y-1">
                      {category.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive 
                                ? "bg-primary/20 text-primary border border-primary/30" 
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                            )}
                            title={item.description}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick Actions - Mobile First */}
            <div className="mt-6 pt-4 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground/60 mb-3 font-semibold">Quick Actions</div>
              <div className="space-y-2">
                <Link
                  href="/admin/system-lock"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>System Lock</span>
                </Link>
                <button 
                  onClick={() => {
                    window.location.href = '/admin/dashboard';
                    setTimeout(() => {
                      const exportSelect = document.querySelector('select[onchange*="handleExportReport"]') as HTMLSelectElement;
                      if (exportSelect) {
                        exportSelect.value = 'system-status';
                        exportSelect.dispatchEvent(new Event('change'));
                      }
                    }, 1000);
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-left"
                >
                  <span>📊 Generate Report</span>
                </button>
              </div>
            </div>

            {/* Theme Toggle - Mobile First */}
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground/60 mb-3 font-semibold">Appearance</div>
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

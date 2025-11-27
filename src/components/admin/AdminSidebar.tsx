'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  BarChart3,
  Users,
  Shield,
  MessageSquare,
  Image as ImageIcon,
  Database,
  Settings,
  Lock,
  Menu,
  X,
  Zap,
  TrendingUp,
  Archive,
  AlertTriangle,
  Sliders,
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
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
      },
      {
        title: 'Advanced',
        href: '/admin/advanced-analytics',
        icon: Zap,
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
      },
      {
        title: 'Moderation',
        href: '/admin/moderation',
        icon: MessageSquare,
      },
      {
        title: 'Images',
        href: '/admin/images',
        icon: ImageIcon,
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        title: 'Database',
        href: '/admin/database',
        icon: Database,
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: 'Lock',
        href: '/admin/system-lock',
        icon: Lock,
      }
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 bg-card border border-border rounded-xl shadow-lg text-foreground"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border transition-transform duration-300 ease-in-out flex flex-col justify-between py-6",
        "lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:translate-x-0",
        isMobileOpen
          ? "fixed inset-y-0 left-0 z-50 w-72 translate-x-0"
          : "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-6 h-6 text-primary fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Capsera</h1>
              <p className="text-xs text-muted-foreground font-medium">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
            {adminNavCategories.map((category) => (
              <div key={category.title} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-6 pt-6 border-t border-border space-y-2">
            <button
              onClick={() => {
                window.location.href = '/admin/dashboard';
                setTimeout(() => {
                  // Trigger report generation logic if needed
                }, 500);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Generate Report</span>
            </button>

            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


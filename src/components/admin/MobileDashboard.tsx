'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Bell, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Database, 
  FileText, 
  Image, 
  MessageSquare, 
  RefreshCw, 
  Settings, 
  Shield, 
  Users, 
  User, 
  UserCheck,
  UserPlus,
  UserX,
  Wrench,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  archivedProfiles: {
    total: number;
  };
  totalCaptions: number;
  recoveryRequests: number;
  systemAlerts: number;
  lastBackup: string;
  databaseStatus: string;
  imageStorageStatus: string;
  aiServicesStatus: string;
  trends: {
    totalUsers: string;
    activeUsers: string;
    archivedProfiles: string;
    totalCaptions: string;
    recoveryRequests: string;
    systemAlerts: string;
    storageUsed: string;
  };
  realTimeData: {
    onlineUsers: number;
    activeSessions: number;
    pendingActions: number;
    systemLoad: number;
  };
  recentActivity: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      joined: string;
    }>;
    posts: Array<{
      id: string;
      title: string;
      created: string;
      hasImage: boolean;
    }>;
  };
  userRoles: Array<{
    id: string;
    name: string;
    color: string;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
    userCount: number;
  }>;
}

interface MobileDashboardProps {
  stats: DashboardStats;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function MobileDashboard({ stats, onRefresh, isLoading }: MobileDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<{
    overview: boolean;
    systemStatus: boolean;
    realTimeData: boolean;
    recentActivity: boolean;
    quickActions: boolean;
    userManagement: boolean;
    systemTools: boolean;
  }>({
    overview: true,
    systemStatus: false,
    realTimeData: false,
    recentActivity: false,
    quickActions: false,
    userManagement: false,
    systemTools: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.includes('-')) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 p-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Overview Section */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <BarChart3 className="w-5 h-5" />
              Overview
            </CardTitle>
            {expandedSections.overview ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.overview && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
                <div className="text-sm text-primary">Total Users</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.totalUsers)}
                  <span className="text-xs text-muted-foreground">{stats.trends.totalUsers}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent">{stats.activeUsers}</div>
                <div className="text-sm text-accent">Active Users</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.activeUsers)}
                  <span className="text-xs text-muted-foreground">{stats.trends.activeUsers}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-secondary/10 rounded-lg">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold text-secondary">{stats.totalCaptions}</div>
                <div className="text-sm text-secondary">Total Captions</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.totalCaptions)}
                  <span className="text-xs text-muted-foreground">{stats.trends.totalCaptions}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Database className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold text-muted-foreground">{stats.trends.storageUsed}</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.storageUsed)}
                  <span className="text-xs text-muted-foreground">{stats.trends.storageUsed}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* System Status */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('systemStatus')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
            {expandedSections.systemStatus ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.systemStatus && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Database</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Authentication</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Storage</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Admin User</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* User Management */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('userManagement')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            {expandedSections.userManagement ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.userManagement && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="text-xs">Add User</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs">Verify User</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <UserX className="w-4 h-4" />
                <span className="text-xs">Suspend User</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">View All</span>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* System Tools */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('systemTools')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Wrench className="w-5 h-5" />
              System Tools
            </CardTitle>
            {expandedSections.systemTools ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.systemTools && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-xs">Backup DB</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">Clear Cache</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs">View Logs</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('recentActivity')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            {expandedSections.recentActivity ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.recentActivity && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Recent Users</h4>
              {stats.recentActivity.users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.joined}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Recent Posts</h4>
              {stats.recentActivity.posts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{post.created}</p>
                  </div>
                  {post.hasImage && (
                    <Image className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions Section */}
      <Card className="border border-border bg-card">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('quickActions')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            {expandedSections.quickActions ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.quickActions && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-xs">Database</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Security</span>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

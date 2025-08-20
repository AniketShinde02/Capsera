'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  Archive, 
  FileText, 
  Settings, 
  LogOut, 
  MessageSquare, 
  AlertTriangle, 
  Database, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Edit,
  Lock,
  Unlock,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Search,
  Mail,
  RotateCcw,
  CheckCircle,
  Info
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  archivedProfiles: { total: number };
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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real API data fetching
  const fetchRealStats = async (): Promise<DashboardStats> => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      
      if (data.success && data.stats) {
        // Transform API data to match our DashboardStats interface
        const transformedStats: DashboardStats = {
          totalUsers: data.stats.users?.total || 0,
          activeUsers: data.stats.realTimeData?.onlineUsers || 0,
          archivedProfiles: { total: data.stats.archivedProfiles?.total || 0 },
          totalCaptions: data.stats.posts?.total || 0,
          recoveryRequests: data.stats.dataRecovery?.total || 0,
          systemAlerts: 0, // This would come from a separate alerts API
          lastBackup: new Date().toISOString(), // This would come from backup system
          databaseStatus: 'Healthy',
          imageStorageStatus: 'Online',
          aiServicesStatus: 'Operational',
          trends: {
            totalUsers: data.stats.users?.growthWeek || 'N/A',
            activeUsers: '+' + Math.round((data.stats.realTimeData?.onlineUsers || 0) / (data.stats.users?.total || 1) * 100) + '%',
            archivedProfiles: 'N/A',
            totalCaptions: data.stats.posts?.growthWeek || 'N/A',
            recoveryRequests: 'N/A',
            systemAlerts: 'N/A'
          },
          realTimeData: {
            onlineUsers: data.stats.realTimeData?.onlineUsers || 0,
            activeSessions: data.stats.realTimeData?.activeSessions || 0,
            pendingActions: data.stats.realTimeData?.pendingActions || 0,
            systemLoad: data.stats.realTimeData?.systemLoad || 0
          },
          recentActivity: {
            users: data.stats.recentActivity?.users || [],
            posts: data.stats.recentActivity?.posts || []
          },
          userRoles: [] // This would come from a separate roles API
        };
        return transformedStats;
      } else {
        throw new Error('Invalid stats data structure');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data if API fails
      return {
            totalUsers: 0,
            activeUsers: 0,
            archivedProfiles: { total: 0 },
            totalCaptions: 0,
            recoveryRequests: 0,
            systemAlerts: 0,
            lastBackup: new Date().toISOString(),
        databaseStatus: 'Unknown',
        imageStorageStatus: 'Unknown',
        aiServicesStatus: 'Unknown',
            trends: {
          totalUsers: 'N/A',
          activeUsers: 'N/A',
          archivedProfiles: 'N/A',
          totalCaptions: 'N/A',
          recoveryRequests: 'N/A',
          systemAlerts: 'N/A'
            },
            realTimeData: {
              onlineUsers: 0,
              activeSessions: 0,
              pendingActions: 0,
              systemLoad: 0
            },
        recentActivity: {
          users: [],
          posts: []
        },
        userRoles: []
      };
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/setup');
      return;
    }
    
    // Load real API data
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const realStats = await fetchRealStats();
        setStats(realStats);
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      setStats(null);
    } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [session, status, router]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const realStats = await fetchRealStats();
      setStats(realStats);
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (isLoading) {
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
          </CardContent>
        </Card>
          ))}
            </div>
            </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
            </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Failed to load dashboard data</h3>
              <p className="mb-4">There was an error loading the dashboard statistics.</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
            </Button>
            </div>
          </CardContent>
        </Card>
              </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Real-time system overview and statistics</p>
              </div>
        <div className="flex items-center gap-3">
          <Button className="border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
            </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {stats.trends.totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {stats.trends.activeUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCaptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {stats.trends.totalCaptions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.realTimeData.systemLoad}%</div>
            <Progress value={stats.realTimeData.systemLoad} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Online Users</span>
              <Badge className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{stats.realTimeData.onlineUsers}</Badge>
              </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Sessions</span>
              <Badge className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{stats.realTimeData.activeSessions}</Badge>
              </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Actions</span>
              <Badge className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{stats.realTimeData.pendingActions}</Badge>
              </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Status
            </CardTitle>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <Badge className="text-foreground text-green-600 border-green-600">
                {stats.databaseStatus}
              </Badge>
                </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Image Storage</span>
              <Badge className="text-foreground text-green-600 border-green-600">
                {stats.imageStorageStatus}
              </Badge>
                        </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Services</span>
              <Badge className="text-foreground text-green-600 border-green-600">
                {stats.aiServicesStatus}
              </Badge>
          </div>
        </CardContent>
      </Card>
      </div>

        {/* Recent Activity */}
          <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recent Users
              </h4>
                <div className="space-y-3">
                {stats.recentActivity.users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    <Badge className="text-foreground text-xs">
                      {user.joined}
                    </Badge>
                    </div>
                  ))}
                {stats.recentActivity.users.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent user activity
                  </p>
                )}
                      </div>
                    </div>

            {/* Recent Posts */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recent Posts
              </h4>
                <div className="space-y-3">
                {stats.recentActivity.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      {post.hasImage ? (
                        <ImageIcon className="w-4 h-4 text-secondary-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-secondary-foreground" />
                      )}
                      </div>
                      <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{post.created}</p>
                      </div>
                    <Badge className={`text-xs ${post.hasImage ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : "text-foreground"}`}>
                      {post.hasImage ? "With Image" : "Text Only"}
                    </Badge>
                    </div>
                  ))}
                {stats.recentActivity.posts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent posts
                  </p>
                )}
        </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
              <Users className="w-5 h-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Roles & Permissions</span>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
              <Database className="w-5 h-5" />
              <span className="text-sm">Database</span>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


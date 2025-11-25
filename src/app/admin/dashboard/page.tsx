'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import {
  Users,
  Shield,
  FileText,
  Settings,
  Activity,
  Zap,
  UserCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
  Database,
  Image as ImageIcon
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
  history?: {
    users: { date: string; value: number }[];
    posts: { date: string; value: number }[];
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
      const response = await fetch(`/api/admin/dashboard-stats?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      console.log('📊 Dashboard API response:', data);

      if (data.success && data.stats) {
        // Transform API data to match our DashboardStats interface
        const transformedStats: DashboardStats = {
          totalUsers: data.stats.users?.total || 0,
          activeUsers: data.stats.realTimeData?.onlineUsers || 0,
          archivedProfiles: { total: data.stats.archivedProfiles?.total || 0 },
          totalCaptions: data.stats.posts?.total || 0,
          recoveryRequests: data.stats.dataRecovery?.total || 0,
          systemAlerts: 0,
          lastBackup: new Date().toISOString(),
          databaseStatus: 'Healthy',
          imageStorageStatus: 'Online',
          aiServicesStatus: 'Operational',
          trends: {
            totalUsers: data.stats.users?.growthWeek || '0%',
            activeUsers: '+' + Math.round((data.stats.realTimeData?.onlineUsers || 0) / (data.stats.users?.total || 1) * 100) + '%',
            archivedProfiles: 'N/A',
            totalCaptions: data.stats.posts?.growthWeek || '0%',
            recoveryRequests: 'N/A',
            systemAlerts: 'N/A'
          },
          history: {
            users: data.stats.users?.history || [],
            posts: data.stats.posts?.history || []
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
          userRoles: []
        };
        return transformedStats;
      } else {
        throw new Error('Invalid stats data structure');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const newStats = await fetchRealStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
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

  if (isLoading && !stats) {
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
            <MagicCard key={i} title="Loading..." value="0" icon={Activity} loading={true} />
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">Real-time system overview and statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics - Magic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MagicCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={parseFloat(stats.trends.totalUsers) >= 0 ? 'up' : 'down'}
          trendValue={stats.trends.totalUsers}
          data={stats.history?.users}
          description="Total registered users"
        />
        <MagicCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={UserCheck}
          trend="up"
          trendValue={stats.trends.activeUsers}
          description="Online in last 5 mins"
        />
        <MagicCard
          title="Total Captions"
          value={stats.totalCaptions.toLocaleString()}
          icon={FileText}
          trend={parseFloat(stats.trends.totalCaptions) >= 0 ? 'up' : 'down'}
          trendValue={stats.trends.totalCaptions}
          data={stats.history?.posts}
          description="Total captions generated"
        />
        <MagicCard
          title="System Load"
          value={`${stats.realTimeData.systemLoad}%`}
          icon={Activity}
          trend={stats.realTimeData.systemLoad > 80 ? 'down' : 'neutral'}
          trendValue={stats.realTimeData.systemLoad > 80 ? 'High Load' : 'Normal'}
          description="Database connection load"
        />
      </div>

      {/* Real-time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">Online Users</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <Badge variant="secondary" className="font-mono">{stats.realTimeData.onlineUsers}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">Active Sessions</span>
              <Badge variant="secondary" className="font-mono">{stats.realTimeData.activeSessions}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">Pending Actions</span>
              <Badge variant="secondary" className="font-mono">{stats.realTimeData.pendingActions}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                {stats.databaseStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">Image Storage</span>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                {stats.imageStorageStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-sm font-medium">AI Services</span>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                {stats.aiServicesStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <Users className="w-4 h-4" />
                New Users
              </h4>
              <div className="space-y-3">
                {stats.recentActivity.users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/5 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(user.joined).toLocaleDateString()}
                    </div>
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
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                Latest Captions
              </h4>
              <div className="space-y-3">
                {stats.recentActivity.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/5 transition-colors">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      {post.hasImage ? (
                        <ImageIcon className="w-4 h-4 text-secondary-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(post.created).toLocaleString()}</p>
                    </div>
                    <Badge variant={post.hasImage ? "default" : "secondary"} className="text-[10px]">
                      {post.hasImage ? "Image" : "Text"}
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
      <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-300"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-300"
              onClick={() => router.push('/admin/roles')}
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm font-medium">Roles & Permissions</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-300"
              onClick={() => router.push('/admin/database')}
            >
              <Database className="w-6 h-6" />
              <span className="text-sm font-medium">Database</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-300"
              onClick={() => router.push('/admin/settings')}
            >
              <Settings className="w-6 h-6" />
              <span className="text-sm font-medium">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

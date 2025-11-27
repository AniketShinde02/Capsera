'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Users,
  ArrowUpRight,
  MoreHorizontal,
  Filter,
  Download,
  Plus,
  RefreshCw,
  AlertTriangle,
  Activity,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCaptions: number;
  trends: {
    totalUsers: string;
    activeUsers: string;
    totalCaptions: string;
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
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealStats = async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`/api/admin/dashboard-stats?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();

      if (data.success && data.stats) {
        return {
          totalUsers: data.stats.users?.total || 0,
          activeUsers: data.stats.realTimeData?.onlineUsers || 0,
          totalCaptions: data.stats.posts?.total || 0,
          trends: {
            totalUsers: data.stats.users?.growthWeek || '0%',
            activeUsers: '+' + Math.round((data.stats.realTimeData?.onlineUsers || 0) / (data.stats.users?.total || 1) * 100) + '%',
            totalCaptions: data.stats.posts?.growthWeek || '0%',
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
          }
        };
      }
      throw new Error('Invalid data structure');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const newStats = await fetchRealStats();
      setStats(newStats);
    } catch (error) {
      console.error(error);
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
    handleRefresh();
  }, [session, status, router]);

  if (status === 'loading' || (isLoading && !stats)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-foreground">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Failed to load data</h3>
        <Button onClick={handleRefresh} variant="outline" className="text-background bg-foreground hover:bg-foreground/90">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  // Prepare chart data
  const revenueData = stats.history?.posts.map(p => ({
    name: new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    value: p.value
  })) || [];

  const categoryData = [
    { name: 'Text', value: 65, color: '#3b82f6' },
    { name: 'Image', value: 35, color: '#f97316' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 lg:p-8">

      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            Hello, {session?.user?.name || 'Admin'}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your platform today.</p>
        </div>
        <Button onClick={handleRefresh} variant="ghost" className="text-muted-foreground hover:text-foreground">
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Total Revenue (Captions) Card */}
        <div className="bg-primary text-primary-foreground p-6 rounded-[2rem] relative overflow-hidden group shadow-lg shadow-primary/20">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-primary-foreground/80">Total Captions</span>
            <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white -mr-2 -mt-2 group-hover:scale-110 transition-transform backdrop-blur-sm">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold">{stats.totalCaptions.toLocaleString()}</h2>
            <Badge className="bg-white/20 text-white hover:bg-white/30 mb-1 border-none backdrop-blur-sm">{stats.trends.totalCaptions}</Badge>
          </div>
          <p className="text-sm text-primary-foreground/80">All time generated</p>
        </div>

        {/* Active Users Card */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-muted/50 transition-colors border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">Active Users</span>
            <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">{stats.activeUsers}</h2>
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 mb-1 border-none">{stats.trends.activeUsers}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Online right now</p>
        </div>

        {/* Total Users Card */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-muted/50 transition-colors border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">Total Users</span>
            <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</h2>
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 mb-1 border-none">{stats.trends.totalUsers}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Registered accounts</p>
        </div>

        {/* System Load Card */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-muted/50 transition-colors border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">System Load</span>
            <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <Activity className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">{stats.realTimeData.systemLoad}%</h2>
            <Badge className={cn(
              "mb-1 border-none",
              stats.realTimeData.systemLoad > 80 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
            )}>
              {stats.realTimeData.systemLoad > 80 ? 'High' : 'Normal'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Server performance</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Generation Activity</h3>
              <p className="text-sm text-muted-foreground">Captions generated over time</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card p-6 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Content Type</h3>
              <p className="text-sm text-muted-foreground">Text vs Image captions</p>
            </div>
          </div>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-foreground">Total</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-card rounded-[2rem] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-foreground">Recent Captions</h3>
          <div className="flex gap-2">
            <Button variant="outline" className="border-none bg-muted text-foreground hover:bg-muted/80 rounded-xl">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" className="border-none bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Title</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-right py-4 px-4 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.posts.map((post) => (
                <tr key={post.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 text-foreground font-medium text-sm">#{post.id.substring(0, 6)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{post.title}</td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                      {post.hasImage ? 'Image' : 'Text'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{new Date(post.created).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {stats.recentActivity.posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No recent activity found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

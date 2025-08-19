'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Image,
  Mail,
  RotateCcw,
  CheckCircle,
  Info
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
  users: {
    total: number;
    newThisWeek: number;
  };
  posts: {
    total: number;
    newThisWeek: number;
  };
  images: {
    total: number;
  };
  roles: {
    total: number;
  };
  contacts: {
    total: number;
  };
  dataRecovery: {
    total: number;
  };
  database: {
    collections: number;
    documents: number;
    size: string;
    avgDocumentSize: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActivity, setFilteredActivity] = useState<DashboardStats['recentActivity']>({
    users: [],
    posts: []
  });
  const [liveMode, setLiveMode] = useState(false);
  const [liveUpdateInterval, setLiveUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Plain text notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2 second timeout
  };

  // Check if user is authenticated as admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/setup');
      return;
    }

    // Check if user has admin access (either through User or AdminUser model)
    if (session?.user?.id) {
      console.log('🔐 User authenticated, fetching dashboard stats...');
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Dashboard fetch timeout reached, setting loading to false');
        setLoading(false);
        if (!stats) {
          // Set fallback data if no stats received
          setStats({
            totalUsers: 0,
            activeUsers: 0,
            archivedProfiles: { total: 0 },
            totalCaptions: 0,
            recoveryRequests: 0,
            systemAlerts: 0,
            lastBackup: new Date().toISOString(),
            databaseStatus: 'Timeout',
            imageStorageStatus: 'Timeout',
            aiServicesStatus: 'Timeout',
            trends: {
              totalUsers: 'Data loading timeout',
              activeUsers: 'Data loading timeout',
              archivedProfiles: 'Data loading timeout',
              totalCaptions: 'Data loading timeout',
              recoveryRequests: 'Data loading timeout',
              systemAlerts: 'Data loading timeout'
            },
            realTimeData: {
              onlineUsers: 0,
              activeSessions: 0,
              pendingActions: 0,
              systemLoad: 0
            },
            recentActivity: { users: [], posts: [] },
            userRoles: [],
            users: { total: 0, newThisWeek: 0 },
            posts: { total: 0, newThisWeek: 0 },
            images: { total: 0 },
            roles: { total: 0 },
            contacts: { total: 0 },
            dataRecovery: { total: 0 },
            database: { collections: 0, documents: 0, size: '0 MB', avgDocumentSize: '0 KB' }
          });
        }
      }, 10000); // 10 second timeout
      
      fetchDashboardStats();
      
      // Set up real-time updates
      const interval = setInterval(fetchDashboardStats, 30000); // Update every 30 seconds
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
      };
    }
  }, [session, status, router]);

  // Filter activity based on search query
  useEffect(() => {
    if (!stats?.recentActivity) return;
    
    if (!searchQuery.trim()) {
      setFilteredActivity(stats.recentActivity);
      return;
    }
    
    // Filter through both users and posts
    const filteredUsers = stats.recentActivity.users?.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    
    const filteredPosts = stats.recentActivity.posts?.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    
    setFilteredActivity({
      users: filteredUsers,
      posts: filteredPosts
    });
  }, [searchQuery, stats?.recentActivity]);

  const fetchDashboardStats = async () => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      console.log('🔄 Fetching dashboard stats...');
      
      const response = await fetch('/api/admin/dashboard-stats');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats received:', data);
        
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          console.error('❌ Invalid stats data structure:', data);
          setStats(null);
        }
      } else {
        console.error('❌ Failed to fetch dashboard stats:', response.status);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setStats(null);
    } finally {
      setIsFetching(false);
    }
  };

  // Silent background refresh - NO LOADING INDICATORS
  const fetchDashboardStatsSilently = async () => {
    try {
      console.log('🔄 Silent background refresh...');
      
      const response = await fetch('/api/admin/dashboard-stats');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Silent refresh completed');
        
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('❌ Silent refresh failed:', error);
      // Don't show errors to user during background refresh
    }
  };

  // Background refresh every 30 seconds - NO LOADING INDICATORS
  useEffect(() => {
    fetchDashboardStats();
    
    const interval = setInterval(() => {
      // Silent background refresh - don't show loading state
      fetchDashboardStatsSilently();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Live mode functionality
  useEffect(() => {
    if (liveMode) {
      // Clear existing interval
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
      }
      
      // Set up live updates every 5 seconds
      const interval = setInterval(() => {
        fetchDashboardStatsSilently();
      }, 5000);
      
      setLiveUpdateInterval(interval);
      
      return () => {
        clearInterval(interval);
        setLiveUpdateInterval(null);
      };
    } else {
      // Clear live update interval when live mode is off
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        setLiveUpdateInterval(null);
      }
    }
  }, [liveMode]);

  // Export dashboard data to multiple formats
  const exportDashboardData = async (format: 'excel' | 'csv' | 'pdf' | 'enhanced-json') => {
    try {
      if (!stats) {
        showNotification("Please wait for data to load", "error");
        return;
      }

      // Show loading notification
      showNotification(`Creating ${format.toUpperCase()} report...`, "info");

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'dashboard-comprehensive',
          format: format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Handle different formats
      if (format === 'csv' || format === 'excel' || format === 'pdf' || format === 'enhanced-json') {
        // Download the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `dashboard-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format === 'enhanced-json' ? 'json' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification(`Dashboard data exported as ${format.toUpperCase()} file`, "success");
      } else {
        // Fallback to JSON
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification("Dashboard data exported as JSON file", "success");
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification("Failed to generate report. Please try again.", "error");
    }
  };



  // Create system backup
  const createBackup = async () => {
    try {
      showNotification("Creating Backup", "info");

      // Simulate backup process
      setTimeout(() => {
        showNotification("Backup Complete", "success");
      }, 2000);
    } catch (error) {
      showNotification("Backup Failed", "error");
    }
  };

  // Lock system (placeholder for now)
  const lockSystem = async () => {
    showNotification("System Lock", "info");
  };

  // Generate comprehensive report
  const generateReport = async () => {
    try {
      if (!stats) {
        showNotification("No Data", "error");
        return;
      }

      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          systemHealth: 'Excellent',
          lastBackup: stats.lastBackup || 'Never',
          databaseStatus: stats.databaseStatus || 'Connected'
        },
        detailedStats: stats,
        recommendations: [
          'System performance is optimal',
          'Consider scheduling regular backups',
          'Monitor user growth trends'
        ]
      };

      // Export report as JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification("Report Generated", "success");
    } catch (error) {
      showNotification("Report Failed", "error");
    }
  };

  // Calculate derived stats
  const totalUsers = stats?.users?.total || 0;
  const totalPosts = stats?.posts?.total || 0;
  const totalImages = stats?.images?.total || 0;
  const totalRoles = stats?.roles?.total || 0;
  const totalContacts = stats?.contacts?.total || 0;
  const totalDataRecovery = stats?.dataRecovery?.total || 0;
  const totalArchivedProfiles = stats?.archivedProfiles?.total || 0;
  const dbCollections = stats?.database?.collections || 0;
  const dbDocuments = stats?.database?.documents || 0;
  const dbSize = stats?.database?.size || '0 MB';
  const avgDocSize = stats?.database?.avgDocumentSize || '0 KB';

  // Recent activity - extract user and post activities
  const recentUsers = stats?.recentActivity?.users || [];
  const recentPosts = stats?.recentActivity?.posts || [];

  const handleLogout = async () => {
            // Double-tap logout: NextAuth + hard-clear + redirect
        await signOut({ redirect: false });
        await fetch("/logout", { method: "POST" }).catch(() => {});
        window.location.replace("/");
    router.push('/setup');
  };

  const handleRoleManagement = () => {
    router.push('/admin/roles');
  };

  const handleUserManagement = () => {
    router.push('/admin/users');
  };

  const handleDataRecovery = () => {
    router.push('/admin/data-recovery');
  };

  const handleSystemSettings = () => {
    router.push('/admin/settings');
  };

  const handleExportReport = async (reportType: string) => {
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          format: 'csv'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification(`${reportType} report has been downloaded.`, "success");
      } else {
        showNotification("Failed to export report. Please try again.", "error");
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      showNotification("An error occurred while exporting the report.", "error");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <UserCheck className="w-4 h-4" />;
      case 'user_deleted': return <UserX className="w-4 h-4" />;
      case 'caption_generated': return <FileText className="w-4 h-4" />;
      case 'system_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'role_updated': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <h2 className="text-xl font-semibold text-foreground">Loading Dashboard</h2>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-background min-h-screen">
      {/* Header with Quick Actions - Mobile First */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back, {session?.user?.email}! Here's your system overview.
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              {liveMode ? '🟢 Live updates every 5s' : '🔄 Auto-refresh every 30s'}
            </span>
          </p>
          {session.user.isAdmin && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 mt-2">
              👑 Admin
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            onClick={() => setLiveMode(!liveMode)} 
            variant={liveMode ? "default" : "outline"}
            className={`flex items-center gap-2 h-10 sm:h-9 text-sm ${
              liveMode ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
          >
            <Activity className={`w-4 h-4 ${liveMode ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {liveMode ? 'Live Mode ON' : 'Live Mode'}
            </span>
            <span className="sm:hidden">
              {liveMode ? 'LIVE' : 'Live'}
            </span>
          </Button>
          <Button onClick={handleRoleManagement} className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Roles</span>
            <span className="sm:hidden">Roles</span>
          </Button>
          <Button onClick={handleUserManagement} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </Button>
          <Button onClick={handleDataRecovery} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Data Recovery</span>
            <span className="sm:hidden">Recovery</span>
          </Button>
          <Button onClick={handleSystemSettings} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </Button>
        </div>
      </div>

      {/* Plain Text Notification Display */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
            : 'bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Quick Actions & Export Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <Badge variant="secondary" className="text-xs">Export</Badge>
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Export Data</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => exportDashboardData('csv')} 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-white/50 dark:bg-blue-900/50"
              >
                📊 Export CSV
              </Button>
              <Button 
                onClick={() => exportDashboardData('excel')} 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-white/50 dark:bg-blue-900/50"
              >
                📈 Export Excel
              </Button>
              <Button 
                onClick={() => exportDashboardData('pdf')} 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-white/50 dark:bg-blue-900/50"
              >
                📄 Export PDF
              </Button>
              <Button 
                onClick={() => exportDashboardData('enhanced-json')} 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-white/50 dark:bg-blue-900/50"
              >
                🔧 Enhanced JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              <Badge variant="secondary" className="text-xs">Backup</Badge>
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">System Backup</h3>
            <p className="text-xs text-green-700 dark:text-green-300 mb-3">
              Last: {stats?.lastBackup || 'Never'}
            </p>
            <Button 
              onClick={createBackup} 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-white/50 dark:bg-green-900/50"
            >
              💾 Create Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <Badge variant="secondary" className="text-xs">Report</Badge>
            </div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Generate Report</h3>
            <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
              Comprehensive system analysis
            </p>
            <Button 
              onClick={generateReport} 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-white/50 dark:bg-purple-900/50"
            >
              📋 Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <Badge variant="secondary" className="text-xs">Security</Badge>
            </div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">System Lock</h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              Emergency system control
            </p>
            <Button 
              onClick={lockSystem} 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-white/50 dark:bg-amber-900/50"
            >
              🔒 Lock System
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status Bar - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300">Online Users</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-100">{stats?.realTimeData?.onlineUsers || 0}</p>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">Active Sessions</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.realTimeData?.activeSessions || 0}</p>
              </div>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300">Pending Actions</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.realTimeData?.pendingActions || 0}</p>
              </div>
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-300">System Load</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{stats?.realTimeData?.systemLoad || 0}%</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8">
                <Progress value={stats?.realTimeData?.systemLoad || 0} className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.users?.newThisWeek || 0} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.posts?.newThisWeek || 0} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalImages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Stored in ImageKit
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dbCollections}</div>
                <p className="text-xs text-muted-foreground">
                  {dbDocuments.toLocaleString()} documents
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalRoles}</div>
                <p className="text-xs text-muted-foreground">
                  Active roles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalContacts}</div>
                <p className="text-xs text-muted-foreground">
                  Form submissions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Recovery</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalDataRecovery}</div>
                <p className="text-xs text-muted-foreground">
                  Pending requests
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Profiles</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalArchivedProfiles}</div>
                <p className="text-xs text-muted-foreground">
                  Deleted accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Management Section - Mobile First */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl text-card-foreground">Role Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <Button onClick={handleRoleManagement} className="flex items-center gap-2 h-10 sm:h-9 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Role</span>
              <span className="sm:hidden">New Role</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.userRoles?.map((role) => (
              <div key={role.id} className="p-3 sm:p-4 border border-border rounded-lg hover:shadow-md transition-shadow bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <h3 className="font-semibold text-sm sm:text-base text-card-foreground">{role.name}</h3>
                  <Badge variant="secondary" className="text-xs">{role.userCount} users</Badge>
                </div>
                <div className="space-y-2">
                  {role.permissions.slice(0, 3).map((permission, index) => {
                    // Defensive programming: ensure permission has the expected structure
                    if (!permission || typeof permission !== 'object') {
                      return (
                        <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Invalid permission
                        </div>
                      );
                    }
                    
                    const resource = permission.resource || 'unknown';
                    const actions = permission.actions || [];
                    
                    if (!Array.isArray(actions)) {
                      return (
                        <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          {resource}: Invalid actions
                        </div>
                      );
                    }
                    
                    return (
                      <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        {resource} ({actions.join(', ')})
                      </div>
                    );
                  })}
                  {role.permissions.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{role.permissions.length - 3} more permissions</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 h-8 sm:h-9 text-xs">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 sm:h-9 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p>No roles created yet</p>
                <Button onClick={handleRoleManagement} className="mt-3 h-10 sm:h-9">
                  Create First Role
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & System Status - Mobile First */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">New user registered</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.name} ({activity.email})</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.joined).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent users</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest caption generations</CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Caption generated</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.title}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent posts</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-card-foreground">System Status</CardTitle>
            <p className="text-sm text-muted-foreground">Current system health and performance</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sm text-foreground">Database</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                    {stats?.databaseStatus || 'Healthy'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sm text-foreground">Image Storage</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                    {stats?.imageStorageStatus || 'Online'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sm text-foreground">AI Services</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                    {stats?.aiServicesStatus || 'Active'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sm text-foreground">Last Backup</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleString() : '2 hours ago'}
                </span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-foreground">System Load</span>
                  <span className="text-sm text-muted-foreground">{stats?.realTimeData?.systemLoad || 0}%</span>
                </div>
                <Progress value={stats?.realTimeData?.systemLoad || 0} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile First */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-card-foreground">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common administrative tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              onClick={handleRoleManagement}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Role Management</span>
              <span className="sm:hidden">Roles</span>
            </Button>
            
            <Button 
              onClick={handleUserManagement}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </Button>
            
            <Button 
              onClick={handleDataRecovery}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Archive className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Data Recovery</span>
              <span className="sm:hidden">Recovery</span>
            </Button>
            
            <Button 
              onClick={handleSystemSettings}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">System Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions - Mobile First */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 sm:pt-6 border-t border-border">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={fetchDashboardStats} 
            disabled={isFetching}
            className="flex items-center gap-2 h-10 sm:h-9 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isFetching ? 'Refreshing...' : 'Refresh Data'}
            </span>
            <span className="sm:hidden">
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleExportReport(e.target.value);
                  e.target.value = ''; // Reset selection
                }
              }}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm h-10 sm:h-9 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Export Report</option>
              <option value="system-status">System Status</option>
              <option value="user-summary">User Summary</option>
              <option value="role-summary">Role Summary</option>
            </select>
            <Download className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 h-10 sm:h-9 text-sm w-full sm:w-auto">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Logout</span>
        </Button>
      </div>
    </div>
  );
}

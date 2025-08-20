'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  Archive, 
  FileText, 
  Settings, 
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
  Info,
  ChevronDown,
  ChevronRight,
  Globe,
  User,
  Cog,
  LogOut
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
  }>({
    overview: true,
    systemStatus: false,
    realTimeData: false,
    recentActivity: false,
    quickActions: false,
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
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.includes('-')) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-4 p-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
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
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-blue-600">Total Users</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.totalUsers)}
                  <span className="text-xs">{stats.trends.totalUsers}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <div className="text-sm text-green-600">Active Users</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.activeUsers)}
                  <span className="text-xs">{stats.trends.activeUsers}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.totalCaptions}</div>
                <div className="text-sm text-purple-600">Total Captions</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.totalCaptions)}
                  <span className="text-xs">{stats.trends.totalCaptions}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{stats.recoveryRequests}</div>
                <div className="text-sm text-orange-600">Recovery Requests</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(stats.trends.recoveryRequests)}
                  <span className="text-xs">{stats.trends.recoveryRequests}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* System Status Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('systemStatus')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stats.databaseStatus)}`}></div>
                  <span className="text-sm">{stats.databaseStatus}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Image Storage</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stats.imageStorageStatus)}`}></div>
                  <span className="text-sm">{stats.imageStorageStatus}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Services</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stats.aiServicesStatus)}`}></div>
                  <span className="text-sm">{stats.aiServicesStatus}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>System Load</span>
                <span>{stats.realTimeData.systemLoad}%</span>
              </div>
              <Progress value={stats.realTimeData.systemLoad} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Real-time Data Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('realTimeData')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Data
            </CardTitle>
            {expandedSections.realTimeData ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.realTimeData && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold text-green-600">{stats.realTimeData.onlineUsers}</div>
                <div className="text-xs text-green-600">Online</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{stats.realTimeData.activeSessions}</div>
                <div className="text-xs text-blue-600">Active Sessions</div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Bell className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <div className="text-lg font-bold text-yellow-600">{stats.realTimeData.pendingActions}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Zap className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">{stats.realTimeData.systemLoad}%</div>
                <div className="text-xs text-purple-600">Load</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Activity Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('recentActivity')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
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
              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Recent Users</h4>
              {stats.recentActivity.users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{user.joined}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Recent Posts</h4>
              {stats.recentActivity.posts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 truncate">{post.created}</p>
                  </div>
                  {post.hasImage && (
                    <Image className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('quickActions')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
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

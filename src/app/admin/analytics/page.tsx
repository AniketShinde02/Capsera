'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, TrendingUp, TrendingDown, Activity, Clock, BarChart3, 
  Download, RefreshCw, Smartphone, Monitor,
  Globe, Target, MapPin, AlertTriangle, Lightbulb, ArrowUpRight,
  Minus, Play, Pause, Eye, MousePointer, Zap, CheckCircle, Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCaptions: number;
    totalImages: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    userGrowth: number;
    captionGrowth: number;
    imageGrowth: number;
  };
  userBehavior: {
    timeSpent: {
      average: number;
      byDevice: { mobile: number; desktop: number; tablet: number };
      byMood: { [key: string]: number };
    };
    popularMoods: Array<{ mood: string; count: number; percentage: number }>;
    deviceUsage: Array<{ device: string; count: number; percentage: number }>;
    topCaptions: Array<{ caption: string; count: number; engagement: number }>;
    userJourney: Array<{ step: string; users: number; conversion: number }>;
  };
  traffic: {
    sources: Array<{ source: string; users: number; percentage: number }>;
    regions: Array<{ region: string; users: number; percentage: number }>;
  };
  performance: {
    aiResponseTime: number;
    imageProcessingTime: number;
    systemUptime: number;
    errorRate: number;
  };
  insights: {
    trends: Array<{ trend: string; description: string; impact: string; confidence: number }>;
    recommendations: Array<{ action: string; description: string; priority: string; expectedImpact: string }>;
    alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; timestamp: string }>;
  };
  realTimeActivity?: {
    recentPosts: Array<{
      caption: string;
      hasImage: boolean;
      user: string;
      createdAt: string;
    }>;
    recentUsers: Array<{
      username: string;
      joined: string;
    }>;
    chartData?: Array<{
      date: string;
      users: number;
      posts: number;
      images: number;
    }>;
    realDeviceUsage?: Array<{
      device: string;
      count: number;
      percentage: number;
    }>;
    realTrafficSources?: Array<{
      source: string;
      users: number;
      percentage: number;
    }>;
    realRegions?: Array<{
      region: string;
      users: number;
      percentage: number;
    }>;
  };
}

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('7d');
  const [realTimeMode, setRealTimeMode] = useState(true);

  // Plain text notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2 second timeout
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/setup');
      return;
    }

    if (session?.user?.id) {
      fetchAnalyticsData();
      
      if (realTimeMode) {
        const interval = setInterval(fetchAnalyticsData, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [session, status, router, realTimeMode, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      console.log('📊 Fetching analytics data...');
      
      const response = await fetch(`/api/admin/analytics?timeRange=${selectedTimeRange}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAnalyticsData(result.data);
          console.log('✅ Analytics data received:', result.data);
        } else {
          console.error('❌ Invalid analytics data structure:', result);
          setAnalyticsData(null);
        }
      } else {
        console.error('❌ Failed to fetch analytics data:', response.status);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      showNotification("Failed to fetch analytics data. Please try again.", "error");
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'xlsx' | 'enhanced-json') => {
    try {
      if (!analyticsData) {
        showNotification("Please wait for analytics data to load", "info");
        return;
      }

      showNotification(`Creating ${format.toUpperCase()} report...`, "info");

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'analytics-comprehensive',
          format: format === 'xlsx' ? 'excel' : format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `analytics-export-${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format === 'enhanced-json' ? 'json' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification(`Analytics data exported as ${format.toUpperCase()} file`, "success");
    } catch (error) {
      console.error('Export error:', error);
      showNotification("Failed to generate report. Please try again.", "error");
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading Analytics</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Advanced insights into user behavior, performance metrics, and growth trends
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              {realTimeMode ? '🟢 Live updates every 30s' : '⏸️ Updates paused'}
            </span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            onClick={() => setRealTimeMode(!realTimeMode)}
            variant={realTimeMode ? "default" : "outline"}
            className="flex items-center gap-2 h-10 sm:h-9 text-sm"
          >
            {realTimeMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {realTimeMode ? 'Live Mode' : 'Paused'}
            </span>
          </Button>
          
          <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
            <SelectTrigger className="w-32 h-10 sm:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAnalyticsData} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Select onValueChange={(value: any) => handleExport(value)}>
            <SelectTrigger className="w-32 h-10 sm:h-9">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">XLSX</SelectItem>
              <SelectItem value="enhanced-json">Enhanced JSON</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Users</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {analyticsData?.overview.totalUsers.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getGrowthIcon(analyticsData?.overview.userGrowth || 0)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData?.overview.userGrowth || 0)}`}>
                    {analyticsData?.overview.userGrowth || 0}%
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">vs last period</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Active Users</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {analyticsData?.overview.activeUsers.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {analyticsData?.overview.activeUsers && analyticsData?.overview.totalUsers 
                      ? Math.round((analyticsData.overview.activeUsers / analyticsData.overview.totalUsers) * 100)
                      : 0}% of total
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {analyticsData?.overview.conversionRate || 0}%
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Caption generation
                  </span>
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Avg Session</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {analyticsData?.overview.avgSessionDuration || 0}m
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Time spent
                  </span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {/* User Growth Chart */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="w-5 h-5" />
                   User Growth Trends
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Real-time user growth over {selectedTimeRange}
                 </p>
               </CardHeader>
               <CardContent>
                 {analyticsData?.realTimeActivity?.chartData && analyticsData.realTimeActivity.chartData.length > 0 ? (
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={analyticsData.realTimeActivity.chartData}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis 
                           dataKey="date" 
                           tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                         />
                         <YAxis />
                         <Tooltip 
                           labelFormatter={(value) => new Date(value).toLocaleDateString()}
                           formatter={(value, name) => [value, name === 'users' ? 'Users' : name === 'posts' ? 'Posts' : 'Images']}
                         />
                         <Legend />
                         <Line 
                           type="monotone" 
                           dataKey="users" 
                           stroke="#3b82f6" 
                           strokeWidth={2}
                           dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                           activeDot={{ r: 6 }}
                         />
                         <Line 
                           type="monotone" 
                           dataKey="posts" 
                           stroke="#10b981" 
                           strokeWidth={2}
                           dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                           activeDot={{ r: 6 }}
                         />
                         <Line 
                           type="monotone" 
                           dataKey="images" 
                           stroke="#f59e0b" 
                           strokeWidth={2}
                           dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                           activeDot={{ r: 6 }}
                         />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 ) : (
                   <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                     <div className="text-center text-muted-foreground">
                       <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                       <p>Loading chart data...</p>
                       <p className="text-sm">User growth over {selectedTimeRange}</p>
                       <p className="text-xs">Growth: {analyticsData?.overview.userGrowth || 0}%</p>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

            {/* Popular Moods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Popular Moods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.userBehavior.popularMoods.slice(0, 5).map((mood, index) => (
                    <div key={mood.mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                        }}></div>
                        <span className="font-medium">{mood.mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{mood.count}</span>
                        <span className="text-xs text-muted-foreground">({mood.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                User Journey Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {analyticsData?.userBehavior.userJourney.map((step, index) => (
                  <div key={step.step} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{step.step}</p>
                    <p className="text-2xl font-bold text-primary">{step.users}</p>
                    <p className="text-xs text-muted-foreground">{step.conversion}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {/* Device Usage */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Smartphone className="w-5 h-5" />
                   Device Usage
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Real-time device distribution from user data
                 </p>
               </CardHeader>
               <CardContent>
                 {analyticsData?.realTimeActivity?.realDeviceUsage && analyticsData.realTimeActivity.realDeviceUsage.length > 0 ? (
                   <div className="space-y-4">
                     <div className="h-48">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={analyticsData.realTimeActivity.realDeviceUsage}
                             cx="50%"
                             cy="50%"
                             labelLine={false}
                             label={({ device, percentage }) => `${device}: ${percentage}%`}
                             outerRadius={80}
                             fill="#8884d8"
                             dataKey="count"
                           >
                             {analyticsData.realTimeActivity.realDeviceUsage.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                             ))}
                           </Pie>
                           <Tooltip formatter={(value, name) => [value, 'Users']} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                     <div className="space-y-2">
                       {analyticsData.realTimeActivity.realDeviceUsage.map((device) => (
                         <div key={device.device} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             {device.device.toLowerCase().includes('mobile') && <Smartphone className="w-4 h-4" />}
                             {device.device.toLowerCase().includes('desktop') && <Monitor className="w-4 h-4" />}
                             {device.device.toLowerCase().includes('tablet') && <Smartphone className="w-4 h-4" />}
                             <span className="font-medium">{device.device}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">{device.count}</span>
                             <span className="text-xs text-muted-foreground">({device.percentage}%)</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                       <div className="text-center text-muted-foreground">
                         <Smartphone className="w-8 h-8 mx-auto mb-2" />
                         <p>No device data available</p>
                       </div>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

            {/* Time Spent by Mood */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Spent by Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData?.userBehavior.timeSpent.byMood || {}).map(([mood, time]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <span className="font-medium">{mood}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{time}m</span>
                        <Progress value={(time / 6.3) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Captions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Performing Captions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.userBehavior.topCaptions.map((caption, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <p className="font-medium">{caption.caption}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{caption.count}</p>
                        <p className="text-xs text-muted-foreground">Uses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{caption.engagement}%</p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {/* Traffic Sources */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Globe className="w-5 h-5" />
                   Traffic Sources
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Real-time traffic source distribution
                 </p>
               </CardHeader>
               <CardContent>
                 {analyticsData?.realTimeActivity?.realTrafficSources && analyticsData.realTimeActivity.realTrafficSources.length > 0 ? (
                   <div className="space-y-4">
                     <div className="h-48">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={analyticsData.realTimeActivity.realTrafficSources}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="source" />
                           <YAxis />
                           <Tooltip formatter={(value, name) => [value, 'Users']} />
                           <Bar dataKey="users" fill="#3b82f6" />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                     <div className="space-y-3">
                       {analyticsData.realTimeActivity.realTrafficSources.map((source) => (
                         <div key={source.source} className="flex items-center justify-between">
                           <span className="font-medium">{source.source}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">{source.users}</span>
                             <span className="text-xs text-muted-foreground">({source.percentage}%)</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                       <div className="text-center text-muted-foreground">
                         <Globe className="w-8 h-8 mx-auto mb-2" />
                         <p>No traffic data available</p>
                       </div>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

                         {/* Regional Distribution */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <MapPin className="w-5 h-5" />
                   Regional Distribution
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Real-time user distribution by region
                 </p>
               </CardHeader>
               <CardContent>
                 {analyticsData?.realTimeActivity?.realRegions && analyticsData.realTimeActivity.realRegions.length > 0 ? (
                   <div className="space-y-4">
                     <div className="h-48">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={analyticsData.realTimeActivity.realRegions}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="region" />
                           <YAxis />
                           <Tooltip formatter={(value, name) => [value, 'Users']} />
                           <Bar dataKey="users" fill="#10b981" />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                     <div className="space-y-3">
                       {analyticsData.realTimeActivity.realRegions.map((region) => (
                         <div key={region.region} className="flex items-center justify-between">
                           <span className="font-medium">{region.region}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">{region.users}</span>
                             <span className="text-xs text-muted-foreground">({region.percentage}%)</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                       <div className="text-center text-muted-foreground">
                         <MapPin className="w-8 h-8 mx-auto mb-2" />
                         <p>No regional data available</p>
                       </div>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.performance.aiResponseTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Image Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.performance.imageProcessingTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.performance.systemUptime || 0}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.performance.errorRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI-Generated Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI-Detected Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.insights.trends.map((trend, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{trend.trend}</h4>
                        <Badge variant={trend.impact === 'High' ? 'destructive' : 'default'}>
                          {trend.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Progress value={trend.confidence} className="w-20" />
                        <span className="text-xs font-medium">{trend.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Actionable Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.insights.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{rec.action}</h4>
                        <Badge variant={rec.priority === 'High' ? 'destructive' : 'default'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <p className="text-xs text-primary font-medium">Expected Impact: {rec.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {analyticsData?.insights.alerts && analyticsData.insights.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.insights.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alert.type}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Real-Time Activity Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live User Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Live User Activities
                  {realTimeMode && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time activities from the last hour
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyticsData?.realTimeActivity?.recentPosts && analyticsData.realTimeActivity.recentPosts.length > 0 ? (
                    analyticsData.realTimeActivity.recentPosts.map((post, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              New Caption Generated
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {post.caption}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {post.hasImage ? '📷 With Image' : '📝 Text Only'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              User: {post.user}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activities</p>
                      <p className="text-xs">Activities will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent User Registrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent User Registrations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  New users who joined recently
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyticsData?.realTimeActivity?.recentUsers && analyticsData.realTimeActivity.recentUsers.length > 0 ? (
                    analyticsData.realTimeActivity.recentUsers.map((user, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {user.username}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Joined {new Date(user.joined).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(user.joined).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent registrations</p>
                      <p className="text-xs">New users will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Live Activity Feed
                {realTimeMode && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time system events and user interactions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Update Frequency:</span>
                  <span className="font-medium">
                    {realTimeMode ? 'Every 30 seconds' : 'Manual refresh only'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="font-medium">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Activities Today:</span>
                  <span className="font-medium">
                    {analyticsData?.realTimeActivity?.recentPosts?.length || 0} captions, {analyticsData?.realTimeActivity?.recentUsers?.length || 0} users
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Status Bar */}
      {realTimeMode && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Updates</span>
            <span className="text-xs text-muted-foreground">Every 30s</span>
          </div>
        </div>
      )}
    </div>
  );
}

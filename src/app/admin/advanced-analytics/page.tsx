'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  PieChart,
  Activity,
  Users,
  Zap,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCaptions: number;
  avgResponseTime: number;
  errorRate: number;
  queueLength: number;
  databaseConnections: number;
  uptime: number;
}

interface TimeSeriesData {
  date: string;
  users: number;
  captions: number;
  responseTime: number;
  errors: number;
}

export default function AdvancedAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for now - would be replaced with real API calls
  useEffect(() => {
    setAnalyticsData({
      totalUsers: 1247,
      activeUsers: 89,
      totalCaptions: 5678,
      avgResponseTime: 234,
      errorRate: 2.1,
      queueLength: 12,
      databaseConnections: 8,
      uptime: 99.97
    });

    // Generate mock time series data for the last 7 days
    const mockTimeSeries = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockTimeSeries.push({
        date: date.toLocaleDateString(),
        users: Math.floor(Math.random() * 50) + 20,
        captions: Math.floor(Math.random() * 200) + 100,
        responseTime: Math.floor(Math.random() * 100) + 150,
        errors: Math.floor(Math.random() * 10) + 1
      });
    }
    setTimeSeriesData(mockTimeSeries);
    setLoading(false);
  }, []);

  const getStatusColor = (value: number, threshold: number, type: 'lower' | 'higher' = 'lower') => {
    if (type === 'lower') {
      return value <= threshold ? 'text-green-600' : 'text-red-600';
    } else {
      return value >= threshold ? 'text-green-600' : 'text-red-600';
    }
  };

  const getStatusBadge = (value: number, threshold: number, type: 'lower' | 'higher' = 'lower') => {
    if (type === 'lower') {
      return value <= threshold ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
    } else {
      return value >= threshold ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (value: number, threshold: number, type: 'lower' | 'higher' = 'lower') => {
    if (type === 'lower') {
      return value <= threshold ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
    } else {
      return value >= threshold ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analyticsData.activeUsers} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Captions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCaptions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Generated this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(analyticsData.avgResponseTime, 500)}`}>
                {analyticsData.avgResponseTime}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Target: &lt;500ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUptime(analyticsData.uptime)}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">API Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(analyticsData.avgResponseTime, 500)}>
                        {getStatusIcon(analyticsData.avgResponseTime, 500)}
                        {analyticsData.avgResponseTime}ms
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(analyticsData.errorRate, 5, 'lower')}>
                        {getStatusIcon(analyticsData.errorRate, 5, 'lower')}
                        {analyticsData.errorRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Queue Length</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(analyticsData.queueLength, 50, 'lower')}>
                        {getStatusIcon(analyticsData.queueLength, 50, 'lower')}
                        {analyticsData.queueLength}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">DB Connections</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(analyticsData.databaseConnections, 5, 'higher')}>
                        {getStatusIcon(analyticsData.databaseConnections, 5, 'higher')}
                        {analyticsData.databaseConnections}/10
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">User Engagement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <Badge variant="outline">
                      {analyticsData.activeUsers} today
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Caption Rate</span>
                    <Badge variant="outline">
                      {Math.round(analyticsData.totalCaptions / analyticsData.totalUsers)} per user
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Series Charts */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="captions">Caption Generation</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSeriesData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{data.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Active Users: {data.users}
                      </span>
                      <div className="w-32 bg-background rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(data.users / 70) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Caption Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSeriesData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{data.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Captions: {data.captions}
                      </span>
                      <div className="w-32 bg-background rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(data.captions / 300) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSeriesData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{data.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Response: {data.responseTime}ms
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Errors: {data.errors}
                      </span>
                      <div className="w-32 bg-background rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${data.responseTime <= 300 ? 'bg-green-500' : data.responseTime <= 500 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((data.responseTime / 500) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData && analyticsData.avgResponseTime > 300 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Response Time Optimization</h4>
                  <p className="text-sm text-yellow-700">
                    Average response time is {analyticsData.avgResponseTime}ms. Consider implementing caching or optimizing database queries.
                  </p>
                </div>
              </div>
            )}

            {analyticsData && analyticsData.errorRate > 2 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Error Rate Alert</h4>
                  <p className="text-sm text-red-700">
                    Error rate is {analyticsData.errorRate}%. Investigate recent errors and implement better error handling.
                  </p>
                </div>
              </div>
            )}

            {analyticsData && analyticsData.queueLength > 20 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Queue Management</h4>
                  <p className="text-sm text-blue-700">
                    Queue length is {analyticsData.queueLength}. Consider scaling up processing capacity or optimizing caption generation.
                  </p>
                </div>
              </div>
            )}

            {analyticsData && analyticsData.errorRate <= 2 && analyticsData.avgResponseTime <= 300 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">System Health Excellent</h4>
                  <p className="text-sm text-green-700">
                    All performance metrics are within optimal ranges. System is running smoothly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

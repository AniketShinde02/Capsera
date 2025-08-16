'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Gauge, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SystemHealth {
  status: string;
  healthScore: number;
  uptime: number;
  environment: string;
  version: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  lastUpdated: string;
}

interface DatabaseStats {
  connectionUtilization: number;
  avgQueryTime: number;
  totalQueries: number;
  slowQueries: number;
  status: string;
}

interface QueueStatus {
  queueLength: number;
  processingCount: number;
  avgWaitTime: number;
  status: string;
}

export default function PerformanceMonitorPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health-check');
      const data = await response.json();
      
      if (response.ok) {
        setSystemHealth({
          status: data.status,
          healthScore: data.healthScore,
          uptime: data.uptime,
          environment: data.environment,
          version: data.version
        });
        
        if (data.performance) {
          setPerformanceMetrics(data.performance);
        }
        
        if (data.database) {
          setDatabaseStats(data.database);
        }
        
        if (data.queue) {
          setQueueStatus(data.queue);
        }
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button onClick={fetchHealthData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{systemHealth.healthScore}%</div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <Badge className={`mt-2 ${getStatusColor(systemHealth.status)}`}>
                  {getStatusIcon(systemHealth.status)}
                  {systemHealth.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{formatUptime(systemHealth.uptime)}</div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{systemHealth.environment}</div>
                <p className="text-sm text-muted-foreground">Environment</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">v{systemHealth.version}</div>
                <p className="text-sm text-muted-foreground">Version</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Performance</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics.avgResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    Error Rate: {performanceMetrics.errorRate}%
                  </div>
                </CardContent>
              </Card>
            )}

            {databaseStats && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{databaseStats.connectionUtilization}%</div>
                  <p className="text-xs text-muted-foreground">Connection Utilization</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    Avg Query: {databaseStats.avgQueryTime}ms
                  </div>
                </CardContent>
              </Card>
            )}

            {queueStatus && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Caption Queue</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{queueStatus.queueLength}</div>
                  <p className="text-xs text-muted-foreground">Items in Queue</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    Processing: {queueStatus.processingCount}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>API Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Response Time</span>
                    <Badge variant="outline">{performanceMetrics.avgResponseTime}ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <Badge variant={performanceMetrics.errorRate > 5 ? "destructive" : "outline"}>
                      {performanceMetrics.errorRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Requests (24h)</span>
                    <Badge variant="outline">{performanceMetrics.totalRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Updated</span>
                    <Badge variant="outline">
                      {new Date(performanceMetrics.lastUpdated).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          {databaseStats && (
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Connection Utilization</span>
                    <Badge 
                      variant={databaseStats.connectionUtilization > 80 ? "destructive" : "outline"}
                    >
                      {databaseStats.connectionUtilization}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Query Time</span>
                    <Badge 
                      variant={databaseStats.avgQueryTime > 1000 ? "destructive" : "outline"}
                    >
                      {databaseStats.avgQueryTime}ms
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Queries</span>
                    <Badge variant="outline">{databaseStats.totalQueries}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Slow Queries</span>
                    <Badge 
                      variant={databaseStats.slowQueries > 0 ? "destructive" : "outline"}
                    >
                      {databaseStats.slowQueries}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <Badge className={getStatusColor(databaseStats.status)}>
                      {getStatusIcon(databaseStats.status)}
                      {databaseStats.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {queueStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Caption Generation Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Queue Length</span>
                    <Badge 
                      variant={queueStatus.queueLength > 50 ? "destructive" : "outline"}
                    >
                      {queueStatus.queueLength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Currently Processing</span>
                    <Badge variant="outline">{queueStatus.processingCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Wait Time</span>
                    <Badge 
                      variant={queueStatus.avgWaitTime > 10000 ? "destructive" : "outline"}
                    >
                      {Math.round(queueStatus.avgWaitTime / 1000)}s
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <Badge className={getStatusColor(queueStatus.status)}>
                      {getStatusIcon(queueStatus.status)}
                      {queueStatus.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

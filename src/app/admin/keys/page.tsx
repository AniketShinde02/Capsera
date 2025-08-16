'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Activity, 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

interface KeyStatus {
  totalKeys: number;
  activeKeys: number;
  dailyRequests: number;
  dailyLimit: number;
  currentKeyIndex: number;
  keys: Array<{
    index: number;
    isActive: boolean;
    requestCount: number;
    lastUsed: number;
    timeSinceLastUse: number;
  }>;
}

interface UsageStats {
  totalRequests: number;
  dailyRequests: number;
  dailyLimit: number;
  remainingDaily: number;
  activeKeys: number;
  totalKeys: number;
  efficiency: string;
}

interface RateLimitInfo {
  totalIPs: number;
  activeLimits: Array<{
    ip: string;
    count: number;
    resetTime: number;
    remainingTime: number;
  }>;
}

export default function AdminKeysPage() {
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/keys');
      const data = await response.json();
      
      if (data.success) {
        setKeyStatus(data.data.keys);
        setUsageStats(data.data.usage);
        setRateLimitInfo(data.data.rateLimits);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string, keyIndex?: number) => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, keyIndex })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh status after action
        await fetchStatus();
      } else {
        setError(data.message || 'Action failed');
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatTimeAgo = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading && !keyStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading key status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gemini API Key Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your API keys for optimal quota usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyStatus?.totalKeys || 0}</div>
            <p className="text-xs text-muted-foreground">
              {keyStatus?.activeKeys || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.dailyRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {usageStats?.remainingDaily || 0} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Efficiency: {usageStats?.efficiency || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limited IPs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimitInfo?.totalIPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently limited
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Status & Management</CardTitle>
              <CardDescription>
                Monitor individual key performance and manage their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyStatus?.keys.map((key) => (
                  <div key={key.index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {key.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">Key {key.index}</span>
                      </div>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Requests: {key.requestCount}</span>
                      <span>Last used: {formatTime(key.lastUsed)}</span>
                      <span>Time ago: {formatTimeAgo(key.timeSinceLastUse)}</span>
                    </div>

                    <div className="flex space-x-2">
                      {key.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => performAction('deactivate', key.index - 1)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => performAction('reactivate_all')}
                        >
                          Reactivate All
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-2">
                <Button onClick={() => performAction('reactivate_all')} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reactivate All Keys
                </Button>
                <Button onClick={() => performAction('reset_rate_limits')} variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset All Rate Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Track API usage patterns and efficiency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats && (
                <div className="space-y-6">
                  {/* Daily Usage Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Usage Progress</span>
                      <span>{usageStats.dailyRequests} / {usageStats.dailyLimit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((usageStats.dailyRequests / usageStats.dailyLimit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {usageStats.remainingDaily} requests remaining today
                    </p>
                  </div>

                  {/* Key Efficiency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {usageStats.efficiency}
                      </div>
                      <p className="text-sm text-muted-foreground">Requests per Key</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {usageStats.activeKeys}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Keys</p>
                    </div>
                  </div>

                  {/* Usage Tips */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pro Tips:</strong> 
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Keys automatically rotate every 4 seconds to avoid rate limits</li>
                        <li>• Daily limit resets at midnight UTC</li>
                        <li>• Deactivate problematic keys to improve overall efficiency</li>
                        <li>• Monitor usage to plan for paid tier upgrade</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Monitoring</CardTitle>
              <CardDescription>
                Track IP addresses that are currently rate limited
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rateLimitInfo && rateLimitInfo.activeLimits.length > 0 ? (
                <div className="space-y-4">
                  {rateLimitInfo.activeLimits.map((limit, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{limit.ip}</p>
                          <p className="text-sm text-muted-foreground">
                            {limit.count} requests in current window
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Resets in {limit.remainingTime}s
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(limit.resetTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No IP addresses are currently rate limited</p>
                  <p className="text-sm">All users are within their request limits</p>
                </div>
              )}

              <div className="mt-6">
                <Button onClick={() => performAction('reset_rate_limits')} variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset All Rate Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

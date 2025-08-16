'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'performance' | 'user' | 'database';
  isActive: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  autoResolve: boolean;
  autoResolveTime?: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export default function SystemAlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '0 hours',
    responseTime: 0,
    activeUsers: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showResolved, setShowResolved] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'info' as const,
    title: '',
    message: '',
    severity: 'medium' as const,
    category: 'system' as const,
    autoResolve: false
  });
  const [alertSettings, setAlertSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    autoAcknowledge: false,
    retentionDays: 30,
    criticalThreshold: 90,
    warningThreshold: 75
  });

  // Fetch REAL data from database
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/alerts');
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        setSystemHealth(data.systemHealth || systemHealth);
      } else {
        console.error('Failed to fetch alerts:', response.status);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
        setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role?.name === 'admin') {
      fetchAlerts();
    }
  }, [session, status]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system health randomly
      setSystemHealth(prev => ({
        ...prev,
        responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50),
        activeUsers: Math.max(50, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(60, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 8))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' ||
                         alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    const matchesStatus = showResolved ? true : alert.isActive;
    
    return matchesSearch && matchesType && matchesSeverity && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system alerts...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role?.name !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const handleCreateAlert = () => {
    if (!newAlert.title || !newAlert.message) return;

    const alert: SystemAlert = {
      id: Date.now().toString(),
      ...newAlert,
      timestamp: new Date().toISOString(),
      isActive: true,
      isAcknowledged: false,
      autoResolveTime: newAlert.autoResolve ? 
        new Date(Date.now() + 1000 * 60 * 60).toISOString() : undefined
    };

    setAlerts([alert, ...alerts]);
    setNewAlert({
      type: 'info',
      title: '',
      message: '',
      severity: 'medium',
      category: 'system',
      autoResolve: false
    });
    setIsCreateDialogOpen(false);
    
    // Refresh data to show updated alerts
    setTimeout(() => fetchAlerts(), 500);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? {
        ...alert,
        isAcknowledged: true,
        acknowledgedBy: session?.user?.email || 'admin',
        acknowledgedAt: new Date().toISOString()
      } : alert
    ));
    
    // Refresh data to show updated alerts
    setTimeout(() => fetchAlerts(), 500);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: false } : alert
    ));
    
    // Refresh data to show updated alerts
    setTimeout(() => fetchAlerts(), 500);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    
    // Refresh data to show updated alerts
    setTimeout(() => fetchAlerts(), 500);
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getHealthStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Alerts</h1>
          <p className="text-muted-foreground">
            Monitor system health and manage alerts • {alerts.length} total alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setLoading(true);
              fetchAlerts();
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className={`text-xl font-bold ${getHealthStatusColor(systemHealth.status)}`}>
                  {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                </div>
                <p className="text-xs text-muted-foreground">Uptime: {systemHealth.uptime}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold text-foreground break-words">
                  {systemHealth.responseTime < 1000 ? (
                    `${systemHealth.responseTime}ms`
                  ) : (
                    `${(systemHealth.responseTime / 1000).toFixed(1)}s`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Average</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold text-foreground">{systemHealth.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold text-foreground">
                  {systemHealth.memoryUsage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemHealth.memoryUsage > 85 ? 'High usage' : 'Normal'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold text-foreground">
                  {systemHealth.cpuUsage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemHealth.cpuUsage > 80 ? 'High load' : 'Normal'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-resolved"
                checked={showResolved}
                onCheckedChange={setShowResolved}
              />
              <label htmlFor="show-resolved" className="text-sm">Show Resolved</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
          <CardDescription>System alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts found matching the current filters.
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.isActive ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                          {alert.isActive ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.acknowledgedBy && (
                            <span>Acknowledged by: {alert.acknowledgedBy}</span>
                          )}
                          {alert.autoResolve && alert.autoResolveTime && (
                            <span>Auto-resolve: {new Date(alert.autoResolveTime).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.isActive && !alert.isAcknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Alert Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>Create a new system alert or notification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert({...newAlert, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                placeholder="Alert title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                placeholder="Alert message"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={newAlert.severity} onValueChange={(value: any) => setNewAlert({...newAlert, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newAlert.category} onValueChange={(value: any) => setNewAlert({...newAlert, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-resolve"
                checked={newAlert.autoResolve}
                onCheckedChange={(checked) => setNewAlert({...newAlert, autoResolve: checked})}
              />
              <label htmlFor="auto-resolve" className="text-sm">Auto-resolve in 1 hour</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlert}>Create Alert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alert Settings</DialogTitle>
            <DialogDescription>Configure alert system preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <Switch
                checked={alertSettings.emailNotifications}
                onCheckedChange={(checked) => setAlertSettings({...alertSettings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Slack Notifications</label>
              <Switch
                checked={alertSettings.slackNotifications}
                onCheckedChange={(checked) => setAlertSettings({...alertSettings, slackNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto-acknowledge</label>
              <Switch
                checked={alertSettings.autoAcknowledge}
                onCheckedChange={(checked) => setAlertSettings({...alertSettings, autoAcknowledge: checked})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Retention Days</label>
              <Input
                type="number"
                value={alertSettings.retentionDays}
                onChange={(e) => setAlertSettings({...alertSettings, retentionDays: parseInt(e.target.value)})}
                min="1"
                max="365"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Critical Threshold (%)</label>
                <Input
                  type="number"
                  value={alertSettings.criticalThreshold}
                  onChange={(e) => setAlertSettings({...alertSettings, criticalThreshold: parseInt(e.target.value)})}
                  min="80"
                  max="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Warning Threshold (%)</label>
                <Input
                  type="number"
                  value={alertSettings.warningThreshold}
                  onChange={(e) => setAlertSettings({...alertSettings, warningThreshold: parseInt(e.target.value)})}
                  min="60"
                  max="90"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSettingsDialogOpen(false)}>Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

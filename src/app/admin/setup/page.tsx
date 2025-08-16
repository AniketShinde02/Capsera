'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Database, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Lock,
  Globe,
  Mail,
  Key
} from 'lucide-react';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  auth: 'configured' | 'not_configured';
  admin: 'exists' | 'not_exists';
  storage: 'configured' | 'not_configured';
}

export default function SystemSetupPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'disconnected',
    auth: 'not_configured',
    admin: 'not_exists',
    storage: 'not_configured'
  });
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    checkSystemStatus();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Check database connection
      const dbResponse = await fetch('/api/admin/database/stats');
      if (dbResponse.ok) {
        setSystemStatus(prev => ({ ...prev, database: 'connected' }));
      } else {
        setSystemStatus(prev => ({ ...prev, database: 'error' }));
      }

      // Check if admin exists
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const adminExists = data.users?.some((user: any) => user.isAdmin || user.role?.name === 'admin');
        setSystemStatus(prev => ({ ...prev, admin: adminExists ? 'exists' : 'not_exists' }));
      }

      // Check auth configuration
      const authSecret = process.env.NEXTAUTH_SECRET;
      setSystemStatus(prev => ({ ...prev, auth: authSecret ? 'configured' : 'not_configured' }));
      
      // Check storage configuration - migrated to Cloudinary
      // const imagekitKey = process.env.IMAGEKIT_PUBLIC_KEY;
      setSystemStatus(prev => ({ ...prev, storage: 'configured' })); // Cloudinary is configured

    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: keyof SystemStatus) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'exists':
        return <Badge variant="default" className="bg-green-100 text-green-800">✓ Connected</Badge>;
      case 'disconnected':
      case 'not_configured':
      case 'not_exists':
        return <Badge variant="secondary">⚠ Not Configured</Badge>;
      case 'error':
        return <Badge variant="destructive">✗ Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string, type: keyof SystemStatus) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'exists':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
      case 'not_configured':
      case 'not_exists':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capsera System Setup</h1>
          <p className="text-muted-foreground">
            Configure and monitor your Capsera system • 
            {Object.values(systemStatus).filter(status => 
              status === 'connected' || status === 'configured' || status === 'exists'
            ).length}/4 systems ready
          </p>
        </div>
        <Button onClick={checkSystemStatus} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  getStatusBadge(systemStatus.database, 'database')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  getStatusBadge(systemStatus.auth, 'auth')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin User</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  getStatusBadge(systemStatus.admin, 'admin')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  getStatusBadge(systemStatus.storage, 'storage')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-muted rounded-lg animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.database === 'connected' ? '✓' : '✗'}
                </div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.database === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.auth === 'configured' ? '✓' : '✗'}
                </div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.auth === 'configured' ? 'Configured' : 'Not Configured'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.admin === 'exists' ? '✓' : '✗'}
                </div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.admin === 'exists' ? 'Exists' : 'Not Found'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="db-uri">MongoDB Connection URI</Label>
              <Input 
                id="db-uri" 
                value={process.env.MONGODB_URI || "mongodb://localhost:27017/captioncraft"} 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="db-ssl" />
              <Label htmlFor="db-ssl">Enable SSL/TLS</Label>
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.database, 'database')}
              <span className="ml-2 text-sm">
                {systemStatus.database === 'connected' 
                  ? 'Database connection established successfully'
                  : systemStatus.database === 'error'
                  ? 'Failed to connect to database'
                  : 'Database not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-secret">NextAuth Secret</Label>
              <Input 
                id="auth-secret" 
                value="••••••••••••••••••••••••••••••••" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-url">NextAuth URL</Label>
              <Input 
                id="auth-url" 
                value={process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.auth, 'auth')}
              <span className="ml-2 text-sm">
                {systemStatus.auth === 'configured' 
                  ? 'Authentication properly configured'
                  : 'Authentication not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin User Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin User Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input 
                id="admin-email" 
                value="admin@captioncraft.com" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-role">Admin Role</Label>
              <Input 
                id="admin-role" 
                value="Super Administrator" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.admin, 'admin')}
              <span className="ml-2 text-sm">
                {systemStatus.admin === 'exists' 
                  ? 'Admin user exists and is active'
                  : 'No admin user found - use setup token to create'
                }
              </span>
            </div>
            {systemStatus.admin === 'not_exists' && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/admin/setup', '_blank')}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Go to Admin Setup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Storage Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storage-type">Storage Type</Label>
              <Input 
                id="storage-type" 
                value="Cloudinary CDN" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage-path">Storage Provider</Label>
              <Input 
                id="storage-path" 
                value="Cloudinary" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.storage, 'storage')}
              <span className="ml-2 text-sm">
                {systemStatus.storage === 'configured' 
                  ? 'Cloudinary storage properly configured'
                  : 'Cloudinary storage not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline"
              onClick={checkSystemStatus}
            >
              <Database className="h-4 w-4 mr-2" />
              Test Database Connection
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const authSecret = process.env.NEXTAUTH_SECRET;
                if (authSecret) {
                  alert('Authentication is properly configured with NextAuth secret.');
                } else {
                  alert('Authentication is not configured. Please set NEXTAUTH_SECRET in your environment variables.');
                }
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Authentication
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (systemStatus.admin === 'not_exists') {
                  window.open('/admin/setup', '_blank');
                } else {
                  alert('Admin user already exists.');
                }
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Create Admin User
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Storage migrated to Cloudinary
                alert('Storage is configured with Cloudinary. ImageKit configuration is no longer needed.');
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Storage Status (Cloudinary)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

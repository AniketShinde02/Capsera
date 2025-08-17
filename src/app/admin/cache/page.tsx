'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Search, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  Hash, 
  Users,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface CacheStats {
  totalEntries: number;
  totalUsage: number;
  averageUsage: number;
  oldestEntry: Date;
  newestEntry: Date;
  quotaSaved: number;
}

interface CacheEntry {
  _id: string;
  imageHash: string;
  prompt: string;
  mood: string;
  captions: string[];
  userId?: string;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}

export default function CacheManagementPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [hitRate, setHitRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<CacheEntry[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    userId: '',
    mood: '',
    prompt: '',
    minUsage: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch cache statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cache');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setHitRate(data.hitRate);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch cache statistics' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching cache statistics' });
    } finally {
      setLoading(false);
    }
  };

  // Search cache entries
  const searchCache = async () => {
    try {
      setSearchLoading(true);
      const params = { ...searchCriteria };
      
      // Clean up empty values
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === '') {
          delete params[key as keyof typeof params];
        }
      });

      if (params.minUsage) {
        (params as any).minUsage = parseInt(params.minUsage);
      }

      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', ...params })
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        setMessage({ type: 'success', text: `Found ${data.count} cache entries` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Search failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching cache' });
    } finally {
      setSearchLoading(false);
    }
  };

  // Clean old cache entries
  const cleanOldCache = async (daysOld: number = 30) => {
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean', daysOld })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchStats(); // Refresh stats
      } else {
        setMessage({ type: 'error', text: data.error || 'Cleanup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cleaning cache' });
    }
  };

  // Delete specific cache entry
  const deleteCacheEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cache entry?')) return;

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        searchCache(); // Refresh search results
        fetchStats(); // Refresh stats
      } else {
        setMessage({ type: 'error', text: data.error || 'Deletion failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting cache entry' });
    }
  };

  // Clear all cache (dangerous operation)
  const clearAllCache = async () => {
    const confirmText = prompt(
      'This will delete ALL cache entries. Type "YES_DELETE_ALL_CACHE" to confirm:'
    );
    
    if (confirmText !== 'YES_DELETE_ALL_CACHE') {
      setMessage({ type: 'error', text: 'Operation cancelled' });
      return;
    }

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: confirmText })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSearchResults([]);
        fetchStats(); // Refresh stats
      } else {
        setMessage({ type: 'error', text: data.error || 'Clear failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error clearing cache' });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHash = (hash: string) => {
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cache Management</h1>
        <p className="text-muted-foreground">
          Manage the caption cache system to optimize API usage and improve performance
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search & Manage</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Cached caption sets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsage || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Times cache was accessed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hitRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Cache effectiveness
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls Saved</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.quotaSaved || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Estimated savings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
              <CardDescription>
                Detailed information about cache performance and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Average Usage per Entry</Label>
                  <p className="text-2xl font-bold">{stats?.averageUsage || 0}</p>
                </div>
                <div>
                  <Label>Oldest Entry</Label>
                  <p className="text-sm">{stats?.oldestEntry ? formatDate(stats.oldestEntry) : 'N/A'}</p>
                </div>
                <div>
                  <Label>Newest Entry</Label>
                  <p className="text-sm">{stats?.newestEntry ? formatDate(stats.newestEntry) : 'N/A'}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm">{stats ? formatDate(new Date()) : 'N/A'}</p>
                </div>
              </div>
              
              <Button onClick={fetchStats} disabled={loading} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Statistics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Manage Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Cache Entries</CardTitle>
              <CardDescription>
                Find and manage specific cache entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Filter by user ID"
                    value={searchCriteria.userId}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mood">Mood</Label>
                  <Input
                    id="mood"
                    placeholder="Filter by mood"
                    value={searchCriteria.mood}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, mood: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Input
                    id="prompt"
                    placeholder="Filter by prompt text"
                    value={searchCriteria.prompt}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, prompt: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="minUsage">Min Usage Count</Label>
                  <Input
                    id="minUsage"
                    type="number"
                    placeholder="Minimum usage count"
                    value={searchCriteria.minUsage}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, minUsage: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button onClick={searchCache} disabled={searchLoading} className="w-full">
                <Search className={`h-4 w-4 mr-2 ${searchLoading ? 'animate-spin' : ''}`} />
                Search Cache
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((entry) => (
                    <div key={entry._id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{entry.mood}</Badge>
                          <Badge variant="outline">Used {entry.usageCount} times</Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCacheEntry(entry._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>Image Hash:</strong> {formatHash(entry.imageHash)}</p>
                        <p><strong>Prompt:</strong> {entry.prompt}</p>
                        <p><strong>Captions:</strong> {entry.captions.length} generated</p>
                        <p><strong>User:</strong> {entry.userId || 'Anonymous'}</p>
                        <p><strong>Created:</strong> {formatDate(entry.createdAt)}</p>
                        <p><strong>Last Used:</strong> {formatDate(entry.lastUsed)}</p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p><strong>Sample Caption:</strong> {entry.captions[0]?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cache Management Actions</CardTitle>
              <CardDescription>
                Perform maintenance operations on the cache system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Clean Old Cache Entries</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Remove cache entries older than specified days (only removes low-usage entries)
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => cleanOldCache(7)} variant="outline">
                      Clean 7+ days old
                    </Button>
                    <Button onClick={() => cleanOldCache(30)} variant="outline">
                      Clean 30+ days old
                    </Button>
                    <Button onClick={() => cleanOldCache(90)} variant="outline">
                      Clean 90+ days old
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-red-600">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    These actions are irreversible and will affect all cache data
                  </p>
                  <Button onClick={clearAllCache} variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Clear All Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

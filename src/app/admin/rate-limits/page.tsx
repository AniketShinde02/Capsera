'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Search,
  User
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface RateLimitConfig {
  ANONYMOUS: {
    MAX_GENERATIONS: number;
    WINDOW_HOURS: number;
    USER_TYPE: string;
  };
  REGISTERED: {
    MAX_GENERATIONS: number;
    WINDOW_HOURS: number;
    USER_TYPE: string;
  };
  PRO: {
    MAX_GENERATIONS: number;
    WINDOW_HOURS: number;
    USER_TYPE: string;
  };
}

export default function AdminRateLimitsPage() {
  const { toast } = useToast();
  const [rateLimits, setRateLimits] = useState<RateLimitConfig | null>(null);
  const [anonymousLimit, setAnonymousLimit] = useState<number>(10);
  const [registeredLimit, setRegisteredLimit] = useState<number>(20);
  const [proLimit, setProLimit] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userLookupLoading, setUserLookupLoading] = useState(false);
  const [userRateLimitData, setUserRateLimitData] = useState<any>(null);
  const [resetUserLoading, setResetUserLoading] = useState(false);

  const fetchRateLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rate-limits');
      const data = await response.json();

      if (data.success) {
        setRateLimits(data.data.rateLimits);
        setAnonymousLimit(data.data.rateLimits.ANONYMOUS.MAX_GENERATIONS);
        setRegisteredLimit(data.data.rateLimits.REGISTERED.MAX_GENERATIONS);

        // Set Pro limit if available
        if (data.data.rateLimits.PRO && data.data.rateLimits.PRO.MAX_GENERATIONS) {
          setProLimit(data.data.rateLimits.PRO.MAX_GENERATIONS);
        }

        // Set last updated time from API response if available
        if (data.data.lastUpdated) {
          setLastUpdated(new Date(data.data.lastUpdated));
        } else {
          setLastUpdated(new Date());
        }

        setError(null);
      } else {
        setError(data.message || 'Failed to fetch rate limits');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rate limits');
    } finally {
      setLoading(false);
    }
  };

  const updateRateLimits = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymous: {
            MAX_GENERATIONS: anonymousLimit
          },
          registered: {
            MAX_GENERATIONS: registeredLimit
          },
          pro: {
            MAX_GENERATIONS: proLimit
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setRateLimits(data.data.rateLimits);
        toast({
          variant: "default",
          title: "Success",
          description: 'Rate limits updated successfully'
        });
      } else {
        setError(data.message || 'Failed to update rate limits');
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || 'Failed to update rate limits'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update rate limits');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to update rate limits'
      });
    } finally {
      setSaving(false);
    }
  };

  const lookupUserRateLimit = async () => {
    if (!userEmail || userEmail.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setUserLookupLoading(true);
    setUserRateLimitData(null);

    try {
      const response = await fetch(`/api/admin/rate-limits/user?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to lookup user rate limit");
      }

      const data = await response.json();
      setUserRateLimitData(data);
    } catch (error) {
      console.error("Error looking up user rate limit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to lookup user rate limit",
      });
    } finally {
      setUserLookupLoading(false);
    }
  };

  const resetUserRateLimit = async () => {
    if (!userEmail || userEmail.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setResetUserLoading(true);

    try {
      const response = await fetch("/api/admin/rate-limits/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset user rate limit");
      }

      const data = await response.json();
      toast({
        title: "User rate limit reset",
        description: `Successfully reset rate limits for ${userEmail}`,
      });

      // Refresh the user rate limit data
      lookupUserRateLimit();
    } catch (error) {
      console.error("Error resetting user rate limit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset user rate limit",
      });
    } finally {
      setResetUserLoading(false);
    }
  };

  useEffect(() => {
    fetchRateLimits();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rate Limit Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRateLimits}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="global">Global Rate Limits</TabsTrigger>
          <TabsTrigger value="user">User Rate Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Current Rate Limits
                </CardTitle>
                <CardDescription>
                  View the current rate limit configuration for different user tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-6 bg-muted rounded animate-pulse" />
                  </div>
                ) : rateLimits ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserX className="w-5 h-5 text-muted-foreground" />
                        <span>Anonymous Users</span>
                      </div>
                      <Badge variant="outline">
                        {rateLimits.ANONYMOUS.MAX_GENERATIONS} images/day
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span>Registered Users</span>
                      </div>
                      <Badge variant="outline">
                        {rateLimits.REGISTERED.MAX_GENERATIONS} images/day
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-muted-foreground" />
                        <span>Pro Users</span>
                      </div>
                      <Badge variant="outline">
                        {rateLimits.PRO && rateLimits.PRO.MAX_GENERATIONS ? `${rateLimits.PRO.MAX_GENERATIONS} images/day` : 'Unlimited'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p>No rate limit data available</p>
                )}
              </CardContent>
            </Card>

            {/* Update Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Update Rate Limits
                </CardTitle>
                <CardDescription>
                  Modify the daily image generation limits for different user tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anonymous-limit">Anonymous Users (images/day)</Label>
                    <Input
                      id="anonymous-limit"
                      type="number"
                      min="1"
                      max="100"
                      value={anonymousLimit}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) setAnonymousLimit(value);
                      }}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registered-limit">Registered Users (images/day)</Label>
                    <Input
                      id="registered-limit"
                      type="number"
                      min="1"
                      max="100"
                      value={registeredLimit}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) setRegisteredLimit(value);
                      }}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro-limit">Pro Users (images/day)</Label>
                    <Input
                      id="pro-limit"
                      type="number"
                      min="1"
                      max="1000"
                      value={proLimit}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) setProLimit(value);
                      }}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={updateRateLimits}
                      disabled={loading || saving}
                      className="w-full"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reset Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Reset Rate Limits
                </CardTitle>
                <CardDescription>
                  Reset rate limits for users who have reached their daily limit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reset Options</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to reset rate limits for anonymous users?')) {
                            fetch('/api/admin/rate-limits/reset', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userType: 'anonymous' })
                            })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  toast({
                                    variant: "default",
                                    title: "Success",
                                    description: `Reset ${data.data.resetCount} anonymous user rate limits`
                                  });
                                  fetchRateLimits();
                                } else {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: data.message || 'Failed to reset rate limits'
                                  });
                                }
                              })
                              .catch(err => toast({
                                variant: "destructive",
                                title: "Error",
                                description: err.message || 'Failed to reset rate limits'
                              }));
                          }
                        }}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Reset Anonymous Users
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to reset rate limits for registered users?')) {
                            fetch('/api/admin/rate-limits/reset', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userType: 'registered' })
                            })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  toast({
                                    variant: "default",
                                    title: "Success",
                                    description: `Reset ${data.data.resetCount} registered user rate limits`
                                  });
                                  fetchRateLimits();
                                } else {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: data.message || 'Failed to reset rate limits'
                                  });
                                }
                              })
                              .catch(err => toast({
                                variant: "destructive",
                                title: "Error",
                                description: err.message || 'Failed to reset rate limits'
                              }));
                          }
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Reset Registered Users
                      </Button>

                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          if (confirm('Are you sure you want to reset ALL rate limits? This will affect all users.')) {
                            fetch('/api/admin/rate-limits/reset', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ all: true })
                            })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  toast({
                                    variant: "default",
                                    title: "Success",
                                    description: `Reset ${data.data.resetCount} rate limits for all users`
                                  });
                                  fetchRateLimits();
                                } else {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: data.message || 'Failed to reset rate limits'
                                  });
                                }
                              })
                              .catch(err => toast({
                                variant: "destructive",
                                title: "Error",
                                description: err.message || 'Failed to reset rate limits'
                              }));
                          }
                        }}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Reset ALL Rate Limits
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Rate Limit Lookup
                </CardTitle>
                <CardDescription>
                  Look up rate limit information for a specific user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="user-email">User Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="user@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={userLookupLoading}
                      />
                    </div>
                    <Button
                      onClick={lookupUserRateLimit}
                      disabled={userLookupLoading || !userEmail}
                    >
                      {userLookupLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-2">Lookup</span>
                    </Button>
                  </div>

                  {userRateLimitData && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">User Information</h3>
                        <div className="bg-muted p-3 rounded-md mt-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Email:</div>
                            <div>{userRateLimitData.user?.email || "N/A"}</div>
                            <div className="font-medium">User Type:</div>
                            <div className="capitalize">{userRateLimitData.user?.type || "N/A"}</div>
                            <div className="font-medium">User ID:</div>
                            <div className="truncate">{userRateLimitData.user?.id || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium">Rate Limit Status</h3>
                        <div className="bg-muted p-3 rounded-md mt-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Daily Limit:</div>
                            <div>{userRateLimitData.rateLimit?.limit || "N/A"} images/day</div>
                            <div className="font-medium">Used Today:</div>
                            <div>{userRateLimitData.rateLimit?.used || 0} images</div>
                            <div className="font-medium">Remaining:</div>
                            <div>{userRateLimitData.rateLimit?.remaining || 0} images</div>
                            <div className="font-medium">Resets At:</div>
                            <div>
                              {userRateLimitData.rateLimit?.resetsAt
                                ? new Date(userRateLimitData.rateLimit.resetsAt).toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={resetUserRateLimit}
                        disabled={resetUserLoading}
                        className="w-full"
                      >
                        {resetUserLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset This User's Rate Limit
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {userRateLimitData && userRateLimitData.records && userRateLimitData.records.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Rate Limit Records
                  </CardTitle>
                  <CardDescription>
                    Detailed rate limit records for {userEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userRateLimitData.records.map((record, index) => (
                      <div key={index} className="bg-muted p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">Timestamp:</div>
                          <div>{new Date(record.timestamp).toLocaleString()}</div>
                          <div className="font-medium">IP Address:</div>
                          <div>{record.ip || "N/A"}</div>
                          <div className="font-medium">Endpoint:</div>
                          <div>{record.endpoint || "N/A"}</div>
                          <div className="font-medium">User Agent:</div>
                          <div className="truncate">{record.userAgent || "N/A"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}